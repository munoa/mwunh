import Link from "next/link";

type Props = { projects: Array<{ id:number; name:string; clientName:string; token:string; createdAt:string | Date; thumbnails:{id:number}[] }>};

export default function ProjectList({ projects }: Props) {
  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">Projets</h2>
      <div className="divide-y">
        {projects.map(p => (
          <div key={p.id} className="flex items-center justify-between py-3">
            <div>
              <div className="font-medium">{p.name} <span className="opacity-60">— {p.clientName}</span></div>
              <div className="text-sm opacity-60">{new Date(p.createdAt).toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm opacity-70">{p.thumbnails.length} images</span>
              <Link className="text-sm underline" href={`/p/${p.token}`}>Ouvrir le lien client</Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
