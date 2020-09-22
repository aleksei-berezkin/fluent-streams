import { benchmark } from './util/benchmark';

export default benchmark(
    'appendAll',
    {
        str: s => s.appendAll([1.1, 4.2, -.4]),
        arr: a => a.concat(1.1, 4.2, -.4),
        seq: q => q.plus([1.1, 4.2, -.4]),
        laz: l => l.concat([1.1, 4.2, -.4]),
    },
);
