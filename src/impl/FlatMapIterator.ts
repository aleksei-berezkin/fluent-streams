export class FlatMapIterator<T, U> implements Iterator<U> {
    private inner: Iterator<U> = undefined as any;
    private inInner = false;

    constructor(private input: Iterator<T>, private readonly mapper: (item: T) => Iterable<U>) {
    }

    next(): IteratorResult<U> {
        for ( ; ; ) {
            if (this.inInner) {
                const i = this.inner.next();
                if (!i.done) return i;
            }

            const o = this.input.next();

            if (o.done) {
                return {done: true, value: undefined};
            }

            this.inner = this.mapper(o.value)[Symbol.iterator]();
            this.inInner = true;
        }
    }
}