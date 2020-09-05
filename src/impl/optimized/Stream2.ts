import { StreamOperator } from '../../streamGenerator';
import { Stream } from '../../stream';
import { Optional } from '../../optional';
import { DelegateStream } from './DelegateStream';
import { RingBuffer } from '../ringBuffer';
import { RandomAccessIterator } from './RandomAccessIterator';
import { MapIterator } from './MapIterator';
import { FlatMapIterator } from './FlatMapIterator';
import { RandomAccessFlatMapIterator } from './RandomAccessFlatMapIterator';
import { RandomAccessSpec } from './RandomAccessSpec';
import { collectToMap } from '../util';

abstract class AbstractStream<T> implements Stream<T> {
    abstract [Symbol.iterator](): Iterator<T>;

    all(predicate: (item: T) => boolean): boolean {
        for (const i of this) {
            if (!predicate(i)) {
                return false;
            }
        }
        return true;
    }

    any(predicate: (item: T) => boolean): boolean {
        for (const i of this) {
            if (predicate(i)) {
                return true;
            }
        }
        return false;
    }

    append(item: T): Stream<T> {
        return this.appendIf(true, item);
    }

    appendAll(items: Iterable<T>): Stream<T> {
        return this.appendAllIf(true, items);
    }

    appendAllIf(condition: boolean, items: Iterable<T>): Stream<T> {
        return condition
            ? new IteratorStream(() => {
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
                }
            })
            : this;
    }

    appendIf(condition: boolean, item: T): Stream<T> {
        return condition
            ? new IteratorStream(() => {
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
                }
            })
            : this;
    }

    at(index: number): Optional<T> {
        return new SimpleOptional<T>(() => {
            let pos = 0;
            let found = false;
            let value: T = undefined as any;
            for (const i of this) {
                if (pos === index) {
                    value = i;
                    found = true;
                    break;
                }
                pos++;
            }
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
            }
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
            }
        });
    }

    equals(other: Iterable<T>): boolean {
        const itr = other[Symbol.iterator]();
        for (const i of this) {
            const n = itr.next();
            if (n.done || i !== n.value) {
                return false;
            }
        }
        // noinspection PointlessBooleanExpressionJS
        return !!itr.next().done;
    }

    filter(predicate: (item: T) => boolean): Stream<T> {
        return new IteratorStream(() => {
            const itr = this[Symbol.iterator]();
            return {
                next(): IteratorResult<T> {
                    for ( ; ; ) {
                        const n = itr.next();
                        if (n.done) return {done: true, value: undefined};
                        if (predicate(n.value)) return n;
                    }
                }
            };
        })
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
        })
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
        for (const i of this) {
            effect(i);
        }
    }

    groupBy<K>(getKey: (item: T) => K): Stream<readonly [K, T[]]> {
        return new IteratorStream<readonly [K, T[]]>(() => {
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

    join(delimiter: string): string {
        return this.joinBy(() => delimiter);
    }

    joinBy(getDelimiter: (l: T, r: T) => string): string {
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
                result += getDelimiter(prev, n.value) + String(n.value);
            }
            prev = n.value;
        }
        return result;
    }

    last(): Optional<T> {
        return new SimpleOptional<T>(() => {
            let value: T = undefined as any;
            let found = false;
            for (const i of this) {
                value = i;
                found = true;
            }
            if (found) return {done: false, value};
            return {done: true, value: undefined};
        })
    }

    map<U>(mapper: (item: T) => U): Stream<U> {
        return new IteratorStream(() => new MapIterator(this[Symbol.iterator](), mapper))
    }

    randomItem(): Optional<T> {
        return new SimpleOptional<T>(() => {
            const a = this.toArray();
            return a.length
                ? {done: false, value: a[Math.floor(Math.random() * a.length)]}
                : {done: true, value: undefined};
        })
    }

    reduce(reducer: (l: T, r: T) => T): Optional<T> {
        return new SimpleOptional<T>(() => {
            let found = false;
            let value: T = undefined as any;
            for (const i of this) {
                if (!found) {
                    value = i;
                    found = true;
                } else {
                    value = reducer(value, i);
                }
            }
            return found ? {done: false, value} : {done: true, value: undefined};
        });
    }

    reduceLeft<U>(zero: U, reducer: (l: U, r: T) => U): U {
        let current = zero;
        for (const i of this) {
            current = reducer(current, i);
        }
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

    shuffle(): Stream<T> {
        return new DelegateStream(() => {
            const a = this.toArray();
            for (let i = 0; i < a.length - 1; i++) {
                const j = i + Math.floor(Math.random() * (a.length - i));
                const t = a[i];
                a[i] = a[j];
                a[j] = t;
            }
            return new ArrayStream(a);
        })
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
        for (const _ of this) {
            s++;
        }
        return s;
    }

    sortOn(getComparable: (item: T) => (number | string | boolean)): Stream<T> {
        return new DelegateStream(() => {
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
            }
        })
    }

    tail(): Stream<T> {
        throw new Error('Not implemented');
    }

    take(_n: number): Stream<T> {
        throw new Error('Not implemented');
    }

    takeLast(n: number): Stream<T> {
        return new DelegateStream(() => {
            const buffer = new RingBuffer<T>(n);
            for (const i of this) {
                buffer.add(i);
            }
            return new ArrayStream(buffer.toArray());
        })
    }

    takeRandom(_n: number): Stream<T> {
        throw new Error('Not implemented');
    }

    toArray(): T[] {
        const a: T[] = [];
        for (const i of this) {
            a.push(i);
        }
        return a;
    }

    toObject(): T extends readonly [string, any] ? { [key in T[0]]: T[1] } : unknown {
        throw new Error('Not implemented');
    }

    transformToOptional<U>(_operator: StreamOperator<T, U>): Optional<U> {
        throw new Error('Not implemented');
    }

    transformToStream<U>(_operator: StreamOperator<T, U>): Stream<U> {
        throw new Error('Not implemented');
    }

    zip<U>(_other: Iterable<U>): Stream<readonly [T, U]> {
        throw new Error('Not implemented');
    }

    zipStrict<U>(_other: Iterable<U>): Stream<readonly [T, U]> {
        throw new Error('Not implemented');
    }

    zipWithIndex(): Stream<readonly [T, number]> {
        throw new Error('Not implemented');
    }

    zipWithIndexAndLen(): Stream<readonly [T, number, number]> {
        throw new Error('Not implemented');
    }
}

