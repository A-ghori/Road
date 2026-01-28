class priorityQueue {
    constructor(){
         this.items = []
    }
    enqueue(node, priority){
        this.items.push({node, priority});
        this.items.sort((a,b) => a.priority - b.priority);
    }
    dequeue(){
        return this.items.shift();
    }
    isEmpty(){
        return this.items.length === 0;
    }
}
module.exports = {
    priorityQueue
}
