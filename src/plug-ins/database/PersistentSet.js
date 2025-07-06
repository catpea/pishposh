import { EventEmitter } from "../../core/Signal.js";

export class PersistentSet extends EventEmitter {
  ready = false;

  constructor(iterable = null, options = {}) {
    super();

    if (!options.prefix) {
      throw new Error('StoredSet requires a prefix option');
    }
    if (options.onRestored) {
      this.on('restored', options.onRestored)
    }
    if (options.onLoaded) {
      this.on('loaded', options.onLoaded)
    }
    this.prefix = options.prefix;
    this._valuesKey = `${this.prefix}:__values__`;

    // Load existing values from localStorage
    this._loadValues();

    // If initial data provided, populate the set
    if (iterable) {
      for (const value of iterable) {
        this.add(value);
      }
    }
    this.emit('loaded', this);

  }

  _loadValues() {
    try {
      const valuesJson = localStorage.getItem(this._valuesKey);
      this._values = valuesJson ? new Set(JSON.parse(valuesJson)) : new Set();
    } catch (e) {
      this._values = new Set();
    }
    this.ready = true;
    this.emit('restored', this);
    this.emit('ready', this);
  }

  _saveValues() {
    try {
      localStorage.setItem(this._valuesKey, JSON.stringify([...this._values]));
    } catch (e) {
      console.error('Failed to save values to localStorage:', e);
    }
  }

  _getStorageKey(value) {
    // Create a consistent key for the value by JSON stringifying it
    const valueStr = JSON.stringify(value);
    // Use a hash-like approach for complex objects to avoid key length issues
    return `${this.prefix}:${btoa(valueStr).replace(/[/+=]/g, '_')}`;
  }

  get size() {
    return this._values.size;
  }

  add(value) {
    const valueStr = JSON.stringify(value);
    const hadValue = this._values.has(valueStr);

    if (!hadValue) {
      const storageKey = this._getStorageKey(value);

      try {
        localStorage.setItem(storageKey, JSON.stringify(value));
        this._values.add(valueStr);
        this._saveValues();

        this.emit('add', value);
      } catch (e) {
        console.error('Failed to add item to localStorage:', e);
        throw e;
      }
    }

    return this;
  }

  has(value) {
    const valueStr = JSON.stringify(value);
    return this._values.has(valueStr);
  }

  delete(value) {
    const valueStr = JSON.stringify(value);

    if (!this._values.has(valueStr)) {
      return false;
    }

    const storageKey = this._getStorageKey(value);
    try {
      localStorage.removeItem(storageKey);
      this._values.delete(valueStr);
      this._saveValues();

      this.emit('delete', value);
      return true;
    } catch (e) {
      console.error('Failed to delete item from localStorage:', e);
      return false;
    }
  }

  clear() {
    // Remove all individual items from localStorage
    for (const valueStr of this._values) {
      try {
        const value = JSON.parse(valueStr);
        const storageKey = this._getStorageKey(value);
        localStorage.removeItem(storageKey);
      } catch (e) {
        console.error('Failed to remove item from localStorage:', e);
      }
    }

    this._values.clear();
    try {
      localStorage.removeItem(this._valuesKey);
    } catch (e) {
      console.error('Failed to remove values from localStorage:', e);
    }

    this.emit('clear');
  }

  values() {
    const self = this;
    return {
      *[Symbol.iterator]() {
        for (const valueStr of self._values) {
          try {
            yield JSON.parse(valueStr);
          } catch (e) {
            console.error('Failed to parse stored value:', e);
          }
        }
      }
    };
  }

  keys() {
    // In a Set, keys() and values() return the same iterator
    return this.values();
  }

  entries() {
    const self = this;
    return {
      *[Symbol.iterator]() {
        for (const valueStr of self._values) {
          try {
            const value = JSON.parse(valueStr);
            yield [value, value];
          } catch (e) {
            console.error('Failed to parse stored value:', e);
          }
        }
      }
    };
  }

  [Symbol.iterator]() {
    return this.values()[Symbol.iterator]();
  }

  forEach(callback, thisArg) {
    for (const value of this) {
      callback.call(thisArg, value, value, this);
    }
  }

  // Additional utility methods
  toArray() {
    return [...this];
  }

  toJSON() {
    return this.toArray();
  }

  toString() {
    return `StoredSet(${this.size}) { ${this.toArray().map(v => JSON.stringify(v)).join(', ')} }`;
  }

  // Set operations
  union(otherSet) {
    const result = new StoredSet(this, { prefix: this.prefix + '_temp_' + Date.now() });
    for (const value of otherSet) {
      result.add(value);
    }
    return result;
  }

  intersection(otherSet) {
    const result = new StoredSet(null, { prefix: this.prefix + '_temp_' + Date.now() });
    for (const value of this) {
      if (otherSet.has && otherSet.has(value)) {
        result.add(value);
      }
    }
    return result;
  }

  difference(otherSet) {
    const result = new StoredSet(null, { prefix: this.prefix + '_temp_' + Date.now() });
    for (const value of this) {
      if (!otherSet.has || !otherSet.has(value)) {
        result.add(value);
      }
    }
    return result;
  }
}

// Usage example:
const mySet = new StoredSet(null, {prefix: 'pishposh-tags'});

// Add some data
mySet.add('javascript');
mySet.add('react');
mySet.add('nodejs');
mySet.add({type: 'framework', name: 'Vue'});
mySet.add([1, 2, 3]);

// Listen to events
mySet.on('add', (value) => {
  console.log('New item added:', value);
});

mySet.on('delete', (value) => {
  console.log('Item deleted:', value);
});

// Use it like a Set
console.log('Size:', mySet.size);
console.log('Has javascript:', mySet.has('javascript'));
console.log('Has python:', mySet.has('python'));

// Iterate
console.log('All values:');
for (const value of mySet) {
  console.log('  -', value);
}

// Convert to array
console.log('As array:', mySet.toArray());

// Set operations
const otherSet = new Set(['javascript', 'python', 'go']);
console.log('Union with regular Set:', mySet.union(otherSet).toArray());

// The data persists - if you refresh the page and create a new instance:
// const persistedSet = new StoredSet(null, {prefix: 'pishposh-tags'});
// It will automatically load all the previous data!
