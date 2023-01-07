export default class Queue<T> {
  private queueArr: Array<T>;

  constructor() {
    this.queueArr = [];
  }

  queue(el: T) {
    this.queueArr.push(el);
  }

  dequeue(): T | undefined {
    return this.queueArr.shift();
  }

  size(): number {
    return this.queueArr.length;
  }

  // Removes queue items for which the predicate returns true, returns number of items removed
  remove(predicate: (el: T) => boolean): number {
    const initialSize = this.size();
    this.queueArr = this.queueArr.filter((el) => !predicate(el));
    return initialSize - this.size();
  }
}
