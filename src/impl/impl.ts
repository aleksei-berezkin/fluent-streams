import makeAbstractStream from './AbstractStream';
import makeArrayStream from './ArrayStream';
import makeInputArrayStream from './InputArrayStream';
import makeIteratorStream from './IteratorStream';
import makeRandomAccessStream from './RandomAccessStream';
import makeSimpleOptional from './SimpleOptional';

// To avoid cyclic imports
export const impl: {
    AbstractStream: ReturnType<typeof makeAbstractStream>,
    ArrayStream: ReturnType<typeof makeArrayStream>,
    InputArrayStream: ReturnType<typeof makeInputArrayStream>,
    IteratorStream: ReturnType<typeof makeIteratorStream>,
    RandomAccessStream: ReturnType<typeof makeRandomAccessStream>,
    SimpleOptional: ReturnType<typeof makeSimpleOptional>,
} = {} as any;

export type Impl = typeof impl;

(function() {
    if (!impl.AbstractStream) {
        impl.AbstractStream = makeAbstractStream(impl);
        impl.RandomAccessStream = makeRandomAccessStream(impl);
        impl.ArrayStream = makeArrayStream(impl);
        impl.InputArrayStream = makeInputArrayStream(impl);
        impl.IteratorStream = makeIteratorStream(impl);
        impl.SimpleOptional = makeSimpleOptional(impl);
    }
}());
