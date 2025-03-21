var psd3 = psd3 || {};
psd3.Graph = function (config) {
  var _this = this;
  this.config = config;
  this.defaults = {
    width: 100,
    height: 100,
    value: "value",
    inner: "inner",
    label: function (d) {
      return d.data.value;
    },
    tooltip: function (d) {
      if (_this.config.value !== undefined) {
        return d[_this.config.value];
      } else {
        return d.value;
      }
    },
    transition: "linear",
    transitionDuration: 1000,
    donutRadius: 0,
    gradient: false,
    colors: d3.scale.category20(),
    labelColor: "black",
    drilldownTransition: "linear",
    drilldownTransitionDuration: 0,
    stroke: "white",
    strokeWidth: 2,
    highlightColor: "orange",
  };

  for (var property in this.defaults) {
    if (this.defaults.hasOwnProperty(property)) {
      if (!config.hasOwnProperty(property)) {
        config[property] = this.defaults[property];
      }
    }
  }
};

var psd3 = psd3 || {};

psd3.Pie = function (config) {
  psd3.Graph.call(this, config);
  this.zoomStack = [];
  var pos = "top";
  if (
    this.config.heading !== undefined &&
    this.config.heading.pos !== undefined
  ) {
    pos = this.config.heading.pos;
  }
  if (pos == "top") {
    this.setHeading();
  }
  this.drawPie(config.data);
  if (pos == "bottom") {
    this.setHeading();
  }
};

psd3.Pie.prototype = Object.create(psd3.Graph.prototype);

psd3.Pie.prototype.constructor = psd3.Pie;

psd3.Pie.prototype.findMaxDepth = function (dataset) {
  if (dataset === null || dataset === undefined || dataset.length < 1) {
    return 0;
  }
  var currentLevel;
  var maxOfInner = 0;
  for (var i = 0; i < dataset.length; i++) {
    var maxInnerLevel = this.findMaxDepth(dataset[i][this.config.inner]);
    if (maxOfInner < maxInnerLevel) {
      maxOfInner = maxInnerLevel;
    }
  }
  currentLevel = 1 + maxOfInner;
  return currentLevel;
};

psd3.Pie.prototype.setHeading = function () {
  if (this.config.heading !== undefined) {
    d3.select("#" + this.config.containerId)
      .append("div")
      .style("text-align", "left")
      .style("width", "" + this.config.width + "px")
      .style("padding-top", "7px")
      .style("padding-left", "7px")
      .append("strong")
      .text(this.config.heading.text);
  }
};

psd3.Pie.prototype.mouseover = function (d) {
  d3.select("#" + _this.tooltipId)
    .style("left", d3.event.clientX / 3 - 200 + "px")
    .style("top", d3.event.clientY + window.scrollY - 250 + "px")
    .select("#value")
    .html(_this.config.tooltip(d.data, _this.config.label));
  d3.select("#" + _this.tooltipId).classed("psd3Hidden", false);
  d3.select(d.path).style("fill", d.data.color);
};
psd3.Pie.prototype.mouseout = function (d) {
  d3.select("#" + _this.tooltipId).classed("psd3Hidden", true);
  d3.select(d.path).style("fill", d.fill);
};

psd3.Pie.prototype.drawPie = function (dataset) {
  if (dataset === null || dataset === undefined || dataset.length < 1) {
    return;
  }
  _this = this;

  _this.arcIndex = 0;
  var svg = d3
    .select("#" + _this.config.containerId)
    .append("svg")
    .attr("id", _this.config.containerId + "_svg")
    .attr("width", _this.config.width)
    .attr("height", _this.config.height);
  _this.tooltipId = _this.config.containerId + "_tooltip";
  var tooltipDiv = d3
    .select("#" + _this.config.containerId)
    .append("div")
    .attr("id", _this.tooltipId)
    .attr("class", "psd3Hidden psd3Tooltip");
  tooltipDiv.append("p").append("span").attr("id", "value").text("100%");

  var legendData = [];
  for (var i = 0; i < dataset.length; i++) {
    var ld = {
      color: dataset[i]["color"],
      name: dataset[i]["name"],
      value: dataset[i]["value"],
    };
    if (dataset[i]["drilldown"].length > 1) {
      for (var j = 0; j < dataset[i]["drilldown"].length; j++) {
        let drilldown = dataset[i]["drilldown"];
        var ld1 = {
          color: drilldown[j]["color"],
          name: drilldown[j]["name"],
          value: drilldown[j]["value"],
        };

        legendData.push(ld1);
      }
    }
    legendData.push(ld);
  }

  var legend = d3
    .select("#chartContainer_svg")
    .append("svg")
    .attr("class", "legend")
    .selectAll("g")
    .data(legendData) //setting the data as we know there are only two set of data[programmar/tester] as per the nest function you have written
    .enter()
    .append("g")
    .attr("transform", function (d, i) {
      return "translate(0," + i * 20 + ")";
    });

  legend
    .append("circle")
    .attr("cx", 240)
    .attr("cy", 7)
    .attr("r", 6)
    .style("fill", function (d, i) {
      return d.color;
    });

  legend
    .append("text")
    .attr("x", 250)
    .attr("y", 7)
    .attr("dy", ".35em")
    .style("font-weight", "bold")
    .style("font-size", "13px")
    .style("font-family", "Open Sans")
    .text(function (d) {
      return d.name + ": " + d.value;
    });

  // to contain pie cirlce
  var radius;
  if (_this.config.width > _this.config.height) {
    radius = _this.config.width / 2;
  } else {
    radius = _this.config.height / 2;
  }
  var innerRadius = _this.config.donutRadius;
  var maxDepth = _this.findMaxDepth(dataset);
  var outerRadius = innerRadius + (radius - innerRadius) / maxDepth;
  var originalOuterRadius = outerRadius;
  var radiusDelta = outerRadius - innerRadius;
  _this.draw(
    svg,
    radius,
    dataset,
    dataset,
    dataset.length,
    innerRadius,
    outerRadius,
    radiusDelta,
    0,
    (360 * 22) / 7 / 180,
    [0, 0]
  );
};

