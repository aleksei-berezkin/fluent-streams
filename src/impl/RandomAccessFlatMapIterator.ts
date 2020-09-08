import { RandomAccessSpec } from './RandomAccessSpec';

export class RandomAccessFlatMapIterator<T> implements Iterator<T> {
    private readonly get: (i: number) => Iterable<T>;
    private readonly length: number;
    private inner: Iterator<T> = undefined as any;
    private pos = -1;

    constructor(spec: RandomAccessSpec<Iterable<T>>) {
        this.get = spec.get;
        this.length = spec.length;
    }

    next(): IteratorResult<T> {
        for ( ; ; ) {
            if (this.pos >= 0) {
                const i = this.inner.next();
                if (!i.done) return i;
            }
            if (this.pos === this.length - 1) {
                return {done: true, value: undefined};
            }
            this.inner = this.get(++this.pos)[Symbol.iterator]();
        }
    }
}