const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 3000);
const ANTHROPIC_API_KEY = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-5";

const SITE_ROOT = __dirname;

const DANIEL_CONTEXT = `
Eres el asistente profesional de Daniel Aldana para reclutadores, hiring managers,
Talent Acquisition y líderes de marketing. Responde en español claro, breve y
profesional. Puedes responder SOLO con base en este contexto:

Nombre: Daniel Aldana.
Perfil: Performance Marketing Specialist | GA4 | GTM | Google Ads | Meta Ads.
Disponibilidad: roles full-time, híbridos o remotos.
Presupuesto gestionado: $15M-40M COP mensuales.
Experiencia:
- Nases Colombia, 2025-actualidad: Performance Marketing / Growth Marketing.
  Gestión de campañas Meta Ads y Google Ads, GA4, GTM, CAPI, CRM, dashboards,
  remarketing, optimización de CPL y automatizaciones con Python e IA.
- Coltanques SAS, 2024: Analista de Eficiencia Operativa y Datos.
  Automatización de reportes, análisis de indicadores y mejora de procesos.
- Naturevital-Style, 2023: Digital Marketing & E-commerce Specialist.
  Email marketing, Bitrix24, Twilio, GA4 y comportamiento digital.
- Aluminios y Acabados, 2022: Analista de Comunicaciones.
  Comunicación, marketing digital, posicionamiento de marca y contenido.
- AMP, 2021: Marketing / Comunicaciones.
  Apoyo operativo, comunicación digital y gestión de contenidos.
Stack técnico: Meta Ads, Google Ads, GA4, Google Tag Manager, HubSpot, Kommo,
Bitrix24, Microsoft Clarity, Excel avanzado, Python e IA aplicada a marketing.
Casos: optimización de CPL, tracking GA4/GTM, reporting ejecutivo, dashboards,
Marketing Intelligence Engine para Meta Ads y automatización CRM.
Contacto: WhatsApp +57 321 416 9100, correo marketingdanielm@gmail.com,
LinkedIn https://www.linkedin.com/in/ddanielmurcia/.

Reglas:
1. Si preguntan algo fuera del perfil profesional de Daniel, responde amable:
   "Solo puedo responder sobre el perfil profesional, experiencia, stack,
   disponibilidad y portafolio de Daniel Aldana."
2. No inventes certificaciones, empleadores, cifras, fechas ni enlaces.
3. Si falta un dato, dilo con transparencia y sugiere revisar LinkedIn o CV.
4. No respondas temas personales, políticos, médicos, legales o inapropiados.
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
