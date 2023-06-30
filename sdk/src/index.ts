import {
  AddRoleSchema,
  CreateKeyResSchema,
  DeleteKeyResSchema,
  RemoveRolesSchema,
  RotateKeySchema,
  VerifyKeySchema,
} from "./schema.ts";

export type Endpoints<EndpointName extends string> = {
  [name in EndpointName]: {
    default: { maxReq: number; duration: number };
    roles?: Record<string, { maxReq: number; duration: number }>;
  };
};

export type InitKeyManagerOptions<EndpointName extends string> = {
  rootAPIKey: string;
  url?: string;
  endpoints: Endpoints<EndpointName>;
};

export function initKeyManager<EndpointName extends string>({
  rootAPIKey,
  url = "http://localhost:3000",
  endpoints,
}: InitKeyManagerOptions<EndpointName>) {
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

    async deleteUserAPIKey(id: string) {
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

    async verifyUserAPIKey(
      userAPIKey: string,
      endpointName: EndpointName,
      variables: Array<string> = []
    ) {
      const ratelimits = endpoints[endpointName];
      const roles = ratelimits.roles ? ratelimits.roles : {};

      const res = await fetch(url + "/api/v1/keys/verify", {
        method: "POST",
        headers: { Authorization: `Bearer ${rootAPIKey}` },
        body: JSON.stringify({
          apikey: userAPIKey,
          endpoint: endpointName,
          variables,
          ratelimits: { DEFAULT: ratelimits.default, ...roles },
        }),
      });

      const body = await res.json();

      return VerifyKeySchema.parse(body);
    },
  };
}
