---
sidebar_position: 4
---

Use this to rotate a `User API Key`. Rotating a key will create a new key with same `id` and `roles`

## Type Signature of `rotateUserAPIKey`

```ts
async function rotateUserAPIKey(id: string): Promise<
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
      id: string;
      apikey: string;
    }
>;
```

### Parameters

- **`id`** - `id` of `User API Key`. You can get that `id` of `User API Key` when you have called `createUserAPIKey`.

### Returns

If `User API Key` is rotated successfully. Then the `rotateUserAPIKey` function returns

```ts
type Returns = {
  success: true;
  id: string;
  apikey: string;
};
```

`id` which is returned is same as `id` passed to `rotateUserAPIKey`

### Errors

If `User API Key` is unable to rotate successfully, then `rotateUserAPIKey` will return an `error`. Check the [Type signature](#type-signature-of-rotateuserapikey) for possible errors that can happen


