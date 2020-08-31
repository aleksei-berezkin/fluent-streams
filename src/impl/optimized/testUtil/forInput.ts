import { Stream } from '../../../stream';
import { ArrayStream, InputArrayStream, IteratorStream, RandomAccessStream } from '../Stream2';
import { DelegateStream } from '../DelegateStream';
import { Optional } from '../../../optional';
import { testIterator } from './testIterator';

export function forInput<T, Out extends Stream<T> | Optional<T>>(
    input: T[],
    build: (base: Stream<T>) => Out,
    sink: (out: Out, inputHint: () => string) => void,
) {
    function step(create: (a: T[]) => Stream<T>) {
        const _input: T[] = [];
        const base = create(_input);
        const output = build(base);
        _input.push(...input);
        const inputHint = () => (base as any).constructor.name;
        sink(output, inputHint);
        testIterator(output, inputHint);
    }

    const creators: ((a: T[]) => Stream<T>)[] =
        [
            a => new IteratorStream(() => a[Symbol.iterator]()),
            a => new InputArrayStream(a),
            a => new RandomAccessStream(i => a[i], () => a.length),
            a => new DelegateStream(() => new ArrayStream([...a])),
        ];
    creators.forEach(step);
}
