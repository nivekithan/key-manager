---
sidebar_position: 2
---

It creates a `User API Key` which can be give to `users` of your `api`. That `key` must be sent along while making `requests` to your `api`.

## Type signature of `createUserAPIKey`

```ts
async function createUserAPIKey(
  prefix: string,
  roles?: Array<string>
): Promise<
  | {
      success: true;
      apiKey: string;
      id: string;
      roles: string[];
    }
  | {
      error: "authorizationHeaderNotPresent";
      success: false;
      reason: string;
    }
  | {
      error: "apiTokenNotPresent";
      success: false;
      reason: string;
    }
  | {
      error: "invalidAPIToken";
      success: false;
      reason: string;
    }
  | {
      error: "invalidBody";
      success: false;
      reason: string;
    }
  | {
      error: "invalidId";
      success: false;
      reason: string;
    }
>;
```

### Parameters
- **`prefix`** - is the prefix of the generated `User API Key`. For example if the prefix is `user` then the generated `User API Key` will be `user_xxx...`.
- **`roles`** (optional) - An `array` of roles. Example `[ROLE_1, ROLE_2]`

### Returns 
If `User API Key` is generated successfully. Then the `createUserAPIKey` returns

```ts
type Returns = {
  success: true;
  apiKey: string;
  id: string;
  roles: string[];
};
```

### Errors
If `User API Key` is unable to generate successfully, then `createuserAPIKey` will return an `error`. Check the [Type signature](#type-signature-of-createuserapikey) for possible errors that can happen

