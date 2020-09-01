const date = Date.now();

export function sink(a: number[] | number | { toArray(): number[] } | undefined): number {
    if (a == null) {
        return .1;
    }

    if (typeof a === 'number') {
        return a;
    }

    if (!Array.isArray(a)) {
        a = a.toArray();
    }

    return a.length ? (a[0] - a[Math.floor(a.length / 2)] + a[a.length - 1]) : date;
}
