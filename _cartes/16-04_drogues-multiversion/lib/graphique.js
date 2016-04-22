
var width = 635,
    height = 357,
    margin = {top: 10, right: 10, bottom: 10, left: 10},
    centered;

var zoom = d3.behavior.zoom()
    .scaleExtent([1, 20])
    .on("zoom", zoomed);

var quantize = d3.scale.quantize()
    // .domain([0, 100])
    .range(d3.range(5).map(function(i) { return "q" + i + "-5"; }));

var projection = d3.geo.mercator()
               .center([5,35])
               .translate([ width/2, height/2 ])
               .scale([ width/6.2 ]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("#carte")
    .attr("viewBox", [
        margin.left,
        margin.top,
        (width+margin.left),
        (height+margin.bottom)
      ].join(" "))
      .call(zoom);

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height);
    // .on("click", clicked);

var g = svg.append("g");


// Filtres

  var categories = [("amphe","cannabis","cocaine","ecta","opio","sedatifs")];

  var dropDown = d3.select("#filtre")
            //.append("select") Désactiver si on spécifie nous-mêmes nos valeurs plus haut dans le dropdown
            .attr("name", "categories");


  var options = dropDown.selectAll("option")
           .data(["Tous"]
            .concat(categories))
           .enter()
           .append("option");

  options.text(function (d) { return d; })
       .attr("value", function (d) { return d; });


queue()
    .defer(d3.json, "data/pays.json")
    .defer(d3.csv, "data/drogues.csv")
    .await(ready);

function ready(error, carte, data) //définir nom de fonction qui va conditionner l'Appel geojson canada.objects....)
 {
  if (error) throw error;

var rateById = d3.map();

// TOOLTIP

// var format = d3.format(",%")

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-5, 0])
  .html(function(d) {

    return "<span class='data'>" + data.pays 
    + "</span><br/><p>Valeur : "
    + (rateById.get(d.id))
    + "</p>";
    
    // + "\t" 
    // + year.values + "</strong><br/><span style='color:#fff'>" + value.values + " députés élus"
  })
  g.call(tip);

// MAP  

  var paths = g.append("g")
      .attr("class", "counties")
    .selectAll("path")
      .data(topojson.feature(carte, carte.objects.countries).features)
    .enter()
    .append("path")
    .attr("opacity", function(d) { var value = d.id; // d.id étant dans le TOPOJSON
              if (value) {return ".8";}
              else { return ".1"; }
            })
      .attr("class", function(d) { 
          var value = d.id;
              if (value) {return quantize(rateById.get(d.id));
              } 
              else {return "#fff"; }
              }) 
      .attr("d", path)
        .on('mouseover', function(d, i) {
          var value2 = d.id;
              if (value2) { tip.show(d,i)
          .style("top", (100)+"px")
          .style("left",(0)+"px");
        }
        })
        .on('mouseout',  function(d, i) {
          tip.hide(d,i);
        });

  g.append("path")
      .datum(topojson.mesh(carte, carte.objects.countries, function(a, b) { return a !== b; }))
      .attr("class", "provinces")
      .attr("d", path);

  g.append("path")
      .datum(topojson.mesh(carte, carte.objects.countries, function(a, b) { return a === b; }))
      .attr("class", "provinces")
      .attr("d", path);

///légende
g.append("g")
  .attr("class", "legendQuant")
  .attr("transform", "translate(20,20)");

var legend = d3.legend.color()
  .labelFormat(d3.format(".3n"))
  .useClass(true)    
          .orient('vertical')
          .scale(quantize);

d3.select("#legende")
.attr("font-size", "11px").call(legend)
/// 

// menu 

function selectValue(selected) {

    quantize.domain
([
  d3.min(data, function(d) { return d[selected]; }), 
  d3.max(data, function(d) { return d[selected]; })
]);
      //d3.extent(d, function(d) { return d[selected]; }))

  data.forEach(function(d) { rateById.set(d.id, d[selected]);
   });
  paths
  .attr("class", function(d) {
    return quantize(rateById.get(d.id));
  })
//   .attr("opacity", function(d) { var value = d[selected];

//               if (value) {return ".8";}
//               else { return ".1"; }
//             })
}

 dropDown.on("change", function() {
      var selected = this.value;
      selectValue(selected);

///légende
g.append("g")
  .attr("class", "legendQuant")
  .attr("transform", "translate(20,20)");

var legend = d3.legend.color()
  .labelFormat(d3.format(".3n"))
  .useClass(true)    
          .orient('vertical')
          .scale(quantize);

d3.select("#legende")
.attr("font-size", "11px").call(legend)
/// 


  });

  dropDown.property("value","cannabis");
  selectValue("cannabis");

};

d3.select(self.frameElement).style("height", height + "px");

function zoomed() {
  g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");

 g.selectAll(".subunit-label")  
      .attr("font-size","5px"/d3.event.scale);

}
