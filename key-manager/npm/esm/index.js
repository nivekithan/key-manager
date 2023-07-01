import * as dntShim from "./_dnt.shims.js";
import { AddRoleSchema, CreateKeyResSchema, DeleteKeyResSchema, RemoveRolesSchema, RotateKeySchema, VerifyKeySchema, } from "./schema.js";
export function initKeyManager({ rootAPIKey, url = "https://key-manager.nivekithan.com", endpoints, }) {
    return {
        async createUserAPIKey(prefix, roles) {
            const res = await dntShim.fetch(url + "/api/v1/keys", {
                method: "POST",
                headers: { Authorization: `Bearer ${rootAPIKey}` },
                body: JSON.stringify({ prefix, roles }),
            });
            const body = await res.json();
            return CreateKeyResSchema.parse(body);
        },
        async deleteUserAPIKey(id) {
            const res = await dntShim.fetch(url + "/api/v1/keys", {
                method: "DELETE",
                headers: { Authorization: `Bearer ${rootAPIKey}` },
                body: JSON.stringify({ id }),
            });
            const body = await res.json();
            return DeleteKeyResSchema.parse(body);
        },
        async rotateUserAPIKey(id) {
            const res = await dntShim.fetch(url + "/api/v1/keys/rotate", {
                method: "POST",
                headers: { Authorization: `Bearer ${rootAPIKey}` },
                body: JSON.stringify({ id }),
            });
            const body = await res.json();
            return RotateKeySchema.parse(body);
        },
        async addRoles(userAPIKeyId, roles) {
            const res = await dntShim.fetch(url + "/api/v1/keys/roles", {
                method: "POST",
                headers: { Authorization: `Bearer ${rootAPIKey}` },
                body: JSON.stringify({ id: userAPIKeyId, roles }),
            });
            const body = await res.json();
            return AddRoleSchema.parse(body);
        },
        async removeRoles(userAPIKeyId, roles) {
            const res = await dntShim.fetch(url + "/api/v1/keys/roles", {
                method: "DELETE",
                headers: { Authorization: `Bearer ${rootAPIKey}` },
                body: JSON.stringify({ id: userAPIKeyId, roles }),
            });
            const body = await res.json();
            return RemoveRolesSchema.parse(body);
        },
        async verifyUserAPIKey(userAPIKey, endpointName, variables = []) {
            const ratelimits = endpoints[endpointName];
            const roles = ratelimits.roles ? ratelimits.roles : {};
            const res = await dntShim.fetch(url + "/api/v1/keys/verify", {
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
