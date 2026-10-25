What is Valhalla?

Valhalla is an open-source routing engine that takes OpenStreetMap (OSM) data and builds a routing graph from it. At runtime, it receives locations and finds a path through that graph using routing algorithms and dynamic costing. 

What is Dynamic Costing -> 

Dynamic costing means Valhalla doesn't treat every road as having a fixed "cost." The cost of using a road can be calculated based on the routing request and current/contextual conditions.

Suppose Valhalla has two possible roads:

              Road A
        ┌────────────────┐
Start ──┤                ├── Destination
        └────────────────┘
             5 km
             10 min


              Road B
        ┌────────────────┐
Start ──┤                ├── Destination
        └────────────────┘
             7 km
             8 min


If you're using normal auto costing, Valhalla considers things such as travel time, road characteristics, speed, access restrictions, turn costs, etc.

So it may effectively calculate:

Cost(Road A) = travel-related cost + road/turn penalties
Cost(Road B) = travel-related cost + road/turn penalties
And choose the lower cost path

Why Dynamic ?

Because the cost isnot simply cost of using valhalla engine. This cost = distance 

It can depends on the request's costing options and conditions represented in the routing graph 

Ok so one more important thing you have to know about valhalla that is how the Cost will be caluculated in Vanhalla... They use Sif(calculate the cost) so the structure look like this 

             VALHALLA
                 │
     ┌───────────┼────────────┐
     ▼           ▼            ▼
  Mjolnir      Loki          Thor
  Build        Locate        Find path
  tiles        roads
     │           │            │
     └───────────┼────────────┘
                 │
                 ▼
                Sif
           Calculate cost
                 │
                 ▼
               Odin
          Directions/output

Sif's Job -> When Thor is searching through thousands of possible road edges, it need to ask : How expensive is it to travel through this road ?

Sif provides the costing logic 

For example -> 

Road A
────────────
distance = 2 km
speed = 40 km/h
penalty = low

        ↓

Sif → "Cost of this edge = X"

Another Road ->

Road B
────────────
distance = 3 km
speed = 20 km/h
penalty = high

        ↓

Sif → "Cost of this edge = Y"

Sif isn't really a standalone "server" or separate service that you run.

It's part of the Valhalla routing codebase, specifically the costing layer.

Thor = searches for the path
Sif = tells Thor how expensive each possible movement/road is



Now back to "Why Dynamic" ??

For example -> 
                    Sif
                     │
              ┌──────┴──────┐
              │ Costing     │
              │ calculation │
              └──────┬──────┘
                     │
       ┌─────────────┼─────────────┐
       ▼             ▼             ▼
   distance       speed        penalties
       │             │             │
       └─────────────┼─────────────┘
                     ▼
                Edge Cost
                     │
                     ▼
                   Thor
                pathfinding


My System Eventually Evolve on This Idea

Valhalla's existing costing
          +
Your road-damage cost
          +
Traffic cost
          +
Historical risk
          ↓
   YOUR ROUTE SCORE



For an Example -> 

Route Score =
    Travel Time
  + Distance Penalty
  + Traffic Penalty
  + Damage Penalty


So if:

Route A → 10 min, badly damaged roads
Route B → 12 min, good roads

My system could potentially decide that the extra 2 minutes is worth avoiding severe road damage.


Ok One More Important Thing That Is Tiles :

So what is Tiles ?? 

The .osm.pbf file is essentially the raw OSM input 

For example:

eastern-zone-260916.osm.pbf

contains OSM geographic information for the region.

Valhalla doesn't want to repeatedly process this raw PBF every time someone asks:

"Give me a route from A → B"

So during build time, Valhalla's Mjolnir tools convert the OSM PBF into routing graph tiles. Those tiles contain routing information such as road-network nodes, directed edges, restrictions and associated metadata.


