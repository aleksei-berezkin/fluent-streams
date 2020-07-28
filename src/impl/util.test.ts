import { trimIterable } from './util';
import { twice } from './testUtil';

test('trimIterable empty', () => {
    const i = trimIterable([]);
    twice(() => expect([...i]).toEqual([]));
});

test('trimIterable single', () => {
    const i = trimIterable(['a']);
    twice(() => expect([...i]).toEqual(['a']));
});

test('trimIterable long', () => {
    const i = trimIterable(['a', 'b']);
    twice(() => expect([...i]).toEqual(['a']));
});
