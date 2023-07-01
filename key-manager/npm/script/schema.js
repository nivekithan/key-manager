"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyKeySchema = exports.RemoveRolesSchema = exports.AddRoleSchema = exports.RotateKeySchema = exports.DeleteKeyResSchema = exports.CreateKeyResSchema = void 0;
const mod_js_1 = require("./deps/deno.land/x/zod@v3.21.4/mod.js");
const errors = {
    authorizationHeaderNotPresent: "authorizationHeaderNotPresent",
    apiTokenNotPresent: "apiTokenNotPresent",
    invalidAPIToken: "invalidAPIToken",
    invalidBody: "invalidBody",
    invalidId: "invalidId",
    internalServerError: "internalServerError",
};
function makeErrorZodSchema(error) {
    return mod_js_1.z.object({
        success: mod_js_1.z.literal(false),
        error: mod_js_1.z.literal(errors[error]),
        reason: mod_js_1.z.string(),
    });
}
exports.CreateKeyResSchema = mod_js_1.z.union([
    mod_js_1.z.object({
        success: mod_js_1.z.literal(true),
        apiKey: mod_js_1.z.string(),
        id: mod_js_1.z.string(),
        roles: mod_js_1.z.array(mod_js_1.z.string()),
    }),
    makeErrorZodSchema("authorizationHeaderNotPresent"),
    makeErrorZodSchema("apiTokenNotPresent"),
    makeErrorZodSchema("invalidAPIToken"),
    makeErrorZodSchema("invalidBody"),
    makeErrorZodSchema("invalidId"),
]);
exports.DeleteKeyResSchema = mod_js_1.z.union([
    mod_js_1.z.object({ success: mod_js_1.z.literal(true), id: mod_js_1.z.string() }),
    makeErrorZodSchema("authorizationHeaderNotPresent"),
    makeErrorZodSchema("apiTokenNotPresent"),
    makeErrorZodSchema("invalidAPIToken"),
    makeErrorZodSchema("invalidBody"),
    makeErrorZodSchema("invalidId"),
]);
exports.RotateKeySchema = mod_js_1.z.union([
    mod_js_1.z.object({ success: mod_js_1.z.literal(true), id: mod_js_1.z.string(), apikey: mod_js_1.z.string() }),
    makeErrorZodSchema("authorizationHeaderNotPresent"),
    makeErrorZodSchema("apiTokenNotPresent"),
    makeErrorZodSchema("invalidAPIToken"),
    makeErrorZodSchema("invalidBody"),
    makeErrorZodSchema("invalidId"),
]);
exports.AddRoleSchema = mod_js_1.z.union([
    mod_js_1.z.object({ success: mod_js_1.z.literal(true), count: mod_js_1.z.number() }),
    makeErrorZodSchema("authorizationHeaderNotPresent"),
    makeErrorZodSchema("apiTokenNotPresent"),
    makeErrorZodSchema("invalidAPIToken"),
    makeErrorZodSchema("invalidBody"),
    makeErrorZodSchema("invalidId"),
]);
exports.RemoveRolesSchema = mod_js_1.z.union([
    mod_js_1.z.object({ success: mod_js_1.z.literal(true), count: mod_js_1.z.number() }),
    makeErrorZodSchema("authorizationHeaderNotPresent"),
    makeErrorZodSchema("apiTokenNotPresent"),
    makeErrorZodSchema("invalidAPIToken"),
    makeErrorZodSchema("invalidBody"),
    makeErrorZodSchema("invalidId"),
]);
exports.VerifyKeySchema = mod_js_1.z.union([
    mod_js_1.z.object({
        success: mod_js_1.z.literal(true),
        keyValid: mod_js_1.z.literal(false),
        ok: mod_js_1.z.literal(false),
    }),
    mod_js_1.z.object({
        success: mod_js_1.z.literal(true),
        keyValid: mod_js_1.z.literal(true),
        ok: mod_js_1.z.boolean(),
        remaining: mod_js_1.z.number(),
        total: mod_js_1.z.number(),
        reset: mod_js_1.z.number(),
    }),
    makeErrorZodSchema("authorizationHeaderNotPresent"),
    makeErrorZodSchema("apiTokenNotPresent"),
    makeErrorZodSchema("invalidAPIToken"),
    makeErrorZodSchema("invalidBody"),
]);
