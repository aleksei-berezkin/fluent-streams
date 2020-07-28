export function trimIterable<T>(items: Iterable<T>): Iterable<T> {
    return {
        [Symbol.iterator](): Iterator<T> {
            return function* () {
                const n = items[Symbol.iterator]().next();
                if (!n.done) {
                    yield n.value;
                }
            }();
        }
    };
}

export function collectToMap<K, T>(items: Iterable<T>, getKey: (item: T) => K) {
    const m = new Map<K, T[]>();
    for (const i of items) {
        const k = getKey(i);
        if (m.has(k)) {
            m.get(k)!.push(i);
        } else {
            m.set(k, [i]);
        }
    }
    return m;
}
