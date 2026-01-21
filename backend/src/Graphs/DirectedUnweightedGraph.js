// class graph3 {
//     constructor(){
//         this.adj = new Map();
//     }
// newNode(node){
//     if(this.adj.has(node)){
//         this.adj.set(node, [])
//     }
// }

// // add Directed With Unweighted 
// addEdges(from,to,weight){
// this.newNode(from)
// this.newNode(to)

// this.adj.get(from).push({to, weight})
// }

// print(){
//     console.log(this.adj)
// }
// }



// TRY WITH FUNCTIONS DEFINE

function createMyDirectedUnweightedGraph() {
    const adj = new Map();

// new node function
function newNode(node){
    if(!adj.has(node)){
        adj.set(node,[])
    }
}

function addEdge(from, to ){
newNode(from);
newNode(to);

adj.get(from).push({to})
}

function print (){
    console.log(adj)
}

function getAdj (){
    return adj
}

  return {
  newNode,
  addEdge,
  print,
  getAdj
  };
}




module.exports = createMyDirectedUnweightedGraph
