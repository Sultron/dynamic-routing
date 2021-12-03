import "./style.css"; // Custom css
import Dijkstra from "./dijkstra"; // Path algorithm
//import G6 from "@antv/g6"; // Graph 

import happyRouter from './happy-router.png';
import deadRouter from './dead-router3.png';


// Header
document.querySelector("#app").innerHTML = `
  <h1>Dynamic Routing Mechanism Design</h1>
  <h2>in Faulty Network</h2>
`;

function randNum() { // generate a random number
  return Math.floor(Math.random() * 10) + 1;
}

function assignRandomCosts(size) {
  return Array.from({
    length: size
  }, () => Math.floor(Math.random() * 10) + 1);
}

function generateRoutingTable(data, source) { // Build the routing table

  document.getElementById("sourceNodeTitle").innerHTML = `<strong>Router ${source.replace( /^\D+/g, '')}</strong>`;
  let map = {};

  let badNodes = {};

  let routings = [];

  for (let node of data.nodes) {
    badNodes[node.id] = node.img === deadRouter; //Store good and bad routers for later
    routings.push(node.id);
  }

  for (let edge of data.edges) {


    if (badNodes[edge.source] || badNodes[edge.target]) { // Skip bad router
      continue;
    }



    if (edge.label !== "X") { // Exclude faulty link


      map[edge.source] = Object.assign({
          [edge.target]: edge.label
        },
        map[edge.source]
      );

      map[edge.target] = Object.assign({
          [edge.source]: edge.label
        },
        map[edge.target]
      );
    }

  }


  let network = new Dijkstra(map); // Create an instance of Dijstra

  var table = document.getElementById("tableBody");

  table.innerHTML = "";

  for (let target of routings) {
    let nodes = network.findShortestPath([source, target]); // Get optimal network path

    if (!nodes) { // Ignore empty nodes
      continue;
    }

    let costs = [];

    for (let i = 0; i < nodes.length - 1; i++) {
      if (map[nodes[i]][nodes[i + 1]]) {
        costs.push(map[nodes[i]][nodes[i + 1]]);
      }
    }

    nodes = nodes.join().match(/\d+/g).map(x => 'Router ' + x);


    // Update table

    let row = table.insertRow();
    let cell1Destination = row.insertCell();
    let cell2NextHop = row.insertCell();
    let cell3Metric = row.insertCell();


    cell1Destination.innerHTML = nodes[nodes.length - 1];
    cell2NextHop.innerHTML = nodes.length > 1 ? nodes[1] : nodes[0];
    cell3Metric.innerHTML = costs.reduce((a, b) => a + b, 0);


  }









}

//Figure out browser size automatically
var viewportwidth;
var viewportheight;

reportWindowSize();


function reportWindowSize() {

  // the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight

  if (typeof window.innerWidth != 'undefined') {
    viewportwidth = window.innerWidth,
      viewportheight = window.innerHeight
  }

  // IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
  else if (typeof document.documentElement != 'undefined' &&
    typeof document.documentElement.clientWidth !=
    'undefined' && document.documentElement.clientWidth != 0) {
    viewportwidth = document.documentElement.clientWidth,
      viewportheight = document.documentElement.clientHeight
  }

  // older versions of IE
  else {
    viewportwidth = document.getElementsByTagName('body')[0].clientWidth,
      viewportheight = document.getElementsByTagName('body')[0].clientHeight
  }


}

window.addEventListener('resize', reportWindowSize);




const lineDash = [4, 2, 1, 2];

G6.registerEdge(
  'line-dash', {
    afterDraw(cfg, group) {
      // get the first shape in the group, it is the edge's path here=
      const shape = group.get('children')[0];
      let index = 0;
      // Define the animation
      shape.animate(
        () => {
          index++;
          if (index > 9) {
            index = 0;
          }
          const res = {
            lineDash,
            lineDashOffset: -index,
          };
          // returns the modified configurations here, lineDash and lineDashOffset here
          return res;
        }, {
          repeat: true, // whether executes the animation repeatly
          duration: 3000, // the duration for executing once
        },
      );
    },
  },
  'cubic', // extend the built-in edge 'cubic'
);


