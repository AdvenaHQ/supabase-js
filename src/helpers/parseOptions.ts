import { DEFAULT_HEADERS } from "@supabase/supabase-js/dist/module/lib/constants";
import { z } from "zod";
import { log } from "../helpers/log";
import { RedisCacheProviderFetch } from "../server/cache-providers/ioredis";
import { SupacacheCacheProviderFetch } from "../server/cache-providers/supacache";
import { UpstashCacheProviderFetch } from "../server/cache-providers/upstash";
import type { ParseOptionsReturnType, UseSupabaseOptions } from "../types";
import { VERSION } from "../version";
import { deepMerge } from "./deepMerge";

/**
 * Default options for the Supabase client constructor.
 */
const defaultOptions: UseSupabaseOptions = {
    cache: undefined,
    config: {
        db: {
            schema: "public",
        },
        global: {
            headers: {
                "X-Client-Info": [
                    // Extract the Supabase client/platform info from the default headers
                    ...`${DEFAULT_HEADERS["X-Client-Info"]}`.split(","),
                    // Add the @advena/supabase package version to the client info
                    `advena-supabase/${VERSION}`,
                ]
                    // Remove any leading/trailing whitespace from the client info
                    .map((item) => item.trim())
                    // Remove any empty items from the client info
                    .filter((item) => item.trim() !== "")
                    // Join the client info items back together
                    .join(", "),
            },
        },
    },
    role: "anon",
    supabaseUrl: process?.env?.UPV_SECRETS_SUPABASE_URL || "",
    auth: {
        keys: {
            secret: process?.env
                ?.UPV_SECRETS_SUPABASE_SERVICEROLE_KEY as string,
            publishable: process?.env?.UPV_SECRETS_SUPABASE_ANON_KEY as string,
        },
    },
};

/**
 * Parses and validates the user-provided options for initializing the Supabase client.
 *
 * This function merges the user options with the default options and performs various
 * validations to ensure that the necessary configurations are provided and valid.
 *
 * @param userOptions - The user-provided options for initializing the Supabase client.
 * @param defaults - The default options for initializing the Supabase client.
 * @param context - The context in which the options are being parsed. This can be either "server" or "browser".
 *
 * @returns The validated and merged options.
 *
 * @throws Will throw an error if the required configurations are missing or invalid.
 */
