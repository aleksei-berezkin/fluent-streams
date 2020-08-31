import { genInputs } from './util/genInput';
import { benchmark } from './util/benchmark';
import { sink } from './util/sink';
import { asSequence } from 'sequency';
import Lazy from 'lazy.js';
import { stream2 } from '../src';

genInputs('append').forEach(([input, getName]) =>
    benchmark(
        {
            name: getName('Str'),
            run: () => sink(
                stream2(input)
                    .append(9.1)
                    .toArray()
            ),
        },
        {
            name: getName('Arr'),
            run: () => sink(
                input
                    .concat(9.1)
            ),
        },
        {
            name: getName('Seq'),
            run: () => sink(
                asSequence(input)
                    .plus(9.1)
                    .toArray()
            ),
        },
        {
            name: getName('Laz'),
            run: () => sink(
                Lazy(input)
                    .concat([9.1])
                    .toArray()
            ),
        },
    )
);
