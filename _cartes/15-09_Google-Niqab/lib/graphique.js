
var width = 635,
    height = 357;
    margin = {top: 10, right: 10, bottom: 10, left: 10};


var quantize = d3.scale.quantize()
    .domain([0, 100])
    .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

// var projection = d3.geo.albers()
//     .scale(600)
//     .center([7, 55.4])
//     .translate([width / 2, height / 2]);

var projection = d3.geo.conicConformal()
    .scale(700)
    .center([7, 57.4])
    .rotate([100, 0])
  //  .parallels([50, 60])
    .translate([width / 2, height / 2]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("#graphique")
    .attr("viewBox", [
        margin.left,
        margin.top,
        (width+margin.left),
        (height+margin.bottom)
      ].join(" "))
    .append("svg")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

queue()
    .defer(d3.json, "data/provincesCanada.json")
    .defer(d3.csv, "data/data.csv")
    .await(ready);

function ready(error, canada, d) //définir nom de fonction qui va conditionner l'Appel geojson canada.objects....)
 {
  if (error) throw error;

var rateById = d3.map();

d.forEach(function(d) { rateById.set(d.id, +d.rate); });

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<p>" + d.properties.nom + "</p><br/><p>Taux de recherche : " + rateById.get(d.id) + " %</p>";
    // + "\t" 
    // + year.values + "</strong><br/><span style='color:#fff'>" + value.values + " députés élus"
  })
  svg.call(tip);

  svg.append("g")
      .attr("class", "counties")
    .selectAll("path")
      .data(topojson.feature(canada, canada.objects.provincesCanada).features)
    .enter().append("path")
      .attr("class", function(d) { return quantize(rateById.get(d.id)); }) // faudrait mettre un if else pour ne pas afficher territoires...
      .attr("d", path)
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide) 
      // .on('mouseover', function(d, i) {
      //      tip.show(d,i)
      //     .style("top", (50)+"px").style("left",(0)+"px")
      //   })
      //   .on('mouseout',  function(d, i) {
      //     tip.hide(d,i);
      //   })
;

  svg.append("path")
      .datum(topojson.mesh(canada, canada.objects.provincesCanada, function(a, b) { return a !== b; }))
      .attr("class", "provinces")
      .attr("d", path);

  svg.append("path")
      .datum(topojson.mesh(canada, canada.objects.provincesCanada, function(a, b) { return a === b; }))
      .attr("class", "provinces")
      .attr("d", path);
}

d3.select(self.frameElement).style("height", height + "px");
