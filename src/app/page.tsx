import AdminCreateForm from "@/components/AdminCreateForm";
import ProjectList from "@/components/ProjectList";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
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
