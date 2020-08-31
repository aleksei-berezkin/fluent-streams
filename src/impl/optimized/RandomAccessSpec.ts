export type RandomAccessSpec<T> = {
    get: (i: number) => T,
    length: number,
}