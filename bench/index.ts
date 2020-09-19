import at from './at';
import append from './append';
// import './appendAll';
// import './butLast';
// import './distinct';
// import './filter';
// import './find';
// import './flatMap';
// import './join';
// import './map';
// import './reduce';
// import './sort.at';
// import './sort.map';
import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import { Input, libs, Result } from './util/result';
import { entryStream } from '../src';

if (process.argv.length !== 3) {
    throw new Error('Output file is not specified');
}
const outFile = path.resolve(process.argv[2])
console.log('Output file is ' + outFile);

fs.mkdirSync(path.dirname(outFile), {
    recursive: true,
});
fs.writeFileSync(outFile, '# Benchmarks\n');

[at, append].forEach(promise => promise.then(r => {
    fs.appendFileSync(outFile, `## ${r.name}\n
### Input is array\n${table(r.res.arr)}\n
### Input is iterable\n${table(r.res.itr)}\n`   // TODO dedup
    );
}));

const table = (res: Result['res'][Input]) =>
    `| Lib | ${nRow(res.arr)} |\n` +
    libs.map(lib => `| ${lib} | ${vRow(res[lib])} |\n`).join('');

const nRow = (hz: {[n: number]: number}) => entryStream(hz).map(([n, _]) => n).join(' | ');
const vRow = (hz: {[n: number]: number}) => entryStream(hz).map(([_, v]) => prettyPrint(v)).join(' | ');

function prettyPrint(hz: number) {
    if (hz >= 100_000_000) {
        return Math.round(hz / 1_000_000) + 'M';
    }
    if (hz >= 10_000_000) {
        return Math.round(hz / 100_000) / 10 + 'M';
    }
    if (hz >= 1_000_000) {
        return Math.round(hz / 10_000) / 100 + 'M';
    }
    if (hz >= 100_000) {
        return Math.round(hz / 1000) + 'k';
    }
    if (hz >= 10_000) {
        return Math.round(hz / 100) / 10 + 'k';
    }
    if (hz >= 1_000) {
        return Math.round(hz / 10) / 100 + 'k';
    }
    if (hz >= 100) {
        return Math.round(hz);
    }
    if (hz >= 10) {
        return Math.round(hz * 10) / 10;
    }
    if (hz >= 1) {
        return Math.round(hz * 100) / 100;
    }
    if (hz >= .1) {
        return Math.round(hz * 1000) / 1000;
    }
    return Math.round(hz * 10_000) / 10_000;
}
