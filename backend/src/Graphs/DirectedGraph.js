class graph1 {
    constructor() {
        this.adj = new Map();
    };

    // Adds Nodes
    addNodes (node) {
        if(!this.adj.has(node)){
            this.adj.set(node,[])
        }
    }

    // Directed Graph
    addEdge(from, to){
       this.addNodes(from);
       this.addNodes(to);

       this.adj.get(from).push(to)
    }

    print(){
        console.log(this.adj)
    }
}

module.exports = graph1