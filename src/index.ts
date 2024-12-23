// *** Types ***

/**
 * A stream is a thin wrapper over an
 * [iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol),
 * providing intermediate and terminal operations to manipulate data. Like iterables,
 * streams respect the order of items; unless explicitly specified otherwise, operations
 * consume and transform items in their original order. Streams are lazy: all computations
 * are triggered only during terminal operations.
 * 
 * A stream can be understood as a function over an iterable. Intermediate operations return 
 * new functions with the current stream as input, while terminal operations capture the input, 
 * evaluate the chain of functions, and return data.
 * 
 * ```typescript
 * stream(1, 2, 3, 4)           // factory
 *   .filter(i => i % 2 === 0)  // intermediate
 *   .map(i => -i)              // intermediate
 *   .toArray()                 // terminal => [-2, -4]
 * ```
 * 
 * Streams are stateless: they store only a reference to the input. This means streams can be 
 * iterated multiple times, and each time, the stream evaluates the input as it existed at the 
 * moment the terminal operation was invoked.
 * 
 * ```typescript
 * const input = [10, 20, 30]
 * const s = stream(input)
 *   .map(i => i + 1)
 * 
 * s.toArray()    // => [11, 21, 31]
 * 
 * input.push(40)
 * s.toArray()    // => [11, 21, 31, 41]
 * ```
 * 
 * During evaluation, streams produce as little intermediate data as possible. For example, 
 * {@link Stream.map} does not copy input data; instead, it retrieves upstream data one by one 
 * and yields mapped items value by value. Some operations do require creating intermediate
 * data structures, such as {@link Stream.shuffle} and {@link Stream.sortBy}. In such cases,
 * downstream steps maximize the benefit of having a random-access array that can be modified.
 * 
 * ```typescript
 * stream(30, 20, 10, 0)
 *   .map(i => i + 1) // does not copy data, maps on evaluation
 *   .sortBy(i => i)  // copies data to a new array and sorts it
 *   .at(2)           // accesses index 2 in the sorted array
 *   .get()           // => 21
 * ```
 * 
 * @typeParam T - The type of elements in this stream
 */
export interface Stream<T> extends Iterable<T, undefined> {
    /**
     * Returns an iterator that yields the items of this stream.
     *
     * @returns An iterator over the items of this stream.
     */
    [Symbol.iterator](): Iterator<T, undefined>

    /**
     * Returns an optional that resolves to the element at the specified `index` 
     * position in this stream. A negative `index` counts from the last item (e.g., `-1` 
     * refers to the last item, `-2` to the second-to-last item, and so on). If the 
     * specified position does not exist, the optional resolves to empty.
     * 
     * @param index - A zero-based position for the desired item, or a negative position 
     *                to count from the end of the stream.
     * 
     * @returns An {@link Optional} containing the item at the specified position, or 
     *          empty if no such position exists.
     */
    at(index: number): Optional<T>

    /**
     * Calls `Promise.all()` on the items in this stream and returns the resulting promise.
     * If the items in this stream are of type `Promise<E>`, the result will be of type 
     * `Promise<E[]>`. For more complex cases, refer to the 
     * [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all).
     * 
     * @returns A `Promise` resolving to an array of results, where the type depends on 
     *          whether the items in the stream are promises.
     */
    awaitAll(): Promise<T extends PromiseLike<infer E> ? E[] : T[]>

    /**
     * Returns a stream containing all items of this stream except the last one.
     * If this stream is empty or contains only a single item, the resulting stream 
     * will also be empty.
     * 
     * @returns A {@link Stream} containing all but the last item of this stream.
     */
    butLast(): Stream<T>

    /**
     * Returns a stream containing all items of this stream, followed by the
     * provided `items`.
     * 
     * @param items - The `items` to append to the end of the stream.
     * 
     * @returns A {@link Stream} with the original items of this stream and
     * the appended `items`.
     */
    concat(...items: T[]): Stream<T>

    /**
     * Returns a stream containing all items of this stream, followed by all items 
     * provided by the `items` iterable.
     * 
     * @param items - An iterable whose items will be appended to the end of this stream.
     * 
     * @returns A {@link Stream} with the original items of this stream followed by the
     *          items from the provided iterable.
     */
    concatAll(items: Iterable<T>): Stream<T>

    /**
     * Returns a stream containing only the elements of this stream for which `getKey` 
     * returns unique keys. If multiple items produce the same key, only the first such 
     * item is included in the result stream.
     * 
     * The implementation uses a `Set` under the hood, meaning that keys are compared 
     * using the 
     * [SameValueZero](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set#value_equality) 
     * algorithm.
     * 
     * @param getKey - A function that extracts a key from each item to determine uniqueness.
     * Receives an item and its index in the stream.
     * 
     * @returns A {@link Stream} containing only the distinct items based on their keys.
     */
    distinctBy(getKey: (item: T, index: number) => any): Stream<T>

    /**
     * Returns a stream containing all items except the first `n` items of this stream. 
     * If the stream contains `n` or fewer items, the resulting stream will be empty.
     * 
     * @param n The number of items to drop from the start of the stream.
     * @returns A {@link Stream} containing all items except the first `n`.
     */
    drop(n: number): Stream<T>

    /**
     * Returns a stream containing all items except the last `n` items of this stream. 
     * If the stream contains `n` or fewer items, the resulting stream will be empty.
     * 
     * @param n The number of items to drop from the end of the stream.
     * @returns A {@link Stream} containing all items except the last `n`.
     */
    dropLast(n: number): Stream<T>

    /**
     * Returns a stream containing all items of this stream after dropping the
     * trailing items that satisfy the given `predicate`. Items are checked from
     * the end of the stream backward. Once an item does not match the `predicate`,
     * all preceding items and that item are included in the resulting stream.
     * 
     * @param predicate A function invoked for each item, with the following parameters:
     *        - `item` - The current item in the stream.
     *        - `index` - The index of the current item in the stream, starting from 0.
     *        The function should return `true` to drop the item or `false` to stop dropping.
     * 
     * @returns A {@link Stream} containing the remaining items after dropping the trailing
     * items that satisfy the `predicate`.
     */
    dropLastWhile(predicate: (item: T, index: number) => boolean): Stream<T>

    /**
     * Returns a stream containing all items of this stream after dropping the
     * leading items that satisfy the given `predicate`. Once an item does not
     * match the `predicate`, that item and all subsequent items are included in the
     * resulting stream.
     * @param predicate A function invoked for each item, with the following parameters:
     *        - `item` - The current item in the stream.
     *        - `index` - The index of the current item in the stream, starting from 0.
     *        The function should return `true` to drop the item or `false` to stop dropping.
     * 
     * @returns A {@link Stream} containing the remaining items after dropping the leading
     * items that satisfy the `predicate`.
     */
    dropWhile(predicate: (item: T, index: number) => boolean): Stream<T>

    /**
     * Returns `true` if the `other` iterable contains the same number of items as this
     * stream and all corresponding items are equal using the `===` operator.
     * 
     * @param other - An iterable to test for equality with this stream.
     * 
     * @returns `true` if the iterables are equal in length and item-wise equality,
     *          otherwise `false`.
     */
    equals(other: Iterable<T>): boolean

    /**
     * Returns `true` if the `predicate` returns `true` for all items of this stream;
     * returns `false` otherwise. For an empty stream, the result is `true`.
     * 
     * This is a short-circuiting operation, meaning it stops processing items as soon
     * as the `predicate` returns `false` for any item.
     * 
     * @param predicate - A function to test each item in the stream.
     * Receives an item and its index in the stream.
     * 
     * @returns `true` if all items satisfy the predicate or the stream is empty,
     *          otherwise `false`.
     */
    every(predicate: (item: T, index: number) => boolean): boolean

    /**
     * Returns a stream containing only the items of this stream that match the provided
     * `predicate`.
     * 
     * @param predicate - A function to test each item in the stream.
     * Receives an item and its index in the stream.
     * 
     * @returns A {@link Stream} containing the items that satisfy the predicate.
     */
    filter(predicate: (item: T, index: number) => boolean): Stream<T>

    /**
     * Returns a stream with a possibly narrowed type, containing only the items of
     * this stream that match the provided `predicate`. For example, this can be
     * used to filter out `null` values from the stream.
     *
     * ```typescript
     * streamOf('a', null, 'b')
     *   .filter<string>(item => typeof item === 'string')
     *   .toArray() satisfies string[]
     * ```
     *
     * @param predicate - A type predicate function used to test items and narrow
     * their type.
     * 
     * @returns A {@link Stream} containing only the items that satisfy the predicate.
     */
    filter<U extends T>(predicate: (item: T, index: number) => item is U): Stream<U>

