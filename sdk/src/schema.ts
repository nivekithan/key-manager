import { z } from "https://deno.land/x/zod/mod.ts";

const errors = {
  authorizationHeaderNotPresent: "authorizationHeaderNotPresent",
  apiTokenNotPresent: "apiTokenNotPresent",
  invalidAPIToken: "invalidAPIToken",
  invalidBody: "invalidBody",
  invalidId: "invalidId",
  internalServerError: "internalServerError",
} as const;

function makeErrorZodSchema(error: keyof typeof errors) {
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