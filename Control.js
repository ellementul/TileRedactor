const Hear = require("./Events.js");

function CrController(Logic, Draw){

	var switchAct = Draw.crSwitch("invis", ["Tiles", "Objects"]);
	Hear("switchAct", "click", function(){
		switchAct();
		Logic.switchSpace();
	})

	Hear("Tiles", "click", function(event){
		if(event.target.swit) event.target.swit();
		
		if(event.target.getAttribute("tile") !== null){
			Logic.changeTile(event.target.parentElement.getAttribute("categ"), event.target.getAttribute("tile"));
		}
	});

	Hear("Objects", "click", function(event){
		if(event.target.swit) event.target.swit();
		
		if(event.target.getAttribute("tile") !== null){
			Logic.changeObjs(event.target.parentElement.getAttribute("categ"), event.target.getAttribute("tile"));
		}
	});
	
	Hear("Add", "change", Draw.openJSON(Logic.addTileset));
	
	var cursorLine = null;
	Hear("switchGrid", "click", Draw.crSwitch("grid", "Grid"));
	
	Hear("Grid", "mousedown", function(event){
		cursorLine = [event.target.x, event.target.y];
	});
	Hear("Grid", "mouseup", function(event){
		Logic.draw(cursorLine, [event.target.x, event.target.y]);
		cursorLine = null;
	});
	Hear("Grid", "dragstart", function(event){
		event.preventDefault();
	});
}

module.exports = CrController;


function getNode(id){
	var elem = document.getElementById(id);
	if(!elem) throw new Error("Elem is not find!");
	return elem;
}