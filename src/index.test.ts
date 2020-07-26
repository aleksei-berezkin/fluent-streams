import { abc, continually, range, same, stream, streamOf } from './index';

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

test('Iterate range multiple', () => {
    const r = range(0, 2);
    expect([r.toArray(), r.toArray()]).toEqual([[0, 1], [0, 1]]);
});

test('abc', () => {
    const a = abc();
    expect(a.toArray()).toEqual([
        'a', 'b', 'c', 'd', 'e', 'f',
        'g', 'h', 'i', 'j', 'k', 'l',
        'm', 'n', 'o', 'p', 'q', 'r',
        's', 't', 'u', 'v', 'w', 'x',
        'y', 'z',
    ]);
});

test('same', () => {
    const a = same('a').take(2);
    expect(a.toArray()).toEqual(['a', 'a']);
});

test('continually', () => {
    let i = 0;
    const c = continually(() => i++).take(3);
    expect(c.toArray()).toEqual([0, 1, 2]);
    expect(c.toArray()).toEqual([4, 5, 6]);
});
