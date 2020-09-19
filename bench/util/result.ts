import { InputData } from './genInput';

export type Input = 'arr' | 'itr';
export const inputs: Input[] = ['arr', 'itr'];

export function isInput(i: string): i is Input {
    return (inputs as string[]).includes(i);
}

export type Lib = 'str' | 'arr' | 'seq' | 'laz';
export const libs: Lib[] = ['str', 'arr', 'seq', 'laz'];

export function isLib(l: string): l is Lib {
    return (libs as string[]).includes(l);
}

export type Result = {
    name: string,
    res: {
        [i in Input]: {
            [lib in Lib]: {
                [n: number]: number,
            }
        }
    }
};

export function toName(lib: Lib, input: Input, n: number, name: string, run: InputData['run']) {
    return `${ capitalize(lib) }(${ capitalize(input) }[${ n }]).${ name }${ run === 'warmup' ? ' (warmup)' : '' }`;
}

export function parseName(benchName: string): {lib: Lib, input: Input, n: number, name: string, run: InputData['run']} {
    const res = /^(\w+)\((\w+)\[(\d+)]\)\.([\w.]+)( \(warmup\))?$/.exec(benchName)!;
    const lib = res[1].toLowerCase();
    if (!isLib(lib)) throw new Error(lib);

    const input = res[2].toLowerCase();
    if (!isInput(input)) throw new Error(input);

    const n = Number.parseInt(res[3], 10);
    if (Number.isNaN(n)) throw new Error(res[3]);

    const name = res[4];

    const run: InputData['run'] = !!res[5] ? 'warmup' : 'measure';

    return {lib, input, n, name, run}
}

function capitalize(s: string) {
    return s.substr(0, 1).toUpperCase() + s.substr(1);
}
