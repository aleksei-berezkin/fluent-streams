import * as Benchmark from 'benchmark';
import { Event } from 'benchmark';

export type Spec = {
    name: string,
    run: () => number,
}

const runsNum = 2;

export function benchmark(...specs: Spec[]) {
    let suite = new Benchmark.Suite();
    let collector = 0;
    for (let i = 0; i < runsNum; i++) {
        for (const s of specs) {
            suite = suite.add(
                `${s.name} #${i}`,
                () => collector += s.run()
            );
        }
    }

    suite
        .on('cycle', (event: Event) => console.log(String(event.target)))
        .on('complete', () => console.log(`(collector=${ collector })`))
        .run();
}
