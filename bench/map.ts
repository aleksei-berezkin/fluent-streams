import { stream2 } from '../src';
import { benchmark } from './util/benchmark';
import { asSequence } from 'sequency';
import Lazy from 'lazy.js';

benchmark(
    'map',
    {
        str: input => stream2(input).map(i => i - 2.9).toArray(),
        arr: input => input.map(i => i - 2.9),
        seq: input => asSequence(input).map(i => i - 2.9).toArray(),
        laz: input => Lazy(input).map(i => i - 2.9).toArray(),

    },
);
