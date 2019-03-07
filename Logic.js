const Files = require("./SysFiles.js");

var Tilesets = [];
var Ground = Array.create(Array.create.bind(null, null, 20), 20);
var Objects = Array.create(Array.create.bind(null, null, 20), 20);

function CrLogic(Draw){
	var current_tile = null;
	var current_objs = null;

	var switchSpace = false;
	
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
			ground: sortOutForSave(Ground, new Set(), new Set()),
			objs: sortOutForSave(Objs, new Set(), new Set())
		};

		Files.save("map.json", JSON.stringify(TilesMap));
		
	}

	function sortOutForSave(map, tile_types, boxs){
		map.forEach((line)=>{
			line.forEach((box)=>{
				if(box){
					tile_types.add(box.tile);
					var save_box = Object.assign({}, box);

					save_box.tile = tile_types.has(box.tile);
					boxs.add(save_box);
				}
			});
		});

		return {tile_types: Array.from(tile_types), boxs: Array.from(boxs)};
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
}

module.exports = CrLogic;
