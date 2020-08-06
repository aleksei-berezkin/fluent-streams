import { Base, BaseImpl } from './base';
import { Stream } from '../stream';
import { Optional } from '../optional';
import { RingBuffer } from './ringBuffer';
import { OptionalImpl } from './optionalImpl';
import { collectToMap } from './util';
import {
    appendReturned,
    assertResult,
    assertVoid,
    matchGenerator,
    StreamGenerator,
    toAnyArray,
    toModifiableArray
} from '../streamGenerator';

export class StreamImpl<P, T> extends BaseImpl<P, T> implements Stream<T> {
    constructor(parent: Base<P> | undefined,
                operation: (input: StreamGenerator<P>) => StreamGenerator<T>) {
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
        return new OptionalImpl(this, function* (gen) {
            if (index < 0) {
                return;
            }

            const {head, tail} = matchGenerator(gen);
            
            let current = 0;
            for (const i of head) {
                if (index === current++) {
                    yield i;
                    return;
                }
            }

            const i = index - current;
            if (i < tail().array.length) {
                yield tail().array[i];
            }
        });
    }

    awaitAll(): Promise<T extends PromiseLike<infer E> ? E[] : T[]> {
        return Promise.all(this) as any;
    }

    append(item: T) {
        return new StreamImpl<T, T>(this, function* (gen) {
            yield* appendReturned(gen);
            yield item;
        });
    }

    appendIf(condition: boolean, item: T) {
        return new StreamImpl<T, T>(this, function* (gen) {
            yield* appendReturned(gen);
            if (condition) {
                yield item;
            }
        });
    }

    appendAll(newItems: Iterable<T>) {
        return this.appendAllIf(true, newItems);
    }

    appendAllIf(condition: boolean, newItems: Iterable<T>): Stream<T> {
        return new StreamImpl(this, function* (gen) {
            yield* gen;
            if (condition) {
                if (Array.isArray(newItems)) {
                    return {
                        array: newItems as T[],
                        canModify: false,
                    }
                } else {
                    yield* newItems;
                }
            }
        });
    }

    butLast() {
        return new StreamImpl(this, function* (gen) {
            const {head,tail} = matchGenerator(gen);

            let first = true;
            let prev: T = undefined as any as T;
            for (const i of head) {
                if (!first) {
                    yield prev;
                } else {
                    first = false;
                }
                prev = i;
            }

            if (tail().array.length) {
                if (!first) {
                    yield prev;
                }
                return {
                    array: tail().array.slice(0, tail().array.length - 1),
                    canModify: true,
                };
            }
        });
    }

