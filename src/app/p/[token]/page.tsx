import { prisma } from "@/lib/prisma";
import ThumbnailCard from "@/components/ThumbnailCard";
import { notFound } from "next/navigation";

export default async function ClientPage({ params }: { params: { token: string }}) {
  const project = await prisma.project.findUnique({
    where: { token: params.token },
    include: { thumbnails: { orderBy: { id: "asc" } } },
  });
  if (!project) return notFound();

  return (
    <main className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{project.name}</h2>
        <p className="opacity-70">Client : {project.clientName}</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {project.thumbnails.map(t => (
          <ThumbnailCard key={t.id} token={project.token} thumbnail={t} />
        ))}
      </div>
      <p className="opacity-60 text-sm">Conseil : cliquez sur 👍 ou 👎 pour voter. Vous pouvez changer d’avis à tout moment.</p>
    </main>
  );
}
