import type { ParseOptionsReturnType, UseSupabaseOptions } from "../types";
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
export declare const parseOptions: (userOptions: UseSupabaseOptions | undefined, defaults?: UseSupabaseOptions, context?: "server" | "browser") => ParseOptionsReturnType;
