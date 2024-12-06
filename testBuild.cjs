const { stream, streamOf } = require('./dist/index.js')

const output = stream([1, 2, 3])
    .map(x => x * 2)
    .concatAll(streamOf(8, 10))
    .join()

if (output !== '2,4,6,8,10')
    throw new Error(String(output))
