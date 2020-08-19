import { Stream } from './stream';

export interface Optional<T> extends Iterable<T> {
    filter(predicate: (item: T) => boolean): Optional<T>;

    flatMap<U>(mapper: (item: T) => Iterable<U>): Optional<U>;

    flatMapToStream<U>(mapper: (item: T) => Iterable<U>): Stream<U>;

    get(): T;

    has(predicate: (item: T) => boolean): boolean;

    hasNot(predicate: (item: T) => boolean): boolean;

    is(item: T): boolean;

    isPresent(): boolean;

    map<U>(mapper: (item: T) => U): Optional<U>;

    mapNullable<U>(mapper: (item: T) => U | null | undefined): Optional<U>;

    orElse<U>(other: U): T | U;

    orElseGet<U>(get: () => U): T | U;

    orElseNull(): T | null;

    orElseThrow(createError?: () => Error): T;

    orElseUndefined(): T | undefined;

    resolve(): {has: true, val: T} | {has: false}

    toArray(): T[];

    toStream(): Stream<T>;
}
