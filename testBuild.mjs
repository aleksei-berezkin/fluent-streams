import fluentStreams from './dist/cjs/index.js';
const { stream, streamOf } = fluentStreams;

const output = stream(['a', 'b', 'c'])
    .map(s => s.toUpperCase())
    .appendAll(streamOf('D', 'E', 'F'))
    .map(s => s + 'x')
    .toArray();

if (output[4] !== 'Ex') {
    throw new Error(String(output))
}
