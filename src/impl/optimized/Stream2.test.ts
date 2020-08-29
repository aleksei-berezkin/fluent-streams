import '../testUtil/extendExpect';
import { forInput } from './testUtil/forInput';
import { twice } from '../testUtil/twice';

test('map', () => forInput(
    ['a', 'b', 'c'],
    s => s.map(c => c.toUpperCase()),
    (s, inputHint) => twice(runHint =>
        expect(s.toArray()).toEqualWithHint(['A', 'B', 'C'], inputHint, runHint)
    ),
));
