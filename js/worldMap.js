
/*
 *@title  worldMap.js  
 *@role svg map generation
 * 
 *@dependencies 
 * d3js
 * queue
 * topojson
 * chosen
 *@version 1.0
 *@owner thefitzpaddy
 *
 *update history:
 *
 */

worldMap = {
	world: false,
	capCities: false,
	selectedCountry: false,
	width: 600,
	height: 400,
	projection: false,
	zoom: false,
	path: false,
	svg: false,
	iconWidth: 16,
	iconHeight: 16,	
	g: false,
	b: false, //bounds
	t: false, //translate
	s: 1, //scale
	fade: 0, //transition fadeout time
	scale3: 4,
	scale2: 6,
	scale1: 12,
	labels:{
		// d3js linear scale function to scale labels (limit to scale extent)
		countryLabels: d3.scale.log().domain([1, 42]).range([6,0.7]),
		cityLabels: d3.scale.log().domain([1, 42]).range([4,0.5]),
		cityLabelsXOffset: d3.scale.log().domain([1, 42]).range([1,0.2]),
	},

//-------------------------------------------------------------------------------------------------
// function -  generate the container that d3js will render the svg
    initSvg: function (id) {
		//get screen width
		worldMap.width=window.innerWidth;
		worldMap.height=$("#"+id).height(); //defined in style.css

		//define the calcualted attributes of the container
		$("#"+id).attr("style","width:"+worldMap.width+"px;height:"+worldMap.height+"px;");

		//set the projection (mercator for world view)
		worldMap.projection = d3.geo.mercator().translate([0, 0]).scale(worldMap.width / 2 / Math.PI);

		//path generator
		worldMap.path = d3.geo.path().projection(worldMap.projection);	

		//call move function on zoom
		worldMap.zoom = d3.behavior.zoom().scaleExtent([1, 42]).on("zoom", worldMap.zoomMap);

		//declare the svg
		worldMap.svg = d3.select("#"+id).append("svg")
			//assign id
			.attr("id", "worldSvg")
			//xmlns tag required when loading svg as object
			.attr("xmlns", "http://www.w3.org/2000/svg")
			//xlink tag required for image href (Note: d3js svg needs correction for Safari browser)
			.attr("xlink", "http://www.w3.org/1999/xlink")
			//svg width/heith
			.attr("width", worldMap.width)
			.attr("height", worldMap.height)
			.attr("viewBox", "0 0 "+worldMap.width+" "+worldMap.height+"")
			.append("g")
			.attr("transform", "translate(" + worldMap.width / 2 + "," + worldMap.height / 2 + ")")
			//trigger map zoom on move
			.call(worldMap.zoom);

		//map overlay to catch mouse movements outside world paths
		worldMap.svg.append("rect")
		    .attr("class", "overlay")
		    .attr("x", -worldMap.width / 2)
		    .attr("y", -worldMap.height / 2)
		    .attr("width", worldMap.width)
		    .attr("height", worldMap.height);

		//add g element
		worldMap.g = worldMap.svg.append("g");
    },

//-------------------------------------------------------------------------------------------------
// function -  creates world svg layer
    worldLayer: function () {

		worldMap.g.selectAll("#world")
		    .data(topojson.feature(worldMap.world, worldMap.world.objects.admin0).features)
		    .enter().append("path")
		    //assign id
		    .attr("id", function(d) { return "world-"+d.properties.iso_a2; })
		    //assign class
		    .attr("class", function(d) { return "iso " + d.properties.iso_a3; })
		    .attr("d", worldMap.path)
		    //add values to combo box 
		    .each(function (d) {
		      if(d.properties.iso_a2 != '-99'){
		        $('#world-dd').append( new Option(d.properties.admin,d.properties.iso_a2) );
		        $("#world-dd").trigger("liszt:updated");
		      }
		    })
		    .on('click', worldMap.zoomTo);

		worldMap.g.selectAll("#world-labels")
			.data(topojson.feature(worldMap.world, worldMap.world.objects.admin0).features)
			.enter().append("text")
			//assign id
		    .attr("id", function(d) { return "world-labels-"+d.properties.iso_a2; })
		    //assign class
		    .attr("class", "world-labels")
			.attr("transform", function(d) { return "translate(" + worldMap.path.centroid(d) + ")"; })
			//.attr("dy", ".35em")
			.text(function(d) { return d.properties.admin; })
			.style("display", "none");
	},

//-------------------------------------------------------------------------------------------------
// function - creates capital cities layer
	capitalsLayer: function () {

		worldMap.g.selectAll("#capital-city")
		    .data(topojson.feature(worldMap.capCities, worldMap.capCities.objects.cities).features)
			//add to svg as image
			.enter().append("image")
			//filtering example
			.filter(function(d) { return d.properties.ADM0CAP })
				//xlink:href to icon
				.attr("xlink:href", "css/capital.png")
				//assign id
				.attr("id", function(d) { return "capital-city-"+d.properties.ISO_A2; })
				//assign class
				.attr("class", "capital-city")
				//assign name
				.attr("name", function(d) { return d.properties.NAME; })
				//image position is equal to location minus half the image size (must be updated with each zoom) 
				.attr("x", function(d) { return worldMap.projection(d.geometry.coordinates)[0] - (worldMap.iconWidth / 2); })
				.attr("y", function(d) { return worldMap.projection(d.geometry.coordinates)[1] - (worldMap.iconHeight / 2); })
				.attr("width", worldMap.iconWidth)
				.attr("height", worldMap.iconHeight)
				.style("display", "none");

		worldMap.g.selectAll("#capital-city-labels")
		    .data(topojson.feature(worldMap.capCities, worldMap.capCities.objects.cities).features)
		    .enter().append("text")
			//filtering example
			.filter(function(d) { return d.properties.ADM0CAP })
				//assign id
				.attr("id", function(d) { return "capital-city-labels-"+d.properties.ISO_A2} )
				//class
			    .attr("class", "capital-city-labels")
			    .attr("transform", function(d) { return "translate(" + worldMap.projection(d.geometry.coordinates) + ")"; })
				.attr("dy", ".35em")
				.text(function(d) { return d.properties.NAME; })
				.style("display", "none");
	},


//-------------------------------------------------------------------------------------------------
// function -  zooms/pans on svg move
	zoomMap: function(){

		//set new transalte/scale
		worldMap.t = d3.event.translate;
		worldMap.s = d3.event.scale;

		//set transition fadeout
		worldMap.fade = 0;
		//set icon size after user zoom/click
		worldMap.iconScale(worldMap.s,worldMap.fade);
		//scale labels
		worldMap.labelScale(worldMap.s);

		//set country label visibility
		worldMap.labelVisibility(worldMap.s);	

		//worldMap transform (limits the extents!)
		worldMap.t[0] = Math.min(worldMap.width / 2 * (worldMap.s - 1), Math.max(worldMap.width / 2 * (1 - worldMap.s), worldMap.t[0]));
		worldMap.t[1] = Math.min(worldMap.height / 2 * (worldMap.s - 1) + 230 * worldMap.s, Math.max(worldMap.height / 2 * (1 - worldMap.s) - 230 * worldMap.s, worldMap.t[1]));
		worldMap.zoom.translate(worldMap.t);
		worldMap.g.style("stroke-width", 1 / worldMap.s).attr("transform", "translate(" + worldMap.t + ")scale(" + worldMap.s + ")");

		//worldMap transform (does not limit the extents!)
		//worldMap.g.attr("transform","translate("+d3.event.translate.join(",")+")scale("+worldMap.s+")");
	},

//-------------------------------------------------------------------------------------------------
// function -  zooms to the bounding box of selected country
    zoomTo: function (d) {

		//select/deselect
		if (worldMap.selectedCountry === d) return worldMap.resetMap();
		worldMap.g.selectAll(".active").classed("active", false);
		worldMap.g.select('#world-'+d.properties.iso_a2).classed("active", worldMap.selectedCountry = d);

		//update drop down on click
		$('#world-dd').val(d.properties.iso_a2).trigger("liszt:updated");

		//get bounds and update translate/scale for selected country
		var b = worldMap.path.bounds(d);
		var s = .95 / Math.max((b[1][0] - b[0][0]) / worldMap.width, (b[1][1] - b[0][1]) / worldMap.height);
		var t = -(b[1][0] + b[0][0]) / 2 + "," + -(b[1][1] + b[0][1]) / 2;

		//set transition fadeout
		worldMap.fade = 2000;
		//set icon size after user zoomTo
		worldMap.iconScale(s,worldMap.fade);
		//scale labels
		worldMap.labelScale(s);

		//select country labels
		worldMap.labelSelect(d.properties.iso_a2);

		//transform world
		worldMap.g.transition().duration(worldMap.fade).attr("transform",
			"translate(" + worldMap.projection.translate() + ")"
			+ "scale(" + s + ")"
			+ "translate(" + t + ")");
	},

//-------------------------------------------------------------------------------------------------
// function - 
	iconScale: function(s,time){
		//get new scaled height
		var iconW = worldMap.iconWidth / s;
		var iconH = worldMap.iconHeight / s;

		worldMap.g.selectAll(".capital-city")
			.transition().duration(time)
			.attr("width", iconW)
			.attr("height", iconH)
			.attr("x", function(d) { return worldMap.projection(d.geometry.coordinates)[0] - (iconW / 2); })
			.attr("y", function(d) { return worldMap.projection(d.geometry.coordinates)[1] - (iconH / 2); });
	},

//-------------------------------------------------------------------------------------------------
// function - determines the lable size based on map scale (using d3js scale function)
	labelScale: function(s){

		//define size of labels in px based on map scale
		var countryLabels = worldMap.labels.countryLabels(s);
		var cityLabels = worldMap.labels.cityLabels(s);
		var cityLabelsXOffset = worldMap.labels.cityLabelsXOffset(s);

		//set country labels
		worldMap.g.selectAll(".world-labels")
			.style("font-size", countryLabels+"px");

		//set city labels
		worldMap.g.selectAll(".capital-city-labels")
			.style("text-anchor", function(d) { return worldMap.projection(d.geometry.coordinates)[0] > 0 ? "start" : "end"; })
			//offset label x value
			.attr("x", function(d) { return worldMap.projection(d.geometry.coordinates)[0] > 0 ? cityLabelsXOffset*1 : cityLabelsXOffset*-1; })
			.style("font-size", cityLabels+"px");
	},

//-------------------------------------------------------------------------------------------------
// function - turn layers on and off based on map scale
	labelSelect: function(iso_a2){
		//turn off all labels & cities
		worldMap.g.selectAll(".world-labels")
			.style("display", "none");
		worldMap.g.selectAll(".capital-city")
			.style("display", "none");			
		worldMap.g.selectAll(".capital-city-labels")
			.style("display", "none");

		//turn on selected country by iso_a2
		worldMap.g.selectAll("#world-labels-"+iso_a2)
			.style("display", "block");
		worldMap.g.selectAll("#capital-city-"+iso_a2)
			.style("display", "block");
		worldMap.g.selectAll("#capital-city-labels-"+iso_a2)
			.style("display", "block");

	},

//-------------------------------------------------------------------------------------------------
// function - turn layers on and off based on map scale
	labelVisibility: function(s){

		//country labels
		if(worldMap.scale3<s){
			worldMap.g.selectAll(".world-labels")
				.style("display", "block");
				//.style("font-size", "1.5px");
		}else{
			worldMap.g.selectAll(".world-labels")
				.style("display", "none");		
		}

		//captial cities
		if(worldMap.scale2<s){			
			worldMap.g.selectAll(".capital-city")
				.style("display", "block");
		}else{
			worldMap.g.selectAll(".capital-city")
				.style("display", "none");
		}

		//capital city lables
		if(worldMap.scale1<s){
			worldMap.g.selectAll(".capital-city-labels")
				.style("display", "block")
				.style("text-anchor", function(d) { return worldMap.projection(d.geometry.coordinates)[0] > 0 ? "start" : "end"; })
				//offset label x value
				.attr("x", function(d) { return worldMap.projection(d.geometry.coordinates)[0] > 0 ? +1 : -1; });				
		}else{
			worldMap.g.selectAll(".capital-city-labels")
				.style("display", "none");
		}		
	},

//-------------------------------------------------------------------------------------------------
// function - rest the map to previous zoom (before click)
	resetMap: function() {

		//set css active to false
		worldMap.g.selectAll(".active").classed("active", worldMap.selectedCountry = false);
		//reset drop down to 0
		$('#world-dd').val('').trigger('liszt:updated');
		//restore previous icon size
		worldMap.iconScale(worldMap.s,worldMap.fade);
		//scale labels
		worldMap.labelScale(worldMap.s);

		//turn off all labels & cities
		worldMap.g.selectAll(".world-labels")
			.style("display", "none");
		worldMap.g.selectAll(".capital-city")
			.style("display", "none");			
		worldMap.g.selectAll(".capital-city-labels")
			.style("display", "none");

		//set country label & labels visibility
		worldMap.labelVisibility(worldMap.s);

		//restore to previous map view
		worldMap.g.transition().duration(worldMap.fade).attr("transform", "translate(" + worldMap.t + ")scale(" + worldMap.s + ")");
	}

//-------------------------------------------------------------------------------------------------		   		
// end SvgMap object
}