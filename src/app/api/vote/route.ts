import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token, thumbnailId, value } = await req.json();
  if (!token || typeof thumbnailId !== "number" || ![-1,0,1].includes(value)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const project = await prisma.project.findUnique({ where: { token } });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const vote = await prisma.vote.upsert({
    where: { thumbnailId_token: { thumbnailId, token } },
    update: { value },
    create: { value, token, thumbnailId, projectId: project.id },
  });

  return NextResponse.json({ ok: true, vote });
}
