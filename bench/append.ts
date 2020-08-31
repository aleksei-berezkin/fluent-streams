import { benchmark } from './util/benchmark';
import { asSequence } from 'sequency';
import Lazy from 'lazy.js';
import { stream2 } from '../src';

benchmark(
    'append',
    {
        str: input => stream2(input).append(9.1).toArray(),
        arr: input => input.concat(9.1),
        seq: input => asSequence(input).plus(9.1).toArray(),
        laz: input => Lazy(input).concat([9.1]).toArray(),
    },
)