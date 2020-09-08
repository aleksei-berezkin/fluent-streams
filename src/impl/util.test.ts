import { collectToMap } from './util';

test('collectToMap empty', () => {
    const m = collectToMap([], () => undefined);
    expect(m).toEqual(new Map());
});

test('collectToMap single', () => {
    const m = collectToMap([{k: 'a', v: 1}], o => o.k);
    expect(m).toEqual(new Map([['a', [{k: 'a', v: 1}]]]));
});

test('collectToMap some', () => {
    const m = collectToMap([{k: 'a', v: 1}, {k: 'a', v: 2}, {k: 'b', v: 3}], o => o.k);
    expect(m).toEqual(new Map([['a', [{k: 'a', v: 1}, {k: 'a', v: 2}]], ['b', [{k: 'b', v: 3}]]]));
});
