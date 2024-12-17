import './testUtil/extendExpect';
import { forOptionalInput as forInput } from './testUtil/forInput';
import { twice } from './testUtil/twice';
import { optional } from '.';

test('filter', () => [['a'], ['b'], []].forEach(input => forInput(
    input,
    o => o.filter(i => i === 'a'),
    (o, inputHint) => twice(runHint =>
        expect(o.filter(i => i === 'a').toArray()).toEqualWithHint(input.filter(i => i === 'a'), inputHint, runHint)
    ),
)));

test('has', () => [['a'], ['b'], []].forEach(input => forInput(
    input,
    o => o,
    (o, inputHint) => twice(runHint =>
        expect(o.some(i => i === 'a')).toBeWithHint(input.includes('a'), inputHint, runHint)
    ),
)));

test('every', () => [['a'], ['b'], []].forEach(input => forInput(
    input,
    o => o,
    (o, inputHint) => twice(runHint =>
        expect(o.every(i => i !== 'a')).toBeWithHint(!input.includes('a'), inputHint, runHint)
    ),
)));

test('flat optional', () => forInput(
    [[['a']]],
    o => o.flat(10),
    (o, inputHint) => twice(runHint =>
        expect(o.toArray()).toEqualWithHint(['a'], inputHint, runHint)
    ),
));

test('flat optional only first', () => forInput(
    // This optional would resolve to [], so mapping only it, no matter what's next
    [[], [['a']]],
    o => o.flat(10),
    (o, inputHint) => twice(runHint =>
        expect(o.toArray()).toEqualWithHint([], inputHint, runHint)
    ),
));

test('flatMap', () => forInput(
    ['ab'],
    o => o.flatMap(aa => aa.split('')),
    (o, inputHint) => twice(runHint =>
        expect(o.toArray()).toEqualWithHint(['a'], inputHint, runHint)
    ),
));

test('flatMapToStream', () => forInput(
    ['ab'],
    o => o.flatMapToStream(aa => aa.split('')),
    (o, inputHint) => twice(runHint =>
        expect(o.toArray()).toEqualWithHint(['a', 'b'], inputHint, runHint)
    ),
));

test('flatMap misc', () => forInput(
    ['aa'],
    o => o,
    (o, inputHint) => twice(runHint => {
        expect(o.flatMap(() => []).resolve()).toEqualWithHint({has: false}, inputHint, runHint);
        expect(o.flatMap(() => optional([])).resolve()).toEqualWithHint({has: false}, inputHint, runHint);
        expect(o.flatMap(() => ['b']).resolve()).toEqualWithHint({has: true, val: 'b'}, inputHint, runHint);
    }),
));

test('flatMap empty', () => forInput(
    [],
    o => o,
    (o, inputHint) => twice(runHint => {
        expect(o.flatMap(() => { throw new Error() }).toArray()).toEqualWithHint([], inputHint, runHint);
        expect(o.flatMapToStream(() => { throw new Error() }).toArray()).toEqualWithHint([], inputHint, runHint);
    }),
));

test('get', () => forInput(
    ['a'],
    o => o,
    (o, inputHint) => twice(runHint =>
        expect(o.get()).toEqualWithHint('a', inputHint, runHint)
    ),
));

test('get empty', () => forInput(
    [],
    o => o,
    o => twice(() => expect(() => o.get()).toThrow()),
));

test('is', () => forInput(
    ['a'],
    o => o,
    (o, inputHint) => twice(runHint => {
        expect(o.is('a')).toBeWithHint(true, inputHint, runHint);
        expect(o.is('b')).toBeWithHint(false, inputHint, runHint);
    }),
));

test('is empty', () => forInput(
    [],
    o => o,
    (o, inputHint) => twice(runHint => expect(o.is(undefined as any as never)).toBeWithHint(false, inputHint, runHint)),
));

test('isPresent', () => forInput(
    ['a'],
    o => o,
    (o, inputHint) => twice(runHint => expect(o.isPresent()).toBeWithHint(true, inputHint, runHint)),
));

test('isPresent empty', () => forInput(
    [],
    o => o,
    (o, inputHint) => twice(runHint => expect(o.isPresent()).toBeWithHint(false, inputHint, runHint)),
));

test('map', () => forInput(
    ['a'],
    o => o.map(i => i.toUpperCase()),
    (o, inputHint) => twice(runHint =>
        expect(o.toArray()).toEqualWithHint(['A'], inputHint, runHint)
    ),
));

test('map empty', () => forInput(
    [],
    o => o.map(() => { throw new Error() }),
    (o, inputHint) => twice(runHint =>
        expect(o.toArray()).toEqualWithHint([], inputHint, runHint)
    ),
));

test('mapNullable', () => forInput(
    ['a'],
    o => o.mapNullable(i => i.toUpperCase()),
    (o, inputHint) => twice(runHint => expect(o.toArray()).toEqualWithHint(['A'], inputHint, runHint)),
));

test('mapNullable null', () => forInput(
    ['a'],
    o => o.mapNullable(() => null),
    (o, inputHint) => twice(runHint => expect(o.toArray()).toEqualWithHint([], inputHint, runHint)),
));

test('mapNullable undefined', () => forInput(
    ['a'],
    o => o.mapNullable(() => undefined),
    (o, inputHint) => twice(runHint => expect(o.toArray()).toEqualWithHint([], inputHint, runHint)),
));

test('mapNullable empty', () => forInput(
    [],
    o => o.mapNullable(() => { throw new Error() }),
    (s, inputHint) => twice(runHint =>
        expect(s.toArray()).toEqualWithHint([], inputHint, runHint)
    ),
));

test('orElse', () => forInput(
    ['a'],
    o => o,
    (o, inputHint) => twice(runHint => {
        expect(o.orElse('b')).toBeWithHint('a', inputHint, runHint);
        expect(o.orElseGet(() => 'b')).toBeWithHint('a', inputHint, runHint);
        expect(o.orElseNull()).toBeWithHint('a', inputHint, runHint);
        expect(o.orElseThrow(() => new Error())).toBeWithHint('a', inputHint, runHint);
        expect(o.orElseUndefined()).toBeWithHint('a', inputHint, runHint);
    }),
));

test('orElse empty', () => forInput(
    [] as string[],
    o => o,
    (o, inputHint) => twice(runHint => {
        expect(o.orElse(42)).toBeWithHint(42, inputHint, runHint);
        expect(o.orElseGet(() => 42)).toBeWithHint(42, inputHint, runHint);
        expect(o.orElseNull()).toBeWithHint(null, inputHint, runHint);
        expect(() => o.orElseThrow(() => new Error())).toThrow();
        expect(o.orElseUndefined()).toBeWithHint(undefined, inputHint, runHint);
    }),
));

test('resolve', () => forInput(
    ['a'],
    o => o,
    (o, inputHint) => twice(runHint => expect(o.resolve()).toEqualWithHint({has: true, val: 'a'}, inputHint, runHint))
));

test('resolve empty', () => forInput(
    [],
    o => o,
    (o, inputHint) => twice(runHint => expect(o.resolve()).toEqualWithHint({has: false}, inputHint, runHint))
));

test('toStream', () => forInput(
    ['a'],
    o => o.toStream(),
    (s, inputHint) => twice(runHint =>
        expect(s.toArray()).toEqualWithHint(['a'], inputHint, runHint)
    ),
));

test('toStream empty', () => forInput(
    [],
    o => o.toStream(),
    (s, inputHint) => twice(runHint => expect(s.toArray()).toEqualWithHint([], inputHint, runHint))
));
