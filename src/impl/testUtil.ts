export function twice(callback: () => void): void;
export function twice(done: () => void, callback: (_done: () => void) => void): void;
export function twice(cb1: () => void, cb2?: (_done: () => void) => void): void {
    if (cb2) {
        const [done, callback] = [cb1, cb2];
        callback(() => {});
        let isDone = false;
        callback(() => {
            if (isDone) {
                throw new Error('Already done');
            }
            done();
            isDone = true;
        });
    } else {
        cb1();
        cb1();
    }
}
