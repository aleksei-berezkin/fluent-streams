import factories from './dist/factories.js';
const { stream, streamOf } = factories;

const output = stream(['a', 'b', 'c'])
    .map(s => s.toUpperCase())
    .appendAll(streamOf('D', 'E', 'F'))
    .map(s => s + 'x')
    .toArray();

if (output[4] !== 'Ex') {
    throw new Error('Not passed')
}
