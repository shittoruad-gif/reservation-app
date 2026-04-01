import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { syncChartToNotion } from "@/lib/notion-sync";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const chart = await prisma.chart.findUnique({
    where: { id },
    include: { customer: true, reservation: true },
  });
  if (!chart) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(chart);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (body.treatmentDate) {
    body.treatmentDate = new Date(body.treatmentDate);
  }

  const chart = await prisma.chart.update({
    where: { id },
    data: body,
    include: { customer: true, reservation: true },
  });

  syncChartToNotion(chart.id).catch(() => {});

  return NextResponse.json(chart);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.chart.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
