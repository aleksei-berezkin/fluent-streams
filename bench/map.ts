import { stream, stream2 } from '../src';
import { benchmark } from './util/benchmark';
import { asSequence } from 'sequency';
import Lazy from 'lazy.js';
import { genInputs } from './util/genInput';
import { sink } from './util/sink';

genInputs('map').forEach(([input, getName]) =>
    benchmark(
        {
            name: getName('St1'),
            run: () => sink(
                stream(input)
                    .map(i => i - 2.9)
                    .toArray()
            ),
        },
        {
            name: getName('St2'),
            run: () => sink(
                stream2(input)
                    .map(i => i - 2.9)
                    .toArray()
            ),
        },
        {
            name: getName('Arr'),
            run: () => sink(
                input
                    .map(i => i - 2.9)
            ),
        },
        {
            name: getName('Seq'),
            run: () => sink(
                asSequence(input)
                    .map(i => i - 2.9)
                    .toArray()
            ),
        },
        {
            name: getName('Laz'),
            run: () => sink(
                Lazy(input)
                    .map(i => i - 2.9)
                    .toArray()
            ),
        },
    )
);
