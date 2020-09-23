import { benchmark } from './util/benchmark';

export default benchmark(
    'butLast',
    {
        str: s => s.butLast(),
        arr: (a, n) => a.slice(0, n - 1),
        seq: (q, n) => q.take(n - 1),
        laz: l => l.initial(1),
    },
);
