export class RandomAccessIterator<T> implements Iterator<T> {
    private pos = 0;
    private readonly get: (i: number) => T;
    private readonly length: number;

    constructor(spec: {get: (i: number) => T, length: number}) {
        this.get = spec.get;
        this.length = spec.length;
    }

    next(): IteratorResult<T> {
        if (this.pos === this.length) {
            return {done: true, value: undefined};
        }
        return {done: false, value: this.get(this.pos++)};
    }
}
