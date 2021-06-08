export class RandomAccessIterator<T> implements Iterator<T> {
    private pos = 0;

    constructor(readonly get: (i: number) => T, readonly size: number) {
    }

    next(): IteratorResult<T> {
        if (this.pos === this.size) {
            return {done: true, value: undefined};
        }
        return {done: false, value: this.get(this.pos++)};
    }
}
