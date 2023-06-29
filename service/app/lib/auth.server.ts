import { redirect } from "@remix-run/node";
import cookie from "cookie";
import { passage } from "./util/passage.server";
import { getRootAPIKeyRecord } from "./apiKeys.server";

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

export async function getUserId(
  request: Request,
  retry: boolean = true
): Promise<string | null> {
  try {
    const cookieHeader = request.headers.get("cookie");

    if (!cookieHeader) {
      return null;
    }

    const cookieKeyValue = cookie.parse(cookieHeader);
    console.log(cookieKeyValue);
    const userId = await passage.authenticateRequestWithHeader({
      cookies: cookieKeyValue,
      headers: { authorization: `Bearer ${cookieKeyValue.psg_auth_token}` },
    });

    return userId;
  } catch (err) {
    console.log({ err, retry });
    if (retry) {
      await new Promise((r) => setTimeout(r, 1_000));

      const userId = await getUserId(request, false).catch((err) => ({
        error: true,
        err,
      }));

      if (typeof userId !== "string") {
        console.log({ error: userId?.err, retry: false });
        return null;
      }

      return userId;
    }

    return null;
  }
}

export async function logout(request: Request) {
  const cookieHeader = `psg_auth_token=deleted; path=/; expires=${new Date(
    new Date().getTime() - 1000 * 60 * 60
  ).toString()}`;

  return cookieHeader;
}

export async function getUserEmail(id: string) {
  const userObj = await passage.user.get(id);
  const email = userObj.email;

  return email;
}

export async function authorizeAPIRequest(request: Request) {
  const headers = request.headers;
  const authorizationHeader = headers.get("Authorization");

  if (authorizationHeader === null) {
    return {
      authorized: false,
      reason: `Authorization header is not present. Generate api token and pass it in Authorization header with format Bearer <api_token> when making request`,
    } as const;
  }

  const apiToken = authorizationHeader.replace("Bearer ", "");

  if (apiToken.length === 0) {
    return {
      authorized: false,
      reason: `API Token is not present in Authorization header. Generate api token and pass it in Authorization header with format Bearer <api_token> when making request`,
    } as const;
  }

  const apiKeyRec = await getRootAPIKeyRecord(apiToken);

  if (apiKeyRec === null) {
    return {
      authorized: false,
      reason: `API Token is not valid. Make sure you have provided correct API token is request`,
    } as const;
  }

  return { authorized: true, rootAPIKeyRecord: apiKeyRec };
}
