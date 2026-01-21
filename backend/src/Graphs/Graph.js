// Graph = Nodes(A,B,C,D)
// Edges = (A-> B -> C -> D)
// Each Edge can carry a weight cost, distance, score


// This class i use an adjacency list
class Graph{
    constructor() {
        this.adj = new Map(); // node -> [ {to, weight} ]
        // this.adj = new Map() is our graph storage
        // Structure A => [ { to :"B" , weight : 2}, {to : "C" , weight:3}]
                    //  B => [ { to : "A" , weigth : 4} ] Meaning is that we can travel A->B and C

    }

    addNode(node) {
        if(!this.adj.has(node)){
            this.adj.set(node,[])
        }
    }

    addEdge(from,to,weight = 1){
        this.addNode(from);
        this.addNode(to);
        this.adj.get(from).push({to, weight})
    }

    // Add Two Way Edges 
    addTwoWayEdegs(a,b,weight = 1){
        this.addEdge(a,b,weight);
        this.addEdge(b,a,weight)
    }

    // Get Neighbours Node
    getNeighbourNodes(node){
        return this.adj.get(node) || [];
    }

    // Get Node (in graph which nodes exist)

    getNode() {
        return [...this.adj.keys()]
    }
}

module.exports = Graph;
