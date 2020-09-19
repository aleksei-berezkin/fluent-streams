import { benchmark } from './util/benchmark';

benchmark(
    'distinct',
    {
        str: s => s.distinctBy(i => i),
        arr: a => [...new Set(a)],
        seq: q => q.distinct(),
        laz: l => l.uniq(),
    },
);
