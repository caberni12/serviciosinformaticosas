# AS Virtual Oficina - R3.7.0

## Funciones incluidas
- Nueva vista interna "Oficina Virtual" en CPANEL.
- Creación de cotizaciones con múltiples líneas.
- Cálculo automático de subtotal, IVA 19% y total.
- Generación automática de PDF mediante Google Apps Script.
- Guardado del PDF en Google Drive.
- Historial de cotizaciones en la hoja COTIZACIONES.
- Envío del PDF por correo desde Google Apps Script.
- Mensaje de WhatsApp prearmado con enlace al PDF.
- Crear cotización desde una Solicitud o desde un mensaje de AS Virtual.
- Responder mensajes de AS Virtual y guardar respuesta, fecha y medio.
- Sugerencias de respuesta integradas sin necesidad de API de IA.

## Importante después de subir el GS
Reemplaza el único archivo SERVICIOS_INFORMATICOS_AS.gs y crea una NUEVA VERSION de la implementación Web App.
Google puede solicitar autorización adicional para Documentos/Drive/Correo por las nuevas funciones de PDF y email.

## WhatsApp automático
La versión actual abre WhatsApp con el mensaje y el enlace al PDF ya preparados. El envío totalmente automático requiere credenciales de WhatsApp Business API.

## IA generativa
La oficina funciona sin una API de IA externa. Para respuestas generativas libres como ChatGPT se debe conectar posteriormente un proveedor de IA mediante API y guardar la credencial de forma segura en Script Properties, nunca en la web pública.

## WhatsApp PDF - R3.7.2
AS Virtual Oficina puede enviar cotizaciones por WhatsApp. Si WhatsApp Business Cloud API está configurada, envía el PDF como documento adjunto. Si no está configurada, utiliza modo compatible: abre WhatsApp con el mensaje y el enlace al PDF listo para compartir.

## Feedback de acciones
Las acciones del CPANEL muestran loader durante el proceso y confirmación visual de éxito/error al finalizar.
