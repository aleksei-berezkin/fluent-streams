import { benchmark } from './util/benchmark';

export default benchmark(
    'map',
    {
        str: s => s.map(i => i - 2.9),
        arr: a => a.map(i => i - 2.9),
        seq: q => q.map(i => i - 2.9),
        laz: l => l.map(i => i - 2.9),
    },
);
