import { detachedOptional, detachedStream } from './detached';
import { Stream } from './stream';
import { optional, streamOf } from './factories';
import { Optional } from './optional';

test('detached stream error', () => {
    expect(() => detachedStream(s => {
        s.toArray();
        return streamOf();
    })).toThrow();
});

test('detached optional error', () => {
    expect(() => detachedOptional(s => {
        s.resolve();
        return optional([]);
    })).toThrow();
})

test('detachedStream', () => {
    expect(
        detachedStream((stream: Stream<string>) =>
            stream.append('b')
        )(['a']).toArray()
    ).toEqual(['a', 'b']);
});

test('detachedStream continue after attach', () => {
    expect(
        detachedStream((stream: Stream<string>) =>
            stream.append('b')
        )(['a']).append('c').toArray()
    ).toEqual(['a', 'b', 'c']);
});

test('detachedOptional continue after attach', () => {
    expect(
        detachedOptional((optional: Optional<string>) =>
            optional.map(s => s.toUpperCase())
        )(['a']).map(s => s + 'x').toArray()
    ).toEqual(['Ax']);
});

test('detachedStream works once', () => {
    const attached = detachedStream((stream: Stream<string>) =>
        stream.append('b')
    )(['a']);
    expect(attached.toArray()).toEqual(['a', 'b']);
    expect(() => attached[Symbol.iterator]().next()).toThrow();
});

test('detachedOptional works once', () => {
    const attached = detachedOptional((optional: Optional<string>) =>
        optional.map(s => s.toUpperCase())
    )(['a']);
    expect(attached.toArray()).toEqual(['A']);
    expect(() => attached[Symbol.iterator]().next()).toThrow();
});
