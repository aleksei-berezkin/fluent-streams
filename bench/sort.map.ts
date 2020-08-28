import { genInputs } from './util/genInput';
import { benchmark } from './util/benchmark';
import { sink } from './util/sink';
import { stream2 } from '../src';
import { asSequence } from 'sequency';
import Lazy from "lazy.js";

genInputs('sort.map').forEach(([input, getName]) =>
    benchmark(
        {
            name: getName('Str'),
            run: () => sink(
                stream2(input)
                    .sortOn(i => i)
                    .map(i => i + .2)
                    .toArray()
            ),
        },
        {
            name: getName('Arr'),
            run: () => sink(
                // Array.sort sorts in place, so to be fair input needs to be copied
                [...input]
                    .sort(i => i)
                    .map(i => i + .2)
            ),
        },
        {
            name: getName('Seq'),
            run: () => sink(
                asSequence(input)
                    .sortedBy(i => i)
                    .map(i => i + .2)
                    .toArray()
            ),
        },
        {
            name: getName('Laz'),
            run: () => sink(
                Lazy(input)
                    .sortBy(i => i)
                    .map(i => i + .2)
                    .toArray()
            ),
        },
    )
);
