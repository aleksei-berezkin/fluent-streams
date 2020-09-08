import { Stream } from './stream';
import { Optional } from './optional';
import {
    ArrayStream,
    InputArrayStream,
    IteratorStream,
    RandomAccessStream,
    SimpleOptional
} from './impl/optimized/Stream2';

export function stream<T>(input: Iterable<T>): Stream<T> {
    return Array.isArray(input)
        ? new InputArrayStream(input as T[])
        : new IteratorStream(() => input[Symbol.iterator]());
}

export function streamFromModifiable<T>(input: T[]): Stream<T> {
    return new ArrayStream(input);
}

export function streamOf<T>(...input: T[]): Stream<T> {
    return new ArrayStream(input);
}

export function entryStream<O extends {[k: string]: any}>(obj: O): Stream<readonly [keyof O, O[keyof O]]> {
    return new RandomAccessStream<readonly [keyof O, O[keyof O]]>(() => {
        const keys = Object.keys(obj);
        return {
            get: i => [keys[i], obj[keys[i]]] as const,
            length: keys.length,
        }
    });
}

export function range(from: number, bound: number): Stream<number> {
    return new RandomAccessStream(() => ({
        get: i => from + i,
        length: Math.max(0, bound - from),
    }));
}

export function abc(): Stream<string> {
    return new RandomAccessStream(() => ({
        get: i => String.fromCharCode('a'.charCodeAt(0) + i),
        length: 'z'.charCodeAt(0) + 1 - 'a'.charCodeAt(0),
    }));
}

export function same<T>(value: T): Stream<T> {
    return new IteratorStream(() => ({
        next: () => ({done: false, value}),
    }));
}

export function continually<T>(getItem: () => T): Stream<T> {
    return new IteratorStream(() => ({
        next: () => ({done: false, value: getItem()}),
    }));
}

export function optional<T>(input: Iterable<T>): Optional<T> {
    return new SimpleOptional(() => input[Symbol.iterator]().next());
}

export function optionalOfNullable<T>(getInput: () => T | null | undefined): Optional<T> {
    return new SimpleOptional<T>(() => {
        const input = getInput();
        if (input != null) return {done: false, value: input};
        return {done: true, value: undefined};
    });
}
