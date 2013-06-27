D3jsworld
=========
D3js World is an interactive map example based on the [D3js](http://d3js.org/) library created by [mbostock](https://github.com/mbostock) that includes location image icons, zoom, pan & jQuery [chosen](http://harvesthq.github.io/chosen/) drop down country selection.

The demo lends heavily from the excellent [d3js map tutorial](http://bost.ocks.org/mike/map/) as well as the many [b.locks](http://bl.ocks.org/mbostock) and [d3js tutorials](https://github.com/mbostock/d3/wiki/Tutorials) from [mbostock](https://github.com/mbostock) that demonstrate d3js usage.

## Data Preparation
### Prerequisites
The following are prerequisites are required to prepare custom TopoJSON datasets;
- [GDAL](http://www.gdal.org/)
> The Geospatial Data Abstraction Library (GDAL) is used primarily for ogr2ogr data transformations.

- [TopoJSON](https://github.com/mbostock/topojson)
> [mbostock](https://github.com/mbostock) has designed TopoJSON as an extension to GeoJSON where geometries are not encoded discretely - if geometries share features, they are combined (such as borders). Additionally TopoJSON encodes numeric values more efficiently and can incorporate a degree of simplification. This simplification can result in savings of file size of 80% or more depending on the area and use of compression.

### Data Source
- [110m Populated Places](http://www.naturalearthdata.com/downloads/50m-cultural-vectors/)
> [Natural Earth](http://www.naturalearthdata.com/) provides a variety of [cultural, physical and raster datasets](http://www.naturalearthdata.com/downloads/) maintained by cartographer [Nathaniel Vaughn Kelso](http://kelsocartography.com/) (and [others](www.naturalearthdata.com/about/contributors/)). Shapefiles are beautifully simplified by hand for different resolutions, letting you choose the resolution appropriate to your application.

- [50m Cultural Vectors](http://www.naturalearthdata.com/downloads/50m-cultural-vectors/)
> Filtered by capital cities.

### Processing
To be continued...
