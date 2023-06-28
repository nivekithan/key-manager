// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
import { APIKeyFilter } from "@/components/apiKeyFilter";
import { UserAPIKeyDataTable } from "@/components/userAPIKeyDataTable";
import {
  addRolesToUserAPIKey,
  deleteUserAPIKey,
  generateAPIKey,
  getPaginatedUserAPIKeys,
  getUserAPIKeyRecordById,
  getUserRootAPIKeyRecord,
  removeRolesToUserAPIKey,
  rolesToAddAndRemove,
  rotateUserAPIKey,
  storeRootAPIKey,
} from "@/lib/apiKeys.server";
import { requireUserId } from "@/lib/auth.server";
import { parseSearchQuery } from "@/lib/search";
import {
  type LoaderArgs,
  type ActionArgs,
  json,
  redirect,
} from "@remix-run/node";
import {
  type ShouldRevalidateFunction,
  useFetcher,
  useLoaderData,
} from "@remix-run/react";
import { z } from "zod";

export const shouldRevalidate: ShouldRevalidateFunction = ({
  actionResult,
  defaultShouldRevalidate,
}) => {
  if (
    actionResult &&
    "loaderRevalidate" in actionResult &&
    !actionResult.loaderRevalidate
  ) {
    return false;
  }

  return defaultShouldRevalidate;
};

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const [apiKey, userAPIKeyList] = await Promise.all([
    getUserRootAPIKeyRecord(userId),
    getPaginatedUserAPIKeys(userId),
  ]);

  if (apiKey instanceof Error) {
    throw new Response(null, {
      status: 500,
      statusText: "Internal Server Error",
    });
  }

  const isAPIKeyGenerated = apiKey !== null;
  const searchQuery = parseSearchQuery(new URL(request.url));

  if (searchQuery === null) {
    return redirect("/admin");
  }

  return json({ isAPIKeyGenerated, userAPIKeyList, searchQuery });
}

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const parseAction = z
    .union([
      z.literal("generateAPIKey"),
      z.literal("rotateAPIKey"),
      z.literal("deleteAPIKey"),
      z.literal("editRoles"),
    ])
    .safeParse(formData.get("action"));

  if (!parseAction.success) {
    return json(
      { success: false, reason: parseAction.error.message } as const,
      { status: 400 }
    );
  }

  const action = parseAction.data;

  if (action === "generateAPIKey") {
    const { apiKey } = await generateAPIKey("root");
    const apiKeyDoc = await storeRootAPIKey({ userId, apiKey });

    if (apiKeyDoc instanceof Error) {
      console.log(apiKeyDoc);
      return json({ success: false, reason: apiKeyDoc.message } as const, {
        status: 500,
      });
    }

    return json({ success: true, apiKey, action: "generateAPIKey" } as const);
  } else if (action === "rotateAPIKey") {
    const parseUserAPIKeyIdField = z
      .string()
      .safeParse(formData.get("userAPIKeyId"));

    if (!parseUserAPIKeyIdField.success) {
      return json(
        {
          success: false,
          reason: parseUserAPIKeyIdField.error.message,
        } as const,
        { status: 400 }
      );
    }

    const userAPIKeyId = parseUserAPIKeyIdField.data;

    const userAPIKeyRec = await getUserAPIKeyRecordById(userAPIKeyId, userId);

    if (userAPIKeyRec === null) {
      return json(
        {
          success: false,
          reason: `There is no userAPIKey with id: ${userAPIKeyId}`,
        } as const,
        { status: 400 }
      );
    }

    const { apiKey: newAPIKey } = await rotateUserAPIKey(
      userAPIKeyId,
      userAPIKeyRec.prefix
    );

    return json({
      success: true,
      apiKey: newAPIKey,
      action: "rotateAPIKey",
      id: userAPIKeyId,
      loaderRevalidate: false,
    } as const);
  } else if (action === "deleteAPIKey") {
    const parseUserAPIKeyIdField = z
      .string()
      .safeParse(formData.get("userAPIKeyId"));

    if (!parseUserAPIKeyIdField.success) {
      return json(
        {
          success: false,
          reason: parseUserAPIKeyIdField.error.message,
        } as const,
        { status: 400 }
      );
    }

    const userAPIKeyId = parseUserAPIKeyIdField.data;

    const userAPIKeyRec = await getUserAPIKeyRecordById(userAPIKeyId, userId);

    if (userAPIKeyRec === null) {
      return json(
        {
          success: false,
          reason: `There is no userAPIKey with id: ${userAPIKeyId}`,
        } as const,
        { status: 400 }
      );
    }

    await deleteUserAPIKey(userAPIKeyId);

    return json({
      success: true,
      action: "deleteAPIKey",
      id: userAPIKeyId,
    } as const);
  } else if (action === "editRoles") {
    const newRolesFormField = z.string().safeParse(formData.get("newRoles"));
    const userAPIKeyIdField = z
      .string()
      .safeParse(formData.get("userAPIKeyId"));

    if (!newRolesFormField.success) {
      return json(
        {
          success: false,
          reason: newRolesFormField.error.message,
        } as const,
        { status: 400 }
      );
    }

    if (!userAPIKeyIdField.success) {
      return json(
        {
          success: false,
          reason: userAPIKeyIdField.error.message,
        } as const,
        { status: 400 }
      );
    }

    const newRoles = newRolesFormField.data
      .trim()
      .split(",")
      .map((v) => v.trim());

    const userAPIKeyId = userAPIKeyIdField.data;

    const userAPIKeyRec = await getUserAPIKeyRecordById(userAPIKeyId, userId);

    if (userAPIKeyRec === null) {
      return json(
        {
          success: false,
          reason: `There is no userAPIKey with id: ${userAPIKeyId}`,
        } as const,
        { status: 400 }
      );
    }

    const originalRoles = userAPIKeyRec.roles.map((v) => v.name);

    const { addRoles, removeRoles } = rolesToAddAndRemove({
      newRoles,
      originalRoles,
    });

    const addedCount = await addRolesToUserAPIKey({
      id: userAPIKeyId,
      roles: addRoles,
      userId,
    });

    const removedCount = await removeRolesToUserAPIKey({
      id: userAPIKeyId,
      roles: removeRoles,
    });

    return json({
      action: "editRoles",
      success: true,
      addedRoles: addedCount,
      removedRoles: removedCount,
    } as const);
  }

  return redirect(request.url);
}

