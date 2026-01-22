//         A
//       /   \
//      B     C
//     / \     \
//    D   E     F


// First Creating Queue

class Queue {
    constructor() {
        this.items = [];
    }

    Enque(item) {
        this.items.push(item)
    }

    Deque () {
        return this.items.shift()
    }
    isEmpty () {
        return this.items.length === 0;
    }
}

function bfs(node, src) {
    const visited = new Set();
    const q = new Queue();
    const order = [];

    q.Enque(src);
    visited.add(src);

    while(!q.isEmpty()){
        let U = q.Deque();
        order.push(U);

        for(let neighbour of node[U]){
            if(!visited.has(neighbour)){
              visited.add(neighbour);
              q.Enque(neighbour)
            }
        }
    }
    return order
}

const graph2 = {
  A: ["B", "C"],
  B: ["D", "E"],
  C: ["F"],
  D: [],
  E: [],
  F: []
};

console.log(bfs(graph2, "A"));
