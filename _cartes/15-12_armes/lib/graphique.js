var width = 635,
    height = 357,
    margin = {top: 10, right: 10, bottom: 10, left: 10},
    centered;

var color = d3.scale.quantize()
    .range(['#fee5d9','#fcae91','#fb6a4a','#de2d26','#a50f15']);

var projection = d3.geo.conicConformal()
    .scale(700)
    .center([7, 57.4])
    .rotate([100, 0])
  //  .parallels([50, 60])
    .translate([width / 2, height / 2]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("#carte")
    .attr("viewBox", [
        margin.left,
        margin.top,
        (width+margin.left),
        (height+margin.bottom)
      ].join(" "))

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", clicked);

var g = svg.append("g");

d3.csv ("data/data.csv", function(error, data) {

 if (error) throw error;

        color.domain([
          d3.min(data, function(d) { return +d.taux2015; }), 
          d3.max(data, function(d) { return +d.taux2015; })
        ]);

    //Load in GeoJSON data
d3.json("data/canada.json", function(json) {
         for (var i = 0; i < data.length; i++) {

            var province = data[i].code;
            
            var dataValue = +data[i].taux2015;
            var dataValue2 = data[i].taux2015.replace(".",",");
            var dataValue3 = +data[i].nb2015;

             for (var j = 0; j < json.features.length; j++) {
            
              var provincesJson = json.features[j].properties.code;
        
              if (province == provincesJson) {

                json.features[j].properties.taux2015 = dataValue;
                json.features[j].properties.taux2015Fr = dataValue2;
                json.features[j].properties.nb2015 = dataValue3;
                  
                  break;
                
              }
            }   
          }

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-5, 0])
  .html(function(d) {
    return "<span class='data'>" + d.properties.nom + "</span><br/><p>" + d.properties.taux2015Fr + " armes / 1000 habitants</p><br/><p>" + d.properties.nb2015 + " permis</p>" ;
  })
  g.call(tip);

  g.append("g")
      .attr("class", "pays")
    .selectAll("path")
      .data(json.features)
        .enter()
        .append("path")
          // .attr("opacity", ".7")
          .attr("opacity", function(d) {
              //Get data value
              var value = d.properties.taux2015;
              if (value) {
                //If value exists…
                return ".8";
              } else {
                //If value is undefined…
                return ".25";
              }
            })
          .attr("d", path)
          .style("fill", function(d) {
              //Get data value
              var value = d.properties.taux2015;
              if (value) {
                //If value exists…
                return color(value);
              } else {
                //If value is undefined…
                return "#bebebe";
              }
            })
            .on("click", clicked)
           .on('mouseover', function(d, i) {
      var value2 = d.properties.nb;
              if (value2 != 0) {
                //If value exists…
                 tip.show(d,i)
                .style("top", (100)+"px")
                .style("left",(0)+"px");
              } 
        })
              .on('mouseout',  function(d, i) {
                tip.hide(d,i);
        });

 
g.append("g")
  .attr("class", "legendLinear")
  .attr("transform", "translate(20,20)");

var legendLinear = d3.legend.color()
          .shapeWidth(15)
          .orient('vertical')
          .scale(color);

d3.select("#legende")  .attr("font-size", "11px").call(legendLinear)
    
});
})

d3.select(self.frameElement).style("height", height + "px");

function clicked(d) {
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
  }

  g.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  g.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
}