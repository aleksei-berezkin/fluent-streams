import { accommodations } from './accommodations';
import { factorial } from './factorial';

test('empty', () => [-1, 0, 1, 2].forEach(n => expect(accommodations([], n)).toEqual([])));

test('one', () => {
    [-1, 0].forEach(n => expect(accommodations(['a'], n)).toEqual([]));
    [1, 2, 4].forEach(n => expect(accommodations(['a'], n)).toEqual(['a']));
});

test('two', () => {
    const items = ['a', 'b'];
    [-1, 0].forEach(n => expect(accommodations(items, n)).toEqual([]));
    expect(accommodations(items, 1)).toEqual(items);
    [2, 3, 5].forEach(n => expect(accommodations(items, n)).toEqual(['ab', 'ba']));
});

test('three', () => {
    const items = ['a', 'b', 'c'];
    [-1, 0].forEach(n => expect(accommodations(items, n)).toEqual([]));
    expect(accommodations(items, 1)).toEqual(items);
    expect(accommodations(items, 2)).toEqual(['ab', 'ac', 'ba', 'bc', 'ca', 'cb']);
    [3, 4, 6].forEach(n => expect(accommodations(items, n)).toEqual(
        ['abc', 'acb', 'bac', 'bca', 'cab', 'cba']
    ));
});

test('four', () => {
    const items = ['a', 'b', 'c', 'd'];
    [-1, 0].forEach(n => expect(accommodations(items, n)).toEqual([]));
    expect(accommodations(items, 1)).toEqual(items);
    expect(accommodations(items, 2)).toEqual(['ab', 'ac', 'ad', 'ba', 'bc', 'bd', 'ca', 'cb', 'cd', 'da', 'db', 'dc']);
    [3, 4, 6].forEach(n => expect(accommodations(items, n).length).toEqual(factorial(4)));
});

test('five', () => {
    const items = ['a', 'b', 'c', 'd', 'e'];
    [1, 2, 3, 4, 5, 6, 8].forEach(k => 
        expect(accommodations(items, k).length).toEqual(factorial(items.length) / factorial(items.length - k))
    );
});
