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
import { NewAPIKeyDialog } from "@/components/newAPIKeyDialog";
import { Button } from "@/components/ui/button";
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
  storeUserAPIKey,
} from "@/lib/apiKeys.server";
import { requireUserId } from "@/lib/auth.server";
import { parseCursorQuery } from "@/lib/cursor";
import { parseSearchQuery } from "@/lib/search";
import { uniqueArray } from "@/lib/util/utils";
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
  useNavigate,
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
  const searchQuery = parseSearchQuery(new URL(request.url));
  const cursorQuery = parseCursorQuery(new URL(request.url));

  if (searchQuery === null) {
    return redirect("/admin");
  }

  const [apiKey, userAPIKeyList] = await Promise.all([
    getUserRootAPIKeyRecord(userId),
    getPaginatedUserAPIKeys({
      search: searchQuery,
      userId,
      cursor: cursorQuery,
    }),
  ]);

  if (apiKey instanceof Error) {
    throw new Response(null, {
      status: 500,
      statusText: "Internal Server Error",
    });
  }

  const isAPIKeyGenerated = apiKey !== null;
  const isNextPageAvaliable = userAPIKeyList.length >= 11;

  if (isNextPageAvaliable) {
    userAPIKeyList.pop();
  }

  return json({
    isAPIKeyGenerated,
    userAPIKeyList,
    searchQuery,
    nextPageCursor: isNextPageAvaliable
      ? userAPIKeyList.at(-1)?.createdAt
      : null,
  });
}

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const parseAction = z
    .union([
      z.literal("generateRootAPIKey"),
      z.literal("rotateAPIKey"),
      z.literal("deleteAPIKey"),
      z.literal("editRoles"),
      z.literal("newUserAPIKey"),
    ])
    .safeParse(formData.get("action"));

  if (!parseAction.success) {
    return json(
      { success: false, reason: parseAction.error.message } as const,
      { status: 400 }
    );
  }

  const action = parseAction.data;

  if (action === "generateRootAPIKey") {
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
  } else if (action === "newUserAPIKey") {
    const prefixField = z
      .string()
      .trim()
      .nonempty()
      .safeParse(formData.get("prefix"));

    const rolesField = z
      .string()
      .trim()
      .optional()
      .safeParse(formData.get("roles"));

    if (!prefixField.success) {
      return json(
        {
          success: false,
          reason: prefixField.error.message,
        } as const,
        { status: 400 }
      );
    }

    if (!rolesField.success) {
      return json(
        {
          success: false,
          reason: rolesField.error.message,
        } as const,
        { status: 400 }
      );
    }

    const prefix = prefixField.data;
    const roles = rolesField.data;

    const { apiKey: newAPIKey } = await generateAPIKey(prefix);
    const userAPIKeyRecord = await storeUserAPIKey({
      apiKey: newAPIKey,
      prefix,
      userId,
      roles: roles
        ? uniqueArray(roles.split(",").map((v) => v.trim()))
        : undefined,
    });

    return json({
      success: true,
      apiKey: newAPIKey,
      id: userAPIKeyRecord.id,
      action,
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
  const { userAPIKeyList, searchQuery, nextPageCursor } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-10 flex flex-col gap-y-4">
      <div className="flex justify-between">
        <APIKeyFilter filters={searchQuery} />
        <div className="flex gap-x-4">
          <NewAPIKeyDialog />
          <Button
            type="button"
            onClick={() => {
              if (nextPageCursor) {
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set("cursor", nextPageCursor);
                navigate(currentUrl.pathname + currentUrl.search);
                return;
              }
            }}
            disabled={nextPageCursor === null || nextPageCursor === undefined}
            variant="outline"
          >
            Next Page
          </Button>
        </div>
      </div>
      <UserAPIKeyDataTable userAPIKeyList={userAPIKeyList} />
    </div>
  );
}
