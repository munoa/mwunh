export const dynamic = "force-dynamic";
export const revalidate = 0;

import AdminCreateForm from "@/components/AdminCreateForm";
import ProjectList from "@/components/ProjectList";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  // Évite l’accès DB pendant le build (DATABASE_URL non injectée)
  if (!process.env.DATABASE_URL) {
    return (
      <main className="space-y-8">
        <AdminCreateForm />
        <ProjectList projects={[]} />
        <p className="text-sm opacity-60">
          Build sans DATABASE_URL : la liste des projets sera chargée à l’exécution (runtime).
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
