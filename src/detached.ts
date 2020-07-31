import { Stream } from './stream';
import { Optional } from './optional';
import { stream, optional } from './factories';

function makeDetached<E, Out>(make: (attachableItr: Iterable<E>) => Out) {
    let attached: boolean = false;
    let input: Iterable<E>;
    const attachableItr: Iterable<E> = {
        [Symbol.iterator](): Iterator<E> {
            if (!attached) {
                throw new Error('Detached');
            }
            try {
                return input[Symbol.iterator]();
            } finally {
                attached = false;
            }
        }
    };
    const made = make(attachableItr);
    return (_input: Iterable<E>) => {
        input = _input;
        attached = true;
        return made;
    }
}


export function detachedStream<E, Out extends Stream<unknown> | Optional<unknown>>(builder: (stream: Stream<E>) => Out): (input: Iterable<E>) => Out {
    return makeDetached(attachableitr => builder(stream(attachableitr)));
}

export function detachedOptional<E, Out extends Stream<unknown> | Optional<unknown>>(builder: (stream: Optional<E>) => Out): (input: Iterable<E>) => Out {
    return makeDetached(attachableItr => builder(optional(attachableItr)));
}