export function useAdminFetcher() {
  const fetcher = useFetcher<typeof action>();
  return fetcher;
}

// export default function AdminPage() {
//   const { userAPIKeyList } = useLoaderData<typeof loader>();
//   const actionData = useActionData<typeof action>();
//   const isAPIListEmpty = userAPIKeyList.length === 0;
//   const apiKey = actionData?.success ? actionData.apiKey : null;

//   return (
//     <main className="min-h-screen grid place-items-center">
//       <Card className="w-96">
//         <CardHeader>
//           <CardTitle>Create new API</CardTitle>
//           <CardDescription>Each API gets its own token</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Form>
//             <Label htmlFor="api-name">Name of the API</Label>
//             <Input
//               type="text"
//               placeholder="my-app-api"
//               id="api-name"
//               name="apiName"
//             />
//           </Form>
//         </CardContent>
//         <CardFooter className="flex">
//           <Button>Generate</Button>
//         </CardFooter>
//       </Card>
//       <h1>{apiKey}</h1>
//       <Form method="POST">
//         <button type="submit" name="action" value="generateAPIKey">
//           Generate API Key
//         </button>
//       </Form>
//     </main>
//   );
// }
export default function AdminPage() {
  const { userAPIKeyList, searchQuery } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto py-10 flex flex-col gap-y-4">
      <APIKeyFilter filters={searchQuery} />
      <UserAPIKeyDataTable userAPIKeyList={userAPIKeyList} />
    </div>
  );
}
