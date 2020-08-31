import { genInputs } from './util/genInput';
import { benchmark } from './util/benchmark';
import { sink } from './util/sink';
import { stream2 } from '../src';
import { asSequence } from 'sequency';
import Lazy from 'lazy.js';

genInputs('distinct').forEach(([input, getName]) =>
    benchmark(
        {
            name: getName('Str'),
            run: () => sink(
                stream2(input)
                    .distinctBy(i => i)
                    .toArray()
            ),
        },
        {
            name: getName('Seq'),
            run: () => sink(
                asSequence(input)
                    .distinct()
                    .toArray()
            ),
        },
        {
            name: getName('Laz'),
            run: () => sink(
                Lazy(input)
                    .uniq()
                    .toArray()
            ),
        },
    )
);
