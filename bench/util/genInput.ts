export function genInputs(name: string): [number[], (s: string) => string][] {
    return [10, 100, 1000, 10000, 1, 0].map(n => [genInput(n), s => `${s}[${n}].${name}`]);
}

function genInput(n: number) {
    const a = [];
    for (let i = 0; i < n; i++) {
        a.push(i + Date.now() * Math.random());
    }
    return a;
}
