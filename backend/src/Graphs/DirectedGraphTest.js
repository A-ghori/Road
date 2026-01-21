const graph1 = require("./DirectedGraph");

let g = new graph1();

g.addEdge("A", "B");
g.addEdge("B", "C");
g.addEdge("C", "D");

g.print();