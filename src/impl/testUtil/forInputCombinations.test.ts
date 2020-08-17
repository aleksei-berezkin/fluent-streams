import { forInputCombinations } from './forInputCombinations';
import { StreamGeneratorResult } from '../../streamGenerator';

type InputCombination = {
    head: readonly string[],
    tail?: StreamGeneratorResult<string>,
};

test('forInputCombinations all', () => {
    const trace: InputCombination[] = [];
    forInputCombinations(
        ['a', 'b'],
        (head, tail) => ({head, tail}),
        ({head, tail}) => trace.push({head, tail}),
    );

    expect(trace.length).toBe(7);

    [false, true].forEach(canModify => {
        expect(trace).toContainEqual({head: [], tail: {array: ['a', 'b'], canModify}});
        expect(trace).toContainEqual({head: ['a'], tail: {array: ['b'], canModify}});
        expect(trace).toContainEqual({head: ['a', 'b'], tail: {array: [], canModify}});
    })

    expect(trace).toContainEqual({head: ['a', 'b'], tail: undefined});
});

test('forInputCombinations some', () => {
    const input = ['a', 'b', 'c'];
    const trace: InputCombination[] = [];
    forInputCombinations(
        ['a', 'b', 'c'],
        (head, tail) => ({head, tail}),
        ({head, tail}) => trace.push({head, tail}),
        'some',
    );
    
    expect(trace.length).toBe(3);
    expect(trace).toContainEqual({head: [], tail: {array: input, canModify: false}});
    expect(trace).toContainEqual({head: ['a'], tail: {array: ['b', 'c'], canModify: true}});
    expect(trace).toContainEqual({head: input, tail: undefined});
});
