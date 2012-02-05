/* Author:
 Zack Maril
 */

var w = 1000,
h = $(document).height();
var data = {};
var users=[];

var vis = d3.select("#chart").append("svg")
    .attr("width", w)
    .attr("height", h)
    .append("g")
    .attr("transform", "translate(100, 50)");

var tree = d3.layout.tree()
    .size([h-100, w-160]);

var diagonal = d3.svg.diagonal()
    .projection(function(d,i) { return [d.y, d.x]; });

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

    var circles= $("svg circle");
	circles.map(function(i,elem){
			    var offset = $(elem).offset();
			    var direction = (offset.top < h/2 ? 'n': 's')+(offset.left < w/2 ? 'w': 'e');
			    $(elem).tipsy({   gravity: direction, 
			      html: true, 
			      offset: 12,
			      title: function() {
				  var d = this.__data__;
				  var randomComment = d.comments[Math.floor(Math.random()*d.comments.length)];
				  this.comment=randomComment;
				  var text = 'Most frequent commenter: '+d.names;
				  var percent = Math.round(((d.number)/totalComments*100)*1000)/1000;
				  text += "<br /> Chance node occurs: "+percent+"%";
				  text += "<br /> Random comment (by "+randomComment['user']+"):<br />"+randomComment['comment'];
				  return text;}
				    });
			    });
    circles.click(function(event,obj){
		   location.href="http://news.ycombinator.com/"+event.target.comment.link;
	       });
    
};

var updateTree = function(name){
    vis.selectAll("g.node").remove();
    vis.selectAll("path.link").remove();
    displayTree(data[name]);
};

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
		.attr("y", function(d,i){return 25*i;})
		.attr("x", -80)
	    	.attr("dy",".71em")
		.attr("text-anchor", "left")
		.text(function(d, i) {this.name=d;return d; });

	    var maintext = vis.selectAll("text.title")
		.data([0])
		.enter().append("text")
		.attr("class", "title")
		.attr("y", -40)
	    .attr("x",-80)
	    	.attr("dy",".71em")
		.attr("text-anchor", "left")
		.text("Visualizing Hacker News Comments");
	    $.map(["what","why","how","who"], function(name,i){
		      console.log(name,i);
		      vis.selectAll("text."+name)
			  .data([0])
			  .enter().append("text")
			  .attr("class", "asides")
		      	  .attr("id", name)
			  .attr("y", -35)
			  .attr("x",430+80*i)
	    		  .attr("dy",".71em")
			  .attr("text-anchor", "right")
			  .text(name);});
	    
	    $("text#what").tipsy({   gravity: "n", 
			      html: true, 
			      offset: 12,
			      title: function() {
				  return "This graphic displays the average comment tree for the past 50 comments by a user. Hover on a username to switch to their tree. Hover over each node to see more information about the comments commonly found in that position. Click on the node to go to the currently displayed random comment. The color of the node indicates the likelihood that the node would appear on the average comment.";}});

	    $("text#why").tipsy({   gravity: "n", 
			      html: true, 
			      offset: 12,
			      title: function() {
				  return "I wanted to see what the comment structures for hacker news looked"+
				      " like for some of the top commenters. I had this image of what an "+
				      "average comment looked like for pg and friends and I had to test it. Also, I wanted to "+
				      "learn d3 and make a portfoilo project. Click now for more info about "+
				      "how to hire me. I will make you lots of money.";}})
		.click(function(){
			   window.location = "http://www.zacharymaril.com/hire-me";
		       });

	    $("text#how").click(function(){
				    window.location="https://github.com/zmaril/HN-Visual-Comments";
				})
		.tipsy({   gravity: "n", 
			   html: true, 
			   offset: 12,
			   title: function() {
			       return "This was made by crawling hacker news comment threads, processing the html with python, and then using the excellent d3 and tipsy libraries to display all of the information. Click to go to the github page for this project.";
			   }});


	    $("text#who").click(function(){
				    window.location="http://www.zacharymaril.com/who-is-this-guy";
				})
		.tipsy({   gravity: "n", 
			   html: true, 
			   offset: 12,
			   title: function() {
			       return "Made by me, Zack. Click to go to my about page on my shitty blog.";
			   }});


	    $("text.label").hover(function(event){
				      updateTree(event.target.name);
				  });
});
