import { initKeyManager } from "../src/index.ts";

const {
  verifyUserAPIKey,
  createUserAPIKey,
  addRoles,
  deleteUserAPIKey,
  removeRoles,
  rotateUserAPIKey,
} = initKeyManager({
  rootAPIKey: "root_iECPmTa8uDyT3bZsJ7t6X9wHCyK1YxyXwHjwEzPScqwdBuak6",
  endpoints: {
    CREATE_USER: {
      default: { maxReq: 100, duration: 60_000 },
      roles: { TEAM: { duration: 60_000, maxReq: 1000 } },
    },
  },
});

const res = await verifyUserAPIKey(
  "sdk_vQbmNZ9zMgLUF9PNm3yTuBC9oFXsvgFg371bvXySiMuYG2Exp",
  "CREATE_USER"
);

console.log(res);
