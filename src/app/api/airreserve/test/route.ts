import { NextRequest, NextResponse } from "next/server";
import { AirReserveClient } from "@/lib/airreserve-client";

// POST /api/airreserve/test - 接続テスト
export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json(
      { error: "ユーザー名とパスワードは必須です" },
      { status: 400 }
    );
  }

  const client = new AirReserveClient();
  const result = await client.testConnection(username, password);

  return NextResponse.json(result);
}
