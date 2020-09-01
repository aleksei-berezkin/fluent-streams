export function asIterable<T>(a: T[]): Iterable<T> {
    return {
        [Symbol.iterator]() {
            let i = 0;
            return {
                next(): IteratorResult<T> {
                    if (i === a.length) return {done: true, value: undefined};
                    return {done: false, value: a[i++]};
                }
            }
        }
    }
}
