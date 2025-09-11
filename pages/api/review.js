// pages/api/review.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { DISCORD_WEBHOOK_URL } = process.env;
  if (!DISCORD_WEBHOOK_URL) {
    return res.status(500).json({ ok: false, error: 'Missing DISCORD_WEBHOOK_URL' });
  }

  try {
    const body = req.body || {};
    const ua = req.headers['user-agent'] || '';
    const now = new Date().toISOString();

    // Deux types possibles : "Request" (form d'accueil) ou "PreviewFeedback" (page client)
    let content = '';
    let embeds;

    if (body.Type === 'Request') {
      // Formulaire principal
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
      // Feedback sur la page client /[client]
      content =
        `**NEW PREVIEW FEEDBACK**\n` +
        `• Client folder: ${body.Slug || '—'}\n` +
        `• Name: ${body.Name || '—'}\n` +
        `• Comment: ${body.Comment || '—'}\n` +
        `• Reference image: ${body.RefImage || '—'}\n` +
        `• When: ${now}\n` +
        `• UA: ${ua}`;

      if (body.RefImage) {
        embeds = [{ title: 'Reference', image: { url: body.RefImage } }];
      }
    } else {
      return res.status(400).json({ ok: false, error: 'Unknown payload Type' });
    }

    const payload = { content, embeds };
    const r = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!r.ok) throw new Error(`Discord webhook failed (${r.status})`);
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || 'Unknown error' });
  }
}
