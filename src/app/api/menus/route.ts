import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const menus = await prisma.menu.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(menus);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, duration, price } = body;

  if (!name || duration == null || price == null) {
    return NextResponse.json(
      { error: "name, duration, and price are required" },
      { status: 400 }
    );
  }

  const menu = await prisma.menu.create({
    data: {
      name,
      duration: parseInt(String(duration), 10),
      price: parseInt(String(price), 10),
    },
  });
  return NextResponse.json(menu, { status: 201 });
}
