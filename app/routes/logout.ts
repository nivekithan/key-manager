import { logout } from "@/lib/auth.server";
import { redirect, type ActionArgs } from "@remix-run/node";

export async function action({ request }: ActionArgs) {
  const logoutCookieHeader = await logout(request);

  return redirect("/passage", {
    headers: { "Set-Cookie": logoutCookieHeader },
  });
}
