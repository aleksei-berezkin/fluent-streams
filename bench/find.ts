import { benchmark } from './util/benchmark';

export default benchmark(
    'find',
    {
        str: s => s.find(i => Number.isNaN(i)).orElseUndefined(),
        arr: a => a.find(i => Number.isNaN(i)),
        seq: q => q.find(i => Number.isNaN(i)),
        laz: l => l.find(i => Number.isNaN(i)),
    },
);
