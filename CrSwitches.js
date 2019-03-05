const Hear = require("./Events.js");

module.exports = function(Draw){

	Hear("switchAct", "click", Draw.crSwitch("invis", ["Tiles", "Objects"]));

	Hear("Tiles", "click", function(event){
		if(event.target.swit) event.target.swit();
	});

	Hear("Objects", "click", function(event){
		if(event.target.swit) event.target.swit();
	});

	Hear("switchGrid", "click", Draw.crSwitch("grid", "Grid"));

	Hear("Grid", "dragstart", function(event){
		event.preventDefault();
	});
};