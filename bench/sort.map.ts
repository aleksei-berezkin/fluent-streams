import { benchmark } from './util/benchmark';

benchmark(
    'sort.map',
    {
        str: s => s.sortOn(i => i).map(i => i + .2),
        // Array.sort sorts in place, so to be fair input needs to be copied
        arr: a => [...a].sort(i => i).map(i => i + .2),
        seq: q => q.sortedBy(i => i).map(i => i + .2),
        laz: l => l.sortBy(i => i).map(i => i + .2),
    },
);
