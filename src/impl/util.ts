export function* trimIterable<T>(items: Iterable<T>): IterableIterator<T> {
    const n = items[Symbol.iterator]().next();
    if (!n.done) {
        yield n.value;
    }
}