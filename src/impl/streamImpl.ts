import { Base } from './base';
import { Stream } from '../stream';
import { Optional } from '../optional';
import { RingBuffer } from './ringBuffer';
import { OptionalImpl } from './optionalImpl';
import { collectToMap, trimIterable } from './util';

export class StreamImpl<P, T> extends Base<P, T> implements Stream<T> {
    constructor(parent: Iterable<P>,
                operation: (input: Iterable<P>) => Iterable<T>) {
        super(parent, operation);
    }

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

    at(index: number): Optional<T> {
        return new OptionalImpl(this, function* (items) {
            if (index < 0) {
                return;
            }

            if (Array.isArray(items)) {
                if (index < items.length) {
                    yield items[index];
                }
            } else {
                let current = 0;
                for (const i of items) {
                    if (index === current++) {
                        yield i;
                        break;
                    }
                }
            }
        });
    }

    awaitAll(): Promise<T extends PromiseLike<infer E> ? E[] : T[]> {
        return Promise.all(this) as any;
    }

    append(item: T) {
        return new StreamImpl(this, function* (items) {
            yield* items;
            yield item;
        });
    }

    appendIf(condition: boolean, item: T): Stream<T> {
        return new StreamImpl(this, function* (items) {
            yield* items;
            if (condition) {
                yield item;
            }
        });
    }

    appendAll(newItems: Iterable<T>) {
        return new StreamImpl(this, function* (items) {
            yield* items;
            yield* newItems;
        });
    }

    appendAllIf(condition: boolean, newItems: Iterable<T>): Stream<T> {
        return new StreamImpl(this, function* (items) {
            yield* items;
            if (condition) {
                yield* newItems;
            }
        });
    }

    butLast() {
        return new StreamImpl(this, function* (items) {
            let first = true;
            let prev: T = undefined as any as T;
            for (const i of items) {
                if (!first) {
                    yield prev;
                } else {
                    first = false;
                }
                prev = i;
            }
        });
    }

