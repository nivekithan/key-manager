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

  return { apiKey };
}

async function hashAPIKey(apiKey: string) {
  const hashOfKey = await crypto.subtle.digest(
    "sha-256",
    new TextEncoder().encode(apiKey + SALT)
  );

  const bytes = Buffer.from(hashOfKey);
  return { hash: bytes.toString("base64"), salt: SALT };
}

export async function storeRootAPIKey({
  apiKey,
  userId,
}: {
  apiKey: string;
  userId: string;
}) {
  const { hash, salt } = await hashAPIKey(apiKey);
  const apiKeyRec = await prisma.rootAPIKey
    .upsert({
      where: { userId: userId },
      update: { hash, salt },

      create: { hash, salt, userId },
    })
    .catch((err: Error) => err);

  return apiKeyRec;
}

export async function storeUserAPIKey({
  apiKey,
  userId,
}: {
  apiKey: string;
  userId: string;
}) {
  const { hash, salt } = await hashAPIKey(apiKey);
  const apiKeyRecord = await prisma.userAPIKey.create({
    data: { createdByUser: userId, hash, salt },
  });

  return apiKeyRecord;
}

export async function getRootAPIKeyRecord(rootAPIKey: string) {
  const { hash } = await hashAPIKey(rootAPIKey);

  const apiKeyRec = await prisma.rootAPIKey.findUnique({ where: { hash } });

  return apiKeyRec;
}

export async function getUserAPIKeyRecord(userAPIKey: string, userId: string) {
  const { hash } = await hashAPIKey(userAPIKey);

  const apiKeyRec = await prisma.userAPIKey.findUnique({ where: { hash } });

  if (apiKeyRec?.createdByUser !== userId) {
    return null;
  }

  return apiKeyRec;
}

export function generateIDForAPIKey({
  endpoint,
  hashAPIKey,
  variables,
}: {
  hashAPIKey: string;
  endpoint: string;
  variables: Array<string>;
}) {
  const id = `${hashAPIKey}_${endpoint}_${variables.join("_")}`;

  return id;
}
