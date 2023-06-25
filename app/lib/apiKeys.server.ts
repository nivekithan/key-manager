import { base58 } from "./util/baseX.server";
import { SALT } from "./util/constants";
import { prisma } from "./util/prisma.server";
import crypto from "node:crypto";

export async function getUserRootAPIKeyRecord(userId: string) {
  const res = await prisma.rootAPIKey
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

async function hashAPIKey(apiKey: string) {
  const hashOfKey = await crypto.subtle.digest(
    "sha-256",
    new TextEncoder().encode(apiKey + SALT)
  );

  const bytes = Buffer.from(hashOfKey);
  return { hash: bytes.toString("base64"), salt: SALT };
}

export async function storeHashOfRootAPIKey({
  hash,
  salt,
  userId,
}: {
  hash: string;
  salt: string;
  userId: string;
}) {
  const apiKey = await prisma.rootAPIKey
    .upsert({
      where: { userId: userId },
      update: { hash, salt },

      create: { hash, salt, userId },
    })
    .catch((err: Error) => err);

  return apiKey;
}

export async function getRootAPIKeyRecord(rootAPIKey: string) {
  const { hash } = await hashAPIKey(rootAPIKey);

  const apiKeyRec = await prisma.rootAPIKey.findUnique({ where: { hash } });

  return apiKeyRec;
}
