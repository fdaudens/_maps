
var w = 635,
    h = 357, 
    margin = {top: 10, right: 10, bottom: 10, left: 10},
    centered;

var projection = d3.geo.mercator()
								   .center([ -5, 12 ])
								   .translate([ w/2, h/2 ])
								   .scale([ w*2 ]);

var path = d3.geo.path()
							 .projection(projection);

var svg = d3.select("#carte")
    .attr("viewBox", [
        margin.left,
        margin.top,
        (w+margin.left),
        (h+margin.bottom)
      ].join(" "))

var g = svg.append("g");

d3.json("data/carte.json", function(json) {

					//Bind data and create one path per GeoJSON feature
					g.selectAll("path")
					   .data(json.features)
					   .enter()
					   .append("path")
					   .attr("d", path)
					   .style("fill", "#bebebe")
             .style("stroke-width", "1px")
              .style("stroke", "#fff");

          g.selectAll(".subunit-label")
              .data(json.features)
              .enter().append("text")
              .attr("class", function(d) { return "subunit-label " + d.id; })
              .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
              .attr("dy", ".35em")
              .text(function(d) { return d.properties.formal_fr; });    

          d3.csv("data/data.csv", function(data) {

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-5, 0])
  .html(function(d) {
    return "<span class='data'>" + d.pays + "</span><br/><p>" + d.cas + " cas" + "<br/>" + d.morts + " morts</p>" ;
  })
  g.call(tip);
            
          svg.selectAll("circle")
               .data(data)
               .enter()
               .append("circle")
               .attr("cx", function(d) {
                 return projection([d.longitude, d.latitude])[0];
               })
               .attr("cy", function(d) {
                 return projection([d.longitude, d.latitude])[1];
               })
               .attr("r", function(d) {
                   //Use Math.sqrt to scale by area (not radius)
                 return Math.sqrt(+d.cas/5 );
               })
               .style("fill", "#6d6d6d")
               .style("opacity", .5)
                              .on('mouseover', function(d, i) {
                 tip.show(d,i)
                .style("top", (80)+"px")
                .style("left",(0)+"px");
        })
              .on('mouseout',  function(d, i) {
                tip.hide(d,i);
        });   
            
                       //Create a circle for each city
            svg.selectAll("circle2")
               .data(data)
               .enter()
               .append("circle")
               .attr("cx", function(d) {
                 return projection([d.longitude, d.latitude])[0];
               })
               .attr("cy", function(d) {
                 return projection([d.longitude, d.latitude])[1];
               })
               .attr("r", function(d) {
                   //Use Math.sqrt to scale by area (not radius)
                 return Math.sqrt(+d.morts / 5);
               })
               .style("fill", "#cc0000")
               .style("opacity", .8)
               .on('mouseover', function(d, i) {
                 tip.show(d,i)
                .style("top", (80)+"px")
                .style("left",(0)+"px");
        })
              .on('mouseout',  function(d, i) {
                tip.hide(d,i);
        });

          });
          });

//Légende

var ordinal = d3.scale.ordinal()
  .domain(["Morts", "Cas"])
  .range([ "#cc0000", "#6d6d6d"]);

g.append("g")
  .attr("class", "legendOrdinal")
  .attr("transform", "translate(20,20)");

var legendOrdinal = d3.legend.color()
  .shape("path", d3.svg.symbol().type("circle").size(150)())
  .shapePadding(10)
  .scale(ordinal);

d3.select("#legende")  .attr("font-size", "11px").call(legendOrdinal)
