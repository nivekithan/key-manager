import { base58 } from "./util/baseX.server";
import { prisma } from "./util/prisma.server";
import crypto from "node:crypto";

export async function getAPIKey(userId: string) {
  const res = await prisma.apiKey
    .findUnique({ where: { userId } })
    .catch((err: Error) => err);

  if (res instanceof Error) {
    return res;
  }

  return res;
}

export async function generateAPIKey() {
  const buf = new Uint8Array(36);
  crypto.getRandomValues(buf);

  const apiKey = base58(buf);

  const { hash, salt } = await hashAPIKey(apiKey);

  return { apiKey, hash, salt };
}

export async function hashAPIKey(apiKey: string) {
  const salt = crypto.randomBytes(12).toString("base64");

  const hashOfKey = await crypto.subtle.digest(
    "sha-256",
    new TextEncoder().encode(apiKey + salt)
  );

  const bytes = Buffer.from(hashOfKey);
  return { hash: bytes.toString("base64"), salt };
}

export async function storeHashOfAPIKey({
  hash,
  salt,
  userId,
}: {
  hash: string;
  salt: string;
  userId: string;
}) {
  const apiKey = await prisma.apiKey
    .upsert({
      where: { userId: userId },
      update: { hash, salt },

      create: { hash, salt, userId },
    })
    .catch((err: Error) => err);

  return apiKey;
}
