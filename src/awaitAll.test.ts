import './testUtil/extendExpect';
import { forStreamInput as forInput, streamInputRuns } from './testUtil/forInput';
import { twiceAsync } from './testUtil/twice';

test('awaitAll const', doneTest => {
    let runs = 0;
    forInput(
        ['a', 'b'],
        s => s,
        (s, inputHint) => twiceAsync(() => runs++, (doneRun, runHint) =>
            s.awaitAll().then(items => {
                expect(items).toEqualWithHint(['a', 'b'], inputHint, runHint);
                doneRun();
            })
        ),
    );
    setTimeout(() => {
        expect(runs).toBe(streamInputRuns);
        doneTest();
    }, 100);
});

test('awaitAll promise', doneTest => {
    let runs = 0;
    forInput(
        [
            new Promise(resolve => setTimeout(() => resolve('a'), 100)),
            new Promise(resolve => setTimeout(() => resolve('b'), 200))
        ],
        s => s,
        (s, inputHint) => twiceAsync(() => runs++, (doneRun, runHint) =>
            s.awaitAll().then(items => {
                expect(items).toEqualWithHint(['a', 'b'], inputHint, runHint);
                doneRun();
            })
        )
    );
    setTimeout(() => {
        expect(runs).toBe(streamInputRuns);
        doneTest();
    }, 500);
});

test('awaitAll mix', doneTest => {
    let runs = 0;
    forInput(
        [
            new Promise(resolve => setTimeout(() => resolve('a'), 100)),
            'b',
        ],
        s => s,
        (s, inputHint) => twiceAsync(() => runs++, (doneRun, runHint) =>
            s.awaitAll().then(items => {
                expect(items).toEqualWithHint(['a', 'b'], inputHint, runHint);
                doneRun();
            })
        ),
    );
    setTimeout(() => {
        expect(runs).toBe(streamInputRuns);
        doneTest();
    }, 500);
});