G6.registerEdge(
  "circle-running", {
    afterDraw(cfg, group) {
      // Get the first graphics shape of this type of edge, which is the edge's path
      const shape = group.get("children")[0];
      // The start point of the edge's path
      const startPoint = shape.getPoint(0);

      // Add a red circle shape
      const circle = group.addShape("circle", {
        attrs: {
          x: startPoint.x,
          y: startPoint.y,
          fill: "red",
          r: 3
        },
        // must be assigned in G6 3.3 and later versions. it can be any value you want
        name: "circle-shape"
      });

      // Add the animation to the red circle
      circle.animate(
        ratio => {
          // Returns the properties for each frame. The input parameter ratio is a number that range from 0 to 1. The return value is an object that defines the properties for this frame
          // Get the position on the edge according to the ratio
          const tmpPoint = shape.getPoint(ratio);
          // Return the properties of this frame, x and y for this demo
          return {
            x: tmpPoint.x,
            y: tmpPoint.y
          };
        }, {
          repeat: true, // Play the animation repeatly
          duration: 3000 // The duration for one animation
        }
      );
    }
  },
  "cubic"
); // Extend the built-in edge cubic

const tooltip = new G6.Tooltip({
  offsetX: 10,
  offsetY: 10,
  fixToNode: [1, 0.5],
  // the types of items that allow the tooltip show up

  itemTypes: ["node", "edge"],
  // custom the tooltip's content
  getContent: e => {
    const outDiv = document.createElement("div");
    outDiv.style.width = "fit-content";
    outDiv.style.height = "fit-content";
    const model = e.item.getModel();

    if (e.item.getType() === "node") {
      const edges = e.item._cfg.edges.filter(edge => !excludeNodes[edge._cfg.id]).length;


      outDiv.innerHTML = `${
        edges > 1 ? `${edges} network paths` : `${edges} network path`
      }`;
    } else {
      const source = e.item.getSource();
      const target = e.item.getTarget();

      outDiv.innerHTML = `<table>
      <tr>
        <th>Connection</th>
        <th>Cost</th>
      </tr>
      <tr>
        <td>${source.getModel().label} <br/>  ${target.getModel().label}</td>
        <td>${e.item.getModel().label}</td>
      </tr>
    </table>`;
    }
    return outDiv;
  }
});

var excludeNodes = {};

const graph = new G6.Graph({
  container: "mountNode", // String | HTMLElement, required, the id of DOM element or an HTML node
  width: viewportwidth, // Number, required, the width of the graph
  height: viewportheight, // Number, required, the height of the graph
  animate: true,
  fitView: true,
  //fitCenter: true,
  plugins: [tooltip],
  modes: {
    default: ['drag-canvas'],
  },
  defaultEdge: {
    //type: "circle-running",
    type: 'cubic',
    style: {
      lineWidth: 2,
      stroke: "#bae7ff"
    }
  },
  defaultNode: {
    type: "image",
    img: happyRouter,
    label: "AntV Team",
    size: 40
  }
});

const yShift = 100; // Shift canvas in the y component 

