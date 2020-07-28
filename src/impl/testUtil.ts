export function twice(callback: () => void): void {
    callback();
    callback();
}
