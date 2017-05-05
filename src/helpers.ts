import { MODEL_META_KEY } from './model';

/**
 * Get the metadata for a given model
 * @param model
 * @return model meta data
 */
export function getMetaData(model: any) {
  return Reflect.getMetadata(MODEL_META_KEY, model);
}

/**
 * Turn an object into a mysql where clause
 * @param statement  Initail statement to be joined
 * @param wheres  An object to be converted
 * @return the finalized statement
 */
export function mapWhereClause(statement: string, wheres: any) {
  let count = 0;

  Object.keys(wheres).forEach(key => {
    if (!wheres[key]) return;
    statement += [' ', count === 0 ? 'WHERE' : 'AND', key, '=', wheres[key]].join(' ');
    count++;
  });

  return statement;
}
