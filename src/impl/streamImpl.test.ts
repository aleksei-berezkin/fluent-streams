import { twice, twiceAsync } from './testUtil/twice';
import { Stream } from '../stream';
import { StreamImpl } from './streamImpl';
import { forInputCombinations } from './testUtil/forInputCombinations';

function forInput<T>(input: T[], run: (base: Stream<T>, getMessage: () => string) => void) {
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
        s => twice(() => expect(s.all(i => i.endsWith('x'))).toBe(true)),
    );
});

test('all neg', () => {
    forInput(
        ['ax', 'bx', 'c'],
        s => twice(() => expect(s.all(i => i.endsWith('x'))).toBe(false)),
    );
});

test('any', () => {
    forInput(
        ['a', 'b'],
        s => twice(() => expect(s.any(i => i === 'a')).toBe(true)),
    );
});

test('any neg', () => {
    forInput(
        ['a', 'b'],
        s => twice(() => expect(s.any(i => i === 'c')).toBe(false)),
    );
});

test('at neg', () => {
    forInput(
        ['a', 'b'],
        s => twice(() => expect(s.at(-1).resolve()).toEqual({has: false})),
    );
});

test('at', () => {
    forInput(
        ['a', 'b'],
        s => twice(() => expect(s.at(1).resolve()).toEqual({has: true, val: 'b'})),
    );
});

test('at out of', () => {
    forInput(
        ['a', 'b'],
        s =>  twice(() => expect(s.at(3).resolve()).toEqual({has: false})),
    );
});

test('awaitAll const', doneTest => {
    forInput(
        ['a', 'b'],
        s => twiceAsync(doneTest, doneRun =>
            s.awaitAll().then(items => {
                expect(items).toEqual(['a', 'b']);
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
        s => twiceAsync(doneTest, doneRun =>
            s.awaitAll().then(items => {
                expect(items).toEqual(['a', 'b']);
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
        s => twiceAsync(doneTest, doneRun =>
            s.awaitAll().then(items => {
                expect(items).toEqual(['a', 'b']);
                doneRun();
            })
        ),
    );
});

test('long chain', () => {
    forInput(
        ['a', 'b'],
        s => twice(() => {
            expect(
                s
                    .append('c')
                    .map(c => c.toUpperCase())
                    .filter(c => c !== 'B')
                    .toArray()
            ).toEqual(['A', 'C']);
        }),
    );
});

test('with r', () => {
    forInput(
        ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'],
        b => {
            const a = () => b
                .shuffle()
                .at(0)
                .get();
            expect([a(), a(), a(), a(), a()]).not.toEqual(['a', 'a', 'a', 'a', 'a']);
        }
    )
});
