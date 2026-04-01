import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const resource = await prisma.resource.update({
    where: { id },
    data: body,
  });
  return NextResponse.json(resource);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.resource.update({
    where: { id },
    data: { isActive: false },
  });
  return NextResponse.json({ success: true });
}
