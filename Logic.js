var Tilesets = [];
var Map = Array.create(Array.create.bind(null, null, 20), 20);

function CrLogic(Draw){
	var current_tile = null;
	
	this.addTileset = function(Tileset){
		Tileset.id = Tilesets.add(Tileset);
		Draw.tiles.add(Tileset);
	}
	
	this.changeTile = function(id_categ, id_tile){
		current_tile = Tilesets[id_categ].tiles[id_tile];
		
		if(!current_tile.width) current_tile.width = Tilesets[id_categ].width;
		if(!current_tile.height) current_tile.height = Tilesets[id_categ].height;
		
	}
	
	this.fill = function(beg, end){
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
		
		for(var i = 0; i < tile.width; i++){
			for(var j = 0; j < tile.height; j++){
				
				Map[j+y][i+x] = tile;
			}
		}
		
		Draw.map.add(tile, x, y);
	}
}

module.exports = CrLogic;
