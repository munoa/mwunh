import { useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState(null); // 'ok' | 'error' | null
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch('https://formspree.io/f/mandkygv', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setStatus('ok');
        form.reset();
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16 relative">
      {/* Glow blobs */}
      <div className="pointer-events-none absolute -top-32 -left-20 h-72 w-72 rounded-full blur-3xl opacity-25 bg-gradient-to-br from-purple-500 to-emerald-400"></div>
      <div className="pointer-events-none absolute bottom-[-60px] right-[-40px] h-80 w-80 rounded-full blur-3xl opacity-25 bg-gradient-to-br from-fuchsia-500 to-cyan-400"></div>

      <div className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl">
        <div className="p-8 md:p-10">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Demande de miniature</h1>
            <p className="text-sm text-zinc-300 mt-2">
              Dis-moi ce que tu veux et je reviens avec des propositions 🔥
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
  <div>
    <label className="text-sm text-zinc-300">Identité (qui êtes-vous ?)</label>
    <input
      name="Identité"
      type="text"
      required
      className="mt-1 w-full rounded-xl bg-black/40 border border-white/15 px-4 py-3 outline-none focus:ring-2 focus:ring-white/30 placeholder-zinc-400"
      placeholder="Nom / Pseudo / Chaîne YouTube"
    />
  </div>

  <div>
    <label className="text-sm text-zinc-300">Titre de la vidéo (ou sujet)</label>
    <input
      name="Titre"
      type="text"
      required
      className="mt-1 w-full rounded-xl bg-black/40 border border-white/15 px-4 py-3 outline-none focus:ring-2 focus:ring-white/30 placeholder-zinc-400"
      placeholder="Ex: 100 jours sur Cobblemon"
    />
  </div>

  <div>
    <label className="text-sm text-zinc-300">Brief / détails</label>
    <textarea
      name="Brief"
      rows="5"
      required
      className="mt-1 w-full rounded-2xl bg-black/40 border border-white/15 px-4 py-3 outline-none focus:ring-2 focus:ring-white/30 placeholder-zinc-400"
      placeholder="Style, éléments à mettre, contraintes de texte, couleurs, références, etc."
    ></textarea>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="text-sm text-zinc-300">Liens utiles</label>
      <input
        name="Liens"
        type="url"
        className="mt-1 w-full rounded-xl bg-black/40 border border-white/15 px-4 py-3 outline-none focus:ring-2 focus:ring-white/30 placeholder-zinc-400"
        placeholder="Drive, références, vidéo…"
      />
    </div>
    <div>
      <label className="text-sm text-zinc-300">Deadline</label>
      <input
        name="Deadline"
        type="date"
        className="mt-1 w-full rounded-xl bg-black/40 border border-white/15 px-4 py-3 outline-none focus:ring-2 focus:ring-white/30 placeholder-zinc-400"
      />
    </div>
  </div>

  <button
    type="submit"
    className="w-full rounded-xl bg-gradient-to-r from-zinc-100/80 to-white/90 text-black font-semibold py-3 mt-6 hover:scale-[1.02] transition-transform"
  >
    Envoyer
  </button>
</form>
        </div>
      </div>
    </main>
  );
}
