import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (body.duration != null) body.duration = parseInt(String(body.duration), 10);
  if (body.price != null) body.price = parseInt(String(body.price), 10);

  const menu = await prisma.menu.update({
    where: { id },
    data: body,
  });
  return NextResponse.json(menu);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.menu.update({
    where: { id },
    data: { isActive: false },
  });
  return NextResponse.json({ success: true });
}
