export function genInputs(): number[][] {
    return [0, 1, 10, 100, 1000, 10000].map(n => genInput(n));
}

function genInput(n: number) {
    const a = [];
    for (let i = 0; i < n; i++) {
        a.push((Date.now() - i) * (Math.random() - .5));
    }
    return a;
}
