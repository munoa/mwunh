import { useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState(null); // 'ok' | 'error' | null
  const [loading, setLoading] = useState(false);
  const [links, setLinks] = useState(['']); // dynamic links inputs

  function addLink() {
    setLinks((prev) => [...prev, '']);
  }
  function updateLink(i, val) {
    setLinks((prev) => prev.map((v, idx) => (idx === i ? val : v)));
  }
  function removeLink(i) {
    setLinks((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const form = e.currentTarget;
    const fd = new FormData(form);

    // Collect all fields except Liens[] and rebuild JSON
    const data = {};
    fd.forEach((value, key) => {
      if (key !== 'Liens[]') data[key] = value;
    });
    const multiLinks = links.map(l => l.trim()).filter(Boolean);
    if (multiLinks.length) {
      data['Liens'] = multiLinks.join(', ');
    }

    try {
      const res = await fetch('https://formspree.io/f/mandkygv', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setStatus('ok');
        form.reset();
        setLinks(['']);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16 relative">
      <div className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
        {loading && <div className="progress" />}
        <div className="p-8 md:p-10">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold tracking-tight">Demande de miniature</h1>
            <p className="text-sm text-zinc-300 mt-2">
              Décris ta demande, je reviens avec des propositions 🔥
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="text-sm text-zinc-300">Identité (qui êtes‑vous ?)</label>
              <input name="Identité" type="text" required
                className="mt-1 w-full rounded-xl bg-black/40 border border-white/15 px-4 py-3 outline-none focus:ring-2 focus:ring-white/30 placeholder-zinc-400"
                placeholder="Nom / Pseudo / Chaîne YouTube" />
            </div>

            <div>
              <label className="text-sm text-zinc-300">Titre de la vidéo (ou sujet)</label>
              <input name="Titre" type="text" required
                className="mt-1 w-full rounded-xl bg-black/40 border border-white/15 px-4 py-3 outline-none focus:ring-2 focus:ring-white/30 placeholder-zinc-400"
                placeholder="Ex: 100 jours sur Cobblemon" />
            </div>

            <div>
              <label className="text-sm text-zinc-300">Brief / détails</label>
              <textarea name="Brief" rows="5" required
                className="mt-1 w-full rounded-2xl bg-black/40 border border-white/15 px-4 py-3 outline-none focus:ring-2 focus:ring-white/30 placeholder-zinc-400"
                placeholder="Style, éléments à mettre, contraintes de texte, couleurs, références, etc."></textarea>
            </div>

            {/* Multiple links */}
            <div>
              <label className="text-sm text-zinc-300">Liens utiles (plusieurs possibles)</label>
              <div className="space-y-3 mt-1">
                {links.map((val, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      name="Liens[]"
                      type="url"
                      value={val}
                      onChange={(e) => updateLink(i, e.target.value)}
                      className="flex-1 rounded-xl bg-black/40 border border-white/15 px-4 py-3 outline-none focus:ring-2 focus:ring-white/30 placeholder-zinc-400"
                      placeholder="https://..."
                    />
                    {links.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLink(i)}
                        className="px-3 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 transition"
                        aria-label="Supprimer ce lien"
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
                  + Ajouter un autre lien
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-zinc-300">Deadline</label>
                <input name="Deadline" type="date"
                  className="mt-1 w-full rounded-xl bg-black/40 border border-white/15 px-4 py-3 outline-none focus:ring-2 focus:ring-white/30 placeholder-zinc-400" />
              </div>
              <div className="opacity-0 pointer-events-none">
                <input tabIndex={-1} aria-hidden="true" className="hidden" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl px-6 py-3 font-semibold bg-white text-black shadow-lg hover:shadow-white/20 hover:scale-[1.01] transition active:scale-[.99] disabled:opacity-60 relative"
            >
              <span className={loading ? 'opacity-0' : 'opacity-100'}>Envoyer ✨</span>
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
              <p className="text-emerald-400 text-sm pt-1">Merci ! Ta demande a bien été envoyée ✅</p>
            )}
            {status === 'error' && (
              <p className="text-red-400 text-sm pt-1">Oups, impossible d&apos;envoyer. Réessaie plus tard.</p>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
