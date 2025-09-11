export const dynamic = "force-dynamic";
export const revalidate = 0;

import AdminCreateForm from "@/components/AdminCreateForm";
import ProjectList from "@/components/ProjectList";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  // ⚠️ Au build (Docker), DATABASE_URL n'est pas injectée.
  // On évite tout appel Prisma pour ne pas casser le build.
  if (!process.env.DATABASE_URL) {
    return (
      <main className="space-y-8">
        <AdminCreateForm />
        <ProjectList projects={[]} />
        <p className="text-sm opacity-60">
          Build sans DATABASE_URL : la liste se chargera à l’exécution.
        </p>
      </main>
    );
  }

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
