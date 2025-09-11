// pages/[client].js — Gallery + Fake YouTube + Lightbox for selected image
// EN default + flags + persisted lang, hide gif on mobile
import { useEffect, useMemo, useState } from 'react';
import fs from 'fs';
import path from 'path';

export async function getServerSideProps({ params }) {
  const { client } = params;

  try {
    const dir = path.join(process.cwd(), 'public', 'clients', client);
    if (!fs.existsSync(dir)) return { notFound: true };

    const clientFiles = fs.readdirSync(dir);
    const images = clientFiles
      .filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f))
      .sort()
      .map((f) => `/clients/${client}/${f}`);
    if (!images.length) return { notFound: true };

    // Pool for fake YouTube
    const libDir = path.join(process.cwd(), 'public', 'ytpool');
    let libImages = [];
    if (fs.existsSync(libDir)) {
      const libFiles = fs.readdirSync(libDir);
      libImages = libFiles
        .filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f))
        .map((f) => `/ytpool/${f}`);
    }

    return { props: { slug: client, images, libImages } };
  } catch {
    return { notFound: true };
  }
}

export default function ClientPreview({ slug, images, libImages }) {
  // Lang (EN default) + persistence
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
      comment: 'Votre feedback sur la miniature sélectionnée',
      send: 'Envoyer le feedback',
      ok: 'Merci ! Feedback envoyé.',
      err: "Oups, échec de l’envoi.",
      gallery: 'Galerie',
      ytMock: 'Aperçu style YouTube (fake 4×3)',
      mockNote: "Aperçu local simulé — ce n'est pas YouTube.",
      viewLarge: 'Voir en grand',
      close: 'Fermer'
    },
    en: {
      title: `Preview – ${slug}`,
      tip: 'Click an image to set it as reference.',
      comment: 'Your feedback on the selected thumbnail',
      send: 'Send feedback',
      ok: 'Thanks! Feedback sent.',
      err: 'Oops, failed to send.',
      gallery: 'Gallery',
      ytMock: 'YouTube-style preview (fake 4×3)',
      mockNote: 'Local simulated preview — this is not YouTube.',
      viewLarge: 'View larger',
      close: 'Close'
    }
  }[lang];

  const [refImage, setRefImage] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'ok' | 'err' | null
  const [tab, setTab] = useState('gallery'); // 'gallery' | 'yt'
  const [lightboxSrc, setLightboxSrc] = useState(null);

  // Close lightbox on ESC
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setLightboxSrc(null);
    }
    if (lightboxSrc) {
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
  }, [lightboxSrc]);

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

  // ------- Fake YouTube helpers (seeded random for SSR/CSR consistency) -------
  const selectedRef = refImage || images[0];

  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0) / 4294967296;
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function seededRng(seedStr) {
    const a = Math.floor(hashStr(seedStr) * 1e9);
    return mulberry32(a);
  }
  function sampleK(pool, k, rng) {
    const arr = [...pool];
    for (let i = 0; i < Math.min(k, arr.length); i++) {
      const j = i + Math.floor(rng() * (arr.length - i));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    let out = arr.slice(0, Math.min(k, arr.length));
    while (out.length < k && pool.length) {
      out.push(pool[out.length % pool.length]);
    }
    return out;
  }

  const ytGrid = useMemo(() => {
    const pool = (libImages && libImages.length ? libImages : images).filter(Boolean);
    const seed = `${slug}|${selectedRef}|${pool.length}`;
    const rng = seededRng(seed);

    const eleven = sampleK(pool, 11, rng);
    const insertAt = Math.floor(rng() * 12);
    const twelve = [...eleven];
    twelve.splice(insertAt, 0, selectedRef);
    return twelve.slice(0, 12);
  }, [slug, selectedRef, libImages, images]);
  // ---------------------------------------------------------------------------

  // Fake YouTube UI
  const TopBar = () => (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded bg-red-500" />
        <div className="h-4 w-24 bg-white/30 rounded" />
      </div>
      <div className="flex-1 max-w-md mx-4">
        <div className="h-8 bg-white/10 rounded-3xl border border-white/10" />
      </div>
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-white/15 border border-white/10" />
        <div className="w-6 h-6 rounded-full bg-white/15 border border-white/10" />
        <div className="w-7 h-7 rounded-full bg-white/20 border border-white/10" />
      </div>
    </div>
  );

  // Minified meta row (no extra right dot)
  const YTCard = ({ src }) => (
    <div className="rounded-2xl overflow-hidden border border-white/10">
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
        <img src={src} alt="mock" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute bottom-2 right-2 text-[10px] px-1.5 py-0.5 rounded bg-black/70 text-white/90">
          12:34
        </div>
      </div>
      <div className="px-3 py-2 flex gap-2">
        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10" />
        <div className="flex-1 pt-0.5">
          <div className="h-3.5 w-5/6 bg-white/20 rounded mb-1.5" />
          <div className="h-2.5 w-1/2 bg-white/10 rounded" />
        </div>
      </div>
    </div>
  );

  const YTFeed = () => (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/30">
      <TopBar />
      <div className="p-4 grid grid-cols-4 gap-4">
        {ytGrid.map((src, i) => (
          <YTCard key={`${src}-${i}`} src={src} />
        ))}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16 relative">
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[560px] w-[560px] rounded-full blur-3xl opacity-[0.10] bg-white" />
      </div>

      {/* Gif (hidden on mobile) */}
      <img src="/snorlax.gif" alt="" className="hidden md:block fixed bottom-4 right-4 w-16 h-16 opacity-75 pointer-events-none" />

      <div className="relative w-full max-w-5xl rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl shadow-black/50 ring-1 ring-white/5 overflow-hidden">
        {/* Lang toggle with flags */}
        <div className="absolute right-3 top-3 z-10">
          <button
            type="button"
            onClick={toggleLang}
            className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/15 backdrop-blur-md hover:bg-white/20 transition flex items-center gap-2"
            aria-label="Switch language"
            title="Switch language"
          >
            {/* FR flag */}
            <span className="inline-flex w-4 h-3 overflow-hidden rounded-[2px] ring-1 ring-white/30">
              <svg viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg">
                <rect width="1" height="2" x="0" y="0" fill="#0055A4" />
                <rect width="1" height="2" x="1" y="0" fill="#ffffff" />
                <rect width="1" height="2" x="2" y="0" fill="#EF4135" />
              </svg>
            </span>
            <span className="text-[11px] tracking-wide">{lang === 'fr' ? 'FR' : 'EN'}</span>
            {/* EN (UK) flag */}
            <span className="inline-flex w-4 h-3 overflow-hidden rounded-[2px] ring-1 ring-white/30">
              <svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
                <rect width="60" height="40" fill="#0A17A7" />
                <path d="M0,0 60,40 M60,0 0,40" stroke="#ffffff" strokeWidth="8"/>
                <path d="M0,0 60,40 M60,0 0,40" stroke="#CF142B" strokeWidth="4"/>
                <rect x="26" width="8" height="40" fill="#ffffff"/>
                <rect y="16" width="60" height="8" fill="#ffffff"/>
                <rect x="27.5" width="5" height="40" fill="#CF142B"/>
                <rect y="17.5" width="60" height="5" fill="#CF142B"/>
              </svg>
            </span>
          </button>
        </div>

        <div className="p-8 md:p-10">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{t.title}</h1>
          <p className="text-sm text-zinc-300 mt-2">{t.tip}</p>

          {/* Tabs */}
          <div className="mt-6 mb-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTab('gallery')}
              className={`px-3 py-1.5 rounded-full text-xs border transition ${
                tab === 'gallery' ? 'bg-white text-black border-white' : 'bg-white/10 text-white border-white/15 hover:bg-white/20'
              }`}
            >
              {t.gallery}
            </button>
            <button
              type="button"
              onClick={() => setTab('yt')}
              className={`px-3 py-1.5 rounded-full text-xs border transition ${
                tab === 'yt' ? 'bg-white text-black border-white' : 'bg-white/10 text-white border-white/15 hover:bg-white/20'
              }`}
            >
              {t.ytMock}
            </button>
          </div>

          {/* Content */}
          {tab === 'gallery' ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {images.map((url, i) => {
                const selected = refImage === url;
                return (
                  <div
                    key={i}
                    onClick={() => setRefImage(url)}
                    className={`group relative rounded-xl overflow-hidden border bg-black/40 transition cursor-pointer
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
                      <>
                        <div className="absolute left-2 top-2 text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-200 backdrop-blur border border-emerald-400/50">
                          {t.selected}
                        </div>
                        {/* view larger button under the selected image */}
                        <div className="border-t border-white/10 bg-black/30 p-3">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setLightboxSrc(url); }}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-black hover:scale-[1.02] active:scale-[.98] transition shadow"
                          >
                            {t.viewLarge}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              <YTFeed />
              <p className="text-[11px] text-zinc-400 mt-2">{t.mockNote}</p>
            </>
          )}

          {/* Feedback form */}
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

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxSrc(null)}
        >
          <div className="relative max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setLightboxSrc(null)}
              className="absolute -top-3 -right-3 md:top-2 md:right-2 h-9 w-9 rounded-full bg-white text-black text-lg font-bold shadow hover:scale-105 active:scale-95 transition"
              aria-label={t.close}
              title={t.close}
            >
              ×
            </button>
            <img
              src={lightboxSrc}
              alt="preview large"
              className="w-full h-auto rounded-xl border border-white/10 shadow-2xl"
            />
          </div>
        </div>
      )}
    </main>
  );
}
