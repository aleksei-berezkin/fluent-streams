import { StreamOperator, } from '../../streamGenerator';
import { Stream } from '../../stream';
import { Optional } from '../../optional';
import { DelegateStream } from './DelegateStream';
import { RingBuffer } from '../ringBuffer';
import { RandomAccessIterator } from './RandomAccessIterator';
import { MapIterator } from './MapIterator';
import { FlatMapIterator } from './FlatMapIterator';
import { RandomAccessFlatMapIterator } from './RandomAccessFlatMapIterator';

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
            }
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
                    if (!right) right = items[Symbol.iterator]();
                    return right.next();
                }
            }
        })
    }

    appendAllIf(_condition: boolean, _items: Iterable<T>): Stream<T> {
        throw new Error('Not implemented');
    }

    appendIf(_condition: boolean, _item: T): Stream<T> {
        throw new Error('Not implemented');
    }

    at(_index: number): Optional<T> {
        throw new Error('Not implemented');
    }

    awaitAll(): Promise<T extends PromiseLike<infer E> ? E[] : T[]> {
        throw new Error('Not implemented');
    }

    butLast(): Stream<T> {
        throw new Error('Not implemented');
    }

    distinctBy(_getKey: (item: T) => any): Stream<T> {
        throw new Error('Not implemented');
    }

    equals(_other: Iterable<T>): boolean {
        throw new Error('Not implemented');
    }

    filter(_predicate: (item: T) => boolean): Stream<T> {
        throw new Error('Not implemented');
    }

    filterWithAssertion<U extends T>(_assertion: (item: T) => item is U): Stream<U> {
        throw new Error('Not implemented');
    }

    find(_predicate: (item: T) => boolean): Optional<T> {
        throw new Error('Not implemented');
    }

    flatMap<U>(mapper: (item: T) => Iterable<U>): Stream<U> {
        return new IteratorStream(() => new FlatMapIterator(this[Symbol.iterator](), mapper));
    }

    forEach(effect: (item: T) => void): void {
        for (const i of this) {
            effect(i);
        }
    }

    groupBy<K>(_getKey: (item: T) => K): Stream<readonly [K, T[]]> {
        throw new Error('Not implemented');
    }

    head(): Optional<T> {
        throw new Error('Not implemented');
    }

    join(_delimiter: string): string {
        throw new Error('Not implemented');
    }

    joinBy(_getDelimiter: (l: T, r: T) => string): string {
        throw new Error('Not implemented');
    }

    last(): Optional<T> {
        throw new Error('Not implemented');
    }

    map<U>(mapper: (item: T) => U): Stream<U> {
        return new IteratorStream(() => new MapIterator(this[Symbol.iterator](), mapper))
    }

    randomItem(): Optional<T> {
        throw new Error('Not implemented');
    }

    reduce(_reducer: (l: T, r: T) => T): Optional<T> {
        throw new Error('Not implemented');
    }

    reduceLeft<U>(_zero: U, _reducer: (l: U, r: T) => U): U {
        throw new Error('Not implemented');
    }

    reduceRight<U>(_zero: U, _reducer: (l: T, r: U) => U): U {
        throw new Error('Not implemented');
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
        throw new Error('Not implemented');
    }

    size(): number {
        throw new Error('Not implemented');
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

    splitWhen(_isSplit: (l: T, r: T) => boolean): Stream<T[]> {
        throw new Error('Not implemented');
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

class RandomAccessStream<T> extends AbstractStream<T>  {
    constructor(private readonly get: (i: number) => T, private readonly length: number) {
        super();
    }

    [Symbol.iterator](): Iterator<T> {
        return new RandomAccessIterator(this.get, this.length);
    }

    flatMap<U>(mapper: (item: T) => Iterable<U>): Stream<U> {
        return new IteratorStream(() => new RandomAccessFlatMapIterator(i => mapper(this.get(i)), this.length));
    }

    size(): number {
        return this.length;
    }

    takeLast(n: number): Stream<T> {
        return new DelegateStream(() => {
            const a: T[] = [];
            const s = this.size();
            for (let i = Math.max(s - n, 0); i < s; i++) {
                a.push(this.get(i));
            }
            return new ArrayStream(a);
        });
    }

    map<U>(mapper: (item: T) => U): Stream<U> {
        return new RandomAccessStream(i => mapper(this.get(i)), this.length);
    }

    forEach(effect: (i: T) => void) {
        for (let i = 0; i < this.length; i++) {
            effect(this.get(i));
        }
    }
}

export class ArrayStream<T> extends RandomAccessStream<T> {
    constructor(private readonly array: T[]) {
        super(i => array[i], array.length);
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

    toArray(): T[] {
        return this.array;
    }

    forEach(effect: (i: T) => void) {
        this.array.forEach(effect);
    }
}

export class MappedArrayStream<T, U> extends RandomAccessStream<U> {
    constructor(private readonly array: T[], private readonly mapper: (item: T) => U) {
        super(i => mapper(array[i]), array.length);
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
