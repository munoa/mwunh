// pages/api/review.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { DISCORD_WEBHOOK_URL, SITE_URL } = process.env;
  if (!DISCORD_WEBHOOK_URL) {
    return res.status(500).json({ ok: false, error: 'Missing DISCORD_WEBHOOK_URL' });
  }

  try {
    const rawBody = req.body;
    const body = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody || {};
    const ua = req.headers['user-agent'] || '';
    const now = new Date().toISOString();

    // Construit une URL absolue si on reçoit un chemin relatif
    const host = req.headers['x-forwarded-host'] || req.headers.host || '';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const base = SITE_URL || (host ? `${proto}://${host}` : '');
    const absolutize = (u) => {
      if (!u) return '';
      if (/^https?:\/\//i.test(u)) return u;
      const clean = u.startsWith('/') ? u : `/${u}`;
      return base ? `${base}${clean}` : ''; // si en local sans domaine, on évite l’embed image
    };

    let content = '';
    let embeds;

    if (body.Type === 'Request') {
      // Formulaire d'accueil
      content =
        `**NEW THUMBNAIL REQUEST**\n` +
        `• Identity: ${body['Identité'] || '—'}\n` +
        `• Contact: ${body['Contact'] || '—'}\n` +
        `• Title/Topic: ${body['Titre'] || '—'}\n` +
        `• Brief: ${body['Brief'] || '—'}\n` +
        `• Links: ${body['Liens'] || '—'}\n` +
        `• Deadline: ${body['Deadline'] || '—'}\n` +
        `• When: ${now}\n` +
        `• UA: ${ua}`;
    } else if (body.Type === 'PreviewFeedback') {
      // Feedback page client
      const imgAbs = absolutize(body.RefImage);
      content =
        `**NEW PREVIEW FEEDBACK**\n` +
        `• Client folder: ${body.Slug || '—'}\n` +
        `• Name: ${body.Name || '—'}\n` +
        `• Comment: ${body.Comment || '—'}\n` +
        `• Reference image: ${imgAbs || '—'}\n` +
        `• When: ${now}\n` +
        `• UA: ${ua}`;

      if (imgAbs) {
        embeds = [{ title: 'Reference', image: { url: imgAbs } }];
      }
    } else {
      return res.status(400).json({ ok: false, error: 'Unknown payload Type' });
    }

    const payload = embeds ? { content, embeds } : { content };
    const r = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const txt = await r.text().catch(() => '');
      throw new Error(`Discord webhook failed (${r.status}): ${txt || 'no body'}`);
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || 'Unknown error' });
  }
}
