export type InputData = {
    data: number[],
    run: 'warmup' | 'measure',
}

export const inputN = [0, 1, 10, 100, 1000, 10000];

export function genInputs(): InputData[] {
    return [
        {
            data: genInput(5),
            run: 'warmup',
        } as InputData
    ].concat(
        inputN.map(n => ({
            data: genInput(n),
            run: 'measure' as const,
        }))
    );
}

function genInput(n: number) {
    const a = [];
    for (let i = 0; i < n; i++) {
        a.push((Date.now() - i) * (Math.random() - .5));
    }
    return a;
}
