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
    const { Decision, Name, Comment, ImageURL } = req.body || {};
    const ua = req.headers['user-agent'] || '';
    const now = new Date().toISOString();

    const content =
      `**New thumbnail feedback**\n` +
      `• Decision: **${Decision || '—'}**\n` +
      `• Name: ${Name || '—'}\n` +
      `• Comment: ${Comment || '—'}\n` +
      `• Image: ${ImageURL || '—'}\n` +
      `• When: ${now}\n` +
      `• UA: ${ua}`;

    const payload = {
      content,
      embeds: ImageURL ? [{
        title: 'Preview',
        image: { url: ImageURL },
      }] : undefined,
    };

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
