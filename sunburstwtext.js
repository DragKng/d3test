var width = 700,
  height = 700,
  radius = Math.min(width, height) / 2,
  color = d3.scale.category20c();

var svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + width / 2 + "," + height * .52 + ")");

var partition = d3.layout.partition()
  .sort(null)
  .size([2 * Math.PI, radius * radius])
  .value(function(d) { return 1; });

var arc = d3.svg.arc()
  .startAngle(function(d) { return d.x; })
  .endAngle(function(d) { return d.x + d.dx; })
  .innerRadius(function(d) { return Math.sqrt(d.y); })
  .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });


//Removed for jsFiddle
d3.json("groupeddata.json", function(error, root) {

console.log(root);
var path = svg.datum(root).selectAll("path")
  .data(partition.nodes)
  .enter().append("g")

path.append("path")
  .attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
  .attr("d", arc)
  .style("stroke", "#fff")
  .style("fill", function(d) { return color((d.children ? d : d.parent).name); })
  .style("fill-rule", "evenodd")
  .each(stash);

path.append("text")
  .text(function(d) { console.log("Q", d.name); return d.name})
  .classed("label", true)
  .attr("x", function(d) { return d.x; })
  .attr("text-anchor", "middle")
  // translate to the desired point and set the rotation
  .attr("transform", function(d) {
    if (d.depth > 0) {
      return "translate(" + arc.centroid(d) + ")" +
        "rotate(" + getAngle(d) + ")";
    }  else {
      return null;
    }
  })
  .attr("dx", "6") // margin
  .attr("dy", ".35em"); // vertical-align.attr("pointer-events", "none")

});

function getAngle(d) {
  // Offset the angle by 90 deg since the '0' degree axis for arc is Y axis, while
  // for text it is the X axis.
  var thetaDeg = (180 / Math.PI * (arc.startAngle()(d) + arc.endAngle()(d)) / 2 - 90);
  // If we are rotating the text by more than 90 deg, then "flip" it.
  // This is why "text-anchor", "middle" is important, otherwise, this "flip" would
  // a little harder.
  return (thetaDeg > 90) ? thetaDeg - 180 : thetaDeg;
}

// Stash the old values for transition.
function stash(d) {
  d.x0 = d.x;
  d.dx0 = d.dx;
}

// Interpolate the arcs in data space.
function arcTween(a) {
  var i = d3.interpolate({x: a.x0, dx: a.dx0}, a);
  return function(t) {
    var b = i(t);
    a.x0 = b.x;
    a.dx0 = b.dx;
    return arc(b);
  };
}

d3.select(self.frameElement).style("height", height + "px");