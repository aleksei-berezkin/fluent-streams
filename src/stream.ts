import { Optional } from './optional';

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
 * During evaluation streams produce as little intermediate data as possible. For example, {@link map} does
 * not copy input data; instead, it retrieves upstream data one by one, and pushes mapped items downstream also
 * value by value. Some operations do require creating intermediate data structures, for example {@link shuffle}
 * and {@link sortBy}; in this case downstream steps maximize the benefit of having random-access array allowed
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
     * Creates an optional which resolves to an element of this stream at `index` position if there is such a position,
     * or resolves to empty otherwise.
     * @param index Zero-based position to return an item at
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
     * @param sep A string to insert between items.
     */
    join(sep: string): string;

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
     * Creates a stream executing an effect for each item and returning the item as is.
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
    reduce(reducer: (l: T, r: T) => T): Optional<T>;

    /**
     * If this stream is empty returns `zero`; otherwise applies `reducer` to `zero` and the first item, then applies
     * `reducer` to previously returned result and second item etc, and resolves to a value returned by the last
     * `reducer` invocation.
     * @param zero The starting value
     * @param reducer The function to reduce items
     */
    reduceLeft<U>(zero: U, reducer: (l: U, r: T) => U): U;

    /**
     * If this stream is empty returns `zero`; otherwise applies `reducer` to the last item and `zero`, then applies
     * `reducer` to last-but-one item and previously returned result etc, and resolves to a value returned by the last
     * `reducer` invocation.
     * @param zero The starting value
     * @param reducer The function to reduce items
     */
    reduceRight<U>(zero: U, reducer: (l: T, r: U) => U): U;

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
