import '../testUtil/extendExpect';
import { forInput } from './testUtil/forInput';
import { twice, twiceAsync } from '../testUtil/twice';


test('all', () =>  forInput(
    ['ax', 'bx', 'cx'],
    s => s,
    (s, inputHint) => twice(runHint => expect(s.all(i => i.endsWith('x'))).toBeWithHint(true, inputHint, runHint)),
));

test('all neg', () => forInput(
    ['ax', 'bx', 'c'],
    s => s,
    (s, inputHint) => twice(runHint => expect(s.all(i => i.endsWith('x'))).toBeWithHint(false, inputHint, runHint)),
));

test('any', () => forInput(
    ['a', 'b'],
    s => s,
    (s, inputHint) => twice(runHint => expect(s.any(i => i === 'a')).toBeWithHint(true, inputHint, runHint)),
));

test('any neg', () => forInput(
    ['a', 'b'],
    s => s,
    (s, inputHint) => twice(runHint => expect(s.any(i => i === 'c')).toBeWithHint(false, inputHint, runHint)),
));

test('append', () => [[], ['a'], ['a', 'b']].forEach(input => forInput(
    input,
    s => s.append('c'),
    (s, inputHint) => twice(runHint => expect(s.toArray()).toEqualWithHint(input.concat('c'), inputHint, runHint)),
)));

test('appendIf', () => forInput(
    ['a', 'b'],
    s => s.appendIf(true, 'c'),
    (s, inputHint) => twice(runHint => expect(s.toArray()).toEqualWithHint(['a', 'b', 'c'], inputHint, runHint)),
));

test('appendIf neg', () => forInput(
    ['a', 'b'],
    s => s.appendIf(false, 'c'),
    (s, inputHint) => twice(runHint => expect(s.toArray()).toEqualWithHint(['a', 'b'], inputHint, runHint)),
));

test('appendAll', () =>  forInput(
    ['a', 'b'],
    s => s.appendAll(['c', 'd']),
    (s, inputHint) => twice(runHint =>
        expect(s.toArray()).toEqualWithHint(['a', 'b', 'c', 'd'], inputHint, runHint),
    ),
));

test('appendAll suspended', () => {
    const appended: string[] = [];
    forInput(
        ['a', 'b'],
        s => s.appendAll(appended),
        (s, inputHint) => twice(runHint => {
            appended.push('c', 'd');
            expect(s.toArray()).toEqualWithHint(['a', 'b', 'c', 'd'], inputHint, runHint);
            appended.length = 0;
        }),
    );
});

test('appendAllIf', () => forInput(
    ['a', 'b'],
    s => s.appendAllIf(true, ['c', 'd']),
    (s, inputHint) => twice(runHint =>
        expect(s.toArray()).toEqualWithHint(['a', 'b', 'c', 'd'], inputHint, runHint)
    ),
));

test('appendAllIf set', () => forInput(
    ['a', 'b'],
    s => s.appendAllIf(true, new Set(['c', 'd', 'e'])),
    (s, inputHint) => twice(runHint =>
        expect(s.toArray()).toEqualWithHint(['a', 'b', 'c', 'd', 'e'], inputHint, runHint)
    ),
));

test('appendAllIf neg', () => forInput(
    ['a', 'b'],
    s => s.appendAllIf(false, ['c', 'd']),
    (s, inputHint) => twice(runHint =>
        expect(s.toArray()).toEqualWithHint(['a', 'b'], inputHint, runHint)
    ),
));

test('at neg', () => forInput(
    ['a', 'b'],
    s => s.at(-1),
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

test('awaitAll const', doneTest => {
    forInput(
        ['a', 'b'],
        s => s,
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
        s => s,
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
        s => s,
        (s, inputHint) => twiceAsync(doneTest, (doneRun, runHint) =>
            s.awaitAll().then(items => {
                expect(items).toEqualWithHint(['a', 'b'], inputHint, runHint);
                doneRun();
            })
        ),
    );
});

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

test('distinctBy empty', () => forInput(
    [],
    s => s.distinctBy(() => {throw new Error()}),
    (s, inputHint) => twice(runHint => expect(s.toArray()).toEqualWithHint([], inputHint, runHint)),
));

test('equals', () =>
    forInput(
        ['a', 'b', 'c'],
        s => s,
        (s, inputHint1) => twice(runHint1 =>
            forInput(
                ['a', 'b', 'c'],
                t => t,
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
        s => s,
        (s, inputHint1) => twice(runHint1 =>
            forInput(
                ['a', 'b', 'c', 'd'],
                t => t,
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
        s => s.filter(s => s !== 'b'),
        (s, inputHint) => twice(runHint =>
            expect(s.toArray()).toEqualWithHint(['a', 'c'], inputHint, runHint),
        ),
    )
);

test('filterWithAssertion', () => {
    function isString(s: string | number): s is string {
        return typeof s === 'string';
    }
    forInput(
        ['a', 1, 'c'],
        s => s.filterWithAssertion(isString),
        (s, inputHint) => twice(runHint => {
            const r: string[] = s.filterWithAssertion(isString).toArray();
            expect(r).toEqualWithHint(['a', 'c'], inputHint, runHint);
        }),
    );
});

test('find', () => [[], ['a'], ['a', 'b'], ['b', 'a']].forEach(input => forInput(
    input,
    s => s.find(i => i === 'b'),
    (o, inputHint) => twice(runHint =>
        expect(o.resolve()).toEqualWithHint(
            input.includes('b')
                ? {has: true, val: 'b'}
                : {has: false},
            inputHint,
            runHint,
        )
    ),
)));

test('flatMap', () =>
    [
        [[]],
        [['a']],
        [[], [], ['a']],
        [['a'], [], []],
        [['a'], [], ['b', 'c', 'd'], [], [], ['e', 'f'], ['g']]
    ].forEach(input => forInput(
        input,
        s => s.flatMap(i => i),
        (s, inputHint) => twice(runHint =>
            expect(s.toArray()).toEqualWithHint(input.flatMap(i => i), inputHint, runHint)
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

test('head', () => [[], ['a'], ['a', 'b']].forEach(input => forInput(
    input,
    s => s.head(),
    (s, inputHint) => twice(runHint =>
        expect(s.toArray()).toEqualWithHint(input.slice(0, 1), inputHint, runHint)
    ),
)));


test('map', () => [[], ['a'], ['a', 'b', 'c']].forEach(input => forInput(
    input,
    s => s.map(c => c.toUpperCase()),
    (s, inputHint) => twice(runHint =>
        expect(s.toArray()).toEqualWithHint(input.map(c => c.toUpperCase()), inputHint, runHint)
    ),
)));

test('toArray', () => [[], ['a'], ['a', 'b', 'c']].forEach(input => forInput(
    input,
    s => s,
    (s, inputHint) => twice(runHint =>
        expect(s.toArray()).toEqualWithHint(input, inputHint, runHint)
    ),
)));
