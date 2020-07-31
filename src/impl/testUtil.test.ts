import { twice } from './testUtil';

test('twice', () => {
    let i = 0;
    twice(() => i++);
    expect(i).toEqual(2);
});

test('twice with done', () => {
    const trace: number[] = [];
    const mockDone = () => trace.push(99);
    let count = 0;
    twice(mockDone, _done => {
        trace.push(count++); 
        _done();
    });
    expect(trace).toEqual([0, 1, 99]);
});

test('twice async', done => {
    const trace: number[] = [];
    const mockDone = () => trace.push(99);
    let count = 0;
    twice(mockDone, _done => {
        const i = count++;
        setTimeout(() => {
            trace.push(i);
            setTimeout(_done, 50);
        }, i * 10);
    });
    setTimeout(() => {
        expect(trace).toEqual([0, 1, 99]);
        done();
    }, 100)
});

test('twice no repeated done', () => {
    expect(
        () => twice(() => {}, _done => {
            _done();
            _done();
        })
    ).toThrow();
});
