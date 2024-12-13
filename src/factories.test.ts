import {
    abc,
    continually,
    entryStream,
    optional,
    optionalOfNullable,
    range,
    same,
    stream,
    streamFromModifiable,
    streamOf
} from '.';
import { twice } from './testUtil/twice';

test('stream', () => {
    const s = stream(['a', 'b']);
    twice(() => expect(s.toArray()).toEqual(['a', 'b']));
});

test ('stream from readme', () => {
    const a = stream(['Aspire', 'to', 'inspire', 'before', 'we', 'expire'])
        .flatMap(word => word)
        .groupBy(char => char)
        .map(([char, chars]) => ([char, chars.length]))
        .sortBy(([_, count]) => -count)
        .take(3)
        .toArray()
    expect(a).toEqual([['e', 7], ['i', 4], ['r', 4]])
})

test('streamFromModifiable', () => {
    const s = streamFromModifiable(['a', 'b']);
    twice(() => expect(s.toArray()).toEqual(['a', 'b']));
});

test('streamFromModifiable sort', () => {
    const input = ['b', 'a', 'c']
    const s = streamFromModifiable(input).sort()
    expect(s.toArray()).toBe(input)
    expect(input).toEqual(['a', 'b', 'c'])

    expect(s.reverse().toArray()).toBe(input)
    expect(input).toEqual(['c', 'b', 'a'])
})

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

test('entryStream', () => {
    const o = {
        a: 0,
        b: 1,
        c: 2,
    };
    const str = entryStream(o);
    (o as any).d = 3;
    twice(() => expect(str.toArray()).toEqual([['a', 0], ['b', 1], ['c', 2], ['d', 3]]));
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
    expect(c.toArray()).toEqual([3, 4, 5]);
});

test('optional iterable empty', () => {
    const o = optional([]);
    twice(() => {
        expect(o.toArray()).toEqual([]);
        expect(o.resolve()).toEqual({has: false});
    });
});

test('optional iterable nonempty', () => {
    const o = optional(['a']);
    twice(() => {
        expect(o.toArray()).toEqual(['a']);
        expect(o.resolve()).toEqual({has: true, val: 'a'});
    });
});

test('optional trims array', () => {
    const o = optional(['a', 'b', 'c']);
    twice(() => {
        expect(o.toArray()).toEqual(['a']);
        expect(o.resolve()).toEqual({has: true, val: 'a'});
    });
});

test('optionalOfNullable null', () => {
    const o = optionalOfNullable(() => null);
    twice(() => {
        expect(o.toArray()).toEqual([]);
        expect(o.resolve()).toEqual({has: false});
    });
});

test('optionalOfNullable undefined', () => {
    const o = optionalOfNullable(() => undefined);
    twice(() => {
        expect(o.toArray()).toEqual([]);
        expect(o.resolve()).toEqual({has: false});
    });
});

test('optionalOfNullable nonempty', () => {
    const o = optionalOfNullable(() => 'a');
    twice(() => {
        expect(o.toArray()).toEqual(['a']);
        expect(o.resolve()).toEqual({has: true, val: 'a'});
    });
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

test('poker', () => {
    const deck = streamOf('♠', '♥', '♣', '♦')
        .flatMap(suit =>
            streamOf<string | number>(
                'A',
                ...range(2, 11),
                'J',
                'Q',
                'K'
            ).map(rank => `${rank}${suit}`)
        ).toArray()
    expect([deck[0], deck[20], deck[51]]).toStrictEqual(['A♠', '8♥', 'K♦'])

    const playersNumber = 3
    const [flop, turn, river, ...hands] = stream(deck)
        .takeRandom(3 + 1 + 1 + playersNumber * 2)
        .zipWithIndex()
        .splitWhen((_, [, j]) =>
            j === 3             // flop
            || j === 4          // turn
            || j >= 5           // river
                && j % 2 === 1  // ...players' hands
        )
        .map(
            // Unzip index
            chunk => chunk.map(([card]) => card)
        )
    expect(flop).not.toEqual(deck.slice(0, 3))
    expect(flop.length).toBe(3)
    expect(turn.length).toBe(1)
    expect(river.length).toBe(1)
    expect(hands.length).toBe(playersNumber)
    for (const hand of hands) {
        expect(hand.length).toBe(2)
    }
})

test('Lorem ipsum', () => {
    const loremIpsum = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'

    const loremIpsumWords = loremIpsum
        .replaceAll(/[.,]/g, '')
        .split(' ')

    const top = stream(loremIpsumWords)
        .groupBy(w => w.toLowerCase())
        .map(([w, list]) => [w, list.length])
        .sortBy(([_, length])  => -length)
        .take(3)
        .toArray()

    console.log(top)
})

test('coprime', () => {
    function gcd(a: number, b: number): number {
        return b === 0 ? a : gcd(b, a % b)
    }

    function isCoprime(a: number, b: number) {
        return gcd(a, b) === 1
    }

    expect(isCoprime(2, 3)).toBe(true)
    expect(isCoprime(2, 4)).toBe(false)
    expect(isCoprime(3, 4)).toBe(true)
    expect(isCoprime(10, 21)).toBe(true)
    expect(isCoprime(10, 35)).toBe(false)

    const randomInts = continually(() =>
        // 2..999
        2 + Math.floor(Math.random() * 998)
    )

    const ints = randomInts
        .zip(randomInts)
        .filter(([a, b]) => a % 2 === 0 || b % 2 === 0)
        .filter(([a, b]) => gcd(a, b) === 1)
        .distinctBy(pair => stream(pair).sortBy(i => i).join())
        .take(10)

    expect(ints.size()).toBe(10)
})
