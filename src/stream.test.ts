import './testUtil/extendExpect';
import { forStreamInput as forInput } from './testUtil/forInput';
import { twice } from './testUtil/twice';
import { permutations } from './testUtil/permutations';
import { variations } from './testUtil/variations';
import { same, stream } from '.';

test('at neg last', () => forInput(
    ['a', 'b', 'c'],
    s => s.at(-1),
    (o, inputHint)  => twice(runHint => expect(o.resolve()).toEqualWithHint({has: true, val: 'c'}, inputHint, runHint)),
));

test('at neg mid', () => forInput(
    ['a', 'b', 'c', 'd'],
    s => s.at(-3),
    (o, inputHint)  => twice(runHint => expect(o.resolve()).toEqualWithHint({has: true, val: 'b'}, inputHint, runHint)),
));

test('at neg first', () => forInput(
    ['a', 'b', 'c', 'd'],
    s => s.at(-4),
    (o, inputHint)  => twice(runHint => expect(o.resolve()).toEqualWithHint({has: true, val: 'a'}, inputHint, runHint)),
));

test('at neg out of', () => forInput(
    ['a', 'b', 'c', 'd'],
    s => s.at(-5),
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

test('butLast', () =>  [[], ['a'], ['a', 'b'], ['a', 'b', 'c']].forEach(input =>
    forInput(
        input,
        s => s.butLast(),
        (s, inputHint) => twice(runHint =>
            expect(s.toArray()).toEqualWithHint(
                input.length <= 1 ? [] : input.slice(0, input.length - 1),
                inputHint,
                runHint,
            )
        ),
    )
));

test('concat single', () => [[], ['a'], ['a', 'b']].forEach(input => forInput(
    input,
    s => s.concat('c'),
    (s, inputHint) => twice(runHint => expect(s.toArray()).toEqualWithHint(input.concat('c'), inputHint, runHint)),
)));

test('concat several', () => [[], ['a'], ['a', 'b']].forEach(input => forInput(
    input,
    s => s.concat('c', 'd', 'e'),
    (s, inputHint) => twice(runHint => expect(s.toArray()).toEqualWithHint(input.concat('c', 'd', 'e'), inputHint, runHint)),
)));

test('concatAll', () =>  forInput(
    ['a', 'b'],
    s => s.concatAll(['c', 'd']),
    (s, inputHint) => twice(runHint =>
        expect(s.toArray()).toEqualWithHint(['a', 'b', 'c', 'd'], inputHint, runHint),
    ),
));

test('concatAll suspended', () => {
    const appended: string[] = [];
    forInput(
        ['a', 'b'],
        s => s.concatAll(appended),
        (s, inputHint) => twice(runHint => {
            appended.push('c', 'd');
            expect(s.toArray()).toEqualWithHint(['a', 'b', 'c', 'd'], inputHint, runHint);
            appended.length = 0;
        }),
    );
});

test('concatAll RandomAccessStream', () =>  forInput(
    ['a', 'b'],
    s => s.concatAll(stream(['c', 'd'])),
    (s, inputHint) => twice(runHint =>
        expect(s.toArray()).toEqualWithHint(['a', 'b', 'c', 'd'], inputHint, runHint),
    ),
));

test('concat null itr', () => forInput(
    ['a', 'b'],
    s => s.concatAll({
        [Symbol.iterator](): Iterator<string> {
            return null as any;
        }
    }),
    s => twice(() => expect(() => s.toArray()).toThrow()),
    false,
));

test('distinctBy', () => forInput(
    [{k: 'a', v: 1}, {k: 'b', v: 2}, {k: 'a', v: 3}],
    s => s.distinctBy(i => i.k),
    (s, inputHint) => twice(runHint =>
        expect(s.toArray()).toEqualWithHint(
            [
                {k: 'a', v: 1},
                {k: 'b', v: 2},
            ],
            inputHint,
            runHint,
        )
    ),
));

test('distinctBy with index', () => forInput(
    [['a', 1], ['a', 2], ['a', 3], ['b', 1], ['b', 2], ['b', 3]],
    s => s.distinctBy(([c], index) => c + String(Math.floor(index / 2))),
    (s, inputHint) => twice(runHint =>
        expect(s.toArray()).toEqualWithHint(
            [
                ['a', 1],
                ['a', 3],
                ['b', 1],
                ['b', 2]
            ],
            inputHint,
            runHint,
        )
    ),
));

test('distinctBy empty', () => forInput(
    [],
    s => s.distinctBy(() => {throw new Error()}),
    (s, inputHint) => twice(runHint => expect(s.toArray()).toEqualWithHint([], inputHint, runHint)),
));

test('drop', () => [[], ['a'], ['a', 'b'], ['a', 'b', 'c']].forEach(input => forInput(
    input,
    s => s.drop(2),
    (s, inputHint) => twice(runHint =>
        expect(s.toArray()).toEqualWithHint(
            input.slice(2), inputHint, runHint
        ),
    )
)))

test('dropLast', () => [-1, 0, 1, 2, 5, 6, 7].forEach(n =>
    forInput(
        ['a', 'b', 'c', 'd', 'e', 'f'],
        s => s.dropLast(n),
        (s, inputHint) => twice(runHint =>
            expect(s.toArray()).toEqualWithHint(
                n <= 0 ? ['a', 'b', 'c', 'd', 'e', 'f']
                    : n === 1 ? ['a', 'b', 'c', 'd', 'e']
                    : n === 2 ? ['a', 'b', 'c', 'd']
                    : n === 5 ? ['a']
                    : [],
                inputHint,
                runHint
            ),
        )
    )
))

test('dropLast empty', () => [-1, 0, 1, 3].forEach(n =>
    forInput(
        [],
        s => s.dropLast(n),
        (s, inputHint) => twice(runHint =>
            expect(s.toArray()).toEqualWithHint([], inputHint, runHint),
        )
    )
))

test('dropLastWhile', () => [[], [''], ['', ''], ['a', 'b'], ['a', '', 'b', '', '']].forEach((input, iIndex) =>
    forInput(
        input,
        s => s.dropLastWhile(c => !c),
        (s, inputHint) => twice(runHint =>
            expect(s.toArray()).toEqualWithHint(
                iIndex <= 2 ? []
                    : iIndex === 3 ? ['a', 'b']
                    : ['a', '', 'b'],
                inputHint,
                runHint),
        )
    )
))

test('dropLastWhile index', () => [['a', 'b'], ['a', 'b', 'c', 'd']].forEach((input, iIndex) =>
    forInput(
        input,
        s => s.dropLastWhile((_, ix) => ix >= 3),
        (s, inputHint) => twice(runHint =>
            expect(s.toArray()).toEqualWithHint(
                iIndex === 0 ? ['a', 'b'] : ['a', 'b', 'c'],
                inputHint,
                runHint),
        )
    )
))

test('dropWhile', () => [[], [''], ['', ''], ['a', 'b'], ['', '', 'a', '', 'b', '']].forEach((input, iIndex) =>
    forInput(
        input,
        s => s.dropWhile(c => !c),
        (s, inputHint) => twice(runHint =>
            expect(s.toArray()).toEqualWithHint(
                iIndex <= 2 ? []
                    : iIndex === 3 ? ['a', 'b']
                    : ['a', '', 'b', ''],
                inputHint,
                runHint),
        )
    )
))

test('dropWhile index', () => [['a', 'b'], ['a', 'b', 'c', 'd']].forEach((input, iIndex) =>
    forInput(
        input,
        s => s.dropWhile((_, ix) => ix < 2),
        (s, inputHint) => twice(runHint =>
            expect(s.toArray()).toEqualWithHint(
                iIndex === 0 ? [] : ['c', 'd'],
                inputHint,
                runHint),
        )
    )
))

test('equals', () =>
    forInput(
        ['a', 'b', 'c'],
        s => s,
        (s, inputHint1) => twice(runHint1 =>
            forInput(
                ['a', 'b', 'c'],
                t => t,
                (t, inputHint2) => twice(runHint2 => {
                    expect(s.equals(t)).toBeWithHint(true, () => `${ inputHint1() } - ${ inputHint2() }`, `${ runHint1 } - ${ runHint2 }`);
                    expect(t.equals(s)).toBeWithHint(true, () => `${ inputHint1() } - ${ inputHint2() }`, `${ runHint1 } - ${ runHint2 }`);
                }),
            )
        ),
    )
);

test('equals neg', () =>
    forInput(
        ['a', 'b', 'c'],
        s => s,
        (s, inputHint1) => twice(runHint1 =>
            forInput(
                ['a', 'b', 'c', 'd'],
                t => t,
                (t, inputHint2) => twice(runHint2 => {
                    expect(s.equals(t)).not.toBeWithHint(true, () => `${ inputHint1() } - ${ inputHint2() }`, `${ runHint1 } - ${ runHint2 }`);
                    expect(t.equals(s)).not.toBeWithHint(true, () => `${ inputHint1() } - ${ inputHint2() }`, `${ runHint1 } - ${ runHint2 }`);
                }),
            )
        ),
    )
);

test('every', () =>  forInput(
    ['ax', 'b', 'cx'],
    s => s,
    (s, inputHint) => twice(runHint => expect(s.every((i, ix) => ix === 1 || i.endsWith('x'))).toBeWithHint(true, inputHint, runHint)),
));

test('every neg', () => forInput(
    ['ax', 'bx', 'c'],
    s => s,
    (s, inputHint) => twice(runHint => expect(s.every(i => i.endsWith('x'))).toBeWithHint(false, inputHint, runHint)),
));

test('filter', () =>
    forInput(
        ['a', 'b', 'c', 'd'],
        s => s.filter((s, index) => s !== 'b' && !!index),
        (s, inputHint) => twice(runHint =>
            expect(s.toArray()).toEqualWithHint(['c', 'd'], inputHint, runHint),
        ),
    )
);

test('filter with type guard', () => {
    function isString(s: string | number): s is string {
        return typeof s === 'string' && s !== 'not a string';
    }
    forInput(
        ['a', 1, 'c', 'not a string'],
        s => s.filter<string>(isString),
        (s, inputHint) => twice(runHint => {
            const r: string[] = s.toArray();
            expect(r).toEqualWithHint(['a', 'c'], inputHint, runHint);
        }),
    );
});

test('find', () => [[], ['a'], ['a', 'bx', 'c', 'by'], ['bx', 'a']].forEach((input, iIndex) => forInput(
    input,
    s => s.find((i, index) => i[0] === 'b' && !!index),
    (o, inputHint) => twice(runHint =>
        expect(o.orUndefined()).toEqualWithHint(
            iIndex === 2 ? 'bx' : undefined,
            inputHint,
            runHint,
        )
    ),
)));

test('findLast', () => [[], ['a'], ['a', 'bx', 'c', 'by', 'bz'], ['by', 'a']].forEach((input, iIndex) => forInput(
    input,
    s => s.findLast((i, index) => i[0] === 'b' && index !== 4),
    (o, inputHint) => twice(runHint =>
        expect(o.orUndefined()).toEqualWithHint(
            iIndex === 2 || iIndex === 3 ? 'by' : undefined,
            inputHint,
            runHint,
        )
    ),
)));

test('flat', () => [-1, 0, 1, 2, 3, 4].forEach(n => forInput(
    [[[]], [['a'], ['b']], [['c', 'd', 'e']]],
    s => s.flat(n),
    (s, inputHint) =>
        twice(runHint => expect(
            s.toArray()).toEqualWithHint(
                n <= 0 ? [[[]], [['a'], ['b']], [['c', 'd', 'e']]]
                    : n === 1 ? [[], ['a'], ['b'], ['c', 'd', 'e']]
                    : ['a', 'b', 'c', 'd', 'e'],
                inputHint,
                runHint
        )),
)))

test('flatMap', () =>
    [
        [[]],
        [['a']],
        [[], [], ['a']],
        [['a'], [], [], []],
        [['a'], [], ['b', 'c', 'd'], [], [], ['e', 'f'], ['g']]
    ].forEach((input, iIndex) => forInput(
        input,
        s => s.flatMap((s, ix) => ix === 2 && !s.length ? ['x', 'xx'] : s),
        (s, inputHint) => twice(runHint =>
            expect(s.toArray()).toEqualWithHint(
                iIndex === 0 ? []
                    : (iIndex === 1 || iIndex === 2) ? ['a']
                    : iIndex === 3 ? ['a', 'x', 'xx']
                    : iIndex === 4 ? ['a', 'b', 'c', 'd', 'e', 'f', 'g']
                    : {} as never,
                inputHint,
                runHint
            )
        ),
    ))
);

test('forEach', () => [[], ['a'], ['a', 'b']].forEach(input => forInput(
    input,
    s => s,
    (s, inputHint) => twice(runHint => {
        const o: string[] = [];
        s.forEach(i => o.push(i));
        expect(o).toEqualWithHint(input, inputHint, runHint);
    }),
)));

test('forEachUntil', () => [[], ['a'], ['a', 'b', 'c', 'c', 'd']].forEach((input, iInput) => forInput(
    input,
    s => s,
    (s, inputHint) => twice(runHint => {
        const o: string[] = [];
        s.forEachUntil((c, index)  => {
            if (c === 'c' && index === 3) return true
            o.push(c)
            return false
        });
        expect(o).toEqualWithHint(
            iInput === 0 ? [] : iInput === 1 ? ['a'] : ['a', 'b', 'c'],
            inputHint,
            runHint
        );
    }),
)));

test('groupBy', () => forInput(
    [{k: 'a', v: 1}, {k: 'a', v: 2}, {k: 'b', v: 3}],
    s => s.groupBy(i => i.k),
    (s, inputHint) => twice(runHint =>
        expect(s.toArray()).toEqualWithHint(
            [['a', [{k: 'a', v: 1}, {k: 'a', v: 2}]], ['b', [{k: 'b', v: 3}]]],
            inputHint,
            runHint,
        )
    ),
));

test('groupBy with index', () => forInput(
    ['a', 'a', 'a', 'b', 'b', 'b', 'b', 'b', 'c'],
    s => s.groupBy((c, index) => c + String(index % 2)),
    (s, inputHint) => twice(runHint =>
        expect(s.toArray()).toEqualWithHint(
            [['a0', ['a', 'a']], ['a1', ['a']], ['b1', ['b', 'b', 'b']], ['b0', ['b', 'b']], ['c0', ['c']]],
            inputHint,
            runHint,
        )
    ),
));

test('head', () => [[], ['a'], ['a', 'b']].forEach(input => forInput(
    input,
    s => s.head(),
    (s, inputHint) => twice(runHint =>
        expect(s.toArray()).toEqualWithHint(input.slice(0, 1), inputHint, runHint)
    ),
)));

test('join empty', () => forInput(
    [],
    s => s,
    (s, inputHint) => twice(runHint =>
        expect(s.join(', ')).toBeWithHint('', inputHint, runHint)
    ),
));

test('join default sep', () => forInput(
    ['a', 'b', 'c'],
    s => s,
    (s, inputHint) => twice(runHint =>
        expect(s.join()).toBeWithHint('a,b,c', inputHint, runHint)
    ),
));

test('join', () => forInput(
    ['a', 'b', 'c'],
    s => s,
    (s, inputHint) => twice(runHint =>
        expect(s.join(', ')).toBeWithHint('a, b, c', inputHint, runHint)
    ),
));

test('join spec', () => [
    [[] as string[], {sep: ','}, ''] as const,
    [[] as string[], {sep: ',', leading: true}, ','] as const,
    [[] as string[], {sep: ',', trailing: true}, ','] as const,
    [[] as string[], {sep: ',', leading: true, trailing: true}, ',,'] as const,
    [['a'] as string[], {sep: ','}, 'a'] as const,
    [['a'] as string[], {sep: ',', leading: true}, ',a'] as const,
    [['a'] as string[], {sep: ',', trailing: true}, 'a,'] as const,
    [['a'] as string[], {sep: ',', leading: true, trailing: true}, ',a,'] as const,
    [['a', 'b'] as string[], {sep: ','}, 'a,b'] as const,
    [['a', 'b'] as string[], {sep: ',', leading: true}, ',a,b'] as const,
    [['a', 'b'] as string[], {sep: ',', trailing: true}, 'a,b,'] as const,
    [['a', 'b'] as string[], {sep: ',', leading: true, trailing: true}, ',a,b,'] as const,
].forEach(([input, spec, output]) => forInput(
    input,
    s => s,
    (s, inputHint) => twice(runHint =>
        expect(s.join(spec)).toBeWithHint(output, inputHint, runHint)
    ),
)));

test('joinBy', () => forInput(
    ['a', 'b', 'c', 'd', 'e', 'b'],
    s => s,
    (s, inputHint) => twice(runHint =>
        expect(s.joinBy((l, r, lIndex) => (l === 'b' || r === 'e' || lIndex === 4) ? '; ' : ', ')).toBeWithHint(
            'a, b; c, d; e; b', inputHint, runHint
        )
    ),
));

test('last', () => [[], ['c'], ['a', 'b', 'c']].forEach(input =>
    forInput(
        input,
        s => s.last(),
        (s, inputHint) => twice(runHint =>
            expect(s.resolve()).toEqualWithHint(
                input.length ? {has: true, val: input[input.length - 1]} : {has: false},
                inputHint,
                runHint,
            )
        ),
    )
));

test('map', () => [[], ['a'], ['a', 'b', 'c']].forEach(input => forInput(
    input,
    s => s.map((c, index) => c.toUpperCase() + String(index)),
    (s, inputHint) => twice(runHint =>
        expect(s.toArray()).toEqualWithHint(input.map((c, index) => c.toUpperCase() + String(index)), inputHint, runHint)
    ),
)));

test('peek', () => forInput(
    ['a', 'b', 'c'],
    s => s,
    (s, inputHint) => twice(runHint => {
        const collector: string[] = [];
        expect(s.peek((c, index) => collector.push(c, String(index))).toArray()).toEqualWithHint(['a', 'b', 'c'], inputHint, runHint);
        expect(collector).toEqualWithHint(['a', '0', 'b', '1', 'c', '2'], inputHint, `${runHint} -- checking collector`);
    }),
));

test('randomItem', () => {
    const input = ['a', 'b', 'c'];
    const iterations = 3000;
    forInput(
        input,
        s => s.randomItem(),
        (s, inputHint) => {
            const collector = new Map<string, number>();
            for (let i = 0; i < iterations; i++) {
                const k = s.get();
                collector.set(k, (collector.get(k) || 0) + 1);
            }
            expect(collector.size).toBeWithHint(input.length, inputHint, '');
            for (const c of input) {
                expect(collector.get(c)).toBeGreaterThanWithHint(800, inputHint, `${iterations} iterations`);
            }
        },
        false,
    )
});

test('reverse', () => [[], ['a'], ['a', 'b', 'c']].forEach(input => forInput(
    input,
    s => s.reverse(),
    (s, inputHint) => twice(runHint => expect(s.toArray()).toEqualWithHint(
        [...input].reverse(),
        inputHint,
        runHint,
    ))
)));

test('shuffle', () => {
    const input = ['a', 'b', 'c', 'd', 'e'];
    const perm = permutations(input);
    const iterPerPermutation = 500;

    forInput(
        input,
        s => s.shuffle(),
        (s, inputHint) => {
            const collector: {[k: string]: number | undefined } = {};
            for (let i = 0; i < perm.length * iterPerPermutation; i++) {
                const res = s.join('');
                collector[res] = (collector[res] || 0) + 1;
            }

            for (const p of perm) {
                expect(collector[p]).toBeGreaterThanWithHint(iterPerPermutation * .7, inputHint, p);
            }
        },
        false,
    );
});

test('single', () => [[] as string[], ['a'], ['a', 'b'], ['a', 'b', 'c']].forEach(input => forInput(
    input,
    s => s.single(),
    (s, inputHint) => twice(runHint => expect(s.resolve()).toEqualWithHint(
        input.length === 1 ? {has: true, val: input[0]} : {has: false},
        inputHint,
        runHint,
    ))
)));

test('size', () => [[] as string[], ['a'], ['a', 'b'], ['a', 'b', 'c']].forEach(input => forInput(
    input,
    s => s,
    (s, inputHint) => twice(runHint => expect(s.size()).toEqualWithHint(
        input.length,
        inputHint,
        runHint,
    ))
)));

test('some', () => forInput(
    ['a', 'b'],
    s => s,
    (s, inputHint) => twice(runHint => expect(s.some((c, index) => c === 'b' && index === 1)).toBeWithHint(true, inputHint, runHint)),
));

test('some neg', () => forInput(
    ['a', 'b'],
    s => s,
    (s, inputHint) => twice(runHint => expect(s.some((c, index) => c === 'b' && index === 0)).toBeWithHint(false, inputHint, runHint)),
));

test('sort', () => [[], ['a'], ['c', 'a', 'd', 'e', 'b']].forEach(input => forInput(
    input,
    s => s.sort(),
    (s, inputHint) => twice(runHint =>
        expect(s.toArray()).toEqualWithHint(input.sort(), inputHint, runHint)
    ),
)))

test('sort compareFn', () => [[], [1], [4, 1, 5, 2, 3]].forEach(input => forInput(
    input,
    s => s.sort((i, j) => j - i),
    (s, inputHint) => twice(runHint =>
        expect(s.toArray()).toEqualWithHint(input.sort().reverse(), inputHint, runHint)
    ),
)))

test('sortBy', () => [[] as string[], ['0'], ['1', '0'], ['4', '22', '6', '6', '2']].forEach(input => forInput(
    input,
    s => s.sortBy(i => Number.parseInt(i)),
    (s, inputHint) => twice(runHint =>
        expect(s.toArray()).toEqualWithHint(input.sort((a, b) => Number.parseInt(a) - Number.parseInt(b)), inputHint, runHint)
    ),
)));

test('splitWhen empty', () => forInput(
    [],
    s => s.splitWhen(() => { throw new Error() }),
    (s, inputHint) => twice(runHint => expect(s.toArray()).toEqualWithHint([], inputHint, runHint)),
));

test('splitWhen single', () => forInput(
    ['a'],
    s => s.splitWhen(() => { throw new Error() }),
    (s, inputHint) => twice(runHint => expect(s.toArray()).toEqualWithHint([['a']], inputHint, runHint)),
));

test('splitWhen each', () => forInput(
    ['a', 'b', 'c'],
    s => s.splitWhen(() => true),
    (s, inputHint) => twice(runHint =>
        expect(s.toArray()).toEqualWithHint([['a'], ['b'], ['c']], inputHint, runHint)
    ),
));

test('splitWhen some', () => forInput(
    ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    s => s.splitWhen((l, r, lIndex) => r === 'a' || l === 'b' || r === 'd' || lIndex === 4 || l === 'g'),
    (s, inputHint) => twice(runHint =>
        expect(s.toArray()).toEqualWithHint(
            [['a', 'b'], ['c'], ['d', 'e'], ['f', 'g']], inputHint, runHint
        )
    ),
));

test('tail', () =>
    [[], ['a'], ['a', 'b'], ['a', 'b', 'c'], ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']].forEach(input =>
        forInput(
            input,
            s => s.tail(),
            (s, inputHint) => twice(runHint =>
                expect(s.toArray()).toEqualWithHint(input.slice(1), inputHint, runHint)
            ),
        )
    )
);

test('take, takeLast', () => {
    [[], ['a'], ['a', 'b'], ['a', 'b', 'c'], ['a', 'b', 'c', 'd', 'e', 'f']].forEach(input =>
        [-1, 0, 1, input.length - 1, input.length, input.length + 1].forEach(n => {
            const nHint = (runHint: string) => `${ runHint } -- n=${ n }`;
            forInput(
                input,
                s => s.take(n),
                (s, inputHint) => twice(runHint => {
                    expect(s.toArray()).toEqualWithHint(
                        n < 0 ? [] : input.slice(0, n),
                        inputHint,
                        nHint(runHint),
                    );
                }),
            );
            forInput(
                input,
                s => s.takeLast(n),
                (s, inputHint) => twice(runHint => {
                    expect(s.toArray()).toEqualWithHint(
                        input.slice(Math.max(0, input.length - n)),
                        inputHint,
                        nHint(runHint),
                    );
                }),
            );
        })
    );
});

test('takeLastWhile', () =>
    [[], [1], [0, 1], [1, 2, 2], [0, 0, 2, 3]].forEach((input, iIndex) =>
        forInput(
            input,
            s => s.takeLastWhile((num, ix) => num === ix),
            (s, inputHint) => twice(runHint =>
                expect(s.toArray()).toEqualWithHint(
                    iIndex === 0 || iIndex === 1 ? []
                        : iIndex === 2 ? [0, 1]
                        : iIndex === 3 ? [2]
                        : iIndex === 4 ? [2, 3]
                        : undefined as never,
                    inputHint,
                    runHint
                )
            ),
        )
    )
);

test('takeWhile', () =>
    [[], [1], [1, 2], [1, 2, 2], [1, 2, 2, 3]].forEach(input =>
        forInput(
            input,
            s => s.takeWhile((num, ix) => num !== ix),
            (s, inputHint) => twice(runHint =>
                expect(s.toArray()).toEqualWithHint(input.slice(0, 2), inputHint, runHint)
            ),
        )
    )
);

test('takeRandom', () => {
    const input = ['a', 'b', 'c', 'd', 'e'];
    const iterPerVariation = 200;
    [-1, 0, 1, 2, 5, 6].forEach(k =>
        forInput(
            input,
            s => s.takeRandom(k),
            (s, inputHint) => {
                const allVariations = variations(input, k);
                const collector = new Map<string, number>();
                for (let i = 0; i < Math.max(1, iterPerVariation * allVariations.length); i++) {
                    const variation = s.join('');
                    if (variation) {
                        collector.set(variation, (collector.get(variation) || 0) + 1);
                    }
                }

                expect(collector.size).toBeWithHint(allVariations.length, inputHint, `k=${k}`);
                allVariations.forEach(a => expect(collector.get(a)).toBeGreaterThanWithHint(iterPerVariation * .6, inputHint, a))
            },
            false,
        )
    );
});
test('toArray', () => [[], ['a'], ['a', 'b', 'c']].forEach(input => forInput(
    input,
    s => s,
    (s, inputHint) => twice(runHint =>
        expect(s.toArray()).toEqualWithHint(input, inputHint, runHint)
    ),
)));

test('toObject', () => {
    const sym: unique symbol = Symbol('test');
    forInput(
        [['a', 1], ['b', 2], [sym, 3], ['b', 4], [99, 5]] as ['a' | 'b' | typeof sym | 99, number][],
        s => s,
        (s, inputHint) => twice(runHint =>
            expect(s.toObject()).toEqualWithHint({'a': 1, 'b': 4, [sym]: 3, 99: 5}, inputHint, runHint)
        ),
    );
});

test('toObject not key', () =>
    forInput(
        [[{}]],
        s => s,
        s => twice(() => expect(() => s.toObject()).toThrow()),
    )
);

test('toObject not pair', () =>
    forInput(
        [['a', 1, 2]],
        s => s,
        s => twice(() => expect(() => s.toObject()).toThrow()),
    )
);

test('toObject bad key', () =>
    forInput(
        [[{}, 1]],
        s => s,
        s => twice(() => expect(() => s.toObject()).toThrow()),
    )
);

test('transform gen', () => forInput(
    ['a', 'b', 'c'],
    s => s.transform(function* (input) {
        for (const i of input) {
            if (i !== 'b') yield i + 'x';
        }
    }),
    (s, inputHint) => twice(runHint =>
        expect(s.toArray()).toEqualWithHint(['ax', 'cx'], inputHint, runHint)
    ),
));

test('transform itr', () => forInput(
    ['a', 'b', 'c'],
    s => s.transform(input => {
        const itr = input[Symbol.iterator]();
        return {
            next() {
                for ( ; ; ) {
                    const n = itr.next();
                    if (n.done) return n;
                    if (n.value !== 'b') {
                        return {done: false, value: n.value + 'x'}
                    }
                }
            }
        }
    }),
    (s, inputHint) => twice(runHint =>
        expect(s.toArray()).toEqualWithHint(['ax', 'cx'], inputHint, runHint)
    ),
));

test('transformToOptional', () => forInput(
    ['a', 'b', 'c'],
    s => s.transformToOptional(function* (input) {
        for (const i of input) {
            if (i !== 'a') yield i + 'x';
        }
    }),
    (o, inputHint) => twice(runHint =>
        expect(o.resolve()).toEqualWithHint({has: true, val: 'bx'}, inputHint, runHint)
    ),
));

test('transformToOptional empty', () => forInput(
    ['a', 'b', 'c'],
    s => s.transformToOptional(function* () {}),
    (o, inputHint) => twice(runHint => expect(o.resolve()).toEqualWithHint({has: false}, inputHint, runHint)),
));

test('with', () => forInput(
    ['a', 'b', 'c', 'd', 'e'],
    s => s
        .with(0, 'x')
        .with(2, 'y')
        .with(4, 'z')
        .with(5, 'zz')
        .with(-1, 'zzz'),
    (s, inputHint) => twice(runHint =>
        expect(s.toArray()).toEqualWithHint(['x', 'b', 'y', 'd', 'z'],
            inputHint,
            runHint,
        )
    ),
))

test('zip', () => [[], ['i'], ['i', 'j'], ['i', 'j', 'k']].forEach(input => forInput(
    ['a', 'b'],
    s => s.zip(input),
    (s, inputHint) => twice(runHint => expect(s.toArray()).toEqualWithHint(
        input.length === 0 ? []
            : input.length === 1 ? [['a', 'i']]
            : [['a', 'i'], ['b', 'j']],
        inputHint,
        runHint
    )),
)));

test('zip first endless', () => forInput(
    ['a', 'b', 'c'],
    s => same('x').zip(s),
    (s, inputHint) =>
        twice(runHint =>
            expect(s.toArray()).toEqualWithHint(
                [['x', 'a'], ['x', 'b'], ['x', 'c']],
                inputHint,
                runHint)
        )
))

test('zip second endless', () => forInput(
    ['a', 'b', 'c'],
    s => s.zip(same('x')),
    (s, inputHint) =>
        twice(runHint =>
            expect(s.toArray()).toEqualWithHint(
                [['a', 'x'], ['b', 'x'], ['c', 'x']],
                inputHint,
                runHint)
        )
))

test('zipStrict', () =>
    forInput(
        ['a', 'b', 'c'],
        s => s.zipStrict(['i', 'j', 'k']),
        (s, inputHint) => twice(runHint =>
            expect(s.toArray()).toEqualWithHint([['a', 'i'], ['b', 'j'], ['c', 'k']], inputHint, runHint)
        ),
    )
);

test('zipStrict throws', () => [['i', 'j'], ['i', 'j', 'k', 'l']].forEach(input => forInput(
    ['a', 'b', 'c'],
    s => s.zipStrict(input),
    s => twice(() => expect(() => s.toArray()).toThrow()),
    false,
)));

test('zipWithIndex', () =>
    forInput(
        ['a', 'b', 'c'],
        s => s.zipWithIndex(),
        (s, inputHint) => twice(runHint => expect(s.toArray()).toEqualWithHint([['a', 0], ['b', 1], ['c', 2]], inputHint, runHint))
    )
);

test('zipWithIndexAndLen', () =>
    forInput(
        ['a', 'b', 'c'],
        s => s.zipWithIndexAndLen(),
        (s, inputHint) => twice(runHint => expect(s.toArray()).toEqualWithHint(
            [['a', 0, 3], ['b', 1, 3], ['c', 2, 3]], inputHint, runHint
        ))
    )
);

test('long chain', () => forInput(
    ['a', 'b'],
    s => s
        .concat('c')
        .map(c => c.toUpperCase())
        .filter(c => c !== 'B'),
    (s, inputHint) => twice(runHint => expect(s.toArray()).toEqualWithHint(['A', 'C'], inputHint, runHint)),
));
