import { Base, BaseImpl } from './base';
import { Optional } from '../optional';
import { Stream } from '../stream';
import { StreamImpl } from './streamImpl';
import { StreamGenerator } from './streamGenerator';
import { appendReturned } from './util';

export class OptionalImpl<P, T> extends BaseImpl<P, T> implements Optional<T> {
    constructor(parent: Base<P> | undefined,
                operation: (input: StreamGenerator<P>) => StreamGenerator<T>) {
        super(parent, operation);
    }

    filter(predicate: (item: T) => boolean) {
        return new OptionalImpl(this, function* (gen) {
            const n = appendReturned(gen)[Symbol.iterator]().next();
            if (!n.done && predicate(n.value)) {
                yield n.value;
            }
        });
    }

    has(predicate: (item: T) => boolean) {
        const n = this[Symbol.iterator]().next();
        return !n.done && predicate(n.value);
    }

    hasNot(predicate: (item: T) => boolean) {
        const n = this[Symbol.iterator]().next();
        return n.done || !predicate(n.value);
    }

    flatMap<U>(mapper: (item: T) => Iterable<U>) {
        return new StreamImpl(this, function* (gen) {
            const n = appendReturned(gen)[Symbol.iterator]().next();
            if (!n.done) {
                yield* mapper(n.value);
            }
        });
    }

    flatMapOptional<U>(mapper: (item: T) => Optional<U>) {
        return new OptionalImpl(this, function* (gen) {
            const n = appendReturned(gen)[Symbol.iterator]().next();
            if (!n.done) {
                const res = mapper(n.value).resolve();
                if (res.has) {
                    yield res.val;
                }
            }
        });
    }

    get() {
        const n = this[Symbol.iterator]().next();
        if (n.done) {
            throw new Error('No value');
        }
        return n.value;
    }

    hasValue() {
        return !this[Symbol.iterator]().next().done;
    }

    is(item: T) {
        const n = this[Symbol.iterator]().next();
        return !n.done && n.value === item;
    }

    map<U>(mapper: (item: T) => U) {
        return new OptionalImpl(this, function* (gen) {
            const n = appendReturned(gen)[Symbol.iterator]().next();
            if (!n.done) {
                yield mapper(n.value);
            }
        });
    }

    mapNullable<U>(mapper: (item: T) => (U | null | undefined)) {
        return new OptionalImpl<T, U>(this, function* (gen) {
            const n = appendReturned(gen)[Symbol.iterator]().next();
            if (!n.done) {
                const mapped = mapper(n.value);
                if (mapped != null) {
                    yield mapped;
                }
            }
        });
    }

    orElse<U>(other: U): T | U {
        const n = this[Symbol.iterator]().next();
        if (!n.done) {
            return n.value;
        }
        return other;
    }

    orElseGet<U>(get: () => U): T | U {
        const n = this[Symbol.iterator]().next();
        if (!n.done) {
            return n.value;
        }
        return get();
    }

    orElseNull(): T | null {
        const n = this[Symbol.iterator]().next();
        if (!n.done) {
            return n.value;
        }
        return null;
    }

    orElseThrow(createError: () => Error = () => new Error('Empty optional')): T {
        const n = this[Symbol.iterator]().next();
        if (!n.done) {
            return n.value;
        }
        throw createError();
    }

    orElseUndefined(): T | undefined {
        const n = this[Symbol.iterator]().next();
        if (!n.done) {
            return n.value;
        }
        return undefined;
    }

    resolve(): {has: true, val: T} | {has: false} {
        const n = this[Symbol.iterator]().next();
        if (!n.done) {
            return {has: true, val: n.value};
        }
        return {has: false as const};
    }

    toStream(): Stream<T> {
        return new StreamImpl(this, i => i);
    }
}