export const parseOptions = (
    userOptions: UseSupabaseOptions | undefined,
    defaults?: UseSupabaseOptions,
    context: "server" | "browser" = "server",
): ParseOptionsReturnType => {
    // If a default options object is not provided, use the default options
    // biome-ignore lint/style/noParameterAssign: We need to assign the default options if they are not provided
    defaults = defaults || defaultOptions;

    // Merge the user options with the default options to start with
    let options = deepMerge(defaults, userOptions || {});

    /************************ Validate default options *************************/
    // First, check that the default options are present and valid
    if (
        !options.supabaseUrl ||
        z.string().url().safeParse(options?.supabaseUrl)?.error
    )
        log(
            `You must provide a valid Supabase URL when initialising the client. Expected a URL but received: \`(${typeof options?.supabaseUrl}) ${options?.supabaseUrl}\` instead.`,
            "error",
            true, // Throw an error
            false, // Log in all environments (including production)
        );

    // Parse and configure cache providers
    if (userOptions?.cache?.provider !== undefined)
        options = parseCacheProvider({ userOptions, options, context });

    // Now, let's determine the authentication settings that need to be used
    if (
        userOptions?.auth?.useToken &&
        (userOptions?.auth?.useToken as string).toString().trim() !== ""
    ) {
        // The user has provided a token. We will configure the Supabase client instance to use that and drop the conflicting options
        // First, drop the key values from the options
        options = {
            ...options,
            // Drop the role from the options
            role: undefined,
            config: {
                ...options?.config,
                global: {
                    ...options?.config?.global,
                    headers: {
                        ...options?.config?.global?.headers,

                        // Set the token as the Authorization header
                        Authorization: `Bearer ${userOptions.auth.useToken}`,
                    },
                },
            },
            auth: {
                ...options.auth,
                // Drop the conflicting keys from the options
                keys: {
                    secret: undefined,
                    publishable: undefined,
                },
            },
        };
    } else {
        // The user has not provided a token. We will use the keys provided in the options.
        // We need to verify that the keys are provided in the options. If not, we will use the default keys (or throw)
        // Check the secret key
        if (
            !options?.auth?.keys?.secret ||
            z.string().min(1).safeParse(options?.auth?.keys?.secret)?.error
        )
            log(
                `You must configure a valid Supabase Secret Key (auth.keys.secret) or RLS Token (auth.useToken) when initialising the client, or set the \`UPV_SECRETS_SUPABASE_SERVICEROLE_KEY\` environment variable. Expected a secret key as a string but received: \`(${typeof options?.auth?.keys?.secret}) ${options?.auth?.keys?.secret}\` instead. No default key was found and \`auth.useToken\` is not set.`,
                "error",
                true, // Throw an error
                false, // Log in all environments (including production)
            );

        // Check the publishable key
        if (
            !options?.auth?.keys?.publishable ||
            z.string().min(1).safeParse(options?.auth?.keys?.publishable)?.error
        )
            log(
                `You must configure a valid Supabase Publishable Key (auth.keys.publishable) or RLS Token (auth.useToken) when initialising the client, or set the \`UPV_SECRETS_SUPABASE_ANON_KEY\` environment variable. Expected a publishable key as a string but received: \`(${typeof options?.auth?.keys?.publishable}) ${options?.auth?.keys?.publishable}\` instead. No default key was found and \`auth.useToken\` is not set.`,
                "error",
                true, // Throw an error
                false, // Log in all environments (including production)
            );

        // Check the role
        if (!options?.role)
            log(
                `You must configure a valid Supabase role when initialising the client, or RLS Token (auth.useToken). Expected a role as a string but received: \`(${typeof options?.role}) ${options?.role}\` instead.`,
                "error",
                true, // Throw an error
                false, // Log in all environments (including production)
            );

        // Make sure that we're not trying to use a server role in the browser
        if (context === "browser" && options?.role === "service_role") {
            log(
                "useSupabase was called requesting the Service Role in the browser context. This is not allowed as it would expose your secret key. The client was automatically configured to use the Anon Role instead.",
                "warn",
                false, // Throw an error
                false, // Log in all environments (including production)
            );

            // Set the role to "anon" to prevent exposing the secret key
            options = {
                ...options,
                role: "anon",
            };
        }
    }

    // If we're in the browser context, scrub all sensitive values from the options
    if (context === "browser") {
        // Scrub the secret key
        options = {
            ...options,
            cache: undefined,
            auth: {
                ...options.auth,
                keys: {
                    ...options.auth?.keys,
                    secret: undefined,
                },
            },
        };
    }

    // Return the validated options
    return {
        options,
        authStrategy: userOptions?.auth?.useToken ? "jwt" : "key",
    };
};

/**
 * Parses and configures the cache provider options for Supabase.
 *
 * This function validates and sets up the cache provider based on the user-provided options.
 * It supports supacache, Upstash Redis, and ioredis as cache providers and ensures that the
 * necessary configuration options are provided and valid.
 *
 * @param {Object} params - The parameters for configuring the cache provider.
 * @param {UseSupabaseOptions | undefined} params.userOptions - The user-provided options for configuring Supabase.
 * @param {UseSupabaseOptions} params.options - The default options for configuring Supabase.
 * @param {"server" | "browser"} [params.context="server"] - The context in which the cache provider is being configured.
 * @returns {UseSupabaseOptions} The updated options with the configured cache provider.
 *
 * @throws Will throw an error if the necessary configuration options for the selected cache provider are not provided or invalid.
 */
