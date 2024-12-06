import { stream } from '.';

test('groupBy empty', () => {
    const m = stream([]).groupBy(() => undefined).toObject();
    expect(m).toEqual({});
});

test('groupBy single', () => {
    const m = stream([{k: 'a', v: 1}]).groupBy(o => o.k).toObject();
    expect(m).toEqual({'a': [{k: 'a', v: 1}]});
});

test('groupBy some', () => {
    const m = stream([{k: 'a', v: 1}, {k: 'a', v: 2}, {k: 'b', v: 3}]).groupBy(o => o.k).toObject();
    expect(m).toEqual({'a': [{k: 'a', v: 1}, {k: 'a', v: 2}], 'b': [{k: 'b', v: 3}]});
});
