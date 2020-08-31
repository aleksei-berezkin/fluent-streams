import { genInputs } from './util/genInput';
import { benchmark } from './util/benchmark';
import { sink } from './util/sink';
import { stream2 } from '../src';
import { asSequence } from 'sequency';
import Lazy from "lazy.js";

genInputs('appendAll').forEach(([input, getName]) =>
    benchmark(
        {
            name: getName('Str'),
            run: () => sink(
                stream2(input)
                    .appendAll([1.1, 4.2, -.4])
                    .toArray()
            ),
        },
        {
            name: getName('Arr'),
            run: () => sink(
                input
                    .concat(1.1, 4.2, -.4)
            ),
        },
        {
            name: getName('Seq'),
            run: () => sink(
                asSequence(input)
                    .plus([1.1, 4.2, -.4])
                    .toArray()
            ),
        },
        {
            name: getName('Laz'),
            run: () => sink(
                Lazy(input)
                    .concat([1.1, 4.2, -.4])
                    .toArray()
            ),
        },
    )
);
