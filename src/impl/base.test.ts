import { twice } from './testUtil/twice';
import { BaseImpl } from './base';
import { appendReturned, matchGenerator } from '../streamGenerator';
import './testUtil/extendExpect';
import { forInputCombinations } from './testUtil/forInputCombinations';

function forInput<T>(input: T[], run: (base: BaseImpl<unknown, T>, inputHint: () => string) => void) {
    return forInputCombinations(
        input,
        (head, tail) => new BaseImpl(undefined, function* () {
            yield* head;
            if (tail) {
                return tail;
            }
        }),
        run,
    )
}

test('BaseImpl size', () => {
     forInput(
         ['a', 'a', 'a'],
         (b, inputHint) => twice(runHint => expect(b.size()).toEqualWithHint(3, inputHint, runHint))
     );
});

test('BaseImpl composition', () => {
    forInput(
        ['a', 'b', 'c'],
        (b, inputHint) => {
            const bb = new BaseImpl(b, function* (gen) {
                yield* appendReturned(gen);
                yield 'd';
            });
            twice(runHint => expect([...bb]).toEqualWithHint(['a', 'b', 'c', 'd'], inputHint, runHint));
        }
    );
});

test('BaseImpl composition match', () => {
    forInput(
        ['a', 'b', 'c'],
        (b, inputHint) => {
            const bb = new BaseImpl(b, function* (gen) {
                const {head, tail} = matchGenerator(gen);
                yield* head;
                return {
                    array: [...tail().array, 'd'],
                    canModify: true,
                }
            });
            twice(runHint => expect([...bb]).toEqualWithHint(['a', 'b', 'c', 'd'], inputHint, runHint));
        }
    )
});

test('BaseImpl composition to other', () => {
    forInput(
        ['a', 'b', 'c'],
        (b, inputHint) => {
            const bb1 = new BaseImpl(b, function* (gen) {
                yield* appendReturned(gen);
                yield 'd';
            });
            const bb2 = new BaseImpl(b, function* (gen) {
                for (const i of appendReturned(gen)) {
                    yield i.toUpperCase();
                }
            });
            
            twice(runHint => {
                expect([...bb1]).toEqualWithHint(['a', 'b', 'c', 'd'], inputHint, runHint);
                expect([...bb2]).toEqualWithHint(['A', 'B', 'C'], inputHint, runHint);
            });
        }
    );
});
