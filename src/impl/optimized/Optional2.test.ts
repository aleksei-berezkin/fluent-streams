import '../testUtil/extendExpect';
import { forOptionalInput as forInput } from './testUtil/forInput';
import { twice } from '../testUtil/twice';
import { optional2 } from '../../factories';

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
        expect(o.has(i => i === 'a')).toBeWithHint(input.includes('a'), inputHint, runHint)
    ),
)));

test('hasNot', () => [['a'], ['b'], []].forEach(input => forInput(
    input,
    o => o,
    (o, inputHint) => twice(runHint =>
        expect(o.hasNot(i => i === 'a')).toBeWithHint(!input.includes('a'), inputHint, runHint)
    ),
)));

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

test('flatMap misc', () =>
    forInput(
        ['aa'],
        o => o,
        (o, inputHint) => twice(runHint => {
            expect(o.flatMap(() => []).resolve()).toEqualWithHint({has: false}, inputHint, runHint);
            expect(o.flatMap(() => optional2([])).resolve()).toEqualWithHint({has: false}, inputHint, runHint);
            expect(o.flatMap(() => ['b']).resolve()).toEqualWithHint({has: true, val: 'b'}, inputHint, runHint);
        }),
    )
);

test('flatMap empty', () =>
    forInput(
        [],
        o => o,
        (o, inputHint) => twice(runHint => {
            expect(o.flatMap(() => { throw new Error() }).toArray()).toEqualWithHint([], inputHint, runHint);
            expect(o.flatMapToStream(() => { throw new Error() }).toArray()).toEqualWithHint([], inputHint, runHint);
        }),
    )
);
