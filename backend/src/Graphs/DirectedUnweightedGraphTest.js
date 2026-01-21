const createMyDirectedUnweightedGraph = require("../Graphs/DirectedUnweightedGraph")


 let g = new createMyDirectedUnweightedGraph ();



g.addEdge("A", "B");
g.addEdge("A", "C");
g.addEdge("B", "D");
g.addEdge("C", "D");

g.print();