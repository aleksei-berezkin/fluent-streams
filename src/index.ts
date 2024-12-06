// *** Types ***

/**
 * A stream is a thin wrapper over iterable, providing intermediate and terminal operations to manipulate data.
 * Like iterables, streams respect items order; if not specified explicitly, operations consume and transform items
 * in the original order. Streams are lazy: all computations are triggered only on terminal operations.
 * 
 * Stream can be explained as a function over an iterable. Intermediate operations return new functions containing
 * current stream as an input; terminal operations capture input, evaluate functions chain and return data.
 * 
 * ```typescript
 * stream(1, 2, 3, 4)       // factory
 *   .filter(i => i%2===0)  // intermediate
 *   .map(i => -i)          // intermediate
 *   .toArray()             // terminal => [-2, -4]
 * ```
 * 
 * Streams are stateless: they don't store anything except reference to an input. This means streams may be iterated
 * multiple times, and each time the stream is evaluated against input as it was on the moment of invoking terminal
 * operation.
 * 
 * ```typescript
 * const input = [10, 20, 30]
 * const s = stream(input)
 *   .map(i => i + 1)
 * s.toArray()   // => [11, 21, 31]
 *   
 * input.push(40)
 * s.toArray()   // => [11, 21, 31, 41]
 * ```
 * 
 * During evaluation streams produce as little intermediate data as possible. For example, {@link Stream.map} does
 * not copy input data; instead, it retrieves upstream data one by one, and pushes mapped items downstream also
 * value by value. Some operations do require creating intermediate data structures, for example {@link Stream.shuffle}
 * and {@link Stream.sortBy}; in this case downstream steps maximize the benefit of having random-access array allowed
 * for modifications.
 * 
 * ```typescript
 * stream(30, 20, 10, 0)
 *     .map(i => i + 1) // does not copy data, maps on evaluation
 *     .sortBy(i => i)  // copies data to the new array and sorts it
 *     .at(2)           // makes a[2] on array created upstream
 *     .get()           // => 21
 * ```
 * 
 * @typeParam T Input elements type
 */
export interface Stream<T> extends Iterable<T> {
    /**
     * Creates an optional which resolves to an element of this stream at `index` position (negative `index` counts
     * from last item) if there is such a position, or resolves to empty otherwise.
     * @param index Zero-based position to return an item at, or negative position where -1 means last, -2 last-but-one etc.
     */
    at(index: number): Optional<T>;

    /**
     * Calls `Promise.all()` on this stream and returns the result. If this stream items are `Promise<E>`
     * returns `Promise<E[]>`; for more complex cases please refer to
     * [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all).
     */
    awaitAll(): Promise<T extends PromiseLike<infer E> ? E[] : T[]>;

    /**
     * Creates a stream containing all but last items of this stream. The result stream is empty if
     * this stream is empty or contains one item.
     */
    butLast(): Stream<T>;

    /**
     * Creates a stream whose items are all items of this stream followed by provided `item`.
     * @param item Item to append
     */
    concat(item: T): Stream<T>;

    /**
     * Creates a stream whose items are all items of this stream followed by all items provided by `items` iterable.
     * @param items Items to append to this stream
     */
    concatAll(items: Iterable<T>): Stream<T>;

    /**
     * Creates a stream containing only elements of this stream for which `getKey` returns different keys.
     * If multiple items produce the same key, only the first such item is included to the returned stream.
     * Keys are checked using Set which means items are compared mostly in terms of `===`; there are exceptions though,
     * see [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set).
     * @param getKey Function to get key of items
     */
    distinctBy(getKey: (item: T) => any): Stream<T>;

    /**
     * Returns true if `other` contains the same number of items and all corresponding items are equal
     * in terms of `===`.
     * @param other Iterable to test for equality
     */
    equals(other: Iterable<T>): boolean,

    /**
     * Returns `true` if the `predicate` returns `true` for all items of this stream; returns false otherwise. This is
     * short-circuiting operation which means it skips the rest items if the `predicate` returned `false` for some item.
     * @param predicate A function to test each item
     */
    every(predicate: (item: T) => boolean): boolean;

    /**
     * Creates a stream containing items of this stream which match the provided `predicate`.
     * @param predicate The predicate to test items
     */
    filter(predicate: (item: T) => boolean): Stream<T>;

    /**
     * Like {@link filter} but allows narrowing output type. For example, if you want to filter out `null`s,
     * 
     * ```typescript
     * streamOf<string | null>('a', null, 'b')
     *   .filterWithAssertion(function(item): item is string {
     *     return typeof item === 'string'
     *   })
     *   .toArray()   // => ['a', 'b']: string[]
     * ```
     * 
     * Makes sense only for TypeScript code; for JavaScript works exactly the same way as {@link filter}.
     * @param assertion The assertion to test items
     */
    filterWithAssertion<U extends T>(assertion: (item: T) => item is U): Stream<U>;

    /**
     * Creates an optional which resolves to the first item to match predicate, or to empty if no such item found.
     * @param predicate The predicate to test items
     */
    find(predicate: (item: T) => boolean): Optional<T>;

    /**
     * Creates a stream with the following behavior:
     * 1. Iterates this stream items
     * 2. Applies `mapper` to each item
     * 3. Chains together at the same level all results returned by `mapper`
     * 
     * The operation is also known as `chain`.
     * @param mapper The function to transform items
     */
    flatMap<U>(mapper: (item: T) => Iterable<U>): Stream<U>;