export class IteratorStream<T> extends AbstractStream<T> {
    constructor(private readonly createIterator: () => Iterator<T>) {
        super();
    }
    [Symbol.iterator](): Iterator<T> {
        return this.createIterator();
    }
}

export class RandomAccessStream<T> extends AbstractStream<T>  {
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
            }
        });
    }

    at(index: number): Optional<T> {
        return new SimpleOptional<T>(() => {
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
            }
        });
    }

    filter(predicate: (item: T) => boolean): Stream<T> {
        return new IteratorStream(() => {
            const {get, length} = this.spec();
            let pos = 0;
            return {
                next(): IteratorResult<T> {
                    for ( ; ; ) {
                        if (pos === length) return {done: true, value: undefined};
                        const value = get(pos++);
                        if (predicate(value)) return {done: false, value};
                    }
                }
            }
        });
    }

    find(predicate: (item: T) => boolean): Optional<T> {
        return new SimpleOptional<T>(() => {
            const {get, length} = this.spec();
            for (let i = 0; i < length; i++) {
                const value = get(i);
                if (predicate(value)) return {done: false, value};
            }
            return {done: true, value: undefined};
        });
    }

    flatMap<U>(mapper: (item: T) => Iterable<U>): Stream<U> {
        return new IteratorStream(() => {
            const {get, length} = this.spec();
            return new RandomAccessFlatMapIterator({
                get: (i: number) => mapper(get(i)),
                length,
            })
        });
    }

    last(): Optional<T> {
        return new SimpleOptional<T>(() => {
            const {get, length} = this.spec();
            if (length > 0) return {done: false, value: get(length - 1)};
            return {done: true, value: undefined};
        });
    }

    single(): Optional<T> {
        return new SimpleOptional<T>(() => {
            const {get, length} = this.spec();
            if (length === 1) return {done: false, value: get(0)};
            return {done: true, value: undefined};
        })
    }

    size(): number {
        return this.spec().length;
    }

    takeLast(n: number): Stream<T> {
        return new DelegateStream(() => {
            // FIXME must only transform indices
            const {get, length} = this.spec();
            const a: T[] = [];
            for (let i = Math.max(length - n, 0); i < length; i++) {
                a.push(get(i));
            }
            return new ArrayStream(a);
        });
    }

    map<U>(mapper: (item: T) => U): Stream<U> {
        return new RandomAccessStream(() => {
            const {get, length} = this.spec();
            return {
                get: i => mapper(get(i)),
                length,
            }
        });
    }

    randomItem(): Optional<T> {
        return new SimpleOptional<T>(() => {
            const {get, length} = this.spec();
            return length
                ? {done: false, value: get(Math.floor(Math.random() * length))}
                : {done: true, value: undefined};
        });
    }

    reduce(reducer: (l: T, r: T) => T): Optional<T> {
        return new SimpleOptional<T>(() => {
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

    forEach(effect: (i: T) => void) {
        const {get, length} = this.spec();
        for (let i = 0; i < length; i++) {
            effect(get(i));
        }
    }
}

export class ArrayStream<T> extends RandomAccessStream<T> {
    constructor(private readonly array: T[]) {
        super(() => ({get: i => array[i], length: array.length}));
    }

    [Symbol.iterator](): Iterator<T> {
        return this.array[Symbol.iterator]();
    }

    takeLast(n: number): Stream<T> {
        return new DelegateStream(() => new ArrayStream(this.array.slice(this.array.length - n, this.array.length)));
    }

    map<U>(mapper: (item: T) => U): Stream<U> {
        return new MappedArrayStream(this.array, mapper);
    }

    join(delimiter: string): string {
        return this.array.join(delimiter);
    }

    toArray(): T[] {
        return this.array;
    }

    forEach(effect: (i: T) => void) {
        this.array.forEach(effect);
    }
}

// FIXME Is there really a performance gain?
export class MappedArrayStream<T, U> extends RandomAccessStream<U> {
    constructor(private readonly array: T[], private readonly mapper: (item: T) => U) {
        super(() => ({get: i => mapper(array[i]), length: array.length}));
    }

    toArray(): U[] {
        const a = this.array;
        const l = this.array.length;
        const m = this.mapper;
        const arr: U[] = [];
        for (let i = 0; i < l; i ++) {
            arr.push(m(a[i]));
        }
        return arr;
    }
}

export class InputArrayStream<T> extends ArrayStream<T> {
    toArray(): T[] {
        return [...super.toArray()];
    }
}

export class SimpleOptional<T> implements Optional<T> {
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
        return new IteratorStream(() => {
            const r = this.getResult();
            if (r.done) return new RandomAccessIterator({get: undefined as any, length: 0});
            return mapper(r.value)[Symbol.iterator]();
        })
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

    mapNullable<U>(_mapper: (item: T) => (U | null | undefined)): Optional<U> {
        return new SimpleOptional(() => {
            const r = this.getResult();
            if (r.done && r.value != null) return r;
            return {done: true, value: undefined};
        });
    }

    orElse<U>(_other: U): T | U {
        throw new Error('Not implemented');
    }

    orElseGet<U>(_get: () => U): T | U {
        throw new Error('Not implemented');
    }

    orElseNull(): T | null {
        throw new Error('Not implemented');
    }

    orElseThrow(_createError?: () => Error): T {
        throw new Error('Not implemented');
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
        return new IteratorStream(() => {
            const r = this.getResult();
            return {
                next(): IteratorResult<T> {
                    // FIXME endless
                    return r;
                }
            }
        });
    }
}
