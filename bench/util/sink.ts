const date = Date.now();

export function sink(a: number[]): number {
    return a.length ? (a[0] - a[Math.floor(a.length / 2)] + a[a.length - 1]) : date;
}
