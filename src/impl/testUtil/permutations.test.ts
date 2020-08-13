import { permutations } from './permutations';

test('empty', () => expect(permutations([])).toEqual([]));

test('one', () => expect(permutations(['a'])).toEqual(['a']));

test('two', () => expect(permutations(['a', 'b'])).toEqual(['ab', 'ba']));

test('twoSame', () => expect(permutations(['a', 'a'])).toEqual(['aa', 'aa']));

test('three', () => expect(permutations(['a', 'b', 'c'])).toEqual([
    'abc', 'acb', 'bac', 'bca', 'cab', 'cba'
]));

test('seven', () => expect(permutations(['0', '1', '2', '3', '4', '5', '6']).length).toEqual(5040));
