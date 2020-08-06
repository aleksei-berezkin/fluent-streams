import { StreamGenerator } from './streamGenerator';
import { appendReturned, matchGenerator, toModifiableArray } from './util';

export interface Base<T> {
    createGenerator(): StreamGenerator<T>;
}

export class BaseImpl<P, T> implements Base<T>, Iterable<T> {
    public constructor(private parent: Base<P> | undefined,
                          private readonly operation: (input: StreamGenerator<P>) => StreamGenerator<T>) {
    }

    [Symbol.iterator](): Iterator<T> {
        return appendReturned(this.createGenerator())[Symbol.iterator]();
    }

    createGenerator(): StreamGenerator<T> {
        const resultParent = this.parent
            ? this.parent.createGenerator()
            : undefined as any as StreamGenerator<P>;

        return this.operation(resultParent);
    }

    size(): number {
        const {head, tail} = matchGenerator(this.createGenerator());
        let counter = 0;
        for (const _ of head) {
            counter++;
        }
        return counter + tail().array.length;
    }

    toArray(): T[] {
        return toModifiableArray(this.createGenerator());
    }
}
