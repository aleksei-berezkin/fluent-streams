import * as Benchmark from 'benchmark';
import { Event } from 'benchmark';
import { genInputs } from './genInput';
import { sink } from './sink';
import { Stream, stream } from '../../src';
import Sequence, { asSequence } from 'sequency';
import Lazy from 'lazy.js';
import { asIterable } from './asIterable';
import { LazyGen } from './lazyGen';

const inputAsItr = [false, true];
const runs = [0, 1];

export function benchmark(
    name: string,
    fns: {
        str: (input: Stream<number>, n: number) => Stream<number> | number | string | undefined,
        arr?: (input: number[], n: number, canModify: boolean) => number[] | number | string | undefined,
        seq?: (input: Sequence<number>, n: number) => Sequence<number> | number | null | string | undefined,
        laz?: (input: ReturnType<typeof Lazy>, n: number) => {toArray: () => number[]} | number | string | undefined,
    },
) {
    let suite = new Benchmark.Suite();
    let collector = 0;

    genInputs().forEach(a => inputAsItr.forEach(asItr => runs.forEach(run => (Object.keys(fns) as (keyof typeof fns)[]).forEach(key => {
        const runFn
            = key === 'str' ? () => fns[key]!(stream(asItr ? asIterable(a) : a), a.length)
            : key === 'arr' ? () => fns[key]!(asItr ? [...asIterable(a)] : a, a.length, asItr)
            : key === 'seq' ? () => fns[key]!(asSequence(asItr ? asIterable(a) : a), a.length)
            : key === 'laz' ? () => fns[key]!(asItr ? LazyGen(a) : Lazy(a), a.length)
            : undefined as any;
        return suite = suite.add(
            `${ capitalize(key) }(${ asItr ? 'Itr' : 'Arr' }[${ a.length }]).${ name } #${ run }`,
            () => collector += sink(runFn()),
        );
    }))));

    suite
        .on('cycle', (event: Event) => console.log(String(event.target)))
        .on('complete', () => console.log(`(collector=${ collector })`))
        .run();
}

function capitalize(s: string) {
    return s.substr(0, 1).toUpperCase() + s.substr(1);
}
