export abstract class Base<P, T> implements Iterable<T> {
    protected constructor(private parent: Iterable<P>,
                          private readonly operation: (input: Iterable<P>) => Iterable<T>) {
    }

    [Symbol.iterator](): Iterator<T> {
        return this.operation(this.parent)[Symbol.iterator]();
    }

    size(): number {
        let counter = 0;
        for (const _ in this) {
            counter++;
        }
        return counter;
    }

    toArray(): T[] {
        return [...this];
    }
}