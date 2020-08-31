import { benchmark } from './util/benchmark';
import { stream2 } from '../src';
import { asSequence } from 'sequency';
import Lazy from 'lazy.js';

benchmark(
    'filter',
    {
        str: input => stream2(input).filter(i => i > 0).toArray(),
        arr: input => input.filter(i => i > 0),
        seq: input => asSequence(input).filter(i => i > 0).toArray(),
        laz: input => Lazy(input).filter(i => i > 0).toArray(),
    },
);
