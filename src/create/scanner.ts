import { deepClone } from './utils';
import { DUCK_TAG } from '../async/marker';
import {
  COLLECTION_TAG,
  MULTI_COLLECTION_TAG,
} from '../entities/collection/marker';
import { RECORD_TAG } from '../entities/record/marker';


export type StoreShape = {
  plain: Record<string, any>;
  single: string[];
  multi: string[];
  records: string[];
  actions: string[];
};

const INTERNAL_KEYS = new Set([
  'deps',
  'root',
  'resetStore',
  '__getSnapshot',
  '__applySnapshot',
]);

export class Scanner {
  private isDuck(value: any) {
    return value && typeof value === 'object' && value[DUCK_TAG] === true;
  }

  private isSingleCollection(value: any) {
    return (
      value?.[COLLECTION_TAG] === true && value?.[MULTI_COLLECTION_TAG] !== true
    );
  }

  private isMultiCollection(value: any) {
    return value?.[MULTI_COLLECTION_TAG] === true;
  }

  private isRecord(value: any) {
    return value?.[RECORD_TAG] === true;
  }

  scanPlain(store: any) {
    const out: Record<string, any> = {};

    for (const key of Object.keys(store)) {
      if (INTERNAL_KEYS.has(key)) {
        continue;
      }

      const v = store[key];

      if (typeof v === 'function') {
        continue;
      }
      if (this.isDuck(v)) {
        continue;
      }
      if (this.isSingleCollection(v)) {
        continue;
      }
      if (this.isMultiCollection(v)) {
        continue;
      }
      if (this.isRecord(v)) {
        continue;
      }

      // IMPORTANT: store initial plain by VALUE (not by reference)
      out[key] = deepClone(v);
    }

    return out;
  }

  scanSingleKeys(store: any) {
    return Object.keys(store).filter(k => this.isSingleCollection(store[k]));
  }

  scanMultiKeys(store: any) {
    return Object.keys(store).filter(k => this.isMultiCollection(store[k]));
  }

  scanRecordKeys(store: any) {
    return Object.keys(store).filter(k => this.isRecord(store[k]));
  }

  scanActions(store: any) {
    const out = new Set<string>();

    // instance methods (arrow fns on instance)
    for (const key of Object.keys(store)) {
      if (INTERNAL_KEYS.has(key)) {
        continue;
      }

      const v = store[key];
      if (this.isDuck(v)) {
        continue;
      }
      if (typeof v === 'function' && !key.startsWith('_')) {
        out.add(key);
      }
    }

    // prototype methods
    const proto = Object.getPrototypeOf(store);
    for (const key of Object.getOwnPropertyNames(proto)) {
      if (key === 'constructor') {
        continue;
      }
      if (INTERNAL_KEYS.has(key)) {
        continue;
      }
      if (key.startsWith('_')) {
        continue;
      }

      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (!desc) {
        continue;
      }

      // only real methods, not getters/setters
      if (typeof desc.value === 'function') {
        out.add(key);
      }
    }

    return [...out];
  }

  scan(store: any): StoreShape {
    return {
      plain: this.scanPlain(store),
      single: this.scanSingleKeys(store),
      multi: this.scanMultiKeys(store),
      records: this.scanRecordKeys(store),
      actions: this.scanActions(store),
    };
  }
}
