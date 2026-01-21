const graph = require("../Graphs/UndirectedGraph");

let g = new graph();

g.addUndirectedEdge("A", "B");
g.addUndirectedEdge("A", "C");
g.addUndirectedEdge("B","D");

g.print()

