const mysql = require('promise-mysql');
import 'reflect-metadata';
import { mapWhereClause, mapOptionClause, getMetaData } from './helpers';
import { Model, ModelConstructor } from './model';
import { Database } from './db';

export const errors = {
  where: 'Cannot find where clauses',
};

export interface QueryOption {
  limit: number;
  offset: number;
}

export class Query<T extends Model> {
  public db: Database;
  public model: ModelConstructor<T>;
  public options: any[];
  public table: string;


  constructor(db: Database, model: ModelConstructor<T>) {
    this.db = db;
    this.model = model;
    this.table = getMetaData(model);
  }

  /**
   * Get an item based on the given where clause object
   * @param wheres
   * @return promise of the db query
   */
  public async get(wheres: any, options?: string[]): Promise<any> {
    if (!wheres) throw new Error(errors.where);

    let statement = 'SELECT * FROM ' + this.table;
    statement = mapWhereClause(statement, wheres);

    if (options) statement = statement.replace('*', options.toString());

    let result = await this.db.query(statement);
    return result.length > 0 ? result[0] : null;
  }

  /**
   * Get all data matched the given where clause object
   * @param wheres
   * @return promise of the db query
   */
  public async getAll(wheres?: any, options?: QueryOption): Promise<any> {
    let statement = 'SELECT * FROM ' + this.table;

    if (wheres && (wheres.offset || wheres.limit)) {
      statement = mapOptionClause(statement, wheres);
    } else if (wheres && !wheres.offset && !wheres.limit) {
      statement = mapWhereClause(statement, wheres);
      if (options) statement = mapOptionClause(statement, options);
    }

    return this.db.query(statement);
  }

  /**
   * Save an object to the db if not exists, else update it
   * @param data
   * @return promised return query
   */
  public async save(data: T): Promise<any> {
    let statement = [data.id ? 'UPDATE' : 'INSERT INTO', this.table, 'SET ?'].join(' ');
    if (data.id) statement += ' WHERE id = ?';
    let queryData = data.id ? [data, data.id] : data;
    return this.db.query(statement, queryData);
  }

  /**
   * Save a list of objects to the db
   * @param data
   * @return promised return query
   */
  public async saveAll(items: T[]): Promise<any> {
    let statement = 'INSERT INTO ' + this.table;
    const columns = Object.keys(items[0]);
    statement += ' (' + columns.toString() + ') VALUES ?';

    let data = items.map(item => {
      return columns.map(field => item[field]);
    });

    if (columns.indexOf('id') > -1) {
      statement += ' ON DUPLICATE KEY UPDATE ';
      const noIdColumns = columns.filter(field => field !== 'id');

      for (let i = 0; i < noIdColumns.length; i++) {
        statement += noIdColumns[i] + ' = VALUES(' + noIdColumns[i] + ')';
        if (noIdColumns.length - i !== 1) statement += ', ';
      };
    }

    return this.db.query(statement, [data]);
  }

  /** Delete an item from the db
   * @param wheres
   * @return promised return query
   */
  public async delete(wheres: any): Promise<any> {
    if (!wheres) throw new Error(errors.where);

    let statement = 'DELETE FROM ' + this.table;
    statement = mapWhereClause(statement, wheres);

    return this.db.query(statement);
  }
}
