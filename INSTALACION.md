# SERVICIOS INFORMÁTICOS AS

Web corporativa responsive con catálogo futuro, CPANEL y backend opcional mediante Google Apps Script + Google Sheets/Drive.

## Inicio rápido

- Para GitHub Pages: sube todos los archivos de este paquete directamente a la raíz del repositorio.
- El catálogo inicia vacío por diseño.
- La portada corporativa funciona aun sin conectar Apps Script.

## Backend / CPANEL

1. Crea un proyecto de Google Apps Script.
2. Copia `Code.gs`, `Setup.gs` y `appsscript.json`.
3. Ejecuta `instalarServiciosAS()` una vez.
4. Guarda la contraseña de CPANEL que aparece en el registro.
5. Despliega como Web App.
6. Copia la URL `/exec` en `config.js`.
7. Abre `cpanel.html` desde la web publicada.

## Catálogo

Los productos y categorías parten vacíos. Puedes cargarlos más adelante desde CPANEL sin modificar la página corporativa.


NOVEDADES RÁPIDAS
- Tema claro / oscuro integrado en la web y en CPANEL.
- Chatbox AS Virtual integrado en la web. Puede responder consultas y derivarlas a administración.
- Nuevo registro AS_VIRTUAL en Google Sheets mediante el instalador actualizado.

- R3: selector visual elegante para tema claro/oscuro en Web y CPANEL.
- R3: AS Virtual con respuestas más avanzadas, efecto de escritura y opciones rápidas ampliadas.
- R3: bandeja AS Virtual mejorada en CPANEL con KPIs, filtro, búsqueda y cambio de estado.

- R3.1: AS Virtual ahora usa botón flotante circular con el logo AS.
- R3.1: se mejoró el contraste del tema claro en web y panel administrativo.

- R3.2: se forzó AS Virtual como botón perfectamente circular, incluso si el navegador conserva marcado anterior en caché.

- R3.3: AS Virtual simplificado. Más espacio de conversación, sugerencias plegables y datos de contacto ocultos hasta solicitar administración.

- R3.4: se reforzó la legibilidad del tema claro en la sección de proceso y en todo el footer.

- R3.5: se reforzó la legibilidad del capability strip en tema claro.
- R3.5: AS Virtual ahora incorpora aro giratorio estilo IA tanto en el botón flotante como en el encabezado del chat.

- R3.6: revisión global del tema claro para mejorar contraste en toda la web.
- R3.6: nueva sección y vista de Proyectos con tarjetas de portafolio (icono, nombre, estado y descripción).
- R3.6: se agregaron proyectos como E-Fleet, mantenimiento inteligente, check-in QR, navegación, combustible y NEXO IA / AS Virtual.

- R3.6.1: se oscureció el botón/enlace Solicitar propuesta y los botones principales en tema claro para mejorar la lectura.

- R3.6.2: el logo de AS Virtual ahora gira de forma visible.
- R3.6.2: el botón de WhatsApp ahora incorpora efecto GPS/radar con anillo pulsante y barrido circular.

- R3.6.3: pasada de pulido responsive en web y CPANEL (móvil, tablet y escritorio).
- R3.6.3: ajustes de header, hero, grids, proyectos, AS Virtual, footer y panel administrativo para pantallas pequeñas.

- R3.6.4: WhatsApp de información configurado en +56 9 6861 3559 en web, AS Virtual, cotizaciones y configuración base.
- Si la BD ya estaba instalada, ejecutar `actualizarWhatsappInformacion()` una sola vez en Apps Script o cambiarlo desde CPANEL.

- R3.6.5: CPANEL sin contraseña interna. El acceso queda delegado al login externo del propietario.


BACKEND GOOGLE APPS SCRIPT CONFIGURADO:
https://script.google.com/macros/s/AKfycbzl2Qt_hFI9ox6M2fIXSd2qQ9sfMmTE8bR-eQ6hlhASv7Ykhm4s6QHGtklSprbIH01Oug/exec

- R3.6.7: CPANEL con botón hamburguesa, menú lateral deslizable y scroll vertical propio.
- En escritorio el menú puede contraerse; en tablet/móvil funciona como slider/off-canvas con overlay.

