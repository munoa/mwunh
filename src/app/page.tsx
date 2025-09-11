export const dynamic = "force-dynamic";
export const revalidate = 0;

import AdminCreateForm from "@/components/AdminCreateForm";
import ProjectList from "@/components/ProjectList";

export default async function AdminPage() {
  // En build (pas d'env), on n’importe pas Prisma et on renvoie une page neutre
  if (!process.env.DATABASE_URL) {
    return (
      <main className="space-y-8">
        <AdminCreateForm />
        <ProjectList projects={[]} />
        <p className="text-sm opacity-60">
          Build sans DATABASE_URL : la liste des projets se chargera à l’exécution.
        </p>
      </main>
    );
  }

  // ⬇️ Import Prisma uniquement en runtime
  const { prisma } = await import("@/lib/prisma");

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { thumbnails: true },
  });

  return (
    <main className="space-y-8">
      <AdminCreateForm />
      <ProjectList projects={projects} />
    </main>
  );
}
