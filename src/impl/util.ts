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
