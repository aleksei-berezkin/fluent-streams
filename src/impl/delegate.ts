import { Stream } from '../stream';
import { Optional } from '../optional';

function DS(this: any, getTarget: any) {
    // noinspection JSUnusedGlobalSymbols
    this.getTarget = getTarget;
}

function DO(this: any, getTarget: any) {
    // noinspection JSUnusedGlobalSymbols
    this.getTarget = getTarget;
}

export function delegateStream<T>(getTarget: () => Stream<T>): Stream<T> {
    if (!('map' in DS.prototype)) {
        build(DS.prototype, streamMethods);
    }
    return new (DS as any)(getTarget) as any as Stream<T>;
}

export function delegateOptional<T>(getTarget: () => Optional<T>): Optional<T> {
    if (!('map' in DO.prototype)) {
        build(DO.prototype, optionalMethods);
    }
    return new (DO as any)(getTarget) as any as Optional<T>;
}

type Kind = 0 /* terminal */ | 1 /* optional */ | 2 /* stream */;
type Method = [string | symbol, Kind];

const streamMethods: Method[] = [
    [Symbol.iterator, 0],
    ['all', 0],
    ['any', 0],
    ['append', 2],
    ['appendAll', 2],
    ['at', 1],
    ['awaitAll', 0],
    ['butLast', 2],
    ['distinctBy', 2],
    ['equals', 0],
    ['filter', 2],
    ['filterWithAssertion', 2],
    ['find', 1],
    ['flatMap', 2],
    ['forEach', 0],
    ['forEachUntil', 0],
    ['groupBy', 2],
    ['head', 1],
    ['join', 0],
    ['joinBy', 0],
    ['last', 1],
    ['map', 2],
    ['peek', 2],
    ['randomItem', 1],
    ['reduce', 1],
    ['reduceLeft', 0],
    ['reduceRight', 0],
    ['reverse', 2],
    ['shuffle', 2],
    ['single', 1],
    ['size', 0],
    ['sort', 2],
    ['sortBy', 2],
    ['splitWhen', 2],
    ['tail', 2],
    ['take', 2],
    ['takeLast', 2],
    ['takeRandom', 2],
    ['toArray', 0],
    ['toObject', 0],
    ['transform', 2],
    ['transformToOptional', 1],
    ['zip', 2],
    ['zipStrict', 2],
    ['zipWithIndex', 2],
    ['zipWithIndexAndLen', 2],
];

const optionalMethods: Method[] = [
    [Symbol.iterator, 0],
    ['filter', 1],
    ['flatMap', 1],
    ['flatMapToStream', 2],
    ['get', 0],
    ['has', 0],
    ['hasNot', 0],
    ['is', 0],
    ['isPresent', 0],
    ['map', 1],
    ['mapNullable', 1],
    ['orElse', 0],
    ['orElseGet', 0],
    ['orElseNull', 0],
    ['orElseThrow', 0],
    ['orElseUndefined', 0],
    ['resolve', 0],
    ['toArray', 0],
    ['toStream', 2],
];

function build(proto: any, methods: Method[]) {
    for (const m of methods) {
        proto[m[0]] = createMethod(m[0], m[1]);
    }
}

function createMethod(m: Method[0], k: Method[1]) {
    switch (k) {
        case 0:
            return function (this: any) {
                let t;
                return (t = this.getTarget())[m].apply(t, arguments);
            }
        case 1:
            return function (this: any) {
                const a = arguments;
                return delegateOptional(() => {
                    const t = this.getTarget();
                    return t[m].apply(t, a);
                });
            }
        case 2:
            return function (this: any) {
                const a = arguments;
                return delegateStream(() => {
                    const t = this.getTarget();
                    return t[m].apply(t, a);
                });
            };
    }
}
