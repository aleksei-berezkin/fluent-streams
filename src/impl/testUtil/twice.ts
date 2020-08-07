const hint1 = 'Run 1 of 2';
const hint2 = 'Run 2 of 2'

export function twice(run: (runHint: string) => void) {
    run(hint1);
    run(hint2);
}

export function twiceAsync(doneTest: () => void, run: (doneRun: () => void, runHint: string) => void) {
    run(() => {}, hint1);
    let isDone = false;
    run(() => {
        if (isDone) {
            throw new Error('Already done');
        }
        doneTest();
        isDone = true;
    }, hint2);
}
