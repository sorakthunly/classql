import 'reflect-metadata';

export const MODEL_META_KEY = 'MODEL:META:KEY';

export abstract class Model {}

export type ModelConstructor<T extends Model> = typeof Model & { new(): T }; 

export function model(name: string) {
  return (target: Object, key: string) => {
    let meta = { ... Reflect.getMetadata(MODEL_META_KEY, target) };
    meta[name] = name;

    Reflect.defineMetadata(MODEL_META_KEY, meta, target);
  }
}

