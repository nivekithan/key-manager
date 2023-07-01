import { z } from "./deps/deno.land/x/zod@v3.21.4/mod.js";
export declare const CreateKeyResSchema: z.ZodUnion<[z.ZodObject<{
    success: z.ZodLiteral<true>;
    apiKey: z.ZodString;
    id: z.ZodString;
    roles: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    success: true;
    apiKey: string;
    id: string;
    roles: string[];
}, {
    success: true;
    apiKey: string;
    id: string;
    roles: string[];
}>, z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodLiteral<"authorizationHeaderNotPresent">;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: "authorizationHeaderNotPresent";
    success: false;
    reason: string;
}, {
    error: "authorizationHeaderNotPresent";
    success: false;
    reason: string;
}>, z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodLiteral<"apiTokenNotPresent">;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: "apiTokenNotPresent";
    success: false;
    reason: string;
}, {
    error: "apiTokenNotPresent";
    success: false;
    reason: string;
}>, z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodLiteral<"invalidAPIToken">;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: "invalidAPIToken";
    success: false;
    reason: string;
}, {
    error: "invalidAPIToken";
    success: false;
    reason: string;
}>, z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodLiteral<"invalidBody">;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: "invalidBody";
    success: false;
    reason: string;
}, {
    error: "invalidBody";
    success: false;
    reason: string;
}>, z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodLiteral<"invalidId">;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: "invalidId";
    success: false;
    reason: string;
}, {
    error: "invalidId";
    success: false;
    reason: string;
}>]>;
export declare const DeleteKeyResSchema: z.ZodUnion<[z.ZodObject<{
    success: z.ZodLiteral<true>;
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    success: true;
    id: string;
}, {
    success: true;
    id: string;
}>, z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodLiteral<"authorizationHeaderNotPresent">;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: "authorizationHeaderNotPresent";
    success: false;
    reason: string;
}, {
    error: "authorizationHeaderNotPresent";
    success: false;
    reason: string;
}>, z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodLiteral<"apiTokenNotPresent">;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: "apiTokenNotPresent";
    success: false;
    reason: string;
}, {
    error: "apiTokenNotPresent";
    success: false;
    reason: string;
}>, z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodLiteral<"invalidAPIToken">;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: "invalidAPIToken";
    success: false;
    reason: string;
}, {
    error: "invalidAPIToken";
    success: false;
    reason: string;
}>, z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodLiteral<"invalidBody">;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: "invalidBody";
    success: false;
    reason: string;
}, {
    error: "invalidBody";
    success: false;
    reason: string;
}>, z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodLiteral<"invalidId">;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: "invalidId";
    success: false;
    reason: string;
}, {
    error: "invalidId";
    success: false;
    reason: string;
}>]>;
export declare const RotateKeySchema: z.ZodUnion<[z.ZodObject<{
    success: z.ZodLiteral<true>;
    id: z.ZodString;
    apikey: z.ZodString;
}, "strip", z.ZodTypeAny, {
    success: true;
    id: string;
    apikey: string;
}, {
    success: true;
    id: string;
    apikey: string;
}>, z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodLiteral<"authorizationHeaderNotPresent">;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: "authorizationHeaderNotPresent";
    success: false;
    reason: string;
}, {
    error: "authorizationHeaderNotPresent";
    success: false;
    reason: string;
}>, z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodLiteral<"apiTokenNotPresent">;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: "apiTokenNotPresent";
    success: false;
    reason: string;
}, {
    error: "apiTokenNotPresent";
    success: false;
    reason: string;
}>, z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodLiteral<"invalidAPIToken">;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: "invalidAPIToken";
    success: false;
    reason: string;
}, {
    error: "invalidAPIToken";
    success: false;
    reason: string;
}>, z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodLiteral<"invalidBody">;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: "invalidBody";
    success: false;
    reason: string;
}, {
    error: "invalidBody";
    success: false;
    reason: string;
}>, z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodLiteral<"invalidId">;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: "invalidId";
    success: false;
    reason: string;
}, {
    error: "invalidId";
    success: false;
    reason: string;
}>]>;
export declare const AddRoleSchema: z.ZodUnion<[z.ZodObject<{
    success: z.ZodLiteral<true>;
    count: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    success: true;
    count: number;
}, {
    success: true;
    count: number;
}>, z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodLiteral<"authorizationHeaderNotPresent">;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: "authorizationHeaderNotPresent";
    success: false;
    reason: string;
}, {
    error: "authorizationHeaderNotPresent";
    success: false;
    reason: string;
}>, z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodLiteral<"apiTokenNotPresent">;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: "apiTokenNotPresent";
    success: false;
    reason: string;
}, {
    error: "apiTokenNotPresent";
    success: false;
    reason: string;
}>, z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodLiteral<"invalidAPIToken">;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: "invalidAPIToken";
    success: false;
    reason: string;
}, {
    error: "invalidAPIToken";
    success: false;
    reason: string;
}>, z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodLiteral<"invalidBody">;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: "invalidBody";
    success: false;
    reason: string;
}, {
    error: "invalidBody";
    success: false;
    reason: string;
}>, z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodLiteral<"invalidId">;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: "invalidId";
    success: false;
    reason: string;
}, {
    error: "invalidId";
    success: false;
    reason: string;
}>]>;
export declare const RemoveRolesSchema: z.ZodUnion<[z.ZodObject<{
    success: z.ZodLiteral<true>;
    count: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    success: true;
    count: number;
}, {
    success: true;
    count: number;
}>, z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodLiteral<"authorizationHeaderNotPresent">;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: "authorizationHeaderNotPresent";
    success: false;
    reason: string;
}, {
    error: "authorizationHeaderNotPresent";
    success: false;
    reason: string;
}>, z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodLiteral<"apiTokenNotPresent">;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: "apiTokenNotPresent";
    success: false;
    reason: string;
}, {
    error: "apiTokenNotPresent";
    success: false;
    reason: string;
}>, z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodLiteral<"invalidAPIToken">;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: "invalidAPIToken";
    success: false;
    reason: string;
}, {
    error: "invalidAPIToken";
    success: false;
    reason: string;
}>, z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodLiteral<"invalidBody">;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: "invalidBody";
    success: false;
    reason: string;
}, {
    error: "invalidBody";
    success: false;
    reason: string;
}>, z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodLiteral<"invalidId">;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: "invalidId";
    success: false;
    reason: string;
}, {
    error: "invalidId";
    success: false;
    reason: string;
}>]>;
export declare const VerifyKeySchema: z.ZodUnion<[z.ZodObject<{
    success: z.ZodLiteral<true>;
    keyValid: z.ZodLiteral<false>;
    ok: z.ZodLiteral<false>;
}, "strip", z.ZodTypeAny, {
    success: true;
    keyValid: false;
    ok: false;
}, {
    success: true;
    keyValid: false;
    ok: false;
}>, z.ZodObject<{
    success: z.ZodLiteral<true>;
    keyValid: z.ZodLiteral<true>;
    ok: z.ZodBoolean;
    remaining: z.ZodNumber;
    total: z.ZodNumber;
    reset: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    success: true;
    keyValid: true;
    ok: boolean;
    remaining: number;
    total: number;
    reset: number;
}, {
    success: true;
    keyValid: true;
    ok: boolean;
    remaining: number;
    total: number;
    reset: number;
}>, z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodLiteral<"authorizationHeaderNotPresent">;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: "authorizationHeaderNotPresent";
    success: false;
    reason: string;
}, {
    error: "authorizationHeaderNotPresent";
    success: false;
    reason: string;
}>, z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodLiteral<"apiTokenNotPresent">;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: "apiTokenNotPresent";
    success: false;
    reason: string;
}, {
    error: "apiTokenNotPresent";
    success: false;
    reason: string;
}>, z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodLiteral<"invalidAPIToken">;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: "invalidAPIToken";
    success: false;
    reason: string;
}, {
    error: "invalidAPIToken";
    success: false;
    reason: string;
}>, z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodLiteral<"invalidBody">;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: "invalidBody";
    success: false;
    reason: string;
}, {
    error: "invalidBody";
    success: false;
    reason: string;
}>]>;
