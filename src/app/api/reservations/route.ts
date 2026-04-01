import { prisma } from "@/lib/prisma";
import { pushToAirReserve } from "@/lib/airreserve-sync";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const start = request.nextUrl.searchParams.get("start");
  const end = request.nextUrl.searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json(
      { error: "start and end query parameters are required" },
      { status: 400 }
    );
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return NextResponse.json(
      { error: "Invalid date format" },
      { status: 400 }
    );
  }

  const reservations = await prisma.reservation.findMany({
    where: {
      startTime: { gte: startDate },
      endTime: { lte: endDate },
      status: { not: "CANCELLED" },
    },
    include: {
      customer: true,
      staff: true,
      menu: true,
      resource: true,
    },
    orderBy: { startTime: "asc" },
  });
  return NextResponse.json({ reservations });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { customerId, staffId, menuId, resourceId, startTime, endTime, note } =
    body;

  if (!customerId || !staffId || !menuId || !startTime || !endTime) {
    return NextResponse.json(
      { error: "customerId, staffId, menuId, startTime, and endTime are required" },
      { status: 400 }
    );
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  // Check staff conflict
  const staffConflict = await prisma.reservation.findFirst({
    where: {
      staffId,
      status: { not: "CANCELLED" },
      startTime: { lt: end },
      endTime: { gt: start },
    },
  });

  if (staffConflict) {
    return NextResponse.json(
      { error: "Staff has a conflicting reservation" },
      { status: 409 }
    );
  }

  // Check resource conflict
  if (resourceId) {
    const resourceConflict = await prisma.reservation.findFirst({
      where: {
        resourceId,
        status: { not: "CANCELLED" },
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });

    if (resourceConflict) {
      return NextResponse.json(
        { error: "Resource has a conflicting reservation" },
        { status: 409 }
      );
    }
  }

  const reservation = await prisma.reservation.create({
    data: {
      customerId,
      staffId,
      menuId,
      resourceId: resourceId || null,
      startTime: start,
      endTime: end,
      note: note || null,
    },
    include: {
      customer: true,
      staff: true,
      menu: true,
      resource: true,
    },
  });
  // AirReserve連携が有効なら自動同期（非同期・エラーは無視）
  pushToAirReserve(reservation.id).catch(() => {});

  return NextResponse.json(reservation, { status: 201 });
}