    distinctBy(getKey: (item: T) => any) {
        return new StreamImpl(this, function* (gen) {
            const keys = new Set<T>();
            for (const i of appendReturned(gen)) {
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
        return new StreamImpl(this, function* (gen) {
            for (const i of appendReturned(gen)) {
                if (predicate(i)) {
                    yield i;
                }
            }
        });
    }

    filterWithAssertion<U extends T>(assertion: (item: T) => item is U): Stream<U> {
        return new StreamImpl<T, U>(this, function* (gen) {
            for (const i of appendReturned(gen)) {
                if (assertion(i)) {
                    yield i;
                }
            }
        });
    }

    find(predicate: (item: T) => boolean): Optional<T> {
        return new OptionalImpl(this, function* (gen) {
            for (const i of appendReturned(gen)) {
                if (predicate(i)) {
                    yield i;
                    break;
                }
            }
        });
    }

    flatMap<U>(mapper: (item: T) => Iterable<U>): Stream<U> {
        return new StreamImpl(this, function* (gen) {
            for (const i of appendReturned(gen)) {
                yield* mapper(i);
            }
        });
    }

    forEach(effect: (item: T) => void) {
        for (const i of this) {
            effect(i);
        }
    }

    groupBy<K>(getKey: (item: T) => K) {
        return new StreamImpl<T, readonly [K, T[]]>(this, function* (items) {
            yield* collectToMap(appendReturned(items), getKey);
        });
    }

    head(): Optional<T> {
        return new OptionalImpl<T, T>(this, function* (gen) {
            const n = appendReturned(gen)[Symbol.iterator]().next();
            if (!n.done) {
                yield n.value;
            }
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
        return new OptionalImpl(this, function* (gen) {
            const {head, tail} = matchGenerator(gen);
            let lastInHead: T = undefined as any;
            let foundInHead = false;
            for (const i of head) {
                lastInHead = i;
                foundInHead = true;
            }

            if (tail().array.length) {
                yield tail().array[tail().array.length - 1];
            } else if (foundInHead) {
                yield lastInHead;
            }
        });
    }

    map<U>(mapper: (item: T) => U) {
        return new StreamImpl(this, function* (gen) {
            for (const i of appendReturned(gen)) {
                yield mapper(i);
            }
        });
    }

    randomItem(): Optional<T> {
        return new OptionalImpl(this, function* (gen) {
            const {head, tail} = matchGenerator(gen);
            const headArr = [...head];
            if (headArr.length + tail().array.length === 0) {
                return;
            }

            const i = Math.floor(Math.random() * (headArr.length + tail().array.length));
            if (i < headArr.length) {
                yield headArr[i];
            } else {
                yield tail().array[i - headArr.length];
            }
        });
    }

    reduce(reducer: (l: T, r: T) => T): Optional<T> {
        return new OptionalImpl(this, function* (gen) {
            let found = false;
            let result: T = undefined as any;
            for (const i of appendReturned(gen)) {
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
        return new StreamImpl(this, function* (gen) {
            const a = toModifiableArray(gen);

            for (let i = 0; i < a.length - 1; i++) {
                const j = i + Math.floor(Math.random() * (a.length - i));
                if (i !== j) {
                    [a[i], a[j]] = [a[j], a[i]];
                }
            }

            return {array: a, canModify: true};
        });
    }

    single(): Optional<T> {
        return new OptionalImpl(this, function* (gen) {
            const itr = gen[Symbol.iterator]();
            const n = itr.next();
            if (n.done) {
                if (assertResult(n.value) && n.value.array.length === 1) {
                    yield n.value.array[0];
                }
            } else {
                const nn = itr.next();
                if (nn.done && assertVoid(nn.value)) {
                    yield n.value;
                }
            }
        });
    }

    sortOn(getComparable: (item: T) => (number | string | boolean)) {
        return new StreamImpl(this, function* (gen) {
            const a = toModifiableArray(gen);
            a.sort((a, b) => {
                if (getComparable(a) < getComparable(b)) {
                    return -1;
                }
                if (getComparable(a) > getComparable(b)) {
                    return 1;
                }
                return 0;
            });
            return {
                array: a,
                canModify: true,
            };
        });
    }

    splitWhen(isSplit: (l: T, r: T) => boolean): Stream<T[]> {
        return new StreamImpl(this, function* (gen) {
            let chunk: T[] | undefined = undefined;
            for (const item of appendReturned(gen)) {
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
        return new StreamImpl(this, function* (gen) {
            const {head, tail} = matchGenerator(gen);
            let first = true;
            for (const i of head) {
                if (first) {
                    first = false;
                } else {
                    yield i;
                }
            }

            if (tail().array.length) {
                if (first) {
                    return {
                        array: tail().array.slice(1),
                        canModify: true,
                    }
                } else {
                    return tail();
                }
            }
        });
    }

    take(n: number): Stream<T> {
        return new StreamImpl(this, function* (gen) {
            const {head, tail} = matchGenerator(gen);
            let count = 0;
            for (const i of head) {
                if (count >= n) {
                    return;
                }
                yield i;
                count++;
            }

            const takeFromTail = n - count;
            if (takeFromTail > 0) {
                return {
                    array: tail().array.slice(0, takeFromTail),
                    canModify: true,
                }
            }
        });
    }

    takeRandom(n: number): Stream<T> {
        return new StreamImpl(this, function* (gen) {
            const a = toModifiableArray(gen);
            for (let i = 0; i < Math.min(a.length - 1, n); i++) {
                const j = i + Math.floor(Math.random() * (a.length - i));
                if (i !== j) {
                    [a[i], a[j]] = [a[j], a[i]];
                }
            }
            return {
                array: a.slice(0, Math.min(a.length, n)),
                canModify: true,
            };
        });
    }

    takeLast(n: number) {
        return new StreamImpl(this, function* (gen) {
            const {head, tail} = matchGenerator(gen);
            const buffer = new RingBuffer<T>(n);
            for (const i of head) {
                buffer.add(i);
            }

            const nFromBuffer = n - tail().array.length;
            if (nFromBuffer >= 0) {
                yield* buffer.takeLast(nFromBuffer);
                return {
                    array: tail().array,
                    canModify: tail().canModify,
                }
            } else {
                return {
                    array: tail().array.slice(tail().array.length - n),
                    canModify: true,
                }
            }
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
        return new StreamImpl(this, function* (gen) {
            const oItr = other[Symbol.iterator]();
            for (const i of appendReturned(gen)) {
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
        return new StreamImpl(this, function* (gen) {
            let index = 0;
            for (const i of appendReturned(gen)) {
                yield [i, index++] as const;
            }
        });
    }

    zipWithIndexAndLen(): Stream<readonly [T, number, number]> {
        return new StreamImpl(this, function* (gen) {
            const a = toAnyArray(gen);
            let index = 0;
            for (const i of a) {
                yield [i, index++, a.length] as const;
            }
        });
    }
}
