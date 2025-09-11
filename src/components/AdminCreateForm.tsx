"use client";

import { useState } from "react";

export default function AdminCreateForm() {
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [imagesRaw, setImagesRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdLink, setCreatedLink] = useState<string | null>(null);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setCreatedLink(null);

    const images = imagesRaw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        const [title, imageUrl] = line.includes("|") ? line.split("|") : ["Proposition", line];
        return { title: title.trim(), imageUrl: imageUrl.trim() };
      });

    const res = await fetch("/api/project", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, clientName, images }),
    });

    const data = await res.json();
    setLoading(false);
    if (data?.project?.token) setCreatedLink(`${location.origin}/p/${data.project.token}`);
  }

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">Créer un projet</h2>
      <form onSubmit={onCreate} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">Nom du projet
            <input className="mt-1 w-full rounded-lg border p-2" value={name} onChange={(e)=>setName(e.target.value)} required />
          </label>
          <label className="block">Nom du client
            <input className="mt-1 w-full rounded-lg border p-2" value={clientName} onChange={(e)=>setClientName(e.target.value)} required />
          </label>
        </div>
        <label className="block">Images (une par ligne)
          <textarea
            className="mt-1 h-40 w-full rounded-lg border p-2 font-mono text-sm"
            placeholder="Titre 1 | https://...\nTitre 2 | https://...\nhttps://..."
            value={imagesRaw}
            onChange={(e)=>setImagesRaw(e.target.value)}
            required
          />
        </label>
        <button disabled={loading} className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50">
          {loading ? "Création..." : "Créer le projet"}
        </button>
        {createdLink && (
          <p className="mt-2 text-sm">Lien client : <a className="font-medium underline" href={createdLink}>{createdLink}</a></p>
        )}
      </form>
    </section>
  );
}
