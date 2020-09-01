import * as Benchmark from 'benchmark';
import { Event } from 'benchmark';
import { genInputs } from './genInput';
import { sink } from './sink';
import { Stream, stream2 } from '../../src';
import Sequence, { asSequence } from 'sequency';
import Lazy from 'lazy.js';

const runs = [0, 1];

export function benchmark(
    name: string,
    fns: {
        str: (input: Stream<number>, n: number) => Stream<number>,
        arr?: (input: number[], n: number) => number[],
        seq?: (input: Sequence<number>, n: number) => Sequence<number>,
        laz?: (input: ReturnType<typeof Lazy>, n: number) => any,
    },
) {
    let suite = new Benchmark.Suite();
    let collector = 0;

    genInputs().forEach(input => runs.forEach(run => (Object.keys(fns) as (keyof typeof fns)[]).forEach(key => {
        const runFn = key === 'str' ? () => fns[key]!(stream2(input), input.length).toArray()
            : key === 'arr' ? () => fns[key]!(input, input.length)
            : key === 'seq' ? () => fns[key]!(asSequence(input), input.length).toArray()
            : key === 'laz' ? () => fns[key]!(Lazy(input) as any, input.length).toArray()
            : undefined as any;
        return suite = suite.add(
            `${ capitalize(key) }(Arr[${ input.length }]).${ name } #${ run }`,
            () => collector += sink(runFn()),
        );
    })));

    suite
        .on('cycle', (event: Event) => console.log(String(event.target)))
        .on('complete', () => console.log(`(collector=${ collector })`))
        .run();
}

function capitalize(s: string) {
    return s.substr(0, 1).toUpperCase() + s.substr(1);
}
