export function variations(items: string[], k: number): string[] {
    if (k < 1 || items.length === 0) {
        return [];
    }

    if (items.length === 1) {
        return items;
    }

    const res: string[] = [];
    for (let i = 0; i < items.length; i++) {
        if (k < 2) {
            res.push(items[i]);
        } else {
            const inner = [...items];
            inner.splice(i, 1);
            variations(inner, k - 1)
                .map(p => items[i] + p)
                .forEach(p => res.push(p));
        }
    }
    return res;
}
