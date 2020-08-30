import { Stream } from '../../../stream';
import { ArrayStream, InputArrayStream, IteratorStream, RandomAccessStream } from '../Stream2';
import { DelegateStream } from '../DelegateStream';

export function forInput<T, Out>(
    input: T[],
    build: (base: Stream<T>) => Out,
    sink: (out: Out, inputHint: () => string) => void,
) {
    function step(create: (a: T[]) => Stream<T>) {
        const _input: T[] = [];
        const base = create(_input);
        const output = build(base);
        _input.push(...input);
        sink(output, () => (base as any).constructor.name);
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
