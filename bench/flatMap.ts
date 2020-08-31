import { stream2 } from '../src';
import { benchmark } from './util/benchmark';
import { asSequence } from 'sequency';
import Lazy from 'lazy.js';

benchmark(
    'flatMap',
    {
        str: input => stream2(input).flatMap(i => [i + 4.4, i - 5.5, i * 1.9]).toArray(),
        arr: input => input.flatMap(i => [i + 4.4, i - 5.5, i * 1.9]),
        seq: input => asSequence(input).flatMap(i => asSequence([i + 4.4, i - 5.5, i * 1.9])).toArray(),
        laz: input => Lazy(input).map(i => Lazy([i + 4.4, i - 5.5, i * 1.9])).flatten().toArray(),
    },
);
