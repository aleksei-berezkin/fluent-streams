import { Stream } from './stream';
import { Optional } from './optional';
import { ArrayStream, InputArrayStream, IteratorStream, RandomAccessStream, SimpleOptional } from './impl/streamImpl';

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
        ? new InputArrayStream(input as T[])
        : new IteratorStream(() => input[Symbol.iterator]());
}

/**
 * Creates a stream from an array but, unlike {@link stream}, allows `input` modifications. That's useful for operations
 * like {@link Stream.sortBy} and {@link Stream.shuffle} which otherwise copy input to the new array.
 * @typeParam T Elements type
 * @param input array allowed for modifications to create stream from
 */
export function streamFromModifiable<T>(input: T[]): Stream<T> {
    return new ArrayStream(input);
}

/**
 * Creates a stream from given elements. If you provide input as an array using
 * [Function.prototype.apply()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply),
 * such an array is treated as modifiable, just like in {@link streamFromModifiable}.
 * @typeParam T Elements type
 * @param input Elements to create a stream from
 */
export function streamOf<T>(...input: T[]): Stream<T> {
    return new ArrayStream(input);
}

/**
 * Creates a steam of `[key, value]` pairs from given object. Keys are retrieved with
 * [Object.keys()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys),
 * which means prototype members are not included.
 * @typeParam O Input object type
 * @param object Object to create `[key, value]`-pairs stream from.
 */
export function entryStream<O extends {[k: string]: any}>(object: O): Stream<readonly [keyof O, O[keyof O]]> {
    let _keys: string[] | undefined;
    const keys = () => _keys || (_keys = Object.keys(object));
    return new RandomAccessStream<readonly [keyof O, O[keyof O]]>(
        i => [keys()[i], object[keys()[i]]] as const,
        () => keys().length,
    );
}

/**
 * Creates a stream of ascending numbers starting with `from` up to `bound` exclusively.
 * @param from Start value inclusively
 * @param bound End value exclusively
 */
export function range(from: number, bound: number): Stream<number> {
    return new RandomAccessStream(
        i => from + i,
        () => Math.max(0, bound - from),
    );
}

/**
 * Creates a stream of `'a'`, `'b'`, `'c'`, ..., `'z'` strings.
 */
export function abc(): Stream<string> {
    const size = 'z'.charCodeAt(0) + 1 - 'a'.charCodeAt(0);
    return new RandomAccessStream(
        i => String.fromCharCode('a'.charCodeAt(0) + i),
        () => size,
    );
}

/**
 * Creates an endless stream of `value`
 * @typeParam T Value type
 * @param value An item to repeat endlessly
 */
export function same<T>(value: T): Stream<T> {
    return new IteratorStream(() => ({
        next: () => ({done: false, value}),
    }));
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
    return new SimpleOptional(() => input[Symbol.iterator]().next());
}

/**
 * Creates an optional which resolves to a value returned by `getInput` if that value is not `null` or `undefined`,
 * or which resolves to empty otherwise.
 * @typeParam T Non-nullable input value type
 * @param getInput Function which produces value or `null` or `undefined`
 */
export function optionalOfNullable<T>(getInput: () => T | null | undefined): Optional<T> {
    return new SimpleOptional<T>(() => {
        const input = getInput();
        if (input != null) return {done: false, value: input};
        return {done: true, value: undefined};
    });
}
