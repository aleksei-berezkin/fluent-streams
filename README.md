# Fluent Streams

[![Travis CI](https://travis-ci.org/aleksei-berezkin/fluent-streams.svg?branch=master)](https://travis-ci.org/github/aleksei-berezkin/fluent-streams)
[![NPM version](https://img.shields.io/npm/v/fluent-streams.svg)](https://www.npmjs.com/package/fluent-streams)
[![Read the docs](https://img.shields.io/badge/docs-available-44cc11.svg)](https://aleksei-berezkin.github.io/fluent-streams-docs/)

Fluent Streams is a JavaScript and TypeScript library that offers a rich API for lazily processing iterables such as arrays, sets, and more. At its core is the [Stream](https://aleksei-berezkin.github.io/fluent-streams-docs/interfaces/Stream.html), a lightweight, stateless wrapper around an iterable. The library also includes [Optional](https://aleksei-berezkin.github.io/fluent-streams-docs/interfaces/Optional.html), which represents a value that may or may not exist.

The library's primary goal is to provide an API that closely mirrors JavaScript's Array, while introducing a variety of additional, powerful methods inspired by libraries like Ramda and Underscore.

## Installation

```bash
npm i fluent-streams
```

## Usage

The [`stream()`](https://aleksei-berezkin.github.io/fluent-streams-docs/functions/stream-1.html) function is the primary entry point for creating a stream from an iterable or generator function. Refer to the [documentation](https://aleksei-berezkin.github.io/fluent-streams-docs/) for additional ways to create `Stream` or `Optional`.

```typescript
import { abc, stream } from 'fluent-streams'

// Check if it's really a pangram
stream('The quick brown fox jumps over the lazy dog')
    .filter(c => c !== ' ')
    .map(c => c.toLowerCase())
    .distinctBy(c => c)
    .sort()
    .equals(abc())

// => true, indeed a pangram
```

Note that we created a stream from the string — this is possible because strings implement the iterable protocol, just like Arrays and Sets. [More examples.](https://dev.to/alekseiberezkin/fluent-streams-a-library-for-rich-iterables-manipulation-5cja#examples)

## Why Choose Fluent Streams?  

Fluent Streams is not the first library to offer this kind of functionality, but it stands out for several reasons:

- **Prioritizes Standard Array and Iteration Protocols:**
  - `Stream` follows familiar `Array` naming and method signatures, enabling seamless integration or removal.
  - `Stream` and `Optional` implement the `Iterable` protocol, making them compatible with JavaScript constructs such as `for-of` loops and spread syntax.
  - Intermediate arrays created by operations like `sort()` are not immediately discarded; instead, they are reused in subsequent steps to minimize memory allocations.
- **Compact Size:**
  - Minified: 9.8 kB
  - Gzipped: 3.3 kB
  - [Bundlephobia report](https://bundlephobia.com/package/fluent-streams)
- **Includes `Optional`:**
  - Clearly distinguishes between `null` or `undefined` as a value, and the absence of a value.
  - Allows conversion of `Optional` back to `Stream` to continue the fluent pipeline.
- **Extensive Testing:**  
  - Over 200 tests rigorously cover 100% of the library's source code, validating various stream types in multiple combinations.
  - Laziness and statelessness are also thoroughly tested.

## Platform requirements

Fluent Streams relies on [widely available](https://developer.mozilla.org/en-US/docs/Glossary/Baseline/Compatibility#baseline_badges) ES6+ features, such as generators, spread operators, for-of loops, and arrow functions. The library doesn't use newly available features, or features with limited availability. The library is shipped **untranspiled** to ES5.

> **Why?** Modern language features have concise syntax, helping to minimize the bundle size.

While it is possible to transpile the library to ES5 and polyfill it, this is not recommended, as it may increase the library footprint in the bundle by 2.5 to 3 times.

## Benchmarks  

Fluent Streams [is compared](https://github.com/aleksei-berezkin/fluent-streams-docs/tree/master/benchmarks) to the native JavaScript `Array` and two other similar libraries. The library demonstrates generally reasonable performance, though it is slightly slower in some benchmarks. This can be attributed to the following factors:  

- **Use of Generators.** Generators enable iteration with very compact syntax, which helps keep the bundle size small. However, they are typically somewhat slower than simpler iterator implementations.  
- **Standard Iteration Protocol.** Both `Stream` and `Optional` implement the standard iteration protocol, allowing them to be used with the `for-of` loop. This makes the syntax compact for both the library and client code. However, custom protocols, while potentially less convenient, can sometimes be faster.  

## Inspirations and Acknowledgements  

Fluent Streams was inspired by several great libraries:  

- [Ramda](https://ramdajs.com/)  
- [Underscore.js](https://underscorejs.org/)
- [prelude-ts](https://github.com/emmanueltouzery/prelude-ts)  
- [Java Streams](https://docs.oracle.com/javase/8/docs/api/java/util/stream/package-summary.html)  
- [Sequency](https://github.com/winterbe/sequency)  
- [Lazy.js](http://danieltao.com/lazy.js/)  
- [RxJS](https://rxjs-dev.firebaseapp.com/)  

## License  

This library is provided under the ISC license.  