    /**
     * Returns an {@link Optional} which resolves to the first item that matches the 
     * predicate, or to empty if no such item is found.
     * 
     * @param predicate - The function to test each item in the stream.
     * Receives an item and its index in the stream.
     * 
     * @returns An {@link Optional} that contains the first matching item or is empty 
     *          if no item matches.
     */
    find(predicate: (item: T, index: number) => boolean): Optional<T>

    /**
     * Returns an {@link Optional} which resolves to the last item that matches the 
     * predicate, or to empty if no such item is found.
     * 
     * @param predicate - The function to test each item in the stream.
     * Receives an item and its index in the stream.
     * 
     * @returns An {@link Optional} that contains the last matching item or is empty 
     *          if no item matches.
     */
    findLast(predicate: (item: T, index: number) => boolean): Optional<T>

    /**
     * Returns a stream with the following behavior:
     * - Non-iterable items are included in the resulting stream as is.
     * - Iterable items are flattened up to the specified `depth` and included 
     *   in the resulting stream.
     * 
     * @param depth The depth of flattening. Defaults to 1.
     * @returns A {@link Stream} containing the flattened items.
     */
    flat<D extends number = 1>(depth?: D): Stream<FlatIterable<T, D>>

    /**
     * Returns a stream with the following behavior:
     * 1. Iterates over the items in this stream.
     * 2. Applies the `mapper` function to each item.
     * 3. Flattens and chains together all results returned by the `mapper` function 
     *    into a single-level stream.
     * 
     * This operation is also known as `chain`.
     * 
     * @param mapper - A function that transforms each item in the stream into an 
     *                 iterable of items to be flattened.
     *                 Receives an item and its index in the stream.
     * 
     * @returns A new {@link Stream} containing all items produced by the `mapper` 
     *          function, flattened into a single level.
     * 
     * @typeParam U - The type of items produced by the `mapper` function, and type of 
     *                items in the resulting stream.
     */
    flatMap<U>(mapper: (item: T, index: number) => Iterable<U>): Stream<U>

    /**
     * Invokes `effect` for each item of this stream.
     *
     * @param effect - The effect to apply to each item. Receives an item and its index in the stream.
     */
    forEach(effect: (item: T, index: number) => void): void;

    /**
     * Invokes the specified `effect` function for each item in this stream until the 
     * `effect` function returns `true`.
     * 
     * @param effect - A function to apply to each item in the stream. The function 
     *                 can return a value that determines whether iteration should stop.
     *                 Receives an item and its index in the stream.
     * 
     * @returns `true` if the iteration was stopped because the `effect` function 
     *          returned `true`, otherwise `false`.
     */
    forEachUntil(effect: (item: T, index: number) => boolean | undefined | void): boolean

    /**
     * Returns a stream whose elements are `[key, items[]]` pairs. Keys are 
     * derived using the `getKey` function applied to the items in this stream. 
     * `items` are arrays of stream elements that produced the same `key`.
     * 
     * This method uses a `Map` internally for grouping, meaning that keys are 
     * compared using the 
     * [SameValueZero](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set#value_equality)
     * algorithm.
     * 
     * @param getKey - A function to derive the key for each item. The function 
     * receives the item and its index in the stream.
     * 
     * @returns A {@link Stream} of `[key, items[]]` pairs, where `key` is a 
     * derived key and `items[]` is an array of elements associated with that key.
     */
    groupBy<K>(getKey: (item: T, index: number) => K): Stream<[K, T[]]>

    /**
     * Collects the items of this stream into a [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map).
     * Keys are generated using the provided `getKey` function applied to each item in the stream.
     * 
     * Items that produce the same key (as determined by the `Map`'s
     * [key equality](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#key_equality))
     * are grouped into an array and stored as the value corresponding to that key.
     * 
     * @param getKey - A function to derive the key for each item. The function
     * receives the item and its index in the stream.
     * 
     * @returns A `Map` where each key is associated with an array of items that
     * produced the same key.
     */
    groupByToMap<K>(getKey: (item: T, index: number) => K): Map<K, T[]>

    /**
     * Returns an optional that resolves to the first item of this stream if the 
     * stream contains any items, or resolves to empty otherwise.
     * 
     * @returns An {@link Optional} containing the first item or empty.
     */
    head(): Optional<T>

    /**
     * Concatenates the items of this stream, inserting `sep` between them. Items are 
     * coerced to strings using the 
     * [String function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/String)
     * (without `new`).
     * 
     * @param sep - A string to insert between items. Defaults to ",".
     * @returns A string representing the concatenated stream items.
     */
    join(sep?: string): string

    /**
     * Concatenates the items of this stream, inserting `spec.sep` between them.
     * Additionally, can insert `spec.leading` and `spec.trailing` strings before and
     * after the result, if provided. Items are coerced to strings using the
     * [String function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/String) 
     * (without `new`).
     * 
     * @param spec - An object specifying:
     *  - `sep`: A string to insert between items.
     *  - `leading`: A string to prepend to the result (optional).
     *  - `trailing`: A string to append to the result (optional).
     * @returns A string representing the concatenated stream items.
     */
    join(spec: {sep: string, leading?: boolean, trailing?: boolean}): string

    /**
     * Like {@link join} but retrieves the separator by calling `getSep` for each pair 
     * of adjacent items.
     * 
     * @@param getSep - A function that returns the separator for each pair of adjacent items.
     * Receives the left item, the right item, and the index of the left item in the stream.
     * 
     * @returns A string representing the concatenated stream items with custom 
     * separators.
     */
    joinBy(getSep: (l: T, r: T, lIndex: number) => string): string

    /**
     * Returns an optional resolving to the last item of this stream if it's nonempty, 
     * or resolving to empty otherwise.
     * 
     * @returns An {@link Optional} resolving to the last item if the stream is nonempty, 
     * or to empty otherwise.
     */
    last(): Optional<T>

    /**
     * Returns a stream where each item is transformed by `mapper`.
     * 
     * @param mapper A function to transform each item. Receives an item and its index in the stream.
     * @returns A new {@link Stream} containing the transformed items.
     */
    map<U>(mapper: (item: T, index: number) => U): Stream<U>

    /**
     * Returns a stream whose items are transformed by `mapper`, 
     * with `null` and `undefined` results filtered out.
     * 
     * @param mapper The function to transform each item. Receives an item and its index in the stream.
     * @returns A new {@link Stream} with the non-null and non-undefined transformed items.
     */
    mapNullable<U>(mapper: (item: T, index: number) => U | null | undefined): Stream<U>

    /**
     * Returns a stream that executes an effect for each item, returning the item unchanged.
     * This method can be used, for example, to mutate items in place.
     * 
     * @param effect The effect to execute on each item. Receives an item and its index in the stream.
     * @returns A new {@link Stream} with the same items, after executing the effect.
     */
    peek(effect: (item: T, index: number) => void): Stream<T>

    /**
     * Returns an optional that resolves to a random item from this stream, or resolves
     * to empty if the stream is empty. The implementation uses the pseudo-random 
     * [Math.random()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random),
     * which means it's not suitable for cryptographic purposes.
     * 
     * @returns An {@link Optional} containing a random item from the stream, or empty
     * if the stream is empty.
     */
    randomItem(): Optional<T>

    /**
     * Returns an optional with the following behavior:
     * - Resolves to empty if the stream is empty.
     * - Resolves to the single item if the stream contains exactly one item.
     * - Resolves to the final value produced by repeatedly applying the `reducer`
     *   function. The `reducer` is first applied to the items at index 0 and index 1,
     *   then to the result of the previous invocation and the item at the next index,
     *   and so on. 
     * @param reducer A function that reduces the stream's items. It receives the 
     * following parameters:
     *        - accumulator - The result of the previous `reducer` invocation, or,
     *          for the first invocation, the item at index 0.
     *        - currentItem - The current item of the stream. For the first invocation,
     *          the item at index 1.
     *        - currentIndex - The index of the current item in the stream. For the 
     *          first invocation, this is 1.
     * @returns An {@link Optional} containing the reduced value, or empty if the
     * stream is empty.
     */
    reduce(reducer: (accumulator: T, currentItem: T, currentIndex: number) => T): Optional<T>

    /**
     * If this stream is empty, returns `initialValue`. Otherwise, applies `reducer` to 
     * `initialValue` and the item at index 0, then applies `reducer` to the previously 
     * returned result and the item at index 1, and so on, returning the result from the 
     * last `reducer` invocation.
     * 
     * @param reducer The function to reduce items. Takes the following parameters:
     *        - accumulator - The result of the previous `reducer` invocation, or,
     *          for the first invocation, `initialValue`.
     *        - currentItem - The current item of the stream.
     *        - currentIndex - The index of the current item in the stream. For the 
     *          first invocation, this is 0.
     * @param initialValue The initial value for the reduction process.
     * @returns The result of the reduction process.
     */
    reduce<U>(reducer: (accumulator: U, currentItem: T, currentIndex: number) => U, initialValue: U): U

