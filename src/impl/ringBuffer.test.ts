import { RingBuffer } from './ringBuffer';

test('Bad capacity', () => {
    expect(() => new RingBuffer(0)).toThrow();
});

test('Empty', () => {
    expect([...new RingBuffer(1)]).toEqual([]);
});

test('One item', () => {
    const r = new RingBuffer<string>(2);
    r.add('a');
    expect([...r]).toEqual(['a']);
});

test('Full', () => {
    const r = new RingBuffer<string>(2);
    ['a', 'b'].forEach(i => r.add(i));
    expect([...r]).toEqual(['a', 'b']);
});

test('Partial overlap', () => {
    const r = new RingBuffer<string>(3);
    ['a', 'b', 'c', 'd'].forEach(i => r.add(i));
    expect([...r]).toEqual(['b', 'c', 'd']);
});

test('Full overlap', () => {
    const r = new RingBuffer<string>(3);
    ['a', 'b', 'c', 'd', 'e', 'f'].forEach(i => r.add(i));
    expect([...r]).toEqual(['d', 'e', 'f']);
});

test('Repeated iteration', () => {
    const r = new RingBuffer<string>(3);
    ['a', 'b'].forEach(i => r.add(i));
    expect([[...r], [...r]]).toEqual([['a', 'b'], ['a', 'b']]);
});

test('Add after iteration', () => {
    const r = new RingBuffer<string>(3);
    r.add('a');
    expect([...r]).toEqual(['a']);
    r.add('b');
    expect([...r]).toEqual(['a', 'b']);
});
