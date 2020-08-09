import { appendReturned, matchGenerator, toAnyArray, toModifiableArray } from './streamGenerator';

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

test('toModifiableArray head', () => {
    const a = toModifiableArray(function* () {
        yield* ['a', 'b'];
    }());
    expect(a).toEqual(['a', 'b']);
});

test('toModifiableArray tail not modifiable', () => {
    const input = ['a', 'b'];
    const a = toModifiableArray(function* () {
        return {
            array: input,
            canModify: false,
        };
    }());
    expect(a).toEqual(input);
    expect(a).not.toBe(input);
});

test('toModifiableArray tail modifiable', () => {
    const input = ['a', 'b'];
    const a = toModifiableArray(function* () {
        return {
            array: input,
            canModify: true,
        };
    }());
    expect(a).toBe(a);
});

test('toModifiableArray full', () => {
    const a = toModifiableArray(function* () {
        yield* ['a', 'b'];
        return {
            array: ['c', 'd'],
            canModify: true,
        }
    }());
    expect(a).toEqual(['a', 'b', 'c', 'd']);
});

test('toAnyArray head', () => {
    const a = toAnyArray(function* () {
        yield* ['a', 'b'];
    }());
    expect(a).toEqual(['a', 'b']);
});

test('toAnyArray tail modifiable', () => {
    const input = ['a', 'b'];
    const a = toAnyArray(function* () {
        return {
            array: input,
            canModify: true,
        };
    }());
    expect(a).toBe(input);
});

test('toAnyArray tail not modifiable', () => {
    const input = ['a', 'b'];
    const a = toAnyArray(function* () {
        return {
            array: input,
            canModify: false,
        }
    }());
    expect(a).toBe(input);
});

test('toAnyArray full', () => {
    const a = toAnyArray(function* () {
        yield* ['a', 'b'];
        return {
            array: ['c', 'd'],
            canModify: true,
        };
    }());
    expect(a).toEqual(['a', 'b', 'c', 'd']);
});