    /**
     * Returns an optional with the following behavior:
     * - If this stream is empty, resolves to empty.
     * - If this stream has one item, resolves to that item.
     * - Otherwise, applies `reducer` to the item at index `size - 1` and the item at 
     *   index `size - 2`, then applies `reducer` to the previously returned result 
     *   and the item at index `size - 3`, and so on, resolving to the value returned 
     *   by the final `reducer` invocation.
     * 
     * @param reducer The function to reduce items. Takes the following parameters:
     *        - accumulator - The result of the previous `reducer` invocation, or, 
     *          for the first invocation, the item at index `size - 1`.
     *        - currentItem - The current item of the stream.
     *        - currentIndex - The index of the current item in the stream, starting 
     *          from `size - 2` and decreasing toward 0.
     * @returns An {@link Optional} containing the result of the reduction, or empty if 
     *          the stream is empty.
     */
    reduceRight(reducer: (accumulator: T, currentItem: T, currentIndex: number) => T): Optional<T>

    /**
     * If this stream is empty, returns `initialValue`. Otherwise, applies `reducer` to 
     * `initialValue` and the item at the index `size - 1`, then applies `reducer` to the 
     * previously returned result and the item at index `size - 2`, and so on, 
     * returning the result from the final `reducer` invocation.
     * 
     * @param reducer The function to reduce items. Takes the following parameters:
     *        - accumulator - The result of the previous `reducer` invocation, or,
     *          for the first invocation, `initialValue`.
     *        - currentItem - The current item of the stream.
     *        - currentIndex - The index of the current item in the stream, starting 
     *          from the index `size - 1` and decreasing toward 0.
     * @param initialValue The initial value for the reduction process.
     * @returns The result of the reduction process.
     */
    reduceRight<U>(reducer: (accumulator: U, currentItem: T, currentIndex: number) => U, initialValue: U): U

    /**
     * Returns a stream whose elements are the elements of this stream in reversed 
     * order.
     * 
     * @returns A new {@link Stream} with the elements in reversed order.
     */
    reverse(): Stream<T>

    /**
     * Returns a stream whose elements are the elements of this stream in random 
     * order. Uses the pseudo-random 
     * [Math.random()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random), 
     * which means it is not suitable for cryptographic purposes.
     * 
     * @returns A new {@link Stream} with the elements in random order.
     */
    shuffle(): Stream<T>

    /**
     * Returns an optional that resolves to an item if this stream contains only 
     * one item; otherwise, it resolves to empty.
     * 
     * @returns An {@link Optional} resolving to the single item or to empty.
     */
    single(): Optional<T>

    /**
     * Returns the number of items in this stream.
     * 
     * @returns The size of this stream.
     */
    size(): number

    /**
     * Returns a stream containing a portion of this stream, determined by the
     * `start` and `end` indices. The resulting stream includes the items starting
     * from the `start` index up to, but not including, the `end` index.
     *
     * If no `start` is specified, the slice begins at index `0`. If no `end` is
     * specified, the slice ends at the last item in the stream. Negative indices
     * can be used for both `start` and `end` to indicate positions from the end of
     * the stream, where `-1` refers to the last item, `-2` refers to the
     * second-to-last item, and so on.
     * 
     * The method's behavior aligns with
     * [Array.slice()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice).
     *
     * @param start - The zero-based index at which to begin the slice. Defaults to `0`.
     * @param end - The zero-based index before which to end the slice. Defaults to the
     * size of the stream.
     * 
     * @returns A {@link Stream} containing the specified portion of this stream.
     */
    slice(start?: number, end?: number): Stream<T>

    /**
     * Returns `true` if the `predicate` returns `true` for any item of this stream; 
     * returns `false` otherwise. This is a short-circuiting operation, meaning it 
     * skips the remaining items once the `predicate` returns `true` for any item.
     * 
     * @param predicate A function to test each item. Receives an item and its index in the stream.
     * @returns `true` if any item satisfies the predicate, `false` otherwise.
     */
    some(predicate: (item: T, index: number) => boolean): boolean

    /**
     * Returns a stream whose items are sorted items of this stream. The implementation relies on
     * [Array.sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort).
     * 
     * @param compareFn Comparison function with semantics described in MDN
     * [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#comparefn).
     * If not provided, the underlying `Array.sort()` will convert items to strings and compare them lexicographically.
     * 
     * @returns A {@link Stream} with sorted items.
     */
    sort(compareFn?: (a: T, b: T) => number): Stream<T>

    /**
     * Returns a stream with items of this stream ordered by the value returned by `getComparable`.
     * The returned values are then compared with `>` and `<`. The implementation relies on
     * [Array.sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort).
     * 
     * @param getComparable A function that, given an item, returns a comparable value. 
     * The returned value is not cached, so it is recommended not to perform heavy computations in 
     * this function.
     * 
     * @returns A {@link Stream} with items ordered by the comparable value.
     */
    sortBy(getComparable: (item: T) => number | string | boolean): Stream<T>

    /**
     * Returns a stream whose items are groups of adjacent items from this stream for which 
     * `isSplit` returned false. In other words, given all items as a sequence, it splits them
     * between items for which `isSplit` returns `true`.
     * 
     * @param isSplit A function to check if the items sequence should be split between `l` 
     * and `r` items. Receives the index of the `l` item as a 3rd parameter.
     * 
     * @returns A {@link Stream} containing groups of adjacent items.
     */
    splitWhen(isSplit: (l: T, r: T, lIndex: number) => boolean): Stream<T[]>

    /**
     * Returns a stream that contains all but the first item of this stream. If the stream 
     * is empty or contains only one item, the returned stream will be empty.
     * 
     * @returns A {@link Stream} containing all but the first item.
     */
    tail(): Stream<T>

    /**
     * Returns a stream containing no more than the first `n` items of this stream.
     * 
     * @param n The maximum number of leading items to select from this stream.
     * 
     * @returns A {@link Stream} containing no more than the first `n` items.
     */
    take(n: number): Stream<T>;

    /**
     * Creates a stream containing no more than the last `n` items of this stream.
     * 
     * @param n The maximum number of trailing items to select from this stream.
     * 
     * @returns A {@link Stream} containing the last `n` items.
     */
    takeLast(n: number): Stream<T>

    /**
     * Returns a stream containing the trailing items of this stream that satisfy
     * the given `predicate`. Once an item does not match the `predicate`, this item
     * and all preceding items are excluded from the resulting stream.
     *
     * @param predicate - A function invoked with each item and its index. Returns
     * `true` to include the item in the resulting stream, or `false` to stop
     * iterating.
     * 
     * @returns A {@link Stream} containing the trailing items that satisfy the
     * given `predicate`.
     */
    takeLastWhile(predicate: (item: T, index: number) => boolean): Stream<T>

    /**
     * Returns a stream containing the leading items of this stream that satisfy
     * the given `predicate`. Once an item does not match the `predicate`, this
     * item and all subsequent items are excluded from the resulting stream.
     *
     * @param predicate - A function invoked with each item and its index. Returns
     * `true` to include the item in the resulting stream, or `false` to stop
     * iterating.
     * 
     * @returns A {@link Stream} containing the leading items that satisfy the
     * given `predicate`.
     */
    takeWhile(predicate: (item: T, index: number) => boolean): Stream<T>

    /**
     * Returns a stream containing no more than `n` random items from this stream. 
     * The result is sampled [without replacement](https://en.wikipedia.org/wiki/Simple_random_sample), 
     * meaning each item from this stream appears no more than once in the result. 
     * The implementation uses pseudo-random [Math.random()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random),
     * so it is not suitable for cryptographic purposes.
     * 
     * @param n The maximum number of items to sample.
     * 
     * @returns A {@link Stream} containing up to `n` random items.
     */
    takeRandom(n: number): Stream<T>

    /**
     * Returns the items of the stream as an array.
     * 
     * @returns An array containing the items of the stream.
     */
    toArray(): T[]

    /**
     * Converts a stream of `[key, value]` pairs where `key` is `string`, `number`, or `symbol`,
     * to an object. If a `key` appears multiple times in the stream, only the last
     * `[key, value]` pair will be included in the result object. If the elements of the stream are
     * not `[key, value]` pairs as described, an error will be thrown.
     *
     * In TypeScript, you may need to use `as const` after each tuple to help TypeScript infer the
     * correct tuple types:
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
     * @returns An object where the keys are from the stream's `[key, value]` pairs and
     * the values are the corresponding values from those pairs.
     * @throws An error if the elements of the stream are not `[key, value]` pairs.
     */
    toObject(): T extends readonly [string | number | symbol, any] ? { [key in T[0]]: T[1] } : unknown;

