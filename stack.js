class Stack {
    constructor() {
        this.stack = [];
    }

    push(item) {
        this.stack.push(item);
    }

    pop() {
        return this.stack.pop();
    }

    size() {
        return this.stack.length;
    }
}