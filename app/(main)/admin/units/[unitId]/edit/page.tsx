import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UnitForm } from "@/components/admin/unit-form";

export default async function EditUnitPage({ params }: { params: { unitId: string } }) {
  const { userId } = auth();
  
  if (!userId || userId !== process.env.ADMIN_USER_ID) {
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
