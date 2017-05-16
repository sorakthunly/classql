const mysql = require('promise-mysql');
import { MODEL_META_KEY } from './model';

/**
 * Get the metadata for a given model
 * @param model
 * @return model meta data
 */
export function getMetaData(model: any) {
  const meta = Reflect.getMetadata(MODEL_META_KEY, ctor.prototype);
  return meta.name;
}

/**
 * Turn an object into a mysql where clause
 * @param statement  Initail statement to be joined
 * @param wheres  An object to be converted
 * @return the finalized statement
 */
export function mapWhereClause(statement: string, wheres: any): string {
  let count = 0;
  return Object.keys(wheres).reduce((prev, current): string => {
    count++;
    const value = mysql.escape(wheres[current]);
    return [prev, count === 1 ? 'WHERE' : 'AND', current, '=', value].join(' ');
  }, statement);
}

/**
 * Turn an object into a mysql query option clause (LIMIT AND OFFSET)
 * @param statement  Initail statement to be joined
 * @param wheres  An object to be converted
 * @return the finalized statement
 */
export function mapOptionClause(statement: string, options: any) {
  return Object.keys(options).reduce((prev, current): string => {
    const value = mysql.escape(options[current]);
    return [prev, current, '=', value].join(' ');
  }, statement);
}
