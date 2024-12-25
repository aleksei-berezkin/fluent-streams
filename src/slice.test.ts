import './testUtil/extendExpect';
import { forStreamInput as forInput } from './testUtil/forInput';
import { twice } from './testUtil/twice';
import { continually, range, streamOf } from '.';

test('slice', () => [[], ['a'], ['a', 'b'], ['a', 'b', 'c'], ['a', 'b', 'c', 'd', 'e']].forEach(input => range(0, 50).forEach(() => {
    const indexOpt =
        range(-6,  7)
            .concat(undefined)
            .randomItem()
    const start = indexOpt.get()
    const end = indexOpt.get()
    forInput(
        input,
        s => s.slice(start, end),
        (s, inputHint) => twice(runHint => expect(s.toArray()).toEqualWithHint(
            input.slice(start, end),
            () => `${inputHint()} -- ${input} -- ${start}..${end}`,
            runHint,
        ))
    )
})))

test('slice exact items undefined start', () => {
    let i = 0
    continually(() => {
        i++
        return 'a'
    })
        .slice(undefined, 3)
        .forEach(() => {})
    expect(i).toBe(3)
})

test('slice exact items 0 start', () => {
    let i = 0
    continually(() => {
        i++
        return 'a'
    })
        .slice(0, 3)
        .forEach(() => {})
    expect(i).toBe(3)
})

test('slice exact items 1 start', () => {
    let i = 0
    continually(() => {
        i++
        return 'a'
    })
        .slice(1, 3)
        .forEach(() => {})
    expect(i).toBe(3)
})

test('splice', () => [[], ['a'], ['a', 'b'], ['a', 'b', 'c'], ['a', 'b', 'c', 'd', 'e']].forEach(input => range(0, 50).forEach(() => {
    const start = range(-7,  7).randomItem().get()
    const deleteCount = range(-1,  6).concat(undefined, Infinity).randomItem().get()
    const insertedItems = streamOf('x', 'y', 'z', 'xx', 'yy', 'zz')
        .take(range(0, 7).randomItem().get())
        .toArray()
    const expected = [...input]
    expected.splice(start, deleteCount as any, ...insertedItems)
    forInput(
        input,
        s => s.splice(start, deleteCount, ...insertedItems),
        (s, inputHint) => twice(runHint => expect(s.toArray()).toEqualWithHint(
            expected,
            () => `${inputHint()} -- ${input} -- ${start},${deleteCount} ++ ${insertedItems}`,
            runHint,
        ))
    )
})))

test('splice no delete items', () => [[], ['a'], ['a', 'b'], ['a', 'b', 'c'], ['a', 'b', 'c', 'd', 'e']].forEach(input => range(0, 20).forEach(() => {
    const start = range(-7,  7).randomItem().get()
    const expected = [...input]
    expected.splice(start)
    forInput(
        input,
        s => s.splice(start),
        (s, inputHint) => twice(runHint => expect(s.toArray()).toEqualWithHint(
            expected,
            () => `${inputHint()} -- ${input} -- ${start}`,
            runHint,
        ))
    )
})))

test('with', () => forInput(
    ['a', 'b', 'c', 'd', 'e'],
    s => s
        .with(0, 'x')
        .with(2, 'y')
        .with(4, 'z'),
    (s, inputHint) => twice(runHint =>
        expect(s.toArray()).toEqualWithHint(['x', 'b', 'y', 'd', 'z'],
            inputHint,
            runHint,
        )
    ),
))

test('with randomized', () => [[], ['a'], ['a', 'b'], ['a', 'b', 'c'], ['a', 'b', 'c', 'd', 'e']].forEach(input => range(0, 50).forEach(() => {
    const index = range(-input.length - 2,  input.length + 2).randomItem().get()
    const expected = (() => {
        try {
            return input.with(index, 'x')
        } catch (e) {
            return ['xxx']
        }
    })()
    forInput(
        input,
        s => s.with(index, 'x'),
        (s, inputHint) => twice(runHint =>
            expect(
                (() => {
                    try {
                        return s.toArray()
                    } catch (e) {
                        return ['xxx']
                    }
                })()
            ).toEqualWithHint(
                expected,
                () => `${inputHint()} -- ${input} -- ${index}`,
                runHint,
            )),
        false,
    )
})))
