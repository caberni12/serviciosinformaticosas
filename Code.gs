/**
 * SERVICIOS INFORMATICOS AS - API GOOGLE APPS SCRIPT
 * Publica este proyecto como Web App:
 * Ejecutar como: Yo
 * Acceso: Cualquier usuario
 */

function doGet(e) {
  try {
    const action = String((e && e.parameter && e.parameter.action) || "").toLowerCase();
    if (action === "bootstrap") return json_({ok:true, ...publicBootstrap_()});
    if (action === "ping") return json_({ok:true, service:"SERVICIOS_INFORMATICOS_AS", time:new Date()});
    return json_({ok:false,error:"ACCION_NO_VALIDA"});
  } catch (err) {
    return json_({ok:false,error:String(err.message || err)});
  }
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const action = String(body.action || "").toLowerCase();
    const data = body.data || {};
    const token = String(body.token || "");

    if (action === "createorder") return json_({ok:true,id:createOrder_(data)});
    if (action === "createrequest") return json_({ok:true,id:createRequest_(data)});
    if (action === "createvirtualmessage") return json_({ok:true,id:createVirtualMessage_(data)});
    if (action === "adminlogin") return json_(adminLogin_(data.password || ""));

    requireAdmin_(token);

    if (action === "adminbootstrap") return json_({ok:true, ...adminBootstrap_()});
    if (action === "saveproduct") return json_({ok:true,id:saveProduct_(data)});
    if (action === "savecategory") return json_({ok:true,id:saveCategory_(data)});
    if (action === "savebanner") return json_({ok:true,id:saveBanner_(data)});
    if (action === "saveconfig") return json_({ok:true,config:saveConfig_(data)});
    if (action === "uploadimage") return json_({ok:true,...uploadImage_(data)});
    if (action === "deleteentity") return json_({ok:true,...deleteEntity_(data)});
    if (action === "updatestatus") return json_({ok:true,...updateStatus_(data)});

    return json_({ok:false,error:"ACCION_NO_VALIDA"});
  } catch (err) {
    return json_({ok:false,error:String(err.message || err)});
  }
}

function db_() {
  const id = PropertiesService.getScriptProperties().getProperty("SHEET_ID");
  if (!id) throw new Error("SHEET_ID_NO_CONFIGURADO");
  return SpreadsheetApp.openById(id);
}

function publicBootstrap_() {
  const products = activeRows_("PRODUCTOS").map(enrichImage_);
  const categories = activeRows_("CATEGORIAS").map(enrichImage_);
  const banners = activeRows_("BANNERS").map(enrichImage_);
  const config = getConfig_();
  config.logo_url = config.logo_url || imageUrl_(config.logo_drive_file_id);
  return {products, categories, banners, config};
}

function adminBootstrap_() {
  const p = publicBootstrap_();
  return {
    ...p,
    orders: sheetObjects_("PEDIDOS").reverse().slice(0,500),
    requests: sheetObjects_("SOLICITUDES").reverse().slice(0,500),
    virtualMessages: sheetObjects_("AS_VIRTUAL").reverse().slice(0,500)
  };
}

function activeRows_(sheetName) {
  return sheetObjects_(sheetName).filter(r => String(r.activo || "SI").toUpperCase() !== "NO");
}

function sheetObjects_(sheetName) {
  const sh = db_().getSheetByName(sheetName);
  if (!sh) return [];
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(String);
  return values.slice(1).filter(r => r.some(v => v !== "")).map(row => {
    const o = {};
    headers.forEach((h,i) => o[h] = row[i] instanceof Date ? row[i].toISOString() : row[i]);
    return o;
  });
}

function getConfig_() {
  const rows = sheetObjects_("CONFIG");
  const out = {};
  rows.forEach(r => out[String(r.clave)] = r.valor);
  return out;
}

function imageUrl_(fileId) {
  if (!fileId) return "";
  return "https://drive.google.com/thumbnail?id=" + encodeURIComponent(String(fileId)) + "&sz=w1800";
}

function enrichImage_(r) {
  r.image_url = r.image_url || imageUrl_(r.drive_file_id) || "";
  return r;
}