    /**
     * Returns the items of the stream as a set.
     * 
     * @returns A set containing the items of the stream.
     */
    toSet(): Set<T>

    /**
     * Extension method to apply an arbitrary operator to the stream. An `operator`
     * is passed an iterable that yields this stream's items, and it must return an
     * iterator to be used in the next step. The easiest way to achieve this is by
     * using generators:
     * 
     * ```typescript
     * stream(1, 2, 3, 4, 5, 6)
     *   .transform(function* (items) {
     *       for (const item of items) {
     *           if (item % 3 === 0) yield item;
     *       }
     *   }).toArray();   // => [3, 6]
     * ```
     * 
     * @param operator A function that receives an iterable yielding this stream's
     * items and is expected to return an iterator for the downstream step.
     * 
     * @returns A {@link Stream} based on the transformed items.
     */
    transform<U>(operator: (input: Iterable<T>) => Iterator<U>): Stream<U>

    /**
     * Like {@link transform}, but returns an optional that discards all items
     * except the first one yielded by the iterator returned by the `operator`.
     * 
     * @param operator A function to transform this stream's items.
     * @returns An {@link Optional} containing the first item yielded by the
     * iterator, or empty if no items are yielded.
     */
    transformToOptional<U>(operator: (input: Iterable<T>) => Iterator<U>): Optional<U>

    /**
     * Returns a stream with the element at the specified `index` replaced by the 
     * provided `value`, while all other elements remain unchanged.
     * If the length of this stream is less than `index + 1`, the resulting stream remains unchanged.
     * 
     * @param index The index of the element to replace.
     * @param value The value to insert at the specified index.
     * @returns A {@link Stream} with the element at the specified `index` replaced by the provided `value`.
     */
    with(index: number, value: T): Stream<T>

    /**
     * Returns a stream whose elements are pairs, where the first element is an
     * item from this stream and the second element is the corresponding item
     * from the `other` iterable. The length of the resulting stream is the
     * minimum of this stream's length and the `other` iterable's length.
     * 
     * @param other An iterable to zip with this stream.
     * @returns A {@link Stream} of `[T, U]` pairs.
     */
    zip<U>(other: Iterable<U>): Stream<[T, U]>

    /**
     * Similar to {@link zip}, but requires that this stream and the `other`
     * iterable have the same length. Throws an error if the lengths do not
     * match.
     * 
     * @param other An iterable to zip with this stream.
     * @returns A {@link Stream} of `[T, U]` pairs.
     */
    zipStrict<U>(other: Iterable<U>): Stream<[T, U]>

    /**
     * Returns a stream of pairs where the first element is an item from this
     * stream, and the second element is its index. In other words, it 
     * {@link zip zips} with a sequence of integers starting from 0.
     * 
     * @returns A new {@link Stream} of `[T, number]` pairs.
     */
    zipWithIndex(): Stream<[T, number]>;

    /**
     * Returns a stream of triplets where the first element is an item from this
     * stream, the second element is its index, and the third element is the size
     * of this stream.
     * 
     * @returns A new {@link Stream} of `[T, number, number]` triplets.
     */
    zipWithIndexAndLen(): Stream<[T, number, number]>
}

/**
 * An Optional is similar to a {@link Stream} but contains no more than one item.
 * All stream properties, such as laziness, statelessness and implementing
 * the iteration protocol, fully apply to optionals.
 * 
 * Like streams, optionals support intermediate and terminal operations. When a terminal 
 * operation is executed, the result value is computed. This process is described as:
 * - "An optional resolves to a value" if there is an item.
 * - "An optional resolves to empty" if there is no item.
 * 
 *  @typeParam T - The type element in this Optional
 */
export interface Optional<T> extends Iterable<T, undefined> {
    /**
     * Returns an iterator that yields an item if this optional contains an item; 
     * otherwise, the iterator yields no items.
     * 
     * @returns An iterator over this optional
     */
    [Symbol.iterator](): Iterator<T, undefined>

    /**
     * Returns `true` if the optional has an item and the `predicate` evaluates to 
     * `true` for it, or if the optional is empty.
     * 
     * @param predicate A function to test the item. For compatibility with {@link Stream},
     * it receives the index as a second argument, which is always 0 in this case.
     * @returns `true` if the predicate evaluates to `true` or the optional is empty,
     * `false` otherwise.
     */
    every(predicate: (item: T, index: 0) => boolean): boolean

    /**
     * Returns an optional resolving to the original item if this optional has an 
     * item and the `predicate` evaluates to `true` for it, or resolving to empty 
     * otherwise.
     * 
     * @param predicate A function to evaluate the item. For compatibility with {@link Stream},
     * it receives the index as a second argument, which is always 0 in this case.
     * 
     * @returns An optional containing the item if the predicate evaluates to `true`
     * for it.
     */
    filter(predicate: (item: T, index: 0) => boolean): Optional<T>

    /**
     * Returns an optional with a possibly narrowed type. Resolves to the original
     * item if this optional contains an item and the `predicate` evaluates to `true`
     * for it; otherwise, resolves to empty. For example, this can be used to filter
     * out `null` values from the optional.
     * 
     * ```typescript
     * streamOf('a', null, 'b')
     *    .head()
     *    .filter<string>(item => typeof item === 'string')
     *    .toArray() satisfies string[]
     * ```
     * 
     * @param predicate - A type predicate to test the item and narrow its type.
     * For compatibility with {@link Stream}, it receives the index as a second 
     * argument, which is always `0` in this case.
     * 
     * @returns An {@link Optional} containing the item if the predicate is satisfied;
     * otherwise, an empty optional.
     */
    filter<U extends T>(predicate: (item: T, index: 0) => item is U): Optional<U>
  
    /**
     * Returns an optional with the following behavior:
     * - If this optional is empty, resolves to empty.
     * - If this optional is not empty, creates an iterable yielding the item,
     *   flattens it as described in {@link Stream.flat}, and resolves to the 
     *   first item of the flattened iterable.
     * 
     * @param depth The depth of flattening. Defaults to 1.
     * @returns An {@link Optional} containing the first item of the flattened iterable.
     */
    flat<D extends number = 1>(depth?: D): Optional<FlatIterable<T, D>>

    /**
     * Creates an optional with the following behavior:
     * - If this optional contains an item, applies `mapper` to it, and retrieves the 
     *   first item from the returned iterable. If there is an item, resolves to it; 
     *   otherwise, resolves to empty.
     * - If this optional is empty, resolves to empty.
     * 
     * @param mapper A function that takes an item and returns an iterable to create 
     * an optional from. For compatibility with {@link Stream}, it receives the index
     * as a second argument, which is always 0 in this case.
     * @returns An optional containing the first item of the iterable returned by 
     * `mapper`, or empty if the iterable has no items or this optional is empty.
     */
    flatMap<U>(mapper: (item: T, index: 0) => Iterable<U>): Optional<U>

    /**
     * Creates a {@link Stream} with the following behavior:
     * - If this optional contains an item, applies `mapper` to it and uses the 
     *   returned iterable as input for the created stream.
     * - If this optional is empty, the created stream is empty.
     * 
     * @param mapper A function that takes an item and returns an iterable to create 
     * a new stream from. For compatibility with {@link Stream}, it receives the index
     * as a second argument, which is always 0 in this case.
     * 
     * @returns A stream created from the iterable returned by `mapper`, or an empty 
     * stream if this optional is empty.
     */
    flatMapToStream<U>(mapper: (item: T, index: 0) => Iterable<U>): Stream<U>

    /**
     * If this optional contains an item, invokes `effect` for it.
     *
     * @param effect - The effect to apply to this optional's item. For compatibility with {@link Stream},
     * it receives the index as a second argument, which is always 0 in this case.
     */
    forEach(effect: (item: T, index: number) => void): void;

    /**
     * If this optional contains an item, returns that item; otherwise, throws an 
     * error.
     * @returns The item, if this optional has an item
     * @throws An error if this optional is empty
     */
    get(): T

    /**
     * Returns `true` if this optional contains an item and it strictly equals 
     * (`===`) the provided `item`; otherwise, returns `false`.
     * @param item The item to compare against the optional's item.
     * @returns `true` if the `item` is equal to the optional's item.
     */
    is(item: T): boolean

    /**
     * Returns `true` if this optional contains an item; otherwise, returns `false`.
     * @returns `true` if this optional has an item
     */
    isPresent(): boolean

    /**
     * Returns an optional with the following behavior:
     * - If this optional contains an item, invokes `mapper` with this item as an argument 
     *   and resolves to the value returned by `mapper`.
     * - If this optional is empty, resolves to empty.
     * 
     * @param mapper The function to transform an item.
     * @returns An optional containing the result of applying `mapper` to the item, 
     * or an empty optional if this optional is empty.
     */
    map<U>(mapper: (item: T) => U): Optional<U>

