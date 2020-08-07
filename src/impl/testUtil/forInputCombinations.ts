import { StreamGeneratorResult } from '../../streamGenerator';

export function forInputCombinations<T, Out>(
    input: T[],
    create: (head: T[], tail?: StreamGeneratorResult<T>) => Out,
    run: (base: Out, getMessage: () => string) => void
) {
    for (let headSize = 0; headSize <= input.length; headSize++) {
        const head = input.slice(0, headSize);
        const tailArr = input.slice(headSize);
        for (const canModify of [false, true]) {
            const tail = {
                array: canModify ? [...tailArr] : tailArr,
                canModify,
            }
            run(create(head, tail), () => `head: ${JSON.stringify(head)}, tail: ${JSON.stringify(tail)}`);
        }
    }
    run(create(input), () => `head: ${input}`);
}
