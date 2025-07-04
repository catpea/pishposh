// Generic Emitter Patterns for input→(fn)→output trees

// 1. BUFFERING (with backpressure signaling)
class BufferEmitter extends SpicyEmitter {
  constructor(highWaterMark = 100) {
    super();
    this.buffer = [];
    this.highWaterMark = highWaterMark;
    this.paused = false;
  }

  input(data) {
    if (this.buffer.length >= this.highWaterMark && !this.paused) {
      this.emit('backpressure', { pause: true });
      this.paused = true;
    }

    this.buffer.push(data);
    this.emit('output', this.buffer.shift());

    if (this.buffer.length < this.highWaterMark / 2 && this.paused) {
      this.emit('backpressure', { pause: false });
      this.paused = false;
    }
  }
}

// 2. FILTER (predicate-based)
class FilterEmitter extends SpicyEmitter {
  constructor(predicate) {
    super();
    this.predicate = predicate;
  }

  input(data) {
    if (this.predicate(data)) {
      this.emit('output', data);
    }
    // Filtered items can emit to 'filtered' event for debugging
    else {
      this.emit('filtered', data);
    }
  }
}

// 3. TRANSFORM/MAP
class TransformEmitter extends SpicyEmitter {
  constructor(transformFn) {
    super();
    this.transformFn = transformFn;
  }

  input(data) {
    try {
      const result = this.transformFn(data);
      this.emit('output', result);
    } catch (error) {
      this.emit('error', error);
    }
  }
}

// 4. DEBOUNCE (timing-based)
class DebounceEmitter extends SpicyEmitter {
  constructor(delay) {
    super();
    this.delay = delay;
    this.timer = null;
    this.lastData = null;
  }

  input(data) {
    this.lastData = data;
    if (this.timer) clearTimeout(this.timer);

    this.timer = setTimeout(() => {
      this.emit('output', this.lastData);
      this.timer = null;
    }, this.delay);
  }
}

// 5. THROTTLE (rate limiting)
class ThrottleEmitter extends SpicyEmitter {
  constructor(interval) {
    super();
    this.interval = interval;
    this.lastEmit = 0;
    this.pending = null;
  }

  input(data) {
    const now = Date.now();
    if (now - this.lastEmit >= this.interval) {
      this.emit('output', data);
      this.lastEmit = now;
    } else {
      this.pending = data;
      setTimeout(() => {
        if (this.pending) {
          this.emit('output', this.pending);
          this.pending = null;
          this.lastEmit = Date.now();
        }
      }, this.interval - (now - this.lastEmit));
    }
  }
}

// 6. BATCH/WINDOWING (collect N items)
class BatchEmitter extends SpicyEmitter {
  constructor(batchSize) {
    super();
    this.batchSize = batchSize;
    this.batch = [];
  }

  input(data) {
    this.batch.push(data);
    if (this.batch.length >= this.batchSize) {
      this.emit('output', [...this.batch]);
      this.batch = [];
    }
  }

  flush() {
    if (this.batch.length > 0) {
      this.emit('output', [...this.batch]);
      this.batch = [];
    }
  }
}

// 7. MERGE (multiple inputs, single output)
class MergeEmitter extends SpicyEmitter {
  constructor(...sources) {
    super();
    this.sources = sources;
    this.setupSources();
  }

  setupSources() {
    this.sources.forEach(source => {
      source.on('output', (data) => {
        this.emit('output', data);
      });
    });
  }
}

// 8. SPLIT (single input, multiple outputs by key)
class SplitEmitter extends SpicyEmitter {
  constructor(keyFn) {
    super();
    this.keyFn = keyFn;
    this.outputs = new Map();
  }

  input(data) {
    const key = this.keyFn(data);
    this.emit(`output:${key}`, data);
    this.emit('output', { key, data });
  }
}

// 9. RETRY (with exponential backoff)
class RetryEmitter extends SpicyEmitter {
  constructor(retryFn, maxRetries = 3) {
    super();
    this.retryFn = retryFn;
    this.maxRetries = maxRetries;
  }

  async input(data) {
    let attempt = 0;
    while (attempt < this.maxRetries) {
      try {
        const result = await this.retryFn(data);
        this.emit('output', result);
        return;
      } catch (error) {
        attempt++;
        if (attempt >= this.maxRetries) {
          this.emit('error', error);
          return;
        }
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
      }
    }
  }
}

// 10. CACHE (with TTL)
class CacheEmitter extends SpicyEmitter {
  constructor(keyFn, ttl = 60000) {
    super();
    this.keyFn = keyFn;
    this.ttl = ttl;
    this.cache = new Map();
  }

  input(data) {
    const key = this.keyFn(data);
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < this.ttl) {
      this.emit('output', cached.data);
      this.emit('cache:hit', key);
    } else {
      this.cache.set(key, { data, timestamp: Date.now() });
      this.emit('output', data);
      this.emit('cache:miss', key);
    }
  }
}

// USAGE: Creating trees of pipes
const pipeline = new TransformEmitter(x => x * 2);
const buffer = new BufferEmitter(10);
const filter = new FilterEmitter(x => x > 5);

// Connect them
pipeline.on('output', data => buffer.input(data));
buffer.on('output', data => filter.input(data));
buffer.on('backpressure', ({ pause }) => {
  if (pause) console.log('Pipeline paused');
  else console.log('Pipeline resumed');
});

// Use it
pipeline.input(3); // 6 -> buffer -> filter -> output (6)
