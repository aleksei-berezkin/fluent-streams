import { Impl } from './impl';
import { Stream } from '../stream';

export const makeIteratorStream = (impl: Impl) => class IteratorStream<T> extends impl.AbstractStream<T> implements Stream<T> {
    constructor(readonly createIterator: () => Iterator<T>) {
        super();
    }

    [Symbol.iterator](): Iterator<T> {
        return this.createIterator();
    }
}
