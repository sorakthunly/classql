const mysql = require('promise-mysql');
import 'reflect-metadata';
import { mapWhereClause, getMetaData } from './helpers';
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
  public getAll(wheres?: any, options?: QueryOption): Promise<any> {
    let statement = 'SELECT * FROM ' + this.table;
    statement = wheres ? mapWhereClause(statement, wheres) : statement;
    return this.db.query(statement);
  }

  /**
   * Save an object to the db if not exists, else update it
   * @param data
   * @return promised return query
   */
  public save(data: T): Promise<any> {
    let statement = [data.id ? 'UPDATE' : 'INSERT INTO', this.table, 'SET ?'].join(' ');
    return this.db.query(statement, data);
  }

  /**
   * Save a list of objects to the db
   * @param data
   * @return promised return query
   */
  public saveAll(items: T[]): Promise<any> {
    let statement = 'INSERT INTO ' + this.table;

    const columns = Object.keys(items[0]);
    statement += ' (' + columns.toString() + ') VALUES ';

    let count = 0;
    let length = columns.length;
    items.forEach(data => {
      count++;
      const values = columns.map(field => mysql.escape(data[field])).toString();
      statement += '(' + values + ')';
      if (count !== length) statement += ', ';
    });

    if (columns.indexOf('id') > -1) {
      statement += ' ON DUPLICATE KEY UPDATE ';
      const noIdColumns = columns.filter(i => i !== 'id');

      let count = 0;
      let length = noIdColumns.length;
      items.forEach(data => {
        count++;
        const values = noIdColumns.map(field => {
          return [' ', field, '= VALUES(' + field + ')'].join(' ');
        });
        statement += values;
        if (count !== length) statement += ', ';
      });
    }

    return this.db.query(statement);
  }

  /** Delete an item from the db
   * @param wheres
   * @return promised return query
   */
  public delete(wheres: any): Promise<any> {
    if (!wheres) throw new Error(errors.where);

    let statement = 'DELETE FROM ' + this.table;
    statement = mapWhereClause(statement, wheres);

    return this.db.query(statement);
  }
}