const data = {
  // The array of nodes
  nodes: [{
      id: "node1", // String, unique and required
      label: "Router 1",
      x: 127 / 1.25, // Number, the x coordinate
      y: (558 - yShift) / 1.25 // Number, the y coordinate
    },
    {
      id: "node2", // String, unique and required
      label: "Router 2",
      x: 187 / 1.25, // Number, the x coordinate
      y: (389 - yShift) / 1.25 // Number, the y coordinate
    },
    {
      id: "node3", // String, unique and required
      label: "Router 3",
      x: 273 / 1.25, // Number, the x coordinate
      y: (249 - yShift) / 1.25 // Number, the y coordinate
    },
    {
      id: "node4", // String, unique and required
      label: "Router 4",
      x: 498 / 1.25, // Number, the x coordinate
      y: (217 - yShift) / 1.25 // Number, the y coordinate
    },
    {
      id: "node5", // String, unique and required
      label: "Router 5",
      x: 711 / 1.25, // Number, the x coordinate
      y: (160 - yShift) / 1.25 // Number, the y coordinate
    },
    {
      id: "node6", // String, unique and required
      label: "Router 6",
      x: 420 / 1.25, // Number, the x coordinate
      y: (404 - yShift) / 1.25 // Number, the y coordinate
    },
    {
      id: "node7", // String, unique and required
      label: "Router 7",
      x: 415 / 1.25, // Number, the x coordinate
      y: (570 - yShift) / 1.25 // Number, the y coordinate
    },
    {
      id: "node8", // String, unique and required
      label: "Router 8",
      x: 611 / 1.25, // Number, the x coordinate
      y: (521 - yShift) / 1.25 // Number, the y coordinate
    },
    {
      id: "node9", // String, unique and required
      label: "Router 9",
      x: 689 / 1.25, // Number, the x coordinate
      y: (372 - yShift) / 1.25 // Number, the y coordinate
    },
    {
      id: "node10", // String, unique and required
      label: "Router 10",
      x: 902 / 1.25, // Number, the x coordinate
      y: (525 - yShift) / 1.25 // Number, the y coordinate
    },
    {
      id: "node11", // String, unique and required
      label: "Router 11",
      x: 1080 / 1.25, // Number, the x coordinate
      y: (396 - yShift) / 1.25 // Number, the y coordinate
    },
    {
      id: "node12", // String, unique and required
      label: "Router 12",
      x: 1313 / 1.25, // Number, the x coordinate
      y: (495 - yShift) / 1.25 // Number, the y coordinate
    },
    {
      id: "node13", // String, unique and required
      label: "Router 13",
      x: 1223 / 1.25, // Number, the x coordinate
      y: (647 - yShift) / 1.25 // Number, the y coordinate
    },
    {
      id: "node14", // String, unique and required
      label: "Router 14",
      x: 1435 / 1.25, // Number, the x coordinate
      y: (676 - yShift) / 1.25 // Number, the y coordinate
    },
    {
      id: "node15", // String, unique and required
      label: "Router 15",
      x: 1506 / 1.25, // Number, the x coordinate
      y: (484 - yShift) / 1.25 // Number, the y coordinate
    },
    {
      id: "node16", // String, unique and required
      label: "Router 16",
      x: 1399 / 1.25, // Number, the x coordinate
      y: (299 - yShift) / 1.25 // Number, the y coordinate
    }
  ],
  // The array of edges
  edges: [{
      id: "nodes1&2",
      label: randNum(),
      source: "node1", // String, required, the id of the source node
      target: "node2" // String, required, the id of the target node
    },
    {
      id: "nodes2&3",
      label: randNum(),
      source: "node2",
      target: "node3"
    },
    {
      id: "nodes2&6",
      label: randNum(),
      source: "node2",
      target: "node6"
    },
    {
      id: "nodes3&4",
      label: randNum(),
      source: "node3",
      target: "node4"
    },
    {
      id: "nodes4&5",
      label: randNum(),
      source: "node4",
      target: "node5"
    },
    {
      id: "nodes5&16",
      label: randNum(),
      source: "node5",
      target: "node16"
    },
    {
      id: "nodes6&4",
      label: randNum(),
      source: "node6",
      target: "node4"
    },
    {
      id: "nodes6&7",
      label: randNum(),
      source: "node6",
      target: "node7"
    },
    {
      id: "nodes6&9",
      label: randNum(),
      source: "node6",
      target: "node9"
    },
    {
      id: "nodes7&8",
      label: randNum(),
      source: "node7",
      target: "node8"
    },
    {
      id: "nodes8&9",
      label: randNum(),
      source: "node8",
      target: "node9"
    },
    {
      id: "nodes9&10",
      label: randNum(),
      source: "node9",
      target: "node10"
    },
    {
      id: "nodes10&11",
      label: randNum(),
      source: "node10",
      target: "node11"
    },
    {
      id: "nodes11&12",
      label: randNum(),
      source: "node11",
      target: "node12"
    },
    {
      id: "nodes11&13",
      label: randNum(),
      source: "node11",
      target: "node13"
    },
    {
      id: "nodes12&13",
      label: randNum(),
      source: "node12",
      target: "node13"
    },
    {
      id: "nodes12&14",
      label: randNum(),
      source: "node12",
      target: "node14"
    },
    {
      id: "nodes12&15",
      label: randNum(),
      source: "node12",
      target: "node15"
    },
    {
      id: "nodes12&16",
      label: randNum(),
      source: "node12",
      target: "node16"
    },
    {
      id: "nodes13&14",
      label: randNum(),
      source: "node13",
      target: "node14"
    },
    {
      id: "nodes14&15",
      label: randNum(),
      source: "node14",
      target: "node15"
    },
    {
      id: "nodes15&16",
      label: randNum(),
      source: "node15",
      target: "node16"
    }
  ]
};



