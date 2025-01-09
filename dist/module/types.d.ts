import { PostgrestFilterBuilder, PostgrestQueryBuilder } from "@supabase/postgrest-js";
import type { CookieMethodsBrowser, CookieMethodsServer, CookieOptionsWithName } from "@supabase/ssr/dist/main/types";
import type { PostgrestError, SupabaseClient as _SupabaseClient } from "@supabase/supabase-js";
import type { GenericRelationship, GenericSchema, GenericTable, GenericView, SupabaseClientOptions } from "@supabase/supabase-js/dist/module/lib/types";
import type { RedisConfigNodejs } from "@upstash/redis";
import type { UseSupabaseCacheRedisProviderOptions } from "./server/cache-providers/ioredis";
import type { UseSupabaseCacheSupacacheProviderOptions } from "./server/cache-providers/supacache";
import type { UseSupabaseCacheUpstashRedisProviderOptions } from "./server/cache-providers/upstash";
/**
 * Represents the type of the global `fetch` function.
 *
 * This type can be used to define variables or parameters that should
 * conform to the same signature as the built-in `fetch` function.
 */
export type Fetch = typeof fetch;
/**
 * Options for configuring the Supabase cache.
 *
 * This type combines the options for different cache providers and allows specifying
 * the provider to use for caching responses from the Supabase API.
 *
 * @typedef {Object} UseSupabaseCacheProvidersOptions
 * @property {UseSupabaseCacheSupacacheProviderOptions} UseSupabaseCacheSupacacheProviderOptions - Options for Supacache provider.
 * @property {UseSupabaseCacheUpstashRedisProviderOptions} UseSupabaseCacheUpstashRedisProviderOptions - Options for Upstash Redis provider.
 * @property {UseSupabaseCacheRedisProviderOptions} UseSupabaseCacheRedisProviderOptions - Options for Node Redis provider.
 */
export type UseSupabaseCacheProvidersOptions = UseSupabaseCacheSupacacheProviderOptions | UseSupabaseCacheUpstashRedisProviderOptions | UseSupabaseCacheRedisProviderOptions;
/**
 * Configuration interface for the Supabase client constructor.
 */
export type UseSupabaseOptions = {
    /**
     * Configures the provider for caching responses from the Supabase API.
     */
    cache?: {
        /**
         * The provider to use for caching responses from the Supabase API.
         * Possible values:
         * - `"supacache"`: Use a Supacache middleware service for intermediary caching.
         * - `"upstash-redis"`: Use Upstash Redis for intermediary caching.
         * - `"redis"`: Use Node Redis for intermediary caching.
         *
         * @default undefined (no intermediary caching)
         */
        provider: UseSupabaseCacheSupacacheProviderOptions["provider"] | UseSupabaseCacheUpstashRedisProviderOptions["provider"] | UseSupabaseCacheRedisProviderOptions["provider"];
    } & UseSupabaseCacheProvidersOptions;
    /**
     * Configuration options for the Supabase client, passed to the Supabase client constructor.
     *
     * @link https://supabase.com/docs/reference/javascript/initializing
     *
     * @default undefined (use the default options):
     *  - `config.db.schema` = "public"
     */
    config?: SupabaseClientServerOptionsType | undefined;
    /**
     * The database role to use when interacting with the Supabase API. This option has no effect if `auth.useToken` is set (as the JWT supplied to useToken will contain a "role" key).
     *
     * This option is useful when you need to use a specific role for server-side operations. Using "service_role" will cause the client to use the service role key.
     *
     * Possible values:
     * - `"anon"`: Use the anonymous role.
     * - `"service_role"`: Use the service role.
     *
     * @default "anon" (anonymous role)
     */
    role?: "anon" | "service_role" | undefined;
    /**
     * The URL of the Supabase API.
     *
     * @default process.env.UPV_SECRETS_SUPABASE_URL
     */
    supabaseUrl: string;
    /**
     * Configures the authentication options for the Supabase client.
     */
    auth?: {
        /**
         * The JSON Web Token (JWT) to use for Row Level Security, used to construct the Authorization header. If configured, this option will override `role`, `keys.secret`, and `keys.publishable`.
         *
         * @remarks This is useful when you're using Supabase Auth and need custom claims for Row Level Security.
         */
        useToken?: string | undefined;
        /**
         * The secret key to use for signing JWTs.
         *
         * @remarks This is used for signing JWTs for use with Supabase Auth.
         * @link https://supabase.com/dashboard/project/_/settings/api
         */
        jwtSecret?: string | undefined;
        /**
         * Configures the keys to use for authenticating requests to the Supabase API. This option has no effect if `useToken` is set.
         */
        keys?: {
            /**
             * Your Supabase installation's secret/service_role JWT (API key). This option has no effect if `auth.useToken` is set.
             *
             * @remarks This is used for server-side operations that require elevated permissions.
             * @link https://supabase.com/dashboard/project/_/settings/api
             *
             * @default process.env.UPV_SECRETS_SUPABASE_SERVICEROLE_KEY
             */
            secret?: string | undefined;
            /**
             * Your Supabase installation's publishable/anon JWT (API key).
             *
             * @link https://supabase.com/dashboard/project/_/settings/api
             *
             * @default process.env.UPV_SECRETS_SUPABASE_ANON_KEY
             */
            publishable?: string | undefined;
        };
    };
};
/**
 * Represents the return type of the parseOptions function.
 *
 * @property {UseSupabaseOptions} options - The validated options for initializing the Supabase client.
 * @property {"jwt" | "key"} authStrategy - The authentication strategy that should be used to authenticate with Supabase.
 */
