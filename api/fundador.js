// Solicitud de plaza de fundador: la guarda en Supabase (tabla founder_requests), avisa a Marc
// y confirma al tatuador, las dos cosas por Resend. Basta con que una de las dos vías funcione
// (guardar o avisar) para dar la solicitud por recibida.
// Variables en Vercel: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY.

// Una sola dirección para todo: los emails salen de hello@ y las respuestas vuelven a hello@,
// que DreamHost reenvía al Gmail de Marc (allí responde con "Enviar como" hello@).
const FROM = "Inkdraft <hello@inkdraft.tattoo>";
const REPLY_TO = "hello@inkdraft.tattoo";
// El aviso va a hello@ (no al Gmail directo): así Gmail responde como hello@ y no enseña el Gmail de Marc.
const NOTIFY = "hello@inkdraft.tattoo";
// Y sale de otra dirección: si saliera de hello@, Gmail lo tomaría por propio y respondería a hello@, no al tatuador.
const NOTIFY_FROM = "Inkdraft avisos <avisos@inkdraft.tattoo>";
const STYLES = ["blackwork", "fineline", "otro"];

const TEXT = {
  es: {
    subject: "Tu plaza de fundador en Inkdraft",
    body: (ig) =>
      `Hola${ig ? " " + ig : ""}:\n\nTenemos tu solicitud de plaza de fundador en Inkdraft: plan Pro a 19 € al mes para siempre.\n\nTe escribimos pronto con los siguientes pasos. Si quieres contarnos algo, responde a este email.\n\nMarc · Inkdraft\nhttps://www.inkdraft.tattoo/es/`,
  },
  en: {
    subject: "Your Inkdraft founder seat",
    body: (ig) =>
      `Hi${ig ? " " + ig : ""},\n\nWe've got your request for an Inkdraft founder seat: the Pro plan at €19 a month for life.\n\nWe'll write soon with the next steps. If you want to tell us anything, just reply to this email.\n\nMarc · Inkdraft\nhttps://www.inkdraft.tattoo/`,
  },
};

const clean = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

async function save(row) {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase sin configurar");
  // Las claves nuevas (sb_secret_…) van solo en "apikey"; las antiguas (JWT) también en Authorization.
  const headers = { apikey: key, "content-type": "application/json", prefer: "return=minimal", ...(key.startsWith("sb_") ? {} : { authorization: `Bearer ${key}` }) };
  const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/founder_requests`, { method: "POST", headers, body: JSON.stringify(row) });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
}

async function send(mail) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Resend sin configurar");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ from: FROM, ...mail }), // mail.from, si viene, manda
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  const b = typeof req.body === "object" && req.body ? req.body : {};

  // Campo trampa: los bots lo rellenan. Se responde como si todo fuera bien.
  if (clean(b.web, 200)) return res.status(200).json({ ok: true });
  // Rellenado en menos de 2 segundos: también es un bot.
  if (typeof b.t === "number" && b.t < 2000) return res.status(200).json({ ok: true });

  const email = clean(b.email, 200).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ ok: false, error: "email" });
  let instagram = clean(b.instagram, 60).replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\/.*$/, "").replace(/^@/, "");
  instagram = instagram ? "@" + instagram : "";
  const style = STYLES.includes(b.style) ? b.style : "";
  const lang = b.lang === "en" ? "en" : "es";

  const row = { email, instagram: instagram || null, style: style || null, lang };
  const igLink = instagram ? `https://www.instagram.com/${instagram.slice(1)}/` : "";

  const [saved, warned] = await Promise.allSettled([
    save(row),
    send({
      from: NOTIFY_FROM,
      to: NOTIFY,
      reply_to: email,
      subject: `Plaza de fundador: ${instagram || email}`,
      text: `Nueva solicitud de plaza de fundador.\n\nEmail: ${email}\nInstagram: ${instagram ? `${instagram} (${igLink})` : "—"}\nEstilo: ${style || "—"}\nIdioma de la web: ${lang}\n\nResponde a este email para escribirle directamente.`,
    }),
  ]);
  if (saved.status === "rejected") console.error("fundador: no se guardó", saved.reason);
  if (warned.status === "rejected") console.error("fundador: no se avisó", warned.reason);
  if (saved.status === "rejected" && warned.status === "rejected") return res.status(500).json({ ok: false });

  // Confirmación al tatuador: si falla, la solicitud ya está recibida igualmente.
  try {
    await send({ to: email, reply_to: REPLY_TO, subject: TEXT[lang].subject, text: TEXT[lang].body(instagram) });
  } catch (e) {
    console.error("fundador: no se confirmó", e);
  }
  return res.status(200).json({ ok: true });
};
