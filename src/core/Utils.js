// export function debounce(func, timeout = 300){
  // let timer;
  // return (...args) => {
  //   clearTimeout(timer);
  //   timer = setTimeout(() => { func.apply(this, args); }, timeout);
  // };
// }

// export function getVisibleBounds(svg) {
//     const rect = svg.getBoundingClientRect();
//     const viewBox = svg.viewBox.baseVal;

//     const viewportAspect = rect.width / rect.height;
//     const viewBoxAspect = viewBox.width / viewBox.height;

//     let visibleWidth, visibleHeight, offsetX = 0, offsetY = 0;

//     if (viewportAspect > viewBoxAspect) {
//         visibleHeight = viewBox.height;
//         visibleWidth = viewBox.height * viewportAspect;
//         offsetX = (visibleWidth - viewBox.width) / 2;
//     } else {
//         visibleWidth = viewBox.width;
//         visibleHeight = viewBox.width / viewportAspect;
//         offsetY = (visibleHeight - viewBox.height) / 2;
//     }

//     return {
//         left: viewBox.x - offsetX,
//         right: viewBox.x + viewBox.width + offsetX,
//         top: viewBox.y - offsetY,
//         bottom: viewBox.y + viewBox.height + offsetY,
//         width: visibleWidth,
//         height: visibleHeight
//     };
// }

// export function getAdaptiveGridSize(width) {
//     const baseSize = 40;
//     const zoomLevel = 1200 / width;

//     if (zoomLevel < 0.25) {
//         return baseSize * 4; // Fewer lines when zoomed out
//     } else if (zoomLevel < 0.5) {
//         return baseSize * 2;
//     } else if (zoomLevel > 2) {
//         return baseSize / 2; // More lines when zoomed in
//     }
//     return baseSize;
// }


// Brilliant - Elegant JavaScript Utilities ✨

// Array chunking - so pretty <3
export function* take(array, n) {
  for (let i = 0; i < array.length; i += n) yield array.slice(i, i + n);
}

// Create ranges with ease
export function* range(start, end, step = 1) {
  for (let i = start; i < end; i += step) yield i;
}

// Group by any property or function
export function groupBy(array, key) {
  return array.reduce((groups, item) => {
    const group = typeof key === 'function' ? key(item) : item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
}

// Elegant sleep/delay
export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Debounce with style
export function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Throttle elegantly
export function throttle(func, limit) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Pick specific properties
export function pick(obj, ...keys) {
  return keys.reduce((acc, key) => {
    if (key in obj) acc[key] = obj[key];
    return acc;
  }, {});
}

// Omit specific properties
export function omit(obj, ...keys) {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keys.includes(key))
  );
}

// Clamp numbers beautifully
export const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

// Random between min and max
export const random = (min, max) => Math.random() * (max - min) + min;

// Random integer between min and max
export const randomInt = (min, max) => Math.floor(random(min, max + 1));

// Shuffle array (Fisher-Yates)
export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Get unique values
export const unique = array => [...new Set(array)];

// Flatten arrays deeply
export const flatten = array => array.flat(Infinity);

// Zip arrays together
export function zip(...arrays) {
  const length = Math.max(...arrays.map(arr => arr.length));
  return Array.from({ length }, (_, i) => arrays.map(arr => arr[i]));
}

// Retry with exponential backoff
export async function retry(fn, attempts = 3, delay = 1000) {
  try {
    return await fn();
  } catch (error) {
    if (attempts <= 1) throw error;
    await sleep(delay);
    return retry(fn, attempts - 1, delay * 2);
  }
}

// Memoize functions
export function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// Compose functions elegantly
export const compose = (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x);

// Pipe functions beautifully
export const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x);

// Curry functions with grace
export function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return (...nextArgs) => curried.apply(this, [...args, ...nextArgs]);
  };
}

// Map with index elegantly
export const mapWithIndex = (array, fn) => array.map((item, index) => fn(item, index));

// Format bytes beautifully
export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

// Capitalize first letter
export const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

// Truncate with ellipsis
export const truncate = (str, length, suffix = '...') =>
  str.length > length ? str.substring(0, length) + suffix : str;

// Deep clone objects
export const deepClone = obj => JSON.parse(JSON.stringify(obj));

// Check if object is empty
export const isEmpty = obj => Object.keys(obj).length === 0;

// Create a counter function
export const createCounter = (start = 0) => {
  let count = start;
  return () => ++count;
};

// // Example usage demonstrations
// console.log('=== Brilliant Library Examples ===\n');

// // Range examples
// console.log('Range 1-5:', [...range(1, 6)]);
// console.log('Range 0-10 by 2:', [...range(0, 11, 2)]);

// // Group by example
// const people = [
//   { name: 'Alice', age: 25, city: 'NY' },
//   { name: 'Bob', age: 30, city: 'LA' },
//   { name: 'Charlie', age: 25, city: 'NY' }
// ];
// console.log('Group by age:', groupBy(people, 'age'));

// // Functional programming
// const addOne = x => x + 1;
// const double = x => x * 2;
// const pipeline = pipe(addOne, double);
// console.log('Pipe 5 through addOne then double:', pipeline(5));

// // Utility examples
// console.log('Random between 1-10:', randomInt(1, 10));
// console.log('Shuffle [1,2,3,4,5]:', shuffle([1, 2, 3, 4, 5]));
// console.log('Unique [1,2,2,3,3,3]:', unique([1, 2, 2, 3, 3, 3]));
// console.log('Zip arrays:', zip([1, 2, 3], ['a', 'b', 'c'], [true, false, true]));

// // String utilities
// console.log('Capitalize "hello":', capitalize('hello'));
// console.log('Truncate long text:', truncate('This is a very long sentence', 10));
// console.log('Format bytes:', formatBytes(1024 * 1024 * 1.5));

// // Object utilities
// const user = { name: 'John', age: 30, email: 'john@example.com', password: 'secret' };
// console.log('Pick name, age:', pick(user, 'name', 'age'));
// console.log('Omit password:', omit(user, 'password'));

// // Counter example
// const counter = createCounter(10);
// console.log('Counter:', counter(), counter(), counter());
