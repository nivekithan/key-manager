import { prisma } from "./util/prisma.server";

export async function getAllAPI(userId: string) {
  const apis = await prisma.api.findMany({
    where: { userId },
    take: 10,
    orderBy: { createdAt: "desc" },
  });

  return apis;
}

