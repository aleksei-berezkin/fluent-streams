import { benchmark } from './util/benchmark';
import { stream2 } from '../src';
import { asSequence } from 'sequency';
import Lazy from "lazy.js";

benchmark(
    'appendAll',
    {
        str: input => stream2(input).appendAll([1.1, 4.2, -.4]).toArray(),
        arr: input => input.concat(1.1, 4.2, -.4),
        seq: input => asSequence(input).plus([1.1, 4.2, -.4]).toArray(),
        laz: input => Lazy(input).concat([1.1, 4.2, -.4]).toArray(),
    },
);