psd3.Pie.prototype.customArcTween = function (d) {
  var start = {
    startAngle: d.startAngle,
    endAngle: d.startAngle,
  };
  var interpolate = d3.interpolate(start, d);
  return function (t) {
    return d.arc(interpolate(t));
  };
};

psd3.Pie.prototype.textTransform = function (d) {
  return "translate(" + d.arc.centroid(d) + ")";
};

psd3.Pie.prototype.textTitle = function (d) {
  return d.data[_this.config.value];
};

psd3.Pie.prototype.draw = function (
  svg,
  totalRadius,
  dataset,
  originalDataset,
  originalDatasetLength,
  innerRadius,
  outerRadius,
  radiusDelta,
  startAngle,
  endAngle,
  parentCentroid
) {
  _this = this;

  if (dataset === null || dataset === undefined || dataset.length < 1) {
    return;
  }

  psd3.Pie.prototype.textText = function (d) {
    return _this.config.label(d);
  };

  var pie = d3.layout.pie();
  pie.sort(null);
  pie.value(function (d) {
    return d[_this.config.value];
  });
  pie.startAngle(startAngle).endAngle(endAngle);

  var values = [];
  for (var i = 0; i < dataset.length; i++) {
    values.push(dataset[i][_this.config.value]);
  }

  var dblclick = function (d) {
    _this.reDrawPie(d, originalDataset);
  };

  var arc = d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius);
  //Set up groups
  _this.arcIndex = _this.arcIndex + 1;

  var clazz = "arc" + _this.arcIndex;

  var storeMetadataWithArc = function (d) {
    d3.select(d.path).style("fill", d.data.color);
    d.fill = d.data.color;
    d.path = this;

    d.arc = arc;
    d.length = dataset.length;
  };

  var arcs = svg
    .selectAll("g." + clazz)
    .data(pie(dataset))
    .enter()
    .append("g")
    .attr("class", "arc " + clazz)
    .attr("transform", "translate(" + totalRadius + "," + totalRadius + ")")
    .on("dblclick", dblclick);

  for (var i = 0; i < arcs[0].length; i++) {
    d3.select(arcs[0][i]).style("fill", dataset[i]["color"]);
  }

  var paths = arcs
    .append("path")

    .style("stroke", _this.config.stroke)
    .style("stroke-width", _this.config.strokeWidth);

  paths.on("mouseover", _this.mouseover);

  paths.on("mouseout", _this.mouseout);

  paths.each(storeMetadataWithArc);

  paths
    .transition()
    .duration(_this.config.transitionDuration)
    .delay(_this.config.transitionDuration * (_this.arcIndex - 1))
    .ease(_this.config.transition)
    .attrTween("d", _this.customArcTween);

  //Labels
  var texts = "";

  for (var j = 0; j < dataset.length; j++) {
    if (dataset[j][_this.config.inner] !== undefined) {
      _this.draw(
        svg,
        totalRadius,
        dataset[j][_this.config.inner],
        originalDataset,
        originalDatasetLength,
        innerRadius + radiusDelta,
        outerRadius + radiusDelta,
        radiusDelta,
        paths.data()[j].startAngle,
        paths.data()[j].endAngle,
        arc.centroid(paths.data()[j])
      );
    }
  }
};

psd3.Pie.prototype.reDrawPie = function (d, ds) {
  var tmp = [];
  d3.select("#" + _this.tooltipId).remove();
  d3.select("#" + _this.config.containerId + "_svg") //.remove();
    .transition()
    .ease(_this.config.drilldownTransition)
    .duration(_this.config.drilldownTransitionDuration)
    .style("height", 0)
    .remove()
    .each("end", function () {
      if (d.length == 1) {
        tmp = _this.zoomStack.pop();
      } else {
        tmp.push(d.data);
        _this.zoomStack.push(ds);
      }
      _this.drawPie(tmp);
    });
};