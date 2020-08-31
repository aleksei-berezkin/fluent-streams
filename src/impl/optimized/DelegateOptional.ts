import { Optional } from '../../optional';
import { Stream } from '../../stream';
import { DelegateStream } from './DelegateStream';

export class DelegateOptional<T> implements Optional<T> {
    constructor(private readonly getDelegate: () => Optional<T>) {
    }

    [Symbol.iterator](): Iterator<T> {
        return this.getDelegate()[Symbol.iterator]();
    }

    filter(predicate: (item: T) => boolean): Optional<T> {
        return new DelegateOptional(() => this.getDelegate().filter(predicate));
    }

    flatMap<U>(mapper: (item: T) => Iterable<U>): Optional<U> {
        return new DelegateOptional(() => this.getDelegate().flatMap(mapper));
    }

    flatMapToStream<U>(mapper: (item: T) => Iterable<U>): Stream<U> {
        return new DelegateStream(() => this.getDelegate().flatMapToStream(mapper));
    }

    get(): T {
        return this.getDelegate().get();
    }

    has(predicate: (item: T) => boolean): boolean {
        return this.getDelegate().has(predicate);
    }

    hasNot(predicate: (item: T) => boolean): boolean {
        return this.getDelegate().hasNot(predicate);
    }

    is(item: T): boolean {
        return this.getDelegate().is(item);
    }

    isPresent(): boolean {
        return this.getDelegate().isPresent();
    }

    map<U>(mapper: (item: T) => U): Optional<U> {
        return new DelegateOptional(() => this.getDelegate().map(mapper));
    }

    mapNullable<U>(mapper: (item: T) => (U | null | undefined)): Optional<U> {
        return new DelegateOptional(() => this.getDelegate().mapNullable(mapper));
    }

    orElse<U>(other: U): T | U {
        return this.getDelegate().orElse(other);
    }

    orElseGet<U>(get: () => U): T | U {
        return this.getDelegate().orElseGet(get);
    }

    orElseNull(): T | null {
        return this.getDelegate().orElseNull();
    }

    orElseThrow(createError?: () => Error): T {
        return this.getDelegate().orElseThrow(createError);
    }

    orElseUndefined(): T | undefined {
        return this.getDelegate().orElseUndefined();
    }

    resolve(): {has: true; val: T} | {has: false} {
        return this.getDelegate().resolve();
    }

    toArray(): T[] {
        return this.getDelegate().toArray();
    }

    toStream(): Stream<T> {
        return new DelegateStream(() => this.getDelegate().toStream());
    }
}