    /**
     * Invokes `effect` for each item of this stream
     * @param effect An effect to apply to items
     */
    forEach(effect: (item: T) => void): void;

    /**
     * Invokes `effect` for each item of this stream until `effect` returns `true`.
     * @param effect An effect to apply to items which also returns stop flag.
     * @return True if iteration was stopped because some effect returned `true`, false otherwise.
     */
    forEachUntil(effect: (item: T) => boolean | undefined | void): boolean;

    /**
     * Creates a stream whose elements are `[key, items[]]` pairs; `key`s are retrieved with `getKey` applied
     * to this stream items; `items`s are arrays of this stream items which produced the same `key`. Order of items
     * is the same as in this stream.
     * @param getKey Function to get item key with
     */
    groupBy<K>(getKey: (item: T) => K): Stream<[K, T[]]>;

    /**
     * Creates an optional which resolves to this stream first item if the stream has item(s), or resolves
     * to empty otherwise.
     */
    head(): Optional<T>;

    /**
     * Concatenates this stream items inserting `sep` between. Items are mapped to string using
     * [String function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/String)
     * (without `new`).
     * @param sep A string to insert between items, default ",".
     */
    join(sep?: string): string;

    /**
     * Like {@link join} but can insert `sep` in the beginning and (or) in the end
     * @param spec Object specifying separator, and whether to insert it before the first and after the last items
     */
    join(spec: {sep: string, leading?: boolean, trailing?: boolean}): string,

    /**
     * Like {@link join} but retrieves separator calling `getSep` for each adjacent items pair.
     * @param getSep A function to get separator for adjacent items pair
     */
    joinBy(getSep: (l: T, r: T) => string): string;

    /**
     * Creates an optional resolving to the last item of this stream if it's nonempty, or resolving to empty
     * otherwise.
     */
    last(): Optional<T>;

    /**
     * Creates a stream whose items are all items of this stream transformed by `mapper`.
     * @param mapper A function to transform items 
     */
    map<U>(mapper: (item: T) => U): Stream<U>;

    /**
     * Creates a stream executing an effect for each item and returning the item as is. One possible usage for
     * this method is mutating items in place.
     * @param effect The effect to execute
     */
    peek(effect: (item: T) => void): Stream<T>;

    /**
     * Creates an optional resolving to a random item of this stream, or resolving to emtpy if this stream is empty.
     */
    randomItem(): Optional<T>

    /**
     * Creates an optional with the following behavior:
     * * If this stream is empty resolves to empty
     * * If this stream has one item resolves to that item
     * * Otherwise applies `reducer` to the first and second items, then applies `reducer` to previously returned result
     * and third item etc, and resolves to a value returned by the last `reducer` invocation.
     * @param reducer The function to reduce items
     */
    reduce(reducer: (prev: T, curr: T) => T): Optional<T>;

    /**
     * If this stream is empty, returns initial; otherwise applies `reducer` to `initial` and the first item,
     * then applies `reducer` to previously returned result and second item etc, and returns result from last
     * `reducer` invocation.
     * @param reducer The function to reduce items
     * @param initial Initial value
     */
    reduce<U>(reducer: (prev: U, curr: T) => U, initial: U): U;

    /**
     * Creates an optional with the following behavior:
     * * If this stream is empty resolves to empty
     * * If this stream has one item resolves to that item
     * * Otherwise applies `reducer` to the last and 2nd to end items, then applies `reducer` to previously returned
     * result and 3rd to end item etc, and resolves to a value returned by the last `reducer` invocation.
     * @param reducer The function to reduce items
     */
    reduceRight(reducer: (prev: T, curr: T) => T): Optional<T>;

    /**
     * If this stream is empty, returns initial; otherwise applies `reducer` to `initial` and the last item,
     * then applies `reducer` to previously returned result and 2nd to end item etc, and returns result from last
     * `reducer` invocation.
     * @param reducer The function to reduce items
     * @param initial Initial value
     */
    reduceRight<U>(reducer: (prev: U, curr: T) => U, initial: U): U;

    /**
     * Creates a stream whose elements are elements of this stream in the reversed order.
     */
    reverse(): Stream<T>;

    /**
     * Creates a stream whose elements are elements of this stream with random order.
     */
    shuffle(): Stream<T>;

    /**
     * Creates an optional which resolves to an item if this stream contains only one item, or which resolves to empty
     * otherwise.
     */
    single(): Optional<T>;

    /**
     * Returns the number of items in this stream
     */
    size(): number;

    /**
     * Returns `true` if the `predicate` returns `true` for any item of this stream; returns false otherwise. This is
     * short-circuiting operation which means it skips the rest items if the `predicate` returned `true` for some item.
     * @param predicate A function to test each item
     */
    some(predicate: (item: T) => boolean): boolean;

    /**
     * Creates a stream whose items are sorted items of this stream. The implementation relies on
     * [Array.sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort).
     * @param compareFn Comparison function with semantics described in
     * [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
     */
    sort(compareFn?: (a: T, b: T) => number): Stream<T>;

    /**
     * Creates a stream with items of this stream ordered by value returned by `getComparable`. Returned values
     * are compared with `>` and `<`.
     * @param getComparable A function which, given an item, returns comparable value. Returned value of the function
     * is not cached, so it's recommended to not to perform heavy computations.
     */
    sortBy(getComparable: (item: T) => number | string | boolean): Stream<T>