    /**
     * Returns an optional with the following behavior:
     * - If this optional has an item, invokes `mapper` passing this item as an argument;
     *   if `mapper` returns `null` or `undefined`, resolves to empty; otherwise resolves to the
     *   value returned by `mapper`.
     * - If this optional is empty, resolves to empty.
     * 
     * @param mapper The function to transform an item with. For compatibility with {@link Stream},
     * it receives the index as a second argument, which is always 0 in this case.
     * @returns An optional containing the non-null and non-undefined result of applying
     * `mapper` to the item, or an empty optional otherwise
     */
    mapNullable<U>(mapper: (item: T, index: 0) => U | null | undefined): Optional<U>;

    /**
     * If this optional has an item, returns that item; otherwise, returns `other`.
     * @param other Value to return if this optional is empty
     * @returns The item, if this optional has an item, or `other` otherwise
     */
    orElse<U>(other: U): T | U

    /**
     * If this optional has an item, returns that item; otherwise, returns the value
     * returned by `get`.
     * @param get Function to take the result from if this optional is empty
     * @returns The item if present, otherwise the value returned by `get`
     */
    orElseGet<U>(get: () => U): T | U

    /**
     * If this optional has an item, returns that item; otherwise throws an error
     * created by `createError`
     * @param createError Function to create an error if this optional is empty
     * @returns The item if present
     * @throws The error created by `createError` if the optional is empty
     */
    orElseThrow(createError: () => Error): T

    /**
     * If this optional has an item, returns that item; otherwise returns `null`
     * @returns The item if present, otherwise `null`
     */
    orNull(): T | null

    /**
     * If this optional has an item, returns that item; otherwise returns `undefined`
     * @returns The item if present, otherwise `undefined`
     */
    orUndefined(): T | undefined

    /**
     * Returns an optional that resolves just like this optional, but when resolving
     * to an item, additionally executes `effect` on that item before yielding it.
     * One possible usage for this method is mutating the item in place.
     * 
     * @param effect The effect to execute. For compatibility with {@link Stream},
     * it receives the index as a second argument, which is always 0 in this case.
     * 
     * @returns The optional that resolves just like this one, but executes
     * `effect` on the item before it is yielded
     */
    peek(effect: (item: T, index: 0) => void): Optional<T>

    /**
     * Returns `{has: true, val: item}` if this optional contains an item, or `{has: false}`
     * otherwise. `val? undefined` only exists for type-safe destructuring; there won't
     * be a `val` if the optional is empty.
     * @returns An object indicating whether the optional contains an item, and the item itself if present.
     */
    resolve(): {has: true; val: T} | {has: false, val?: undefined}

    /**
     * Returns `true` if this optional has an item and `predicate` evaluates to `true` for it;
     * `false` otherwise.
     * 
     * @param predicate The predicate to test an item. For compatibility with {@link Stream},
     * it receives the index as a second argument, which is always 0 in this case.
     * 
     * @returns `true` if the optional has an item and the predicate returns `true`, otherwise `false`.
     */
    some(predicate: (item: T, index: 0) => boolean): boolean

    /**
     * If this optional has an item, returns an array containing that item as the only
     * element; otherwise, returns an empty array.
     * @returns An array containing the item if present, or an empty array if the optional is empty.
     */
    toArray(): T[]

    /**
     * If this optional has an item, returns a set containing that item as the only
     * element; otherwise, returns an empty set.
     * 
     * @returns A set containing the item if present, or an empty set if the optional is empty.
     */
    toSet(): Set<T>

    /**
     * Returns a {@link Stream} with an item provided by this optional if it has an item;
     * otherwise, the stream is empty.
     * @returns A stream containing the item if present, or an empty stream if the optional is empty.
     */
    toStream(): Stream<T>
}

type FlatIterable<T, D extends number> =
    D extends -1 | 0
        ? T
        : T extends Iterable<infer I> ? FlatIterable<I, MinusOne<D>> : never

type MinusOne<N extends number> = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20][N]


// *** Factories ***

/**
 * Creates a {@link Stream} from an iterable (e.g., array, set, etc.) or a function 
 * that returns an iterator (such as a generator function). Streams created with this 
 * function never modify `input`; if you need the opposite, use {@link streamFromModifiable}.
 * 
 * @typeParam T - The type of the stream's items.
 * 
 * @param input - The source to create the stream from. This can be:
 * 
 * 1) **Iterable.** This includes arrays, sets, or any other iterable, including 
 * user-defined ones, as long as they correctly implement the 
 * [iteration protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols).
 * Example: `stream([1, 2, 3])`.  
 * 
 * If you implement your own iterator, note the following:
 * - [next()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#next)
 * arguments, if any, are not used.
 * - [value](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#value)
 * returned with `{done: true}` is ignored.
 * - [return()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#returnvalue)
 * and [throw()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#throwvalue)
 * methods are not utilized.
 * 
 * 2) **Function returning an iterator.** The most convenient usage is with a 
 * generator function. Example: `stream(function* () { yield 1; yield 2; yield 3; })`.  
 * 
 * If the `input` is both iterable (i.e., has a `[Symbol.iterator]` property) 
 * and a function, it is interpreted as an iterable.
 * 
 * @returns A {@link Stream} created from the provided input.
 */
export function stream<T>(input: Iterable<T> | (() => Iterator<T>)): Stream<T> {
    return Array.isArray(input)
        ? new RandomAccessStream<T>(() => ([
            ix => input[ix],
            input.length,
        ]))
        : new IteratorStream<T>(input)
}

/**
 * Creates a {@link Stream} from an array but, unlike {@link stream}, allows `input`
 * modifications. That's useful for operations like {@link Stream.sortBy} and
 * {@link Stream.shuffle} which otherwise copy input to the new array.
 * @typeParam T Elements type
 * @param input Array allowed for modifications to create stream from
 * @returns A stream created from the provided modifiable array.
 */
export function streamFromModifiable<T>(input: T[]): Stream<T> {
    return new LazyArrayStream(() => input);
}

/**
 * Creates a {@link Stream} from given elements.
 * 
 * Since JavaScript creates the temporary
 * array for rest parameters, which will be disposed afterwards, this function
 * treats this array as modifiable. This means that if you provide an explicit array
 * using [Function.prototype.apply()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply),
 * the behavior will be just like {@link streamFromModifiable}.
 * @typeParam T Elements type
 * @param input Elements to create a stream from
 * @returns A stream created from the provided elements.
 */
export function streamOf<T>(...input: T[]): Stream<T> {
    return new LazyArrayStream(() => input);
}

/**
 * Creates a {@link Stream} of `[key, value]` pairs from the given object. Keys are retrieved with
 * [Object.keys()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys),
 * which means prototype members are not included.
 * @typeParam O Input object type
 * @param object Object to create `[key, value]`-pairs stream from.
 * @returns A stream of `[key, value]` pairs from the provided object.
 */
export function entryStream<O extends {[k: string]: any}>(object: O): Stream<readonly [keyof O, O[keyof O]]> {
    return new RandomAccessStream<readonly [keyof O, O[keyof O]]>(() => {
        const keys = Object.keys(object)
        return [
            ix => [keys[ix], object[keys[ix]]] as const,
            keys.length,
        ]
    })
}

/**
 * Creates a {@link Stream} of ascending numbers starting from `from` and ending 
 * just before `bound`. If `bound` is omitted, the stream will continue indefinitely.
 * @param from The starting value (inclusive).
 * @param bound The end value (exclusive). Defaults to `Number.POSITIVE_INFINITY`, 
 * resulting in an endless stream.
 * @returns A stream of ascending numbers starting from `from` and, if `bound` is 
 * provided, ending just before `bound`.
 */
export function range(from: number, bound: number = Number.POSITIVE_INFINITY): Stream<number> {
    return new RandomAccessStream(() => ([
        ix => from + ix,
        Math.max(0, bound - from),
    ]))
}

/**
 * Creates a {@link Stream} of `'a'`, `'b'`, `'c'`, ..., `'z'` strings.
 * @returns A stream of strings from `'a'` to `'z'`.
 */
export function abc(): Stream<string> {
    return new RandomAccessStream(() => {
        const size = 'z'.charCodeAt(0) + 1 - 'a'.charCodeAt(0);
        return [
            ix => String.fromCharCode('a'.charCodeAt(0) + ix),
            size,
        ]
    })
}

/**
 * Creates an endless {@link Stream} of the provided `value`. One use case is
 * zipping with another stream to remember some state.
 * 
 * ```typescript
 * // Find items inside quotes
 * streamOf('a', '"', 'b', 'c', '"', 'd', '"', 'e', '"', 'f')
 *   .zip(same({inQuotes: false}))
 *   .peek(([c, st]) => {
 *     if (c === '"') st.inQuotes = !st.inQuotes
 *   })
 *   .filter(([c, {inQuotes}]) => c !== '"' && inQuotes)
 *   .map(([c]) => c)  // Unzip state
 *   .toArray()        // => ['b', 'c', 'e']
 * ```
 * @typeParam T Value type
 * @param value An item to repeat endlessly
 * @returns An endless stream of the provided value.
 */
