/****

//selections

//by id
var pk = g.select("#PK").property("__data__");

//by class
var pk = g.select(".iso.PAK").property("__data__");

*****/    

//get screen width/height
var width=window.innerWidth;
var height=600; //defined
//icon width/height
var icon_width=32;
var icon_height=32;

$('#map').attr("style","width:"+width+"px;height:"+height+"px;");
//$('#map').attr("style","height:"+height+"px");

//variables to hold current translate/scale & selected country
var t,active,centered;
var s = 1;

//set the projection (mercator for world view)
var projection = d3.geo.mercator()
    .translate([0, 0])
    .scale(width / 2 / Math.PI);

//path generator
var path = d3.geo.path()
    .projection(projection);

/*
//call move function on zoom
var zoom = d3.behavior.zoom()
  .scaleExtent([1, 42])
  .on("zoom", zoom);
*/

//set the svg/canvas
var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    //.call(zoom);

//map overlay for map navigation
svg.append("rect")
    .attr("class", "overlay")
    .attr("x", -width / 2)
    .attr("y", -height / 2)
    .attr("width", width)
    .attr("height", height);

//add topojson to svg object
var g = svg.append("g");

//load datasets
queue()
    .defer(d3.json, "js/data/admin0_50m.json")
    .defer(d3.json, "js/data/summary.json")
    .await(ready);

//display the world
function ready(error, world, loc) {

console.log(world);

  g.selectAll("#admin0")
    .data(topojson.feature(world, world.objects.admin0_50m).features)
    .enter().append("path")
    //assign id
    .attr("id", function(d) { return d.properties.iso_a2; })
    //assign class
    .attr("class", function(d) { return "iso " + d.properties.iso_a3; })
    .attr("d", path)
    //add values to combo box 
    .each(function (d) {
      if(d.properties.iso_a2 != '-99'){
        //console.log(d.properties.iso_a2);
        $('#world-dd').append( new Option(d.properties.admin,d.properties.iso_a2) );
        $("#world-dd").trigger("liszt:updated");
      }
    })
    .on('click', bbox)
    .on('mouseover', cToolTip);

    /* icon */
    g.selectAll("#locations")
      .data(loc.locations)
      .enter().append("svg:image")
      .attr("xlink:href", function(d) { if(d.map_icon){ return "http://192.168.50.4/siv-v3/assets/icons/locations/"+d.map_icon+""; }})
      //assign id
      .attr("id", "locations")
      //assign iso
      .attr("iso", function(d) { return d.gl3_iso2; })      
      //assign name
      .attr("name", function(d) { return d.name; })      
      //.attr("class", "locations")
      //location is equal to image size minus half the image size (must be updated with each zoom) 
      .attr("x", function(d) { return projection([d.lon, d.lat])[0] - (icon_width / 2); })
      .attr("y", function(d) { return projection([d.lon, d.lat])[1] - (icon_height / 2); })
      .attr("width", icon_width)
      .attr("height", icon_height)
      .on('click', locationZoom)
      .on('mouseover', lToolTip);

}

//tooltip stub
function lToolTip(d){
  console.log(d.name);
}

//tooltip stub
function cToolTip(d){
  //console.log(d.properties.ISO_A3);
}

function zoom(){
  //variables used to reset zoom after click
  t = d3.event.translate;
  s = d3.event.scale;
  
  //set icon size
  setIcon(s);  
  
  //transform 
  g.attr("transform","translate("+d3.event.translate.join(",")+")scale("+s+")");

}

//updates the icon size using scale
function setIcon(s){
  //get new scaled height
  var iconW = icon_width / s;
  var iconH = icon_height / s;

  g.selectAll("#locations")
    .attr("width", iconW)
    .attr("height", iconH)
    .attr("x", function(d) { return projection([d.lon, d.lat])[0] - (iconW / 2); })
    .attr("y", function(d) { return projection([d.lon, d.lat])[1] - (iconH / 2); });
}

function locationZoom(d){
    /*
    g.transition()
      .duration(1000)
      .attr("transform","translate(" + this.x + "," + this.y + ")scale(38)");
    */
}

//zoom to bbox on click and set attr active
function bbox(d) {
  //select/deselect
  if (active === d) return reset();
  g.selectAll(".active").classed("active", false);
  g.select('#'+d.properties.iso_a2).classed("active", active = d);

  //update drop down on click
  $('#world-dd').val(d.properties.iso_a2).trigger("liszt:updated");

  //get bounds and update translate/scale
  var b = path.bounds(d);
  var scl = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
  var trns = -(b[1][0] + b[0][0]) / 2 + "," + -(b[1][1] + b[0][1]) / 2;

  //update icon size
  setIcon(scl);

  //transform world
  g.transition().duration(1000).attr("transform",
      "translate(" + projection.translate() + ")"
      + "scale(" + scl + ")"
      + "translate(" + trns + ")");

}

//reset view on click of selected path
function reset() {
  //set css active to false
  g.selectAll(".active").classed("active", active = false);
  //reset drop down to 0
  $('#world-dd').val('').trigger('liszt:updated');
  //restore previous icon size
  setIcon(s);  
  //restore to previous map view
  g.transition().duration(1000).attr("transform", "translate(" + t + ")scale(" + s + ")");
}
