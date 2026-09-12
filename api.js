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
  window.AleAPI = {
    configured,
    async get(action, params = {}) {
      if (!configured()) throw new Error("API_NO_CONFIGURADA");
      const url = new URL(cfg().API_URL);
      url.searchParams.set("action", action);
      Object.entries(params).forEach(([k,v]) => v !== undefined && v !== null && url.searchParams.set(k, v));
      return request(url.toString());
    },
    async post(action, data = {}, token = "") {
      if (!configured()) throw new Error("API_NO_CONFIGURADA");
      return request(cfg().API_URL, {
        method: "POST",
        headers: {"Content-Type":"text/plain;charset=utf-8"},
        body: JSON.stringify({action, data, token})
      });
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
