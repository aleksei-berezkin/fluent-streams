import { twice, twiceAsync } from './testUtil/twice';
import { Stream } from '../stream';
import { StreamImpl } from './streamImpl';
import { forInputCombinations } from './testUtil/forInputCombinations';
import './testUtil/extendExpect';

function forInput<T>(input: T[], run: (base: Stream<T>, inputHint: () => string) => void) {
    return forInputCombinations(
        input,
        (head, tail) => new StreamImpl(undefined, function* () {
            yield* head;
            if (tail) {
                return tail;
            }
        }),
        run,
    )
}

test('all', () => {
    forInput(
        ['ax', 'bx', 'cx'],
        (s, inputHint) => twice(runHint => expect(s.all(i => i.endsWith('x'))).toBeWithHint(true, inputHint, runHint)),
    );
});

test('all neg', () => {
    forInput(
        ['ax', 'bx', 'c'],
        (s, inputHint) => twice(runHint => expect(s.all(i => i.endsWith('x'))).toBeWithHint(false, inputHint, runHint)),
    );
});

test('any', () => {
    forInput(
        ['a', 'b'],
        (s, inputHint) => twice(runHint => expect(s.any(i => i === 'a')).toBeWithHint(true, inputHint, runHint)),
    );
});

test('any neg', () => {
    forInput(
        ['a', 'b'],
        (s, inputHint) => twice(runHint => expect(s.any(i => i === 'c')).toBeWithHint(false, inputHint, runHint)),
    );
});

test('at neg', () => {
    forInput(
        ['a', 'b'],
        (s, inputHint)  => twice(runHint => expect(s.at(-1).resolve()).toEqualWithHint({has: false}, inputHint, runHint)),
    );
});

test('at', () => {
    forInput(
        ['a', 'b'],
        (s, inputHint) => twice(runHint => expect(s.at(1).resolve()).toEqualWithHint({has: true, val: 'b'}, inputHint, runHint)),
    );
});

test('at out of', () => {
    forInput(
        ['a', 'b'],
        (s, inputHint) =>  twice(runHint => expect(s.at(3).resolve()).toEqualWithHint({has: false}, inputHint, runHint)),
    );
});

test('awaitAll const', doneTest => {
    forInput(
        ['a', 'b'],
        (s, inputHint) => twiceAsync(doneTest, (doneRun, runHint) =>
            s.awaitAll().then(items => {
                expect(items).toEqualWithHint(['a', 'b'], inputHint, runHint);
                doneRun();
            })
        )
    );
});

test('awaitAll promise', doneTest => {
    forInput(
        [
            new Promise(resolve => setTimeout(() => resolve('a'), 100)),
            new Promise(resolve => setTimeout(() => resolve('b'), 200))
        ],
        (s, inputHint) => twiceAsync(doneTest, (doneRun, runHint) =>
            s.awaitAll().then(items => {
                expect(items).toEqualWithHint(['a', 'b'], inputHint, runHint);
                doneRun();
            })
        )
    )
});

test('awaitAll mix', doneTest => {
    forInput(
        [
            new Promise(resolve => setTimeout(() => resolve('a'), 100)),
            'b',
        ],
        (s, inputHint) => twiceAsync(doneTest, (doneRun, runHint) =>
            s.awaitAll().then(items => {
                expect(items).toEqualWithHint(['a', 'b'], inputHint, runHint);
                doneRun();
            })
        ),
    );
});

test('append', () => {
    forInput(
        ['a', 'b'],
        (s, inputHint) => twice(runHint => expect(s.append('c').toArray()).toEqualWithHint(['a', 'b', 'c'], inputHint, runHint)),
    );
});

test('appendAll', () => {
    forInput(
        ['a', 'b'],
        (s, inputHint) => twice(runHint =>
            expect(s.appendAll(['c', 'd']).toArray()).toEqualWithHint(['a', 'b', 'c', 'd'], inputHint, runHint),
        ),
    )
});

test('long chain', () => {
    forInput(
        ['a', 'b'],
        (s, inputHint) => twice(runHint => {
            expect(
                s
                    .append('c')
                    .map(c => c.toUpperCase())
                    .filter(c => c !== 'B')
                    .toArray()
            ).toEqualWithHint(['A', 'C'], inputHint, runHint);
        }),
    );
});

test('with r', () => {
    forInput(
        ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'],
        (b, inputHint) => {
            const a = () => b
                .shuffle()
                .at(0)
                .get();
            expect([a(), a(), a(), a(), a()]).not.toEqualWithHint(['a', 'a', 'a', 'a', 'a'], inputHint, 'Single run');
        }
    )
});
