import { generateIDForAPIKey, getUserAPIKeyRecord } from "@/lib/apiKeys.server";
import { authorizeAPIRequest } from "@/lib/auth.server";
import { rateLimiter } from "@/lib/util/ratelimiter.server";
import { json, type ActionArgs } from "@remix-run/node";
import { z } from "zod";

const InputSchema = z.object({
  apiKey: z.string().nonempty(),
  endpoint: z.string().nonempty(),
  variables: z.array(z.string()),
  duration: z
    .number()
    .positive()
    .int("Duration accepts only positive integers "),
  maxReq: z.number().positive().int("Requests accepts only positive integers"),
});

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
    return json(statusOfAuthorization.reason, {
      status: 401,
      statusText: statusOfAuthorization.reason,
    } as const);
  }

  const unvalidatedBody = InputSchema.safeParse(await request.json());

  if (!unvalidatedBody.success) {
    return json(unvalidatedBody.error.message, {
      status: 400,
      statusText: "Bad Request",
    } as const);
  }

  const { apiKey, duration, maxReq, endpoint, variables } =
    unvalidatedBody.data;

  const userAPIKeyRec = await getUserAPIKeyRecord(
    apiKey,
    statusOfAuthorization.rootAPIKeyRecord.userId
  );

  if (userAPIKeyRec === null) {
    return json({ shouldProcess: false, reason: "Invalid API Key" } as const);
  }

  const limit = await rateLimiter.get({
    duration,
    id: generateIDForAPIKey({
      endpoint,
      idOfAPIKey: userAPIKeyRec.id,
      variables,
    }),
    max: maxReq,
  });

  const shouldProcess = limit.remaining !== 0;

  if (!shouldProcess) {
    return json({
      shouldProcess,
      ...limit,
      remaining: Math.max(0, limit.remaining - 1),
      reason: "Rate Limit Exceeded",
    } as const);
  }

  return json({
    shouldProcess,
    ...limit,
    remaining: Math.max(0, limit.remaining - 1),
  } as const);
}
