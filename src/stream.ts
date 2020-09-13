import { Optional } from './optional';

/**
 * A stream is a thin wrapper over iterable, providing intermediate and terminal operations to manipulate data.
 * 
 * Stream can be understood as a function over an iterable. Intermediate operations return new functions containing
 * current stream as an input; terminal operations evaluate function and return data.
 * 
 * Streams are stateless: they don't store anything except reference to an input. This means streams may be iterated
 * multiple times, and each time the stream is evaluated against input as it was on the moment of invoking terminal
 * operation.
 * 
 * @typeParam T Input elements type
 */
export interface Stream<T> extends Iterable<T> {
    /**
     * Returns `true` if `predicate` returns `true` for all items; false otherwise. This is short-circuit operation
     * which means it skips the rest items if some item produced `false`.
     * @param predicate A function to evaluate each element
     */
    all(predicate: (item: T) => boolean): boolean;

    /**
     * Returns `true` if `predicate` returns `true` for any element; false otherwise. This is short-circuit operation
     * which means it skips the rest items if some item produced `true`.
     * @param predicate A function to evaluate each element
     */
    any(predicate: (item: T) => boolean): boolean;

    /**
     * Returns optional which resolves to an element of this stream at `index` position if there is such a position.
     * @param index Zero-based position to return element at
     */
    at(index: number): Optional<T>;

    awaitAll(): Promise<T extends PromiseLike<infer E> ? E[] : T[]>;

    /**
     * Creates new stream whose items are all items of this stream followed by provided `item`. 
     * @param item Item to append
     */
    append(item: T): Stream<T>;

    appendIf(condition: boolean, item: T): Stream<T>;

    /**
     * Creates a stream whose items are all items of this stream followed by all items provided by `items` iterable.  
     * @param items Items to append to this stream
     */
    appendAll(items: Iterable<T>): Stream<T>;

    appendAllIf(condition: boolean, items: Iterable<T>): Stream<T>;

    /**
     * Creates a stream containing all but last items of this stream. The result stream is empty if
     * this stream is empty or contains one item.
     */
    butLast(): Stream<T>;

    distinctBy(getKey: (item: T) => any): Stream<T>;

    equals(other: Iterable<T>): boolean,

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
     *     .filterWithAssertion(function(item): item is string { return typeof item === 'string' })
     *     .toArray()   // => ['a', 'b']: string[]
     * ```
     * 
     * Makes sense only for TypeScript code; for JavaScript works exactly the same way as {@link filter}.
     * @param assertion The assertion to test items
     */
    filterWithAssertion<U extends T>(assertion: (item: T) => item is U): Stream<U>;

    find(predicate: (item: T) => boolean): Optional<T>;

    flatMap<U>(mapper: (item: T) => Iterable<U>): Stream<U>;

    forEach(effect: (item: T) => void): void;

    groupBy<K>(getKey: (item: T) => K): Stream<readonly [K, T[]]>;

    head(): Optional<T>;

    join(delimiter: string): string;

    joinBy(getDelimiter: (l: T, r: T) => string): string;

    last(): Optional<T>;

    map<U>(mapper: (item: T) => U): Stream<U>;

    randomItem(): Optional<T>

    reduce(reducer: (l: T, r: T) => T): Optional<T>;

    reduceLeft<U>(zero: U, reducer: (l: U, r: T) => U): U;

    reduceRight<U>(zero: U, reducer: (l: T, r: U) => U): U;

    /**
     * Creates a stream whose elements are elements of this stream with random order.
     */
    shuffle(): Stream<T>;

    /**
     * Returns an optional which resolves to an item if this stream contains only one item. Otherwise resolves to empty.
     */
    single(): Optional<T>;

    size(): number;

    /**
     * Creates a stream with items of this stream ordered by value retrieved by `getComparable`.
     * @param getComparable A function which, given an item, returns comparable value. Returned value of the function
     * is not cached, so it's recommended to not contain any heavy evaluations.
     */
    sortBy(getComparable: (item: T) => number | string | boolean): Stream<T>

    splitWhen(isSplit: (l: T, r: T) => boolean): Stream<T[]>;

    tail(): Stream<T>;

    take(n: number): Stream<T>;

    takeLast(n: number): Stream<T>;

    takeRandom(n: number): Stream<T>;

    toArray(): T[];

    toObject(): T extends readonly [string | number | symbol, any] ? { [key in T[0]]: T[1] } : unknown;

    transform<U>(operator: (input: Iterable<T>) => Iterator<U>): Stream<U>;

    transformToOptional<U>(operator: (input: Iterable<T>) => Iterator<U>): Optional<U>;

    zip<U>(other: Iterable<U>): Stream<readonly [T, U]>;

    zipStrict<U>(other: Iterable<U>): Stream<readonly [T, U]>

    zipWithIndex(): Stream<readonly [T, number]>;

    zipWithIndexAndLen(): Stream<readonly [T, number, number]>;
}
