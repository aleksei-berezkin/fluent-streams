import { parseName, toName } from './result';

test('toName', () =>
    expect(toName('str', 'arr', 100, 'map', 1)).toEqual('Str(Arr[100]).map #1')
);

test('parseName', () =>
    expect(parseName('Str(Arr[100]).map #1')).toEqual(
        {lib: 'str', input: 'arr', n: 100, name: 'map', run: 1}
    )
);

test('parseName with dot', () =>
    expect(parseName('Laz(Itr[1000]).map.at #3')).toEqual(
        {lib: 'laz', input: 'itr', n: 1000, name: 'map.at', run: 3}
    )
);

test('parseName bad', () => {
    expect(() => parseName('AAA(Itr[1]).at #1')).toThrow();
    expect(() => parseName('Laz(AAA[1]).at #1')).toThrow();
    expect(() => parseName('Laz(Itr[a])at #1')).toThrow();
    expect(() => parseName('Laz(Itr[1]).at #e')).toThrow();
});
