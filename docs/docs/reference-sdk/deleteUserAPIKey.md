---
sidebar_position: 5
---

Use this to delete a `User API Key`

## Type signature of `deleteUserAPIKey`

```ts
async function deleteUserAPIKey(id: string): Promise<
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
    }
>;
```

### Parameters

- **`id`** - `id` of `User API Key`. You can get that `id` of `User API Key` when you have called `createUserAPIKey`.

### Returns

If `User API Key` is deleted successfully. Then the `deleteUserAPIKey` function returns

```ts
type Returns = {
  success: true;
  id: string;
  apikey: string;
};
```

`id` which is returned is same as `id` passed to `rotateUserAPIKey`

### Errors

If `User API Key` is unable to delete successfully, then `deleteUserAPIKey` will return an `error`. Check the [Type signature](#type-signature-of-deleteuserapikey) for possible errors that can happen
