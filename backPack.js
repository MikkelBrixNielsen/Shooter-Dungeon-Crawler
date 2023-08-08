class Backpack {
    constructor(size) {
        this.slots = [];
        this.capacity = size;
    }

    increaseSize(size) {
        let newSlots = [this.size + size];
        for (let i = 0; i < this.size; i++) {
            newSlots[i] = this.slots[i];
        }
        this.slots = newSlots;
        this.size = size;
    }

    capacity() {
        return this.capacity;
    }

    addItem(item) {
        if (this.slots.length < this.capacity) {
            this.slots.push(item);
        }
    }

    slotSet(item, idx) {
        if (idx < this.capacity) {
            this.slots[idx] = item;
        } else {
            print("index out of bounds");
        }
    }

    itemGet(idx) {
        return this.slots[idx];
    }
}