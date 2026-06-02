import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId || userId !== process.env.ADMIN_USER_ID) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name);
    // Sanitize filename to prevent directory traversal or weird characters
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const filename = `${Date.now()}-${safeName}`;
    const mediaDir = path.join(process.cwd(), "public", "media");

    try {
      await fs.access(mediaDir);
    } catch {
      await fs.mkdir(mediaDir, { recursive: true });
    }

    const filePath = path.join(mediaDir, filename);
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({ url: `/media/${filename}` });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
