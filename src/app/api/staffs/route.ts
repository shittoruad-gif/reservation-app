import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const staffs = await prisma.staff.findMany({
    where: { isActive: true },
    orderBy: { nameKana: "asc" },
  });
  return NextResponse.json(staffs);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, nameKana } = body;

  if (!name || !nameKana) {
    return NextResponse.json(
      { error: "name and nameKana are required" },
      { status: 400 }
    );
  }

  const staff = await prisma.staff.create({
    data: { name, nameKana },
  });
  return NextResponse.json(staff, { status: 201 });
}
