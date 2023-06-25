import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAllAPI } from "@/lib/api.server";
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
import { Form, useLoaderData } from "@remix-run/react";
import { z } from "zod";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const [apiKey, apiList] = await Promise.all([
    getAPIKey(userId),
    getAllAPI(userId),
  ]);

  if (apiKey instanceof Error) {
    throw new Response(null, {
      status: 500,
      statusText: "Internal Server Error",
    });
  }

  const isAPIKeyGenerated = apiKey !== null;

  return json({ isAPIKeyGenerated, apiList: apiList });
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
  const { apiList } = useLoaderData<typeof loader>();
  const isAPIListEmpty = apiList.length === 0;

  return (
    <main className="min-h-screen grid place-items-center">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Create new API</CardTitle>
          <CardDescription>Each API gets its own token</CardDescription>
        </CardHeader>
        <CardContent>
          <Form>
            <Label htmlFor="api-name">Name of the API</Label>
            <Input
              type="text"
              placeholder="my-app-api"
              id="api-name"
              name="apiName"
            />
          </Form>
        </CardContent>
        <CardFooter className="flex">
          <Button>Generate</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
