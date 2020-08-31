import { Stream } from '../../../stream';
import { Optional } from '../../../optional';

export function testIterator<T, Out extends Stream<T> | Optional<T>>(
    out: Out,
    inputHint: () => string,
) {
    const a = out.toArray();
    const itr = out[Symbol.iterator]();
    const b: T[] = [];
    for ( ; ; ) {
        const n = itr.next();
        if (n.done) {
            expect(n.value).toBeUndefined();
            for (let i = 0; i < 5; i++) {
                expect(itr.next()).toEqualWithHint({done: true, value: undefined}, inputHint, `i=${i}`);
            }
            expect(a).toEqualWithHint(b, inputHint, '');
            break;
        }
        b.push(n.value);
    }
}
