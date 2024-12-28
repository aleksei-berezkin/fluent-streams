import { variations } from './variations';
import { factorial } from './factorial';

test('variations empty', () => [-1.01, -1, -.8, 0, .12, 1, 1.5, 2].forEach(k => expect(variations([], k)).toEqual([])));

test('variations one', () => {
    [-1, 0, .12].forEach(k => expect(variations(['a'], k)).toEqual([]));
    [1.01, 2.5, 4].forEach(k => expect(variations(['a'], k)).toEqual(['a']));
});

test('variations two', () => {
    const items = ['a', 'b'];
    [-1.1, -.9, 0.1].forEach(k => expect(variations(items, k)).toEqual([]));
    expect(variations(items, 1.2)).toEqual(items);
    [2, 2.1, 3.66, 5.99].forEach(k => expect(variations(items, k)).toEqual(['ab', 'ba']));
});

test('variations three', () => {
    const items = ['a', 'b', 'c'];
    [-1, 0, 0.99].forEach(k => expect(variations(items, k)).toEqual([]));
    [1, 1.99].forEach(k => expect(variations(items, k)).toEqual(items));
    [2, 2.99].forEach(k => expect(variations(items, k)).toEqual(['ab', 'ac', 'ba', 'bc', 'ca', 'cb']));
    [3, 3.1, 3.9, 4, 6].forEach(k => expect(variations(items, k)).toEqual(
        ['abc', 'acb', 'bac', 'bca', 'cab', 'cba']
    ));
});

test('variations four', () => {
    const items = ['a', 'b', 'c', 'd'];
    [-1, 0].forEach(k => expect(variations(items, k)).toEqual([]));
    expect(variations(items, 1)).toEqual(items);
    expect(variations(items, 2.6)).toEqual(['ab', 'ac', 'ad', 'ba', 'bc', 'bd', 'ca', 'cb', 'cd', 'da', 'db', 'dc']);
    [3, 3.5, 4.7, 6].forEach(k => expect(variations(items, k).length).toEqual(factorial(4)));
});

test('variations five', () => {
    const items = ['a', 'b', 'c', 'd', 'e'];
    [1, 2, 3, 4, 5, 6, 8].forEach(k => 
        expect(variations(items, k).length).toEqual(factorial(items.length) / factorial(items.length - k))
    );
});
