export type StreamGeneratorResult<T> = {
    array: T[],
    canModify: boolean,
};

export function assertVoid<T>(r: StreamGeneratorResult<T> | void): r is void {
    return !r;
}

export function assertResult<T>(r: StreamGeneratorResult<T> | void): r is StreamGeneratorResult<T> {
    return !!r;
}

export type StreamGenerator<T> = Generator<T, StreamGeneratorResult<T> | void, undefined>;

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
    };
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
