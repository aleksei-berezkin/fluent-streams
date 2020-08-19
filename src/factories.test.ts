import {
    abc,
    continually,
    entryStream,
    optional,
    optionalOfNullable,
    range,
    same,
    stream,
    streamOf
} from './factories';
import { twice } from './impl/testUtil/twice';
import { appendWithModification } from './impl/testUtil/appendWithModification';

test('stream', () => {
    const s = stream(['a', 'b']);
    twice(() => expect(s.toArray()).toEqual(['a', 'b']));
});

test('stream appendWithModification', () => {
    const input = ['a', 'b', 'c'];
    stream(input).transformToStream(appendWithModification('x')).forEach(() => {});
    expect(input).toEqual(['a', 'b', 'c']);
});

test('stream of iterable', () => {
    const s = stream({
        [Symbol.iterator]() {
            return function* () {
                yield 'a';
                yield 'b';
            }();
        }
    });
    twice(() => expect(s.toArray()).toEqual(['a', 'b']));
});

test('stream of iterables alternate', () => {
    let i = 0;
    const s = stream({
        [Symbol.iterator]() {
            return function* () {
                yield i++;
                yield i++;
            }();
        }
    });
    expect([s.toArray(), s.toArray()]).toEqual([[0, 1], [2, 3]]);
});

test('streamOf', () => {
    twice(() => expect(streamOf('a', 'b').toArray()).toEqual(['a' ,'b']));
});

test('streamOf appendWithModification', () => {
    const input = ['a', 'b'];
    streamOf(...input).transformToStream(appendWithModification('x')).forEach(() => {});
    expect(input).toEqual(['a', 'b']);
})

test('entryStream', () => {
    const o = {
        a: 0,
        b: 1,
        c: 2,
    };
    twice(() => expect(entryStream(o).toArray()).toEqual([['a', 0], ['b', 1], ['c', 2]]));
});

test('entryStream skips prototype', () => {
    const o = {
        a: 0,
        b: 1,
    };
    const p = {
        c: 2,
    };
    Object.setPrototypeOf(o, p);
    twice(() => expect(entryStream(o).toArray()).toEqual([['a', 0], ['b', 1]]));
});

test('empty ranges', () => {
    const e1 = range(0, -1);
    const e2 = range(0, 0);
    const e3 = range(1, 1);
    twice(() =>
        expect([
            e1.toArray(),
            e2.toArray(),
            e3.toArray(),
        ]).toEqual([
            [], [], []
        ])
    );
});

test('range', () => {
    const r = range(0, 3);
    twice(() => expect(r.toArray()).toEqual([0, 1, 2]));
});

test('abc', () => {
    const a = abc();
    twice(() => 
        expect(a.toArray()).toEqual([
            'a', 'b', 'c', 'd', 'e', 'f',
            'g', 'h', 'i', 'j', 'k', 'l',
            'm', 'n', 'o', 'p', 'q', 'r',
            's', 't', 'u', 'v', 'w', 'x',
            'y', 'z',
        ])
    );
});

test('same', () => {
    const a = same('a').take(2);
    twice(() => expect(a.toArray()).toEqual(['a', 'a']));
});

test('continually', () => {
    let i = 0;
    const c = continually(() => i++).take(3);
    expect(c.toArray()).toEqual([0, 1, 2]);
    expect(c.toArray()).toEqual([4, 5, 6]);
});

test('optional iterable empty', () => {
    const o = optional([]);
    twice(() => expect(o.toArray()).toEqual([]));
});

test('optional iterable nonempty', () => {
    const o = optional(['a']);
    twice(() => expect(o.toArray()).toEqual(['a']));
});

test('optional trims array', () => {
    const o = optional(['a', 'b', 'c']);
    twice(() => expect(o.toArray()).toEqual(['a']));
});

test('optionalOfNullable null', () => {
    const o = optionalOfNullable(() => null);
    twice(() => expect(o.toArray()).toEqual([]));
});

test('optionalOfNullable undefined', () => {
    const o = optionalOfNullable(() => undefined);
    twice(() => expect(o.toArray()).toEqual([]));
});

test('optionalOfNullable nonempty', () => {
    const o = optionalOfNullable(() => 'a');
    twice(() => expect(o.toArray()).toEqual(['a']));
});

test('optionalOfNullable alternate', () => {
    let i = 0;
    const o = optionalOfNullable(() => i++ % 2 === 0 ? null : i);
    expect([
        o.toArray(), o.toArray(), o.toArray(), o.toArray()
    ]).toEqual([
        [], [2], [], [4]
    ]);
});
