import 'reflect-metadata';

export const MODEL_META_KEY = 'MODEL:META:KEY';

export abstract class Model {}

export type ModelConstructor<T extends Model> = typeof Model & { new(): T }; 

export function model(name: string) {
  return (ctor: Function): void => {
    let meta = { ... Reflect.getMetadata(MODEL_META_KEY, ctor.prototype) };
    meta.name = name;

    Reflect.defineMetadata(MODEL_META_KEY, meta, ctor.prototype);
  };
}