export function same<T>(value: T): Stream<T> {
    return new IteratorStream(function* () {
        for ( ; ; ) yield value
    })
}

/**
 * Creates an endless {@link Stream} of values produced by `getItem`. The function return value
 * is not cached; it's invoked separately to get each item.
 * @typeParam T Items type
 * @param getItem Function that produces items.
 * @returns An endless stream of values produced by `getItem`.
 */
export function continually<T>(getItem: () => T): Stream<T> {
    return new IteratorStream(() => ({
        next: () => ({done: false, value: getItem()}),
    }));
}

/**
 * Creates an {@link Optional} from a given iterable or a function that produces 
 * an iterator. If the iterable (or iterator) is empty, the optional resolves 
 * to empty. Otherwise, the optional resolves to the first item yielded by the 
 * iterator, and all subsequent elements are discarded.
 * 
 * @typeParam T - The type of elements in the optional.
 * 
 * @param input - The source to create the optional from. The `input` is interpreted
 * in the same way as described in the {@link stream} function.
 * 
 * @returns An {@link Optional} containing the first item of the iterable, or 
 * empty if the iterable is empty.
 */
export function optional<T>(input: Iterable<T> | (() => Iterator<T>)): Optional<T> {
    return new SimpleOptional(input);
}

/**
 * Creates an optional that resolves to a value returned by `getInput` if that value is not
 * `null` or `undefined`, or resolves to empty otherwise.
 * @typeParam T Non-nullable input value type
 * @param getInput Function that produces a value or `null` or `undefined`
 * @returns An optional containing the value from `getInput` if it's not `null` or 
 *          `undefined`, otherwise an empty optional.
 */
export function optionalOfNullable<T>(getInput: () => T | null | undefined): Optional<T> {
    return new SimpleOptional<T>(function* () {
        const input = getInput()
        if (input != null) yield(input)
    })
}

// *** Implementation ***

type StreamOrOptional<T, S extends 'Stream' | 'Optional'> = S extends 'Stream' ? Stream<T> : Optional<T>

type Input<T> = Iterable<T> | (() => Iterator<T>)

const getIterator = <T>(input: Input<T>): Iterator<T> =>
    ((input as Iterable<T>)[Symbol.iterator]?.bind(input) ?? input as () => Iterator<T>)()

abstract class Base<
    T,
    S extends 'Stream' | 'Optional',
    NumberOrZero = S extends 'Stream' ? number : 0
> implements Iterable<T> {
    #bindAndCreateStreamOrOptional: <U>(generator: (this: typeof this) => Iterator<U>) => StreamOrOptional<U, S>

    constructor(newStreamOrOptional: <U>(generator: () => Iterator<U>) => StreamOrOptional<U, S>) {
        this.#bindAndCreateStreamOrOptional = generator => newStreamOrOptional(generator.bind(this))
    }

    abstract [Symbol.iterator](): Iterator<T>

    every(predicate: (item: T, index: NumberOrZero) => boolean): boolean {
        let i = 0
        for (const item of this) {
            if (!predicate(item, i++ as NumberOrZero)) return false
        }
        return true
    }

    filter(predicate: (item: T, index: NumberOrZero) => boolean): StreamOrOptional<T, S> {
        return this.#bindAndCreateStreamOrOptional(function* (this: Base<T, S, NumberOrZero>) {
            let i = 0
            for (const item of this) {
                if (predicate(item, i++ as NumberOrZero)) yield item
            }
        })
    }

    flat<D extends number = 1>(depth: D = 1 as D): StreamOrOptional<FlatIterable<T, D>, S> {
        return this.#bindAndCreateStreamOrOptional(function* (this: Base<T, S, NumberOrZero>) {
            for (const item of this) {
                if (depth >= 1 && (item as any)[Symbol.iterator]) {
                    yield* stream(item as Iterable<FlatIterable<T, 1>>).flat(depth - 1) as Iterable<FlatIterable<T, D>>
                } else {
                    yield item as FlatIterable<T, D>
                }
            }
        })
    }

    flatMap<U>(mapper: (item: T, index: NumberOrZero) => Iterable<U>): StreamOrOptional<U, S> {
        return this.#bindAndCreateStreamOrOptional(flatMap.bind<Iterable<T>, [(i: T, index: NumberOrZero) => Iterable<U>], never, Iterator<U>>(this, mapper))
    }

    forEach(effect: (item: T, index: NumberOrZero) => void): void {
        let i = 0
        for (const item of this) {
            effect(item, i++ as NumberOrZero)
        }
    }

    map<U>(mapper: (item: T, index: NumberOrZero) => U): StreamOrOptional<U, S> {
        return this.#bindAndCreateStreamOrOptional(function* (this: Base<T, S, NumberOrZero>) {
            let i = 0
            for (const item of this) {
                yield mapper(item, i++ as NumberOrZero)
            }
        })
    }

    mapNullable<U>(mapper: (item: T, index: NumberOrZero) => (U | null | undefined)): StreamOrOptional<U, S> {
        return (this.map(mapper) as unknown as Base<U | null | undefined, S>).filter(item => item != null) as StreamOrOptional<U, S>
    }

    peek(effect: (item: T, index: NumberOrZero) => void): StreamOrOptional<T, S> {
        return this.map((item, index) => {
            effect(item, index as NumberOrZero)
            return item
        })
    }

    some(predicate: (item: T, index: NumberOrZero) => boolean): boolean {
        let i = 0
        for (const item of this) {
            if (predicate(item, i++ as NumberOrZero)) return true
        }
        return false
    }

    toArray(): T[] {
        return [...this]
    }

    toSet(): Set<T> {
        return new Set(this)
    }
}

class IteratorStream<T> extends Base<T, 'Stream'> implements Stream<T> {
    /**
     * Subclass may pass `undefined` having overridden all usages.
     */
    #input: Iterable<T> | {(): Iterator<T>}

    constructor(input: Iterable<T> | {(): Iterator<T>}) {
        super(newInput => new IteratorStream(newInput))
        this.#input = input
    }

