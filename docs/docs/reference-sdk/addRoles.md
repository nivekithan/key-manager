---
sidebar_position: 6
---

Use this to add roles to a `User API Key`

## Type signature of `addRoles`

```ts
async function addRoles(
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
- **`roles`** - An `array` of role names. Duplicated roles and roles which key already has will be ignored

### Returns

```ts
type Returns = {
  success: true;
  count: number;
};
```

`count` represents number of roles added to `User API Key`

### Errors

If roles are unable to add to `User API Key` successfully, then `addRoles` will return an `error`. Check the [Type signature](#type-signature-of-addroles) for possible errors that can happen
