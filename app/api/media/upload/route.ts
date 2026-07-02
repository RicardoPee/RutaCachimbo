import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import cloudinary from "@/lib/cloudinary";
import { isAdminId } from "@/lib/admin";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!isAdminId(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const mimeType = file.type;
    const dataUri = `data:${mimeType};base64,${base64}`;

    // Determine resource type based on file
    let resourceType: "image" | "video" | "raw" = "raw";
    if (mimeType.startsWith("image/")) resourceType = "image";
    else if (mimeType.startsWith("audio/") || mimeType.startsWith("video/")) resourceType = "video";

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "rutacachimbo",
      resource_type: resourceType,
      public_id: `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`,
    });

    return NextResponse.json({ 
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
