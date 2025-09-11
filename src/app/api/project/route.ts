import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const projects = await prisma.project.findMany({ include: { thumbnails: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  const { name, clientName, images } = await req.json();
  if (!name || !clientName || !Array.isArray(images) || images.length === 0) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const token = crypto.randomUUID().replace(/-/g, "").slice(0, 12);

  const project = await prisma.project.create({
    data: {
      name,
      clientName,
      token,
      thumbnails: {
        create: images.map((img: any) => ({ title: img.title || "Proposition", imageUrl: img.imageUrl }))
      }
    },
    include: { thumbnails: true }
  });

  return NextResponse.json({ project });
}
