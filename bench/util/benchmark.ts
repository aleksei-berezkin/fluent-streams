import * as Benchmark from 'benchmark';
import { Event } from 'benchmark';
import { genInputs } from './genInput';
import { sink } from './sink';

const runs = [0, 1];

export function benchmark(
    name: string,
    fns: {
        str: (input: number[]) => number[],
        arr?: (input: number[]) => number[],
        seq?: (input: number[]) => number[],
        laz?: (input: number[]) => number[],
    },
) {
    let suite = new Benchmark.Suite();
    let collector = 0;

    genInputs().forEach(input => runs.forEach(run => Object.keys(fns).forEach(key =>
        suite = suite.add(
            `${ capitalize(key) }[${ input.length }].${ name } #${ run }`,
            () => collector += sink(fns[key as keyof typeof fns]!(input)),
        )
    )));

    suite
        .on('cycle', (event: Event) => console.log(String(event.target)))
        .on('complete', () => console.log(`(collector=${ collector })`))
        .run();
}

function capitalize(s: string) {
    return s.substr(0, 1).toUpperCase() + s.substr(1);
}
