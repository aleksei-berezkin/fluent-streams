import { twice } from './testUtil/twice';
import { BaseImpl } from './base';
import { appendReturned, matchGenerator } from '../streamGenerator';
import './testUtil/extendExpect';
import { forInputCombinations } from './testUtil/forInputCombinations';

function forInput<T>(input: T[], run: (base: BaseImpl<unknown, T>, getMessage: () => string) => void) {
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
         b => twice(() => expect(b.size()).toEqual(3))
     );
});

test('BaseImpl composition', () => {
    forInput(
        ['a', 'b', 'c'],
        b => {
            const bb = new BaseImpl(b, function* (gen) {
                yield* appendReturned(gen);
                yield 'd';
            });
            twice(() => expect([...bb]).toEqual(['a', 'b', 'c', 'd']));
        }
    );
});

test('BaseImpl composition match', () => {
    forInput(
        ['a', 'b', 'c'],
        (b, getMessage) => {
            const bb = new BaseImpl(b, function* (gen) {
                const {head, tail} = matchGenerator(gen);
                yield* head;
                return {
                    array: [...tail().array, 'd'],
                    canModify: true,
                }
            });
            twice(msg => expect([...bb]).toEqualWithMsg(['a', 'b', 'c', 'd'], `${msg} ${getMessage()}`));
        }
    )
});

test('BaseImpl composition to other', () => {
    forInput(
        ['a', 'b', 'c'],
        b => {
            const bb1 = new BaseImpl(b, function* (gen) {
                yield* appendReturned(gen);
                yield 'd';
            });
            const bb2 = new BaseImpl(b, function* (gen) {
                for (const i of appendReturned(gen)) {
                    yield i.toUpperCase();
                }
            });
            
            twice(() => {
                expect([...bb1]).toEqual(['a', 'b', 'c', 'd']);
                expect([...bb2]).toEqual(['A', 'B', 'C']);
            });
        }
    );
});
