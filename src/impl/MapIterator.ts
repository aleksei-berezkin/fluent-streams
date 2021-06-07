export class MapIterator<T, U> implements Iterator<U> {
    constructor(private readonly input: Iterator<T>, private readonly mapper: (item: T) => U) {
    }

    next(): IteratorResult<U> {
        const n = this.input.next();
        if (n.done) {
            return {done: true, value: undefined};
        }
        return {done: false, value: this.mapper(n.value)};
    }

}