import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const staff = await prisma.staff.update({
    where: { id },
    data: body,
  });
  return NextResponse.json(staff);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.staff.update({
    where: { id },
    data: { isActive: false },
  });
  return NextResponse.json({ success: true });
}
