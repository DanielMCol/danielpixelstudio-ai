# Auditoría web danielpixelstudio.com — octubre 2026

Alcance: repositorio `DanielMCol/danielpixelstudio-ai` (rama del sitio bilingüe, PR #1) y la portada publicada en danielpixelstudio.com (leída el 2026-10-07). Lo que no se pudo verificar desde aquí (GA4, Search Console, contenedor GTM por dentro, volúmenes de búsqueda) está marcado como **por verificar**.

---

## 1. Estado actual: qué funciona

- **Propuesta de valor clara en el H1**: "Performance marketing que se mide en ventas, no en likes". Habla de resultado, no de herramientas. Se mantiene.
- **Prueba social con cifras** en el hero ($15M COP/mes, -35% CAC, +30% leads) y 7 casos de estudio con página propia. Es el mayor activo de confianza del sitio.
- **Canales de contacto de baja fricción**: WhatsApp con mensaje prellenado, agenda en cal.com, correo, asistente Voiceflow.
- **Base técnica SEO correcta**: canonical en todas las páginas, robots.txt abierto, sitemap con alternates hreflang ES/EN, `lang` correcto, favicon, títulos y descripciones únicos en las páginas internas.
- **Rendimiento cuidado en móvil**: el modelo 3D (1 MB) no se carga en pantallas <768px ni con "reducir movimiento"; los logos que faltan se ocultan solos (`onerror`).
- **Marca coherente**: un solo acento (#C1502E) sobre fondo papel; consistente en toda la portada. No se cambia.

## 2. Problemas (P0 = crítico, P1 = alto impacto)

| # | Prioridad | Problema | Evidencia | Impacto | Estado |
|---|---|---|---|---|---|
| 1 | **P0** | **El sitio publicado y GitHub no son la misma versión** | La portada publicada tiene un formulario "Enviar mensaje" y un botón "Contáctanos" en el menú que no existen en el repo. Se despliega a mano en Netlify. | Si se sube el repo tal cual, se pierde el formulario del sitio publicado. Si se sigue subiendo la carpeta local, se pierden los cambios del repo (bilingüe, medición, SEO). | **Decisión de Daniel** (ver §9) |
| 2 | **P0** | **No se miden los clics que generan negocio** | No había ningún evento de WhatsApp, agenda, correo ni chat IA en el dataLayer. GTM-MLFHNDG5 está instalado, pero sin eventos no hay conversiones. GA4: **por verificar** dentro del contenedor. | Imposible saber qué página, campaña o fuente trae leads. Imposible optimizar pauta hacia leads. | **Implementado** (evento `cta_click`) + falta configurar GTM (§7) |
| 3 | **P1** | **El título de la portada no contiene lo que la gente busca** | `<title>DanielPixelStudio \| Performance Marketing + IA</title>`. Nadie que no conozca la marca busca "DanielPixelStudio" y "performance marketing" tiene poca demanda en español. | La portada solo puede posicionar para la marca. | **Implementado**: "Consultor de Google Ads y Meta Ads en Colombia \| DanielPixelStudio" |
| 4 | **P1** | **Entidad débil para Google y buscadores de IA (GEO)** | Schema con `sameAs: []`, sin teléfono, correo, `@id`, ni relación persona–negocio. Sin FAQPage aunque hay FAQ. Páginas internas sin ningún schema. | ChatGPT, Gemini, Perplexity y AI Overviews no pueden conectar a Daniel con su LinkedIn/Behance/Workana ni atribuirle los casos. | **Implementado**: WebSite + Person + ProfessionalService + FAQPage en portada; Article/BlogPosting + BreadcrumbList en las 20 páginas internas |
| 5 | **P1** | **Casos y artículos se comparten sin vista previa** | Ninguna página interna tenía Open Graph ni Twitter Card. | Al compartir un caso por WhatsApp o LinkedIn sale un enlace sin imagen ni título. Justo el canal donde Daniel vende. | **Implementado** en ES y EN |
| 6 | **P1** | **Nombre inconsistente** | El sitio y el schema dicen "Daniel Aldana"; LinkedIn es `/in/ddanielmurcia` y la foto `daniel-murcia.png`. | Para Google y la IA son dos personas distintas; para un cliente genera duda al buscar en LinkedIn. | **Decisión de Daniel** (§9) |
| 7 | **P1** | **No hay páginas de servicio** | Los botones "Ver solución →" mandan a WhatsApp o a la agenda, no a una página. Cada servicio es una tarjeta de 2 líneas. | No hay ninguna URL que pueda posicionar para "auditoría Google Ads", "implementación GA4", etc. El botón promete una explicación que no existe. | Propuesto (§4, siguiente PR) |
| 8 | **P1** | **Promesas sin respaldo en la FAQ** | "+30% ROAS en 60-90 días" y "40-60% menos que agencia". | Riesgo de confianza y de reclamo: es una garantía implícita sin condiciones. Contrasta con el tono "datos reales, no promesas" del resto del sitio. | Propuesto: reescribir como "en el caso X logramos…" (§9) |

## 3. Oportunidades P2 / P3

- **P2** Botón hero "Contáctanos": plural genérico mientras la web dice "un solo operador: yo". → **Implementado**: "Agenda tu diagnóstico gratis" (es la oferta real: 20 min gratis) / "Book your free diagnosis".
- **P2** "Talk to AI" en la versión en español. → **Implementado**: "Habla con la IA".
- **P2** Páginas internas dicen "← Volver al portafolio" (encuadre de candidato, no de proveedor). → **Implementado**: "← Volver al inicio".
- **P2** Artículos sin autor visible ni fecha. Para E-E-A-T y para que la IA cite, conviene byline + fecha. Pendiente del nombre (§9).
- **P2** Imágenes PNG pesadas: `portfolio-cover.png` 688 KB, `tracking-ga4-gtm.png` 670 KB. Convertir a WebP (~80% menos).
- **P2** El canvas animado del hero corre siempre en escritorio; revisar INP/CPU con PageSpeed Insights tras publicar.
- **P3** Tipografía: portada en Manrope, páginas internas en Inter. Unificar en Manrope.
- **P3** `assets/vendor/three.min.js` (600 KB) ya no se usa. No afecta al visitante, solo ensucia el repo.
- **Corregido**: `<div class="container footer-inner">` duplicado (HTML inválido) y la errata "adjustar" → "ajustar".

## 4. SEO: keywords, arquitectura y contenido

**Idioma.** Prioridad español. Evidencia: cifras en COP, WhatsApp +57, sección "Interacción Latinoamericana", casos con empresas colombianas. El inglés (PR #1) sirve para clientes remotos de EE. UU. y para LinkedIn internacional, pero no debe recibir contenido nuevo antes que el español. x-default = español es correcto.

**Mapa keyword → intención → página → CTA** (volúmenes **por verificar** en Keyword Planner / Search Console; la clasificación es por intención):

| Keyword (ES) | Intención | Página destino | CTA |
|---|---|---|---|
| consultor google ads colombia / experto google ads | Comercial | Portada (ya) → `/servicios/google-ads` (crear) | Diagnóstico gratis |
| agencia meta ads colombia / gestión facebook ads | Comercial | `/servicios/meta-ads` (crear) | Diagnóstico gratis |
| auditoría google ads / auditoría meta ads | Transaccional | `/servicios/auditoria-campanas` (crear, con precio o rango) | WhatsApp "quiero auditoría" |
| implementación GA4 / configurar google tag manager | Transaccional | `/servicios/ga4-gtm` (crear) + caso GA4 (existe) | Agenda |
| automatizar leads hubspot n8n | Comercial long-tail | Caso n8n (existe) → ampliar con sección "cómo lo hago para ti" | WhatsApp |
| por qué meta suspende cuentas publicitarias | Informacional | Artículo (existe) | Enlace a auditoría Meta Ads |
| google marketing live 2026 | Informacional, temporal | Artículo (existe). Baja relación comercial: no invertir más | — |
| DanielPixelStudio | Branded | Portada | — |

**¿Blog?** Sí, pero pequeño y conectado a servicios. Los temas que valen la pena son problemas que preceden a una compra: "cuenta de Meta Ads suspendida" (ya existe y es el mejor artículo para captar), "por qué GA4 no coincide con Meta Ads", "cómo saber si tu agencia de Google Ads está desperdiciando presupuesto", "CAPI de Meta: qué es y si lo necesitas". Cada artículo debe enlazar a su página de servicio. No escribir artículos genéricos de tendencias.

**Enlazado interno.** Hoy los casos solo enlazan a la portada. Cada caso debería enlazar a la página de servicio correspondiente cuando exista.

## 5. CRO: de desconocido a cliente

Recorrido actual: hero → problema → servicios → proceso → diferenciación → casos → planes → FAQ → sobre mí → mapa → blog → contacto. Es largo (12 bloques) pero lógico.

1. **Lo que falta para confiar**: testimonios con nombre y cargo (hay logos y cifras, pero ninguna voz de cliente). Un solo testimonio de Nases o Coltanques vale más que otra sección.
2. **Lo que falta para actuar**: los planes ("Auditoría Express", "Gestión Mensual") no tienen precio ni rango. Sin un "desde $X" el visitante B2B no sabe si está en su presupuesto y no escribe. Hipótesis para probar: mostrar "desde" en Auditoría Express aumenta clics a WhatsApp desde `#planes` (métrica: `cta_click` con `cta_location = planes`).
3. **Formulario**: el sitio publicado tiene uno, el repo no. Hay que decidir si se mantiene (§9). Si se mantiene, debe disparar un evento `generate_lead` y llegar a un CRM, no solo al correo.
4. **"Ver solución →"** abre WhatsApp sin aviso. O se cambia el texto a "Preguntar por WhatsApp" o se crean las páginas de servicio (recomendado).

## 6. Marca y redes

- Paleta y composición coherentes; no se tocan.
- Redes conectadas: LinkedIn, Behance, Workana (footer y contacto). Todas funcionan. Ahora también en el schema (`sameAs`).
- Falta: Instagram o Facebook de DanielPixelStudio, si existen. Un negocio que vende Meta Ads sin presencia en Meta pierde credibilidad. **Por verificar**: ¿existen esas cuentas?
- La dirección RED → WEB depende de que el perfil de LinkedIn enlace a danielpixelstudio.com y use el mismo nombre del sitio (§9).

## 7. Analítica: cómo activar la medición

El PR añade `assets/js/tracking.js` en las 22 páginas. Cada clic en un canal de contacto envía:

```
event: cta_click
cta_type: whatsapp | calendar | email | ai_chat | social | language
cta_text, cta_location (hero, servicios, planes, contacto, footer…), link_url, page_lang
```

Verificado en navegador: hero → `calendar/hero`, tarjeta de servicio → `whatsapp/servicios`, chat → `ai_chat/contacto`, footer → `social/footer`.

Pasos en GTM (GTM-MLFHNDG5), una sola vez:
1. Variables → Variable de capa de datos: `cta_type`, `cta_text`, `cta_location`, `link_url`, `page_lang`.
2. Activador → Evento personalizado `cta_click`.
3. Etiqueta → GA4 Event, nombre `cta_click`, con esos 5 parámetros. (Requiere una etiqueta de configuración GA4 con tu ID G-XXXX; **por verificar** si ya existe.)
4. Segunda etiqueta GA4 Event `generate_lead` con activador `cta_click` donde `cta_type` coincide con `whatsapp|calendar|email`. En GA4 → Administrar → Eventos clave, marcar `generate_lead`.
5. En GA4 registrar `cta_type` y `cta_location` como dimensiones personalizadas.
6. Vista previa de GTM, hacer clic en cada botón, publicar.

Con esto se puede importar `generate_lead` a Google Ads y Meta (vía CAPI/GTM) y optimizar pauta hacia leads.

## 8. IA: oportunidades reales

- **Ya existe**: Voiceflow en español. Oportunidad concreta: que el bot pregunte presupuesto mensual y plataforma, y envíe ese lead calificado a HubSpot/CRM vía n8n (es exactamente el servicio que Daniel vende; usarlo en su propia web es prueba). Configuración en Voiceflow, no en el repo.
- **Voiceflow solo en español**: en `/en/` el botón abre un bot en español. O se crea un proyecto en inglés o se oculta el botón en EN.
- **GEO**: la entidad ahora está definida en schema; el siguiente paso es contenido que la IA pueda citar (casos con cifras, fechas y autor) y que el nombre sea el mismo en todas partes.
- No se recomienda: buscador con IA, personalización por IA. No hay volumen de contenido que lo justifique.

## 9. Decisiones que solo Daniel puede tomar

1. **¿Cómo publicas?** Recomendado: conectar Netlify al repo de GitHub (cada merge publica solo). Antes, pasar al repo lo que hoy solo existe en tu carpeta local (formulario, botón Contáctanos).
2. **¿Tu nombre público es Daniel Aldana o Daniel Murcia?** Se usará el mismo en web, schema, autor de artículos y LinkedIn.
3. **¿Se pueden reescribir las promesas de la FAQ** ("+30% ROAS en 60-90 días", "40-60% menos que agencia") como resultados de casos concretos?
4. **¿Mostrar precio "desde" en Auditoría Express?**
5. **¿Existen Instagram/Facebook de la marca?**

## 10. Prioridades siguientes

1. P0 Unificar sitio publicado y repo; conectar Netlify a GitHub.
2. P0 Configurar GTM/GA4 con el evento `cta_click` (§7) y validar en tiempo real.
3. P1 Dar de alta el sitio en Search Console (propiedad de dominio), enviar `sitemap.xml`, revisar cobertura ES/EN.
4. P1 Crear 4 páginas de servicio (Google Ads, Meta Ads, Auditoría, GA4/GTM) en ES y EN, enlazadas desde las tarjetas y los casos.
5. P1 Unificar el nombre; byline y fecha en artículos.
6. P2 Testimonios, precio "desde", WebP, Voiceflow EN.

## Cambios realizados en este PR

- `assets/js/tracking.js` nuevo + incluido en las 22 páginas (ES y EN).
- Portada ES/EN: título y meta description orientados a búsqueda, `og:type` website, `og:site_name`, schema completo (WebSite, Person con `sameAs`, ProfessionalService con contacto, FAQPage).
- 20 páginas internas: Open Graph + Twitter Card, schema Article/BlogPosting + BreadcrumbList, "Volver al inicio".
- CTA del hero "Agenda tu diagnóstico gratis" / "Book your free diagnosis"; "Habla con la IA" en español.
- HTML: footer duplicado corregido; errata "adjustar".

## Actualización 2026-10-10: listo para publicar desde GitHub

- **Formulario de contacto en el repositorio** (portada ES y EN), con los mismos campos que el sitio publicado: nombre, correo, empresa, teléfono/WhatsApp y reto. Usa Netlify Forms (`name="contacto"`, campo `idioma`, honeypot antispam). Se envía sin recargar y empuja `generate_lead` al dataLayer. Con esto, publicar el repositorio ya no borra el formulario.
- **`netlify.toml`**: publica la raíz tal cual, oculta archivos internos (`server.js`, `package.json`, `docs/`, notas de despliegue) y añade cabeceras de seguridad y caché.
- **`docs/gtm/gtm-medicion-contactos.json`**: configuración de GTM para importar (Administrar → Importar contenedor → Fusionar → Cambiar nombre de los conflictos). Crea 7 variables de capa de datos, 3 activadores y 3 etiquetas de evento GA4 (`cta_click`, `generate_lead` por WhatsApp/agenda/correo y `generate_lead` por formulario). No crea la etiqueta de Google para no duplicar páginas vistas. Antes de publicar, cambiar la constante `GA4 - Measurement ID` (G-XXXXXXXXXX) por el ID real. El archivo no se ha probado contra GTM; revisar la vista previa al importarlo.

Pasos en Netlify, una sola vez:
1. Sitio → Site configuration → Build & deploy → Link repository → GitHub → `DanielMCol/danielpixelstudio-ai`, rama `main`. Sin comando de compilación; directorio de publicación `.` (lo toma de `netlify.toml`).
2. Forms → activar la detección de formularios. Forms → Notifications → correo a marketingdanielm@gmail.com.
3. Fusionar PR #1 y PR #2 en `main`: Netlify publica solo.
