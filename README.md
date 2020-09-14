# Fluent Streams

Fluent Streams is a JavaScript and TypeScript library providing rich API for lazy iterables (arrays, sets, etc) processing.
The main construct is a [Stream](https://aleksei-berezkin.github.io/fluent-streams/interfaces/stream.html)
which is a thin stateless wrapper over an iterable; there is also an
[Optional](https://aleksei-berezkin.github.io/fluent-streams/interfaces/optional.html) modeling existing or lacking value.

## Getting started

### Install

```bash
npm i --save fluent-streams
```
### Use
To create or generate a stream or an optional use one of [factory functions](https://aleksei-berezkin.github.io/fluent-streams/globals.html);
the most generic is [stream()](https://aleksei-berezkin.github.io/fluent-streams/globals.html#stream) which allows
creating stream from any iterable. Fluent Streams exports all functions and interfaces by name from `index.ts`,
so you import with `import { ... } from 'fluent-streams'`.

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
All exported members are documented with TSDoc. Docs are also [available online](https://aleksei-berezkin.github.io/fluent-streams/).
The concept of stream and its main properties are described in [Stream interface documentation](https://aleksei-berezkin.github.io/fluent-streams/interfaces/stream.html).


## Why Fluent Streams
The lib is not the first to provide such a functionality. However, there are things specific to the lib:

* There is Optional. While some people assume it just to be a boilerplate, it provides the means to get back to stream
with [flatMapToStream()](https://aleksei-berezkin.github.io/fluent-streams/interfaces/optional.html#flatmaptostream)
without breaking a fluent pipeline.
* Stream and Optional seamlessly interoperate with ES6 iterables — they are iterables themselves, so may be iterated
over.
* [flatMap()](https://aleksei-berezkin.github.io/fluent-streams/interfaces/stream.html) doesn't require you
to return only Stream (or Optional) — the required type is iterable
    * That doesn't allow calling Stream and Optional a [monad](https://github.com/fantasyland/fantasy-land#monad).
    Fluent Stream intentionally takes more practical, not puristic approach here.
* The lib is optimized for arrays — much of operations work faster (and produce less garbage) if an input is array
* If an operation needs to create an intermediate array (for example [sort()](https://aleksei-berezkin.github.io/fluent-streams/interfaces/stream.html#sort)),
the next step reuses it as a modifiable input array

## Inspirations and acknowledgements
The following great libs influenced Fluent Streams the most:

* [Ramda](https://ramdajs.com/)
* [prelude-ts](https://github.com/emmanueltouzery/prelude-ts)
* [Java Streams](https://docs.oracle.com/javase/8/docs/api/java/util/stream/package-summary.html)
* [Sequency](https://github.com/winterbe/sequency)
* [Lazy.js](http://danieltao.com/lazy.js/)
* [RxJS](https://rxjs-dev.firebaseapp.com/)
