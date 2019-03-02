var Tilesets = [];
var Map = Array.create(Array.create.bind(null, null, 20), 20);

function CrLogic(Draw){
	var current_tile = null;
	var current_objs = null;

	var switchSpace = false;
	
	this.addTileset = function(Tileset){
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

		console.log(Tileset, ObjSet);

		Tileset.id = Tilesets.add(Tileset);
		Draw.tiles.add(Tileset);

		ObjSet.id = Tilesets.add(ObjSet);
		Draw.objects.add(ObjSet);
	}

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
	
	this.draw = function(beg, end){
		if(!switchSpace){
			fill(beg, end);
		}

	}

	function fill(beg, end){
		if(current_tile){
			
			var inc_x = current_tile.width;
			var inc_y = current_tile.height;
			
			for(var i = beg[0]; i + inc_x <= end[0] + 1; i = i + inc_x){
				for(var j = beg[1]; j + inc_y <= end[1] + 1; j = j + inc_y){
					drawTile(i, j, current_tile);
				}
			}
			
			
		}
	}
	
	function drawTile(x, y, tile){
		x = Math.floor(x);
		y = Math.floor(y);

		var box = {tile: tile, x: x, y: y};
		
		for(var i = 0; i < tile.width; i++){
			for(var j = 0; j < tile.height; j++){
				
				Map[j+y][i+x] = box;
			}
		}
		
		Draw.map.add(tile, x, y);
	}
}

module.exports = CrLogic;
