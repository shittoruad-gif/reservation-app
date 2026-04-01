import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const resources = await prisma.resource.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(resources);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, type } = body;

  if (!name || !type) {
    return NextResponse.json(
      { error: "name and type are required" },
      { status: 400 }
    );
  }

  const resource = await prisma.resource.create({
    data: { name, type },
  });
  return NextResponse.json(resource, { status: 201 });
}
