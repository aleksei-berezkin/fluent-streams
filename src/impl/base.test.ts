import { Base } from './base';
import { twice } from './testUtil';

class BaseImpl<P, T> extends Base<P, T> {
    constructor(parent: Iterable<P>, operation: (input: Iterable<P>) => Iterable<T>) {
        super(parent, operation);
    }
}

test('Base size', () => {
    const b = new BaseImpl(['a', 'a', 'a'], i => i);
    twice(() => expect(b.size()).toEqual(3));
});

test('Base simple op', () => {
    const b = new BaseImpl(['a', 'b', 'c'], function* (items) {
        for (const i of items) {
            yield i + 'x';
        }
    });
    twice(() => expect([...b]).toEqual(['ax', 'bx', 'cx']));
});

test('Base composition', () => {
    const b1 = new BaseImpl(['a', 'b', 'c'], function* (items) {
        for (const i of items) {
            yield 'x' + i;
        }
    });
    const b2 = new BaseImpl(b1, function* (items) {
        yield *items;
        yield 'xd';
    });
    twice(() => expect([...b2]).toEqual(['xa', 'xb', 'xc', 'xd']));
});

test('Base composition to other', () => {
    const b = new BaseImpl(['a', 'b'], function* (items) {
        yield *items;
        yield 'c';
    });
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
