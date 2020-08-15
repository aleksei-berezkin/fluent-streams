import { forInputCombinations } from './forInputCombinations';
import { StreamGeneratorResult } from '../../streamGenerator';

test('forInputCombinations', () => {
    const trace: {
        head: readonly string[],
        tail?: StreamGeneratorResult<string>,
    }[] = [];
    forInputCombinations(
        ['a', 'b'],
        (head, tail) => ({head, tail}),
        ({head, tail}) => trace.push({head, tail}),
    );

    expect(trace.length).toBe(7);

    for (const canModify of [false, true]) {
        expect(trace).toContainEqual({head: [], tail: {array: ['a', 'b'], canModify}});
        expect(trace).toContainEqual({head: ['a'], tail: {array: ['b'], canModify}});
        expect(trace).toContainEqual({head: ['a', 'b'], tail: {array: [], canModify}});
    }
    expect(trace).toContainEqual({head: ['a', 'b'], tail: undefined});
});