    /**
     * Creates a stream whose items are groups of this stream adjacent items for which `isSplit` returned false;
     * in other words, given all items as a sequence, splits it between items for which `isSplit` returns true.
     * Order of items in arrays is the same as it is in this stream.
     * @param isSplit A function to check if items sequence should be split between `l` and `r` items
     */
    splitWhen(isSplit: (l: T, r: T) => boolean): Stream<T[]>;

    /**
     * Creates a stream which contains all but first item of this stream. If this stream is empty or contains one item
     * the returned stream is empty.
     */
    tail(): Stream<T>;

    /**
     * Creates a stream containing no more than `n` first items of this stream
     * @param n Max leading items to select from this stream
     */
    take(n: number): Stream<T>;

    /**
     * Creates a stream containing no more than `n` last items of this stream
     * @param n Max trailing items to select from this stream
     */
    takeLast(n: number): Stream<T>;

    /**
     * Creates a stream containing no more than `n` random items of this stream. The result is sampled
     * [without replacement](https://en.wikipedia.org/wiki/Simple_random_sample) i.e. one item of this stream
     * appears in the result stream no more than once.
     * @param n Max items to sample
     */
    takeRandom(n: number): Stream<T>;

    /**
     * Returns stream items as an array
     */
    toArray(): T[];

    /**
     * If elements of this stream are `[key, value]` pairs where `key` is `string`, `number`, or `symbol`, collects
     * stream items to an object; if some `key` appears multiple times in this stream, only the last [`key`, `value`]
     * will be included in the result object. If elements of this stream are not `[key, value]` as described above
     * throws an error.
     *
     * Using in TypeScript may require putting `as const` after each tuple to help TS infer correct tuple types:
     *
     * ```typescript
     * stream(['a', 'b'] as const)
     *   .map(key => [key, 0] as const)
     *   .toObject()   // => type is {a: 0, b: 0}
     *
     * stream(['a', 'b'])
     *   .map(key => [key, 0] as const)
     *   .toObject()   // => type is {[p: string]: 0}
     *
     * stream(['a', 'b'])
     *   .map(key => [key, 0])
     *   .toObject()   // => type is unknown
     * ```
     */
    toObject(): T extends readonly [string | number | symbol, any] ? { [key in T[0]]: T[1] } : unknown;

    /**
     * Extension method to apply arbitrary operator to the stream. An `operator` is passed an iterable which yields
     * this stream items, and it must return the iterator which is an input for the next step. The easiest way is
     * to use generators:
     * 
     * ```typescript
     * stream(1, 2, 3, 4, 5, 6)
     *   .transform(function* (items) {
     *       for (const item of items) {
     *           if (item % 3 === 0) yield item
     *       }
     *   }).toArray()   // => [3, 6]
     * ```
     * @param operator A function which is passed an iterable yielding this stream items, and which is expected
     * to return iterator for downstream step
     */
    transform<U>(operator: (input: Iterable<T>) => Iterator<U>): Stream<U>;

    /**
     * Like {@link transform} but returns optional which discards all but first item yielded by an iterator
     * returned by an `operator`.
     * @param operator A function to transform this stream items
     */
    transformToOptional<U>(operator: (input: Iterable<T>) => Iterator<U>): Optional<U>;

    /**
     * Creates a stream whose elements are pairs where the first element is this stream item and the second element
     * is the corresponding item of the `other` iterable. The length of the result stream is the minimum of
     * this stream length and `other` length.
     * @param other An iterable to zip this stream with
     */
    zip<U>(other: Iterable<U>): Stream<[T, U]>;

    /**
     * Like {@link zip} but requires that this stream and `other` iterable have the same length, otherwise throws
     * an error.
     * @param other An iterable to zip this stream with
     */
    zipStrict<U>(other: Iterable<U>): Stream<[T, U]>

    /**
     * Creates a stream of pairs where first element is this stream item, and the second one is its index. In other
     * words, {@link zip zips} with integers sequence starting with 0.
     */
    zipWithIndex(): Stream<[T, number]>;

    /**
     * Creates s stream of triplets where the first element is this stream item, second element is its index, and
     * third one is this stream size.
     */
    zipWithIndexAndLen(): Stream<[T, number, number]>;

    /**
     * Creates an iterator which yields items of this stream
     */
    [Symbol.iterator](): Iterator<T>;
}

/**
 * An optional is just like {@link Stream} but contains no more than one item. All stream properties
 * (laziness, statelessness) fully apply to optionals.
 * 
 * Like stream, optional has intermediate and terminal operations. When a terminal operation is executed,
 * the result value is computed — this process is described as “an optional resolves to a value”
 * if there is an item, or “an optional resolves to empty” if there's no one.
 */
export interface Optional<T> extends Iterable<T> {
    /**
     * Creates an optional resolving to original item if this optional has an item and `predicate` evaluates
     * to `true` for it, or resolving to empty otherwise.
     * @param predicate A predicate to evaluate an item
     */
    filter(predicate: (item: T) => boolean): Optional<T>;

    /**
     * Creates an optional with the following behavior:
     * * If this optional contains an item, applies `mapper` to it, and tries to retrieve the first item from
     * the returned iterable. If there's an item, resolves to it, otherwise resolves to empty.
     * * It this optional is empty resolves to empty.
     * @param mapper Function which takes an item and returns an iterable to create an optional from.
     */
    flatMap<U>(mapper: (item: T) => Iterable<U>): Optional<U>;

