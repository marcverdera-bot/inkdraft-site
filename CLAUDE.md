# Inkdraft · landing — contexto para Claude Code

Web pública de Inkdraft: https://www.inkdraft.tattoo (inglés en `/`, castellano en `/es/`). HTML estático en Vercel, se publica solo al subir a `main`. La app privada es otro repo (`inkdraft-app`, https://app.inkdraft.tattoo): no se toca desde aquí.

- Marc no es desarrollador: explicar paso a paso, en castellano, sin jerga. Las claves nunca van en el repo ni en el chat; Marc las pone en Vercel.
- Las dos páginas (`index.html` y `es/index.html`) llevan el mismo CSS y la misma estructura: cualquier cambio se hace en las dos.
- `CLAUDE.md` y `supabase/` no se publican (`.vercelignore`).

## Plaza de fundador (19 oct 2026)
**Oferta vigente (decidida por Marc el 20 oct):** 50 plazas, plan Pro (30 diseños/mes, normalmente 39 €) a 19 €/mes para siempre; si cancela, pierde el precio. Se valoró "19 € el primer año y luego 29 €" y se descartó: con ~0,25 $ por diseño, un fundador al tope cuesta ~7 € y deja ~8 € netos; solo hay pérdida si la API sube más del doble, y el tope de 30 diseños limita el riesgo. Sale en el hero, el bloque de fundador, las FAQ (texto y JSON-LD), `llms.txt` y la confirmación de `api/fundador.js`: si cambia, cambiarlo en todos.

El tatuador pide plaza con un formulario en la sección de fundador (email obligatorio; Instagram y estilo opcionales), sin mandar un email. Lo recibe `api/fundador.js` (función de Vercel), que:
1. guarda la solicitud en la tabla `founder_requests` del proyecto `inkdraft` de Supabase (SQL en `supabase/founder_requests.sql`; solo el servidor accede);
2. avisa a Marc por Resend (asunto "Plaza de fundador: @instagram"; responder al aviso escribe al tatuador);
3. manda al tatuador una confirmación corta en su idioma desde `plazas@inkdraft.tattoo` (respuestas a hello@inkdraft.tattoo).
Basta con que funcione guardar o avisar para dar la solicitud por recibida. Antispam: campo trampa oculto (`web`) y rechazo de envíos hechos en menos de 2 s (a los bots se les responde "ok" sin guardar nada).

Variables en Vercel (proyecto de la landing): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (las mismas que la app), `RESEND_API_KEY` (clave de Resend "Landing Inkdraft", solo envío) y `NOTIFY_EMAIL` (dónde llegan los avisos).

Las solicitudes se ven en Supabase → Table Editor → `founder_requests`. Para dar acceso a la app a un fundador: añadir su email a `ALLOWED_EMAILS` en el proyecto de la app en Vercel y volver a publicar.
