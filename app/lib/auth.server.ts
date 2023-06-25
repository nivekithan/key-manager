import { redirect } from "@remix-run/node";
import cookie from "cookie";
import { passage } from "./util/passage.server";

export async function requireUserId(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie");

    if (!cookieHeader) {
      throw redirect("/passage");
    }

    const cookieKeyValue = cookie.parse(cookieHeader);
    const userId = await passage.authenticateRequestWithHeader({
      headers: { authorization: `Bearer ${cookieKeyValue.psg_auth_token}` },
    });

    return userId;
  } catch (err) {
    throw redirect("/passage");
  }
}

export async function getUserId(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie");

    if (!cookieHeader) {
      return null;
    }

    const cookieKeyValue = cookie.parse(cookieHeader);
    const userId = await passage.authenticateRequestWithHeader({
      headers: { authorization: `Bearer ${cookieKeyValue.psg_auth_token}` },
    });

    return userId;
  } catch (err) {
    return null;
  }
}

export async function getUserEmail(id: string) {
  const userObj = await passage.user.get(id);
  const email = userObj.email;

  return email;
}
