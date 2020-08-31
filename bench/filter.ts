import { genInputs } from './util/genInput';
import { benchmark } from './util/benchmark';
import { sink } from './util/sink';
import { stream2 } from '../src';
import { asSequence } from 'sequency';
import Lazy from 'lazy.js';

genInputs('filter').forEach(([input, getName]) =>
    benchmark(
        {
            name: getName('Str'),
            run: () => sink(
                stream2(input)
                    .filter(i => i > 0)
                    .toArray()
            ),
        },
        {
            name: getName('Arr'),
            run: () => sink(
                input
                    .filter(i => i > 0)
            ),
        },
        {
            name: getName('Seq'),
            run: () => sink(
                asSequence(input)
                    .filter(i => i > 0)
                    .toArray()
            ),
        },
        {
            name: getName('Laz'),
            run: () => sink(
                Lazy(input)
                    .filter(i => i > 0)
                    .toArray()
            ),
        },
    )
);
