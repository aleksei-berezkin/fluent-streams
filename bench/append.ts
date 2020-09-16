import { benchmark } from './util/benchmark';

export default benchmark(
    'append',
    {
        str: s => s.append(9.1),
        arr: a => a.concat(9.1),
        seq: q => q.plus(9.1),
        laz: l => l.concat([9.1]),
    },
);
