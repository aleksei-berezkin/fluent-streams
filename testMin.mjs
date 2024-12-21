import child_process from 'child_process'
import fs from 'fs'

child_process.execSync('npx terser --mangle --module -- dist/index.js > index.min.js')
const minimizedSize = fs.readFileSync('index.min.js').length

child_process.execSync('gzip index.min.js')
const gzippedSize = fs.readFileSync('index.min.js.gz').length
fs.rmSync('index.min.js.gz')

console.log('Bytes:', minimizedSize, gzippedSize)
console.log('Kilobytes:', (minimizedSize / 1024).toFixed(3), (gzippedSize / 1024).toFixed(3))

const minimizedKb = (minimizedSize / 1024).toFixed(1)
const gzippedKb = (gzippedSize / 1024).toFixed(1)

console.log('Kilobytes:', minimizedKb, gzippedKb)

replaceInFile(
    'README.md', [
        [/Minified: [\d.]+ kB/, `Minified: ${minimizedKb} kB`],
        [/Gzipped: [\d.]+ kB/, `Gzipped: ${gzippedKb} kB`]
    ]);

[
    '../fluent-streams-docs/benchmarks/README.md',
    '../fluent-streams-docs/src/benchmarks/util/intro.md',
].forEach(file => replaceInFile(
    file, [
        [
            /\| Fluent Streams \| [\d.]+ kB 🌠 \| [\d.]+ kB 🌠 \|/,
            `| Fluent Streams | ${minimizedKb} kB 🌠 | ${gzippedKb} kB 🌠 |`,
        ],
    ])
)

function replaceInFile(file, regexToReplacePairs) {
    let content = fs.readFileSync(file, 'utf8')
    for (const [regex, replace] of regexToReplacePairs) {
        const m = regex.exec(content)
        content = content.substring(0, m.index) + replace + content.substring(m.index + m[0].length)
    }
    fs.writeFileSync(file, content)
}
