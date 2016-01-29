
var w = 635,
    h = 357, 
    margin = {top: 10, right: 10, bottom: 10, left: 10},
    centered;

var projection = d3.geo.mercator()
								   .center([ 20, 30 ])
								   .translate([ w/2, h/2 ])
								   .scale([ w/1.4 ]);

var path = d3.geo.path()
							 .projection(projection);

var svg = d3.select("#carte")
    .attr("viewBox", [
        margin.left,
        margin.top,
        (w+margin.left),
        (h+margin.bottom)
      ].join(" "))

// var cols = {
//   1 : "#99d8c9",
//   2 : "#fee8c8",
//   3 : "#fdbb84",
//   4 : "#e34a33",
//   5 : "#d8b365",
// };

// var color = function(name) { return cols.niveau; };

var color = d3.scale.ordinal()
  .range(["#99d8c9","#fee8c8","#fdbb84","#e34a33","#6d6d6d"]);

var g = svg.append("g");

d3.csv("data/data.csv", function(data) {

  color.domain(["1","2","3","4","5"])

  d3.json("data/carte.json", function(json) {

          //Merge the CO2 data and GeoJSON into a single array
          //
          //Loop through once for each CO2 data value
          for (var i = 0; i < data.length; i++) {
        
            //Grab country name (.countryCode est le nom de la colonne dans le csv)
            var dataCountryName = data[i].pays_en;
            
            //Grab data value, and convert from string to float
            var dataValue = +data[i].niveau;
            var pays = data[i].pays;
        
            //Find the corresponding country inside the GeoJSON
            for (var j = 0; j < json.features.length; j++) {
            
              //We'll check the official ISO country code
              var jsonCountryName = json.features[j].properties.name;
        
              if (dataCountryName == jsonCountryName) {
            
                //Copy the data value into the GeoJSON
                json.features[j].properties.niveau = dataValue;
                json.features[j].properties.pays = pays;
                
                //Stop looking through the JSON
                break;

              }
            }   
          }

					g.selectAll("path")
					   .data(json.features)
					   .enter()
					   .append("path")
					   .attr("d", path)
             .style("fill", function(d) {
              var value = d.properties.niveau;
              if (value) {return color(value);}
              else {return "#ccc";}
            })
            .style("opacity", function(d) {
              var value = d.properties.niveau;
              if (value) {return "opacity", .8;}
              else {return "opacity", .4;}
            }) 
             // .style("fill", function(d) { return color(d.niveau); })
             .style("stroke-width", "1px")
              .style("stroke", "#fff");

          g.selectAll(".subunit-label")
              .data(json.features)
              .enter().append("text")
              .attr("class", function(d) { return "subunit-label " + d.id; })
              .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
              .attr("dy", ".35em")
              .text(function(d) { return d.properties.pays; });    

// var tip = d3.tip()
//   .attr('class', 'd3-tip')
//   .offset([-5, 0])
//   .html(function(d) {
//     return "<span class='data'>" + d.pays + "</span><br/><p>" + d.cas + " cas" + "<br/>" + d.morts + " morts</p>" ;
//   })
//   g.call(tip);

          });
          });

//Légende

var ordinal = d3.scale.ordinal()
  .domain(["Démocratie", "Autocratie / Démocratie restreinte", "Autocratie complète", "État en faillite", "Pays non arabe"])
  .range(["#99d8c9","#fee8c8","#fdbb84","#e34a33","#6d6d6d"]);

g.append("g")
  .attr("class", "legendOrdinal")
  .attr("transform", "translate(20,20)");

var legendOrdinal = d3.legend.color()
  .shape("path", d3.svg.symbol().type("circle").size(150)())
  .shapePadding(5)
  // .orient(horizontal)
  .scale(ordinal);

d3.select("#legende")  .attr("font-size", "11px").call(legendOrdinal)
