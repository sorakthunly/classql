import { Model, ModelConstructor } from './model';
import { Query } from './on';

const mysql = require('promise-mysql');

/** Default MySQL connection option */
export interface ConnectionOption {
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
  charset?: string;
  debug?: boolean;
  connectTimeout?: number;
}

/**
 * Main class to be instantiated to connect to the database
 */
export class Database {
  public conn: any;

  /**
   * Create a connection to the db
   * Must be called before importing db for use
   * @param db  Connection option { user, pass, port, host, db }
   * @param mode?  pool or single conneciton
   */
  constructor(db: ConnectionOption | string, mode?: 'connection' | 'pool') {
    this.conn = mode === 'pool' ?
      mysql.createPool(db) : mysql.createConnection(db);
  }

  /**
   * Runs query on a given model
   * @param model
   */
  public on<T extends Model>(model: ModelConstructor<T>) {
    return new Query(this, model);
  }

  /**
   * Send prepared sql script to the database
   * @param query
   * @return promised query data
   */
  public query(query: string, extras?: any): Promise<any> {
    return extras ? this.conn.query(query, extras) : this.conn.query(query);
  }

  /** Escape any mysql injection string */
  public escape(data: string): string {
    return this.conn.escape(data);
  }

  /** Getting the connection for the pool */
  public getConnection(): Promise<any> {
    return this.conn.getConnection();
  }

  /** Close the connection to the database */
  public close(): void {
    this.conn.close();
  }
}
