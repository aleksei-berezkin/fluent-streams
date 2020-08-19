import { Optional } from './optional';
import { StreamOperator } from './streamGenerator';

export interface Stream<T> extends Iterable<T> {
    all(predicate: (item: T) => boolean): boolean;

    any(predicate: (item: T) => boolean): boolean;

    at(index: number): Optional<T>;

    awaitAll(): Promise<T extends PromiseLike<infer E> ? E[] : T[]>;

    append(item: T): Stream<T>;

    appendIf(condition: boolean, item: T): Stream<T>;

    appendAll(items: Iterable<T>): Stream<T>;

    appendAllIf(condition: boolean, items: Iterable<T>): Stream<T>;

    butLast(): Stream<T>;

    distinctBy(getKey: (item: T) => any): Stream<T>;

    equals(other: Iterable<T>): boolean,

    filter(predicate: (item: T) => boolean): Stream<T>;

    filterWithAssertion<U extends T>(assertion: (item: T) => item is U): Stream<U>;

    find(predicate: (item: T) => boolean): Optional<T>;

    flatMap<U>(mapper: (item: T) => Iterable<U>): Stream<U>;

    forEach(effect: (item: T) => void): void;

    groupBy<K>(getKey: (item: T) => K): Stream<readonly [K, T[]]>;

    head(): Optional<T>;

    join(delimiter: string): string;

    joinBy(getDelimiter: (l: T, r: T) => string): string;

    last(): Optional<T>;

    map<U>(mapper: (item: T) => U): Stream<U>;

    randomItem(): Optional<T>

    reduce(reducer: (l: T, r: T) => T): Optional<T>;

    reduceLeft<U>(zero: U, reducer: (l: U, r: T) => U): U;

    reduceRight<U>(zero: U, reducer: (l: T, r: U) => U): U;

    shuffle(): Stream<T>;

    single(): Optional<T>;

    size(): number;

    sortOn(getComparable: (item: T) => number | string | boolean): Stream<T>

    splitWhen(isSplit: (l: T, r: T) => boolean): Stream<T[]>;

    tail(): Stream<T>;

    take(n: number): Stream<T>;

    takeLast(n: number): Stream<T>;

    takeRandom(n: number): Stream<T>;

    toArray(): T[];

    toObject(): T extends readonly [string, any] ? { [key in T[0]]: T[1] } : unknown;

    transformToOptional<U>(operator: StreamOperator<T, U>): Optional<U>;

    transformToStream<U>(operator: StreamOperator<T, U>): Stream<U>;

    zip<U>(other: Iterable<U>): Stream<readonly [T, U]>;

    zipStrict<U>(other: Iterable<U>): Stream<readonly [T, U]>

    zipWithIndex(): Stream<readonly [T, number]>;

    zipWithIndexAndLen(): Stream<readonly [T, number, number]>;
}