    /**
     * Creates a stream with the following behavior:
     * * If this optional contains an item, applies `mapper` to it, and uses a returned iterable as an input of the
     * created stream.
     * * If this optional is empty, the created stream is empty.
     * @param mapper Function which takes an item and returns an iterable to create new stream from.
     */
    flatMapToStream<U>(mapper: (item: T) => Iterable<U>): Stream<U>;

    /**
     * If this optional has an item, returns that item, otherwise throws an error.
     */
    get(): T;

    /**
     * Returns `true` if this optional has an item and `predicate` evaluates to `true` for it; `false` otherwise.
     * @param predicate The predicate to test an item
     */
    has(predicate: (item: T) => boolean): boolean;

    /**
     * Returns `true` if this optional has an item and `predicate` evaluates to `false` for it, or if this optional
     * is empty. False otherwise.
     * @param predicate The predicate to test an item
     */
    hasNot(predicate: (item: T) => boolean): boolean;

    /**
     * Returns `true` if this optional has an item and it strict-equals (`===`) the passed `item`. False otherwise.
     * @param item An item to test an item
     */
    is(item: T): boolean;

    /**
     * Returns `true` if this optional has an item, false otherwise
     */
    isPresent(): boolean;

    /**
     * Returns an optional with the following behavior:
     * * If this optional has an item, invokes `mapper` passing this item as an argument, and resolves to
     * the value returned by `mapper`
     * * If this optional is empty, resolves to empty
     * @param mapper The function to transform an item with
     */
    map<U>(mapper: (item: T) => U): Optional<U>;

    /**
     * Returns an optional with the following behavior:
     * * If this optional has an item, invokes `mapper` passing this item as an argument; if `mapper` returns
     * `null` or `undefined` resolves to empty; otherwise resolves to the value returned by `mapper`
     * * If this optional is empty, resolves to empty
     * @param mapper The function to transform an item with
     */
    mapNullable<U>(mapper: (item: T) => U | null | undefined): Optional<U>;

    /**
     * If this optional has an item returns this item; otherwise returns `other`
     * @param other Value to return if this optional is empty
     */
    orElse<U>(other: U): T | U;

    /**
     * If this optional has an item returns this item; otherwise returns value returned by `get`.
     * @param get Function to take result from if this optional is empty
     */
    orElseGet<U>(get: () => U): T | U;

    /**
     * If this optional has an item returns this item; otherwise returns `null`
     */
    orElseNull(): T | null;

    /**
     * If this optional has an item returns this item; otherwise throws an error created by `createError`
     * @param createError Function to create error if this optional is empty
     */
    orElseThrow(createError: () => Error): T;

    /**
     * If this optional has an item returns this item; otherwise returns `undefined`
     */
    orElseUndefined(): T | undefined;

    /**
     * Returns `{has: true, val: item}` if this optional contains an item, `{has: false}` otherwise
     */
    resolve(): {has: true, val: T} | {has: false}

    /**
     * If this optional has an item returns an array containing that item as the only element, otherwise returns
     * an empty array
     */
    toArray(): T[];

    /**
     * Creates a stream with an item provided by this optional if it has an item; otherwise the new stream is empty.
     */
    toStream(): Stream<T>;

    /**
     * Creates an iterator which yields an item if this optional has an item; otherwise iterator yields no items.
     */
    [Symbol.iterator](): Iterator<T>;
}

// *** Factories ***

/**
 * Creates a stream from an iterable (for example, array, set etc). Streams created with this function never
 * modify `input`; if you want the opposite use {@link streamFromModifiable}.
 * @typeParam T Items type
 * @param input Input to create the stream from. Can be array, set, or any other iterable, including user-defined,
 * as long as it correctly implements [iteration protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols).
 * If you implement your own iterable please note: a) `next()` is not expected to take any arguments, and b)
 * `value` returned with `{done: true}` is discarded.
 */
export function stream<T>(input: Iterable<T>): Stream<T> {
    return Array.isArray(input)
        ? new RandomAccessStream<T>(() => ({
            i: ix => input[ix],
            s: input.length,
        }))
        : new IteratorStream<T>(() => input[Symbol.iterator]())
}

/**
 * Creates a stream from an array but, unlike {@link stream}, allows `input` modifications. That's useful for operations
 * like {@link Stream.sortBy} and {@link Stream.shuffle} which otherwise copy input to the new array.
 * @typeParam T Elements type
 * @param input array allowed for modifications to create stream from
 */
export function streamFromModifiable<T>(input: T[]): Stream<T> {
    return new LazyArrayStream(() => input);
}

/**
 * Creates a stream from given elements. If you provide input as an array using
 * [Function.prototype.apply()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply),
 * such an array is treated as modifiable, just like in {@link streamFromModifiable}.
 * @typeParam T Elements type
 * @param input Elements to create a stream from
 */
export function streamOf<T>(...input: T[]): Stream<T> {
    return new LazyArrayStream(() => input);
}

/**
 * Creates a steam of `[key, value]` pairs from given object. Keys are retrieved with
 * [Object.keys()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys),
 * which means prototype members are not included.
 * @typeParam O Input object type
 * @param object Object to create `[key, value]`-pairs stream from.
 */
export function entryStream<O extends {[k: string]: any}>(object: O): Stream<readonly [keyof O, O[keyof O]]> {
    return new RandomAccessStream<readonly [keyof O, O[keyof O]]>(() => {
        const keys = Object.keys(object)
        return {
            i: ix => [keys[ix], object[keys[ix]]] as const,
            s: keys.length,
        }
    })
}

