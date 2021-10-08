import { Stream } from '../stream';
import { Optional } from '../optional';
import { FlatMapIterator } from './FlatMapIterator';
import { collectToMap } from './collectToMap';
import { MapIterator } from './MapIterator';
import { RingBuffer } from './RingBuffer';
import { shuffle } from './shuffle';
import { delegateStream } from './delegate';
import { RandomAccessIterator } from './RandomAccessIterator';
import { RandomAccessFlatMapIterator } from './RandomAccessFlatMapIterator';

abstract class AbstractStream<T> implements Stream<T> {
    abstract [Symbol.iterator](): Iterator<T>;

    append(item: T): Stream<T> {
        return new IteratorStream(() => {
            const inner = this[Symbol.iterator]();
            let fullDone = false;
            return {
                next(): IteratorResult<T> {
                    const n = inner.next();
                    if (!n.done) return n;
                    if (!fullDone) {
                        fullDone = true;
                        return {done: false, value: item};
                    }
                    return {done: true, value: undefined};
                }
            };
        });
    }

    appendAll(items: Iterable<T>): Stream<T> {
        return new IteratorStream(() => {
            const left = this[Symbol.iterator]();
            let right: Iterator<T> | undefined = undefined;
            return {
                next(): IteratorResult<T> {
                    const l = left.next();
                    if (!l.done) return l;
                    if (!right) {
                        right = items[Symbol.iterator]();
                        if (right == null) {
                            throw new Error('Null iterator');
                        }
                    }
                    return right.next();
                }
            };
        });
    }

    at(index: number): Optional<T> {
        return new SimpleOptional<T>(() => {
            let pos = 0;
            let value: T = undefined as any;
            const found = this.forEachUntil(item => {
                if (pos++ === index) {
                    value = item;
                    return true;
                }
            });
            if (found) {
                return {done: false, value};
            }
            return {done: true, value: undefined};
        });
    }

    awaitAll(): Promise<T extends PromiseLike<infer E> ? E[] : T[]> {
        return Promise.all(this) as any;
    }

    butLast(): Stream<T> {
        return new IteratorStream(() => {
            const itr = this[Symbol.iterator]();
            let p = itr.next();
            return {
                next(): IteratorResult<T> {
                    const n = itr.next();
                    if (n.done) return {done: true, value: undefined};
                    const r = p;
                    p = n;
                    return r;
                }
            };
        });
    }

    distinctBy(getKey: (item: T) => any): Stream<T> {
        return new IteratorStream(() => {
            const itr = this[Symbol.iterator]();
            const set = new Set<T>();
            return {
                next(): IteratorResult<T> {
                    for ( ; ; ) {
                        const n = itr.next();
                        if (n.done) return {done: true, value: undefined};
                        const k = getKey(n.value);
                        if (!set.has(k)) {
                            set.add(k);
                            return n;
                        }
                    }
                }
            };
        });
    }

    equals(other: Iterable<T>): boolean {
        const itr = other[Symbol.iterator]();
        const foundNotEqual = this.forEachUntil(item => {
            const n = itr.next();
            if (n.done || item !== n.value) {
                return true;
            }
        })
        // noinspection PointlessBooleanExpressionJS
        return !foundNotEqual && !!itr.next().done;
    }

    every(predicate: (item: T) => boolean): boolean {
        return !this.forEachUntil(item => !predicate(item));
    }

    filter(predicate: (item: T) => boolean): Stream<T> {
        return this.filterWithAssertion(predicate as (item: T) => item is T);
    }

    filterWithAssertion<U extends T>(assertion: (item: T) => item is U): Stream<U> {
        return new IteratorStream(() => {
            const itr = this[Symbol.iterator]();
            return {
                next(): IteratorResult<U> {
                    for ( ; ; ) {
                        const n = itr.next();
                        if (n.done) return {done: true, value: undefined};
                        if (assertion(n.value)) return n as IteratorResult<U>;
                    }
                }
            };
        });
    }

