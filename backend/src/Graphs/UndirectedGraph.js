// Node or Vertex -> A-> B-> C-> D
//A -- B this is undirected where we go A to B similar B to A
const fs = require("fs");

class graph {
    constructor(){
        this.adj = new Map();
    }

    addNode(node){
        if(!this.adj.has(node)){
            this.adj.set(node, []);
        }
    }

    // Undirected Edge Add
    addUndirectedEdge(a,b) {
        this.addNode(a);
        this.addNode(b);

        this.adj.get(a).push(b);
        this.adj.get(b).push(a);
    }
    print(){
        console.log(this.adj)
    }
}
module.exports = graph
