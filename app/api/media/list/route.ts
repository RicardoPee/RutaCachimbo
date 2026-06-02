import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId || userId !== process.env.ADMIN_USER_ID) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mediaDir = path.join(process.cwd(), "public", "media");
    
    try {
      await fs.access(mediaDir);
    } catch {
      // Si no existe el directorio, devolvemos un array vacío
      return NextResponse.json({ files: [] });
    }

    const files = await fs.readdir(mediaDir);
    // Filtrar archivos ocultos y mapear con su URL y tipo
    const mediaFiles = files
      .filter(f => !f.startsWith("."))
      .map(filename => ({
        url: `/media/${filename}`,
        name: filename,
        isImage: filename.match(/\.(jpeg|jpg|gif|png|svg|webp)$/i) != null,
      }))
      // Sort by newest first since filename starts with timestamp
      .sort((a, b) => b.name.localeCompare(a.name));

    return NextResponse.json({ files: mediaFiles });
  } catch (error) {
    console.error("List media error:", error);
    return NextResponse.json({ error: "Failed to list files" }, { status: 500 });
  }
}
