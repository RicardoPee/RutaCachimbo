import { PrismaClient } from "@prisma/client";

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

/**
 * Incrementa el XP total de la facción a la que pertenece el usuario.
 * Debe llamarse DENTRO de una transacción de Prisma para garantizar atomicidad.
 *
 * @param tx  - cliente de transacción de Prisma
 * @param userId  - ID del usuario que ganó XP
 * @param amount  - cantidad de XP a sumar
 */
export async function incrementFactionXp(
  tx: TransactionClient,
  userId: string,
  amount: number
): Promise<void> {
  if (amount <= 0) return;

  // Obtener factionId del usuario en la misma transacción
  const user = await tx.userProgress.findUnique({
    where: { userId },
    select: { factionId: true },
  });

  if (!user?.factionId) return;

  await tx.faction.update({
    where: { id: user.factionId },
    data: { totalXp: { increment: amount } },
  });
}
