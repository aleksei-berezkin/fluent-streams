import { benchmark } from './util/benchmark';

export default benchmark(
    'join',
    {
        str: s => s.join(', '),
        arr: a => a.join(', '),
        seq: q => q.joinToString({separator: ','}),
        laz: l => l.join(', '),
    },
);
