import { RandomAccessSpec } from './RandomAccessSpec';
import { RandomAccessIterator } from './RandomAccessIterator';
import { Stream } from '../stream';
import { Optional } from '../optional';
import { RandomAccessFlatMapIterator } from './RandomAccessFlatMapIterator';
import { Impl } from './impl';

export default (impl: Impl) => class RandomAccessStream<T> extends impl.AbstractStream<T> implements Stream<T> {
    constructor(private readonly spec: () => RandomAccessSpec<T>) {
        super();
    }

    [Symbol.iterator](): Iterator<T> {
        return new RandomAccessIterator(this.spec());
    }

    append(item: T): Stream<T> {
        return new RandomAccessStream(() => {
            const {get, length} = this.spec();
            return {
                get: i => i === length ? item : get(i),
                length: length + 1,
            };
        });
    }

    at(index: number): Optional<T> {
        return new impl.SimpleOptional<T>(() => {
            const {get, length} = this.spec();
            if (0 <= index && index < length) {
                return {done: false, value: get(index)};
            }
            return {done: true, value: undefined};
        });
    }

    butLast(): Stream<T> {
        return new RandomAccessStream(() => {
            const {get, length} = this.spec();
            return {
                get,
                length: Math.max(length - 1, 0),
            };
        });
    }

    filter(predicate: (item: T) => boolean): Stream<T> {
        return new impl.IteratorStream(() => {
            const {get, length} = this.spec();
            let pos = 0;
            return {
                next(): IteratorResult<T> {
                    for (; ;) {
                        if (pos === length) return {done: true, value: undefined};
                        const value = get(pos++);
                        if (predicate(value)) return {done: false, value};
                    }
                }
            };
        });
    }

    find(predicate: (item: T) => boolean): Optional<T> {
        return new impl.SimpleOptional<T>(() => {
            const {get, length} = this.spec();
            for (let i = 0; i < length; i++) {
                const value = get(i);
                if (predicate(value)) return {done: false, value};
            }
            return {done: true, value: undefined};
        });
    }

    flatMap<U>(mapper: (item: T) => Iterable<U>): Stream<U> {
        return new impl.IteratorStream(() => {
            const {get, length} = this.spec();
            return new RandomAccessFlatMapIterator({
                get: (i: number) => mapper(get(i)),
                length,
            });
        });
    }

    forEach(effect: (i: T) => void) {
        const {get, length} = this.spec();
        for (let i = 0; i < length; i++) {
            effect(get(i));
        }
    }

    last(): Optional<T> {
        return new impl.SimpleOptional<T>(() => {
            const {get, length} = this.spec();
            if (length > 0) return {done: false, value: get(length - 1)};
            return {done: true, value: undefined};
        });
    }

    reverse(): Stream<T> {
        return new RandomAccessStream(() => {
            const {get, length} = this.spec();
            return {
                get: i => get(length - 1 - i),
                length,
            };
        });
    }

    single(): Optional<T> {
        return new impl.SimpleOptional<T>(() => {
            const {get, length} = this.spec();
            if (length === 1) return {done: false, value: get(0)};
            return {done: true, value: undefined};
        });
    }

    size(): number {
        return this.spec().length;
    }

    tail(): Stream<T> {
        return new RandomAccessStream<T>(() => {
            const {get, length} = this.spec();
            return {
                get: i => get(i + 1),
                length: Math.max(0, length - 1),
            };
        });
    }

    take(n: number): Stream<T> {
        return new RandomAccessStream(() => {
            const {get, length} = this.spec();
            return {
                get,
                length: Math.max(0, Math.min(n, length)),
            };
        });
    }

    takeLast(n: number): Stream<T> {
        return new RandomAccessStream(() => {
            const {get, length} = this.spec();
            const actualN = Math.min(n, length);
            return {
                get: i => get(i + (length - actualN)),
                length: Math.max(0, Math.min(actualN, length)),
            };
        });
    }

    map<U>(mapper: (item: T) => U): Stream<U> {
        return new RandomAccessStream(() => {
            const {get, length} = this.spec();
            return {
                get: i => mapper(get(i)),
                length,
            };
        });
    }

    randomItem(): Optional<T> {
        return new impl.SimpleOptional<T>(() => {
            const {get, length} = this.spec();
            return length
                ? {done: false, value: get(Math.floor(Math.random() * length))}
                : {done: true, value: undefined};
        });
    }

    reduce(reducer: (l: T, r: T) => T): Optional<T> {
        return new impl.SimpleOptional<T>(() => {
            const {get, length} = this.spec();
            if (!length) return {done: true, value: undefined};

            let value: T = get(0);
            for (let i = 1; i < length; i++) {
                value = reducer(value, get(i));
            }
            return {done: false, value};
        });
    }

    reduceLeft<U>(zero: U, reducer: (l: U, r: T) => U): U {
        const {get, length} = this.spec();
        let current = zero;
        for (let i = 0; i < length; i++) {
            current = reducer(current, get(i));
        }
        return current;
    }

    reduceRight<U>(zero: U, reducer: (l: T, r: U) => U): U {
        const {get, length} = this.spec();
        let current = zero;
        for (let i = length - 1; i >= 0; i--) {
            current = reducer(get(i), current);
        }
        return current;
    }
}