    [Symbol.iterator](): Iterator<T> {
        return getIterator(this.#input)
    }

    at(index: number): Optional<T> {
        return new SimpleOptional(this.slice(index, index === -1 ? undefined : index + 1))
    }

    awaitAll(): Promise<T extends PromiseLike<infer E> ? E[] : T[]> {
        return Promise.all(this) as any;
    }

    butLast(): Stream<T> {
        return this.slice(0, -1)
    }

    concat(...items: T[]): Stream<T> {
        return this.concatAll(items)
    }

    concatAll(items: Iterable<T>): Stream<T> {
        return this.#bindAndCreateIteratorStream(function* () {
            yield* this
            yield* items
        })
    }

    distinctBy(getKey: (item: T, index: number) => any): Stream<T> {
        return this.#bindAndCreateIteratorStream(function* () {
            const keys = new Set<any>()
            let i = 0
            for (const item of this) {
                const k = getKey(item, i++)
                if (!keys.has(k)) {
                    keys.add(k)
                    yield item
                }
            }
        })
    }

    drop(n: number): Stream<T> {
        return this.slice(n)
    }

    dropLast(n: number): Stream<T> {
        if (n < 1) return this
        return this.slice(0, -n)
    }

    dropLastWhile(predicate: (item: T, index: number) => boolean): Stream<T> {
        return this.#dropOrTakeLastWhile(predicate)
    }

    dropWhile(predicate: (item: T, index: number) => boolean): Stream<T> {
        return this.#dropOrTakeWhile(predicate)
    }

    #dropOrTakeLastWhile(predicate: (item: T, index: number) => boolean, take?: boolean): Stream<T> {
        return new LazyArrayStream(() => {
            // findLastIndex() is not yet widely available
            const a = this.toArray()
            for (let i = a.length - 1; i >= 0; i--) {
                if (!predicate(a[i], i))
                    return take ? a.slice(i + 1) : a.slice(0, i + 1)
            }
            return take ? a : []
        })
    }

    #dropOrTakeWhile(predicate: (item: T, index: number) => boolean, take?: boolean): Stream<T> {
        return this.#bindAndCreateIteratorStream(function* () {
            let i = 0
            for (const item of this) {
                if (i === -1) {
                    yield item // after dropped
                } else if (predicate(item, i++)) {
                    if (take) yield item // else drop
                } else {
                    if (take) {
                        break
                    } else {
                        yield item
                        i = -1
                    } 
                }
            }
        })
    }

    equals(other: Iterable<T>): boolean {
        const itr = other[Symbol.iterator]()
        for (const item of this) {
            const {done, value} = itr.next()
            if (done || item !== value) {
                return false
            }
        }
        return !!itr.next().done
    }

    find(predicate: (item: T, index: number) => boolean): Optional<T> {
        return this.#find(predicate)
    }

    findLast(predicate: (item: T, index: number) => boolean): Optional<T> {
        return this.#find(predicate, true)
    }

    #find(predicate: (item: T, index: number) => boolean, last?: boolean): Optional<T> {
        return this._o(() => {
            let i = 0
            let foundItem: T | Empty = empty
            for (const item of this) {
                if (predicate(item, i++)) {
                    foundItem = item
                    if (!last) break
                }
            }
            return foundItem
        })
    }

    forEachUntil(effect: (item: T, index: number) => boolean | undefined | void) {
        let i = 0
        for (const item of this) {
            if (effect(item, i++) === true) return true
        }
        return false
    }

    groupBy<K>(getKey: (item: T, index: number) => K): Stream<[K, T[]]> {
        return new IteratorStream<[K, T[]]>(() => 
            this.groupByToMap(getKey)[Symbol.iterator]()
        )
    }

    groupByToMap<K>(getKey: (item: T, index: number) => K): Map<K, T[]> {
        let i = 0
        const m = new Map<K, T[]>()
        for (const item of this) {
            const key = getKey(item, i++)
            if (m.has(key))
                m.get(key)!.push(item)
            else
                m.set(key, [item])
        }
        return m
    }

    head(): Optional<T> {
        return new SimpleOptional(this)
    }

    join(separator: string | {sep: string, leading?: boolean, trailing?: boolean} | undefined): string {
        const isObj = typeof(separator) === 'object'
        const sep = separator == null ? ','
            : isObj ? separator.sep
            : separator
        const leading = isObj && separator.leading
        const trailing = isObj && separator.trailing

        let result = leading ? sep : ''
        let first = true
        for (const item of this) {
            if (!first) result += sep
            result += String(item)
            first = false
        }
        if (trailing) result += sep
        return result;
    }

    joinBy(getSep: (l: T, r: T, lIndex: number) => string): string {
        let result = '';
        let prev: T | undefined;
        let i = 0
        for (const item of this) {
            if (i > 0) result += getSep(prev as T, item, i - 1)
            result += String(item)
            prev = item
            i++
        }
        return result;
    }

    last(): Optional<T> {
        return this.at(-1);
    }

    randomItem(): Optional<T> {
        return this._o<T>( () => {
            const a = this.toArray()
            return a.length ? a[Math.floor(Math.random() * a.length)] : empty
        })
    }

    reduce<U>(reducer: (acc: U, curr: T, index: number) => U, initial?: U): Optional<U> | U {
        if (arguments.length > 1)
            return reduce(this, reducer, initial!)

        return this._o(() => reduce(this, reducer, empty))
    }

    reduceRight<U>(reducer: (prev: U, curr: T, index: number) => U, initial?: U): Optional<U> | U {
        if (arguments.length > 1) {
            const reversed = this.toArray().reverse()
            return reduce(reversed, reducer, initial!, reversed.length)
        }

        return this._o(() => {
            const reversed = this.toArray().reverse()
            return reduce(reversed, reducer, empty, reversed.length)
        })
    }

    reverse(): Stream<T> {
        return new LazyArrayStream(() => this.toArray().reverse())
    }

    shuffle(): Stream<T> {
        return new LazyArrayStream(() => shuffle(this.toArray()))
    }

    single(): Optional<T> {
        return this._o(() => {
            let foundItem: T | Empty = empty
            for (const item of this) {
                if (!isEmpty(foundItem)) return empty
                foundItem = item
            }
            return foundItem
        })
    }

    size(): number {
        let i = 0
        for (const _ of this) i++
        return i;
    }

    slice(start?: number, end?: number) {
        return this.#bindAndCreateIteratorStream<T>(function* () {
            const posStart = start != null && start >= 0
            const posEnd = end != null && end >= 0
            const negStart = start != null && start < 0
            const negEnd = end != null && end < 0

            // Because we check i against end in the end of loop
            // we need to check that the first iter allowed
            if (posEnd && (end === 0 || posStart && start >= end)) return 

            const buf = negStart ? createRingBuffer<T>(-start)
                : negEnd ? createRingBuffer<T>(-end)
                : undefined
            let i = 0
            for (const item of this) {
                if (negStart) {
                    buf!(item)
                } else if (start == null ||i >= start) {
                    if (negEnd) {
                        const evicted = buf!(item)
                        if (!isEmpty(evicted)) yield evicted
                    } else {
                        yield item
                    }
                }
                ++i
                // To not to consume extra item
                if (!negStart && posEnd && i >= end) break
            }

            if (negStart) {
                const {a, a: {length: l}, p} = buf!
                for (let j = 0; j < l; j++) {
                    const offset = i - l + j
                    if (posEnd && offset >= end || negEnd && offset >= i + end) break
                    yield a[(p + j) % l]
                }
            }
        })
    }

    sort(compareFn?: (a: T, b: T) => number): Stream<T> {
        return new LazyArrayStream(() => this.toArray().sort(compareFn))
    }

    sortBy(getComparable: (item: T) => (number | string | boolean)): Stream<T> {
        return new LazyArrayStream(() => sortBy(this.toArray(), getComparable))
    }

    splitWhen(isSplit: (l: T, r: T, lIndex: number) => boolean): Stream<T[]> {
        return this.#bindAndCreateIteratorStream(function* () {
            let chunk: T[] | undefined = undefined
            let i = 0
            for (const item of this) {
                if (!chunk) {
                    chunk = [item]
                } else if (isSplit(chunk[chunk.length - 1], item, i - 1)) {
                    yield chunk
                    chunk = [item]
                } else {
                    chunk.push(item)
                }
                i++
            }
            if (chunk) yield chunk
        })
    }

    tail(): Stream<T> {
        return this.slice(1)
    }

    take(n: number): Stream<T> {
        return this.slice(0, Math.max(0, n))
    }

    takeLast(n: number): Stream<T> {
        if (n < 1) return new LazyArrayStream<T>(() => [])
        return this.slice(-n)
    }

    takeLastWhile(predicate: (item: T, index: number) => boolean): Stream<T> {
        return this.#dropOrTakeLastWhile(predicate, true)
    }

    takeWhile(predicate: (item: T, index: number) => boolean): Stream<T> {
        return this.#dropOrTakeWhile(predicate, true)
    }

    takeRandom(n: number): Stream<T> {
        return new LazyArrayStream(() => {
            const a = this.toArray()
            const size = Math.max(0, Math.min(n, a.length))
            shuffle(a, size)
            a.length = size
            return a
        })
    }

    toObject(): T extends readonly [string | number | symbol, any] ? { [key in T[0]]: T[1] } : never {
        const obj: any = {};
        for (const item of this) {
            if (Array.isArray(item) && item.length === 2) {
                const [k, v] = item
                const t = typeof k
                if (t === 'string' || t === 'number' || t === 'symbol') {
                    obj[k] = v;
                } else {
                    throw Error('Bad key: ' + k);
                }
            } else {
                throw Error('Not 2-element array: ' + item);
            }
        }
        return obj;
    }

    transform<U>(operator: (input: Iterable<T>) => Iterator<U>): Stream<U> {
        return new IteratorStream<U>(() => operator(this));
    }

    transformToOptional<U>(operator: (input: Iterable<T>) => Iterator<U>): Optional<U> {
        return new SimpleOptional(() => operator(this));
    }

    with(index: number, value: T): Stream<T> {
        return this.map((item, i) => i === index ? value : item)
    }

    zip<U>(other: Iterable<U>): Stream<[T, U]> {
        return this.#zip(other)
    }

    zipStrict<U>(other: Iterable<U>): Stream<[T, U]> {
        return this.#zip(other, true)
    }

    zipWithIndex(): Stream<[T, number]> {
        return this.#zip(range(0))
    }

    zipWithIndexAndLen(): Stream<[T, number, number]> {
        return this.#bindAndCreateIteratorStream(function* () {
            const a = this.toArray()
            let i = 0
            for (const item of a) {
                yield [item, i++, a.length] satisfies [T, number, number]
            }
        })
    }

    #zip<U>(other: Iterable<U>, strict = false): Stream<[T, U]> {
        return this.#bindAndCreateIteratorStream(function* () {
            const it1 = this[Symbol.iterator]()
            const it2 = other[Symbol.iterator]()
            for ( ; ; ) {
                const {done: d1, value: v1} = it1.next()
                const {done: d2, value: v2} = it2.next()
                if (strict) {
                    if (d1 && !d2) throw new Error('Too small this')
                    if (!d1 && d2) throw new Error('Too small other')
                }
                if (d1 || d2) break
                if (!d1 && !d2) yield [v1, v2] satisfies [T, U]
            }
        })
    }

    #bindAndCreateIteratorStream<U>(generator: (this: typeof this) => Iterator<U>): Stream<U> {
        return new IteratorStream(generator.bind(this))
    }

    /**
     * Minifiers cannot mangle a non-private name, so short
     */
    protected _o<U>(getItemOrEmpty: () => Empty | U): Optional<U> {
        return new SimpleOptional(function* () {
            const item = getItemOrEmpty()
            if (!isEmpty(item)) yield item
        })
    }
}

