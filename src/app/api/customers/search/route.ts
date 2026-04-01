import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const kana = request.nextUrl.searchParams.get("kana") ?? "";

  if (!kana) {
    return NextResponse.json([]);
  }

  const customers = await prisma.customer.findMany({
    where: {
      OR: [
        { lastKana: { contains: kana } },
        { firstKana: { contains: kana } },
      ],
    },
    orderBy: { lastKana: "asc" },
    take: 20,
  });
  return NextResponse.json(customers);
}
