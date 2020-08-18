import { appendWithModification } from './appendWithModification';
import { StreamGeneratorResult } from '../../streamGenerator';
import { forInputCombinations } from './forInputCombinations';

test('appendWithModification', () => {
    function* input(head: string[], tail?: StreamGeneratorResult<string>) {
        yield* head;
        if (tail) {
            return tail;
        }
    }

    forInputCombinations(
        ['a', 'b', 'c'],
        (head, tail) => {
            const result = [...appendWithModification('x')(input(head, tail))];
            expect(result).toEqual(['a', 'b', 'c', 'x']);
            if (tail) {
                if (tail.canModify) {
                    expect(tail.array).toContain('x');
                } else {
                    expect(tail.array).not.toContain('x');
                }
            }
        },
        () => {},
    )
});
