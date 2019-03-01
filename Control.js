const Hear = require("./Events.js");

function CrController(Logic, Draw){

	var switchAct = Draw.crSwitch("Tiles", "Objects", "invis");
	Hear("switchAct", "click", function(){
		switchAct();
	})

	Hear("Tiles", "click", function(event){
		if(event.target.swit) event.target.swit();
		
		if(event.target.getAttribute("tile") !== null){
			Logic.changeTile(event.target.parentElement.getAttribute("categ"), event.target.getAttribute("tile"));
		}
	});
	
	Hear("Add", "change", Draw.openJSON(Logic.addTileset));
	
	var cursorLine = null;
	Hear("switchGrid", "click", function(){
		getNode("Grid").classList.toggle("grid-invis");
	})
	
	Hear("Grid", "mousedown", function(event){
		cursorLine = [event.target.x, event.target.y];
	});
	Hear("Grid", "mouseup", function(event){
		Logic.fill(cursorLine, [event.target.x, event.target.y]);
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