export class RingBuffer<T> implements Iterable<T>{
    private readonly a: T[];
    private readonly capacity: number;
    private size: number = 0;
    private start: number = 0;

    constructor(capacity: number) {
        if (capacity <= 0) {
            throw new Error(`Bad capacity=${capacity}`);
        }

        this.a = [];
        this.capacity = capacity;
    }

    add(i: T) {
        if (this.size < this.capacity) {
            this.a[this.size++] = i;
        } else {
            this.a[this.start] = i;
            this.start = (this.start < this.capacity - 1) ? this.start + 1 : 0
        }
    }

    [Symbol.iterator]() {
        const {a, start, size, capacity} = this;
        let i = 0;
        return {
            next(): IteratorResult<T> {
                if (i < size) return {done: false, value: a[(start + i++) % capacity]};
                return {done: true, value: undefined};
            }
        }
    }
}
