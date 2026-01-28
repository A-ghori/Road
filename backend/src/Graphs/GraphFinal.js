class Graph{
    constructor(){
        this.adj = new Map();
    }
    addNode(node){
        if(!this.adj.has(node)){
            this.adj.set(node , [])
        }
    }
    addEdge(from,to,weight){
        this.addNode(from)
        this.addNode(to)
        this.adj.get(from).push({to, weight})
    }
    addTwoWayEdge(a,b,weight){
        this.addEdge(a,b,weight);
        this.addEdge(b,a,weight);
    }
    getNeighbours(node){
        return this.adj.get(node) || [];
    }
    getNode(){
        return [...this.adj.keys()]
    }
}
module.exports = {
    Graph
};