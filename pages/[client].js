// pages/[client].js  — SSR + preview + bookmarklet
import { useEffect, useMemo, useState } from 'react';
import fs from 'fs';
import path from 'path';

export async function getServerSideProps({ params }) {
  const { client } = params;

  try {
    const dir = path.join(process.cwd(), 'public', 'clients', client);
    if (!fs.existsSync(dir)) return { notFound: true };

    const files = fs.readdirSync(dir);
    const images = files
      .filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f))
      .sort()
      .map((f) => `/clients/${client}/${f}`);

    if (!images.length) return { notFound: true };

    return { props: { slug: client, images } };
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
      tip: 'Clique sur une image pour la définir comme référence.',
      selected: 'Image de référence',
      comment: 'Votre feedback',
      send: 'Envoyer le feedback',
      ok: 'Merci ! Feedback envoyé.',
      err: "Oups, échec de l’envoi.",
      ytMock: 'Aperçu style YouTube (mock)',
      openYT: 'Ouvrir YouTube',
      bmHelp: 'Glisse ce lien dans ta barre de favoris puis clique-le sur YouTube',
      bmText: 'Remplacer une miniature aléatoire (bookmarklet)'
    },
    en: {
      title: `Preview – ${slug}`,
      tip: 'Click an image to set it as reference.',
      selected: 'Reference image',
      comment: 'Your feedback',
      send: 'Send feedback',
      ok: 'Thanks! Feedback sent.',
      err: 'Oops, failed to send.',
      ytMock: 'YouTube-style preview (mock)',
      openYT: 'Open YouTube',
      bmHelp: 'Drag this link to your bookmarks bar, then click it on YouTube',
      bmText: 'Swap a random thumbnail (bookmarklet)'
    }
  }[lang];

  const [refImage, setRefImage] = useState('');
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

  // Bookmarklet qui remplacera une miniature aléatoire sur youtube.com.
  // Astuce sécurité navigateur : on doit l'ajouter aux favoris puis le cliquer depuis YouTube.
  const bookmarkletHref = useMemo(() => {
    const encoded = encodeURIComponent(refImage || '');
    const code = `
(function(){
  try{
    var u='${encoded}'; u=decodeURIComponent(u);
    if(!/^https?:/i.test(u)){ u = prompt('Image URL to inject', u)||''; }
    if(!u) return;
    var sel=[].slice.call(document.querySelectorAll('ytd-thumbnail img, img#thumbnail, a#thumbnail img'));
    sel = sel.filter(function(i){ return i && i.width>=120; });
    if(sel.length===0){ alert('No thumbnails found'); return; }
    var i = sel[Math.floor(Math.random()*sel.length)];
    i.src = u; i.srcset=''; i.removeAttribute('srcset'); i.style.objectFit='cover';
    var card = i.closest('ytd-rich-item-renderer')||i.closest('ytd-grid-video-renderer')||i.closest('ytd-compact-video-renderer');
    if(card){ card.style.outline='4px solid #10b981'; card.style.borderRadius='12px'; }
    alert('Thumbnail swapped!');
  }catch(e){ alert('Failed: '+e); }
})();`;
    return 'javascript:' + encodeURIComponent(code);
  }, [refImage]);

  // Petit mock "YouTube" local (pas de CORS) pour visualiser l’intégration
  const MockCard = () => (
    <div className="rounded-2xl overflow-hidden bg-black/50 border border-white/10">
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
        <img
          src={refImage || images[0]}
          alt="mock"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <div className="p-3 flex gap-3">
        <div className="w-9 h-9 rounded-full bg-white/10 border border-white/10" />
        <div className="flex-1">
          <div className="h-4 w-5/6 bg-white/20 rounded mb-2" />
          <div className="h-3 w-3/5 bg-white/10 rounded" />
        </div>
      </div>
    </div>
  );

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
            {images.map((url, i) => {
              const selected = refImage === url;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRefImage(url)}
                  className={`group relative rounded-xl overflow-hidden border bg-black/40 transition
                    ${selected ? 'border-emerald-400/80 shadow-[0_0_0_3px_rgba(16,185,129,0.55)]' : 'border-white/10 hover:border-white/20'}`}
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
                  {selected && (
                    <div className="absolute left-2 top-2 text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-200 backdrop-blur border border-emerald-400/50">
                      {t.selected}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* YouTube-style mock + bookmarklet helper */}
          <div className="mt-10">
            <div className="flex items-center justify-between gap-4 mb-3">
              <h2 className="text-sm text-zinc-300">{t.ytMock}</h2>
              <div className="flex items-center gap-3">
                <a
                  href="https://www.youtube.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs px-3 py-1 rounded-full bg-white text-black hover:opacity-90 transition"
                >
                  {t.openYT}
                </a>
                <a
                  href={bookmarkletHref}
                  className="text-[11px] px-3 py-1 rounded-full bg-white/10 border border-white/15 hover:bg-white/20 transition"
                  title={t.bmHelp}
                  draggable
                >
                  {t.bmText}
                </a>
              </div>
            </div>
            <MockCard />
            <p className="text-[11px] text-zinc-400 mt-2">{t.bmHelp}.</p>
          </div>

          {/* Feedback form (no name field) */}
          <form onSubmit={submitFeedback} className="mt-8 space-y-4">
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
                    <path className="opacity-75" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="currentColor"></path>
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
