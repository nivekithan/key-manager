import {
  getUserAPIKeyRecordById,
  rotateUserAPIKey,
} from "@/lib/apiKeys.server";
import { authorizeAPIRequest } from "@/lib/auth.server";
import { errors } from "@/lib/errors.server";
import { json, type ActionArgs } from "@remix-run/node";
import { z } from "zod";

const InputSchema = z.object({ id: z.string() });

export async function action({ request }: ActionArgs) {
  try {
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

    const { id } = unvalidatedBody.data;

    const userAPIKeyRec = await getUserAPIKeyRecordById(
      id,
      statusOfAuthorization.rootAPIKeyRecord.userId
    );
    if (userAPIKeyRec === null) {
      return json(
        {
          success: false,
          error: errors.invalidId,
          reason: `There is no userAPIKey with id: ${id}`,
        } as const,
        { status: 400 }
      );
    }

    const { apiKey: newAPIKey } = await rotateUserAPIKey(
      id,
      userAPIKeyRec.prefix
    );

    return json({ success: true, apikey: newAPIKey, id });
  } catch (err) {
    return json({
      success: false,
      error: errors.internalServerError,
      reason: JSON.stringify(err),
    });
  }
}
