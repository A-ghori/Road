const Graph = require("../Graphs/Graph");

const g = new Graph();


// Nodes + Edges add karo
g.addTwoWayEdegs("A", "B", 5);
g.addTwoWayEdegs("A", "C", 2);
g.addTwoWayEdegs("B", "D", 4);
g.addTwoWayEdegs("C", "D", 7);

// Graph ka structure print karo
console.log("All Nodes:", g.getNode());

console.log("Neighbors of A:", g.getNeighbourNodes("A"));
console.log("Neighbors of B:", g.getNeighbourNodes("B"));
console.log("Neighbors of C:", g.getNeighbourNodes("C"));
console.log("Neighbors of D:", g.getNeighbourNodes("D"));