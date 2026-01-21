// First Queue Code

class Queue {
    constructor(){
        this.items = []
    }

    // Enqueue LAST IN 
    Enquque(item){
         this.items.push(item)
    }

    // Dequeue FIRST OUT
    Dequque(){
        return this.items.shift()
    }

    isEmpty(){
        return this.items.length ===0
    }

}
// BFS IMPLEMENTATION
function bfs(graph, src) {
    const visited = new Set();
    const q = new Queue();
    const order = [];


    q.Enquque(src);
    visited.add(src);

    while(!q.isEmpty()){
        let U = q.Dequque(); // I pop items from queue
        order.push(U) // Put the values in traversal order
        
        for(let neighbours of graph[U] ){
            if(!visited.has(neighbours)){
                visited.add(neighbours);
                q.Enquque(neighbours)
            }
        }
    }
    return order
}





const graph = {
  1: [5, 2],
  2: [3],
  3: [4],
  4: [6],
  5: [],
  6: []
};

console.log(bfs(graph, 1));
