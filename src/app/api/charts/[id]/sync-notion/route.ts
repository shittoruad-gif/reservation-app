import { NextRequest, NextResponse } from "next/server";
import { syncChartToNotion } from "@/lib/notion-sync";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await syncChartToNotion(id);
  return NextResponse.json(result);
}