    find(predicate: (item: T) => boolean): Optional<T> {
        return new SimpleOptional(() => {
            const itr = this[Symbol.iterator]();
            for ( ; ; ) {
                const n = itr.next();
                if (n.done) return {done: true, value: undefined};
                if (predicate(n.value)) return n;
            }
        });
    }

    flatMap<U>(mapper: (item: T) => Iterable<U>): Stream<U> {
        return new IteratorStream(() => new FlatMapIterator(this[Symbol.iterator](), mapper));
    }

    forEach(effect: (item: T) => void): void {
        this.forEachUntil(item => void effect(item));
    }

    forEachUntil(effect: (item: T) => boolean | undefined | void) {
        const itr = this[Symbol.iterator]();
        for ( ; ; ) {
            const n = itr.next();
            if (n.done) {
                return false;
            }
            if (effect(n.value) === true) {
                return true;
            }
        }
    }

    groupBy<K>(getKey: (item: T) => K): Stream<[K, T[]]> {
        return new IteratorStream<[K, T[]]>(() => {
            const map = collectToMap(this, getKey);
            return map[Symbol.iterator]();
        });
    }

    head(): Optional<T> {
        return new SimpleOptional(() => {
            const n = this[Symbol.iterator]().next();
            if (!n.done) return n;
            return {done: true, value: undefined};
        });
    }

    join(sep: string | {sep: string, leading?: boolean, trailing?: boolean}): string {
        let result = (typeof sep === 'object' && sep.leading) ? sep.sep : '';
        let first = true;
        const itr = this[Symbol.iterator]();
        for ( ; ; ) {
            const n = itr.next();
            if (n.done) {
                break;
            }

            if (first) {
                result += String(n.value);
                first = false;
            } else {
                result += (typeof sep === 'string' ? sep : sep.sep) + String(n.value);
            }
        }
        if (typeof sep === 'object' && sep.trailing) {
            result += sep.sep;
        }
        return result;
    }

    joinBy(getSep: (l: T, r: T) => string): string {
        let result = '';
        let prev: T = undefined as any;
        let first = true;
        const itr = this[Symbol.iterator]();
        for ( ; ; ) {
            const n = itr.next();
            if (n.done) {
                break;
            }

            if (first) {
                result = String(n.value);
                first = false;
            } else {
                result += getSep(prev, n.value) + String(n.value);
            }
            prev = n.value;
        }
        return result;
    }

    last(): Optional<T> {
        return new SimpleOptional<T>(() => {
            let value: T = undefined as any;
            let found = false;
            this.forEach(item => {
                value = item;
                found = true;
            })
            if (found) return {done: false, value};
            return {done: true, value: undefined};
        });
    }

    map<U>(mapper: (item: T) => U): Stream<U> {
        return new IteratorStream(() => new MapIterator(this[Symbol.iterator](), mapper));
    }

    peek(effect: (item: T) => void): Stream<T> {
        return new IteratorStream(() => {
            const itr = this[Symbol.iterator]();
            return {
                next() {
                    const n = itr.next();
                    if (!n.done) {
                        effect(n.value);
                    }
                    return n;
                }
            };
        });
    }

    randomItem(): Optional<T> {
        return new SimpleOptional<T>(() => {
            const a = this.toArray();
            return a.length
                ? {done: false, value: a[Math.floor(Math.random() * a.length)]}
                : {done: true, value: undefined};
        });
    }

    reduce(reducer: (l: T, r: T) => T): Optional<T> {
        return new SimpleOptional<T>(() => {
            let found = false;
            let value: T = undefined as any;
            this.forEach(item => {
                if (!found) {
                    value = item;
                    found = true;
                } else {
                    value = reducer(value, item);
                }
            })
            return found ? {done: false, value} : {done: true, value: undefined};
        });
    }

    reduceLeft<U>(zero: U, reducer: (l: U, r: T) => U): U {
        let current = zero;
        this.forEach(item => current = reducer(current, item))
        return current;
    }