//let costs = assignRandomCosts(22);



function clearAllStats() {
  graph.setAutoPaint(false);
  /*
  graph.getNodes().forEach(function(node) {
    graph.clearItemStates(node);
  });
  */
  graph.getEdges().forEach(function (edge) {
    if (!edge.destroyed) {
      graph.clearItemStates(edge);
    }
  });
  graph.paint();
  graph.setAutoPaint(true);
}




//when user clicks a edge, show modal 
graph.on("edge:click", (evt) => {

  let myModal = new bootstrap.Modal(document.getElementById('edgeCost'), {
    keyboard: false
  });

  document.getElementById('cost-value').value = evt.item.getModel().label;

  document.getElementById('edgeInfoMsg').textContent = `Update the cost link between Router ${evt.item.getModel().source.replace( /^\D+/g, '')} and Router ${evt.item.getModel().target.replace( /^\D+/g, '')}. Enter '-1' for a faulty link.`;

  document.getElementById('edgeCostBtn').addEventListener('click', () => {

    let cost = document.getElementById('cost-value').value;
    //alert(cost)
    let model = {};

    if ((cost >> 0) === -1) {


      model = {
        label: 'X',
        /*
        style: {
          lineWidth: 2,
          stroke: "#DC143C"
        }
        */

      };

    } else {

      model = {
        label: Math.abs((cost >> 0))
        /*
        style: {
          lineWidth: 2,
          stroke: "#696969"
        }
        */
      };

    }

    evt.item.update(model);


    myModal.hide();

    let values = getOptionValues();
    let sourceValue = values[0].value;
    let targetValue = values[1].value;
    run(graph.save(), sourceValue, targetValue);

  }, {
    once: true
  });

  myModal.show();


  //evt.item.destroy();
  //let data = graph.save();
  //let map = collectEdges(data);
  //calculatePath(data, map, graph);

})


//Show tutorial when user clicks the tutorial button
document.getElementById("tutorialBtn").addEventListener("click", () => {
  introJs().setOptions({
    steps: [{
        element: document.querySelector("#app"),
        intro: 'This design closely follows a link-state routing protocol, so each router knows about their neighbors.',
        position: 'right'
      },
      {
        element: document.querySelector("#app"),
        intro: `There are 2 phases:<br>
        <ol>
        <li>Each router communicates to all other routers about their local topology by means of <strong>realiable flooding</strong></li>
        <li>Each router computes the best path to take using some algorithm such as Dijkstraʼs algorithm</li>
        </ol> 
        `,
        position: 'left'
      },
      {
        element: document.querySelector('#sourceSelect'),
        intro: 'This is where you select the source router to send the packets.',
        position: 'bottom'
      },
      {
        element: document.querySelector('#targetSelect'),
        intro: 'This is where you select the target router to receive the packets.',
        position: 'top'
      },
      {
        element: document.querySelector('#toggleRT'),
        intro: 'This is the routing information base (RIB). It\'s a set of rules that determines where packets should be sent.',
        position: 'top'
      },
      {
        element: document.querySelector('#toggleRT'),
        intro: 'Clicking this will reveal the routing table.',
        position: 'top'
      },
      {
        element: document.querySelector('canvas'),
        intro: 'This is the interactive mesh network.',
        position: 'left'
      },
      {
        element: document.querySelector('canvas'),
        intro: 'To update a link cost, click the link/edge and set a new cost',
        position: 'right'
      },
      {
        element: document.querySelector('canvas'),
        intro: 'To destroy a link, click the link/edge and set the cost to -1',
        position: 'right'
      },
      {
        element: document.querySelector('canvas'),
        intro: 'To destroy a router, click the router.',
        position: 'left'
      },
      {
        element: document.querySelector('canvas'),
        intro: 'To restore a router, click the router again.',
        position: 'left'
      },
      {
        element: document.querySelector('canvas'),
        intro: 'The packets may be rerouted for the next best path possible using Dijkstra\'s algorithm',
        position: 'right'
      },



    ]
  }).start();
})


