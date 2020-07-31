import { StreamImpl } from './streamImpl';
import { twice } from './testUtil';

function of<T>(...items: T[]) {
    return new StreamImpl(items, i => i);
}

function ofItr<T>(items: Iterable<T>) {
    return new StreamImpl(items, i => i);
}

test('all', () => {
    const s = of('ax', 'bx', 'cx');
    twice(() => expect(s.all(i => i.endsWith('x'))).toBe(true));
});

test('all neg', () => {
    const s = of('ax', 'bx', 'c');
    twice(() => expect(s.all(i => i.endsWith('x'))).toBe(false));
});

test('any', () => {
    const s = of('a', 'b');
    twice(() => expect(s.any(i => i === 'a')).toBe(true));
});

test('any neg', () => {
    const s = of('a', 'b');
    twice(() => expect(s.any(i => i === 'c')).toBe(false));
});

test('at neg', () => {
    const s = of('a', 'b');
    twice(() => expect(s.at(-1).resolve()).toEqual({has: false}));
});

test('at array', () => {
    const s = of('a', 'b');
    twice(() => expect(s.at(1).resolve()).toEqual({has: true, val: 'b'}));
});

test('at out of array', () => {
    const s = of('a', 'b');
    twice(() => expect(s.at(3).resolve()).toEqual({has: false}));
});


test('at itr', () => {
    const s = ofItr({
        [Symbol.iterator]() {
            return ['a', 'b'][Symbol.iterator]();
        }
    });
    twice(() => expect(s.at(1).resolve()).toEqual({has: true, val: 'b'}));
});

test('at out of itr', () => {
    const s = ofItr({
        [Symbol.iterator]() {
            return ['a', 'b'][Symbol.iterator]();
        }
    });
    twice(() => expect(s.at(3).resolve()).toEqual({has: false}));
});

test('awaitAll const', done => {
    const s = of('a', 'b');
    twice(done, _done =>
        s.awaitAll().then(items => {
            expect(items).toEqual(['a', 'b']);
            _done();
        })
    );
});

test('awaitAll promise', done => {
    const s = of(
        new Promise(resolve => setTimeout(() => resolve('a'), 100)),
        new Promise(resolve => setTimeout(() => resolve('b'), 200)),
    );
    twice(done, _done =>
        s.awaitAll().then(items => {
            expect(items).toEqual(['a', 'b']);
            _done();
        })
    );
});

test('awaitAll mix', done => {
    const s = of<unknown>(
        new Promise(resolve => setTimeout(() => resolve('a'), 100)),
        'b',
    );
    twice(done, _done =>
        s.awaitAll().then(items => {
            expect(items).toEqual(['a', 'b']);
            _done();
        })
    );
});
