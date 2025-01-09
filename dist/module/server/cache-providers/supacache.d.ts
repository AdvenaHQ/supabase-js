import "server-only";
import type { Fetch } from "../../types";
/**
 * Fetch function that integrates with Upstash Redis for caching GET requests.
 *
 * @param input - The input URL or Request object for the fetch request.
 * @param init - Optional configuration object for the fetch request.
 *
 * @returns A Promise that resolves to a Response object. If the request method is GET and the response is cached,
 *          it returns the cached response. Otherwise, it fetches the response from the server, caches it, and returns it.
 */
export declare const SupacacheCacheProviderFetch: Fetch;
/**
 * Options for configuring the Supabase cache provider using Supacache.
 */
export type UseSupabaseCacheSupacacheProviderOptions = {
    /**
     * The cache provider key for this cache provider.
     */
    provider: "supacache";
    /**
     * Configuration options for the Supacache (middleware) cache provider.
     *
     * @see https://github.com/AdvenaHQ/supacache
     */
    supacache: {
        /**
         * The URL of the Supacache middleware service.
         */
        url: string;
        /**
         * The cache service (auth) key for the Supacache middleware service. This is the
         * `SUPACACHE_SERVICE_KEY` secret configured on the worker.
         *
         * @see https://github.com/AdvenaHQ/supacache?tab=readme-ov-file#middleware-worker-setup
         */
        serviceKey?: string | undefined;
    };
    /**
     * The caching strategy to use for the provider.
     *
     * Possible values:
     * - `"cache-everything"`: Cache all responses.
     * - `"cache-public"`: Cache only responses to queries on the 'public' schema.
     * - `"cache-instructed"`: Cache responses based on whether the Supabase command has been constructed with `.cache()` called.
     * - `"no-cache"`: Do not cache any responses.
     *
     * @default "cache-everything" (cache all responses)
     */
    strategy?: "cache-everything" | "cache-public" | "cache-instructed" | "no-cache";
};
