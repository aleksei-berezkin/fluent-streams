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

test('appendAll array copied', () => {
    const appended = ['a', 'b'];
    forInput(
        [] as string[],
        (s, inputHint) => twice(runHint => {
            const a = s.appendAll(appended).toArray();
            expect(a).toEqualWithHint(appended, inputHint, runHint);
            expect(a).not.toBeWithHint(appended, inputHint, runHint);
        }),
    );
});

test('appendAllIf', () =>
    forInput(
        ['a', 'b'],
        (s, inputHint) => twice(runHint =>
            expect(s.appendAllIf(true, ['c', 'd']).toArray()).toEqualWithHint(['a', 'b', 'c', 'd'], inputHint, runHint)
        ),
    )
);

test('appendAllIf neg', () =>
    forInput(
        ['a', 'b'],
        (s, inputHint) => twice(runHint =>
            expect(s.appendAllIf(false, ['c', 'd']).toArray()).toEqualWithHint(['a', 'b'], inputHint, runHint)
        ),
    )
);

test('butLast empty', () =>
    forInput(
        [],
        (s, inputHint) => twice(runHint =>
            expect(s.butLast().toArray()).toEqualWithHint([], inputHint, runHint)
        ),
    )
);

test('butLast single', () =>
    forInput(
        ['a'],
        (s, inputHint) => twice(runHint =>
            expect(s.butLast().toArray()).toEqualWithHint([], inputHint, runHint)
        ),
    )
);

test('butLast some', () =>
    forInput(
        ['a', 'b', 'c'],
        (s, inputHint) => twice(runHint =>
            expect(s.butLast().toArray()).toEqualWithHint(['a', 'b'], inputHint, runHint)
        ),
    )
);

test('distinctBy', () =>
    forInput(
        [{k: 'a', v: 1}, {k: 'b', v: 2}, {k: 'a', v: 3}],
        (s, inputHint) => twice(runHint =>
            expect(s.distinctBy(i => i.k).toArray()).toEqualWithHint([{k: 'a', v: 1}, {
                k: 'b',
                v: 2
            }], inputHint, runHint)
        ),
    )
);

test('equals', () =>
    forInput(
        ['a', 'b', 'c'],
        (s, inputHint1) => twice(runHint1 =>
            forInput(
                ['a', 'b', 'c'],
                (t, inputHint2) => twice(runHint2 => {
                    expect(s.equals(t)).toBeWithHint(true, () => `${ inputHint1 } - ${ inputHint2 }`, `${ runHint1 } - ${ runHint2 }`);
                    expect(t.equals(s)).toBeWithHint(true, () => `${ inputHint1 } - ${ inputHint2 }`, `${ runHint1 } - ${ runHint2 }`);
                }),
            )
        ),
    )
);

test('equals neg', () =>
    forInput(
        ['a', 'b', 'c'],
        (s, inputHint1) => twice(runHint1 =>
            forInput(
                ['a', 'b', 'c', 'd'],
                (t, inputHint2) => twice(runHint2 => {
                    expect(s.equals(t)).not.toBeWithHint(true, () => `${ inputHint1 } - ${ inputHint2 }`, `${ runHint1 } - ${ runHint2 }`);
                    expect(t.equals(s)).not.toBeWithHint(true, () => `${ inputHint1 } - ${ inputHint2 }`, `${ runHint1 } - ${ runHint2 }`);
                }),
            )
        ),
    )
);

test('filter', () =>
    forInput(
        ['a', 'b', 'c'],
        (s, inputHint) => twice(runHint =>
            expect(s.filter(s => s !== 'b').toArray()).toEqualWithHint(['a', 'c'], inputHint, runHint),
        ),
    )
);

test('filterWithAssertion', () => {
    function isString(s: string | number): s is string {
        return typeof s === 'string';
    }
    forInput(
        ['a', 1, 'c'],
        (s, inputHint) => twice(runHint => {
            const r: string[] = s.filterWithAssertion(isString).toArray();
            expect(r).toEqualWithHint(['a', 'c'], inputHint, runHint);
        }),
    );
});

test('find', () =>
    forInput(
        [['a', 1] as const, ['b', 2] as const, ['b', 3] as const],
        (s, inputHint) => twice(runHint =>
            expect(s.find(i => i[0] === 'b').get()[1]).toBeWithHint(2, inputHint, runHint)
        ),
    )
);

test('find none', () =>
    forInput(
        ['a', 'b', 'c'],
        (s, inputHint) => twice(runHint =>
            expect(s.find(i => i === 'd').isPresent()).toBeWithHint(false, inputHint, runHint)
        ),
    )
);

test('flatMap', () =>
    forInput(
        [['a'], [], ['b', 'c']],
        (s, inputHint) => twice(runHint =>
            expect(s.flatMap(i => i).toArray()).toEqualWithHint(['a', 'b', 'c'], inputHint, runHint)
        ),
    )
);

test('forEach', () =>
    forInput(
        ['a', 'b', 'c'],
        (s, inputHint) => twice(runHint => {
            const trace: string[] = [];
            s.forEach(i => trace.push(i));
            expect(trace).toEqualWithHint(['a', 'b', 'c'], inputHint, runHint);
        }),
    )
);

test('groupBy', () =>
    forInput(
        [{k: 'a', v: 1}, {k: 'a', v: 2}, {k: 'b', v: 3}],
        (s, inputHint) => twice(runHint =>
            expect(s.groupBy(i => i.k).toArray()).toEqualWithHint(
                [['a', [{k: 'a', v: 1}, {k: 'a', v: 2}]], ['b', [{k: 'b', v: 3}]]],
                inputHint,
                runHint,
            )
        ),
    )
);

test('head', () =>
    forInput(
        ['a', 'b'],
        (s, inputHint) => twice(runHint =>
            expect(s.head().get()).toBeWithHint('a', inputHint, runHint)
        ),
    )
);

test('head empty', () =>
    forInput(
        [],
        (s, inputHint) => twice(runHint =>
            expect(s.head().isPresent()).toBeWithHint(false, inputHint, runHint)
        ),
    )
);

test('join empty', () =>
    forInput(
        [],
        (s, inputHint) => twice(runHint =>
            expect(s.join(', ')).toBeWithHint('', inputHint, runHint)
        ),
    )
);

test('join', () =>
    forInput(
        ['a', 'b', 'c'],
        (s, inputHint) => twice(runHint =>
            expect(s.join(', ')).toBeWithHint('a, b, c', inputHint, runHint)
        ),
    )
);

test('joinBy', () =>
    forInput(
        ['a', 'b', 'c', 'd', 'e', 'b'],
        (s, inputHint) => twice(runHint =>
            expect(s.joinBy((l, r) => (l === 'b' || r === 'e') ? '; ' : ', ')).toBeWithHint(
                'a, b; c, d; e, b', inputHint, runHint
            )
        ),
    )
);

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
