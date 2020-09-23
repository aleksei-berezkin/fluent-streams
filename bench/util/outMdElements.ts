import { Input, inputs, Lib, libs, Result } from './result';
import { entryStream, range, stream } from '../../src';
import { prettyPrint } from './prettyPrint';
import { inputN } from './genInput';
import { first, second, third } from './emojis';

export const legend = `${first} The fastest  \n${second} Second place  \n${third} Third place`;

export const benchmarkSection = (r: Result) => `## ${r.name}\n${inputs.map(input => oneInputTable(r.res, input)).join('\n')}\n`

const oneInputTable = (res: Result['res'], input: Input) =>
    `### Input is ${input === 'arr' ? 'array' : 'iterable'}\n${table(res[input])}\n`

const table = (res: Result['res'][Input]) => {
    const nToTop = entryStream(res)
        .flatMap(([lib, score]) => entryStream(score).map(([n, hz]) => ({lib, n, hz})))
        .groupBy(({n}) => n)
        .map(([n, scores]) => [n, stream(scores).sortBy(({hz}) => -hz).map(({lib}) => lib).zipWithIndex().toObject()] as const)
        .toObject();

    return `| Lib | ${ nRow(inputN) } |\n` +
        `|${ range(0, inputN.length + 1).map(() => '---').join('|') }|\n` +
        libs.map(lib => `| ${ libName(lib) } | ${ hzRow(res[lib], lib, nToTop) } |`).join('\n');
};

const nRow = (n: number[]) => n.join(' | ');

const libName = (lib: Lib) =>
    lib === 'str' ? 'Fluent Streams'
    : lib === 'arr' ? 'Array'
    : lib === 'seq' ? 'Sequency'
    : lib === 'laz' ? 'Lazy.js'
    : (() => { throw new Error() })();

const hzRow = (
    hz: {[n: number]: number},  // TODO hz, score
    lib: Lib,
    nToTop: {[n: number]: {[lib in Lib]: number}},
) => entryStream(hz).map(([n, v]) => decorate(prettyPrint(v), nToTop[n][lib])).join(' | ');

function decorate(v: string, place: number) {
    if (place === 0) return `${v} ${first}`;
    if (place === 1) return `${v} ${second}`;
    if (place === 2) return `${v} ${third}`;
    return v;
}
