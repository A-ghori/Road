// class Queue {
//     constructor() {
//         this.items = [];
//     }
//     enque(item){
//         this.items.push(item)
//     }
//     deque(){
//         return this.items.shift()
//     }
//     isEmpty(){
//         return this.items.length === 0
//     }
// }

// function bfs (graph,src){
//     const visited = {};
//     const q = new Queue();
//     const order = [];

//     visited[src] = true;
//     q.enque(src);

//     while(!q.isEmpty()){
//          let U = q.deque();
//          q.push(U);
// for(let neigbour of graph[U]){
//     if(visited[neigbour] !== true){
//         visited[neigbour] = true;
//         q.enque(neigbour)
//     } 
// }
//         }
//         return order 
// }

class Queue {
    constructor(){
        this.items = []
    }
    enque (item) {
        this.items.push(item)
    }
    deque(){
        return this.items.shift()
    }
    isEmpty(){
        return this.items.length === 0
    }
}

function bfs (graph, src) {
    const visited = {}
    const q = new Queue();
    const order = []


    visited[src] = true;
    q.enque(src);

    while(!q.isEmpty()){
       let U = q.deque();
       order.push(U);
    for(let neighbour of graph[U]){
        if(visited[neighbour] !== true){
            visited[neighbour] = true;
            q.enque(neighbour);
        }
    }
    
    }

    return order


}


const graph = {
  A: ["B", "C"],
  B: ["D", "E"],
  C: ["F"],
  D: [],
  E: [],
  F: []
};

console.log(bfs(graph, "A"));
