import type { ExtendedSupabaseClient, GenericSchema, SupabaseClient, UseSupabaseGenerics } from "../types";
/**
 * Extends the Supabase client with additional functionality.
 *
 * This function overrides the `from` method of the Supabase client to return an `ExtendedQueryBuilder`.
 * The `ExtendedQueryBuilder` includes a `cache` method that allows setting a cache expiry time in seconds.
 * It also overrides the `select` method to include caching logic if caching is enabled and a cache provider is available.
 *
 * @param client - The original Supabase client to be extended.
 *
 * @returns An extended Supabase client with additional functionality.
 *
 * @template Schema - The schema type, defaults to `GenericSchema`.
 * @template Relation - The relation type, defaults to `GenericTable` or `GenericView`.
 * @template RelationName - The relation name type, defaults to `string`.
 * @template Relationships - The relationships type, defaults to an empty array.
 */
export declare function extendSupabaseClient<Database, SchemaName extends string & keyof Database = UseSupabaseGenerics<Database>["SchemaName"], Schema extends GenericSchema = UseSupabaseGenerics<Database, SchemaName>["Schema"]>(client: SupabaseClient<Database, SchemaName, Schema>): ExtendedSupabaseClient<Database, SchemaName, Schema>;
