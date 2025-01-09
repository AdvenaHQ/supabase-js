import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { parseOptions } from "../helpers/parseOptions";
import type {
    ExtendedSupabaseClient,
    GenericSchema,
    SupabaseClientServerOptionsType,
    UseSupabaseGenerics,
    UseSupabaseOptions,
} from "../types";
import { extendSupabaseClient } from "./extend";

/**
 * Global configuration options for the Supabase client.
 *
 * This variable holds the settings that will be used across the Supabase client
 * to configure its behavior. It is of type `UseSupabaseOptions`, which should
 * define the structure and possible values for these options.
 *
 * @type {UseSupabaseOptions}
 */
export let globalOptions: UseSupabaseOptions;

/**
 * Initializes and returns a Supabase server client with the provided options.
 *
 * @param {UseSupabaseOptions} [userOptions] - Optional configuration options for Supabase.
 * @returns {Promise<ExtendedSupabaseClient>} A promise that resolves to a Supabase client instance.
 */
export async function useSupabase<
    Database = UseSupabaseGenerics["Database"],
    SchemaName extends string &
        keyof Database = UseSupabaseGenerics<Database>["SchemaName"],
    Schema extends GenericSchema = UseSupabaseGenerics<
        Database,
        SchemaName
    >["Schema"],
>(
    userOptions?: UseSupabaseOptions,
): Promise<ExtendedSupabaseClient<Database, SchemaName, Schema>> {
    // Get the cookies from the request headers
    const cookieStore = await cookies();

    // Parse and validate the options
    const { options, authStrategy } = parseOptions(userOptions);

    // Initialise some variables
    let SUPABASE_API_KEY = "" as string;

    // Check whether we're using an API key or a JWT token for authentication. If we're using a token,
    // it will have already been set by the `parseOptions` function
    if (authStrategy === "key") {
        // We're using a Supabase API key. Determine whether we are using the secret or publishable key based on the role
        if (options.role === "service_role")
            SUPABASE_API_KEY = options?.auth?.keys?.secret as string; // We're using the secret key
        else SUPABASE_API_KEY = options?.auth?.keys?.publishable as string; // We're using the publishable key
    }

    // Store the global options for later use
    globalOptions = options;

    // A note on the `cookies` option and the `service_role` role:
    //
    //    Cookies need to be disabled when using the service role, otherwise the Supabase client tries to set cookies. This
    //    is an issue if your current user is authenticated with Supabase Auth as the Supabase JS client forces the server
    //    to use the RLS policies applied to cookies always (which in that case, would be your non-superadmin user).
    //
    // Construct a Supabase client with the provided options
    // @ts-expect-error - Our cookies implementation is not supported by the Supabase client type definitions yet.
    const client = createServerClient<Database, SchemaName, Schema>(
        options.supabaseUrl,
        SUPABASE_API_KEY,
        {
            cookies: {
                /**
                 * Retrieves all cookies from the cookie store.
                 */
                getAll() {
                    // Handle cookies when using the service role (see above)
                    if (options.role === "service_role") return [];

                    // Return all cookies from the cookie store when not using the service role
                    return cookieStore.getAll();
                },

                /**
                 * Sets multiple cookies using the provided array of cookie objects.
                 */
                // biome-ignore lint/suspicious/noExplicitAny: This is necessary to set cookies
                setAll(cookiesToSet: any) {
                    // Handle cookies when using the service role (see above)
                    if (options.role === "service_role") return;

                    try {
                        for (const { name, value, options } of cookiesToSet) {
                            cookieStore.set(name, value, options);
                        }
                    } catch {} // The `setAll` method was called from a Server Component. This can be ignored if you have middleware refreshing user sessions.
                },
            },
            // Merge the parsed client configuration with the pre-set cookies configuration option
            ...options.config,
        },
    );

    // Extend the Supabase client with additional functionality and return it
    return extendSupabaseClient<Database, SchemaName, Schema>(
        client,
    ) as ExtendedSupabaseClient<Database, SchemaName, Schema>;
}

// Export the Supabase client hook as the default export
export default useSupabase;

// Export Supabase types for convenient external use
export type {
    ExtendedSupabaseClient as SupabaseClient,
    SupabaseClientServerOptionsType,
};
