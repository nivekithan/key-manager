import { getUserId } from "@/lib/auth.server";
import {
  redirect,
  type LoaderArgs,
  type V2_MetaFunction,
} from "@remix-run/node";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader({ request }: LoaderArgs) {
  if (new URL(request.url).pathname === "/") {
    const userId = await getUserId(request);

    if (!userId) {
      return redirect("/passage");
    }

    return redirect("/admin");
  }
}
