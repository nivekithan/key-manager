---
sidebar_position: 1
---

`todo:keymanager` exports only one function that is `initKeyManager`. `initKeyManager` returns an object with `keys`

1. **`createUserAPIKey`** - Use this to create new `User API Key`
2. **`verifyUserAPIKey`** - Use this to verify whether provided `User API Key` is valid and it has not exceeded ratelimit
3. **`deleteUserAPIKey`** - Use this to delete a `User API Key`
4. **`rotateUserAPIKey`** - Use this to rotate a `User API Key`. Rotating a key will create a new key with same `id` and `roles`
5. **`addRoles`** - Use this to add roles to a `User API Key`
6. **`removeRoles`** - Use this to remove roles from a `User API Key`

## Type signature of `initKeyManager`

```ts
export type Endpoints<EndpointName extends string> = {
  [name in EndpointName]: {
    default: { maxReq: number; duration: number };
    roles?: Record<string, { maxReq: number; duration: number }>;
  };
};

export type InitKeyManagerOptions<EndpointName extends string> = {
  rootAPIKey: string;
  url?: string;
  endpoints: Endpoints<EndpointName>;
};

export function initKeyManager<EndpointName extends string>({
  rootAPIKey,
  url = "https://key-manager.nivekithan.com",
  endpoints,
}: InitKeyManagerOptions<EndpointName>);
```

It takes an object with keys

1. **`rootAPIKey`** - **`string`**, `Root API Key` which you have copied from the website
2. **`url`** (optional) - **`string`**, If you have self hosted `key manager` then the url of your instance of `key manager`. Make sure the url is in this format `todo:https://key-manager.nivekithan.com`, notice there is no trailing slash (/). By default it's set to url of managed `key manager` instance at todo:https://key-manager.nivekithan.com
3. **`endpoints`** - Define `endpoints` you have to ratelimit and their ratelimits.

```ts
export type Endpoints<EndpointName extends string> = {
  [name in EndpointName]: {
    default: { maxReq: number; duration: number };
    roles?: Record<string, { maxReq: number; duration: number }>;
  };
};
```

**`endpoints`** is an object with each key specifying the `endpoint` name and corresponding value is an object with keys `defaults` and `roles?`.

- **`default`** - Its type signature is `{maxReq : number; duration : number}` where `maxReq` is maximum number of requests allowed for `duration` in microseconds.

- **`roles`** (optional) - Its type signature is `Record<string, {maxReq : number; duration : number}>`. Its an object with `role` as its keys and ratelimit as their values.

To know how does `key manager` choose which ratelimit to apply checkout todo

## Example

Its recommended that you create a new file called `keyManager.ts` in that initialize the `key manager`.

### 1. Endpoint with different ratelimits per pricing plane

```ts
// keyManager.ts
import { initKeyManager } from "todo:keymanger";

export const {
  verifyUserAPIKey,
  createUserAPIKey,
  addRoles,
  deleteUserAPIKey,
  removeRoles,
  rotateUserAPIKey,
} = initKeyManager({
  rootAPIKey: process.env.KEY_MANAGER_ROOT_KEY,
  endpoints: {
    CREATE_USER: {
      default: { duration: 60_000, maxReq: 100 },
      roles: {
        PRO: { duration: 60_000, maxReq: 1000 },
        TEAM: { duration: 60_000, maxReq: 5000 },
      },
    },
  },
});
```

It initializes `key manager` with a single endpoint `CREATE_USER`. For **FREE** tier users it supports maximum `100 Requests` per `1 min`, for **PRO** tier users it supports maximum `1000 Requests` per `1 min` and for **TEAM** tier users it supports maximum `5000 requests` per `1 min`
