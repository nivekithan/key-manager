import { generateAPIKey, storeUserAPIKey } from "@/lib/apiKeys.server";
import { authorizeAPIRequest } from "@/lib/auth.server";
import { json, type ActionArgs } from "@remix-run/node";
import { z } from "zod";

const InputSchema = z.object({ prefix: z.string() });
/**
 * Creates new user apiKey
 */
export async function action({ request }: ActionArgs) {
  const method = request.method;

  if (method !== "POST") {
    return new Response(null, {
      status: 405,
      headers: { Allow: "POST" },
      statusText: `Method ${method} not allowed`,
    });
  }
  const statusOfAuthorization = await authorizeAPIRequest(request);

  if (!statusOfAuthorization.authorized) {
    return new Response(statusOfAuthorization.reason, {
      status: 401,
      statusText: statusOfAuthorization.reason,
    });
  }
  const unvalidatedBody = InputSchema.safeParse(await request.json());

  if (!unvalidatedBody.success) {
    return json(unvalidatedBody.error.message, {
      status: 400,
      statusText: "Bad Request",
    } as const);
  }

  const { prefix } = unvalidatedBody.data;
  const authorizedUserId = statusOfAuthorization.rootAPIKeyRecord.userId;
  const { apiKey } = await generateAPIKey(prefix);
  const apiKeyRec = await storeUserAPIKey({
    apiKey,
    userId: authorizedUserId,
    prefix,
  });

  return json({ apiKey, id: apiKeyRec.id });
}
