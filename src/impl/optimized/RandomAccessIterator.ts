export class RandomAccessIterator<T> implements Iterator<T> {
    private pos = -1;

    constructor(private readonly get: (i: number) => T, private readonly length: number) {
    }

    next(): IteratorResult<T> {
        if (++this.pos == this.length) {
            return {done: true, value: undefined};
        }
        return {done: false, value: this.get(this.pos)};
    }
}