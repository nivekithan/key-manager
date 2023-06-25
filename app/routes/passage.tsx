import { getUserId } from "@/lib/auth.server";
import { redirect, type LoaderArgs } from "@remix-run/node";

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request);

  if (userId) {
    return redirect("/admin");
  }

  return null;
}

export default function PassageRegisterPage() {
  return (
    <main className="min-h-screen grid place-items-center">
      {/** @ts-ignore */}
      <passage-auth app-id="vZBRPwrrCa32l5KaYhSyUTzn"></passage-auth>
    </main>
  );
}
