# The project is deprecated

Now, with JS Array getting more and more powerful, especially with upcoming `groupBy()` and `at()` methods, projects like this become unneeded. Please use standard APIs.

Below is the original README.

# Fluent Streams

[![Travis CI](https://travis-ci.org/aleksei-berezkin/fluent-streams.svg?branch=master)](https://travis-ci.org/github/aleksei-berezkin/fluent-streams)
[![NPM version](https://img.shields.io/npm/v/fluent-streams.svg)](https://www.npmjs.com/package/fluent-streams)
[![Read the docs](https://img.shields.io/badge/docs-available-44cc11.svg)](https://aleksei-berezkin.github.io/fluent-streams-docs/)

Fluent Streams is a JavaScript and TypeScript library providing rich API for lazy iterables (arrays, sets, etc) processing.
The main construct is a [Stream](https://aleksei-berezkin.github.io/fluent-streams-docs/interfaces/stream.html)
which is a thin stateless wrapper over an iterable; there is also an
[Optional](https://aleksei-berezkin.github.io/fluent-streams-docs/interfaces/optional.html) modeling existing or lacking value.

## Getting started

### Install

```bash
npm i fluent-streams
```

### Add polyfills
Fluent Streams lib is distributed compiled to ES5, so no additional transpilation needed, however it needs the following polyfills in older environments:

* Array.isArray()
* Array.prototype.forEach()
* Array.prototype\[@@iterator]()
* Map
* Object.keys()
* Set
* Symbol
* Symbol.iterator

Optionally:
* Promise.all — only for [Stream.awaitAll()](https://aleksei-berezkin.github.io/fluent-streams-docs/interfaces/stream.html#awaitall)

### Use
To create or generate a stream or an optional use one of [factory functions](https://aleksei-berezkin.github.io/fluent-streams-docs/globals.html);
the most generic is [stream()](https://aleksei-berezkin.github.io/fluent-streams-docs/globals.html#stream) which
creates a stream from any iterable.

Fluent Streams exports all functions and interfaces by name from index files,
so you import everything with `import { ... } from 'fluent-streams'`.

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

### Learn
All exported members are documented with TSDoc. Docs are also [available online](https://aleksei-berezkin.github.io/fluent-streams-docs/).
The concept of stream and its main properties are described in [Stream interface documentation](https://aleksei-berezkin.github.io/fluent-streams-docs/interfaces/stream.html).


## Why Fluent Streams
The lib is not the first to provide such a functionality. However, there are things specific to the lib:

* Quite small: 18.6 kB minified, 4.1 kB gzipped [as per Bundlephobia](https://bundlephobia.com/package/fluent-streams)
* There is Optional. While some people assume it just to be a boilerplate, it provides the means to get back to stream
with [flatMapToStream()](https://aleksei-berezkin.github.io/fluent-streams-docs/interfaces/optional.html#flatmaptostream)
without breaking a fluent pipeline.
* Stream and Optional seamlessly interoperate with ES6 iterables — they are iterables themselves, and may be iterated
over.
* Stream uses similar names and, where possible, signatures of [ES Array methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
— it's easy to embed Fluent Streams into existing code as well as get rid of the lib.
* The lib is optimized for arrays — much of operations work faster (and produce less garbage) if an input is an array.
* The lib is very heavily tested.

## Benchmarks
Fluent Streams is compared to the native JS Array and two other popular very similar libs. Because each lib is specific,
there is no the only winner, and in general all libs show reasonable performance.
[Results are here](https://github.com/aleksei-berezkin/fluent-streams-docs/tree/master/benchmarks),
and [benchmarks are here](https://github.com/aleksei-berezkin/fluent-streams-docs/tree/master/src/benchmarks). 

## Inspirations and acknowledgements
The following great libs influenced Fluent Streams the most:

* [Ramda](https://ramdajs.com/)
* [prelude-ts](https://github.com/emmanueltouzery/prelude-ts)
* [Java Streams](https://docs.oracle.com/javase/8/docs/api/java/util/stream/package-summary.html)
* [Sequency](https://github.com/winterbe/sequency)
* [Lazy.js](http://danieltao.com/lazy.js/)
* [RxJS](https://rxjs-dev.firebaseapp.com/)

## License
The library is provided under the ISC license.  