/**
 * Creates a stream of ascending numbers starting with `from` up to `bound` exclusively.
 * @param from Start value inclusively
 * @param bound End value exclusively
 */
export function range(from: number, bound: number): Stream<number> {
    return new RandomAccessStream(() => ({
        i: ix => from + ix,
        s: Math.max(0, bound - from),
    }))
}

/**
 * Creates a stream of `'a'`, `'b'`, `'c'`, ..., `'z'` strings.
 */
export function abc(): Stream<string> {
    return new RandomAccessStream(() => {
        const size = 'z'.charCodeAt(0) + 1 - 'a'.charCodeAt(0);
        return {
            i: ix => String.fromCharCode('a'.charCodeAt(0) + ix),
            s: size,
        }
    })
}

/**
 * Creates an endless stream of `value`
 * @typeParam T Value type
 * @param value An item to repeat endlessly
 */
export function same<T>(value: T): Stream<T> {
    return new IteratorStream(function* () {
        for ( ; ; ) yield value
    })
}

/**
 * Creates an endless stream of values produced by `getItem`. Function return value is not cached; it's invoked
 * separately to get each item.
 * @typeParam T Items type
 * @param getItem Function that produces items.
 */
export function continually<T>(getItem: () => T): Stream<T> {
    return new IteratorStream(() => ({
        next: () => ({done: false, value: getItem()}),
    }));
}

/**
 * Creates an optional from given iterable. An empty iterable resolves to an empty optional; otherwise the optional
 * resolves to the first item yielded by iterable, rest elements are discarded.
 * @typeParam T elements type.
 * @param input 
 */
export function optional<T>(input: Iterable<T>): Optional<T> {
    return new SimpleOptional(() => input[Symbol.iterator]());
}

/**
 * Creates an optional which resolves to a value returned by `getInput` if that value is not `null` or `undefined`,
 * or which resolves to empty otherwise.
 * @typeParam T Non-nullable input value type
 * @param getInput Function which produces value or `null` or `undefined`
 */
export function optionalOfNullable<T>(getInput: () => T | null | undefined): Optional<T> {
    return new SimpleOptional<T>(function* () {
        const input = getInput()
        if (input != null) yield(input)
    })
}

// *** Implementation ***

abstract class AbstractStream<T> implements Stream<T> {
    abstract [Symbol.iterator](): Iterator<T>

    at(index: number): Optional<T> {
        const ths = this
        return new SimpleOptional<T>(function* () {
            if (index < 0) {
                const last = collectLast(ths, -index)
                if (last.size() === -index) {
                    yield last.head().get()
                }
            } else {
                let i = 0
                for (const item of ths) {
                    if (i++ === index) {
                        yield item
                        break
                    }
                }
            }
        })
    }

    awaitAll(): Promise<T extends PromiseLike<infer E> ? E[] : T[]> {
        return Promise.all(this) as any;
    }

    butLast(): Stream<T> {
        const ths = this
        return new IteratorStream(function* ()  {
            let first = true
            let prev: T | undefined = undefined
            for (const item of ths) {
                if (!first) yield prev as T
                first = false
                prev = item
            }
        })
    }

    concat(item: T): Stream<T> {
        const ths = this
        return new IteratorStream(function* () {
            yield* ths
            yield item
        })
    }

    concatAll(items: Iterable<T>): Stream<T> {
        const ths = this
        return new IteratorStream(function* () {
            yield* ths
            yield* items
        })
    }

    distinctBy(getKey: (item: T) => any): Stream<T> {
        const ths = this
        return new IteratorStream(function* () {
            const keys = new Set<any>()
            for (const item of ths) {
                const k = getKey(item)
                if (!keys.has(k)) {
                    keys.add(k)
                    yield item
                }
            }
        })
    }

    equals(other: Iterable<T>): boolean {
        const itr = other[Symbol.iterator]();
        const foundNotEqual = this.forEachUntil(item => {
            const n = itr.next()
            if (n.done || item !== n.value) {
                return true
            }
        })
        return !foundNotEqual && !!itr.next().done
    }

    every(predicate: (item: T) => boolean): boolean {
        return !this.forEachUntil(item => !predicate(item));
    }

    filter(predicate: (item: T) => boolean): Stream<T> {
        return this.filterWithAssertion(predicate as (item: T) => item is T);
    }

    filterWithAssertion<U extends T>(assertion: (item: T) => item is U): Stream<U> {
        const ths = this
        return new IteratorStream(function* () {
            for (const item of ths) {
                if (assertion(item)) yield item
            }
        })
    }

    find(predicate: (item: T) => boolean): Optional<T> {
        return this.filter(predicate).head()
    }

    flatMap<U>(mapper: (item: T) => Iterable<U>): Stream<U> {
        const ths = this
        return new IteratorStream(function* () {
            for (const item of ths) {
                yield* mapper(item)
            }
        })
    }

    forEach(effect: (item: T) => void): void {
        this.forEachUntil(item => void effect(item));
    }

    forEachUntil(effect: (item: T) => boolean | undefined | void) {
        for (const item of this) {
            if (effect(item) === true) return true
        }
        return false
    }

    groupBy<K>(getKey: (item: T) => K): Stream<[K, T[]]> {
        return new IteratorStream<[K, T[]]>(() => {
            const m = new Map<K, T[]>();
            for (const item of this) {
                const key = getKey(item)
                if (m.has(key)) {
                    m.get(key)!.push(item)
                } else {
                    m.set(key, [item])
                }
            }
            return m[Symbol.iterator]()
        })
    }

