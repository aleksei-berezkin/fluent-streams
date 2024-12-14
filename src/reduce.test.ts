import { streamOf } from '.';
import './testUtil/extendExpect';
import { forStreamInput as forInput } from './testUtil/forInput';
import { twice } from './testUtil/twice';

test('reduce trace', () => {
    const trace: unknown[] = []
    const res = streamOf('a', 'b', 'c')
        .reduce((prev, curr, index) => {
            trace.push([prev, curr, index])
            return prev + curr + String(index)
        })

        .get()
    expect(trace).toEqual([['a', 'b', 1], ['ab1', 'c', 2]])
    expect(res).toBe('ab1c2')
})

test('reduce with initial trace', () => {
    const trace: unknown[] = []
    const res = streamOf('a', 'b', 'c')
        .reduce((prev, curr, index) => {
            trace.push([prev, curr, index])
            return prev + curr + String(index)
        }, 'x')
    expect(trace).toEqual([['x', 'a', 0], ['xa0', 'b', 1], ['xa0b1', 'c', 2]])
    expect(res).toBe('xa0b1c2')
})

test('reduceRight trace', () => {
    const trace: unknown[] = []
    const res = streamOf('a', 'b', 'c')
        .reduceRight((prev, curr, index) => {
            trace.push([prev, curr, index])
            return prev + curr + String(index)
        })
        .get()
    expect(trace).toEqual([['c', 'b', 1], ['cb1', 'a', 0]])
    expect(res).toBe('cb1a0')
})

test('reduceRight with initial trace', () => {
    const trace: unknown[] = []
    const res = streamOf('a', 'b', 'c')
        .reduceRight((prev, curr, index) => {
            trace.push([prev, curr, index])
            return prev + curr + String(index)
        }, 'x')
    expect(trace).toEqual([['x', 'c', 2], ['xc2', 'b', 1], ['xc2b1', 'a', 0]])
    expect(res).toBe('xc2b1a0')
})

test('reduce', () => [[] as string[], ['a'], ['a', 'b'], ['a', 'b', 'c', 'd', 'e']].forEach(input => forInput(
    input,
    s => s.reduce((prev, curr, index) => prev + curr + String(index)),
    (s, inputHint) => twice(runHint => expect(s.resolve()).toEqualWithHint(
        input.length
            ? {has: true, val: input.reduce((prev, curr, index) => prev + curr + String(index))}
            : {has: false},
        inputHint,
        runHint,
    )),
)));

test('reduce with initial', () => [[] as string[], ['a'], ['a', 'b'], ['a', 'b', 'c', 'd', 'e']].forEach(input => forInput(
    input,
    s => s,
    (s, inputHint) => twice(runHint => expect(s.reduce((prev, curr, index) => prev + curr + String(index), 'x')).toEqualWithHint(
        input.reduce((prev, curr, index) => prev + curr + String(index), 'x'),
        inputHint,
        runHint,
    )),
)));

test('reduceRight', () => [[] as string[], ['a'], ['a', 'b'], ['a', 'b', 'c', 'd', 'e']].forEach(input => forInput(
    input,
    s => s,
    (s, inputHint) => twice(runHint => expect(s.reduceRight((l, r, index) => l + r + String(index)).resolve()).toEqualWithHint(
        input.length
            ? {has: true, val: input.reduceRight((prev, curr, index) => prev + curr + String(index))}
            : {has: false},
        inputHint,
        runHint,
    )),
)));

test('reduceRight with initial', () => [[] as string[], ['a'], ['a', 'b'], ['a', 'b', 'c', 'd', 'e']].forEach(input => forInput(
    input,
    s => s,
    (s, inputHint) => twice(runHint => expect(s.reduceRight((prev, curr, index) => prev + curr + String(index), 'x')).toEqualWithHint(
        input.reduceRight((prev, curr, index) => prev + curr + String(index), 'x'),
        inputHint,
        runHint,
    )),
)));
