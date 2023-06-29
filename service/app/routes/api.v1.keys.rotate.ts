import {
  getUserAPIKeyRecordById,
  rotateUserAPIKey,
} from "@/lib/apiKeys.server";
import { authorizeAPIRequest } from "@/lib/auth.server";
import { json, type ActionArgs } from "@remix-run/node";
import { z } from "zod";

const InputSchema = z.object({ id: z.string() });

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

  const { id } = unvalidatedBody.data;

  const userAPIKeyRec = await getUserAPIKeyRecordById(
    id,
    statusOfAuthorization.rootAPIKeyRecord.userId
  );

  if (userAPIKeyRec === null) {
    return json(`There is no user api key with id: ${id}`, { status: 400 });
  }

  const { apiKey: newAPIKey } = await rotateUserAPIKey(id, userAPIKeyRec.prefix);

  return json({ apikey: newAPIKey, id });
}
