import { Impl } from './impl';
import { Stream } from '../stream';

export const makeInputArrayStream = (impl: Impl) => class InputArrayStream<T> extends impl.ArrayStream<T> implements Stream<T> {
    toArray(): T[] {
        return super.toArray().slice();
    }
}
