import './testUtil/extendExpect';
import { forStreamInput as forInput } from './testUtil/forInput';
import { twice } from './testUtil/twice';
import { continually, range, streamOf, type Stream } from '.';

test('slice', () => [[], ['a'], ['a', 'b'], ['a', 'b', 'c'], ['a', 'b', 'c', 'd', 'e']].forEach(input => range(0, 50).forEach(() => {
    const indexOpt =
        (range(-6,  7) as Stream<number | undefined>)
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
    const deleteCount = (range(-1,  6) as Stream<number | undefined>).concat(undefined).randomItem().get()
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
