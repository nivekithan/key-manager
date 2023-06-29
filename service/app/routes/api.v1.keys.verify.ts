import {
  findRatelimitToUse,
  generateIDForAPIKey,
  getUserAPIKeyRecord,
} from "@/lib/apiKeys.server";
import { authorizeAPIRequest } from "@/lib/auth.server";
import { errors } from "@/lib/errors.server";
import { rateLimiter } from "@/lib/util/ratelimiter.server";
import { json, type ActionArgs } from "@remix-run/node";
import { z } from "zod";

const RatelimitSchema = z.object({
  maxReq: z
    .number()
    .positive()
    .int(`maxRequests accepts only positive integers`),
  duration: z
    .number()
    .positive()
    .int("duration accepts only positive integers"),
});

const InputSchema = z.object({
  apikey: z.string().nonempty(),
  endpoint: z.string().nonempty(),
  variables: z.array(z.string()),
  ratelimits: z.intersection(
    z.object({ DEFAULT: RatelimitSchema }),
    z.record(z.string(), RatelimitSchema)
  ),
});

export type InputRatelimit = z.infer<typeof InputSchema>["ratelimits"];

export async function action({ request }: ActionArgs) {
  const method = request.method;

  if (method !== "POST") {
    return json(null, {
      status: 405,
      headers: { Allow: "POST" },
      statusText: `Method ${method} not allowed`,
    } as const);
  }

  const statusOfAuthorization = await authorizeAPIRequest(request);

  if (!statusOfAuthorization.authorized) {
    return json(
      {
        success: false,
        reason: statusOfAuthorization.reason,
        error: statusOfAuthorization.error,
      },
      {
        status: 401,
        statusText: statusOfAuthorization.reason,
      }
    );
  }

  const unvalidatedBody = InputSchema.safeParse(await request.json());

  if (!unvalidatedBody.success) {
    console.log(unvalidatedBody.error.message);
    return json(
      {
        success: false,
        error: errors.invalidBody,
        reason: unvalidatedBody.error.message,
      },
      {
        status: 400,
        statusText: "Bad Request",
      } as const
    );
  }

  const { apikey, ratelimits, endpoint, variables } = unvalidatedBody.data;

  const userAPIKeyRec = await getUserAPIKeyRecord(
    apikey,
    statusOfAuthorization.rootAPIKeyRecord.userId
  );

  if (userAPIKeyRec === null) {
    return json({
      success: true,
      ok: false,
      keyValid: false,
    } as const);
  }

  const apiKeyRoles = userAPIKeyRec.roles;
  const { duration, maxReq } = findRatelimitToUse(ratelimits, apiKeyRoles);

  const limit = await rateLimiter.get({
    duration,
    id: generateIDForAPIKey({
      endpoint,
      idOfAPIKey: userAPIKeyRec.id,
      variables,
    }),
    max: maxReq,
  });

  const ok = limit.remaining !== 0;

  if (!ok) {
    return json({
      success: true,
      ok,
      ...limit,
      remaining: Math.max(0, limit.remaining - 1),
      keyValid: true,
    } as const);
  }

  return json({
    success: true,
    ok,
    ...limit,
    remaining: Math.max(0, limit.remaining - 1),
    keyValid: true,
  } as const);
}
