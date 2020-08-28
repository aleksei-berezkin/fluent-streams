import { stream, stream2 } from '../src';
import { benchmark } from './util/benchmark';
import { asSequence } from 'sequency';
import Lazy from 'lazy.js';
import { genInputs } from './util/genInput';
import { sink } from './util/sink';

genInputs('flatMap').forEach(([input, getName]) =>
    benchmark(
        {
            name: getName('St1'),
            run: () => sink(
                stream(input)
                    .flatMap(i => [i + 4.4, i - 5.5, i * 1.9])
                    .toArray()
            ),
        },
        {
            name: getName('St2'),
            run: () => sink(
                stream2(input)
                    .flatMap(i => [i + 4.4, i - 5.5, i * 1.9])
                    .toArray()
            ),
        },
        {
            name: getName('Arr'),
            run: () => sink(
                input
                    .flatMap(i => [i + 4.4, i - 5.5, i * 1.9])
            ),
        },
        {
            name: getName('Seq'),
            run: () => sink(
                asSequence(input)
                    .flatMap(i => asSequence([i + 4.4, i - 5.5, i * 1.9]))
                    .toArray()
            ),
        },
        {
            name: getName('Laz'),
            run: () => sink(
                Lazy(input)
                    .map(i => Lazy([i + 4.4, i - 5.5, i * 1.9]))
                    .flatten()
                    .toArray()
            ),
        }
    )
);
