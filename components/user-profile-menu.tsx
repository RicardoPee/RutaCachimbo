import { auth } from "@clerk/nextjs";
import db from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";
import { UserProfileMenuClient } from "./user-profile-menu-client";
import { isAdmin } from "@/lib/admin";

export const UserProfileMenu = async () => {
  const { userId } = auth();
  
  if (!userId) {
    return null;
  }

  const progress = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
  });

  const isUserAdmin = isAdmin();
  const isTeacher = !!progress?.isTeacher;

  return <UserProfileMenuClient isAdmin={isUserAdmin} isTeacher={isTeacher} />;
};
