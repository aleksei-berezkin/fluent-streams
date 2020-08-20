import './testUtil/extendExpect';
import { CombinationsMode, forInputCombinations } from './testUtil/forInputCombinations';
import { Optional } from '../optional';
import { OptionalImpl } from './optionalImpl';
import { twice } from './testUtil/twice';
import { optional } from '../factories';

function forInput<T>(input: T[], run: (base: Optional<T>, inputHint: () => string) => void, mode: CombinationsMode = 'all') {
    return forInputCombinations(
        input,
        (head, tail) => new OptionalImpl(undefined, function* () {
            yield* head;
            if (tail) {
                return tail;
            }
        }),
        run,
        mode,
    );
}

test('OptionalImpl does not validate input iterator', () =>
    forInput(
        ['a', 'b'],
        (o, inputHint) => twice(runHint => {
            expect(o.toArray()).toEqualWithHint(['a', 'b'], inputHint, runHint);
            expect(o.resolve()).toEqualWithHint({has: true, val: 'a'}, inputHint, runHint);
        }),
    )
);

test('filter', () =>
    forInput(
        ['a'],
        (o, inputHint) => twice(runHint => {
            expect(o.filter(i => i === 'a').toArray()).toEqualWithHint(['a'], inputHint, runHint);
            expect(o.filter(i => i === 'b').toArray()).toEqualWithHint([], inputHint, runHint);
        }),
    )
);

test('filer empty', () =>
    forInput(
        [],
        (o, inputHint) => twice(runHint =>
            expect(o.filter(() => { throw new Error() }).toArray()).toEqualWithHint([], inputHint, runHint)
        ),
    )
);

test('has', () =>
    forInput(
        ['a'],
        (o, inputHint) => twice(runHint => {
            expect(o.has(i => i === 'a')).toBeWithHint(true, inputHint, runHint);
            expect(o.has(i => i === 'b')).toBeWithHint(false, inputHint, runHint);
        }),
    )
);

test('has empty', () =>
    forInput(
        [],
        (o, inputHint) => twice(runHint =>
            expect(o.has(() => { throw new Error() })).toBeWithHint(false, inputHint, runHint)
        ),
    )
);

test('hasNot', () =>
    forInput(
        ['a'],
        (o, inputHint) => twice(runHint => {
            expect(o.hasNot(i => i === 'b')).toBeWithHint(true, inputHint, runHint);
            expect(o.hasNot(i => i === 'a')).toBeWithHint(false, inputHint, runHint);
        }),
    )
);

test('hasNot empty', () =>
    forInput(
        [],
        (o, inputHint) => twice(runHint =>
            expect(o.hasNot(() => { throw new Error() })).toBeWithHint(true, inputHint, runHint)
        ),
    )
);

test('flatMap', () =>
    forInput(
        ['aa'],
        (o, inputHint) => twice(runHint => {
            expect(o.flatMap(aa => aa.split('')).toArray()).toEqualWithHint(['a'], inputHint, runHint);
            expect(o.flatMap(() => []).resolve()).toEqualWithHint({has: false}, inputHint, runHint);
            expect(o.flatMap(() => optional([])).resolve()).toEqualWithHint({has: false}, inputHint, runHint);
            expect(o.flatMap(() => ['b']).resolve()).toEqualWithHint({has: true, val: 'b'}, inputHint, runHint);
            expect(o.flatMapToStream(aa => aa.split('')).toArray()).toEqualWithHint(['a', 'a'], inputHint, runHint);
        }),
    )
);

test('flatMap empty', () =>
    forInput(
        [],
        (o, inputHint) => twice(runHint => {
            expect(o.flatMap(() => { throw new Error() }).toArray()).toEqualWithHint([], inputHint, runHint);
            expect(o.flatMapToStream(() => { throw new Error() }).toArray()).toEqualWithHint([], inputHint, runHint);
        }),
    )
);

test('get', () =>
    forInput(
        ['a'],
        (o, inputHint) => twice(runHint =>
            expect(o.get()).toEqualWithHint('a', inputHint, runHint)
        ),
    )
);

