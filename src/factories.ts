import { Stream } from './stream';
import { Optional } from './optional';
import { StreamImpl } from './impl/streamImpl';
import { OptionalImpl } from './impl/optionalImpl';
import { trimIterable } from './impl/util';

export function stream<T>(input: Iterable<T>): Stream<T> {
    return new StreamImpl(input, i => i);
}

export function streamOf<T>(...input: T[]): Stream<T> {
    return new StreamImpl(input, i => i);
}

export function entryStream<O extends {[k: string]: any}>(obj: O): Stream<readonly [keyof O, O[keyof O]]> {
    return new StreamImpl<
            readonly [keyof O, O[keyof O]],
            readonly [keyof O, O[keyof O]]>
    ({
        [Symbol.iterator]() {
            return function* () {
                for (const k of Object.keys(obj)) {
                    yield [k, obj[k]] as const;
                }
            }();
        }
    }, i => i);
}

export function range(from: number, bound: number): Stream<number> {
    return new StreamImpl({
        [Symbol.iterator]() {
            return function* () {
                for (let i = from; i < bound; i++) {
                    yield i;
                }
            }();
        }
    }, i => i);
}

export function abc(): Stream<string> {
    return new StreamImpl({
        [Symbol.iterator]() {
            return function* () {
                let i = 'a'.charCodeAt(0);
                for ( ; ; ) {
                    const s = String.fromCharCode(i++);
                    yield s;
                    if (s === 'z') {
                        break;
                    }
                }
            }();
        }
    }, i => i);
}

export function same<T>(item: T): Stream<T> {
    return new StreamImpl({
        [Symbol.iterator]() {
            return function* () {
                for ( ; ; ) {
                    yield item;
                }
            }();
        }
    }, i => i);
}

export function continually<T>(getItem: () => T): Stream<T> {
    return new StreamImpl({
        [Symbol.iterator]() {
            return function* () {
                for ( ; ; ) {
                    yield getItem();
                }
            }();
        }
    }, i => i);
}

export function optional<T>(input: Iterable<T>): Optional<T> {
    return new OptionalImpl({
        [Symbol.iterator]() {
            return trimIterable(input)[Symbol.iterator]();
        }
    }, i => i);
}

export function optionalOfNullable<T>(input: () => T | null | undefined): Optional<T> {
    return new OptionalImpl({
        [Symbol.iterator]() {
            return function* () {
                const i = input();
                if (i != null) {
                    yield i;
                }
            }();
        }
    }, i => i);
}
