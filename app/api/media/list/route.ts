import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import cloudinary from "@/lib/cloudinary";

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId || userId !== process.env.ADMIN_USER_ID) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all resources from the rutacachimbo folder
    const [images, videos, raws] = await Promise.all([
      cloudinary.api.resources({
        type: "upload",
        prefix: "rutacachimbo",
        resource_type: "image",
        max_results: 100,
      }).catch(() => ({ resources: [] })),
      cloudinary.api.resources({
        type: "upload",
        prefix: "rutacachimbo",
        resource_type: "video",
        max_results: 100,
      }).catch(() => ({ resources: [] })),
      cloudinary.api.resources({
        type: "upload",
        prefix: "rutacachimbo",
        resource_type: "raw",
        max_results: 100,
      }).catch(() => ({ resources: [] })),
    ]);

    const allResources = [
      ...images.resources.map((r: any) => ({ ...r, _type: "image" })),
      ...videos.resources.map((r: any) => ({ ...r, _type: "audio" })),
      ...raws.resources.map((r: any) => ({ ...r, _type: "documento" })),
    ];

    const mediaFiles = allResources
      .map((r: any) => ({
        url: r.secure_url,
        name: r.public_id.replace("rutacachimbo/", ""),
        isImage: r._type === "image",
        type: r._type,
        size: r.bytes,
        createdAt: r.created_at,
      }))
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ files: mediaFiles });
  } catch (error) {
    console.error("List media error:", error);
    return NextResponse.json({ files: [] });
  }
}
