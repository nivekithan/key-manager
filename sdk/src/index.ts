import {
  AddRoleSchema,
  CreateKeyResSchema,
  DeleteKeyResSchema,
  RemoveRolesSchema,
  RotateKeySchema,
} from "./schema.ts";

export type InitKeyManagerOptions = {
  rootAPIKey: string;
  url?: string;
};

export function initKeyManager({
  rootAPIKey,
  url = "http://localhost:3000",
}: InitKeyManagerOptions) {
  return {
    async createUserAPIKey(prefix: string, roles?: Array<string>) {
      const res = await fetch(url + "/api/v1/keys", {
        method: "POST",
        headers: { Authorization: `Bearer ${rootAPIKey}` },
        body: JSON.stringify({ prefix, roles }),
      });

      const body = await res.json();

      return CreateKeyResSchema.parse(body);
    },

    async deleteUserAPIkey(id: string) {
      const res = await fetch(url + "/api/v1/keys", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${rootAPIKey}` },
        body: JSON.stringify({ id }),
      });

      const body = await res.json();

      return DeleteKeyResSchema.parse(body);
    },

    async rotateUserAPIKey(id: string) {
      const res = await fetch(url + "/api/v1/keys/rotate", {
        method: "POST",
        headers: { Authorization: `Bearer ${rootAPIKey}` },
        body: JSON.stringify({ id }),
      });

      const body = await res.json();

      return RotateKeySchema.parse(body);
    },

    async addRoles(userAPIKeyId: string, roles: Array<string>) {
      const res = await fetch(url + "/api/v1/keys/roles", {
        method: "POST",
        headers: { Authorization: `Bearer ${rootAPIKey}` },
        body: JSON.stringify({ id: userAPIKeyId, roles }),
      });

      const body = await res.json();

      return AddRoleSchema.parse(body);
    },

    async removeRoles(userAPIKeyId: string, roles: Array<string>) {
      const res = await fetch(url + "/api/v1/keys/roles", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${rootAPIKey}` },
        body: JSON.stringify({ id: userAPIKeyId, roles }),
      });

      const body = await res.json();

      return RemoveRolesSchema.parse(body);
    },
  };
}
