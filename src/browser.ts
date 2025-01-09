import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { parseOptions } from "./helpers/parseOptions";
import type {
    SupabaseClientBrowserOptionsType,
    UseSupabaseOptions,
} from "./types";

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
 * Initializes and returns a Supabase browser client with the provided options.
 *
 * @param {UseSupabaseOptions} [userOptions] - Optional configuration options for Supabase.
 * @returns {Promise<SupabaseClient>} A promise that resolves to a Supabase client instance.
 */
export async function useSupabase(
    userOptions?: UseSupabaseOptions | undefined,
): Promise<SupabaseClient> {
    // Parse and validate the options
    const { options, authStrategy } = parseOptions(
        userOptions,
        undefined,
        "browser",
    );

    // Initialise some variables
    let SUPABASE_API_KEY = "" as string;

    // Check whether we're using an API key or a JWT token for authentication. If we're using a token,
    // it will have already been set by the `parseOptions` function
    if (authStrategy === "key") {
        SUPABASE_API_KEY = options?.auth?.keys?.publishable as string; // We're using the publishable key
    }

    // Create a Supabase client with the provided options and return it
    return createBrowserClient(options?.supabaseUrl, SUPABASE_API_KEY, {
        // Merge the parsed client configuration with the pre-set cookies configuration option
        ...(options.config as SupabaseClientBrowserOptionsType),
    });
}

// Export the Supabase client hook as the default export
export default useSupabase;

// Export Supabase types
export type { SupabaseClient, SupabaseClientBrowserOptionsType };
