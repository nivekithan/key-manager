import {
  generateAPIKey,
  getAPIKey,
  storeHashOfAPIKey,
} from "@/lib/apiKeys.server";
import { requireUserId } from "@/lib/auth.server";
import {
  type LoaderArgs,
  type ActionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { z } from "zod";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const apiKey = await getAPIKey(userId);

  if (apiKey instanceof Error) {
    throw new Response(null, {
      status: 500,
      statusText: "Internal Server Error",
    });
  }

  const isAPIKeyGenerated = apiKey !== null;

  return json({ isAPIKeyGenerated });
}

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const parseAction = z
    .literal("generateAPIKey")
    .safeParse(formData.get("action"));

  if (!parseAction.success) {
    return json(
      { success: false, reason: parseAction.error.message } as const,
      { status: 400 }
    );
  }

  const action = parseAction.data;

  if (action === "generateAPIKey") {
    const { apiKey, hash, salt } = await generateAPIKey();
    const apiKeyDoc = await storeHashOfAPIKey({ hash, userId, salt });

    if (apiKeyDoc instanceof Error) {
      console.log(apiKeyDoc);
      return json({ success: false, reason: apiKeyDoc.message } as const, {
        status: 500,
      });
    }

    return json({ success: true, apiKey } as const);
  }

  return redirect(request.url);
}

export default function AdminPage() {
  const { isAPIKeyGenerated } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const apiKey = actionData?.success ? actionData.apiKey : null;

  return (
    <h1>
      {isAPIKeyGenerated ? (
        <h1>{apiKey ? apiKey : "APIKey is already generated"} </h1>
      ) : null}
      <Form method="post">
        <button type="submit" name="action" value="generateAPIKey">
          Generate API Key
        </button>
      </Form>
    </h1>
  );
}
