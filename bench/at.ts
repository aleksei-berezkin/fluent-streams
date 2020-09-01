import { benchmark } from './util/benchmark';

benchmark(
    'at',
    {
        str: (s, n) => s.at(Math.floor(n / 2)).orElseUndefined(),
        arr: (a, n) => a[Math.floor(n / 2)],
        seq: (q, n) => q.elementAt(Math.floor(n / 2)),
        laz: (l, n) => l.get(Math.floor(n / 2) as any),
    },
);
