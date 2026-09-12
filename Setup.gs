/**
 * INSTALADOR - SERVICIOS INFORMATICOS AS
 * Ejecuta instalarServiciosAS() una sola vez.
 * Crea Google Sheets, carpetas Drive y credenciales de administración.
 * El catálogo nace VACÍO para que lo cargues después desde CPANEL.
 */
function instalarServiciosAS() {
  const ss = SpreadsheetApp.create("SERVICIOS_INFORMATICOS_AS_BD");
  const root = DriveApp.createFolder("SERVICIOS_INFORMATICOS_AS_WEB");
  const folders = {};
  ["LOGO","BANNERS","PRODUCTOS","CATEGORIAS","PEDIDOS"].forEach(n => folders[n] = root.createFolder(n));

  const defs = {
    PRODUCTOS:["id","nombre","descripcion","precio","categoria_nombre","stock","drive_file_id","image_url","destacado","activo","ocasion","orden","fecha_actualizacion"],
    CATEGORIAS:["id","nombre","descripcion","drive_file_id","image_url","orden","activo"],
    BANNERS:["id","titulo","subtitulo","cta_texto","enlace","drive_file_id","image_url","activo","orden"],
    PEDIDOS:["id","fecha","nombre","telefono","email","direccion","comuna","metodo_entrega","detalle_json","subtotal","despacho","total","estado","observaciones"],
    SOLICITUDES:["id","fecha","nombre","telefono","email","fecha_evento","tipo","cantidad","detalle","estado"],
    AS_VIRTUAL:["id","fecha","nombre","contacto","mensaje","canal","origen","estado","resumen"],
    CONFIG:["clave","valor"],
    AUDITORIA:["fecha","accion","entidad","id","detalle"]
  };

  const first = ss.getSheets()[0];
  let idx = 0;
  Object.keys(defs).forEach(name => {
    const sh = idx++ === 0 ? first : ss.insertSheet();
    sh.setName(name); sh.clear();
    sh.getRange(1,1,1,defs[name].length).setValues([defs[name]])
      .setFontWeight("bold").setBackground("#071423").setFontColor("#19e6ff");
    sh.setFrozenRows(1);
    sh.autoResizeColumns(1,defs[name].length);
  });

  // Carrusel corporativo inicial. No crea productos ni categorías.
  ss.getSheetByName("BANNERS").getRange(2,1,3,9).setValues([
    ["B001","Creamos tecnología que trabaja para tu negocio","Páginas web modernas, sistemas de gestión, aplicaciones Android y Web, PostgreSQL e integraciones hechas a tu medida.","Cotizar proyecto","#solicitud","","","SI",1],
    ["B002","Sistemas de gestión pensados para crecer contigo","Digitalizamos procesos, conectamos datos y construimos herramientas que simplifican la operación diaria de tu empresa.","Ver servicios","#servicios","","","SI",2],
    ["B003","Android + Web + datos en una sola solución","Arquitecturas modernas con APIs, PostgreSQL, automatización, paneles de control y experiencias responsive.","Conversemos","#solicitud","","","SI",3]
  ]);

  ss.getSheetByName("CONFIG").getRange(2,1,12,2).setValues([
    ["empresa","SERVICIOS INFORMÁTICOS AS"],
    ["whatsapp","+56 9 6861 3559"],
    ["instagram",""],
    ["facebook",""],
    ["tiktok",""],
    ["email",""],
    ["direccion","Santiago, Chile"],
    ["valor_despacho","0"],
    ["logo_drive_file_id",""],
    ["moneda","CLP"],
    ["assistant_name","AS Virtual"],
    ["default_theme","dark"]
  ]);

  const adminPassword = "AS-" + Utilities.getUuid().replace(/-/g,"").slice(0,12);
  const salt = Utilities.getUuid();
  const secret = Utilities.getUuid()+Utilities.getUuid();
  const props = PropertiesService.getScriptProperties();
  props.setProperties({
    SHEET_ID:ss.getId(),
    DRIVE_FOLDER_ID:root.getId(),
    FOLDER_LOGO:folders.LOGO.getId(),
    FOLDER_BANNERS:folders.BANNERS.getId(),
    FOLDER_PRODUCTOS:folders.PRODUCTOS.getId(),
    FOLDER_CATEGORIAS:folders.CATEGORIAS.getId(),
    FOLDER_PEDIDOS:folders.PEDIDOS.getId(),
    ADMIN_SALT:salt,
    ADMIN_HASH:hashInstalador_(salt+adminPassword),
    TOKEN_SECRET:secret
  }, true);

  Logger.log("==========================================");
  Logger.log("SERVICIOS INFORMATICOS AS - INSTALADO");
  Logger.log("SHEET_ID: " + ss.getId());
  Logger.log("DRIVE_FOLDER_ID: " + root.getId());
  Logger.log("CONTRASEÑA CPANEL: " + adminPassword);
  Logger.log("Google Sheet: " + ss.getUrl());
  Logger.log("Drive: " + root.getUrl());
  Logger.log("Publica como Web App y pega la URL /exec en config.js.");
  Logger.log("==========================================");

  return {sheetId:ss.getId(),driveFolderId:root.getId(),adminPassword:adminPassword,sheetUrl:ss.getUrl(),driveUrl:root.getUrl()};
}

function cambiarClaveAdmin(nuevaClave) {
  if (!nuevaClave || String(nuevaClave).length < 8) throw new Error("La clave debe tener al menos 8 caracteres");
  const props=PropertiesService.getScriptProperties();
  const salt=Utilities.getUuid();
  props.setProperty("ADMIN_SALT",salt);
  props.setProperty("ADMIN_HASH",hashInstalador_(salt+String(nuevaClave)));
  Logger.log("Contraseña actualizada.");
}

function diagnosticoServiciosAS() {
  const p=PropertiesService.getScriptProperties();
  const keys=["SHEET_ID","DRIVE_FOLDER_ID","FOLDER_LOGO","FOLDER_BANNERS","FOLDER_PRODUCTOS","FOLDER_CATEGORIAS","ADMIN_HASH","TOKEN_SECRET"];
  const out={}; keys.forEach(k=>out[k]=!!p.getProperty(k));
  Logger.log(JSON.stringify(out,null,2)); return out;
}

function hashInstalador_(text) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(text))
    .map(b => ("0"+((b<0?b+256:b).toString(16))).slice(-2)).join("");
}


/**
 * R3.6.4 - Actualiza el WhatsApp de información en una instalación existente.
 * Ejecuta esta función una vez si ya habías instalado la BD antes de esta versión.
 */
function actualizarWhatsappInformacion() {
  const id = PropertiesService.getScriptProperties().getProperty("SHEET_ID");
  if (!id) throw new Error("SHEET_ID_NO_CONFIGURADO");
  const ss = SpreadsheetApp.openById(id);
  const sh = ss.getSheetByName("CONFIG");
  if (!sh) throw new Error("CONFIG_NO_EXISTE");
  const values = sh.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === "whatsapp") {
      sh.getRange(i + 1, 2).setValue("+56 9 6861 3559");
      Logger.log("WhatsApp actualizado a +56 9 6861 3559");
      return "+56 9 6861 3559";
    }
  }
  sh.appendRow(["whatsapp", "+56 9 6861 3559"]);
  Logger.log("WhatsApp agregado: +56 9 6861 3559");
  return "+56 9 6861 3559";
}
