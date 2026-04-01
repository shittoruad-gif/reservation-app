import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/airreserve/config - 設定取得
export async function GET() {
  const config = await prisma.airReserveConfig.findFirst();
  if (!config) {
    return NextResponse.json({ configured: false });
  }
  return NextResponse.json({
    configured: true,
    username: config.username,
    // パスワードはマスクして返す
    passwordSet: !!config.password,
    lastSync: config.lastSync,
    isActive: config.isActive,
  });
}

// POST /api/airreserve/config - 設定保存
export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json(
      { error: "ユーザー名とパスワードは必須です" },
      { status: 400 }
    );
  }

  const config = await prisma.airReserveConfig.upsert({
    where: { id: "default" },
    update: { username, password, isActive: true },
    create: { id: "default", username, password },
  });

  return NextResponse.json({
    success: true,
    username: config.username,
    lastSync: config.lastSync,
  });
}
