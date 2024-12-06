// @ts-ignore
import MatcherContext = jest.MatcherContext;

export {};  // declare global needs to be in module

function getResult(pass: boolean, matcherName: string, comment: string | undefined, ctx: MatcherContext,
                   received: any, expected: any, inputHint: () => string, runHint: string) {
    const matcherHint = ctx.utils.matcherHint(matcherName, undefined, undefined, {
        comment,
        isNot: ctx.isNot,
        promise: ctx.promise,
    })

    const getMessage = (not: boolean) =>
        `${matcherHint}
${inputHint()}  --  ${runHint}
expected: ${not ? 'not ' : ''}${ctx.utils.printExpected(expected)} 
received: ${ctx.utils.printReceived(received)}`;

    if (pass) {
        return {
            message: () => getMessage(true),
            pass: true,
        }
    }

    return {
        message: () => getMessage(false),
        pass: false,
    }
}

expect.extend({
    toEqualWithHint(received: any, expected: any, inputHint: () => string, runHint: string) {
        return getResult(
            this.equals(received, expected),
            'toEqualWithHint',
            'Deep equality',
            this,
            received,
            expected,
            inputHint,
            runHint,
        );
    },

    toBeWithHint(received: any, expected: any, inputHint: () => string, runHint: string) {
        return getResult(
            received === expected,
            'toBeWithHint',
            'Strict equality',
            this,
            received,
            expected,
            inputHint,
            runHint,
        );
    },

    toBeGreaterThanWithHint(received: number, expected: number, inputHint: () => string, runHint: string) {
        return getResult(
            received > expected,
            'toBeGreaterThanWithHint',
            undefined,
            this,
            received,
            expected,
            inputHint,
            runHint,
        )
    },
});

declare global {
    namespace jest {
        interface Matchers<R> {
            toEqualWithHint(expected: any, inputHint: () => string, runHint: string): R;
            toBeWithHint(expected: any, inputHint: () => string, runHint: string): R;
            toBeGreaterThanWithHint(expected: number, inputHint: () => string, runHint: string): R;
        }
    }
}
