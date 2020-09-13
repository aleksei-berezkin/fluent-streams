import { Stream } from '../stream';
import { Optional } from '../optional';
import { DelegateOptional } from './DelegateOptional';

export class DelegateStream<T> implements Stream<T> {
    constructor(private readonly getDelegate: () => Stream<T>) {
    }

    [Symbol.iterator](): Iterator<T> {
        return this.getDelegate()[Symbol.iterator]();
    }

    all(predicate: (item: T) => boolean): boolean {
        return this.getDelegate().all(predicate);
    }

    any(predicate: (item: T) => boolean): boolean {
        return this.getDelegate().any(predicate);
    }

    append(item: T): Stream<T> {
        return new DelegateStream(() => this.getDelegate().append(item));
    }

    appendAll(items: Iterable<T>): Stream<T> {
        return new DelegateStream(() => this.getDelegate().appendAll(items));
    }

    appendAllIf(condition: boolean, items: Iterable<T>): Stream<T> {
        return new DelegateStream(() => this.getDelegate().appendAllIf(condition, items));
    }

    appendIf(condition: boolean, item: T): Stream<T> {
        return new DelegateStream(() => this.getDelegate().appendIf(condition, item));
    }

    at(index: number): Optional<T> {
        return new DelegateOptional(() => this.getDelegate().at(index));
    }

    awaitAll(): Promise<T extends PromiseLike<infer E> ? E[] : T[]> {
        return this.getDelegate().awaitAll();
    }

    butLast(): Stream<T> {
        return new DelegateStream(() => this.getDelegate().butLast());
    }

    distinctBy(getKey: (item: T) => any): Stream<T> {
        return new DelegateStream(() => this.getDelegate().distinctBy(getKey));
    }

    equals(other: Iterable<T>): boolean {
        return this.getDelegate().equals(other);
    }

    filter(predicate: (item: T) => boolean): Stream<T> {
        return new DelegateStream(() => this.getDelegate().filter(predicate));
    }

    filterWithAssertion<U extends T>(assertion: (item: T) => item is U): Stream<U> {
        return new DelegateStream(() => this.getDelegate().filterWithAssertion(assertion));
    }

    find(predicate: (item: T) => boolean): Optional<T> {
        return new DelegateOptional(() => this.getDelegate().find(predicate));
    }

    flatMap<U>(mapper: (item: T) => Iterable<U>): Stream<U> {
        return new DelegateStream(() => this.getDelegate().flatMap(mapper));
    }

    forEach(effect: (item: T) => void): void {
        return this.getDelegate().forEach(effect);
    }

    groupBy<K>(getKey: (item: T) => K): Stream<readonly [K, T[]]> {
        return new DelegateStream(() => this.getDelegate().groupBy(getKey));
    }

    head(): Optional<T> {
        return new DelegateOptional(() => this.getDelegate().head());
    }

    join(delimiter: string): string {
        return this.getDelegate().join(delimiter);
    }

    joinBy(getDelimiter: (l: T, r: T) => string): string {
        return this.getDelegate().joinBy(getDelimiter);
    }

    last(): Optional<T> {
        return new DelegateOptional(() => this.getDelegate().last());
    }

    map<U>(mapper: (item: T) => U): Stream<U> {
        return new DelegateStream(() => this.getDelegate().map(mapper));
    }

    randomItem(): Optional<T> {
        return new DelegateOptional(() => this.getDelegate().randomItem());
    }

    reduce(reducer: (l: T, r: T) => T): Optional<T> {
        return new DelegateOptional(() => this.getDelegate().reduce(reducer));
    }

    reduceLeft<U>(zero: U, reducer: (l: U, r: T) => U): U {
        return this.getDelegate().reduceLeft(zero, reducer);
    }

    reduceRight<U>(zero: U, reducer: (l: T, r: U) => U): U {
        return this.getDelegate().reduceRight(zero, reducer);
    }

    shuffle(): Stream<T> {
        return new DelegateStream(() => this.getDelegate().shuffle());
    }

    single(): Optional<T> {
        return new DelegateOptional(() => this.getDelegate().single());
    }

    size(): number {
        return this.getDelegate().size();
    }

    sortBy(getComparable: (item: T) => (number | string | boolean)): Stream<T> {
        return new DelegateStream(() => this.getDelegate().sortBy(getComparable));
    }

    splitWhen(isSplit: (l: T, r: T) => boolean): Stream<T[]> {
        return new DelegateStream(() => this.getDelegate().splitWhen(isSplit));
    }

    tail(): Stream<T> {
        return new DelegateStream(() => this.getDelegate().tail());
    }

    take(n: number): Stream<T> {
        return new DelegateStream(() => this.getDelegate().take(n));
    }

    takeLast(n: number): Stream<T> {
        return new DelegateStream(() => this.getDelegate().takeLast(n));
    }

    takeRandom(n: number): Stream<T> {
        return new DelegateStream(() => this.getDelegate().takeRandom(n));
    }

    toArray(): T[] {
        return this.getDelegate().toArray();
    }

    toObject(): T extends readonly [string | number | symbol, any] ? { [key in T[0]]: T[1] } : unknown {
        return this.getDelegate().toObject();
    }

    transform<U>(operator: (input: Iterable<T>) => Iterator<U>): Stream<U> {
        return new DelegateStream(() => this.getDelegate().transform(operator));
    }

    transformToOptional<U>(operator: (input: Iterable<T>) => Iterator<U>): Optional<U> {
        return new DelegateOptional(() => this.getDelegate().transformToOptional(operator));
    }

    zip<U>(other: Iterable<U>): Stream<readonly [T, U]> {
        return new DelegateStream(() => this.getDelegate().zip(other));
    }

    zipStrict<U>(other: Iterable<U>): Stream<readonly [T, U]> {
        return new DelegateStream(() => this.getDelegate().zipStrict(other));
    }

    zipWithIndex(): Stream<readonly [T, number]> {
        return new DelegateStream(() => this.getDelegate().zipWithIndex());
    }

    zipWithIndexAndLen(): Stream<readonly [T, number, number]> {
        return new DelegateStream(() => this.getDelegate().zipWithIndexAndLen());
    }
}
