import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UnitForm } from "@/components/admin/unit-form";
import { isAdminId } from "@/lib/admin";

export default async function EditUnitPage({ params }: { params: { unitId: string } }) {
  const { userId } = auth();
  
  if (!isAdminId(userId)) {
    redirect("/");
  }

  const unit = await prisma.unit.findUnique({
    where: { id: parseInt(params.unitId) },
  });

  if (!unit) {
    redirect("/admin/units");
  }

  const courses = await prisma.course.findMany({ 
    select: { id: true, title: true } 
  });

  return <UnitForm initialData={unit} courses={courses} />;
}
