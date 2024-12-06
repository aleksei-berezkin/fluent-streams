import { stream, streamOf } from './dist/index.mjs';

const output = stream(['a', 'b', 'c'])
    .map(s => s.toUpperCase())
    .concatAll(streamOf('D', 'E', 'F'))
    .join('')

if (output !== 'ABCDEF')
    throw new Error(String(output))
