export {};  // declare global needs to be in module

expect.extend({
    toEqualWithMsg(received: any, expected: any, message: string) {
        const getMsg = (not: boolean) =>
            `${message}\n
expected: ${not ? 'not ' : ''}${this.utils.printExpected(expected)}\n 
received: ${this.utils.printReceived(received)}`;
        
        if (this.equals(received, expected)) {
            return {
                message: () => getMsg(true),
                pass: true,
            }
        }

        return {
            message: () => getMsg(false),
            pass: false,
        }
    }
});

declare global {
    namespace jest {
        interface Matchers<R> {
            toEqualWithMsg(expected: any, message: string): R;
        }
    }
}
