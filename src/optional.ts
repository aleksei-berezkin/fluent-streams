import { Stream } from './stream';

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
