import { prettyPrint } from './prettyPrint';

test('10G', () => expect(prettyPrint(10_000_000_000)).toBe('10.0G'));

test('1.00G', () => expect(prettyPrint(999_500_000)).toBe('1.00G'));

test('999M', () => expect(prettyPrint(999_499_999)).toBe('999M'));

test('55.5M', () => expect(prettyPrint(55_511_111)).toBe('55.5M'));

test('11.0M', () => expect(prettyPrint(11_011_111)).toBe('11.0M'));

test('1.20M', () => expect(prettyPrint(1_199_000)).toBe('1.20M'));

test('1.00M', () => expect(prettyPrint(999_500)).toBe('1.00M'));

test('999k', () => expect(prettyPrint(999_499)).toBe('999k'));

test('81.0k', () => expect(prettyPrint(81_040)).toBe('81.0k'));

test('3.12k', () => expect(prettyPrint(3_123)).toBe('3.12k'));

test('1.00k', () => expect(prettyPrint(999.5)).toBe('1.00k'));

test('999', () => expect(prettyPrint(999.4999)).toBe('999'));

test('94.1', () => expect(prettyPrint(94.0777)).toBe('94.1'));

test('3.15', () => expect(prettyPrint(3.1455)).toBe('3.15'));

test('1.00', () => expect(prettyPrint(.9995)).toBe('1.00'));

test('0.999', () => expect(prettyPrint(.9994)).toBe('0.999'));

test('0.100', () => expect(prettyPrint(.09995)).toBe('0.100'));

test('0.0995', () => expect(prettyPrint(.099949)).toBe('0.0999'));

test('0.00999', () => expect(prettyPrint(.00999888)).toBe('0.00999888'));
