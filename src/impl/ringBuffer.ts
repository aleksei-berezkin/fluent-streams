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

    toArray(): T[] {
        const arr: T[] = [];
        for (let i = 0; i < this.size; i++) {
            arr.push(this.a[(this.start + i) % this.capacity]);
        }
        return arr;
    }

    *[Symbol.iterator]() {
        yield* this.takeLast(this.size);
    }

    *takeLast(n: number): IterableIterator<T> {
        const m = Math.max(0, Math.min(n, this.size));

        for (let i = this.size - m; i < this.size; i++) {
            yield this.a[(this.start + i) % this.capacity];
        }
    }
}