const parseCacheProvider = ({
    userOptions,
    options,
    context = "server",
}: {
    userOptions: UseSupabaseOptions | undefined;
    options: UseSupabaseOptions;
    context: "server" | "browser";
}): UseSupabaseOptions => {
    /**
     * Configures the cache provider to use Upstash Redis and validates the necessary options.
     *
     * @returns {UseSupabaseOptions} The updated options with Upstash Redis configured as the cache provider.
     */
    const useUpstashRedis = (): UseSupabaseOptions => {
        // Do a type check on the provider to force type narrowing
        if (userOptions?.cache?.provider !== "upstash-redis")
            return options as UseSupabaseOptions;

        // The user has selected Upstash as the cache provider. We need to ensure that the Upstash URL is provided
        if (
            !userOptions?.cache?.upstash?.url ||
            z.string().url().safeParse(userOptions?.cache?.upstash?.url)?.error
        )
            log(
                `You must provide a valid Upstash URL (\`cache.upstash.url\`) when using Upstash as the cache provider. Expected a URL but received: \`(${typeof userOptions?.cache?.upstash?.url}) ${userOptions?.cache?.upstash?.url}\` instead.`,
                "error",
                true, // Throw an error
                false, // Log in all environments (including production)
            );

        // Check that the Upstash token is provided
        if (
            !userOptions?.cache?.upstash?.token ||
            z.string().min(1).safeParse(userOptions?.cache?.upstash?.token)
                ?.error
        )
            log(
                `You must provide a valid Upstash token (\`cache.upstash.token\`) when using Upstash as the cache provider. Expected a string but received: \`(${typeof userOptions?.cache?.upstash?.token}) ${userOptions?.cache?.upstash?.token}\` instead.`,
                "error",
                true, // Throw an error
                false, // Log in all environments (including production)
            );

        // Configure the cache provider in the options
        options = {
            ...options,
            cache: {
                ...options?.cache,
                // Set the cache provider to Upstash
                provider: "upstash-redis",

                // Merge the user options with the default options
                upstash: {
                    // Spread the user configuration options for Upstash
                    ...userOptions?.cache?.upstash,

                    // Set the default Upstash URL and token if not provided
                    url: (userOptions?.cache?.upstash?.url as string) || "",
                    token: (userOptions?.cache?.upstash?.token as string) || "",

                    // Set the default Upstash cache behaviour options if not provided
                    behaviour: {
                        // Set the default expiry time for the cache
                        expireSetAfter:
                            (userOptions?.cache?.upstash
                                ?.behaviour as number) || undefined,
                    },
                },
            },
            config: {
                ...options?.config,
                global: {
                    ...options?.config?.global,
                    fetch: UpstashCacheProviderFetch,
                },
            },
        };

        // Return the happy options
        return options;
    };

    /**
     * Configures the cache provider to use Redis (Node-Redis) and validates the Redis Connection URL.
     *
     * @returns {UseSupabaseOptions} The updated options with Redis as the cache provider.
     */
    const useNodeRedis = (): UseSupabaseOptions => {
        // Do a type check on the provider to force type narrowing
        if (userOptions?.cache?.provider !== "ioredis")
            return options as UseSupabaseOptions;

        // The user has selected Upstash as the cache provider. We need to ensure that the Redis Connection URL is provided
        if (
            !userOptions?.cache?.ioredis?.url ||
            z
                .string()
                .startsWith("redis://")
                .safeParse(userOptions?.cache?.ioredis?.url)?.error
        )
            log(
                `You must provide a valid Redis Connection URL (\`cache.ioredis.url\`) when using Redis (ioredis) as the cache provider. Expected a URL starting with "redis://" but received: \`(${typeof userOptions?.cache?.ioredis?.url}) ${userOptions?.cache?.ioredis?.url}\` instead.`,
                "error",
                true, // Throw an error
                false, // Log in all environments (including production)
            );

        // Configure the cache provider in the options
        options = {
            ...options,
            cache: {
                ...options?.cache,
                // Set the cache provider to Redis
                provider: "ioredis",

                // Merge the user options with the default options
                ioredis: {
                    // Set the default Redis URL and token if not provided
                    url:
                        (userOptions?.cache?.ioredis?.url as string) ||
                        (process.env
                            .SECRETS_SUPABASE_REDISCACHE_URL as string) ||
                        "",
                },
            },
            config: {
                ...options?.config,
                global: {
                    ...options?.config?.global,
                    fetch: RedisCacheProviderFetch,
                },
            },
        };

        // Return the happy options
        return options;
    };

    /**
     * Configures the cache provider to use Supacache and validates the necessary options.
     *
     * @returns {UseSupabaseOptions} The updated options with Redis as the cache provider.
     */
    const useSupacache = (): UseSupabaseOptions => {
        // Do a type check on the provider to force type narrowing
        if (userOptions?.cache?.provider !== "supacache")
            return options as UseSupabaseOptions;

        // The user has selected Supacache as the cache provider. We need to ensure that the Supacache URL is provided
        if (
            !userOptions?.cache?.supacache?.url ||
            z
                .string()
                .url()
                .startsWith("https://")
                .safeParse(userOptions?.cache?.supacache?.url)?.error
        )
            log(
                `You must provide a valid Supacache Middleware Worker URL (\`cache.supacache.url\`) when using Supacache as the cache provider. Expected a valid URL starting with "https://" but received: \`(${typeof userOptions?.cache?.supacache?.url}) ${userOptions?.cache?.supacache?.url}\` instead.`,
                "error",
                true, // Throw an error
                false, // Log in all environments (including production)
            );

        // We should also ensure that the Supacache service key is provided. If it's not, we'll warn the user that this is not secure
        if (
            !userOptions?.cache?.supacache?.serviceKey ||
            z
                .string()
                .min(1)
                .safeParse(userOptions?.cache?.supacache?.serviceKey)?.error
        )
            log(
                "⚠️ Supabase is configured to use supacache as the cache provider, but a supacache service key was not provided. This is not secure and may expose your cache to unauthorized access. Please review the documentation at https://github.com/AdvenaHQ/supacache?tab=readme-ov-file#%EF%B8%8F-setup for instructions on how to do this.",
                "warn",
                false, // Don't throw an error
                true, // Don't log in production environments (we don't want to pollute the logs)
            );

        // Configure the cache provider in the options
        options = {
            ...options,
            cache: {
                ...options?.cache,
                // Set the cache provider to Supacache
                provider: "supacache",

                // Merge the user options with the default options
                supacache: {
                    // Set the default Redis URL and token if not provided
                    url:
                        (userOptions?.cache?.supacache?.url as string) ||
                        (process.env
                            .SECRETS_SUPABASE_SUPACACHE_URL as string) ||
                        "",

                    // Set the default Supacache service key if not provided
                    serviceKey:
                        (userOptions?.cache?.supacache?.serviceKey as string) ||
                        (process.env
                            .SECRETS_SUPABASE_SUPACACHE_SERVICE_KEY as string) ||
                        undefined,
                },
            },
            config: {
                ...options?.config,
                global: {
                    ...options?.config?.global,
                    fetch: SupacacheCacheProviderFetch,
                },
            },
        };

        // Return the happy options
        return options;
    };

    // Make sure the context is server
    if (context !== "server") {
        // Drop the cache provider settings from the config (caching can only be used in server contexts)
        options.cache = undefined;

        // Log that we're not using the cache
        log(
            `The client was initialised with a cache provider, but the context is ${context}. Caching is only available in server contexts. Caching was automatically disabled to prevent errors.`,
            "info",
        );

        // Return the options
        return options;
    }

    // Use supacache as the configuration parser provider
    if (userOptions?.cache?.provider === "supacache") options = useSupacache();

    // Use Upstash Redis as the configuration parser provider
    if (userOptions?.cache?.provider === "upstash-redis")
        options = useUpstashRedis();

    // Use Upstash Redis as the configuration parser provider
    if (userOptions?.cache?.provider === "ioredis") options = useNodeRedis();

    // Return the parsed cache provider options
    return options;
};
