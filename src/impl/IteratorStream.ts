import { Impl } from './impl';
import { Stream } from '../stream';

export default (impl: Impl) => class IteratorStream<T> extends impl.AbstractStream<T> implements Stream<T> {
    constructor(private readonly createIterator: () => Iterator<T>) {
        super();
    }

    [Symbol.iterator](): Iterator<T> {
        return this.createIterator();
    }
}
