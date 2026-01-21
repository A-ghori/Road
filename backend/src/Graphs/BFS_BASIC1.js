// 1 → 2 → 3 → 4 → 5


// LIFO -> LAST IN FIRST OUT

class Queue {
    constructor(){
        this.item = []
    }
    Enqueue (items){
        this.item.push(items)
    }
    Dequeue (){
        return this.item.shift()
    }
    IsEmpty(){
        return this.item.length === 0
    }
}

function bfs (graph, src) {
     const visited = new Set();
     const q = new Queue();
     const order = [];


     q.Enquque(src);
     visited.add(src);


     while(!q.isEmpty()){
        let U = q.Dequque();
        // Traversal
        order.push(q);

        for(let neigthbours of graph[U]){
            if(!visited.has(neigthbours)){
                visited.add(neigthbours);
                q.Enquque(neigthbours)
            }
        }
     }
     return order
}


const graph1 = {
  1: [2],
  2: [3],
  3: [4],
  4: [5],
  5: []
};

console.log(bfs(graph1, 1));

