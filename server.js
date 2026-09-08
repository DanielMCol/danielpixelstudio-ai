const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 3000);
const ANTHROPIC_API_KEY = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-5";

const SITE_ROOT = __dirname;

const DANIEL_CONTEXT = `
Eres el asistente de DanielPixelStudio para clientes potenciales interesados en
servicios de Performance Marketing y automatización con IA. Responde en
español claro, breve y profesional, en clave 100% comercial (nunca de búsqueda
de empleo). Puedes responder SOLO con base en este contexto:

DanielPixelStudio — Daniel Aldana. Performance Marketing + IA: gestión de
pauta (Google Ads, Meta Ads), analítica (GA4, GTM), automatización (n8n, CRM)
e inteligencia artificial aplicada a marketing.

Servicios: gestión de Google Ads/Meta Ads, auditoría inteligente de campañas,
implementación GA4/GTM, agentes de prospección con IA, automatización de
operaciones, análisis predictivo y machine learning.

Experiencia aplicada (background técnico detrás del servicio):
- Nases Colombia (2025-actualidad): Performance/Growth Marketing — Meta Ads,
  Google Ads, GA4, GTM, CAPI, CRM, dashboards, remarketing, automatización
  con Python e IA.
- Coltanques SAS (2024): eficiencia operativa y datos — automatización de
  reportes y análisis de indicadores.
- Naturevital-Style (2023): marketing digital y e-commerce — email marketing,
  Bitrix24, GA4.
- Aluminios y Acabados (2022): comunicaciones y marketing digital.
- AMP (2021): marketing y comunicaciones.

Presupuesto gestionado: $15M-40M COP mensuales. Métricas reales documentadas
en la sección Casos del sitio: ROAS 5X (escalado desde 2.5X), -22% CPA,
+34.1% en conversiones efectivas, ROAS 35.2x en retargeting, entre otros.

Contacto: WhatsApp +57 321 416 9100, correo marketingdanielm@gmail.com,
agenda directa en cal.com/danielpixelstudiocall, LinkedIn
https://www.linkedin.com/in/ddanielmurcia/.

Reglas:
1. Si preguntan algo fuera de los servicios, casos o forma de trabajar de
   DanielPixelStudio, responde amable: "Solo puedo responder sobre los
   servicios, casos y forma de trabajar de DanielPixelStudio."
2. No inventes cifras, casos, clientes ni enlaces que no estén aquí.
3. Si falta un dato, dilo con transparencia y sugiere agendar una llamada o
   escribir por WhatsApp.
4. No respondas temas personales, políticos, médicos, legales o inapropiados.
5. Nunca hables de "disponibilidad para roles", "contratación", "CV" ni
   framing de búsqueda de empleo — DanielPixelStudio es un proveedor de
   servicios para clientes, no un candidato buscando trabajo.
`;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".jfif": "image/jpeg",
  ".pdf": "application/pdf",
  ".svg": "image/svg+xml",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".glb": "model/gltf-binary",
  ".mtl": "text/plain; charset=utf-8"
};

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 20_000) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

async function handleChat(req, res) {
  if (!ANTHROPIC_API_KEY) {
    return sendJson(res, 500, {
      answer: "El asistente todavía no tiene configurada la variable de entorno CLAUDE_API_KEY en el backend."
    });
  }

  try {
    const body = JSON.parse(await readBody(req));
    const question = String(body.question || "").trim();

    if (!question) {
      return sendJson(res, 400, { answer: "Escribe una pregunta sobre la experiencia profesional de Daniel." });
    }

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 500,
        temperature: 0.2,
        system: DANIEL_CONTEXT,
        messages: [
          {
            role: "user",
            content: question
          }
        ]
      })
    });

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text();
      console.error("Claude API error:", errorText);
      return sendJson(res, 502, {
        answer: "No pude conectar con el modelo de IA en este momento. Puedes revisar el CV o LinkedIn de Daniel mientras se restablece el servicio."
      });
    }

    const data = await anthropicResponse.json();
    const answer = data.content?.map(part => part.text || "").join("\n").trim();
    return sendJson(res, 200, { answer: answer || "No encontré una respuesta con el contexto profesional disponible." });
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, {
      answer: "Ocurrió un error procesando la pregunta. Intenta reformularla sobre experiencia, stack o disponibilidad."
    });
  }
}

function serveStatic(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const requestedPath = requestUrl.pathname === "/" ? "/index.html" : decodeURIComponent(requestUrl.pathname);
  const filePath = path.normalize(path.join(SITE_ROOT, requestedPath));

  if (!filePath.startsWith(SITE_ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/chat") {
    return handleChat(req, res);
  }
  return serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`DanielPixelStudio portfolio running at http://localhost:${PORT}`);
});

/*
Escalamiento futuro a WhatsApp Business Cloud API:
1. Crear webhook POST /webhook/whatsapp para recibir mensajes de Meta Cloud API.
2. Validar el token de verificación de Meta en GET /webhook/whatsapp.
3. Reutilizar DANIEL_CONTEXT y la función de llamada a Claude para responder.
4. Enviar la respuesta a Graph API:
   POST https://graph.facebook.com/vXX.X/{PHONE_NUMBER_ID}/messages
   con Authorization: Bearer WHATSAPP_ACCESS_TOKEN.
5. Mantener WHATSAPP_ACCESS_TOKEN, PHONE_NUMBER_ID y VERIFY_TOKEN en variables
   de entorno. No implementar esto hasta decidir escalar a WhatsApp.
*/
