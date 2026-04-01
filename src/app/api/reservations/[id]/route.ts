import { prisma } from "@/lib/prisma";
import { pushToAirReserve, deleteFromAirReserve } from "@/lib/airreserve-sync";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      customer: true,
      staff: true,
      menu: true,
      resource: true,
    },
  });

  if (!reservation) {
    return NextResponse.json(
      { error: "Reservation not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(reservation);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (body.startTime) body.startTime = new Date(body.startTime);
  if (body.endTime) body.endTime = new Date(body.endTime);

  const reservation = await prisma.reservation.update({
    where: { id },
    data: body,
    include: {
      customer: true,
      staff: true,
      menu: true,
      resource: true,
    },
  });

  // AirReserve連携が有効なら自動同期
  pushToAirReserve(reservation.id).catch(() => {});

  return NextResponse.json(reservation);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const reservation = await prisma.reservation.findUnique({ where: { id } });

  await prisma.reservation.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  // AirReserve側の予約も削除
  if (reservation?.airReserveSlotId) {
    deleteFromAirReserve(reservation.airReserveSlotId).catch(() => {});
  }

  return NextResponse.json({ success: true });
}
