import { Stream } from '../stream';
import { Impl } from './impl';
import { _extends } from './_extends';
// @ts-ignore
// noinspection JSUnusedLocalSymbols
const __extends = _extends;

export const makeArrayStream = (impl: Impl) => class ArrayStream<T> extends impl.RandomAccessStream<T> implements Stream<T> {
    constructor(readonly array: T[]) {
        super(i => array[i], () => array.length);
    }

    [Symbol.iterator](): Iterator<T> {
        return this.array[Symbol.iterator]();
    }

    forEach(effect: (i: T) => void) {
        this.array.forEach(effect);
    }

    toArray(): T[] {
        return this.array;
    }

    zipWithIndex(): Stream<readonly [T, number]> {
        return new impl.RandomAccessStream(
            i => [this.array[i], i] as const,
            this.length,
        );
    }

    zipWithIndexAndLen(): Stream<readonly [T, number, number]> {
        return new impl.RandomAccessStream(
            i => [this.array[i], i, this.array.length] as const,
            () => this.array.length,
        );
    }
}
