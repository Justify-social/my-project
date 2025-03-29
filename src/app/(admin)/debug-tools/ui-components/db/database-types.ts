/**
 * Type definitions for better-sqlite3 interfaces
 * This allows us to use the types without directly importing the module,
 * which would cause problems on the client side
 */

/**
 * Database interface representing a SQLite database connection
 */
export interface Database {
  exec(sql: string): void;
  prepare<T = any>(sql: string): Statement<T>;
  transaction<T>(fn: (...args: any[]) => T): (...args: any[]) => T;
  pragma(source: string, options?: { simple?: boolean }): any;
  function(name: string, cb: (...args: any[]) => any): void;
  aggregate(name: string, options: { start?: any; step: (...args: any[]) => any; result?: (...args: any[]) => any; inverse?: (...args: any[]) => any }): void;
  loadExtension(path: string): void;
  close(): void;
  defaultSafeIntegers(toggleState?: boolean): Database;
  backup(destination: string | Database, options?: { attached?: string; progress?: (info: { totalPages: number; remainingPages: number }) => boolean | void }): Promise<void>;
}

/**
 * Statement interface representing a prepared SQLite statement
 */
export interface Statement<T = any> {
  database: Database;
  source: string;
  reader: boolean;
  readonly: boolean;
  busy: boolean;
  
  run(...params: any[]): { changes: number; lastInsertRowid: number | bigint };
  get(...params: any[]): T;
  all(...params: any[]): T[];
  iterate(...params: any[]): IterableIterator<T>;
  pluck(toggleState?: boolean): Statement<T>;
  expand(toggleState?: boolean): Statement<T>;
  raw(toggleState?: boolean): Statement<T>;
  bind(...params: any[]): Statement<T>;
  columns(): ColumnDefinition[];
  safeIntegers(toggleState?: boolean): Statement<T>;
}

/**
 * Column definition interface for SQLite result columns
 */
export interface ColumnDefinition {
  name: string;
  column: string | null;
  table: string | null;
  database: string | null;
  type: string | null;
} 