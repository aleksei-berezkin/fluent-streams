import { benchmark } from './util/benchmark';

export default benchmark(
    'reduce',
    {
        str: s => s.reduce((l, r) => l + r).orElseUndefined(),
        arr: a => a.reduce((p, c) => p + c),
        seq: q => q.reduce<number, number>((acc, val) => acc + val),
        laz: l => l.reduce((agg, memo) => agg + memo),
    },
);
