import { Stream } from '../stream';
import { Optional } from '../optional';
import { FlatMapIterator } from './FlatMapIterator';
import { collectToMap } from './collectToMap';
import { MapIterator } from './MapIterator';
import { RingBuffer } from './RingBuffer';
import { shuffle } from './shuffle';
import { Impl } from './impl';
import { DelegateStream } from './DelegateStream';

export default (impl: Impl) => class AbstractStream<T> implements Stream<T> {
    // Cannot return abstract class from function
    [Symbol.iterator](): Iterator<T> {
        throw undefined;
    };

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
        return new impl.IteratorStream(() => {
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
        return new impl.IteratorStream(() => {
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
        return new impl.SimpleOptional<T>(() => {
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
        return new impl.IteratorStream(() => {
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
        return new impl.IteratorStream(() => {
            const itr = this[Symbol.iterator]();
            const set = new Set<T>();
            return {
                next(): IteratorResult<T> {
                    for (; ;) {
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
        return new impl.IteratorStream(() => {
            const itr = this[Symbol.iterator]();
            return {
                next(): IteratorResult<T> {
                    for (; ;) {
                        const n = itr.next();
                        if (n.done) return {done: true, value: undefined};
                        if (predicate(n.value)) return n;
                    }
                }
            };
        });
    }

    filterWithAssertion<U extends T>(assertion: (item: T) => item is U): Stream<U> {
        return new impl.IteratorStream(() => {
            const itr = this[Symbol.iterator]();
            return {
                next(): IteratorResult<U> {
                    for (; ;) {
                        const n = itr.next();
                        if (n.done) return {done: true, value: undefined};
                        if (assertion(n.value)) return n as IteratorResult<U>;
                    }
                }
            };
        });
    }

    find(predicate: (item: T) => boolean): Optional<T> {
        return new impl.SimpleOptional(() => {
            const itr = this[Symbol.iterator]();
            for (; ;) {
                const n = itr.next();
                if (n.done) return {done: true, value: undefined};
                if (predicate(n.value)) return n;
            }
        });
    }

    flatMap<U>(mapper: (item: T) => Iterable<U>): Stream<U> {
        return new impl.IteratorStream(() => new FlatMapIterator(this[Symbol.iterator](), mapper));
    }

    forEach(effect: (item: T) => void): void {
        for (const i of this) {
            effect(i);
        }
    }

    groupBy<K>(getKey: (item: T) => K): Stream<readonly [K, T[]]> {
        return new impl.IteratorStream<readonly [K, T[]]>(() => {
            const map = collectToMap(this, getKey);
            return map[Symbol.iterator]();
        });
    }

    head(): Optional<T> {
        return new impl.SimpleOptional(() => {
            const n = this[Symbol.iterator]().next();
            if (!n.done) return n;
            return {done: true, value: undefined};
        });
    }

    join(sep: string | {sep: string, leading?: boolean, trailing?: boolean}): string {
        let result = (typeof sep === 'object' && sep.leading) ? sep.sep : '';
        let first = true;
        const itr = this[Symbol.iterator]();
        for (; ;) {
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
        for (; ;) {
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
        return new impl.SimpleOptional<T>(() => {
            let value: T = undefined as any;
            let found = false;
            for (const i of this) {
                value = i;
                found = true;
            }
            if (found) return {done: false, value};
            return {done: true, value: undefined};
        });
    }

    map<U>(mapper: (item: T) => U): Stream<U> {
        return new impl.IteratorStream(() => new MapIterator(this[Symbol.iterator](), mapper));
    }

    randomItem(): Optional<T> {
        return new impl.SimpleOptional<T>(() => {
            const a = this.toArray();
            return a.length
                ? {done: false, value: a[Math.floor(Math.random() * a.length)]}
                : {done: true, value: undefined};
        });
    }

    reduce(reducer: (l: T, r: T) => T): Optional<T> {
        return new impl.SimpleOptional<T>(() => {
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

    reverse(): Stream<T> {
        return new DelegateStream(() => {
            const a = this.toArray();
            a.reverse();
            return new impl.ArrayStream(a);
        });
    }

    shuffle(): Stream<T> {
        return new DelegateStream(() => {
            const a = this.toArray();
            shuffle(a, a.length);
            return new impl.ArrayStream(a);
        });
    }

    single(): Optional<T> {
        return new impl.SimpleOptional(() => {
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

    sort(compareFn?: (a: T, b: T) => number): Stream<T> {
        return new DelegateStream(() => {
            const arr = this.toArray();
            arr.sort(compareFn);
            return new impl.ArrayStream(arr);
        });
    }

    sortBy(getComparable: (item: T) => (number | string | boolean)): Stream<T> {
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
            return new impl.ArrayStream(arr);
        });
    }

    splitWhen(isSplit: (l: T, r: T) => boolean): Stream<T[]> {
        return new impl.IteratorStream(() => {
            const itr = this[Symbol.iterator]();
            let chunk: T[] | undefined = undefined;
            return {
                next(): IteratorResult<T[]> {
                    for (; ;) {
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
        return new impl.IteratorStream(() => {
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
            return new impl.ArrayStream<T>([]);
        }

        return new impl.IteratorStream(() => {
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
            return new impl.ArrayStream<T>([]);
        }

        return new impl.IteratorStream(() => {
            const buffer = new RingBuffer<T>(n);
            for (const i of this) {
                buffer.add(i);
            }
            return buffer[Symbol.iterator]();
        });
    }

    takeRandom(n: number): Stream<T> {
        return new DelegateStream(() => {
            const a = this.toArray();
            const length = Math.max(0, Math.min(n, a.length));
            shuffle(a, length);
            return new impl.RandomAccessStream(() => ({get: i => a[i], length}));
        });
    }

    toArray(): T[] {
        const a: T[] = [];
        for (const i of this) {
            a.push(i);
        }
        return a;
    }

    toObject(): T extends readonly [string | number | symbol, any] ? { [key in T[0]]: T[1] } : unknown {
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

    transform<U>(operator: (input: Iterable<T>) => Iterator<U>): Stream<U> {
        return new impl.IteratorStream<U>(() => operator(this));
    }

    transformToOptional<U>(operator: (input: Iterable<T>) => Iterator<U>): Optional<U> {
        return new impl.SimpleOptional(() => operator(this).next());
    }

    zip<U>(other: Iterable<U>): Stream<readonly [T, U]> {
        return new impl.IteratorStream(() => {
            const it1 = this[Symbol.iterator]();
            const it2 = other[Symbol.iterator]();
            return {
                next(): IteratorResult<readonly [T, U]> {
                    const n = it1.next();
                    const m = it2.next();
                    if (!n.done && !m.done) return {done: false, value: [n.value, m.value] as const};
                    return {done: true, value: undefined};
                }
            };
        });
    }

    zipStrict<U>(other: Iterable<U>): Stream<readonly [T, U]> {
        return new impl.IteratorStream(() => {
            const it1 = this[Symbol.iterator]();
            const it2 = other[Symbol.iterator]();
            return {
                next(): IteratorResult<readonly [T, U]> {
                    const n = it1.next();
                    const m = it2.next();
                    if (n.done && !m.done) throw new Error('Too few elements in this');
                    if (!n.done && m.done) throw new Error('Too few elements in other');
                    if (!n.done && !m.done) return {done: false, value: [n.value, m.value] as const};
                    return {done: true, value: undefined};
                }
            };
        });
    }

    zipWithIndex(): Stream<readonly [T, number]> {
        return new impl.IteratorStream(() => {
            const it = this[Symbol.iterator]();
            let i = 0;
            return {
                next(): IteratorResult<readonly [T, number]> {
                    const n = it.next();
                    if (n.done) return {done: true, value: undefined};
                    return {done: false, value: [n.value, i++] as const};
                }
            };
        });
    }

    zipWithIndexAndLen(): Stream<readonly [T, number, number]> {
        return new DelegateStream(() => new impl.ArrayStream(this.toArray()).zipWithIndexAndLen());
    }
}
