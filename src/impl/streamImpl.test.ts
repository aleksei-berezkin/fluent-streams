import { twice, twiceAsync } from './testUtil/twice';
import { Stream } from '../stream';
import { StreamImpl } from './streamImpl';
import { forInputCombinations } from './testUtil/forInputCombinations';
import './testUtil/extendExpect';
import { permutations } from './testUtil/permutations';
import { stream } from '../factories';
import { accommodations } from './testUtil/accommodations';

function forInput<T>(input: readonly T[], run: (base: Stream<T>, inputHint: () => string) => void) {
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

test('butLast', () =>
    [[], ['a'], ['a', 'b'], ['a', 'b', 'c']].forEach(input =>
        forInput(
            input,
            (s, inputHint) => twice(runHint =>
                expect(s.butLast().toArray()).toEqualWithHint(
                    input.length <= 1 ? [] : input.slice(0, input.length - 1),
                    inputHint,
                    runHint,
                )
            ),
        )
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

test('last', () =>
    [[], ['c'], ['a', 'b', 'c']].forEach(input =>
        forInput(
            input,
            (s, inputHint) => twice(runHint =>
                expect(s.last().resolve()).toEqualWithHint(
                    input.length ? {has: true, val: input[input.length - 1]} : {has: false},
                    inputHint,
                    runHint,
                )
            ),
        )
    )
);

test('map', () => {
    forInput(
        ['a', 'b', 'c'],
        (s, inputHint) => twice(runHint =>
            expect(s.map(i => i.toUpperCase()).toArray()).toEqualWithHint(['A', 'B', 'C'], inputHint, runHint)
        ),
    )
});

test('randomItem', () => {
    const input = ['a', 'b', 'c'] as const;
    const iterations = 3000;
    forInput(
        input,
        (s, inputHint) => {
            const collector: {[k in typeof input[number]]?: number} = {};
            for (let i = 0; i < iterations; i++) {
                const k = s.randomItem().get();
                collector[k] = (collector[k] || 0) + 1;
            }
            for (const c of input) {
                expect(collector[c]).toBeGreaterThanWithHint(800, inputHint, `${iterations} iterations`);
            }
        },
    )
});

test('reduce', () =>
    forInput(
        [2, 3, 4, 5],
        (s, inputHint) => twice(runHint =>
            expect(s.reduce((a, b) => a * b).get()).toBeWithHint(120, inputHint, runHint)
        ),
    )
);

test('reduce single', () =>
    forInput(
        ['a'],
        (s, inputHint) => twice(runHint =>
            expect(s.reduce(() => { throw new Error() }).get()).toBeWithHint('a', inputHint, runHint)
        ),
    )
);

test('reduce empty', () =>
    forInput(
        [],
        (s, inputHint) => twice(runHint =>
            expect(s.reduce(() => { throw new Error() }).isPresent()).toBeWithHint(false, inputHint, runHint)
        ),
    )
);

test('reduceLeft', () =>
    forInput(
        ['a', 'b', 'c'],
        (s, inputHint) => twice(runHint =>
            expect(s.reduceLeft('0', (l, r) => l + r)).toBeWithHint('0abc', inputHint, runHint)
        ),
    )
);

test('reduceLeft empty',() =>
    forInput(
        [],
        (s, inputHint) => twice(runHint =>
            expect(s.reduceLeft('0', () => { throw new Error() })).toBeWithHint('0', inputHint, runHint)
        ),
    )
);

test('reduceRight', () =>
    forInput(
        ['a', 'b', 'c'],
        (s, inputHint) => twice(runHint =>
            expect(s.reduceRight('0', (l, r) => l + r)).toBeWithHint('abc0', inputHint, runHint)
        ),
    )
);

test('shuffle', () => {
    const input = ['a', 'b', 'c', 'd'];
    const perm = permutations(input);

    const s = stream(input);
    const iter = 10000;
    const collector: {[k: string]: number | undefined } = {};
    for (let i = 0; i < iter; i++) {
        const res = s.shuffle().join('');
        collector[res] = (collector[res] || 0) + 1;
    }

    const expectedEachPermutation = iter / perm.length;
    for (const p of perm) {
        expect(collector[p]).toBeGreaterThanWithHint(expectedEachPermutation * .8, () => p, '');
    }
});

test('single', () =>
    [[], ['a'], ['a', 'b'], ['a', 'b', 'c']].forEach(input =>
        forInput(
            input,
            (s, inputHint) => twice(runHint =>
                expect(s.single().resolve()).toEqualWithHint(
                    input.length === 1 ? {has: true, val: input[0]} : {has: false},
                    inputHint,
                    runHint,
                )
            )
        )
    )
);

test('sortOn empty', () => forInput(
    [],
    (s, inputHint) => twice(runHint =>
        expect(s.sortOn(() => { throw new Error() }).toArray()).toEqualWithHint([], inputHint, runHint)
    ),
));

test('sortOn single', () => forInput(
    ['a'],
    (s, inputHint) => twice(runHint =>
        expect(s.sortOn(() => { throw new Error() }).toArray()).toEqualWithHint(['a'], inputHint, runHint)
    ),
));

test('sortOn multiple', () => forInput(
    ['3', '0', '2', '1', '2'],
    (s, inputHint) => twice(runHint =>
        expect(s.sortOn(Number.parseInt).toArray()).toEqualWithHint(['0', '1', '2', '2', '3'], inputHint, runHint)
    ),
));

test('splitWhen empty', () => forInput(
    [],
    (s, inputHint) => twice(runHint =>
        expect(s.splitWhen(() => { throw new Error() }).toArray()).toEqualWithHint([], inputHint, runHint)
    ),
));

test('splitWhen single', () => forInput(
    ['a'],
    (s, inputHint) => twice(runHint =>
        expect(s.splitWhen(() => { throw new Error() }).toArray()).toEqualWithHint([['a']], inputHint, runHint)
    ),
));

test('splitWhen each', () => forInput(
    ['a', 'b', 'c'],
    (s, inputHint) => twice(runHint =>
        expect(s.splitWhen(() => true).toArray()).toEqualWithHint([['a'], ['b'], ['c']], inputHint, runHint)
    ),
));

test('splitWhen some', () => forInput(
    ['a', 'b', 'c', 'd', 'e'],
    (s, inputHint) => twice(runHint =>
        expect(s.splitWhen((l, r) => r === 'a' || l === 'b' || r === 'd' || l === 'e').toArray()).toEqualWithHint(
            [['a', 'b'], ['c'], ['d', 'e']], inputHint, runHint
        )
    ),
));

test('tail', () => {
    for (const input of [[], ['a'], ['a', 'b'], ['a', 'b', 'c'], ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']]) {
        forInput(
            input,
            (s, inputHint) => twice(runHint =>
                expect(s.tail().toArray()).toEqualWithHint(input.slice(1), inputHint, runHint)
            ),
        );
    }
});

test('take, takeLast', () => {
    for (const input of [[], ['a'], ['a', 'b'], ['a', 'b', 'c']]) {
        for (const n of [-1, 0, 1, input.length - 1, input.length, input.length + 1]) {
            forInput(
                input,
                (s, inputHint) => twice(runHint => {
                    const _runHint = `${ runHint } -- n=${ n }`;
                    expect(s.take(n).toArray()).toEqualWithHint(
                        n < 0 ? [] : input.slice(0, n),
                        inputHint,
                        _runHint,
                    );
                    expect(s.takeLast(n).toArray()).toEqualWithHint(
                        input.slice(Math.max(0, input.length - n)),
                        inputHint,
                        _runHint,
                    );
                })
            )
        }
    }
});

test('takeRandom', () => {
    // TODO longer input + simplified forInput
    const input = ['a', 'b', 'c', 'd'];
    const iterPerAccommodation = 200;
    for (const n of [-1, 0, 1, 2, 3, 4, 5]) {
        forInput(
            input,
            (s, inputHint) => {
                const allAccommodations = accommodations(input, n);
                const collector = new Map<string, number>();
                for (let i = 0; i < Math.max(1, iterPerAccommodation * allAccommodations.length); i++) {
                    const accommodation = s.takeRandom(n).join('');
                    if (accommodation) {
                        collector.set(accommodation, (collector.get(accommodation) || 0) + 1);
                    }
                }

                expect(collector.size).toBeWithHint(allAccommodations.length, inputHint, `n=${n}`);
                allAccommodations.forEach(a => expect(collector.get(a)).toBeGreaterThanWithHint(iterPerAccommodation * .6, inputHint, a))
            }
        )
    }
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
