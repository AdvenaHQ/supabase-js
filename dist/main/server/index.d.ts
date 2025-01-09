import "server-only";
import type { ExtendedSupabaseClient, GenericSchema, SupabaseClientServerOptionsType, UseSupabaseGenerics, UseSupabaseOptions } from "../types";
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
 * Initializes and returns a Supabase server client with the provided options.
 *
 * @param {UseSupabaseOptions} [userOptions] - Optional configuration options for Supabase.
 * @returns {Promise<ExtendedSupabaseClient>} A promise that resolves to a Supabase client instance.
 */
export declare function useSupabase<Database = UseSupabaseGenerics["Database"], SchemaName extends string & keyof Database = UseSupabaseGenerics<Database>["SchemaName"], Schema extends GenericSchema = UseSupabaseGenerics<Database, SchemaName>["Schema"]>(userOptions?: UseSupabaseOptions): Promise<ExtendedSupabaseClient<Database, SchemaName, Schema>>;
export default useSupabase;
export type { ExtendedSupabaseClient as SupabaseClient, SupabaseClientServerOptionsType, };