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
