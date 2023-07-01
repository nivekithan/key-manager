"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initKeyManager = void 0;
const dntShim = __importStar(require("./_dnt.shims.js"));
const schema_js_1 = require("./schema.js");
function initKeyManager({ rootAPIKey, url = "https://key-manager.nivekithan.com", endpoints, }) {
    return {
        async createUserAPIKey(prefix, roles) {
            const res = await dntShim.fetch(url + "/api/v1/keys", {
                method: "POST",
                headers: { Authorization: `Bearer ${rootAPIKey}` },
                body: JSON.stringify({ prefix, roles }),
            });
            const body = await res.json();
            return schema_js_1.CreateKeyResSchema.parse(body);
        },
        async deleteUserAPIKey(id) {
            const res = await dntShim.fetch(url + "/api/v1/keys", {
                method: "DELETE",
                headers: { Authorization: `Bearer ${rootAPIKey}` },
                body: JSON.stringify({ id }),
            });
            const body = await res.json();
            return schema_js_1.DeleteKeyResSchema.parse(body);
        },
        async rotateUserAPIKey(id) {
            const res = await dntShim.fetch(url + "/api/v1/keys/rotate", {
                method: "POST",
                headers: { Authorization: `Bearer ${rootAPIKey}` },
                body: JSON.stringify({ id }),
            });
            const body = await res.json();
            return schema_js_1.RotateKeySchema.parse(body);
        },
        async addRoles(userAPIKeyId, roles) {
            const res = await dntShim.fetch(url + "/api/v1/keys/roles", {
                method: "POST",
                headers: { Authorization: `Bearer ${rootAPIKey}` },
                body: JSON.stringify({ id: userAPIKeyId, roles }),
            });
            const body = await res.json();
            return schema_js_1.AddRoleSchema.parse(body);
        },
        async removeRoles(userAPIKeyId, roles) {
            const res = await dntShim.fetch(url + "/api/v1/keys/roles", {
                method: "DELETE",
                headers: { Authorization: `Bearer ${rootAPIKey}` },
                body: JSON.stringify({ id: userAPIKeyId, roles }),
            });
            const body = await res.json();
            return schema_js_1.RemoveRolesSchema.parse(body);
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
            return schema_js_1.VerifyKeySchema.parse(body);
        },
    };
}
exports.initKeyManager = initKeyManager;
