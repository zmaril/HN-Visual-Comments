/* Author:
 Zack Maril
 */

var w = 1000,
h = 2000;

var vis = d3.select("#chart").append("svg")
    .attr("width", w)
    .attr("height", h)
    .append("g")
    .attr("transform", "translate(100, 50)");

var tree = d3.layout.tree()
    .size([h-100, w-160]);

var diagonal = d3.svg.diagonal()
    .projection(function(d,i) { return [d.y, d.x]; });

var removeTree = function(){
    tree.nodes().remove();
    tree.links().remove();
};
var displayTree = function(json){

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

    $("svg circle").tipsy({   gravity: 's', 
			      html: true, 
			      offset: 1,
			      title: function() {
				  var d = this.__data__;
				  var randomComment = d.comments[Math.floor(Math.random()*d.comments.length)];
				  this.comment=randomComment;
				  var text = 'Most frequent commenter: '+d.names;
				  var percent = Math.round(((d.number)/totalComments*100)*1000)/1000;
				  text += "<br /> Chance node occurs: "+percent+"%";
				  text += "<br /> Random comment (by "+randomComment['user']+"):<br />"+randomComment['comment'];
				  return text;
			      }})
	.click(function(event,obj){
		   location.href="http://news.ycombinator.com/"+event.target.comment.link;
	       });
    
};
var data = {};
var users=[];
d3.json("users.json", function(usersJson) {
	    $.map(usersJson,function(value,key){
		      data[key]=value;
		      users.push(key);
		      
		  });
	    var json = data['pg'];
	    displayTree(json);

	    var labels = vis.selectAll("text.label")
		.data(users.reverse())
		.enter().append("text")
		.attr("class", "label")
		.attr("y", function(d,i){return 20*i;})
		.attr("x", 10)
	    	.attr("dy",".71em")
		.attr("text-anchor", "middle")
		.text(function(d, i) {this.name=d;return d; });
	    $("text.label").click(function(event){
				      removeTree();
				      displayTree(data[event.target.name]);
				  });
	});
