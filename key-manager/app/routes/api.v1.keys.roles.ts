import {
  addRolesToUserAPIKey,
  getUserAPIKeyRecordById,
  removeRolesToUserAPIKey,
} from "@/lib/apiKeys.server";
import { authorizeAPIRequest } from "@/lib/auth.server";
import { errors } from "@/lib/errors.server";
import { json, type ActionArgs } from "@remix-run/node";
import { z } from "zod";

const AddRolesInputSchema = z.object({
  id: z.string().nonempty(),
  roles: z.array(z.string().nonempty()).nonempty(),
});

const DeleteRolesInputSchema = z.object({
  id: z.string().nonempty(),
  roles: z.array(z.string().nonempty()).nonempty(),
});

export async function action({ request }: ActionArgs) {
  const method = request.method;

  if (method !== "POST" && method !== "DELETE") {
    return json(null, {
      status: 405,
      headers: { Allow: "POST,DELETE" },
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

  const userId = statusOfAuthorization.rootAPIKeyRecord.userId;

  if (method === "POST") {
    const unvalidatedBody = AddRolesInputSchema.safeParse(await request.json());

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

    const { id, roles } = unvalidatedBody.data;

    const userAPIKeyRec = await getUserAPIKeyRecordById(id, userId);

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

    const uniqueRoles = roles.filter((newRoleName) => {
      const currentAPIKeyRoles = userAPIKeyRec.roles;
      const isRoleNameDuplicated =
        currentAPIKeyRoles.find((v) => v.name === newRoleName) !== undefined;

      const isRoleNameUnique = !isRoleNameDuplicated;
      return isRoleNameUnique;
    });

    const count = await addRolesToUserAPIKey({
      id,
      roles: uniqueRoles,
      userId,
    });

    return json({ success: true, count });
  } else if (method === "DELETE") {
    const unvalidatedBody = DeleteRolesInputSchema.safeParse(
      await request.json()
    );

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

    const { id, roles } = unvalidatedBody.data;

    const userAPIKeyRec = await getUserAPIKeyRecordById(id, userId);

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

    const knownRoles = roles.filter((roleToDelete) => {
      const currentAPIKeyRoles = userAPIKeyRec.roles;
      const isRoleNamePresent =
        currentAPIKeyRoles.find((v) => v.name === roleToDelete) !== undefined;

      return isRoleNamePresent;
    });

    const count = await removeRolesToUserAPIKey({
      id,
      roles: knownRoles,
    });

    return json({ success: true, count });
  }
}
