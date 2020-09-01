import { benchmark } from './util/benchmark';
import { asSequence } from 'sequency';
import Lazy from 'lazy.js';

benchmark(
    'flatMap',
    {
        str: s => s.flatMap(i => [i + 4.4, i - 5.5, i * 1.9]),
        arr: a => a.flatMap(i => [i + 4.4, i - 5.5, i * 1.9]),
        seq: q => q.flatMap(i => asSequence([i + 4.4, i - 5.5, i * 1.9])),
        laz: l => l.map(i => Lazy([i + 4.4, i - 5.5, i * 1.9])).flatten(),
    },
);
