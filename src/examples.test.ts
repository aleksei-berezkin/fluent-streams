import { abc, continually, range, stream, streamOf } from '.'

test('shuffle then head', () => {
    const input = ['a', 'b', 'c']
    const sHead = stream(input)
        .shuffle()
        .head()
    const set = new Set()
    for (let i = 0; i < 30; i++) {
        set.add(sHead.get())
    }
    expect(set.size).toEqual(input.length)
})

test('toObject example', () => {
    const o1 = stream(['a', 'b'] as const)
        .map(key => [key, 0] as const)
        .toObject()   // => type is {a: 0, b: 0}

    expect(o1).toEqual({a: 0, b: 0})

    const o2 = stream(['a', 'b'])
        .map(key => [key, 0] as const)
        .toObject()   // => type is {[p: string]: 0}

    expect(o2).toEqual({a: 0, b: 0})

    const o3 = stream(['a', 'b'])
        .map(key => [key, 0])
        .toObject()   // => type is unknown

    expect(o3).toEqual({a: 0, b: 0})
})


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
        .map(([w, {length}]) => [w, length])
        .sortBy(([_, length])  => -length)
        .take(3)
        .toArray()

    expect(top).toEqual([['ut', 3], ['in', 3], ['dolor', 2]])
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

test('The quick brown fox', () => {
    const equals = stream('The quick brown fox jumps over the lazy dog')
        .filter(c => c !== ' ')
        .map(c => c.toLowerCase())
        .distinctBy(c => c)
        .sort()
        .equals(abc())

    expect(equals).toBe(true)
})
