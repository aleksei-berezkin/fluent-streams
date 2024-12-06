import { factorial } from './factorial';

const f = {
    '-5': 1,
    '-1': 1,
    '0': 1,
    '1': 1,
    '2': 2,
    '3': 6,
    '4': 24,
    '5': 120,
    '10': 3628800,
    
}
test('factorial', () => {
    for (const k in f) {
        if (f.hasOwnProperty(k)) {
            expect(factorial(Number.parseInt(k))).toEqual(f[k as keyof typeof f])
        }
    }
});
