const { priorityQueue} = require("../Graphs/PriorityQueue");
const {Graph} = require("../Graphs/GraphFinal");

function dijstra(graph,start){
const distance = {};
const previous = {};

const pq = new priorityQueue();

for(let node of graph.getNode()){
    distance[node] = Infinity;
    previous[node]= null;
}
distance[start] = 0;
pq.enqueue(start, 0);

while(!pq.isEmpty()){
    let item = pq.dequeue();
    let current = item.node;

    for(let neighbour of graph.getNeighbours(current)){
        const alt = distance[current] + neighbour.weight;

        if(alt < distance[neighbour.to]){
            distance[neighbour.to] = alt;
            previous[neighbour.to] = current;
                pq.enqueue(neighbour.to, alt);
        }
    }
}

  return { distance, previous };
}

function getPath(previous, start, end) {
  const path = [];
  let curr = end;

  while (curr) {
    path.unshift(curr);
    curr = previous[curr];
  }

  if (path[0] !== start) return null;
  return path;
}

module.exports = { dijstra, getPath };