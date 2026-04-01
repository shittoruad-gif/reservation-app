import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  const { customerId } = await params;
  const charts = await prisma.chart.findMany({
    where: { customerId },
    include: { customer: true },
    orderBy: { treatmentDate: "desc" },
  });
  return NextResponse.json(charts);
}
