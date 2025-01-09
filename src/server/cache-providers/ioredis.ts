import "server-only";

import { Redis } from "ioredis";
import { Md5 as md5 } from "ts-md5";
import { log } from "../../helpers/log";
import type { Fetch } from "../../types";
import { globalOptions } from "../index";

/**
 * Configuration object for route caching settings.
 *
 * Each key represents a route and maps to an object containing cache settings.
 *
 * @typeParam {Object} routeConfigs - The route configuration object.
 * @property {boolean} cache - Indicates whether caching is enabled for the route.
 * @property {number | undefined} expireSetAfter - The time in seconds after which the cache expires.
 *                                                 If undefined, the cache does not expire.
 */
const routeConfigs: {
    [key: string]: { cache: boolean; expireSetAfter: number | undefined };
} = {
    "/realtime/": {
        cache: false,
        expireSetAfter: undefined,
    },
    "/auth/": {
        cache: true,
        expireSetAfter: 60,
    },
    "/storage/": {
        cache: false,
        expireSetAfter: undefined,
    },
    "/functions/": {
        cache: true,
        expireSetAfter: 30,
    },
    "/rest/": {
        cache: true,
        expireSetAfter: 900,
    },
};

/**
 * Fetch function that integrates with ioredis for caching GET requests.
 *
 * @param input - The input URL or Request object for the fetch request.
 * @param init - Optional configuration object for the fetch request.
 *
 * @returns A Promise that resolves to a Response object. If the request method is GET and the response is cached,
 *          it returns the cached response. Otherwise, it fetches the response from the server, caches it, and returns it.
 */
export const RedisCacheProviderFetch: Fetch = async (
    input,
    init?: RequestInit,
) => {
    // Make sure the cache provider is configured for Upstash Redis
    if (globalOptions?.cache?.provider !== "ioredis") {
        // Log a warning message and fall back to the default fetch
        log(
            "⚠️ The cache provider is not configured for redis (ioredis). Please check the configuration. Falling back to default fetch.",
            "warn",
            true,
        );

        // Return the default fetch
        return fetch(input, init);
    }
    // Connect to the Redis instance
    const redis = new Redis(globalOptions.cache?.ioredis?.url as string);

    // Create a request object from the input and init parameters
    const request = {
        url: new URL(input as string),
        method: init?.method || "GET",
        headers: new Headers(init?.headers),
    };

    // Determine the route of the request
    const route = `/${request.url.pathname.split("/")[1]}/`;

    // Check if the request method is a GET request
    if (request.method === "GET") {
        // Check if the route is configured for caching
        if (routeConfigs[route]?.cache) {
            try {
                // Get the cache key from the request URL
                const cacheKey = md5.hashStr(request.url.toString());

                // Check if the cache key exists in the cache
                const cachedResponse = await redis.get(cacheKey as string);

                // Check if the cached response exists
                if (cachedResponse) {
                    // Log that the response is being returned from the cache
                    log(
                        `🎯 Cache HIT for key \`${cacheKey}\` (${request.url.toString()})`,
                        "debug",
                    );

                    // Return the cached response as a Response object
                    return new Response(cachedResponse);
                }

                // Log that the response is not cached
                log(
                    `🤺 Cache MISS for key \`${cacheKey}\` (${request.url.toString()})`,
                    "debug",
                );

                // Fetch the data from the server
                const response = await fetch(input, init);

                // Clone the response to read its body
                const responseClone = response.clone();
                const responseBody = await responseClone.text();

                // Store the response body in the cache
                await redis.set(
                    cacheKey,
                    responseBody,
                    "EX",
                    routeConfigs[route]?.expireSetAfter || 60,
                );

                // Return the original response
                return response;
            } catch (error) {
                log(`Error fetching data from Redis: ${error}`, "error", true);
            }
        }
    }

    // The request method is not a GET request. Fetch the data from the server and return it
    return fetch(input, init);
};

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