export type ParseOptionsReturnType = {
    /**
     * The validated options for initializing the Supabase client.
     */
    options: UseSupabaseOptions;
    /**
     * The authentication strategy that should be used to authenticate with Supabase.
     *
     * This will be either `jwt` or `key`.
     */
    authStrategy: "jwt" | "key";
};
/**
 * Represents the options for configuring a Supabase client.
 *
 * This type is a union of different configurations that can be used with the Supabase client:
 * - `SupabaseClientOptions<"public">`: Options for public access.
 * - `SupabaseClientOptions<"realtime">`: Options for real-time access.
 * - `SupabaseClientOptions<unknown>`: Options for unknown access types.
 * - `SupabaseClientOptions<any>`: Options with any type, allowing for maximum flexibility.
 */
export type SupabaseClientOptionsType = SupabaseClientOptions<"public"> | SupabaseClientOptions<"realtime"> | SupabaseClientOptions<unknown> | SupabaseClientOptions<any>;
/**
 * Represents the options for configuring a Supabase client on the server side.
 * Extends the `SupabaseClientOptionsType` and includes additional properties
 * for handling cookies.
 *
 * @extends SupabaseClientOptionsType
 *
 * @property {CookieOptionsWithName} [cookieOptions] - Optional configuration for cookies with a name.
 * @property {CookieMethodsServer} cookies - Methods for handling cookies on the server.
 * @property {"raw" | "base64url"} [cookieEncoding] - Optional encoding type for cookies, either "raw" or "base64url".
 */
export type SupabaseClientServerOptionsType = SupabaseClientOptionsType & Partial<{
    cookieOptions?: CookieOptionsWithName;
    cookies: CookieMethodsServer;
    cookieEncoding?: "raw" | "base64url";
}>;
/**
 * Represents the options for configuring a Supabase client in a browser environment.
 * Extends the `SupabaseClientOptionsType` and includes additional properties specific to browser usage.
 *
 * @extends SupabaseClientOptionsType
 *
 * @property {CookieOptionsWithName} [cookieOptions] - Optional configuration for cookies with a specified name.
 * @property {CookieMethodsBrowser} [cookies] - Optional browser-specific methods for handling cookies.
 * @property {"raw" | "base64url"} [cookieEncoding] - Optional encoding method for cookies, either "raw" or "base64url".
 */
export type SupabaseClientBrowserOptionsType = SupabaseClientOptionsType & Partial<{
    cookieOptions?: CookieOptionsWithName;
    cookies?: CookieMethodsBrowser;
    cookieEncoding?: "raw" | "base64url";
}>;
/**
 * Represents a Supabase client instance with certain properties omitted.
 *
 * This type is derived from the `_SupabaseClient` type, but excludes the `cookies` property.
 *
 * @typeParam T - The generic type parameter for the `_SupabaseClient`.
 */
export type SupabaseClient<Database = GenericDatabase, // or Record<string, any>
SchemaName extends string & keyof Database = "public" extends keyof Database ? "public" : string & keyof Database, Schema extends GenericSchema = Database[SchemaName] extends GenericSchema ? Database[SchemaName] : any, SchemaResponse extends GenericSchema = any> = Omit<_SupabaseClient<Database, SchemaName, SchemaResponse>, "cookies">;
/**
 * Represents an extended Supabase client with additional functionality.
 *
 * This type extends the `SupabaseClient` type and includes a method to create a query builder.
 *
 * @typeParam Database - The database schema.
 * @typeParam SchemaName - The schema name.
 * @typeParam Schema - The schema type.
 */
