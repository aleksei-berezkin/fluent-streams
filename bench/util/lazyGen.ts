import Lazy from 'lazy.js';

// @ts-ignore
Lazy.Sequence.define('generator', {
    init: function(input: number[]) {
        this.input = input;
    },

    getIterator: function() {
        let i = -1;
        const input = this.input;
        return {
            current: () => input[i],
            moveNext: () => ++i <= input.length
        }
    },
});

export function LazyGen(input: number[]) {
    // @ts-ignore
    return Lazy().generator(input);
}
