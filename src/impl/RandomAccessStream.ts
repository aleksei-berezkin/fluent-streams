import { RandomAccessIterator } from './RandomAccessIterator';
import { Stream } from '../stream';
import { Optional } from '../optional';
import { RandomAccessFlatMapIterator } from './RandomAccessFlatMapIterator';
import { Impl } from './impl';
import { _extends } from './_extends';
// @ts-ignore
// noinspection JSUnusedLocalSymbols
const __extends = _extends;

export const makeRandomAccessStream = (impl: Impl) => class RandomAccessStream<T> extends impl.AbstractStream<T> implements Stream<T> {
    constructor(readonly get: (i: number) => T, readonly size: () => number) {
        super();
    }

    [Symbol.iterator](): Iterator<T> {
        return new RandomAccessIterator(this.get, this.size());
    }

    append(item: T): Stream<T> {
        return new RandomAccessStream(
            i => i === this.size() ? item : this.get(i),
            () => this.size() + 1,
        );
    }

    at(index: number): Optional<T> {
        return new impl.SimpleOptional<T>(() => {
            if (0 <= index && index < this.size()) {
                return {done: false, value: this.get(index)};
            }
            return {done: true, value: undefined};
        });
    }

    butLast(): Stream<T> {
        return new RandomAccessStream(this.get, () => Math.max(this.size() - 1, 0));
    }

    filter(predicate: (item: T) => boolean): Stream<T> {
        return new impl.IteratorStream(() => {
            const get = this.get;
            const size = this.size();
            let pos = 0;
            return {
                next(): IteratorResult<T> {
                    for ( ; ; ) {
                        if (pos === size) return {done: true, value: undefined};
                        const value = get(pos++);
                        if (predicate(value)) return {done: false, value};
                    }
                }
            };
        });
    }

    find(predicate: (item: T) => boolean): Optional<T> {
        return new impl.SimpleOptional<T>(() => {
            for (let i = 0; i < this.size(); i++) {
                const value = this.get(i);
                if (predicate(value)) return {done: false, value};
            }
            return {done: true, value: undefined};
        });
    }

    flatMap<U>(mapper: (item: T) => Iterable<U>): Stream<U> {
        return new impl.IteratorStream(() => {
            return new RandomAccessFlatMapIterator(
                (i: number) => mapper(this.get(i)),
                this.size(),
            );
        });
    }

    forEach(effect: (i: T) => void) {
        for (let i = 0; i < this.size(); i++) {
            effect(this.get(i));
        }
    }

    last(): Optional<T> {
        return new impl.SimpleOptional<T>(() => {
            if (this.size() > 0) return {done: false, value: this.get(this.size() - 1)};
            return {done: true, value: undefined};
        });
    }

    peek(effect: (item: T) => void): Stream<T> {
        return new RandomAccessStream(
            i => {
                const item = this.get(i);
                effect(item);
                return item;
            },
            this.size,
        );
    }

    reverse(): Stream<T> {
        return new RandomAccessStream(
            i => this.get(this.size() - 1 - i),
            this.size,
        );
    }

    single(): Optional<T> {
        return new impl.SimpleOptional<T>(() => {
            if (this.size() === 1) return {done: false, value: this.get(0)};
            return {done: true, value: undefined};
        });
    }

    tail(): Stream<T> {
        return new RandomAccessStream<T>(
            i => this.get(i + 1),
            () => Math.max(0, this.size() - 1),
        );
    }

    take(n: number): Stream<T> {
        return new RandomAccessStream(
            this.get,
            () => Math.max(0, Math.min(n, this.size())),
        );
    }

    takeLast(n: number): Stream<T> {
        return new RandomAccessStream(
            i => this.get(Math.max(0, this.size() - n) + i),
            () => Math.max(0, Math.min(n, this.size())),
        );
    }

    map<U>(mapper: (item: T) => U): Stream<U> {
        return new RandomAccessStream(
            i => mapper(this.get(i)),
            this.size,
        );
    }

    randomItem(): Optional<T> {
        return new impl.SimpleOptional<T>(() => {
            const size = this.size();
            return size
                ? {done: false, value: this.get(Math.floor(Math.random() * size))}
                : {done: true, value: undefined};
        });
    }

    reduce(reducer: (l: T, r: T) => T): Optional<T> {
        return new impl.SimpleOptional<T>(() => {
            const size = this.size();
            if (!size) return {done: true, value: undefined};

            let value: T = this.get(0);
            for (let i = 1; i < size; i++) {
                value = reducer(value, this.get(i));
            }
            return {done: false, value};
        });
    }

    reduceLeft<U>(zero: U, reducer: (l: U, r: T) => U): U {
        let current = zero;
        for (let i = 0; i < this.size(); i++) {
            current = reducer(current, this.get(i));
        }
        return current;
    }

    reduceRight<U>(zero: U, reducer: (l: T, r: U) => U): U {
        let current = zero;
        for (let i = this.size() - 1; i >= 0; i--) {
            current = reducer(this.get(i), current);
        }
        return current;
    }
}
