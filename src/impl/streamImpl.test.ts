import { twice } from './testUtil/twice';
import { Stream } from '../stream';
import { StreamImpl } from './streamImpl';

function forInput<T>(input: T[], run: (base: Stream<T>, msg: string) => void) {
    for (let headSize = 0; headSize <= input.length; headSize++) {
        const head = input.slice(0, headSize);
        const tail = input.slice(headSize);
        for (const modifiableTail of [false, true]) {
            run(createStream(head, tail, modifiableTail), `head: ${head}, tail: ${tail}, modifiableTail: ${modifiableTail}`);
        }
    }
    run(createStream(input), `head: ${input}`);
}

function createStream<T>(head: T[], tail?: T[], modifiableTail?: boolean) {
    return new StreamImpl(undefined, function* () {
        yield* head;
        if (tail) {
            if (modifiableTail) {
                return {
                    array: [...tail],
                    canModify: true,
                }
            }
            return {
                array: tail,
                canModify: false,
            }
        }
    });
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

test('awaitAll const', done => {
    forInput(
        ['a', 'b'],
        s => twice(done, _done =>
            s.awaitAll().then(items => {
                expect(items).toEqual(['a', 'b']);
                _done();
            })
        )
    );
});

test('awaitAll promise', done => {
    forInput(
        [
            new Promise(resolve => setTimeout(() => resolve('a'), 100)),
            new Promise(resolve => setTimeout(() => resolve('b'), 200))
        ],
        s => twice(done, _done =>
            s.awaitAll().then(items => {
                expect(items).toEqual(['a', 'b']);
                _done();
            })
        )
    )
});

test('awaitAll mix', done => {
    forInput(
        [
            new Promise(resolve => setTimeout(() => resolve('a'), 100)),
            'b',
        ],
        s => twice(done, _done =>
            s.awaitAll().then(items => {
                expect(items).toEqual(['a', 'b']);
                _done();
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