- R3.6.8: el formulario Solicitar propuesta guarda exclusivamente en SOLICITUDES/CPANEL; ya no abre WhatsApp automáticamente.
- R3.6.8: si la API falla, conserva el formulario y muestra error para reintentar.

## R3.6.9 - SOLICITUDES / BD
- El formulario de cotización usa `AleAPI.submitPublic()` por JSONP para evitar CORS desde GitHub Pages.
- `doGet` acepta `createRequest`, `createVirtualMessage`, `createOrder` y `health`.
- `db_()` usa directamente la BD oficial como respaldo aunque no exista la propiedad `SHEET_ID`.
- Para que una URL `/exec` ya publicada tome este código, es obligatorio crear **Nueva versión** desde Administrar implementaciones.
- Prueba rápida: abre la URL `/exec?action=health` después de desplegar la nueva versión.

- R3.6.10: actualizada la URL oficial del Web App a:
  https://script.google.com/macros/s/AKfycbzl2Qt_hFI9ox6M2fIXSd2qQ9sfMmTE8bR-eQ6hlhASv7Ykhm4s6QHGtklSprbIH01Oug/exec

- R3.6.11: transporte Web/CPANEL -> Apps Script reemplazado por FORM + IFRAME con postMessage para evitar CORS y recibir confirmación real.
- R3.6.11: SOLICITUDES valida que exista la hoja, usa lock, SpreadsheetApp.flush() e ID único.
- R3.6.11: health informa database_id, existencia de SOLICITUDES y cantidad de registros.
- IMPORTANTE R3.6.11: después de reemplazar SERVICIOS_INFORMATICOS_AS.gs debes editar la implementación existente, elegir NUEVA VERSIÓN e implementar. Si editas la implementación existente, conserva la misma URL /exec configurada en config.js.

- R3.6.12: Solicitudes públicas cambian a JSONP/GET para evitar API_IFRAME_TIMEOUT en GitHub Pages.
- R3.6.12: confirmación visual con check verde en éxito y X roja en error.

- R3.6.13: nueva URL oficial de Apps Script integrada en Web y CPANEL.

- R3.6.14: la API ignora SHEET_ID heredados y fuerza siempre la BD oficial 1IGS1AerlI9tYLsB5PrM4WIhcm3wfvYMSzwymip6GCNI.
- R3.6.14: el check verde solo aparece si Apps Script confirma database_id oficial, fila e ID realmente escrito.

- R3.6.15: la BD oficial se valida por nombre + ID técnico.
- Nombre oficial verificado: SERVICIOS INFORMATICOS AS
- ID técnico verificado: 1IGS1AerlI9tYLsB5PrM4WIhcm3wfvYMSzwymip6GCNI
- El GS detiene la operación si el nombre o el ID no coinciden.

- R3.6.17: nueva URL oficial del Web App integrada.
- R3.6.17: BD SERVICIOS INFORMATICOS AS verificada por nombre + ID técnico.
- R3.6.17: copia actual de la BD incluida en el paquete.

- R3.6.18: AS Virtual y WhatsApp quedan alineados por el mismo eje central, con igual diámetro y separación uniforme.

- R3.6.19: acceso CPANEL retirado completamente de la interfaz pública. cpanel.html se mantiene solo para administración interna.
- R3.6.19: referencias públicas a CPANEL reemplazadas por administración interna/sistema interno.

- R3.6.20: optimización de carga; primer render local inmediato, sync Apps Script en segundo plano, cache y logos WebP.

- R3.6.21: CPANEL carga adminBootstrap por JSONP/GET, sin depender de iframe.
- R3.6.21: POST administrativo confirmado por polling requestStatus para evitar timeouts por redirecciones de Apps Script.
- R3.6.21: indicador real Conectando/Conectado/Sin conexión y botón Reintentar.

- R3.6.23: Dashboard del CPANEL convertido a KPI circulares/radiales; AS Virtual adopta el mismo estilo circular.

- R3.6.24: tema claro activado por defecto en la web y el CPANEL.
- R3.6.24: tarjetas del catálogo rediseñadas para verse más claras y con mejor contraste en tema blanco.

- R3.6.25: se eliminaron textos explicativos internos del portafolio y del catálogo solicitado por el usuario.
