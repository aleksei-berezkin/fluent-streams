export function shuffle<T>(a: T[], n: number) {
    const r = n < a.length ? n : n - 1;
    for (let i = 0; i < r; i++) {
        const j = i + Math.floor(Math.random() * (a.length - i));
        const t = a[i];
        a[i] = a[j];
        a[j] = t;
    }
}
