import './testUtil/extendExpect';
import { forStreamInput as forInput } from './testUtil/forInput';
import { twice } from './testUtil/twice';
import { continually, range, type Stream } from '.';

test('slice', () => [[], ['a'], ['a', 'b'], ['a', 'b', 'c']].forEach(input => range(0, 50).forEach(() => {
    const indexOpt =
        (range(-4,  5) as Stream<number | undefined>)
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
