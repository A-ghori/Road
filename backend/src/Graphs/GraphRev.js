class Graph {
  constructor() {
    this.adj = new Map();
  }
  addNode(node) {
    if (!this.adj.has(node)) {
      this.adj.set(node, []);
    }
  }
  addEdges(from, to, weight) {
    this.addNode(from);
    this.addNode(to);
    this.adj.get(from).push({ to, weight });
    this.adj.get(to).push({ from, weight });
  }
  print() {
    console.log(this.adj);
  }
}
const graph = new Graph();

graph.addEdges("A", "B", 5);
graph.addEdges("A", "C", 3);
graph.addEdges("B", "D", 2);
graph.addEdges("C", "D", 4);

graph.print();
