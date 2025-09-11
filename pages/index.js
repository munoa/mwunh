import { useEffect, useState } from 'react';

export default function Home() {
  // --- Lang toggle (FR / EN) — EN by default ---
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

  // --- Preview(s) from query ?img=... or ?imgs=url1,url2 ---
  const [previews, setPreviews] = useState([]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    const single = sp.get('img');
    const many = sp.get('imgs');
    if (single) setPreviews([decodeURIComponent(single)]);
    else if (many) {
      setPreviews(
        many
          .split(',')
          .map((u) => decodeURIComponent(u.trim()))
          .filter(Boolean)
      );
    }
  }, []);

  // --- Texts (no emojis) ---
  const t = {
    fr: {
      title: 'Demande de miniature',
      subtitle: 'Décris ta demande, je reviens avec des propositions.',
      identity: 'Identité (qui êtes-vous ?)',
      identity_ph: 'Nom / Pseudo / Chaîne YouTube',
      contact: 'Contact (si je ne l’ai pas déjà)',
      contact_ph: 'Discord, e-mail, X…',
      video: 'Titre de la vidéo (ou sujet)',
      video_ph: 'Ex: 100 jours sur Subnautica',
      brief: 'Brief / détails',
      brief_ph:
        'Style, éléments à mettre, contraintes de texte, couleurs, références, etc.',
      links: 'Liens utiles (plusieurs possibles)',
      add_link: '+ Ajouter un autre lien',
      deadline: 'Deadline (s’il y en a une)',
      send: 'Envoyer',
      sending: 'Envoi…',
      ok: 'Merci ! Ta demande a bien été envoyée.',
      err: "Oups, l’envoi a échoué. Réessaie plus tard.",
      reqWord: 'obligatoire',
      // review
      review_title: 'Proposition(s) de miniature',
      review_name: 'Votre nom (optionnel)',
      review_comment: 'Votre avis',
      review_like: 'J’aime',
      review_dislike: "Je n’aime pas",
      review_send: 'Envoyer l’avis',
      review_ok: 'Avis reçu. Merci !',
      review_fail: "Échec de l’envoi."
    },
    en: {
      title: 'Thumbnail request',
      subtitle: 'Describe what you need, I’ll come back with proposals.',
      identity: 'Identity (who are you?)',
      identity_ph: 'Name / Alias / YouTube channel',
      contact: 'Contact (if I don’t already have it)',
      contact_ph: 'Discord, email, X…',
      video: 'Video title (or topic)',
      video_ph: '100 days on Subnautica',
      brief: 'Brief / details',
      brief_ph:
        'Style, elements to include, text constraints, colors, references, etc.',
      links: 'Useful links (multiple)',
      add_link: '+ Add another link',
      deadline: 'Deadline (if there is)',
      send: 'Send',
      sending: 'Sending…',
      ok: 'Thanks! Your request has been sent.',
      err: 'Oops, failed to send. Please try again later.',
      reqWord: 'required',
      // review
      review_title: 'Thumbnail proposal(s)',
      review_name: 'Your name (optional)',
      review_comment: 'Your feedback',
      review_like: 'Like',
      review_dislike: 'Dislike',
      review_send: 'Send feedback',
      review_ok: 'Feedback sent. Thanks!',
      review_fail: 'Failed to send.'
    }
  }[lang];

  // helper for required asterisk (red) + accessible text
  const Req = () => (
    <>
      <span className="text-red-500 ml-1" aria-hidden="true">*</span>
      <span className="sr-only"> {t.reqWord}</span>
    </>
  );

  // --- Form state ---
  const [status, setStatus] = useState(null); // 'ok' | 'error' | null
  const [loading, setLoading] = useState(false);
  const [links, setLinks] = useState(['']);

  function addLink() {
    setLinks(prev => [...prev, '']);
  }
  function updateLink(i, val) {
    setLinks(prev => prev.map((v, idx) => (idx === i ? val : v)));
  }
  function removeLink(i) {
    setLinks(prev => prev.filter((_, idx) => idx !== i));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const form = e.currentTarget;
    const fd = new FormData(form);

    const data = {};
    fd.forEach((value, key) => {
      if (key !== 'Liens[]') data[key] = value;
    });
    const multiLinks = links.map(l => l.trim()).filter(Boolean);
    if (multiLinks.length) data['Liens'] = multiLinks.join(', ');

    try {
      const res = await fetch('https://formspree.io/f/mandkygv', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setStatus('ok');
        form.reset();
        setLinks(['']);
      } else setStatus('error');
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }

  // --- Send review (like / dislike / comment) for one preview -> to /api/review (Discord webhook behind)
  const [reviewState, setReviewState] = useState({}); // { idx: {loading, ok, err} }
  async function sendReview(idx, decision, name, comment, imageUrl) {
    setReviewState((s) => ({ ...s, [idx]: { loading: true, ok: false, err: false } }));
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Decision: decision,
          Name: name,
          Comment: comment,
          ImageURL: imageUrl
        })
      });
      if (res.ok) {
        setReviewState((s) => ({ ...s, [idx]: { loading: false, ok: true, err: false } }));
      } else {
        setReviewState((s) => ({ ...s, [idx]: { loading: false, ok: false, err: true } }));
      }
    } catch {
      setReviewState((s) => ({ ...s, [idx]: { loading: false, ok: false, err: true } }));
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16 relative">
      {/* Soft white glow behind the card (B&W) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[560px] w-[560px] rounded-full blur-3xl opacity-[0.10] bg-white" />
      </div>

      {/* Bottom-right gif */}
      <img
        src="/snorlax.gif"
        alt=""
        className="fixed bottom-4 right-4 w-16 h-16 opacity-75 pointer-events-none"
      />

      {/* Card (glass) */}
      <div className="relative w-full max-w-4xl rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl shadow-black/50 ring-1 ring-white/5 overflow-hidden">
        {loading && <div className="progress" />}

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
          {/* PREVIEW SECTION (only if query has img/imgs) */}
          {previews.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-semibold mb-4">{t.review_title}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {previews.map((url, idx) => (
                  <PreviewCard
                    key={idx}
                    idx={idx}
                    url={url}
                    t={t}
                    state={reviewState[idx] || { loading: false, ok: false, err: false }}
                    onSend={sendReview}
                  />
                ))}
              </div>
              <hr className="border-white/10 my-8" />
            </section>
          )}

          {/* REQUEST FORM */}
          <div className="mb-6">
            <h1 className="text-3xl font-semibold tracking-tight drop-shadow-[0_1px_0_rgba(255,255,255,0.15)]">
              {t.title}
            </h1>
            <p className="text-sm text-zinc-300 mt-2">{t.subtitle}</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="text-sm text-zinc-300 flex items-center">
                {t.identity} <Req />
              </label>
              <input
                name="Identité"
                type="text"
                required
                placeholder={t.identity_ph}
                className="mt-1 w-full rounded-xl bg-black/40 border border-white/15 px-4 py-3 outline-none focus:ring-4 focus:ring-white/20 focus:border-white/30 placeholder-zinc-500 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]"
              />
            </div>

            {/* Contact (optional) */}
            <div>
              <label className="text-sm text-zinc-300">{t.contact}</label>
              <input
                name="Contact"
                type="text"
                placeholder={t.contact_ph}
                className="mt-1 w-full rounded-xl bg-black/40 border border-white/15 px-4 py-3 outline-none focus:ring-4 focus:ring-white/20 focus:border-white/30 placeholder-zinc-500 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-300 flex items-center">
                {t.video} <Req />
              </label>
              <input
                name="Titre"
                type="text"
                required
                placeholder={t.video_ph}
                className="mt-1 w-full rounded-xl bg-black/40 border border-white/15 px-4 py-3 outline-none focus:ring-4 focus:ring-white/20 focus:border-white/30 placeholder-zinc-500 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-300 flex items-center">
                {t.brief} <Req />
              </label>
              <textarea
                name="Brief"
                rows="5"
                required
                placeholder={t.brief_ph}
                className="mt-1 w-full rounded-2xl bg-black/40 border border-white/15 px-4 py-3 outline-none focus:ring-4 focus:ring-white/20 focus:border-white/30 placeholder-zinc-500 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]"
              ></textarea>
            </div>

            {/* Multiple links */}
            <div>
              <label className="text-sm text-zinc-300">{t.links}</label>
              <div className="space-y-3 mt-1">
                {links.map((val, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      name="Liens[]"
                      type="url"
                      value={val}
                      onChange={e => updateLink(i, e.target.value)}
                      placeholder="https://..."
                      className="flex-1 rounded-xl bg-black/40 border border-white/15 px-4 py-3 outline-none focus:ring-4 focus:ring-white/20 focus:border-white/30 placeholder-zinc-500 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]"
                    />
                    {links.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLink(i)}
                        className="px-3 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 transition"
                        aria-label="Remove link"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addLink}
                  className="text-sm text-zinc-300 hover:text-white transition"
                >
                  {t.add_link}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-zinc-300">{t.deadline}</label>
                <input
                  name="Deadline"
                  type="date"
                  className="mt-1 w-full rounded-xl bg-black/40 border border-white/15 px-4 py-3 outline-none focus:ring-4 focus:ring-white/20 focus:border-white/30 placeholder-zinc-500 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]"
                />
              </div>
              <div className="opacity-0 pointer-events-none">
                <input tabIndex={-1} aria-hidden="true" className="hidden" />
              </div>
            </div>

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

            {status === 'ok' && (
              <p className="text-emerald-400/90 text-sm pt-1">{t.ok}</p>
            )}
            {status === 'error' && (
              <p className="text-red-400/90 text-sm pt-1">{t.err}</p>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}

/* ---- Preview card component ---- */
function PreviewCard({ idx, url, t, onSend, state }) {
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4 shadow-lg shadow-black/30">
      <a href={url} target="_blank" rel="noreferrer" className="block">
        <div className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-black/40">
          <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
            <img
              src={url}
              alt="thumbnail preview"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </a>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onSend(idx, 'like', name, comment, url)}
          className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 hover:bg-white/20 transition"
          disabled={state.loading}
        >
          {t.review_like}
        </button>
        <button
          type="button"
          onClick={() => onSend(idx, 'dislike', name, comment, url)}
          className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 hover:bg-white/20 transition"
          disabled={state.loading}
        >
          {t.review_dislike}
        </button>
      </div>

      <div className="mt-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.review_name}
          className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2 outline-none focus:ring-4 focus:ring-white/15 placeholder-zinc-500"
        />
      </div>
      <div className="mt-2">
        <textarea
          rows="3"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t.review_comment}
          className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2 outline-none focus:ring-4 focus:ring-white/15 placeholder-zinc-500"
        />
      </div>

      <div className="mt-3">
        <button
          type="button"
          onClick={() => onSend(idx, 'comment', name, comment, url)}
          className="w-full rounded-lg bg-white text-black px-4 py-2 font-semibold hover:shadow-white/30 hover:scale-[1.01] transition disabled:opacity-60"
          disabled={state.loading}
        >
          {t.review_send}
        </button>
        {state.ok && <p className="text-emerald-400/90 text-sm pt-2">{t.review_ok}</p>}
        {state.err && <p className="text-red-400/90 text-sm pt-2">{t.review_fail}</p>}
      </div>
    </div>
  );
}
