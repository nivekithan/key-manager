---
sidebar_position: 7
---

Use this to remove roles from a `User API Key`

## Type signature of `remove`

```ts
async function removeRoles(
  userAPIKeyId: string,
  roles: Array<string>
): Promise<
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
  | {
      success: true;
      count: number;
    }
>;
```

### Paramters

- **`userAPIKeyId`** - `id` of `User API Key` that you got from `createUserAPIKeyId`
- **`roles`** - An `array` of role names. Duplicated roles and roles which is not present in `User API Key` will be ignored.

### Returns

```ts
type Returns = {
  success: true;
  count: number;
};
```

`count` represents number of roles removed to `User API Key`

### Errors

If roles are unable to add to `User API Key` successfully, then `removeRoles` will return an `error`. Check the [Type signature](#type-signature-of-removeroles) for possible errors that can happen
