# Fluent Streams

[![Travis CI](https://travis-ci.org/aleksei-berezkin/fluent-streams.svg?branch=master)](https://travis-ci.org/github/aleksei-berezkin/fluent-streams)
[![NPM version](https://img.shields.io/npm/v/fluent-streams.svg)](https://www.npmjs.com/package/fluent-streams)
[![Read the docs](https://img.shields.io/badge/docs-available-44cc11.svg)](https://aleksei-berezkin.github.io/fluent-streams-docs/)

Fluent Streams is a JavaScript and TypeScript library offering a rich API for processing lazy [iterables](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol) (e.g., arrays, sets, and more).  

The core concept is the [Stream](https://aleksei-berezkin.github.io/fluent-streams-docs/interfaces/Stream.html), a lightweight, stateless wrapper around an iterable. Additionally, the library includes [Optional](https://aleksei-berezkin.github.io/fluent-streams-docs/interfaces/Optional.html), a construct for representing a value that may or may not exist.  

## Install

```bash
npm i fluent-streams
```

## Use

To create a `Stream` or an `Optional`, use functions described in the [documentation](https://aleksei-berezkin.github.io/fluent-streams-docs/). The most generic is [`stream()`](https://aleksei-berezkin.github.io/fluent-streams-docs/functions/stream-1.html) which creates a stream from any iterable.

```typescript
import { stream } from 'fluent-streams';

stream(['Aspire', 'to', 'inspire', 'before', 'we', 'expire'])
    .flatMap(word => word)
    .groupBy(char => char)
    .map(([char, chars]) => ([char, chars.length]))
    .sortBy(([_, count]) => -count)
    .take(3)
    .toArray()     // => [['e', 7], ['i', 4], ['r', 4]]
```

## Why Choose Fluent Streams?  

Fluent Streams is not the first library to offer this kind of functionality, but it stands out for several reasons:

- **Prioritizes Standard Array and Iteration Protocols:**
  - `Stream` uses names and method signatures similar to those of the standard `Array`, making it easy to integrate or remove the library when needed.
  - `Stream` and `Optional` are fully iterable, making them compatible with `for-of` loops.
  - When the input or an intermediate result is an array, the library optimizes its use as a random-access container.
- **Compact Size:**
  - Minified: 8.4 kB
  - Gzipped: 2.5 kB
  - [Bundlephobia report](https://bundlephobia.com/package/fluent-streams)
- **Includes `Optional`:**
  - Clearly distinguishes between `undefined` as a value and the absence of a value.
  - Allows conversion of `Optional` back to `Stream` to continue the fluent pipeline.
- **Extensive Testing:**  
  - The library is rigorously tested to ensure reliability.

## Using in Older Environments  

Fluent Streams relies on [widely available](https://web.dev/baseline) ES6+ features, such as generators, spread operators, for-of loops, and arrow functions. The library is shipped **untranspiled** to ES5.  

> **Why?** These features have concise syntax, helping minimize the bundle size.  

However, it is possible to use the library in an ES5 environment by transpiling it to ES5 and adding the following polyfills:  

- `Array.isArray()`
- `Array.prototype.forEach()`
- `Array.prototype[@@iterator]()`
- `Map`
- `Object.keys()`
- `Set`
- `Symbol`
- `Symbol.iterator`

**Optionally:**  

- `Promise.all` — required only for [`Stream.awaitAll()`](https://aleksei-berezkin.github.io/fluent-streams-docs/interfaces/Stream.html#awaitall).  

## Benchmarks  

Fluent Streams [is compared](https://github.com/aleksei-berezkin/fluent-streams-docs/tree/master/benchmarks) to the native JavaScript `Array` and two other similar libraries. The library demonstrates generally reasonable performance, though it is slightly slower in some benchmarks. This can be attributed to the following factors:  

- **Use of Generators.** Generators enable iteration with very compact syntax, which helps keep the bundle size small. However, they are typically somewhat slower than simpler iterator implementations.  
- **Standard Iteration Protocol.** Both `Stream` and `Optional` implement the standard iteration protocol, allowing them to be used with the `for-of` loop. This makes the syntax compact for both the library and client code. However, custom protocols, while potentially less convenient, can sometimes be faster.  

## Inspirations and Acknowledgements  

Fluent Streams was inspired by several great libraries:  

- [Ramda](https://ramdajs.com/)  
- [prelude-ts](https://github.com/emmanueltouzery/prelude-ts)  
- [Java Streams](https://docs.oracle.com/javase/8/docs/api/java/util/stream/package-summary.html)  
- [Sequency](https://github.com/winterbe/sequency)  
- [Lazy.js](http://danieltao.com/lazy.js/)  
- [RxJS](https://rxjs-dev.firebaseapp.com/)  

## License  

This library is provided under the ISC license.  
