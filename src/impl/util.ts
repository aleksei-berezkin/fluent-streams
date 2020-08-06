import { StreamGenerator, StreamGeneratorResult } from './streamGenerator';

export function trimIterable<T>(items: Iterable<T>): Iterable<T> {
    return {
        [Symbol.iterator](): Iterator<T> {
            return function* () {
                const n = items[Symbol.iterator]().next();
                if (!n.done) {
                    yield n.value;
                }
            }();
        }
    };
}

export function collectToMap<K, T>(items: Iterable<T>, getKey: (item: T) => K) {
    const m = new Map<K, T[]>();
    for (const i of items) {
        const k = getKey(i);
        if (m.has(k)) {
            m.get(k)!.push(i);
        } else {
            m.set(k, [i]);
        }
    }
    return m;
}

export function appendReturned<T>(items: StreamGenerator<T>): Iterable<T> {
    return {
        *[Symbol.iterator]() {
            const returned = yield* items;
            if (returned) {
                yield* returned.array;
            }
        },
    };
}

export function captureReturned<T>(items: Iterable<T>): Iterable<T> & { returned: T[] | undefined } {
    const _items = {
        *[Symbol.iterator](): IterableIterator<T> {
            _items.returned = yield* items;
        },
        returned: undefined as T[] | undefined,
    };
    return _items;
}

export function matchGenerator<T>(items: StreamGenerator<T>): {
    head: Iterable<T>,
    tail: () => StreamGeneratorResult<T>,
} {
    let returned: StreamGeneratorResult<T>;
    return {
        head: {
            *[Symbol.iterator](): Iterator<T> {
                returned = (yield* items) || {array: [], canModify: true};
            },
        },
        tail: () => {
            if (!returned) {
                throw Error('Head is not done');
            }
            return returned;
        }
    }
}

export function toModifiableArray<T>(gen: StreamGenerator<T>): T[] {
    const {head, tail} = matchGenerator(gen);
    const a = [...head];

    if (a.length) {
        a.push(...tail().array);
        return a;
    }

    if (tail().canModify) {
        return tail().array;
    }

    return [...tail().array];
}

export function toAnyArray<T>(gen: StreamGenerator<T>): T[] {
    const {head, tail} = matchGenerator(gen);
    const a = [...head];

    if (a.length) {
        a.push(...tail().array);
        return a;
    }

    return tail().array;
}
