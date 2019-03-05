const Hear = require("./Events.js");

module.exports = function(Logic){

	
	Hear("switchAct", "click", function(){
		Logic.switchSpace();
	});

	Hear("Tiles", "click", function(event){
		
		if(event.target.getAttribute("tile") !== null){
			Logic.changeTile(event.target.parentElement.getAttribute("categ"), event.target.getAttribute("tile"));
		}
	});

	Hear("Objects", "click", function(event){
		
		if(event.target.getAttribute("tile") !== null){
			Logic.changeObjs(event.target.parentElement.getAttribute("categ"), event.target.getAttribute("tile"));
		}
	});
	
	Hear("Add", "change", function(){
		if(this.files[0]) 
			Logic.addTileset(this.files[0]);
	});
	
	var cursorLine = null;
	
	
	Hear("Grid", "mousedown", function(event){
		cursorLine = [event.target.x, event.target.y];
	});
	Hear("Grid", "mouseup", function(event){
		if(event.ctrlKey)
			Logic.clear(cursorLine, [event.target.x, event.target.y]);
		else
			Logic.draw(cursorLine, [event.target.x, event.target.y]);

		cursorLine = null;
	});
	
};


