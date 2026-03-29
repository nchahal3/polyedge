import { Redis } from "@upstash/redis";

let _redis: Redis | null = null;

function getRedis(): Redis {
  if (!_redis) {
    const url = (process.env.UPSTASH_REDIS_REST_URL ?? "").trim();
    const token = (process.env.UPSTASH_REDIS_REST_TOKEN ?? "").trim();
    if (!url || !token) throw new Error("Missing Upstash Redis env vars");
    _redis = new Redis({ url, token });
  }
  return _redis;
}

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    return await getRedis().get<T>(key);
  } catch {
    return null;
  }
}

export async function setCached(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  try {
    await getRedis().set(key, value, { ex: ttlSeconds });
  } catch {
    // Non-fatal — cache miss is fine
  }
}
