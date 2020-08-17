import { StreamGeneratorResult } from '../../streamGenerator';
import { range } from '../../factories';

export type CombinationsMode = 'all' | 'some';

export function forInputCombinations<T, Out>(
    input: T[],
    create: (head: T[], tail?: StreamGeneratorResult<T>) => Out,
    run: (base: Out, inputHint: () => string) => void,
    mode: CombinationsMode = 'all',
) {
    type Combination = {
        tailLen: number,
        canModify: boolean,
    } | {
        tailLen: undefined,
    }

    const combinations: Combination[] = mode === 'all'
        ? range(0, input.length + 1)
            .flatMap(tailLen => [true, false].map(canModify =>
                ({tailLen, canModify} as Combination))
            )
            .append({tailLen: undefined})
            .toArray()
        : [
            {tailLen: input.length, canModify: false},
            {tailLen: Math.ceil(input.length / 2), canModify: true},
            {tailLen: undefined},
        ];

    combinations.forEach((c: Combination) => {
        if (c.tailLen != null) {
            const head = input.slice(0, input.length - c.tailLen);
            const tail = {
                array: input.slice(head.length),
                canModify: c.canModify,
            };
            run(create(head, tail), inputHint(head, tail));
        } else {
            run(create(input), inputHint(input));
        }
    });
}

function inputHint<T>(head: T[], tail?: StreamGeneratorResult<T>): () => string {
    if (tail) {
        return () => `head: ${JSON.stringify(head)}, tail: ${JSON.stringify(tail)}`;
    }
    return () => `head: ${head}`;
}
