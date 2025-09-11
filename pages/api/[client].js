// pages/[client].js
import { useEffect, useState } from 'react';

export async function getStaticPaths() {
  // Pas de paths connus à l'avance -> génération à la demande
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const { client } = params;
  const fs = (await import('fs')).default;
  const path = (await import('path')).default;

  try {
    const dir = path.join(process.cwd(), 'public', 'clients', client);
    const files = fs.readdirSync(dir);
    const images = files
      .filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f))
      .sort()
      .map((f) => `/clients/${client}/${f}`);

    if (!images.length) return { notFound: true };

    return {
      props: { slug: client, images },
      // Revalidé régulièrement (ISR)
      revalidate: 60
    };
  } catch {
    return { notFound: true };
  }
}

export default function ClientPreview({ slug, images }) {
  // Lang toggle (EN default)
  const [lang, setLang] = useState('en');
  useEffect(() => {
    const saved = typeof window !== 'undefined' && localStorage.getItem('lang');
    if (saved === 'en' || saved === 'fr') setLang(saved);
  }, []);
  function toggleLang() {
    const next = lang === 'fr' ? 'en' : 'fr';
    setLang(next);
    if (typeof window !== 'undefined') localStorage.setItem('lang', next);
  }

  const t = {
    fr: {
      title: `Preview – ${slug}`,
      tip: 'Clique sur une image pour la définir comme référence (optionnel).',
      selected: 'Image de référence',
      name: 'Votre nom (optionnel)',
      comment: 'Votre feedback',
      send: 'Envoyer le feedback',
      ok: 'Merci ! Feedback envoyé.',
      err: "Oups, échec de l’envoi."
    },
    en: {
      title: `Preview – ${slug}`,
      tip: 'Click an image to set it as reference (optional).',
      selected: 'Reference image',
      name: 'Your name (optional)',
      comment: 'Your feedback',
      send: 'Send feedback',
      ok: 'Thanks! Feedback sent.',
      err: 'Oops, failed to send.'
    }
  }[lang];

  const [refImage, setRefImage] = useState('');
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'ok' | 'err' | null

  async function submitFeedback(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const r = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Type: 'PreviewFeedback',
          Slug: slug,
          Name: name,
          Comment: comment,
          RefImage: refImage || ''
        })
      });
      setStatus(r.ok ? 'ok' : 'err');
      if (r.ok) setComment('');
    } catch {
      setStatus('err');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16 relative">
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[560px] w-[560px] rounded-full blur-3xl opacity-[0.10] bg-white" />
      </div>

      {/* Gif */}
      <img src="/snorlax.gif" alt="" className="fixed bottom-4 right-4 w-16 h-16 opacity-75 pointer-events-none" />

      <div className="relative w-full max-w-5xl rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl shadow-black/50 ring-1 ring-white/5 overflow-hidden">
        {/* Lang toggle */}
        <div className="absolute right-3 top-3 z-10">
          <button
            type="button"
            onClick={toggleLang}
            className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/15 backdrop-blur-md hover:bg-white/20 transition"
            aria-label="Switch language"
            title="Switch language"
          >
            {lang === 'fr' ? 'FR' : 'EN'}
          </button>
        </div>

        <div className="p-8 md:p-10">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{t.title}</h1>
          <p className="text-sm text-zinc-300 mt-2">{t.tip}</p>

          {/* Grid images */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {images.map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRefImage(url)}
                className={`group relative rounded-xl overflow-hidden border ${refImage === url ? 'border-white/70' : 'border-white/10'} bg-black/40`}
                title="Set as reference"
              >
                <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                  <img
                    src={url}
                    alt={`preview ${i + 1}`}
                    className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                </div>
                {refImage === url && (
                  <div className="absolute left-2 top-2 text-xs px-2 py-1 rounded bg-white/20 backdrop-blur border border-white/30">
                    {t.selected}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Feedback form */}
          <form onSubmit={submitFeedback} className="mt-8 space-y-4">
            <div>
              <label className="text-sm text-zinc-300">{t.name}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl bg-black/40 border border-white/15 px-4 py-3 outline-none focus:ring-4 focus:ring-white/20"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-300"> {t.comment} </label>
              <textarea
                required
                rows="4"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-1 w-full rounded-xl bg-black/40 border border-white/15 px-4 py-3 outline-none focus:ring-4 focus:ring-white/20"
              />
            </div>

            {refImage && (
              <p className="text-xs text-zinc-400 break-all">
                {t.selected}: <span className="text-zinc-200">{refImage}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="relative w-full rounded-2xl px-6 py-3 font-semibold bg-white text-black shadow-lg hover:shadow-white/30 hover:scale-[1.01] transition active:scale-[.99] disabled:opacity-60"
            >
              <span className="pointer-events-none absolute inset-0 rounded-2xl shadow-[0_0_45px_rgba(255,255,255,0.12)]" />
              <span className={loading ? 'opacity-0' : 'opacity-100'}>{t.send}</span>
              {loading && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" d="M4 12a 8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="currentColor"></path>
                  </svg>
                </span>
              )}
            </button>

            {status === 'ok' && <p className="text-emerald-400/90 text-sm">{t.ok}</p>}
            {status === 'err' && <p className="text-red-400/90 text-sm">{t.err}</p>}
          </form>
        </div>
      </div>
    </main>
  );
}