    head(): Optional<T> {
        return this.at(0)
    }

    join(sep: string | {sep: string, leading?: boolean, trailing?: boolean} | undefined): string {
        if (sep === undefined) {
            sep = ',';
        }
        let result = (typeof sep === 'object' && sep.leading) ? sep.sep : '';
        let first = true;
        for (const item of this) {
            if (first) {
                result += String(item);
                first = false;
            } else {
                result += (typeof sep === 'string' ? sep : sep.sep) + String(item);
            }
        }
        if (typeof sep === 'object' && sep.trailing) {
            result += sep.sep;
        }
        return result;
    }

    joinBy(getSep: (l: T, r: T) => string): string {
        let result = '';
        let prev: T = undefined as any;
        let first = true;
        for (const item of this) {
            if (first) {
                result = String(item);
                first = false;
            } else {
                result += getSep(prev, item) + String(item);
            }
            prev = item;
        }
        return result;
    }

    last(): Optional<T> {
        return this.at(-1);
    }

    map<U>(mapper: (item: T) => U): Stream<U> {
        const ths = this
        return new IteratorStream(function* (){
            for (const item of ths) {
                yield mapper(item)
            }
        })
    }

    peek(effect: (item: T) => void): Stream<T> {
        return this.map(item => {effect(item); return item})
    }

    randomItem(): Optional<T> {
        const ths = this
        return new SimpleOptional<T>(function* () {
            const a = ths.toArray()
            if (a.length) {
                yield a[Math.floor(Math.random() * a.length)]
            }
        });
    }

    reduce<U>(reducer: (prev: U, curr: T) => U, initial?: U): Optional<U> | U {
        if (arguments.length > 1) {
            let curr: U = initial!
            for (const item of this) {
                curr = reducer(curr, item)
            }
            return curr;
        }

        const ths = this
        return new SimpleOptional<U>(function* () {
            let found = false
            let curr: U = undefined as never
            for (const item of ths) {
                if (!found) {
                    curr = item as any as U  // no initial, U=T
                    found = true
                } else {
                    curr = reducer(curr, item)
                }
            }
            if (found) yield curr
        });
    }

    reduceRight<U>(reducer: (prev: U, curr: T) => U, initial?: U): Optional<U> | U {
        if (arguments.length > 1) {
            return this.reverse().reduce(reducer, initial!);
        }

        // No initial, U=T
        return this.reverse().reduce(reducer as any) as any;
    }

    reverse(): Stream<T> {
        return new LazyArrayStream(() => this.toArray().reverse())
    }

    shuffle(): Stream<T> {
        return new LazyArrayStream(() => shuffle(this.toArray()))
    }

    single(): Optional<T> {
        const ths = this
        return new SimpleOptional(function* () {
            let foundItem: T | undefined = undefined
            let first = true
            for (const item of ths) {
                if (!first) return
                foundItem = item
                first = false
            }
            if (!first) yield foundItem as T
        })
    }

    size(): number {
        let i = 0
        for (const _ of this) i++
        return i;
    }

    some(predicate: (item: T) => boolean): boolean {
        return this.forEachUntil(predicate)
    }

    sort(compareFn?: (a: T, b: T) => number): Stream<T> {
        return new LazyArrayStream(() => this.toArray().sort(compareFn))
    }

    sortBy(getComparable: (item: T) => (number | string | boolean)): Stream<T> {
        return new LazyArrayStream(() => sortBy(this.toArray(), getComparable))
    }

    splitWhen(isSplit: (l: T, r: T) => boolean): Stream<T[]> {
        const ths = this
        return new IteratorStream(function* () {
            let chunk: T[] | undefined = undefined
            for (const item of ths) {
                if (!chunk) {
                    chunk = [item]
                } else if (isSplit(chunk[chunk.length - 1], item)) {
                    yield chunk
                    chunk = [item]
                } else {
                    chunk.push(item)
                }
            }
            if (chunk) yield chunk
        })
    }

    tail(): Stream<T> {
        return new IteratorStream(() => {
            const itr = this[Symbol.iterator]()
            itr.next()
            return itr
        })
    }

    take(n: number): Stream<T> {
        const ths = this
        return new IteratorStream(function* () {
            if (n <= 0) return
            let i = 0
            for (const item of ths) {
                yield item
                if (++i >= n) break
            }
        })
    }

    takeLast(n: number): Stream<T> {
        return new IteratorStream(()  =>
            collectLast(this, n)[Symbol.iterator]()
        )
    }

    takeRandom(n: number): Stream<T> {
        const ths = this
        return new LazyArrayStream(() => {
            const a = ths.toArray()
            const size = Math.max(0, Math.min(n, a.length))
            shuffle(a, size)
            a.length = size
            return a
        })
    }

    toArray(): T[] {
        return [...this]
    }

    toObject(): T extends readonly [string | number | symbol, any] ? { [key in T[0]]: T[1] } : unknown {
        const obj: any = {};
        this.forEach(item => {
            if (Array.isArray(item) && item.length === 2) {
                const k = item[0];
                const v = item[1]
                if (typeof k === 'string' || typeof k === 'number' || typeof k === 'symbol') {
                    obj[k] = v;
                } else {
                    throw Error('Not key: ' + k);
                }
            } else {
                throw Error('Not 2-element array: ' + item);
            }
        });
        return obj;
    }