function createOrder_(d) {
  const id = "PED-" + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd-HHmmss");
  db_().getSheetByName("PEDIDOS").appendRow([
    id,new Date(),d.nombre||"",d.telefono||"",d.email||"",d.direccion||"",d.comuna||"",
    d.metodo_entrega||"",JSON.stringify(d.detalle||[]),Number(d.subtotal||0),Number(d.despacho||0),
    Number(d.total||0),"PENDIENTE",d.observaciones||""
  ]);
  audit_("CREAR","PEDIDO",id,d.nombre||"");
  return id;
}

function createRequest_(d) {
  const id = "SOL-" + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd-HHmmss");
  db_().getSheetByName("SOLICITUDES").appendRow([
    id,new Date(),d.nombre||"",d.telefono||"",d.email||"",d.fecha_evento||"",
    d.tipo||"",d.cantidad||"",d.detalle||"","NUEVA"
  ]);
  audit_("CREAR","SOLICITUD",id,d.nombre||"");
  return id;
}


function createVirtualMessage_(d) {
  const id = "VRT-" + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd-HHmmss");
  const message = String(d.mensaje || "");
  const resume = message.slice(0, 220);
  const sh = db_().getSheetByName("AS_VIRTUAL");
  if (!sh) throw new Error("SHEET_AS_VIRTUAL_NO_EXISTE");
  sh.appendRow([id,new Date(),d.nombre||"",d.contacto||"",message,d.canal||"WEB",d.origen||"AS Virtual","NUEVO",resume]);
  audit_("CREAR","AS_VIRTUAL",id,d.nombre||"");
  return id;
}

function saveProduct_(d) {
  const id = d.id || ("PROD-" + Utilities.getUuid().slice(0,8).toUpperCase());
  upsertById_("PRODUCTOS", id, {
    id:id,nombre:d.nombre||"",descripcion:d.descripcion||"",precio:Number(d.precio||0),
    categoria_nombre:d.categoria_nombre||"",stock:Number(d.stock||0),drive_file_id:d.drive_file_id||"",image_url:d.image_url||"",
    destacado:d.destacado||"NO",activo:d.activo||"SI",ocasion:d.ocasion||"",orden:Number(d.orden||0),
    fecha_actualizacion:new Date()
  });
  audit_("GUARDAR","PRODUCTO",id,d.nombre||"");
  return id;
}

function saveCategory_(d) {
  const id = d.id || ("CAT-" + Utilities.getUuid().slice(0,8).toUpperCase());
  upsertById_("CATEGORIAS", id, {
    id:id,nombre:d.nombre||"",descripcion:d.descripcion||"",drive_file_id:d.drive_file_id||"",image_url:d.image_url||"",
    orden:Number(d.orden||0),activo:d.activo||"SI"
  });
  audit_("GUARDAR","CATEGORIA",id,d.nombre||"");
  return id;
}

function saveBanner_(d) {
  const id = d.id || ("BAN-" + Utilities.getUuid().slice(0,8).toUpperCase());
  upsertById_("BANNERS", id, {
    id:id,titulo:d.titulo||"",subtitulo:d.subtitulo||"",cta_texto:d.cta_texto||"",
    enlace:d.enlace||"#solicitud",drive_file_id:d.drive_file_id||"",image_url:d.image_url||"",activo:d.activo||"SI",orden:Number(d.orden||0)
  });
  audit_("GUARDAR","BANNER",id,d.titulo||"");
  return id;
}

function saveConfig_(d) {
  Object.keys(d).forEach(k => upsertConfig_(k,d[k]));
  audit_("GUARDAR","CONFIG","CONFIG","Configuración");
  return getConfig_();
}

function uploadImage_(d) {
  const kind = String(d.kind || "PRODUCTOS").toUpperCase();
  const folderId = PropertiesService.getScriptProperties().getProperty("FOLDER_" + kind);
  if (!folderId) throw new Error("CARPETA_NO_CONFIGURADA_" + kind);
  const m = String(d.dataUrl||"").match(/^data:([^;]+);base64,(.+)$/);
  if (!m) throw new Error("IMAGEN_INVALIDA");
  const bytes = Utilities.base64Decode(m[2]);
  if (bytes.length > 6 * 1024 * 1024) throw new Error("IMAGEN_SUPERA_6MB");
  const blob = Utilities.newBlob(bytes,m[1],sanitizeFileName_(d.fileName||("imagen-"+Date.now())));
  const file = DriveApp.getFolderById(folderId).createFile(blob);
  try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (_) {}
  audit_("SUBIR","IMAGEN",file.getId(),kind);
  return {fileId:file.getId(), imageUrl:imageUrl_(file.getId()), name:file.getName()};
}