    reduceRight<U>(zero: U, reducer: (l: T, r: U) => U): U {
        const a = this.toArray();
        let current = zero;
        for (let i = a.length - 1; i >= 0; i--) {
            current = reducer(a[i], current);
        }
        return current;
    }

    reverse(): Stream<T> {
        return delegateStream(() => {
            const a = this.toArray();
            a.reverse();
            return new ArrayStream(a);
        });
    }

    shuffle(): Stream<T> {
        return delegateStream(() => {
            const a = this.toArray();
            shuffle(a, a.length);
            return new ArrayStream(a);
        });
    }

    single(): Optional<T> {
        return new SimpleOptional(() => {
            const itr = this[Symbol.iterator]();
            const n = itr.next();
            if (!n.done) {
                const nn = itr.next();
                if (nn.done) {
                    return n;
                }
            }
            return {done: true, value: undefined};
        });
    }

    size(): number {
        let s = 0;
        this.forEach(() => s++);
        return s;
    }

    some(predicate: (item: T) => boolean): boolean {
        return this.forEachUntil(predicate);
    }

    sort(compareFn?: (a: T, b: T) => number): Stream<T> {
        return delegateStream(() => {
            const arr = this.toArray();
            arr.sort(compareFn);
            return new ArrayStream(arr);
        });
    }

    sortBy(getComparable: (item: T) => (number | string | boolean)): Stream<T> {
        return delegateStream(() => {
            const arr = this.toArray();
            arr.sort((a, b) => {
                const ca = getComparable(a);
                const cb = getComparable(b);
                if (ca < cb) {
                    return -1;
                }
                if (ca > cb) {
                    return 1;
                }
                return 0;
            });
            return new ArrayStream(arr);
        });
    }

    splitWhen(isSplit: (l: T, r: T) => boolean): Stream<T[]> {
        return new IteratorStream(() => {
            const itr = this[Symbol.iterator]();
            let chunk: T[] | undefined = undefined;
            return {
                next(): IteratorResult<T[]> {
                    for ( ; ; ) {
                        const n = itr.next();
                        if (n.done) {
                            if (chunk) {
                                const _chunk = chunk;
                                chunk = undefined;
                                return {done: false, value: _chunk};
                            }
                            return {done: true, value: undefined};
                        }

                        if (!chunk) {
                            chunk = [n.value];
                        } else if (isSplit(chunk[chunk.length - 1], n.value)) {
                            const _chunk = chunk;
                            chunk = [n.value];
                            return {done: false, value: _chunk};
                        } else {
                            chunk.push(n.value);
                        }
                    }
                }
            };
        });
    }

    tail(): Stream<T> {
        return new IteratorStream(() => {
            const itr = this[Symbol.iterator]();
            let first = true;
            return {
                next(): IteratorResult<T> {
                    let n = itr.next();
                    if (first) {
                        first = false;
                        n = itr.next();
                    }
                    if (!n.done) return n;
                    return {done: true, value: undefined};
                }
            };
        });
    }

    take(n: number): Stream<T> {
        if (n <= 0) {
            return new ArrayStream<T>([]);
        }

        return new IteratorStream(() => {
            const itr = this[Symbol.iterator]();
            let i = 0;
            return {
                next(): IteratorResult<T> {
                    if (i < n) {
                        const n = itr.next();
                        i++;
                        if (!n.done) return {done: false, value: n.value};
                    }
                    return {done: true, value: undefined};
                }
            };
        });
    }

    takeLast(n: number): Stream<T> {
        if (n <= 0) {
            return new ArrayStream<T>([]);
        }

        return new IteratorStream(() => {
            const buffer = new RingBuffer<T>(n);
            this.forEach(item => buffer.add(item));
            return buffer[Symbol.iterator]();
        });
    }

