import { Impl } from './impl';
import { Stream } from '../stream';
import { _extends } from './_extends';
// @ts-ignore
// noinspection JSUnusedLocalSymbols
const __extends = _extends;

export const makeInputArrayStream = (impl: Impl) => class InputArrayStream<T> extends impl.ArrayStream<T> implements Stream<T> {
    toArray(): T[] {
        return super.toArray().slice();
    }
}
