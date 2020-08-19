import './testUtil/extendExpect';
import { CombinationsMode, forInputCombinations } from './testUtil/forInputCombinations';
import { Optional } from '../optional';
import { OptionalImpl } from './optionalImpl';
import { twice } from './testUtil/twice';

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

test('flatMap empty', () =>
    forInput(
        [],
        (o, inputHint) => twice(runHint =>
            expect(o.flatMap(() => { throw new Error() }).toArray()).toEqualWithHint([], inputHint, runHint)
        ),
    )
);
