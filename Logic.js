const Files = require("./SysFiles.js");

var Tilesets = [];
var ObjSet = [];
var Ground = Array.create(Array.create.bind(null, null, 20), 20);
var Objects = Array.create(Array.create.bind(null, null, 20), 20);



function CrLogic(Draw, def_tileset){
	var current_tile = null;
	var current_objs = null;

	var switchSpace = false;

	if(typeof def_tileset == "object"){
		def_tileset.name = "default";
		addTileset(def_tileset);
	}
	
	/**
	*Functions Load and Save
	*/


	this.addTileset = function(file){
		Files.open(file, function(file){
			var tileset = JSON.parse(file.content);
			tileset.name = file.name;
			addTileset(tileset);
		});
	}

	this.open = function(file){
		Files.open(file, function(file){
			openMap(file.name, JSON.parse(file.content));
		});
	}

	this.save = function(){
		SaveMap(Ground, Objects);
	}

	function addTileset(Tileset){
		var objs = [];
		var tiles = [];

		Tileset.tiles.forEach(function(tile, id){
			if(tile.type != "phisic")
				tile.id = tiles.push(tile) - 1;
			else
				tile.id = objs.push(tile) - 1;
		});

		var ObjSet = Object.assign({}, Tileset);
		ObjSet.tiles = objs;

		Tileset.tiles = tiles;


		Tileset.id = Tilesets.add(Tileset);
		Draw.tiles.add(Tileset);

		ObjSet.id = Tilesets.add(ObjSet);
		Draw.objects.add(ObjSet);
	} 

	function SaveMap(Ground, Objs){

		var TilesMap = {
			ground: sortOutForSave(Ground, [], new Set()),
			objs: sortOutForSave(Objs, [], new Set())
		};

		Files.save("map.json", JSON.stringify(TilesMap, null, 2));
		
	}

	function sortOutForSave(map, tile_types, boxs){
		map.forEach((line)=>{
			line.forEach((box)=>{
				if(box){
					if(tile_types.indexOf(box.tile) === -1)
						tile_types.push(box.tile);

					var save_box = Object.assign({}, box);

					save_box.tile = tile_types.indexOf(box.tile);
					boxs.add(save_box);
				}
			});
		});

		function compareZIndex(a, b) {
  			return a.z_index - b.z_index;
		}

		return {tile_types: tile_types, boxs: Array.from(boxs).sort(compareZIndex)};
	}

	function openMap(name, map){

		var tileset = {tiles: map.ground.tile_types, name: name};
		var categ_ground = Tilesets.add(tileset);
		tileset.id = categ_ground;
		Draw.tiles.add(tileset);

		tileset = {tiles: map.objs.tile_types, name: name};
		var categ_objs = Tilesets.add(tileset);
		tileset.id = categ_objs;
		Draw.objects.add(tileset);

		map.ground.boxs.forEach(box => {
			 drawTile(Ground, box.x, box.y, Tilesets[categ_ground].tiles[box.tile]);
		});

		map.objs.boxs.forEach(box => {
			 drawTile(Objects, box.x, box.y, Tilesets[categ_objs].tiles[box.tile]);
		});
	}



	/**
	*Functions change Ground or Objects
	*/

	this.switchSpace = function(){
		switchSpace = !switchSpace;

		if(!switchSpace && current_tile)
			Draw.pallet.change(current_tile);
		else if(current_objs) 
			Draw.pallet.change(current_objs);
	}

	this.changeTile = function(id_categ, id_tile){
		current_tile = Tilesets[id_categ].tiles[id_tile];
		
		defSize(current_tile, id_categ)
		Draw.pallet.change(current_tile);
	}

	this.changeObjs = function(id_categ, id_tile){
		current_objs = Tilesets[id_categ].tiles[id_tile];
		
		defSize(current_objs, id_categ);
		Draw.pallet.change(current_objs);
	}

	function defSize(tile, id_categ){
		if(!tile.width) tile.width = Tilesets[id_categ].width;
		if(!tile.height) tile.height = Tilesets[id_categ].height;
	}
	
	/**
	*Functions drawing
	*/


	this.draw = function(beg, end){
		if(!switchSpace && current_tile)
			fill(Ground, current_tile, beg, end);
	
		else if(is_empty(Objects, beg, end) && current_objs)
			fill(Objects, current_objs, beg, end);

	}
	this.clear = function(beg, end){
		if(!switchSpace)
			console.log("!!!!!!!!");
		else 
			clear(Objects, beg, end);
	}

	function fill(Map, tile, beg, end){
			
			var inc_x = tile.width;
			var inc_y = tile.height;
			
			for(var i = beg[0]; i + inc_x <= end[0] + 1; i = i + inc_x){
				for(var j = beg[1]; j + inc_y <= end[1] + 1; j = j + inc_y){
					drawTile(Map, i, j, tile);
				}
			}
			
	}
	function clear(Map, beg, end){
			
		for(var i = beg[0]; i <= end[0]; i++){
			for(var j = beg[1]; j <= end[1]; j++){
				if(Map[j][i] !== null){
					dellTile(Map, Map[j][i]);
				}
			}
		}
			
	}

	function is_empty(Map, beg, end){
		var empty = true;

		for(var i = beg[0]; i <= end[0]; i++){
			for(var j = beg[1]; j <= end[1]; j++){
				empty = empty && (Map[j][i] == null);
				if(!empty) return empty;
			}
		}

		return empty;
	}

	/**
	*Functions for tiles
	*/
	
	function drawTile(Map, x, y, tile){
		x = Math.floor(x);
		y = Math.floor(y);

		var box = {tile: tile, x: x, y: y, z_index: 0};

		
		for(var i = 0; i < tile.width; i++){
			for(var j = 0; j < tile.height; j++){
				
				if(Map[j+y][i+x] && Map[j+y][i+x].z_index >= box.z_index)
					box.z_index = Map[j+y][i+x].z_index + 1;

				Map[j+y][i+x] = box;

			}
		}
		
		Draw.append(tile, x, y);
	}

	function dellTile(Map, box){
		
		for(var i = 0; i < box.tile.width; i++){
			for(var j = 0; j < box.tile.height; j++){
				
				Map[j+box.y][i+box.x] = null;
			}
		}
		
		Draw.remove(box);
	}

	function ClearSpaces(){
		Ground = Array.create(Array.create.bind(null, null, 20), 20);
		Objects = Array.create(Array.create.bind(null, null, 20), 20);

		Draw.ground.clear();
		Draw.boxs.clear(); 
	}

	function ClearTilesets(){
		Tilesets = [];
		current_tile = null;
		current_objs = null;

		Draw.tiles.clear();
		Draw.objects.clear();
		Draw.pallet.clear();

	}
}

module.exports = CrLogic;
