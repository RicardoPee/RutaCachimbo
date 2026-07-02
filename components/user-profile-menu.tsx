import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { UserProfileMenuClient } from "./user-profile-menu-client";
import { isAdmin } from "@/lib/admin";

export const UserProfileMenu = async () => {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  const progress = await prisma.userProgress.findUnique({
    where: { userId },
  });

  const isUserAdmin = isAdmin();
  const isTeacher = !!progress?.isTeacher;

  return <UserProfileMenuClient isAdmin={isUserAdmin} isTeacher={isTeacher} />;
};
