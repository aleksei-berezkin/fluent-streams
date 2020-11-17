import { Stream } from '../stream';
import { Impl } from './impl';

export default (impl: Impl) => class ArrayStream<T> extends impl.RandomAccessStream<T> implements Stream<T> {
    constructor(private readonly array: T[]) {
        super(() => ({get: i => array[i], length: array.length}));
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
        return new impl.RandomAccessStream(() => ({
            get: i => [this.array[i], i] as const,
            length: this.array.length,
        }));
    }

    zipWithIndexAndLen(): Stream<readonly [T, number, number]> {
        return new impl.RandomAccessStream(() => ({
            get: i => [this.array[i], i, this.array.length] as const,
            length: this.array.length,
        }));
    }
}