    distinctBy(getKey: (item: T) => any) {
        return new StreamImpl(this, function* (items) {
            const keys = new Set<T>();
            for (const i of items) {
                const key = getKey(i);
                if (!keys.has(key)) {
                    keys.add(key);
                    yield i;
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

    filter(predicate: (item: T) => boolean) {
        return new StreamImpl(this, function* (items: Iterable<T>) {
            for (const i of items) {
                if (predicate(i)) {
                    yield i;
                }
            }
        });
    }

    filterWithAssertion<U extends T>(assertion: (item: T) => item is U): Stream<U> {
        return new StreamImpl<T, U>(this, function* (items: Iterable<T>) {
            for (const i of items) {
                if (assertion(i)) {
                    yield i;
                }
            }
        });
    }

    find(predicate: (item: T) => boolean): Optional<T> {
        return new OptionalImpl(this, function* (items) {
            for (const i of items) {
                if (predicate(i)) {
                    yield i;
                    break;
                }
            }
        });
    }

    flatMap<U>(mapper: (item: T) => Iterable<U>): Stream<U> {
        return new StreamImpl(this, function* (items: Iterable<T>) {
            for (const i of items) {
                yield* mapper(i);
            }
        });
    }

    forEach(effect: (item: T) => void) {
        for (const i of this) {
            effect(i);
        }
    }

    groupBy<K>(getKey: (item: T) => K): Stream<readonly [K, T[]]> {
        return new StreamImpl<T, readonly [K, T[]]>(this, function* (items) {
            yield* collectToMap(items, getKey);
        });
    }

    head(): Optional<T> {
        return new OptionalImpl<T, T>(this, trimIterable);
    }

    join(delimiter: string): string {
        return this.joinBy(() => delimiter);
    }

    joinBy(getDelimiter: (l: T, r: T) => string): string {
        let result = '';
        let prev: T = undefined as any;
        let first = true;
        const itr = this[Symbol.iterator]();
        for (; ;) {
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
        return new OptionalImpl(this, function* (items) {
            if (Array.isArray(items)) {
                if (items.length) {
                    yield items[items.length - 1];
                }
                return;
            }
            let result: T = undefined as any;
            let found = false;
            for (const i of items) {
                result = i;
                found = true;
            }

            if (found) {
                yield result;
            }
        });
    }

    map<U>(mapper: (item: T) => U) {
        return new StreamImpl(this, function* (items: Iterable<T>) {
            for (const i of items) {
                yield mapper(i);
            }
        });
    }

    randomItem(): Optional<T> {
        return new OptionalImpl(this, function* (items) {
            const a: T[] = Array.isArray(items) ? items : [...items];
            if (a.length) {
                yield a[Math.floor(Math.random() * a.length)];
            }
        });
    }

    reduce(reducer: (l: T, r: T) => T): Optional<T> {
        return new OptionalImpl(this, function* (items) {
            let found = false;
            let result: T = undefined as any;
            for (const i of items) {
                if (!found) {
                    result = i;
                    found = true;
                } else {
                    result = reducer(result, i);
                }
            }
            if (found) {
                yield result as T;
            }
        });
    }

    reduceLeft<U>(zero: U, reducer: (l: U, r: T) => U): U {
        let current = zero;
        for (const i of this) {
            current = reducer(current, i);
        }
        return current;
    }

    shuffle(): Stream<T> {
        return new StreamImpl(this, function* (items) {
            const a = [...items];
            for (let i = 0; i < a.length - 1; i++) {
                const j = i + Math.floor(Math.random() * (a.length - i));
                if (i !== j) {
                    [a[i], a[j]] = [a[j], a[i]];
                }
            }
            yield* a;
        });
    }

    single(): Optional<T> {
        return new OptionalImpl(this, function* (items) {
            const itr = items[Symbol.iterator]();
            const n = itr.next();
            if (!n.done) {
                if (itr.next().done) {
                    yield n.value;
                }
            }
        });
    }

    sortOn(getComparable: (item: T) => (number | string | boolean)): Stream<T> {
        return new StreamImpl(this, function* (items) {
            const copy = [...items];
            copy.sort((a, b) => {
                if (getComparable(a) < getComparable(b)) {
                    return -1;
                }
                if (getComparable(a) > getComparable(b)) {
                    return 1;
                }
                return 0;
            });
            yield* copy;
        });
    }

    splitWhen(isSplit: (l: T, r: T) => boolean): Stream<T[]> {
        return new StreamImpl(this, function* (items) {
            let chunk: T[] | undefined = undefined;
            for (const item of items) {
                if (!chunk) {
                    chunk = [item];
                } else if (isSplit(chunk[chunk.length - 1], item)) {
                    yield chunk;
                    chunk = [item];
                } else {
                    chunk.push(item);
                }
            }
        });
    }

    tail(): Stream<T> {
        return new StreamImpl(this, function* (items) {
            let first = true;
            for (const i of items) {
                if (first) {
                    first = false;
                } else {
                    yield i;
                }
            }
        });
    }

    take(n: number): Stream<T> {
        return new StreamImpl(this, function* (items) {
            let count = 0;
            for (const i of items) {
                if (count >= n) {
                    return;
                }
                yield i;
                count++;
            }
        });
    }

    takeRandom(n: number): Stream<T> {
        return new StreamImpl(this, function* (items) {
            const a = [...items];
            for (let i = 0; i < Math.min(a.length - 1, n); i++) {
                const j = i + Math.floor(Math.random() * (a.length - i));
                if (i !== j) {
                    [a[i], a[j]] = [a[j], a[i]];
                }
            }
            yield* a.slice(0, Math.min(a.length, n));
        });
    }

    takeLast(n: number): Stream<T> {
        return new StreamImpl(this, function* (items) {
            if (Array.isArray(items)) {
                if (items.length <= n) {
                    return items;
                }
                return items.slice(items.length - n, items.length);
            }

            const buffer = new RingBuffer<T>(n);
            for (const i of items) {
                buffer.add(i);
            }
            yield* buffer;
        });
    }

    toObject(): T extends readonly [string, any] ? { [key in T[0]]: T[1] } : never {
        const obj: any = {};
        for (const i of this) {
            if (Array.isArray(i) && i.length === 2) {
                const [k, v] = i;
                if (typeof k === 'string' || typeof k === 'number' || typeof k === 'symbol') {
                    obj[k] = v;
                } else {
                    throw Error('Not key: ' + k);
                }
            } else {
                throw Error('Not 2-element array: ' + i);
            }
        }
        return obj;
    }

    transform<U>(transformer: (s: Stream<T>) => U): U {
        return transformer(this);
    }

    zip<U>(other: Iterable<U>): Stream<readonly [T, U]> {
        return new StreamImpl(this, function* (items) {
            const oItr = other[Symbol.iterator]();
            for (const i of items) {
                const oNext = oItr.next();
                if (oNext.done) {
                    return;
                }
                yield [i, oNext.value] as const;
            }
        });
    }

    zipStrict<U>(other: Iterable<U>): Stream<readonly [T, U]> {
        // TODO strict
        return this.zip(other);
    }

    zipWithIndex(): Stream<readonly [T, number]> {
        return new StreamImpl(this, function* (items) {
            let index = 0;
            for (const i of items) {
                yield [i, index++] as const;
            }
        });
    }

    zipWithIndexAndLen(): Stream<readonly [T, number, number]> {
        return new StreamImpl(this, function* (items) {
            const a = Array.isArray(items) ? items : [...items];
            let index = 0;
            for (const i of a) {
                yield [i, index++, a.length] as const;
            }
        });
    }
}
