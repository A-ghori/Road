// FIFO Queue (not LIFO)
class Queue {
  constructor() {
    this.items = [];
  }

  Enqueue(item) {
    this.items.push(item);
  }

  Dequeue() {
    return this.items.shift();
  }

  isEmpty() {
    return this.items.length === 0;
  }
}

// BFS FUNCTION
function bfs(graph, src) {
  const visited = new Set();
  const q = new Queue();
  const order = [];

  q.Enqueue(src);
  visited.add(src);

  while (!q.isEmpty()) {
    let U = q.Dequeue();
    order.push(U);   // traversal

    for (let neighbour of graph[U]) {
      if (!visited.has(neighbour)) {
        visited.add(neighbour);
        q.Enqueue(neighbour);
      }
    }
  }

  return order;
}

// Test Graph
const graph1 = {
  1: [2],
  2: [3],
  3: [4],
  4: [5],
  5: []
};

console.log(bfs(graph1, 1));
