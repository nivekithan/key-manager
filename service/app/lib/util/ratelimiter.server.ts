import RateLimiter from "async-ratelimiter";
import { Redis } from "ioredis";
import { env } from "./env.server";
import { singleton } from "./singleton.server";

const redis = singleton("redis", () => new Redis(env("REDIS_URL")));

export const rateLimiter = new RateLimiter({ db: redis });
