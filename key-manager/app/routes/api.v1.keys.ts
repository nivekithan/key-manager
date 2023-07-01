import {
  deleteUserAPIKey,
  generateAPIKey,
  getUserAPIKeyRecordById,
  storeUserAPIKey,
} from "@/lib/apiKeys.server";
import { authorizeAPIRequest } from "@/lib/auth.server";
import { errors } from "@/lib/errors.server";
import { json, type ActionArgs } from "@remix-run/node";
import { z } from "zod";

const CreateKeySchema = z.object({
  prefix: z.string().nonempty(),
  roles: z.array(z.string().nonempty()).optional(),
});

const DeleteKeySchema = z.object({ id: z.string() });

/**
 *
 * Creates new user apiKey
 */
export async function action({ request }: ActionArgs) {
  try {
    const method = request.method;

    if (method !== "POST" && method !== "DELETE") {
      return new Response(null, {
        status: 405,
        headers: { Allow: "POST,DELETE" },
        statusText: `Method ${method} not allowed`,
      });
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

    const authorizedUserId = statusOfAuthorization.rootAPIKeyRecord.userId;

    if (method === "POST") {
      const unvalidatedBody = CreateKeySchema.safeParse(await request.json());

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

      const { prefix, roles } = unvalidatedBody.data;
      const { apiKey } = await generateAPIKey(prefix);
      const apiKeyRec = await storeUserAPIKey({
        apiKey,
        userId: authorizedUserId,
        prefix,
        roles,
      });

      return json({
        success: true,
        apiKey,
        id: apiKeyRec.id,
        roles: apiKeyRec.roles.map((v) => v.name),
      });
    } else if (method === "DELETE") {
      const unvalidatedBody = DeleteKeySchema.safeParse(await request.json());

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

      const userAPIKeyRec = await getUserAPIKeyRecordById(id, authorizedUserId);

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

      await deleteUserAPIKey(id);

      return json({ success: true, id } as const);
    }
  } catch (err) {
    return json({
      success: false,
      error: errors.internalServerError,
      reason: JSON.stringify(err),
    });
  }
}
