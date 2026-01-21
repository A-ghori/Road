const graph2 = require("../Graphs/UndirectedWeightedGraph");


let g = new graph2();


g.addEdges("A", "B", 5);
g.addEdges("A", "C", 2);
g.addEdges("B", "D", 4);
g.addEdges("C", "D", 7);

g.print();