// when user clicks a router, set router good or bad state
graph.on("node:click", (evt) => {

  const model = evt.item.getModel().img === happyRouter ? {
    type: "image",
    img: deadRouter,
    size: 40
  } : {
    type: "image",
    img: happyRouter,
    size: 40
  };

  //console.log(evt.item.getModel().img)
  evt.item.update(model)
  //console.log(evt.item.getEdges())

  let values = getOptionValues();
  let sourceValue = values[0].value;
  let targetValue = values[1].value;
  let data = graph.save();
  generateRoutingTable(data, sourceValue);
  run(data, sourceValue, targetValue);




})



// Highlight edges 
graph.on("node:mouseenter", function (e) {
  const item = e.item;
  graph.setAutoPaint(false);
  /*
  graph.getNodes().forEach(function(node) {
    graph.clearItemStates(node);
    graph.setItemState(node, "dark", true);
  });
  */
  //graph.setItemState(item, "dark", false);
  graph.setItemState(item, "highlight", true);
  graph.getEdges().forEach(function (edge) {

    if (!edge.destroyed && edge.getSource() === item) {
      //graph.setItemState(edge.getTarget(), "dark", false);
      graph.setItemState(edge.getTarget(), "highlight", true);
      graph.setItemState(edge, "highlight", true);
      edge.toFront();
    } else if (!edge.destroyed && edge.getTarget() === item) {
      //graph.setItemState(edge.getSource(), "dark", false);
      graph.setItemState(edge.getSource(), "highlight", true);
      graph.setItemState(edge, "highlight", true);
      edge.toFront();
    } else if (!edge.destroyed) {
      graph.setItemState(edge, "highlight", false);
    }
  });
  graph.paint();
  graph.setAutoPaint(true);
});
graph.on("node:mouseleave", clearAllStats);
graph.on("canvas:click", clearAllStats);

graph.data(data); // Load the data 
graph.render(); // Render the graph


// Get the values from the dropdown inputs
function getOptionValues() {
  let source = document.getElementById('sourceSelect');
  let target = document.getElementById('targetSelect');

  let sourceValue = source.options[source.selectedIndex];
  let targetValue = target.options[target.selectedIndex];

  return [sourceValue, targetValue];
}


// Show or hide routing table
document.getElementById('toggleRT').addEventListener('click', function (evt) {
  if (document.getElementById('toggleRT').innerText === "Show Routing Table") {
    document.getElementById('toggleRT').innerHTML = "Hide Routing Table";
  } else {
    document.getElementById('toggleRT').innerHTML = "Show Routing Table";
  }

});


// Re run when user selects a new source
document.getElementsByClassName('form-select')[0].addEventListener('change', function () { //Source node
  let values = getOptionValues();
  let sourceValue = values[0].value;
  let targetValue = values[1].value;

  generateRoutingTable(data, sourceValue)
  run(data, sourceValue, targetValue);
});

// Re run when user selects a new target
document.getElementsByClassName('form-select')[1].addEventListener('change', function () { //Target node
  let values = getOptionValues();
  let sourceValue = values[0].value;
  let targetValue = values[1].value;
  run(data, sourceValue, targetValue);
});


run(data); // Run default 

generateRoutingTable(data, "node1"); // Generate default routing table

