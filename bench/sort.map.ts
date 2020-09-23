import { benchmark } from './util/benchmark';

export default benchmark(
    'sort.map',
    {
        str: s => s.sortBy(i => i).map(i => i + .2),
        arr: (a, _, canModify) => (canModify ? a : [...a]).sort(i => i).map(i => i + .2),
        seq: q => q.sortedBy(i => i).map(i => i + .2),
        laz: l => l.sortBy(i => i).map(i => i + .2),
    },
);
