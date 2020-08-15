export function accommodations(items: string[], n: number): string[] {
    if (n <= 0 || items.length === 0) {
        return [];
    }

    if (items.length === 1) {
        return items;
    }

    const res: string[] = [];
    for (let i = 0; i < items.length; i++) {
        if (n === 1) {
            res.push(items[i]);
        } else {
            const inner = [...items];
            inner.splice(i, 1);
            accommodations(inner, n - 1)
                .map(p => items[i] + p)
                .forEach(p => res.push(p));
        }
    }
    return res;
}
