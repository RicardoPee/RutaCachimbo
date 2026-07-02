import { auth } from "@clerk/nextjs/server";

/**
 * Comprueba si un userId corresponde al administrador.
 * Falla cerrado: si ADMIN_USER_ID no está configurada, nadie es admin.
 */
export const isAdminId = (userId: string | null | undefined): boolean => {
  const adminId = process.env.ADMIN_USER_ID;
  return !!adminId && !!userId && userId === adminId;
};

export const isAdmin = () => {
  const { userId } = auth();
  return isAdminId(userId);
};

/**
 * Guard para server actions y rutas de API de administración.
 * Lanza si el usuario no es admin — úsalo al inicio de cada action protegida.
 */
export const requireAdmin = () => {
  const { userId } = auth();

  if (!isAdminId(userId)) {
    throw new Error("No autorizado: se requieren permisos de administrador.");
  }

  return { userId: userId as string };
};
