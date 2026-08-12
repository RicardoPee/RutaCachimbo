import { NextResponse } from "next/server";
import { processLeagueWeek } from "@/lib/leagues";

export async function GET(req: Request) {
  // Falla cerrado: si CRON_SECRET no está configurada, nadie puede ejecutarlo.
  const authHeader = req.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processLeagueWeek();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[CRON_LEAGUES_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

