// First Making Priority Queue

class PriorityQueue {
    constructor() {
        this.items = []
    }

    // Enqueue 
    Enque(node, priority) {
   
        this.items.push({ node, priority });

        this.items.sort((a, b) => a.priority - b.priority);
    }

    deque() {
        return this.items.shift()
    }

    isEmpty() {
        return this.items.length === 0;
    }
}

// Then the Dijkstra algo 
function Djistras(graph, start) {
    const previous = {};
    const distance = {};
    const pq = new PriorityQueue();

    for (let node in graph) {
        distance[node] = Infinity
        previous[node] = null;
    }

    distance[start] = 0;
    pq.Enque(start, 0)

  
    while (!pq.isEmpty()) {

        let item = pq.deque();
        let current = item.node;

        // Edge Relaxation
        for (let neighbour in graph[current]) {

            let alt = distance[current] + graph[current][neighbour]; // graph[current][neighbour] = weight

            if (alt < distance[neighbour]) {
                distance[neighbour] = alt;
                previous[neighbour] = current;
                pq.Enque(neighbour, alt)
            }
        }
    }

    return {
        distance,
        previous
    }
}


const graph = {
    // A: { B: 2, C: 4 },
    // B: { C: 1, D: 7 },
    // C: { D: 3 },
    // D: {}

A: {B: 2, D: 4},
B: {C: 5},
D: {E: 6},
C: {G:7, F: 9},
E: {F: 1},
F: {G: 3},
G: {}


};

console.log(Djistras(graph, "A"));
