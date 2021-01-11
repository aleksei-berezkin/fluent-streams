export function collectToMap<K, T>(items: Iterable<T>, getKey: (item: T) => K) {
    const m = new Map<K, T[]>();
    const itr = items[Symbol.iterator]();
    for ( ; ; ) {
        const n = itr.next();
        if (n.done) {
            break;
        }
        const item = n.value;
        const key = getKey(item);
        if (m.has(key)) {
            m.get(key)!.push(item);
        } else {
            m.set(key, [item]);
        }
    }
    return m;
}
