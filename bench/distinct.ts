import { benchmark } from './util/benchmark';

benchmark(
    'distinct',
    {
        str: s => s.distinctBy(i => i),
        seq: q => q.distinct(),
        laz: l => l.uniq(),
    },
);
