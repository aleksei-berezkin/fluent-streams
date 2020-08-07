import { twice } from './testUtil/twice';
import { BaseImpl } from './base';
import { appendReturned, matchGenerator } from '../streamGenerator';
import './testUtil/extendExpect';

function of<T>(head: T[], tail?: T[]) {
    return new BaseImpl(undefined, function* () {
        yield* head;
        if (tail) {
            return {
                array: tail,
                canModify: false,
            }
        }
    });
}

function forInput<T>(input: T[], run: (base: BaseImpl<unknown, T>, msg: string) => void) {
    for (let headSize = 0; headSize <= input.length; headSize++) {
        const head = input.slice(0, headSize);
        const tail = input.slice(headSize);
        run(of(head, tail), `head: ${head}, tail: ${tail}`);
    }
    run(of(input), `head: ${input}`);
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
        (b, msg1) => {
            const bb = new BaseImpl(b, function* (gen) {
                const {head, tail} = matchGenerator(gen);
                yield* head;
                return {
                    array: [...tail().array, 'd'],
                    canModify: true,
                }
            });
            twice(msg2 => expect([...bb]).toEqualWithMsg(['a', 'b', 'c', 'd'], `${msg2} ${msg1}`));
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
