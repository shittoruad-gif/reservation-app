import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const config = await prisma.notionConfig.findFirst();
  if (!config) {
    return NextResponse.json({ configured: false });
  }
  return NextResponse.json({
    configured: true,
    databaseId: config.databaseId,
    apiKeySet: !!config.apiKey,
    isActive: config.isActive,
  });
}

export async function POST(request: NextRequest) {
  const { apiKey, databaseId } = await request.json();

  if (!apiKey || !databaseId) {
    return NextResponse.json(
      { error: "apiKey and databaseId are required" },
      { status: 400 }
    );
  }

  const config = await prisma.notionConfig.upsert({
    where: { id: "default" },
    update: { apiKey, databaseId, isActive: true },
    create: { id: "default", apiKey, databaseId },
  });

  return NextResponse.json({
    success: true,
    databaseId: config.databaseId,
    isActive: config.isActive,
  });
}
