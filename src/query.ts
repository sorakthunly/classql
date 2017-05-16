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
    this.table = getMetaData(model).name;
  }

  /**
   * Get an item based on the given where clause object
   * @param wheres
   * @return promise of the db query
   */
  public async get(wheres: ModelConstructor<T>): Promise<any> {
    let statement = 'SELECT * FROM ' + this.table;
    statement = mapWhereClause(statement, wheres);
    let result = await this.db.prepare(statement);
    return result.length > 0 ? result[0] : null;
  }

  /**
   * Get all data matched the given where clause object
   * @param wheres
   * @return promise of the db query
   */
  public getAll(wheres: ModelConstructor<T>, options?: QueryOption): Promise<any[]> {
    let statement = 'SELECT * FROM ' + this.table;
    statement = mapWhereClause(statement, wheres);
    return this.db.prepare(statement);
  }

  /**
   * Save an object to the db if not exists, else update it
   * @param data
   * @return promised return query
   */
  public save(data: any): Promise<any> {
    let statement = [data.id ? 'UPDATE' : 'INSERT INTO', this.table, 'SET ?'].join(' ');
    return this.db.prepare(statement, data);
  }

  // public saveAll(data: any[]): Promise<any> {
  //   return Promise.resolve(1);
  // }

  /** Delete an item from the db
   * @param wheres
   * @return promised return query
   */
  public delete(wheres: any): Promise<any> {
    if (!wheres) throw new Error(errors.where);

    let statement = 'DELETE FROM ' + this.table;
    statement = mapWhereClause(statement, wheres);

    return this.db.prepare(statement);
  }
}
