const justConst = Date.now() / 1e12;

export function sink(a: number[] | number | string | { toArray(): number[] } | undefined | null): number {
    if (a == null) {
        return .1;
    }

    if (typeof a === 'number') {
        return a;
    }

    if (typeof a === 'string') {
        return a.length + a.length ? a.charCodeAt(0) : .2;
    }

    if (!Array.isArray(a)) {
        a = a.toArray();
    }

    return a.length
        ? (a[0] - a[Math.floor(a.length / 2)] + a[a.length - 1])
        : justConst;
}
