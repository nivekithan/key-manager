import { getUserId } from "@/lib/auth.server";
import { redirect, type LoaderArgs } from "@remix-run/node";

export async function loader({ request }: LoaderArgs) {
  if (new URL(request.url).pathname === "/") {
    const userId = await getUserId(request);

    if (!userId) {
      return redirect("/passage");
    }

    return redirect("/admin");
  }
}