export type ExtendedSupabaseClient<Database = GenericDatabase, SchemaName extends string & keyof Database = "public" extends keyof Database ? "public" : string & keyof Database, Schema extends GenericSchema = Database[SchemaName] extends GenericSchema ? Database[SchemaName] : GenericDatabase> = Omit<SupabaseClient<Database, SchemaName, Schema>, "from"> & {
    from: <TableName extends string, Relation extends GenericTable | GenericView = GenericTable, Relationships extends GenericRelationship[] = []>(table: TableName) => ExtendedQueryBuilder<Schema, Relation, TableName, Relationships>;
};
/**
 * Options for configuring the server fetch behavior of the Supabase client constructor.
 *
 * This type can be one of the following:
 * - A subset of `RequestInit` with only the `cache` property.
 * - An object with optional `next` and `cache` properties.
 * - `undefined`.
 *
 * @property next - Optional configuration for revalidation.
 * @property next.revalidate - Number of seconds after which the response should be revalidated.
 * @property cache - Optional cache mode for the request.
 */
export type SupabaseClientConstructorServerFetchOptions = Pick<RequestInit, "cache"> | {
    next?: {
        revalidate: number;
    };
    cache?: RequestCache;
} | undefined;
/**
 * Represents a generic database type.
 */
export type GenericDatabase = any;
/**
 * A utility type for defining generics used with Supabase.
 *
 * @template Database - The type representing the database structure. Defaults to `GenericDatabase`.
 * @template SchemaName - The type representing the schema name. Defaults to `"public"` if it exists in the database, otherwise a string that is a key of the database.
 * @template Schema - The type representing the schema. Defaults to the schema corresponding to `SchemaName` in the database, or `GenericDatabase` if not found.
 *
 * @property Database - The database type.
 * @property SchemaName - The schema name type.
 * @property Schema - The schema type.
 */
export type UseSupabaseGenerics<Database = GenericDatabase, SchemaName extends string & keyof Database = "public" extends keyof Database ? "public" : string & keyof Database, Schema extends GenericSchema = Database[SchemaName] extends GenericSchema ? Database[SchemaName] : GenericDatabase> = {
    Database: Database;
    SchemaName: SchemaName;
    Schema: Schema;
};
/**
 * Represents an array of generic relationships.
 */
export type Relationships = GenericRelationship[];
/**
 * ExtendedQueryBuilder interface extends the PostgrestQueryBuilder to add caching capabilities.
 *
 * @template Schema - The schema of the database.
 * @template Relation - The table or view in the database.
 * @template RelationName - The name of the relation.
 * @template Relationships - The relationships between tables or views.
 *
 * @extends PostgrestQueryBuilder
 *
 * @property {number} [expireAfterSeconds] - Optional property to specify cache expiration time in seconds.
 *
 * @method cache
 * @param {number} expireAfterSeconds - The cache expiration time in seconds.
 * @returns {ExtendedQueryBuilder<Schema, Relation, RelationName, Relationships>} - The modified query builder with caching logic.
 *
 * @method select
 * @param {Query} [columns="*"] - The columns to select.
 * @param {Object} [options] - Additional options for the select query.
 * @param {boolean} [options.head] - If true, only return the header of the response.
 * @param {null | "exact" | "planned" | "estimated"} [options.count] - The count option for the select query.
 * @returns {PostgrestFilterBuilder<Schema, Relation["Row"], ResultOne, RelationName, Relationships>} - The filter builder with the selected columns.
 */
export interface ExtendedQueryBuilder<Schema extends GenericSchema, Relation extends GenericTable | GenericView, RelationName extends string, Relationships extends GenericRelationship[]> extends PostgrestQueryBuilder<Schema, Relation, RelationName, Relationships> {
    expireAfterSeconds?: number;
    cache: (expireAfterSeconds: number) => ExtendedQueryBuilder<Schema, Relation, RelationName, Relationships>;
    select: <Query extends string = "*", ResultOne = any>(columns?: Query, options?: {
        head?: boolean;
        count?: null | "exact" | "planned" | "estimated";
    }) => PostgrestFilterBuilder<Schema, Relation["Row"], ResultOne, RelationName, Relationships>;
}
export type { SupabaseClientOptions, CookieMethodsServer, CookieOptionsWithName, GenericSchema, GenericView, GenericTable, GenericRelationship, PostgrestError, PostgrestFilterBuilder, PostgrestQueryBuilder, };
export type { RedisConfigNodejs };
