import type { Stream } from '..';
import type { Optional } from '..';
import { testIterator } from './testIterator';
import { optional, stream } from '..';

export function forStreamInput<T, Out extends Stream<unknown> | Optional<unknown>>(
    input: T[],
    build: (base: Stream<T>) => Out,
    sink: (out: Out, inputHint: () => string) => void,
    testItr = true,
) {
    forInput<T, Stream<T>, Out>(
        input,
        [
            a => stream({
                [Symbol.iterator]() {
                    return a[Symbol.iterator]()
                }
            }),
            a => stream(a),
            a => stream(a).reverse().reverse(),
        ],
        build,
        sink,
        testItr,
    )
}

export const streamInputRuns = 3;

export function forOptionalInput<T, Out extends Stream<unknown> | Optional<unknown>>(
    input: T[],
    build: (base: Optional<T>) => Out,
    sink: (out: Out, inputHint: () => string) => void,
) {
    forInput<T, Optional<T>, Out>(
        input,
        [
            a => optional(a),
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
