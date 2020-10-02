import { Optional } from '../optional';
import { Stream } from '../stream';
import { RandomAccessIterator } from './RandomAccessIterator';
import { Impl } from './impl';

export default (impl: Impl) => class SimpleOptional<T> implements Optional<T> {
    constructor(private readonly getResult: () => IteratorResult<T>) {
    }

    [Symbol.iterator](): Iterator<T> {
        let r = this.getResult();
        return {
            next(): IteratorResult<T> {
                if (r.done) return r;

                let _r = r;
                r = {done: true, value: undefined};
                return _r;
            }
        };
    }

    filter(predicate: (item: T) => boolean): Optional<T> {
        return new SimpleOptional(() => {
            const r = this.getResult();
            return !r.done && predicate(r.value) ? r : {done: true, value: undefined};
        });
    }

    flatMap<U>(mapper: (item: T) => Iterable<U>): Optional<U> {
        return new SimpleOptional(() => {
            const r = this.getResult();
            if (r.done) return r;
            return mapper(r.value)[Symbol.iterator]().next();
        });
    }

    flatMapToStream<U>(mapper: (item: T) => Iterable<U>): Stream<U> {
        return new impl.IteratorStream(() => {
            const r = this.getResult();
            if (r.done) return new RandomAccessIterator({get: undefined as any, length: 0});
            return mapper(r.value)[Symbol.iterator]();
        });
    }

    get(): T {
        const r = this.getResult();
        if (r.done) {
            throw new Error('No value');
        }
        return r.value;
    }

    has(predicate: (item: T) => boolean): boolean {
        const r = this.getResult();
        return !r.done && predicate(r.value);
    }

    hasNot(predicate: (item: T) => boolean): boolean {
        const r = this.getResult();
        return r.done || !predicate(r.value);
    }

    is(item: T): boolean {
        const r = this.getResult();
        return !r.done && r.value === item;
    }

    isPresent(): boolean {
        return !this.getResult().done;
    }

    map<U>(mapper: (item: T) => U): Optional<U> {
        return new SimpleOptional(() => {
            const r = this.getResult();
            if (r.done) return r;
            return {done: false, value: mapper(r.value)};
        });
    }

    mapNullable<U>(mapper: (item: T) => (U | null | undefined)): Optional<U> {
        return new SimpleOptional<U>(() => {
            const r = this.getResult();
            if (r.done) return r;
            const value = mapper(r.value);
            if (value != null) return {done: false, value};
            return {done: true, value: undefined};
        });
    }

    orElse<U>(other: U): T | U {
        const r = this.getResult();
        return !r.done ? r.value : other;
    }

    orElseGet<U>(get: () => U): T | U {
        const r = this.getResult();
        return !r.done ? r.value : get();
    }

    orElseNull(): T | null {
        const r = this.getResult();
        return !r.done ? r.value : null;
    }

    orElseThrow(createError: () => Error): T {
        const r = this.getResult();
        if (r.done) {
            throw createError();
        }
        return r.value;
    }

    orElseUndefined(): T | undefined {
        const r = this.getResult();
        if (r.done) {
            return undefined;
        }
        return r.value;
    }

    resolve(): {has: true; val: T} | {has: false} {
        const r = this.getResult();
        return r.done ? {has: false} : {has: true, val: r.value};
    }

    toArray(): T[] {
        const r = this.getResult();
        return r.done ? [] : [r.value];
    }

    toStream(): Stream<T> {
        return new impl.IteratorStream(() => {
            let r = this.getResult();
            return {
                next(): IteratorResult<T> {
                    if (r.done) return r;
                    const _r = r;
                    r = {done: true, value: undefined};
                    return _r;
                }
            };
        });
    }
}
