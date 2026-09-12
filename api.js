(() => {
  const cfg = () => window.AS_SERVICIOS_CONFIG || {};
  const configured = () => {
    const u = String(cfg().API_URL || "");
    return /^https:\/\/script\.google\.com\/macros\/s\//.test(u) && /\/exec(?:$|\?)/.test(u);
  };

  async function request(url, options = {}) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), Number(cfg().REQUEST_TIMEOUT_MS || 18000));
    try {
      const res = await fetch(url, {...options, signal: ctrl.signal, redirect: "follow", cache: "no-store"});
      if (!res.ok) throw new Error(`HTTP_${res.status}`);
      const json = await res.json();
      if (json && json.ok === false) throw new Error(json.error || "API_ERROR");
      return json;
    } finally { clearTimeout(timer); }
  }

  // Lecturas públicas por JSONP. Google Apps Script no entrega CORS de forma consistente
  // cuando la web está publicada en GitHub Pages.
  function jsonp(action, data = {}) {
    if (!configured()) return Promise.reject(new Error("API_NO_CONFIGURADA"));
    return new Promise((resolve, reject) => {
      const cb = `__as_cb_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement("script");
      const timer = setTimeout(() => cleanup(new Error("API_TIMEOUT")), Number(cfg().REQUEST_TIMEOUT_MS || 18000));
      const cleanup = (err, value) => {
        clearTimeout(timer);
        try { delete window[cb]; } catch (_) { window[cb] = undefined; }
        script.remove();
        if (err) reject(err); else resolve(value);
      };
      window[cb] = payload => {
        if (payload && payload.ok === false) cleanup(new Error(payload.error || "API_ERROR"));
        else cleanup(null, payload);
      };
      script.onerror = () => cleanup(new Error("API_SCRIPT_LOAD_ERROR"));
      const url = new URL(cfg().API_URL);
      url.searchParams.set("action", action);
      url.searchParams.set("callback", cb);
      url.searchParams.set("payload", JSON.stringify(data || {}));
      url.searchParams.set("_", String(Date.now()));
      script.src = url.toString();
      document.head.appendChild(script);
    });
  }

  // Escrituras por FORM + IFRAME oculto con confirmación robusta.
  // Si postMessage no llega por las redirecciones de Apps Script, el cliente
  // consulta el estado del request mediante JSONP hasta obtener el resultado.
  function iframePost(action, data = {}) {
    if (!configured()) return Promise.reject(new Error("API_NO_CONFIGURADA"));
    return new Promise((resolve, reject) => {
      const requestId = `ASREQ_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const iframeName = `as_api_frame_${requestId.replace(/[^a-z0-9_]/gi, "")}`;
      const iframe = document.createElement("iframe");
      iframe.name = iframeName;
      iframe.style.cssText = "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;border:0;left:-9999px;top:-9999px";
      iframe.setAttribute("aria-hidden", "true");

      const form = document.createElement("form");
      form.method = "POST";
      form.action = cfg().API_URL;
      form.target = iframeName;
      form.style.display = "none";
      form.acceptCharset = "UTF-8";

      const add = (name, value) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
      };
      add("transport", "iframe");
      add("request_id", requestId);
      add("envelope", JSON.stringify({action, data, requestId}));

      let finished = false;
      let pollTimer = null;
      const maxMs = Math.max(20000, Number(cfg().REQUEST_TIMEOUT_MS || 18000) + 12000);
      const started = Date.now();

      const finish = (err, value) => {
        if (finished) return;
        finished = true;
        clearInterval(pollTimer);
        clearTimeout(hardTimer);
        window.removeEventListener("message", onMessage);
        setTimeout(() => { iframe.remove(); form.remove(); }, 80);
        if (err) reject(err); else resolve(value);
      };

      const handleResult = payload => {
        if (payload && payload.ok === false) finish(new Error(payload.error || "API_ERROR"));
        else finish(null, payload || {ok:true});
      };

      const onMessage = event => {
        const msg = event && event.data;
        if (!msg || msg.source !== "SERVICIOS_INFORMATICOS_AS_API" || msg.requestId !== requestId) return;
        handleResult(msg.payload);
      };

      const poll = async () => {
        if (finished) return;
        try {
          const st = await jsonp("requestStatus", {request_id:requestId});
          if (st && st.pending === false) handleResult(st.result || {ok:true});
        } catch (_) {
          // El polling es respaldo: ignoramos errores transitorios y seguimos intentando.
        }
        if (!finished && Date.now() - started > maxMs) finish(new Error("API_CONFIRMATION_TIMEOUT"));
      };

      const hardTimer = setTimeout(() => finish(new Error("API_CONFIRMATION_TIMEOUT")), maxMs + 1500);
      window.addEventListener("message", onMessage);
      document.body.appendChild(iframe);
      document.body.appendChild(form);
      form.submit();
      setTimeout(poll, 700);
      pollTimer = setInterval(poll, 1100);
    });
  }

  window.AleAPI = {
    configured,
    async get(action, params = {}) {
      return jsonp(action, params);
    },
    async post(action, data = {}, token = "") {
      const payload = token ? {...(data || {}), __token: token} : (data || {});
      return iframePost(action, payload);
    },
    async submitPublic(action, data = {}) {
      // Las solicitudes públicas usan JSONP/GET para evitar el timeout del iframe
      // cuando la web está alojada en GitHub Pages y Apps Script redirige /exec.
      if (String(action || "").toLowerCase() === "createrequest") {
        return jsonp(action, data);
      }
      return iframePost(action, data);
    },
    async health() {
      return jsonp("health", {});
    },
    fileToDataUrl(file) {
      return new Promise((resolve,reject)=>{
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = reject;
        r.readAsDataURL(file);
      });
    }
  };
})();