    transform<U>(operator: (input: Iterable<T>) => Iterator<U>): Stream<U> {
        return new IteratorStream<U>(() => operator(this));
    }

    transformToOptional<U>(operator: (input: Iterable<T>) => Iterator<U>): Optional<U> {
        return new SimpleOptional(() => operator(this));
    }

    zip<U>(other: Iterable<U>): Stream<[T, U]> {
        const ths = this
        return new IteratorStream(function* () {
            const it1 = ths[Symbol.iterator]()
            const it2 = other[Symbol.iterator]()
            for ( ; ; ) {
                const n = it1.next()
                const m = it2.next()
                if (!n.done && !m.done)
                    yield [n.value, m.value] satisfies [T, U]
                else
                    break
            }
        })
    }

    zipStrict<U>(other: Iterable<U>): Stream<[T, U]> {
        const ths = this
        return new IteratorStream(function* () {
            const it1 = ths[Symbol.iterator]()
            const it2 = other[Symbol.iterator]()
            for ( ; ; ) {
                const {done: d1, value: v1} = it1.next()
                const {done: d2, value: v2} = it2.next()
                if (d1 && d2) break
                if (d1 && !d2) throw new Error('Too small this')
                if (!d1 && d2) throw new Error('Too small other')
                if (!d1 && !d2) yield [v1, v2] satisfies [T, U]
            }
        })
    }

    zipWithIndex(): Stream<[T, number]> {
        const ths = this
        return new IteratorStream(function* () {
            let i = 0
            for (const item of ths) {
                yield [item, i++] satisfies [T, number]
            }
        })
    }

    zipWithIndexAndLen(): Stream<[T, number, number]> {
        const ths = this
        return new IteratorStream(function* () {
            const a = ths.toArray()
            let i = 0
            for (const item of a) {
                yield [item, i++, a.length] satisfies [T, number, number]
            }
        })
    }
}

class IteratorStream<T> extends AbstractStream<T> implements Stream<T> {
    #gen: () => Iterator<T>

    constructor(gen: () => Iterator<T>) {
        super()
        this.#gen = gen
    }

    [Symbol.iterator](): Iterator<T> {
        return this.#gen()
    }
}

type RandomAccess<T> = {
    // Minifiers cannot mangle these, shortening manually
    i: (ix: number) => T,
    s: number,
}

class RandomAccessStream<T> extends AbstractStream<T> implements Stream<T> {
    /**
     * Invoking this function creates an object possibly with state, which will remember the input data,
     * if it needs to be created (e.g. shuffled array). Should be invoked once when the operation starts executing.
     */
    #ra: () => RandomAccess<T>

    constructor(createRandomAccess: () => RandomAccess<T>) {
        super()
        this.#ra = createRandomAccess
    }

    [Symbol.iterator](): Iterator<T> {
        const {i, s} = this.#ra()
        let ix = 0
        return {
            next() {
                if (ix < s)
                    return {done: false, value: i(ix++)}
                else
                    return {done: true, value: undefined}
            }
        }
    }

    at(index: number): Optional<T> {
        const ths = this
        return new SimpleOptional(function* () {
            const {i, s} = ths.#ra()
            if (0 <= index && index < s) {
                yield i(index)
            } else if (-s <= index && index < 0) {
                yield i(s + index)
            }
        })
    }

    butLast(): Stream<T> {
        return new RandomAccessStream(() => {
            const {i, s} = this.#ra()
            return {
                i,
                s: Math.max(s - 1, 0),
            }
        })
    }

    concat(newItem: T): Stream<T> {
        return new RandomAccessStream(() => {
            const {i, s} = this.#ra()
            return {
                i: ix => ix === s ? newItem : i(ix),
                s: s + 1,
            }
        })
    }

    concatAll(items: Iterable<T>): Stream<T> {
        if (items instanceof RandomAccessStream) {
            return new RandomAccessStream(() => {
                const {i: i1, s: s1} = this.#ra()
                const {i: i2, s: s2} = items.#ra()
                return {
                    i: i => i >= s1 ? i2(i - s1) as T : i1(i),
                    s: s1 + s2,
                }
            })
        } else {
            return super.concatAll(items)
        }
    }

    map<U>(mapper: (item: T) => U): Stream<U> {
        return new RandomAccessStream(() => {
            const {i, s} = this.#ra()
            return {
                i: ix => mapper(i(ix)),
                s,
            }
        })
    }

    randomItem(): Optional<T> {
        const ths = this
        return new SimpleOptional(function* () {
            const {i, s} = ths.#ra()
            if (s)
                yield i(Math.floor(Math.random() * s))
        })
    }

    reverse(): Stream<T> {
        return new RandomAccessStream(() => {
            const {i, s} = this.#ra()
            return {
                i: xi => i(s - 1 - xi),
                s,
            }
        })
    }

    single(): Optional<T> {
        const ths = this
        return new SimpleOptional<T>(function* () {
            const {i, s} = ths.#ra()
            if (s === 1) yield i(0)
        })
    }

    tail(): Stream<T> {
        return new RandomAccessStream<T>(() => {
            const {i, s} = this.#ra()
            return {
                i: ix => i(ix + 1),
                s: Math.max(0, s - 1),
            }
        })
    }

    take(n: number): Stream<T> {
        return new RandomAccessStream(() => {
            const {i, s} = this.#ra()
            return {
                i,
                s: Math.max(0, Math.min(n, s)),
            }
        })
    }

