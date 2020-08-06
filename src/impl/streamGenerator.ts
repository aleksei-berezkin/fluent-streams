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
