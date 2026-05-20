

// dynamicMapper.ts
// ------------------------------------------------------------
// Generic runtime mapper for TypeScript models with nested objects, arrays,
// dictionaries and Date conversion.
// ------------------------------------------------------------

import axios, { AxiosError } from 'axios';

type Constructor<T> = new () => T;

export interface MappingOptions {
  model?: Constructor<any>;               // For single nested model
  arrayOf?: Constructor<any>;             // For arrays of models
  dictionaryOf?: Constructor<any>;        // For dictionaries of models
  date?: boolean;                         // To parse this field as Date
  map?: Record<string, MappingOptions>;   // Nested mappings for child models
}

/**
 * Recursively maps a plain JS object to a class instance.
 */
export function dynamicFromJS<T>(
  data: any,
  type: Constructor<T>,
  mappings: Record<string, MappingOptions> = {}
): T {
  const instance = new type();

  if (!data || typeof data !== 'object') return instance;

  const keys = Array.from(new Set([...Object.keys(instance as any), ...Object.keys(mappings)]));

  for (const key of keys) {
    const m = mappings[key];
    const value = data[key];

    // ✅ Ensure arrays are initialized even when no value is provided
    if (m?.arrayOf && (value === undefined || value === null)) {
      (instance as any)[key] = [];
      continue;
    }

    if (value === undefined) continue;

    // ✅ Date field
    if (m?.date) {
      (instance as any)[key] = value ? new Date(value.toString()) : undefined;
      continue;
    }

    // ✅ Nested model
    if (m?.model && value && typeof value === 'object') {
      (instance as any)[key] =  (m.model as any).fromJS(value)
      continue;
    }

    // ✅ Array of models
    if (m?.arrayOf && Array.isArray(value)) {
      const arrayItemType = m.arrayOf as any;
      (instance as any)[key] = value.map(v =>
        typeof arrayItemType.fromJS === 'function' ? arrayItemType.fromJS(v) : v
      );
      continue;
    }

    // ✅ Dictionary of models
    if (m?.dictionaryOf && value && typeof value === 'object' && !Array.isArray(value)) {
      const dict: any = {};
      const dictionaryItemType = m.dictionaryOf as any;
      for (const k in value) {
        if (!Object.prototype.hasOwnProperty.call(value, k)) continue;
        const v = value[k];
        dict[k] = typeof dictionaryItemType.fromJS === 'function' ? dictionaryItemType.fromJS(v) : v;
      }
      (instance as any)[key] = dict;
      continue;
    }

    // ✅ Fallback primitive or plain object
    (instance as any)[key] = value;
  }

  return instance;
}

/**
 * Recursively converts an instance of T to a plain JS object.
 */
export function dynamicToJSON<T>(instance: T): any {
  const result: any = {};
  const keys = Object.keys(instance as any);

  for (const key of keys) {
    const value = (instance as any)[key];

    if (value == null) {
      result[key] = value;
      continue;
    }

    // ✅ Date
    if (value instanceof Date) {
      result[key] = value.toISOString();
      continue;
    }

    // ✅ Single model
    if (typeof (value as any).toJSON === 'function') {
      result[key] = (value as any).toJSON();
      continue;
    }

    // ✅ Array of models
    if (Array.isArray(value)) {
      result[key] = value.map(v =>
        v instanceof Date
          ? v.toISOString()
          : v && typeof (v as any).toJSON === 'function'
          ? (v as any).toJSON()
          : v
      );
      continue;
    }

    // ✅ Dictionary of models
    if (typeof value === 'object') {
      const dict: any = {};
      for (const dk in value) {
        if (!Object.prototype.hasOwnProperty.call(value, dk)) continue;
        const dv = value[dk];
        dict[dk] =
          dv instanceof Date
            ? dv.toISOString()
            : dv && typeof (dv as any).toJSON === 'function'
            ? (dv as any).toJSON()
            : dv;
      }
      result[key] = dict;
      continue;
    }

    // ✅ Primitive
    result[key] = value;
  }

  return result;
}

export class FileResponse {
    data!: Blob;
    status!: number;
    fileName?: string;
    headers?: { [name: string]: any };
}

export class ApiException extends Error {
    override message: string;
    status: number;
    response: string;
    headers: { [key: string]: any; };
    result: any;

    constructor(message: string, status: number, response: string, headers: { [key: string]: any; }, result: any) {
        super();

        this.message = message;
        this.status = status;
        this.response = response;
        this.headers = headers;
        this.result = result;
    }

    protected isApiException = true;

    static isApiException(obj: any): obj is ApiException {
        return obj.isApiException === true;
    }
}

export function throwException(message: string, status: number, response: string, headers: { [key: string]: any; }, result?: any): any {
    if (result !== null && result !== undefined)
        throw result;
    else
        throw new ApiException(message, status, response, headers, null);
}

export function isAxiosError(obj: any | undefined): obj is AxiosError {
    return obj && obj.isAxiosError === true;
} 

export const http = axios.create()