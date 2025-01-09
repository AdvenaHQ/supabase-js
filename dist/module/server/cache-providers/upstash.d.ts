import "server-only";
import type { Fetch, RedisConfigNodejs } from "../../types";
/**
 * Fetch function that integrates with Upstash Redis for caching GET requests.
 *
 * @param input - The input URL or Request object for the fetch request.
 * @param init - Optional configuration object for the fetch request.
 *
 * @returns A Promise that resolves to a Response object. If the request method is GET and the response is cached,
 *          it returns the cached response. Otherwise, it fetches the response from the server, caches it, and returns it.
 */
export declare const UpstashCacheProviderFetch: Fetch;
/**
 * Options for configuring the Supabase cache provider using Upstash Redis.
 */
export type UseSupabaseCacheUpstashRedisProviderOptions = {
    /**
     * The cache provider key for this cache provider.
     */
    provider: "upstash-redis";
    /**
     * Configuration options for the Upstash Redis cache provider.
     */
    upstash: {
        /**
         * The URL of the Upstash Redis instance.
         */
        url: RedisConfigNodejs["url"];
        /**
         * The token for the Upstash Redis instance.
         */
        token: RedisConfigNodejs["token"];
        /**
         * The configuration options for the Upstash Redis client.
         */
        config?: RedisConfigNodejs;
        /**
         * The behavior options for the Upstash Redis cache provider.
         */
        behaviour?: {
            /**
             * The time, in seconds, after which cached responses should expire and be dropped from the cache.
             *
             * @default 3600 (1 hour)
             */
            expireSetAfter?: number | undefined;
        };
    } & RedisConfigNodejs;
};
