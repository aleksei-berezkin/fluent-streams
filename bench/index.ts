import at from './at';
import append from './append';
import appendAll from './appendAll';
// import './butLast';
// import './distinct';
// import './filter';
import find from './find';
import flatMap from './flatMap';
// import './join';
import map from './map';
// import './reduce';
// import './sort.at';
// import './sort.map';
import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import { benchmarkSection, legend } from './util/outMdElements';

if (process.argv.length !== 3) {
    throw new Error('Output file is not specified');
}
const outFile = path.resolve(process.argv[2])
console.log('Output file is ' + outFile);

fs.mkdirSync(path.dirname(outFile), {
    recursive: true,
});
fs.writeFileSync(outFile, `# Benchmarks\n${legend}\n\n`);

[at, append, appendAll, find, flatMap, map].forEach(benchmark =>
    fs.appendFileSync(outFile, benchmarkSection(benchmark()))
);
