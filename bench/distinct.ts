import { benchmark } from './util/benchmark';
import { stream2 } from '../src';
import { asSequence } from 'sequency';
import Lazy from 'lazy.js';

benchmark(
    'distinct',
    {
        str: input => stream2(input).distinctBy(i => i).toArray(),
        seq: input => asSequence(input).distinct().toArray(),
        laz: input => Lazy(input).uniq().toArray(),
    },
);
