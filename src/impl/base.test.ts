import { twice } from './testUtil';
import { BaseImpl } from './base';

function of<T>(...items: T[]) {
    return new BaseImpl(undefined, function* () {
        yield *items;
    });
}

test('BaseImpl size', () => {
    const b = of('a', 'a', 'a');
    twice(() => expect(b.size()).toEqual(3));
});

test('BaseImpl composition', () => {
    const b1 = of('a', 'b', 'c');
    const b2 = new BaseImpl(b1, function* (items) {
        yield *items;
        yield 'd';
    });
    twice(() => expect([...b2]).toEqual(['a', 'b', 'c', 'd']));
});

test('BaseImpl composition to other', () => {
    const b = of('a', 'b', 'c');
    const bb1 = new BaseImpl(b, function* (items) {
        yield *items;
        yield 'd';
    });
    const bb2 = new BaseImpl(b, function* (items) {
        for (const i of items) {
            yield i.toUpperCase();
        }
    });

    twice(() => {
        expect([...bb1]).toEqual(['a', 'b', 'c', 'd']);
        expect([...bb2]).toEqual(['A', 'B', 'C']);
    });
});
