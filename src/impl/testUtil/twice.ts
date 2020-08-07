export function twice(callback: (msg?: string) => void): void;
export function twice(done: () => void, callback: (_done: () => void, msg: string) => void): void;
export function twice(cb1: (msg?: string) => void, cb2?: (_done: () => void, msg: string) => void): void {
    if (cb2) {
        const [done, callback] = [cb1, cb2];
        callback(() => {}, 'First run');
        let isDone = false;
        callback(() => {
            if (isDone) {
                throw new Error('Already done');
            }
            done();
            isDone = true;
        }, 'Second run');
    } else {
        cb1('First run');
        cb1('Second run');
    }
}
