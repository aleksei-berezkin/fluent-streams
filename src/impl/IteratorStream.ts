import { Impl } from './impl';
import { Stream } from '../stream';
import { _extends } from './helpers';
// @ts-ignore
const __extends = _extends;

export const makeIteratorStream = (impl: Impl) => class IteratorStream<T> extends impl.AbstractStream<T> implements Stream<T> {
    constructor(readonly createIterator: () => Iterator<T>) {
        super();
    }

    [Symbol.iterator](): Iterator<T> {
        return this.createIterator();
    }
}
