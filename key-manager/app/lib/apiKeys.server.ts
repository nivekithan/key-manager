import { type Prisma, type apiKeyRole, type userAPIKey } from "@prisma/client";
import { base58 } from "./util/baseX.server";
import { SALT } from "./util/constants";
import { prisma } from "./util/prisma.server";
import crypto from "node:crypto";
import { type InputRatelimit } from "@/routes/api.v1.keys.verify";
import { uniqueArray } from "./util/utils";
import { type SearchQuery } from "./search";

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

export async function getPaginatedUserAPIKeys({
  search,
  userId,
  cursor,
}: {
  userId: string;
  search: SearchQuery;
  cursor: string | null;
}) {
  const allOrClauses: Array<Prisma.userAPIKeyWhereInput> = [];

  const allPrefixQuery = search
    .filter((v) => v.key === "prefix")
    .map((v) => v.value);

  if (allPrefixQuery.length !== 0) {
    allOrClauses.push({ prefix: { in: allPrefixQuery } });
  }

  const allIdQuery = search
    .filter((value) => value.key === "id")
    .map((v) => v.value);

  if (allIdQuery.length !== 0) {
    allOrClauses.push({ id: { in: allIdQuery } });
  }

  const allRolesQuery = search
    .filter((v) => v.key === "roles")
    .map((v) => v.value);

  if (allRolesQuery.length !== 0) {
    allOrClauses.push({ roles: { some: { name: { in: allRolesQuery } } } });
  }

  const allAPIKeyQuery = await Promise.all(
    search
      .filter((v) => v.key === "apiKey")
      .map(async (v) => (await hashAPIKey(v.value)).hash)
  );

  if (allAPIKeyQuery.length !== 0) {
    allOrClauses.push({ hash: { in: allAPIKeyQuery } });
  }

  const apiKeyList = await prisma.userAPIKey.findMany({
    where: {
      createdByUser: userId,
      OR: allOrClauses.length === 0 ? undefined : allOrClauses,
    },
    include: { roles: true },
    orderBy: { createdAt: "desc" },
    cursor: cursor ? { createdAt: cursor } : undefined,
    take: 11,
    skip: cursor ? 1 : undefined,
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

function whitelabelUserAPIKeyRecord(
  apiKeyRecord: userAPIKey & { roles: apiKeyRole[] }
): WUserAPIKey {
  return {
    id: apiKeyRecord.id,
    prefix: apiKeyRecord.prefix,
    createdAt: apiKeyRecord.createdAt.toISOString(),
    updatedAt: apiKeyRecord.updatedAt.toISOString(),
    roles: apiKeyRecord.roles.map((v) => v.name),
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

export function rolesToAddAndRemove({
  newRoles,
  originalRoles,
}: {
  originalRoles: Array<string>;
  newRoles: Array<string>;
}) {
  const originalRolesMap = new Map<string, boolean>();

  originalRoles.forEach((name) => {
    originalRolesMap.set(name, true);
  });

  const addRoles = newRoles.filter((name) => !originalRolesMap.has(name));

  const newRolesMap = new Map<string, boolean>();

  newRoles.forEach((name) => {
    newRolesMap.set(name, true);
  });

  const removeRoles = originalRoles.filter((name) => !newRolesMap.has(name));

  return {
    addRoles: uniqueArray(addRoles),
    removeRoles: uniqueArray(removeRoles),
  };
}

export type WUserAPIKey = {
  id: string;
  prefix: string;
  createdAt: string;
  updatedAt: string;
  roles: Array<string>;
};
