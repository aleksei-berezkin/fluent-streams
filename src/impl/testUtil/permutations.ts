export function permutations(items: string[]): string[] {
    if (items.length === 0) {
        return [];
    }

    if (items.length === 1) {
        return items;
    }

    const res: string[] = [];
    for (let i = 0; i < items.length; i++) {
        const inner = [...items];
        inner.splice(i, 1);
        permutations(inner)
            .map(p => items[i] + p)
            .forEach(p => res.push(p));
    }
    return res;
}
