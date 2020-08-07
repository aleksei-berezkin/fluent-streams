import { twice, twiceAsync } from './twice';

test('twice', () => {
    let i = 0;
    twice(() => i++);
    expect(i).toEqual(2);
});

test('twiceAsync sync', () => {
    const trace: (number | 'done')[] = [];
    const doneMock = () => trace.push('done');
    let count = 0;
    twiceAsync(doneMock, doneRun => {
        trace.push(count++); 
        doneRun();
    });
    expect(trace).toEqual([0, 1, 'done']);
});

test('twiceAsync async', doneTest => {
    const trace: (number | 'done')[] = [];
    const doneMock = () => trace.push('done');
    let count = 0;
    twiceAsync(doneMock, doneRun => {
        const i = count++;
        setTimeout(() => {
            trace.push(i);
            setTimeout(doneRun, 50);
        }, i * 10);
    });
    setTimeout(() => {
        expect(trace).toEqual([0, 1, 'done']);
        doneTest();
    }, 100)
});

test('twice no repeated done', () => {
    expect(
        () => twiceAsync(() => {}, doneRun => {
            doneRun();
            doneRun();
        })
    ).toThrow();
});