test('get empty', () =>
    forInput(
        [],
        o => twice(() => expect(() => o.get()).toThrow()),
    )
);

test('is', () =>
    forInput(
        ['a'],
        (o, inputHint) => twice(runHint => {
            expect(o.is('a')).toBeWithHint(true, inputHint, runHint);
            expect(o.is('b')).toBeWithHint(false, inputHint, runHint);
        }),
    )
);

test('is empty', () =>
    forInput(
        [],
        (o, inputHint) => twice(runHint => expect(o.is(undefined as any as never)).toBeWithHint(false, inputHint, runHint)),
    )
);

test('isPresent', () =>
    forInput(
        ['a'],
        (o, inputHint) => twice(runHint => expect(o.isPresent()).toBeWithHint(true, inputHint, runHint)),
    )
);

test('isPresent empty', () =>
    forInput(
        [],
        (o, inputHint) => twice(runHint => expect(o.isPresent()).toBeWithHint(false, inputHint, runHint)),
    )
);

test('map', () =>
    forInput(
        ['a'],
        (o, inputHint) => twice(runHint =>
            expect(o.map(i => i.toUpperCase()).toArray()).toEqualWithHint(['A'], inputHint, runHint)
        ),
    )
);

test('map empty', () =>
    forInput(
        [],
        (o, inputHint) => twice(runHint =>
            expect(o.map(() => { throw new Error() }).toArray()).toEqualWithHint([], inputHint, runHint)
        ),
    )
);

test('mapNullable', () =>
    forInput(
        ['a'],
        (o, inputHint) => twice(runHint => {
            expect(o.mapNullable(i => i).toArray()).toEqualWithHint(['a'], inputHint, runHint);
            expect(o.mapNullable(() => null).toArray()).toEqualWithHint([], inputHint, runHint);
            expect(o.mapNullable(() => undefined).toArray()).toEqualWithHint([], inputHint, runHint);
        }),
    )
);

test('mapNullable empty', () =>
    forInput(
        [],
        (o, inputHint) => twice(runHint =>
            expect(o.mapNullable(() => { throw new Error() }).toArray()).toEqualWithHint([], inputHint, runHint)
        ),
    )
);

test('orElse', () =>
    forInput(
        ['a'],
        (o, inputHint) => twice(runHint => {
            expect(o.orElse('b')).toBeWithHint('a', inputHint, runHint);
            expect(o.orElseGet(() => 'b')).toBeWithHint('a', inputHint, runHint);
            expect(o.orElseNull()).toBeWithHint('a', inputHint, runHint);
            expect(o.orElseThrow()).toBeWithHint('a', inputHint, runHint);
            expect(o.orElseUndefined()).toBeWithHint('a', inputHint, runHint);
        }),
    )
);

test('orElse empty', () =>
    forInput(
        [] as string[],
        (o, inputHint) => twice(runHint => {
            expect(o.orElse(42)).toBeWithHint(42, inputHint, runHint);
            expect(o.orElseGet(() => 42)).toBeWithHint(42, inputHint, runHint);
            expect(o.orElseNull()).toBeWithHint(null, inputHint, runHint);
            expect(() => o.orElseThrow()).toThrow();
            expect(o.orElseUndefined()).toBeWithHint(undefined, inputHint, runHint);
        }),
    )
);

test('resolve', () =>
    forInput(
        ['a'],
        (o, inputHint) => twice(runHint => expect(o.resolve()).toEqualWithHint({has: true, val: 'a'}, inputHint, runHint))
    )
);

test('resolve empty', () =>
    forInput(
        [],
        (o, inputHint) => twice(runHint => expect(o.resolve()).toEqualWithHint({has: false}, inputHint, runHint))
    )
);

test('toStream', () =>
    forInput(
        ['a'],
        (o, inputHint) => twice(runHint =>
            expect(o.toStream().toArray()).toEqualWithHint(['a'], inputHint, runHint)
        ),
    )
);

test('toStream empty', () =>
    forInput(
        [],
        (o, inputHint) => twice(runHint => expect(o.toStream().toArray()).toEqualWithHint([], inputHint, runHint))
    )
);

