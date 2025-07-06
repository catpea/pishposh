import { EventEmitter } from "../../core/Signal.js";


export class PersistentMap extends EventEmitter {
  ready = false;
  constructor(data = null, options = {}) {
    super();

    if (!options.prefix) {
      throw new Error('StoredMap requires a prefix option');
    }
    if (options.onRestored) {
      this.on('restored', options.onRestored)
    }
    if (options.onLoaded) {
      this.on('loaded', options.onLoaded)
    }

    this.prefix = options.prefix;
    this._keysKey = `${this.prefix}:__keys__`;

    // Load existing keys from localStorage
    this._loadKeys();

    // If initial data provided, populate the map
    if (data) {
      if (data instanceof Map) {
        for (let [key, value] of data) {
          this.set(key, value);
        }
      } else if (typeof data === 'object' && data !== null) {
        for (let [key, value] of Object.entries(data)) {
          this.set(key, value);
        }
      }
    }
      this.emit('loaded', this);

  }

  _loadKeys() {

    try {
      const keysJson = localStorage.getItem(this._keysKey);
      this._keys = keysJson ? new Set(JSON.parse(keysJson)) : new Set();
    } catch (e) {
      this._keys = new Set();
    }

    this.ready = true;
    this.emit('restored', this);
    this.emit('ready', this);
  }

  _saveKeys() {
    try {
      localStorage.setItem(this._keysKey, JSON.stringify([...this._keys]));
    } catch (e) {
      console.error('Failed to save keys to localStorage:', e);
    }
  }

  _getStorageKey(key) {
    return `${this.prefix}:${key}`;
  }

  get size() {
    return this._keys.size;
  }

  set(key, value) {
    const storageKey = this._getStorageKey(key);
    const hadKey = this._keys.has(key);

    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
      this._keys.add(key);
      this._saveKeys();

      this.emit(hadKey ? 'update' : 'set', key, value);
      return this;
    } catch (e) {
      console.error('Failed to set item in localStorage:', e);
      throw e;
    }
  }

  get(key) {
    if (!this._keys.has(key)) {
      return undefined;
    }

    const storageKey = this._getStorageKey(key);
    try {
      const item = localStorage.getItem(storageKey);
      return item !== null ? JSON.parse(item) : undefined;
    } catch (e) {
      console.error('Failed to get item from localStorage:', e);
      return undefined;
    }
  }

  has(key) {
    return this._keys.has(key);
  }

  delete(key) {
    if (!this._keys.has(key)) {
      return false;
    }

    const storageKey = this._getStorageKey(key);
    try {
      localStorage.removeItem(storageKey);
      this._keys.delete(key);
      this._saveKeys();

      this.emit('delete', key);
      return true;
    } catch (e) {
      console.error('Failed to delete item from localStorage:', e);
      return false;
    }
  }

  clear() {
    const keysToDelete = [...this._keys];

    for (const key of keysToDelete) {
      const storageKey = this._getStorageKey(key);
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {
        console.error('Failed to remove item from localStorage:', e);
      }
    }

    this._keys.clear();
    try {
      localStorage.removeItem(this._keysKey);
    } catch (e) {
      console.error('Failed to remove keys from localStorage:', e);
    }

    this.emit('clear');
  }

  keys() {
    return this._keys.values();
  }

  values() {
    const self = this;
    return {
      *[Symbol.iterator]() {
        for (const key of self._keys) {
          yield self.get(key);
        }
      }
    };
  }

  entries() {
    const self = this;
    return {
      *[Symbol.iterator]() {
        for (const key of self._keys) {
          yield [key, self.get(key)];
        }
      }
    };
  }

  [Symbol.iterator]() {
    return this.entries()[Symbol.iterator]();
  }

  forEach(callback, thisArg) {
    for (const [key, value] of this) {
      callback.call(thisArg, value, key, this);
    }
  }

  // Additional utility methods
  toJSON() {
    const obj = {};
    for (const [key, value] of this) {
      obj[key] = value;
    }
    return obj;
  }

  toString() {
    return `StoredMap(${this.size}) { ${[...this.keys()].join(', ')} }`;
  }
}


/**

// Usage example:
const myMap = new StoredMap(null, {prefix: 'pishposh-databases'});

// Add some data
myMap.set('user1', { name: 'Alice', age: 30 });
myMap.set('user2', { name: 'Bob', age: 25 });
myMap.set('config', { theme: 'dark', language: 'en' });

// Listen to events
myMap.on('set', (key, value) => {
  console.log(`New item set: ${key}`, value);
});

myMap.on('delete', (key) => {
  console.log(`Item deleted: ${key}`);
});

// Use it like a Map
console.log('Size:', myMap.size);
console.log('Has user1:', myMap.has('user1'));
console.log('Get user1:', myMap.get('user1'));

// Iterate
for (const [key, value] of myMap) {
  console.log(`${key}:`, value);
}

// The data persists - if you refresh the page and create a new instance:
// const persistedMap = new StoredMap(null, {prefix: 'pishposh-databases'});
// It will automatically load all the previous data!

**/
