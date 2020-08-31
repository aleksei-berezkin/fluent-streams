import '../testUtil/extendExpect';
import { forInput } from './testUtil/forInput';
import { twice } from '../testUtil/twice';


test('all', () =>  forInput(
    ['ax', 'bx', 'cx'],
    s => s,
    (s, inputHint) => twice(runHint => expect(s.all(i => i.endsWith('x'))).toBeWithHint(true, inputHint, runHint)),
));

test('all neg', () => forInput(
    ['ax', 'bx', 'c'],
    s => s,
    (s, inputHint) => twice(runHint => expect(s.all(i => i.endsWith('x'))).toBeWithHint(false, inputHint, runHint)),
));

test('any', () => forInput(
    ['a', 'b'],
    s => s,
    (s, inputHint) => twice(runHint => expect(s.any(i => i === 'a')).toBeWithHint(true, inputHint, runHint)),
));

test('any neg', () => forInput(
    ['a', 'b'],
    s => s,
    (s, inputHint) => twice(runHint => expect(s.any(i => i === 'c')).toBeWithHint(false, inputHint, runHint)),
));

test('append', () => [[], ['a'], ['a', 'b']].forEach(input => forInput(
    input,
    s => s.append('c'),
    (s, inputHint) => twice(runHint => expect(s.toArray()).toEqualWithHint(input.concat('c'), inputHint, runHint)),
)));

test('appendIf', () => forInput(
    ['a', 'b'],
    s => s.appendIf(true, 'c'),
    (s, inputHint) => twice(runHint => expect(s.toArray()).toEqualWithHint(['a', 'b', 'c'], inputHint, runHint)),
));

test('appendIf neg', () => forInput(
    ['a', 'b'],
    s => s.appendIf(false, 'c'),
    (s, inputHint) => twice(runHint => expect(s.toArray()).toEqualWithHint(['a', 'b'], inputHint, runHint)),
));

test('appendAll', () =>  forInput(
    ['a', 'b'],
    s => s.appendAll(['c', 'd']),
    (s, inputHint) => twice(runHint =>
        expect(s.toArray()).toEqualWithHint(['a', 'b', 'c', 'd'], inputHint, runHint),
    ),
));

test('appendAll suspended', () => {
    const appended: string[] = [];
    forInput(
        ['a', 'b'],
        s => s.appendAll(appended),
        (s, inputHint) => twice(runHint => {
            appended.push('c', 'd');
            expect(s.toArray()).toEqualWithHint(['a', 'b', 'c', 'd'], inputHint, runHint);
            appended.length = 0;
        }),
    );
});

test('appendAllIf', () => forInput(
    ['a', 'b'],
    s => s.appendAllIf(true, ['c', 'd']),
    (s, inputHint) => twice(runHint =>
        expect(s.toArray()).toEqualWithHint(['a', 'b', 'c', 'd'], inputHint, runHint)
    ),
));

test('appendAllIf set', () => forInput(
    ['a', 'b'],
    s => s.appendAllIf(true, new Set(['c', 'd', 'e'])),
    (s, inputHint) => twice(runHint =>
        expect(s.toArray()).toEqualWithHint(['a', 'b', 'c', 'd', 'e'], inputHint, runHint)
    ),
));

test('appendAllIf neg', () => forInput(
    ['a', 'b'],
    s => s.appendAllIf(false, ['c', 'd']),
    (s, inputHint) => twice(runHint =>
        expect(s.toArray()).toEqualWithHint(['a', 'b'], inputHint, runHint)
    ),
));

test('at neg', () => forInput(
    ['a', 'b'],
    s => s.at(-1),
    (o, inputHint)  => twice(runHint => expect(o.resolve()).toEqualWithHint({has: false}, inputHint, runHint)),
));

test('at', () => forInput(
    ['a', 'b'],
    s => s.at(1),
    (o, inputHint) => twice(runHint => expect(o.resolve()).toEqualWithHint({has: true, val: 'b'}, inputHint, runHint)),
));

test('at out of', () => forInput(
    ['a', 'b'],
    s => s.at(3),
    (o, inputHint) =>  twice(runHint => expect(o.resolve()).toEqualWithHint({has: false}, inputHint, runHint)),
));

test('map', () => [[], ['a'], ['a', 'b', 'c']].forEach(input => forInput(
    input,
    s => s.map(c => c.toUpperCase()),
    (s, inputHint) => twice(runHint =>
        expect(s.toArray()).toEqualWithHint(input.map(c => c.toUpperCase()), inputHint, runHint)
    ),
)));

test('toArray', () => [[], ['a'], ['a', 'b', 'c']].forEach(input => forInput(
    input,
    s => s,
    (s, inputHint) => twice(runHint =>
        expect(s.toArray()).toEqualWithHint(input, inputHint, runHint)
    ),
)));
