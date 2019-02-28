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
	
	Hear("Map", "mousedown", function(event){
		cursorLine = [event.target.x, event.target.y];
	});
	Hear("Map", "mouseup", function(event){
		Logic.fill(cursorLine, [event.target.x, event.target.y]);
		cursorLine = null;
	});
	Hear("Map", "dragstart", function(event){
		event.preventDefault();
	});
}

module.exports = CrController;
