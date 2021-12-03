export default class Dijkstra {
  constructor(map) {
    this.map = map;
  }
  extractKeys(obj) {
    let keys = [];
    Object.keys(obj).forEach(key => keys.push(key))
    return keys;
  }

  sorter(a, b) {
    return parseFloat(a) - parseFloat(b);
  }

  findPaths(start, end) {
    let costs = {},
      open = {
        '0': [start]
      },
      predecessors = {},
      keys;


    const addToOpen = function (cost, vertex) {
      const key = "" + cost;
      if (!open[key]) open[key] = [];
      open[key].push(vertex);
    };

    costs[start] = 0;

    while (open) {
      if (!(keys = this.extractKeys(open)).length) break;
      keys.sort(this.sorter);

      const key = keys[0],
        bucket = open[key],
        node = bucket.shift(),
        currentCost = parseFloat(key),
        adjacentNodes = this.map[node] || {};


      if (!bucket.length) delete open[key];

      for (const vertex in adjacentNodes) {
        if (adjacentNodes.hasOwnProperty(vertex)) {
          const cost = adjacentNodes[vertex],
            totalCost = cost + currentCost,
            vertexCost = costs[vertex];

          if ((vertexCost === undefined) || (vertexCost > totalCost)) {
            costs[vertex] = totalCost;
            addToOpen(totalCost, vertex);
            predecessors[vertex] = node;
          }
        }
      }
    }
    if (costs[end] === undefined) {
      return null;
    } else {
      return predecessors;
    }

  }

  extractShortest(predecessors, end) {
    let nodes = [],
      u = end;

    while (u !== undefined) {
      nodes.push(u);
      u = predecessors[u];
    }

    nodes.reverse();
    return nodes;
  }

  findShortestPath(nodes) {
    let start = nodes.shift(),
      end,
      predecessors,
      path = [],
      shortest;

    while (nodes.length) {
      end = nodes.shift();
      predecessors = this.findPaths(start, end);
      if (predecessors) {
        shortest = this.extractShortest(predecessors, end);
        if (nodes.length) {
          path.push.apply(path, shortest.slice(0, -1));
        } else {
          return path.concat(shortest);
        }
      } else {
        return null;
      }

      start = end;
    }
  }

}