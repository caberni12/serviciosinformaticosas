const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const money=n=>new Intl.NumberFormat("es-CL",{style:"currency",currency:"CLP",maximumFractionDigits:0}).format(Number(n||0));
let token=sessionStorage.getItem("asServiciosAdminToken")||"", data={products:[],categories:[],banners:[],orders:[],requests:[],virtualMessages:[],config:{}};
const adminThemeKey = "asServiciosAdminTheme";

function toast(msg){const t=$("#adminToast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1900)}
function showLogin(msg=""){ $("#loginScreen").classList.remove("hidden");$("#adminShell").classList.add("hidden");$("#apiWarning").textContent=msg }
function showAdmin(){ $("#loginScreen").classList.add("hidden");$("#adminShell").classList.remove("hidden") }
function applyAdminTheme(theme){
  document.body.classList.toggle("theme-light", theme === "light");
  localStorage.setItem(adminThemeKey, theme);
  $$("[data-admin-theme]").forEach(btn=>btn.classList.toggle("active", btn.dataset.adminTheme === theme));
}
function initAdminTheme(){ applyAdminTheme(localStorage.getItem(adminThemeKey) || "dark"); }

async function login(password){
  const r=await AleAPI.post("adminLogin",{password}); token=r.token;sessionStorage.setItem("asServiciosAdminToken",token);await reload();showAdmin();
}
async function reload(){
  const r=await AleAPI.post("adminBootstrap",{},token);
  data={products:[],categories:[],banners:[],orders:[],requests:[],virtualMessages:[],config:{}, ...r};
  data.virtualMessages = Array.isArray(data.virtualMessages) ? data.virtualMessages : [];
  renderAll();
}
$("#loginForm").addEventListener("submit",async e=>{e.preventDefault();if(!AleAPI.configured())return showLogin("Configura la URL del Web App en config.js.");try{await login($("#adminPassword").value)}catch(err){showLogin("Contraseña incorrecta o conexión no disponible.")}});
$("#logoutBtn").addEventListener("click",()=>{sessionStorage.removeItem("asServiciosAdminToken");token="";showLogin()});

function renderAll(){
  $("#adminLogo").src=data.config.logo_url||"logo-as-icon.png";
  $("#kpiProducts").textContent=data.products.length;
  $("#kpiOrders").textContent=data.orders.filter(x=>String(x.estado).toUpperCase()==="PENDIENTE").length;
  $("#kpiRequests").textContent=data.requests.filter(x=>String(x.estado).toUpperCase()==="NUEVA").length;
  $("#kpiStock").textContent=data.products.reduce((s,p)=>s+Number(p.stock||0),0);
  $("#dashboardSummary").innerHTML=`<div class="summary-row"><span>Productos destacados</span><strong>${data.products.filter(p=>String(p.destacado).toUpperCase()==="SI").length}</strong></div><div class="summary-row"><span>Categorías activas</span><strong>${data.categories.length}</strong></div><div class="summary-row"><span>Banners activos</span><strong>${data.banners.length}</strong></div><div class="summary-row"><span>Total pedidos</span><strong>${data.orders.length}</strong></div><div class="summary-row"><span>Mensajes AS Virtual</span><strong>${data.virtualMessages.length}</strong></div>`;
  fillCategorySelects();renderProducts();renderCategories();renderBanners();renderOrders();renderRequests();renderVirtual();renderSettings();
}
function fillCategorySelects(){
  const opts=data.categories.map(c=>`<option value="${esc(c.nombre)}">${esc(c.nombre)}</option>`).join("");
  $("#pCategory").innerHTML=opts;$("#productFilter").innerHTML='<option value="">Todas las categorías</option>'+opts;
}

function table(headers,rows){return `<table class="admin-table"><thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows||`<tr><td colspan="${headers.length}">Sin registros</td></tr>`}</tbody></table>`}
function imgTag(url){return url?`<img class="thumb" src="${esc(url)}" alt="">`:'<div class="thumb"></div>'}

function renderProducts(){
  const q=$("#productSearch").value.toLowerCase(), f=$("#productFilter").value;
  const list=data.products.filter(p=>(p.nombre+" "+p.descripcion).toLowerCase().includes(q)&&(!f||p.categoria_nombre===f));
  $("#productsTable").innerHTML=table(["Imagen","Producto","Categoría","Precio","Stock","Destacado","Acciones"],list.map(p=>`<tr><td>${imgTag(p.image_url)}</td><td><strong>${esc(p.nombre)}</strong><br><small>${esc(p.descripcion||"")}</small></td><td>${esc(p.categoria_nombre||"")}</td><td>${money(p.precio)}</td><td>${Number(p.stock||0)}</td><td>${String(p.destacado).toUpperCase()==="SI"?"Sí":"No"}</td><td><div class="row-actions"><button onclick="editProduct('${p.id}')">Editar</button><button class="danger" onclick="removeEntity('product','${p.id}')">Eliminar</button></div></td></tr>`).join(""));
}
$("#productSearch").addEventListener("input",renderProducts);$("#productFilter").addEventListener("change",renderProducts);
$("#newProduct").addEventListener("click",()=>{clearProduct();$("#productEditor").classList.remove("hidden")});
function clearProduct(){["pId","pImageId","pImageUrl","pName","pPrice","pStock","pOccasion","pDescription"].forEach(id=>$("#"+id).value="");$("#pFeatured").checked=false;$("#pImage").value=""}
window.editProduct=id=>{const p=data.products.find(x=>x.id===id);if(!p)return;$("#pId").value=p.id;$("#pImageId").value=p.drive_file_id||"";$("#pImageUrl").value=p.image_url||"";$("#pName").value=p.nombre||"";$("#pPrice").value=p.precio||"";$("#pCategory").value=p.categoria_nombre||"";$("#pStock").value=p.stock||0;$("#pOccasion").value=p.ocasion||"";$("#pDescription").value=p.descripcion||"";$("#pFeatured").checked=String(p.destacado).toUpperCase()==="SI";$("#productEditor").classList.remove("hidden")}
$("#saveProduct").addEventListener("click",async()=>{try{let imageId=$("#pImageId").value;let imageUrl=$("#pImageUrl").value;const file=$("#pImage").files[0];if(file){const uploaded=await upload(file,"PRODUCTOS");imageId=uploaded.fileId;imageUrl=uploaded.imageUrl||imageUrl;}const payload={id:$("#pId").value,nombre:$("#pName").value.trim(),descripcion:$("#pDescription").value.trim(),precio:Number($("#pPrice").value||0),categoria_nombre:$("#pCategory").value,stock:Number($("#pStock").value||0),drive_file_id:imageId,image_url:imageUrl,destacado:$("#pFeatured").checked?"SI":"NO",activo:"SI",ocasion:$("#pOccasion").value.trim()};await AleAPI.post("saveProduct",payload,token);toast("Producto guardado");$("#productEditor").classList.add("hidden");await reload()}catch(e){toast("No fue posible guardar")}});

function renderCategories(){
  $("#categoriesTable").innerHTML=table(["Imagen","Categoría","Descripción","Orden","Acciones"],data.categories.map(c=>`<tr><td>${imgTag(c.image_url)}</td><td><strong>${esc(c.nombre)}</strong></td><td>${esc(c.descripcion||"")}</td><td>${Number(c.orden||0)}</td><td><div class="row-actions"><button onclick="editCategory('${c.id}')">Editar</button><button class="danger" onclick="removeEntity('category','${c.id}')">Eliminar</button></div></td></tr>`).join(""));
}
$("#newCategory").addEventListener("click",()=>{clearCategory();$("#categoryEditor").classList.remove("hidden")});function clearCategory(){["cId","cImageId","cImageUrl","cName","cOrder","cDescription"].forEach(id=>$("#"+id).value="");$("#cImage").value=""}
window.editCategory=id=>{const c=data.categories.find(x=>x.id===id);$("#cId").value=c.id;$("#cImageId").value=c.drive_file_id||"";$("#cImageUrl").value=c.image_url||"";$("#cName").value=c.nombre||"";$("#cOrder").value=c.orden||0;$("#cDescription").value=c.descripcion||"";$("#categoryEditor").classList.remove("hidden")}
$("#saveCategory").addEventListener("click",async()=>{try{let imageId=$("#cImageId").value;let imageUrl=$("#cImageUrl").value;const file=$("#cImage").files[0];if(file){const uploaded=await upload(file,"CATEGORIAS");imageId=uploaded.fileId;imageUrl=uploaded.imageUrl||imageUrl;}await AleAPI.post("saveCategory",{id:$("#cId").value,nombre:$("#cName").value.trim(),descripcion:$("#cDescription").value.trim(),drive_file_id:imageId,image_url:imageUrl,orden:Number($("#cOrder").value||0),activo:"SI"},token);toast("Categoría guardada");$("#categoryEditor").classList.add("hidden");await reload()}catch(e){toast("No fue posible guardar")}});

function renderBanners(){
  $("#bannersTable").innerHTML=table(["Imagen","Título","Botón","Orden","Acciones"],data.banners.map(b=>`<tr><td>${imgTag(b.image_url)}</td><td><strong>${esc(b.titulo)}</strong><br><small>${esc(b.subtitulo||"")}</small></td><td>${esc(b.cta_texto||"")}</td><td>${Number(b.orden||0)}</td><td><div class="row-actions"><button onclick="editBanner('${b.id}')">Editar</button><button class="danger" onclick="removeEntity('banner','${b.id}')">Eliminar</button></div></td></tr>`).join(""));
}
$("#newBanner").addEventListener("click",()=>{clearBanner();$("#bannerEditor").classList.remove("hidden")});function clearBanner(){["bId","bImageId","bImageUrl","bTitle","bSubtitle","bCta","bLink","bOrder"].forEach(id=>$("#"+id).value="");$("#bImage").value=""}
window.editBanner=id=>{const b=data.banners.find(x=>x.id===id);$("#bId").value=b.id;$("#bImageId").value=b.drive_file_id||"";$("#bImageUrl").value=b.image_url||"";$("#bTitle").value=b.titulo||"";$("#bSubtitle").value=b.subtitulo||"";$("#bCta").value=b.cta_texto||"";$("#bLink").value=b.enlace||"";$("#bOrder").value=b.orden||0;$("#bannerEditor").classList.remove("hidden")}
$("#saveBanner").addEventListener("click",async()=>{try{let imageId=$("#bImageId").value;let imageUrl=$("#bImageUrl").value;const file=$("#bImage").files[0];if(file){const uploaded=await upload(file,"BANNERS");imageId=uploaded.fileId;imageUrl=uploaded.imageUrl||imageUrl;}await AleAPI.post("saveBanner",{id:$("#bId").value,titulo:$("#bTitle").value.trim(),subtitulo:$("#bSubtitle").value.trim(),cta_texto:$("#bCta").value.trim(),enlace:$("#bLink").value.trim(),drive_file_id:imageId,image_url:imageUrl,activo:"SI",orden:Number($("#bOrder").value||0)},token);toast("Banner guardado");$("#bannerEditor").classList.add("hidden");await reload()}catch(e){toast("No fue posible guardar")}});

function renderOrders(){
  $("#ordersTable").innerHTML=table(["Fecha","Cliente","Contacto","Entrega","Total","Estado"],data.orders.map(o=>`<tr><td>${esc(formatDate(o.fecha))}</td><td><strong>${esc(o.nombre)}</strong><br><small>${esc(o.id)}</small></td><td>${esc(o.telefono)}<br><small>${esc(o.email||"")}</small></td><td>${esc(o.metodo_entrega||"")}<br><small>${esc(o.direccion||"")}</small></td><td>${money(o.total)}</td><td><select class="status-select" onchange="changeStatus('order','${o.id}',this.value)">${["PENDIENTE","CONFIRMADO","EN PREPARACION","LISTO","ENTREGADO","CANCELADO"].map(s=>`<option ${String(o.estado).toUpperCase()===s?"selected":""}>${s}</option>`).join("")}</select></td></tr>`).join(""));
}
function renderRequests(){
  $("#requestsTable").innerHTML=table(["Fecha","Cliente","Tipo","Evento","Detalle","Estado"],data.requests.map(r=>`<tr><td>${esc(formatDate(r.fecha))}</td><td><strong>${esc(r.nombre)}</strong><br><small>${esc(r.telefono)}</small></td><td>${esc(r.tipo||"")}</td><td>${esc(r.fecha_evento||"")}</td><td>${esc(r.detalle||"")}</td><td><select class="status-select" onchange="changeStatus('request','${r.id}',this.value)">${["NUEVA","CONTACTADA","COTIZADA","ACEPTADA","CERRADA"].map(s=>`<option ${String(r.estado).toUpperCase()===s?"selected":""}>${s}</option>`).join("")}</select></td></tr>`).join(""));
}
window.changeStatus=async(kind,id,status)=>{try{await AleAPI.post("updateStatus",{kind,id,status},token);toast("Estado actualizado");await reload()}catch(e){toast("No fue posible actualizar")}};

function renderVirtual(){
  const term=($("#virtualSearch")?.value || "").trim().toLowerCase();
  const filter=$("#virtualFilter")?.value || "";
  const rows = data.virtualMessages.filter(r=>{
    const hay = `${r.nombre||""} ${r.contacto||""} ${r.mensaje||""} ${r.resumen||""}`.toLowerCase();
    const okText = !term || hay.includes(term);
    const okStatus = !filter || String(r.estado||"NUEVO").toUpperCase() === filter;
    return okText && okStatus;
  });
  const counts = {
    total: data.virtualMessages.length,
    nuevo: data.virtualMessages.filter(x=>String(x.estado||"NUEVO").toUpperCase()==='NUEVO').length,
    proceso: data.virtualMessages.filter(x=>String(x.estado||"").toUpperCase()==='EN_PROCESO').length,
    contactado: data.virtualMessages.filter(x=>String(x.estado||"").toUpperCase()==='CONTACTADO').length,
    cerrado: data.virtualMessages.filter(x=>String(x.estado||"").toUpperCase()==='CERRADO').length
  };
  $("#virtualKpis").innerHTML = `
    <article><span>Total</span><strong>${counts.total}</strong></article>
    <article><span>Nuevos</span><strong>${counts.nuevo}</strong></article>
    <article><span>En proceso</span><strong>${counts.proceso}</strong></article>
    <article><span>Contactados</span><strong>${counts.contactado}</strong></article>
    <article><span>Cerrados</span><strong>${counts.cerrado}</strong></article>`;
  if(!rows.length){
    $("#virtualTable").innerHTML = '<div class="empty-admin-state"><i class="bi bi-robot"></i><strong>Sin mensajes</strong><span>No hay registros que coincidan con el filtro actual.</span></div>';
    return;
  }
  $("#virtualTable").innerHTML = `<div class="virtual-card-list">${rows.map(r=>{
    const status = String(r.estado || 'NUEVO').toUpperCase();
    return `<article class="virtual-admin-card">
      <div class="virtual-admin-top">
        <div>
          <small>${esc(formatDate(r.fecha))}</small>
          <h3>${esc(r.nombre || 'Sin nombre')}</h3>
          <p>${esc(r.contacto || 'Sin contacto')}</p>
        </div>
        <span class="status-pill status-${status.toLowerCase().replace(/[^a-z_]/g,'-')}">${esc(status.replace('_',' '))}</span>
      </div>
      <div class="virtual-admin-meta"><span><i class="bi bi-broadcast-pin"></i> ${esc(r.canal || 'WEB')}</span><span><i class="bi bi-chat-dots"></i> ${esc(r.origen || 'AS Virtual')}</span><span><i class="bi bi-hash"></i> ${esc(r.id || '')}</span></div>
      <div class="virtual-admin-message">${esc(r.mensaje || r.resumen || '').replace(/\n/g,'<br>')}</div>
      <div class="virtual-admin-actions">
        <select class="status-select" onchange="changeStatus('virtual','${r.id}',this.value)">${['NUEVO','EN_PROCESO','CONTACTADO','CERRADO'].map(s=>`<option ${status===s?'selected':''}>${s}</option>`).join('')}</select>
        <button onclick="contactVirtual('${String(r.nombre||'').replace(/'/g,"&#039;")}','${String(r.contacto||'').replace(/'/g,"&#039;")}')"><i class="bi bi-whatsapp"></i> Contactar</button>
      </div>
    </article>`;
  }).join('')}</div>`;
}

function renderSettings(){const c=data.config||{};$("#sLogoId").value=c.logo_drive_file_id||"";$("#sBusiness").value=c.empresa||"";$("#sWhatsapp").value=c.whatsapp||"";$("#sEmail").value=c.email||"";$("#sAddress").value=c.direccion||"";$("#sAssistantName").value=c.assistant_name||"AS Virtual";$("#sDefaultTheme").value=(c.default_theme||"dark").toLowerCase()==="light"?"light":"dark";$("#sInstagram").value=c.instagram||"";$("#sFacebook").value=c.facebook||"";$("#sTiktok").value=c.tiktok||"";$("#sDelivery").value=c.valor_despacho||0}
$("#saveSettings").addEventListener("click",async()=>{try{let logoId=$("#sLogoId").value;const f=$("#sLogo").files[0];if(f)logoId=(await upload(f,"LOGO")).fileId;await AleAPI.post("saveConfig",{empresa:$("#sBusiness").value.trim(),whatsapp:$("#sWhatsapp").value.trim(),email:$("#sEmail").value.trim(),direccion:$("#sAddress").value.trim(),assistant_name:$("#sAssistantName").value.trim() || "AS Virtual",default_theme:$("#sDefaultTheme").value || "dark",instagram:$("#sInstagram").value.trim(),facebook:$("#sFacebook").value.trim(),tiktok:$("#sTiktok").value.trim(),valor_despacho:$("#sDelivery").value,logo_drive_file_id:logoId},token);toast("Configuración guardada");await reload()}catch(e){toast("No fue posible guardar")}});

async function upload(file,kind){if(file.size>6*1024*1024)throw new Error("IMAGEN_MUY_GRANDE");const dataUrl=await AleAPI.fileToDataUrl(file);return AleAPI.post("uploadImage",{kind,fileName:file.name,dataUrl},token)}
window.removeEntity=async(kind,id)=>{if(!confirm("¿Eliminar este registro?"))return;try{await AleAPI.post("deleteEntity",{kind,id},token);toast("Registro eliminado");await reload()}catch(e){toast("No fue posible eliminar")}};

window.contactVirtual=(name,contact)=>{
  const msg=`Hola ${name || ''}, te contactamos desde SERVICIOS INFORMÁTICOS AS por tu solicitud enviada mediante AS Virtual.`.trim();
  const only=String(contact||'').replace(/\D/g,'');
  if(only.length >= 8) window.open(`https://wa.me/${only}?text=${encodeURIComponent(msg)}`,'_blank');
  else alert(`Contacto registrado: ${contact || 'Sin contacto'}`);
};
$("#virtualSearch")?.addEventListener("input",renderVirtual);
$("#virtualFilter")?.addEventListener("change",renderVirtual);
$$("[data-cancel]").forEach(b=>b.addEventListener("click",()=>$("#"+b.dataset.cancel).classList.add("hidden")));
$$(".admin-nav button").forEach(btn=>btn.addEventListener("click",()=>{$$(".admin-nav button").forEach(x=>x.classList.remove("active"));btn.classList.add("active");$$(".admin-view").forEach(x=>x.classList.remove("active"));$("#view-"+btn.dataset.view).classList.add("active");$("#viewTitle").textContent=btn.textContent.trim()}));
$$("[data-admin-theme]").forEach(btn=>btn.addEventListener("click",()=>applyAdminTheme(btn.dataset.adminTheme)));
function formatDate(v){if(!v)return"";const d=new Date(v);return isNaN(d)?String(v):d.toLocaleString("es-CL")}
(async()=>{initAdminTheme();if(!AleAPI.configured())return showLogin("Configura la URL del Web App en config.js.");if(token){try{await reload();showAdmin();return}catch(e){sessionStorage.removeItem("asServiciosAdminToken");token=""}}showLogin()})();