function deleteEntity_(d) {
  const map = {product:"PRODUCTOS",category:"CATEGORIAS",banner:"BANNERS"};
  const sheet = map[String(d.kind||"").toLowerCase()];
  if (!sheet) throw new Error("TIPO_NO_VALIDO");
  const ok = setFieldById_(sheet,d.id,"activo","NO");
  audit_("ELIMINAR",sheet,d.id,"Baja lógica");
  return {deleted:ok};
}

function updateStatus_(d) {
  const map = {order:["PEDIDOS","estado"],request:["SOLICITUDES","estado"],virtual:["AS_VIRTUAL","estado"]};
  const cfg = map[String(d.kind||"").toLowerCase()];
  if (!cfg) throw new Error("TIPO_NO_VALIDO");
  const ok = setFieldById_(cfg[0],d.id,cfg[1],d.status||"");
  audit_("ESTADO",cfg[0],d.id,d.status||"");
  return {updated:ok};
}

function upsertById_(sheetName,id,obj) {
  const sh=db_().getSheetByName(sheetName), values=sh.getDataRange().getValues(), headers=values[0].map(String);
  let row=-1;
  for(let i=1;i<values.length;i++){ if(String(values[i][0])===String(id)){row=i+1;break;} }
  const arr=headers.map(h => obj[h] !== undefined ? obj[h] : "");
  if(row<0) sh.appendRow(arr); else sh.getRange(row,1,1,headers.length).setValues([arr]);
}

function upsertConfig_(key,value) {
  const sh=db_().getSheetByName("CONFIG"), values=sh.getDataRange().getValues();
  for(let i=1;i<values.length;i++){ if(String(values[i][0])===String(key)){sh.getRange(i+1,2).setValue(value);return;} }
  sh.appendRow([key,value]);
}

function setFieldById_(sheetName,id,field,value) {
  const sh=db_().getSheetByName(sheetName), values=sh.getDataRange().getValues(), headers=values[0].map(String);
  const col=headers.indexOf(field); if(col<0)throw new Error("CAMPO_NO_EXISTE");
  for(let i=1;i<values.length;i++){if(String(values[i][0])===String(id)){sh.getRange(i+1,col+1).setValue(value);return true;}}
  return false;
}

function adminLogin_(password) {
  const props=PropertiesService.getScriptProperties();
  const salt=props.getProperty("ADMIN_SALT"), expected=props.getProperty("ADMIN_HASH");
  if(!salt||!expected)throw new Error("ADMIN_NO_CONFIGURADO");
  if(hash_(salt+String(password))!==expected)return {ok:false,error:"CREDENCIALES_INVALIDAS"};
  return {ok:true,token:makeToken_()};
}

function makeToken_() {
  const props=PropertiesService.getScriptProperties(), secret=props.getProperty("TOKEN_SECRET");
  const payload=Utilities.base64EncodeWebSafe(JSON.stringify({exp:Date.now()+8*60*60*1000,nonce:Utilities.getUuid()}));
  const sig=Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(payload,secret));
  return payload+"."+sig;
}

function requireAdmin_(token) {
  const parts=String(token||"").split("."); if(parts.length!==2)throw new Error("SESION_INVALIDA");
  const secret=PropertiesService.getScriptProperties().getProperty("TOKEN_SECRET");
  const expected=Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(parts[0],secret));
  if(expected!==parts[1])throw new Error("SESION_INVALIDA");
  const payload=JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString());
  if(Number(payload.exp)<Date.now())throw new Error("SESION_EXPIRADA");
}

function hash_(text) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(text))
    .map(b => ("0"+((b<0?b+256:b).toString(16))).slice(-2)).join("");
}

function audit_(action,entity,id,detail) {
  try { db_().getSheetByName("AUDITORIA").appendRow([new Date(),action,entity,id,detail]); } catch (_) {}
}
function sanitizeFileName_(s){return String(s).replace(/[^\w.\- áéíóúÁÉÍÓÚñÑ]/g,"_").slice(0,120)}
function json_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON)}
