/*
 * Medición de conversiones para GTM (GTM-MLFHNDG5).
 * Envía al dataLayer un evento "cta_click" cada vez que alguien hace clic en
 * un canal de contacto (WhatsApp, agenda, correo, asistente IA) o en una red
 * social. En GTM basta un activador "Evento personalizado = cta_click" y una
 * etiqueta de evento GA4 que lea las variables de la capa de datos.
 *
 *   cta_type     whatsapp | calendar | email | ai_chat | social | language
 *   cta_text     texto visible del botón o enlace
 *   cta_location id de la sección donde está (hero, servicios, contacto...)
 *   link_url     destino del enlace
 *   page_lang    es | en
 */
(function () {
  window.dataLayer = window.dataLayer || [];

  function ctaType(el) {
    if (el.id === "openAiChat") return "ai_chat";
    var href = el.getAttribute("href") || "";
    if (/wa\.me|whatsapp\.com/i.test(href)) return "whatsapp";
    if (/cal\.com|calendly\.com/i.test(href)) return "calendar";
    if (/^mailto:/i.test(href)) return "email";
    if (/linkedin\.com|behance\.net|workana\.com|instagram\.com|facebook\.com|youtube\.com|tiktok\.com|x\.com|twitter\.com/i.test(href)) return "social";
    if (el.closest(".lang-switch")) return "language";
    return null;
  }

  function location(el) {
    if (el.closest(".hero")) return "hero";
    if (el.closest("header, .nav, .blog-nav")) return "nav";
    if (el.closest("footer")) return "footer";
    var section = el.closest("section[id]");
    if (section) return section.id;
    return el.closest("article") ? "article" : "page";
  }

  document.addEventListener("click", function (e) {
    var el = e.target.closest ? e.target.closest("a, button") : null;
    if (!el) return;
    var type = ctaType(el);
    if (!type) return;
    window.dataLayer.push({
      event: "cta_click",
      cta_type: type,
      cta_text: ((el.querySelector(".chat-option-title") || el).textContent || "").replace(/\s+/g, " ").trim().slice(0, 100),
      cta_location: location(el),
      link_url: el.getAttribute("href") || "",
      page_lang: document.documentElement.lang || ""
    });
  }, true);
  /*
   * Formulario de contacto (Netlify Forms). Se envía sin recargar la página y,
   * si Netlify lo acepta, empuja "generate_lead" al dataLayer. Sin JavaScript
   * el formulario sigue funcionando con un envío normal.
   */
  document.addEventListener("submit", function (e) {
    var form = e.target;
    if (!form.classList || !form.classList.contains("contact-form") || !window.fetch) return;
    e.preventDefault();
    var status = form.querySelector(".form-status");
    var button = form.querySelector("button[type=submit]");
    if (status) status.textContent = form.getAttribute("data-sending") || "";
    if (button) button.disabled = true;
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(new FormData(form)).toString()
    }).then(function (res) {
      if (!res.ok) throw new Error(res.status);
      window.dataLayer.push({
        event: "generate_lead",
        lead_source: "form",
        form_name: form.getAttribute("name") || "",
        cta_location: location(form),
        page_lang: document.documentElement.lang || ""
      });
      form.reset();
      if (status) status.textContent = form.getAttribute("data-ok") || "";
    }).catch(function () {
      if (status) status.textContent = form.getAttribute("data-err") || "";
    }).then(function () {
      if (button) button.disabled = false;
    });
  });
})();
