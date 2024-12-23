import { stream, streamOf } from './dist/index.mjs';

const output = stream(['a', 'b', 'c'])
    .map(s => s.toUpperCase())
    .concatAll(streamOf('D', 'E', 'F'))
    .join('')

if (output !== 'ABCDEF')
    throw new Error(String(output))

const one = stream(function*() { yield 'a' })
    .head()
    .toArray()

if (one.length !== 1 || one[0] !== 'a') 
    throw new Error(String(one))
