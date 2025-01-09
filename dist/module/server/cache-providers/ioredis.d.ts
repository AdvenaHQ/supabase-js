import "server-only";
import type { Fetch } from "../../types";
/**
 * Fetch function that integrates with ioredis for caching GET requests.
 *
 * @param input - The input URL or Request object for the fetch request.
 * @param init - Optional configuration object for the fetch request.
 *
 * @returns A Promise that resolves to a Response object. If the request method is GET and the response is cached,
 *          it returns the cached response. Otherwise, it fetches the response from the server, caches it, and returns it.
 */
export declare const RedisCacheProviderFetch: Fetch;
/**
 * Options for configuring the Supabase cache provider using redis (Node Redis).
 */
export type UseSupabaseCacheRedisProviderOptions = {
    /**
     * The cache provider key for this cache provider.
     */
    provider: "ioredis";
    /**
     * Configuration options for the redis (ioredis) cache provider.
     */
    ioredis: {
        /**
         * The Connection URL of the Redis instance.
         */
        url: string;
    };
};
