/* Motor compartido de AS Virtual. No envía la conversación a terceros. */
var ASAssistant = (function () {
  "use strict";
  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim(); }
  var topics = [
    {key:"tienda", re:/\b(tienda|ecommerce|e commerce|carrito|vender online|venta online)\b/, text:"Para vender online podemos preparar catálogo, carrito y gestión de pedidos. El pago en línea depende de la integración que necesites.", question:"¿Qué productos venderás y cuántos tienes aproximadamente?", chips:["Tengo menos de 50 productos","Necesito integrar pagos","Solicitar propuesta"]},
    {key:"gestion", re:/\b(gestion|sistema|sistemas|inventario|stock|flota|erp|crm|conductores|vehiculos|kpi|sistema administrativo)\b/, text:"Podemos reunir tus procesos en un sistema con usuarios, permisos y reportes. Conviene comenzar por el proceso que hoy te quita más tiempo.", question:"¿Quieres controlar inventario, clientes, flota u otro proceso?", chips:["Controlar inventario","Gestionar una flota","Gestionar clientes"]},
    {key:"movil", re:/\b(android|movil|moviles|apk|app|aplicacion|iphone|ios)\b/, text:"Desarrollamos aplicaciones Android y web. Podemos incorporar cámara, QR, GPS o conexión con tu sistema según el alcance.", question:"¿Qué tarea principal hará la aplicación?", chips:["Trabajar en terreno","Leer códigos QR","Conectar con mi sistema"]},
    {key:"integracion", re:/\b(api|apis|integracion|integrar|automatizar|automatizacion|facturacion|facturacion cl)\b/, text:"Podemos conectar sistemas por API y automatizar el intercambio de información. Antes hay que revisar la documentación y los accesos disponibles.", question:"¿Qué dos sistemas necesitas conectar y qué datos deben intercambiar?", chips:["Integrar facturación","Conectar con mi web","Solicitar propuesta"]},
    {key:"datos", re:/\b(postgresql|postgres|supabase|sql|base de datos|bases de datos|migracion|migrar)\b/, text:"Trabajamos con PostgreSQL, Supabase y migraciones. Podemos revisar estructura, consultas, permisos y conexión con aplicaciones.", question:"¿Buscas crear una base de datos, migrarla o resolver un problema?", chips:["Crear base de datos","Migrar mis datos","Resolver un error"]},
    {key:"soporte", re:/\b(soporte|error|falla|funciona|arreglar|reparar|mantencion|mantenimiento|lento|lenta|optimizar)\b/, text:"Podemos revisar el problema y definir la corrección. Para orientarte necesito el mensaje de error o el paso en que falla.", question:"¿En qué programa o sitio ocurre y qué aparece en pantalla?", chips:["Error en mi sitio web","Problema con una aplicación","Hablar con una persona"]},
    {key:"web", re:/\b(web|pagina|paginas|sitio|landing|corporativa|corporativo|portal)\b/, text:"Podemos crear una web adaptable a celular, con tus servicios, proyectos y un formulario de contacto. También podemos mejorar una web que ya tengas.", question:"¿La necesitas para presentar tu negocio o para vender online?", chips:["Presentar mi negocio","Vender online","Mejorar mi web actual"]}
  ];
  function findTopic(s) { if(/\b(error|falla|no funciona|problema tecnico)\b/.test(s))return topics.find(function(t){return t.key==="soporte";}); if(/\b(integrar|integracion|conectar|api|apis|facturacion)\b/.test(s))return topics.find(function(t){return t.key==="integracion";}); return topics.find(function(t){return t.re.test(s);}); }
  function clp(n) { return "$" + Math.round(Number(n)).toLocaleString("es-CL"); }
  function reply(input) {
    input=input||{};
    var raw=String(input.message||"").trim().slice(0,2000), s=norm(raw), cfg=input.config||{};
    var history=Array.isArray(input.history)?input.history.slice(-12):[];
    var previous=history.filter(function(m){return m.role==="assistant"&&m.topic;}).pop();
    var topic=findTopic(s), key=topic?topic.key:(previous?previous.topic:"");
    var context=topics.find(function(t){return t.key===key;});
    var projects=(input.projects||[]).filter(function(p){return String(p.publicado||"SI").toUpperCase()==="SI"&&String(p.activo||"SI").toUpperCase()!=="NO";});
    var products=(input.products||[]).filter(function(p){return String(p.activo||"SI").toUpperCase()!=="NO";});
    function out(text,chips,links) { return {text:text,suggestions:(chips||[]).slice(0,3),links:links||[],topic:key}; }
    if (!s) return out("Cuéntame qué necesitas y te ayudo a definir el siguiente paso.",["Crear una página web","Necesito soporte","Ver proyectos"]);
    if (/^(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|saludos)( que tal| como estas)?$/.test(s))
      return out("¡Hola! Soy "+(cfg.assistant_name||"AS Virtual")+". ¿Qué necesitas para tu negocio?",["Crear una página web","Mejorar un sistema","Ver proyectos"]);
    if (/\b(persona|humano|asesor|administrador|administracion|contactarte|contactar|whatsapp|telefono|llamar)\b/.test(s))
      return out("Puedes escribirnos por WhatsApp"+(cfg.whatsapp?" al "+cfg.whatsapp:"")+" o dejar tu nombre y contacto aquí. El equipo revisará tu consulta; no puedo confirmar un horario de respuesta.",["Dejar mis datos"],[{label:"Abrir WhatsApp",action:"whatsapp"},{label:"Dejar mi consulta",action:"contact"}]);
    if (/\b(correo|email|e mail)\b/.test(s)&&!topic)
      return out(cfg.email?"Nuestro correo de contacto es "+cfg.email+". También puedes enviar tu consulta desde el formulario de la web.":"Puedes dejar tu consulta en el formulario de la web y el equipo la recibirá.",[],[{label:"Enviar consulta",action:"request"}]);
    var selected=projects.find(function(p){var title=norm(p.titulo||p.title);return title.length>3&&(s.includes(title)||title.includes(s)&&s.length>7);});
    var listed=history.filter(function(m){return m.role==="assistant"&&m.project_ids;}).pop();
    if(!selected&&listed&&/^(el primero|la primera|el segundo|la segunda|el tercero|la tercera|1|2|3)$/.test(s)) {
      var index=/segund|^2$/.test(s)?1:/tercer|^3$/.test(s)?2:0;
      selected=projects.find(function(p){return String(p.id)===String(listed.project_ids[index]);});
    }
    if (selected) {
      var links=[{label:"Ver proyectos",action:"projects"}];
      if(selected.enlace_demo) links.unshift({label:"Ver demostración",url:selected.enlace_demo});
      if(selected.archivo_url||selected.enlace_descarga) links.push({label:"Descargar",url:selected.archivo_url||selected.enlace_descarga});
      return out((selected.titulo||selected.title)+": "+String(selected.descripcion||selected.text||"Consulta el detalle en nuestro portafolio.").slice(0,340)+ (selected.estado?"\nEstado: "+selected.estado+".":""),["Quiero algo similar","Solicitar propuesta"],links);
    }
    if(/\b(proyectos|portafolio|trabajos|ejemplos|desarrollos|demostracion|demo|descargar)\b/.test(s)) {
      if(!projects.length) return out("Todavía no hay proyectos publicados para mostrar. Cuéntame qué solución buscas y te orientaré.",["Crear una página web","Sistema de gestión"]);
      var visible=projects.slice(0,3);
      var result=out("Puedes revisar estos proyectos:\n"+visible.map(function(p,i){return (i+1)+". "+(p.titulo||p.title)+(p.estado?" · "+p.estado:"");}).join("\n")+"\n¿Cuál te interesa?",visible.map(function(p){return p.titulo||p.title;}),[{label:"Ver todo el portafolio",action:"projects"}]);
      result.project_ids=visible.map(function(p){return p.id;}); return result;
    }
    var ignored=/^(cuanto|cuesta|precio|precios|valor|valores|costo|cotizacion|cotizar|quiero|necesito|una|uno|un|de|la|el|para|por|y|en|que|mi|me|los|las|es|tiene|tienen|venden)$/;
    var words=s.split(" ").filter(function(w){return w.length>2&&!ignored.test(w);});
    var matches=products.map(function(p){var text=norm(p.nombre+" "+(p.categoria_nombre||"")+" "+(p.descripcion||""));return {p:p,score:words.filter(function(w){return text.split(" ").includes(w);}).length};}).filter(function(x){return x.score>0;}).sort(function(a,b){return b.score-a.score;});
    var price=/\b(precio|precios|cuanto|cuesta|cuestan|valor|valores|costo|tarifa|cobran)\b/.test(s)&&!/\b(tiempo|tarda|demora|plazo)\b/.test(s);
    if(price&&matches.length&&Number(matches[0].p.precio)>0) {
      var p=matches[0].p;
      return out("El precio publicado de «"+p.nombre+"» es "+clp(p.precio)+" CLP. Cualquier personalización o servicio adicional se cotiza por separado.",["Solicitar propuesta"],[{label:"Ver catálogo",action:"catalog"}]);
    }
    if(price) return out("No tengo un precio publicado para "+(context?{web:"esa web",tienda:"esa tienda",gestion:"ese sistema",movil:"esa aplicación",integracion:"esa integración",datos:"ese trabajo con datos",soporte:"esa revisión"}[key]:"ese trabajo")+". El valor se define según el alcance. "+(context?context.question:"¿Qué necesitas desarrollar o mejorar?"),context?context.chips:["Página web","Sistema de gestión","Necesito soporte"]);
    if(/\b(plazo|demora|tarda|entrega|cuando estaria|cuanto tiempo)\b/.test(s))
      return out("El plazo debe confirmarlo el equipo después de revisar el alcance y la disponibilidad. ¿Tienes una fecha objetivo?",["Dejar mis datos","Solicitar propuesta"]);
    if(/\b(cotiz|cotizar|cotizacion|presupuesto|propuesta|proforma)\b/.test(s))
      return out("Para preparar una propuesta, deja una breve descripción de lo que necesitas y un medio de contacto. El formulario permite enviar esos datos al equipo.",[],[{label:"Solicitar propuesta",action:"request"},{label:"Dejar mis datos aquí",action:"contact"}]);
    if (/\b(dejar mis datos|quiero que me contacten|contactenme)\b/.test(s))
      return out("Completa tu nombre y un correo o WhatsApp en el formulario de este chat. Se enviará también el resumen de tu consulta.",[],[{label:"Completar contacto",action:"contact"}]);
    if (/\b(gracias|muchas gracias|perfecto|excelente)\b/.test(s)) return out("De nada. Si quieres avanzar, puedes enviar tu consulta al equipo.",["Solicitar propuesta","Ver proyectos"]);
    if (/\b(menos de|productos|pagos|negocio|terreno|codigos qr|clientes|mi web actual|algo similar)\b/.test(s)&&previous&&context) {
      var answer={web:"Podemos organizar la web en servicios, proyectos y contacto, con un panel para actualizar el contenido.",tienda:"Anoto ese alcance para la tienda. El catálogo y la gestión de pedidos se pueden preparar en una primera etapa.",gestion:"Ese proceso puede organizarse con formularios, responsables y reportes. Para definirlo conviene revisar cómo lo haces actualmente.",movil:"Esa función puede formar parte de la aplicación; hay que revisar el flujo de trabajo y los equipos que utilizarán.",integracion:"Ese es un buen punto de partida. El equipo debe revisar la API disponible y las credenciales de prueba.",datos:"El siguiente paso es revisar la estructura y el acceso a la base de datos.",soporte:"Puedes incluir una captura o el texto del error cuando te comuniques con el equipo."}[key];
      return out(answer+" ¿Quieres enviar estos antecedentes para que te contacten?",["Dejar mis datos","Solicitar propuesta"]);
    }
    if(topic) return out(topic.text+"\n"+topic.question,topic.chips);
    if(matches.length) return out("En el catálogo aparece «"+matches[0].p.nombre+"». "+String(matches[0].p.descripcion||"").slice(0,260),["Solicitar propuesta"],[{label:"Ver catálogo",action:"catalog"}]);
    if(/^(si|ok|dale|bueno|continuar)$/.test(s)&&previous)
      return out("Para continuar, puedes dejar tu contacto o enviar una solicitud con el detalle del proyecto.",[],[{label:"Dejar mi contacto",action:"contact"},{label:"Solicitar propuesta",action:"request"}]);
    return out("No tengo información suficiente para responder eso con precisión. ¿Tu consulta es sobre una web, un sistema o un problema técnico?",["Página web","Sistema de gestión","Problema técnico"]);
  }
  return {reply:reply,normalize:norm};
})();
if(typeof module!=="undefined"&&module.exports) module.exports=ASAssistant;
