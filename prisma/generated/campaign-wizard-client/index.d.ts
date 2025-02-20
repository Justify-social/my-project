
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model CampaignWizard
 * 
 */
export type CampaignWizard = $Result.DefaultSelection<Prisma.$CampaignWizardPayload>
/**
 * Model WizardHistory
 * 
 */
export type WizardHistory = $Result.DefaultSelection<Prisma.$WizardHistoryPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Status: {
  DRAFT: 'DRAFT',
  IN_REVIEW: 'IN_REVIEW',
  APPROVED: 'APPROVED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED'
};

export type Status = (typeof Status)[keyof typeof Status]


export const Platform: {
  INSTAGRAM: 'INSTAGRAM',
  YOUTUBE: 'YOUTUBE',
  TIKTOK: 'TIKTOK'
};

export type Platform = (typeof Platform)[keyof typeof Platform]


export const KPI: {
  AD_RECALL: 'AD_RECALL',
  BRAND_AWARENESS: 'BRAND_AWARENESS',
  CONSIDERATION: 'CONSIDERATION',
  MESSAGE_ASSOCIATION: 'MESSAGE_ASSOCIATION',
  BRAND_PREFERENCE: 'BRAND_PREFERENCE',
  PURCHASE_INTENT: 'PURCHASE_INTENT',
  ACTION_INTENT: 'ACTION_INTENT',
  RECOMMENDATION_INTENT: 'RECOMMENDATION_INTENT',
  ADVOCACY: 'ADVOCACY'
};

export type KPI = (typeof KPI)[keyof typeof KPI]


export const Feature: {
  CREATIVE_ASSET_TESTING: 'CREATIVE_ASSET_TESTING',
  BRAND_LIFT: 'BRAND_LIFT',
  BRAND_HEALTH: 'BRAND_HEALTH',
  MIXED_MEDIA_MODELING: 'MIXED_MEDIA_MODELING'
};

export type Feature = (typeof Feature)[keyof typeof Feature]

}

export type Status = $Enums.Status

export const Status: typeof $Enums.Status

export type Platform = $Enums.Platform

export const Platform: typeof $Enums.Platform

export type KPI = $Enums.KPI

export const KPI: typeof $Enums.KPI

export type Feature = $Enums.Feature

