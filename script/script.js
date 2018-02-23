const d3 = window.d3;
const dimple = window.dimple;
// Global variables
// Global variables
// Global variables
loadedData = false;
domainX = [50, 75];
domainY = [0, 13];

var d3Update = false;

function drawD3Plot() {
    var width = 600;
    var height = 300;
    var xoffs = 40;
    var yoffs = 40;

    var svg = d3.select("#d3Container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Get actual width
    width = svg.node().getBoundingClientRect().width;

    var x = d3.scaleLinear().domain(domainX).range([xoffs, width - 20]);
    var y = d3.scaleLinear().domain(domainY).range([height - yoffs, 20]);

    var linedata = d3.line()
        .x(function (d) { return x(d["Temperature F"]); })
        .y(function (d) { return y(d["Damage index"]); });

    // Add axes first to show plots on top
    var x_axis = svg.append("g")
        .classed("x axis", true)
        .attr("transform", function () { return "translate(0," + y.range()[0] + ")"; });

    var y_axis = svg.append("g")
        .classed("y axis", true)
        .attr("transform", function () { return "translate(" + x.range()[0] + ",0)"; });

    // Add line first to show markers on top
    var line_path = svg.append("path")
        .data([loadedData])
        .classed("line", true)
        .attr("fill", "none")
        .attr("stroke", "slategray")
        .attr("stroke-width", "2px");

    // Initial setup done - actual binding to data is done in update()!

    function update() {

        // Sort the data to make the line work right
        loadedData.sort(function (x1, x2) {
            return d3.ascending(x1["Temperature F"], x2["Temperature F"]);
        });

        line_path.data([loadedData]);

        x.domain(domainX);
        y.domain(domainY);
        x_axis.transition().call(d3.axisBottom(x));
        y_axis.transition().call(d3.axisLeft(y));
        line_path.transition().attr("d", linedata);

        var markers = svg.selectAll(".marker")
            .data(loadedData);

        markers.exit().remove();

        var new_markers = markers.enter()
            .append("g")
            .classed("marker", true);

        function marker_translation(d) {
            return "translate(" + x(d["Temperature F"]) + ", " + y(d["Damage index"]) + ")";
        }

        new_markers.attr("transform", marker_translation);
        // Set translation without transition on enter, with transition on update
        markers.transition().attr("transform", marker_translation);

        new_markers.append("circle")
            .attr("r", 6)
            .attr("fill", "lavender")
            .attr("stroke", "slategray")
	    .attr("stroke-width", 2);

    }

    // Call update to make inital data binding
    update();

    // Return update function to make it available for other
    // functions to call when appropriate
    return update;
}

var dimpleChart = false;

function drawDimplePlot() {
    var height = 300, width = 600;

    //Create SVG
    var dimpleSvg = dimple.newSvg("#dimpleContainer", width, height);

    dimpleChart = new dimple.chart(dimpleSvg, loadedData);
    dimpleChart.setMargins(50, 40, 20, 50);
    var x = dimpleChart.addMeasureAxis("x", "Temperature F");
    x.overrideMin = 52;
    x.overrideMax = 75;
    var y = dimpleChart.addMeasureAxis("y", "Erosion incidents");
    y.overrideMax = 8;
    var line = dimpleChart.addSeries(["Flight", "Shuttle"], dimple.plot.line);
    line.lineWeight = 1;
    dimpleChart.addSeries(["Erosion incidents", "Flight"], dimple.plot.bubble);
    dimpleChart.draw();
}

var dimpleChart2 = false;

function drawDimplePlot2() {
    var height = 300, width = 600;

    //Create SVG
    var dimpleSvg = dimple.newSvg("#dimpleContainer2", width, height);

    dimpleChart2 = new dimple.chart(dimpleSvg, loadedData);
    dimpleChart2.setMargins(50, 20, 20, 50);
    var x = dimpleChart2.addCategoryAxis("x", "Flight");
    x.addOrderRule("Flight");
    var y = dimpleChart2.addMeasureAxis("y", "Erosion incidents");
    y.overrideMax = 4;
    var series = dimpleChart2.addSeries(["Erosion incidents", "Flight"], dimple.plot.bar);
    dimpleChart2.draw();
}

function dimpleZoomReset() {
    dimpleChart.axes[0].overrideMin = 52;
    dimpleChart.axes[0].overrideMax = 75;
    dimpleChart.axes[1].overrideMin = 0;
    dimpleChart.axes[1].overrideMax = 8;
    dimpleChart.draw(1000);
}

function dimpleZoomLeft() {
    dimpleChart.axes[0].overrideMax -= 4;
    dimpleChart.axes[1].overrideMax -= 1;
    dimpleChart.draw(750);
}


function dimpleZoomRight() {
    dimpleChart.axes[0].overrideMin += 4;
    dimpleChart.axes[1].overrideMax -= 1;
    dimpleChart.draw(750);
}
function dimpleFilter() {
    dimpleChart2.data = dimple.filterData(loadedData,"Erosion incidents",["1", "3"]);
    dimpleChart2.draw(1000,false);
}

function dimpleOrder() {
    dimpleChart2.axes[0]._orderRules[0] = "Temperature";
    dimpleChart2.draw(1000, false);
}


var damaged_csv = "https://dl.dropbox.com/s/mfourrx8w6fd4hx/ex2_temps_below_70.csv?dl=0";

d3.csv(damaged_csv, function (data) {
    data.forEach(function (d) {
        d["Temperature F"] = +d["Temperature F"];
        d["Damage index"] = +d["Damage index"];
	d["Erosion incidents"] = +d["Erosion incidents"];
    });
    loadedData = data;

    d3Update = drawD3Plot();
    // d3Update now is update function - called as d3Update()

    drawDimplePlot();

    drawDimplePlot2();
});
