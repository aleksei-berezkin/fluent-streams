import { appendReturned, matchGenerator } from './streamGenerator';

test('appendReturned empty', () => {
    function* gen() {
    }
    expect([...appendReturned(gen())]).toEqual([]);
});

test('appendReturned no head', () => {
    function* gen() {
        return {
            array: ['a', 'b'],
            canModify: true,
        }
    }
    expect([...appendReturned(gen())]).toEqual(['a', 'b']);
});

test('appendReturned no tail', () => {
    function* gen() {
        yield 'a';
        yield 'b';
    }
    expect([...appendReturned(gen())]).toEqual(['a', 'b']);
});

test('appendReturned empty tail', () => {
    function* gen() {
        yield 'a';
        yield 'b';
        return {
            array: [],
            canModify: false,
        }
    }
    expect([...appendReturned(gen())]).toEqual(['a', 'b']);
});

test('appendReturned full', () => {
    function* gen() {
        yield 'a';
        yield 'b';
        return {
            array: ['c', 'd'],
            canModify: true,
        }
    }
    expect([...appendReturned(gen())]).toEqual(['a', 'b', 'c', 'd']);
});

test('matchGenerator empty', () => {
    const {head, tail} = matchGenerator(function* (){}());
    expect([...head]).toEqual([]);
    expect(tail()).toEqual({
        array: [],
        canModify: true,
    });
});

test('matchGenerator head not iterated', () => {
    const {tail} = matchGenerator(function* (){}());
    expect(tail).toThrow();
});

test('matchGenerator no head', () => {
    const genRes = {
        array: ['a'],
        canModify: false,
    };
    const {head, tail} = matchGenerator(function *() {
        return genRes;
    }());
    expect([...head]).toEqual([]);
    expect(tail()).toBe(genRes);
});

test('matchGenerator no tail', () => {
    const {head, tail} = matchGenerator(function* () {
        yield* ['a', 'b'];
    }());
    expect([...head]).toEqual(['a', 'b']);
    expect(tail()).toEqual({
        array: [],
        canModify: true,
    })
});

test('matchGenerator full', () => {
    const genRes = {
        array: ['c', 'd'],
        canModify: true,
    }
    const {head, tail} = matchGenerator(function* () {
        yield* ['a', 'b'];
        return genRes;
    }());
    expect([...head]).toEqual(['a', 'b']);
    expect(tail()).toBe(genRes);
});
