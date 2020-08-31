import { benchmark } from './util/benchmark';
import { stream2 } from '../src';
import { asSequence } from 'sequency';
import Lazy from 'lazy.js';

benchmark(
    'sort.map',
    {
        str: input => stream2(input).sortOn(i => i).map(i => i + .2).toArray(),
        // Array.sort sorts in place, so to be fair input needs to be copied
        arr: input => [...input].sort(i => i).map(i => i + .2),
        seq: input => asSequence(input).sortedBy(i => i).map(i => i + .2).toArray(),
        laz: input => Lazy(input).sortBy(i => i).map(i => i + .2).toArray(),
    },
);
