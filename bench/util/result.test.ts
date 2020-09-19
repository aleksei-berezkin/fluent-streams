import { parseName, toName } from './result';

test('toName', () => {
    expect(toName('str', 'arr', 100, 'map', 'measure')).toEqual('Str(Arr[100]).map');
    expect(toName('seq', 'itr', 10, 'flatMap', 'warmup')).toEqual('Seq(Itr[10]).flatMap (warmup)')
});

test('parseName', () => {
    expect(parseName('Str(Arr[100]).map')).toEqual(
        {lib: 'str', input: 'arr', n: 100, name: 'map', run: 'measure'}
    );
    expect(parseName('Arr(Itr[10000]).at (warmup)')).toEqual(
        {lib: 'arr', input: 'itr', n: 10000, name: 'at', run: 'warmup'}
    );
});

test('parseName with dot', () =>
    expect(parseName('Laz(Itr[1000]).map.at (warmup)')).toEqual(
        {lib: 'laz', input: 'itr', n: 1000, name: 'map.at', run: 'warmup'}
    )
);

test('parseName bad', () => {
    expect(() => parseName('AAA(Itr[1]).at #1')).toThrow();
    expect(() => parseName('Laz(AAA[1]).at #1')).toThrow();
    expect(() => parseName('Laz(Itr[a])at #1')).toThrow();
    expect(() => parseName('Laz(Itr[1]).at #e')).toThrow();
});
