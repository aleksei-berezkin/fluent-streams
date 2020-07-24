import { range, stream, streamOf } from './index';

test('From array', () => {
    expect(stream(['a', 'b']).toArray()).toEqual(['a', 'b']);
});

test('From iterable', () => {
    expect(stream({
        [Symbol.iterator]() {
            return function* () {
                yield 'a';
                yield 'b';
            }();
        }
    }).toArray()).toEqual(['a', 'b'])
});

test('From items', () => {
    expect(streamOf('a', 'b').toArray()).toEqual(['a' ,'b']);
});

test('Empty ranges', () => {
    expect([
        range(0, -1).toArray(),
        range(0, 0).toArray(),
        range(1, 1).toArray(),
    ]).toEqual([[], [], []]);
});

test('Range', () => {
    expect(range(0, 3).toArray()).toEqual([0, 1, 2]);
});

test('Iterate multiple', () => {
    const r = range(0, 2);
    expect([r.toArray(), r.toArray()]).toEqual([[0, 1], [0, 1]]);
});