export const Feature: typeof $Enums.Feature

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more CampaignWizards
 * const campaignWizards = await prisma.campaignWizard.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more CampaignWizards
   * const campaignWizards = await prisma.campaignWizard.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs, $Utils.Call<Prisma.TypeMapCb, {
    extArgs: ExtArgs
  }>, ClientOptions>

      /**
   * `prisma.campaignWizard`: Exposes CRUD operations for the **CampaignWizard** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CampaignWizards
    * const campaignWizards = await prisma.campaignWizard.findMany()
    * ```
    */
  get campaignWizard(): Prisma.CampaignWizardDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.wizardHistory`: Exposes CRUD operations for the **WizardHistory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WizardHistories
    * const wizardHistories = await prisma.wizardHistory.findMany()
    * ```
    */
  get wizardHistory(): Prisma.WizardHistoryDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.4.0
   * Query Engine version: a9055b89e58b4b5bfb59600785423b1db3d0e75d
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    CampaignWizard: 'CampaignWizard',
    WizardHistory: 'WizardHistory'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "campaignWizard" | "wizardHistory"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      CampaignWizard: {
        payload: Prisma.$CampaignWizardPayload<ExtArgs>
        fields: Prisma.CampaignWizardFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CampaignWizardFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignWizardPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CampaignWizardFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignWizardPayload>
          }
          findFirst: {
            args: Prisma.CampaignWizardFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignWizardPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CampaignWizardFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignWizardPayload>
          }
          findMany: {
            args: Prisma.CampaignWizardFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignWizardPayload>[]
          }
          create: {
            args: Prisma.CampaignWizardCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignWizardPayload>
          }
          createMany: {
            args: Prisma.CampaignWizardCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CampaignWizardCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignWizardPayload>[]
          }
          delete: {
            args: Prisma.CampaignWizardDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignWizardPayload>
          }
          update: {
            args: Prisma.CampaignWizardUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignWizardPayload>
          }
          deleteMany: {
            args: Prisma.CampaignWizardDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CampaignWizardUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CampaignWizardUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignWizardPayload>[]
          }
          upsert: {
            args: Prisma.CampaignWizardUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignWizardPayload>
          }
          aggregate: {
            args: Prisma.CampaignWizardAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCampaignWizard>
          }
          groupBy: {
            args: Prisma.CampaignWizardGroupByArgs<ExtArgs>
            result: $Utils.Optional<CampaignWizardGroupByOutputType>[]
          }
          count: {
            args: Prisma.CampaignWizardCountArgs<ExtArgs>
            result: $Utils.Optional<CampaignWizardCountAggregateOutputType> | number
          }
        }
      }
      WizardHistory: {
        payload: Prisma.$WizardHistoryPayload<ExtArgs>
        fields: Prisma.WizardHistoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WizardHistoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WizardHistoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WizardHistoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WizardHistoryPayload>
          }
          findFirst: {
            args: Prisma.WizardHistoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WizardHistoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WizardHistoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WizardHistoryPayload>
          }
          findMany: {
            args: Prisma.WizardHistoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WizardHistoryPayload>[]
          }
          create: {
            args: Prisma.WizardHistoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WizardHistoryPayload>
          }
          createMany: {
            args: Prisma.WizardHistoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WizardHistoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WizardHistoryPayload>[]
          }
          delete: {
            args: Prisma.WizardHistoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WizardHistoryPayload>
          }
          update: {
            args: Prisma.WizardHistoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WizardHistoryPayload>
          }
          deleteMany: {
            args: Prisma.WizardHistoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WizardHistoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WizardHistoryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WizardHistoryPayload>[]
          }
          upsert: {
            args: Prisma.WizardHistoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WizardHistoryPayload>
          }
          aggregate: {
            args: Prisma.WizardHistoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWizardHistory>
          }
          groupBy: {
            args: Prisma.WizardHistoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<WizardHistoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.WizardHistoryCountArgs<ExtArgs>
            result: $Utils.Optional<WizardHistoryCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    campaignWizard?: CampaignWizardOmit
    wizardHistory?: WizardHistoryOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type CampaignWizardCountOutputType
   */

  export type CampaignWizardCountOutputType = {
    history: number
  }

  export type CampaignWizardCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    history?: boolean | CampaignWizardCountOutputTypeCountHistoryArgs
  }

  // Custom InputTypes
  /**
   * CampaignWizardCountOutputType without action
   */
  export type CampaignWizardCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignWizardCountOutputType
     */
    select?: CampaignWizardCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CampaignWizardCountOutputType without action
   */
  export type CampaignWizardCountOutputTypeCountHistoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WizardHistoryWhereInput
  }


  /**
   * Models
   */

  /**
   * Model CampaignWizard
   */

  export type AggregateCampaignWizard = {
    _count: CampaignWizardCountAggregateOutputType | null
    _avg: CampaignWizardAvgAggregateOutputType | null
    _sum: CampaignWizardSumAggregateOutputType | null
    _min: CampaignWizardMinAggregateOutputType | null
    _max: CampaignWizardMaxAggregateOutputType | null
  }

  export type CampaignWizardAvgAggregateOutputType = {
    currentStep: number | null
  }

  export type CampaignWizardSumAggregateOutputType = {
    currentStep: number | null
  }

  export type CampaignWizardMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    currentStep: number | null
    isComplete: boolean | null
    status: $Enums.Status | null
    name: string | null
    businessGoal: string | null
    startDate: Date | null
    endDate: Date | null
    timeZone: string | null
    platform: $Enums.Platform | null
    influencerHandle: string | null
    step1Complete: boolean | null
    primaryKPI: $Enums.KPI | null
    step2Complete: boolean | null
    step3Complete: boolean | null
    guidelines: string | null
    notes: string | null
    step4Complete: boolean | null
  }

  export type CampaignWizardMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    currentStep: number | null
    isComplete: boolean | null
    status: $Enums.Status | null
    name: string | null
    businessGoal: string | null
    startDate: Date | null
    endDate: Date | null
    timeZone: string | null
    platform: $Enums.Platform | null
    influencerHandle: string | null
    step1Complete: boolean | null
    primaryKPI: $Enums.KPI | null
    step2Complete: boolean | null
    step3Complete: boolean | null
    guidelines: string | null
    notes: string | null
    step4Complete: boolean | null
  }

  export type CampaignWizardCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    currentStep: number
    isComplete: number
    status: number
    name: number
    businessGoal: number
    startDate: number
    endDate: number
    timeZone: number
    primaryContact: number
    secondaryContact: number
    budget: number
    platform: number
    influencerHandle: number
    step1Complete: number
    primaryKPI: number
    secondaryKPIs: number
    messaging: number
    expectedOutcomes: number
    features: number
    step2Complete: number
    demographics: number
    locations: number
    targeting: number
    competitors: number
    step3Complete: number
    assets: number
    guidelines: number
    requirements: number
    notes: number
    step4Complete: number
    _all: number
  }


  export type CampaignWizardAvgAggregateInputType = {
    currentStep?: true
  }

  export type CampaignWizardSumAggregateInputType = {
    currentStep?: true
  }

  export type CampaignWizardMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    currentStep?: true
    isComplete?: true
    status?: true
    name?: true
    businessGoal?: true
    startDate?: true
    endDate?: true
    timeZone?: true
    platform?: true
    influencerHandle?: true
    step1Complete?: true
    primaryKPI?: true
    step2Complete?: true
    step3Complete?: true
    guidelines?: true
    notes?: true
    step4Complete?: true
  }

  export type CampaignWizardMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    currentStep?: true
    isComplete?: true
    status?: true
    name?: true
    businessGoal?: true
    startDate?: true
    endDate?: true
    timeZone?: true
    platform?: true
    influencerHandle?: true
    step1Complete?: true
    primaryKPI?: true
    step2Complete?: true
    step3Complete?: true
    guidelines?: true
    notes?: true
    step4Complete?: true
  }

  export type CampaignWizardCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    currentStep?: true
    isComplete?: true
    status?: true
    name?: true
    businessGoal?: true
    startDate?: true
    endDate?: true
    timeZone?: true
    primaryContact?: true
    secondaryContact?: true
    budget?: true
    platform?: true
    influencerHandle?: true
    step1Complete?: true
    primaryKPI?: true
    secondaryKPIs?: true
    messaging?: true
    expectedOutcomes?: true
    features?: true
    step2Complete?: true
    demographics?: true
    locations?: true
    targeting?: true
    competitors?: true
    step3Complete?: true
    assets?: true
    guidelines?: true
    requirements?: true
    notes?: true
    step4Complete?: true
    _all?: true
  }

  export type CampaignWizardAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CampaignWizard to aggregate.
     */
    where?: CampaignWizardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CampaignWizards to fetch.
     */
    orderBy?: CampaignWizardOrderByWithRelationInput | CampaignWizardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CampaignWizardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CampaignWizards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CampaignWizards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CampaignWizards
    **/
    _count?: true | CampaignWizardCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CampaignWizardAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CampaignWizardSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CampaignWizardMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CampaignWizardMaxAggregateInputType
  }

  export type GetCampaignWizardAggregateType<T extends CampaignWizardAggregateArgs> = {
        [P in keyof T & keyof AggregateCampaignWizard]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCampaignWizard[P]>
      : GetScalarType<T[P], AggregateCampaignWizard[P]>
  }




  export type CampaignWizardGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CampaignWizardWhereInput
    orderBy?: CampaignWizardOrderByWithAggregationInput | CampaignWizardOrderByWithAggregationInput[]
    by: CampaignWizardScalarFieldEnum[] | CampaignWizardScalarFieldEnum
    having?: CampaignWizardScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CampaignWizardCountAggregateInputType | true
    _avg?: CampaignWizardAvgAggregateInputType
    _sum?: CampaignWizardSumAggregateInputType
    _min?: CampaignWizardMinAggregateInputType
    _max?: CampaignWizardMaxAggregateInputType
  }

  export type CampaignWizardGroupByOutputType = {
    id: string
    createdAt: Date
    updatedAt: Date
    currentStep: number
    isComplete: boolean
    status: $Enums.Status
    name: string
    businessGoal: string
    startDate: Date
    endDate: Date
    timeZone: string
    primaryContact: JsonValue
    secondaryContact: JsonValue | null
    budget: JsonValue
    platform: $Enums.Platform
    influencerHandle: string
    step1Complete: boolean
    primaryKPI: $Enums.KPI | null
    secondaryKPIs: $Enums.KPI[]
    messaging: JsonValue | null
    expectedOutcomes: JsonValue | null
    features: $Enums.Feature[]
    step2Complete: boolean
    demographics: JsonValue | null
    locations: JsonValue[]
    targeting: JsonValue | null
    competitors: string[]
    step3Complete: boolean
    assets: JsonValue[]
    guidelines: string | null
    requirements: JsonValue[]
    notes: string | null
    step4Complete: boolean
    _count: CampaignWizardCountAggregateOutputType | null
    _avg: CampaignWizardAvgAggregateOutputType | null
    _sum: CampaignWizardSumAggregateOutputType | null
    _min: CampaignWizardMinAggregateOutputType | null
    _max: CampaignWizardMaxAggregateOutputType | null
  }

  type GetCampaignWizardGroupByPayload<T extends CampaignWizardGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CampaignWizardGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CampaignWizardGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CampaignWizardGroupByOutputType[P]>
            : GetScalarType<T[P], CampaignWizardGroupByOutputType[P]>
        }
      >
    >


  export type CampaignWizardSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    currentStep?: boolean
    isComplete?: boolean
    status?: boolean
    name?: boolean
    businessGoal?: boolean
    startDate?: boolean
    endDate?: boolean
    timeZone?: boolean
    primaryContact?: boolean
    secondaryContact?: boolean
    budget?: boolean
    platform?: boolean
    influencerHandle?: boolean
    step1Complete?: boolean
    primaryKPI?: boolean
    secondaryKPIs?: boolean
    messaging?: boolean
    expectedOutcomes?: boolean
    features?: boolean
    step2Complete?: boolean
    demographics?: boolean
    locations?: boolean
    targeting?: boolean
    competitors?: boolean
    step3Complete?: boolean
    assets?: boolean
    guidelines?: boolean
    requirements?: boolean
    notes?: boolean
    step4Complete?: boolean
    history?: boolean | CampaignWizard$historyArgs<ExtArgs>
    _count?: boolean | CampaignWizardCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["campaignWizard"]>

  export type CampaignWizardSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    currentStep?: boolean
    isComplete?: boolean
    status?: boolean
    name?: boolean
    businessGoal?: boolean
    startDate?: boolean
    endDate?: boolean
    timeZone?: boolean
    primaryContact?: boolean
    secondaryContact?: boolean
    budget?: boolean
    platform?: boolean
    influencerHandle?: boolean
    step1Complete?: boolean
    primaryKPI?: boolean
    secondaryKPIs?: boolean
    messaging?: boolean
    expectedOutcomes?: boolean
    features?: boolean
    step2Complete?: boolean
    demographics?: boolean
    locations?: boolean
    targeting?: boolean
    competitors?: boolean
    step3Complete?: boolean
    assets?: boolean
    guidelines?: boolean
    requirements?: boolean
    notes?: boolean
    step4Complete?: boolean
  }, ExtArgs["result"]["campaignWizard"]>

  export type CampaignWizardSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    currentStep?: boolean
    isComplete?: boolean
    status?: boolean
    name?: boolean
    businessGoal?: boolean
    startDate?: boolean
    endDate?: boolean
    timeZone?: boolean
    primaryContact?: boolean
    secondaryContact?: boolean
    budget?: boolean
    platform?: boolean
    influencerHandle?: boolean
    step1Complete?: boolean
    primaryKPI?: boolean
    secondaryKPIs?: boolean
    messaging?: boolean
    expectedOutcomes?: boolean
    features?: boolean
    step2Complete?: boolean
    demographics?: boolean
    locations?: boolean
    targeting?: boolean
    competitors?: boolean
    step3Complete?: boolean
    assets?: boolean
    guidelines?: boolean
    requirements?: boolean
    notes?: boolean
    step4Complete?: boolean
  }, ExtArgs["result"]["campaignWizard"]>

  export type CampaignWizardSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    currentStep?: boolean
    isComplete?: boolean
    status?: boolean
    name?: boolean
    businessGoal?: boolean
    startDate?: boolean
    endDate?: boolean
    timeZone?: boolean
    primaryContact?: boolean
    secondaryContact?: boolean
    budget?: boolean
    platform?: boolean
    influencerHandle?: boolean
    step1Complete?: boolean
    primaryKPI?: boolean
    secondaryKPIs?: boolean
    messaging?: boolean
    expectedOutcomes?: boolean
    features?: boolean
    step2Complete?: boolean
    demographics?: boolean
    locations?: boolean
    targeting?: boolean
    competitors?: boolean
    step3Complete?: boolean
    assets?: boolean
    guidelines?: boolean
    requirements?: boolean
    notes?: boolean
    step4Complete?: boolean
  }

  export type CampaignWizardOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "createdAt" | "updatedAt" | "currentStep" | "isComplete" | "status" | "name" | "businessGoal" | "startDate" | "endDate" | "timeZone" | "primaryContact" | "secondaryContact" | "budget" | "platform" | "influencerHandle" | "step1Complete" | "primaryKPI" | "secondaryKPIs" | "messaging" | "expectedOutcomes" | "features" | "step2Complete" | "demographics" | "locations" | "targeting" | "competitors" | "step3Complete" | "assets" | "guidelines" | "requirements" | "notes" | "step4Complete", ExtArgs["result"]["campaignWizard"]>
  export type CampaignWizardInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    history?: boolean | CampaignWizard$historyArgs<ExtArgs>
    _count?: boolean | CampaignWizardCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CampaignWizardIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type CampaignWizardIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CampaignWizardPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CampaignWizard"
    objects: {
      history: Prisma.$WizardHistoryPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      updatedAt: Date
      currentStep: number
      isComplete: boolean
      status: $Enums.Status
      name: string
      businessGoal: string
      startDate: Date
      endDate: Date
      timeZone: string
      primaryContact: Prisma.JsonValue
      secondaryContact: Prisma.JsonValue | null
      budget: Prisma.JsonValue
      platform: $Enums.Platform
      influencerHandle: string
      step1Complete: boolean
      primaryKPI: $Enums.KPI | null
      secondaryKPIs: $Enums.KPI[]
      messaging: Prisma.JsonValue | null
      expectedOutcomes: Prisma.JsonValue | null
      features: $Enums.Feature[]
      step2Complete: boolean
      demographics: Prisma.JsonValue | null
      locations: Prisma.JsonValue[]
      targeting: Prisma.JsonValue | null
      competitors: string[]
      step3Complete: boolean
      assets: Prisma.JsonValue[]
      guidelines: string | null
      requirements: Prisma.JsonValue[]
      notes: string | null
      step4Complete: boolean
    }, ExtArgs["result"]["campaignWizard"]>
    composites: {}
  }

  type CampaignWizardGetPayload<S extends boolean | null | undefined | CampaignWizardDefaultArgs> = $Result.GetResult<Prisma.$CampaignWizardPayload, S>

  type CampaignWizardCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CampaignWizardFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CampaignWizardCountAggregateInputType | true
    }

  export interface CampaignWizardDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CampaignWizard'], meta: { name: 'CampaignWizard' } }
    /**
     * Find zero or one CampaignWizard that matches the filter.
     * @param {CampaignWizardFindUniqueArgs} args - Arguments to find a CampaignWizard
     * @example
     * // Get one CampaignWizard
     * const campaignWizard = await prisma.campaignWizard.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CampaignWizardFindUniqueArgs>(args: SelectSubset<T, CampaignWizardFindUniqueArgs<ExtArgs>>): Prisma__CampaignWizardClient<$Result.GetResult<Prisma.$CampaignWizardPayload<ExtArgs>, T, "findUnique", ClientOptions> | null, null, ExtArgs, ClientOptions>

    /**
     * Find one CampaignWizard that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CampaignWizardFindUniqueOrThrowArgs} args - Arguments to find a CampaignWizard
     * @example
     * // Get one CampaignWizard
     * const campaignWizard = await prisma.campaignWizard.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CampaignWizardFindUniqueOrThrowArgs>(args: SelectSubset<T, CampaignWizardFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CampaignWizardClient<$Result.GetResult<Prisma.$CampaignWizardPayload<ExtArgs>, T, "findUniqueOrThrow", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find the first CampaignWizard that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignWizardFindFirstArgs} args - Arguments to find a CampaignWizard
     * @example
     * // Get one CampaignWizard
     * const campaignWizard = await prisma.campaignWizard.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CampaignWizardFindFirstArgs>(args?: SelectSubset<T, CampaignWizardFindFirstArgs<ExtArgs>>): Prisma__CampaignWizardClient<$Result.GetResult<Prisma.$CampaignWizardPayload<ExtArgs>, T, "findFirst", ClientOptions> | null, null, ExtArgs, ClientOptions>

    /**
     * Find the first CampaignWizard that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignWizardFindFirstOrThrowArgs} args - Arguments to find a CampaignWizard
     * @example
     * // Get one CampaignWizard
     * const campaignWizard = await prisma.campaignWizard.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CampaignWizardFindFirstOrThrowArgs>(args?: SelectSubset<T, CampaignWizardFindFirstOrThrowArgs<ExtArgs>>): Prisma__CampaignWizardClient<$Result.GetResult<Prisma.$CampaignWizardPayload<ExtArgs>, T, "findFirstOrThrow", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find zero or more CampaignWizards that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignWizardFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CampaignWizards
     * const campaignWizards = await prisma.campaignWizard.findMany()
     * 
     * // Get first 10 CampaignWizards
     * const campaignWizards = await prisma.campaignWizard.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const campaignWizardWithIdOnly = await prisma.campaignWizard.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CampaignWizardFindManyArgs>(args?: SelectSubset<T, CampaignWizardFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CampaignWizardPayload<ExtArgs>, T, "findMany", ClientOptions>>

    /**
     * Create a CampaignWizard.
     * @param {CampaignWizardCreateArgs} args - Arguments to create a CampaignWizard.
     * @example
     * // Create one CampaignWizard
     * const CampaignWizard = await prisma.campaignWizard.create({
     *   data: {
     *     // ... data to create a CampaignWizard
     *   }
     * })
     * 
     */
    create<T extends CampaignWizardCreateArgs>(args: SelectSubset<T, CampaignWizardCreateArgs<ExtArgs>>): Prisma__CampaignWizardClient<$Result.GetResult<Prisma.$CampaignWizardPayload<ExtArgs>, T, "create", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Create many CampaignWizards.
     * @param {CampaignWizardCreateManyArgs} args - Arguments to create many CampaignWizards.
     * @example
     * // Create many CampaignWizards
     * const campaignWizard = await prisma.campaignWizard.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CampaignWizardCreateManyArgs>(args?: SelectSubset<T, CampaignWizardCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CampaignWizards and returns the data saved in the database.
     * @param {CampaignWizardCreateManyAndReturnArgs} args - Arguments to create many CampaignWizards.
     * @example
     * // Create many CampaignWizards
     * const campaignWizard = await prisma.campaignWizard.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CampaignWizards and only return the `id`
     * const campaignWizardWithIdOnly = await prisma.campaignWizard.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CampaignWizardCreateManyAndReturnArgs>(args?: SelectSubset<T, CampaignWizardCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CampaignWizardPayload<ExtArgs>, T, "createManyAndReturn", ClientOptions>>

    /**
     * Delete a CampaignWizard.
     * @param {CampaignWizardDeleteArgs} args - Arguments to delete one CampaignWizard.
     * @example
     * // Delete one CampaignWizard
     * const CampaignWizard = await prisma.campaignWizard.delete({
     *   where: {
     *     // ... filter to delete one CampaignWizard
     *   }
     * })
     * 
     */
    delete<T extends CampaignWizardDeleteArgs>(args: SelectSubset<T, CampaignWizardDeleteArgs<ExtArgs>>): Prisma__CampaignWizardClient<$Result.GetResult<Prisma.$CampaignWizardPayload<ExtArgs>, T, "delete", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Update one CampaignWizard.
     * @param {CampaignWizardUpdateArgs} args - Arguments to update one CampaignWizard.
     * @example
     * // Update one CampaignWizard
     * const campaignWizard = await prisma.campaignWizard.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CampaignWizardUpdateArgs>(args: SelectSubset<T, CampaignWizardUpdateArgs<ExtArgs>>): Prisma__CampaignWizardClient<$Result.GetResult<Prisma.$CampaignWizardPayload<ExtArgs>, T, "update", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Delete zero or more CampaignWizards.
     * @param {CampaignWizardDeleteManyArgs} args - Arguments to filter CampaignWizards to delete.
     * @example
     * // Delete a few CampaignWizards
     * const { count } = await prisma.campaignWizard.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CampaignWizardDeleteManyArgs>(args?: SelectSubset<T, CampaignWizardDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CampaignWizards.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignWizardUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CampaignWizards
     * const campaignWizard = await prisma.campaignWizard.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CampaignWizardUpdateManyArgs>(args: SelectSubset<T, CampaignWizardUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CampaignWizards and returns the data updated in the database.
     * @param {CampaignWizardUpdateManyAndReturnArgs} args - Arguments to update many CampaignWizards.
     * @example
     * // Update many CampaignWizards
     * const campaignWizard = await prisma.campaignWizard.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CampaignWizards and only return the `id`
     * const campaignWizardWithIdOnly = await prisma.campaignWizard.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CampaignWizardUpdateManyAndReturnArgs>(args: SelectSubset<T, CampaignWizardUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CampaignWizardPayload<ExtArgs>, T, "updateManyAndReturn", ClientOptions>>

    /**
     * Create or update one CampaignWizard.
     * @param {CampaignWizardUpsertArgs} args - Arguments to update or create a CampaignWizard.
     * @example
     * // Update or create a CampaignWizard
     * const campaignWizard = await prisma.campaignWizard.upsert({
     *   create: {
     *     // ... data to create a CampaignWizard
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CampaignWizard we want to update
     *   }
     * })
     */
    upsert<T extends CampaignWizardUpsertArgs>(args: SelectSubset<T, CampaignWizardUpsertArgs<ExtArgs>>): Prisma__CampaignWizardClient<$Result.GetResult<Prisma.$CampaignWizardPayload<ExtArgs>, T, "upsert", ClientOptions>, never, ExtArgs, ClientOptions>


    /**
     * Count the number of CampaignWizards.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignWizardCountArgs} args - Arguments to filter CampaignWizards to count.
     * @example
     * // Count the number of CampaignWizards
     * const count = await prisma.campaignWizard.count({
     *   where: {
     *     // ... the filter for the CampaignWizards we want to count
     *   }
     * })
    **/
    count<T extends CampaignWizardCountArgs>(
      args?: Subset<T, CampaignWizardCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CampaignWizardCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CampaignWizard.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignWizardAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CampaignWizardAggregateArgs>(args: Subset<T, CampaignWizardAggregateArgs>): Prisma.PrismaPromise<GetCampaignWizardAggregateType<T>>

    /**
     * Group by CampaignWizard.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignWizardGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CampaignWizardGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CampaignWizardGroupByArgs['orderBy'] }
        : { orderBy?: CampaignWizardGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CampaignWizardGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCampaignWizardGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CampaignWizard model
   */
  readonly fields: CampaignWizardFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CampaignWizard.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CampaignWizardClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    history<T extends CampaignWizard$historyArgs<ExtArgs> = {}>(args?: Subset<T, CampaignWizard$historyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WizardHistoryPayload<ExtArgs>, T, "findMany", ClientOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CampaignWizard model
   */ 
  interface CampaignWizardFieldRefs {
    readonly id: FieldRef<"CampaignWizard", 'String'>
    readonly createdAt: FieldRef<"CampaignWizard", 'DateTime'>
    readonly updatedAt: FieldRef<"CampaignWizard", 'DateTime'>
    readonly currentStep: FieldRef<"CampaignWizard", 'Int'>
    readonly isComplete: FieldRef<"CampaignWizard", 'Boolean'>
    readonly status: FieldRef<"CampaignWizard", 'Status'>
    readonly name: FieldRef<"CampaignWizard", 'String'>
    readonly businessGoal: FieldRef<"CampaignWizard", 'String'>
    readonly startDate: FieldRef<"CampaignWizard", 'DateTime'>
    readonly endDate: FieldRef<"CampaignWizard", 'DateTime'>
    readonly timeZone: FieldRef<"CampaignWizard", 'String'>
    readonly primaryContact: FieldRef<"CampaignWizard", 'Json'>
    readonly secondaryContact: FieldRef<"CampaignWizard", 'Json'>
    readonly budget: FieldRef<"CampaignWizard", 'Json'>
    readonly platform: FieldRef<"CampaignWizard", 'Platform'>
    readonly influencerHandle: FieldRef<"CampaignWizard", 'String'>
    readonly step1Complete: FieldRef<"CampaignWizard", 'Boolean'>
    readonly primaryKPI: FieldRef<"CampaignWizard", 'KPI'>
    readonly secondaryKPIs: FieldRef<"CampaignWizard", 'KPI[]'>
    readonly messaging: FieldRef<"CampaignWizard", 'Json'>
    readonly expectedOutcomes: FieldRef<"CampaignWizard", 'Json'>
    readonly features: FieldRef<"CampaignWizard", 'Feature[]'>
    readonly step2Complete: FieldRef<"CampaignWizard", 'Boolean'>
    readonly demographics: FieldRef<"CampaignWizard", 'Json'>
    readonly locations: FieldRef<"CampaignWizard", 'Json[]'>
    readonly targeting: FieldRef<"CampaignWizard", 'Json'>
    readonly competitors: FieldRef<"CampaignWizard", 'String[]'>
    readonly step3Complete: FieldRef<"CampaignWizard", 'Boolean'>
    readonly assets: FieldRef<"CampaignWizard", 'Json[]'>
    readonly guidelines: FieldRef<"CampaignWizard", 'String'>
    readonly requirements: FieldRef<"CampaignWizard", 'Json[]'>
    readonly notes: FieldRef<"CampaignWizard", 'String'>
    readonly step4Complete: FieldRef<"CampaignWizard", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * CampaignWizard findUnique
   */
  export type CampaignWizardFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignWizard
     */
    select?: CampaignWizardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignWizard
     */
    omit?: CampaignWizardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignWizardInclude<ExtArgs> | null
    /**
     * Filter, which CampaignWizard to fetch.
     */
    where: CampaignWizardWhereUniqueInput
  }

  /**
   * CampaignWizard findUniqueOrThrow
   */
  export type CampaignWizardFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignWizard
     */
    select?: CampaignWizardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignWizard
     */
    omit?: CampaignWizardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignWizardInclude<ExtArgs> | null
    /**
     * Filter, which CampaignWizard to fetch.
     */
    where: CampaignWizardWhereUniqueInput
  }

  /**
   * CampaignWizard findFirst
   */
  export type CampaignWizardFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignWizard
     */
    select?: CampaignWizardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignWizard
     */
    omit?: CampaignWizardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignWizardInclude<ExtArgs> | null
    /**
     * Filter, which CampaignWizard to fetch.
     */
    where?: CampaignWizardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CampaignWizards to fetch.
     */
    orderBy?: CampaignWizardOrderByWithRelationInput | CampaignWizardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CampaignWizards.
     */
    cursor?: CampaignWizardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CampaignWizards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CampaignWizards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CampaignWizards.
     */
    distinct?: CampaignWizardScalarFieldEnum | CampaignWizardScalarFieldEnum[]
  }

  /**
   * CampaignWizard findFirstOrThrow
   */
  export type CampaignWizardFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignWizard
     */
    select?: CampaignWizardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignWizard
     */
    omit?: CampaignWizardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignWizardInclude<ExtArgs> | null
    /**
     * Filter, which CampaignWizard to fetch.
     */
    where?: CampaignWizardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CampaignWizards to fetch.
     */
    orderBy?: CampaignWizardOrderByWithRelationInput | CampaignWizardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CampaignWizards.
     */
    cursor?: CampaignWizardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CampaignWizards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CampaignWizards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CampaignWizards.
     */
    distinct?: CampaignWizardScalarFieldEnum | CampaignWizardScalarFieldEnum[]
  }

  /**
   * CampaignWizard findMany
   */
  export type CampaignWizardFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignWizard
     */
    select?: CampaignWizardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignWizard
     */
    omit?: CampaignWizardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignWizardInclude<ExtArgs> | null
    /**
     * Filter, which CampaignWizards to fetch.
     */
    where?: CampaignWizardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CampaignWizards to fetch.
     */
    orderBy?: CampaignWizardOrderByWithRelationInput | CampaignWizardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CampaignWizards.
     */
    cursor?: CampaignWizardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CampaignWizards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CampaignWizards.
     */
    skip?: number
    distinct?: CampaignWizardScalarFieldEnum | CampaignWizardScalarFieldEnum[]
  }

  /**
   * CampaignWizard create
   */
  export type CampaignWizardCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignWizard
     */
    select?: CampaignWizardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignWizard
     */
    omit?: CampaignWizardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignWizardInclude<ExtArgs> | null
    /**
     * The data needed to create a CampaignWizard.
     */
    data: XOR<CampaignWizardCreateInput, CampaignWizardUncheckedCreateInput>
  }

  /**
   * CampaignWizard createMany
   */
  export type CampaignWizardCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CampaignWizards.
     */
    data: CampaignWizardCreateManyInput | CampaignWizardCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CampaignWizard createManyAndReturn
   */
  export type CampaignWizardCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignWizard
     */
    select?: CampaignWizardSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignWizard
     */
    omit?: CampaignWizardOmit<ExtArgs> | null
    /**
     * The data used to create many CampaignWizards.
     */
    data: CampaignWizardCreateManyInput | CampaignWizardCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CampaignWizard update
   */
  export type CampaignWizardUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignWizard
     */
    select?: CampaignWizardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignWizard
     */
    omit?: CampaignWizardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignWizardInclude<ExtArgs> | null
    /**
     * The data needed to update a CampaignWizard.
     */
    data: XOR<CampaignWizardUpdateInput, CampaignWizardUncheckedUpdateInput>
    /**
     * Choose, which CampaignWizard to update.
     */
    where: CampaignWizardWhereUniqueInput
  }

  /**
   * CampaignWizard updateMany
   */
  export type CampaignWizardUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CampaignWizards.
     */
    data: XOR<CampaignWizardUpdateManyMutationInput, CampaignWizardUncheckedUpdateManyInput>
    /**
     * Filter which CampaignWizards to update
     */
    where?: CampaignWizardWhereInput
    /**
     * Limit how many CampaignWizards to update.
     */
    limit?: number
  }

  /**
   * CampaignWizard updateManyAndReturn
   */
  export type CampaignWizardUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignWizard
     */
    select?: CampaignWizardSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignWizard
     */
    omit?: CampaignWizardOmit<ExtArgs> | null
    /**
     * The data used to update CampaignWizards.
     */
    data: XOR<CampaignWizardUpdateManyMutationInput, CampaignWizardUncheckedUpdateManyInput>
    /**
     * Filter which CampaignWizards to update
     */
    where?: CampaignWizardWhereInput
    /**
     * Limit how many CampaignWizards to update.
     */
    limit?: number
  }

  /**
   * CampaignWizard upsert
   */
  export type CampaignWizardUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignWizard
     */
    select?: CampaignWizardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignWizard
     */
    omit?: CampaignWizardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignWizardInclude<ExtArgs> | null
    /**
     * The filter to search for the CampaignWizard to update in case it exists.
     */
    where: CampaignWizardWhereUniqueInput
    /**
     * In case the CampaignWizard found by the `where` argument doesn't exist, create a new CampaignWizard with this data.
     */
    create: XOR<CampaignWizardCreateInput, CampaignWizardUncheckedCreateInput>
    /**
     * In case the CampaignWizard was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CampaignWizardUpdateInput, CampaignWizardUncheckedUpdateInput>
  }

  /**
   * CampaignWizard delete
   */
  export type CampaignWizardDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignWizard
     */
    select?: CampaignWizardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignWizard
     */
    omit?: CampaignWizardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignWizardInclude<ExtArgs> | null
    /**
     * Filter which CampaignWizard to delete.
     */
    where: CampaignWizardWhereUniqueInput
  }

  /**
   * CampaignWizard deleteMany
   */
  export type CampaignWizardDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CampaignWizards to delete
     */
    where?: CampaignWizardWhereInput
    /**
     * Limit how many CampaignWizards to delete.
     */
    limit?: number
  }

  /**
   * CampaignWizard.history
   */
  export type CampaignWizard$historyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WizardHistory
     */
    select?: WizardHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the WizardHistory
     */
    omit?: WizardHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WizardHistoryInclude<ExtArgs> | null
    where?: WizardHistoryWhereInput
    orderBy?: WizardHistoryOrderByWithRelationInput | WizardHistoryOrderByWithRelationInput[]
    cursor?: WizardHistoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: WizardHistoryScalarFieldEnum | WizardHistoryScalarFieldEnum[]
  }

  /**
   * CampaignWizard without action
   */
  export type CampaignWizardDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CampaignWizard
     */
    select?: CampaignWizardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CampaignWizard
     */
    omit?: CampaignWizardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CampaignWizardInclude<ExtArgs> | null
  }


  /**
   * Model WizardHistory
   */

  export type AggregateWizardHistory = {
    _count: WizardHistoryCountAggregateOutputType | null
    _avg: WizardHistoryAvgAggregateOutputType | null
    _sum: WizardHistorySumAggregateOutputType | null
    _min: WizardHistoryMinAggregateOutputType | null
    _max: WizardHistoryMaxAggregateOutputType | null
  }

  export type WizardHistoryAvgAggregateOutputType = {
    step: number | null
  }

  export type WizardHistorySumAggregateOutputType = {
    step: number | null
  }

  export type WizardHistoryMinAggregateOutputType = {
    id: string | null
    wizardId: string | null
    step: number | null
    action: string | null
    performedBy: string | null
    timestamp: Date | null
  }

  export type WizardHistoryMaxAggregateOutputType = {
    id: string | null
    wizardId: string | null
    step: number | null
    action: string | null
    performedBy: string | null
    timestamp: Date | null
  }

  export type WizardHistoryCountAggregateOutputType = {
    id: number
    wizardId: number
    step: number
    action: number
    changes: number
    performedBy: number
    timestamp: number
    _all: number
  }


  export type WizardHistoryAvgAggregateInputType = {
    step?: true
  }

  export type WizardHistorySumAggregateInputType = {
    step?: true
  }

  export type WizardHistoryMinAggregateInputType = {
    id?: true
    wizardId?: true
    step?: true
    action?: true
    performedBy?: true
    timestamp?: true
  }

  export type WizardHistoryMaxAggregateInputType = {
    id?: true
    wizardId?: true
    step?: true
    action?: true
    performedBy?: true
    timestamp?: true
  }

  export type WizardHistoryCountAggregateInputType = {
    id?: true
    wizardId?: true
    step?: true
    action?: true
    changes?: true
    performedBy?: true
    timestamp?: true
    _all?: true
  }

  export type WizardHistoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WizardHistory to aggregate.
     */
    where?: WizardHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WizardHistories to fetch.
     */
    orderBy?: WizardHistoryOrderByWithRelationInput | WizardHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WizardHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WizardHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WizardHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WizardHistories
    **/
    _count?: true | WizardHistoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: WizardHistoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: WizardHistorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WizardHistoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WizardHistoryMaxAggregateInputType
  }

  export type GetWizardHistoryAggregateType<T extends WizardHistoryAggregateArgs> = {
        [P in keyof T & keyof AggregateWizardHistory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWizardHistory[P]>
      : GetScalarType<T[P], AggregateWizardHistory[P]>
  }




  export type WizardHistoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WizardHistoryWhereInput
    orderBy?: WizardHistoryOrderByWithAggregationInput | WizardHistoryOrderByWithAggregationInput[]
    by: WizardHistoryScalarFieldEnum[] | WizardHistoryScalarFieldEnum
    having?: WizardHistoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WizardHistoryCountAggregateInputType | true
    _avg?: WizardHistoryAvgAggregateInputType
    _sum?: WizardHistorySumAggregateInputType
    _min?: WizardHistoryMinAggregateInputType
    _max?: WizardHistoryMaxAggregateInputType
  }

  export type WizardHistoryGroupByOutputType = {
    id: string
    wizardId: string
    step: number
    action: string
    changes: JsonValue
    performedBy: string
    timestamp: Date
    _count: WizardHistoryCountAggregateOutputType | null
    _avg: WizardHistoryAvgAggregateOutputType | null
    _sum: WizardHistorySumAggregateOutputType | null
    _min: WizardHistoryMinAggregateOutputType | null
    _max: WizardHistoryMaxAggregateOutputType | null
  }

  type GetWizardHistoryGroupByPayload<T extends WizardHistoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WizardHistoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WizardHistoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WizardHistoryGroupByOutputType[P]>
            : GetScalarType<T[P], WizardHistoryGroupByOutputType[P]>
        }
      >
    >


  export type WizardHistorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    wizardId?: boolean
    step?: boolean
    action?: boolean
    changes?: boolean
    performedBy?: boolean
    timestamp?: boolean
    wizard?: boolean | CampaignWizardDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["wizardHistory"]>

  export type WizardHistorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    wizardId?: boolean
    step?: boolean
    action?: boolean
    changes?: boolean
    performedBy?: boolean
    timestamp?: boolean
    wizard?: boolean | CampaignWizardDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["wizardHistory"]>

  export type WizardHistorySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    wizardId?: boolean
    step?: boolean
    action?: boolean
    changes?: boolean
    performedBy?: boolean
    timestamp?: boolean
    wizard?: boolean | CampaignWizardDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["wizardHistory"]>

  export type WizardHistorySelectScalar = {
    id?: boolean
    wizardId?: boolean
    step?: boolean
    action?: boolean
    changes?: boolean
    performedBy?: boolean
    timestamp?: boolean
  }

  export type WizardHistoryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "wizardId" | "step" | "action" | "changes" | "performedBy" | "timestamp", ExtArgs["result"]["wizardHistory"]>
  export type WizardHistoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    wizard?: boolean | CampaignWizardDefaultArgs<ExtArgs>
  }
  export type WizardHistoryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    wizard?: boolean | CampaignWizardDefaultArgs<ExtArgs>
  }
  export type WizardHistoryIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    wizard?: boolean | CampaignWizardDefaultArgs<ExtArgs>
  }

  export type $WizardHistoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WizardHistory"
    objects: {
      wizard: Prisma.$CampaignWizardPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      wizardId: string
      step: number
      action: string
      changes: Prisma.JsonValue
      performedBy: string
      timestamp: Date
    }, ExtArgs["result"]["wizardHistory"]>
    composites: {}
  }

  type WizardHistoryGetPayload<S extends boolean | null | undefined | WizardHistoryDefaultArgs> = $Result.GetResult<Prisma.$WizardHistoryPayload, S>

  type WizardHistoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WizardHistoryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WizardHistoryCountAggregateInputType | true
    }

  export interface WizardHistoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WizardHistory'], meta: { name: 'WizardHistory' } }
    /**
     * Find zero or one WizardHistory that matches the filter.
     * @param {WizardHistoryFindUniqueArgs} args - Arguments to find a WizardHistory
     * @example
     * // Get one WizardHistory
     * const wizardHistory = await prisma.wizardHistory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WizardHistoryFindUniqueArgs>(args: SelectSubset<T, WizardHistoryFindUniqueArgs<ExtArgs>>): Prisma__WizardHistoryClient<$Result.GetResult<Prisma.$WizardHistoryPayload<ExtArgs>, T, "findUnique", ClientOptions> | null, null, ExtArgs, ClientOptions>

    /**
     * Find one WizardHistory that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WizardHistoryFindUniqueOrThrowArgs} args - Arguments to find a WizardHistory
     * @example
     * // Get one WizardHistory
     * const wizardHistory = await prisma.wizardHistory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WizardHistoryFindUniqueOrThrowArgs>(args: SelectSubset<T, WizardHistoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WizardHistoryClient<$Result.GetResult<Prisma.$WizardHistoryPayload<ExtArgs>, T, "findUniqueOrThrow", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find the first WizardHistory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WizardHistoryFindFirstArgs} args - Arguments to find a WizardHistory
     * @example
     * // Get one WizardHistory
     * const wizardHistory = await prisma.wizardHistory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WizardHistoryFindFirstArgs>(args?: SelectSubset<T, WizardHistoryFindFirstArgs<ExtArgs>>): Prisma__WizardHistoryClient<$Result.GetResult<Prisma.$WizardHistoryPayload<ExtArgs>, T, "findFirst", ClientOptions> | null, null, ExtArgs, ClientOptions>

    /**
     * Find the first WizardHistory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WizardHistoryFindFirstOrThrowArgs} args - Arguments to find a WizardHistory
     * @example
     * // Get one WizardHistory
     * const wizardHistory = await prisma.wizardHistory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WizardHistoryFindFirstOrThrowArgs>(args?: SelectSubset<T, WizardHistoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__WizardHistoryClient<$Result.GetResult<Prisma.$WizardHistoryPayload<ExtArgs>, T, "findFirstOrThrow", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Find zero or more WizardHistories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WizardHistoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WizardHistories
     * const wizardHistories = await prisma.wizardHistory.findMany()
     * 
     * // Get first 10 WizardHistories
     * const wizardHistories = await prisma.wizardHistory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const wizardHistoryWithIdOnly = await prisma.wizardHistory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WizardHistoryFindManyArgs>(args?: SelectSubset<T, WizardHistoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WizardHistoryPayload<ExtArgs>, T, "findMany", ClientOptions>>

    /**
     * Create a WizardHistory.
     * @param {WizardHistoryCreateArgs} args - Arguments to create a WizardHistory.
     * @example
     * // Create one WizardHistory
     * const WizardHistory = await prisma.wizardHistory.create({
     *   data: {
     *     // ... data to create a WizardHistory
     *   }
     * })
     * 
     */
    create<T extends WizardHistoryCreateArgs>(args: SelectSubset<T, WizardHistoryCreateArgs<ExtArgs>>): Prisma__WizardHistoryClient<$Result.GetResult<Prisma.$WizardHistoryPayload<ExtArgs>, T, "create", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Create many WizardHistories.
     * @param {WizardHistoryCreateManyArgs} args - Arguments to create many WizardHistories.
     * @example
     * // Create many WizardHistories
     * const wizardHistory = await prisma.wizardHistory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WizardHistoryCreateManyArgs>(args?: SelectSubset<T, WizardHistoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WizardHistories and returns the data saved in the database.
     * @param {WizardHistoryCreateManyAndReturnArgs} args - Arguments to create many WizardHistories.
     * @example
     * // Create many WizardHistories
     * const wizardHistory = await prisma.wizardHistory.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many WizardHistories and only return the `id`
     * const wizardHistoryWithIdOnly = await prisma.wizardHistory.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WizardHistoryCreateManyAndReturnArgs>(args?: SelectSubset<T, WizardHistoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WizardHistoryPayload<ExtArgs>, T, "createManyAndReturn", ClientOptions>>

    /**
     * Delete a WizardHistory.
     * @param {WizardHistoryDeleteArgs} args - Arguments to delete one WizardHistory.
     * @example
     * // Delete one WizardHistory
     * const WizardHistory = await prisma.wizardHistory.delete({
     *   where: {
     *     // ... filter to delete one WizardHistory
     *   }
     * })
     * 
     */
    delete<T extends WizardHistoryDeleteArgs>(args: SelectSubset<T, WizardHistoryDeleteArgs<ExtArgs>>): Prisma__WizardHistoryClient<$Result.GetResult<Prisma.$WizardHistoryPayload<ExtArgs>, T, "delete", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Update one WizardHistory.
     * @param {WizardHistoryUpdateArgs} args - Arguments to update one WizardHistory.
     * @example
     * // Update one WizardHistory
     * const wizardHistory = await prisma.wizardHistory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WizardHistoryUpdateArgs>(args: SelectSubset<T, WizardHistoryUpdateArgs<ExtArgs>>): Prisma__WizardHistoryClient<$Result.GetResult<Prisma.$WizardHistoryPayload<ExtArgs>, T, "update", ClientOptions>, never, ExtArgs, ClientOptions>

    /**
     * Delete zero or more WizardHistories.
     * @param {WizardHistoryDeleteManyArgs} args - Arguments to filter WizardHistories to delete.
     * @example
     * // Delete a few WizardHistories
     * const { count } = await prisma.wizardHistory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WizardHistoryDeleteManyArgs>(args?: SelectSubset<T, WizardHistoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WizardHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WizardHistoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WizardHistories
     * const wizardHistory = await prisma.wizardHistory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WizardHistoryUpdateManyArgs>(args: SelectSubset<T, WizardHistoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WizardHistories and returns the data updated in the database.
     * @param {WizardHistoryUpdateManyAndReturnArgs} args - Arguments to update many WizardHistories.
     * @example
     * // Update many WizardHistories
     * const wizardHistory = await prisma.wizardHistory.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more WizardHistories and only return the `id`
     * const wizardHistoryWithIdOnly = await prisma.wizardHistory.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends WizardHistoryUpdateManyAndReturnArgs>(args: SelectSubset<T, WizardHistoryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WizardHistoryPayload<ExtArgs>, T, "updateManyAndReturn", ClientOptions>>

    /**
     * Create or update one WizardHistory.
     * @param {WizardHistoryUpsertArgs} args - Arguments to update or create a WizardHistory.
     * @example
     * // Update or create a WizardHistory
     * const wizardHistory = await prisma.wizardHistory.upsert({
     *   create: {
     *     // ... data to create a WizardHistory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WizardHistory we want to update
     *   }
     * })
     */
    upsert<T extends WizardHistoryUpsertArgs>(args: SelectSubset<T, WizardHistoryUpsertArgs<ExtArgs>>): Prisma__WizardHistoryClient<$Result.GetResult<Prisma.$WizardHistoryPayload<ExtArgs>, T, "upsert", ClientOptions>, never, ExtArgs, ClientOptions>


    /**
     * Count the number of WizardHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WizardHistoryCountArgs} args - Arguments to filter WizardHistories to count.
     * @example
     * // Count the number of WizardHistories
     * const count = await prisma.wizardHistory.count({
     *   where: {
     *     // ... the filter for the WizardHistories we want to count
     *   }
     * })
    **/
    count<T extends WizardHistoryCountArgs>(
      args?: Subset<T, WizardHistoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WizardHistoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WizardHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WizardHistoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends WizardHistoryAggregateArgs>(args: Subset<T, WizardHistoryAggregateArgs>): Prisma.PrismaPromise<GetWizardHistoryAggregateType<T>>

    /**
     * Group by WizardHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WizardHistoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends WizardHistoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WizardHistoryGroupByArgs['orderBy'] }
        : { orderBy?: WizardHistoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, WizardHistoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWizardHistoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WizardHistory model
   */
  readonly fields: WizardHistoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WizardHistory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WizardHistoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    wizard<T extends CampaignWizardDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CampaignWizardDefaultArgs<ExtArgs>>): Prisma__CampaignWizardClient<$Result.GetResult<Prisma.$CampaignWizardPayload<ExtArgs>, T, "findUniqueOrThrow", ClientOptions> | Null, Null, ExtArgs, ClientOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the WizardHistory model
   */ 
  interface WizardHistoryFieldRefs {
    readonly id: FieldRef<"WizardHistory", 'String'>
    readonly wizardId: FieldRef<"WizardHistory", 'String'>
    readonly step: FieldRef<"WizardHistory", 'Int'>
    readonly action: FieldRef<"WizardHistory", 'String'>
    readonly changes: FieldRef<"WizardHistory", 'Json'>
    readonly performedBy: FieldRef<"WizardHistory", 'String'>
    readonly timestamp: FieldRef<"WizardHistory", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * WizardHistory findUnique
   */
  export type WizardHistoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WizardHistory
     */
    select?: WizardHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the WizardHistory
     */
    omit?: WizardHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WizardHistoryInclude<ExtArgs> | null
    /**
     * Filter, which WizardHistory to fetch.
     */
    where: WizardHistoryWhereUniqueInput
  }

  /**
   * WizardHistory findUniqueOrThrow
   */
  export type WizardHistoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WizardHistory
     */
    select?: WizardHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the WizardHistory
     */
    omit?: WizardHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WizardHistoryInclude<ExtArgs> | null
    /**
     * Filter, which WizardHistory to fetch.
     */
    where: WizardHistoryWhereUniqueInput
  }

  /**
   * WizardHistory findFirst
   */
  export type WizardHistoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WizardHistory
     */
    select?: WizardHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the WizardHistory
     */
    omit?: WizardHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WizardHistoryInclude<ExtArgs> | null
    /**
     * Filter, which WizardHistory to fetch.
     */
    where?: WizardHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WizardHistories to fetch.
     */
    orderBy?: WizardHistoryOrderByWithRelationInput | WizardHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WizardHistories.
     */
    cursor?: WizardHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WizardHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WizardHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WizardHistories.
     */
    distinct?: WizardHistoryScalarFieldEnum | WizardHistoryScalarFieldEnum[]
  }

  /**
   * WizardHistory findFirstOrThrow
   */
  export type WizardHistoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WizardHistory
     */
    select?: WizardHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the WizardHistory
     */
    omit?: WizardHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WizardHistoryInclude<ExtArgs> | null
    /**
     * Filter, which WizardHistory to fetch.
     */
    where?: WizardHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WizardHistories to fetch.
     */
    orderBy?: WizardHistoryOrderByWithRelationInput | WizardHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WizardHistories.
     */
    cursor?: WizardHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WizardHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WizardHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WizardHistories.
     */
    distinct?: WizardHistoryScalarFieldEnum | WizardHistoryScalarFieldEnum[]
  }

  /**
   * WizardHistory findMany
   */
  export type WizardHistoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WizardHistory
     */
    select?: WizardHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the WizardHistory
     */
    omit?: WizardHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WizardHistoryInclude<ExtArgs> | null
    /**
     * Filter, which WizardHistories to fetch.
     */
    where?: WizardHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WizardHistories to fetch.
     */
    orderBy?: WizardHistoryOrderByWithRelationInput | WizardHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WizardHistories.
     */
    cursor?: WizardHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WizardHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WizardHistories.
     */
    skip?: number
    distinct?: WizardHistoryScalarFieldEnum | WizardHistoryScalarFieldEnum[]
  }

  /**
   * WizardHistory create
   */
  export type WizardHistoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WizardHistory
     */
    select?: WizardHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the WizardHistory
     */
    omit?: WizardHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WizardHistoryInclude<ExtArgs> | null
    /**
     * The data needed to create a WizardHistory.
     */
    data: XOR<WizardHistoryCreateInput, WizardHistoryUncheckedCreateInput>
  }

  /**
   * WizardHistory createMany
   */
  export type WizardHistoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WizardHistories.
     */
    data: WizardHistoryCreateManyInput | WizardHistoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WizardHistory createManyAndReturn
   */
  export type WizardHistoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WizardHistory
     */
    select?: WizardHistorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WizardHistory
     */
    omit?: WizardHistoryOmit<ExtArgs> | null
    /**
     * The data used to create many WizardHistories.
     */
    data: WizardHistoryCreateManyInput | WizardHistoryCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WizardHistoryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * WizardHistory update
   */
  export type WizardHistoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WizardHistory
     */
    select?: WizardHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the WizardHistory
     */
    omit?: WizardHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WizardHistoryInclude<ExtArgs> | null
    /**
     * The data needed to update a WizardHistory.
     */
    data: XOR<WizardHistoryUpdateInput, WizardHistoryUncheckedUpdateInput>
    /**
     * Choose, which WizardHistory to update.
     */
    where: WizardHistoryWhereUniqueInput
  }

  /**
   * WizardHistory updateMany
   */
  export type WizardHistoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WizardHistories.
     */
    data: XOR<WizardHistoryUpdateManyMutationInput, WizardHistoryUncheckedUpdateManyInput>
    /**
     * Filter which WizardHistories to update
     */
    where?: WizardHistoryWhereInput
    /**
     * Limit how many WizardHistories to update.
     */
    limit?: number
  }

  /**
   * WizardHistory updateManyAndReturn
   */
  export type WizardHistoryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WizardHistory
     */
    select?: WizardHistorySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WizardHistory
     */
    omit?: WizardHistoryOmit<ExtArgs> | null
    /**
     * The data used to update WizardHistories.
     */
    data: XOR<WizardHistoryUpdateManyMutationInput, WizardHistoryUncheckedUpdateManyInput>
    /**
     * Filter which WizardHistories to update
     */
    where?: WizardHistoryWhereInput
    /**
     * Limit how many WizardHistories to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WizardHistoryIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * WizardHistory upsert
   */
  export type WizardHistoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WizardHistory
     */
    select?: WizardHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the WizardHistory
     */
    omit?: WizardHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WizardHistoryInclude<ExtArgs> | null
    /**
     * The filter to search for the WizardHistory to update in case it exists.
     */
    where: WizardHistoryWhereUniqueInput
    /**
     * In case the WizardHistory found by the `where` argument doesn't exist, create a new WizardHistory with this data.
     */
    create: XOR<WizardHistoryCreateInput, WizardHistoryUncheckedCreateInput>
    /**
     * In case the WizardHistory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WizardHistoryUpdateInput, WizardHistoryUncheckedUpdateInput>
  }

  /**
   * WizardHistory delete
   */
  export type WizardHistoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WizardHistory
     */
    select?: WizardHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the WizardHistory
     */
    omit?: WizardHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WizardHistoryInclude<ExtArgs> | null
    /**
     * Filter which WizardHistory to delete.
     */
    where: WizardHistoryWhereUniqueInput
  }

  /**
   * WizardHistory deleteMany
   */
  export type WizardHistoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WizardHistories to delete
     */
    where?: WizardHistoryWhereInput
    /**
     * Limit how many WizardHistories to delete.
     */
    limit?: number
  }

  /**
   * WizardHistory without action
   */
  export type WizardHistoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WizardHistory
     */
    select?: WizardHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the WizardHistory
     */
    omit?: WizardHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WizardHistoryInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const CampaignWizardScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    currentStep: 'currentStep',
    isComplete: 'isComplete',
    status: 'status',
    name: 'name',
    businessGoal: 'businessGoal',
    startDate: 'startDate',
    endDate: 'endDate',
    timeZone: 'timeZone',
    primaryContact: 'primaryContact',
    secondaryContact: 'secondaryContact',
    budget: 'budget',
    platform: 'platform',
    influencerHandle: 'influencerHandle',
    step1Complete: 'step1Complete',
    primaryKPI: 'primaryKPI',
    secondaryKPIs: 'secondaryKPIs',
    messaging: 'messaging',
    expectedOutcomes: 'expectedOutcomes',
    features: 'features',
    step2Complete: 'step2Complete',
    demographics: 'demographics',
    locations: 'locations',
    targeting: 'targeting',
    competitors: 'competitors',
    step3Complete: 'step3Complete',
    assets: 'assets',
    guidelines: 'guidelines',
    requirements: 'requirements',
    notes: 'notes',
    step4Complete: 'step4Complete'
  };

  export type CampaignWizardScalarFieldEnum = (typeof CampaignWizardScalarFieldEnum)[keyof typeof CampaignWizardScalarFieldEnum]


  export const WizardHistoryScalarFieldEnum: {
    id: 'id',
    wizardId: 'wizardId',
    step: 'step',
    action: 'action',
    changes: 'changes',
    performedBy: 'performedBy',
    timestamp: 'timestamp'
  };

  export type WizardHistoryScalarFieldEnum = (typeof WizardHistoryScalarFieldEnum)[keyof typeof WizardHistoryScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Status'
   */
  export type EnumStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Status'>
    


  /**
   * Reference to a field of type 'Status[]'
   */
  export type ListEnumStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Status[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Platform'
   */
  export type EnumPlatformFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Platform'>
    


  /**
   * Reference to a field of type 'Platform[]'
   */
  export type ListEnumPlatformFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Platform[]'>
    


  /**
   * Reference to a field of type 'KPI'
   */
  export type EnumKPIFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'KPI'>
    


  /**
   * Reference to a field of type 'KPI[]'
   */
  export type ListEnumKPIFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'KPI[]'>
    


  /**
   * Reference to a field of type 'Feature[]'
   */
  export type ListEnumFeatureFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Feature[]'>
    


  /**
   * Reference to a field of type 'Feature'
   */
  export type EnumFeatureFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Feature'>
    


  /**
   * Reference to a field of type 'Json[]'
   */
  export type ListJsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type CampaignWizardWhereInput = {
    AND?: CampaignWizardWhereInput | CampaignWizardWhereInput[]
    OR?: CampaignWizardWhereInput[]
    NOT?: CampaignWizardWhereInput | CampaignWizardWhereInput[]
    id?: StringFilter<"CampaignWizard"> | string
    createdAt?: DateTimeFilter<"CampaignWizard"> | Date | string
    updatedAt?: DateTimeFilter<"CampaignWizard"> | Date | string
    currentStep?: IntFilter<"CampaignWizard"> | number
    isComplete?: BoolFilter<"CampaignWizard"> | boolean
    status?: EnumStatusFilter<"CampaignWizard"> | $Enums.Status
    name?: StringFilter<"CampaignWizard"> | string
    businessGoal?: StringFilter<"CampaignWizard"> | string
    startDate?: DateTimeFilter<"CampaignWizard"> | Date | string
    endDate?: DateTimeFilter<"CampaignWizard"> | Date | string
    timeZone?: StringFilter<"CampaignWizard"> | string
    primaryContact?: JsonFilter<"CampaignWizard">
    secondaryContact?: JsonNullableFilter<"CampaignWizard">
    budget?: JsonFilter<"CampaignWizard">
    platform?: EnumPlatformFilter<"CampaignWizard"> | $Enums.Platform
    influencerHandle?: StringFilter<"CampaignWizard"> | string
    step1Complete?: BoolFilter<"CampaignWizard"> | boolean
    primaryKPI?: EnumKPINullableFilter<"CampaignWizard"> | $Enums.KPI | null
    secondaryKPIs?: EnumKPINullableListFilter<"CampaignWizard">
    messaging?: JsonNullableFilter<"CampaignWizard">
    expectedOutcomes?: JsonNullableFilter<"CampaignWizard">
    features?: EnumFeatureNullableListFilter<"CampaignWizard">
    step2Complete?: BoolFilter<"CampaignWizard"> | boolean
    demographics?: JsonNullableFilter<"CampaignWizard">
    locations?: JsonNullableListFilter<"CampaignWizard">
    targeting?: JsonNullableFilter<"CampaignWizard">
    competitors?: StringNullableListFilter<"CampaignWizard">
    step3Complete?: BoolFilter<"CampaignWizard"> | boolean
    assets?: JsonNullableListFilter<"CampaignWizard">
    guidelines?: StringNullableFilter<"CampaignWizard"> | string | null
    requirements?: JsonNullableListFilter<"CampaignWizard">
    notes?: StringNullableFilter<"CampaignWizard"> | string | null
    step4Complete?: BoolFilter<"CampaignWizard"> | boolean
    history?: WizardHistoryListRelationFilter
  }

  export type CampaignWizardOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    currentStep?: SortOrder
    isComplete?: SortOrder
    status?: SortOrder
    name?: SortOrder
    businessGoal?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    timeZone?: SortOrder
    primaryContact?: SortOrder
    secondaryContact?: SortOrderInput | SortOrder
    budget?: SortOrder
    platform?: SortOrder
    influencerHandle?: SortOrder
    step1Complete?: SortOrder
    primaryKPI?: SortOrderInput | SortOrder
    secondaryKPIs?: SortOrder
    messaging?: SortOrderInput | SortOrder
    expectedOutcomes?: SortOrderInput | SortOrder
    features?: SortOrder
    step2Complete?: SortOrder
    demographics?: SortOrderInput | SortOrder
    locations?: SortOrder
    targeting?: SortOrderInput | SortOrder
    competitors?: SortOrder
    step3Complete?: SortOrder
    assets?: SortOrder
    guidelines?: SortOrderInput | SortOrder
    requirements?: SortOrder
    notes?: SortOrderInput | SortOrder
    step4Complete?: SortOrder
    history?: WizardHistoryOrderByRelationAggregateInput
  }

  export type CampaignWizardWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CampaignWizardWhereInput | CampaignWizardWhereInput[]
    OR?: CampaignWizardWhereInput[]
    NOT?: CampaignWizardWhereInput | CampaignWizardWhereInput[]
    createdAt?: DateTimeFilter<"CampaignWizard"> | Date | string
    updatedAt?: DateTimeFilter<"CampaignWizard"> | Date | string
    currentStep?: IntFilter<"CampaignWizard"> | number
    isComplete?: BoolFilter<"CampaignWizard"> | boolean
    status?: EnumStatusFilter<"CampaignWizard"> | $Enums.Status
    name?: StringFilter<"CampaignWizard"> | string
    businessGoal?: StringFilter<"CampaignWizard"> | string
    startDate?: DateTimeFilter<"CampaignWizard"> | Date | string
    endDate?: DateTimeFilter<"CampaignWizard"> | Date | string
    timeZone?: StringFilter<"CampaignWizard"> | string
    primaryContact?: JsonFilter<"CampaignWizard">
    secondaryContact?: JsonNullableFilter<"CampaignWizard">
    budget?: JsonFilter<"CampaignWizard">
    platform?: EnumPlatformFilter<"CampaignWizard"> | $Enums.Platform
    influencerHandle?: StringFilter<"CampaignWizard"> | string
    step1Complete?: BoolFilter<"CampaignWizard"> | boolean
    primaryKPI?: EnumKPINullableFilter<"CampaignWizard"> | $Enums.KPI | null
    secondaryKPIs?: EnumKPINullableListFilter<"CampaignWizard">
    messaging?: JsonNullableFilter<"CampaignWizard">
    expectedOutcomes?: JsonNullableFilter<"CampaignWizard">
    features?: EnumFeatureNullableListFilter<"CampaignWizard">
    step2Complete?: BoolFilter<"CampaignWizard"> | boolean
    demographics?: JsonNullableFilter<"CampaignWizard">
    locations?: JsonNullableListFilter<"CampaignWizard">
    targeting?: JsonNullableFilter<"CampaignWizard">
    competitors?: StringNullableListFilter<"CampaignWizard">
    step3Complete?: BoolFilter<"CampaignWizard"> | boolean
    assets?: JsonNullableListFilter<"CampaignWizard">
    guidelines?: StringNullableFilter<"CampaignWizard"> | string | null
    requirements?: JsonNullableListFilter<"CampaignWizard">
    notes?: StringNullableFilter<"CampaignWizard"> | string | null
    step4Complete?: BoolFilter<"CampaignWizard"> | boolean
    history?: WizardHistoryListRelationFilter
  }, "id">

  export type CampaignWizardOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    currentStep?: SortOrder
    isComplete?: SortOrder
    status?: SortOrder
    name?: SortOrder
    businessGoal?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    timeZone?: SortOrder
    primaryContact?: SortOrder
    secondaryContact?: SortOrderInput | SortOrder
    budget?: SortOrder
    platform?: SortOrder
    influencerHandle?: SortOrder
    step1Complete?: SortOrder
    primaryKPI?: SortOrderInput | SortOrder
    secondaryKPIs?: SortOrder
    messaging?: SortOrderInput | SortOrder
    expectedOutcomes?: SortOrderInput | SortOrder
    features?: SortOrder
    step2Complete?: SortOrder
    demographics?: SortOrderInput | SortOrder
    locations?: SortOrder
    targeting?: SortOrderInput | SortOrder
    competitors?: SortOrder
    step3Complete?: SortOrder
    assets?: SortOrder
    guidelines?: SortOrderInput | SortOrder
    requirements?: SortOrder
    notes?: SortOrderInput | SortOrder
    step4Complete?: SortOrder
    _count?: CampaignWizardCountOrderByAggregateInput
    _avg?: CampaignWizardAvgOrderByAggregateInput
    _max?: CampaignWizardMaxOrderByAggregateInput
    _min?: CampaignWizardMinOrderByAggregateInput
    _sum?: CampaignWizardSumOrderByAggregateInput
  }

  export type CampaignWizardScalarWhereWithAggregatesInput = {
    AND?: CampaignWizardScalarWhereWithAggregatesInput | CampaignWizardScalarWhereWithAggregatesInput[]
    OR?: CampaignWizardScalarWhereWithAggregatesInput[]
    NOT?: CampaignWizardScalarWhereWithAggregatesInput | CampaignWizardScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CampaignWizard"> | string
    createdAt?: DateTimeWithAggregatesFilter<"CampaignWizard"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"CampaignWizard"> | Date | string
    currentStep?: IntWithAggregatesFilter<"CampaignWizard"> | number
    isComplete?: BoolWithAggregatesFilter<"CampaignWizard"> | boolean
    status?: EnumStatusWithAggregatesFilter<"CampaignWizard"> | $Enums.Status
    name?: StringWithAggregatesFilter<"CampaignWizard"> | string
    businessGoal?: StringWithAggregatesFilter<"CampaignWizard"> | string
    startDate?: DateTimeWithAggregatesFilter<"CampaignWizard"> | Date | string
    endDate?: DateTimeWithAggregatesFilter<"CampaignWizard"> | Date | string
    timeZone?: StringWithAggregatesFilter<"CampaignWizard"> | string
    primaryContact?: JsonWithAggregatesFilter<"CampaignWizard">
    secondaryContact?: JsonNullableWithAggregatesFilter<"CampaignWizard">
    budget?: JsonWithAggregatesFilter<"CampaignWizard">
    platform?: EnumPlatformWithAggregatesFilter<"CampaignWizard"> | $Enums.Platform
    influencerHandle?: StringWithAggregatesFilter<"CampaignWizard"> | string
    step1Complete?: BoolWithAggregatesFilter<"CampaignWizard"> | boolean
    primaryKPI?: EnumKPINullableWithAggregatesFilter<"CampaignWizard"> | $Enums.KPI | null
    secondaryKPIs?: EnumKPINullableListFilter<"CampaignWizard">
    messaging?: JsonNullableWithAggregatesFilter<"CampaignWizard">
    expectedOutcomes?: JsonNullableWithAggregatesFilter<"CampaignWizard">
    features?: EnumFeatureNullableListFilter<"CampaignWizard">
    step2Complete?: BoolWithAggregatesFilter<"CampaignWizard"> | boolean
    demographics?: JsonNullableWithAggregatesFilter<"CampaignWizard">
    locations?: JsonNullableListFilter<"CampaignWizard">
    targeting?: JsonNullableWithAggregatesFilter<"CampaignWizard">
    competitors?: StringNullableListFilter<"CampaignWizard">
    step3Complete?: BoolWithAggregatesFilter<"CampaignWizard"> | boolean
    assets?: JsonNullableListFilter<"CampaignWizard">
    guidelines?: StringNullableWithAggregatesFilter<"CampaignWizard"> | string | null
    requirements?: JsonNullableListFilter<"CampaignWizard">
    notes?: StringNullableWithAggregatesFilter<"CampaignWizard"> | string | null
    step4Complete?: BoolWithAggregatesFilter<"CampaignWizard"> | boolean
  }

  export type WizardHistoryWhereInput = {
    AND?: WizardHistoryWhereInput | WizardHistoryWhereInput[]
    OR?: WizardHistoryWhereInput[]
    NOT?: WizardHistoryWhereInput | WizardHistoryWhereInput[]
    id?: StringFilter<"WizardHistory"> | string
    wizardId?: StringFilter<"WizardHistory"> | string
    step?: IntFilter<"WizardHistory"> | number
    action?: StringFilter<"WizardHistory"> | string
    changes?: JsonFilter<"WizardHistory">
    performedBy?: StringFilter<"WizardHistory"> | string
    timestamp?: DateTimeFilter<"WizardHistory"> | Date | string
    wizard?: XOR<CampaignWizardScalarRelationFilter, CampaignWizardWhereInput>
  }

  export type WizardHistoryOrderByWithRelationInput = {
    id?: SortOrder
    wizardId?: SortOrder
    step?: SortOrder
    action?: SortOrder
    changes?: SortOrder
    performedBy?: SortOrder
    timestamp?: SortOrder
    wizard?: CampaignWizardOrderByWithRelationInput
  }

  export type WizardHistoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: WizardHistoryWhereInput | WizardHistoryWhereInput[]
    OR?: WizardHistoryWhereInput[]
    NOT?: WizardHistoryWhereInput | WizardHistoryWhereInput[]
    wizardId?: StringFilter<"WizardHistory"> | string
    step?: IntFilter<"WizardHistory"> | number
    action?: StringFilter<"WizardHistory"> | string
    changes?: JsonFilter<"WizardHistory">
    performedBy?: StringFilter<"WizardHistory"> | string
    timestamp?: DateTimeFilter<"WizardHistory"> | Date | string
    wizard?: XOR<CampaignWizardScalarRelationFilter, CampaignWizardWhereInput>
  }, "id">

  export type WizardHistoryOrderByWithAggregationInput = {
    id?: SortOrder
    wizardId?: SortOrder
    step?: SortOrder
    action?: SortOrder
    changes?: SortOrder
    performedBy?: SortOrder
    timestamp?: SortOrder
    _count?: WizardHistoryCountOrderByAggregateInput
    _avg?: WizardHistoryAvgOrderByAggregateInput
    _max?: WizardHistoryMaxOrderByAggregateInput
    _min?: WizardHistoryMinOrderByAggregateInput
    _sum?: WizardHistorySumOrderByAggregateInput
  }

  export type WizardHistoryScalarWhereWithAggregatesInput = {
    AND?: WizardHistoryScalarWhereWithAggregatesInput | WizardHistoryScalarWhereWithAggregatesInput[]
    OR?: WizardHistoryScalarWhereWithAggregatesInput[]
    NOT?: WizardHistoryScalarWhereWithAggregatesInput | WizardHistoryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"WizardHistory"> | string
    wizardId?: StringWithAggregatesFilter<"WizardHistory"> | string
    step?: IntWithAggregatesFilter<"WizardHistory"> | number
    action?: StringWithAggregatesFilter<"WizardHistory"> | string
    changes?: JsonWithAggregatesFilter<"WizardHistory">
    performedBy?: StringWithAggregatesFilter<"WizardHistory"> | string
    timestamp?: DateTimeWithAggregatesFilter<"WizardHistory"> | Date | string
  }

  export type CampaignWizardCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    currentStep?: number
    isComplete?: boolean
    status?: $Enums.Status
    name: string
    businessGoal: string
    startDate: Date | string
    endDate: Date | string
    timeZone: string
    primaryContact: JsonNullValueInput | InputJsonValue
    secondaryContact?: NullableJsonNullValueInput | InputJsonValue
    budget: JsonNullValueInput | InputJsonValue
    platform: $Enums.Platform
    influencerHandle: string
    step1Complete?: boolean
    primaryKPI?: $Enums.KPI | null
    secondaryKPIs?: CampaignWizardCreatesecondaryKPIsInput | $Enums.KPI[]
    messaging?: NullableJsonNullValueInput | InputJsonValue
    expectedOutcomes?: NullableJsonNullValueInput | InputJsonValue
    features?: CampaignWizardCreatefeaturesInput | $Enums.Feature[]
    step2Complete?: boolean
    demographics?: NullableJsonNullValueInput | InputJsonValue
    locations?: CampaignWizardCreatelocationsInput | InputJsonValue[]
    targeting?: NullableJsonNullValueInput | InputJsonValue
    competitors?: CampaignWizardCreatecompetitorsInput | string[]
    step3Complete?: boolean
    assets?: CampaignWizardCreateassetsInput | InputJsonValue[]
    guidelines?: string | null
    requirements?: CampaignWizardCreaterequirementsInput | InputJsonValue[]
    notes?: string | null
    step4Complete?: boolean
    history?: WizardHistoryCreateNestedManyWithoutWizardInput
  }

  export type CampaignWizardUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    currentStep?: number
    isComplete?: boolean
    status?: $Enums.Status
    name: string
    businessGoal: string
    startDate: Date | string
    endDate: Date | string
    timeZone: string
    primaryContact: JsonNullValueInput | InputJsonValue
    secondaryContact?: NullableJsonNullValueInput | InputJsonValue
    budget: JsonNullValueInput | InputJsonValue
    platform: $Enums.Platform
    influencerHandle: string
    step1Complete?: boolean
    primaryKPI?: $Enums.KPI | null
    secondaryKPIs?: CampaignWizardCreatesecondaryKPIsInput | $Enums.KPI[]
    messaging?: NullableJsonNullValueInput | InputJsonValue
    expectedOutcomes?: NullableJsonNullValueInput | InputJsonValue
    features?: CampaignWizardCreatefeaturesInput | $Enums.Feature[]
    step2Complete?: boolean
    demographics?: NullableJsonNullValueInput | InputJsonValue
    locations?: CampaignWizardCreatelocationsInput | InputJsonValue[]
    targeting?: NullableJsonNullValueInput | InputJsonValue
    competitors?: CampaignWizardCreatecompetitorsInput | string[]
    step3Complete?: boolean
    assets?: CampaignWizardCreateassetsInput | InputJsonValue[]
    guidelines?: string | null
    requirements?: CampaignWizardCreaterequirementsInput | InputJsonValue[]
    notes?: string | null
    step4Complete?: boolean
    history?: WizardHistoryUncheckedCreateNestedManyWithoutWizardInput
  }

  export type CampaignWizardUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentStep?: IntFieldUpdateOperationsInput | number
    isComplete?: BoolFieldUpdateOperationsInput | boolean
    status?: EnumStatusFieldUpdateOperationsInput | $Enums.Status
    name?: StringFieldUpdateOperationsInput | string
    businessGoal?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    timeZone?: StringFieldUpdateOperationsInput | string
    primaryContact?: JsonNullValueInput | InputJsonValue
    secondaryContact?: NullableJsonNullValueInput | InputJsonValue
    budget?: JsonNullValueInput | InputJsonValue
    platform?: EnumPlatformFieldUpdateOperationsInput | $Enums.Platform
    influencerHandle?: StringFieldUpdateOperationsInput | string
    step1Complete?: BoolFieldUpdateOperationsInput | boolean
    primaryKPI?: NullableEnumKPIFieldUpdateOperationsInput | $Enums.KPI | null
    secondaryKPIs?: CampaignWizardUpdatesecondaryKPIsInput | $Enums.KPI[]
    messaging?: NullableJsonNullValueInput | InputJsonValue
    expectedOutcomes?: NullableJsonNullValueInput | InputJsonValue
    features?: CampaignWizardUpdatefeaturesInput | $Enums.Feature[]
    step2Complete?: BoolFieldUpdateOperationsInput | boolean
    demographics?: NullableJsonNullValueInput | InputJsonValue
    locations?: CampaignWizardUpdatelocationsInput | InputJsonValue[]
    targeting?: NullableJsonNullValueInput | InputJsonValue
    competitors?: CampaignWizardUpdatecompetitorsInput | string[]
    step3Complete?: BoolFieldUpdateOperationsInput | boolean
    assets?: CampaignWizardUpdateassetsInput | InputJsonValue[]
    guidelines?: NullableStringFieldUpdateOperationsInput | string | null
    requirements?: CampaignWizardUpdaterequirementsInput | InputJsonValue[]
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    step4Complete?: BoolFieldUpdateOperationsInput | boolean
    history?: WizardHistoryUpdateManyWithoutWizardNestedInput
  }

  export type CampaignWizardUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentStep?: IntFieldUpdateOperationsInput | number
    isComplete?: BoolFieldUpdateOperationsInput | boolean
    status?: EnumStatusFieldUpdateOperationsInput | $Enums.Status
    name?: StringFieldUpdateOperationsInput | string
    businessGoal?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    timeZone?: StringFieldUpdateOperationsInput | string
    primaryContact?: JsonNullValueInput | InputJsonValue
    secondaryContact?: NullableJsonNullValueInput | InputJsonValue
    budget?: JsonNullValueInput | InputJsonValue
    platform?: EnumPlatformFieldUpdateOperationsInput | $Enums.Platform
    influencerHandle?: StringFieldUpdateOperationsInput | string
    step1Complete?: BoolFieldUpdateOperationsInput | boolean
    primaryKPI?: NullableEnumKPIFieldUpdateOperationsInput | $Enums.KPI | null
    secondaryKPIs?: CampaignWizardUpdatesecondaryKPIsInput | $Enums.KPI[]
    messaging?: NullableJsonNullValueInput | InputJsonValue
    expectedOutcomes?: NullableJsonNullValueInput | InputJsonValue
    features?: CampaignWizardUpdatefeaturesInput | $Enums.Feature[]
    step2Complete?: BoolFieldUpdateOperationsInput | boolean
    demographics?: NullableJsonNullValueInput | InputJsonValue
    locations?: CampaignWizardUpdatelocationsInput | InputJsonValue[]
    targeting?: NullableJsonNullValueInput | InputJsonValue
    competitors?: CampaignWizardUpdatecompetitorsInput | string[]
    step3Complete?: BoolFieldUpdateOperationsInput | boolean
    assets?: CampaignWizardUpdateassetsInput | InputJsonValue[]
    guidelines?: NullableStringFieldUpdateOperationsInput | string | null
    requirements?: CampaignWizardUpdaterequirementsInput | InputJsonValue[]
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    step4Complete?: BoolFieldUpdateOperationsInput | boolean
    history?: WizardHistoryUncheckedUpdateManyWithoutWizardNestedInput
  }

  export type CampaignWizardCreateManyInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    currentStep?: number
    isComplete?: boolean
    status?: $Enums.Status
    name: string
    businessGoal: string
    startDate: Date | string
    endDate: Date | string
    timeZone: string
    primaryContact: JsonNullValueInput | InputJsonValue
    secondaryContact?: NullableJsonNullValueInput | InputJsonValue
    budget: JsonNullValueInput | InputJsonValue
    platform: $Enums.Platform
    influencerHandle: string
    step1Complete?: boolean
    primaryKPI?: $Enums.KPI | null
    secondaryKPIs?: CampaignWizardCreatesecondaryKPIsInput | $Enums.KPI[]
    messaging?: NullableJsonNullValueInput | InputJsonValue
    expectedOutcomes?: NullableJsonNullValueInput | InputJsonValue
    features?: CampaignWizardCreatefeaturesInput | $Enums.Feature[]
    step2Complete?: boolean
    demographics?: NullableJsonNullValueInput | InputJsonValue
    locations?: CampaignWizardCreatelocationsInput | InputJsonValue[]
    targeting?: NullableJsonNullValueInput | InputJsonValue
    competitors?: CampaignWizardCreatecompetitorsInput | string[]
    step3Complete?: boolean
    assets?: CampaignWizardCreateassetsInput | InputJsonValue[]
    guidelines?: string | null
    requirements?: CampaignWizardCreaterequirementsInput | InputJsonValue[]
    notes?: string | null
    step4Complete?: boolean
  }

  export type CampaignWizardUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentStep?: IntFieldUpdateOperationsInput | number
    isComplete?: BoolFieldUpdateOperationsInput | boolean
    status?: EnumStatusFieldUpdateOperationsInput | $Enums.Status
    name?: StringFieldUpdateOperationsInput | string
    businessGoal?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    timeZone?: StringFieldUpdateOperationsInput | string
    primaryContact?: JsonNullValueInput | InputJsonValue
    secondaryContact?: NullableJsonNullValueInput | InputJsonValue
    budget?: JsonNullValueInput | InputJsonValue
    platform?: EnumPlatformFieldUpdateOperationsInput | $Enums.Platform
    influencerHandle?: StringFieldUpdateOperationsInput | string
    step1Complete?: BoolFieldUpdateOperationsInput | boolean
    primaryKPI?: NullableEnumKPIFieldUpdateOperationsInput | $Enums.KPI | null
    secondaryKPIs?: CampaignWizardUpdatesecondaryKPIsInput | $Enums.KPI[]
    messaging?: NullableJsonNullValueInput | InputJsonValue
    expectedOutcomes?: NullableJsonNullValueInput | InputJsonValue
    features?: CampaignWizardUpdatefeaturesInput | $Enums.Feature[]
    step2Complete?: BoolFieldUpdateOperationsInput | boolean
    demographics?: NullableJsonNullValueInput | InputJsonValue
    locations?: CampaignWizardUpdatelocationsInput | InputJsonValue[]
    targeting?: NullableJsonNullValueInput | InputJsonValue
    competitors?: CampaignWizardUpdatecompetitorsInput | string[]
    step3Complete?: BoolFieldUpdateOperationsInput | boolean
    assets?: CampaignWizardUpdateassetsInput | InputJsonValue[]
    guidelines?: NullableStringFieldUpdateOperationsInput | string | null
    requirements?: CampaignWizardUpdaterequirementsInput | InputJsonValue[]
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    step4Complete?: BoolFieldUpdateOperationsInput | boolean
  }

  export type CampaignWizardUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentStep?: IntFieldUpdateOperationsInput | number
    isComplete?: BoolFieldUpdateOperationsInput | boolean
    status?: EnumStatusFieldUpdateOperationsInput | $Enums.Status
    name?: StringFieldUpdateOperationsInput | string
    businessGoal?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    timeZone?: StringFieldUpdateOperationsInput | string
    primaryContact?: JsonNullValueInput | InputJsonValue
    secondaryContact?: NullableJsonNullValueInput | InputJsonValue
    budget?: JsonNullValueInput | InputJsonValue
    platform?: EnumPlatformFieldUpdateOperationsInput | $Enums.Platform
    influencerHandle?: StringFieldUpdateOperationsInput | string
    step1Complete?: BoolFieldUpdateOperationsInput | boolean
    primaryKPI?: NullableEnumKPIFieldUpdateOperationsInput | $Enums.KPI | null
    secondaryKPIs?: CampaignWizardUpdatesecondaryKPIsInput | $Enums.KPI[]
    messaging?: NullableJsonNullValueInput | InputJsonValue
    expectedOutcomes?: NullableJsonNullValueInput | InputJsonValue
    features?: CampaignWizardUpdatefeaturesInput | $Enums.Feature[]
    step2Complete?: BoolFieldUpdateOperationsInput | boolean
    demographics?: NullableJsonNullValueInput | InputJsonValue
    locations?: CampaignWizardUpdatelocationsInput | InputJsonValue[]
    targeting?: NullableJsonNullValueInput | InputJsonValue
    competitors?: CampaignWizardUpdatecompetitorsInput | string[]
    step3Complete?: BoolFieldUpdateOperationsInput | boolean
    assets?: CampaignWizardUpdateassetsInput | InputJsonValue[]
    guidelines?: NullableStringFieldUpdateOperationsInput | string | null
    requirements?: CampaignWizardUpdaterequirementsInput | InputJsonValue[]
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    step4Complete?: BoolFieldUpdateOperationsInput | boolean
  }

  export type WizardHistoryCreateInput = {
    id?: string
    step: number
    action: string
    changes: JsonNullValueInput | InputJsonValue
    performedBy: string
    timestamp?: Date | string
    wizard: CampaignWizardCreateNestedOneWithoutHistoryInput
  }

  export type WizardHistoryUncheckedCreateInput = {
    id?: string
    wizardId: string
    step: number
    action: string
    changes: JsonNullValueInput | InputJsonValue
    performedBy: string
    timestamp?: Date | string
  }

  export type WizardHistoryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    step?: IntFieldUpdateOperationsInput | number
    action?: StringFieldUpdateOperationsInput | string
    changes?: JsonNullValueInput | InputJsonValue
    performedBy?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    wizard?: CampaignWizardUpdateOneRequiredWithoutHistoryNestedInput
  }

  export type WizardHistoryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    wizardId?: StringFieldUpdateOperationsInput | string
    step?: IntFieldUpdateOperationsInput | number
    action?: StringFieldUpdateOperationsInput | string
    changes?: JsonNullValueInput | InputJsonValue
    performedBy?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WizardHistoryCreateManyInput = {
    id?: string
    wizardId: string
    step: number
    action: string
    changes: JsonNullValueInput | InputJsonValue
    performedBy: string
    timestamp?: Date | string
  }

  export type WizardHistoryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    step?: IntFieldUpdateOperationsInput | number
    action?: StringFieldUpdateOperationsInput | string
    changes?: JsonNullValueInput | InputJsonValue
    performedBy?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WizardHistoryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    wizardId?: StringFieldUpdateOperationsInput | string
    step?: IntFieldUpdateOperationsInput | number
    action?: StringFieldUpdateOperationsInput | string
    changes?: JsonNullValueInput | InputJsonValue
    performedBy?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type EnumStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.Status | EnumStatusFieldRefInput<$PrismaModel>
    in?: $Enums.Status[] | ListEnumStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.Status[] | ListEnumStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumStatusFilter<$PrismaModel> | $Enums.Status
  }
  export type JsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }
  export type JsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type EnumPlatformFilter<$PrismaModel = never> = {
    equals?: $Enums.Platform | EnumPlatformFieldRefInput<$PrismaModel>
    in?: $Enums.Platform[] | ListEnumPlatformFieldRefInput<$PrismaModel>
    notIn?: $Enums.Platform[] | ListEnumPlatformFieldRefInput<$PrismaModel>
    not?: NestedEnumPlatformFilter<$PrismaModel> | $Enums.Platform
  }

  export type EnumKPINullableFilter<$PrismaModel = never> = {
    equals?: $Enums.KPI | EnumKPIFieldRefInput<$PrismaModel> | null
    in?: $Enums.KPI[] | ListEnumKPIFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.KPI[] | ListEnumKPIFieldRefInput<$PrismaModel> | null
    not?: NestedEnumKPINullableFilter<$PrismaModel> | $Enums.KPI | null
  }

  export type EnumKPINullableListFilter<$PrismaModel = never> = {
    equals?: $Enums.KPI[] | ListEnumKPIFieldRefInput<$PrismaModel> | null
    has?: $Enums.KPI | EnumKPIFieldRefInput<$PrismaModel> | null
    hasEvery?: $Enums.KPI[] | ListEnumKPIFieldRefInput<$PrismaModel>
    hasSome?: $Enums.KPI[] | ListEnumKPIFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type EnumFeatureNullableListFilter<$PrismaModel = never> = {
    equals?: $Enums.Feature[] | ListEnumFeatureFieldRefInput<$PrismaModel> | null
    has?: $Enums.Feature | EnumFeatureFieldRefInput<$PrismaModel> | null
    hasEvery?: $Enums.Feature[] | ListEnumFeatureFieldRefInput<$PrismaModel>
    hasSome?: $Enums.Feature[] | ListEnumFeatureFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }
  export type JsonNullableListFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableListFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableListFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableListFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableListFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableListFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue[] | ListJsonFieldRefInput<$PrismaModel> | null
    has?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    hasEvery?: InputJsonValue[] | ListJsonFieldRefInput<$PrismaModel>
    hasSome?: InputJsonValue[] | ListJsonFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type WizardHistoryListRelationFilter = {
    every?: WizardHistoryWhereInput
    some?: WizardHistoryWhereInput
    none?: WizardHistoryWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type WizardHistoryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CampaignWizardCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    currentStep?: SortOrder
    isComplete?: SortOrder
    status?: SortOrder
    name?: SortOrder
    businessGoal?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    timeZone?: SortOrder
    primaryContact?: SortOrder
    secondaryContact?: SortOrder
    budget?: SortOrder
    platform?: SortOrder
    influencerHandle?: SortOrder
    step1Complete?: SortOrder
    primaryKPI?: SortOrder
    secondaryKPIs?: SortOrder
    messaging?: SortOrder
    expectedOutcomes?: SortOrder
    features?: SortOrder
    step2Complete?: SortOrder
    demographics?: SortOrder
    locations?: SortOrder
    targeting?: SortOrder
    competitors?: SortOrder
    step3Complete?: SortOrder
    assets?: SortOrder
    guidelines?: SortOrder
    requirements?: SortOrder
    notes?: SortOrder
    step4Complete?: SortOrder
  }

  export type CampaignWizardAvgOrderByAggregateInput = {
    currentStep?: SortOrder
  }

  export type CampaignWizardMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    currentStep?: SortOrder
    isComplete?: SortOrder
    status?: SortOrder
    name?: SortOrder
    businessGoal?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    timeZone?: SortOrder
    platform?: SortOrder
    influencerHandle?: SortOrder
    step1Complete?: SortOrder
    primaryKPI?: SortOrder
    step2Complete?: SortOrder
    step3Complete?: SortOrder
    guidelines?: SortOrder
    notes?: SortOrder
    step4Complete?: SortOrder
  }

  export type CampaignWizardMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    currentStep?: SortOrder
    isComplete?: SortOrder
    status?: SortOrder
    name?: SortOrder
    businessGoal?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    timeZone?: SortOrder
    platform?: SortOrder
    influencerHandle?: SortOrder
    step1Complete?: SortOrder
    primaryKPI?: SortOrder
    step2Complete?: SortOrder
    step3Complete?: SortOrder
    guidelines?: SortOrder
    notes?: SortOrder
    step4Complete?: SortOrder
  }

  export type CampaignWizardSumOrderByAggregateInput = {
    currentStep?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type EnumStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Status | EnumStatusFieldRefInput<$PrismaModel>
    in?: $Enums.Status[] | ListEnumStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.Status[] | ListEnumStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumStatusWithAggregatesFilter<$PrismaModel> | $Enums.Status
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumStatusFilter<$PrismaModel>
    _max?: NestedEnumStatusFilter<$PrismaModel>
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type EnumPlatformWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Platform | EnumPlatformFieldRefInput<$PrismaModel>
    in?: $Enums.Platform[] | ListEnumPlatformFieldRefInput<$PrismaModel>
    notIn?: $Enums.Platform[] | ListEnumPlatformFieldRefInput<$PrismaModel>
    not?: NestedEnumPlatformWithAggregatesFilter<$PrismaModel> | $Enums.Platform
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPlatformFilter<$PrismaModel>
    _max?: NestedEnumPlatformFilter<$PrismaModel>
  }

  export type EnumKPINullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.KPI | EnumKPIFieldRefInput<$PrismaModel> | null
    in?: $Enums.KPI[] | ListEnumKPIFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.KPI[] | ListEnumKPIFieldRefInput<$PrismaModel> | null
    not?: NestedEnumKPINullableWithAggregatesFilter<$PrismaModel> | $Enums.KPI | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumKPINullableFilter<$PrismaModel>
    _max?: NestedEnumKPINullableFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type CampaignWizardScalarRelationFilter = {
    is?: CampaignWizardWhereInput
    isNot?: CampaignWizardWhereInput
  }

  export type WizardHistoryCountOrderByAggregateInput = {
    id?: SortOrder
    wizardId?: SortOrder
    step?: SortOrder
    action?: SortOrder
    changes?: SortOrder
    performedBy?: SortOrder
    timestamp?: SortOrder
  }

  export type WizardHistoryAvgOrderByAggregateInput = {
    step?: SortOrder
  }

  export type WizardHistoryMaxOrderByAggregateInput = {
    id?: SortOrder
    wizardId?: SortOrder
    step?: SortOrder
    action?: SortOrder
    performedBy?: SortOrder
    timestamp?: SortOrder
  }

  export type WizardHistoryMinOrderByAggregateInput = {
    id?: SortOrder
    wizardId?: SortOrder
    step?: SortOrder
    action?: SortOrder
    performedBy?: SortOrder
    timestamp?: SortOrder
  }

  export type WizardHistorySumOrderByAggregateInput = {
    step?: SortOrder
  }

  export type CampaignWizardCreatesecondaryKPIsInput = {
    set: $Enums.KPI[]
  }

  export type CampaignWizardCreatefeaturesInput = {
    set: $Enums.Feature[]
  }

  export type CampaignWizardCreatelocationsInput = {
    set: InputJsonValue[]
  }

  export type CampaignWizardCreatecompetitorsInput = {
    set: string[]
  }

  export type CampaignWizardCreateassetsInput = {
    set: InputJsonValue[]
  }

  export type CampaignWizardCreaterequirementsInput = {
    set: InputJsonValue[]
  }

  export type WizardHistoryCreateNestedManyWithoutWizardInput = {
    create?: XOR<WizardHistoryCreateWithoutWizardInput, WizardHistoryUncheckedCreateWithoutWizardInput> | WizardHistoryCreateWithoutWizardInput[] | WizardHistoryUncheckedCreateWithoutWizardInput[]
    connectOrCreate?: WizardHistoryCreateOrConnectWithoutWizardInput | WizardHistoryCreateOrConnectWithoutWizardInput[]
    createMany?: WizardHistoryCreateManyWizardInputEnvelope
    connect?: WizardHistoryWhereUniqueInput | WizardHistoryWhereUniqueInput[]
  }

  export type WizardHistoryUncheckedCreateNestedManyWithoutWizardInput = {
    create?: XOR<WizardHistoryCreateWithoutWizardInput, WizardHistoryUncheckedCreateWithoutWizardInput> | WizardHistoryCreateWithoutWizardInput[] | WizardHistoryUncheckedCreateWithoutWizardInput[]
    connectOrCreate?: WizardHistoryCreateOrConnectWithoutWizardInput | WizardHistoryCreateOrConnectWithoutWizardInput[]
    createMany?: WizardHistoryCreateManyWizardInputEnvelope
    connect?: WizardHistoryWhereUniqueInput | WizardHistoryWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type EnumStatusFieldUpdateOperationsInput = {
    set?: $Enums.Status
  }

  export type EnumPlatformFieldUpdateOperationsInput = {
    set?: $Enums.Platform
  }

  export type NullableEnumKPIFieldUpdateOperationsInput = {
    set?: $Enums.KPI | null
  }

  export type CampaignWizardUpdatesecondaryKPIsInput = {
    set?: $Enums.KPI[]
    push?: $Enums.KPI | $Enums.KPI[]
  }

  export type CampaignWizardUpdatefeaturesInput = {
    set?: $Enums.Feature[]
    push?: $Enums.Feature | $Enums.Feature[]
  }

  export type CampaignWizardUpdatelocationsInput = {
    set?: InputJsonValue[]
    push?: InputJsonValue | InputJsonValue[]
  }

  export type CampaignWizardUpdatecompetitorsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type CampaignWizardUpdateassetsInput = {
    set?: InputJsonValue[]
    push?: InputJsonValue | InputJsonValue[]
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type CampaignWizardUpdaterequirementsInput = {
    set?: InputJsonValue[]
    push?: InputJsonValue | InputJsonValue[]
  }

  export type WizardHistoryUpdateManyWithoutWizardNestedInput = {
    create?: XOR<WizardHistoryCreateWithoutWizardInput, WizardHistoryUncheckedCreateWithoutWizardInput> | WizardHistoryCreateWithoutWizardInput[] | WizardHistoryUncheckedCreateWithoutWizardInput[]
    connectOrCreate?: WizardHistoryCreateOrConnectWithoutWizardInput | WizardHistoryCreateOrConnectWithoutWizardInput[]
    upsert?: WizardHistoryUpsertWithWhereUniqueWithoutWizardInput | WizardHistoryUpsertWithWhereUniqueWithoutWizardInput[]
    createMany?: WizardHistoryCreateManyWizardInputEnvelope
    set?: WizardHistoryWhereUniqueInput | WizardHistoryWhereUniqueInput[]
    disconnect?: WizardHistoryWhereUniqueInput | WizardHistoryWhereUniqueInput[]
    delete?: WizardHistoryWhereUniqueInput | WizardHistoryWhereUniqueInput[]
    connect?: WizardHistoryWhereUniqueInput | WizardHistoryWhereUniqueInput[]
    update?: WizardHistoryUpdateWithWhereUniqueWithoutWizardInput | WizardHistoryUpdateWithWhereUniqueWithoutWizardInput[]
    updateMany?: WizardHistoryUpdateManyWithWhereWithoutWizardInput | WizardHistoryUpdateManyWithWhereWithoutWizardInput[]
    deleteMany?: WizardHistoryScalarWhereInput | WizardHistoryScalarWhereInput[]
  }

  export type WizardHistoryUncheckedUpdateManyWithoutWizardNestedInput = {
    create?: XOR<WizardHistoryCreateWithoutWizardInput, WizardHistoryUncheckedCreateWithoutWizardInput> | WizardHistoryCreateWithoutWizardInput[] | WizardHistoryUncheckedCreateWithoutWizardInput[]
    connectOrCreate?: WizardHistoryCreateOrConnectWithoutWizardInput | WizardHistoryCreateOrConnectWithoutWizardInput[]
    upsert?: WizardHistoryUpsertWithWhereUniqueWithoutWizardInput | WizardHistoryUpsertWithWhereUniqueWithoutWizardInput[]
    createMany?: WizardHistoryCreateManyWizardInputEnvelope
    set?: WizardHistoryWhereUniqueInput | WizardHistoryWhereUniqueInput[]
    disconnect?: WizardHistoryWhereUniqueInput | WizardHistoryWhereUniqueInput[]
    delete?: WizardHistoryWhereUniqueInput | WizardHistoryWhereUniqueInput[]
    connect?: WizardHistoryWhereUniqueInput | WizardHistoryWhereUniqueInput[]
    update?: WizardHistoryUpdateWithWhereUniqueWithoutWizardInput | WizardHistoryUpdateWithWhereUniqueWithoutWizardInput[]
    updateMany?: WizardHistoryUpdateManyWithWhereWithoutWizardInput | WizardHistoryUpdateManyWithWhereWithoutWizardInput[]
    deleteMany?: WizardHistoryScalarWhereInput | WizardHistoryScalarWhereInput[]
  }

  export type CampaignWizardCreateNestedOneWithoutHistoryInput = {
    create?: XOR<CampaignWizardCreateWithoutHistoryInput, CampaignWizardUncheckedCreateWithoutHistoryInput>
    connectOrCreate?: CampaignWizardCreateOrConnectWithoutHistoryInput
    connect?: CampaignWizardWhereUniqueInput
  }

  export type CampaignWizardUpdateOneRequiredWithoutHistoryNestedInput = {
    create?: XOR<CampaignWizardCreateWithoutHistoryInput, CampaignWizardUncheckedCreateWithoutHistoryInput>
    connectOrCreate?: CampaignWizardCreateOrConnectWithoutHistoryInput
    upsert?: CampaignWizardUpsertWithoutHistoryInput
    connect?: CampaignWizardWhereUniqueInput
    update?: XOR<XOR<CampaignWizardUpdateToOneWithWhereWithoutHistoryInput, CampaignWizardUpdateWithoutHistoryInput>, CampaignWizardUncheckedUpdateWithoutHistoryInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedEnumStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.Status | EnumStatusFieldRefInput<$PrismaModel>
    in?: $Enums.Status[] | ListEnumStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.Status[] | ListEnumStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumStatusFilter<$PrismaModel> | $Enums.Status
  }

  export type NestedEnumPlatformFilter<$PrismaModel = never> = {
    equals?: $Enums.Platform | EnumPlatformFieldRefInput<$PrismaModel>
    in?: $Enums.Platform[] | ListEnumPlatformFieldRefInput<$PrismaModel>
    notIn?: $Enums.Platform[] | ListEnumPlatformFieldRefInput<$PrismaModel>
    not?: NestedEnumPlatformFilter<$PrismaModel> | $Enums.Platform
  }

  export type NestedEnumKPINullableFilter<$PrismaModel = never> = {
    equals?: $Enums.KPI | EnumKPIFieldRefInput<$PrismaModel> | null
    in?: $Enums.KPI[] | ListEnumKPIFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.KPI[] | ListEnumKPIFieldRefInput<$PrismaModel> | null
    not?: NestedEnumKPINullableFilter<$PrismaModel> | $Enums.KPI | null
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedEnumStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Status | EnumStatusFieldRefInput<$PrismaModel>
    in?: $Enums.Status[] | ListEnumStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.Status[] | ListEnumStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumStatusWithAggregatesFilter<$PrismaModel> | $Enums.Status
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumStatusFilter<$PrismaModel>
    _max?: NestedEnumStatusFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedEnumPlatformWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Platform | EnumPlatformFieldRefInput<$PrismaModel>
    in?: $Enums.Platform[] | ListEnumPlatformFieldRefInput<$PrismaModel>
    notIn?: $Enums.Platform[] | ListEnumPlatformFieldRefInput<$PrismaModel>
    not?: NestedEnumPlatformWithAggregatesFilter<$PrismaModel> | $Enums.Platform
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPlatformFilter<$PrismaModel>
    _max?: NestedEnumPlatformFilter<$PrismaModel>
  }

  export type NestedEnumKPINullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.KPI | EnumKPIFieldRefInput<$PrismaModel> | null
    in?: $Enums.KPI[] | ListEnumKPIFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.KPI[] | ListEnumKPIFieldRefInput<$PrismaModel> | null
    not?: NestedEnumKPINullableWithAggregatesFilter<$PrismaModel> | $Enums.KPI | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumKPINullableFilter<$PrismaModel>
    _max?: NestedEnumKPINullableFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type WizardHistoryCreateWithoutWizardInput = {
    id?: string
    step: number
    action: string
    changes: JsonNullValueInput | InputJsonValue
    performedBy: string
    timestamp?: Date | string
  }

  export type WizardHistoryUncheckedCreateWithoutWizardInput = {
    id?: string
    step: number
    action: string
    changes: JsonNullValueInput | InputJsonValue
    performedBy: string
    timestamp?: Date | string
  }

  export type WizardHistoryCreateOrConnectWithoutWizardInput = {
    where: WizardHistoryWhereUniqueInput
    create: XOR<WizardHistoryCreateWithoutWizardInput, WizardHistoryUncheckedCreateWithoutWizardInput>
  }

  export type WizardHistoryCreateManyWizardInputEnvelope = {
    data: WizardHistoryCreateManyWizardInput | WizardHistoryCreateManyWizardInput[]
    skipDuplicates?: boolean
  }

  export type WizardHistoryUpsertWithWhereUniqueWithoutWizardInput = {
    where: WizardHistoryWhereUniqueInput
    update: XOR<WizardHistoryUpdateWithoutWizardInput, WizardHistoryUncheckedUpdateWithoutWizardInput>
    create: XOR<WizardHistoryCreateWithoutWizardInput, WizardHistoryUncheckedCreateWithoutWizardInput>
  }

  export type WizardHistoryUpdateWithWhereUniqueWithoutWizardInput = {
    where: WizardHistoryWhereUniqueInput
    data: XOR<WizardHistoryUpdateWithoutWizardInput, WizardHistoryUncheckedUpdateWithoutWizardInput>
  }

  export type WizardHistoryUpdateManyWithWhereWithoutWizardInput = {
    where: WizardHistoryScalarWhereInput
    data: XOR<WizardHistoryUpdateManyMutationInput, WizardHistoryUncheckedUpdateManyWithoutWizardInput>
  }

  export type WizardHistoryScalarWhereInput = {
    AND?: WizardHistoryScalarWhereInput | WizardHistoryScalarWhereInput[]
    OR?: WizardHistoryScalarWhereInput[]
    NOT?: WizardHistoryScalarWhereInput | WizardHistoryScalarWhereInput[]
    id?: StringFilter<"WizardHistory"> | string
    wizardId?: StringFilter<"WizardHistory"> | string
    step?: IntFilter<"WizardHistory"> | number
    action?: StringFilter<"WizardHistory"> | string
    changes?: JsonFilter<"WizardHistory">
    performedBy?: StringFilter<"WizardHistory"> | string
    timestamp?: DateTimeFilter<"WizardHistory"> | Date | string
  }

  export type CampaignWizardCreateWithoutHistoryInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    currentStep?: number
    isComplete?: boolean
    status?: $Enums.Status
    name: string
    businessGoal: string
    startDate: Date | string
    endDate: Date | string
    timeZone: string
    primaryContact: JsonNullValueInput | InputJsonValue
    secondaryContact?: NullableJsonNullValueInput | InputJsonValue
    budget: JsonNullValueInput | InputJsonValue
    platform: $Enums.Platform
    influencerHandle: string
    step1Complete?: boolean
    primaryKPI?: $Enums.KPI | null
    secondaryKPIs?: CampaignWizardCreatesecondaryKPIsInput | $Enums.KPI[]
    messaging?: NullableJsonNullValueInput | InputJsonValue
    expectedOutcomes?: NullableJsonNullValueInput | InputJsonValue
    features?: CampaignWizardCreatefeaturesInput | $Enums.Feature[]
    step2Complete?: boolean
    demographics?: NullableJsonNullValueInput | InputJsonValue
    locations?: CampaignWizardCreatelocationsInput | InputJsonValue[]
    targeting?: NullableJsonNullValueInput | InputJsonValue
    competitors?: CampaignWizardCreatecompetitorsInput | string[]
    step3Complete?: boolean
    assets?: CampaignWizardCreateassetsInput | InputJsonValue[]
    guidelines?: string | null
    requirements?: CampaignWizardCreaterequirementsInput | InputJsonValue[]
    notes?: string | null
    step4Complete?: boolean
  }

  export type CampaignWizardUncheckedCreateWithoutHistoryInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    currentStep?: number
    isComplete?: boolean
    status?: $Enums.Status
    name: string
    businessGoal: string
    startDate: Date | string
    endDate: Date | string
    timeZone: string
    primaryContact: JsonNullValueInput | InputJsonValue
    secondaryContact?: NullableJsonNullValueInput | InputJsonValue
    budget: JsonNullValueInput | InputJsonValue
    platform: $Enums.Platform
    influencerHandle: string
    step1Complete?: boolean
    primaryKPI?: $Enums.KPI | null
    secondaryKPIs?: CampaignWizardCreatesecondaryKPIsInput | $Enums.KPI[]
    messaging?: NullableJsonNullValueInput | InputJsonValue
    expectedOutcomes?: NullableJsonNullValueInput | InputJsonValue
    features?: CampaignWizardCreatefeaturesInput | $Enums.Feature[]
    step2Complete?: boolean
    demographics?: NullableJsonNullValueInput | InputJsonValue
    locations?: CampaignWizardCreatelocationsInput | InputJsonValue[]
    targeting?: NullableJsonNullValueInput | InputJsonValue
    competitors?: CampaignWizardCreatecompetitorsInput | string[]
    step3Complete?: boolean
    assets?: CampaignWizardCreateassetsInput | InputJsonValue[]
    guidelines?: string | null
    requirements?: CampaignWizardCreaterequirementsInput | InputJsonValue[]
    notes?: string | null
    step4Complete?: boolean
  }

  export type CampaignWizardCreateOrConnectWithoutHistoryInput = {
    where: CampaignWizardWhereUniqueInput
    create: XOR<CampaignWizardCreateWithoutHistoryInput, CampaignWizardUncheckedCreateWithoutHistoryInput>
  }

  export type CampaignWizardUpsertWithoutHistoryInput = {
    update: XOR<CampaignWizardUpdateWithoutHistoryInput, CampaignWizardUncheckedUpdateWithoutHistoryInput>
    create: XOR<CampaignWizardCreateWithoutHistoryInput, CampaignWizardUncheckedCreateWithoutHistoryInput>
    where?: CampaignWizardWhereInput
  }

  export type CampaignWizardUpdateToOneWithWhereWithoutHistoryInput = {
    where?: CampaignWizardWhereInput
    data: XOR<CampaignWizardUpdateWithoutHistoryInput, CampaignWizardUncheckedUpdateWithoutHistoryInput>
  }

  export type CampaignWizardUpdateWithoutHistoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentStep?: IntFieldUpdateOperationsInput | number
    isComplete?: BoolFieldUpdateOperationsInput | boolean
    status?: EnumStatusFieldUpdateOperationsInput | $Enums.Status
    name?: StringFieldUpdateOperationsInput | string
    businessGoal?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    timeZone?: StringFieldUpdateOperationsInput | string
    primaryContact?: JsonNullValueInput | InputJsonValue
    secondaryContact?: NullableJsonNullValueInput | InputJsonValue
    budget?: JsonNullValueInput | InputJsonValue
    platform?: EnumPlatformFieldUpdateOperationsInput | $Enums.Platform
    influencerHandle?: StringFieldUpdateOperationsInput | string
    step1Complete?: BoolFieldUpdateOperationsInput | boolean
    primaryKPI?: NullableEnumKPIFieldUpdateOperationsInput | $Enums.KPI | null
    secondaryKPIs?: CampaignWizardUpdatesecondaryKPIsInput | $Enums.KPI[]
    messaging?: NullableJsonNullValueInput | InputJsonValue
    expectedOutcomes?: NullableJsonNullValueInput | InputJsonValue
    features?: CampaignWizardUpdatefeaturesInput | $Enums.Feature[]
    step2Complete?: BoolFieldUpdateOperationsInput | boolean
    demographics?: NullableJsonNullValueInput | InputJsonValue
    locations?: CampaignWizardUpdatelocationsInput | InputJsonValue[]
    targeting?: NullableJsonNullValueInput | InputJsonValue
    competitors?: CampaignWizardUpdatecompetitorsInput | string[]
    step3Complete?: BoolFieldUpdateOperationsInput | boolean
    assets?: CampaignWizardUpdateassetsInput | InputJsonValue[]
    guidelines?: NullableStringFieldUpdateOperationsInput | string | null
    requirements?: CampaignWizardUpdaterequirementsInput | InputJsonValue[]
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    step4Complete?: BoolFieldUpdateOperationsInput | boolean
  }

  export type CampaignWizardUncheckedUpdateWithoutHistoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentStep?: IntFieldUpdateOperationsInput | number
    isComplete?: BoolFieldUpdateOperationsInput | boolean
    status?: EnumStatusFieldUpdateOperationsInput | $Enums.Status
    name?: StringFieldUpdateOperationsInput | string
    businessGoal?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    timeZone?: StringFieldUpdateOperationsInput | string
    primaryContact?: JsonNullValueInput | InputJsonValue
    secondaryContact?: NullableJsonNullValueInput | InputJsonValue
    budget?: JsonNullValueInput | InputJsonValue
    platform?: EnumPlatformFieldUpdateOperationsInput | $Enums.Platform
    influencerHandle?: StringFieldUpdateOperationsInput | string
    step1Complete?: BoolFieldUpdateOperationsInput | boolean
    primaryKPI?: NullableEnumKPIFieldUpdateOperationsInput | $Enums.KPI | null
    secondaryKPIs?: CampaignWizardUpdatesecondaryKPIsInput | $Enums.KPI[]
    messaging?: NullableJsonNullValueInput | InputJsonValue
    expectedOutcomes?: NullableJsonNullValueInput | InputJsonValue
    features?: CampaignWizardUpdatefeaturesInput | $Enums.Feature[]
    step2Complete?: BoolFieldUpdateOperationsInput | boolean
    demographics?: NullableJsonNullValueInput | InputJsonValue
    locations?: CampaignWizardUpdatelocationsInput | InputJsonValue[]
    targeting?: NullableJsonNullValueInput | InputJsonValue
    competitors?: CampaignWizardUpdatecompetitorsInput | string[]
    step3Complete?: BoolFieldUpdateOperationsInput | boolean
    assets?: CampaignWizardUpdateassetsInput | InputJsonValue[]
    guidelines?: NullableStringFieldUpdateOperationsInput | string | null
    requirements?: CampaignWizardUpdaterequirementsInput | InputJsonValue[]
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    step4Complete?: BoolFieldUpdateOperationsInput | boolean
  }

  export type WizardHistoryCreateManyWizardInput = {
    id?: string
    step: number
    action: string
    changes: JsonNullValueInput | InputJsonValue
    performedBy: string
    timestamp?: Date | string
  }

  export type WizardHistoryUpdateWithoutWizardInput = {
    id?: StringFieldUpdateOperationsInput | string
    step?: IntFieldUpdateOperationsInput | number
    action?: StringFieldUpdateOperationsInput | string
    changes?: JsonNullValueInput | InputJsonValue
    performedBy?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WizardHistoryUncheckedUpdateWithoutWizardInput = {
    id?: StringFieldUpdateOperationsInput | string
    step?: IntFieldUpdateOperationsInput | number
    action?: StringFieldUpdateOperationsInput | string
    changes?: JsonNullValueInput | InputJsonValue
    performedBy?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WizardHistoryUncheckedUpdateManyWithoutWizardInput = {
    id?: StringFieldUpdateOperationsInput | string
    step?: IntFieldUpdateOperationsInput | number
    action?: StringFieldUpdateOperationsInput | string
    changes?: JsonNullValueInput | InputJsonValue
    performedBy?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}