    takeLast(n: number): Stream<T> {
        return new RandomAccessStream(() => {
            const {i, s} = this.#ra()
            return {
                i: ix => i(Math.max(0, s - n) + ix),
                s: Math.max(0, Math.min(n, s)),
            }
        })
    }

    size(): number {
        return this.#ra().s
    }

    zipWithIndexAndLen(): Stream<[T, number, number]> {
        return new RandomAccessStream(() => {
            const {i, s} = this.#ra()
            return {
                i: ix => [i(ix), ix, s],
                s,
            }
        })
    }
}

type ArrayAccess<T> = {
    a: T[]
} & RandomAccess<T>

class LazyArrayStream<T> extends RandomAccessStream<T> implements Stream<T> {
    #aa: () => ArrayAccess<T>

    constructor(getArray: () => T[]) {
        const aa = () => {
            const a = getArray()
            return {
                a,
                i: ix => a[ix],
                s: a.length,
            } satisfies ArrayAccess<T>
        }
        super(aa)
        this.#aa = aa
    }

    [Symbol.iterator](): Iterator<T> {
        return this.#aa().a[Symbol.iterator]()
    }

    reverse(): Stream<T> {
        return new LazyArrayStream(() => this.#aa().a.reverse())
    }

    toArray(): T[] {
        return this.#aa().a
    }
}

class SimpleOptional<T> implements Optional<T> {
    #gen: () => Iterator<T>

    constructor(gen: () => Iterator<T>) {
        this.#gen = gen
    }

    [Symbol.iterator](): Iterator<T> {
        let n: IteratorResult<T> | undefined = this.#gen().next()
        return {
            next() {
                if (!n) return {done: true, value: undefined}

                const m = n
                n = undefined
                return m
            }
        }
    }

    filter(predicate: (item: T) => boolean): Optional<T> {
        const ths = this
        return new SimpleOptional(function* () {
            for (const item of ths) {
                if (predicate(item)) yield item
            }
        })
    }

    flatMap<U>(mapper: (item: T) => Iterable<U>): Optional<U> {
        const ths = this
        return new SimpleOptional(function* () {
            for (const item of ths) {
                yield* mapper(item)
            }
        })
    }

    flatMapToStream<U>(mapper: (item: T) => Iterable<U>): Stream<U> {
        const ths = this
        return new IteratorStream(function* () {
            for (const item of ths) {
                yield* mapper(item)
            }
        })
    }

    get(): T {
        const r = this.resolve();
        if (!r.has) {
            throw new Error('Empty')
        }
        return r.val;
    }

    has(predicate: (item: T) => boolean): boolean {
        const r = this.resolve()
        return r.has && predicate(r.val)
    }

    hasNot(predicate: (item: T) => boolean): boolean {
        const r = this.resolve()
        return !r.has || !predicate(r.val)
    }

    is(item: T): boolean {
        const r = this.resolve()
        return r.has && r.val === item
    }

    isPresent(): boolean {
        return this.resolve().has
    }

    map<U>(mapper: (item: T) => U): Optional<U> {
        const ths = this
        return new SimpleOptional(function* () {
            for (const item of ths) {
                yield mapper(item)
            }
        })
    }

    mapNullable<U>(mapper: (item: T) => (U | null | undefined)): Optional<U> {
        const ths = this
        return new SimpleOptional<U>(function* () {
            for (const item of ths) {
                const newItem = mapper(item)
                if (newItem != null) yield newItem
            }
        })
    }

    orElse<U>(other: U): T | U {
        const r = this.resolve()
        return r.has ? r.val : other
    }

    orElseGet<U>(get: () => U): T | U {
        const r = this.resolve()
        return r.has ? r.val : get()
    }

    orElseNull(): T | null {
        const r = this.resolve()
        return r.has ? r.val : null
    }

    orElseThrow(createError: () => Error): T {
        const r = this.resolve()
        if (!r.has) {
            throw createError()
        }
        return r.val
    }

    orElseUndefined(): T | undefined {
        const r = this.resolve()
        return r.has ? r.val : undefined
    }

    resolve(): {has: true; val: T} | {has: false} {
        const r = this[Symbol.iterator]().next()
        return r.done ? {has: false} : {has: true, val: r.value};
    }

    toArray(): T[] {
        return [...this]
    }

    toStream(): Stream<T> {
        return new IteratorStream(() => this[Symbol.iterator]())
    }
}

function collectLast<T>(input: Iterable<T>, n: number): RandomAccessStream<T> {
    if (n <= 0) return new LazyArrayStream(() => [])

    const ringBuffer: T[] = []
    let offset = 0
    for (const item of input) {
        if (ringBuffer.length < n) {
            ringBuffer.push(item)
        } else {
            ringBuffer[offset++] = item
            if (offset === n) offset = 0
        }
    }
    return new RandomAccessStream(() => ({
        i: i => ringBuffer[(offset + i) % ringBuffer.length],
        s: ringBuffer.length,
    }))
}

function shuffle<T>(a: T[], n: number = a.length) {
    const r = n < a.length ? n : n - 1
    for (let i = 0; i < r; i++) {
        const j = i + Math.floor(Math.random() * (a.length - i))
        const t = a[i]
        a[i] = a[j]
        a[j] = t
    }
    return a
}

function sortBy<T>(a: T[], getComparable: (item: T) => (number | string | boolean)) {
    return a.sort((x, y) => {
        const ca = getComparable(x)
        const cb = getComparable(y)
        return ca < cb ? -1
            : ca > cb ? 1
            : 0
    })
}