    takeRandom(n: number): Stream<T> {
        return delegateStream(() => {
            const a = this.toArray();
            const size = Math.max(0, Math.min(n, a.length));
            shuffle(a, size);
            return new RandomAccessStream(i => a[i], () => size);
        });
    }

    toArray(): T[] {
        const a: T[] = [];
        this.forEach(item => a.push(item));
        return a;
    }

    toObject(): T extends readonly [string | number | symbol, any] ? { [key in T[0]]: T[1] } : unknown {
        const obj: any = {};
        this.forEach(item => {
            if (Array.isArray(item) && item.length === 2) {
                const k = item[0];
                const v = item[1]
                if (typeof k === 'string' || typeof k === 'number' || typeof k === 'symbol') {
                    obj[k] = v;
                } else {
                    throw Error('Not key: ' + k);
                }
            } else {
                throw Error('Not 2-element array: ' + item);
            }
        });
        return obj;
    }

    transform<U>(operator: (input: Iterable<T>) => Iterator<U>): Stream<U> {
        return new IteratorStream<U>(() => operator(this));
    }

    transformToOptional<U>(operator: (input: Iterable<T>) => Iterator<U>): Optional<U> {
        return new SimpleOptional(() => operator(this).next());
    }

    zip<U>(other: Iterable<U>): Stream<[T, U]> {
        return new IteratorStream(() => {
            const it1 = this[Symbol.iterator]();
            const it2 = other[Symbol.iterator]();
            return {
                next(): IteratorResult<[T, U]> {
                    const n = it1.next();
                    const m = it2.next();
                    if (!n.done && !m.done) return {done: false, value: [n.value, m.value]};
                    return {done: true, value: undefined};
                }
            };
        });
    }

    zipStrict<U>(other: Iterable<U>): Stream<[T, U]> {
        return new IteratorStream(() => {
            const it1 = this[Symbol.iterator]();
            const it2 = other[Symbol.iterator]();
            return {
                next(): IteratorResult<[T, U]> {
                    const n = it1.next();
                    const m = it2.next();
                    if (n.done && !m.done) throw new Error('Too few elements in this');
                    if (!n.done && m.done) throw new Error('Too few elements in other');
                    if (!n.done && !m.done) return {done: false, value: [n.value, m.value]};
                    return {done: true, value: undefined};
                }
            };
        });
    }

    zipWithIndex(): Stream<[T, number]> {
        return new IteratorStream(() => {
            const it = this[Symbol.iterator]();
            let i = 0;
            return {
                next(): IteratorResult<[T, number]> {
                    const n = it.next();
                    if (n.done) return {done: true, value: undefined};
                    return {done: false, value: [n.value, i++]};
                }
            };
        });
    }

    zipWithIndexAndLen(): Stream<[T, number, number]> {
        return delegateStream(() => new ArrayStream(this.toArray()).zipWithIndexAndLen());
    }
}

export class IteratorStream<T> extends AbstractStream<T> implements Stream<T> {
    constructor(readonly createIterator: () => Iterator<T>) {
        super();
    }

    [Symbol.iterator](): Iterator<T> {
        return this.createIterator();
    }
}

