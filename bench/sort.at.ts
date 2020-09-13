import { benchmark } from './util/benchmark';

benchmark(
    'sort.at',
    {
        str: (s, n) => s.sortBy(i => i).at(Math.floor(n / 2)).orElseUndefined(),
        arr: (a, n, canModify) => (canModify ? a : [...a]).sort(i => i)[Math.floor(n / 2)],
        seq: (q, n) => q.sortedBy(i => i).elementAtOrNull(Math.floor(n / 2)),
        laz: (l, n) => (l.sortBy(i => i) as any).get(Math.floor(n / 2)),
    },
);