// main funciton 
function run(data, source = 'node1', target = 'node14') {



  let map = {}; // store route options to be used for dijkstra's algorithm 

  let badNodes = {}; // Collection of bad routers 

  excludeNodes = {}; // Used for the routing table

  let sourceSelect = document.getElementById('sourceSelect');
  let targetSelect = document.getElementById('targetSelect');

  sourceSelect.innerHTML = "";
  targetSelect.innerHTML = "";

  for (let node of data.nodes) {

    badNodes[node.id] = node.img === deadRouter;
    let sourceOpt = document.createElement('option');
    let targetOpt = document.createElement('option');
    sourceOpt.value = node.id;
    sourceOpt.innerText = node.label;
    sourceOpt.selected = node.id === source;
    //opt.disabled = node.id === source;
    targetOpt.value = node.id;
    targetOpt.innerText = node.label;
    targetOpt.selected = node.id === target;

    sourceSelect.appendChild(sourceOpt);
    targetSelect.appendChild(targetOpt);

  }


  for (let edge of data.edges) {
    //console.log(edge.source);

    //edge.type = "cubic";
    //edge.style.stroke = "#bae7ff";


    graph.updateItem(edge.id, {
      // The node style
      type: "cubic",
      style: {
        stroke: '#bae7ff',
      },
    });

    if (badNodes[edge.source] || badNodes[edge.target]) { // Skip bad router
      excludeNodes[edge.id] = true;
      continue;
    }
    excludeNodes[edge.id] = false;


    //console.log(edge)

    if (edge.label !== "X") { // Exclude faulty link


      map[edge.source] = Object.assign({
          [edge.target]: edge.label
        },
        map[edge.source]
      );

      map[edge.target] = Object.assign({
          [edge.source]: edge.label
        },
        map[edge.target]
      );
    }

  }


  let network = new Dijkstra(map);

  let nodes = network.findShortestPath([source, target]);

  let routings = [];

  if (nodes == null) {

    let toastLiveExample = document.getElementById('liveToast')

    document.getElementById('toast-msg').textContent = `Cannot send packets from Router ${source.replace( /^\D+/g, '')} to Router ${target.replace( /^\D+/g, '')}.`;

    let toast = new bootstrap.Toast(toastLiveExample);

    toast.show();
    return;
  }
  if (nodes.length < 2) {
    let toastLiveExample = document.getElementById('liveToast2')

    document.getElementById('toast-msg2').textContent = `Source router is the same as the target router.`;

    let toast = new bootstrap.Toast(toastLiveExample);

    toast.show();
  }

  for (let i = 0; i < nodes.length - 1; ++i) {
    routings.push({
      source: nodes[i],
      target: nodes[i + 1]
    });

    for (let edge of data.edges) {

      if ((edge.source === nodes[i] && edge.target === nodes[i + 1]) || (edge.source === nodes[i + 1] && edge.target === nodes[i])) {

        //(edge.source === nodes[i + 1] && edge.target === nodes[i]) ? [edge.source, edge.target] = [edge.target, edge.source] : null;

        if (edge.source === nodes[i + 1] && edge.target === nodes[i]) {
          [edge.source, edge.target] = [edge.target, edge.source];
          const model = {
            id: edge.id,
            source: edge.target,
            target: edge.source
          }

          //edge.update(model)
          graph.changeData(data);

        }
        //currentElement.type = "line-dash";
        (function (i, edge) {
          setTimeout(function () {
            //currentElement.type = "circle-running";
            //edge.type = "line-dash";
            //edge.style.stroke = '#6495ED';
            //graph.changeData(data);
            //console.log(edge)

            graph.updateItem(edge.id, {
              // The node style
              type: "line-dash",
              style: {
                stroke: '#6495ED',
              },
            });

          }, i * 700);

        }(i, edge));
      }

    }



    //console.log(newData, 'HELLO');

  }


}


//


/*
console.log(network.findShortestPath(['router1', 'router3']));
console.log(network.findShortestPath(['router2', 'router1']));
console.log(network.findShortestPath(['router2', 'router3', 'router2']));
console.log(network.findShortestPath(['router3', 'router1', 'router2']));
console.log(network.findShortestPath(['router3', 'router2', 'router1']));
*/