type RandomAccess<T> = [
    getItem: (ix: number) => T,
    size: number,
    array?: unknown, // Placeholder for ArrayAccess
]

class RandomAccessStream<T> extends IteratorStream<T> implements Stream<T> {
    /**
     * Invoking this function creates an object possibly with state, which will remember the input data,
     * if it needs to be created (e.g. shuffled array). Should be invoked once when the operation starts executing.
     */
    #getRandomAccess: () => RandomAccess<T>

    constructor(getRandomAccess: () => RandomAccess<T>) {
        super(undefined as never)
        this.#getRandomAccess = getRandomAccess
    }

    [Symbol.iterator](): Iterator<T> {
        const [getItem, size] = this.#getRandomAccess()
        let ix = 0
        return {
            next() {
                if (ix < size)
                    return {done: false, value: getItem(ix++)}
                else
                    return {done: true, value: undefined}
            }
        }
    }

    at(index: number): Optional<T> {
        return this._o(() => {
            const [getItem, s] = this.#getRandomAccess()
            return -s <= index && index < s
                ? getItem(index < 0 ? s + index : index)
                : empty
        })
    }

    #newRandomAccessStream<U>(createNew: (...args: RandomAccess<T>) => RandomAccess<U>): RandomAccessStream<U> {
        return new RandomAccessStream(() =>
            createNew(...this.#getRandomAccess())
        )
    }

    concatAll(items: Iterable<T>): Stream<T> {
        if (Array.isArray(items) || items instanceof RandomAccessStream) {
            return new RandomAccessStream(() => {
                const [get1, size1] = this.#getRandomAccess()
                const [get2, size2] = Array.isArray(items) ? [(i: number) => items[i] as T, items.length] : items.#getRandomAccess()
                return [
                    i => i >= size1 ? get2(i - size1) as T : get1(i),
                    size1 + size2,
                ]
            })
        }

        return super.concatAll(items)
    }

    map<U>(mapper: (item: T, index: number) => U): Stream<U> {
        return this.#newRandomAccessStream((getItem, size) => [
            ix => mapper(getItem(ix), ix),
            size,
        ])
    }

    randomItem(): Optional<T> {
        return this._o(() => {
            const [getItem, size] = this.#getRandomAccess()
            return size ? getItem(Math.floor(Math.random() * size)) : empty
        })
    }

    reverse(): Stream<T> {
        return this.#newRandomAccessStream((getItem, size) => [
            ix => getItem(size - 1 - ix),
            size,
        ])
    }

    toArray(): T[] {
        const [getItem, length] = this.#getRandomAccess()
        return Array.from({length}, (_, ix) => getItem(ix))
    }

    size(): number {
        return this.#getRandomAccess()[1]
    }

    slice(start?: number, end?: number): Stream<T> {
        return this.#newRandomAccessStream((getItem, size) => {
            const s = between(
                0,
                start == null ? 0
                    : start < 0 ? size + start
                    : start,
                size
            )
            const e = between(
                0,
                end == null ? size
                    : end < 0 ? size + end
                    : end,
                size
            )
            return [
                ix => getItem(s + ix),
                Math.max(0, e - s),
            ]
        })
    }

    zipWithIndex(): Stream<[T, number]> {
        return this.#zipWithIndex()
    }

    zipWithIndexAndLen(): Stream<[T, number, number]> {
        return this.#zipWithIndex(true)
    }

    #zipWithIndex<AndLen extends boolean = false>(andLen?: AndLen): Stream<AndLen extends true ? [T, number, number] : [T, number]> {
        return this.#newRandomAccessStream((getItem, size) => [
            ix => (andLen ? [getItem(ix), ix, size]: [getItem(ix), ix]) as AndLen extends true ? [T, number, number] : [T, number],
            size,
        ])
    }
}

type ArrayAccess<T> = [RandomAccess<T>[0], RandomAccess<T>[1], array: T[]]

class LazyArrayStream<T> extends RandomAccessStream<T> implements Stream<T> {
    #getArrayAccess: () => ArrayAccess<T>

    constructor(getArray: () => T[]) {
        const getArrayAccess = () => {
            const a = getArray()
            return [
                ix => a[ix],
                a.length,
                a,
            ] satisfies ArrayAccess<T>
        }
        super(getArrayAccess)
        this.#getArrayAccess = getArrayAccess
    }

    [Symbol.iterator](): Iterator<T> {
        return this.#getArrayAccess()[2][Symbol.iterator]()
    }

    toArray(): T[] {
        return this.#getArrayAccess()[2]
    }
}

class SimpleOptional<T> extends Base<T, 'Optional'> implements Optional<T> {
    /**
     * Can yield multiple items, use only first
     */
    #input: Input<T>

    constructor(input: Input<T>) {
        super(newInput => new SimpleOptional(newInput))
        this.#input = input
    }

    [Symbol.iterator](): Iterator<T> {
        let n = getIterator(this.#input).next()

        return {
            next() {
                const m = n
                n = {done: true, value: undefined}
                return m as IteratorResult<T>
            }
        }
    }

    flatMapToStream<U>(mapper: (item: T, index: 0) => Iterable<U>): Stream<U> {
        return new IteratorStream(flatMap.bind<Iterable<T>, [(i: T, index: 0) => Iterable<U>], never, Iterator<U>>(this, mapper))
    }

    get(): T {
        return this.orElseThrow(() => new Error('No value'))
    }

    is(item: T): boolean {
        return this.#get() === item
    }

    isPresent(): boolean {
        return !isEmpty(this.#get())
    }

    orElse<U>(other: U): T | U {
        const i = this.#get()
        return isEmpty(i) ? other : i
    }

    orElseGet<U>(get: () => U): T | U {
        const i = this.#get()
        return isEmpty(i) ? get() : i
    }

    orElseThrow(createError: () => Error): T {
        const i = this.#get()
        if (isEmpty(i)) throw createError()
        return i
    }

    orNull(): T | null {
        return this.orElse(null)
    }

    orUndefined(): T | undefined {
        return this.orElse(undefined)
    }

    resolve(): {has: true; val: T} | {has: false, val?: undefined} {
        const val = this.#get()
        return isEmpty(val) ? {has: false} : {has: true, val};
    }

    #get(): T | Empty {
        const {done, value} = getIterator(this.#input).next()
        return done ? empty : value
    }

    toStream(): Stream<T> {
        return new IteratorStream(this)
    }
}

function between(min: number, n: number, max: number) {
    return Math.max(min, Math.min(n, max))
}

type RingBuffer<T> = {
    // Bundlers cannot minimize this, doing manually
    a: T[],
    p: number,
    (newItem: T): Empty | T,
}

/**
 * @param size Must be > 0
 */
function createRingBuffer<T>(size: number): RingBuffer<T> {
    const buf: RingBuffer<T> = ((newItem: T) => {
        let {a, p} = buf
        if (a.length < size) {
            a.push(newItem)
            return empty
        }

        const evicted = a[p]
        a[p] = newItem
        buf.p = ++p >= size ? 0 : p
        return evicted
    }) as RingBuffer<T>
    buf.a = []
    buf.p = 0
    return buf
}

function* flatMap<T, U>(this: Iterable<T>, mapper: (item: T, index: number) => Iterable<U>) {
    let i = 0
    for (const item of this) {
        yield* mapper(item, i++)
    }
}

function reduce<
    T,
    Initial,
    U = Initial extends Empty ? T : Initial,
>(
    itr: Iterable<T>,
    reducer: (accumulator: U, currentItem: T, currentIndex: number) => U,
    initial: Initial,
    lengthIfReduceRight?: number,
): Initial | U {
    let acc: Initial | U = initial
    let i = isEmpty(initial) ? 1 : 0
    for (const item of itr) {
        if (isEmpty(acc))
            // No initial, U = T
            acc = item as undefined as U
        else
            acc = reducer(
                acc as U,
                item,
                lengthIfReduceRight != null ? lengthIfReduceRight - 1 - (i++) : i++
            )
    }
    return acc
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

type Empty = {_brand?: never}
const empty: Empty = {}
function isEmpty(a: unknown): a is Empty {
    return a === empty
}
