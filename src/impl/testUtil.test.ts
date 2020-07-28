import { twice } from './testUtil';

test('twice', () => {
    let i = 0;
    twice(() => i++);
    expect(i).toEqual(2);
});
