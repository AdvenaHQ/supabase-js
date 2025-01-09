import "server-only";

import { log } from "../../helpers/log";
import type { Fetch } from "../../types";
import { globalOptions } from "../index";

/**
 * Fetch function that integrates with Upstash Redis for caching GET requests.
 *
 * @param input - The input URL or Request object for the fetch request.
 * @param init - Optional configuration object for the fetch request.
 *
 * @returns A Promise that resolves to a Response object. If the request method is GET and the response is cached,
 *          it returns the cached response. Otherwise, it fetches the response from the server, caches it, and returns it.
 */
export const SupacacheCacheProviderFetch: Fetch = async (
    input,
    init?: RequestInit,
) => {
    // Make sure the cache provider is configured for Upstash Redis
    if (globalOptions?.cache?.provider !== "supacache") {
        // Log a warning message and fall back to the default fetch
        log(
            "⚠️ The cache provider is not configured for supacache. Please check the configuration. Falling back to default fetch.",
            "warn",
            true,
        );

        // Return the default fetch
        return fetch(input, init);
    }

    // Create a request object from the input and init parameters
    const request = {
        url: new URL(input as string),
        method: init?.method || "GET",
        headers: new Headers(init?.headers),
    };

    // Parse the configured supacache URL for later use
    const supacacheUrl = new URL(
        globalOptions?.cache?.supacache?.url as string,
    );

    // Check if the request method is a GET request
    if (request.method === "GET") {
        // It is a GET request. Initialise the headers for the fetch request
        const fetchHeaders = new Headers({
            ...Object.fromEntries(request?.headers?.entries()),
            ...(globalOptions?.config?.global?.headers || {}),
        });

        if (
            request.url.hostname.includes(supacacheUrl.hostname) || // Check if the request URL contains the supacache middleware service domain
            request.url.hostname.includes(".supabase.co")
        )
            // Example of adding custom headers

            // Check to see if the request url contains a Supabase URL (if it does, we
            // need to replace it with the supacache URL). Otherwise, if it's the same domain as the
            // configured supacache url, we can just proceed with the request.
            // Check if the request URL contains the Supabase domain
            request.url.hostname = supacacheUrl.hostname; // One of the conditions were met. Replace the request url domain (the Supabase URL) with the Supacache URL

        // Set the service key header for the Supacache middleware service
        fetchHeaders.set(
            "x-cache-service-key",
            globalOptions?.cache?.supacache?.serviceKey as string,
        );

        // Fetch the data from the middleware service (supacache worker) and return the result
        return fetch(request.url, {
            ...init,
            headers: fetchHeaders,
        });
    }

    // It is not a GET request. Fetch the data from the server and return the result
    return fetch(input, init);
};

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
    strategy?:
        | "cache-everything"
        | "cache-public"
        | "cache-instructed"
        | "no-cache";
};
