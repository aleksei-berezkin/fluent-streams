import { Stream } from '../../stream';
import { ArrayStream, InputArrayStream, IteratorStream, RandomAccessStream, SimpleOptional } from '../indexImpl';
import { DelegateStream } from '../DelegateStream';
import { Optional } from '../../optional';
import { testIterator } from './testIterator';
import { DelegateOptional } from '../DelegateOptional';

export function forStreamInput<T, Out extends Stream<unknown> | Optional<unknown>>(
    input: T[],
    build: (base: Stream<T>) => Out,
    sink: (out: Out, inputHint: () => string) => void,
    testItr = true,
) {
    forInput<T, Stream<T>, Out>(
        input,
        [
            a => new IteratorStream(() => a[Symbol.iterator]()),
            a => new InputArrayStream(a),
            a => new RandomAccessStream(() => ({get: i => a[i], length: a.length})),
            a => new DelegateStream(() => new ArrayStream([...a])),
        ],
        build,
        sink,
        testItr,
    );
}

export function forOptionalInput<T, Out extends Stream<unknown> | Optional<unknown>>(
    input: T[],
    build: (base: Optional<T>) => Out,
    sink: (out: Out, inputHint: () => string) => void,
) {
    forInput<T, Optional<T>, Out>(
        input,
        [
            a => new SimpleOptional(() => a[Symbol.iterator]().next()),
            a => new DelegateOptional(() => new SimpleOptional(() => a[Symbol.iterator]().next())),
        ],
        build,
        sink,
        true,
    );
}

function forInput<T, In extends Stream<T> | Optional<T>, Out extends Stream<unknown> | Optional<unknown>>(
    input: T[],
    creators: ((a: T[]) => In)[],
    build: (base: In) => Out,
    sink: (out: Out, inputHint: () => string) => void,
    testItr = true,
) {
    function step(create: (a: T[]) => In) {
        const _input: T[] = [];
        const base = create(_input);
        const inputHint = () => (base as any).constructor.name;

        const output = build(base);
        _input.push(...input);
        sink(output, inputHint);

        if (testItr) {
            testIterator(output, inputHint);
        }
    }

    creators.forEach(step);
}
