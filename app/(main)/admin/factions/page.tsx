import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { FactionAdminClient } from "./faction-admin-client";
import { isAdminId } from "@/lib/admin";

export default async function AdminFactionsPage() {
  const { userId } = auth();
    if (!isAdminId(userId)) {
    redirect("/");
  }

  const factions = await prisma.faction.findMany({
    orderBy: { id: "asc" },
    include: {
      _count: {
        select: { members: true }
      }
    }
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800">Centro de Facciones</h1>
        <p className="text-slate-500">Agrega, edita o elimina las universidades del sistema.</p>
      </div>

      <FactionAdminClient initialFactions={factions} />
    </div>
  );
}
