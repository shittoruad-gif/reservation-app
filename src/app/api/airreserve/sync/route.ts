import { NextResponse } from "next/server";
import { syncFromAirReserve } from "@/lib/airreserve-sync";

// POST /api/airreserve/sync - 手動同期実行
export async function POST() {
  try {
    const result = await syncFromAirReserve();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "同期中にエラーが発生しました",
      },
      { status: 500 }
    );
  }
}
