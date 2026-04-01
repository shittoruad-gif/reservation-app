import { prisma } from "@/lib/prisma";
import { hashPassword, createToken, setAuthCookie } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "email, password, name are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "このメールアドレスは既に登録されています" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    const token = createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    await setAuthCookie(token);

    return NextResponse.json(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "登録に失敗しました" },
      { status: 500 }
    );
  }
}
