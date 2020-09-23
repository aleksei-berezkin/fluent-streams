import { benchmark } from './util/benchmark';

export default benchmark(
    'filter',
    {
        str: s => s.filter(i => i > 0),
        arr: a => a.filter(i => i > 0),
        seq: q => q.filter(i => i > 0),
        laz: l => l.filter(i => i > 0),
    },
);
