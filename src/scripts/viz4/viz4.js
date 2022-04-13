import {getRegionTooltipText, removeRegionToolTip} from './tooltip.js'

// set the dimensions and margins of the pie chart
const MARGIN = {top: 20, right: 30, bottom: 40, left: 90},
WIDTH = 250,
HEIGHT = 250,
RADIUS = Math.min(WIDTH, HEIGHT) / 2;

export function drawTitle(){
    // Add Title
    const TITLE = ['Neymar', 'Messi', 'Ronaldo']
    for (let i = 0; i < TITLE.length; i++) {
        d3
        .select('#viz-title-' + i)
        .text(TITLE[i]);
    }
}

export function loadRadioButton(datasets) {
    d3
    .selectAll("#radio-button input")
    .on("change", function() {
        console.log(this.value)
        update(datasets[(this.value == "cmp") ? 0 : (this.value == "sca") ? 1 : 2])
    })
}

export function initialLoad(dataset) {
    for (let i = 0; i < dataset.length; i++) {
        // append the svg object to the body of the page
        var svg = d3
        .select("#pie-chart-" + i)
        .append("svg")
        .attr("width", WIDTH)
        .attr("height", HEIGHT)
        .append("g")
        .attr(
            "transform",
            "translate(" + WIDTH/2 + "," + HEIGHT/2 + ")"
        )

        svg
        .append("g")
        .attr("id", "slice-" + i);
    }

    // TODO UPDATE
    update(dataset);
}

function getTransitionDataSet(oldDataSet, newDataSet) {
    var newData = d3.set();

    newDataSet.forEach(function(d) { newData.add(d.label); });

    var oldData = oldDataSet
    .filter(function(d) { return !newData.has(d.label); })
    .map(function(d) { return {label: d.label, value: 0}; });

    var transitionDataSet = d3.merge([ newDataSet, oldData ])
    .sort(function(a, b) {
        return d3.ascending(a.label, b.label);
    });

    return transitionDataSet;
}

// Inspired from https://bl.ocks.org/rshaker/225c6df494811f46f6ea53eba63da817
export function update(newDataSet) {
    for (let i = 0; i < newDataSet.length; i++) {
        // CONST variable
        const DURATION = 1000;
        const TOTAL = newDataSet[i][0].value + newDataSet[i][1].value;

        // local function instanciation
        var key = function(d) { return d.data.label; };

        // TODO instanciate keys
        var keys = ["Completed Pass", "Attempted Pass", "GCA Pass", "SCA Pass", ]

        // TODO: UPDATE WITH APPROPRIATE COLOR
        var color = d3
        .scaleOrdinal(d3.schemePastel1)
        .domain(keys);

        // create pie chart shell
        var pie = d3
        .pie()
        .sort(null)
        .value(function(d) {
            return d.value;
        });

        // if we want a donut set innerRadius to 0.5
        var arc = d3
        .arc()
        .outerRadius(RADIUS * 1.0)
        .innerRadius(RADIUS * 0.0);

        var oldDataSet = d3
        .select("#slice-" + i)
        .selectAll("path")
        .data()
        .map(function(d) { return d.data });

        if (oldDataSet.length == 0) oldDataSet = newDataSet[i];

        var firstTransitionDataSet = getTransitionDataSet(newDataSet[i], oldDataSet);
        var SecondTransitionDataSet = getTransitionDataSet(oldDataSet, newDataSet[i]);

        var slice = d3
        .select("#slice-" + i)
        .selectAll("path")
        .data(pie(firstTransitionDataSet), key);

        slice
        .enter()
        .insert("path")
        .attr("id", "slice-" + i)
        .style("fill", function(d) { return color(d.data.label); })
        .each(function(d) {
            this._current = d;
        });

        slice = d3
        .select("#slice-" + i)
        .selectAll("path")
        .data(pie(SecondTransitionDataSet), key);

        slice
        .transition()
        .duration(DURATION)
        .attrTween("d", function(d) {
            var interpolate = d3.interpolate(this._current, d);
            var _this = this;
            return function(t) {
                _this._current = interpolate(t);
                return arc(_this._current);
                };
            });

        slice = d3
        .select("#slice-" + i)
        .selectAll("path")
        .data(pie(newDataSet[i]), key)
        .style("cursor", "pointer")
        .on("mouseenter", function(d) {
            getRegionTooltipText(d.data.value + " (" + parseFloat(d.data.value/TOTAL * 100).toFixed(2) + "%)");
        })
        .on("mouseleave", function(d) {
            removeRegionToolTip();
        });
    }
}