export class RandomAccessStream<T> extends AbstractStream<T> implements Stream<T> {
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
        return new SimpleOptional<T>(() => {
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
        return new IteratorStream(() => {
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
        return new SimpleOptional<T>(() => {
            for (let i = 0; i < this.size(); i++) {
                const value = this.get(i);
                if (predicate(value)) return {done: false, value};
            }
            return {done: true, value: undefined};
        });
    }

    flatMap<U>(mapper: (item: T) => Iterable<U>): Stream<U> {
        return new IteratorStream(() => {
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
        return new SimpleOptional<T>(() => {
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
        return new SimpleOptional<T>(() => {
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
        return new SimpleOptional<T>(() => {
            const size = this.size();
            return size
                ? {done: false, value: this.get(Math.floor(Math.random() * size))}
                : {done: true, value: undefined};
        });
    }

    reduce(reducer: (l: T, r: T) => T): Optional<T> {
        return new SimpleOptional<T>(() => {
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

export class ArrayStream<T> extends RandomAccessStream<T> implements Stream<T> {
    constructor(readonly array: T[]) {
        super(i => array[i], () => array.length);
    }

    [Symbol.iterator](): Iterator<T> {
        return this.array[Symbol.iterator]();
    }

    forEach(effect: (i: T) => void) {
        this.array.forEach(effect);
    }

    toArray(): T[] {
        return this.array;
    }

    zipWithIndex(): Stream<[T, number]> {
        return new RandomAccessStream(
            i => [this.array[i], i],
            this.size,
        );
    }

    zipWithIndexAndLen(): Stream<[T, number, number]> {
        return new RandomAccessStream(
            i => [this.array[i], i, this.array.length],
            () => this.array.length,
        );
    }
}

export class InputArrayStream<T> extends ArrayStream<T> implements Stream<T> {
    toArray(): T[] {
        return super.toArray().slice();
    }
}

export class SimpleOptional<T> implements Optional<T> {
    constructor(readonly next: () => IteratorResult<T>) {
    }

    [Symbol.iterator](): Iterator<T> {
        let r = this.next();
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
            const r = this.next();
            return !r.done && predicate(r.value) ? r : {done: true, value: undefined};
        });
    }

    flatMap<U>(mapper: (item: T) => Iterable<U>): Optional<U> {
        return new SimpleOptional(() => {
            const r = this.next();
            if (r.done) return r;
            return mapper(r.value)[Symbol.iterator]().next();
        });
    }

    flatMapToStream<U>(mapper: (item: T) => Iterable<U>): Stream<U> {
        return new IteratorStream(() => {
            const r = this.next();
            if (r.done) return new RandomAccessIterator(undefined as any, 0);
            return mapper(r.value)[Symbol.iterator]();
        });
    }

    get(): T {
        const r = this.next();
        if (r.done) {
            throw new Error('No value');
        }
        return r.value;
    }

    has(predicate: (item: T) => boolean): boolean {
        const r = this.next();
        return !r.done && predicate(r.value);
    }

    hasNot(predicate: (item: T) => boolean): boolean {
        const r = this.next();
        return r.done || !predicate(r.value);
    }

    is(item: T): boolean {
        const r = this.next();
        return !r.done && r.value === item;
    }

    isPresent(): boolean {
        return !this.next().done;
    }

    map<U>(mapper: (item: T) => U): Optional<U> {
        return new SimpleOptional(() => {
            const r = this.next();
            if (r.done) return r;
            return {done: false, value: mapper(r.value)};
        });
    }

    mapNullable<U>(mapper: (item: T) => (U | null | undefined)): Optional<U> {
        return new SimpleOptional<U>(() => {
            const r = this.next();
            if (r.done) return r;
            const value = mapper(r.value);
            if (value != null) return {done: false, value};
            return {done: true, value: undefined};
        });
    }

    orElse<U>(other: U): T | U {
        const r = this.next();
        return !r.done ? r.value : other;
    }

    orElseGet<U>(get: () => U): T | U {
        const r = this.next();
        return !r.done ? r.value : get();
    }

    orElseNull(): T | null {
        const r = this.next();
        return !r.done ? r.value : null;
    }

    orElseThrow(createError: () => Error): T {
        const r = this.next();
        if (r.done) {
            throw createError();
        }
        return r.value;
    }

    orElseUndefined(): T | undefined {
        const r = this.next();
        if (r.done) {
            return undefined;
        }
        return r.value;
    }

    resolve(): {has: true; val: T} | {has: false} {
        const r = this.next();
        return r.done ? {has: false} : {has: true, val: r.value};
    }

    toArray(): T[] {
        const r = this.next();
        return r.done ? [] : [r.value];
    }

    toStream(): Stream<T> {
        return new IteratorStream(() => {
            let r = this.next();
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
