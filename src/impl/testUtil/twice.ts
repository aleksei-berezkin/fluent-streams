export function twice(run: (message: string) => void) {
    run('First run');
    run('Second run');
}

export function twiceAsync(doneTest: () => void, run: (doneRun: () => void, message: string) => void) {
    run(() => {}, 'First run');
    let isDone = false;
    run(() => {
        if (isDone) {
            throw new Error('Already done');
        }
        doneTest();
        isDone = true;
    }, 'Second run');
}
