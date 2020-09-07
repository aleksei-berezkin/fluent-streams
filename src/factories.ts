import { Stream } from './stream';
import { Optional } from './optional';
import { StreamImpl } from './impl/streamImpl';
import { OptionalImpl } from './impl/optionalImpl';
import { InputArrayStream, IteratorStream, SimpleOptional } from './impl/optimized/Stream2';

export function stream<T>(input: Iterable<T>): Stream<T> {
    return new StreamImpl<never, T>(undefined, function* () {
        if (Array.isArray(input)) {
            return {
                array: input,
                canModify: false
            };
        } else {
            yield* input;
        }
    });
}

export function stream2<T>(input: Iterable<T>): Stream<T> {
    return Array.isArray(input)
        ? new InputArrayStream(input as T[])
        : new IteratorStream(() => input[Symbol.iterator]());
}

export function streamFromModifiable<T>(input: T[]): Stream<T> {
    return new StreamImpl<never, T>(undefined, function* () {
        return {
            array: input,
            canModify: true,
        }
    });
}

export function streamOf<T>(...input: T[]): Stream<T> {
    return new StreamImpl<never, T>(undefined, function* () {
        return {
            array: input,
            canModify: true,
        }
    });
}

export function entryStream<O extends {[k: string]: any}>(obj: O): Stream<readonly [keyof O, O[keyof O]]> {
    return new StreamImpl<never, readonly [keyof O, O[keyof O]]>(undefined, function* () {
        for (const k of Object.keys(obj)) {
            yield [k, obj[k]] as const;
        }
    });
}

export function range(from: number, bound: number): Stream<number> {
    return new StreamImpl<never, number>(undefined, function* () {
        for (let i = from; i < bound; i++) {
            yield i;
        }
    });
}

export function abc(): Stream<string> {
    return new StreamImpl(undefined, function* () {
        let i = 'a'.charCodeAt(0);
        for ( ; ; ) {
            const s = String.fromCharCode(i++);
            yield s;
            if (s === 'z') {
                break;
            }
        }
    });
}

export function same<T>(item: T): Stream<T> {
    return new StreamImpl(undefined, function* () {
        for ( ; ; ) {
            yield item;
        }
    });
}

export function continually<T>(getItem: () => T): Stream<T> {
    return new StreamImpl(undefined, function* () {
        for ( ; ; ) {
            yield getItem();
        }
    });
}

export function optional<T>(input: Iterable<T>): Optional<T> {
    return new OptionalImpl(undefined, function* () {
        const n = input[Symbol.iterator]().next();
        if (!n.done) {
            yield n.value;
        }
    });
}

export function optional2<T>(input: Iterable<T>): Optional<T> {
    return new SimpleOptional(() => input[Symbol.iterator]().next());
}

export function optionalOfNullable<T>(input: () => T | null | undefined): Optional<T> {
    return new OptionalImpl(undefined, function* () {
        const n = input();
        if (n != null) {
            yield n;
        }
    });
}
