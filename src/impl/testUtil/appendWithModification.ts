import { matchGenerator, StreamOperator } from '../../streamGenerator';

export const appendWithModification: (appendant: string) => StreamOperator<string, string> = appendant => function* (gen) {
    const {head, tail} = matchGenerator(gen);
    yield* head;
    if (tail().canModify) {
        tail().array.push(appendant);
        yield* tail().array;
    } else {
        yield* [...tail().array, appendant];
    }
};