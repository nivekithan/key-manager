import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";

const errors = {
  authorizationHeaderNotPresent: "authorizationHeaderNotPresent",
  apiTokenNotPresent: "apiTokenNotPresent",
  invalidAPIToken: "invalidAPIToken",
  invalidBody: "invalidBody",
  invalidId: "invalidId",
  internalServerError: "internalServerError",
} as const;

function makeErrorZodSchema<error extends keyof typeof errors>(error: error) {
  return z.object({
    success: z.literal(false),
    error: z.literal(errors[error]),
    reason: z.string(),
  });
}

export const CreateKeyResSchema = z.union([
  z.object({
    success: z.literal(true),
    apiKey: z.string(),
    id: z.string(),
    roles: z.array(z.string()),
  }),
  makeErrorZodSchema("authorizationHeaderNotPresent"),
  makeErrorZodSchema("apiTokenNotPresent"),
  makeErrorZodSchema("invalidAPIToken"),
  makeErrorZodSchema("invalidBody"),
  makeErrorZodSchema("invalidId"),
]);

export const DeleteKeyResSchema = z.union([
  z.object({ success: z.literal(true), id: z.string() }),
  makeErrorZodSchema("authorizationHeaderNotPresent"),
  makeErrorZodSchema("apiTokenNotPresent"),
  makeErrorZodSchema("invalidAPIToken"),
  makeErrorZodSchema("invalidBody"),
  makeErrorZodSchema("invalidId"),
]);

export const RotateKeySchema = z.union([
  z.object({ success: z.literal(true), id: z.string(), apikey: z.string() }),
  makeErrorZodSchema("authorizationHeaderNotPresent"),
  makeErrorZodSchema("apiTokenNotPresent"),
  makeErrorZodSchema("invalidAPIToken"),
  makeErrorZodSchema("invalidBody"),
  makeErrorZodSchema("invalidId"),
]);

export const AddRoleSchema = z.union([
  z.object({ success: z.literal(true), count: z.number() }),
  makeErrorZodSchema("authorizationHeaderNotPresent"),
  makeErrorZodSchema("apiTokenNotPresent"),
  makeErrorZodSchema("invalidAPIToken"),
  makeErrorZodSchema("invalidBody"),
  makeErrorZodSchema("invalidId"),
]);

export const RemoveRolesSchema = z.union([
  z.object({ success: z.literal(true), count: z.number() }),
  makeErrorZodSchema("authorizationHeaderNotPresent"),
  makeErrorZodSchema("apiTokenNotPresent"),
  makeErrorZodSchema("invalidAPIToken"),
  makeErrorZodSchema("invalidBody"),
  makeErrorZodSchema("invalidId"),
]);

export const VerifyKeySchema = z.union([
  z.object({
    success: z.literal(true),
    keyValid: z.literal(false),
    ok: z.literal(false),
  }),
  z.object({
    success: z.literal(true),
    keyValid: z.literal(true),
    ok: z.boolean(),
    remaining: z.number(),
    total: z.number(),
    reset: z.number(),
  }),
  makeErrorZodSchema("authorizationHeaderNotPresent"),
  makeErrorZodSchema("apiTokenNotPresent"),
  makeErrorZodSchema("invalidAPIToken"),
  makeErrorZodSchema("invalidBody"),
]);
