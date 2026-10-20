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

## Flujo real en la landing (20 oct 2026)
"Cómo funciona" y los ejemplos de Blackwork enseñan resultados reales de la app, sin retocar (solo redimensionados a webp), en vez de las pantallas inventadas de antes (`paso-N.png` / `step-N.png`, borradas).
- Encargo de ejemplo: "escarabajo con fusion a rosa", antebrazo 15 cm, de la biblioteca de Marc. Paso a paso: ficha del encargo (HTML) → 4 referencias (`img/esc-concepto-1..4.webp`, elegida la 2, "Élitros de pétalos") → 3 variaciones (`esc-var-cercana/media/atrevida.webp`, elegida la cercana) → diseño + stencil (`esc-stencil.webp`) → en la piel (`esc-piel.webp`).
- En la piel: el antebrazo es una foto generada con IA (Figma, GPT Image; fichero "Inkdraft · landing (antebrazo IA)" en los borradores de Marc), con la variación colocada encima y pasada por `/api/skin` de la app real. El pie de foto lo dice. Nunca fotos de clientes sin permiso.
- Ejemplos de Blackwork: crisantemo con 誕生 (`cri-concepto.webp` ↔ `cri-stencil.webp`) y el escarabajo; el botón alterna diseño y stencil.
- Enlace discreto "Entrar" / "Log in" en la cabecera hacia https://app.inkdraft.tattoo, para quien ya tiene acceso. Nada de demo abierta: cada uso cuesta y la app es solo para invitados.
- Para cambiar el ejemplo: bajar las imágenes de la biblioteca, convertirlas a webp (~480 px las miniaturas, ~800 px las grandes) y mantener los mismos nombres en las dos páginas.
- El problema (mensaje directo con Laura) cuenta el mismo encargo a mano: martes, tres bocetos (conceptos 1, 3 y 4); jueves, un cuarto (concepto 2), y sigue sin decidirse. El chat va en dos columnas (martes | jueves) para que la sección quede apaisada y compensada con el texto en escritorio; en el móvil, una columna. Ya no queda nada del lobo.
- Vídeo o demo: no por ahora (decisión de Marc, 20 oct).

## Estilos (20 oct 2026)
- El botón del principio dice "Ver estilos" / "See the styles" y baja a #blackwork.
- Hoy solo existe Blackwork (con los dos ejemplos reales). Debajo, la fila "En la mesa de dibujo" / "On the drawing table": Fineline y Tradicional "En desarrollo", sin imágenes inventadas (trama rayada + gota), y "¿Otro estilo?", que lleva al formulario de fundador.
- "Tu estilo" (beta) y "A juego" están fuera: no se van a hacer como estilo (decisión de Marc). Quitados también de las preguntas, los metadatos y `llms.txt`. Imágenes `gato-luna.jpg` y `mariposas.jpg` borradas.
- El formulario de fundador sigue con Blackwork / Fineline / Otro. Para añadir "Tradicional" hay que cambiarlo en tres sitios a la vez: el formulario de las dos páginas, `STYLES` en `api/fundador.js` y el `check` de la columna `style` en Supabase (`supabase/founder_requests.sql`, a mano en el SQL Editor).
