import { generateAPIKey, storeUserAPIKey } from "@/lib/apiKeys.server";
import { authorizeAPIRequest } from "@/lib/auth.server";
import { json, type ActionArgs } from "@remix-run/node";

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

  const authorizedUserId = statusOfAuthorization.rootAPIKeyRecord.userId;
  const { hash, salt, apiKey } = await generateAPIKey();
  await storeUserAPIKey({
    hash,
    salt,
    userId: authorizedUserId,
  });

  return json({ apiKey });
}
