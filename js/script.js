/* Author:
 Zack Maril
 */

var w = 1000,
h = 2000;

var tree = d3.layout.tree()
    .size([h, w-160]);

var diagonal = d3.svg.diagonal()
    .projection(function(d,i) { return [d.y, d.x]; });

var vis = d3.select("#chart").append("svg")
    .attr("width", w)
    .attr("height", h)
    .append("g")
    .attr("transform", "translate(40, 0)");

d3.json("mpg.json", function(json) {
	    var nodes = tree.nodes(json);
	    var totalComments = json.number;

	    var greyscale = function(d){
		return Math.round(256*(1-(d.number/totalComments)));
	    };

	    var hexscale = function(num){
		var base16 = num.toString(16);
		if(base16.length == 1)
		    base16= "0"+base16;
		return "#"+base16+base16+base16;
	    };

	    var link = vis.selectAll("path.link")
		.data(tree.links(nodes))
		.enter().append("path")
		.attr("class", "link")
		.style("stroke",function(d){
			   var average = Math.round((greyscale(d.source)+greyscale(d.target))/2);
			   return hexscale(average);
		       })
		.attr("d",diagonal);

	    var node = vis.selectAll("g.node")
		.data(nodes)
		.enter().append("g")
		.attr("class", "node")
		.attr("transform", function(d,i) { 
			  return "translate(" + d.y+ "," + d.x + ")"; });

	    node.append("circle")
	    	.attr("r",5)
		.style("fill",function(d){
			   return hexscale(greyscale(d));			   
		      });

	    // node.append("text")
	    // 	.attr("dx", function(d) { return d.children ? -8 : 8; })
	    // 	.attr("dy", 3)
	    // 	.attr("text-anchor", function(d) { return d.children ? "end" : "start"; })
	    // 	.text(function(d) { return d.names; });

	    $("svg circle").tipsy({   gravity: 's', 
				      html: true, 
				      offset: 1,
				      title: function() {
					  var d = this.__data__;
					  var text = 'Most frequent commenter: '+d.names;
					  var percent = Math.round(((d.number)/totalComments*100)*1000)/1000;
					  console.log(percent);
					  text += "<br /> Chance node occurs: "+percent+"%";
					  text += "<br /> ";
					  return text;
				      }});
	});
