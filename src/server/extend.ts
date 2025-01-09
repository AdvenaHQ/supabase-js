import type {
    ExtendedQueryBuilder,
    ExtendedSupabaseClient,
    GenericRelationship,
    GenericSchema,
    GenericTable,
    GenericView,
    PostgrestFilterBuilder,
    SupabaseClient,
    UseSupabaseGenerics,
} from "../types";
import { globalOptions } from "./index";

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
export function extendSupabaseClient<
    Database,
    SchemaName extends string &
        keyof Database = UseSupabaseGenerics<Database>["SchemaName"],
    Schema extends GenericSchema = UseSupabaseGenerics<
        Database,
        SchemaName
    >["Schema"],
>(
    client: SupabaseClient<Database, SchemaName, Schema>,
): ExtendedSupabaseClient<Database, SchemaName, Schema> {
    // Store the original `from` method
    const originalFrom = client.from;

    // Override the `from` method
    client.from = function <
        TableName extends string,
        Relation extends GenericTable | GenericView = GenericTable,
        Relationships extends GenericRelationship[] = [],
    >(
        this: SupabaseClient<Database, SchemaName, Schema>, // Explicitly type `this` here
        table: TableName,
    ): ExtendedQueryBuilder<Schema, Relation, TableName, Relationships> {
        // Call the original `from` method and cast the result
        const queryBuilder = originalFrom.call(
            this,
            table,
        ) as unknown as ExtendedQueryBuilder<
            Schema,
            Relation,
            TableName,
            Relationships
        >;

        // Add the `cache` method to the query builder
        queryBuilder.cache = function (expireAfterSeconds: number) {
            // Set the cache expiry time in seconds
            this.expireAfterSeconds =
                expireAfterSeconds > 0 ? expireAfterSeconds : 0;

            // Return the query builder
            return this;
        };

        // Store the original `select` method
        const originalSelect = queryBuilder.select;

        // Override the `select` method
        queryBuilder.select = function <
            Query extends string = "*",
            // biome-ignore lint/suspicious/noExplicitAny: This is necessary to maximise support for different database schemas
            ResultOne = any,
        >(
            columns?: Query,
            options?: {
                head?: boolean;
                count?: null | "exact" | "planned" | "estimated";
            },
        ): PostgrestFilterBuilder<
            Schema,
            Relation["Row"],
            ResultOne,
            TableName,
            Relationships
        > {
            // If caching is enabled and a cache provider is available
            if (
                // Make sure the cache expiry time is set
                typeof this.expireAfterSeconds === "number" &&
                // Make sure the cache expiry time is greater than 0
                this.expireAfterSeconds > 0 &&
                // Make sure the cache provider is available
                globalOptions.cache?.provider
            ) {
                // Intercept the global fetcher to inject custom headers
                const existingFetch = this.fetch || fetch;

                // Wrap the existing fetcher to add cache headers
                const fetchWithCache: typeof fetch = async (
                    input: RequestInfo | URL,
                    init?: RequestInit,
                ) => {
                    // Add cache headers to the request
                    const headers = {
                        // Spread the existing headers
                        ...(init?.headers || {}),

                        // Add the relevant cache headers
                        "Cache-Control": `public, max-age=${this.expireAfterSeconds}`,
                        "X-TTL": `${this.expireAfterSeconds}`,
                    };

                    // Return the existing fetcher with the updated headers
                    return existingFetch(input, { ...init, headers });
                };

                // Temporarily layer the fetcher for this query
                this.fetch = fetchWithCache;

                // Call the original `select` method and cast the result
                return originalSelect.call(
                    this,
                    columns,
                    options,
                ) as PostgrestFilterBuilder<
                    Schema,
                    Relation["Row"],
                    ResultOne,
                    TableName,
                    Relationships
                >;
            }

            // Default behavior if caching is not enabled
            return originalSelect.call(
                this,
                columns,
                options,
            ) as PostgrestFilterBuilder<
                Schema,
                Relation["Row"],
                ResultOne,
                TableName,
                Relationships
            >;
        };

        // Return the extended query builder
        return queryBuilder;
    } as unknown as SupabaseClient<Database, SchemaName, Schema>["from"];

    // Return the extended client
    return client as unknown as ExtendedSupabaseClient<
        Database,
        SchemaName,
        Schema
    >;
}
