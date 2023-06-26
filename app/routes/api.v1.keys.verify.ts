import { hashAPIKey } from "@/lib/apiKeys.server";
import { authorizeAPIRequest } from "@/lib/auth.server";
import { rateLimiter } from "@/lib/util/ratelimiter.server";
import { json, type ActionArgs } from "@remix-run/node";
import { z } from "zod";

const InputSchema = z.object({
  apiKey: z.string(),
  duration: z.number().int("Duration accepts only positive integers "),
  maxReq: z.number().int("Requests accepts only positive integers"),
});

export async function action({ request }: ActionArgs) {
  const method = request.method;

  if (method !== "POST") {
    return json(null, {
      status: 405,
      headers: { Allow: "POST" },
      statusText: `Method ${method} not allowed`,
    });
  }

  const statusOfAuthorization = await authorizeAPIRequest(request);

  if (!statusOfAuthorization.authorized) {
    return json(statusOfAuthorization.reason, {
      status: 401,
      statusText: statusOfAuthorization.reason,
    });
  }

  const unvalidatedBody = InputSchema.safeParse(await request.json());

  if (!unvalidatedBody.success) {
    return json(unvalidatedBody.error.message, {
      status: 400,
      statusText: "Bad Request",
    });
  }

  const { apiKey, duration, maxReq } = unvalidatedBody.data;
  const [{ hash: hashedAPIKey }] = await Promise.all([hashAPIKey(apiKey)]);

  const limit = await rateLimiter.get({
    duration,
    id: hashedAPIKey,
    max: maxReq,
  });

  const shouldProcess = limit.remaining !== 0;

  return json({
    shouldProcess,
    ...limit,
    remaining: Math.max(0, limit.remaining - 1),
  });
}
