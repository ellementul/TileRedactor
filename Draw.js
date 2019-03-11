require("typesjs");
const RGB = require('chromath').rgb;
var Base64 = require('js-base64').Base64;

const CrSwitches = require("./CrSwitches.js");

var id_ground = "Ground";
var id_boxs = "Boxs";
var id_grid = "Grid";
var id_tiles = "Tiles";
var id_objects = "Objects";
var id_pallet = "Pallet";

var size = 20;

function CrSpace(id_map, size){
	var container = getNode(id_map);
	
	var coord_arr_tiles = Array.create(Array.create.bind(null, null, 20), 20);
	this.add = function(new_tile, x, y){
		var tile = drawTile(new_tile);
		tile.style.width = (new_tile.width * (100 / size)) + "%";
		tile.style.height = (new_tile.height * (100 / size)) + "%";
		
		tile.style.left = (x * (100 / size)) + "%";
		tile.style.top = (y * (100 / size)) + "%";
		
		container.appendChild(tile);
		coord_arr_tiles[x][y] = tile;
	}
	this.dell = function(box){
		coord_arr_tiles[box.x][box.y].remove();
		coord_arr_tiles[box.x][box.y] = null;
	}

	this.clear = function(){
		coord_arr_tiles.forEach(line => {
			line.forEach(elem => {
				if(elem) elem.remove();
			})
		});
		coord_arr_tiles = Array.create(Array.create.bind(null, null, 20), 20);
	}
	
	function NormTile(tile){
		var box = getComputedStyle(tile);
		tile.style.left = NormCoord(parseFloat(box.left), parseFloat(box.width)) + "%";
		tile.style.top = NormCoord(parseFloat(box.top), parseFloat(box.height)) + "%";
	}
	
	function NormCoord(coord, s){
		var con_size = parseFloat(getComputedStyle(container).width);
		
		if(coord + s > con_size) coord = con_size - s;
		if(coord < 0) coord = 0;
		
		return Math.round((coord / con_size) * size) * (100 / size);
	}
	
}

function CrTiles(id_container){
	var container = getNode(id_container);
	
	this.add = function(Tileset){
		var categ = drawCateg(Tileset);
		container.appendChild(categ);
	}

	this.clear = function(){
		container.children.forEach(elem =>{
			if(elem) elem.remove();
		});
	}
}

function CrPallet(){
	var container = getNode(id_pallet);
	
	this.change = function(tile){
		if(container.children[0]) 
			container.children[0].remove();

		container.appendChild(drawTile(tile));
	}

	this.clear = function(){
		if(container.children[0]) 
			container.children[0].remove();
	}
}

function appendTile(tile, x, y){
	if(tile.durability) 
		this.boxs.add(tile, x, y);
	else
		this.ground.add(tile, x, y);
}

function removeTile(box){
	if(box.tile.durability) 
		this.boxs.dell(box);
	else
		console.log("!!!!!!");
}

drawGrid(getNode(id_grid), size);

 var Draw = {
	ground: new CrSpace(id_ground, size),
	boxs: new CrSpace(id_boxs, size),
	append: appendTile,
	remove: removeTile,
	pallet: new CrPallet(id_pallet),
	tiles: new CrTiles(id_tiles),
	objects: new CrTiles(id_objects),
	crSwitch:  require("./Switch.js")
};
CrSwitches(Draw);
module.exports = Draw;

function drawGrid(container, grid_size){
		var size = 100 / grid_size;
		for(var i = grid_size - 1; i >= 0; i--){
			for(var j = grid_size - 1; j >= 0; j--){
				var box = darwBox(i*size, j*size, size);
				box.x = i;
				box.y = j;
				container.appendChild(box);
			}
		}
	}
	
function darwBox(x, y, size){
	var box = document.createElement('div');
	box.classList.add("box");
	box.style.width = size + "%";
	box.style.height = size + "%";
	
	box.style.left = x + "%";
	box.style.top = y + "%";
	
	return box;
}



function Save(name, text){
	var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
	FileSaver.saveAs(blob, name);
}

function CrSwitchTwo(id, first_id, name_class){
	var elem = getNode(id).classList;
	var first_elem = getNode(first_id).classList;
	return function(){
		elem.toggle(name_class);
		first_elem.toggle(name_class);
	}
}

function drawCateg(new_tileset){
	var categ = document.createElement('div');
	categ.classList.add("panel-column");
	
	var title = document.createElement('h3');
	title.innerHTML = new_tileset.name;
	title.classList.add("title-categ");
	
	
	//var close = document.createElement('button');
	//close.innerHTML = "-";
	//title.appendChild(close);
	
	categ.appendChild(title);
	
	var list = drawTiles(new_tileset.tiles);
	list.setAttribute("categ", new_tileset.id);
	
	title.swit = function(){
		list.classList.toggle("invis");
	}
	
	categ.appendChild(list);
	
	return categ;
}

function drawTiles(tiles){
	var list = document.createElement('div');
	list.classList.add("panel-wrap");
	
	tiles.map(drawTile).forEach(list.appendChild.bind(list));
	return list;
}

function drawTile(new_tile){
	
	if(new_tile.type == "color"){
		var img = document.createElement('div');
		img.style.backgroundColor = new RGB(new_tile.color).toString();
	}
	if(new_tile.type == "svg" || new_tile.type == "phisic"){
		var img = document.createElement('img');
		img.src = "data:image/svg+xml;base64,"+ Base64.encode(new_tile.img);
	}

	img.classList.add("tile");
	img.setAttribute("tile", new_tile.id);
	img.setAttribute("draggable", true);
	
	return img;
}

function getNode(id){
	var elem = document.getElementById(id);
	if(!elem) throw new Error("Elem is not find!");
	return elem;
}
