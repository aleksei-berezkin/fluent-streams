import { stream, type Stream } from '.';
import { twice } from './testUtil/twice';

test('Bad capacity', () => {
    expect(collectLast([], -1).toArray()).toEqual([]);
});

test('Empty', () => {
    const c = collectLast([], 1);
    twice(() => expect(c.toArray()).toEqual([]));
});

test('One item', () => {
    const c = collectLast(['a'], 2)
    twice(() => expect(c.toArray()).toEqual(['a']));
});

test('Full', () => {
    const c = collectLast(['a', 'b'], 2)
    twice(() => expect(c.toArray()).toEqual(['a', 'b']));
});

test('Partial overlap', () => {
    const c = collectLast(['a', 'b', 'c', 'd'], 3);
    twice(() => expect(c.toArray()).toEqual(['b', 'c', 'd']));
});

test('Full overlap', () => {
    const c = collectLast(['a', 'b', 'c', 'd', 'e', 'f'], 3);
    twice(() => expect(c.toArray()).toEqual(['d', 'e', 'f']));
});

test('Repeated iteration', () => {
    const c = collectLast(['a', 'b'], 3)
    twice(() => expect([c.toArray(), c.toArray()]).toEqual([['a', 'b'], ['a', 'b']]));
});

function collectLast<T>(a: T[], n: number): Stream<T> {
    return stream(a).takeLast(n)
}
