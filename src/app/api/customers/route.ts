import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const customers = await prisma.customer.findMany({
    orderBy: { lastKana: "asc" },
  });
  return NextResponse.json(customers);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { lastKana, ...rest } = body;

  if (!lastKana) {
    return NextResponse.json(
      { error: "lastKana is required" },
      { status: 400 }
    );
  }

  const customer = await prisma.customer.create({
    data: { lastKana, ...rest },
  });
  return NextResponse.json(customer, { status: 201 });
}
