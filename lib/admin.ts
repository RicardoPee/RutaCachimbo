import { auth } from "@clerk/nextjs"

export const isAdmin = () => {
  const { userId } = auth();

  if (!userId) {
    return false;
  }

  // Verifica si el usuario coincide con el ID de administrador en el .env
  return userId === process.env.ADMIN_USER_ID;
};
