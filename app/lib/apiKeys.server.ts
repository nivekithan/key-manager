import { type apiKeyRole, type userAPIKey } from "@prisma/client";
import { base58 } from "./util/baseX.server";
import { SALT } from "./util/constants";
import { prisma } from "./util/prisma.server";
import crypto from "node:crypto";
import { type InputRatelimit } from "@/routes/api.v1.keys.verify";

export async function getUserRootAPIKeyRecord(userId: string) {
  const res = await prisma.rootAPIKey
    .findUnique({ where: { userId } })
    .catch((err: Error) => err);

  if (res instanceof Error) {
    return res;
  }

  return res;
}

export async function generateAPIKey(prefix: string) {
  const buf = new Uint8Array(36);
  crypto.getRandomValues(buf);

  const apiKey = base58(buf);

  return { apiKey: `${prefix}_${apiKey}` };
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
  prefix,
  roles,
}: {
  apiKey: string;
  userId: string;
  prefix: string;
  roles?: Array<string>;
}) {
  const { hash, salt } = await hashAPIKey(apiKey);
  const apiKeyRecord = await prisma.userAPIKey.create({
    data: {
      createdByUser: userId,
      hash,
      salt,
      prefix,
      roles: roles
        ? {
            createMany: {
              data: roles.map((name) => {
                return { createdByUser: userId, name };
              }),
            },
          }
        : undefined,
    },
    include: {
      roles: true,
    },
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

  const apiKeyRec = await prisma.userAPIKey.findUnique({
    where: { hash },
    include: { roles: true },
  });

  if (apiKeyRec?.createdByUser !== userId) {
    return null;
  }

  return apiKeyRec;
}

export function generateIDForAPIKey({
  endpoint,
  idOfAPIKey,
  variables,
}: {
  idOfAPIKey: string;
  endpoint: string;
  variables: Array<string>;
}) {
  const id = `${idOfAPIKey}_${endpoint}_${variables.join("_")}`;

  return id;
}

export async function getUserAPIKeyRecordById(id: string, userId: string) {
  const apiKeyRecord = await prisma.userAPIKey.findFirst({
    where: { id, createdByUser: userId },
    include: { roles: true },
  });

  return apiKeyRecord;
}

export async function rotateUserAPIKey(id: string, prefix: string) {
  const { apiKey } = await generateAPIKey(prefix);
  const { hash, salt } = await hashAPIKey(apiKey);

  await prisma.userAPIKey.update({
    where: { id },
    data: { hash, salt },
  });

  return { apiKey };
}

export async function getPaginatedUserAPIKeys(userId: string) {
  const apiKeyList = await prisma.userAPIKey.findMany({
    where: { createdByUser: userId },
  });

  return apiKeyList.map(whitelabelUserAPIKeyRecord);
}

export async function deleteUserAPIKey(id: string) {
  const deletedRecord = await prisma.userAPIKey.delete({ where: { id } });

  return deletedRecord;
}

export async function addRolesToUserAPIKey({
  id,
  roles,
  userId,
}: {
  id: string;
  roles: Array<string>;
  userId: string;
}) {
  const { count } = await prisma.apiKeyRole.createMany({
    data: roles.map((name) => {
      return { apiKeyId: id, createdByUser: userId, name };
    }),
  });

  return count;
}
export async function removeRolesToUserAPIKey({
  id,
  roles,
}: {
  id: string;
  roles: Array<string>;
}) {
  const { count } = await prisma.apiKeyRole.deleteMany({
    where: { apiKeyId: id, name: { in: roles } },
  });

  return count;
}

function whitelabelUserAPIKeyRecord(apiKeyRecord: userAPIKey): WUserAPIKey {
  return {
    id: apiKeyRecord.id,
    prefix: apiKeyRecord.prefix,
    createdAt: apiKeyRecord.createdAt.toString(),
    updatedAt: apiKeyRecord.updatedAt.toString(),
  };
}

export function findRatelimitToUse(
  ratelimit: InputRatelimit,
  roles: Array<apiKeyRole>
) {
  if (roles.length === 0) {
    return ratelimit.DEFAULT;
  }

  let ratelimitByRole: null | InputRatelimit["DEFAULT"] = null;

  roles.forEach(({ name }) => {
    const currentRatelimit = ratelimit[name] as
      | InputRatelimit["DEFAULT"]
      | undefined;

    if (!currentRatelimit) {
      return;
    }

    if (ratelimitByRole === null) {
      ratelimitByRole = { ...currentRatelimit };
    }

    const isCurrentRatelimitAllowsMoreRequest =
      currentRatelimit.maxReq / currentRatelimit.duration >
      ratelimitByRole.maxReq / ratelimitByRole.duration;

    if (!isCurrentRatelimitAllowsMoreRequest) {
      return;
    }

    ratelimitByRole = currentRatelimit;
  });

  if (ratelimitByRole === null) {
    return ratelimit.DEFAULT;
  }

  return ratelimitByRole;
}

export type WUserAPIKey = {
  id: string;
  prefix: string;
  createdAt: string;
  updatedAt: string;
};
