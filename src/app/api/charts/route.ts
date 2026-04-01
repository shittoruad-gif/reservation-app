import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { syncChartToNotion } from "@/lib/notion-sync";

export async function GET() {
  const charts = await prisma.chart.findMany({
    include: { customer: true },
    orderBy: { treatmentDate: "desc" },
  });
  return NextResponse.json(charts);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { customerId, treatmentDate, treatmentDetail, ...rest } = body;

  if (!customerId || !treatmentDate || !treatmentDetail) {
    return NextResponse.json(
      { error: "customerId, treatmentDate, treatmentDetail are required" },
      { status: 400 }
    );
  }

  const chart = await prisma.chart.create({
    data: {
      customerId,
      treatmentDate: new Date(treatmentDate),
      treatmentDetail,
      chiefComplaint: rest.chiefComplaint || null,
      bodyCondition: rest.bodyCondition || null,
      treatmentArea: rest.treatmentArea || null,
      painLevel: rest.painLevel || null,
      mobilityNote: rest.mobilityNote || null,
      homeExercise: rest.homeExercise || null,
      staffMemo: rest.staffMemo || null,
      nextProposal: rest.nextProposal || null,
      photoUrls: rest.photoUrls || null,
      reservationId: rest.reservationId || null,
    },
    include: { customer: true },
  });

  syncChartToNotion(chart.id).catch(() => {});

  return NextResponse.json(chart, { status: 201 });
}
