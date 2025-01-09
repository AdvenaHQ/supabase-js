import type { SupabaseClient } from "@supabase/supabase-js";
import type { SupabaseClientBrowserOptionsType, UseSupabaseOptions } from "./types";
/**
 * Global configuration options for the Supabase client.
 *
 * This variable holds the settings that will be used across the Supabase client
 * to configure its behavior. It is of type `UseSupabaseOptions`, which should
 * define the structure and possible values for these options.
 *
 * @type {UseSupabaseOptions}
 */
export declare let globalOptions: UseSupabaseOptions;
/**
 * Initializes and returns a Supabase browser client with the provided options.
 *
 * @param {UseSupabaseOptions} [userOptions] - Optional configuration options for Supabase.
 * @returns {Promise<SupabaseClient>} A promise that resolves to a Supabase client instance.
 */
export declare function useSupabase(userOptions?: UseSupabaseOptions | undefined): Promise<SupabaseClient>;
export default useSupabase;
export type { SupabaseClient, SupabaseClientBrowserOptionsType };
