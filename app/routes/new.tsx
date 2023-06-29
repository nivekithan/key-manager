import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import {
  generateAPIKey,
  getUserRootAPIKeyRecord,
  storeRootAPIKey,
} from "@/lib/apiKeys.server";
import { requireUserId } from "@/lib/auth.server";
import {
  redirect,
  type LoaderArgs,
  type ActionArgs,
  json,
} from "@remix-run/node";
import {
  Form,
  type ShouldRevalidateFunction,
  useActionData,
  useNavigation,
  Link,
} from "@remix-run/react";
import { z } from "zod";

export function shouldRevalidate({
  actionResult,
  defaultShouldRevalidate,
}: Parameters<ShouldRevalidateFunction>[0]) {
  if (
    actionResult &&
    "loaderRevalidate" in actionResult &&
    !actionResult.loaderRevalidate
  ) {
    return false;
  }

  return defaultShouldRevalidate;
}

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const apiKey = await getUserRootAPIKeyRecord(userId);

  if (apiKey instanceof Error) {
    throw new Response(null, {
      status: 500,
      statusText: "Internal Server Error",
    });
  }

  const isAPIKeyGenerated = apiKey !== null;

  if (isAPIKeyGenerated) {
    return redirect("/admin");
  }

  return null;
}

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const actionField = z
    .literal("generateRootAPIKey")
    .safeParse(formData.get("action"));

  if (!actionField.success) {
    return json(
      { success: false, reason: actionField.error.message } as const,
      { status: 400 }
    );
  }

  const { apiKey } = await generateAPIKey("root");
  const apiKeyDoc = await storeRootAPIKey({ userId, apiKey });

  if (apiKeyDoc instanceof Error) {
    console.log(apiKeyDoc);
    return json({ success: false, reason: apiKeyDoc.message } as const, {
      status: 500,
    });
  }

  return json({
    success: true,
    apiKey,
    action: "generateAPIKey",
    loaderRevalidate: false,
  } as const);
}

export default function NewMemberPage() {
  const actionData = useActionData<typeof action>();
  const navigationState = useNavigation();
  const isGeneratingAPIKey = navigationState.state === "submitting";

  const apiKey =
    actionData && actionData.success && actionData.apiKey
      ? actionData.apiKey
      : null;

  return (
    <div className="py-10 grid place-items-center">
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>
            {apiKey ? "Copy Root API Key" : "Generate Root API Key"}
          </CardTitle>
          <CardDescription>
            {apiKey
              ? "Copy Root API Key and store it safely. It will not be shown again."
              : "To generate and verify the api keys. First you have to create Root API Key. Use this Root API key to authenticate your requests to our api"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {apiKey ? (
            <div className="flex flex-col gap-y-2">
              <p className="px-3 py-2 text-sm border rounded-md">{apiKey}</p>
              <Button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(apiKey);
                  toast({ description: "Copied Root API Key to clipboard" });
                }}
              >
                Copy API Key
              </Button>
              <Button asChild variant="outline">
                <Link to="/admin">Continue to Admin page</Link>
              </Button>
            </div>
          ) : (
            <Form method="POST">
              <Button
                type="submit"
                className="w-full"
                name="action"
                value="generateRootAPIKey"
              >
                {isGeneratingAPIKey
                  ? "Generating New API Key..."
                  : "Generate Root API Key"}
              </Button>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
