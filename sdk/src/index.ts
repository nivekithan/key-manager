import { CreateKeyResSchema } from "./schema.ts";

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
  };
}
