class graph2 {
    constructor(){
        this.adj = new Map();
    }

    // add nodes
    addNode(node){
        if(!this.adj.has(node)){
            this.adj.set(node, [])
        }
    }

    // Undirected Weighted Edges 
    addEdges(a,b,weight){
        this.addNode(a);
        this.addNode(b);
        
        this.adj.get(a).push({to: a, weight})
        this.adj.get(b).push({to: b, weight})
    }

    print(){
        console.log(this.adj)
    }
}

module.exports = graph2