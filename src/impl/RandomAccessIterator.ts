export class RandomAccessIterator<T> implements Iterator<T> {
    private pos = 0;

    constructor(readonly get: (i: number) => T, readonly length: number) {
    }

    next(): IteratorResult<T> {
        if (this.pos === this.length) {
            return {done: true, value: undefined};
        }
        return {done: false, value: this.get(this.pos++)};
    }
}
