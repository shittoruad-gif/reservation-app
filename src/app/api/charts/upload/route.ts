import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Only image files are accepted" },
      { status: 400 }
    );
  }

  const ext = path.extname(file.name) || ".jpg";
  const filename = `${Date.now()}${ext}`;
  const uploadDir = path.join(process.cwd(), "public/uploads/charts");

  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  return NextResponse.json({ url: `/uploads/charts/${filename}` });
}
