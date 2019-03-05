(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const Hear = require("./Events.js");

module.exports = function(Logic, Draw){

	
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
	
	Hear("Add", "change", Draw.openJSON(Logic.addTileset));
	
	var cursorLine = null;
	
	
	Hear("Grid", "mousedown", function(event){
		cursorLine = [event.target.x, event.target.y];
	});
	Hear("Grid", "mouseup", function(event){
		Logic.draw(cursorLine, [event.target.x, event.target.y]);
		cursorLine = null;
	});
	
};



},{"./Events.js":4}],2:[function(require,module,exports){
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
},{"./Events.js":4}],3:[function(require,module,exports){
require("typesjs");
const RGB = require('chromath').rgb;
var Base64 = require('js-base64').Base64;

var id_ground = "Ground";
var id_boxs = "Boxs";
var id_grid = "Grid";
var id_tiles = "Tiles";
var id_objects = "Objects";
var id_pallet = "Pallet";

var size = 20;

function CrSpace(id_map, size){
	var container = getNode(id_map);
	
	this.add = function(new_tile, x, y){
		var tile = drawTile(new_tile);
		tile.style.width = (new_tile.width * (100 / size)) + "%";
		tile.style.height = (new_tile.height * (100 / size)) + "%";
		
		tile.style.left = (x * (100 / size)) + "%";
		tile.style.top = (y * (100 / size)) + "%";
		
		container.appendChild(tile);
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
}

function CrPallet(){
	var container = getNode(id_pallet);
	
	this.change = function(tile){
		if(container.children[0]) 
			container.children[0].remove();

		container.appendChild(drawTile(tile));
	}
}

drawGrid(getNode(id_grid), size);

module.exports = {
	map: new CrSpace(id_ground, size),
	boxs: new CrSpace(id_boxs, size),
	pallet: new CrPallet(id_pallet),
	tiles: new CrTiles(id_tiles),
	objects: new CrTiles(id_objects),
	openJSON: OpenFileJSON,
	save: Save,
	crSwitch:  require("./Switch.js")
};

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

function OpenFileJSON(Open){
	return function(){
		if(this.files[0]){
			var name = this.files[0].name;
			var reader = new FileReader();
			
			reader.onload = function(e){
				var file = JSON.parse(e.target.result);
				file.name = name;
				Open(file);
			};
			reader.readAsText(this.files[0]);
		}
	}
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

},{"./Switch.js":6,"chromath":8,"js-base64":15,"typesjs":17}],4:[function(require,module,exports){

function IdEvent(id, name_event, func){
	
	if(name_event == "submit"){
		var old_func = func;
		func = function(e){
			e.preventDefault();
			old_func.apply(this, arguments);
		} 
	}
	
	if(Array.isArray(name_event)){
		name_event.forEach(name => getNode(id).addEventListener(name, func));
	}
	else getNode(id).addEventListener(name_event, func);
}

function Submit(func){
	return function(event){
		event.preventDefault();
		func.apply(this, arguments);
	}
}

function getNode(id){
	var elem = document.getElementById(id);
	if(!elem) throw new Error("Elem is not find!");
	return elem;
}

module.exports = IdEvent;

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
function CrSwitch(name_class, ids){
	if(Array.isArray(ids)){
		var elems = ids.map(getNode);
		elems = elems.map(elem => elem.classList);

		return arrSwicth.bind(null, elems, name_class);
	}
	else if(typeof ids == "object"){
		return objSwitch(ids, name_class);
	}
	else{
		var elem = getNode(ids).classList;
		return oneSwitch.bind(null, name_class, elem);
	}
	
}

function objSwitch(id_obj, class_name){
	for (var key in id_obj){
		id_obj[key] = getNode(id_obj[key]).classList;
	}

	return function(id){
		for (var i in id_obj){
			id_obj[i].add(class_name);
		}
		
		id_obj[id].remove(class_name);
	}
}

function arrSwicth(elem_arr, name_class){
	elem_arr.forEach(oneSwitch.bind(null, name_class));
}

function oneSwitch(name_class, elem){
		elem.toggle(name_class);
}

module.exports = CrSwitch;

function getNode(id){
	var elem = document.getElementById(id);
	if(!elem) throw new Error("Elem is not find!");
	return elem;
}
},{}],7:[function(require,module,exports){
const Draw = require("./Draw.js");
const CrLogic = require("./Logic.js");

const CrContr = require("./Control.js");
const CrSwitches = require("./CrSwitches.js");

var Tileset = require("./tileset.json");
var Logic = new CrLogic(Draw);
CrContr(Logic, Draw);
CrSwitches(Draw);
},{"./Control.js":1,"./CrSwitches.js":2,"./Draw.js":3,"./Logic.js":5,"./tileset.json":18}],8:[function(require,module,exports){
var Chromath = require('./src/chromath.js');
module.exports = Chromath;

},{"./src/chromath.js":9}],9:[function(require,module,exports){
var util = require('./util');
/*
   Class: Chromath
*/
// Group: Constructors
/*
   Constructor: Chromath
   Create a new Chromath instance from a string or integer

   Parameters:
   mixed - The value to use for creating the color

   Returns:
   <Chromath> instance

   Properties:
   r - The red channel of the RGB representation of the Chromath. A number between 0 and 255.
   g - The green channel of the RGB representation of the Chromath. A number between 0 and 255.
   b - The blue channel of the RGB representation of the Chromath. A number between 0 and 255.
   a - The alpha channel of the Chromath. A number between 0 and 1.
   h - The hue of the Chromath. A number between 0 and 360.
   sl - The saturation of the HSL representation of the Chromath. A number between 0 and 1.
   sv - The saturation of the HSV/HSB representation of the Chromath. A number between 0 and 1.
   l - The lightness of the HSL representation of the Chromath. A number between 0 and 1.
   v - The lightness of the HSV/HSB representation of the Chromath. A number between 0 and 1.

   Examples:
  (start code)
// There are many ways to create a Chromath instance
new Chromath('#FF0000');                  // Hex (6 characters with hash)
new Chromath('FF0000');                   // Hex (6 characters without hash)
new Chromath('#F00');                     // Hex (3 characters with hash)
new Chromath('F00');                      // Hex (3 characters without hash)
new Chromath('red');                      // CSS/SVG Color name
new Chromath('rgb(255, 0, 0)');           // RGB via CSS
new Chromath({r: 255, g: 0, b: 0});       // RGB via object
new Chromath('rgba(255, 0, 0, 1)');       // RGBA via CSS
new Chromath({r: 255, g: 0, b: 0, a: 1}); // RGBA via object
new Chromath('hsl(0, 100%, 50%)');        // HSL via CSS
new Chromath({h: 0, s: 1, l: 0.5});       // HSL via object
new Chromath('hsla(0, 100%, 50%, 1)');    // HSLA via CSS
new Chromath({h: 0, s: 1, l: 0.5, a: 1}); // HSLA via object
new Chromath('hsv(0, 100%, 100%)');       // HSV via CSS
new Chromath({h: 0, s: 1, v: 1});         // HSV via object
new Chromath('hsva(0, 100%, 100%, 1)');   // HSVA via CSS
new Chromath({h: 0, s: 1, v: 1, a: 1});   // HSVA via object
new Chromath('hsb(0, 100%, 100%)');       // HSB via CSS
new Chromath({h: 0, s: 1, b: 1});         // HSB via object
new Chromath('hsba(0, 100%, 100%, 1)');   // HSBA via CSS
new Chromath({h: 0, s: 1, b: 1, a: 1});   // HSBA via object
new Chromath(16711680);                   // RGB via integer (alpha currently ignored)
(end code)
*/
function Chromath( mixed )
{
    var channels, color, hsl, hsv, rgb;

    if (util.isString(mixed) || util.isNumber(mixed)) {
        channels = Chromath.parse(mixed);
    } else if (util.isArray(mixed)){
        throw new Error('Unsure how to parse array `'+mixed+'`' +
                        ', please pass an object or CSS style ' +
                        'or try Chromath.rgb, Chromath.hsl, or Chromath.hsv'
                       );
    } else if (mixed instanceof Chromath) {
        channels = util.merge({}, mixed);
    } else if (util.isObject(mixed)){
        channels = util.merge({}, mixed);
    }

    if (! channels)
        throw new Error('Could not parse `'+mixed+'`');
    else if (!isFinite(channels.a))
        channels.a = 1;

    if ('r' in channels ){
        rgb = util.rgb.scaled01([channels.r, channels.g, channels.b]);
        hsl = Chromath.rgb2hsl(rgb);
        hsv = Chromath.rgb2hsv(rgb);
    } else if ('h' in channels ){
        if ('l' in channels){
            hsl = util.hsl.scaled([channels.h, channels.s, channels.l]);
            rgb = Chromath.hsl2rgb(hsl);
            hsv = Chromath.rgb2hsv(rgb);
        } else if ('v' in channels || 'b' in channels) {
            if ('b' in channels) channels.v = channels.b;
            hsv = util.hsl.scaled([channels.h, channels.s, channels.v]);
            rgb = Chromath.hsv2rgb(hsv);
            hsl = Chromath.rgb2hsl(rgb);
        }
    }


    util.merge(this, {
        r:  rgb[0],  g: rgb[1], b: rgb[2],
        h:  hsl[0], sl: hsl[1], l: hsl[2],
        sv: hsv[1],  v: hsv[2], a: channels.a
    });

    return this;
}

/*
  Constructor: Chromath.rgb
  Create a new <Chromath> instance from RGB values

  Parameters:
  r - Number, 0-255, representing the green channel OR Array OR object (with keys r,g,b) of RGB values
  g - Number, 0-255, representing the green channel
  b - Number, 0-255, representing the red channel
  a - (Optional) Float, 0-1, representing the alpha channel

 Returns:
 <Chromath>

 Examples:
 > > new Chromath.rgb(123, 234, 56).toString()
 > "#7BEA38"

 > > new Chromath.rgb([123, 234, 56]).toString()
 > "#7BEA38"

 > > new Chromath.rgb({r: 123, g: 234, b: 56}).toString()
 > "#7BEA38"
 */
Chromath.rgb = function (r, g, b, a)
{
    var rgba = util.rgb.fromArgs(r, g, b, a);
    r = rgba[0], g = rgba[1], b = rgba[2], a = rgba[3];

    return new Chromath({r: r, g: g, b: b, a: a});
};

/*
  Constructor: Chromath.rgba
  Alias for <Chromath.rgb>
*/
Chromath.rgba = Chromath.rgb;

/*
  Constructor: Chromath.hsl
  Create a new Chromath instance from HSL values

  Parameters:
  h - Number, -Infinity - Infinity, representing the hue OR Array OR object (with keys h,s,l) of HSL values
  s - Number, 0-1, representing the saturation
  l - Number, 0-1, representing the lightness
  a - (Optional) Float, 0-1, representing the alpha channel

  Returns:
  <Chromath>

  Examples:
  > > new Chromath.hsl(240, 1, 0.5).toString()
  > "#0000FF"

  > > new Chromath.hsl([240, 1, 0.5]).toString()
  > "#0000FF"

  > new Chromath.hsl({h:240, s:1, l:0.5}).toString()
  > "#0000FF"
 */
Chromath.hsl = function (h, s, l, a)
{
    var hsla = util.hsl.fromArgs(h, s, l, a);
    h = hsla[0], s = hsla[1], l = hsla[2], a = hsla[3];

    return new Chromath({h: h, s: s, l: l, a: a});
};

/*
  Constructor: Chromath.hsla
  Alias for <Chromath.hsl>
*/
Chromath.hsla = Chromath.hsl;

/*
  Constructor: Chromath.hsv
  Create a new Chromath instance from HSV values

  Parameters:
  h - Number, -Infinity - Infinity, representing the hue OR Array OR object (with keys h,s,l) of HSV values
  s - Number, 0-1, representing the saturation
  v - Number, 0-1, representing the lightness
  a - (Optional) Float, 0-1, representing the alpha channel

  Returns:
  <Chromath>

  Examples:
  > > new Chromath.hsv(240, 1, 1).toString()
  > "#0000FF"

  > > new Chromath.hsv([240, 1, 1]).toString()
  > "#0000FF"

  > > new Chromath.hsv({h:240, s:1, v:1}).toString()
  > "#0000FF"
 */
Chromath.hsv = function (h, s, v, a)
{
    var hsva = util.hsl.fromArgs(h, s, v, a);
    h = hsva[0], s = hsva[1], v = hsva[2], a = hsva[3];

    return new Chromath({h: h, s: s, v: v, a: a});
};

/*
  Constructor: Chromath.hsva
  Alias for <Chromath.hsv>
*/
Chromath.hsva = Chromath.hsv;

/*
  Constructor: Chromath.hsb
  Alias for <Chromath.hsv>
 */
Chromath.hsb = Chromath.hsv;

/*
   Constructor: Chromath.hsba
   Alias for <Chromath.hsva>
 */
Chromath.hsba = Chromath.hsva;

// Group: Static methods - representation
/*
  Method: Chromath.toInteger
  Convert a color into an integer (alpha channel currently omitted)

  Parameters:
  color - Accepts the same arguments as the Chromath constructor

  Returns:
  integer

  Examples:
  > > Chromath.toInteger('green');
  > 32768

  > > Chromath.toInteger('white');
  > 16777215
*/
Chromath.toInteger = function (color)
{
    // create something like '008000' (green)
    var hex6 = new Chromath(color).hex().join('');

    // Arguments beginning with `0x` are treated as hex values
    return Number('0x' + hex6);
};

/*
  Method: Chromath.toName
  Return the W3C color name of the color it matches

  Parameters:
  comparison

  Examples:
  > > Chromath.toName('rgb(255, 0, 255)');
  > 'fuchsia'

  > > Chromath.toName(65535);
  > 'aqua'
*/
Chromath.toName = function (comparison)
{
    comparison = +new Chromath(comparison);
    for (var color in Chromath.colors) if (+Chromath[color] == comparison) return color;
};

// Group: Static methods - color conversion
/*
  Method: Chromath.rgb2hex
  Convert an RGB value to a Hex value

  Returns: array

  Example:
  > > Chromath.rgb2hex(50, 100, 150)
  > "[32, 64, 96]"
 */
Chromath.rgb2hex = function rgb2hex(r, g, b)
{
    var rgb = util.rgb.scaled01(r, g, b);
    var hex = rgb.map(function (pct) {
      var dec = Math.round(pct * 255);
      var hex = dec.toString(16).toUpperCase();
      return util.lpad(hex, 2, 0);
    });

    return hex;
};

// Converted from http://en.wikipedia.org/wiki/HSL_and_HSV#General_approach
/*
  Method: Chromath.rgb2hsl
  Convert RGB to HSL

  Parameters:
  r - Number, 0-255, representing the green channel OR Array OR object (with keys r,g,b) of RGB values
  g - Number, 0-255, representing the green channel
  b - Number, 0-255, representing the red channel

  Returns: array

  > > Chromath.rgb2hsl(0, 255, 0);
  > [ 120, 1, 0.5 ]

  > > Chromath.rgb2hsl([0, 0, 255]);
  > [ 240, 1, 0.5 ]

  > > Chromath.rgb2hsl({r: 255, g: 0, b: 0});
  > [ 0, 1, 0.5 ]
 */
Chromath.rgb2hsl = function rgb2hsl(r, g, b)
{
    var rgb = util.rgb.scaled01(r, g, b);
    r = rgb[0], g = rgb[1], b = rgb[2];

    var M = Math.max(r, g, b);
    var m = Math.min(r, g, b);
    var C = M - m;
    var L = 0.5*(M + m);
    var S = (C === 0) ? 0 : C/(1-Math.abs(2*L-1));

    var h;
    if (C === 0) h = 0; // spec'd as undefined, but usually set to 0
    else if (M === r) h = ((g-b)/C) % 6;
    else if (M === g) h = ((b-r)/C) + 2;
    else if (M === b) h = ((r-g)/C) + 4;

    var H = 60 * h;

    return [H, parseFloat(S), parseFloat(L)];
};

/*
  Method: Chromath.rgb2hsv
  Convert RGB to HSV

  Parameters:
  r - Number, 0-255, representing the green channel OR Array OR object (with keys r,g,b) of RGB values
  g - Number, 0-255, representing the green channel
  b - Number, 0-255, representing the red channel

  Returns:
  Array

  > > Chromath.rgb2hsv(0, 255, 0);
  > [ 120, 1, 1 ]

  > > Chromath.rgb2hsv([0, 0, 255]);
  > [ 240, 1, 1 ]

  > > Chromath.rgb2hsv({r: 255, g: 0, b: 0});
  > [ 0, 1, 1 ]
 */
Chromath.rgb2hsv = function rgb2hsv(r, g, b)
{
    var rgb = util.rgb.scaled01(r, g, b);
    r = rgb[0], g = rgb[1], b = rgb[2];

    var M = Math.max(r, g, b);
    var m = Math.min(r, g, b);
    var C = M - m;
    var L = M;
    var S = (C === 0) ? 0 : C/M;

    var h;
    if (C === 0) h = 0; // spec'd as undefined, but usually set to 0
    else if (M === r) h = ((g-b)/C) % 6;
    else if (M === g) h = ((b-r)/C) + 2;
    else if (M === b) h = ((r-g)/C) + 4;

    var H = 60 * h;

    return [H, parseFloat(S), parseFloat(L)];
};

/*
   Method: Chromath.rgb2hsb
   Alias for <Chromath.rgb2hsv>
 */
Chromath.rgb2hsb = Chromath.rgb2hsv;

/*
  Method: Chromath.hsl2rgb
  Convert from HSL to RGB

  Parameters:
  h - Number, -Infinity - Infinity, representing the hue OR Array OR object (with keys h,s,l) of HSL values
  s - Number, 0-1, representing the saturation
  l - Number, 0-1, representing the lightness

  Returns:
  array

  Examples:
  > > Chromath.hsl2rgb(360, 1, 0.5);
  > [ 255, 0, 0 ]

  > > Chromath.hsl2rgb([0, 1, 0.5]);
  > [ 255, 0, 0 ]

  > > Chromath.hsl2rgb({h: 210, s:1, v: 0.5});
  > [ 0, 127.5, 255 ]
 */
// TODO: Can I %= hp and then do a switch?
Chromath.hsl2rgb = function hsl2rgb(h, s, l)
{
    var hsl = util.hsl.scaled(h, s, l);
    h=hsl[0], s=hsl[1], l=hsl[2];

    var C = (1 - Math.abs(2*l-1)) * s;
    var hp = h/60;
    var X = C * (1-Math.abs(hp%2-1));
    var rgb, m;

    switch (Math.floor(hp)){
    case 0:  rgb = [C,X,0]; break;
    case 1:  rgb = [X,C,0]; break;
    case 2:  rgb = [0,C,X]; break;
    case 3:  rgb = [0,X,C]; break;
    case 4:  rgb = [X,0,C]; break;
    case 5:  rgb = [C,0,X]; break;
    default: rgb = [0,0,0];
    }

    m = l - (C/2);

    return [
        (rgb[0]+m),
        (rgb[1]+m),
        (rgb[2]+m)
    ];
};

/*
  Method: Chromath.hsv2rgb
  Convert HSV to RGB

  Parameters:
  h - Number, -Infinity - Infinity, representing the hue OR Array OR object (with keys h,s,v or h,s,b) of HSV values
  s - Number, 0-1, representing the saturation
  v - Number, 0-1, representing the lightness

  Examples:
  > > Chromath.hsv2rgb(360, 1, 1);
  > [ 255, 0, 0 ]

  > > Chromath.hsv2rgb([0, 1, 0.5]);
  > [ 127.5, 0, 0 ]

  > > Chromath.hsv2rgb({h: 210, s: 0.5, v: 1});
  > [ 127.5, 191.25, 255 ]
 */
Chromath.hsv2rgb = function hsv2rgb(h, s, v)
{
    var hsv = util.hsl.scaled(h, s, v);
    h=hsv[0], s=hsv[1], v=hsv[2];

    var C = v * s;
    var hp = h/60;
    var X = C*(1-Math.abs(hp%2-1));
    var rgb, m;

    if (h == undefined)         rgb = [0,0,0];
    else if (0 <= hp && hp < 1) rgb = [C,X,0];
    else if (1 <= hp && hp < 2) rgb = [X,C,0];
    else if (2 <= hp && hp < 3) rgb = [0,C,X];
    else if (3 <= hp && hp < 4) rgb = [0,X,C];
    else if (4 <= hp && hp < 5) rgb = [X,0,C];
    else if (5 <= hp && hp < 6) rgb = [C,0,X];

    m = v - C;

    return [
        (rgb[0]+m),
        (rgb[1]+m),
        (rgb[2]+m)
    ];
};

/*
   Method: Chromath.hsb2rgb
   Alias for <Chromath.hsv2rgb>
 */
Chromath.hsb2rgb = Chromath.hsv2rgb;

/*
    Property: Chromath.convert
    Aliases for the Chromath.x2y functions.
    Use like Chromath.convert[x][y](args) or Chromath.convert.x.y(args)
*/
Chromath.convert = {
    rgb: {
        hex: Chromath.hsv2rgb,
        hsl: Chromath.rgb2hsl,
        hsv: Chromath.rgb2hsv
    },
    hsl: {
        rgb: Chromath.hsl2rgb
    },
    hsv: {
        rgb: Chromath.hsv2rgb
    }
};

/* Group: Static methods - color scheme */
/*
  Method: Chromath.complement
  Return the complement of the given color

  Returns: <Chromath>

  > > Chromath.complement(new Chromath('red'));
  > { r: 0, g: 255, b: 255, a: 1, h: 180, sl: 1, sv: 1, l: 0.5, v: 1 }

  > > Chromath.complement(new Chromath('red')).toString();
  > '#00FFFF'
 */
Chromath.complement = function (color)
{
    var c = new Chromath(color);
    var hsl = c.toHSLObject();

    hsl.h = (hsl.h + 180) % 360;

    return new Chromath(hsl);
};

/*
  Method: Chromath.triad
  Create a triad color scheme from the given Chromath.

  Examples:
  > > Chromath.triad(Chromath.yellow)
  > [ { r: 255, g: 255, b: 0, a: 1, h: 60, sl: 1, sv: 1, l: 0.5, v: 1 },
  >   { r: 0, g: 255, b: 255, a: 1, h: 180, sl: 1, sv: 1, l: 0.5, v: 1 },
  >   { r: 255, g: 0, b: 255, a: 1, h: 300, sl: 1, sv: 1, l: 0.5, v: 1 } ]

 > > Chromath.triad(Chromath.yellow).toString();
 > '#FFFF00,#00FFFF,#FF00FF'
*/
Chromath.triad = function (color)
{
    var c = new Chromath(color);

    return [
        c,
        new Chromath({r: c.b, g: c.r, b: c.g}),
        new Chromath({r: c.g, g: c.b, b: c.r})
    ];
};

/*
  Method: Chromath.tetrad
  Create a tetrad color scheme from the given Chromath.

  Examples:
  > > Chromath.tetrad(Chromath.cyan)
  > [ { r: 0, g: 255, b: 255, a: 1, h: 180, sl: 1, sv: 1, l: 0.5, v: 1 },
  >   { r: 255, g: 0, b: 255, a: 1, h: 300, sl: 1, sv: 1, l: 0.5, v: 1 },
  >   { r: 255, g: 255, b: 0, a: 1, h: 60, sl: 1, sv: 1, l: 0.5, v: 1 },
  >   { r: 0, g: 255, b: 0, a: 1, h: 120, sl: 1, sv: 1, l: 0.5, v: 1 } ]

  > > Chromath.tetrad(Chromath.cyan).toString();
  > '#00FFFF,#FF00FF,#FFFF00,#00FF00'
*/
Chromath.tetrad = function (color)
{
    var c = new Chromath(color);

    return [
        c,
        new Chromath({r: c.b, g: c.r, b: c.b}),
        new Chromath({r: c.b, g: c.g, b: c.r}),
        new Chromath({r: c.r, g: c.b, b: c.r})
    ];
};

/*
  Method: Chromath.analogous
  Find analogous colors from a given color

  Parameters:
  mixed - Any argument which is passed to <Chromath>
  results - How many colors to return (default = 3)
  slices - How many pieces are in the color wheel (default = 12)

  Examples:
  > > Chromath.analogous(new Chromath('rgb(0, 255, 255)'))
  > [ { r: 0, g: 255, b: 255, a: 1, h: 180, sl: 1, sv: 1, l: 0.5, v: 1 },
  >   { r: 0, g: 255, b: 101, a: 1, h: 144, sl: 1, sv: 1, l: 0.5, v: 1 },
  >   { r: 0, g: 255, b: 153, a: 1, h: 156, sl: 1, sv: 1, l: 0.5, v: 1 },
  >   { r: 0, g: 255, b: 203, a: 1, h: 168, sl: 1, sv: 1, l: 0.5, v: 1 },
  >   { r: 0, g: 255, b: 255, a: 1, h: 180, sl: 1, sv: 1, l: 0.5, v: 1 },
  >   { r: 0, g: 203, b: 255, a: 1, h: 192, sl: 1, sv: 1, l: 0.5, v: 1 },
  >   { r: 0, g: 153, b: 255, a: 1, h: 204, sl: 1, sv: 1, l: 0.5, v: 1 },
  >   { r: 0, g: 101, b: 255, a: 1, h: 216, sl: 1, sv: 1, l: 0.5, v: 1 } ]

  > > Chromath.analogous(new Chromath('rgb(0, 255, 255)')).toString()
  > '#00FFFF,#00FF65,#00FF99,#00FFCB,#00FFFF,#00CBFF,#0099FF,#0065FF'
 */
Chromath.analogous = function (color, results, slices)
{
    if (!isFinite(results)) results = 3;
    if (!isFinite(slices)) slices = 12;

    var c = new Chromath(color);
    var hsv = c.toHSVObject();
    var slice = 360 / slices;
    var ret = [ c ];

    hsv.h = ((hsv.h - (slices * results >> 1)) + 720) % 360;
    while (--results) {
        hsv.h = (hsv.h + slice) % 360;
        ret.push(new Chromath(hsv));
    }

    return ret;
};

/*
  Method: Chromath.monochromatic
  Return a series of the given color at various lightnesses

  Examples:
  > > Chromath.monochromatic('rgb(0, 100, 255)').forEach(function (c){ console.log(c.toHSVString()); })
  > hsv(216,100%,20%)
  > hsv(216,100%,40%)
  > hsv(216,100%,60%)
  > hsv(216,100%,80%)
  > hsv(216,100%,100%)
*/
Chromath.monochromatic = function (color, results)
{
    if (!results) results = 5;

    var c = new Chromath(color);
    var hsv = c.toHSVObject();
    var inc = 1 / results;
    var ret = [], step = 0;

    while (step++ < results) {
        hsv.v = step * inc;
        ret.push(new Chromath(hsv));
    }

    return ret;
};

/*
  Method: Chromath.splitcomplement
  Generate a split complement color scheme from the given color

  Examples:
  > > Chromath.splitcomplement('rgb(0, 100, 255)')
  > [ { r: 0, g: 100, b: 255, h: 216.47058823529414, sl: 1, l: 0.5, sv: 1, v: 1, a: 1 },
  >   { r: 255, g: 183, b: 0, h: 43.19999999999999, sl: 1, l: 0.5, sv: 1, v: 1, a: 1 },
  >   { r: 255, g: 73, b: 0, h: 17.279999999999973, sl: 1, l: 0.5, sv: 1, v: 1, a: 1 } ]

  > > Chromath.splitcomplement('rgb(0, 100, 255)').toString()
  > '#0064FF,#FFB700,#FF4900'
 */
Chromath.splitcomplement = function (color)
{
    var ref = new Chromath(color);
    var hsv = ref.toHSVObject();

    var a = new Chromath.hsv({
        h: (hsv.h + 150) % 360,
        s: hsv.s,
        v: hsv.v
    });

    var b = new Chromath.hsv({
        h: (hsv.h + 210) % 360,
        s: hsv.s,
        v: hsv.v
    });

    return [ref, a, b];
};

//Group: Static methods - color alteration
/*
  Method: Chromath.tint
  Lighten a color by adding a percentage of white to it

  Returns <Chromath>

  > > Chromath.tint('rgb(0, 100, 255)', 0.5).toRGBString();
  > 'rgb(127,177,255)'
*/
Chromath.tint = function ( from, by )
{
    return Chromath.towards( from, '#FFFFFF', by );
};

/*
   Method: Chromath.lighten
   Alias for <Chromath.tint>
*/
Chromath.lighten = Chromath.tint;

/*
  Method: Chromath.shade
  Darken a color by adding a percentage of black to it

  Example:
  > > Chromath.darken('rgb(0, 100, 255)', 0.5).toRGBString();
  > 'rgb(0,50,127)'
 */
Chromath.shade = function ( from, by )
{
    return Chromath.towards( from, '#000000', by );
};

/*
   Method: Chromath.darken
   Alias for <Chromath.shade>
 */
Chromath.darken = Chromath.shade;

/*
  Method: Chromath.desaturate
  Desaturate a color using any of 3 approaches

  Parameters:
  color - any argument accepted by the <Chromath> constructor
  formula - The formula to use (from <xarg's greyfilter at http://www.xarg.org/project/jquery-color-plugin-xcolor>)
  - 1 - xarg's own formula
  - 2 - Sun's formula: (1 - avg) / (100 / 35) + avg)
  - empty - The oft-seen 30% red, 59% green, 11% blue formula

  Examples:
  > > Chromath.desaturate('red').toString()
  > "#4C4C4C"

  > > Chromath.desaturate('red', 1).toString()
  > "#373737"

  > > Chromath.desaturate('red', 2).toString()
  > "#909090"
*/
Chromath.desaturate = function (color, formula)
{
    var c = new Chromath(color), rgb, avg;

    switch (formula) {
    case 1: // xarg's formula
        avg = .35 + 13 * (c.r + c.g + c.b) / 60; break;
    case 2: // Sun's formula: (1 - avg) / (100 / 35) + avg)
        avg = (13 * (c.r + c.g + c.b) + 5355) / 60; break;
    default:
        avg = c.r * .3 + c.g * .59 + c.b * .11;
    }

    avg = util.clamp(avg, 0, 255);
    rgb = {r: avg, g: avg, b: avg};

    return new Chromath(rgb);
};

/*
  Method: Chromath.greyscale
  Alias for <Chromath.desaturate>
*/
Chromath.greyscale = Chromath.desaturate;

/*
  Method: Chromath.websafe
  Convert a color to one of the 216 "websafe" colors

  Examples:
  > > Chromath.websafe('#ABCDEF').toString()
  > '#99CCFF'

  > > Chromath.websafe('#BBCDEF').toString()
  > '#CCCCFF'
 */
Chromath.websafe = function (color)
{
    color = new Chromath(color);

    color.r = Math.round(color.r / 51) * 51;
    color.g = Math.round(color.g / 51) * 51;
    color.b = Math.round(color.b / 51) * 51;

    return new Chromath(color);
};

//Group: Static methods - color combination
/*
  Method: Chromath.additive
  Combine any number colors using additive color

  Examples:
  > > Chromath.additive('#F00', '#0F0').toString();
  > '#FFFF00'

  > > Chromath.additive('#F00', '#0F0').toString() == Chromath.yellow.toString();
  > true

  > > Chromath.additive('red', '#0F0', 'rgb(0, 0, 255)').toString() == Chromath.white.toString();
  > true
 */
Chromath.additive = function ()
{
    var args = arguments.length-2, i=-1, a, b;
    while (i++ < args){

        a = a || new Chromath(arguments[i]);
        b = new Chromath(arguments[i+1]);

        if ((a.r += b.r) > 255) a.r = 255;
        if ((a.g += b.g) > 255) a.g = 255;
        if ((a.b += b.b) > 255) a.b = 255;

        a = new Chromath(a);
    }

    return a;
};

/*
  Method: Chromath.subtractive
  Combine any number of colors using subtractive color

  Examples:
  > > Chromath.subtractive('yellow', 'magenta').toString();
  > '#FF0000'

  > > Chromath.subtractive('yellow', 'magenta').toString() === Chromath.red.toString();
  > true

  > > Chromath.subtractive('cyan', 'magenta', 'yellow').toString();
  > '#000000'

  > > Chromath.subtractive('red', '#0F0', 'rgb(0, 0, 255)').toString();
  > '#000000'
*/
Chromath.subtractive = function ()
{
    var args = arguments.length-2, i=-1, a, b;
    while (i++ < args){

        a = a || new Chromath(arguments[i]);
        b = new Chromath(arguments[i+1]);

        if ((a.r += b.r - 255) < 0) a.r = 0;
        if ((a.g += b.g - 255) < 0) a.g = 0;
        if ((a.b += b.b - 255) < 0) a.b = 0;

        a = new Chromath(a);
    }

    return a;
};

/*
  Method: Chromath.multiply
  Multiply any number of colors

  Examples:
  > > Chromath.multiply(Chromath.lightgoldenrodyellow, Chromath.lightblue).toString();
  > "#A9D3BD"

  > > Chromath.multiply(Chromath.oldlace, Chromath.lightblue, Chromath.darkblue).toString();
  > "#000070"
*/
Chromath.multiply = function ()
{
    var args = arguments.length-2, i=-1, a, b;
    while (i++ < args){

        a = a || new Chromath(arguments[i]);
        b = new Chromath(arguments[i+1]);

        a.r = (a.r / 255 * b.r)|0;
        a.g = (a.g / 255 * b.g)|0;
        a.b = (a.b / 255 * b.b)|0;

        a = new Chromath(a);
    }

    return a;
};

/*
  Method: Chromath.average
  Averages any number of colors

  Examples:
  > > Chromath.average(Chromath.lightgoldenrodyellow, Chromath.lightblue).toString()
  > "#D3E9DC"

  > > Chromath.average(Chromath.oldlace, Chromath.lightblue, Chromath.darkblue).toString()
  > "#6A73B8"
 */
Chromath.average = function ()
{
    var args = arguments.length-2, i=-1, a, b;
    while (i++ < args){

        a = a || new Chromath(arguments[i]);
        b = new Chromath(arguments[i+1]);

        a.r = (a.r + b.r) >> 1;
        a.g = (a.g + b.g) >> 1;
        a.b = (a.b + b.b) >> 1;

        a = new Chromath(a);
    }

    return a;
};

/*
  Method: Chromath.overlay
  Add one color on top of another with a given transparency

  Examples:
  > > Chromath.average(Chromath.lightgoldenrodyellow, Chromath.lightblue).toString()
  > "#D3E9DC"

  > > Chromath.average(Chromath.oldlace, Chromath.lightblue, Chromath.darkblue).toString()
  > "#6A73B8"
 */
Chromath.overlay = function (top, bottom, opacity)
{
    var a = new Chromath(top);
    var b = new Chromath(bottom);

    if (opacity > 1) opacity /= 100;
    opacity = util.clamp(opacity - 1 + b.a, 0, 1);

    return new Chromath({
        r: util.lerp(a.r, b.r, opacity),
        g: util.lerp(a.g, b.g, opacity),
        b: util.lerp(a.b, b.b, opacity)
    });
};


//Group: Static methods - other
/*
  Method: Chromath.towards
  Move from one color towards another by the given percentage (0-1, 0-100)

  Parameters:
  from - The starting color
  to - The destination color
  by - The percentage, expressed as a floating number between 0 and 1, to move towards the destination color
  interpolator - The function to use for interpolating between the two points. Defaults to Linear Interpolation. Function has the signature `(from, to, by)` with the parameters having the same meaning as those in `towards`.

  > > Chromath.towards('red', 'yellow', 0.5).toString()
  > "#FF7F00"
*/
Chromath.towards = function (from, to, by, interpolator)
{
    if (!to) { return from; }
    if (!isFinite(by))
        throw new Error('TypeError: `by`(' + by  +') should be between 0 and 1');
    if (!(from instanceof Chromath)) from = new Chromath(from);
    if (!(to instanceof Chromath)) to = new Chromath(to || '#FFFFFF');
    if (!interpolator) interpolator = util.lerp;
    by = parseFloat(by);

    return new Chromath({
        r: interpolator(from.r, to.r, by),
        g: interpolator(from.g, to.g, by),
        b: interpolator(from.b, to.b, by),
        a: interpolator(from.a, to.a, by)
    });
};

/*
  Method: Chromath.gradient
  Create an array of Chromath objects

  Parameters:
  from - The beginning color of the gradient
  to - The end color of the gradient
  slices - The number of colors in the array
  slice - The color at a specific, 1-based, slice index

  Examples:
  > > Chromath.gradient('red', 'yellow').length;
  > 20

  > > Chromath.gradient('red', 'yellow', 5).toString();
  > "#FF0000,#FF3F00,#FF7F00,#FFBF00,#FFFF00"

  > > Chromath.gradient('red', 'yellow', 5, 2).toString();
  > "#FF7F00"

  > > Chromath.gradient('red', 'yellow', 5)[2].toString();
  > "#FF7F00"
 */
Chromath.gradient = function (from, to, slices, slice)
{
    var gradient = [], stops;

    if (! slices) slices = 20;
    stops = (slices-1);

    if (isFinite(slice)) return Chromath.towards(from, to, slice/stops);
    else slice = -1;

    while (++slice < slices){
        gradient.push(Chromath.towards(from, to, slice/stops));
    }

    return gradient;
};

/*
  Method: Chromath.parse
  Iterate through the objects set in Chromath.parsers and, if a match is made, return the value specified by the matching parsers `process` function

  Parameters:
  string - The string to parse

  Example:
  > > Chromath.parse('rgb(0, 128, 255)')
  > { r: 0, g: 128, b: 255, a: undefined }
 */
Chromath.parse = function (string)
{
    var parsers = Chromath.parsers, i, l, parser, parts, channels;

    for (i = 0, l = parsers.length; i < l; i++) {
        parser = parsers[i];
        parts = parser.regex.exec(string);
        if (parts && parts.length) channels = parser.process.apply(this, parts);
        if (channels) return channels;
    }
};

// Group: Static properties
/*
  Property: Chromath.parsers
   An array of objects for attempting to convert a string describing a color into an object containing the various channels. No user action is required but parsers can be

   Object properties:
   regex - regular expression used to test the string or numeric input
   process - function which is passed the results of `regex.match` and returns an object with either the rgb, hsl, hsv, or hsb channels of the Chromath.

   Examples:
(start code)
// Add a parser
Chromath.parsers.push({
    example: [3554431, 16809984],
    regex: /^\d+$/,
    process: function (color){
        return {
            r: color >> 16 & 255,
            g: color >> 8 & 255,
            b: color & 255
        };
    }
});
(end code)
(start code)
// Override entirely
Chromath.parsers = [
   {
       example: [3554431, 16809984],
       regex: /^\d+$/,
       process: function (color){
           return {
               r: color >> 16 & 255,
               g: color >> 8 & 255,
               b: color & 255
           };
       }
   },

   {
       example: ['#fb0', 'f0f'],
       regex: /^#?([\dA-F]{1})([\dA-F]{1})([\dA-F]{1})$/i,
       process: function (hex, r, g, b){
           return {
               r: parseInt(r + r, 16),
               g: parseInt(g + g, 16),
               b: parseInt(b + b, 16)
           };
       }
   }
(end code)
 */
Chromath.parsers = require('./parsers').parsers;

// Group: Instance methods - color representation
Chromath.prototype = require('./prototype')(Chromath);

/*
  Property: Chromath.colors
  Object, indexed by SVG/CSS color name, of <Chromath> instances
  The color names from CSS and SVG 1.0

  Examples:
  > > Chromath.colors.aliceblue.toRGBArray()
  > [240, 248, 255]

  > > Chromath.colors.beige.toString()
  > "#F5F5DC"

  > // Can also be accessed without `.color`
  > > Chromath.aliceblue.toRGBArray()
  > [240, 248, 255]

  > > Chromath.beige.toString()
  > "#F5F5DC"
*/
var css2Colors  = require('./colornames_css2');
var css3Colors  = require('./colornames_css3');
var allColors   = util.merge({}, css2Colors, css3Colors);
Chromath.colors = {};
for (var colorName in allColors) {
    // e.g., Chromath.wheat and Chromath.colors.wheat
    Chromath[colorName] = Chromath.colors[colorName] = new Chromath(allColors[colorName]);
}
// add a parser for the color names
Chromath.parsers.push({
    example: ['red', 'burlywood'],
    regex: /^[a-z]+$/i,
    process: function (colorName){
        if (Chromath.colors[colorName]) return Chromath.colors[colorName];
    }
});

module.exports = Chromath;

},{"./colornames_css2":10,"./colornames_css3":11,"./parsers":12,"./prototype":13,"./util":14}],10:[function(require,module,exports){
module.exports = {
    // from http://www.w3.org/TR/REC-html40/types.html#h-6.5
    aqua    : {r: 0,   g: 255, b: 255},
    black   : {r: 0,   g: 0,   b: 0},
    blue    : {r: 0,   g: 0,   b: 255},
    fuchsia : {r: 255, g: 0,   b: 255},
    gray    : {r: 128, g: 128, b: 128},
    green   : {r: 0,   g: 128, b: 0},
    lime    : {r: 0,   g: 255, b: 0},
    maroon  : {r: 128, g: 0,   b: 0},
    navy    : {r: 0,   g: 0,   b: 128},
    olive   : {r: 128, g: 128, b: 0},
    purple  : {r: 128, g: 0,   b: 128},
    red     : {r: 255, g: 0,   b: 0},
    silver  : {r: 192, g: 192, b: 192},
    teal    : {r: 0,   g: 128, b: 128},
    white   : {r: 255, g: 255, b: 255},
    yellow  : {r: 255, g: 255, b: 0}
};

},{}],11:[function(require,module,exports){
module.exports = {
    // http://www.w3.org/TR/css3-color/#svg-color
    // http://www.w3.org/TR/SVG/types.html#ColorKeywords
    aliceblue            : {r: 240, g: 248, b: 255},
    antiquewhite         : {r: 250, g: 235, b: 215},
    aquamarine           : {r: 127, g: 255, b: 212},
    azure                : {r: 240, g: 255, b: 255},
    beige                : {r: 245, g: 245, b: 220},
    bisque               : {r: 255, g: 228, b: 196},
    blanchedalmond       : {r: 255, g: 235, b: 205},
    blueviolet           : {r: 138, g: 43,  b: 226},
    brown                : {r: 165, g: 42,  b: 42},
    burlywood            : {r: 222, g: 184, b: 135},
    cadetblue            : {r: 95,  g: 158, b: 160},
    chartreuse           : {r: 127, g: 255, b: 0},
    chocolate            : {r: 210, g: 105, b: 30},
    coral                : {r: 255, g: 127, b: 80},
    cornflowerblue       : {r: 100, g: 149, b: 237},
    cornsilk             : {r: 255, g: 248, b: 220},
    crimson              : {r: 220, g: 20,  b: 60},
    cyan                 : {r: 0,   g: 255, b: 255},
    darkblue             : {r: 0,   g: 0,   b: 139},
    darkcyan             : {r: 0,   g: 139, b: 139},
    darkgoldenrod        : {r: 184, g: 134, b: 11},
    darkgray             : {r: 169, g: 169, b: 169},
    darkgreen            : {r: 0,   g: 100, b: 0},
    darkgrey             : {r: 169, g: 169, b: 169},
    darkkhaki            : {r: 189, g: 183, b: 107},
    darkmagenta          : {r: 139, g: 0,   b: 139},
    darkolivegreen       : {r: 85,  g: 107, b: 47},
    darkorange           : {r: 255, g: 140, b: 0},
    darkorchid           : {r: 153, g: 50,  b: 204},
    darkred              : {r: 139, g: 0,   b: 0},
    darksalmon           : {r: 233, g: 150, b: 122},
    darkseagreen         : {r: 143, g: 188, b: 143},
    darkslateblue        : {r: 72,  g: 61,  b: 139},
    darkslategray        : {r: 47,  g: 79,  b: 79},
    darkslategrey        : {r: 47,  g: 79,  b: 79},
    darkturquoise        : {r: 0,   g: 206, b: 209},
    darkviolet           : {r: 148, g: 0,   b: 211},
    deeppink             : {r: 255, g: 20,  b: 147},
    deepskyblue          : {r: 0,   g: 191, b: 255},
    dimgray              : {r: 105, g: 105, b: 105},
    dimgrey              : {r: 105, g: 105, b: 105},
    dodgerblue           : {r: 30,  g: 144, b: 255},
    firebrick            : {r: 178, g: 34,  b: 34},
    floralwhite          : {r: 255, g: 250, b: 240},
    forestgreen          : {r: 34,  g: 139, b: 34},
    gainsboro            : {r: 220, g: 220, b: 220},
    ghostwhite           : {r: 248, g: 248, b: 255},
    gold                 : {r: 255, g: 215, b: 0},
    goldenrod            : {r: 218, g: 165, b: 32},
    greenyellow          : {r: 173, g: 255, b: 47},
    grey                 : {r: 128, g: 128, b: 128},
    honeydew             : {r: 240, g: 255, b: 240},
    hotpink              : {r: 255, g: 105, b: 180},
    indianred            : {r: 205, g: 92,  b: 92},
    indigo               : {r: 75,  g: 0,   b: 130},
    ivory                : {r: 255, g: 255, b: 240},
    khaki                : {r: 240, g: 230, b: 140},
    lavender             : {r: 230, g: 230, b: 250},
    lavenderblush        : {r: 255, g: 240, b: 245},
    lawngreen            : {r: 124, g: 252, b: 0},
    lemonchiffon         : {r: 255, g: 250, b: 205},
    lightblue            : {r: 173, g: 216, b: 230},
    lightcoral           : {r: 240, g: 128, b: 128},
    lightcyan            : {r: 224, g: 255, b: 255},
    lightgoldenrodyellow : {r: 250, g: 250, b: 210},
    lightgray            : {r: 211, g: 211, b: 211},
    lightgreen           : {r: 144, g: 238, b: 144},
    lightgrey            : {r: 211, g: 211, b: 211},
    lightpink            : {r: 255, g: 182, b: 193},
    lightsalmon          : {r: 255, g: 160, b: 122},
    lightseagreen        : {r: 32,  g: 178, b: 170},
    lightskyblue         : {r: 135, g: 206, b: 250},
    lightslategray       : {r: 119, g: 136, b: 153},
    lightslategrey       : {r: 119, g: 136, b: 153},
    lightsteelblue       : {r: 176, g: 196, b: 222},
    lightyellow          : {r: 255, g: 255, b: 224},
    limegreen            : {r: 50,  g: 205, b: 50},
    linen                : {r: 250, g: 240, b: 230},
    magenta              : {r: 255, g: 0,   b: 255},
    mediumaquamarine     : {r: 102, g: 205, b: 170},
    mediumblue           : {r: 0,   g: 0,   b: 205},
    mediumorchid         : {r: 186, g: 85,  b: 211},
    mediumpurple         : {r: 147, g: 112, b: 219},
    mediumseagreen       : {r: 60,  g: 179, b: 113},
    mediumslateblue      : {r: 123, g: 104, b: 238},
    mediumspringgreen    : {r: 0,   g: 250, b: 154},
    mediumturquoise      : {r: 72,  g: 209, b: 204},
    mediumvioletred      : {r: 199, g: 21,  b: 133},
    midnightblue         : {r: 25,  g: 25,  b: 112},
    mintcream            : {r: 245, g: 255, b: 250},
    mistyrose            : {r: 255, g: 228, b: 225},
    moccasin             : {r: 255, g: 228, b: 181},
    navajowhite          : {r: 255, g: 222, b: 173},
    oldlace              : {r: 253, g: 245, b: 230},
    olivedrab            : {r: 107, g: 142, b: 35},
    orange               : {r: 255, g: 165, b: 0},
    orangered            : {r: 255, g: 69,  b: 0},
    orchid               : {r: 218, g: 112, b: 214},
    palegoldenrod        : {r: 238, g: 232, b: 170},
    palegreen            : {r: 152, g: 251, b: 152},
    paleturquoise        : {r: 175, g: 238, b: 238},
    palevioletred        : {r: 219, g: 112, b: 147},
    papayawhip           : {r: 255, g: 239, b: 213},
    peachpuff            : {r: 255, g: 218, b: 185},
    peru                 : {r: 205, g: 133, b: 63},
    pink                 : {r: 255, g: 192, b: 203},
    plum                 : {r: 221, g: 160, b: 221},
    powderblue           : {r: 176, g: 224, b: 230},
    rosybrown            : {r: 188, g: 143, b: 143},
    royalblue            : {r: 65,  g: 105, b: 225},
    saddlebrown          : {r: 139, g: 69,  b: 19},
    salmon               : {r: 250, g: 128, b: 114},
    sandybrown           : {r: 244, g: 164, b: 96},
    seagreen             : {r: 46,  g: 139, b: 87},
    seashell             : {r: 255, g: 245, b: 238},
    sienna               : {r: 160, g: 82,  b: 45},
    skyblue              : {r: 135, g: 206, b: 235},
    slateblue            : {r: 106, g: 90,  b: 205},
    slategray            : {r: 112, g: 128, b: 144},
    slategrey            : {r: 112, g: 128, b: 144},
    snow                 : {r: 255, g: 250, b: 250},
    springgreen          : {r: 0,   g: 255, b: 127},
    steelblue            : {r: 70,  g: 130, b: 180},
    tan                  : {r: 210, g: 180, b: 140},
    thistle              : {r: 216, g: 191, b: 216},
    tomato               : {r: 255, g: 99,  b: 71},
    turquoise            : {r: 64,  g: 224, b: 208},
    violet               : {r: 238, g: 130, b: 238},
    wheat                : {r: 245, g: 222, b: 179},
    whitesmoke           : {r: 245, g: 245, b: 245},
    yellowgreen          : {r: 154, g: 205, b: 50}
}

},{}],12:[function(require,module,exports){
var util = require('./util');

module.exports = {
    parsers: [
        {
            example: [3554431, 16809984],
            regex: /^\d+$/,
            process: function (color){
                return {
                    //a: color >> 24 & 255,
                    r: color >> 16 & 255,
                    g: color >> 8 & 255,
                    b: color & 255
                };
            }
        },

        {
            example: ['#fb0', 'f0f'],
            regex: /^#?([\dA-F]{1})([\dA-F]{1})([\dA-F]{1})$/i,
            process: function (hex, r, g, b){
                return {
                    r: parseInt(r + r, 16),
                    g: parseInt(g + g, 16),
                    b: parseInt(b + b, 16)
                };
            }
        },

        {
            example: ['#00ff00', '336699'],
            regex: /^#?([\dA-F]{2})([\dA-F]{2})([\dA-F]{2})$/i,
            process: function (hex, r, g, b){
                return {
                    r: parseInt(r, 16),
                    g: parseInt(g, 16),
                    b: parseInt(b, 16)
                };
            }
        },

        {
            example: ['rgb(123, 234, 45)', 'rgb(25, 50%, 100%)', 'rgba(12%, 34, 56%, 0.78)'],
            // regex: /^rgba*\((\d{1,3}\%*),\s*(\d{1,3}\%*),\s*(\d{1,3}\%*)(?:,\s*([0-9.]+))?\)/,
            regex: /^rgba*\(([0-9]*\.?[0-9]+\%*),\s*([0-9]*\.?[0-9]+\%*),\s*([0-9]*\.?[0-9]+\%*)(?:,\s*([0-9.]+))?\)/,
            process: function (s,r,g,b,a)
            {
                r = r && r.slice(-1) == '%' ? (r.slice(0,-1) / 100) : r*1;
                g = g && g.slice(-1) == '%' ? (g.slice(0,-1) / 100) : g*1;
                b = b && b.slice(-1) == '%' ? (b.slice(0,-1) / 100) : b*1;
                a = a*1;

                return {
                    r: util.clamp(r, 0, 255),
                    g: util.clamp(g, 0, 255),
                    b: util.clamp(b, 0, 255),
                    a: util.clamp(a, 0, 1) || undefined
                };
            }
        },

        {
            example: ['hsl(123, 34%, 45%)', 'hsla(25, 50%, 100%, 0.75)', 'hsv(12, 34%, 56%)'],
            regex: /^hs([bvl])a*\((\d{1,3}\%*),\s*(\d{1,3}\%*),\s*(\d{1,3}\%*)(?:,\s*([0-9.]+))?\)/,
            process: function (c,lv,h,s,l,a)
            {
                h *= 1;
                s = s.slice(0,-1) / 100;
                l = l.slice(0,-1) / 100;
                a *= 1;

                var obj = {
                    h: util.clamp(h, 0, 360),
                    a: util.clamp(l, 0, 1)
                };
                // `s` is used in many different spaces (HSL, HSV, HSB)
                // so we use `sl`, `sv` and `sb` to differentiate
                obj['s'+lv] = util.clamp(s, 0, 1),
                obj[lv] = util.clamp(l, 0, 1);

                return obj;
            }
        }
    ]
};

},{"./util":14}],13:[function(require,module,exports){
module.exports = function ChromathPrototype(Chromath) {
  return {
      /*
         Method: toName
         Call <Chromath.toName> on the current instance
         > > var color = new Chromath('rgb(173, 216, 230)');
         > > color.toName();
         > "lightblue"
      */
      toName: function (){ return Chromath.toName(this); },

      /*
         Method: toString
         Display the instance as a string. Defaults to <Chromath.toHexString>
         > > var color = Chromath.rgb(56, 78, 90);
         > > Color.toHexString();
         > "#384E5A"
      */
      toString: function (){ return this.toHexString(); },

      /*
         Method: valueOf
         Display the instance as an integer. Defaults to <Chromath.toInteger>
         > > var yellow = new Chromath('yellow');
         > > yellow.valueOf();
         > 16776960
         > > +yellow
         > 16776960
      */
      valueOf: function (){ return Chromath.toInteger(this); },

    /*
       Method: rgb
       Return the RGB array of the instance
       > > new Chromath('red').rgb();
       > [255, 0, 0]
    */
      rgb: function (){ return this.toRGBArray(); },

      /*
         Method: toRGBArray
         Return the RGB array of the instance
         > > Chromath.burlywood.toRGBArray();
         > [255, 184, 135]
      */
      toRGBArray: function (){ return this.toRGBAArray().slice(0,3); },

      /*
         Method: toRGBObject
         Return the RGB object of the instance
         > > new Chromath('burlywood').toRGBObject();
         > {r: 255, g: 184, b: 135}
      */
      toRGBObject: function ()
      {
          var rgb = this.toRGBArray();

          return {r: rgb[0], g: rgb[1], b: rgb[2]};
      },

      /*
         Method: toRGBString
         Return the RGB string of the instance
         > > new Chromath('aliceblue').toRGBString();
         > "rgb(240,248,255)"
      */
      toRGBString: function ()
      {
          return "rgb("+ this.toRGBArray().join(",") +")";
      },

      /*
         Method: rgba
         Return the RGBA array of the instance
         > > new Chromath('red').rgba();
         > [255, 0, 0, 1]
      */
      rgba: function (){ return this.toRGBAArray(); },

      /*
         Method: toRGBAArray
         Return the RGBA array of the instance
         > > Chromath.lime.toRGBAArray();
         > [0, 255, 0, 1]
      */
      toRGBAArray: function ()
      {
          var rgba = [
              Math.round(this.r*255),
              Math.round(this.g*255),
              Math.round(this.b*255),
              parseFloat(this.a)
          ];

          return rgba;
      },

      /*
         Method: toRGBAObject
         Return the RGBA object of the instance
         > > Chromath.cadetblue.toRGBAObject();
         > {r: 95, g: 158, b: 160}
      */
      toRGBAObject: function ()
      {
          var rgba = this.toRGBAArray();

          return {r: rgba[0], g: rgba[1], b: rgba[2], a: rgba[3]};
      },

      /*
         Method: toRGBAString
         Return the RGBA string of the instance
         > > new Chromath('darkblue').toRGBAString();
         > "rgba(0,0,139,1)"
      */
      toRGBAString: function (){
          return "rgba("+ this.toRGBAArray().join(",") +")";
      },

      /*
         Method: hex
         Return the hex array of the instance
         > new Chromath('darkgreen').hex()
         [ '00', '64', '00' ]
      */
      hex: function (){ return this.toHexArray(); },

      /*
        Method: toHexArray
         Return the hex array of the instance
        > > Chromath.firebrick.toHexArray();
        > ["B2", "22", "22"]
      */
      toHexArray: function (){
          return Chromath.rgb2hex(this.r, this.g, this.b);
      },

      /*
         Method: toHexObject
         Return the hex object of the instance
         > > Chromath.gainsboro.toHexObject();
         > {r: "DC", g: "DC", b: "DC"}
      */
      toHexObject: function ()
      {
          var hex = this.toHexArray();

          return { r: hex[0], g: hex[1], b: hex[2] };
      },

      /*
        Method: toHexString
         Return the hex string of the instance
        > > Chromath.honeydew.toHexString();
        > "#F0FFF0"
      */
      toHexString: function (){
          var hex = this.toHexArray();

          return '#' + hex.join('');
      },

      /*
         Method: hsl
         Return the HSL array of the instance
         > >new Chromath('green').hsl();
         > [120, 1, 0.25098039215686274]
      */
      hsl: function (){ return this.toHSLArray(); },

      /*
         Method: toHSLArray
         Return the HSL array of the instance
         > > new Chromath('red').toHSLArray();
         > [0, 1, 0.5]
      */
      toHSLArray: function (){
          return this.toHSLAArray().slice(0,3);
      },

      /*
         Method: toHSLObject
         Return the HSL object of the instance
         > > new Chromath('red').toHSLObject();
         [h:0, s:1, l:0.5]
      */
      toHSLObject: function ()
      {
          var hsl = this.toHSLArray();

          return {h: hsl[0], s: hsl[1], l: hsl[2]};
      },

      /*
         Method: toHSLString
         Return the HSL string of the instance
         > > new Chromath('red').toHSLString();
         > "hsl(0,1,0.5)"
      */
      toHSLString: function (){
          var hsla = this.toHSLAArray();
          var vals = [
              hsla[0],
              Math.round(hsla[1]*100)+'%',
              Math.round(hsla[2]*100)+'%'
          ];

          return 'hsl('+ vals +')';
      },

      /*
        Method: hsla
        Return the HSLA array of the instance
        > > new Chromath('green').hsla();
        > [120, 1, 0.25098039215686274, 1]
      */
      hsla: function (){ return this.toHSLAArray(); },

      /*
         Method: toHSLArray
         Return the HSLA array of the instance
         > > Chromath.antiquewhite.toHSLAArray();
         > [34, 0.7777777777777773, 0.9117647058823529, 1]
      */
      toHSLAArray: function ()
      {
          return [
              Math.round(this.h),
              parseFloat(this.sl),
              parseFloat(this.l),
              parseFloat(this.a)
          ];
      },

      /*
         Method: toHSLAObject
         Return the HSLA object of the instance
         > > Chromath.antiquewhite.toHSLAArray();
         > {h:34, s:0.7777777777777773, l:0.9117647058823529, a:1}
      */
      toHSLAObject: function ()
      {
          var hsla = this.toHSLAArray();

          return {h: hsla[0], s: hsla[1], l: hsla[2], a: hsla[3]};
      },

      /*
         Method: toHSLAString
         Return the HSLA string of the instance
         > > Chromath.antiquewhite.toHSLAString();
         > "hsla(34,0.7777777777777773,0.9117647058823529,1)"
      */
      toHSLAString: function (){
          var hsla = this.toHSLAArray();
          var vals = [
              hsla[0],
              Math.round(hsla[1]*100)+'%',
              Math.round(hsla[2]*100)+'%',
              Math.round(hsla[3])
          ];

          return 'hsla('+ vals +')';
      },

      /*
         Method: hsv
         Return the HSV array of the instance
         > > new Chromath('blue').hsv();
         > [240, 1, 1]
      */
      hsv: function (){ return this.toHSVArray(); },

      /*
         Method: toHSVArray
         Return the HSV array of the instance
         > > new Chromath('navajowhite').toHSVArray();
         > [36, 0.32156862745098036, 1]
      */
      toHSVArray: function ()
      {
          return this.toHSVAArray().slice(0,3);
      },

      /*
         Method: toHSVObject
         Return the HSV object of the instance
         > > new Chromath('navajowhite').toHSVObject();
         > {h36, s:0.32156862745098036, v:1}
      */
      toHSVObject: function ()
      {
          var hsva = this.toHSVAArray();

          return {h: hsva[0], s: hsva[1], v: hsva[2]};
      },

      /*
         Method: toHSVString
         Return the HSV string of the instance
         > > new Chromath('navajowhite').toHSVString();
         > "hsv(36,32.15686274509804%,100%)"
      */
      toHSVString: function ()
      {
          var hsv = this.toHSVArray();
          var vals = [
              hsv[0],
              Math.round(hsv[1]*100)+'%',
              Math.round(hsv[2]*100)+'%'
          ];

          return 'hsv('+ vals +')';
      },

      /*
         Method: hsva
         Return the HSVA array of the instance
         > > new Chromath('blue').hsva();
         > [240, 1, 1, 1]
      */
      hsva: function (){ return this.toHSVAArray(); },

      /*
         Method: toHSVAArray
         Return the HSVA array of the instance
         > > new Chromath('olive').toHSVAArray();
         > [60, 1, 0.5019607843137255, 1]
      */
      toHSVAArray: function (){
          return [
              Math.round(this.h),
              parseFloat(this.sv),
              parseFloat(this.v),
              parseFloat(this.a)
          ];
      },

      /*
         Method: toHSVAObject
         Return the HSVA object of the instance
         > > new Chromath('olive').toHSVAArray();
         > {h:60, s: 1, v:0.5019607843137255, a:1}
      */
      toHSVAObject: function (){
          var hsva = this.toHSVAArray();

          return {h: hsva[0], s: hsva[1], l: hsva[2], a: hsva[3]};
      },

      /*
         Method: toHSVAString
         Return the HSVA string of the instance
         > > new Chromath('olive').toHSVAString();
         > "hsva(60,100%,50.19607843137255%,1)"
      */
      toHSVAString: function ()
      {
          var hsva = this.toHSVAArray();
          var vals = [
              hsva[0],
              Math.round(hsva[1]*100)+'%',
              Math.round(hsva[2]*100)+'%',
              hsva[3]
          ];

          return 'hsva('+ vals +')';
      },

      /*
         Method: hsb
         Alias for <hsv>
      */
      hsb: function (){ return this.hsv(); },

      /*
         Method: toHSBArray
         Alias for <toHSBArray>
      */
      toHSBArray: function ()
      {
          return this.toHSVArray();
      },

      /*
         Method: toHSBObject
         Alias for <toHSVObject>
      */
      toHSBObject: function ()
      {
          return this.toHSVObject();
      },

      /*
         Method: toHSBString
         Alias for <toHSVString>
      */
      toHSBString: function ()
      {
          return this.toHSVString();
      },

      /*
         Method: hsba
         Alias for <hsva>
      */
      hsba: function (){ return this.hsva(); },

      /*
         Method: toHSBAArray
         Alias for <toHSVAArray>
      */
      toHSBAArray: function (){
          return this.toHSVAArray();
      },

      /*
         Method: toHSBAObject
         Alias for <toHSVAObject>
      */
      toHSBAObject: function (){
          return this.toHSVAObject();
      },

      /*
         Method: toHSBAString
         Alias for <toHSVAString>
      */
      toHSBAString: function ()
      {
          return this.toHSVAString();
      },

      //Group: Instance methods - color scheme
      /*
         Method: complement
         Calls <Chromath.complement> with the current instance as the first parameter

         > > Chromath.red.complement().rgb();
         > [0, 255, 255]
      */
      complement: function (){
          return Chromath.complement(this);
      },

      /*
         Method: triad
         Calls <Chromath.triad> with the current instance as the first parameter

         > > new Chromath('hsl(0, 100%, 50%)').triad().toString();
         > "#FF0000,#00FF00,#0000FF"
      */
      triad: function (){
          return Chromath.triad(this);
      },

      /*
         Method: tetrad
         Calls <Chromath.tetrad> with the current instance as the first parameter

         > > Chromath.hsb(240, 1, 1).triad();
         > [Chromath, Chromath, Chromath]
      */
      tetrad: function (){
          return Chromath.tetrad(this);
      },

      /*
         Method: analogous
         Calls <Chromath.analogous> with the current instance as the first parameter

         > > Chromath.hsb(120, 1, 1).analogous();
         > [Chromath, Chromath, Chromath, Chromath, Chromath, Chromath, Chromath, Chromath]

         > > Chromath.hsb(180, 1, 1).analogous(5).toString();
         > "#00FFFF,#00FFB2,#00FFE5,#00E5FF,#00B2FF"

         > > Chromath.hsb(180, 1, 1).analogous(5, 10).toString();
         > "#00FFFF,#00FF19,#00FFB2,#00B2FF,#0019FF"
      */
      analogous: function (results, slices){
          return Chromath.analogous(this, results, slices);
      },

      /*
        Method: monochromatic
         Calls <Chromath.monochromatic> with the current instance as the first parameter

        > > Chromath.blue.monochromatic().toString();
        > "#000033,#000066,#000099,#0000CC,#0000FF"
      */
      monochromatic: function (results){
          return Chromath.monochromatic(this, results);
      },

      /*
         Method: splitcomplement
         Calls <Chromath.splitcomplement> with the current instance as the first parameter

         > > Chromath.blue.splitcomplement().toString();
         > "#0000FF,#FFCC00,#FF5100"
      */
      splitcomplement: function (){
          return Chromath.splitcomplement(this);
      },

      // Group: Instance methods - color alteration
      /*
         Method: tint
         Calls <Chromath.tint> with the current instance as the first parameter

         > > new Chromath('yellow').tint(0.25).toString();
         > "#FFFF3F"
      */
      tint: function (by) {
          return Chromath.tint(this, by);
      },

      /*
         Method: lighten
         Alias for <tint>
      */
      lighten: function (by) {
        return this.tint(by);
      },

      /*
        Method: shade
         Calls <Chromath.shade> with the current instance as the first parameter

        > > new Chromath('yellow').shade(0.25).toString();
        > "#BFBF00"
      */
      shade: function (by) {
          return Chromath.shade(this, by);
      },

      /*
         Method: darken
         Alias for <shade>
      */
      darken: function (by) {
        return this.shade(by);
      },

      /*
         Method: desaturate
         Calls <Chromath.desaturate> with the current instance as the first parameter

       > > new Chromath('orange').desaturate().toString();
       > "#ADADAD"

       > > new Chromath('orange').desaturate(1).toString();
       > "#5B5B5B"

       > > new Chromath('orange').desaturate(2).toString();
       > "#B4B4B4"
       */
      desaturate: function (formula){
          return Chromath.desaturate(this, formula);
      },

      /*
        Method: greyscale
        Alias for <desaturate>
      */
      greyscale: function (formula) {
        return this.desaturate(formula);
      },

      /*
         Method: websafe
         Calls <Chromath.websafe> with the current instance as the first parameter

         > > Chromath.rgb(123, 234, 56).toString();
         > "#7BEA38"

         > Chromath.rgb(123, 234, 56).websafe().toString();
         > "#66FF33"
       */
      websafe: function (){
          return Chromath.websafe(this);
      },

      // Group: Instance methods - color combination
      /*
         Method: additive
         Calls <Chromath.additive> with the current instance as the first parameter

         > > new Chromath('red').additive('#00FF00', 'blue').toString();
         > "#FFFFFF"
      */
      additive: function (){
          var arr = Array.prototype.slice.call(arguments);
          return Chromath.additive.apply(Chromath, [this].concat(arr));
      },

      /*
         Method: subtractive
         Calls <Chromath.subtractive> with the current instance as the first parameter

         > > new Chromath('cyan').subtractive('magenta', 'yellow').toString();
         > "#000000"
      */
      subtractive: function (){
          var arr = Array.prototype.slice.call(arguments);
          return Chromath.subtractive.apply(Chromath, [this].concat(arr));
      },

      /*
         Method: multiply
         Calls <Chromath.multiply> with the current instance as the first parameter

         > > Chromath.lightcyan.multiply(Chromath.brown).toString();
         > "#902A2A"
      */
      multiply: function (){
          var arr = Array.prototype.slice.call(arguments);
          return Chromath.multiply.apply(Chromath, [this].concat(arr));
      },

      /*
         Method: average
         Calls <Chromath.average> with the current instance as the first parameter

         > > Chromath.black.average('white').rgb();
         > [127, 127, 127]
      */
      average: function (){
          var arr = Array.prototype.slice.call(arguments);
          return Chromath.average.apply(Chromath, [this].concat(arr));
      },

      /*
         Method: overlay
         Calls <Chromath.overlay> with the current instance as the first parameter

       > > Chromath.red.overlay('green', 0.4).toString();
       > "#993300"

       > > Chromath.red.overlay('green', 1).toString();
       > "#008000"

       > > Chromath.red.overlay('green', 0).toString();
       > "#FF0000"
       */
      overlay: function (bottom, transparency){
          return Chromath.overlay(this, bottom, transparency);
      },

      // Group: Instance methods - other
      /*
         Method: clone
         Return an independent copy of the instance
      */
      clone: function (){
          return new Chromath(this);
      },

      /*
         Method: towards
         Calls <Chromath.towards> with the current instance as the first parameter

         > > var red = new Chromath('red');
         > > red.towards('yellow', 0.55).toString();
         > "#FF8C00"
      */
      towards: function (to, by) {
          return Chromath.towards(this, to, by);
      },

      /*
         Method: gradient
         Calls <Chromath.gradient> with the current instance as the first parameter

         > > new Chromath('#F00').gradient('#00F').toString()
         > "#FF0000,#F1000D,#E4001A,#D60028,#C90035,#BB0043,#AE0050,#A1005D,#93006B,#860078,#780086,#6B0093,#5D00A1,#5000AE,#4300BB,#3500C9,#2800D6,#1A00E4,#0D00F1,#0000FF"

         > > new Chromath('#F00').gradient('#00F', 5).toString()
         > "#FF0000,#BF003F,#7F007F,#3F00BF,#0000FF"

         > > new Chromath('#F00').gradient('#00F', 5, 3).toString()
         > "#3F00BF"
      */
      gradient: function (to, slices, slice){
          return Chromath.gradient(this, to, slices, slice);
      }
  };
};

},{}],14:[function(require,module,exports){
var util = {};

util.clamp = function ( val, min, max ) {
    if (val > max) return max;
    if (val < min) return min;
    return val;
};

util.merge = function () {
    var dest = arguments[0], i=1, source, prop;
    while (source = arguments[i++])
        for (prop in source) dest[prop] = source[prop];

    return dest;
};

util.isArray = function ( test ) {
    return Object.prototype.toString.call(test) === '[object Array]';
};

util.isString = function ( test ) {
    return Object.prototype.toString.call(test) === '[object String]';
};

util.isNumber = function ( test ) {
    return Object.prototype.toString.call(test) === '[object Number]';
};

util.isObject = function ( test ) {
    return Object.prototype.toString.call(test) === '[object Object]';
};

util.lpad = function ( val, len, pad ) {
    val = val.toString();
    if (!len) len = 2;
    if (!pad) pad = '0';

    while (val.length < len) val = pad+val;

    return val;
};

util.lerp = function (from, to, by) {
    return from + (to-from) * by;
};

util.times = function (n, fn, context) {
    for (var i = 0, results = []; i < n; i++) {
        results[i] = fn.call(context, i);
    }
    return results;
};

util.rgb = {
    fromArgs: function (r, g, b, a) {
        var rgb = arguments[0];

        if (util.isArray(rgb)){ r=rgb[0]; g=rgb[1]; b=rgb[2]; a=rgb[3]; }
        if (util.isObject(rgb)){ r=rgb.r; g=rgb.g; b=rgb.b; a=rgb.a;  }

        return [r, g, b, a];
    },
    scaled01: function (r, g, b) {
        if (!isFinite(arguments[1])){
            var rgb = util.rgb.fromArgs(r, g, b);
            r = rgb[0], g = rgb[1], b = rgb[2];
        }

        if (r > 1) r /= 255;
        if (g > 1) g /= 255;
        if (b > 1) b /= 255;

        return [r, g, b];
    },
    pctWithSymbol: function (r, g, b) {
        var rgb = this.scaled01(r, g, b);

        return rgb.map(function (v) {
            return Math.round(v * 255) + '%';
        });
    }
};

util.hsl = {
    fromArgs: function (h, s, l, a) {
        var hsl = arguments[0];

        if (util.isArray(hsl)){ h=hsl[0]; s=hsl[1]; l=hsl[2]; a=hsl[3]; }
        if (util.isObject(hsl)){ h=hsl.h; s=hsl.s; l=(hsl.l || hsl.v); a=hsl.a; }

        return [h, s, l, a];
    },
    scaled: function (h, s, l) {
        if (!isFinite(arguments[1])){
            var hsl = util.hsl.fromArgs(h, s, l);
            h = hsl[0], s = hsl[1], l = hsl[2];
        }

        h = (((h % 360) + 360) % 360);
        if (s > 1) s /= 100;
        if (l > 1) l /= 100;

        return [h, s, l];
    }
};

module.exports = util;

},{}],15:[function(require,module,exports){
(function (global){
/*
 *  base64.js
 *
 *  Licensed under the BSD 3-Clause License.
 *    http://opensource.org/licenses/BSD-3-Clause
 *
 *  References:
 *    http://en.wikipedia.org/wiki/Base64
 */
;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined'
        ? module.exports = factory(global)
        : typeof define === 'function' && define.amd
        ? define(factory) : factory(global)
}((
    typeof self !== 'undefined' ? self
        : typeof window !== 'undefined' ? window
        : typeof global !== 'undefined' ? global
: this
), function(global) {
    'use strict';
    // existing version for noConflict()
    global = global || {};
    var _Base64 = global.Base64;
    var version = "2.5.1";
    // if node.js and NOT React Native, we use Buffer
    var buffer;
    if (typeof module !== 'undefined' && module.exports) {
        try {
            buffer = eval("require('buffer').Buffer");
        } catch (err) {
            buffer = undefined;
        }
    }
    // constants
    var b64chars
        = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var b64tab = function(bin) {
        var t = {};
        for (var i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
        return t;
    }(b64chars);
    var fromCharCode = String.fromCharCode;
    // encoder stuff
    var cb_utob = function(c) {
        if (c.length < 2) {
            var cc = c.charCodeAt(0);
            return cc < 0x80 ? c
                : cc < 0x800 ? (fromCharCode(0xc0 | (cc >>> 6))
                                + fromCharCode(0x80 | (cc & 0x3f)))
                : (fromCharCode(0xe0 | ((cc >>> 12) & 0x0f))
                   + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
                   + fromCharCode(0x80 | ( cc         & 0x3f)));
        } else {
            var cc = 0x10000
                + (c.charCodeAt(0) - 0xD800) * 0x400
                + (c.charCodeAt(1) - 0xDC00);
            return (fromCharCode(0xf0 | ((cc >>> 18) & 0x07))
                    + fromCharCode(0x80 | ((cc >>> 12) & 0x3f))
                    + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
                    + fromCharCode(0x80 | ( cc         & 0x3f)));
        }
    };
    var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
    var utob = function(u) {
        return u.replace(re_utob, cb_utob);
    };
    var cb_encode = function(ccc) {
        var padlen = [0, 2, 1][ccc.length % 3],
        ord = ccc.charCodeAt(0) << 16
            | ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8)
            | ((ccc.length > 2 ? ccc.charCodeAt(2) : 0)),
        chars = [
            b64chars.charAt( ord >>> 18),
            b64chars.charAt((ord >>> 12) & 63),
            padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63),
            padlen >= 1 ? '=' : b64chars.charAt(ord & 63)
        ];
        return chars.join('');
    };
    var btoa = global.btoa ? function(b) {
        return global.btoa(b);
    } : function(b) {
        return b.replace(/[\s\S]{1,3}/g, cb_encode);
    };
    var _encode = buffer ?
        buffer.from && Uint8Array && buffer.from !== Uint8Array.from
        ? function (u) {
            return (u.constructor === buffer.constructor ? u : buffer.from(u))
                .toString('base64')
        }
        :  function (u) {
            return (u.constructor === buffer.constructor ? u : new  buffer(u))
                .toString('base64')
        }
        : function (u) { return btoa(utob(u)) }
    ;
    var encode = function(u, urisafe) {
        return !urisafe
            ? _encode(String(u))
            : _encode(String(u)).replace(/[+\/]/g, function(m0) {
                return m0 == '+' ? '-' : '_';
            }).replace(/=/g, '');
    };
    var encodeURI = function(u) { return encode(u, true) };
    // decoder stuff
    var re_btou = new RegExp([
        '[\xC0-\xDF][\x80-\xBF]',
        '[\xE0-\xEF][\x80-\xBF]{2}',
        '[\xF0-\xF7][\x80-\xBF]{3}'
    ].join('|'), 'g');
    var cb_btou = function(cccc) {
        switch(cccc.length) {
        case 4:
            var cp = ((0x07 & cccc.charCodeAt(0)) << 18)
                |    ((0x3f & cccc.charCodeAt(1)) << 12)
                |    ((0x3f & cccc.charCodeAt(2)) <<  6)
                |     (0x3f & cccc.charCodeAt(3)),
            offset = cp - 0x10000;
            return (fromCharCode((offset  >>> 10) + 0xD800)
                    + fromCharCode((offset & 0x3FF) + 0xDC00));
        case 3:
            return fromCharCode(
                ((0x0f & cccc.charCodeAt(0)) << 12)
                    | ((0x3f & cccc.charCodeAt(1)) << 6)
                    |  (0x3f & cccc.charCodeAt(2))
            );
        default:
            return  fromCharCode(
                ((0x1f & cccc.charCodeAt(0)) << 6)
                    |  (0x3f & cccc.charCodeAt(1))
            );
        }
    };
    var btou = function(b) {
        return b.replace(re_btou, cb_btou);
    };
    var cb_decode = function(cccc) {
        var len = cccc.length,
        padlen = len % 4,
        n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0)
            | (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0)
            | (len > 2 ? b64tab[cccc.charAt(2)] <<  6 : 0)
            | (len > 3 ? b64tab[cccc.charAt(3)]       : 0),
        chars = [
            fromCharCode( n >>> 16),
            fromCharCode((n >>>  8) & 0xff),
            fromCharCode( n         & 0xff)
        ];
        chars.length -= [0, 0, 2, 1][padlen];
        return chars.join('');
    };
    var _atob = global.atob ? function(a) {
        return global.atob(a);
    } : function(a){
        return a.replace(/\S{1,4}/g, cb_decode);
    };
    var atob = function(a) {
        return _atob(String(a).replace(/[^A-Za-z0-9\+\/]/g, ''));
    };
    var _decode = buffer ?
        buffer.from && Uint8Array && buffer.from !== Uint8Array.from
        ? function(a) {
            return (a.constructor === buffer.constructor
                    ? a : buffer.from(a, 'base64')).toString();
        }
        : function(a) {
            return (a.constructor === buffer.constructor
                    ? a : new buffer(a, 'base64')).toString();
        }
        : function(a) { return btou(_atob(a)) };
    var decode = function(a){
        return _decode(
            String(a).replace(/[-_]/g, function(m0) { return m0 == '-' ? '+' : '/' })
                .replace(/[^A-Za-z0-9\+\/]/g, '')
        );
    };
    var noConflict = function() {
        var Base64 = global.Base64;
        global.Base64 = _Base64;
        return Base64;
    };
    // export Base64
    global.Base64 = {
        VERSION: version,
        atob: atob,
        btoa: btoa,
        fromBase64: decode,
        toBase64: encode,
        utob: utob,
        encode: encode,
        encodeURI: encodeURI,
        btou: btou,
        decode: decode,
        noConflict: noConflict,
        __buffer__: buffer
    };
    // if ES5 is available, make Base64.extendString() available
    if (typeof Object.defineProperty === 'function') {
        var noEnum = function(v){
            return {value:v,enumerable:false,writable:true,configurable:true};
        };
        global.Base64.extendString = function () {
            Object.defineProperty(
                String.prototype, 'fromBase64', noEnum(function () {
                    return decode(this)
                }));
            Object.defineProperty(
                String.prototype, 'toBase64', noEnum(function (urisafe) {
                    return encode(this, urisafe)
                }));
            Object.defineProperty(
                String.prototype, 'toBase64URI', noEnum(function () {
                    return encode(this, true)
                }));
        };
    }
    //
    // export Base64 to the namespace
    //
    if (global['Meteor']) { // Meteor.js
        Base64 = global.Base64;
    }
    // module.exports and AMD are mutually exclusive.
    // module.exports has precedence.
    if (typeof module !== 'undefined' && module.exports) {
        module.exports.Base64 = global.Base64;
    }
    else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], function(){ return global.Base64 });
    }
    // that's it!
    return {Base64: global.Base64}
}));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],16:[function(require,module,exports){
"use strict";

//Craft object.protype
(function(){
	if( typeof(Object.addConstProp) == "function"){
		return;
	}
	
	
	function constProp(name_prop, value, vis){
		if(vis === undefined) vis = true;
		if(typeof value === "object") Object.freeze(value);
		Object.defineProperty(this, name_prop, {
				value: value,
				enumerable: vis
			});
	}
	function getSet(name, getter, setter){
		if(typeof setter == "function"){
			Object.defineProperty(this, name, {
				get: getter,
				set: setter,
				enumerable: true,
				configurable: true
			});
		}else{
			Object.defineProperty(this, name, {
				get: getter,
				enumerable: true,
				configurable: true
			});
		}
	}
	
	constProp.call(Object.prototype, 'addConstProp', constProp, false);
	Object.prototype.addConstProp('addGetSet', getSet, false);
	
	
	if(typeof(Object.prototype.toSource) !== "function"){
		Object.defineProperty(Object.prototype, 'toSource',{
			value: function(){
					var str = '{';
					for(var key in this){
						str += ' ' + key + ': ' + this[key] + ',';
					}
					if(str.length > 2) str = str.slice(0, -1) + ' ';
					return str + '}';
				},
			enumerable: false
		});
	}
	
	
	if(typeof(Object.values) !== "function"){
		var val_Obj = function(obj){
			var vals = [];
			
			for (var key in obj) {
				vals.push(obj[key]);
			}
			
			return vals;
		};
		
		 Object.addConstProp('values', val_Obj.bind(Object));
	}
	
	function randIndex(){
		var rand = Math.round((this.length - 1) * Math.random());
		return this[rand];
	}
	Array.prototype.addConstProp('rand_i', randIndex);
	
	
	function createArr(val, length, is_call){
		var arr = [];
		
		if(!length) length = 1;
		if(is_call === undefined) is_call = true;
		
		if(typeof val == 'function' && is_call){
			for(var i = 0; i < length; i++){
				arr.push(val(i, arr));
			}
		}else{
			
			for(var i = 0; i < length; i++){
				arr.push(val);
			}
		}
		
		return arr;
	}
	
	Array.prototype.addConstProp('add', function(val){
		if(!this._nulls) this._nulls = [];
		
		if(this._nulls.length){
			var ind = this._nulls.pop();
			this[ind] = val;
			return ind;
		}else{
			return this.push(val) - 1;
		}
	});
	
	Array.prototype.addConstProp('dell', function(ind){
		if(ind > this.length -1) return false;
		
		if(ind == this.length -1){
			this.pop();
		}else{
			if(!this._nulls) this._nulls = [];
			
			this[ind] = undefined;
			this._nulls.push(ind);
		}
		
		return true;	
	});
	
	Array.addConstProp('create', createArr);
	
	
	if(RegExp.prototype.toJSON !== "function"){
		RegExp.prototype.toJSON = function(){ return this.source; };
	}

})();





},{}],17:[function(require,module,exports){
'use strict';
new (function(){
	if(typeof(Object.addConstProp) !== "function"){
		if(typeof module == "object"){
			require("./mof.js");
		}else throw new Error("Требуеться библиотека mof.js");
	}

	if(typeof(Object.types) == "object"){
		return Object.types;
	}

	var T = this;
	var Doc = {
		types:{
			'bool':{
				name: "Boolean",
				arg: []
			},
			'const': {
				name: "Constant",
				arg: ["value"],
				params: { value: {type: "Something", default_value: null}}
			},
			'pos': {
				name: "Position",
				arg: ['max'],
				params: {max: {type: 'pos', default_value: +2147483647}}

			},

			'int': {
				name: "Integer",
				arg: ["max", "min", "step"],
				params: {
						max: {type: 'int', default_value: +2147483647},
						min: {type: 'int', default_value: -2147483648},
						step: {type: 'pos', default_value: 1}
					}
			},

			'num': {
				name: "Number",
				arg: ["max", "min", "precis"],
				params: {
						max: {type: 'num', default_value: +2147483647},
						min: {type: 'num', default_value: -2147483648},
						precis: {type: 'pos', default_value: 9}
					}
			},
			'arr': {
				name: "Array",
				arg: ["types", "size", "fixed"],
				params: {
						types: {type: "Type || [Type, Type...]", get default_value(){return T.pos}},
						size: {type: 'pos', default_value: 7},
						fixed: {type: 'bool', default_value: true}
					}
			},
			'any': {
				name: "MixType",
				arg: ["types"],
				params: {
						types: {type: "Type, Type... || [Type, Type...]", get default_value(){return [T.pos, T.str]}}
					}
			},
			'obj': {
				name: "Object",
				arg: ["types"],
				params: {types: {type: "Object", default_value: {}}}
			}
		},
		getConst: function(name_type, name_limit){
			return this.types[name_type].params[name_limit].default_value;
		}
	};
	this.doc = {};
	this.doc.json = JSON.stringify(Doc, "", 2);

	Doc.genDoc = (function(name, params){return {name: this.types[name].name, params: params}}).bind(Doc);
	this.doc.gen = Doc.genDoc;




	//Erros
	function argTypeError(wrong_arg, mess){
		if(mess === undefined) mess = '';
		var ER = new TypeError('Argument type is wrong! Arguments(' + forArg(wrong_arg) + ');' + mess);
		ER.wrong_arg = wrong_arg;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(ER, argTypeError);
		}

		return ER;

		function forArg(args){
			var str_args = '';
			for(var i = 0; i < args.length; i++){
				str_args += typeof(args[i]) + ': ' + args[i] + '; ';
			}
			return str_args;
		}
	}
	T.error = argTypeError;

	function typeSyntaxError(wrong_str, mess){
		if(mess === undefined) mess = '';
		var ER = new SyntaxError('Line: ' + wrong_str + '; ' + mess);
		ER.wrong_arg = wrong_str;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(ER, typeSyntaxError);
		}

		return ER;
	}



	function CreateCreator(New, test, rand, doc){
		var creator;
		if(typeof New === "function"){
			creator = function(){
				var tmp_obj = New.apply({}, arguments);
				var new_creator = new CreateCreator(New);
				for(var key in tmp_obj){
					new_creator.addConstProp(key, tmp_obj[key]);
				}
				return new_creator;
			};
		}else creator = function(){return creator};

		creator.addConstProp('is_creator', true);
		if(typeof test === "function") creator.addConstProp('test', test);
		if(typeof rand === "function") creator.addConstProp('rand', rand);
		if(typeof doc === "function") creator.addConstProp('doc', doc);

		return creator;
	}
	this.newType = function(key, desc, new_type){
		Doc.types[key] = desc;
		T.names[desc.name] = key;
		this.doc.json = JSON.stringify(Doc, "", 2);

		this[key] = new CreateCreator(new_type.New, new_type.test, new_type.rand, new_type.doc);
	}
	this.newType.doc = '(name, constructor, funcTest, funcRand, funcDoc)';



	//Craft Boolean
		this.bool = new CreateCreator(
			null,
			function(value){
				if(typeof value !== 'boolean'){
					return this.doc();
				}
			},
			function(){
				return !(Math.round(Math.random()));
			},
			Doc.genDoc.bind(null, "bool")
		);



	//Craft Const
		function docConst(val){

			if(typeof(val) === "object" && val !== null){
				val = 'Object';
			}
			if(typeof(val) === "function"){
				val = val.toString();
			}
			return Doc.genDoc.bind(null,"const", {value: val});
		}
		function newConst(val){
			return {
				rand: function(){return val},
				test: function(v){
					if(val !== v) return this.doc();
					return false;
				},
				doc: docConst(val)
			};
		}
		var def_const = newConst(Doc.getConst('const', 'value'));
		this.const = new CreateCreator(newConst, def_const.test, def_const.rand, def_const.doc);

		function tConst(Type){
			if(typeof (Type) !== "function" || !Type.is_creator){
				if(Array.isArray(Type)){

					return T.arr(Type);

				}else if(typeof(Type) == "object" && Type !== null){

					return T.obj(Type);

				}else return T.const(Type);
			}else{
				return Type;
			}
		}


	//Craft Number
		var randNum = function(max, min, precis){
			return function(){
				return +(((max - min)*Math.random() +  min).toFixed(precis));
			}
		};

		var testNum = function(max, min, precis){
			return function(n){
				if(typeof n !== 'number' || !isFinite(n)){
					return this.doc();
				}

				if((n > max)
					||(n < min)
					|| (n.toFixed(precis) != n && n !== 0) ){

					return this.doc();
				}
				return false;
			  };
		};

		var docNum = function(max, min, precis){
			return Doc.genDoc.bind(null, "num", {"max": max, "min": min, "precis": precis});
		}

		var max_def_n = Doc.getConst('num', 'max');
		var min_def_n = Doc.getConst('num', 'min');
		var precis_def = Doc.getConst('num', 'precis');

		this.num = new CreateCreator(
			function(max, min, precis){
				if(max === null) max = max_def_n;
				if(min === undefined||min === null) min = min_def_n;
				if(precis === undefined) precis = precis_def;

				if((typeof min !== 'number' || !isFinite(min))
					||(typeof max !== 'number' || !isFinite(max))
					||(typeof precis !== 'number' || !isFinite(precis))
					||(precis < 0)
					||(precis > 9)
					||(precis % 1 !== 0)){
					throw argTypeError(arguments, 'Wait arguments: min(number), max(number), precis(0<=number<9)');
				}
				if(min > max){
					var t = min;
					min = max;
					max = t;
				}

				return {
					test: testNum(max, min, precis),
					rand: randNum(max, min, precis),
					doc: docNum(max, min, precis)
				}
			},
			testNum(max_def_n, min_def_n, precis_def),
			randNum(max_def_n, min_def_n, precis_def),
			docNum(max_def_n, min_def_n, precis_def)
		);

		var randInt = function(max, min, precis){
			return function(){
				return Math.floor( ((max - (min + 0.1))/precis)*Math.random() ) * precis +  min;
			}
		};

		 var testInt = function(max, min, precis){
			return function(n){
				if(typeof n !== 'number' || !isFinite(n)){
					return this.doc();
				}

				if((n >= max)
					||(n < min)
					||(((n - min) % precis) !== 0) ){
					return this.doc();
				}
				return false;
			  };
		};

		var docInt = function(max, min, step){

				return Doc.genDoc.bind(null, "int", {"max": max, "min": min, "step": step});

		}

		var max_def = Doc.getConst('int', 'max');
		var min_def = Doc.getConst('int', 'min');
		var step_def = Doc.getConst('int', 'step');

		this.int = new CreateCreator(
			function(max, min, step){

				if(max === null) max = max_def;
				if(min === undefined||min === null) min = min_def;
				if(step === undefined) step = step_def;

				if((typeof min !== 'number' || !isFinite(min))
					||(typeof max !== 'number' || !isFinite(max))
					||(Math.round(min) !== min)
					||(Math.round(max) !== max)
					||(step <= 0)
					||(Math.round(step) !== step)){
					throw argTypeError(arguments, 'Wait arguments: min(int), max(int), step(int>0)');
				}
				if(min > max){
					var t = min;
					min = max;
					max = t;
				}

				return {
					test: testInt(max, min, step),
					rand: randInt(max, min, step),
					doc: docInt(max, min, step)
				}
			},
			testInt(max_def, min_def, step_def),
			randInt(max_def, min_def, step_def),
			docInt(max_def, min_def, step_def)
		);

		var docPos = function(max, min, step){

				return Doc.genDoc.bind(null, "pos", {"max": max});

		}

		var max_def_p = Doc.getConst('pos', 'max')
		this.pos = new CreateCreator(
			function(max){

				if(max === null) max = max_def_p;

				if((typeof max !== 'number' || !isFinite(max))
					||(max < 0)){
					throw argTypeError(arguments, 'Wait arguments: min(pos), max(pos), step(pos>0)');
				}

				return {
					test: testInt(max, 0, 1),
					rand: randInt(max, 0, 1),
					doc: docPos(max)
				}
			},
			testInt(max_def_p, 0, 1),
			randInt(max_def_p, 0, 1),
			docPos(max_def_p)
		);





  //Craft Any
		function randAny(arr){
			return function(){
				return arr.rand_i().rand();
			}
		}

		function testAny(arr){
			return function(val){
				if(arr.every(function(i){return i.test(val)})){
					return this.doc();
				}

				return false;
			}
		}

		function docAny(Types){

			var cont = Types.length;
			var type_docs = [];
			for(var i = 0; i < cont; i++){
				type_docs.push(Types[i].doc());
			}

			return Doc.genDoc.bind(null, "any", {types: type_docs});
		}

		var def_types = Doc.getConst('arr', 'types');
		function newAny(arr){
			if(!Array.isArray(arr) || arguments.length > 1) arr = arguments;

			var len = arr.length;
			var arr_types = [];
			for(var i = 0; i < len; i++){
				arr_types[i] = tConst(arr[i]);
			}

			return{
				test: testAny(arr_types),
				rand: randAny(arr_types),
				doc: docAny(arr_types)
			}
		}

		this.any = new CreateCreator(
			newAny,
			testAny(def_types),
			randAny(def_types),
			docAny(def_types)
		);



	//Craft Array



		function randArray(Type, size, is_fixed){
			var randSize = function (){return size};
			if(!is_fixed){
				randSize = T.pos(size).rand;
			}


			if(Array.isArray(Type)){
				var now_size = randSize();

				return function(){
					var arr = [];

					for(var i = 0, j = 0; i < now_size; i++){

						arr.push(Type[j].rand());

						j++;
						if(j >= Type.length){
							j = 0;
						}
					}
					return arr;
				}
			}



			return function(){
				var arr = [];

				var now_size = randSize();
				for(var i = 0; i < now_size; i++){
					arr.push(Type.rand(i, arr));
				}

				return arr;
			}

		}

		function testArray(Type, size, is_fixed){

			if(Array.isArray(Type)){
				return function(arr){

					if(!Array.isArray(arr)){
						var err = this.doc();
						err.params = "Value is not array!";
						return err;
					}

					if((arr.length > size) || (is_fixed && (arr.length !== size))){
						var err = this.doc();
						err.params = "Array lenght is wrong!";
						return err;
					}

					for(var i = 0, j = 0; i < arr.length; i++){

							var res = Type[j].test(arr[i]);
							if(res){
									var err = this.doc();
									err.params = {index: i, wrong_item: res};
									return err;
							}

							j++;
							if(j >= Type.length){
								j = 0;
							}
					}

					return false;
				}
			}

			return function(arr){
				if(!Array.isArray(arr)){
					var err = this.doc();
					err.params = "Value is not array!";
					return err;
				}

				if((arr.length > size) || (is_fixed && (arr.length !== size))){
					console.log(arr.length, size)
					var err = this.doc();
					err.params = "Array: lenght is wrong!";
					return err;
				}

				var err_arr = arr.filter(Type.test);
				if(err_arr.length != 0){
					var err = this.doc();
					err.params = err_arr;
					return err;
				}

				return false;
			}
		}

		function docArray(Type, size, is_fixed){
			var type_docs = [];
			if(Array.isArray(Type)){
				var cont = Type.length;
				for(var i = 0; i < cont; i++){
					type_docs.push(Type[i].doc());
				}
			}else{
				type_docs = Type.doc();
			}

			return Doc.genDoc.bind(null, "arr", {types: type_docs, size: size, fixed: is_fixed});

		}


		var def_Type = Doc.getConst('arr', 'types');
		var def_Size = Doc.getConst('arr', 'size');
		var def_fixed = Doc.getConst('arr', 'fixed');

		function newArray(Type, size, is_fixed){
			if(Type === null) Type = def_Type;
			if(is_fixed === undefined) is_fixed = def_fixed;

			if(Array.isArray(Type)){
				if(size === undefined||size === null) size = Type.length;

				Type = Type.map(function(item){return tConst(item);});
			}else{
				if(size === undefined||size === null) size = 1;
				Type = tConst(Type);
			}

			if(T.pos.test(size)){
					throw argTypeError(arguments, 'Wait arguments: ' + JSON.stringify(T.pos.test(size)));
			}

			return {
				test: testArray(Type, size, is_fixed),
				rand: randArray(Type, size, is_fixed),
				doc: docArray(Type, size, is_fixed)
			};
		}

		this.arr = new CreateCreator(
			newArray,
			testArray(def_Type, def_Size, def_fixed),
			randArray(def_Type, def_Size, def_fixed),
			docArray(def_Type, def_Size, def_fixed)
		);







	//Craft Object

		function randObj(funcObj){
			return function(){
				var obj = {};
				for(var key in funcObj){
					obj[key] = funcObj[key].rand();
				}
				return obj;
			};
		}

		function testObj(funcObj){
			return function(obj){

				if(typeof obj !== "object" && obj === null){
					var err = this.doc();
					err.params = "Value is not object!";
					return err;
				}

				for(var key in funcObj){
					var res = funcObj[key].test(obj[key]);
					if(res){
						var err = this.doc();
						err.params = {};
						err.params[key] = res;
						return err;
					}
				}

				return false;
			};
		}

		function docOb(funcObj){
			var doc_obj = {};

			for(var key in funcObj){
					doc_obj[key] = funcObj[key].doc();
			}

			return Doc.genDoc.bind(null, "obj", {types: doc_obj});
		}

		function NewObj(tempObj){
			if(typeof tempObj !== 'object') throw argTypeError(arguments, 'Wait arguments: tempObj(Object)');

			var begObj = {};
			var funcObj = {};
			for(var key in tempObj){
				funcObj[key] = tConst(tempObj[key]);
			}

			return{
				test: testObj(funcObj),
				rand: randObj(funcObj),
				doc: docOb(funcObj)
			}
		}
		this.obj = new CreateCreator(NewObj,
			function(obj){return typeof obj === "object"},
			randObj({}),
			Doc.genDoc.bind(null, "obj")
		);





//Craft Type out to  Document

	T.names = {};
	for(var key in Doc.types){
		T.names[Doc.types[key].name] = key;
	}

	this.outDoc = function(tmp){
		if((typeof tmp === "function") && tmp.is_creator) return tmp;

		if(!('name' in tmp)){
			throw new Error();
		}
		var type = tmp.name;

		if('params' in tmp){
			var params = tmp.params;
			switch(T.names[type]){
				case 'obj': {
					var new_obj = {};
					for(var key in params.types){
						new_obj[key] = T.outDoc(params.types[key]);
					}
					params.types = new_obj;
					break;
				}
				case 'any':
				case 'arr': {
					if(Array.isArray(params.types)){
						params.types = params.types.map(T.outDoc.bind(T));
					}else params.types = T.outDoc(params.types);
				}
			}
			return getSimpleType(T.names[type], params);
		}
		return getSimpleType(T.names[type], {});
	}

	function getSimpleType(name, params){
		var arg = [];
		Doc.types[name].arg.forEach(function(key, i){arg[i] = params[key];});
		return T[name].apply(T, arg);
	};

//Support Declarate Function

	function findeParse(str, beg, end){
		var point_beg = str.indexOf(beg);
		if(~point_beg){

			var point_end = point_beg;
			var point_temp = point_beg;
			var level = 1;
			var breakWhile = false;
			while(!breakWhile){
				breakWhile = true;

				if(~point_temp) point_temp = str.indexOf(beg, point_temp + 1);
				if(~point_end) point_end = str.indexOf(end, point_end + 1);

				if(point_temp < point_end){

					if(point_temp > 0){
						breakWhile = false;
						if(str[point_temp - 1] !== '\\') level = level+1;

					}


					if(point_end > 0){
						breakWhile = false;
						if(str[point_end - 1] !== '\\') level = level-1;
						if(level == 0){
							return [point_beg, point_end];
						}
					}
				}else{
					if(point_end > 0){
						breakWhile = false;
						if(str[point_end - 1] !== '\\') level = level-1;
						if(level == 0){
							return [point_beg, point_end];
						}
					}

					if(point_temp > 0){
						breakWhile = false;
						if(str[point_temp - 1] !== '\\') level = level+1;

					}
				}
			}
		}
		return false;
	}

	Object.types = T;
})();

},{"./mof.js":16}],18:[function(require,module,exports){
module.exports={
 "tiles": [
  {
   "type": "color",
   "color": {
    "r": 176,
    "g": 70,
    "b": 70,
    "a": 1
   },
   "id": 0,
   "width": 3,
   "height": 5
  },
  {
   "type": "svg",
   "img": "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n<svg\n   xmlns:dc=\"http://purl.org/dc/elements/1.1/\"\n   xmlns:cc=\"http://creativecommons.org/ns#\"\n   xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"\n   xmlns:svg=\"http://www.w3.org/2000/svg\"\n   xmlns=\"http://www.w3.org/2000/svg\"\n   id=\"svg13344\"\n   version=\"1.1\"\n   viewBox=\"0 0 210 210\"\n   height=\"210mm\"\n   width=\"210mm\">\n  <defs\n     id=\"defs13338\" />\n  <metadata\n     id=\"metadata13341\">\n    <rdf:RDF>\n      <cc:Work\n         rdf:about=\"\">\n        <dc:format>image/svg+xml</dc:format>\n        <dc:type\n           rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" />\n        <dc:title></dc:title>\n      </cc:Work>\n    </rdf:RDF>\n  </metadata>\n  <g\n     transform=\"translate(0,-87)\"\n     id=\"layer1\">\n    <path\n       id=\"path7763\"\n       style=\"fill:#ffffff;fill-rule:evenodd;stroke:#1b1918;stroke-width:0.24976303;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none\"\n       d=\"M -0.20547399,87.395673 V 297.20551 H 209.60429 V 87.395673 Z\" />\n    <g\n       transform=\"matrix(-0.44057687,0,0,0.44057677,-19292.302,3103.57)\"\n       id=\"Layer1189\">\n      <path\n         id=\"path7823\"\n         style=\"fill:#000000;fill-rule:evenodd;stroke:#1b1918;stroke-width:0.56690001;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none\"\n         d=\"m -43885.648,-6788.8247 c 9.726,54.1243 -8.136,42.7822 -50.54,81.1001 l 18.819,-7.7798 26.762,-11.0632 c -15.673,43.1345 4.907,60.0048 -29.567,90.4455 -57.369,35.8489 -124.416,-11.7988 -98.946,-81.508 56.015,-76.7095 37.829,-61.2882 133.472,-71.1946 z\" />\n      <path\n         id=\"path7825\"\n         style=\"fill:#000000;fill-rule:evenodd;stroke:#1b1918;stroke-width:0.56690001;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none\"\n         d=\"m -44065.31,-6658.0007 103.355,75.4713 c -25.053,23.2816 -157.05,164.005 -185.788,148.1733 -27.072,-14.9147 70.142,-197.0044 82.433,-223.6446 z\" />\n    </g>\n  </g>\n</svg>\n",
   "id": 1,
   "width": 3,
   "height": 3
  },
  {
   "type": "phisic",
   "durability": "wood",
   "img": "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n<svg\n   xmlns:dc=\"http://purl.org/dc/elements/1.1/\"\n   xmlns:cc=\"http://creativecommons.org/ns#\"\n   xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"\n   xmlns:svg=\"http://www.w3.org/2000/svg\"\n   xmlns=\"http://www.w3.org/2000/svg\"\n   id=\"svg13344\"\n   version=\"1.1\"\n   viewBox=\"0 0 210 210\"\n   height=\"210mm\"\n   width=\"210mm\">\n  <defs\n     id=\"defs13338\" />\n  <metadata\n     id=\"metadata13341\">\n    <rdf:RDF>\n      <cc:Work\n         rdf:about=\"\">\n        <dc:format>image/svg+xml</dc:format>\n        <dc:type\n           rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" />\n        <dc:title></dc:title>\n      </cc:Work>\n    </rdf:RDF>\n  </metadata>\n  <g\n     transform=\"translate(0,-87)\"\n     id=\"layer1\">\n    <path\n       id=\"path7763\"\n       style=\"fill:#ffffff;fill-rule:evenodd;stroke:#1b1918;stroke-width:0.24976303;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none\"\n       d=\"M -0.20547399,87.395673 V 297.20551 H 209.60429 V 87.395673 Z\" />\n    <g\n       id=\"Layer1123\"\n       transform=\"matrix(0.18068203,0,0,0.18156914,959.95215,-971.92446)\">\n      <g\n         id=\"Layer1124\">\n        <path\n           id=\"path6547\"\n           style=\"fill:#7d8ea5;fill-rule:evenodd;stroke:#2c2a29;stroke-width:22.67720032;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none\"\n           d=\"m -5283.3306,6790.2513 v 142.5103 q 0,45.9717 45.9716,45.9717 h 998.6748 q 45.9716,0 45.9716,-45.9717 v -142.5103 q 0,-45.9716 -45.9716,-45.9716 h -998.6748 q -45.9716,0 -45.9716,45.9716 z\" />\n        <path\n           id=\"path6549\"\n           style=\"fill:#494848;fill-rule:evenodd;stroke:#2c2a29;stroke-width:22.67720032;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none\"\n           d=\"m -5248.498,6757.9782 v 207.0826 q 0,12.8245 12.8245,12.8245 h 2.8363 q 12.8245,0 12.8245,-12.8245 v -207.0826 q 0,-12.8245 -12.8245,-12.8245 h -2.8363 q -12.8245,0 -12.8245,12.8245 z\" />\n        <path\n           id=\"path6551\"\n           style=\"fill:#494848;fill-rule:evenodd;stroke:#2c2a29;stroke-width:22.67720032;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none\"\n           d=\"m -5139.3669,6745.1537 v 232.7316 h 28.4853 v -232.7316 z\" />\n        <path\n           id=\"path6553\"\n           style=\"fill:#494848;fill-rule:evenodd;stroke:#2c2a29;stroke-width:22.67720032;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none\"\n           d=\"m -5029.4641,6745.1537 v 232.7316 h 28.4853 v -232.7316 z\" />\n        <path\n           id=\"path6555\"\n           style=\"fill:#494848;fill-rule:evenodd;stroke:#2c2a29;stroke-width:22.67720032;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none\"\n           d=\"m -4918.1894,6745.1537 v 232.7316 h 28.4853 v -232.7316 z\" />\n        <path\n           id=\"path6557\"\n           style=\"fill:#494848;fill-rule:evenodd;stroke:#2c2a29;stroke-width:22.67720032;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none\"\n           d=\"m -4809.0583,6745.1537 v 232.7316 h 28.4852 v -232.7316 z\" />\n        <path\n           id=\"path6559\"\n           style=\"fill:#494848;fill-rule:evenodd;stroke:#2c2a29;stroke-width:22.67720032;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none\"\n           d=\"m -4699.1555,6745.1537 v 232.7316 h 28.4853 v -232.7316 z\" />\n        <path\n           id=\"path6561\"\n           style=\"fill:#494848;fill-rule:evenodd;stroke:#2c2a29;stroke-width:22.67720032;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none\"\n           d=\"m -4586.0792,6745.1537 v 232.7316 h 28.4853 v -232.7316 z\" />\n        <path\n           id=\"path6563\"\n           style=\"fill:#494848;fill-rule:evenodd;stroke:#2c2a29;stroke-width:22.67720032;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none\"\n           d=\"m -4476.9481,6745.1537 v 232.7316 h 28.4853 v -232.7316 z\" />\n        <path\n           id=\"path6565\"\n           style=\"fill:#494848;fill-rule:evenodd;stroke:#2c2a29;stroke-width:22.67720032;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none\"\n           d=\"m -4367.0452,6745.1537 v 232.7316 h 28.4852 v -232.7316 z\" />\n        <path\n           id=\"path6567\"\n           style=\"fill:#494848;fill-rule:evenodd;stroke:#2c2a29;stroke-width:22.67720032;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none\"\n           d=\"m -4255.3422,6756.9752 v 209.0886 q 0,11.8215 11.8215,11.8215 h 4.8424 q 11.8214,0 11.8214,-11.8215 v -209.0886 q 0,-11.8215 -11.8214,-11.8215 h -4.8424 q -11.8215,0 -11.8215,11.8215 z\" />\n      </g>\n      <g\n         id=\"Layer1125\">\n        <path\n           id=\"path6570\"\n           style=\"fill:#7d8ea5;fill-rule:evenodd;stroke:#2c2a29;stroke-width:22.67720032;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none\"\n           d=\"m -5283.3306,5890.8466 v 142.5103 q 0,45.9716 45.9716,45.9716 h 998.6748 q 45.9716,0 45.9716,-45.9716 v -142.5103 q 0,-45.9717 -45.9716,-45.9717 h -998.6748 q -45.9716,0 -45.9716,45.9717 z\" />\n        <path\n           id=\"path6572\"\n           style=\"fill:#494848;fill-rule:evenodd;stroke:#2c2a29;stroke-width:22.67720032;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none\"\n           d=\"m -5248.498,5858.5734 v 207.0827 q 0,12.8244 12.8245,12.8244 h 2.8363 q 12.8245,0 12.8245,-12.8244 v -207.0827 q 0,-12.8244 -12.8245,-12.8244 h -2.8363 q -12.8245,0 -12.8245,12.8244 z\" />\n        <path\n           id=\"path6574\"\n           style=\"fill:#494848;fill-rule:evenodd;stroke:#2c2a29;stroke-width:22.67720032;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none\"\n           d=\"m -5139.3669,5845.749 v 232.7315 h 28.4853 V 5845.749 Z\" />\n        <path\n           id=\"path6576\"\n           style=\"fill:#494848;fill-rule:evenodd;stroke:#2c2a29;stroke-width:22.67720032;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none\"\n           d=\"m -5029.4641,5845.749 v 232.7315 h 28.4853 V 5845.749 Z\" />\n        <path\n           id=\"path6578\"\n           style=\"fill:#494848;fill-rule:evenodd;stroke:#2c2a29;stroke-width:22.67720032;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none\"\n           d=\"m -4918.1894,5845.749 v 232.7315 h 28.4853 V 5845.749 Z\" />\n        <path\n           id=\"path6580\"\n           style=\"fill:#494848;fill-rule:evenodd;stroke:#2c2a29;stroke-width:22.67720032;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none\"\n           d=\"m -4809.0583,5845.749 v 232.7315 h 28.4852 V 5845.749 Z\" />\n        <path\n           id=\"path6582\"\n           style=\"fill:#494848;fill-rule:evenodd;stroke:#2c2a29;stroke-width:22.67720032;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none\"\n           d=\"m -4699.1555,5845.749 v 232.7315 h 28.4853 V 5845.749 Z\" />\n        <path\n           id=\"path6584\"\n           style=\"fill:#494848;fill-rule:evenodd;stroke:#2c2a29;stroke-width:22.67720032;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none\"\n           d=\"m -4586.0792,5845.749 v 232.7315 h 28.4853 V 5845.749 Z\" />\n        <path\n           id=\"path6586\"\n           style=\"fill:#494848;fill-rule:evenodd;stroke:#2c2a29;stroke-width:22.67720032;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none\"\n           d=\"m -4476.9481,5845.749 v 232.7315 h 28.4853 V 5845.749 Z\" />\n        <path\n           id=\"path6588\"\n           style=\"fill:#494848;fill-rule:evenodd;stroke:#2c2a29;stroke-width:22.67720032;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none\"\n           d=\"m -4367.0452,5845.749 v 232.7315 h 28.4852 V 5845.749 Z\" />\n        <path\n           id=\"path6590\"\n           style=\"fill:#494848;fill-rule:evenodd;stroke:#2c2a29;stroke-width:22.67720032;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none\"\n           d=\"m -4255.3422,5857.5704 v 209.0886 q 0,11.8215 11.8215,11.8215 h 4.8424 q 11.8214,0 11.8214,-11.8215 v -209.0886 q 0,-11.8214 -11.8214,-11.8214 h -4.8424 q -11.8215,0 -11.8215,11.8214 z\" />\n      </g>\n      <path\n         id=\"path6593\"\n         style=\"fill:#c99806;fill-rule:evenodd;stroke:#1b1918;stroke-width:28.3465004;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none\"\n         d=\"m -5303.3519,5966.0586 h 1133.8583 v 268.2397 h -1133.8583 z\" />\n      <path\n         id=\"path6595\"\n         style=\"fill:#c99806;fill-rule:evenodd;stroke:#1b1918;stroke-width:28.3465004;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none\"\n         d=\"m -5303.352,6593.2661 v 268.2404 h 1133.8584 v -268.2404 z\" />\n      <g\n         id=\"Layer1126\">\n        <path\n           id=\"path6597\"\n           style=\"fill:#cc9a00;fill-rule:evenodd;stroke:#1b1918;stroke-width:28.3465004;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none\"\n           d=\"m -5136.894,6058.0653 h 929.7779 v 706.1158 h -929.7779 z\" />\n        <g\n           id=\"Layer1127\">\n          <path\n             id=\"path6599\"\n             style=\"fill:#1b1918;fill-rule:evenodd\"\n             d=\"m -4360.358,6222.0359 h 113.8507 q 12.4159,0 12.4159,-12.4159 v -6.9095 q 0,-12.4158 -12.4159,-12.4158 h -113.8507 q -12.4158,0 -12.4158,12.4158 v 6.9095 q 0,12.4159 12.4158,12.4159 z\" />\n          <path\n             id=\"path6601\"\n             style=\"fill:#1b1918;fill-rule:evenodd\"\n             d=\"m -4360.358,6271.39 h 113.8507 q 12.4159,0 12.4159,-12.4159 v -6.9094 q 0,-12.4159 -12.4159,-12.4159 h -113.8507 q -12.4158,0 -12.4158,12.4159 v 6.9094 q 0,12.4159 12.4158,12.4159 z\" />\n          <path\n             id=\"path6603\"\n             style=\"fill:#1b1918;fill-rule:evenodd\"\n             d=\"m -4360.358,6319.0707 h 113.8507 q 12.4159,0 12.4159,-12.4159 v -6.9094 q 0,-12.4159 -12.4159,-12.4159 h -113.8507 q -12.4158,0 -12.4158,12.4159 v 6.9094 q 0,12.4159 12.4158,12.4159 z\" />\n          <path\n             id=\"path6605\"\n             style=\"fill:#1b1918;fill-rule:evenodd\"\n             d=\"m -4360.358,6361.7327 h 113.8507 q 12.4159,0 12.4159,-12.4159 v -6.9094 q 0,-12.4159 -12.4159,-12.4159 h -113.8507 q -12.4158,0 -12.4158,12.4159 v 6.9094 q 0,12.4159 12.4158,12.4159 z\" />\n          <path\n             id=\"path6607\"\n             style=\"fill:#1b1918;fill-rule:evenodd\"\n             d=\"m -4360.358,6408.5768 h 113.8507 q 12.4159,0 12.4159,-12.4158 v -6.9095 q 0,-12.4159 -12.4159,-12.4159 h -113.8507 q -12.4158,0 -12.4158,12.4159 v 6.9095 q 0,12.4158 12.4158,12.4158 z\" />\n          <path\n             id=\"path6609\"\n             style=\"fill:#1b1918;fill-rule:evenodd\"\n             d=\"m -4360.358,6453.5389 h 113.8507 q 12.4159,0 12.4159,-12.4159 v -6.9094 q 0,-12.4159 -12.4159,-12.4159 h -113.8507 q -12.4158,0 -12.4158,12.4159 v 6.9094 q 0,12.4159 12.4158,12.4159 z\" />\n          <path\n             id=\"path6611\"\n             style=\"fill:#1b1918;fill-rule:evenodd\"\n             d=\"m -4360.358,6502.893 h 113.8507 q 12.4159,0 12.4159,-12.4158 v -6.9095 q 0,-12.4159 -12.4159,-12.4159 h -113.8507 q -12.4158,0 -12.4158,12.4159 v 6.9095 q 0,12.4158 12.4158,12.4158 z\" />\n          <path\n             id=\"path6613\"\n             style=\"fill:#1b1918;fill-rule:evenodd\"\n             d=\"m -4360.358,6550.5737 h 113.8507 q 12.4159,0 12.4159,-12.4158 v -6.9095 q 0,-12.4159 -12.4159,-12.4159 h -113.8507 q -12.4158,0 -12.4158,12.4159 v 6.9095 q 0,12.4158 12.4158,12.4158 z\" />\n          <path\n             id=\"path6615\"\n             style=\"fill:#1b1918;fill-rule:evenodd\"\n             d=\"m -4360.358,6593.2357 h 113.8507 q 12.4159,0 12.4159,-12.4159 v -6.9094 q 0,-12.4159 -12.4159,-12.4159 h -113.8507 q -12.4158,0 -12.4158,12.4159 v 6.9094 q 0,12.4159 12.4158,12.4159 z\" />\n          <path\n             id=\"path6617\"\n             style=\"fill:#1b1918;fill-rule:evenodd\"\n             d=\"m -4360.358,6640.0799 h 113.8507 q 12.4159,0 12.4159,-12.4159 v -6.9095 q 0,-12.4158 -12.4159,-12.4158 h -113.8507 q -12.4158,0 -12.4158,12.4158 v 6.9095 q 0,12.4159 12.4158,12.4159 z\" />\n        </g>\n        <path\n           id=\"path6620\"\n           style=\"fill:#1b1918;fill-rule:evenodd\"\n           d=\"m -5054.3919,6501.098 v 145.644 h 15.0443 v -145.644 z\" />\n        <path\n           id=\"path6622\"\n           style=\"fill:#1b1918;fill-rule:evenodd\"\n           d=\"m -5054.3919,6174.8557 v 145.644 h 15.0443 v -145.644 z\" />\n        <path\n           id=\"path6624\"\n           style=\"fill:#fec000;fill-opacity:0;fill-rule:evenodd\"\n           d=\"m -4986.2269,6143.9103 -137.055,-71.2704 v 676.1243 l 137.055,-71.2703 z\" />\n        <path\n           id=\"path6626\"\n           style=\"fill:#a17900;fill-rule:evenodd\"\n           d=\"m -5121.4587,6073.6412 h 901.0174 l -0.056,70.0851 h -766.4918 z\" />\n        <path\n           id=\"path6628\"\n           style=\"fill:#a17900;fill-rule:evenodd\"\n           d=\"m -5121.4587,6747.271 h 901.0174 l -0.056,-70.0851 h -766.4918 z\" />\n      </g>\n      <g\n         id=\"Layer1128\">\n        <path\n           id=\"path6631\"\n           style=\"fill:#cc9a00;fill-rule:evenodd;stroke:#1b1918;stroke-width:28.3465004;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none\"\n           d=\"m -4979.3894,6231.9802 v 350.6974 q 0,98.5104 98.5104,98.5104 h 389.1265 q 98.5104,0 98.5104,-98.5104 v -350.6974 q 0,-98.5104 -98.5104,-98.5104 h -389.1265 q -98.5104,0 -98.5104,98.5104 z\" />\n        <path\n           id=\"path6633\"\n           style=\"fill:#cc9a00;fill-rule:evenodd;stroke:#1b1918;stroke-width:28.3465004;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none\"\n           d=\"m -4686.3157,6241.5777 a 158.7911,165.7512 0 0 1 158.7911,165.7512 158.7911,165.7512 0 1 1 -158.7911,-165.7512 z\" />\n        <path\n           id=\"path6635\"\n           style=\"fill:#cc9a00;fill-rule:evenodd;stroke:#1b1918;stroke-width:28.3465004;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none\"\n           d=\"m -4686.3157,6300.7745 a 102.08,106.5543 0 0 1 102.0799,106.5544 102.08,106.5543 0 1 1 -102.0799,-106.5544 z\" />\n      </g>\n      <path\n         id=\"path6638\"\n         style=\"fill:#cc9a00;fill-rule:evenodd;stroke:#1b1918;stroke-width:28.3465004;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none\"\n         d=\"m -5232.4762,6398.811 v 24.6276 q 0,34.4786 34.4786,34.4786 h 235.827 q 34.4787,0 34.4787,-34.4786 v -24.6276 q 0,-34.4787 -34.4787,-34.4787 h -235.827 q -34.4786,0 -34.4786,34.4787 z\" />\n      <path\n         id=\"path6640\"\n         style=\"fill:#cc9a00;fill-rule:evenodd;stroke:#1b1918;stroke-width:28.3465004;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none\"\n         d=\"m -5294.2021,6392.3301 v 37.5895 q 0,52.6252 52.6252,52.6252 h 64.5749 q 52.6252,0 52.6252,-52.6252 v -37.5895 q 0,-52.6252 -52.6252,-52.6252 h -64.5749 q -52.6252,0 -52.6252,52.6252 z\" />\n    </g>\n  </g>\n</svg>\n",
   "id": 2,
   "width": 2,
   "height": 2
  }
 ],
 "width": 1,
 "height": 1
}
},{}]},{},[7])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIkNvbnRyb2wuanMiLCJDclN3aXRjaGVzLmpzIiwiRHJhdy5qcyIsIkV2ZW50cy5qcyIsIkxvZ2ljLmpzIiwiU3dpdGNoLmpzIiwiYnJvbWFpbi5qcyIsIm5vZGVfbW9kdWxlcy9jaHJvbWF0aC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jaHJvbWF0aC9zcmMvY2hyb21hdGguanMiLCJub2RlX21vZHVsZXMvY2hyb21hdGgvc3JjL2NvbG9ybmFtZXNfY3NzMi5qcyIsIm5vZGVfbW9kdWxlcy9jaHJvbWF0aC9zcmMvY29sb3JuYW1lc19jc3MzLmpzIiwibm9kZV9tb2R1bGVzL2Nocm9tYXRoL3NyYy9wYXJzZXJzLmpzIiwibm9kZV9tb2R1bGVzL2Nocm9tYXRoL3NyYy9wcm90b3R5cGUuanMiLCJub2RlX21vZHVsZXMvY2hyb21hdGgvc3JjL3V0aWwuanMiLCJub2RlX21vZHVsZXMvanMtYmFzZTY0L2Jhc2U2NC5qcyIsIm5vZGVfbW9kdWxlcy90eXBlc2pzL21vZi5qcyIsIm5vZGVfbW9kdWxlcy90eXBlc2pzL3R5cGVzLmpzIiwidGlsZXNldC5qc29uIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2puQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzNPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy91QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgSGVhciA9IHJlcXVpcmUoXCIuL0V2ZW50cy5qc1wiKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oTG9naWMsIERyYXcpe1xyXG5cclxuXHRcclxuXHRIZWFyKFwic3dpdGNoQWN0XCIsIFwiY2xpY2tcIiwgZnVuY3Rpb24oKXtcclxuXHRcdExvZ2ljLnN3aXRjaFNwYWNlKCk7XHJcblx0fSk7XHJcblxyXG5cdEhlYXIoXCJUaWxlc1wiLCBcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KXtcclxuXHRcdFxyXG5cdFx0aWYoZXZlbnQudGFyZ2V0LmdldEF0dHJpYnV0ZShcInRpbGVcIikgIT09IG51bGwpe1xyXG5cdFx0XHRMb2dpYy5jaGFuZ2VUaWxlKGV2ZW50LnRhcmdldC5wYXJlbnRFbGVtZW50LmdldEF0dHJpYnV0ZShcImNhdGVnXCIpLCBldmVudC50YXJnZXQuZ2V0QXR0cmlidXRlKFwidGlsZVwiKSk7XHJcblx0XHR9XHJcblx0fSk7XHJcblxyXG5cdEhlYXIoXCJPYmplY3RzXCIsIFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpe1xyXG5cdFx0XHJcblx0XHRpZihldmVudC50YXJnZXQuZ2V0QXR0cmlidXRlKFwidGlsZVwiKSAhPT0gbnVsbCl7XHJcblx0XHRcdExvZ2ljLmNoYW5nZU9ianMoZXZlbnQudGFyZ2V0LnBhcmVudEVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiY2F0ZWdcIiksIGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoXCJ0aWxlXCIpKTtcclxuXHRcdH1cclxuXHR9KTtcclxuXHRcclxuXHRIZWFyKFwiQWRkXCIsIFwiY2hhbmdlXCIsIERyYXcub3BlbkpTT04oTG9naWMuYWRkVGlsZXNldCkpO1xyXG5cdFxyXG5cdHZhciBjdXJzb3JMaW5lID0gbnVsbDtcclxuXHRcclxuXHRcclxuXHRIZWFyKFwiR3JpZFwiLCBcIm1vdXNlZG93blwiLCBmdW5jdGlvbihldmVudCl7XHJcblx0XHRjdXJzb3JMaW5lID0gW2V2ZW50LnRhcmdldC54LCBldmVudC50YXJnZXQueV07XHJcblx0fSk7XHJcblx0SGVhcihcIkdyaWRcIiwgXCJtb3VzZXVwXCIsIGZ1bmN0aW9uKGV2ZW50KXtcclxuXHRcdExvZ2ljLmRyYXcoY3Vyc29yTGluZSwgW2V2ZW50LnRhcmdldC54LCBldmVudC50YXJnZXQueV0pO1xyXG5cdFx0Y3Vyc29yTGluZSA9IG51bGw7XHJcblx0fSk7XHJcblx0XHJcbn07XHJcblxyXG5cclxuIiwiY29uc3QgSGVhciA9IHJlcXVpcmUoXCIuL0V2ZW50cy5qc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihEcmF3KXtcblxuXHRIZWFyKFwic3dpdGNoQWN0XCIsIFwiY2xpY2tcIiwgRHJhdy5jclN3aXRjaChcImludmlzXCIsIFtcIlRpbGVzXCIsIFwiT2JqZWN0c1wiXSkpO1xuXG5cdEhlYXIoXCJUaWxlc1wiLCBcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRpZihldmVudC50YXJnZXQuc3dpdCkgZXZlbnQudGFyZ2V0LnN3aXQoKTtcblx0fSk7XG5cblx0SGVhcihcIk9iamVjdHNcIiwgXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCl7XG5cdFx0aWYoZXZlbnQudGFyZ2V0LnN3aXQpIGV2ZW50LnRhcmdldC5zd2l0KCk7XG5cdH0pO1xuXG5cdEhlYXIoXCJzd2l0Y2hHcmlkXCIsIFwiY2xpY2tcIiwgRHJhdy5jclN3aXRjaChcImdyaWRcIiwgXCJHcmlkXCIpKTtcblxuXHRIZWFyKFwiR3JpZFwiLCBcImRyYWdzdGFydFwiLCBmdW5jdGlvbihldmVudCl7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0fSk7XG59OyIsInJlcXVpcmUoXCJ0eXBlc2pzXCIpO1xyXG5jb25zdCBSR0IgPSByZXF1aXJlKCdjaHJvbWF0aCcpLnJnYjtcclxudmFyIEJhc2U2NCA9IHJlcXVpcmUoJ2pzLWJhc2U2NCcpLkJhc2U2NDtcclxuXHJcbnZhciBpZF9ncm91bmQgPSBcIkdyb3VuZFwiO1xyXG52YXIgaWRfYm94cyA9IFwiQm94c1wiO1xyXG52YXIgaWRfZ3JpZCA9IFwiR3JpZFwiO1xyXG52YXIgaWRfdGlsZXMgPSBcIlRpbGVzXCI7XHJcbnZhciBpZF9vYmplY3RzID0gXCJPYmplY3RzXCI7XHJcbnZhciBpZF9wYWxsZXQgPSBcIlBhbGxldFwiO1xyXG5cclxudmFyIHNpemUgPSAyMDtcclxuXHJcbmZ1bmN0aW9uIENyU3BhY2UoaWRfbWFwLCBzaXplKXtcclxuXHR2YXIgY29udGFpbmVyID0gZ2V0Tm9kZShpZF9tYXApO1xyXG5cdFxyXG5cdHRoaXMuYWRkID0gZnVuY3Rpb24obmV3X3RpbGUsIHgsIHkpe1xyXG5cdFx0dmFyIHRpbGUgPSBkcmF3VGlsZShuZXdfdGlsZSk7XHJcblx0XHR0aWxlLnN0eWxlLndpZHRoID0gKG5ld190aWxlLndpZHRoICogKDEwMCAvIHNpemUpKSArIFwiJVwiO1xyXG5cdFx0dGlsZS5zdHlsZS5oZWlnaHQgPSAobmV3X3RpbGUuaGVpZ2h0ICogKDEwMCAvIHNpemUpKSArIFwiJVwiO1xyXG5cdFx0XHJcblx0XHR0aWxlLnN0eWxlLmxlZnQgPSAoeCAqICgxMDAgLyBzaXplKSkgKyBcIiVcIjtcclxuXHRcdHRpbGUuc3R5bGUudG9wID0gKHkgKiAoMTAwIC8gc2l6ZSkpICsgXCIlXCI7XHJcblx0XHRcclxuXHRcdGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aWxlKTtcclxuXHR9XHJcblx0XHJcblx0XHJcblx0ZnVuY3Rpb24gTm9ybVRpbGUodGlsZSl7XHJcblx0XHR2YXIgYm94ID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aWxlKTtcclxuXHRcdHRpbGUuc3R5bGUubGVmdCA9IE5vcm1Db29yZChwYXJzZUZsb2F0KGJveC5sZWZ0KSwgcGFyc2VGbG9hdChib3gud2lkdGgpKSArIFwiJVwiO1xyXG5cdFx0dGlsZS5zdHlsZS50b3AgPSBOb3JtQ29vcmQocGFyc2VGbG9hdChib3gudG9wKSwgcGFyc2VGbG9hdChib3guaGVpZ2h0KSkgKyBcIiVcIjtcclxuXHR9XHJcblx0XHJcblx0ZnVuY3Rpb24gTm9ybUNvb3JkKGNvb3JkLCBzKXtcclxuXHRcdHZhciBjb25fc2l6ZSA9IHBhcnNlRmxvYXQoZ2V0Q29tcHV0ZWRTdHlsZShjb250YWluZXIpLndpZHRoKTtcclxuXHRcdFxyXG5cdFx0aWYoY29vcmQgKyBzID4gY29uX3NpemUpIGNvb3JkID0gY29uX3NpemUgLSBzO1xyXG5cdFx0aWYoY29vcmQgPCAwKSBjb29yZCA9IDA7XHJcblx0XHRcclxuXHRcdHJldHVybiBNYXRoLnJvdW5kKChjb29yZCAvIGNvbl9zaXplKSAqIHNpemUpICogKDEwMCAvIHNpemUpO1xyXG5cdH1cclxuXHRcclxufVxyXG5cclxuZnVuY3Rpb24gQ3JUaWxlcyhpZF9jb250YWluZXIpe1xyXG5cdHZhciBjb250YWluZXIgPSBnZXROb2RlKGlkX2NvbnRhaW5lcik7XHJcblx0XHJcblx0dGhpcy5hZGQgPSBmdW5jdGlvbihUaWxlc2V0KXtcclxuXHRcdHZhciBjYXRlZyA9IGRyYXdDYXRlZyhUaWxlc2V0KTtcclxuXHRcdGNvbnRhaW5lci5hcHBlbmRDaGlsZChjYXRlZyk7XHJcblx0fVxyXG59XHJcblxyXG5mdW5jdGlvbiBDclBhbGxldCgpe1xyXG5cdHZhciBjb250YWluZXIgPSBnZXROb2RlKGlkX3BhbGxldCk7XHJcblx0XHJcblx0dGhpcy5jaGFuZ2UgPSBmdW5jdGlvbih0aWxlKXtcclxuXHRcdGlmKGNvbnRhaW5lci5jaGlsZHJlblswXSkgXHJcblx0XHRcdGNvbnRhaW5lci5jaGlsZHJlblswXS5yZW1vdmUoKTtcclxuXHJcblx0XHRjb250YWluZXIuYXBwZW5kQ2hpbGQoZHJhd1RpbGUodGlsZSkpO1xyXG5cdH1cclxufVxyXG5cclxuZHJhd0dyaWQoZ2V0Tm9kZShpZF9ncmlkKSwgc2l6ZSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRtYXA6IG5ldyBDclNwYWNlKGlkX2dyb3VuZCwgc2l6ZSksXHJcblx0Ym94czogbmV3IENyU3BhY2UoaWRfYm94cywgc2l6ZSksXHJcblx0cGFsbGV0OiBuZXcgQ3JQYWxsZXQoaWRfcGFsbGV0KSxcclxuXHR0aWxlczogbmV3IENyVGlsZXMoaWRfdGlsZXMpLFxyXG5cdG9iamVjdHM6IG5ldyBDclRpbGVzKGlkX29iamVjdHMpLFxyXG5cdG9wZW5KU09OOiBPcGVuRmlsZUpTT04sXHJcblx0c2F2ZTogU2F2ZSxcclxuXHRjclN3aXRjaDogIHJlcXVpcmUoXCIuL1N3aXRjaC5qc1wiKVxyXG59O1xyXG5cclxuZnVuY3Rpb24gZHJhd0dyaWQoY29udGFpbmVyLCBncmlkX3NpemUpe1xyXG5cdFx0dmFyIHNpemUgPSAxMDAgLyBncmlkX3NpemU7XHJcblx0XHRmb3IodmFyIGkgPSBncmlkX3NpemUgLSAxOyBpID49IDA7IGktLSl7XHJcblx0XHRcdGZvcih2YXIgaiA9IGdyaWRfc2l6ZSAtIDE7IGogPj0gMDsgai0tKXtcclxuXHRcdFx0XHR2YXIgYm94ID0gZGFyd0JveChpKnNpemUsIGoqc2l6ZSwgc2l6ZSk7XHJcblx0XHRcdFx0Ym94LnggPSBpO1xyXG5cdFx0XHRcdGJveC55ID0gajtcclxuXHRcdFx0XHRjb250YWluZXIuYXBwZW5kQ2hpbGQoYm94KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuZnVuY3Rpb24gZGFyd0JveCh4LCB5LCBzaXplKXtcclxuXHR2YXIgYm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblx0Ym94LmNsYXNzTGlzdC5hZGQoXCJib3hcIik7XHJcblx0Ym94LnN0eWxlLndpZHRoID0gc2l6ZSArIFwiJVwiO1xyXG5cdGJveC5zdHlsZS5oZWlnaHQgPSBzaXplICsgXCIlXCI7XHJcblx0XHJcblx0Ym94LnN0eWxlLmxlZnQgPSB4ICsgXCIlXCI7XHJcblx0Ym94LnN0eWxlLnRvcCA9IHkgKyBcIiVcIjtcclxuXHRcclxuXHRyZXR1cm4gYm94O1xyXG59XHJcblxyXG5mdW5jdGlvbiBPcGVuRmlsZUpTT04oT3Blbil7XHJcblx0cmV0dXJuIGZ1bmN0aW9uKCl7XHJcblx0XHRpZih0aGlzLmZpbGVzWzBdKXtcclxuXHRcdFx0dmFyIG5hbWUgPSB0aGlzLmZpbGVzWzBdLm5hbWU7XHJcblx0XHRcdHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG5cdFx0XHRcclxuXHRcdFx0cmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKGUpe1xyXG5cdFx0XHRcdHZhciBmaWxlID0gSlNPTi5wYXJzZShlLnRhcmdldC5yZXN1bHQpO1xyXG5cdFx0XHRcdGZpbGUubmFtZSA9IG5hbWU7XHJcblx0XHRcdFx0T3BlbihmaWxlKTtcclxuXHRcdFx0fTtcclxuXHRcdFx0cmVhZGVyLnJlYWRBc1RleHQodGhpcy5maWxlc1swXSk7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIFNhdmUobmFtZSwgdGV4dCl7XHJcblx0dmFyIGJsb2IgPSBuZXcgQmxvYihbdGV4dF0sIHt0eXBlOiBcInRleHQvcGxhaW47Y2hhcnNldD11dGYtOFwifSk7XHJcblx0RmlsZVNhdmVyLnNhdmVBcyhibG9iLCBuYW1lKTtcclxufVxyXG5cclxuZnVuY3Rpb24gQ3JTd2l0Y2hUd28oaWQsIGZpcnN0X2lkLCBuYW1lX2NsYXNzKXtcclxuXHR2YXIgZWxlbSA9IGdldE5vZGUoaWQpLmNsYXNzTGlzdDtcclxuXHR2YXIgZmlyc3RfZWxlbSA9IGdldE5vZGUoZmlyc3RfaWQpLmNsYXNzTGlzdDtcclxuXHRyZXR1cm4gZnVuY3Rpb24oKXtcclxuXHRcdGVsZW0udG9nZ2xlKG5hbWVfY2xhc3MpO1xyXG5cdFx0Zmlyc3RfZWxlbS50b2dnbGUobmFtZV9jbGFzcyk7XHJcblx0fVxyXG59XHJcblxyXG5mdW5jdGlvbiBkcmF3Q2F0ZWcobmV3X3RpbGVzZXQpe1xyXG5cdHZhciBjYXRlZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cdGNhdGVnLmNsYXNzTGlzdC5hZGQoXCJwYW5lbC1jb2x1bW5cIik7XHJcblx0XHJcblx0dmFyIHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDMnKTtcclxuXHR0aXRsZS5pbm5lckhUTUwgPSBuZXdfdGlsZXNldC5uYW1lO1xyXG5cdHRpdGxlLmNsYXNzTGlzdC5hZGQoXCJ0aXRsZS1jYXRlZ1wiKTtcclxuXHRcclxuXHRcclxuXHQvL3ZhciBjbG9zZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xyXG5cdC8vY2xvc2UuaW5uZXJIVE1MID0gXCItXCI7XHJcblx0Ly90aXRsZS5hcHBlbmRDaGlsZChjbG9zZSk7XHJcblx0XHJcblx0Y2F0ZWcuYXBwZW5kQ2hpbGQodGl0bGUpO1xyXG5cdFxyXG5cdHZhciBsaXN0ID0gZHJhd1RpbGVzKG5ld190aWxlc2V0LnRpbGVzKTtcclxuXHRsaXN0LnNldEF0dHJpYnV0ZShcImNhdGVnXCIsIG5ld190aWxlc2V0LmlkKTtcclxuXHRcclxuXHR0aXRsZS5zd2l0ID0gZnVuY3Rpb24oKXtcclxuXHRcdGxpc3QuY2xhc3NMaXN0LnRvZ2dsZShcImludmlzXCIpO1xyXG5cdH1cclxuXHRcclxuXHRjYXRlZy5hcHBlbmRDaGlsZChsaXN0KTtcclxuXHRcclxuXHRyZXR1cm4gY2F0ZWc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRyYXdUaWxlcyh0aWxlcyl7XHJcblx0dmFyIGxpc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHRsaXN0LmNsYXNzTGlzdC5hZGQoXCJwYW5lbC13cmFwXCIpO1xyXG5cdFxyXG5cdHRpbGVzLm1hcChkcmF3VGlsZSkuZm9yRWFjaChsaXN0LmFwcGVuZENoaWxkLmJpbmQobGlzdCkpO1xyXG5cdHJldHVybiBsaXN0O1xyXG59XHJcblxyXG5mdW5jdGlvbiBkcmF3VGlsZShuZXdfdGlsZSl7XHJcblx0XHJcblx0aWYobmV3X3RpbGUudHlwZSA9PSBcImNvbG9yXCIpe1xyXG5cdFx0dmFyIGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cdFx0aW1nLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IG5ldyBSR0IobmV3X3RpbGUuY29sb3IpLnRvU3RyaW5nKCk7XHJcblx0fVxyXG5cdGlmKG5ld190aWxlLnR5cGUgPT0gXCJzdmdcIiB8fCBuZXdfdGlsZS50eXBlID09IFwicGhpc2ljXCIpe1xyXG5cdFx0dmFyIGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xyXG5cdFx0aW1nLnNyYyA9IFwiZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCxcIisgQmFzZTY0LmVuY29kZShuZXdfdGlsZS5pbWcpO1xyXG5cdH1cclxuXHJcblx0aW1nLmNsYXNzTGlzdC5hZGQoXCJ0aWxlXCIpO1xyXG5cdGltZy5zZXRBdHRyaWJ1dGUoXCJ0aWxlXCIsIG5ld190aWxlLmlkKTtcclxuXHRpbWcuc2V0QXR0cmlidXRlKFwiZHJhZ2dhYmxlXCIsIHRydWUpO1xyXG5cdFxyXG5cdHJldHVybiBpbWc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldE5vZGUoaWQpe1xyXG5cdHZhciBlbGVtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xyXG5cdGlmKCFlbGVtKSB0aHJvdyBuZXcgRXJyb3IoXCJFbGVtIGlzIG5vdCBmaW5kIVwiKTtcclxuXHRyZXR1cm4gZWxlbTtcclxufVxyXG4iLCJcclxuZnVuY3Rpb24gSWRFdmVudChpZCwgbmFtZV9ldmVudCwgZnVuYyl7XHJcblx0XHJcblx0aWYobmFtZV9ldmVudCA9PSBcInN1Ym1pdFwiKXtcclxuXHRcdHZhciBvbGRfZnVuYyA9IGZ1bmM7XHJcblx0XHRmdW5jID0gZnVuY3Rpb24oZSl7XHJcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0b2xkX2Z1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHRcdH0gXHJcblx0fVxyXG5cdFxyXG5cdGlmKEFycmF5LmlzQXJyYXkobmFtZV9ldmVudCkpe1xyXG5cdFx0bmFtZV9ldmVudC5mb3JFYWNoKG5hbWUgPT4gZ2V0Tm9kZShpZCkuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCBmdW5jKSk7XHJcblx0fVxyXG5cdGVsc2UgZ2V0Tm9kZShpZCkuYWRkRXZlbnRMaXN0ZW5lcihuYW1lX2V2ZW50LCBmdW5jKTtcclxufVxyXG5cclxuZnVuY3Rpb24gU3VibWl0KGZ1bmMpe1xyXG5cdHJldHVybiBmdW5jdGlvbihldmVudCl7XHJcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0ZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG5cdH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Tm9kZShpZCl7XHJcblx0dmFyIGVsZW0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XHJcblx0aWYoIWVsZW0pIHRocm93IG5ldyBFcnJvcihcIkVsZW0gaXMgbm90IGZpbmQhXCIpO1xyXG5cdHJldHVybiBlbGVtO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IElkRXZlbnQ7XHJcbiIsInZhciBUaWxlc2V0cyA9IFtdO1xyXG52YXIgTWFwID0gQXJyYXkuY3JlYXRlKEFycmF5LmNyZWF0ZS5iaW5kKG51bGwsIG51bGwsIDIwKSwgMjApO1xyXG5cclxuZnVuY3Rpb24gQ3JMb2dpYyhEcmF3KXtcclxuXHR2YXIgY3VycmVudF90aWxlID0gbnVsbDtcclxuXHR2YXIgY3VycmVudF9vYmpzID0gbnVsbDtcclxuXHJcblx0dmFyIHN3aXRjaFNwYWNlID0gZmFsc2U7XHJcblx0XHJcblx0dGhpcy5hZGRUaWxlc2V0ID0gZnVuY3Rpb24oVGlsZXNldCl7XHJcblx0XHR2YXIgb2JqcyA9IFtdO1xyXG5cdFx0dmFyIHRpbGVzID0gW107XHJcblxyXG5cdFx0VGlsZXNldC50aWxlcy5mb3JFYWNoKGZ1bmN0aW9uKHRpbGUsIGlkKXtcclxuXHRcdFx0aWYodGlsZS50eXBlICE9IFwicGhpc2ljXCIpXHJcblx0XHRcdFx0dGlsZS5pZCA9IHRpbGVzLnB1c2godGlsZSkgLSAxO1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0dGlsZS5pZCA9IG9ianMucHVzaCh0aWxlKSAtIDE7XHJcblx0XHR9KTtcclxuXHJcblx0XHR2YXIgT2JqU2V0ID0gT2JqZWN0LmFzc2lnbih7fSwgVGlsZXNldCk7XHJcblx0XHRPYmpTZXQudGlsZXMgPSBvYmpzO1xyXG5cclxuXHRcdFRpbGVzZXQudGlsZXMgPSB0aWxlcztcclxuXHJcblx0XHRjb25zb2xlLmxvZyhUaWxlc2V0LCBPYmpTZXQpO1xyXG5cclxuXHRcdFRpbGVzZXQuaWQgPSBUaWxlc2V0cy5hZGQoVGlsZXNldCk7XHJcblx0XHREcmF3LnRpbGVzLmFkZChUaWxlc2V0KTtcclxuXHJcblx0XHRPYmpTZXQuaWQgPSBUaWxlc2V0cy5hZGQoT2JqU2V0KTtcclxuXHRcdERyYXcub2JqZWN0cy5hZGQoT2JqU2V0KTtcclxuXHR9XHJcblxyXG5cdHRoaXMuc3dpdGNoU3BhY2UgPSBmdW5jdGlvbigpe1xyXG5cdFx0c3dpdGNoU3BhY2UgPSAhc3dpdGNoU3BhY2U7XHJcblxyXG5cdFx0aWYoIXN3aXRjaFNwYWNlICYmIGN1cnJlbnRfdGlsZSlcclxuXHRcdFx0RHJhdy5wYWxsZXQuY2hhbmdlKGN1cnJlbnRfdGlsZSk7XHJcblx0XHRlbHNlIGlmKGN1cnJlbnRfb2JqcykgXHJcblx0XHRcdERyYXcucGFsbGV0LmNoYW5nZShjdXJyZW50X29ianMpO1xyXG5cdH1cclxuXHRcclxuXHR0aGlzLmNoYW5nZVRpbGUgPSBmdW5jdGlvbihpZF9jYXRlZywgaWRfdGlsZSl7XHJcblx0XHRjdXJyZW50X3RpbGUgPSBUaWxlc2V0c1tpZF9jYXRlZ10udGlsZXNbaWRfdGlsZV07XHJcblx0XHRcclxuXHRcdGRlZlNpemUoY3VycmVudF90aWxlLCBpZF9jYXRlZylcclxuXHRcdERyYXcucGFsbGV0LmNoYW5nZShjdXJyZW50X3RpbGUpO1xyXG5cdH1cclxuXHJcblx0dGhpcy5jaGFuZ2VPYmpzID0gZnVuY3Rpb24oaWRfY2F0ZWcsIGlkX3RpbGUpe1xyXG5cdFx0Y3VycmVudF9vYmpzID0gVGlsZXNldHNbaWRfY2F0ZWddLnRpbGVzW2lkX3RpbGVdO1xyXG5cdFx0XHJcblx0XHRkZWZTaXplKGN1cnJlbnRfb2JqcywgaWRfY2F0ZWcpO1xyXG5cdFx0RHJhdy5wYWxsZXQuY2hhbmdlKGN1cnJlbnRfb2Jqcyk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBkZWZTaXplKHRpbGUsIGlkX2NhdGVnKXtcclxuXHRcdGlmKCF0aWxlLndpZHRoKSB0aWxlLndpZHRoID0gVGlsZXNldHNbaWRfY2F0ZWddLndpZHRoO1xyXG5cdFx0aWYoIXRpbGUuaGVpZ2h0KSB0aWxlLmhlaWdodCA9IFRpbGVzZXRzW2lkX2NhdGVnXS5oZWlnaHQ7XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMuZHJhdyA9IGZ1bmN0aW9uKGJlZywgZW5kKXtcclxuXHRcdGlmKCFzd2l0Y2hTcGFjZSl7XHJcblx0XHRcdGZpbGwoYmVnLCBlbmQpO1xyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGZpbGwoYmVnLCBlbmQpe1xyXG5cdFx0aWYoY3VycmVudF90aWxlKXtcclxuXHRcdFx0XHJcblx0XHRcdHZhciBpbmNfeCA9IGN1cnJlbnRfdGlsZS53aWR0aDtcclxuXHRcdFx0dmFyIGluY195ID0gY3VycmVudF90aWxlLmhlaWdodDtcclxuXHRcdFx0XHJcblx0XHRcdGZvcih2YXIgaSA9IGJlZ1swXTsgaSArIGluY194IDw9IGVuZFswXSArIDE7IGkgPSBpICsgaW5jX3gpe1xyXG5cdFx0XHRcdGZvcih2YXIgaiA9IGJlZ1sxXTsgaiArIGluY195IDw9IGVuZFsxXSArIDE7IGogPSBqICsgaW5jX3kpe1xyXG5cdFx0XHRcdFx0ZHJhd1RpbGUoaSwgaiwgY3VycmVudF90aWxlKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdFxyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRmdW5jdGlvbiBkcmF3VGlsZSh4LCB5LCB0aWxlKXtcclxuXHRcdHggPSBNYXRoLmZsb29yKHgpO1xyXG5cdFx0eSA9IE1hdGguZmxvb3IoeSk7XHJcblxyXG5cdFx0dmFyIGJveCA9IHt0aWxlOiB0aWxlLCB4OiB4LCB5OiB5fTtcclxuXHRcdFxyXG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IHRpbGUud2lkdGg7IGkrKyl7XHJcblx0XHRcdGZvcih2YXIgaiA9IDA7IGogPCB0aWxlLmhlaWdodDsgaisrKXtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRNYXBbait5XVtpK3hdID0gYm94O1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdERyYXcubWFwLmFkZCh0aWxlLCB4LCB5KTtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ3JMb2dpYztcclxuIiwiZnVuY3Rpb24gQ3JTd2l0Y2gobmFtZV9jbGFzcywgaWRzKXtcblx0aWYoQXJyYXkuaXNBcnJheShpZHMpKXtcblx0XHR2YXIgZWxlbXMgPSBpZHMubWFwKGdldE5vZGUpO1xuXHRcdGVsZW1zID0gZWxlbXMubWFwKGVsZW0gPT4gZWxlbS5jbGFzc0xpc3QpO1xuXG5cdFx0cmV0dXJuIGFyclN3aWN0aC5iaW5kKG51bGwsIGVsZW1zLCBuYW1lX2NsYXNzKTtcblx0fVxuXHRlbHNlIGlmKHR5cGVvZiBpZHMgPT0gXCJvYmplY3RcIil7XG5cdFx0cmV0dXJuIG9ialN3aXRjaChpZHMsIG5hbWVfY2xhc3MpO1xuXHR9XG5cdGVsc2V7XG5cdFx0dmFyIGVsZW0gPSBnZXROb2RlKGlkcykuY2xhc3NMaXN0O1xuXHRcdHJldHVybiBvbmVTd2l0Y2guYmluZChudWxsLCBuYW1lX2NsYXNzLCBlbGVtKTtcblx0fVxuXHRcbn1cblxuZnVuY3Rpb24gb2JqU3dpdGNoKGlkX29iaiwgY2xhc3NfbmFtZSl7XG5cdGZvciAodmFyIGtleSBpbiBpZF9vYmope1xuXHRcdGlkX29ialtrZXldID0gZ2V0Tm9kZShpZF9vYmpba2V5XSkuY2xhc3NMaXN0O1xuXHR9XG5cblx0cmV0dXJuIGZ1bmN0aW9uKGlkKXtcblx0XHRmb3IgKHZhciBpIGluIGlkX29iail7XG5cdFx0XHRpZF9vYmpbaV0uYWRkKGNsYXNzX25hbWUpO1xuXHRcdH1cblx0XHRcblx0XHRpZF9vYmpbaWRdLnJlbW92ZShjbGFzc19uYW1lKTtcblx0fVxufVxuXG5mdW5jdGlvbiBhcnJTd2ljdGgoZWxlbV9hcnIsIG5hbWVfY2xhc3Mpe1xuXHRlbGVtX2Fyci5mb3JFYWNoKG9uZVN3aXRjaC5iaW5kKG51bGwsIG5hbWVfY2xhc3MpKTtcbn1cblxuZnVuY3Rpb24gb25lU3dpdGNoKG5hbWVfY2xhc3MsIGVsZW0pe1xuXHRcdGVsZW0udG9nZ2xlKG5hbWVfY2xhc3MpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENyU3dpdGNoO1xuXG5mdW5jdGlvbiBnZXROb2RlKGlkKXtcblx0dmFyIGVsZW0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG5cdGlmKCFlbGVtKSB0aHJvdyBuZXcgRXJyb3IoXCJFbGVtIGlzIG5vdCBmaW5kIVwiKTtcblx0cmV0dXJuIGVsZW07XG59IiwiY29uc3QgRHJhdyA9IHJlcXVpcmUoXCIuL0RyYXcuanNcIik7XHJcbmNvbnN0IENyTG9naWMgPSByZXF1aXJlKFwiLi9Mb2dpYy5qc1wiKTtcclxuXHJcbmNvbnN0IENyQ29udHIgPSByZXF1aXJlKFwiLi9Db250cm9sLmpzXCIpO1xyXG5jb25zdCBDclN3aXRjaGVzID0gcmVxdWlyZShcIi4vQ3JTd2l0Y2hlcy5qc1wiKTtcclxuXHJcbnZhciBUaWxlc2V0ID0gcmVxdWlyZShcIi4vdGlsZXNldC5qc29uXCIpO1xyXG52YXIgTG9naWMgPSBuZXcgQ3JMb2dpYyhEcmF3KTtcclxuQ3JDb250cihMb2dpYywgRHJhdyk7XHJcbkNyU3dpdGNoZXMoRHJhdyk7IiwidmFyIENocm9tYXRoID0gcmVxdWlyZSgnLi9zcmMvY2hyb21hdGguanMnKTtcbm1vZHVsZS5leHBvcnRzID0gQ2hyb21hdGg7XG4iLCJ2YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuLypcbiAgIENsYXNzOiBDaHJvbWF0aFxuKi9cbi8vIEdyb3VwOiBDb25zdHJ1Y3RvcnNcbi8qXG4gICBDb25zdHJ1Y3RvcjogQ2hyb21hdGhcbiAgIENyZWF0ZSBhIG5ldyBDaHJvbWF0aCBpbnN0YW5jZSBmcm9tIGEgc3RyaW5nIG9yIGludGVnZXJcblxuICAgUGFyYW1ldGVyczpcbiAgIG1peGVkIC0gVGhlIHZhbHVlIHRvIHVzZSBmb3IgY3JlYXRpbmcgdGhlIGNvbG9yXG5cbiAgIFJldHVybnM6XG4gICA8Q2hyb21hdGg+IGluc3RhbmNlXG5cbiAgIFByb3BlcnRpZXM6XG4gICByIC0gVGhlIHJlZCBjaGFubmVsIG9mIHRoZSBSR0IgcmVwcmVzZW50YXRpb24gb2YgdGhlIENocm9tYXRoLiBBIG51bWJlciBiZXR3ZWVuIDAgYW5kIDI1NS5cbiAgIGcgLSBUaGUgZ3JlZW4gY2hhbm5lbCBvZiB0aGUgUkdCIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBDaHJvbWF0aC4gQSBudW1iZXIgYmV0d2VlbiAwIGFuZCAyNTUuXG4gICBiIC0gVGhlIGJsdWUgY2hhbm5lbCBvZiB0aGUgUkdCIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBDaHJvbWF0aC4gQSBudW1iZXIgYmV0d2VlbiAwIGFuZCAyNTUuXG4gICBhIC0gVGhlIGFscGhhIGNoYW5uZWwgb2YgdGhlIENocm9tYXRoLiBBIG51bWJlciBiZXR3ZWVuIDAgYW5kIDEuXG4gICBoIC0gVGhlIGh1ZSBvZiB0aGUgQ2hyb21hdGguIEEgbnVtYmVyIGJldHdlZW4gMCBhbmQgMzYwLlxuICAgc2wgLSBUaGUgc2F0dXJhdGlvbiBvZiB0aGUgSFNMIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBDaHJvbWF0aC4gQSBudW1iZXIgYmV0d2VlbiAwIGFuZCAxLlxuICAgc3YgLSBUaGUgc2F0dXJhdGlvbiBvZiB0aGUgSFNWL0hTQiByZXByZXNlbnRhdGlvbiBvZiB0aGUgQ2hyb21hdGguIEEgbnVtYmVyIGJldHdlZW4gMCBhbmQgMS5cbiAgIGwgLSBUaGUgbGlnaHRuZXNzIG9mIHRoZSBIU0wgcmVwcmVzZW50YXRpb24gb2YgdGhlIENocm9tYXRoLiBBIG51bWJlciBiZXR3ZWVuIDAgYW5kIDEuXG4gICB2IC0gVGhlIGxpZ2h0bmVzcyBvZiB0aGUgSFNWL0hTQiByZXByZXNlbnRhdGlvbiBvZiB0aGUgQ2hyb21hdGguIEEgbnVtYmVyIGJldHdlZW4gMCBhbmQgMS5cblxuICAgRXhhbXBsZXM6XG4gIChzdGFydCBjb2RlKVxuLy8gVGhlcmUgYXJlIG1hbnkgd2F5cyB0byBjcmVhdGUgYSBDaHJvbWF0aCBpbnN0YW5jZVxubmV3IENocm9tYXRoKCcjRkYwMDAwJyk7ICAgICAgICAgICAgICAgICAgLy8gSGV4ICg2IGNoYXJhY3RlcnMgd2l0aCBoYXNoKVxubmV3IENocm9tYXRoKCdGRjAwMDAnKTsgICAgICAgICAgICAgICAgICAgLy8gSGV4ICg2IGNoYXJhY3RlcnMgd2l0aG91dCBoYXNoKVxubmV3IENocm9tYXRoKCcjRjAwJyk7ICAgICAgICAgICAgICAgICAgICAgLy8gSGV4ICgzIGNoYXJhY3RlcnMgd2l0aCBoYXNoKVxubmV3IENocm9tYXRoKCdGMDAnKTsgICAgICAgICAgICAgICAgICAgICAgLy8gSGV4ICgzIGNoYXJhY3RlcnMgd2l0aG91dCBoYXNoKVxubmV3IENocm9tYXRoKCdyZWQnKTsgICAgICAgICAgICAgICAgICAgICAgLy8gQ1NTL1NWRyBDb2xvciBuYW1lXG5uZXcgQ2hyb21hdGgoJ3JnYigyNTUsIDAsIDApJyk7ICAgICAgICAgICAvLyBSR0IgdmlhIENTU1xubmV3IENocm9tYXRoKHtyOiAyNTUsIGc6IDAsIGI6IDB9KTsgICAgICAgLy8gUkdCIHZpYSBvYmplY3Rcbm5ldyBDaHJvbWF0aCgncmdiYSgyNTUsIDAsIDAsIDEpJyk7ICAgICAgIC8vIFJHQkEgdmlhIENTU1xubmV3IENocm9tYXRoKHtyOiAyNTUsIGc6IDAsIGI6IDAsIGE6IDF9KTsgLy8gUkdCQSB2aWEgb2JqZWN0XG5uZXcgQ2hyb21hdGgoJ2hzbCgwLCAxMDAlLCA1MCUpJyk7ICAgICAgICAvLyBIU0wgdmlhIENTU1xubmV3IENocm9tYXRoKHtoOiAwLCBzOiAxLCBsOiAwLjV9KTsgICAgICAgLy8gSFNMIHZpYSBvYmplY3Rcbm5ldyBDaHJvbWF0aCgnaHNsYSgwLCAxMDAlLCA1MCUsIDEpJyk7ICAgIC8vIEhTTEEgdmlhIENTU1xubmV3IENocm9tYXRoKHtoOiAwLCBzOiAxLCBsOiAwLjUsIGE6IDF9KTsgLy8gSFNMQSB2aWEgb2JqZWN0XG5uZXcgQ2hyb21hdGgoJ2hzdigwLCAxMDAlLCAxMDAlKScpOyAgICAgICAvLyBIU1YgdmlhIENTU1xubmV3IENocm9tYXRoKHtoOiAwLCBzOiAxLCB2OiAxfSk7ICAgICAgICAgLy8gSFNWIHZpYSBvYmplY3Rcbm5ldyBDaHJvbWF0aCgnaHN2YSgwLCAxMDAlLCAxMDAlLCAxKScpOyAgIC8vIEhTVkEgdmlhIENTU1xubmV3IENocm9tYXRoKHtoOiAwLCBzOiAxLCB2OiAxLCBhOiAxfSk7ICAgLy8gSFNWQSB2aWEgb2JqZWN0XG5uZXcgQ2hyb21hdGgoJ2hzYigwLCAxMDAlLCAxMDAlKScpOyAgICAgICAvLyBIU0IgdmlhIENTU1xubmV3IENocm9tYXRoKHtoOiAwLCBzOiAxLCBiOiAxfSk7ICAgICAgICAgLy8gSFNCIHZpYSBvYmplY3Rcbm5ldyBDaHJvbWF0aCgnaHNiYSgwLCAxMDAlLCAxMDAlLCAxKScpOyAgIC8vIEhTQkEgdmlhIENTU1xubmV3IENocm9tYXRoKHtoOiAwLCBzOiAxLCBiOiAxLCBhOiAxfSk7ICAgLy8gSFNCQSB2aWEgb2JqZWN0XG5uZXcgQ2hyb21hdGgoMTY3MTE2ODApOyAgICAgICAgICAgICAgICAgICAvLyBSR0IgdmlhIGludGVnZXIgKGFscGhhIGN1cnJlbnRseSBpZ25vcmVkKVxuKGVuZCBjb2RlKVxuKi9cbmZ1bmN0aW9uIENocm9tYXRoKCBtaXhlZCApXG57XG4gICAgdmFyIGNoYW5uZWxzLCBjb2xvciwgaHNsLCBoc3YsIHJnYjtcblxuICAgIGlmICh1dGlsLmlzU3RyaW5nKG1peGVkKSB8fCB1dGlsLmlzTnVtYmVyKG1peGVkKSkge1xuICAgICAgICBjaGFubmVscyA9IENocm9tYXRoLnBhcnNlKG1peGVkKTtcbiAgICB9IGVsc2UgaWYgKHV0aWwuaXNBcnJheShtaXhlZCkpe1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vuc3VyZSBob3cgdG8gcGFyc2UgYXJyYXkgYCcrbWl4ZWQrJ2AnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICcsIHBsZWFzZSBwYXNzIGFuIG9iamVjdCBvciBDU1Mgc3R5bGUgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnb3IgdHJ5IENocm9tYXRoLnJnYiwgQ2hyb21hdGguaHNsLCBvciBDaHJvbWF0aC5oc3YnXG4gICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgfSBlbHNlIGlmIChtaXhlZCBpbnN0YW5jZW9mIENocm9tYXRoKSB7XG4gICAgICAgIGNoYW5uZWxzID0gdXRpbC5tZXJnZSh7fSwgbWl4ZWQpO1xuICAgIH0gZWxzZSBpZiAodXRpbC5pc09iamVjdChtaXhlZCkpe1xuICAgICAgICBjaGFubmVscyA9IHV0aWwubWVyZ2Uoe30sIG1peGVkKTtcbiAgICB9XG5cbiAgICBpZiAoISBjaGFubmVscylcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgcGFyc2UgYCcrbWl4ZWQrJ2AnKTtcbiAgICBlbHNlIGlmICghaXNGaW5pdGUoY2hhbm5lbHMuYSkpXG4gICAgICAgIGNoYW5uZWxzLmEgPSAxO1xuXG4gICAgaWYgKCdyJyBpbiBjaGFubmVscyApe1xuICAgICAgICByZ2IgPSB1dGlsLnJnYi5zY2FsZWQwMShbY2hhbm5lbHMuciwgY2hhbm5lbHMuZywgY2hhbm5lbHMuYl0pO1xuICAgICAgICBoc2wgPSBDaHJvbWF0aC5yZ2IyaHNsKHJnYik7XG4gICAgICAgIGhzdiA9IENocm9tYXRoLnJnYjJoc3YocmdiKTtcbiAgICB9IGVsc2UgaWYgKCdoJyBpbiBjaGFubmVscyApe1xuICAgICAgICBpZiAoJ2wnIGluIGNoYW5uZWxzKXtcbiAgICAgICAgICAgIGhzbCA9IHV0aWwuaHNsLnNjYWxlZChbY2hhbm5lbHMuaCwgY2hhbm5lbHMucywgY2hhbm5lbHMubF0pO1xuICAgICAgICAgICAgcmdiID0gQ2hyb21hdGguaHNsMnJnYihoc2wpO1xuICAgICAgICAgICAgaHN2ID0gQ2hyb21hdGgucmdiMmhzdihyZ2IpO1xuICAgICAgICB9IGVsc2UgaWYgKCd2JyBpbiBjaGFubmVscyB8fCAnYicgaW4gY2hhbm5lbHMpIHtcbiAgICAgICAgICAgIGlmICgnYicgaW4gY2hhbm5lbHMpIGNoYW5uZWxzLnYgPSBjaGFubmVscy5iO1xuICAgICAgICAgICAgaHN2ID0gdXRpbC5oc2wuc2NhbGVkKFtjaGFubmVscy5oLCBjaGFubmVscy5zLCBjaGFubmVscy52XSk7XG4gICAgICAgICAgICByZ2IgPSBDaHJvbWF0aC5oc3YycmdiKGhzdik7XG4gICAgICAgICAgICBoc2wgPSBDaHJvbWF0aC5yZ2IyaHNsKHJnYik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIHV0aWwubWVyZ2UodGhpcywge1xuICAgICAgICByOiAgcmdiWzBdLCAgZzogcmdiWzFdLCBiOiByZ2JbMl0sXG4gICAgICAgIGg6ICBoc2xbMF0sIHNsOiBoc2xbMV0sIGw6IGhzbFsyXSxcbiAgICAgICAgc3Y6IGhzdlsxXSwgIHY6IGhzdlsyXSwgYTogY2hhbm5lbHMuYVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59XG5cbi8qXG4gIENvbnN0cnVjdG9yOiBDaHJvbWF0aC5yZ2JcbiAgQ3JlYXRlIGEgbmV3IDxDaHJvbWF0aD4gaW5zdGFuY2UgZnJvbSBSR0IgdmFsdWVzXG5cbiAgUGFyYW1ldGVyczpcbiAgciAtIE51bWJlciwgMC0yNTUsIHJlcHJlc2VudGluZyB0aGUgZ3JlZW4gY2hhbm5lbCBPUiBBcnJheSBPUiBvYmplY3QgKHdpdGgga2V5cyByLGcsYikgb2YgUkdCIHZhbHVlc1xuICBnIC0gTnVtYmVyLCAwLTI1NSwgcmVwcmVzZW50aW5nIHRoZSBncmVlbiBjaGFubmVsXG4gIGIgLSBOdW1iZXIsIDAtMjU1LCByZXByZXNlbnRpbmcgdGhlIHJlZCBjaGFubmVsXG4gIGEgLSAoT3B0aW9uYWwpIEZsb2F0LCAwLTEsIHJlcHJlc2VudGluZyB0aGUgYWxwaGEgY2hhbm5lbFxuXG4gUmV0dXJuczpcbiA8Q2hyb21hdGg+XG5cbiBFeGFtcGxlczpcbiA+ID4gbmV3IENocm9tYXRoLnJnYigxMjMsIDIzNCwgNTYpLnRvU3RyaW5nKClcbiA+IFwiIzdCRUEzOFwiXG5cbiA+ID4gbmV3IENocm9tYXRoLnJnYihbMTIzLCAyMzQsIDU2XSkudG9TdHJpbmcoKVxuID4gXCIjN0JFQTM4XCJcblxuID4gPiBuZXcgQ2hyb21hdGgucmdiKHtyOiAxMjMsIGc6IDIzNCwgYjogNTZ9KS50b1N0cmluZygpXG4gPiBcIiM3QkVBMzhcIlxuICovXG5DaHJvbWF0aC5yZ2IgPSBmdW5jdGlvbiAociwgZywgYiwgYSlcbntcbiAgICB2YXIgcmdiYSA9IHV0aWwucmdiLmZyb21BcmdzKHIsIGcsIGIsIGEpO1xuICAgIHIgPSByZ2JhWzBdLCBnID0gcmdiYVsxXSwgYiA9IHJnYmFbMl0sIGEgPSByZ2JhWzNdO1xuXG4gICAgcmV0dXJuIG5ldyBDaHJvbWF0aCh7cjogciwgZzogZywgYjogYiwgYTogYX0pO1xufTtcblxuLypcbiAgQ29uc3RydWN0b3I6IENocm9tYXRoLnJnYmFcbiAgQWxpYXMgZm9yIDxDaHJvbWF0aC5yZ2I+XG4qL1xuQ2hyb21hdGgucmdiYSA9IENocm9tYXRoLnJnYjtcblxuLypcbiAgQ29uc3RydWN0b3I6IENocm9tYXRoLmhzbFxuICBDcmVhdGUgYSBuZXcgQ2hyb21hdGggaW5zdGFuY2UgZnJvbSBIU0wgdmFsdWVzXG5cbiAgUGFyYW1ldGVyczpcbiAgaCAtIE51bWJlciwgLUluZmluaXR5IC0gSW5maW5pdHksIHJlcHJlc2VudGluZyB0aGUgaHVlIE9SIEFycmF5IE9SIG9iamVjdCAod2l0aCBrZXlzIGgscyxsKSBvZiBIU0wgdmFsdWVzXG4gIHMgLSBOdW1iZXIsIDAtMSwgcmVwcmVzZW50aW5nIHRoZSBzYXR1cmF0aW9uXG4gIGwgLSBOdW1iZXIsIDAtMSwgcmVwcmVzZW50aW5nIHRoZSBsaWdodG5lc3NcbiAgYSAtIChPcHRpb25hbCkgRmxvYXQsIDAtMSwgcmVwcmVzZW50aW5nIHRoZSBhbHBoYSBjaGFubmVsXG5cbiAgUmV0dXJuczpcbiAgPENocm9tYXRoPlxuXG4gIEV4YW1wbGVzOlxuICA+ID4gbmV3IENocm9tYXRoLmhzbCgyNDAsIDEsIDAuNSkudG9TdHJpbmcoKVxuICA+IFwiIzAwMDBGRlwiXG5cbiAgPiA+IG5ldyBDaHJvbWF0aC5oc2woWzI0MCwgMSwgMC41XSkudG9TdHJpbmcoKVxuICA+IFwiIzAwMDBGRlwiXG5cbiAgPiBuZXcgQ2hyb21hdGguaHNsKHtoOjI0MCwgczoxLCBsOjAuNX0pLnRvU3RyaW5nKClcbiAgPiBcIiMwMDAwRkZcIlxuICovXG5DaHJvbWF0aC5oc2wgPSBmdW5jdGlvbiAoaCwgcywgbCwgYSlcbntcbiAgICB2YXIgaHNsYSA9IHV0aWwuaHNsLmZyb21BcmdzKGgsIHMsIGwsIGEpO1xuICAgIGggPSBoc2xhWzBdLCBzID0gaHNsYVsxXSwgbCA9IGhzbGFbMl0sIGEgPSBoc2xhWzNdO1xuXG4gICAgcmV0dXJuIG5ldyBDaHJvbWF0aCh7aDogaCwgczogcywgbDogbCwgYTogYX0pO1xufTtcblxuLypcbiAgQ29uc3RydWN0b3I6IENocm9tYXRoLmhzbGFcbiAgQWxpYXMgZm9yIDxDaHJvbWF0aC5oc2w+XG4qL1xuQ2hyb21hdGguaHNsYSA9IENocm9tYXRoLmhzbDtcblxuLypcbiAgQ29uc3RydWN0b3I6IENocm9tYXRoLmhzdlxuICBDcmVhdGUgYSBuZXcgQ2hyb21hdGggaW5zdGFuY2UgZnJvbSBIU1YgdmFsdWVzXG5cbiAgUGFyYW1ldGVyczpcbiAgaCAtIE51bWJlciwgLUluZmluaXR5IC0gSW5maW5pdHksIHJlcHJlc2VudGluZyB0aGUgaHVlIE9SIEFycmF5IE9SIG9iamVjdCAod2l0aCBrZXlzIGgscyxsKSBvZiBIU1YgdmFsdWVzXG4gIHMgLSBOdW1iZXIsIDAtMSwgcmVwcmVzZW50aW5nIHRoZSBzYXR1cmF0aW9uXG4gIHYgLSBOdW1iZXIsIDAtMSwgcmVwcmVzZW50aW5nIHRoZSBsaWdodG5lc3NcbiAgYSAtIChPcHRpb25hbCkgRmxvYXQsIDAtMSwgcmVwcmVzZW50aW5nIHRoZSBhbHBoYSBjaGFubmVsXG5cbiAgUmV0dXJuczpcbiAgPENocm9tYXRoPlxuXG4gIEV4YW1wbGVzOlxuICA+ID4gbmV3IENocm9tYXRoLmhzdigyNDAsIDEsIDEpLnRvU3RyaW5nKClcbiAgPiBcIiMwMDAwRkZcIlxuXG4gID4gPiBuZXcgQ2hyb21hdGguaHN2KFsyNDAsIDEsIDFdKS50b1N0cmluZygpXG4gID4gXCIjMDAwMEZGXCJcblxuICA+ID4gbmV3IENocm9tYXRoLmhzdih7aDoyNDAsIHM6MSwgdjoxfSkudG9TdHJpbmcoKVxuICA+IFwiIzAwMDBGRlwiXG4gKi9cbkNocm9tYXRoLmhzdiA9IGZ1bmN0aW9uIChoLCBzLCB2LCBhKVxue1xuICAgIHZhciBoc3ZhID0gdXRpbC5oc2wuZnJvbUFyZ3MoaCwgcywgdiwgYSk7XG4gICAgaCA9IGhzdmFbMF0sIHMgPSBoc3ZhWzFdLCB2ID0gaHN2YVsyXSwgYSA9IGhzdmFbM107XG5cbiAgICByZXR1cm4gbmV3IENocm9tYXRoKHtoOiBoLCBzOiBzLCB2OiB2LCBhOiBhfSk7XG59O1xuXG4vKlxuICBDb25zdHJ1Y3RvcjogQ2hyb21hdGguaHN2YVxuICBBbGlhcyBmb3IgPENocm9tYXRoLmhzdj5cbiovXG5DaHJvbWF0aC5oc3ZhID0gQ2hyb21hdGguaHN2O1xuXG4vKlxuICBDb25zdHJ1Y3RvcjogQ2hyb21hdGguaHNiXG4gIEFsaWFzIGZvciA8Q2hyb21hdGguaHN2PlxuICovXG5DaHJvbWF0aC5oc2IgPSBDaHJvbWF0aC5oc3Y7XG5cbi8qXG4gICBDb25zdHJ1Y3RvcjogQ2hyb21hdGguaHNiYVxuICAgQWxpYXMgZm9yIDxDaHJvbWF0aC5oc3ZhPlxuICovXG5DaHJvbWF0aC5oc2JhID0gQ2hyb21hdGguaHN2YTtcblxuLy8gR3JvdXA6IFN0YXRpYyBtZXRob2RzIC0gcmVwcmVzZW50YXRpb25cbi8qXG4gIE1ldGhvZDogQ2hyb21hdGgudG9JbnRlZ2VyXG4gIENvbnZlcnQgYSBjb2xvciBpbnRvIGFuIGludGVnZXIgKGFscGhhIGNoYW5uZWwgY3VycmVudGx5IG9taXR0ZWQpXG5cbiAgUGFyYW1ldGVyczpcbiAgY29sb3IgLSBBY2NlcHRzIHRoZSBzYW1lIGFyZ3VtZW50cyBhcyB0aGUgQ2hyb21hdGggY29uc3RydWN0b3JcblxuICBSZXR1cm5zOlxuICBpbnRlZ2VyXG5cbiAgRXhhbXBsZXM6XG4gID4gPiBDaHJvbWF0aC50b0ludGVnZXIoJ2dyZWVuJyk7XG4gID4gMzI3NjhcblxuICA+ID4gQ2hyb21hdGgudG9JbnRlZ2VyKCd3aGl0ZScpO1xuICA+IDE2Nzc3MjE1XG4qL1xuQ2hyb21hdGgudG9JbnRlZ2VyID0gZnVuY3Rpb24gKGNvbG9yKVxue1xuICAgIC8vIGNyZWF0ZSBzb21ldGhpbmcgbGlrZSAnMDA4MDAwJyAoZ3JlZW4pXG4gICAgdmFyIGhleDYgPSBuZXcgQ2hyb21hdGgoY29sb3IpLmhleCgpLmpvaW4oJycpO1xuXG4gICAgLy8gQXJndW1lbnRzIGJlZ2lubmluZyB3aXRoIGAweGAgYXJlIHRyZWF0ZWQgYXMgaGV4IHZhbHVlc1xuICAgIHJldHVybiBOdW1iZXIoJzB4JyArIGhleDYpO1xufTtcblxuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC50b05hbWVcbiAgUmV0dXJuIHRoZSBXM0MgY29sb3IgbmFtZSBvZiB0aGUgY29sb3IgaXQgbWF0Y2hlc1xuXG4gIFBhcmFtZXRlcnM6XG4gIGNvbXBhcmlzb25cblxuICBFeGFtcGxlczpcbiAgPiA+IENocm9tYXRoLnRvTmFtZSgncmdiKDI1NSwgMCwgMjU1KScpO1xuICA+ICdmdWNoc2lhJ1xuXG4gID4gPiBDaHJvbWF0aC50b05hbWUoNjU1MzUpO1xuICA+ICdhcXVhJ1xuKi9cbkNocm9tYXRoLnRvTmFtZSA9IGZ1bmN0aW9uIChjb21wYXJpc29uKVxue1xuICAgIGNvbXBhcmlzb24gPSArbmV3IENocm9tYXRoKGNvbXBhcmlzb24pO1xuICAgIGZvciAodmFyIGNvbG9yIGluIENocm9tYXRoLmNvbG9ycykgaWYgKCtDaHJvbWF0aFtjb2xvcl0gPT0gY29tcGFyaXNvbikgcmV0dXJuIGNvbG9yO1xufTtcblxuLy8gR3JvdXA6IFN0YXRpYyBtZXRob2RzIC0gY29sb3IgY29udmVyc2lvblxuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC5yZ2IyaGV4XG4gIENvbnZlcnQgYW4gUkdCIHZhbHVlIHRvIGEgSGV4IHZhbHVlXG5cbiAgUmV0dXJuczogYXJyYXlcblxuICBFeGFtcGxlOlxuICA+ID4gQ2hyb21hdGgucmdiMmhleCg1MCwgMTAwLCAxNTApXG4gID4gXCJbMzIsIDY0LCA5Nl1cIlxuICovXG5DaHJvbWF0aC5yZ2IyaGV4ID0gZnVuY3Rpb24gcmdiMmhleChyLCBnLCBiKVxue1xuICAgIHZhciByZ2IgPSB1dGlsLnJnYi5zY2FsZWQwMShyLCBnLCBiKTtcbiAgICB2YXIgaGV4ID0gcmdiLm1hcChmdW5jdGlvbiAocGN0KSB7XG4gICAgICB2YXIgZGVjID0gTWF0aC5yb3VuZChwY3QgKiAyNTUpO1xuICAgICAgdmFyIGhleCA9IGRlYy50b1N0cmluZygxNikudG9VcHBlckNhc2UoKTtcbiAgICAgIHJldHVybiB1dGlsLmxwYWQoaGV4LCAyLCAwKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBoZXg7XG59O1xuXG4vLyBDb252ZXJ0ZWQgZnJvbSBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0hTTF9hbmRfSFNWI0dlbmVyYWxfYXBwcm9hY2hcbi8qXG4gIE1ldGhvZDogQ2hyb21hdGgucmdiMmhzbFxuICBDb252ZXJ0IFJHQiB0byBIU0xcblxuICBQYXJhbWV0ZXJzOlxuICByIC0gTnVtYmVyLCAwLTI1NSwgcmVwcmVzZW50aW5nIHRoZSBncmVlbiBjaGFubmVsIE9SIEFycmF5IE9SIG9iamVjdCAod2l0aCBrZXlzIHIsZyxiKSBvZiBSR0IgdmFsdWVzXG4gIGcgLSBOdW1iZXIsIDAtMjU1LCByZXByZXNlbnRpbmcgdGhlIGdyZWVuIGNoYW5uZWxcbiAgYiAtIE51bWJlciwgMC0yNTUsIHJlcHJlc2VudGluZyB0aGUgcmVkIGNoYW5uZWxcblxuICBSZXR1cm5zOiBhcnJheVxuXG4gID4gPiBDaHJvbWF0aC5yZ2IyaHNsKDAsIDI1NSwgMCk7XG4gID4gWyAxMjAsIDEsIDAuNSBdXG5cbiAgPiA+IENocm9tYXRoLnJnYjJoc2woWzAsIDAsIDI1NV0pO1xuICA+IFsgMjQwLCAxLCAwLjUgXVxuXG4gID4gPiBDaHJvbWF0aC5yZ2IyaHNsKHtyOiAyNTUsIGc6IDAsIGI6IDB9KTtcbiAgPiBbIDAsIDEsIDAuNSBdXG4gKi9cbkNocm9tYXRoLnJnYjJoc2wgPSBmdW5jdGlvbiByZ2IyaHNsKHIsIGcsIGIpXG57XG4gICAgdmFyIHJnYiA9IHV0aWwucmdiLnNjYWxlZDAxKHIsIGcsIGIpO1xuICAgIHIgPSByZ2JbMF0sIGcgPSByZ2JbMV0sIGIgPSByZ2JbMl07XG5cbiAgICB2YXIgTSA9IE1hdGgubWF4KHIsIGcsIGIpO1xuICAgIHZhciBtID0gTWF0aC5taW4ociwgZywgYik7XG4gICAgdmFyIEMgPSBNIC0gbTtcbiAgICB2YXIgTCA9IDAuNSooTSArIG0pO1xuICAgIHZhciBTID0gKEMgPT09IDApID8gMCA6IEMvKDEtTWF0aC5hYnMoMipMLTEpKTtcblxuICAgIHZhciBoO1xuICAgIGlmIChDID09PSAwKSBoID0gMDsgLy8gc3BlYydkIGFzIHVuZGVmaW5lZCwgYnV0IHVzdWFsbHkgc2V0IHRvIDBcbiAgICBlbHNlIGlmIChNID09PSByKSBoID0gKChnLWIpL0MpICUgNjtcbiAgICBlbHNlIGlmIChNID09PSBnKSBoID0gKChiLXIpL0MpICsgMjtcbiAgICBlbHNlIGlmIChNID09PSBiKSBoID0gKChyLWcpL0MpICsgNDtcblxuICAgIHZhciBIID0gNjAgKiBoO1xuXG4gICAgcmV0dXJuIFtILCBwYXJzZUZsb2F0KFMpLCBwYXJzZUZsb2F0KEwpXTtcbn07XG5cbi8qXG4gIE1ldGhvZDogQ2hyb21hdGgucmdiMmhzdlxuICBDb252ZXJ0IFJHQiB0byBIU1ZcblxuICBQYXJhbWV0ZXJzOlxuICByIC0gTnVtYmVyLCAwLTI1NSwgcmVwcmVzZW50aW5nIHRoZSBncmVlbiBjaGFubmVsIE9SIEFycmF5IE9SIG9iamVjdCAod2l0aCBrZXlzIHIsZyxiKSBvZiBSR0IgdmFsdWVzXG4gIGcgLSBOdW1iZXIsIDAtMjU1LCByZXByZXNlbnRpbmcgdGhlIGdyZWVuIGNoYW5uZWxcbiAgYiAtIE51bWJlciwgMC0yNTUsIHJlcHJlc2VudGluZyB0aGUgcmVkIGNoYW5uZWxcblxuICBSZXR1cm5zOlxuICBBcnJheVxuXG4gID4gPiBDaHJvbWF0aC5yZ2IyaHN2KDAsIDI1NSwgMCk7XG4gID4gWyAxMjAsIDEsIDEgXVxuXG4gID4gPiBDaHJvbWF0aC5yZ2IyaHN2KFswLCAwLCAyNTVdKTtcbiAgPiBbIDI0MCwgMSwgMSBdXG5cbiAgPiA+IENocm9tYXRoLnJnYjJoc3Yoe3I6IDI1NSwgZzogMCwgYjogMH0pO1xuICA+IFsgMCwgMSwgMSBdXG4gKi9cbkNocm9tYXRoLnJnYjJoc3YgPSBmdW5jdGlvbiByZ2IyaHN2KHIsIGcsIGIpXG57XG4gICAgdmFyIHJnYiA9IHV0aWwucmdiLnNjYWxlZDAxKHIsIGcsIGIpO1xuICAgIHIgPSByZ2JbMF0sIGcgPSByZ2JbMV0sIGIgPSByZ2JbMl07XG5cbiAgICB2YXIgTSA9IE1hdGgubWF4KHIsIGcsIGIpO1xuICAgIHZhciBtID0gTWF0aC5taW4ociwgZywgYik7XG4gICAgdmFyIEMgPSBNIC0gbTtcbiAgICB2YXIgTCA9IE07XG4gICAgdmFyIFMgPSAoQyA9PT0gMCkgPyAwIDogQy9NO1xuXG4gICAgdmFyIGg7XG4gICAgaWYgKEMgPT09IDApIGggPSAwOyAvLyBzcGVjJ2QgYXMgdW5kZWZpbmVkLCBidXQgdXN1YWxseSBzZXQgdG8gMFxuICAgIGVsc2UgaWYgKE0gPT09IHIpIGggPSAoKGctYikvQykgJSA2O1xuICAgIGVsc2UgaWYgKE0gPT09IGcpIGggPSAoKGItcikvQykgKyAyO1xuICAgIGVsc2UgaWYgKE0gPT09IGIpIGggPSAoKHItZykvQykgKyA0O1xuXG4gICAgdmFyIEggPSA2MCAqIGg7XG5cbiAgICByZXR1cm4gW0gsIHBhcnNlRmxvYXQoUyksIHBhcnNlRmxvYXQoTCldO1xufTtcblxuLypcbiAgIE1ldGhvZDogQ2hyb21hdGgucmdiMmhzYlxuICAgQWxpYXMgZm9yIDxDaHJvbWF0aC5yZ2IyaHN2PlxuICovXG5DaHJvbWF0aC5yZ2IyaHNiID0gQ2hyb21hdGgucmdiMmhzdjtcblxuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC5oc2wycmdiXG4gIENvbnZlcnQgZnJvbSBIU0wgdG8gUkdCXG5cbiAgUGFyYW1ldGVyczpcbiAgaCAtIE51bWJlciwgLUluZmluaXR5IC0gSW5maW5pdHksIHJlcHJlc2VudGluZyB0aGUgaHVlIE9SIEFycmF5IE9SIG9iamVjdCAod2l0aCBrZXlzIGgscyxsKSBvZiBIU0wgdmFsdWVzXG4gIHMgLSBOdW1iZXIsIDAtMSwgcmVwcmVzZW50aW5nIHRoZSBzYXR1cmF0aW9uXG4gIGwgLSBOdW1iZXIsIDAtMSwgcmVwcmVzZW50aW5nIHRoZSBsaWdodG5lc3NcblxuICBSZXR1cm5zOlxuICBhcnJheVxuXG4gIEV4YW1wbGVzOlxuICA+ID4gQ2hyb21hdGguaHNsMnJnYigzNjAsIDEsIDAuNSk7XG4gID4gWyAyNTUsIDAsIDAgXVxuXG4gID4gPiBDaHJvbWF0aC5oc2wycmdiKFswLCAxLCAwLjVdKTtcbiAgPiBbIDI1NSwgMCwgMCBdXG5cbiAgPiA+IENocm9tYXRoLmhzbDJyZ2Ioe2g6IDIxMCwgczoxLCB2OiAwLjV9KTtcbiAgPiBbIDAsIDEyNy41LCAyNTUgXVxuICovXG4vLyBUT0RPOiBDYW4gSSAlPSBocCBhbmQgdGhlbiBkbyBhIHN3aXRjaD9cbkNocm9tYXRoLmhzbDJyZ2IgPSBmdW5jdGlvbiBoc2wycmdiKGgsIHMsIGwpXG57XG4gICAgdmFyIGhzbCA9IHV0aWwuaHNsLnNjYWxlZChoLCBzLCBsKTtcbiAgICBoPWhzbFswXSwgcz1oc2xbMV0sIGw9aHNsWzJdO1xuXG4gICAgdmFyIEMgPSAoMSAtIE1hdGguYWJzKDIqbC0xKSkgKiBzO1xuICAgIHZhciBocCA9IGgvNjA7XG4gICAgdmFyIFggPSBDICogKDEtTWF0aC5hYnMoaHAlMi0xKSk7XG4gICAgdmFyIHJnYiwgbTtcblxuICAgIHN3aXRjaCAoTWF0aC5mbG9vcihocCkpe1xuICAgIGNhc2UgMDogIHJnYiA9IFtDLFgsMF07IGJyZWFrO1xuICAgIGNhc2UgMTogIHJnYiA9IFtYLEMsMF07IGJyZWFrO1xuICAgIGNhc2UgMjogIHJnYiA9IFswLEMsWF07IGJyZWFrO1xuICAgIGNhc2UgMzogIHJnYiA9IFswLFgsQ107IGJyZWFrO1xuICAgIGNhc2UgNDogIHJnYiA9IFtYLDAsQ107IGJyZWFrO1xuICAgIGNhc2UgNTogIHJnYiA9IFtDLDAsWF07IGJyZWFrO1xuICAgIGRlZmF1bHQ6IHJnYiA9IFswLDAsMF07XG4gICAgfVxuXG4gICAgbSA9IGwgLSAoQy8yKTtcblxuICAgIHJldHVybiBbXG4gICAgICAgIChyZ2JbMF0rbSksXG4gICAgICAgIChyZ2JbMV0rbSksXG4gICAgICAgIChyZ2JbMl0rbSlcbiAgICBdO1xufTtcblxuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC5oc3YycmdiXG4gIENvbnZlcnQgSFNWIHRvIFJHQlxuXG4gIFBhcmFtZXRlcnM6XG4gIGggLSBOdW1iZXIsIC1JbmZpbml0eSAtIEluZmluaXR5LCByZXByZXNlbnRpbmcgdGhlIGh1ZSBPUiBBcnJheSBPUiBvYmplY3QgKHdpdGgga2V5cyBoLHMsdiBvciBoLHMsYikgb2YgSFNWIHZhbHVlc1xuICBzIC0gTnVtYmVyLCAwLTEsIHJlcHJlc2VudGluZyB0aGUgc2F0dXJhdGlvblxuICB2IC0gTnVtYmVyLCAwLTEsIHJlcHJlc2VudGluZyB0aGUgbGlnaHRuZXNzXG5cbiAgRXhhbXBsZXM6XG4gID4gPiBDaHJvbWF0aC5oc3YycmdiKDM2MCwgMSwgMSk7XG4gID4gWyAyNTUsIDAsIDAgXVxuXG4gID4gPiBDaHJvbWF0aC5oc3YycmdiKFswLCAxLCAwLjVdKTtcbiAgPiBbIDEyNy41LCAwLCAwIF1cblxuICA+ID4gQ2hyb21hdGguaHN2MnJnYih7aDogMjEwLCBzOiAwLjUsIHY6IDF9KTtcbiAgPiBbIDEyNy41LCAxOTEuMjUsIDI1NSBdXG4gKi9cbkNocm9tYXRoLmhzdjJyZ2IgPSBmdW5jdGlvbiBoc3YycmdiKGgsIHMsIHYpXG57XG4gICAgdmFyIGhzdiA9IHV0aWwuaHNsLnNjYWxlZChoLCBzLCB2KTtcbiAgICBoPWhzdlswXSwgcz1oc3ZbMV0sIHY9aHN2WzJdO1xuXG4gICAgdmFyIEMgPSB2ICogcztcbiAgICB2YXIgaHAgPSBoLzYwO1xuICAgIHZhciBYID0gQyooMS1NYXRoLmFicyhocCUyLTEpKTtcbiAgICB2YXIgcmdiLCBtO1xuXG4gICAgaWYgKGggPT0gdW5kZWZpbmVkKSAgICAgICAgIHJnYiA9IFswLDAsMF07XG4gICAgZWxzZSBpZiAoMCA8PSBocCAmJiBocCA8IDEpIHJnYiA9IFtDLFgsMF07XG4gICAgZWxzZSBpZiAoMSA8PSBocCAmJiBocCA8IDIpIHJnYiA9IFtYLEMsMF07XG4gICAgZWxzZSBpZiAoMiA8PSBocCAmJiBocCA8IDMpIHJnYiA9IFswLEMsWF07XG4gICAgZWxzZSBpZiAoMyA8PSBocCAmJiBocCA8IDQpIHJnYiA9IFswLFgsQ107XG4gICAgZWxzZSBpZiAoNCA8PSBocCAmJiBocCA8IDUpIHJnYiA9IFtYLDAsQ107XG4gICAgZWxzZSBpZiAoNSA8PSBocCAmJiBocCA8IDYpIHJnYiA9IFtDLDAsWF07XG5cbiAgICBtID0gdiAtIEM7XG5cbiAgICByZXR1cm4gW1xuICAgICAgICAocmdiWzBdK20pLFxuICAgICAgICAocmdiWzFdK20pLFxuICAgICAgICAocmdiWzJdK20pXG4gICAgXTtcbn07XG5cbi8qXG4gICBNZXRob2Q6IENocm9tYXRoLmhzYjJyZ2JcbiAgIEFsaWFzIGZvciA8Q2hyb21hdGguaHN2MnJnYj5cbiAqL1xuQ2hyb21hdGguaHNiMnJnYiA9IENocm9tYXRoLmhzdjJyZ2I7XG5cbi8qXG4gICAgUHJvcGVydHk6IENocm9tYXRoLmNvbnZlcnRcbiAgICBBbGlhc2VzIGZvciB0aGUgQ2hyb21hdGgueDJ5IGZ1bmN0aW9ucy5cbiAgICBVc2UgbGlrZSBDaHJvbWF0aC5jb252ZXJ0W3hdW3ldKGFyZ3MpIG9yIENocm9tYXRoLmNvbnZlcnQueC55KGFyZ3MpXG4qL1xuQ2hyb21hdGguY29udmVydCA9IHtcbiAgICByZ2I6IHtcbiAgICAgICAgaGV4OiBDaHJvbWF0aC5oc3YycmdiLFxuICAgICAgICBoc2w6IENocm9tYXRoLnJnYjJoc2wsXG4gICAgICAgIGhzdjogQ2hyb21hdGgucmdiMmhzdlxuICAgIH0sXG4gICAgaHNsOiB7XG4gICAgICAgIHJnYjogQ2hyb21hdGguaHNsMnJnYlxuICAgIH0sXG4gICAgaHN2OiB7XG4gICAgICAgIHJnYjogQ2hyb21hdGguaHN2MnJnYlxuICAgIH1cbn07XG5cbi8qIEdyb3VwOiBTdGF0aWMgbWV0aG9kcyAtIGNvbG9yIHNjaGVtZSAqL1xuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC5jb21wbGVtZW50XG4gIFJldHVybiB0aGUgY29tcGxlbWVudCBvZiB0aGUgZ2l2ZW4gY29sb3JcblxuICBSZXR1cm5zOiA8Q2hyb21hdGg+XG5cbiAgPiA+IENocm9tYXRoLmNvbXBsZW1lbnQobmV3IENocm9tYXRoKCdyZWQnKSk7XG4gID4geyByOiAwLCBnOiAyNTUsIGI6IDI1NSwgYTogMSwgaDogMTgwLCBzbDogMSwgc3Y6IDEsIGw6IDAuNSwgdjogMSB9XG5cbiAgPiA+IENocm9tYXRoLmNvbXBsZW1lbnQobmV3IENocm9tYXRoKCdyZWQnKSkudG9TdHJpbmcoKTtcbiAgPiAnIzAwRkZGRidcbiAqL1xuQ2hyb21hdGguY29tcGxlbWVudCA9IGZ1bmN0aW9uIChjb2xvcilcbntcbiAgICB2YXIgYyA9IG5ldyBDaHJvbWF0aChjb2xvcik7XG4gICAgdmFyIGhzbCA9IGMudG9IU0xPYmplY3QoKTtcblxuICAgIGhzbC5oID0gKGhzbC5oICsgMTgwKSAlIDM2MDtcblxuICAgIHJldHVybiBuZXcgQ2hyb21hdGgoaHNsKTtcbn07XG5cbi8qXG4gIE1ldGhvZDogQ2hyb21hdGgudHJpYWRcbiAgQ3JlYXRlIGEgdHJpYWQgY29sb3Igc2NoZW1lIGZyb20gdGhlIGdpdmVuIENocm9tYXRoLlxuXG4gIEV4YW1wbGVzOlxuICA+ID4gQ2hyb21hdGgudHJpYWQoQ2hyb21hdGgueWVsbG93KVxuICA+IFsgeyByOiAyNTUsIGc6IDI1NSwgYjogMCwgYTogMSwgaDogNjAsIHNsOiAxLCBzdjogMSwgbDogMC41LCB2OiAxIH0sXG4gID4gICB7IHI6IDAsIGc6IDI1NSwgYjogMjU1LCBhOiAxLCBoOiAxODAsIHNsOiAxLCBzdjogMSwgbDogMC41LCB2OiAxIH0sXG4gID4gICB7IHI6IDI1NSwgZzogMCwgYjogMjU1LCBhOiAxLCBoOiAzMDAsIHNsOiAxLCBzdjogMSwgbDogMC41LCB2OiAxIH0gXVxuXG4gPiA+IENocm9tYXRoLnRyaWFkKENocm9tYXRoLnllbGxvdykudG9TdHJpbmcoKTtcbiA+ICcjRkZGRjAwLCMwMEZGRkYsI0ZGMDBGRidcbiovXG5DaHJvbWF0aC50cmlhZCA9IGZ1bmN0aW9uIChjb2xvcilcbntcbiAgICB2YXIgYyA9IG5ldyBDaHJvbWF0aChjb2xvcik7XG5cbiAgICByZXR1cm4gW1xuICAgICAgICBjLFxuICAgICAgICBuZXcgQ2hyb21hdGgoe3I6IGMuYiwgZzogYy5yLCBiOiBjLmd9KSxcbiAgICAgICAgbmV3IENocm9tYXRoKHtyOiBjLmcsIGc6IGMuYiwgYjogYy5yfSlcbiAgICBdO1xufTtcblxuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC50ZXRyYWRcbiAgQ3JlYXRlIGEgdGV0cmFkIGNvbG9yIHNjaGVtZSBmcm9tIHRoZSBnaXZlbiBDaHJvbWF0aC5cblxuICBFeGFtcGxlczpcbiAgPiA+IENocm9tYXRoLnRldHJhZChDaHJvbWF0aC5jeWFuKVxuICA+IFsgeyByOiAwLCBnOiAyNTUsIGI6IDI1NSwgYTogMSwgaDogMTgwLCBzbDogMSwgc3Y6IDEsIGw6IDAuNSwgdjogMSB9LFxuICA+ICAgeyByOiAyNTUsIGc6IDAsIGI6IDI1NSwgYTogMSwgaDogMzAwLCBzbDogMSwgc3Y6IDEsIGw6IDAuNSwgdjogMSB9LFxuICA+ICAgeyByOiAyNTUsIGc6IDI1NSwgYjogMCwgYTogMSwgaDogNjAsIHNsOiAxLCBzdjogMSwgbDogMC41LCB2OiAxIH0sXG4gID4gICB7IHI6IDAsIGc6IDI1NSwgYjogMCwgYTogMSwgaDogMTIwLCBzbDogMSwgc3Y6IDEsIGw6IDAuNSwgdjogMSB9IF1cblxuICA+ID4gQ2hyb21hdGgudGV0cmFkKENocm9tYXRoLmN5YW4pLnRvU3RyaW5nKCk7XG4gID4gJyMwMEZGRkYsI0ZGMDBGRiwjRkZGRjAwLCMwMEZGMDAnXG4qL1xuQ2hyb21hdGgudGV0cmFkID0gZnVuY3Rpb24gKGNvbG9yKVxue1xuICAgIHZhciBjID0gbmV3IENocm9tYXRoKGNvbG9yKTtcblxuICAgIHJldHVybiBbXG4gICAgICAgIGMsXG4gICAgICAgIG5ldyBDaHJvbWF0aCh7cjogYy5iLCBnOiBjLnIsIGI6IGMuYn0pLFxuICAgICAgICBuZXcgQ2hyb21hdGgoe3I6IGMuYiwgZzogYy5nLCBiOiBjLnJ9KSxcbiAgICAgICAgbmV3IENocm9tYXRoKHtyOiBjLnIsIGc6IGMuYiwgYjogYy5yfSlcbiAgICBdO1xufTtcblxuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC5hbmFsb2dvdXNcbiAgRmluZCBhbmFsb2dvdXMgY29sb3JzIGZyb20gYSBnaXZlbiBjb2xvclxuXG4gIFBhcmFtZXRlcnM6XG4gIG1peGVkIC0gQW55IGFyZ3VtZW50IHdoaWNoIGlzIHBhc3NlZCB0byA8Q2hyb21hdGg+XG4gIHJlc3VsdHMgLSBIb3cgbWFueSBjb2xvcnMgdG8gcmV0dXJuIChkZWZhdWx0ID0gMylcbiAgc2xpY2VzIC0gSG93IG1hbnkgcGllY2VzIGFyZSBpbiB0aGUgY29sb3Igd2hlZWwgKGRlZmF1bHQgPSAxMilcblxuICBFeGFtcGxlczpcbiAgPiA+IENocm9tYXRoLmFuYWxvZ291cyhuZXcgQ2hyb21hdGgoJ3JnYigwLCAyNTUsIDI1NSknKSlcbiAgPiBbIHsgcjogMCwgZzogMjU1LCBiOiAyNTUsIGE6IDEsIGg6IDE4MCwgc2w6IDEsIHN2OiAxLCBsOiAwLjUsIHY6IDEgfSxcbiAgPiAgIHsgcjogMCwgZzogMjU1LCBiOiAxMDEsIGE6IDEsIGg6IDE0NCwgc2w6IDEsIHN2OiAxLCBsOiAwLjUsIHY6IDEgfSxcbiAgPiAgIHsgcjogMCwgZzogMjU1LCBiOiAxNTMsIGE6IDEsIGg6IDE1Niwgc2w6IDEsIHN2OiAxLCBsOiAwLjUsIHY6IDEgfSxcbiAgPiAgIHsgcjogMCwgZzogMjU1LCBiOiAyMDMsIGE6IDEsIGg6IDE2OCwgc2w6IDEsIHN2OiAxLCBsOiAwLjUsIHY6IDEgfSxcbiAgPiAgIHsgcjogMCwgZzogMjU1LCBiOiAyNTUsIGE6IDEsIGg6IDE4MCwgc2w6IDEsIHN2OiAxLCBsOiAwLjUsIHY6IDEgfSxcbiAgPiAgIHsgcjogMCwgZzogMjAzLCBiOiAyNTUsIGE6IDEsIGg6IDE5Miwgc2w6IDEsIHN2OiAxLCBsOiAwLjUsIHY6IDEgfSxcbiAgPiAgIHsgcjogMCwgZzogMTUzLCBiOiAyNTUsIGE6IDEsIGg6IDIwNCwgc2w6IDEsIHN2OiAxLCBsOiAwLjUsIHY6IDEgfSxcbiAgPiAgIHsgcjogMCwgZzogMTAxLCBiOiAyNTUsIGE6IDEsIGg6IDIxNiwgc2w6IDEsIHN2OiAxLCBsOiAwLjUsIHY6IDEgfSBdXG5cbiAgPiA+IENocm9tYXRoLmFuYWxvZ291cyhuZXcgQ2hyb21hdGgoJ3JnYigwLCAyNTUsIDI1NSknKSkudG9TdHJpbmcoKVxuICA+ICcjMDBGRkZGLCMwMEZGNjUsIzAwRkY5OSwjMDBGRkNCLCMwMEZGRkYsIzAwQ0JGRiwjMDA5OUZGLCMwMDY1RkYnXG4gKi9cbkNocm9tYXRoLmFuYWxvZ291cyA9IGZ1bmN0aW9uIChjb2xvciwgcmVzdWx0cywgc2xpY2VzKVxue1xuICAgIGlmICghaXNGaW5pdGUocmVzdWx0cykpIHJlc3VsdHMgPSAzO1xuICAgIGlmICghaXNGaW5pdGUoc2xpY2VzKSkgc2xpY2VzID0gMTI7XG5cbiAgICB2YXIgYyA9IG5ldyBDaHJvbWF0aChjb2xvcik7XG4gICAgdmFyIGhzdiA9IGMudG9IU1ZPYmplY3QoKTtcbiAgICB2YXIgc2xpY2UgPSAzNjAgLyBzbGljZXM7XG4gICAgdmFyIHJldCA9IFsgYyBdO1xuXG4gICAgaHN2LmggPSAoKGhzdi5oIC0gKHNsaWNlcyAqIHJlc3VsdHMgPj4gMSkpICsgNzIwKSAlIDM2MDtcbiAgICB3aGlsZSAoLS1yZXN1bHRzKSB7XG4gICAgICAgIGhzdi5oID0gKGhzdi5oICsgc2xpY2UpICUgMzYwO1xuICAgICAgICByZXQucHVzaChuZXcgQ2hyb21hdGgoaHN2KSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldDtcbn07XG5cbi8qXG4gIE1ldGhvZDogQ2hyb21hdGgubW9ub2Nocm9tYXRpY1xuICBSZXR1cm4gYSBzZXJpZXMgb2YgdGhlIGdpdmVuIGNvbG9yIGF0IHZhcmlvdXMgbGlnaHRuZXNzZXNcblxuICBFeGFtcGxlczpcbiAgPiA+IENocm9tYXRoLm1vbm9jaHJvbWF0aWMoJ3JnYigwLCAxMDAsIDI1NSknKS5mb3JFYWNoKGZ1bmN0aW9uIChjKXsgY29uc29sZS5sb2coYy50b0hTVlN0cmluZygpKTsgfSlcbiAgPiBoc3YoMjE2LDEwMCUsMjAlKVxuICA+IGhzdigyMTYsMTAwJSw0MCUpXG4gID4gaHN2KDIxNiwxMDAlLDYwJSlcbiAgPiBoc3YoMjE2LDEwMCUsODAlKVxuICA+IGhzdigyMTYsMTAwJSwxMDAlKVxuKi9cbkNocm9tYXRoLm1vbm9jaHJvbWF0aWMgPSBmdW5jdGlvbiAoY29sb3IsIHJlc3VsdHMpXG57XG4gICAgaWYgKCFyZXN1bHRzKSByZXN1bHRzID0gNTtcblxuICAgIHZhciBjID0gbmV3IENocm9tYXRoKGNvbG9yKTtcbiAgICB2YXIgaHN2ID0gYy50b0hTVk9iamVjdCgpO1xuICAgIHZhciBpbmMgPSAxIC8gcmVzdWx0cztcbiAgICB2YXIgcmV0ID0gW10sIHN0ZXAgPSAwO1xuXG4gICAgd2hpbGUgKHN0ZXArKyA8IHJlc3VsdHMpIHtcbiAgICAgICAgaHN2LnYgPSBzdGVwICogaW5jO1xuICAgICAgICByZXQucHVzaChuZXcgQ2hyb21hdGgoaHN2KSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldDtcbn07XG5cbi8qXG4gIE1ldGhvZDogQ2hyb21hdGguc3BsaXRjb21wbGVtZW50XG4gIEdlbmVyYXRlIGEgc3BsaXQgY29tcGxlbWVudCBjb2xvciBzY2hlbWUgZnJvbSB0aGUgZ2l2ZW4gY29sb3JcblxuICBFeGFtcGxlczpcbiAgPiA+IENocm9tYXRoLnNwbGl0Y29tcGxlbWVudCgncmdiKDAsIDEwMCwgMjU1KScpXG4gID4gWyB7IHI6IDAsIGc6IDEwMCwgYjogMjU1LCBoOiAyMTYuNDcwNTg4MjM1Mjk0MTQsIHNsOiAxLCBsOiAwLjUsIHN2OiAxLCB2OiAxLCBhOiAxIH0sXG4gID4gICB7IHI6IDI1NSwgZzogMTgzLCBiOiAwLCBoOiA0My4xOTk5OTk5OTk5OTk5OSwgc2w6IDEsIGw6IDAuNSwgc3Y6IDEsIHY6IDEsIGE6IDEgfSxcbiAgPiAgIHsgcjogMjU1LCBnOiA3MywgYjogMCwgaDogMTcuMjc5OTk5OTk5OTk5OTczLCBzbDogMSwgbDogMC41LCBzdjogMSwgdjogMSwgYTogMSB9IF1cblxuICA+ID4gQ2hyb21hdGguc3BsaXRjb21wbGVtZW50KCdyZ2IoMCwgMTAwLCAyNTUpJykudG9TdHJpbmcoKVxuICA+ICcjMDA2NEZGLCNGRkI3MDAsI0ZGNDkwMCdcbiAqL1xuQ2hyb21hdGguc3BsaXRjb21wbGVtZW50ID0gZnVuY3Rpb24gKGNvbG9yKVxue1xuICAgIHZhciByZWYgPSBuZXcgQ2hyb21hdGgoY29sb3IpO1xuICAgIHZhciBoc3YgPSByZWYudG9IU1ZPYmplY3QoKTtcblxuICAgIHZhciBhID0gbmV3IENocm9tYXRoLmhzdih7XG4gICAgICAgIGg6IChoc3YuaCArIDE1MCkgJSAzNjAsXG4gICAgICAgIHM6IGhzdi5zLFxuICAgICAgICB2OiBoc3YudlxuICAgIH0pO1xuXG4gICAgdmFyIGIgPSBuZXcgQ2hyb21hdGguaHN2KHtcbiAgICAgICAgaDogKGhzdi5oICsgMjEwKSAlIDM2MCxcbiAgICAgICAgczogaHN2LnMsXG4gICAgICAgIHY6IGhzdi52XG4gICAgfSk7XG5cbiAgICByZXR1cm4gW3JlZiwgYSwgYl07XG59O1xuXG4vL0dyb3VwOiBTdGF0aWMgbWV0aG9kcyAtIGNvbG9yIGFsdGVyYXRpb25cbi8qXG4gIE1ldGhvZDogQ2hyb21hdGgudGludFxuICBMaWdodGVuIGEgY29sb3IgYnkgYWRkaW5nIGEgcGVyY2VudGFnZSBvZiB3aGl0ZSB0byBpdFxuXG4gIFJldHVybnMgPENocm9tYXRoPlxuXG4gID4gPiBDaHJvbWF0aC50aW50KCdyZ2IoMCwgMTAwLCAyNTUpJywgMC41KS50b1JHQlN0cmluZygpO1xuICA+ICdyZ2IoMTI3LDE3NywyNTUpJ1xuKi9cbkNocm9tYXRoLnRpbnQgPSBmdW5jdGlvbiAoIGZyb20sIGJ5IClcbntcbiAgICByZXR1cm4gQ2hyb21hdGgudG93YXJkcyggZnJvbSwgJyNGRkZGRkYnLCBieSApO1xufTtcblxuLypcbiAgIE1ldGhvZDogQ2hyb21hdGgubGlnaHRlblxuICAgQWxpYXMgZm9yIDxDaHJvbWF0aC50aW50PlxuKi9cbkNocm9tYXRoLmxpZ2h0ZW4gPSBDaHJvbWF0aC50aW50O1xuXG4vKlxuICBNZXRob2Q6IENocm9tYXRoLnNoYWRlXG4gIERhcmtlbiBhIGNvbG9yIGJ5IGFkZGluZyBhIHBlcmNlbnRhZ2Ugb2YgYmxhY2sgdG8gaXRcblxuICBFeGFtcGxlOlxuICA+ID4gQ2hyb21hdGguZGFya2VuKCdyZ2IoMCwgMTAwLCAyNTUpJywgMC41KS50b1JHQlN0cmluZygpO1xuICA+ICdyZ2IoMCw1MCwxMjcpJ1xuICovXG5DaHJvbWF0aC5zaGFkZSA9IGZ1bmN0aW9uICggZnJvbSwgYnkgKVxue1xuICAgIHJldHVybiBDaHJvbWF0aC50b3dhcmRzKCBmcm9tLCAnIzAwMDAwMCcsIGJ5ICk7XG59O1xuXG4vKlxuICAgTWV0aG9kOiBDaHJvbWF0aC5kYXJrZW5cbiAgIEFsaWFzIGZvciA8Q2hyb21hdGguc2hhZGU+XG4gKi9cbkNocm9tYXRoLmRhcmtlbiA9IENocm9tYXRoLnNoYWRlO1xuXG4vKlxuICBNZXRob2Q6IENocm9tYXRoLmRlc2F0dXJhdGVcbiAgRGVzYXR1cmF0ZSBhIGNvbG9yIHVzaW5nIGFueSBvZiAzIGFwcHJvYWNoZXNcblxuICBQYXJhbWV0ZXJzOlxuICBjb2xvciAtIGFueSBhcmd1bWVudCBhY2NlcHRlZCBieSB0aGUgPENocm9tYXRoPiBjb25zdHJ1Y3RvclxuICBmb3JtdWxhIC0gVGhlIGZvcm11bGEgdG8gdXNlIChmcm9tIDx4YXJnJ3MgZ3JleWZpbHRlciBhdCBodHRwOi8vd3d3Lnhhcmcub3JnL3Byb2plY3QvanF1ZXJ5LWNvbG9yLXBsdWdpbi14Y29sb3I+KVxuICAtIDEgLSB4YXJnJ3Mgb3duIGZvcm11bGFcbiAgLSAyIC0gU3VuJ3MgZm9ybXVsYTogKDEgLSBhdmcpIC8gKDEwMCAvIDM1KSArIGF2ZylcbiAgLSBlbXB0eSAtIFRoZSBvZnQtc2VlbiAzMCUgcmVkLCA1OSUgZ3JlZW4sIDExJSBibHVlIGZvcm11bGFcblxuICBFeGFtcGxlczpcbiAgPiA+IENocm9tYXRoLmRlc2F0dXJhdGUoJ3JlZCcpLnRvU3RyaW5nKClcbiAgPiBcIiM0QzRDNENcIlxuXG4gID4gPiBDaHJvbWF0aC5kZXNhdHVyYXRlKCdyZWQnLCAxKS50b1N0cmluZygpXG4gID4gXCIjMzczNzM3XCJcblxuICA+ID4gQ2hyb21hdGguZGVzYXR1cmF0ZSgncmVkJywgMikudG9TdHJpbmcoKVxuICA+IFwiIzkwOTA5MFwiXG4qL1xuQ2hyb21hdGguZGVzYXR1cmF0ZSA9IGZ1bmN0aW9uIChjb2xvciwgZm9ybXVsYSlcbntcbiAgICB2YXIgYyA9IG5ldyBDaHJvbWF0aChjb2xvciksIHJnYiwgYXZnO1xuXG4gICAgc3dpdGNoIChmb3JtdWxhKSB7XG4gICAgY2FzZSAxOiAvLyB4YXJnJ3MgZm9ybXVsYVxuICAgICAgICBhdmcgPSAuMzUgKyAxMyAqIChjLnIgKyBjLmcgKyBjLmIpIC8gNjA7IGJyZWFrO1xuICAgIGNhc2UgMjogLy8gU3VuJ3MgZm9ybXVsYTogKDEgLSBhdmcpIC8gKDEwMCAvIDM1KSArIGF2ZylcbiAgICAgICAgYXZnID0gKDEzICogKGMuciArIGMuZyArIGMuYikgKyA1MzU1KSAvIDYwOyBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgICBhdmcgPSBjLnIgKiAuMyArIGMuZyAqIC41OSArIGMuYiAqIC4xMTtcbiAgICB9XG5cbiAgICBhdmcgPSB1dGlsLmNsYW1wKGF2ZywgMCwgMjU1KTtcbiAgICByZ2IgPSB7cjogYXZnLCBnOiBhdmcsIGI6IGF2Z307XG5cbiAgICByZXR1cm4gbmV3IENocm9tYXRoKHJnYik7XG59O1xuXG4vKlxuICBNZXRob2Q6IENocm9tYXRoLmdyZXlzY2FsZVxuICBBbGlhcyBmb3IgPENocm9tYXRoLmRlc2F0dXJhdGU+XG4qL1xuQ2hyb21hdGguZ3JleXNjYWxlID0gQ2hyb21hdGguZGVzYXR1cmF0ZTtcblxuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC53ZWJzYWZlXG4gIENvbnZlcnQgYSBjb2xvciB0byBvbmUgb2YgdGhlIDIxNiBcIndlYnNhZmVcIiBjb2xvcnNcblxuICBFeGFtcGxlczpcbiAgPiA+IENocm9tYXRoLndlYnNhZmUoJyNBQkNERUYnKS50b1N0cmluZygpXG4gID4gJyM5OUNDRkYnXG5cbiAgPiA+IENocm9tYXRoLndlYnNhZmUoJyNCQkNERUYnKS50b1N0cmluZygpXG4gID4gJyNDQ0NDRkYnXG4gKi9cbkNocm9tYXRoLndlYnNhZmUgPSBmdW5jdGlvbiAoY29sb3IpXG57XG4gICAgY29sb3IgPSBuZXcgQ2hyb21hdGgoY29sb3IpO1xuXG4gICAgY29sb3IuciA9IE1hdGgucm91bmQoY29sb3IuciAvIDUxKSAqIDUxO1xuICAgIGNvbG9yLmcgPSBNYXRoLnJvdW5kKGNvbG9yLmcgLyA1MSkgKiA1MTtcbiAgICBjb2xvci5iID0gTWF0aC5yb3VuZChjb2xvci5iIC8gNTEpICogNTE7XG5cbiAgICByZXR1cm4gbmV3IENocm9tYXRoKGNvbG9yKTtcbn07XG5cbi8vR3JvdXA6IFN0YXRpYyBtZXRob2RzIC0gY29sb3IgY29tYmluYXRpb25cbi8qXG4gIE1ldGhvZDogQ2hyb21hdGguYWRkaXRpdmVcbiAgQ29tYmluZSBhbnkgbnVtYmVyIGNvbG9ycyB1c2luZyBhZGRpdGl2ZSBjb2xvclxuXG4gIEV4YW1wbGVzOlxuICA+ID4gQ2hyb21hdGguYWRkaXRpdmUoJyNGMDAnLCAnIzBGMCcpLnRvU3RyaW5nKCk7XG4gID4gJyNGRkZGMDAnXG5cbiAgPiA+IENocm9tYXRoLmFkZGl0aXZlKCcjRjAwJywgJyMwRjAnKS50b1N0cmluZygpID09IENocm9tYXRoLnllbGxvdy50b1N0cmluZygpO1xuICA+IHRydWVcblxuICA+ID4gQ2hyb21hdGguYWRkaXRpdmUoJ3JlZCcsICcjMEYwJywgJ3JnYigwLCAwLCAyNTUpJykudG9TdHJpbmcoKSA9PSBDaHJvbWF0aC53aGl0ZS50b1N0cmluZygpO1xuICA+IHRydWVcbiAqL1xuQ2hyb21hdGguYWRkaXRpdmUgPSBmdW5jdGlvbiAoKVxue1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzLmxlbmd0aC0yLCBpPS0xLCBhLCBiO1xuICAgIHdoaWxlIChpKysgPCBhcmdzKXtcblxuICAgICAgICBhID0gYSB8fCBuZXcgQ2hyb21hdGgoYXJndW1lbnRzW2ldKTtcbiAgICAgICAgYiA9IG5ldyBDaHJvbWF0aChhcmd1bWVudHNbaSsxXSk7XG5cbiAgICAgICAgaWYgKChhLnIgKz0gYi5yKSA+IDI1NSkgYS5yID0gMjU1O1xuICAgICAgICBpZiAoKGEuZyArPSBiLmcpID4gMjU1KSBhLmcgPSAyNTU7XG4gICAgICAgIGlmICgoYS5iICs9IGIuYikgPiAyNTUpIGEuYiA9IDI1NTtcblxuICAgICAgICBhID0gbmV3IENocm9tYXRoKGEpO1xuICAgIH1cblxuICAgIHJldHVybiBhO1xufTtcblxuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC5zdWJ0cmFjdGl2ZVxuICBDb21iaW5lIGFueSBudW1iZXIgb2YgY29sb3JzIHVzaW5nIHN1YnRyYWN0aXZlIGNvbG9yXG5cbiAgRXhhbXBsZXM6XG4gID4gPiBDaHJvbWF0aC5zdWJ0cmFjdGl2ZSgneWVsbG93JywgJ21hZ2VudGEnKS50b1N0cmluZygpO1xuICA+ICcjRkYwMDAwJ1xuXG4gID4gPiBDaHJvbWF0aC5zdWJ0cmFjdGl2ZSgneWVsbG93JywgJ21hZ2VudGEnKS50b1N0cmluZygpID09PSBDaHJvbWF0aC5yZWQudG9TdHJpbmcoKTtcbiAgPiB0cnVlXG5cbiAgPiA+IENocm9tYXRoLnN1YnRyYWN0aXZlKCdjeWFuJywgJ21hZ2VudGEnLCAneWVsbG93JykudG9TdHJpbmcoKTtcbiAgPiAnIzAwMDAwMCdcblxuICA+ID4gQ2hyb21hdGguc3VidHJhY3RpdmUoJ3JlZCcsICcjMEYwJywgJ3JnYigwLCAwLCAyNTUpJykudG9TdHJpbmcoKTtcbiAgPiAnIzAwMDAwMCdcbiovXG5DaHJvbWF0aC5zdWJ0cmFjdGl2ZSA9IGZ1bmN0aW9uICgpXG57XG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMubGVuZ3RoLTIsIGk9LTEsIGEsIGI7XG4gICAgd2hpbGUgKGkrKyA8IGFyZ3Mpe1xuXG4gICAgICAgIGEgPSBhIHx8IG5ldyBDaHJvbWF0aChhcmd1bWVudHNbaV0pO1xuICAgICAgICBiID0gbmV3IENocm9tYXRoKGFyZ3VtZW50c1tpKzFdKTtcblxuICAgICAgICBpZiAoKGEuciArPSBiLnIgLSAyNTUpIDwgMCkgYS5yID0gMDtcbiAgICAgICAgaWYgKChhLmcgKz0gYi5nIC0gMjU1KSA8IDApIGEuZyA9IDA7XG4gICAgICAgIGlmICgoYS5iICs9IGIuYiAtIDI1NSkgPCAwKSBhLmIgPSAwO1xuXG4gICAgICAgIGEgPSBuZXcgQ2hyb21hdGgoYSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGE7XG59O1xuXG4vKlxuICBNZXRob2Q6IENocm9tYXRoLm11bHRpcGx5XG4gIE11bHRpcGx5IGFueSBudW1iZXIgb2YgY29sb3JzXG5cbiAgRXhhbXBsZXM6XG4gID4gPiBDaHJvbWF0aC5tdWx0aXBseShDaHJvbWF0aC5saWdodGdvbGRlbnJvZHllbGxvdywgQ2hyb21hdGgubGlnaHRibHVlKS50b1N0cmluZygpO1xuICA+IFwiI0E5RDNCRFwiXG5cbiAgPiA+IENocm9tYXRoLm11bHRpcGx5KENocm9tYXRoLm9sZGxhY2UsIENocm9tYXRoLmxpZ2h0Ymx1ZSwgQ2hyb21hdGguZGFya2JsdWUpLnRvU3RyaW5nKCk7XG4gID4gXCIjMDAwMDcwXCJcbiovXG5DaHJvbWF0aC5tdWx0aXBseSA9IGZ1bmN0aW9uICgpXG57XG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMubGVuZ3RoLTIsIGk9LTEsIGEsIGI7XG4gICAgd2hpbGUgKGkrKyA8IGFyZ3Mpe1xuXG4gICAgICAgIGEgPSBhIHx8IG5ldyBDaHJvbWF0aChhcmd1bWVudHNbaV0pO1xuICAgICAgICBiID0gbmV3IENocm9tYXRoKGFyZ3VtZW50c1tpKzFdKTtcblxuICAgICAgICBhLnIgPSAoYS5yIC8gMjU1ICogYi5yKXwwO1xuICAgICAgICBhLmcgPSAoYS5nIC8gMjU1ICogYi5nKXwwO1xuICAgICAgICBhLmIgPSAoYS5iIC8gMjU1ICogYi5iKXwwO1xuXG4gICAgICAgIGEgPSBuZXcgQ2hyb21hdGgoYSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGE7XG59O1xuXG4vKlxuICBNZXRob2Q6IENocm9tYXRoLmF2ZXJhZ2VcbiAgQXZlcmFnZXMgYW55IG51bWJlciBvZiBjb2xvcnNcblxuICBFeGFtcGxlczpcbiAgPiA+IENocm9tYXRoLmF2ZXJhZ2UoQ2hyb21hdGgubGlnaHRnb2xkZW5yb2R5ZWxsb3csIENocm9tYXRoLmxpZ2h0Ymx1ZSkudG9TdHJpbmcoKVxuICA+IFwiI0QzRTlEQ1wiXG5cbiAgPiA+IENocm9tYXRoLmF2ZXJhZ2UoQ2hyb21hdGgub2xkbGFjZSwgQ2hyb21hdGgubGlnaHRibHVlLCBDaHJvbWF0aC5kYXJrYmx1ZSkudG9TdHJpbmcoKVxuICA+IFwiIzZBNzNCOFwiXG4gKi9cbkNocm9tYXRoLmF2ZXJhZ2UgPSBmdW5jdGlvbiAoKVxue1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzLmxlbmd0aC0yLCBpPS0xLCBhLCBiO1xuICAgIHdoaWxlIChpKysgPCBhcmdzKXtcblxuICAgICAgICBhID0gYSB8fCBuZXcgQ2hyb21hdGgoYXJndW1lbnRzW2ldKTtcbiAgICAgICAgYiA9IG5ldyBDaHJvbWF0aChhcmd1bWVudHNbaSsxXSk7XG5cbiAgICAgICAgYS5yID0gKGEuciArIGIucikgPj4gMTtcbiAgICAgICAgYS5nID0gKGEuZyArIGIuZykgPj4gMTtcbiAgICAgICAgYS5iID0gKGEuYiArIGIuYikgPj4gMTtcblxuICAgICAgICBhID0gbmV3IENocm9tYXRoKGEpO1xuICAgIH1cblxuICAgIHJldHVybiBhO1xufTtcblxuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC5vdmVybGF5XG4gIEFkZCBvbmUgY29sb3Igb24gdG9wIG9mIGFub3RoZXIgd2l0aCBhIGdpdmVuIHRyYW5zcGFyZW5jeVxuXG4gIEV4YW1wbGVzOlxuICA+ID4gQ2hyb21hdGguYXZlcmFnZShDaHJvbWF0aC5saWdodGdvbGRlbnJvZHllbGxvdywgQ2hyb21hdGgubGlnaHRibHVlKS50b1N0cmluZygpXG4gID4gXCIjRDNFOURDXCJcblxuICA+ID4gQ2hyb21hdGguYXZlcmFnZShDaHJvbWF0aC5vbGRsYWNlLCBDaHJvbWF0aC5saWdodGJsdWUsIENocm9tYXRoLmRhcmtibHVlKS50b1N0cmluZygpXG4gID4gXCIjNkE3M0I4XCJcbiAqL1xuQ2hyb21hdGgub3ZlcmxheSA9IGZ1bmN0aW9uICh0b3AsIGJvdHRvbSwgb3BhY2l0eSlcbntcbiAgICB2YXIgYSA9IG5ldyBDaHJvbWF0aCh0b3ApO1xuICAgIHZhciBiID0gbmV3IENocm9tYXRoKGJvdHRvbSk7XG5cbiAgICBpZiAob3BhY2l0eSA+IDEpIG9wYWNpdHkgLz0gMTAwO1xuICAgIG9wYWNpdHkgPSB1dGlsLmNsYW1wKG9wYWNpdHkgLSAxICsgYi5hLCAwLCAxKTtcblxuICAgIHJldHVybiBuZXcgQ2hyb21hdGgoe1xuICAgICAgICByOiB1dGlsLmxlcnAoYS5yLCBiLnIsIG9wYWNpdHkpLFxuICAgICAgICBnOiB1dGlsLmxlcnAoYS5nLCBiLmcsIG9wYWNpdHkpLFxuICAgICAgICBiOiB1dGlsLmxlcnAoYS5iLCBiLmIsIG9wYWNpdHkpXG4gICAgfSk7XG59O1xuXG5cbi8vR3JvdXA6IFN0YXRpYyBtZXRob2RzIC0gb3RoZXJcbi8qXG4gIE1ldGhvZDogQ2hyb21hdGgudG93YXJkc1xuICBNb3ZlIGZyb20gb25lIGNvbG9yIHRvd2FyZHMgYW5vdGhlciBieSB0aGUgZ2l2ZW4gcGVyY2VudGFnZSAoMC0xLCAwLTEwMClcblxuICBQYXJhbWV0ZXJzOlxuICBmcm9tIC0gVGhlIHN0YXJ0aW5nIGNvbG9yXG4gIHRvIC0gVGhlIGRlc3RpbmF0aW9uIGNvbG9yXG4gIGJ5IC0gVGhlIHBlcmNlbnRhZ2UsIGV4cHJlc3NlZCBhcyBhIGZsb2F0aW5nIG51bWJlciBiZXR3ZWVuIDAgYW5kIDEsIHRvIG1vdmUgdG93YXJkcyB0aGUgZGVzdGluYXRpb24gY29sb3JcbiAgaW50ZXJwb2xhdG9yIC0gVGhlIGZ1bmN0aW9uIHRvIHVzZSBmb3IgaW50ZXJwb2xhdGluZyBiZXR3ZWVuIHRoZSB0d28gcG9pbnRzLiBEZWZhdWx0cyB0byBMaW5lYXIgSW50ZXJwb2xhdGlvbi4gRnVuY3Rpb24gaGFzIHRoZSBzaWduYXR1cmUgYChmcm9tLCB0bywgYnkpYCB3aXRoIHRoZSBwYXJhbWV0ZXJzIGhhdmluZyB0aGUgc2FtZSBtZWFuaW5nIGFzIHRob3NlIGluIGB0b3dhcmRzYC5cblxuICA+ID4gQ2hyb21hdGgudG93YXJkcygncmVkJywgJ3llbGxvdycsIDAuNSkudG9TdHJpbmcoKVxuICA+IFwiI0ZGN0YwMFwiXG4qL1xuQ2hyb21hdGgudG93YXJkcyA9IGZ1bmN0aW9uIChmcm9tLCB0bywgYnksIGludGVycG9sYXRvcilcbntcbiAgICBpZiAoIXRvKSB7IHJldHVybiBmcm9tOyB9XG4gICAgaWYgKCFpc0Zpbml0ZShieSkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVHlwZUVycm9yOiBgYnlgKCcgKyBieSAgKycpIHNob3VsZCBiZSBiZXR3ZWVuIDAgYW5kIDEnKTtcbiAgICBpZiAoIShmcm9tIGluc3RhbmNlb2YgQ2hyb21hdGgpKSBmcm9tID0gbmV3IENocm9tYXRoKGZyb20pO1xuICAgIGlmICghKHRvIGluc3RhbmNlb2YgQ2hyb21hdGgpKSB0byA9IG5ldyBDaHJvbWF0aCh0byB8fCAnI0ZGRkZGRicpO1xuICAgIGlmICghaW50ZXJwb2xhdG9yKSBpbnRlcnBvbGF0b3IgPSB1dGlsLmxlcnA7XG4gICAgYnkgPSBwYXJzZUZsb2F0KGJ5KTtcblxuICAgIHJldHVybiBuZXcgQ2hyb21hdGgoe1xuICAgICAgICByOiBpbnRlcnBvbGF0b3IoZnJvbS5yLCB0by5yLCBieSksXG4gICAgICAgIGc6IGludGVycG9sYXRvcihmcm9tLmcsIHRvLmcsIGJ5KSxcbiAgICAgICAgYjogaW50ZXJwb2xhdG9yKGZyb20uYiwgdG8uYiwgYnkpLFxuICAgICAgICBhOiBpbnRlcnBvbGF0b3IoZnJvbS5hLCB0by5hLCBieSlcbiAgICB9KTtcbn07XG5cbi8qXG4gIE1ldGhvZDogQ2hyb21hdGguZ3JhZGllbnRcbiAgQ3JlYXRlIGFuIGFycmF5IG9mIENocm9tYXRoIG9iamVjdHNcblxuICBQYXJhbWV0ZXJzOlxuICBmcm9tIC0gVGhlIGJlZ2lubmluZyBjb2xvciBvZiB0aGUgZ3JhZGllbnRcbiAgdG8gLSBUaGUgZW5kIGNvbG9yIG9mIHRoZSBncmFkaWVudFxuICBzbGljZXMgLSBUaGUgbnVtYmVyIG9mIGNvbG9ycyBpbiB0aGUgYXJyYXlcbiAgc2xpY2UgLSBUaGUgY29sb3IgYXQgYSBzcGVjaWZpYywgMS1iYXNlZCwgc2xpY2UgaW5kZXhcblxuICBFeGFtcGxlczpcbiAgPiA+IENocm9tYXRoLmdyYWRpZW50KCdyZWQnLCAneWVsbG93JykubGVuZ3RoO1xuICA+IDIwXG5cbiAgPiA+IENocm9tYXRoLmdyYWRpZW50KCdyZWQnLCAneWVsbG93JywgNSkudG9TdHJpbmcoKTtcbiAgPiBcIiNGRjAwMDAsI0ZGM0YwMCwjRkY3RjAwLCNGRkJGMDAsI0ZGRkYwMFwiXG5cbiAgPiA+IENocm9tYXRoLmdyYWRpZW50KCdyZWQnLCAneWVsbG93JywgNSwgMikudG9TdHJpbmcoKTtcbiAgPiBcIiNGRjdGMDBcIlxuXG4gID4gPiBDaHJvbWF0aC5ncmFkaWVudCgncmVkJywgJ3llbGxvdycsIDUpWzJdLnRvU3RyaW5nKCk7XG4gID4gXCIjRkY3RjAwXCJcbiAqL1xuQ2hyb21hdGguZ3JhZGllbnQgPSBmdW5jdGlvbiAoZnJvbSwgdG8sIHNsaWNlcywgc2xpY2UpXG57XG4gICAgdmFyIGdyYWRpZW50ID0gW10sIHN0b3BzO1xuXG4gICAgaWYgKCEgc2xpY2VzKSBzbGljZXMgPSAyMDtcbiAgICBzdG9wcyA9IChzbGljZXMtMSk7XG5cbiAgICBpZiAoaXNGaW5pdGUoc2xpY2UpKSByZXR1cm4gQ2hyb21hdGgudG93YXJkcyhmcm9tLCB0bywgc2xpY2Uvc3RvcHMpO1xuICAgIGVsc2Ugc2xpY2UgPSAtMTtcblxuICAgIHdoaWxlICgrK3NsaWNlIDwgc2xpY2VzKXtcbiAgICAgICAgZ3JhZGllbnQucHVzaChDaHJvbWF0aC50b3dhcmRzKGZyb20sIHRvLCBzbGljZS9zdG9wcykpO1xuICAgIH1cblxuICAgIHJldHVybiBncmFkaWVudDtcbn07XG5cbi8qXG4gIE1ldGhvZDogQ2hyb21hdGgucGFyc2VcbiAgSXRlcmF0ZSB0aHJvdWdoIHRoZSBvYmplY3RzIHNldCBpbiBDaHJvbWF0aC5wYXJzZXJzIGFuZCwgaWYgYSBtYXRjaCBpcyBtYWRlLCByZXR1cm4gdGhlIHZhbHVlIHNwZWNpZmllZCBieSB0aGUgbWF0Y2hpbmcgcGFyc2VycyBgcHJvY2Vzc2AgZnVuY3Rpb25cblxuICBQYXJhbWV0ZXJzOlxuICBzdHJpbmcgLSBUaGUgc3RyaW5nIHRvIHBhcnNlXG5cbiAgRXhhbXBsZTpcbiAgPiA+IENocm9tYXRoLnBhcnNlKCdyZ2IoMCwgMTI4LCAyNTUpJylcbiAgPiB7IHI6IDAsIGc6IDEyOCwgYjogMjU1LCBhOiB1bmRlZmluZWQgfVxuICovXG5DaHJvbWF0aC5wYXJzZSA9IGZ1bmN0aW9uIChzdHJpbmcpXG57XG4gICAgdmFyIHBhcnNlcnMgPSBDaHJvbWF0aC5wYXJzZXJzLCBpLCBsLCBwYXJzZXIsIHBhcnRzLCBjaGFubmVscztcblxuICAgIGZvciAoaSA9IDAsIGwgPSBwYXJzZXJzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBwYXJzZXIgPSBwYXJzZXJzW2ldO1xuICAgICAgICBwYXJ0cyA9IHBhcnNlci5yZWdleC5leGVjKHN0cmluZyk7XG4gICAgICAgIGlmIChwYXJ0cyAmJiBwYXJ0cy5sZW5ndGgpIGNoYW5uZWxzID0gcGFyc2VyLnByb2Nlc3MuYXBwbHkodGhpcywgcGFydHMpO1xuICAgICAgICBpZiAoY2hhbm5lbHMpIHJldHVybiBjaGFubmVscztcbiAgICB9XG59O1xuXG4vLyBHcm91cDogU3RhdGljIHByb3BlcnRpZXNcbi8qXG4gIFByb3BlcnR5OiBDaHJvbWF0aC5wYXJzZXJzXG4gICBBbiBhcnJheSBvZiBvYmplY3RzIGZvciBhdHRlbXB0aW5nIHRvIGNvbnZlcnQgYSBzdHJpbmcgZGVzY3JpYmluZyBhIGNvbG9yIGludG8gYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHZhcmlvdXMgY2hhbm5lbHMuIE5vIHVzZXIgYWN0aW9uIGlzIHJlcXVpcmVkIGJ1dCBwYXJzZXJzIGNhbiBiZVxuXG4gICBPYmplY3QgcHJvcGVydGllczpcbiAgIHJlZ2V4IC0gcmVndWxhciBleHByZXNzaW9uIHVzZWQgdG8gdGVzdCB0aGUgc3RyaW5nIG9yIG51bWVyaWMgaW5wdXRcbiAgIHByb2Nlc3MgLSBmdW5jdGlvbiB3aGljaCBpcyBwYXNzZWQgdGhlIHJlc3VsdHMgb2YgYHJlZ2V4Lm1hdGNoYCBhbmQgcmV0dXJucyBhbiBvYmplY3Qgd2l0aCBlaXRoZXIgdGhlIHJnYiwgaHNsLCBoc3YsIG9yIGhzYiBjaGFubmVscyBvZiB0aGUgQ2hyb21hdGguXG5cbiAgIEV4YW1wbGVzOlxuKHN0YXJ0IGNvZGUpXG4vLyBBZGQgYSBwYXJzZXJcbkNocm9tYXRoLnBhcnNlcnMucHVzaCh7XG4gICAgZXhhbXBsZTogWzM1NTQ0MzEsIDE2ODA5OTg0XSxcbiAgICByZWdleDogL15cXGQrJC8sXG4gICAgcHJvY2VzczogZnVuY3Rpb24gKGNvbG9yKXtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHI6IGNvbG9yID4+IDE2ICYgMjU1LFxuICAgICAgICAgICAgZzogY29sb3IgPj4gOCAmIDI1NSxcbiAgICAgICAgICAgIGI6IGNvbG9yICYgMjU1XG4gICAgICAgIH07XG4gICAgfVxufSk7XG4oZW5kIGNvZGUpXG4oc3RhcnQgY29kZSlcbi8vIE92ZXJyaWRlIGVudGlyZWx5XG5DaHJvbWF0aC5wYXJzZXJzID0gW1xuICAge1xuICAgICAgIGV4YW1wbGU6IFszNTU0NDMxLCAxNjgwOTk4NF0sXG4gICAgICAgcmVnZXg6IC9eXFxkKyQvLFxuICAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uIChjb2xvcil7XG4gICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICByOiBjb2xvciA+PiAxNiAmIDI1NSxcbiAgICAgICAgICAgICAgIGc6IGNvbG9yID4+IDggJiAyNTUsXG4gICAgICAgICAgICAgICBiOiBjb2xvciAmIDI1NVxuICAgICAgICAgICB9O1xuICAgICAgIH1cbiAgIH0sXG5cbiAgIHtcbiAgICAgICBleGFtcGxlOiBbJyNmYjAnLCAnZjBmJ10sXG4gICAgICAgcmVnZXg6IC9eIz8oW1xcZEEtRl17MX0pKFtcXGRBLUZdezF9KShbXFxkQS1GXXsxfSkkL2ksXG4gICAgICAgcHJvY2VzczogZnVuY3Rpb24gKGhleCwgciwgZywgYil7XG4gICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICByOiBwYXJzZUludChyICsgciwgMTYpLFxuICAgICAgICAgICAgICAgZzogcGFyc2VJbnQoZyArIGcsIDE2KSxcbiAgICAgICAgICAgICAgIGI6IHBhcnNlSW50KGIgKyBiLCAxNilcbiAgICAgICAgICAgfTtcbiAgICAgICB9XG4gICB9XG4oZW5kIGNvZGUpXG4gKi9cbkNocm9tYXRoLnBhcnNlcnMgPSByZXF1aXJlKCcuL3BhcnNlcnMnKS5wYXJzZXJzO1xuXG4vLyBHcm91cDogSW5zdGFuY2UgbWV0aG9kcyAtIGNvbG9yIHJlcHJlc2VudGF0aW9uXG5DaHJvbWF0aC5wcm90b3R5cGUgPSByZXF1aXJlKCcuL3Byb3RvdHlwZScpKENocm9tYXRoKTtcblxuLypcbiAgUHJvcGVydHk6IENocm9tYXRoLmNvbG9yc1xuICBPYmplY3QsIGluZGV4ZWQgYnkgU1ZHL0NTUyBjb2xvciBuYW1lLCBvZiA8Q2hyb21hdGg+IGluc3RhbmNlc1xuICBUaGUgY29sb3IgbmFtZXMgZnJvbSBDU1MgYW5kIFNWRyAxLjBcblxuICBFeGFtcGxlczpcbiAgPiA+IENocm9tYXRoLmNvbG9ycy5hbGljZWJsdWUudG9SR0JBcnJheSgpXG4gID4gWzI0MCwgMjQ4LCAyNTVdXG5cbiAgPiA+IENocm9tYXRoLmNvbG9ycy5iZWlnZS50b1N0cmluZygpXG4gID4gXCIjRjVGNURDXCJcblxuICA+IC8vIENhbiBhbHNvIGJlIGFjY2Vzc2VkIHdpdGhvdXQgYC5jb2xvcmBcbiAgPiA+IENocm9tYXRoLmFsaWNlYmx1ZS50b1JHQkFycmF5KClcbiAgPiBbMjQwLCAyNDgsIDI1NV1cblxuICA+ID4gQ2hyb21hdGguYmVpZ2UudG9TdHJpbmcoKVxuICA+IFwiI0Y1RjVEQ1wiXG4qL1xudmFyIGNzczJDb2xvcnMgID0gcmVxdWlyZSgnLi9jb2xvcm5hbWVzX2NzczInKTtcbnZhciBjc3MzQ29sb3JzICA9IHJlcXVpcmUoJy4vY29sb3JuYW1lc19jc3MzJyk7XG52YXIgYWxsQ29sb3JzICAgPSB1dGlsLm1lcmdlKHt9LCBjc3MyQ29sb3JzLCBjc3MzQ29sb3JzKTtcbkNocm9tYXRoLmNvbG9ycyA9IHt9O1xuZm9yICh2YXIgY29sb3JOYW1lIGluIGFsbENvbG9ycykge1xuICAgIC8vIGUuZy4sIENocm9tYXRoLndoZWF0IGFuZCBDaHJvbWF0aC5jb2xvcnMud2hlYXRcbiAgICBDaHJvbWF0aFtjb2xvck5hbWVdID0gQ2hyb21hdGguY29sb3JzW2NvbG9yTmFtZV0gPSBuZXcgQ2hyb21hdGgoYWxsQ29sb3JzW2NvbG9yTmFtZV0pO1xufVxuLy8gYWRkIGEgcGFyc2VyIGZvciB0aGUgY29sb3IgbmFtZXNcbkNocm9tYXRoLnBhcnNlcnMucHVzaCh7XG4gICAgZXhhbXBsZTogWydyZWQnLCAnYnVybHl3b29kJ10sXG4gICAgcmVnZXg6IC9eW2Etel0rJC9pLFxuICAgIHByb2Nlc3M6IGZ1bmN0aW9uIChjb2xvck5hbWUpe1xuICAgICAgICBpZiAoQ2hyb21hdGguY29sb3JzW2NvbG9yTmFtZV0pIHJldHVybiBDaHJvbWF0aC5jb2xvcnNbY29sb3JOYW1lXTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDaHJvbWF0aDtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIC8vIGZyb20gaHR0cDovL3d3dy53My5vcmcvVFIvUkVDLWh0bWw0MC90eXBlcy5odG1sI2gtNi41XG4gICAgYXF1YSAgICA6IHtyOiAwLCAgIGc6IDI1NSwgYjogMjU1fSxcbiAgICBibGFjayAgIDoge3I6IDAsICAgZzogMCwgICBiOiAwfSxcbiAgICBibHVlICAgIDoge3I6IDAsICAgZzogMCwgICBiOiAyNTV9LFxuICAgIGZ1Y2hzaWEgOiB7cjogMjU1LCBnOiAwLCAgIGI6IDI1NX0sXG4gICAgZ3JheSAgICA6IHtyOiAxMjgsIGc6IDEyOCwgYjogMTI4fSxcbiAgICBncmVlbiAgIDoge3I6IDAsICAgZzogMTI4LCBiOiAwfSxcbiAgICBsaW1lICAgIDoge3I6IDAsICAgZzogMjU1LCBiOiAwfSxcbiAgICBtYXJvb24gIDoge3I6IDEyOCwgZzogMCwgICBiOiAwfSxcbiAgICBuYXZ5ICAgIDoge3I6IDAsICAgZzogMCwgICBiOiAxMjh9LFxuICAgIG9saXZlICAgOiB7cjogMTI4LCBnOiAxMjgsIGI6IDB9LFxuICAgIHB1cnBsZSAgOiB7cjogMTI4LCBnOiAwLCAgIGI6IDEyOH0sXG4gICAgcmVkICAgICA6IHtyOiAyNTUsIGc6IDAsICAgYjogMH0sXG4gICAgc2lsdmVyICA6IHtyOiAxOTIsIGc6IDE5MiwgYjogMTkyfSxcbiAgICB0ZWFsICAgIDoge3I6IDAsICAgZzogMTI4LCBiOiAxMjh9LFxuICAgIHdoaXRlICAgOiB7cjogMjU1LCBnOiAyNTUsIGI6IDI1NX0sXG4gICAgeWVsbG93ICA6IHtyOiAyNTUsIGc6IDI1NSwgYjogMH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvLyBodHRwOi8vd3d3LnczLm9yZy9UUi9jc3MzLWNvbG9yLyNzdmctY29sb3JcbiAgICAvLyBodHRwOi8vd3d3LnczLm9yZy9UUi9TVkcvdHlwZXMuaHRtbCNDb2xvcktleXdvcmRzXG4gICAgYWxpY2VibHVlICAgICAgICAgICAgOiB7cjogMjQwLCBnOiAyNDgsIGI6IDI1NX0sXG4gICAgYW50aXF1ZXdoaXRlICAgICAgICAgOiB7cjogMjUwLCBnOiAyMzUsIGI6IDIxNX0sXG4gICAgYXF1YW1hcmluZSAgICAgICAgICAgOiB7cjogMTI3LCBnOiAyNTUsIGI6IDIxMn0sXG4gICAgYXp1cmUgICAgICAgICAgICAgICAgOiB7cjogMjQwLCBnOiAyNTUsIGI6IDI1NX0sXG4gICAgYmVpZ2UgICAgICAgICAgICAgICAgOiB7cjogMjQ1LCBnOiAyNDUsIGI6IDIyMH0sXG4gICAgYmlzcXVlICAgICAgICAgICAgICAgOiB7cjogMjU1LCBnOiAyMjgsIGI6IDE5Nn0sXG4gICAgYmxhbmNoZWRhbG1vbmQgICAgICAgOiB7cjogMjU1LCBnOiAyMzUsIGI6IDIwNX0sXG4gICAgYmx1ZXZpb2xldCAgICAgICAgICAgOiB7cjogMTM4LCBnOiA0MywgIGI6IDIyNn0sXG4gICAgYnJvd24gICAgICAgICAgICAgICAgOiB7cjogMTY1LCBnOiA0MiwgIGI6IDQyfSxcbiAgICBidXJseXdvb2QgICAgICAgICAgICA6IHtyOiAyMjIsIGc6IDE4NCwgYjogMTM1fSxcbiAgICBjYWRldGJsdWUgICAgICAgICAgICA6IHtyOiA5NSwgIGc6IDE1OCwgYjogMTYwfSxcbiAgICBjaGFydHJldXNlICAgICAgICAgICA6IHtyOiAxMjcsIGc6IDI1NSwgYjogMH0sXG4gICAgY2hvY29sYXRlICAgICAgICAgICAgOiB7cjogMjEwLCBnOiAxMDUsIGI6IDMwfSxcbiAgICBjb3JhbCAgICAgICAgICAgICAgICA6IHtyOiAyNTUsIGc6IDEyNywgYjogODB9LFxuICAgIGNvcm5mbG93ZXJibHVlICAgICAgIDoge3I6IDEwMCwgZzogMTQ5LCBiOiAyMzd9LFxuICAgIGNvcm5zaWxrICAgICAgICAgICAgIDoge3I6IDI1NSwgZzogMjQ4LCBiOiAyMjB9LFxuICAgIGNyaW1zb24gICAgICAgICAgICAgIDoge3I6IDIyMCwgZzogMjAsICBiOiA2MH0sXG4gICAgY3lhbiAgICAgICAgICAgICAgICAgOiB7cjogMCwgICBnOiAyNTUsIGI6IDI1NX0sXG4gICAgZGFya2JsdWUgICAgICAgICAgICAgOiB7cjogMCwgICBnOiAwLCAgIGI6IDEzOX0sXG4gICAgZGFya2N5YW4gICAgICAgICAgICAgOiB7cjogMCwgICBnOiAxMzksIGI6IDEzOX0sXG4gICAgZGFya2dvbGRlbnJvZCAgICAgICAgOiB7cjogMTg0LCBnOiAxMzQsIGI6IDExfSxcbiAgICBkYXJrZ3JheSAgICAgICAgICAgICA6IHtyOiAxNjksIGc6IDE2OSwgYjogMTY5fSxcbiAgICBkYXJrZ3JlZW4gICAgICAgICAgICA6IHtyOiAwLCAgIGc6IDEwMCwgYjogMH0sXG4gICAgZGFya2dyZXkgICAgICAgICAgICAgOiB7cjogMTY5LCBnOiAxNjksIGI6IDE2OX0sXG4gICAgZGFya2toYWtpICAgICAgICAgICAgOiB7cjogMTg5LCBnOiAxODMsIGI6IDEwN30sXG4gICAgZGFya21hZ2VudGEgICAgICAgICAgOiB7cjogMTM5LCBnOiAwLCAgIGI6IDEzOX0sXG4gICAgZGFya29saXZlZ3JlZW4gICAgICAgOiB7cjogODUsICBnOiAxMDcsIGI6IDQ3fSxcbiAgICBkYXJrb3JhbmdlICAgICAgICAgICA6IHtyOiAyNTUsIGc6IDE0MCwgYjogMH0sXG4gICAgZGFya29yY2hpZCAgICAgICAgICAgOiB7cjogMTUzLCBnOiA1MCwgIGI6IDIwNH0sXG4gICAgZGFya3JlZCAgICAgICAgICAgICAgOiB7cjogMTM5LCBnOiAwLCAgIGI6IDB9LFxuICAgIGRhcmtzYWxtb24gICAgICAgICAgIDoge3I6IDIzMywgZzogMTUwLCBiOiAxMjJ9LFxuICAgIGRhcmtzZWFncmVlbiAgICAgICAgIDoge3I6IDE0MywgZzogMTg4LCBiOiAxNDN9LFxuICAgIGRhcmtzbGF0ZWJsdWUgICAgICAgIDoge3I6IDcyLCAgZzogNjEsICBiOiAxMzl9LFxuICAgIGRhcmtzbGF0ZWdyYXkgICAgICAgIDoge3I6IDQ3LCAgZzogNzksICBiOiA3OX0sXG4gICAgZGFya3NsYXRlZ3JleSAgICAgICAgOiB7cjogNDcsICBnOiA3OSwgIGI6IDc5fSxcbiAgICBkYXJrdHVycXVvaXNlICAgICAgICA6IHtyOiAwLCAgIGc6IDIwNiwgYjogMjA5fSxcbiAgICBkYXJrdmlvbGV0ICAgICAgICAgICA6IHtyOiAxNDgsIGc6IDAsICAgYjogMjExfSxcbiAgICBkZWVwcGluayAgICAgICAgICAgICA6IHtyOiAyNTUsIGc6IDIwLCAgYjogMTQ3fSxcbiAgICBkZWVwc2t5Ymx1ZSAgICAgICAgICA6IHtyOiAwLCAgIGc6IDE5MSwgYjogMjU1fSxcbiAgICBkaW1ncmF5ICAgICAgICAgICAgICA6IHtyOiAxMDUsIGc6IDEwNSwgYjogMTA1fSxcbiAgICBkaW1ncmV5ICAgICAgICAgICAgICA6IHtyOiAxMDUsIGc6IDEwNSwgYjogMTA1fSxcbiAgICBkb2RnZXJibHVlICAgICAgICAgICA6IHtyOiAzMCwgIGc6IDE0NCwgYjogMjU1fSxcbiAgICBmaXJlYnJpY2sgICAgICAgICAgICA6IHtyOiAxNzgsIGc6IDM0LCAgYjogMzR9LFxuICAgIGZsb3JhbHdoaXRlICAgICAgICAgIDoge3I6IDI1NSwgZzogMjUwLCBiOiAyNDB9LFxuICAgIGZvcmVzdGdyZWVuICAgICAgICAgIDoge3I6IDM0LCAgZzogMTM5LCBiOiAzNH0sXG4gICAgZ2FpbnNib3JvICAgICAgICAgICAgOiB7cjogMjIwLCBnOiAyMjAsIGI6IDIyMH0sXG4gICAgZ2hvc3R3aGl0ZSAgICAgICAgICAgOiB7cjogMjQ4LCBnOiAyNDgsIGI6IDI1NX0sXG4gICAgZ29sZCAgICAgICAgICAgICAgICAgOiB7cjogMjU1LCBnOiAyMTUsIGI6IDB9LFxuICAgIGdvbGRlbnJvZCAgICAgICAgICAgIDoge3I6IDIxOCwgZzogMTY1LCBiOiAzMn0sXG4gICAgZ3JlZW55ZWxsb3cgICAgICAgICAgOiB7cjogMTczLCBnOiAyNTUsIGI6IDQ3fSxcbiAgICBncmV5ICAgICAgICAgICAgICAgICA6IHtyOiAxMjgsIGc6IDEyOCwgYjogMTI4fSxcbiAgICBob25leWRldyAgICAgICAgICAgICA6IHtyOiAyNDAsIGc6IDI1NSwgYjogMjQwfSxcbiAgICBob3RwaW5rICAgICAgICAgICAgICA6IHtyOiAyNTUsIGc6IDEwNSwgYjogMTgwfSxcbiAgICBpbmRpYW5yZWQgICAgICAgICAgICA6IHtyOiAyMDUsIGc6IDkyLCAgYjogOTJ9LFxuICAgIGluZGlnbyAgICAgICAgICAgICAgIDoge3I6IDc1LCAgZzogMCwgICBiOiAxMzB9LFxuICAgIGl2b3J5ICAgICAgICAgICAgICAgIDoge3I6IDI1NSwgZzogMjU1LCBiOiAyNDB9LFxuICAgIGtoYWtpICAgICAgICAgICAgICAgIDoge3I6IDI0MCwgZzogMjMwLCBiOiAxNDB9LFxuICAgIGxhdmVuZGVyICAgICAgICAgICAgIDoge3I6IDIzMCwgZzogMjMwLCBiOiAyNTB9LFxuICAgIGxhdmVuZGVyYmx1c2ggICAgICAgIDoge3I6IDI1NSwgZzogMjQwLCBiOiAyNDV9LFxuICAgIGxhd25ncmVlbiAgICAgICAgICAgIDoge3I6IDEyNCwgZzogMjUyLCBiOiAwfSxcbiAgICBsZW1vbmNoaWZmb24gICAgICAgICA6IHtyOiAyNTUsIGc6IDI1MCwgYjogMjA1fSxcbiAgICBsaWdodGJsdWUgICAgICAgICAgICA6IHtyOiAxNzMsIGc6IDIxNiwgYjogMjMwfSxcbiAgICBsaWdodGNvcmFsICAgICAgICAgICA6IHtyOiAyNDAsIGc6IDEyOCwgYjogMTI4fSxcbiAgICBsaWdodGN5YW4gICAgICAgICAgICA6IHtyOiAyMjQsIGc6IDI1NSwgYjogMjU1fSxcbiAgICBsaWdodGdvbGRlbnJvZHllbGxvdyA6IHtyOiAyNTAsIGc6IDI1MCwgYjogMjEwfSxcbiAgICBsaWdodGdyYXkgICAgICAgICAgICA6IHtyOiAyMTEsIGc6IDIxMSwgYjogMjExfSxcbiAgICBsaWdodGdyZWVuICAgICAgICAgICA6IHtyOiAxNDQsIGc6IDIzOCwgYjogMTQ0fSxcbiAgICBsaWdodGdyZXkgICAgICAgICAgICA6IHtyOiAyMTEsIGc6IDIxMSwgYjogMjExfSxcbiAgICBsaWdodHBpbmsgICAgICAgICAgICA6IHtyOiAyNTUsIGc6IDE4MiwgYjogMTkzfSxcbiAgICBsaWdodHNhbG1vbiAgICAgICAgICA6IHtyOiAyNTUsIGc6IDE2MCwgYjogMTIyfSxcbiAgICBsaWdodHNlYWdyZWVuICAgICAgICA6IHtyOiAzMiwgIGc6IDE3OCwgYjogMTcwfSxcbiAgICBsaWdodHNreWJsdWUgICAgICAgICA6IHtyOiAxMzUsIGc6IDIwNiwgYjogMjUwfSxcbiAgICBsaWdodHNsYXRlZ3JheSAgICAgICA6IHtyOiAxMTksIGc6IDEzNiwgYjogMTUzfSxcbiAgICBsaWdodHNsYXRlZ3JleSAgICAgICA6IHtyOiAxMTksIGc6IDEzNiwgYjogMTUzfSxcbiAgICBsaWdodHN0ZWVsYmx1ZSAgICAgICA6IHtyOiAxNzYsIGc6IDE5NiwgYjogMjIyfSxcbiAgICBsaWdodHllbGxvdyAgICAgICAgICA6IHtyOiAyNTUsIGc6IDI1NSwgYjogMjI0fSxcbiAgICBsaW1lZ3JlZW4gICAgICAgICAgICA6IHtyOiA1MCwgIGc6IDIwNSwgYjogNTB9LFxuICAgIGxpbmVuICAgICAgICAgICAgICAgIDoge3I6IDI1MCwgZzogMjQwLCBiOiAyMzB9LFxuICAgIG1hZ2VudGEgICAgICAgICAgICAgIDoge3I6IDI1NSwgZzogMCwgICBiOiAyNTV9LFxuICAgIG1lZGl1bWFxdWFtYXJpbmUgICAgIDoge3I6IDEwMiwgZzogMjA1LCBiOiAxNzB9LFxuICAgIG1lZGl1bWJsdWUgICAgICAgICAgIDoge3I6IDAsICAgZzogMCwgICBiOiAyMDV9LFxuICAgIG1lZGl1bW9yY2hpZCAgICAgICAgIDoge3I6IDE4NiwgZzogODUsICBiOiAyMTF9LFxuICAgIG1lZGl1bXB1cnBsZSAgICAgICAgIDoge3I6IDE0NywgZzogMTEyLCBiOiAyMTl9LFxuICAgIG1lZGl1bXNlYWdyZWVuICAgICAgIDoge3I6IDYwLCAgZzogMTc5LCBiOiAxMTN9LFxuICAgIG1lZGl1bXNsYXRlYmx1ZSAgICAgIDoge3I6IDEyMywgZzogMTA0LCBiOiAyMzh9LFxuICAgIG1lZGl1bXNwcmluZ2dyZWVuICAgIDoge3I6IDAsICAgZzogMjUwLCBiOiAxNTR9LFxuICAgIG1lZGl1bXR1cnF1b2lzZSAgICAgIDoge3I6IDcyLCAgZzogMjA5LCBiOiAyMDR9LFxuICAgIG1lZGl1bXZpb2xldHJlZCAgICAgIDoge3I6IDE5OSwgZzogMjEsICBiOiAxMzN9LFxuICAgIG1pZG5pZ2h0Ymx1ZSAgICAgICAgIDoge3I6IDI1LCAgZzogMjUsICBiOiAxMTJ9LFxuICAgIG1pbnRjcmVhbSAgICAgICAgICAgIDoge3I6IDI0NSwgZzogMjU1LCBiOiAyNTB9LFxuICAgIG1pc3R5cm9zZSAgICAgICAgICAgIDoge3I6IDI1NSwgZzogMjI4LCBiOiAyMjV9LFxuICAgIG1vY2Nhc2luICAgICAgICAgICAgIDoge3I6IDI1NSwgZzogMjI4LCBiOiAxODF9LFxuICAgIG5hdmFqb3doaXRlICAgICAgICAgIDoge3I6IDI1NSwgZzogMjIyLCBiOiAxNzN9LFxuICAgIG9sZGxhY2UgICAgICAgICAgICAgIDoge3I6IDI1MywgZzogMjQ1LCBiOiAyMzB9LFxuICAgIG9saXZlZHJhYiAgICAgICAgICAgIDoge3I6IDEwNywgZzogMTQyLCBiOiAzNX0sXG4gICAgb3JhbmdlICAgICAgICAgICAgICAgOiB7cjogMjU1LCBnOiAxNjUsIGI6IDB9LFxuICAgIG9yYW5nZXJlZCAgICAgICAgICAgIDoge3I6IDI1NSwgZzogNjksICBiOiAwfSxcbiAgICBvcmNoaWQgICAgICAgICAgICAgICA6IHtyOiAyMTgsIGc6IDExMiwgYjogMjE0fSxcbiAgICBwYWxlZ29sZGVucm9kICAgICAgICA6IHtyOiAyMzgsIGc6IDIzMiwgYjogMTcwfSxcbiAgICBwYWxlZ3JlZW4gICAgICAgICAgICA6IHtyOiAxNTIsIGc6IDI1MSwgYjogMTUyfSxcbiAgICBwYWxldHVycXVvaXNlICAgICAgICA6IHtyOiAxNzUsIGc6IDIzOCwgYjogMjM4fSxcbiAgICBwYWxldmlvbGV0cmVkICAgICAgICA6IHtyOiAyMTksIGc6IDExMiwgYjogMTQ3fSxcbiAgICBwYXBheWF3aGlwICAgICAgICAgICA6IHtyOiAyNTUsIGc6IDIzOSwgYjogMjEzfSxcbiAgICBwZWFjaHB1ZmYgICAgICAgICAgICA6IHtyOiAyNTUsIGc6IDIxOCwgYjogMTg1fSxcbiAgICBwZXJ1ICAgICAgICAgICAgICAgICA6IHtyOiAyMDUsIGc6IDEzMywgYjogNjN9LFxuICAgIHBpbmsgICAgICAgICAgICAgICAgIDoge3I6IDI1NSwgZzogMTkyLCBiOiAyMDN9LFxuICAgIHBsdW0gICAgICAgICAgICAgICAgIDoge3I6IDIyMSwgZzogMTYwLCBiOiAyMjF9LFxuICAgIHBvd2RlcmJsdWUgICAgICAgICAgIDoge3I6IDE3NiwgZzogMjI0LCBiOiAyMzB9LFxuICAgIHJvc3licm93biAgICAgICAgICAgIDoge3I6IDE4OCwgZzogMTQzLCBiOiAxNDN9LFxuICAgIHJveWFsYmx1ZSAgICAgICAgICAgIDoge3I6IDY1LCAgZzogMTA1LCBiOiAyMjV9LFxuICAgIHNhZGRsZWJyb3duICAgICAgICAgIDoge3I6IDEzOSwgZzogNjksICBiOiAxOX0sXG4gICAgc2FsbW9uICAgICAgICAgICAgICAgOiB7cjogMjUwLCBnOiAxMjgsIGI6IDExNH0sXG4gICAgc2FuZHlicm93biAgICAgICAgICAgOiB7cjogMjQ0LCBnOiAxNjQsIGI6IDk2fSxcbiAgICBzZWFncmVlbiAgICAgICAgICAgICA6IHtyOiA0NiwgIGc6IDEzOSwgYjogODd9LFxuICAgIHNlYXNoZWxsICAgICAgICAgICAgIDoge3I6IDI1NSwgZzogMjQ1LCBiOiAyMzh9LFxuICAgIHNpZW5uYSAgICAgICAgICAgICAgIDoge3I6IDE2MCwgZzogODIsICBiOiA0NX0sXG4gICAgc2t5Ymx1ZSAgICAgICAgICAgICAgOiB7cjogMTM1LCBnOiAyMDYsIGI6IDIzNX0sXG4gICAgc2xhdGVibHVlICAgICAgICAgICAgOiB7cjogMTA2LCBnOiA5MCwgIGI6IDIwNX0sXG4gICAgc2xhdGVncmF5ICAgICAgICAgICAgOiB7cjogMTEyLCBnOiAxMjgsIGI6IDE0NH0sXG4gICAgc2xhdGVncmV5ICAgICAgICAgICAgOiB7cjogMTEyLCBnOiAxMjgsIGI6IDE0NH0sXG4gICAgc25vdyAgICAgICAgICAgICAgICAgOiB7cjogMjU1LCBnOiAyNTAsIGI6IDI1MH0sXG4gICAgc3ByaW5nZ3JlZW4gICAgICAgICAgOiB7cjogMCwgICBnOiAyNTUsIGI6IDEyN30sXG4gICAgc3RlZWxibHVlICAgICAgICAgICAgOiB7cjogNzAsICBnOiAxMzAsIGI6IDE4MH0sXG4gICAgdGFuICAgICAgICAgICAgICAgICAgOiB7cjogMjEwLCBnOiAxODAsIGI6IDE0MH0sXG4gICAgdGhpc3RsZSAgICAgICAgICAgICAgOiB7cjogMjE2LCBnOiAxOTEsIGI6IDIxNn0sXG4gICAgdG9tYXRvICAgICAgICAgICAgICAgOiB7cjogMjU1LCBnOiA5OSwgIGI6IDcxfSxcbiAgICB0dXJxdW9pc2UgICAgICAgICAgICA6IHtyOiA2NCwgIGc6IDIyNCwgYjogMjA4fSxcbiAgICB2aW9sZXQgICAgICAgICAgICAgICA6IHtyOiAyMzgsIGc6IDEzMCwgYjogMjM4fSxcbiAgICB3aGVhdCAgICAgICAgICAgICAgICA6IHtyOiAyNDUsIGc6IDIyMiwgYjogMTc5fSxcbiAgICB3aGl0ZXNtb2tlICAgICAgICAgICA6IHtyOiAyNDUsIGc6IDI0NSwgYjogMjQ1fSxcbiAgICB5ZWxsb3dncmVlbiAgICAgICAgICA6IHtyOiAxNTQsIGc6IDIwNSwgYjogNTB9XG59XG4iLCJ2YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBwYXJzZXJzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGV4YW1wbGU6IFszNTU0NDMxLCAxNjgwOTk4NF0sXG4gICAgICAgICAgICByZWdleDogL15cXGQrJC8sXG4gICAgICAgICAgICBwcm9jZXNzOiBmdW5jdGlvbiAoY29sb3Ipe1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIC8vYTogY29sb3IgPj4gMjQgJiAyNTUsXG4gICAgICAgICAgICAgICAgICAgIHI6IGNvbG9yID4+IDE2ICYgMjU1LFxuICAgICAgICAgICAgICAgICAgICBnOiBjb2xvciA+PiA4ICYgMjU1LFxuICAgICAgICAgICAgICAgICAgICBiOiBjb2xvciAmIDI1NVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAge1xuICAgICAgICAgICAgZXhhbXBsZTogWycjZmIwJywgJ2YwZiddLFxuICAgICAgICAgICAgcmVnZXg6IC9eIz8oW1xcZEEtRl17MX0pKFtcXGRBLUZdezF9KShbXFxkQS1GXXsxfSkkL2ksXG4gICAgICAgICAgICBwcm9jZXNzOiBmdW5jdGlvbiAoaGV4LCByLCBnLCBiKXtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICByOiBwYXJzZUludChyICsgciwgMTYpLFxuICAgICAgICAgICAgICAgICAgICBnOiBwYXJzZUludChnICsgZywgMTYpLFxuICAgICAgICAgICAgICAgICAgICBiOiBwYXJzZUludChiICsgYiwgMTYpXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB7XG4gICAgICAgICAgICBleGFtcGxlOiBbJyMwMGZmMDAnLCAnMzM2Njk5J10sXG4gICAgICAgICAgICByZWdleDogL14jPyhbXFxkQS1GXXsyfSkoW1xcZEEtRl17Mn0pKFtcXGRBLUZdezJ9KSQvaSxcbiAgICAgICAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uIChoZXgsIHIsIGcsIGIpe1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHI6IHBhcnNlSW50KHIsIDE2KSxcbiAgICAgICAgICAgICAgICAgICAgZzogcGFyc2VJbnQoZywgMTYpLFxuICAgICAgICAgICAgICAgICAgICBiOiBwYXJzZUludChiLCAxNilcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHtcbiAgICAgICAgICAgIGV4YW1wbGU6IFsncmdiKDEyMywgMjM0LCA0NSknLCAncmdiKDI1LCA1MCUsIDEwMCUpJywgJ3JnYmEoMTIlLCAzNCwgNTYlLCAwLjc4KSddLFxuICAgICAgICAgICAgLy8gcmVnZXg6IC9ecmdiYSpcXCgoXFxkezEsM31cXCUqKSxcXHMqKFxcZHsxLDN9XFwlKiksXFxzKihcXGR7MSwzfVxcJSopKD86LFxccyooWzAtOS5dKykpP1xcKS8sXG4gICAgICAgICAgICByZWdleDogL15yZ2JhKlxcKChbMC05XSpcXC4/WzAtOV0rXFwlKiksXFxzKihbMC05XSpcXC4/WzAtOV0rXFwlKiksXFxzKihbMC05XSpcXC4/WzAtOV0rXFwlKikoPzosXFxzKihbMC05Ll0rKSk/XFwpLyxcbiAgICAgICAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uIChzLHIsZyxiLGEpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgciA9IHIgJiYgci5zbGljZSgtMSkgPT0gJyUnID8gKHIuc2xpY2UoMCwtMSkgLyAxMDApIDogcioxO1xuICAgICAgICAgICAgICAgIGcgPSBnICYmIGcuc2xpY2UoLTEpID09ICclJyA/IChnLnNsaWNlKDAsLTEpIC8gMTAwKSA6IGcqMTtcbiAgICAgICAgICAgICAgICBiID0gYiAmJiBiLnNsaWNlKC0xKSA9PSAnJScgPyAoYi5zbGljZSgwLC0xKSAvIDEwMCkgOiBiKjE7XG4gICAgICAgICAgICAgICAgYSA9IGEqMTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHI6IHV0aWwuY2xhbXAociwgMCwgMjU1KSxcbiAgICAgICAgICAgICAgICAgICAgZzogdXRpbC5jbGFtcChnLCAwLCAyNTUpLFxuICAgICAgICAgICAgICAgICAgICBiOiB1dGlsLmNsYW1wKGIsIDAsIDI1NSksXG4gICAgICAgICAgICAgICAgICAgIGE6IHV0aWwuY2xhbXAoYSwgMCwgMSkgfHwgdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB7XG4gICAgICAgICAgICBleGFtcGxlOiBbJ2hzbCgxMjMsIDM0JSwgNDUlKScsICdoc2xhKDI1LCA1MCUsIDEwMCUsIDAuNzUpJywgJ2hzdigxMiwgMzQlLCA1NiUpJ10sXG4gICAgICAgICAgICByZWdleDogL15ocyhbYnZsXSlhKlxcKChcXGR7MSwzfVxcJSopLFxccyooXFxkezEsM31cXCUqKSxcXHMqKFxcZHsxLDN9XFwlKikoPzosXFxzKihbMC05Ll0rKSk/XFwpLyxcbiAgICAgICAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uIChjLGx2LGgscyxsLGEpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaCAqPSAxO1xuICAgICAgICAgICAgICAgIHMgPSBzLnNsaWNlKDAsLTEpIC8gMTAwO1xuICAgICAgICAgICAgICAgIGwgPSBsLnNsaWNlKDAsLTEpIC8gMTAwO1xuICAgICAgICAgICAgICAgIGEgKj0gMTtcblxuICAgICAgICAgICAgICAgIHZhciBvYmogPSB7XG4gICAgICAgICAgICAgICAgICAgIGg6IHV0aWwuY2xhbXAoaCwgMCwgMzYwKSxcbiAgICAgICAgICAgICAgICAgICAgYTogdXRpbC5jbGFtcChsLCAwLCAxKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgLy8gYHNgIGlzIHVzZWQgaW4gbWFueSBkaWZmZXJlbnQgc3BhY2VzIChIU0wsIEhTViwgSFNCKVxuICAgICAgICAgICAgICAgIC8vIHNvIHdlIHVzZSBgc2xgLCBgc3ZgIGFuZCBgc2JgIHRvIGRpZmZlcmVudGlhdGVcbiAgICAgICAgICAgICAgICBvYmpbJ3MnK2x2XSA9IHV0aWwuY2xhbXAocywgMCwgMSksXG4gICAgICAgICAgICAgICAgb2JqW2x2XSA9IHV0aWwuY2xhbXAobCwgMCwgMSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgXVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gQ2hyb21hdGhQcm90b3R5cGUoQ2hyb21hdGgpIHtcbiAgcmV0dXJuIHtcbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvTmFtZVxuICAgICAgICAgQ2FsbCA8Q2hyb21hdGgudG9OYW1lPiBvbiB0aGUgY3VycmVudCBpbnN0YW5jZVxuICAgICAgICAgPiA+IHZhciBjb2xvciA9IG5ldyBDaHJvbWF0aCgncmdiKDE3MywgMjE2LCAyMzApJyk7XG4gICAgICAgICA+ID4gY29sb3IudG9OYW1lKCk7XG4gICAgICAgICA+IFwibGlnaHRibHVlXCJcbiAgICAgICovXG4gICAgICB0b05hbWU6IGZ1bmN0aW9uICgpeyByZXR1cm4gQ2hyb21hdGgudG9OYW1lKHRoaXMpOyB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b1N0cmluZ1xuICAgICAgICAgRGlzcGxheSB0aGUgaW5zdGFuY2UgYXMgYSBzdHJpbmcuIERlZmF1bHRzIHRvIDxDaHJvbWF0aC50b0hleFN0cmluZz5cbiAgICAgICAgID4gPiB2YXIgY29sb3IgPSBDaHJvbWF0aC5yZ2IoNTYsIDc4LCA5MCk7XG4gICAgICAgICA+ID4gQ29sb3IudG9IZXhTdHJpbmcoKTtcbiAgICAgICAgID4gXCIjMzg0RTVBXCJcbiAgICAgICovXG4gICAgICB0b1N0cmluZzogZnVuY3Rpb24gKCl7IHJldHVybiB0aGlzLnRvSGV4U3RyaW5nKCk7IH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHZhbHVlT2ZcbiAgICAgICAgIERpc3BsYXkgdGhlIGluc3RhbmNlIGFzIGFuIGludGVnZXIuIERlZmF1bHRzIHRvIDxDaHJvbWF0aC50b0ludGVnZXI+XG4gICAgICAgICA+ID4gdmFyIHllbGxvdyA9IG5ldyBDaHJvbWF0aCgneWVsbG93Jyk7XG4gICAgICAgICA+ID4geWVsbG93LnZhbHVlT2YoKTtcbiAgICAgICAgID4gMTY3NzY5NjBcbiAgICAgICAgID4gPiAreWVsbG93XG4gICAgICAgICA+IDE2Nzc2OTYwXG4gICAgICAqL1xuICAgICAgdmFsdWVPZjogZnVuY3Rpb24gKCl7IHJldHVybiBDaHJvbWF0aC50b0ludGVnZXIodGhpcyk7IH0sXG5cbiAgICAvKlxuICAgICAgIE1ldGhvZDogcmdiXG4gICAgICAgUmV0dXJuIHRoZSBSR0IgYXJyYXkgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgPiA+IG5ldyBDaHJvbWF0aCgncmVkJykucmdiKCk7XG4gICAgICAgPiBbMjU1LCAwLCAwXVxuICAgICovXG4gICAgICByZ2I6IGZ1bmN0aW9uICgpeyByZXR1cm4gdGhpcy50b1JHQkFycmF5KCk7IH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvUkdCQXJyYXlcbiAgICAgICAgIFJldHVybiB0aGUgUkdCIGFycmF5IG9mIHRoZSBpbnN0YW5jZVxuICAgICAgICAgPiA+IENocm9tYXRoLmJ1cmx5d29vZC50b1JHQkFycmF5KCk7XG4gICAgICAgICA+IFsyNTUsIDE4NCwgMTM1XVxuICAgICAgKi9cbiAgICAgIHRvUkdCQXJyYXk6IGZ1bmN0aW9uICgpeyByZXR1cm4gdGhpcy50b1JHQkFBcnJheSgpLnNsaWNlKDAsMyk7IH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvUkdCT2JqZWN0XG4gICAgICAgICBSZXR1cm4gdGhlIFJHQiBvYmplY3Qgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgICA+ID4gbmV3IENocm9tYXRoKCdidXJseXdvb2QnKS50b1JHQk9iamVjdCgpO1xuICAgICAgICAgPiB7cjogMjU1LCBnOiAxODQsIGI6IDEzNX1cbiAgICAgICovXG4gICAgICB0b1JHQk9iamVjdDogZnVuY3Rpb24gKClcbiAgICAgIHtcbiAgICAgICAgICB2YXIgcmdiID0gdGhpcy50b1JHQkFycmF5KCk7XG5cbiAgICAgICAgICByZXR1cm4ge3I6IHJnYlswXSwgZzogcmdiWzFdLCBiOiByZ2JbMl19O1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG9SR0JTdHJpbmdcbiAgICAgICAgIFJldHVybiB0aGUgUkdCIHN0cmluZyBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJ2FsaWNlYmx1ZScpLnRvUkdCU3RyaW5nKCk7XG4gICAgICAgICA+IFwicmdiKDI0MCwyNDgsMjU1KVwiXG4gICAgICAqL1xuICAgICAgdG9SR0JTdHJpbmc6IGZ1bmN0aW9uICgpXG4gICAgICB7XG4gICAgICAgICAgcmV0dXJuIFwicmdiKFwiKyB0aGlzLnRvUkdCQXJyYXkoKS5qb2luKFwiLFwiKSArXCIpXCI7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiByZ2JhXG4gICAgICAgICBSZXR1cm4gdGhlIFJHQkEgYXJyYXkgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgICA+ID4gbmV3IENocm9tYXRoKCdyZWQnKS5yZ2JhKCk7XG4gICAgICAgICA+IFsyNTUsIDAsIDAsIDFdXG4gICAgICAqL1xuICAgICAgcmdiYTogZnVuY3Rpb24gKCl7IHJldHVybiB0aGlzLnRvUkdCQUFycmF5KCk7IH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvUkdCQUFycmF5XG4gICAgICAgICBSZXR1cm4gdGhlIFJHQkEgYXJyYXkgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgICA+ID4gQ2hyb21hdGgubGltZS50b1JHQkFBcnJheSgpO1xuICAgICAgICAgPiBbMCwgMjU1LCAwLCAxXVxuICAgICAgKi9cbiAgICAgIHRvUkdCQUFycmF5OiBmdW5jdGlvbiAoKVxuICAgICAge1xuICAgICAgICAgIHZhciByZ2JhID0gW1xuICAgICAgICAgICAgICBNYXRoLnJvdW5kKHRoaXMucioyNTUpLFxuICAgICAgICAgICAgICBNYXRoLnJvdW5kKHRoaXMuZyoyNTUpLFxuICAgICAgICAgICAgICBNYXRoLnJvdW5kKHRoaXMuYioyNTUpLFxuICAgICAgICAgICAgICBwYXJzZUZsb2F0KHRoaXMuYSlcbiAgICAgICAgICBdO1xuXG4gICAgICAgICAgcmV0dXJuIHJnYmE7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b1JHQkFPYmplY3RcbiAgICAgICAgIFJldHVybiB0aGUgUkdCQSBvYmplY3Qgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgICA+ID4gQ2hyb21hdGguY2FkZXRibHVlLnRvUkdCQU9iamVjdCgpO1xuICAgICAgICAgPiB7cjogOTUsIGc6IDE1OCwgYjogMTYwfVxuICAgICAgKi9cbiAgICAgIHRvUkdCQU9iamVjdDogZnVuY3Rpb24gKClcbiAgICAgIHtcbiAgICAgICAgICB2YXIgcmdiYSA9IHRoaXMudG9SR0JBQXJyYXkoKTtcblxuICAgICAgICAgIHJldHVybiB7cjogcmdiYVswXSwgZzogcmdiYVsxXSwgYjogcmdiYVsyXSwgYTogcmdiYVszXX07XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b1JHQkFTdHJpbmdcbiAgICAgICAgIFJldHVybiB0aGUgUkdCQSBzdHJpbmcgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgICA+ID4gbmV3IENocm9tYXRoKCdkYXJrYmx1ZScpLnRvUkdCQVN0cmluZygpO1xuICAgICAgICAgPiBcInJnYmEoMCwwLDEzOSwxKVwiXG4gICAgICAqL1xuICAgICAgdG9SR0JBU3RyaW5nOiBmdW5jdGlvbiAoKXtcbiAgICAgICAgICByZXR1cm4gXCJyZ2JhKFwiKyB0aGlzLnRvUkdCQUFycmF5KCkuam9pbihcIixcIikgK1wiKVwiO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogaGV4XG4gICAgICAgICBSZXR1cm4gdGhlIGhleCBhcnJheSBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgID4gbmV3IENocm9tYXRoKCdkYXJrZ3JlZW4nKS5oZXgoKVxuICAgICAgICAgWyAnMDAnLCAnNjQnLCAnMDAnIF1cbiAgICAgICovXG4gICAgICBoZXg6IGZ1bmN0aW9uICgpeyByZXR1cm4gdGhpcy50b0hleEFycmF5KCk7IH0sXG5cbiAgICAgIC8qXG4gICAgICAgIE1ldGhvZDogdG9IZXhBcnJheVxuICAgICAgICAgUmV0dXJuIHRoZSBoZXggYXJyYXkgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgID4gPiBDaHJvbWF0aC5maXJlYnJpY2sudG9IZXhBcnJheSgpO1xuICAgICAgICA+IFtcIkIyXCIsIFwiMjJcIiwgXCIyMlwiXVxuICAgICAgKi9cbiAgICAgIHRvSGV4QXJyYXk6IGZ1bmN0aW9uICgpe1xuICAgICAgICAgIHJldHVybiBDaHJvbWF0aC5yZ2IyaGV4KHRoaXMuciwgdGhpcy5nLCB0aGlzLmIpO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG9IZXhPYmplY3RcbiAgICAgICAgIFJldHVybiB0aGUgaGV4IG9iamVjdCBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgID4gPiBDaHJvbWF0aC5nYWluc2Jvcm8udG9IZXhPYmplY3QoKTtcbiAgICAgICAgID4ge3I6IFwiRENcIiwgZzogXCJEQ1wiLCBiOiBcIkRDXCJ9XG4gICAgICAqL1xuICAgICAgdG9IZXhPYmplY3Q6IGZ1bmN0aW9uICgpXG4gICAgICB7XG4gICAgICAgICAgdmFyIGhleCA9IHRoaXMudG9IZXhBcnJheSgpO1xuXG4gICAgICAgICAgcmV0dXJuIHsgcjogaGV4WzBdLCBnOiBoZXhbMV0sIGI6IGhleFsyXSB9O1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgTWV0aG9kOiB0b0hleFN0cmluZ1xuICAgICAgICAgUmV0dXJuIHRoZSBoZXggc3RyaW5nIG9mIHRoZSBpbnN0YW5jZVxuICAgICAgICA+ID4gQ2hyb21hdGguaG9uZXlkZXcudG9IZXhTdHJpbmcoKTtcbiAgICAgICAgPiBcIiNGMEZGRjBcIlxuICAgICAgKi9cbiAgICAgIHRvSGV4U3RyaW5nOiBmdW5jdGlvbiAoKXtcbiAgICAgICAgICB2YXIgaGV4ID0gdGhpcy50b0hleEFycmF5KCk7XG5cbiAgICAgICAgICByZXR1cm4gJyMnICsgaGV4LmpvaW4oJycpO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogaHNsXG4gICAgICAgICBSZXR1cm4gdGhlIEhTTCBhcnJheSBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgID4gPm5ldyBDaHJvbWF0aCgnZ3JlZW4nKS5oc2woKTtcbiAgICAgICAgID4gWzEyMCwgMSwgMC4yNTA5ODAzOTIxNTY4NjI3NF1cbiAgICAgICovXG4gICAgICBoc2w6IGZ1bmN0aW9uICgpeyByZXR1cm4gdGhpcy50b0hTTEFycmF5KCk7IH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvSFNMQXJyYXlcbiAgICAgICAgIFJldHVybiB0aGUgSFNMIGFycmF5IG9mIHRoZSBpbnN0YW5jZVxuICAgICAgICAgPiA+IG5ldyBDaHJvbWF0aCgncmVkJykudG9IU0xBcnJheSgpO1xuICAgICAgICAgPiBbMCwgMSwgMC41XVxuICAgICAgKi9cbiAgICAgIHRvSFNMQXJyYXk6IGZ1bmN0aW9uICgpe1xuICAgICAgICAgIHJldHVybiB0aGlzLnRvSFNMQUFycmF5KCkuc2xpY2UoMCwzKTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvSFNMT2JqZWN0XG4gICAgICAgICBSZXR1cm4gdGhlIEhTTCBvYmplY3Qgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgICA+ID4gbmV3IENocm9tYXRoKCdyZWQnKS50b0hTTE9iamVjdCgpO1xuICAgICAgICAgW2g6MCwgczoxLCBsOjAuNV1cbiAgICAgICovXG4gICAgICB0b0hTTE9iamVjdDogZnVuY3Rpb24gKClcbiAgICAgIHtcbiAgICAgICAgICB2YXIgaHNsID0gdGhpcy50b0hTTEFycmF5KCk7XG5cbiAgICAgICAgICByZXR1cm4ge2g6IGhzbFswXSwgczogaHNsWzFdLCBsOiBoc2xbMl19O1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG9IU0xTdHJpbmdcbiAgICAgICAgIFJldHVybiB0aGUgSFNMIHN0cmluZyBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJ3JlZCcpLnRvSFNMU3RyaW5nKCk7XG4gICAgICAgICA+IFwiaHNsKDAsMSwwLjUpXCJcbiAgICAgICovXG4gICAgICB0b0hTTFN0cmluZzogZnVuY3Rpb24gKCl7XG4gICAgICAgICAgdmFyIGhzbGEgPSB0aGlzLnRvSFNMQUFycmF5KCk7XG4gICAgICAgICAgdmFyIHZhbHMgPSBbXG4gICAgICAgICAgICAgIGhzbGFbMF0sXG4gICAgICAgICAgICAgIE1hdGgucm91bmQoaHNsYVsxXSoxMDApKyclJyxcbiAgICAgICAgICAgICAgTWF0aC5yb3VuZChoc2xhWzJdKjEwMCkrJyUnXG4gICAgICAgICAgXTtcblxuICAgICAgICAgIHJldHVybiAnaHNsKCcrIHZhbHMgKycpJztcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgIE1ldGhvZDogaHNsYVxuICAgICAgICBSZXR1cm4gdGhlIEhTTEEgYXJyYXkgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJ2dyZWVuJykuaHNsYSgpO1xuICAgICAgICA+IFsxMjAsIDEsIDAuMjUwOTgwMzkyMTU2ODYyNzQsIDFdXG4gICAgICAqL1xuICAgICAgaHNsYTogZnVuY3Rpb24gKCl7IHJldHVybiB0aGlzLnRvSFNMQUFycmF5KCk7IH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvSFNMQXJyYXlcbiAgICAgICAgIFJldHVybiB0aGUgSFNMQSBhcnJheSBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgID4gPiBDaHJvbWF0aC5hbnRpcXVld2hpdGUudG9IU0xBQXJyYXkoKTtcbiAgICAgICAgID4gWzM0LCAwLjc3Nzc3Nzc3Nzc3Nzc3NzMsIDAuOTExNzY0NzA1ODgyMzUyOSwgMV1cbiAgICAgICovXG4gICAgICB0b0hTTEFBcnJheTogZnVuY3Rpb24gKClcbiAgICAgIHtcbiAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICBNYXRoLnJvdW5kKHRoaXMuaCksXG4gICAgICAgICAgICAgIHBhcnNlRmxvYXQodGhpcy5zbCksXG4gICAgICAgICAgICAgIHBhcnNlRmxvYXQodGhpcy5sKSxcbiAgICAgICAgICAgICAgcGFyc2VGbG9hdCh0aGlzLmEpXG4gICAgICAgICAgXTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvSFNMQU9iamVjdFxuICAgICAgICAgUmV0dXJuIHRoZSBIU0xBIG9iamVjdCBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgID4gPiBDaHJvbWF0aC5hbnRpcXVld2hpdGUudG9IU0xBQXJyYXkoKTtcbiAgICAgICAgID4ge2g6MzQsIHM6MC43Nzc3Nzc3Nzc3Nzc3NzczLCBsOjAuOTExNzY0NzA1ODgyMzUyOSwgYToxfVxuICAgICAgKi9cbiAgICAgIHRvSFNMQU9iamVjdDogZnVuY3Rpb24gKClcbiAgICAgIHtcbiAgICAgICAgICB2YXIgaHNsYSA9IHRoaXMudG9IU0xBQXJyYXkoKTtcblxuICAgICAgICAgIHJldHVybiB7aDogaHNsYVswXSwgczogaHNsYVsxXSwgbDogaHNsYVsyXSwgYTogaHNsYVszXX07XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b0hTTEFTdHJpbmdcbiAgICAgICAgIFJldHVybiB0aGUgSFNMQSBzdHJpbmcgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgICA+ID4gQ2hyb21hdGguYW50aXF1ZXdoaXRlLnRvSFNMQVN0cmluZygpO1xuICAgICAgICAgPiBcImhzbGEoMzQsMC43Nzc3Nzc3Nzc3Nzc3NzczLDAuOTExNzY0NzA1ODgyMzUyOSwxKVwiXG4gICAgICAqL1xuICAgICAgdG9IU0xBU3RyaW5nOiBmdW5jdGlvbiAoKXtcbiAgICAgICAgICB2YXIgaHNsYSA9IHRoaXMudG9IU0xBQXJyYXkoKTtcbiAgICAgICAgICB2YXIgdmFscyA9IFtcbiAgICAgICAgICAgICAgaHNsYVswXSxcbiAgICAgICAgICAgICAgTWF0aC5yb3VuZChoc2xhWzFdKjEwMCkrJyUnLFxuICAgICAgICAgICAgICBNYXRoLnJvdW5kKGhzbGFbMl0qMTAwKSsnJScsXG4gICAgICAgICAgICAgIE1hdGgucm91bmQoaHNsYVszXSlcbiAgICAgICAgICBdO1xuXG4gICAgICAgICAgcmV0dXJuICdoc2xhKCcrIHZhbHMgKycpJztcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IGhzdlxuICAgICAgICAgUmV0dXJuIHRoZSBIU1YgYXJyYXkgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgICA+ID4gbmV3IENocm9tYXRoKCdibHVlJykuaHN2KCk7XG4gICAgICAgICA+IFsyNDAsIDEsIDFdXG4gICAgICAqL1xuICAgICAgaHN2OiBmdW5jdGlvbiAoKXsgcmV0dXJuIHRoaXMudG9IU1ZBcnJheSgpOyB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b0hTVkFycmF5XG4gICAgICAgICBSZXR1cm4gdGhlIEhTViBhcnJheSBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJ25hdmFqb3doaXRlJykudG9IU1ZBcnJheSgpO1xuICAgICAgICAgPiBbMzYsIDAuMzIxNTY4NjI3NDUwOTgwMzYsIDFdXG4gICAgICAqL1xuICAgICAgdG9IU1ZBcnJheTogZnVuY3Rpb24gKClcbiAgICAgIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy50b0hTVkFBcnJheSgpLnNsaWNlKDAsMyk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b0hTVk9iamVjdFxuICAgICAgICAgUmV0dXJuIHRoZSBIU1Ygb2JqZWN0IG9mIHRoZSBpbnN0YW5jZVxuICAgICAgICAgPiA+IG5ldyBDaHJvbWF0aCgnbmF2YWpvd2hpdGUnKS50b0hTVk9iamVjdCgpO1xuICAgICAgICAgPiB7aDM2LCBzOjAuMzIxNTY4NjI3NDUwOTgwMzYsIHY6MX1cbiAgICAgICovXG4gICAgICB0b0hTVk9iamVjdDogZnVuY3Rpb24gKClcbiAgICAgIHtcbiAgICAgICAgICB2YXIgaHN2YSA9IHRoaXMudG9IU1ZBQXJyYXkoKTtcblxuICAgICAgICAgIHJldHVybiB7aDogaHN2YVswXSwgczogaHN2YVsxXSwgdjogaHN2YVsyXX07XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b0hTVlN0cmluZ1xuICAgICAgICAgUmV0dXJuIHRoZSBIU1Ygc3RyaW5nIG9mIHRoZSBpbnN0YW5jZVxuICAgICAgICAgPiA+IG5ldyBDaHJvbWF0aCgnbmF2YWpvd2hpdGUnKS50b0hTVlN0cmluZygpO1xuICAgICAgICAgPiBcImhzdigzNiwzMi4xNTY4NjI3NDUwOTgwNCUsMTAwJSlcIlxuICAgICAgKi9cbiAgICAgIHRvSFNWU3RyaW5nOiBmdW5jdGlvbiAoKVxuICAgICAge1xuICAgICAgICAgIHZhciBoc3YgPSB0aGlzLnRvSFNWQXJyYXkoKTtcbiAgICAgICAgICB2YXIgdmFscyA9IFtcbiAgICAgICAgICAgICAgaHN2WzBdLFxuICAgICAgICAgICAgICBNYXRoLnJvdW5kKGhzdlsxXSoxMDApKyclJyxcbiAgICAgICAgICAgICAgTWF0aC5yb3VuZChoc3ZbMl0qMTAwKSsnJSdcbiAgICAgICAgICBdO1xuXG4gICAgICAgICAgcmV0dXJuICdoc3YoJysgdmFscyArJyknO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogaHN2YVxuICAgICAgICAgUmV0dXJuIHRoZSBIU1ZBIGFycmF5IG9mIHRoZSBpbnN0YW5jZVxuICAgICAgICAgPiA+IG5ldyBDaHJvbWF0aCgnYmx1ZScpLmhzdmEoKTtcbiAgICAgICAgID4gWzI0MCwgMSwgMSwgMV1cbiAgICAgICovXG4gICAgICBoc3ZhOiBmdW5jdGlvbiAoKXsgcmV0dXJuIHRoaXMudG9IU1ZBQXJyYXkoKTsgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG9IU1ZBQXJyYXlcbiAgICAgICAgIFJldHVybiB0aGUgSFNWQSBhcnJheSBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJ29saXZlJykudG9IU1ZBQXJyYXkoKTtcbiAgICAgICAgID4gWzYwLCAxLCAwLjUwMTk2MDc4NDMxMzcyNTUsIDFdXG4gICAgICAqL1xuICAgICAgdG9IU1ZBQXJyYXk6IGZ1bmN0aW9uICgpe1xuICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgIE1hdGgucm91bmQodGhpcy5oKSxcbiAgICAgICAgICAgICAgcGFyc2VGbG9hdCh0aGlzLnN2KSxcbiAgICAgICAgICAgICAgcGFyc2VGbG9hdCh0aGlzLnYpLFxuICAgICAgICAgICAgICBwYXJzZUZsb2F0KHRoaXMuYSlcbiAgICAgICAgICBdO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG9IU1ZBT2JqZWN0XG4gICAgICAgICBSZXR1cm4gdGhlIEhTVkEgb2JqZWN0IG9mIHRoZSBpbnN0YW5jZVxuICAgICAgICAgPiA+IG5ldyBDaHJvbWF0aCgnb2xpdmUnKS50b0hTVkFBcnJheSgpO1xuICAgICAgICAgPiB7aDo2MCwgczogMSwgdjowLjUwMTk2MDc4NDMxMzcyNTUsIGE6MX1cbiAgICAgICovXG4gICAgICB0b0hTVkFPYmplY3Q6IGZ1bmN0aW9uICgpe1xuICAgICAgICAgIHZhciBoc3ZhID0gdGhpcy50b0hTVkFBcnJheSgpO1xuXG4gICAgICAgICAgcmV0dXJuIHtoOiBoc3ZhWzBdLCBzOiBoc3ZhWzFdLCBsOiBoc3ZhWzJdLCBhOiBoc3ZhWzNdfTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvSFNWQVN0cmluZ1xuICAgICAgICAgUmV0dXJuIHRoZSBIU1ZBIHN0cmluZyBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJ29saXZlJykudG9IU1ZBU3RyaW5nKCk7XG4gICAgICAgICA+IFwiaHN2YSg2MCwxMDAlLDUwLjE5NjA3ODQzMTM3MjU1JSwxKVwiXG4gICAgICAqL1xuICAgICAgdG9IU1ZBU3RyaW5nOiBmdW5jdGlvbiAoKVxuICAgICAge1xuICAgICAgICAgIHZhciBoc3ZhID0gdGhpcy50b0hTVkFBcnJheSgpO1xuICAgICAgICAgIHZhciB2YWxzID0gW1xuICAgICAgICAgICAgICBoc3ZhWzBdLFxuICAgICAgICAgICAgICBNYXRoLnJvdW5kKGhzdmFbMV0qMTAwKSsnJScsXG4gICAgICAgICAgICAgIE1hdGgucm91bmQoaHN2YVsyXSoxMDApKyclJyxcbiAgICAgICAgICAgICAgaHN2YVszXVxuICAgICAgICAgIF07XG5cbiAgICAgICAgICByZXR1cm4gJ2hzdmEoJysgdmFscyArJyknO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogaHNiXG4gICAgICAgICBBbGlhcyBmb3IgPGhzdj5cbiAgICAgICovXG4gICAgICBoc2I6IGZ1bmN0aW9uICgpeyByZXR1cm4gdGhpcy5oc3YoKTsgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG9IU0JBcnJheVxuICAgICAgICAgQWxpYXMgZm9yIDx0b0hTQkFycmF5PlxuICAgICAgKi9cbiAgICAgIHRvSFNCQXJyYXk6IGZ1bmN0aW9uICgpXG4gICAgICB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMudG9IU1ZBcnJheSgpO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG9IU0JPYmplY3RcbiAgICAgICAgIEFsaWFzIGZvciA8dG9IU1ZPYmplY3Q+XG4gICAgICAqL1xuICAgICAgdG9IU0JPYmplY3Q6IGZ1bmN0aW9uICgpXG4gICAgICB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMudG9IU1ZPYmplY3QoKTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvSFNCU3RyaW5nXG4gICAgICAgICBBbGlhcyBmb3IgPHRvSFNWU3RyaW5nPlxuICAgICAgKi9cbiAgICAgIHRvSFNCU3RyaW5nOiBmdW5jdGlvbiAoKVxuICAgICAge1xuICAgICAgICAgIHJldHVybiB0aGlzLnRvSFNWU3RyaW5nKCk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiBoc2JhXG4gICAgICAgICBBbGlhcyBmb3IgPGhzdmE+XG4gICAgICAqL1xuICAgICAgaHNiYTogZnVuY3Rpb24gKCl7IHJldHVybiB0aGlzLmhzdmEoKTsgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG9IU0JBQXJyYXlcbiAgICAgICAgIEFsaWFzIGZvciA8dG9IU1ZBQXJyYXk+XG4gICAgICAqL1xuICAgICAgdG9IU0JBQXJyYXk6IGZ1bmN0aW9uICgpe1xuICAgICAgICAgIHJldHVybiB0aGlzLnRvSFNWQUFycmF5KCk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b0hTQkFPYmplY3RcbiAgICAgICAgIEFsaWFzIGZvciA8dG9IU1ZBT2JqZWN0PlxuICAgICAgKi9cbiAgICAgIHRvSFNCQU9iamVjdDogZnVuY3Rpb24gKCl7XG4gICAgICAgICAgcmV0dXJuIHRoaXMudG9IU1ZBT2JqZWN0KCk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b0hTQkFTdHJpbmdcbiAgICAgICAgIEFsaWFzIGZvciA8dG9IU1ZBU3RyaW5nPlxuICAgICAgKi9cbiAgICAgIHRvSFNCQVN0cmluZzogZnVuY3Rpb24gKClcbiAgICAgIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy50b0hTVkFTdHJpbmcoKTtcbiAgICAgIH0sXG5cbiAgICAgIC8vR3JvdXA6IEluc3RhbmNlIG1ldGhvZHMgLSBjb2xvciBzY2hlbWVcbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IGNvbXBsZW1lbnRcbiAgICAgICAgIENhbGxzIDxDaHJvbWF0aC5jb21wbGVtZW50PiB3aXRoIHRoZSBjdXJyZW50IGluc3RhbmNlIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXJcblxuICAgICAgICAgPiA+IENocm9tYXRoLnJlZC5jb21wbGVtZW50KCkucmdiKCk7XG4gICAgICAgICA+IFswLCAyNTUsIDI1NV1cbiAgICAgICovXG4gICAgICBjb21wbGVtZW50OiBmdW5jdGlvbiAoKXtcbiAgICAgICAgICByZXR1cm4gQ2hyb21hdGguY29tcGxlbWVudCh0aGlzKTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRyaWFkXG4gICAgICAgICBDYWxscyA8Q2hyb21hdGgudHJpYWQ+IHdpdGggdGhlIGN1cnJlbnQgaW5zdGFuY2UgYXMgdGhlIGZpcnN0IHBhcmFtZXRlclxuXG4gICAgICAgICA+ID4gbmV3IENocm9tYXRoKCdoc2woMCwgMTAwJSwgNTAlKScpLnRyaWFkKCkudG9TdHJpbmcoKTtcbiAgICAgICAgID4gXCIjRkYwMDAwLCMwMEZGMDAsIzAwMDBGRlwiXG4gICAgICAqL1xuICAgICAgdHJpYWQ6IGZ1bmN0aW9uICgpe1xuICAgICAgICAgIHJldHVybiBDaHJvbWF0aC50cmlhZCh0aGlzKTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRldHJhZFxuICAgICAgICAgQ2FsbHMgPENocm9tYXRoLnRldHJhZD4gd2l0aCB0aGUgY3VycmVudCBpbnN0YW5jZSBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyXG5cbiAgICAgICAgID4gPiBDaHJvbWF0aC5oc2IoMjQwLCAxLCAxKS50cmlhZCgpO1xuICAgICAgICAgPiBbQ2hyb21hdGgsIENocm9tYXRoLCBDaHJvbWF0aF1cbiAgICAgICovXG4gICAgICB0ZXRyYWQ6IGZ1bmN0aW9uICgpe1xuICAgICAgICAgIHJldHVybiBDaHJvbWF0aC50ZXRyYWQodGhpcyk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiBhbmFsb2dvdXNcbiAgICAgICAgIENhbGxzIDxDaHJvbWF0aC5hbmFsb2dvdXM+IHdpdGggdGhlIGN1cnJlbnQgaW5zdGFuY2UgYXMgdGhlIGZpcnN0IHBhcmFtZXRlclxuXG4gICAgICAgICA+ID4gQ2hyb21hdGguaHNiKDEyMCwgMSwgMSkuYW5hbG9nb3VzKCk7XG4gICAgICAgICA+IFtDaHJvbWF0aCwgQ2hyb21hdGgsIENocm9tYXRoLCBDaHJvbWF0aCwgQ2hyb21hdGgsIENocm9tYXRoLCBDaHJvbWF0aCwgQ2hyb21hdGhdXG5cbiAgICAgICAgID4gPiBDaHJvbWF0aC5oc2IoMTgwLCAxLCAxKS5hbmFsb2dvdXMoNSkudG9TdHJpbmcoKTtcbiAgICAgICAgID4gXCIjMDBGRkZGLCMwMEZGQjIsIzAwRkZFNSwjMDBFNUZGLCMwMEIyRkZcIlxuXG4gICAgICAgICA+ID4gQ2hyb21hdGguaHNiKDE4MCwgMSwgMSkuYW5hbG9nb3VzKDUsIDEwKS50b1N0cmluZygpO1xuICAgICAgICAgPiBcIiMwMEZGRkYsIzAwRkYxOSwjMDBGRkIyLCMwMEIyRkYsIzAwMTlGRlwiXG4gICAgICAqL1xuICAgICAgYW5hbG9nb3VzOiBmdW5jdGlvbiAocmVzdWx0cywgc2xpY2VzKXtcbiAgICAgICAgICByZXR1cm4gQ2hyb21hdGguYW5hbG9nb3VzKHRoaXMsIHJlc3VsdHMsIHNsaWNlcyk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICBNZXRob2Q6IG1vbm9jaHJvbWF0aWNcbiAgICAgICAgIENhbGxzIDxDaHJvbWF0aC5tb25vY2hyb21hdGljPiB3aXRoIHRoZSBjdXJyZW50IGluc3RhbmNlIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXJcblxuICAgICAgICA+ID4gQ2hyb21hdGguYmx1ZS5tb25vY2hyb21hdGljKCkudG9TdHJpbmcoKTtcbiAgICAgICAgPiBcIiMwMDAwMzMsIzAwMDA2NiwjMDAwMDk5LCMwMDAwQ0MsIzAwMDBGRlwiXG4gICAgICAqL1xuICAgICAgbW9ub2Nocm9tYXRpYzogZnVuY3Rpb24gKHJlc3VsdHMpe1xuICAgICAgICAgIHJldHVybiBDaHJvbWF0aC5tb25vY2hyb21hdGljKHRoaXMsIHJlc3VsdHMpO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogc3BsaXRjb21wbGVtZW50XG4gICAgICAgICBDYWxscyA8Q2hyb21hdGguc3BsaXRjb21wbGVtZW50PiB3aXRoIHRoZSBjdXJyZW50IGluc3RhbmNlIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXJcblxuICAgICAgICAgPiA+IENocm9tYXRoLmJsdWUuc3BsaXRjb21wbGVtZW50KCkudG9TdHJpbmcoKTtcbiAgICAgICAgID4gXCIjMDAwMEZGLCNGRkNDMDAsI0ZGNTEwMFwiXG4gICAgICAqL1xuICAgICAgc3BsaXRjb21wbGVtZW50OiBmdW5jdGlvbiAoKXtcbiAgICAgICAgICByZXR1cm4gQ2hyb21hdGguc3BsaXRjb21wbGVtZW50KHRoaXMpO1xuICAgICAgfSxcblxuICAgICAgLy8gR3JvdXA6IEluc3RhbmNlIG1ldGhvZHMgLSBjb2xvciBhbHRlcmF0aW9uXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0aW50XG4gICAgICAgICBDYWxscyA8Q2hyb21hdGgudGludD4gd2l0aCB0aGUgY3VycmVudCBpbnN0YW5jZSBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyXG5cbiAgICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJ3llbGxvdycpLnRpbnQoMC4yNSkudG9TdHJpbmcoKTtcbiAgICAgICAgID4gXCIjRkZGRjNGXCJcbiAgICAgICovXG4gICAgICB0aW50OiBmdW5jdGlvbiAoYnkpIHtcbiAgICAgICAgICByZXR1cm4gQ2hyb21hdGgudGludCh0aGlzLCBieSk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiBsaWdodGVuXG4gICAgICAgICBBbGlhcyBmb3IgPHRpbnQ+XG4gICAgICAqL1xuICAgICAgbGlnaHRlbjogZnVuY3Rpb24gKGJ5KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRpbnQoYnkpO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgTWV0aG9kOiBzaGFkZVxuICAgICAgICAgQ2FsbHMgPENocm9tYXRoLnNoYWRlPiB3aXRoIHRoZSBjdXJyZW50IGluc3RhbmNlIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXJcblxuICAgICAgICA+ID4gbmV3IENocm9tYXRoKCd5ZWxsb3cnKS5zaGFkZSgwLjI1KS50b1N0cmluZygpO1xuICAgICAgICA+IFwiI0JGQkYwMFwiXG4gICAgICAqL1xuICAgICAgc2hhZGU6IGZ1bmN0aW9uIChieSkge1xuICAgICAgICAgIHJldHVybiBDaHJvbWF0aC5zaGFkZSh0aGlzLCBieSk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiBkYXJrZW5cbiAgICAgICAgIEFsaWFzIGZvciA8c2hhZGU+XG4gICAgICAqL1xuICAgICAgZGFya2VuOiBmdW5jdGlvbiAoYnkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hhZGUoYnkpO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogZGVzYXR1cmF0ZVxuICAgICAgICAgQ2FsbHMgPENocm9tYXRoLmRlc2F0dXJhdGU+IHdpdGggdGhlIGN1cnJlbnQgaW5zdGFuY2UgYXMgdGhlIGZpcnN0IHBhcmFtZXRlclxuXG4gICAgICAgPiA+IG5ldyBDaHJvbWF0aCgnb3JhbmdlJykuZGVzYXR1cmF0ZSgpLnRvU3RyaW5nKCk7XG4gICAgICAgPiBcIiNBREFEQURcIlxuXG4gICAgICAgPiA+IG5ldyBDaHJvbWF0aCgnb3JhbmdlJykuZGVzYXR1cmF0ZSgxKS50b1N0cmluZygpO1xuICAgICAgID4gXCIjNUI1QjVCXCJcblxuICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJ29yYW5nZScpLmRlc2F0dXJhdGUoMikudG9TdHJpbmcoKTtcbiAgICAgICA+IFwiI0I0QjRCNFwiXG4gICAgICAgKi9cbiAgICAgIGRlc2F0dXJhdGU6IGZ1bmN0aW9uIChmb3JtdWxhKXtcbiAgICAgICAgICByZXR1cm4gQ2hyb21hdGguZGVzYXR1cmF0ZSh0aGlzLCBmb3JtdWxhKTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgIE1ldGhvZDogZ3JleXNjYWxlXG4gICAgICAgIEFsaWFzIGZvciA8ZGVzYXR1cmF0ZT5cbiAgICAgICovXG4gICAgICBncmV5c2NhbGU6IGZ1bmN0aW9uIChmb3JtdWxhKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRlc2F0dXJhdGUoZm9ybXVsYSk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB3ZWJzYWZlXG4gICAgICAgICBDYWxscyA8Q2hyb21hdGgud2Vic2FmZT4gd2l0aCB0aGUgY3VycmVudCBpbnN0YW5jZSBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyXG5cbiAgICAgICAgID4gPiBDaHJvbWF0aC5yZ2IoMTIzLCAyMzQsIDU2KS50b1N0cmluZygpO1xuICAgICAgICAgPiBcIiM3QkVBMzhcIlxuXG4gICAgICAgICA+IENocm9tYXRoLnJnYigxMjMsIDIzNCwgNTYpLndlYnNhZmUoKS50b1N0cmluZygpO1xuICAgICAgICAgPiBcIiM2NkZGMzNcIlxuICAgICAgICovXG4gICAgICB3ZWJzYWZlOiBmdW5jdGlvbiAoKXtcbiAgICAgICAgICByZXR1cm4gQ2hyb21hdGgud2Vic2FmZSh0aGlzKTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIEdyb3VwOiBJbnN0YW5jZSBtZXRob2RzIC0gY29sb3IgY29tYmluYXRpb25cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IGFkZGl0aXZlXG4gICAgICAgICBDYWxscyA8Q2hyb21hdGguYWRkaXRpdmU+IHdpdGggdGhlIGN1cnJlbnQgaW5zdGFuY2UgYXMgdGhlIGZpcnN0IHBhcmFtZXRlclxuXG4gICAgICAgICA+ID4gbmV3IENocm9tYXRoKCdyZWQnKS5hZGRpdGl2ZSgnIzAwRkYwMCcsICdibHVlJykudG9TdHJpbmcoKTtcbiAgICAgICAgID4gXCIjRkZGRkZGXCJcbiAgICAgICovXG4gICAgICBhZGRpdGl2ZTogZnVuY3Rpb24gKCl7XG4gICAgICAgICAgdmFyIGFyciA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgICAgcmV0dXJuIENocm9tYXRoLmFkZGl0aXZlLmFwcGx5KENocm9tYXRoLCBbdGhpc10uY29uY2F0KGFycikpO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogc3VidHJhY3RpdmVcbiAgICAgICAgIENhbGxzIDxDaHJvbWF0aC5zdWJ0cmFjdGl2ZT4gd2l0aCB0aGUgY3VycmVudCBpbnN0YW5jZSBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyXG5cbiAgICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJ2N5YW4nKS5zdWJ0cmFjdGl2ZSgnbWFnZW50YScsICd5ZWxsb3cnKS50b1N0cmluZygpO1xuICAgICAgICAgPiBcIiMwMDAwMDBcIlxuICAgICAgKi9cbiAgICAgIHN1YnRyYWN0aXZlOiBmdW5jdGlvbiAoKXtcbiAgICAgICAgICB2YXIgYXJyID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgICAgICByZXR1cm4gQ2hyb21hdGguc3VidHJhY3RpdmUuYXBwbHkoQ2hyb21hdGgsIFt0aGlzXS5jb25jYXQoYXJyKSk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiBtdWx0aXBseVxuICAgICAgICAgQ2FsbHMgPENocm9tYXRoLm11bHRpcGx5PiB3aXRoIHRoZSBjdXJyZW50IGluc3RhbmNlIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXJcblxuICAgICAgICAgPiA+IENocm9tYXRoLmxpZ2h0Y3lhbi5tdWx0aXBseShDaHJvbWF0aC5icm93bikudG9TdHJpbmcoKTtcbiAgICAgICAgID4gXCIjOTAyQTJBXCJcbiAgICAgICovXG4gICAgICBtdWx0aXBseTogZnVuY3Rpb24gKCl7XG4gICAgICAgICAgdmFyIGFyciA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgICAgcmV0dXJuIENocm9tYXRoLm11bHRpcGx5LmFwcGx5KENocm9tYXRoLCBbdGhpc10uY29uY2F0KGFycikpO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogYXZlcmFnZVxuICAgICAgICAgQ2FsbHMgPENocm9tYXRoLmF2ZXJhZ2U+IHdpdGggdGhlIGN1cnJlbnQgaW5zdGFuY2UgYXMgdGhlIGZpcnN0IHBhcmFtZXRlclxuXG4gICAgICAgICA+ID4gQ2hyb21hdGguYmxhY2suYXZlcmFnZSgnd2hpdGUnKS5yZ2IoKTtcbiAgICAgICAgID4gWzEyNywgMTI3LCAxMjddXG4gICAgICAqL1xuICAgICAgYXZlcmFnZTogZnVuY3Rpb24gKCl7XG4gICAgICAgICAgdmFyIGFyciA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgICAgcmV0dXJuIENocm9tYXRoLmF2ZXJhZ2UuYXBwbHkoQ2hyb21hdGgsIFt0aGlzXS5jb25jYXQoYXJyKSk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiBvdmVybGF5XG4gICAgICAgICBDYWxscyA8Q2hyb21hdGgub3ZlcmxheT4gd2l0aCB0aGUgY3VycmVudCBpbnN0YW5jZSBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyXG5cbiAgICAgICA+ID4gQ2hyb21hdGgucmVkLm92ZXJsYXkoJ2dyZWVuJywgMC40KS50b1N0cmluZygpO1xuICAgICAgID4gXCIjOTkzMzAwXCJcblxuICAgICAgID4gPiBDaHJvbWF0aC5yZWQub3ZlcmxheSgnZ3JlZW4nLCAxKS50b1N0cmluZygpO1xuICAgICAgID4gXCIjMDA4MDAwXCJcblxuICAgICAgID4gPiBDaHJvbWF0aC5yZWQub3ZlcmxheSgnZ3JlZW4nLCAwKS50b1N0cmluZygpO1xuICAgICAgID4gXCIjRkYwMDAwXCJcbiAgICAgICAqL1xuICAgICAgb3ZlcmxheTogZnVuY3Rpb24gKGJvdHRvbSwgdHJhbnNwYXJlbmN5KXtcbiAgICAgICAgICByZXR1cm4gQ2hyb21hdGgub3ZlcmxheSh0aGlzLCBib3R0b20sIHRyYW5zcGFyZW5jeSk7XG4gICAgICB9LFxuXG4gICAgICAvLyBHcm91cDogSW5zdGFuY2UgbWV0aG9kcyAtIG90aGVyXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiBjbG9uZVxuICAgICAgICAgUmV0dXJuIGFuIGluZGVwZW5kZW50IGNvcHkgb2YgdGhlIGluc3RhbmNlXG4gICAgICAqL1xuICAgICAgY2xvbmU6IGZ1bmN0aW9uICgpe1xuICAgICAgICAgIHJldHVybiBuZXcgQ2hyb21hdGgodGhpcyk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b3dhcmRzXG4gICAgICAgICBDYWxscyA8Q2hyb21hdGgudG93YXJkcz4gd2l0aCB0aGUgY3VycmVudCBpbnN0YW5jZSBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyXG5cbiAgICAgICAgID4gPiB2YXIgcmVkID0gbmV3IENocm9tYXRoKCdyZWQnKTtcbiAgICAgICAgID4gPiByZWQudG93YXJkcygneWVsbG93JywgMC41NSkudG9TdHJpbmcoKTtcbiAgICAgICAgID4gXCIjRkY4QzAwXCJcbiAgICAgICovXG4gICAgICB0b3dhcmRzOiBmdW5jdGlvbiAodG8sIGJ5KSB7XG4gICAgICAgICAgcmV0dXJuIENocm9tYXRoLnRvd2FyZHModGhpcywgdG8sIGJ5KTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IGdyYWRpZW50XG4gICAgICAgICBDYWxscyA8Q2hyb21hdGguZ3JhZGllbnQ+IHdpdGggdGhlIGN1cnJlbnQgaW5zdGFuY2UgYXMgdGhlIGZpcnN0IHBhcmFtZXRlclxuXG4gICAgICAgICA+ID4gbmV3IENocm9tYXRoKCcjRjAwJykuZ3JhZGllbnQoJyMwMEYnKS50b1N0cmluZygpXG4gICAgICAgICA+IFwiI0ZGMDAwMCwjRjEwMDBELCNFNDAwMUEsI0Q2MDAyOCwjQzkwMDM1LCNCQjAwNDMsI0FFMDA1MCwjQTEwMDVELCM5MzAwNkIsIzg2MDA3OCwjNzgwMDg2LCM2QjAwOTMsIzVEMDBBMSwjNTAwMEFFLCM0MzAwQkIsIzM1MDBDOSwjMjgwMEQ2LCMxQTAwRTQsIzBEMDBGMSwjMDAwMEZGXCJcblxuICAgICAgICAgPiA+IG5ldyBDaHJvbWF0aCgnI0YwMCcpLmdyYWRpZW50KCcjMDBGJywgNSkudG9TdHJpbmcoKVxuICAgICAgICAgPiBcIiNGRjAwMDAsI0JGMDAzRiwjN0YwMDdGLCMzRjAwQkYsIzAwMDBGRlwiXG5cbiAgICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJyNGMDAnKS5ncmFkaWVudCgnIzAwRicsIDUsIDMpLnRvU3RyaW5nKClcbiAgICAgICAgID4gXCIjM0YwMEJGXCJcbiAgICAgICovXG4gICAgICBncmFkaWVudDogZnVuY3Rpb24gKHRvLCBzbGljZXMsIHNsaWNlKXtcbiAgICAgICAgICByZXR1cm4gQ2hyb21hdGguZ3JhZGllbnQodGhpcywgdG8sIHNsaWNlcywgc2xpY2UpO1xuICAgICAgfVxuICB9O1xufTtcbiIsInZhciB1dGlsID0ge307XG5cbnV0aWwuY2xhbXAgPSBmdW5jdGlvbiAoIHZhbCwgbWluLCBtYXggKSB7XG4gICAgaWYgKHZhbCA+IG1heCkgcmV0dXJuIG1heDtcbiAgICBpZiAodmFsIDwgbWluKSByZXR1cm4gbWluO1xuICAgIHJldHVybiB2YWw7XG59O1xuXG51dGlsLm1lcmdlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBkZXN0ID0gYXJndW1lbnRzWzBdLCBpPTEsIHNvdXJjZSwgcHJvcDtcbiAgICB3aGlsZSAoc291cmNlID0gYXJndW1lbnRzW2krK10pXG4gICAgICAgIGZvciAocHJvcCBpbiBzb3VyY2UpIGRlc3RbcHJvcF0gPSBzb3VyY2VbcHJvcF07XG5cbiAgICByZXR1cm4gZGVzdDtcbn07XG5cbnV0aWwuaXNBcnJheSA9IGZ1bmN0aW9uICggdGVzdCApIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHRlc3QpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxudXRpbC5pc1N0cmluZyA9IGZ1bmN0aW9uICggdGVzdCApIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHRlc3QpID09PSAnW29iamVjdCBTdHJpbmddJztcbn07XG5cbnV0aWwuaXNOdW1iZXIgPSBmdW5jdGlvbiAoIHRlc3QgKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0ZXN0KSA9PT0gJ1tvYmplY3QgTnVtYmVyXSc7XG59O1xuXG51dGlsLmlzT2JqZWN0ID0gZnVuY3Rpb24gKCB0ZXN0ICkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodGVzdCkgPT09ICdbb2JqZWN0IE9iamVjdF0nO1xufTtcblxudXRpbC5scGFkID0gZnVuY3Rpb24gKCB2YWwsIGxlbiwgcGFkICkge1xuICAgIHZhbCA9IHZhbC50b1N0cmluZygpO1xuICAgIGlmICghbGVuKSBsZW4gPSAyO1xuICAgIGlmICghcGFkKSBwYWQgPSAnMCc7XG5cbiAgICB3aGlsZSAodmFsLmxlbmd0aCA8IGxlbikgdmFsID0gcGFkK3ZhbDtcblxuICAgIHJldHVybiB2YWw7XG59O1xuXG51dGlsLmxlcnAgPSBmdW5jdGlvbiAoZnJvbSwgdG8sIGJ5KSB7XG4gICAgcmV0dXJuIGZyb20gKyAodG8tZnJvbSkgKiBieTtcbn07XG5cbnV0aWwudGltZXMgPSBmdW5jdGlvbiAobiwgZm4sIGNvbnRleHQpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgcmVzdWx0cyA9IFtdOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgIHJlc3VsdHNbaV0gPSBmbi5jYWxsKGNvbnRleHQsIGkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbn07XG5cbnV0aWwucmdiID0ge1xuICAgIGZyb21BcmdzOiBmdW5jdGlvbiAociwgZywgYiwgYSkge1xuICAgICAgICB2YXIgcmdiID0gYXJndW1lbnRzWzBdO1xuXG4gICAgICAgIGlmICh1dGlsLmlzQXJyYXkocmdiKSl7IHI9cmdiWzBdOyBnPXJnYlsxXTsgYj1yZ2JbMl07IGE9cmdiWzNdOyB9XG4gICAgICAgIGlmICh1dGlsLmlzT2JqZWN0KHJnYikpeyByPXJnYi5yOyBnPXJnYi5nOyBiPXJnYi5iOyBhPXJnYi5hOyAgfVxuXG4gICAgICAgIHJldHVybiBbciwgZywgYiwgYV07XG4gICAgfSxcbiAgICBzY2FsZWQwMTogZnVuY3Rpb24gKHIsIGcsIGIpIHtcbiAgICAgICAgaWYgKCFpc0Zpbml0ZShhcmd1bWVudHNbMV0pKXtcbiAgICAgICAgICAgIHZhciByZ2IgPSB1dGlsLnJnYi5mcm9tQXJncyhyLCBnLCBiKTtcbiAgICAgICAgICAgIHIgPSByZ2JbMF0sIGcgPSByZ2JbMV0sIGIgPSByZ2JbMl07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAociA+IDEpIHIgLz0gMjU1O1xuICAgICAgICBpZiAoZyA+IDEpIGcgLz0gMjU1O1xuICAgICAgICBpZiAoYiA+IDEpIGIgLz0gMjU1O1xuXG4gICAgICAgIHJldHVybiBbciwgZywgYl07XG4gICAgfSxcbiAgICBwY3RXaXRoU3ltYm9sOiBmdW5jdGlvbiAociwgZywgYikge1xuICAgICAgICB2YXIgcmdiID0gdGhpcy5zY2FsZWQwMShyLCBnLCBiKTtcblxuICAgICAgICByZXR1cm4gcmdiLm1hcChmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGgucm91bmQodiAqIDI1NSkgKyAnJSc7XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbnV0aWwuaHNsID0ge1xuICAgIGZyb21BcmdzOiBmdW5jdGlvbiAoaCwgcywgbCwgYSkge1xuICAgICAgICB2YXIgaHNsID0gYXJndW1lbnRzWzBdO1xuXG4gICAgICAgIGlmICh1dGlsLmlzQXJyYXkoaHNsKSl7IGg9aHNsWzBdOyBzPWhzbFsxXTsgbD1oc2xbMl07IGE9aHNsWzNdOyB9XG4gICAgICAgIGlmICh1dGlsLmlzT2JqZWN0KGhzbCkpeyBoPWhzbC5oOyBzPWhzbC5zOyBsPShoc2wubCB8fCBoc2wudik7IGE9aHNsLmE7IH1cblxuICAgICAgICByZXR1cm4gW2gsIHMsIGwsIGFdO1xuICAgIH0sXG4gICAgc2NhbGVkOiBmdW5jdGlvbiAoaCwgcywgbCkge1xuICAgICAgICBpZiAoIWlzRmluaXRlKGFyZ3VtZW50c1sxXSkpe1xuICAgICAgICAgICAgdmFyIGhzbCA9IHV0aWwuaHNsLmZyb21BcmdzKGgsIHMsIGwpO1xuICAgICAgICAgICAgaCA9IGhzbFswXSwgcyA9IGhzbFsxXSwgbCA9IGhzbFsyXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGggPSAoKChoICUgMzYwKSArIDM2MCkgJSAzNjApO1xuICAgICAgICBpZiAocyA+IDEpIHMgLz0gMTAwO1xuICAgICAgICBpZiAobCA+IDEpIGwgLz0gMTAwO1xuXG4gICAgICAgIHJldHVybiBbaCwgcywgbF07XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB1dGlsO1xuIiwiLypcbiAqICBiYXNlNjQuanNcbiAqXG4gKiAgTGljZW5zZWQgdW5kZXIgdGhlIEJTRCAzLUNsYXVzZSBMaWNlbnNlLlxuICogICAgaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL0JTRC0zLUNsYXVzZVxuICpcbiAqICBSZWZlcmVuY2VzOlxuICogICAgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9CYXNlNjRcbiAqL1xuOyhmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gICAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnXG4gICAgICAgID8gbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KGdsb2JhbClcbiAgICAgICAgOiB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWRcbiAgICAgICAgPyBkZWZpbmUoZmFjdG9yeSkgOiBmYWN0b3J5KGdsb2JhbClcbn0oKFxuICAgIHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyA/IHNlbGZcbiAgICAgICAgOiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvd1xuICAgICAgICA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsXG46IHRoaXNcbiksIGZ1bmN0aW9uKGdsb2JhbCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICAvLyBleGlzdGluZyB2ZXJzaW9uIGZvciBub0NvbmZsaWN0KClcbiAgICBnbG9iYWwgPSBnbG9iYWwgfHwge307XG4gICAgdmFyIF9CYXNlNjQgPSBnbG9iYWwuQmFzZTY0O1xuICAgIHZhciB2ZXJzaW9uID0gXCIyLjUuMVwiO1xuICAgIC8vIGlmIG5vZGUuanMgYW5kIE5PVCBSZWFjdCBOYXRpdmUsIHdlIHVzZSBCdWZmZXJcbiAgICB2YXIgYnVmZmVyO1xuICAgIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYnVmZmVyID0gZXZhbChcInJlcXVpcmUoJ2J1ZmZlcicpLkJ1ZmZlclwiKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBidWZmZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gY29uc3RhbnRzXG4gICAgdmFyIGI2NGNoYXJzXG4gICAgICAgID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nO1xuICAgIHZhciBiNjR0YWIgPSBmdW5jdGlvbihiaW4pIHtcbiAgICAgICAgdmFyIHQgPSB7fTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBiaW4ubGVuZ3RoOyBpIDwgbDsgaSsrKSB0W2Jpbi5jaGFyQXQoaSldID0gaTtcbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgfShiNjRjaGFycyk7XG4gICAgdmFyIGZyb21DaGFyQ29kZSA9IFN0cmluZy5mcm9tQ2hhckNvZGU7XG4gICAgLy8gZW5jb2RlciBzdHVmZlxuICAgIHZhciBjYl91dG9iID0gZnVuY3Rpb24oYykge1xuICAgICAgICBpZiAoYy5sZW5ndGggPCAyKSB7XG4gICAgICAgICAgICB2YXIgY2MgPSBjLmNoYXJDb2RlQXQoMCk7XG4gICAgICAgICAgICByZXR1cm4gY2MgPCAweDgwID8gY1xuICAgICAgICAgICAgICAgIDogY2MgPCAweDgwMCA/IChmcm9tQ2hhckNvZGUoMHhjMCB8IChjYyA+Pj4gNikpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgZnJvbUNoYXJDb2RlKDB4ODAgfCAoY2MgJiAweDNmKSkpXG4gICAgICAgICAgICAgICAgOiAoZnJvbUNoYXJDb2RlKDB4ZTAgfCAoKGNjID4+PiAxMikgJiAweDBmKSlcbiAgICAgICAgICAgICAgICAgICArIGZyb21DaGFyQ29kZSgweDgwIHwgKChjYyA+Pj4gIDYpICYgMHgzZikpXG4gICAgICAgICAgICAgICAgICAgKyBmcm9tQ2hhckNvZGUoMHg4MCB8ICggY2MgICAgICAgICAmIDB4M2YpKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgY2MgPSAweDEwMDAwXG4gICAgICAgICAgICAgICAgKyAoYy5jaGFyQ29kZUF0KDApIC0gMHhEODAwKSAqIDB4NDAwXG4gICAgICAgICAgICAgICAgKyAoYy5jaGFyQ29kZUF0KDEpIC0gMHhEQzAwKTtcbiAgICAgICAgICAgIHJldHVybiAoZnJvbUNoYXJDb2RlKDB4ZjAgfCAoKGNjID4+PiAxOCkgJiAweDA3KSlcbiAgICAgICAgICAgICAgICAgICAgKyBmcm9tQ2hhckNvZGUoMHg4MCB8ICgoY2MgPj4+IDEyKSAmIDB4M2YpKVxuICAgICAgICAgICAgICAgICAgICArIGZyb21DaGFyQ29kZSgweDgwIHwgKChjYyA+Pj4gIDYpICYgMHgzZikpXG4gICAgICAgICAgICAgICAgICAgICsgZnJvbUNoYXJDb2RlKDB4ODAgfCAoIGNjICAgICAgICAgJiAweDNmKSkpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICB2YXIgcmVfdXRvYiA9IC9bXFx1RDgwMC1cXHVEQkZGXVtcXHVEQzAwLVxcdURGRkZGXXxbXlxceDAwLVxceDdGXS9nO1xuICAgIHZhciB1dG9iID0gZnVuY3Rpb24odSkge1xuICAgICAgICByZXR1cm4gdS5yZXBsYWNlKHJlX3V0b2IsIGNiX3V0b2IpO1xuICAgIH07XG4gICAgdmFyIGNiX2VuY29kZSA9IGZ1bmN0aW9uKGNjYykge1xuICAgICAgICB2YXIgcGFkbGVuID0gWzAsIDIsIDFdW2NjYy5sZW5ndGggJSAzXSxcbiAgICAgICAgb3JkID0gY2NjLmNoYXJDb2RlQXQoMCkgPDwgMTZcbiAgICAgICAgICAgIHwgKChjY2MubGVuZ3RoID4gMSA/IGNjYy5jaGFyQ29kZUF0KDEpIDogMCkgPDwgOClcbiAgICAgICAgICAgIHwgKChjY2MubGVuZ3RoID4gMiA/IGNjYy5jaGFyQ29kZUF0KDIpIDogMCkpLFxuICAgICAgICBjaGFycyA9IFtcbiAgICAgICAgICAgIGI2NGNoYXJzLmNoYXJBdCggb3JkID4+PiAxOCksXG4gICAgICAgICAgICBiNjRjaGFycy5jaGFyQXQoKG9yZCA+Pj4gMTIpICYgNjMpLFxuICAgICAgICAgICAgcGFkbGVuID49IDIgPyAnPScgOiBiNjRjaGFycy5jaGFyQXQoKG9yZCA+Pj4gNikgJiA2MyksXG4gICAgICAgICAgICBwYWRsZW4gPj0gMSA/ICc9JyA6IGI2NGNoYXJzLmNoYXJBdChvcmQgJiA2MylcbiAgICAgICAgXTtcbiAgICAgICAgcmV0dXJuIGNoYXJzLmpvaW4oJycpO1xuICAgIH07XG4gICAgdmFyIGJ0b2EgPSBnbG9iYWwuYnRvYSA/IGZ1bmN0aW9uKGIpIHtcbiAgICAgICAgcmV0dXJuIGdsb2JhbC5idG9hKGIpO1xuICAgIH0gOiBmdW5jdGlvbihiKSB7XG4gICAgICAgIHJldHVybiBiLnJlcGxhY2UoL1tcXHNcXFNdezEsM30vZywgY2JfZW5jb2RlKTtcbiAgICB9O1xuICAgIHZhciBfZW5jb2RlID0gYnVmZmVyID9cbiAgICAgICAgYnVmZmVyLmZyb20gJiYgVWludDhBcnJheSAmJiBidWZmZXIuZnJvbSAhPT0gVWludDhBcnJheS5mcm9tXG4gICAgICAgID8gZnVuY3Rpb24gKHUpIHtcbiAgICAgICAgICAgIHJldHVybiAodS5jb25zdHJ1Y3RvciA9PT0gYnVmZmVyLmNvbnN0cnVjdG9yID8gdSA6IGJ1ZmZlci5mcm9tKHUpKVxuICAgICAgICAgICAgICAgIC50b1N0cmluZygnYmFzZTY0JylcbiAgICAgICAgfVxuICAgICAgICA6ICBmdW5jdGlvbiAodSkge1xuICAgICAgICAgICAgcmV0dXJuICh1LmNvbnN0cnVjdG9yID09PSBidWZmZXIuY29uc3RydWN0b3IgPyB1IDogbmV3ICBidWZmZXIodSkpXG4gICAgICAgICAgICAgICAgLnRvU3RyaW5nKCdiYXNlNjQnKVxuICAgICAgICB9XG4gICAgICAgIDogZnVuY3Rpb24gKHUpIHsgcmV0dXJuIGJ0b2EodXRvYih1KSkgfVxuICAgIDtcbiAgICB2YXIgZW5jb2RlID0gZnVuY3Rpb24odSwgdXJpc2FmZSkge1xuICAgICAgICByZXR1cm4gIXVyaXNhZmVcbiAgICAgICAgICAgID8gX2VuY29kZShTdHJpbmcodSkpXG4gICAgICAgICAgICA6IF9lbmNvZGUoU3RyaW5nKHUpKS5yZXBsYWNlKC9bK1xcL10vZywgZnVuY3Rpb24obTApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbTAgPT0gJysnID8gJy0nIDogJ18nO1xuICAgICAgICAgICAgfSkucmVwbGFjZSgvPS9nLCAnJyk7XG4gICAgfTtcbiAgICB2YXIgZW5jb2RlVVJJID0gZnVuY3Rpb24odSkgeyByZXR1cm4gZW5jb2RlKHUsIHRydWUpIH07XG4gICAgLy8gZGVjb2RlciBzdHVmZlxuICAgIHZhciByZV9idG91ID0gbmV3IFJlZ0V4cChbXG4gICAgICAgICdbXFx4QzAtXFx4REZdW1xceDgwLVxceEJGXScsXG4gICAgICAgICdbXFx4RTAtXFx4RUZdW1xceDgwLVxceEJGXXsyfScsXG4gICAgICAgICdbXFx4RjAtXFx4RjddW1xceDgwLVxceEJGXXszfSdcbiAgICBdLmpvaW4oJ3wnKSwgJ2cnKTtcbiAgICB2YXIgY2JfYnRvdSA9IGZ1bmN0aW9uKGNjY2MpIHtcbiAgICAgICAgc3dpdGNoKGNjY2MubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHZhciBjcCA9ICgoMHgwNyAmIGNjY2MuY2hhckNvZGVBdCgwKSkgPDwgMTgpXG4gICAgICAgICAgICAgICAgfCAgICAoKDB4M2YgJiBjY2NjLmNoYXJDb2RlQXQoMSkpIDw8IDEyKVxuICAgICAgICAgICAgICAgIHwgICAgKCgweDNmICYgY2NjYy5jaGFyQ29kZUF0KDIpKSA8PCAgNilcbiAgICAgICAgICAgICAgICB8ICAgICAoMHgzZiAmIGNjY2MuY2hhckNvZGVBdCgzKSksXG4gICAgICAgICAgICBvZmZzZXQgPSBjcCAtIDB4MTAwMDA7XG4gICAgICAgICAgICByZXR1cm4gKGZyb21DaGFyQ29kZSgob2Zmc2V0ICA+Pj4gMTApICsgMHhEODAwKVxuICAgICAgICAgICAgICAgICAgICArIGZyb21DaGFyQ29kZSgob2Zmc2V0ICYgMHgzRkYpICsgMHhEQzAwKSk7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHJldHVybiBmcm9tQ2hhckNvZGUoXG4gICAgICAgICAgICAgICAgKCgweDBmICYgY2NjYy5jaGFyQ29kZUF0KDApKSA8PCAxMilcbiAgICAgICAgICAgICAgICAgICAgfCAoKDB4M2YgJiBjY2NjLmNoYXJDb2RlQXQoMSkpIDw8IDYpXG4gICAgICAgICAgICAgICAgICAgIHwgICgweDNmICYgY2NjYy5jaGFyQ29kZUF0KDIpKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiAgZnJvbUNoYXJDb2RlKFxuICAgICAgICAgICAgICAgICgoMHgxZiAmIGNjY2MuY2hhckNvZGVBdCgwKSkgPDwgNilcbiAgICAgICAgICAgICAgICAgICAgfCAgKDB4M2YgJiBjY2NjLmNoYXJDb2RlQXQoMSkpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfTtcbiAgICB2YXIgYnRvdSA9IGZ1bmN0aW9uKGIpIHtcbiAgICAgICAgcmV0dXJuIGIucmVwbGFjZShyZV9idG91LCBjYl9idG91KTtcbiAgICB9O1xuICAgIHZhciBjYl9kZWNvZGUgPSBmdW5jdGlvbihjY2NjKSB7XG4gICAgICAgIHZhciBsZW4gPSBjY2NjLmxlbmd0aCxcbiAgICAgICAgcGFkbGVuID0gbGVuICUgNCxcbiAgICAgICAgbiA9IChsZW4gPiAwID8gYjY0dGFiW2NjY2MuY2hhckF0KDApXSA8PCAxOCA6IDApXG4gICAgICAgICAgICB8IChsZW4gPiAxID8gYjY0dGFiW2NjY2MuY2hhckF0KDEpXSA8PCAxMiA6IDApXG4gICAgICAgICAgICB8IChsZW4gPiAyID8gYjY0dGFiW2NjY2MuY2hhckF0KDIpXSA8PCAgNiA6IDApXG4gICAgICAgICAgICB8IChsZW4gPiAzID8gYjY0dGFiW2NjY2MuY2hhckF0KDMpXSAgICAgICA6IDApLFxuICAgICAgICBjaGFycyA9IFtcbiAgICAgICAgICAgIGZyb21DaGFyQ29kZSggbiA+Pj4gMTYpLFxuICAgICAgICAgICAgZnJvbUNoYXJDb2RlKChuID4+PiAgOCkgJiAweGZmKSxcbiAgICAgICAgICAgIGZyb21DaGFyQ29kZSggbiAgICAgICAgICYgMHhmZilcbiAgICAgICAgXTtcbiAgICAgICAgY2hhcnMubGVuZ3RoIC09IFswLCAwLCAyLCAxXVtwYWRsZW5dO1xuICAgICAgICByZXR1cm4gY2hhcnMuam9pbignJyk7XG4gICAgfTtcbiAgICB2YXIgX2F0b2IgPSBnbG9iYWwuYXRvYiA/IGZ1bmN0aW9uKGEpIHtcbiAgICAgICAgcmV0dXJuIGdsb2JhbC5hdG9iKGEpO1xuICAgIH0gOiBmdW5jdGlvbihhKXtcbiAgICAgICAgcmV0dXJuIGEucmVwbGFjZSgvXFxTezEsNH0vZywgY2JfZGVjb2RlKTtcbiAgICB9O1xuICAgIHZhciBhdG9iID0gZnVuY3Rpb24oYSkge1xuICAgICAgICByZXR1cm4gX2F0b2IoU3RyaW5nKGEpLnJlcGxhY2UoL1teQS1aYS16MC05XFwrXFwvXS9nLCAnJykpO1xuICAgIH07XG4gICAgdmFyIF9kZWNvZGUgPSBidWZmZXIgP1xuICAgICAgICBidWZmZXIuZnJvbSAmJiBVaW50OEFycmF5ICYmIGJ1ZmZlci5mcm9tICE9PSBVaW50OEFycmF5LmZyb21cbiAgICAgICAgPyBmdW5jdGlvbihhKSB7XG4gICAgICAgICAgICByZXR1cm4gKGEuY29uc3RydWN0b3IgPT09IGJ1ZmZlci5jb25zdHJ1Y3RvclxuICAgICAgICAgICAgICAgICAgICA/IGEgOiBidWZmZXIuZnJvbShhLCAnYmFzZTY0JykpLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICAgICAgOiBmdW5jdGlvbihhKSB7XG4gICAgICAgICAgICByZXR1cm4gKGEuY29uc3RydWN0b3IgPT09IGJ1ZmZlci5jb25zdHJ1Y3RvclxuICAgICAgICAgICAgICAgICAgICA/IGEgOiBuZXcgYnVmZmVyKGEsICdiYXNlNjQnKSkudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgICAgICA6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIGJ0b3UoX2F0b2IoYSkpIH07XG4gICAgdmFyIGRlY29kZSA9IGZ1bmN0aW9uKGEpe1xuICAgICAgICByZXR1cm4gX2RlY29kZShcbiAgICAgICAgICAgIFN0cmluZyhhKS5yZXBsYWNlKC9bLV9dL2csIGZ1bmN0aW9uKG0wKSB7IHJldHVybiBtMCA9PSAnLScgPyAnKycgOiAnLycgfSlcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvW15BLVphLXowLTlcXCtcXC9dL2csICcnKVxuICAgICAgICApO1xuICAgIH07XG4gICAgdmFyIG5vQ29uZmxpY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIEJhc2U2NCA9IGdsb2JhbC5CYXNlNjQ7XG4gICAgICAgIGdsb2JhbC5CYXNlNjQgPSBfQmFzZTY0O1xuICAgICAgICByZXR1cm4gQmFzZTY0O1xuICAgIH07XG4gICAgLy8gZXhwb3J0IEJhc2U2NFxuICAgIGdsb2JhbC5CYXNlNjQgPSB7XG4gICAgICAgIFZFUlNJT046IHZlcnNpb24sXG4gICAgICAgIGF0b2I6IGF0b2IsXG4gICAgICAgIGJ0b2E6IGJ0b2EsXG4gICAgICAgIGZyb21CYXNlNjQ6IGRlY29kZSxcbiAgICAgICAgdG9CYXNlNjQ6IGVuY29kZSxcbiAgICAgICAgdXRvYjogdXRvYixcbiAgICAgICAgZW5jb2RlOiBlbmNvZGUsXG4gICAgICAgIGVuY29kZVVSSTogZW5jb2RlVVJJLFxuICAgICAgICBidG91OiBidG91LFxuICAgICAgICBkZWNvZGU6IGRlY29kZSxcbiAgICAgICAgbm9Db25mbGljdDogbm9Db25mbGljdCxcbiAgICAgICAgX19idWZmZXJfXzogYnVmZmVyXG4gICAgfTtcbiAgICAvLyBpZiBFUzUgaXMgYXZhaWxhYmxlLCBtYWtlIEJhc2U2NC5leHRlbmRTdHJpbmcoKSBhdmFpbGFibGVcbiAgICBpZiAodHlwZW9mIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YXIgbm9FbnVtID0gZnVuY3Rpb24odil7XG4gICAgICAgICAgICByZXR1cm4ge3ZhbHVlOnYsZW51bWVyYWJsZTpmYWxzZSx3cml0YWJsZTp0cnVlLGNvbmZpZ3VyYWJsZTp0cnVlfTtcbiAgICAgICAgfTtcbiAgICAgICAgZ2xvYmFsLkJhc2U2NC5leHRlbmRTdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoXG4gICAgICAgICAgICAgICAgU3RyaW5nLnByb3RvdHlwZSwgJ2Zyb21CYXNlNjQnLCBub0VudW0oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGVjb2RlKHRoaXMpXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFxuICAgICAgICAgICAgICAgIFN0cmluZy5wcm90b3R5cGUsICd0b0Jhc2U2NCcsIG5vRW51bShmdW5jdGlvbiAodXJpc2FmZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZW5jb2RlKHRoaXMsIHVyaXNhZmUpXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFxuICAgICAgICAgICAgICAgIFN0cmluZy5wcm90b3R5cGUsICd0b0Jhc2U2NFVSSScsIG5vRW51bShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlbmNvZGUodGhpcywgdHJ1ZSlcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIC8vXG4gICAgLy8gZXhwb3J0IEJhc2U2NCB0byB0aGUgbmFtZXNwYWNlXG4gICAgLy9cbiAgICBpZiAoZ2xvYmFsWydNZXRlb3InXSkgeyAvLyBNZXRlb3IuanNcbiAgICAgICAgQmFzZTY0ID0gZ2xvYmFsLkJhc2U2NDtcbiAgICB9XG4gICAgLy8gbW9kdWxlLmV4cG9ydHMgYW5kIEFNRCBhcmUgbXV0dWFsbHkgZXhjbHVzaXZlLlxuICAgIC8vIG1vZHVsZS5leHBvcnRzIGhhcyBwcmVjZWRlbmNlLlxuICAgIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cy5CYXNlNjQgPSBnbG9iYWwuQmFzZTY0O1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgICAgICBkZWZpbmUoW10sIGZ1bmN0aW9uKCl7IHJldHVybiBnbG9iYWwuQmFzZTY0IH0pO1xuICAgIH1cbiAgICAvLyB0aGF0J3MgaXQhXG4gICAgcmV0dXJuIHtCYXNlNjQ6IGdsb2JhbC5CYXNlNjR9XG59KSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbi8vQ3JhZnQgb2JqZWN0LnByb3R5cGVcclxuKGZ1bmN0aW9uKCl7XHJcblx0aWYoIHR5cGVvZihPYmplY3QuYWRkQ29uc3RQcm9wKSA9PSBcImZ1bmN0aW9uXCIpe1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHRcclxuXHRcclxuXHRmdW5jdGlvbiBjb25zdFByb3AobmFtZV9wcm9wLCB2YWx1ZSwgdmlzKXtcclxuXHRcdGlmKHZpcyA9PT0gdW5kZWZpbmVkKSB2aXMgPSB0cnVlO1xyXG5cdFx0aWYodHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiKSBPYmplY3QuZnJlZXplKHZhbHVlKTtcclxuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBuYW1lX3Byb3AsIHtcclxuXHRcdFx0XHR2YWx1ZTogdmFsdWUsXHJcblx0XHRcdFx0ZW51bWVyYWJsZTogdmlzXHJcblx0XHRcdH0pO1xyXG5cdH1cclxuXHRmdW5jdGlvbiBnZXRTZXQobmFtZSwgZ2V0dGVyLCBzZXR0ZXIpe1xyXG5cdFx0aWYodHlwZW9mIHNldHRlciA9PSBcImZ1bmN0aW9uXCIpe1xyXG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgbmFtZSwge1xyXG5cdFx0XHRcdGdldDogZ2V0dGVyLFxyXG5cdFx0XHRcdHNldDogc2V0dGVyLFxyXG5cdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXHJcblx0XHRcdFx0Y29uZmlndXJhYmxlOiB0cnVlXHJcblx0XHRcdH0pO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBuYW1lLCB7XHJcblx0XHRcdFx0Z2V0OiBnZXR0ZXIsXHJcblx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcclxuXHRcdFx0XHRjb25maWd1cmFibGU6IHRydWVcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGNvbnN0UHJvcC5jYWxsKE9iamVjdC5wcm90b3R5cGUsICdhZGRDb25zdFByb3AnLCBjb25zdFByb3AsIGZhbHNlKTtcclxuXHRPYmplY3QucHJvdG90eXBlLmFkZENvbnN0UHJvcCgnYWRkR2V0U2V0JywgZ2V0U2V0LCBmYWxzZSk7XHJcblx0XHJcblx0XHJcblx0aWYodHlwZW9mKE9iamVjdC5wcm90b3R5cGUudG9Tb3VyY2UpICE9PSBcImZ1bmN0aW9uXCIpe1xyXG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KE9iamVjdC5wcm90b3R5cGUsICd0b1NvdXJjZScse1xyXG5cdFx0XHR2YWx1ZTogZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdHZhciBzdHIgPSAneyc7XHJcblx0XHRcdFx0XHRmb3IodmFyIGtleSBpbiB0aGlzKXtcclxuXHRcdFx0XHRcdFx0c3RyICs9ICcgJyArIGtleSArICc6ICcgKyB0aGlzW2tleV0gKyAnLCc7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpZihzdHIubGVuZ3RoID4gMikgc3RyID0gc3RyLnNsaWNlKDAsIC0xKSArICcgJztcclxuXHRcdFx0XHRcdHJldHVybiBzdHIgKyAnfSc7XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0ZW51bWVyYWJsZTogZmFsc2VcclxuXHRcdH0pO1xyXG5cdH1cclxuXHRcclxuXHRcclxuXHRpZih0eXBlb2YoT2JqZWN0LnZhbHVlcykgIT09IFwiZnVuY3Rpb25cIil7XHJcblx0XHR2YXIgdmFsX09iaiA9IGZ1bmN0aW9uKG9iail7XHJcblx0XHRcdHZhciB2YWxzID0gW107XHJcblx0XHRcdFxyXG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gb2JqKSB7XHJcblx0XHRcdFx0dmFscy5wdXNoKG9ialtrZXldKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0cmV0dXJuIHZhbHM7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQgT2JqZWN0LmFkZENvbnN0UHJvcCgndmFsdWVzJywgdmFsX09iai5iaW5kKE9iamVjdCkpO1xyXG5cdH1cclxuXHRcclxuXHRmdW5jdGlvbiByYW5kSW5kZXgoKXtcclxuXHRcdHZhciByYW5kID0gTWF0aC5yb3VuZCgodGhpcy5sZW5ndGggLSAxKSAqIE1hdGgucmFuZG9tKCkpO1xyXG5cdFx0cmV0dXJuIHRoaXNbcmFuZF07XHJcblx0fVxyXG5cdEFycmF5LnByb3RvdHlwZS5hZGRDb25zdFByb3AoJ3JhbmRfaScsIHJhbmRJbmRleCk7XHJcblx0XHJcblx0XHJcblx0ZnVuY3Rpb24gY3JlYXRlQXJyKHZhbCwgbGVuZ3RoLCBpc19jYWxsKXtcclxuXHRcdHZhciBhcnIgPSBbXTtcclxuXHRcdFxyXG5cdFx0aWYoIWxlbmd0aCkgbGVuZ3RoID0gMTtcclxuXHRcdGlmKGlzX2NhbGwgPT09IHVuZGVmaW5lZCkgaXNfY2FsbCA9IHRydWU7XHJcblx0XHRcclxuXHRcdGlmKHR5cGVvZiB2YWwgPT0gJ2Z1bmN0aW9uJyAmJiBpc19jYWxsKXtcclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKXtcclxuXHRcdFx0XHRhcnIucHVzaCh2YWwoaSwgYXJyKSk7XHJcblx0XHRcdH1cclxuXHRcdH1lbHNle1xyXG5cdFx0XHRcclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKXtcclxuXHRcdFx0XHRhcnIucHVzaCh2YWwpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiBhcnI7XHJcblx0fVxyXG5cdFxyXG5cdEFycmF5LnByb3RvdHlwZS5hZGRDb25zdFByb3AoJ2FkZCcsIGZ1bmN0aW9uKHZhbCl7XHJcblx0XHRpZighdGhpcy5fbnVsbHMpIHRoaXMuX251bGxzID0gW107XHJcblx0XHRcclxuXHRcdGlmKHRoaXMuX251bGxzLmxlbmd0aCl7XHJcblx0XHRcdHZhciBpbmQgPSB0aGlzLl9udWxscy5wb3AoKTtcclxuXHRcdFx0dGhpc1tpbmRdID0gdmFsO1xyXG5cdFx0XHRyZXR1cm4gaW5kO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHJldHVybiB0aGlzLnB1c2godmFsKSAtIDE7XHJcblx0XHR9XHJcblx0fSk7XHJcblx0XHJcblx0QXJyYXkucHJvdG90eXBlLmFkZENvbnN0UHJvcCgnZGVsbCcsIGZ1bmN0aW9uKGluZCl7XHJcblx0XHRpZihpbmQgPiB0aGlzLmxlbmd0aCAtMSkgcmV0dXJuIGZhbHNlO1xyXG5cdFx0XHJcblx0XHRpZihpbmQgPT0gdGhpcy5sZW5ndGggLTEpe1xyXG5cdFx0XHR0aGlzLnBvcCgpO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdGlmKCF0aGlzLl9udWxscykgdGhpcy5fbnVsbHMgPSBbXTtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXNbaW5kXSA9IHVuZGVmaW5lZDtcclxuXHRcdFx0dGhpcy5fbnVsbHMucHVzaChpbmQpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gdHJ1ZTtcdFxyXG5cdH0pO1xyXG5cdFxyXG5cdEFycmF5LmFkZENvbnN0UHJvcCgnY3JlYXRlJywgY3JlYXRlQXJyKTtcclxuXHRcclxuXHRcclxuXHRpZihSZWdFeHAucHJvdG90eXBlLnRvSlNPTiAhPT0gXCJmdW5jdGlvblwiKXtcclxuXHRcdFJlZ0V4cC5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXsgcmV0dXJuIHRoaXMuc291cmNlOyB9O1xyXG5cdH1cclxuXHJcbn0pKCk7XHJcblxyXG5cclxuXHJcblxyXG4iLCIndXNlIHN0cmljdCc7XHJcbm5ldyAoZnVuY3Rpb24oKXtcclxuXHRpZih0eXBlb2YoT2JqZWN0LmFkZENvbnN0UHJvcCkgIT09IFwiZnVuY3Rpb25cIil7XHJcblx0XHRpZih0eXBlb2YgbW9kdWxlID09IFwib2JqZWN0XCIpe1xyXG5cdFx0XHRyZXF1aXJlKFwiLi9tb2YuanNcIik7XHJcblx0XHR9ZWxzZSB0aHJvdyBuZXcgRXJyb3IoXCLQotGA0LXQsdGD0LXRgtGM0YHRjyDQsdC40LHQu9C40L7RgtC10LrQsCBtb2YuanNcIik7XHJcblx0fVxyXG5cclxuXHRpZih0eXBlb2YoT2JqZWN0LnR5cGVzKSA9PSBcIm9iamVjdFwiKXtcclxuXHRcdHJldHVybiBPYmplY3QudHlwZXM7XHJcblx0fVxyXG5cclxuXHR2YXIgVCA9IHRoaXM7XHJcblx0dmFyIERvYyA9IHtcclxuXHRcdHR5cGVzOntcclxuXHRcdFx0J2Jvb2wnOntcclxuXHRcdFx0XHRuYW1lOiBcIkJvb2xlYW5cIixcclxuXHRcdFx0XHRhcmc6IFtdXHJcblx0XHRcdH0sXHJcblx0XHRcdCdjb25zdCc6IHtcclxuXHRcdFx0XHRuYW1lOiBcIkNvbnN0YW50XCIsXHJcblx0XHRcdFx0YXJnOiBbXCJ2YWx1ZVwiXSxcclxuXHRcdFx0XHRwYXJhbXM6IHsgdmFsdWU6IHt0eXBlOiBcIlNvbWV0aGluZ1wiLCBkZWZhdWx0X3ZhbHVlOiBudWxsfX1cclxuXHRcdFx0fSxcclxuXHRcdFx0J3Bvcyc6IHtcclxuXHRcdFx0XHRuYW1lOiBcIlBvc2l0aW9uXCIsXHJcblx0XHRcdFx0YXJnOiBbJ21heCddLFxyXG5cdFx0XHRcdHBhcmFtczoge21heDoge3R5cGU6ICdwb3MnLCBkZWZhdWx0X3ZhbHVlOiArMjE0NzQ4MzY0N319XHJcblxyXG5cdFx0XHR9LFxyXG5cclxuXHRcdFx0J2ludCc6IHtcclxuXHRcdFx0XHRuYW1lOiBcIkludGVnZXJcIixcclxuXHRcdFx0XHRhcmc6IFtcIm1heFwiLCBcIm1pblwiLCBcInN0ZXBcIl0sXHJcblx0XHRcdFx0cGFyYW1zOiB7XHJcblx0XHRcdFx0XHRcdG1heDoge3R5cGU6ICdpbnQnLCBkZWZhdWx0X3ZhbHVlOiArMjE0NzQ4MzY0N30sXHJcblx0XHRcdFx0XHRcdG1pbjoge3R5cGU6ICdpbnQnLCBkZWZhdWx0X3ZhbHVlOiAtMjE0NzQ4MzY0OH0sXHJcblx0XHRcdFx0XHRcdHN0ZXA6IHt0eXBlOiAncG9zJywgZGVmYXVsdF92YWx1ZTogMX1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0fSxcclxuXHJcblx0XHRcdCdudW0nOiB7XHJcblx0XHRcdFx0bmFtZTogXCJOdW1iZXJcIixcclxuXHRcdFx0XHRhcmc6IFtcIm1heFwiLCBcIm1pblwiLCBcInByZWNpc1wiXSxcclxuXHRcdFx0XHRwYXJhbXM6IHtcclxuXHRcdFx0XHRcdFx0bWF4OiB7dHlwZTogJ251bScsIGRlZmF1bHRfdmFsdWU6ICsyMTQ3NDgzNjQ3fSxcclxuXHRcdFx0XHRcdFx0bWluOiB7dHlwZTogJ251bScsIGRlZmF1bHRfdmFsdWU6IC0yMTQ3NDgzNjQ4fSxcclxuXHRcdFx0XHRcdFx0cHJlY2lzOiB7dHlwZTogJ3BvcycsIGRlZmF1bHRfdmFsdWU6IDl9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdH0sXHJcblx0XHRcdCdhcnInOiB7XHJcblx0XHRcdFx0bmFtZTogXCJBcnJheVwiLFxyXG5cdFx0XHRcdGFyZzogW1widHlwZXNcIiwgXCJzaXplXCIsIFwiZml4ZWRcIl0sXHJcblx0XHRcdFx0cGFyYW1zOiB7XHJcblx0XHRcdFx0XHRcdHR5cGVzOiB7dHlwZTogXCJUeXBlIHx8IFtUeXBlLCBUeXBlLi4uXVwiLCBnZXQgZGVmYXVsdF92YWx1ZSgpe3JldHVybiBULnBvc319LFxyXG5cdFx0XHRcdFx0XHRzaXplOiB7dHlwZTogJ3BvcycsIGRlZmF1bHRfdmFsdWU6IDd9LFxyXG5cdFx0XHRcdFx0XHRmaXhlZDoge3R5cGU6ICdib29sJywgZGVmYXVsdF92YWx1ZTogdHJ1ZX1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0fSxcclxuXHRcdFx0J2FueSc6IHtcclxuXHRcdFx0XHRuYW1lOiBcIk1peFR5cGVcIixcclxuXHRcdFx0XHRhcmc6IFtcInR5cGVzXCJdLFxyXG5cdFx0XHRcdHBhcmFtczoge1xyXG5cdFx0XHRcdFx0XHR0eXBlczoge3R5cGU6IFwiVHlwZSwgVHlwZS4uLiB8fCBbVHlwZSwgVHlwZS4uLl1cIiwgZ2V0IGRlZmF1bHRfdmFsdWUoKXtyZXR1cm4gW1QucG9zLCBULnN0cl19fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHR9LFxyXG5cdFx0XHQnb2JqJzoge1xyXG5cdFx0XHRcdG5hbWU6IFwiT2JqZWN0XCIsXHJcblx0XHRcdFx0YXJnOiBbXCJ0eXBlc1wiXSxcclxuXHRcdFx0XHRwYXJhbXM6IHt0eXBlczoge3R5cGU6IFwiT2JqZWN0XCIsIGRlZmF1bHRfdmFsdWU6IHt9fX1cclxuXHRcdFx0fVxyXG5cdFx0fSxcclxuXHRcdGdldENvbnN0OiBmdW5jdGlvbihuYW1lX3R5cGUsIG5hbWVfbGltaXQpe1xyXG5cdFx0XHRyZXR1cm4gdGhpcy50eXBlc1tuYW1lX3R5cGVdLnBhcmFtc1tuYW1lX2xpbWl0XS5kZWZhdWx0X3ZhbHVlO1xyXG5cdFx0fVxyXG5cdH07XHJcblx0dGhpcy5kb2MgPSB7fTtcclxuXHR0aGlzLmRvYy5qc29uID0gSlNPTi5zdHJpbmdpZnkoRG9jLCBcIlwiLCAyKTtcclxuXHJcblx0RG9jLmdlbkRvYyA9IChmdW5jdGlvbihuYW1lLCBwYXJhbXMpe3JldHVybiB7bmFtZTogdGhpcy50eXBlc1tuYW1lXS5uYW1lLCBwYXJhbXM6IHBhcmFtc319KS5iaW5kKERvYyk7XHJcblx0dGhpcy5kb2MuZ2VuID0gRG9jLmdlbkRvYztcclxuXHJcblxyXG5cclxuXHJcblx0Ly9FcnJvc1xyXG5cdGZ1bmN0aW9uIGFyZ1R5cGVFcnJvcih3cm9uZ19hcmcsIG1lc3Mpe1xyXG5cdFx0aWYobWVzcyA9PT0gdW5kZWZpbmVkKSBtZXNzID0gJyc7XHJcblx0XHR2YXIgRVIgPSBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCB0eXBlIGlzIHdyb25nISBBcmd1bWVudHMoJyArIGZvckFyZyh3cm9uZ19hcmcpICsgJyk7JyArIG1lc3MpO1xyXG5cdFx0RVIud3JvbmdfYXJnID0gd3JvbmdfYXJnO1xyXG5cclxuXHRcdGlmIChFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSkge1xyXG5cdFx0XHRFcnJvci5jYXB0dXJlU3RhY2tUcmFjZShFUiwgYXJnVHlwZUVycm9yKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gRVI7XHJcblxyXG5cdFx0ZnVuY3Rpb24gZm9yQXJnKGFyZ3Mpe1xyXG5cdFx0XHR2YXIgc3RyX2FyZ3MgPSAnJztcclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspe1xyXG5cdFx0XHRcdHN0cl9hcmdzICs9IHR5cGVvZihhcmdzW2ldKSArICc6ICcgKyBhcmdzW2ldICsgJzsgJztcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gc3RyX2FyZ3M7XHJcblx0XHR9XHJcblx0fVxyXG5cdFQuZXJyb3IgPSBhcmdUeXBlRXJyb3I7XHJcblxyXG5cdGZ1bmN0aW9uIHR5cGVTeW50YXhFcnJvcih3cm9uZ19zdHIsIG1lc3Mpe1xyXG5cdFx0aWYobWVzcyA9PT0gdW5kZWZpbmVkKSBtZXNzID0gJyc7XHJcblx0XHR2YXIgRVIgPSBuZXcgU3ludGF4RXJyb3IoJ0xpbmU6ICcgKyB3cm9uZ19zdHIgKyAnOyAnICsgbWVzcyk7XHJcblx0XHRFUi53cm9uZ19hcmcgPSB3cm9uZ19zdHI7XHJcblxyXG5cdFx0aWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKSB7XHJcblx0XHRcdEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKEVSLCB0eXBlU3ludGF4RXJyb3IpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBFUjtcclxuXHR9XHJcblxyXG5cclxuXHJcblx0ZnVuY3Rpb24gQ3JlYXRlQ3JlYXRvcihOZXcsIHRlc3QsIHJhbmQsIGRvYyl7XHJcblx0XHR2YXIgY3JlYXRvcjtcclxuXHRcdGlmKHR5cGVvZiBOZXcgPT09IFwiZnVuY3Rpb25cIil7XHJcblx0XHRcdGNyZWF0b3IgPSBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdHZhciB0bXBfb2JqID0gTmV3LmFwcGx5KHt9LCBhcmd1bWVudHMpO1xyXG5cdFx0XHRcdHZhciBuZXdfY3JlYXRvciA9IG5ldyBDcmVhdGVDcmVhdG9yKE5ldyk7XHJcblx0XHRcdFx0Zm9yKHZhciBrZXkgaW4gdG1wX29iail7XHJcblx0XHRcdFx0XHRuZXdfY3JlYXRvci5hZGRDb25zdFByb3Aoa2V5LCB0bXBfb2JqW2tleV0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRyZXR1cm4gbmV3X2NyZWF0b3I7XHJcblx0XHRcdH07XHJcblx0XHR9ZWxzZSBjcmVhdG9yID0gZnVuY3Rpb24oKXtyZXR1cm4gY3JlYXRvcn07XHJcblxyXG5cdFx0Y3JlYXRvci5hZGRDb25zdFByb3AoJ2lzX2NyZWF0b3InLCB0cnVlKTtcclxuXHRcdGlmKHR5cGVvZiB0ZXN0ID09PSBcImZ1bmN0aW9uXCIpIGNyZWF0b3IuYWRkQ29uc3RQcm9wKCd0ZXN0JywgdGVzdCk7XHJcblx0XHRpZih0eXBlb2YgcmFuZCA9PT0gXCJmdW5jdGlvblwiKSBjcmVhdG9yLmFkZENvbnN0UHJvcCgncmFuZCcsIHJhbmQpO1xyXG5cdFx0aWYodHlwZW9mIGRvYyA9PT0gXCJmdW5jdGlvblwiKSBjcmVhdG9yLmFkZENvbnN0UHJvcCgnZG9jJywgZG9jKTtcclxuXHJcblx0XHRyZXR1cm4gY3JlYXRvcjtcclxuXHR9XHJcblx0dGhpcy5uZXdUeXBlID0gZnVuY3Rpb24oa2V5LCBkZXNjLCBuZXdfdHlwZSl7XHJcblx0XHREb2MudHlwZXNba2V5XSA9IGRlc2M7XHJcblx0XHRULm5hbWVzW2Rlc2MubmFtZV0gPSBrZXk7XHJcblx0XHR0aGlzLmRvYy5qc29uID0gSlNPTi5zdHJpbmdpZnkoRG9jLCBcIlwiLCAyKTtcclxuXHJcblx0XHR0aGlzW2tleV0gPSBuZXcgQ3JlYXRlQ3JlYXRvcihuZXdfdHlwZS5OZXcsIG5ld190eXBlLnRlc3QsIG5ld190eXBlLnJhbmQsIG5ld190eXBlLmRvYyk7XHJcblx0fVxyXG5cdHRoaXMubmV3VHlwZS5kb2MgPSAnKG5hbWUsIGNvbnN0cnVjdG9yLCBmdW5jVGVzdCwgZnVuY1JhbmQsIGZ1bmNEb2MpJztcclxuXHJcblxyXG5cclxuXHQvL0NyYWZ0IEJvb2xlYW5cclxuXHRcdHRoaXMuYm9vbCA9IG5ldyBDcmVhdGVDcmVhdG9yKFxyXG5cdFx0XHRudWxsLFxyXG5cdFx0XHRmdW5jdGlvbih2YWx1ZSl7XHJcblx0XHRcdFx0aWYodHlwZW9mIHZhbHVlICE9PSAnYm9vbGVhbicpe1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuZG9jKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LFxyXG5cdFx0XHRmdW5jdGlvbigpe1xyXG5cdFx0XHRcdHJldHVybiAhKE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSkpO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHREb2MuZ2VuRG9jLmJpbmQobnVsbCwgXCJib29sXCIpXHJcblx0XHQpO1xyXG5cclxuXHJcblxyXG5cdC8vQ3JhZnQgQ29uc3RcclxuXHRcdGZ1bmN0aW9uIGRvY0NvbnN0KHZhbCl7XHJcblxyXG5cdFx0XHRpZih0eXBlb2YodmFsKSA9PT0gXCJvYmplY3RcIiAmJiB2YWwgIT09IG51bGwpe1xyXG5cdFx0XHRcdHZhbCA9ICdPYmplY3QnO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmKHR5cGVvZih2YWwpID09PSBcImZ1bmN0aW9uXCIpe1xyXG5cdFx0XHRcdHZhbCA9IHZhbC50b1N0cmluZygpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBEb2MuZ2VuRG9jLmJpbmQobnVsbCxcImNvbnN0XCIsIHt2YWx1ZTogdmFsfSk7XHJcblx0XHR9XHJcblx0XHRmdW5jdGlvbiBuZXdDb25zdCh2YWwpe1xyXG5cdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdHJhbmQ6IGZ1bmN0aW9uKCl7cmV0dXJuIHZhbH0sXHJcblx0XHRcdFx0dGVzdDogZnVuY3Rpb24odil7XHJcblx0XHRcdFx0XHRpZih2YWwgIT09IHYpIHJldHVybiB0aGlzLmRvYygpO1xyXG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0ZG9jOiBkb2NDb25zdCh2YWwpXHJcblx0XHRcdH07XHJcblx0XHR9XHJcblx0XHR2YXIgZGVmX2NvbnN0ID0gbmV3Q29uc3QoRG9jLmdldENvbnN0KCdjb25zdCcsICd2YWx1ZScpKTtcclxuXHRcdHRoaXMuY29uc3QgPSBuZXcgQ3JlYXRlQ3JlYXRvcihuZXdDb25zdCwgZGVmX2NvbnN0LnRlc3QsIGRlZl9jb25zdC5yYW5kLCBkZWZfY29uc3QuZG9jKTtcclxuXHJcblx0XHRmdW5jdGlvbiB0Q29uc3QoVHlwZSl7XHJcblx0XHRcdGlmKHR5cGVvZiAoVHlwZSkgIT09IFwiZnVuY3Rpb25cIiB8fCAhVHlwZS5pc19jcmVhdG9yKXtcclxuXHRcdFx0XHRpZihBcnJheS5pc0FycmF5KFR5cGUpKXtcclxuXHJcblx0XHRcdFx0XHRyZXR1cm4gVC5hcnIoVHlwZSk7XHJcblxyXG5cdFx0XHRcdH1lbHNlIGlmKHR5cGVvZihUeXBlKSA9PSBcIm9iamVjdFwiICYmIFR5cGUgIT09IG51bGwpe1xyXG5cclxuXHRcdFx0XHRcdHJldHVybiBULm9iaihUeXBlKTtcclxuXHJcblx0XHRcdFx0fWVsc2UgcmV0dXJuIFQuY29uc3QoVHlwZSk7XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdHJldHVybiBUeXBlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cclxuXHQvL0NyYWZ0IE51bWJlclxyXG5cdFx0dmFyIHJhbmROdW0gPSBmdW5jdGlvbihtYXgsIG1pbiwgcHJlY2lzKXtcclxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0cmV0dXJuICsoKChtYXggLSBtaW4pKk1hdGgucmFuZG9tKCkgKyAgbWluKS50b0ZpeGVkKHByZWNpcykpO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cclxuXHRcdHZhciB0ZXN0TnVtID0gZnVuY3Rpb24obWF4LCBtaW4sIHByZWNpcyl7XHJcblx0XHRcdHJldHVybiBmdW5jdGlvbihuKXtcclxuXHRcdFx0XHRpZih0eXBlb2YgbiAhPT0gJ251bWJlcicgfHwgIWlzRmluaXRlKG4pKXtcclxuXHRcdFx0XHRcdHJldHVybiB0aGlzLmRvYygpO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aWYoKG4gPiBtYXgpXHJcblx0XHRcdFx0XHR8fChuIDwgbWluKVxyXG5cdFx0XHRcdFx0fHwgKG4udG9GaXhlZChwcmVjaXMpICE9IG4gJiYgbiAhPT0gMCkgKXtcclxuXHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5kb2MoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHQgIH07XHJcblx0XHR9O1xyXG5cclxuXHRcdHZhciBkb2NOdW0gPSBmdW5jdGlvbihtYXgsIG1pbiwgcHJlY2lzKXtcclxuXHRcdFx0cmV0dXJuIERvYy5nZW5Eb2MuYmluZChudWxsLCBcIm51bVwiLCB7XCJtYXhcIjogbWF4LCBcIm1pblwiOiBtaW4sIFwicHJlY2lzXCI6IHByZWNpc30pO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBtYXhfZGVmX24gPSBEb2MuZ2V0Q29uc3QoJ251bScsICdtYXgnKTtcclxuXHRcdHZhciBtaW5fZGVmX24gPSBEb2MuZ2V0Q29uc3QoJ251bScsICdtaW4nKTtcclxuXHRcdHZhciBwcmVjaXNfZGVmID0gRG9jLmdldENvbnN0KCdudW0nLCAncHJlY2lzJyk7XHJcblxyXG5cdFx0dGhpcy5udW0gPSBuZXcgQ3JlYXRlQ3JlYXRvcihcclxuXHRcdFx0ZnVuY3Rpb24obWF4LCBtaW4sIHByZWNpcyl7XHJcblx0XHRcdFx0aWYobWF4ID09PSBudWxsKSBtYXggPSBtYXhfZGVmX247XHJcblx0XHRcdFx0aWYobWluID09PSB1bmRlZmluZWR8fG1pbiA9PT0gbnVsbCkgbWluID0gbWluX2RlZl9uO1xyXG5cdFx0XHRcdGlmKHByZWNpcyA9PT0gdW5kZWZpbmVkKSBwcmVjaXMgPSBwcmVjaXNfZGVmO1xyXG5cclxuXHRcdFx0XHRpZigodHlwZW9mIG1pbiAhPT0gJ251bWJlcicgfHwgIWlzRmluaXRlKG1pbikpXHJcblx0XHRcdFx0XHR8fCh0eXBlb2YgbWF4ICE9PSAnbnVtYmVyJyB8fCAhaXNGaW5pdGUobWF4KSlcclxuXHRcdFx0XHRcdHx8KHR5cGVvZiBwcmVjaXMgIT09ICdudW1iZXInIHx8ICFpc0Zpbml0ZShwcmVjaXMpKVxyXG5cdFx0XHRcdFx0fHwocHJlY2lzIDwgMClcclxuXHRcdFx0XHRcdHx8KHByZWNpcyA+IDkpXHJcblx0XHRcdFx0XHR8fChwcmVjaXMgJSAxICE9PSAwKSl7XHJcblx0XHRcdFx0XHR0aHJvdyBhcmdUeXBlRXJyb3IoYXJndW1lbnRzLCAnV2FpdCBhcmd1bWVudHM6IG1pbihudW1iZXIpLCBtYXgobnVtYmVyKSwgcHJlY2lzKDA8PW51bWJlcjw5KScpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZihtaW4gPiBtYXgpe1xyXG5cdFx0XHRcdFx0dmFyIHQgPSBtaW47XHJcblx0XHRcdFx0XHRtaW4gPSBtYXg7XHJcblx0XHRcdFx0XHRtYXggPSB0O1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRcdHRlc3Q6IHRlc3ROdW0obWF4LCBtaW4sIHByZWNpcyksXHJcblx0XHRcdFx0XHRyYW5kOiByYW5kTnVtKG1heCwgbWluLCBwcmVjaXMpLFxyXG5cdFx0XHRcdFx0ZG9jOiBkb2NOdW0obWF4LCBtaW4sIHByZWNpcylcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sXHJcblx0XHRcdHRlc3ROdW0obWF4X2RlZl9uLCBtaW5fZGVmX24sIHByZWNpc19kZWYpLFxyXG5cdFx0XHRyYW5kTnVtKG1heF9kZWZfbiwgbWluX2RlZl9uLCBwcmVjaXNfZGVmKSxcclxuXHRcdFx0ZG9jTnVtKG1heF9kZWZfbiwgbWluX2RlZl9uLCBwcmVjaXNfZGVmKVxyXG5cdFx0KTtcclxuXHJcblx0XHR2YXIgcmFuZEludCA9IGZ1bmN0aW9uKG1heCwgbWluLCBwcmVjaXMpe1xyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRyZXR1cm4gTWF0aC5mbG9vciggKChtYXggLSAobWluICsgMC4xKSkvcHJlY2lzKSpNYXRoLnJhbmRvbSgpICkgKiBwcmVjaXMgKyAgbWluO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cclxuXHRcdCB2YXIgdGVzdEludCA9IGZ1bmN0aW9uKG1heCwgbWluLCBwcmVjaXMpe1xyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24obil7XHJcblx0XHRcdFx0aWYodHlwZW9mIG4gIT09ICdudW1iZXInIHx8ICFpc0Zpbml0ZShuKSl7XHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5kb2MoKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlmKChuID49IG1heClcclxuXHRcdFx0XHRcdHx8KG4gPCBtaW4pXHJcblx0XHRcdFx0XHR8fCgoKG4gLSBtaW4pICUgcHJlY2lzKSAhPT0gMCkgKXtcclxuXHRcdFx0XHRcdHJldHVybiB0aGlzLmRvYygpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdCAgfTtcclxuXHRcdH07XHJcblxyXG5cdFx0dmFyIGRvY0ludCA9IGZ1bmN0aW9uKG1heCwgbWluLCBzdGVwKXtcclxuXHJcblx0XHRcdFx0cmV0dXJuIERvYy5nZW5Eb2MuYmluZChudWxsLCBcImludFwiLCB7XCJtYXhcIjogbWF4LCBcIm1pblwiOiBtaW4sIFwic3RlcFwiOiBzdGVwfSk7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBtYXhfZGVmID0gRG9jLmdldENvbnN0KCdpbnQnLCAnbWF4Jyk7XHJcblx0XHR2YXIgbWluX2RlZiA9IERvYy5nZXRDb25zdCgnaW50JywgJ21pbicpO1xyXG5cdFx0dmFyIHN0ZXBfZGVmID0gRG9jLmdldENvbnN0KCdpbnQnLCAnc3RlcCcpO1xyXG5cclxuXHRcdHRoaXMuaW50ID0gbmV3IENyZWF0ZUNyZWF0b3IoXHJcblx0XHRcdGZ1bmN0aW9uKG1heCwgbWluLCBzdGVwKXtcclxuXHJcblx0XHRcdFx0aWYobWF4ID09PSBudWxsKSBtYXggPSBtYXhfZGVmO1xyXG5cdFx0XHRcdGlmKG1pbiA9PT0gdW5kZWZpbmVkfHxtaW4gPT09IG51bGwpIG1pbiA9IG1pbl9kZWY7XHJcblx0XHRcdFx0aWYoc3RlcCA9PT0gdW5kZWZpbmVkKSBzdGVwID0gc3RlcF9kZWY7XHJcblxyXG5cdFx0XHRcdGlmKCh0eXBlb2YgbWluICE9PSAnbnVtYmVyJyB8fCAhaXNGaW5pdGUobWluKSlcclxuXHRcdFx0XHRcdHx8KHR5cGVvZiBtYXggIT09ICdudW1iZXInIHx8ICFpc0Zpbml0ZShtYXgpKVxyXG5cdFx0XHRcdFx0fHwoTWF0aC5yb3VuZChtaW4pICE9PSBtaW4pXHJcblx0XHRcdFx0XHR8fChNYXRoLnJvdW5kKG1heCkgIT09IG1heClcclxuXHRcdFx0XHRcdHx8KHN0ZXAgPD0gMClcclxuXHRcdFx0XHRcdHx8KE1hdGgucm91bmQoc3RlcCkgIT09IHN0ZXApKXtcclxuXHRcdFx0XHRcdHRocm93IGFyZ1R5cGVFcnJvcihhcmd1bWVudHMsICdXYWl0IGFyZ3VtZW50czogbWluKGludCksIG1heChpbnQpLCBzdGVwKGludD4wKScpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZihtaW4gPiBtYXgpe1xyXG5cdFx0XHRcdFx0dmFyIHQgPSBtaW47XHJcblx0XHRcdFx0XHRtaW4gPSBtYXg7XHJcblx0XHRcdFx0XHRtYXggPSB0O1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRcdHRlc3Q6IHRlc3RJbnQobWF4LCBtaW4sIHN0ZXApLFxyXG5cdFx0XHRcdFx0cmFuZDogcmFuZEludChtYXgsIG1pbiwgc3RlcCksXHJcblx0XHRcdFx0XHRkb2M6IGRvY0ludChtYXgsIG1pbiwgc3RlcClcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sXHJcblx0XHRcdHRlc3RJbnQobWF4X2RlZiwgbWluX2RlZiwgc3RlcF9kZWYpLFxyXG5cdFx0XHRyYW5kSW50KG1heF9kZWYsIG1pbl9kZWYsIHN0ZXBfZGVmKSxcclxuXHRcdFx0ZG9jSW50KG1heF9kZWYsIG1pbl9kZWYsIHN0ZXBfZGVmKVxyXG5cdFx0KTtcclxuXHJcblx0XHR2YXIgZG9jUG9zID0gZnVuY3Rpb24obWF4LCBtaW4sIHN0ZXApe1xyXG5cclxuXHRcdFx0XHRyZXR1cm4gRG9jLmdlbkRvYy5iaW5kKG51bGwsIFwicG9zXCIsIHtcIm1heFwiOiBtYXh9KTtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIG1heF9kZWZfcCA9IERvYy5nZXRDb25zdCgncG9zJywgJ21heCcpXHJcblx0XHR0aGlzLnBvcyA9IG5ldyBDcmVhdGVDcmVhdG9yKFxyXG5cdFx0XHRmdW5jdGlvbihtYXgpe1xyXG5cclxuXHRcdFx0XHRpZihtYXggPT09IG51bGwpIG1heCA9IG1heF9kZWZfcDtcclxuXHJcblx0XHRcdFx0aWYoKHR5cGVvZiBtYXggIT09ICdudW1iZXInIHx8ICFpc0Zpbml0ZShtYXgpKVxyXG5cdFx0XHRcdFx0fHwobWF4IDwgMCkpe1xyXG5cdFx0XHRcdFx0dGhyb3cgYXJnVHlwZUVycm9yKGFyZ3VtZW50cywgJ1dhaXQgYXJndW1lbnRzOiBtaW4ocG9zKSwgbWF4KHBvcyksIHN0ZXAocG9zPjApJyk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdFx0dGVzdDogdGVzdEludChtYXgsIDAsIDEpLFxyXG5cdFx0XHRcdFx0cmFuZDogcmFuZEludChtYXgsIDAsIDEpLFxyXG5cdFx0XHRcdFx0ZG9jOiBkb2NQb3MobWF4KVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSxcclxuXHRcdFx0dGVzdEludChtYXhfZGVmX3AsIDAsIDEpLFxyXG5cdFx0XHRyYW5kSW50KG1heF9kZWZfcCwgMCwgMSksXHJcblx0XHRcdGRvY1BvcyhtYXhfZGVmX3ApXHJcblx0XHQpO1xyXG5cclxuXHJcblxyXG5cclxuXHJcbiAgLy9DcmFmdCBBbnlcclxuXHRcdGZ1bmN0aW9uIHJhbmRBbnkoYXJyKXtcclxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0cmV0dXJuIGFyci5yYW5kX2koKS5yYW5kKCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiB0ZXN0QW55KGFycil7XHJcblx0XHRcdHJldHVybiBmdW5jdGlvbih2YWwpe1xyXG5cdFx0XHRcdGlmKGFyci5ldmVyeShmdW5jdGlvbihpKXtyZXR1cm4gaS50ZXN0KHZhbCl9KSl7XHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5kb2MoKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGRvY0FueShUeXBlcyl7XHJcblxyXG5cdFx0XHR2YXIgY29udCA9IFR5cGVzLmxlbmd0aDtcclxuXHRcdFx0dmFyIHR5cGVfZG9jcyA9IFtdO1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgY29udDsgaSsrKXtcclxuXHRcdFx0XHR0eXBlX2RvY3MucHVzaChUeXBlc1tpXS5kb2MoKSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBEb2MuZ2VuRG9jLmJpbmQobnVsbCwgXCJhbnlcIiwge3R5cGVzOiB0eXBlX2RvY3N9KTtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgZGVmX3R5cGVzID0gRG9jLmdldENvbnN0KCdhcnInLCAndHlwZXMnKTtcclxuXHRcdGZ1bmN0aW9uIG5ld0FueShhcnIpe1xyXG5cdFx0XHRpZighQXJyYXkuaXNBcnJheShhcnIpIHx8IGFyZ3VtZW50cy5sZW5ndGggPiAxKSBhcnIgPSBhcmd1bWVudHM7XHJcblxyXG5cdFx0XHR2YXIgbGVuID0gYXJyLmxlbmd0aDtcclxuXHRcdFx0dmFyIGFycl90eXBlcyA9IFtdO1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspe1xyXG5cdFx0XHRcdGFycl90eXBlc1tpXSA9IHRDb25zdChhcnJbaV0pO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm57XHJcblx0XHRcdFx0dGVzdDogdGVzdEFueShhcnJfdHlwZXMpLFxyXG5cdFx0XHRcdHJhbmQ6IHJhbmRBbnkoYXJyX3R5cGVzKSxcclxuXHRcdFx0XHRkb2M6IGRvY0FueShhcnJfdHlwZXMpXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLmFueSA9IG5ldyBDcmVhdGVDcmVhdG9yKFxyXG5cdFx0XHRuZXdBbnksXHJcblx0XHRcdHRlc3RBbnkoZGVmX3R5cGVzKSxcclxuXHRcdFx0cmFuZEFueShkZWZfdHlwZXMpLFxyXG5cdFx0XHRkb2NBbnkoZGVmX3R5cGVzKVxyXG5cdFx0KTtcclxuXHJcblxyXG5cclxuXHQvL0NyYWZ0IEFycmF5XHJcblxyXG5cclxuXHJcblx0XHRmdW5jdGlvbiByYW5kQXJyYXkoVHlwZSwgc2l6ZSwgaXNfZml4ZWQpe1xyXG5cdFx0XHR2YXIgcmFuZFNpemUgPSBmdW5jdGlvbiAoKXtyZXR1cm4gc2l6ZX07XHJcblx0XHRcdGlmKCFpc19maXhlZCl7XHJcblx0XHRcdFx0cmFuZFNpemUgPSBULnBvcyhzaXplKS5yYW5kO1xyXG5cdFx0XHR9XHJcblxyXG5cclxuXHRcdFx0aWYoQXJyYXkuaXNBcnJheShUeXBlKSl7XHJcblx0XHRcdFx0dmFyIG5vd19zaXplID0gcmFuZFNpemUoKTtcclxuXHJcblx0XHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHR2YXIgYXJyID0gW107XHJcblxyXG5cdFx0XHRcdFx0Zm9yKHZhciBpID0gMCwgaiA9IDA7IGkgPCBub3dfc2l6ZTsgaSsrKXtcclxuXHJcblx0XHRcdFx0XHRcdGFyci5wdXNoKFR5cGVbal0ucmFuZCgpKTtcclxuXHJcblx0XHRcdFx0XHRcdGorKztcclxuXHRcdFx0XHRcdFx0aWYoaiA+PSBUeXBlLmxlbmd0aCl7XHJcblx0XHRcdFx0XHRcdFx0aiA9IDA7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHJldHVybiBhcnI7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cclxuXHJcblx0XHRcdHJldHVybiBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdHZhciBhcnIgPSBbXTtcclxuXHJcblx0XHRcdFx0dmFyIG5vd19zaXplID0gcmFuZFNpemUoKTtcclxuXHRcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbm93X3NpemU7IGkrKyl7XHJcblx0XHRcdFx0XHRhcnIucHVzaChUeXBlLnJhbmQoaSwgYXJyKSk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRyZXR1cm4gYXJyO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIHRlc3RBcnJheShUeXBlLCBzaXplLCBpc19maXhlZCl7XHJcblxyXG5cdFx0XHRpZihBcnJheS5pc0FycmF5KFR5cGUpKXtcclxuXHRcdFx0XHRyZXR1cm4gZnVuY3Rpb24oYXJyKXtcclxuXHJcblx0XHRcdFx0XHRpZighQXJyYXkuaXNBcnJheShhcnIpKXtcclxuXHRcdFx0XHRcdFx0dmFyIGVyciA9IHRoaXMuZG9jKCk7XHJcblx0XHRcdFx0XHRcdGVyci5wYXJhbXMgPSBcIlZhbHVlIGlzIG5vdCBhcnJheSFcIjtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIGVycjtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRpZigoYXJyLmxlbmd0aCA+IHNpemUpIHx8IChpc19maXhlZCAmJiAoYXJyLmxlbmd0aCAhPT0gc2l6ZSkpKXtcclxuXHRcdFx0XHRcdFx0dmFyIGVyciA9IHRoaXMuZG9jKCk7XHJcblx0XHRcdFx0XHRcdGVyci5wYXJhbXMgPSBcIkFycmF5IGxlbmdodCBpcyB3cm9uZyFcIjtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIGVycjtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRmb3IodmFyIGkgPSAwLCBqID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKyl7XHJcblxyXG5cdFx0XHRcdFx0XHRcdHZhciByZXMgPSBUeXBlW2pdLnRlc3QoYXJyW2ldKTtcclxuXHRcdFx0XHRcdFx0XHRpZihyZXMpe1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR2YXIgZXJyID0gdGhpcy5kb2MoKTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0ZXJyLnBhcmFtcyA9IHtpbmRleDogaSwgd3JvbmdfaXRlbTogcmVzfTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGVycjtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRcdGorKztcclxuXHRcdFx0XHRcdFx0XHRpZihqID49IFR5cGUubGVuZ3RoKXtcclxuXHRcdFx0XHRcdFx0XHRcdGogPSAwO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oYXJyKXtcclxuXHRcdFx0XHRpZighQXJyYXkuaXNBcnJheShhcnIpKXtcclxuXHRcdFx0XHRcdHZhciBlcnIgPSB0aGlzLmRvYygpO1xyXG5cdFx0XHRcdFx0ZXJyLnBhcmFtcyA9IFwiVmFsdWUgaXMgbm90IGFycmF5IVwiO1xyXG5cdFx0XHRcdFx0cmV0dXJuIGVycjtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlmKChhcnIubGVuZ3RoID4gc2l6ZSkgfHwgKGlzX2ZpeGVkICYmIChhcnIubGVuZ3RoICE9PSBzaXplKSkpe1xyXG5cdFx0XHRcdFx0Y29uc29sZS5sb2coYXJyLmxlbmd0aCwgc2l6ZSlcclxuXHRcdFx0XHRcdHZhciBlcnIgPSB0aGlzLmRvYygpO1xyXG5cdFx0XHRcdFx0ZXJyLnBhcmFtcyA9IFwiQXJyYXk6IGxlbmdodCBpcyB3cm9uZyFcIjtcclxuXHRcdFx0XHRcdHJldHVybiBlcnI7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHR2YXIgZXJyX2FyciA9IGFyci5maWx0ZXIoVHlwZS50ZXN0KTtcclxuXHRcdFx0XHRpZihlcnJfYXJyLmxlbmd0aCAhPSAwKXtcclxuXHRcdFx0XHRcdHZhciBlcnIgPSB0aGlzLmRvYygpO1xyXG5cdFx0XHRcdFx0ZXJyLnBhcmFtcyA9IGVycl9hcnI7XHJcblx0XHRcdFx0XHRyZXR1cm4gZXJyO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gZG9jQXJyYXkoVHlwZSwgc2l6ZSwgaXNfZml4ZWQpe1xyXG5cdFx0XHR2YXIgdHlwZV9kb2NzID0gW107XHJcblx0XHRcdGlmKEFycmF5LmlzQXJyYXkoVHlwZSkpe1xyXG5cdFx0XHRcdHZhciBjb250ID0gVHlwZS5sZW5ndGg7XHJcblx0XHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGNvbnQ7IGkrKyl7XHJcblx0XHRcdFx0XHR0eXBlX2RvY3MucHVzaChUeXBlW2ldLmRvYygpKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdHR5cGVfZG9jcyA9IFR5cGUuZG9jKCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBEb2MuZ2VuRG9jLmJpbmQobnVsbCwgXCJhcnJcIiwge3R5cGVzOiB0eXBlX2RvY3MsIHNpemU6IHNpemUsIGZpeGVkOiBpc19maXhlZH0pO1xyXG5cclxuXHRcdH1cclxuXHJcblxyXG5cdFx0dmFyIGRlZl9UeXBlID0gRG9jLmdldENvbnN0KCdhcnInLCAndHlwZXMnKTtcclxuXHRcdHZhciBkZWZfU2l6ZSA9IERvYy5nZXRDb25zdCgnYXJyJywgJ3NpemUnKTtcclxuXHRcdHZhciBkZWZfZml4ZWQgPSBEb2MuZ2V0Q29uc3QoJ2FycicsICdmaXhlZCcpO1xyXG5cclxuXHRcdGZ1bmN0aW9uIG5ld0FycmF5KFR5cGUsIHNpemUsIGlzX2ZpeGVkKXtcclxuXHRcdFx0aWYoVHlwZSA9PT0gbnVsbCkgVHlwZSA9IGRlZl9UeXBlO1xyXG5cdFx0XHRpZihpc19maXhlZCA9PT0gdW5kZWZpbmVkKSBpc19maXhlZCA9IGRlZl9maXhlZDtcclxuXHJcblx0XHRcdGlmKEFycmF5LmlzQXJyYXkoVHlwZSkpe1xyXG5cdFx0XHRcdGlmKHNpemUgPT09IHVuZGVmaW5lZHx8c2l6ZSA9PT0gbnVsbCkgc2l6ZSA9IFR5cGUubGVuZ3RoO1xyXG5cclxuXHRcdFx0XHRUeXBlID0gVHlwZS5tYXAoZnVuY3Rpb24oaXRlbSl7cmV0dXJuIHRDb25zdChpdGVtKTt9KTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0aWYoc2l6ZSA9PT0gdW5kZWZpbmVkfHxzaXplID09PSBudWxsKSBzaXplID0gMTtcclxuXHRcdFx0XHRUeXBlID0gdENvbnN0KFR5cGUpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZihULnBvcy50ZXN0KHNpemUpKXtcclxuXHRcdFx0XHRcdHRocm93IGFyZ1R5cGVFcnJvcihhcmd1bWVudHMsICdXYWl0IGFyZ3VtZW50czogJyArIEpTT04uc3RyaW5naWZ5KFQucG9zLnRlc3Qoc2l6ZSkpKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHR0ZXN0OiB0ZXN0QXJyYXkoVHlwZSwgc2l6ZSwgaXNfZml4ZWQpLFxyXG5cdFx0XHRcdHJhbmQ6IHJhbmRBcnJheShUeXBlLCBzaXplLCBpc19maXhlZCksXHJcblx0XHRcdFx0ZG9jOiBkb2NBcnJheShUeXBlLCBzaXplLCBpc19maXhlZClcclxuXHRcdFx0fTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLmFyciA9IG5ldyBDcmVhdGVDcmVhdG9yKFxyXG5cdFx0XHRuZXdBcnJheSxcclxuXHRcdFx0dGVzdEFycmF5KGRlZl9UeXBlLCBkZWZfU2l6ZSwgZGVmX2ZpeGVkKSxcclxuXHRcdFx0cmFuZEFycmF5KGRlZl9UeXBlLCBkZWZfU2l6ZSwgZGVmX2ZpeGVkKSxcclxuXHRcdFx0ZG9jQXJyYXkoZGVmX1R5cGUsIGRlZl9TaXplLCBkZWZfZml4ZWQpXHJcblx0XHQpO1xyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHQvL0NyYWZ0IE9iamVjdFxyXG5cclxuXHRcdGZ1bmN0aW9uIHJhbmRPYmooZnVuY09iail7XHJcblx0XHRcdHJldHVybiBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdHZhciBvYmogPSB7fTtcclxuXHRcdFx0XHRmb3IodmFyIGtleSBpbiBmdW5jT2JqKXtcclxuXHRcdFx0XHRcdG9ialtrZXldID0gZnVuY09ialtrZXldLnJhbmQoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0cmV0dXJuIG9iajtcclxuXHRcdFx0fTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiB0ZXN0T2JqKGZ1bmNPYmope1xyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24ob2JqKXtcclxuXHJcblx0XHRcdFx0aWYodHlwZW9mIG9iaiAhPT0gXCJvYmplY3RcIiAmJiBvYmogPT09IG51bGwpe1xyXG5cdFx0XHRcdFx0dmFyIGVyciA9IHRoaXMuZG9jKCk7XHJcblx0XHRcdFx0XHRlcnIucGFyYW1zID0gXCJWYWx1ZSBpcyBub3Qgb2JqZWN0IVwiO1xyXG5cdFx0XHRcdFx0cmV0dXJuIGVycjtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGZvcih2YXIga2V5IGluIGZ1bmNPYmope1xyXG5cdFx0XHRcdFx0dmFyIHJlcyA9IGZ1bmNPYmpba2V5XS50ZXN0KG9ialtrZXldKTtcclxuXHRcdFx0XHRcdGlmKHJlcyl7XHJcblx0XHRcdFx0XHRcdHZhciBlcnIgPSB0aGlzLmRvYygpO1xyXG5cdFx0XHRcdFx0XHRlcnIucGFyYW1zID0ge307XHJcblx0XHRcdFx0XHRcdGVyci5wYXJhbXNba2V5XSA9IHJlcztcclxuXHRcdFx0XHRcdFx0cmV0dXJuIGVycjtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBkb2NPYihmdW5jT2JqKXtcclxuXHRcdFx0dmFyIGRvY19vYmogPSB7fTtcclxuXHJcblx0XHRcdGZvcih2YXIga2V5IGluIGZ1bmNPYmope1xyXG5cdFx0XHRcdFx0ZG9jX29ialtrZXldID0gZnVuY09ialtrZXldLmRvYygpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gRG9jLmdlbkRvYy5iaW5kKG51bGwsIFwib2JqXCIsIHt0eXBlczogZG9jX29ian0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIE5ld09iaih0ZW1wT2JqKXtcclxuXHRcdFx0aWYodHlwZW9mIHRlbXBPYmogIT09ICdvYmplY3QnKSB0aHJvdyBhcmdUeXBlRXJyb3IoYXJndW1lbnRzLCAnV2FpdCBhcmd1bWVudHM6IHRlbXBPYmooT2JqZWN0KScpO1xyXG5cclxuXHRcdFx0dmFyIGJlZ09iaiA9IHt9O1xyXG5cdFx0XHR2YXIgZnVuY09iaiA9IHt9O1xyXG5cdFx0XHRmb3IodmFyIGtleSBpbiB0ZW1wT2JqKXtcclxuXHRcdFx0XHRmdW5jT2JqW2tleV0gPSB0Q29uc3QodGVtcE9ialtrZXldKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJue1xyXG5cdFx0XHRcdHRlc3Q6IHRlc3RPYmooZnVuY09iaiksXHJcblx0XHRcdFx0cmFuZDogcmFuZE9iaihmdW5jT2JqKSxcclxuXHRcdFx0XHRkb2M6IGRvY09iKGZ1bmNPYmopXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHRoaXMub2JqID0gbmV3IENyZWF0ZUNyZWF0b3IoTmV3T2JqLFxyXG5cdFx0XHRmdW5jdGlvbihvYmope3JldHVybiB0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwifSxcclxuXHRcdFx0cmFuZE9iaih7fSksXHJcblx0XHRcdERvYy5nZW5Eb2MuYmluZChudWxsLCBcIm9ialwiKVxyXG5cdFx0KTtcclxuXHJcblxyXG5cclxuXHJcblxyXG4vL0NyYWZ0IFR5cGUgb3V0IHRvICBEb2N1bWVudFxyXG5cclxuXHRULm5hbWVzID0ge307XHJcblx0Zm9yKHZhciBrZXkgaW4gRG9jLnR5cGVzKXtcclxuXHRcdFQubmFtZXNbRG9jLnR5cGVzW2tleV0ubmFtZV0gPSBrZXk7XHJcblx0fVxyXG5cclxuXHR0aGlzLm91dERvYyA9IGZ1bmN0aW9uKHRtcCl7XHJcblx0XHRpZigodHlwZW9mIHRtcCA9PT0gXCJmdW5jdGlvblwiKSAmJiB0bXAuaXNfY3JlYXRvcikgcmV0dXJuIHRtcDtcclxuXHJcblx0XHRpZighKCduYW1lJyBpbiB0bXApKXtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCk7XHJcblx0XHR9XHJcblx0XHR2YXIgdHlwZSA9IHRtcC5uYW1lO1xyXG5cclxuXHRcdGlmKCdwYXJhbXMnIGluIHRtcCl7XHJcblx0XHRcdHZhciBwYXJhbXMgPSB0bXAucGFyYW1zO1xyXG5cdFx0XHRzd2l0Y2goVC5uYW1lc1t0eXBlXSl7XHJcblx0XHRcdFx0Y2FzZSAnb2JqJzoge1xyXG5cdFx0XHRcdFx0dmFyIG5ld19vYmogPSB7fTtcclxuXHRcdFx0XHRcdGZvcih2YXIga2V5IGluIHBhcmFtcy50eXBlcyl7XHJcblx0XHRcdFx0XHRcdG5ld19vYmpba2V5XSA9IFQub3V0RG9jKHBhcmFtcy50eXBlc1trZXldKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHBhcmFtcy50eXBlcyA9IG5ld19vYmo7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Y2FzZSAnYW55JzpcclxuXHRcdFx0XHRjYXNlICdhcnInOiB7XHJcblx0XHRcdFx0XHRpZihBcnJheS5pc0FycmF5KHBhcmFtcy50eXBlcykpe1xyXG5cdFx0XHRcdFx0XHRwYXJhbXMudHlwZXMgPSBwYXJhbXMudHlwZXMubWFwKFQub3V0RG9jLmJpbmQoVCkpO1xyXG5cdFx0XHRcdFx0fWVsc2UgcGFyYW1zLnR5cGVzID0gVC5vdXREb2MocGFyYW1zLnR5cGVzKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIGdldFNpbXBsZVR5cGUoVC5uYW1lc1t0eXBlXSwgcGFyYW1zKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBnZXRTaW1wbGVUeXBlKFQubmFtZXNbdHlwZV0sIHt9KTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGdldFNpbXBsZVR5cGUobmFtZSwgcGFyYW1zKXtcclxuXHRcdHZhciBhcmcgPSBbXTtcclxuXHRcdERvYy50eXBlc1tuYW1lXS5hcmcuZm9yRWFjaChmdW5jdGlvbihrZXksIGkpe2FyZ1tpXSA9IHBhcmFtc1trZXldO30pO1xyXG5cdFx0cmV0dXJuIFRbbmFtZV0uYXBwbHkoVCwgYXJnKTtcclxuXHR9O1xyXG5cclxuLy9TdXBwb3J0IERlY2xhcmF0ZSBGdW5jdGlvblxyXG5cclxuXHRmdW5jdGlvbiBmaW5kZVBhcnNlKHN0ciwgYmVnLCBlbmQpe1xyXG5cdFx0dmFyIHBvaW50X2JlZyA9IHN0ci5pbmRleE9mKGJlZyk7XHJcblx0XHRpZih+cG9pbnRfYmVnKXtcclxuXHJcblx0XHRcdHZhciBwb2ludF9lbmQgPSBwb2ludF9iZWc7XHJcblx0XHRcdHZhciBwb2ludF90ZW1wID0gcG9pbnRfYmVnO1xyXG5cdFx0XHR2YXIgbGV2ZWwgPSAxO1xyXG5cdFx0XHR2YXIgYnJlYWtXaGlsZSA9IGZhbHNlO1xyXG5cdFx0XHR3aGlsZSghYnJlYWtXaGlsZSl7XHJcblx0XHRcdFx0YnJlYWtXaGlsZSA9IHRydWU7XHJcblxyXG5cdFx0XHRcdGlmKH5wb2ludF90ZW1wKSBwb2ludF90ZW1wID0gc3RyLmluZGV4T2YoYmVnLCBwb2ludF90ZW1wICsgMSk7XHJcblx0XHRcdFx0aWYofnBvaW50X2VuZCkgcG9pbnRfZW5kID0gc3RyLmluZGV4T2YoZW5kLCBwb2ludF9lbmQgKyAxKTtcclxuXHJcblx0XHRcdFx0aWYocG9pbnRfdGVtcCA8IHBvaW50X2VuZCl7XHJcblxyXG5cdFx0XHRcdFx0aWYocG9pbnRfdGVtcCA+IDApe1xyXG5cdFx0XHRcdFx0XHRicmVha1doaWxlID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdGlmKHN0cltwb2ludF90ZW1wIC0gMV0gIT09ICdcXFxcJykgbGV2ZWwgPSBsZXZlbCsxO1xyXG5cclxuXHRcdFx0XHRcdH1cclxuXHJcblxyXG5cdFx0XHRcdFx0aWYocG9pbnRfZW5kID4gMCl7XHJcblx0XHRcdFx0XHRcdGJyZWFrV2hpbGUgPSBmYWxzZTtcclxuXHRcdFx0XHRcdFx0aWYoc3RyW3BvaW50X2VuZCAtIDFdICE9PSAnXFxcXCcpIGxldmVsID0gbGV2ZWwtMTtcclxuXHRcdFx0XHRcdFx0aWYobGV2ZWwgPT0gMCl7XHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuIFtwb2ludF9iZWcsIHBvaW50X2VuZF07XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdGlmKHBvaW50X2VuZCA+IDApe1xyXG5cdFx0XHRcdFx0XHRicmVha1doaWxlID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdGlmKHN0cltwb2ludF9lbmQgLSAxXSAhPT0gJ1xcXFwnKSBsZXZlbCA9IGxldmVsLTE7XHJcblx0XHRcdFx0XHRcdGlmKGxldmVsID09IDApe1xyXG5cdFx0XHRcdFx0XHRcdHJldHVybiBbcG9pbnRfYmVnLCBwb2ludF9lbmRdO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0aWYocG9pbnRfdGVtcCA+IDApe1xyXG5cdFx0XHRcdFx0XHRicmVha1doaWxlID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdGlmKHN0cltwb2ludF90ZW1wIC0gMV0gIT09ICdcXFxcJykgbGV2ZWwgPSBsZXZlbCsxO1xyXG5cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblxyXG5cdE9iamVjdC50eXBlcyA9IFQ7XHJcbn0pKCk7XHJcbiIsIm1vZHVsZS5leHBvcnRzPXtcbiBcInRpbGVzXCI6IFtcbiAge1xuICAgXCJ0eXBlXCI6IFwiY29sb3JcIixcbiAgIFwiY29sb3JcIjoge1xuICAgIFwiclwiOiAxNzYsXG4gICAgXCJnXCI6IDcwLFxuICAgIFwiYlwiOiA3MCxcbiAgICBcImFcIjogMVxuICAgfSxcbiAgIFwiaWRcIjogMCxcbiAgIFwid2lkdGhcIjogMyxcbiAgIFwiaGVpZ2h0XCI6IDVcbiAgfSxcbiAge1xuICAgXCJ0eXBlXCI6IFwic3ZnXCIsXG4gICBcImltZ1wiOiBcIjw/eG1sIHZlcnNpb249XFxcIjEuMFxcXCIgZW5jb2Rpbmc9XFxcIlVURi04XFxcIiBzdGFuZGFsb25lPVxcXCJub1xcXCI/PlxcbjxzdmdcXG4gICB4bWxuczpkYz1cXFwiaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS9cXFwiXFxuICAgeG1sbnM6Y2M9XFxcImh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL25zI1xcXCJcXG4gICB4bWxuczpyZGY9XFxcImh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyNcXFwiXFxuICAgeG1sbnM6c3ZnPVxcXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1xcXCJcXG4gICB4bWxucz1cXFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcXFwiXFxuICAgaWQ9XFxcInN2ZzEzMzQ0XFxcIlxcbiAgIHZlcnNpb249XFxcIjEuMVxcXCJcXG4gICB2aWV3Qm94PVxcXCIwIDAgMjEwIDIxMFxcXCJcXG4gICBoZWlnaHQ9XFxcIjIxMG1tXFxcIlxcbiAgIHdpZHRoPVxcXCIyMTBtbVxcXCI+XFxuICA8ZGVmc1xcbiAgICAgaWQ9XFxcImRlZnMxMzMzOFxcXCIgLz5cXG4gIDxtZXRhZGF0YVxcbiAgICAgaWQ9XFxcIm1ldGFkYXRhMTMzNDFcXFwiPlxcbiAgICA8cmRmOlJERj5cXG4gICAgICA8Y2M6V29ya1xcbiAgICAgICAgIHJkZjphYm91dD1cXFwiXFxcIj5cXG4gICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PlxcbiAgICAgICAgPGRjOnR5cGVcXG4gICAgICAgICAgIHJkZjpyZXNvdXJjZT1cXFwiaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2VcXFwiIC8+XFxuICAgICAgICA8ZGM6dGl0bGU+PC9kYzp0aXRsZT5cXG4gICAgICA8L2NjOldvcms+XFxuICAgIDwvcmRmOlJERj5cXG4gIDwvbWV0YWRhdGE+XFxuICA8Z1xcbiAgICAgdHJhbnNmb3JtPVxcXCJ0cmFuc2xhdGUoMCwtODcpXFxcIlxcbiAgICAgaWQ9XFxcImxheWVyMVxcXCI+XFxuICAgIDxwYXRoXFxuICAgICAgIGlkPVxcXCJwYXRoNzc2M1xcXCJcXG4gICAgICAgc3R5bGU9XFxcImZpbGw6I2ZmZmZmZjtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6IzFiMTkxODtzdHJva2Utd2lkdGg6MC4yNDk3NjMwMztzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtZGFzaGFycmF5Om5vbmVcXFwiXFxuICAgICAgIGQ9XFxcIk0gLTAuMjA1NDczOTksODcuMzk1NjczIFYgMjk3LjIwNTUxIEggMjA5LjYwNDI5IFYgODcuMzk1NjczIFpcXFwiIC8+XFxuICAgIDxnXFxuICAgICAgIHRyYW5zZm9ybT1cXFwibWF0cml4KC0wLjQ0MDU3Njg3LDAsMCwwLjQ0MDU3Njc3LC0xOTI5Mi4zMDIsMzEwMy41NylcXFwiXFxuICAgICAgIGlkPVxcXCJMYXllcjExODlcXFwiPlxcbiAgICAgIDxwYXRoXFxuICAgICAgICAgaWQ9XFxcInBhdGg3ODIzXFxcIlxcbiAgICAgICAgIHN0eWxlPVxcXCJmaWxsOiMwMDAwMDA7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOiMxYjE5MTg7c3Ryb2tlLXdpZHRoOjAuNTY2OTAwMDE7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLWRhc2hhcnJheTpub25lXFxcIlxcbiAgICAgICAgIGQ9XFxcIm0gLTQzODg1LjY0OCwtNjc4OC44MjQ3IGMgOS43MjYsNTQuMTI0MyAtOC4xMzYsNDIuNzgyMiAtNTAuNTQsODEuMTAwMSBsIDE4LjgxOSwtNy43Nzk4IDI2Ljc2MiwtMTEuMDYzMiBjIC0xNS42NzMsNDMuMTM0NSA0LjkwNyw2MC4wMDQ4IC0yOS41NjcsOTAuNDQ1NSAtNTcuMzY5LDM1Ljg0ODkgLTEyNC40MTYsLTExLjc5ODggLTk4Ljk0NiwtODEuNTA4IDU2LjAxNSwtNzYuNzA5NSAzNy44MjksLTYxLjI4ODIgMTMzLjQ3MiwtNzEuMTk0NiB6XFxcIiAvPlxcbiAgICAgIDxwYXRoXFxuICAgICAgICAgaWQ9XFxcInBhdGg3ODI1XFxcIlxcbiAgICAgICAgIHN0eWxlPVxcXCJmaWxsOiMwMDAwMDA7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOiMxYjE5MTg7c3Ryb2tlLXdpZHRoOjAuNTY2OTAwMDE7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLWRhc2hhcnJheTpub25lXFxcIlxcbiAgICAgICAgIGQ9XFxcIm0gLTQ0MDY1LjMxLC02NjU4LjAwMDcgMTAzLjM1NSw3NS40NzEzIGMgLTI1LjA1MywyMy4yODE2IC0xNTcuMDUsMTY0LjAwNSAtMTg1Ljc4OCwxNDguMTczMyAtMjcuMDcyLC0xNC45MTQ3IDcwLjE0MiwtMTk3LjAwNDQgODIuNDMzLC0yMjMuNjQ0NiB6XFxcIiAvPlxcbiAgICA8L2c+XFxuICA8L2c+XFxuPC9zdmc+XFxuXCIsXG4gICBcImlkXCI6IDEsXG4gICBcIndpZHRoXCI6IDMsXG4gICBcImhlaWdodFwiOiAzXG4gIH0sXG4gIHtcbiAgIFwidHlwZVwiOiBcInBoaXNpY1wiLFxuICAgXCJkdXJhYmlsaXR5XCI6IFwid29vZFwiLFxuICAgXCJpbWdcIjogXCI8P3htbCB2ZXJzaW9uPVxcXCIxLjBcXFwiIGVuY29kaW5nPVxcXCJVVEYtOFxcXCIgc3RhbmRhbG9uZT1cXFwibm9cXFwiPz5cXG48c3ZnXFxuICAgeG1sbnM6ZGM9XFxcImh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvXFxcIlxcbiAgIHhtbG5zOmNjPVxcXCJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyNcXFwiXFxuICAgeG1sbnM6cmRmPVxcXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjXFxcIlxcbiAgIHhtbG5zOnN2Zz1cXFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcXFwiXFxuICAgeG1sbnM9XFxcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXFxcIlxcbiAgIGlkPVxcXCJzdmcxMzM0NFxcXCJcXG4gICB2ZXJzaW9uPVxcXCIxLjFcXFwiXFxuICAgdmlld0JveD1cXFwiMCAwIDIxMCAyMTBcXFwiXFxuICAgaGVpZ2h0PVxcXCIyMTBtbVxcXCJcXG4gICB3aWR0aD1cXFwiMjEwbW1cXFwiPlxcbiAgPGRlZnNcXG4gICAgIGlkPVxcXCJkZWZzMTMzMzhcXFwiIC8+XFxuICA8bWV0YWRhdGFcXG4gICAgIGlkPVxcXCJtZXRhZGF0YTEzMzQxXFxcIj5cXG4gICAgPHJkZjpSREY+XFxuICAgICAgPGNjOldvcmtcXG4gICAgICAgICByZGY6YWJvdXQ9XFxcIlxcXCI+XFxuICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3N2Zyt4bWw8L2RjOmZvcm1hdD5cXG4gICAgICAgIDxkYzp0eXBlXFxuICAgICAgICAgICByZGY6cmVzb3VyY2U9XFxcImh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlXFxcIiAvPlxcbiAgICAgICAgPGRjOnRpdGxlPjwvZGM6dGl0bGU+XFxuICAgICAgPC9jYzpXb3JrPlxcbiAgICA8L3JkZjpSREY+XFxuICA8L21ldGFkYXRhPlxcbiAgPGdcXG4gICAgIHRyYW5zZm9ybT1cXFwidHJhbnNsYXRlKDAsLTg3KVxcXCJcXG4gICAgIGlkPVxcXCJsYXllcjFcXFwiPlxcbiAgICA8cGF0aFxcbiAgICAgICBpZD1cXFwicGF0aDc3NjNcXFwiXFxuICAgICAgIHN0eWxlPVxcXCJmaWxsOiNmZmZmZmY7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOiMxYjE5MTg7c3Ryb2tlLXdpZHRoOjAuMjQ5NzYzMDM7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLWRhc2hhcnJheTpub25lXFxcIlxcbiAgICAgICBkPVxcXCJNIC0wLjIwNTQ3Mzk5LDg3LjM5NTY3MyBWIDI5Ny4yMDU1MSBIIDIwOS42MDQyOSBWIDg3LjM5NTY3MyBaXFxcIiAvPlxcbiAgICA8Z1xcbiAgICAgICBpZD1cXFwiTGF5ZXIxMTIzXFxcIlxcbiAgICAgICB0cmFuc2Zvcm09XFxcIm1hdHJpeCgwLjE4MDY4MjAzLDAsMCwwLjE4MTU2OTE0LDk1OS45NTIxNSwtOTcxLjkyNDQ2KVxcXCI+XFxuICAgICAgPGdcXG4gICAgICAgICBpZD1cXFwiTGF5ZXIxMTI0XFxcIj5cXG4gICAgICAgIDxwYXRoXFxuICAgICAgICAgICBpZD1cXFwicGF0aDY1NDdcXFwiXFxuICAgICAgICAgICBzdHlsZT1cXFwiZmlsbDojN2Q4ZWE1O2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTojMmMyYTI5O3N0cm9rZS13aWR0aDoyMi42NzcyMDAzMjtzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtZGFzaGFycmF5Om5vbmVcXFwiXFxuICAgICAgICAgICBkPVxcXCJtIC01MjgzLjMzMDYsNjc5MC4yNTEzIHYgMTQyLjUxMDMgcSAwLDQ1Ljk3MTcgNDUuOTcxNiw0NS45NzE3IGggOTk4LjY3NDggcSA0NS45NzE2LDAgNDUuOTcxNiwtNDUuOTcxNyB2IC0xNDIuNTEwMyBxIDAsLTQ1Ljk3MTYgLTQ1Ljk3MTYsLTQ1Ljk3MTYgaCAtOTk4LjY3NDggcSAtNDUuOTcxNiwwIC00NS45NzE2LDQ1Ljk3MTYgelxcXCIgLz5cXG4gICAgICAgIDxwYXRoXFxuICAgICAgICAgICBpZD1cXFwicGF0aDY1NDlcXFwiXFxuICAgICAgICAgICBzdHlsZT1cXFwiZmlsbDojNDk0ODQ4O2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTojMmMyYTI5O3N0cm9rZS13aWR0aDoyMi42NzcyMDAzMjtzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtZGFzaGFycmF5Om5vbmVcXFwiXFxuICAgICAgICAgICBkPVxcXCJtIC01MjQ4LjQ5OCw2NzU3Ljk3ODIgdiAyMDcuMDgyNiBxIDAsMTIuODI0NSAxMi44MjQ1LDEyLjgyNDUgaCAyLjgzNjMgcSAxMi44MjQ1LDAgMTIuODI0NSwtMTIuODI0NSB2IC0yMDcuMDgyNiBxIDAsLTEyLjgyNDUgLTEyLjgyNDUsLTEyLjgyNDUgaCAtMi44MzYzIHEgLTEyLjgyNDUsMCAtMTIuODI0NSwxMi44MjQ1IHpcXFwiIC8+XFxuICAgICAgICA8cGF0aFxcbiAgICAgICAgICAgaWQ9XFxcInBhdGg2NTUxXFxcIlxcbiAgICAgICAgICAgc3R5bGU9XFxcImZpbGw6IzQ5NDg0ODtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6IzJjMmEyOTtzdHJva2Utd2lkdGg6MjIuNjc3MjAwMzI7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLWRhc2hhcnJheTpub25lXFxcIlxcbiAgICAgICAgICAgZD1cXFwibSAtNTEzOS4zNjY5LDY3NDUuMTUzNyB2IDIzMi43MzE2IGggMjguNDg1MyB2IC0yMzIuNzMxNiB6XFxcIiAvPlxcbiAgICAgICAgPHBhdGhcXG4gICAgICAgICAgIGlkPVxcXCJwYXRoNjU1M1xcXCJcXG4gICAgICAgICAgIHN0eWxlPVxcXCJmaWxsOiM0OTQ4NDg7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOiMyYzJhMjk7c3Ryb2tlLXdpZHRoOjIyLjY3NzIwMDMyO3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1kYXNoYXJyYXk6bm9uZVxcXCJcXG4gICAgICAgICAgIGQ9XFxcIm0gLTUwMjkuNDY0MSw2NzQ1LjE1MzcgdiAyMzIuNzMxNiBoIDI4LjQ4NTMgdiAtMjMyLjczMTYgelxcXCIgLz5cXG4gICAgICAgIDxwYXRoXFxuICAgICAgICAgICBpZD1cXFwicGF0aDY1NTVcXFwiXFxuICAgICAgICAgICBzdHlsZT1cXFwiZmlsbDojNDk0ODQ4O2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTojMmMyYTI5O3N0cm9rZS13aWR0aDoyMi42NzcyMDAzMjtzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtZGFzaGFycmF5Om5vbmVcXFwiXFxuICAgICAgICAgICBkPVxcXCJtIC00OTE4LjE4OTQsNjc0NS4xNTM3IHYgMjMyLjczMTYgaCAyOC40ODUzIHYgLTIzMi43MzE2IHpcXFwiIC8+XFxuICAgICAgICA8cGF0aFxcbiAgICAgICAgICAgaWQ9XFxcInBhdGg2NTU3XFxcIlxcbiAgICAgICAgICAgc3R5bGU9XFxcImZpbGw6IzQ5NDg0ODtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6IzJjMmEyOTtzdHJva2Utd2lkdGg6MjIuNjc3MjAwMzI7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLWRhc2hhcnJheTpub25lXFxcIlxcbiAgICAgICAgICAgZD1cXFwibSAtNDgwOS4wNTgzLDY3NDUuMTUzNyB2IDIzMi43MzE2IGggMjguNDg1MiB2IC0yMzIuNzMxNiB6XFxcIiAvPlxcbiAgICAgICAgPHBhdGhcXG4gICAgICAgICAgIGlkPVxcXCJwYXRoNjU1OVxcXCJcXG4gICAgICAgICAgIHN0eWxlPVxcXCJmaWxsOiM0OTQ4NDg7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOiMyYzJhMjk7c3Ryb2tlLXdpZHRoOjIyLjY3NzIwMDMyO3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1kYXNoYXJyYXk6bm9uZVxcXCJcXG4gICAgICAgICAgIGQ9XFxcIm0gLTQ2OTkuMTU1NSw2NzQ1LjE1MzcgdiAyMzIuNzMxNiBoIDI4LjQ4NTMgdiAtMjMyLjczMTYgelxcXCIgLz5cXG4gICAgICAgIDxwYXRoXFxuICAgICAgICAgICBpZD1cXFwicGF0aDY1NjFcXFwiXFxuICAgICAgICAgICBzdHlsZT1cXFwiZmlsbDojNDk0ODQ4O2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTojMmMyYTI5O3N0cm9rZS13aWR0aDoyMi42NzcyMDAzMjtzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtZGFzaGFycmF5Om5vbmVcXFwiXFxuICAgICAgICAgICBkPVxcXCJtIC00NTg2LjA3OTIsNjc0NS4xNTM3IHYgMjMyLjczMTYgaCAyOC40ODUzIHYgLTIzMi43MzE2IHpcXFwiIC8+XFxuICAgICAgICA8cGF0aFxcbiAgICAgICAgICAgaWQ9XFxcInBhdGg2NTYzXFxcIlxcbiAgICAgICAgICAgc3R5bGU9XFxcImZpbGw6IzQ5NDg0ODtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6IzJjMmEyOTtzdHJva2Utd2lkdGg6MjIuNjc3MjAwMzI7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLWRhc2hhcnJheTpub25lXFxcIlxcbiAgICAgICAgICAgZD1cXFwibSAtNDQ3Ni45NDgxLDY3NDUuMTUzNyB2IDIzMi43MzE2IGggMjguNDg1MyB2IC0yMzIuNzMxNiB6XFxcIiAvPlxcbiAgICAgICAgPHBhdGhcXG4gICAgICAgICAgIGlkPVxcXCJwYXRoNjU2NVxcXCJcXG4gICAgICAgICAgIHN0eWxlPVxcXCJmaWxsOiM0OTQ4NDg7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOiMyYzJhMjk7c3Ryb2tlLXdpZHRoOjIyLjY3NzIwMDMyO3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1kYXNoYXJyYXk6bm9uZVxcXCJcXG4gICAgICAgICAgIGQ9XFxcIm0gLTQzNjcuMDQ1Miw2NzQ1LjE1MzcgdiAyMzIuNzMxNiBoIDI4LjQ4NTIgdiAtMjMyLjczMTYgelxcXCIgLz5cXG4gICAgICAgIDxwYXRoXFxuICAgICAgICAgICBpZD1cXFwicGF0aDY1NjdcXFwiXFxuICAgICAgICAgICBzdHlsZT1cXFwiZmlsbDojNDk0ODQ4O2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTojMmMyYTI5O3N0cm9rZS13aWR0aDoyMi42NzcyMDAzMjtzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtZGFzaGFycmF5Om5vbmVcXFwiXFxuICAgICAgICAgICBkPVxcXCJtIC00MjU1LjM0MjIsNjc1Ni45NzUyIHYgMjA5LjA4ODYgcSAwLDExLjgyMTUgMTEuODIxNSwxMS44MjE1IGggNC44NDI0IHEgMTEuODIxNCwwIDExLjgyMTQsLTExLjgyMTUgdiAtMjA5LjA4ODYgcSAwLC0xMS44MjE1IC0xMS44MjE0LC0xMS44MjE1IGggLTQuODQyNCBxIC0xMS44MjE1LDAgLTExLjgyMTUsMTEuODIxNSB6XFxcIiAvPlxcbiAgICAgIDwvZz5cXG4gICAgICA8Z1xcbiAgICAgICAgIGlkPVxcXCJMYXllcjExMjVcXFwiPlxcbiAgICAgICAgPHBhdGhcXG4gICAgICAgICAgIGlkPVxcXCJwYXRoNjU3MFxcXCJcXG4gICAgICAgICAgIHN0eWxlPVxcXCJmaWxsOiM3ZDhlYTU7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOiMyYzJhMjk7c3Ryb2tlLXdpZHRoOjIyLjY3NzIwMDMyO3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1kYXNoYXJyYXk6bm9uZVxcXCJcXG4gICAgICAgICAgIGQ9XFxcIm0gLTUyODMuMzMwNiw1ODkwLjg0NjYgdiAxNDIuNTEwMyBxIDAsNDUuOTcxNiA0NS45NzE2LDQ1Ljk3MTYgaCA5OTguNjc0OCBxIDQ1Ljk3MTYsMCA0NS45NzE2LC00NS45NzE2IHYgLTE0Mi41MTAzIHEgMCwtNDUuOTcxNyAtNDUuOTcxNiwtNDUuOTcxNyBoIC05OTguNjc0OCBxIC00NS45NzE2LDAgLTQ1Ljk3MTYsNDUuOTcxNyB6XFxcIiAvPlxcbiAgICAgICAgPHBhdGhcXG4gICAgICAgICAgIGlkPVxcXCJwYXRoNjU3MlxcXCJcXG4gICAgICAgICAgIHN0eWxlPVxcXCJmaWxsOiM0OTQ4NDg7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOiMyYzJhMjk7c3Ryb2tlLXdpZHRoOjIyLjY3NzIwMDMyO3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1kYXNoYXJyYXk6bm9uZVxcXCJcXG4gICAgICAgICAgIGQ9XFxcIm0gLTUyNDguNDk4LDU4NTguNTczNCB2IDIwNy4wODI3IHEgMCwxMi44MjQ0IDEyLjgyNDUsMTIuODI0NCBoIDIuODM2MyBxIDEyLjgyNDUsMCAxMi44MjQ1LC0xMi44MjQ0IHYgLTIwNy4wODI3IHEgMCwtMTIuODI0NCAtMTIuODI0NSwtMTIuODI0NCBoIC0yLjgzNjMgcSAtMTIuODI0NSwwIC0xMi44MjQ1LDEyLjgyNDQgelxcXCIgLz5cXG4gICAgICAgIDxwYXRoXFxuICAgICAgICAgICBpZD1cXFwicGF0aDY1NzRcXFwiXFxuICAgICAgICAgICBzdHlsZT1cXFwiZmlsbDojNDk0ODQ4O2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTojMmMyYTI5O3N0cm9rZS13aWR0aDoyMi42NzcyMDAzMjtzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtZGFzaGFycmF5Om5vbmVcXFwiXFxuICAgICAgICAgICBkPVxcXCJtIC01MTM5LjM2NjksNTg0NS43NDkgdiAyMzIuNzMxNSBoIDI4LjQ4NTMgViA1ODQ1Ljc0OSBaXFxcIiAvPlxcbiAgICAgICAgPHBhdGhcXG4gICAgICAgICAgIGlkPVxcXCJwYXRoNjU3NlxcXCJcXG4gICAgICAgICAgIHN0eWxlPVxcXCJmaWxsOiM0OTQ4NDg7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOiMyYzJhMjk7c3Ryb2tlLXdpZHRoOjIyLjY3NzIwMDMyO3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1kYXNoYXJyYXk6bm9uZVxcXCJcXG4gICAgICAgICAgIGQ9XFxcIm0gLTUwMjkuNDY0MSw1ODQ1Ljc0OSB2IDIzMi43MzE1IGggMjguNDg1MyBWIDU4NDUuNzQ5IFpcXFwiIC8+XFxuICAgICAgICA8cGF0aFxcbiAgICAgICAgICAgaWQ9XFxcInBhdGg2NTc4XFxcIlxcbiAgICAgICAgICAgc3R5bGU9XFxcImZpbGw6IzQ5NDg0ODtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6IzJjMmEyOTtzdHJva2Utd2lkdGg6MjIuNjc3MjAwMzI7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLWRhc2hhcnJheTpub25lXFxcIlxcbiAgICAgICAgICAgZD1cXFwibSAtNDkxOC4xODk0LDU4NDUuNzQ5IHYgMjMyLjczMTUgaCAyOC40ODUzIFYgNTg0NS43NDkgWlxcXCIgLz5cXG4gICAgICAgIDxwYXRoXFxuICAgICAgICAgICBpZD1cXFwicGF0aDY1ODBcXFwiXFxuICAgICAgICAgICBzdHlsZT1cXFwiZmlsbDojNDk0ODQ4O2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTojMmMyYTI5O3N0cm9rZS13aWR0aDoyMi42NzcyMDAzMjtzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtZGFzaGFycmF5Om5vbmVcXFwiXFxuICAgICAgICAgICBkPVxcXCJtIC00ODA5LjA1ODMsNTg0NS43NDkgdiAyMzIuNzMxNSBoIDI4LjQ4NTIgViA1ODQ1Ljc0OSBaXFxcIiAvPlxcbiAgICAgICAgPHBhdGhcXG4gICAgICAgICAgIGlkPVxcXCJwYXRoNjU4MlxcXCJcXG4gICAgICAgICAgIHN0eWxlPVxcXCJmaWxsOiM0OTQ4NDg7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOiMyYzJhMjk7c3Ryb2tlLXdpZHRoOjIyLjY3NzIwMDMyO3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1kYXNoYXJyYXk6bm9uZVxcXCJcXG4gICAgICAgICAgIGQ9XFxcIm0gLTQ2OTkuMTU1NSw1ODQ1Ljc0OSB2IDIzMi43MzE1IGggMjguNDg1MyBWIDU4NDUuNzQ5IFpcXFwiIC8+XFxuICAgICAgICA8cGF0aFxcbiAgICAgICAgICAgaWQ9XFxcInBhdGg2NTg0XFxcIlxcbiAgICAgICAgICAgc3R5bGU9XFxcImZpbGw6IzQ5NDg0ODtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6IzJjMmEyOTtzdHJva2Utd2lkdGg6MjIuNjc3MjAwMzI7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLWRhc2hhcnJheTpub25lXFxcIlxcbiAgICAgICAgICAgZD1cXFwibSAtNDU4Ni4wNzkyLDU4NDUuNzQ5IHYgMjMyLjczMTUgaCAyOC40ODUzIFYgNTg0NS43NDkgWlxcXCIgLz5cXG4gICAgICAgIDxwYXRoXFxuICAgICAgICAgICBpZD1cXFwicGF0aDY1ODZcXFwiXFxuICAgICAgICAgICBzdHlsZT1cXFwiZmlsbDojNDk0ODQ4O2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTojMmMyYTI5O3N0cm9rZS13aWR0aDoyMi42NzcyMDAzMjtzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtZGFzaGFycmF5Om5vbmVcXFwiXFxuICAgICAgICAgICBkPVxcXCJtIC00NDc2Ljk0ODEsNTg0NS43NDkgdiAyMzIuNzMxNSBoIDI4LjQ4NTMgViA1ODQ1Ljc0OSBaXFxcIiAvPlxcbiAgICAgICAgPHBhdGhcXG4gICAgICAgICAgIGlkPVxcXCJwYXRoNjU4OFxcXCJcXG4gICAgICAgICAgIHN0eWxlPVxcXCJmaWxsOiM0OTQ4NDg7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOiMyYzJhMjk7c3Ryb2tlLXdpZHRoOjIyLjY3NzIwMDMyO3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1kYXNoYXJyYXk6bm9uZVxcXCJcXG4gICAgICAgICAgIGQ9XFxcIm0gLTQzNjcuMDQ1Miw1ODQ1Ljc0OSB2IDIzMi43MzE1IGggMjguNDg1MiBWIDU4NDUuNzQ5IFpcXFwiIC8+XFxuICAgICAgICA8cGF0aFxcbiAgICAgICAgICAgaWQ9XFxcInBhdGg2NTkwXFxcIlxcbiAgICAgICAgICAgc3R5bGU9XFxcImZpbGw6IzQ5NDg0ODtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6IzJjMmEyOTtzdHJva2Utd2lkdGg6MjIuNjc3MjAwMzI7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLWRhc2hhcnJheTpub25lXFxcIlxcbiAgICAgICAgICAgZD1cXFwibSAtNDI1NS4zNDIyLDU4NTcuNTcwNCB2IDIwOS4wODg2IHEgMCwxMS44MjE1IDExLjgyMTUsMTEuODIxNSBoIDQuODQyNCBxIDExLjgyMTQsMCAxMS44MjE0LC0xMS44MjE1IHYgLTIwOS4wODg2IHEgMCwtMTEuODIxNCAtMTEuODIxNCwtMTEuODIxNCBoIC00Ljg0MjQgcSAtMTEuODIxNSwwIC0xMS44MjE1LDExLjgyMTQgelxcXCIgLz5cXG4gICAgICA8L2c+XFxuICAgICAgPHBhdGhcXG4gICAgICAgICBpZD1cXFwicGF0aDY1OTNcXFwiXFxuICAgICAgICAgc3R5bGU9XFxcImZpbGw6I2M5OTgwNjtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6IzFiMTkxODtzdHJva2Utd2lkdGg6MjguMzQ2NTAwNDtzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtZGFzaGFycmF5Om5vbmVcXFwiXFxuICAgICAgICAgZD1cXFwibSAtNTMwMy4zNTE5LDU5NjYuMDU4NiBoIDExMzMuODU4MyB2IDI2OC4yMzk3IGggLTExMzMuODU4MyB6XFxcIiAvPlxcbiAgICAgIDxwYXRoXFxuICAgICAgICAgaWQ9XFxcInBhdGg2NTk1XFxcIlxcbiAgICAgICAgIHN0eWxlPVxcXCJmaWxsOiNjOTk4MDY7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOiMxYjE5MTg7c3Ryb2tlLXdpZHRoOjI4LjM0NjUwMDQ7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLWRhc2hhcnJheTpub25lXFxcIlxcbiAgICAgICAgIGQ9XFxcIm0gLTUzMDMuMzUyLDY1OTMuMjY2MSB2IDI2OC4yNDA0IGggMTEzMy44NTg0IHYgLTI2OC4yNDA0IHpcXFwiIC8+XFxuICAgICAgPGdcXG4gICAgICAgICBpZD1cXFwiTGF5ZXIxMTI2XFxcIj5cXG4gICAgICAgIDxwYXRoXFxuICAgICAgICAgICBpZD1cXFwicGF0aDY1OTdcXFwiXFxuICAgICAgICAgICBzdHlsZT1cXFwiZmlsbDojY2M5YTAwO2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTojMWIxOTE4O3N0cm9rZS13aWR0aDoyOC4zNDY1MDA0O3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1kYXNoYXJyYXk6bm9uZVxcXCJcXG4gICAgICAgICAgIGQ9XFxcIm0gLTUxMzYuODk0LDYwNTguMDY1MyBoIDkyOS43Nzc5IHYgNzA2LjExNTggaCAtOTI5Ljc3NzkgelxcXCIgLz5cXG4gICAgICAgIDxnXFxuICAgICAgICAgICBpZD1cXFwiTGF5ZXIxMTI3XFxcIj5cXG4gICAgICAgICAgPHBhdGhcXG4gICAgICAgICAgICAgaWQ9XFxcInBhdGg2NTk5XFxcIlxcbiAgICAgICAgICAgICBzdHlsZT1cXFwiZmlsbDojMWIxOTE4O2ZpbGwtcnVsZTpldmVub2RkXFxcIlxcbiAgICAgICAgICAgICBkPVxcXCJtIC00MzYwLjM1OCw2MjIyLjAzNTkgaCAxMTMuODUwNyBxIDEyLjQxNTksMCAxMi40MTU5LC0xMi40MTU5IHYgLTYuOTA5NSBxIDAsLTEyLjQxNTggLTEyLjQxNTksLTEyLjQxNTggaCAtMTEzLjg1MDcgcSAtMTIuNDE1OCwwIC0xMi40MTU4LDEyLjQxNTggdiA2LjkwOTUgcSAwLDEyLjQxNTkgMTIuNDE1OCwxMi40MTU5IHpcXFwiIC8+XFxuICAgICAgICAgIDxwYXRoXFxuICAgICAgICAgICAgIGlkPVxcXCJwYXRoNjYwMVxcXCJcXG4gICAgICAgICAgICAgc3R5bGU9XFxcImZpbGw6IzFiMTkxODtmaWxsLXJ1bGU6ZXZlbm9kZFxcXCJcXG4gICAgICAgICAgICAgZD1cXFwibSAtNDM2MC4zNTgsNjI3MS4zOSBoIDExMy44NTA3IHEgMTIuNDE1OSwwIDEyLjQxNTksLTEyLjQxNTkgdiAtNi45MDk0IHEgMCwtMTIuNDE1OSAtMTIuNDE1OSwtMTIuNDE1OSBoIC0xMTMuODUwNyBxIC0xMi40MTU4LDAgLTEyLjQxNTgsMTIuNDE1OSB2IDYuOTA5NCBxIDAsMTIuNDE1OSAxMi40MTU4LDEyLjQxNTkgelxcXCIgLz5cXG4gICAgICAgICAgPHBhdGhcXG4gICAgICAgICAgICAgaWQ9XFxcInBhdGg2NjAzXFxcIlxcbiAgICAgICAgICAgICBzdHlsZT1cXFwiZmlsbDojMWIxOTE4O2ZpbGwtcnVsZTpldmVub2RkXFxcIlxcbiAgICAgICAgICAgICBkPVxcXCJtIC00MzYwLjM1OCw2MzE5LjA3MDcgaCAxMTMuODUwNyBxIDEyLjQxNTksMCAxMi40MTU5LC0xMi40MTU5IHYgLTYuOTA5NCBxIDAsLTEyLjQxNTkgLTEyLjQxNTksLTEyLjQxNTkgaCAtMTEzLjg1MDcgcSAtMTIuNDE1OCwwIC0xMi40MTU4LDEyLjQxNTkgdiA2LjkwOTQgcSAwLDEyLjQxNTkgMTIuNDE1OCwxMi40MTU5IHpcXFwiIC8+XFxuICAgICAgICAgIDxwYXRoXFxuICAgICAgICAgICAgIGlkPVxcXCJwYXRoNjYwNVxcXCJcXG4gICAgICAgICAgICAgc3R5bGU9XFxcImZpbGw6IzFiMTkxODtmaWxsLXJ1bGU6ZXZlbm9kZFxcXCJcXG4gICAgICAgICAgICAgZD1cXFwibSAtNDM2MC4zNTgsNjM2MS43MzI3IGggMTEzLjg1MDcgcSAxMi40MTU5LDAgMTIuNDE1OSwtMTIuNDE1OSB2IC02LjkwOTQgcSAwLC0xMi40MTU5IC0xMi40MTU5LC0xMi40MTU5IGggLTExMy44NTA3IHEgLTEyLjQxNTgsMCAtMTIuNDE1OCwxMi40MTU5IHYgNi45MDk0IHEgMCwxMi40MTU5IDEyLjQxNTgsMTIuNDE1OSB6XFxcIiAvPlxcbiAgICAgICAgICA8cGF0aFxcbiAgICAgICAgICAgICBpZD1cXFwicGF0aDY2MDdcXFwiXFxuICAgICAgICAgICAgIHN0eWxlPVxcXCJmaWxsOiMxYjE5MTg7ZmlsbC1ydWxlOmV2ZW5vZGRcXFwiXFxuICAgICAgICAgICAgIGQ9XFxcIm0gLTQzNjAuMzU4LDY0MDguNTc2OCBoIDExMy44NTA3IHEgMTIuNDE1OSwwIDEyLjQxNTksLTEyLjQxNTggdiAtNi45MDk1IHEgMCwtMTIuNDE1OSAtMTIuNDE1OSwtMTIuNDE1OSBoIC0xMTMuODUwNyBxIC0xMi40MTU4LDAgLTEyLjQxNTgsMTIuNDE1OSB2IDYuOTA5NSBxIDAsMTIuNDE1OCAxMi40MTU4LDEyLjQxNTggelxcXCIgLz5cXG4gICAgICAgICAgPHBhdGhcXG4gICAgICAgICAgICAgaWQ9XFxcInBhdGg2NjA5XFxcIlxcbiAgICAgICAgICAgICBzdHlsZT1cXFwiZmlsbDojMWIxOTE4O2ZpbGwtcnVsZTpldmVub2RkXFxcIlxcbiAgICAgICAgICAgICBkPVxcXCJtIC00MzYwLjM1OCw2NDUzLjUzODkgaCAxMTMuODUwNyBxIDEyLjQxNTksMCAxMi40MTU5LC0xMi40MTU5IHYgLTYuOTA5NCBxIDAsLTEyLjQxNTkgLTEyLjQxNTksLTEyLjQxNTkgaCAtMTEzLjg1MDcgcSAtMTIuNDE1OCwwIC0xMi40MTU4LDEyLjQxNTkgdiA2LjkwOTQgcSAwLDEyLjQxNTkgMTIuNDE1OCwxMi40MTU5IHpcXFwiIC8+XFxuICAgICAgICAgIDxwYXRoXFxuICAgICAgICAgICAgIGlkPVxcXCJwYXRoNjYxMVxcXCJcXG4gICAgICAgICAgICAgc3R5bGU9XFxcImZpbGw6IzFiMTkxODtmaWxsLXJ1bGU6ZXZlbm9kZFxcXCJcXG4gICAgICAgICAgICAgZD1cXFwibSAtNDM2MC4zNTgsNjUwMi44OTMgaCAxMTMuODUwNyBxIDEyLjQxNTksMCAxMi40MTU5LC0xMi40MTU4IHYgLTYuOTA5NSBxIDAsLTEyLjQxNTkgLTEyLjQxNTksLTEyLjQxNTkgaCAtMTEzLjg1MDcgcSAtMTIuNDE1OCwwIC0xMi40MTU4LDEyLjQxNTkgdiA2LjkwOTUgcSAwLDEyLjQxNTggMTIuNDE1OCwxMi40MTU4IHpcXFwiIC8+XFxuICAgICAgICAgIDxwYXRoXFxuICAgICAgICAgICAgIGlkPVxcXCJwYXRoNjYxM1xcXCJcXG4gICAgICAgICAgICAgc3R5bGU9XFxcImZpbGw6IzFiMTkxODtmaWxsLXJ1bGU6ZXZlbm9kZFxcXCJcXG4gICAgICAgICAgICAgZD1cXFwibSAtNDM2MC4zNTgsNjU1MC41NzM3IGggMTEzLjg1MDcgcSAxMi40MTU5LDAgMTIuNDE1OSwtMTIuNDE1OCB2IC02LjkwOTUgcSAwLC0xMi40MTU5IC0xMi40MTU5LC0xMi40MTU5IGggLTExMy44NTA3IHEgLTEyLjQxNTgsMCAtMTIuNDE1OCwxMi40MTU5IHYgNi45MDk1IHEgMCwxMi40MTU4IDEyLjQxNTgsMTIuNDE1OCB6XFxcIiAvPlxcbiAgICAgICAgICA8cGF0aFxcbiAgICAgICAgICAgICBpZD1cXFwicGF0aDY2MTVcXFwiXFxuICAgICAgICAgICAgIHN0eWxlPVxcXCJmaWxsOiMxYjE5MTg7ZmlsbC1ydWxlOmV2ZW5vZGRcXFwiXFxuICAgICAgICAgICAgIGQ9XFxcIm0gLTQzNjAuMzU4LDY1OTMuMjM1NyBoIDExMy44NTA3IHEgMTIuNDE1OSwwIDEyLjQxNTksLTEyLjQxNTkgdiAtNi45MDk0IHEgMCwtMTIuNDE1OSAtMTIuNDE1OSwtMTIuNDE1OSBoIC0xMTMuODUwNyBxIC0xMi40MTU4LDAgLTEyLjQxNTgsMTIuNDE1OSB2IDYuOTA5NCBxIDAsMTIuNDE1OSAxMi40MTU4LDEyLjQxNTkgelxcXCIgLz5cXG4gICAgICAgICAgPHBhdGhcXG4gICAgICAgICAgICAgaWQ9XFxcInBhdGg2NjE3XFxcIlxcbiAgICAgICAgICAgICBzdHlsZT1cXFwiZmlsbDojMWIxOTE4O2ZpbGwtcnVsZTpldmVub2RkXFxcIlxcbiAgICAgICAgICAgICBkPVxcXCJtIC00MzYwLjM1OCw2NjQwLjA3OTkgaCAxMTMuODUwNyBxIDEyLjQxNTksMCAxMi40MTU5LC0xMi40MTU5IHYgLTYuOTA5NSBxIDAsLTEyLjQxNTggLTEyLjQxNTksLTEyLjQxNTggaCAtMTEzLjg1MDcgcSAtMTIuNDE1OCwwIC0xMi40MTU4LDEyLjQxNTggdiA2LjkwOTUgcSAwLDEyLjQxNTkgMTIuNDE1OCwxMi40MTU5IHpcXFwiIC8+XFxuICAgICAgICA8L2c+XFxuICAgICAgICA8cGF0aFxcbiAgICAgICAgICAgaWQ9XFxcInBhdGg2NjIwXFxcIlxcbiAgICAgICAgICAgc3R5bGU9XFxcImZpbGw6IzFiMTkxODtmaWxsLXJ1bGU6ZXZlbm9kZFxcXCJcXG4gICAgICAgICAgIGQ9XFxcIm0gLTUwNTQuMzkxOSw2NTAxLjA5OCB2IDE0NS42NDQgaCAxNS4wNDQzIHYgLTE0NS42NDQgelxcXCIgLz5cXG4gICAgICAgIDxwYXRoXFxuICAgICAgICAgICBpZD1cXFwicGF0aDY2MjJcXFwiXFxuICAgICAgICAgICBzdHlsZT1cXFwiZmlsbDojMWIxOTE4O2ZpbGwtcnVsZTpldmVub2RkXFxcIlxcbiAgICAgICAgICAgZD1cXFwibSAtNTA1NC4zOTE5LDYxNzQuODU1NyB2IDE0NS42NDQgaCAxNS4wNDQzIHYgLTE0NS42NDQgelxcXCIgLz5cXG4gICAgICAgIDxwYXRoXFxuICAgICAgICAgICBpZD1cXFwicGF0aDY2MjRcXFwiXFxuICAgICAgICAgICBzdHlsZT1cXFwiZmlsbDojZmVjMDAwO2ZpbGwtb3BhY2l0eTowO2ZpbGwtcnVsZTpldmVub2RkXFxcIlxcbiAgICAgICAgICAgZD1cXFwibSAtNDk4Ni4yMjY5LDYxNDMuOTEwMyAtMTM3LjA1NSwtNzEuMjcwNCB2IDY3Ni4xMjQzIGwgMTM3LjA1NSwtNzEuMjcwMyB6XFxcIiAvPlxcbiAgICAgICAgPHBhdGhcXG4gICAgICAgICAgIGlkPVxcXCJwYXRoNjYyNlxcXCJcXG4gICAgICAgICAgIHN0eWxlPVxcXCJmaWxsOiNhMTc5MDA7ZmlsbC1ydWxlOmV2ZW5vZGRcXFwiXFxuICAgICAgICAgICBkPVxcXCJtIC01MTIxLjQ1ODcsNjA3My42NDEyIGggOTAxLjAxNzQgbCAtMC4wNTYsNzAuMDg1MSBoIC03NjYuNDkxOCB6XFxcIiAvPlxcbiAgICAgICAgPHBhdGhcXG4gICAgICAgICAgIGlkPVxcXCJwYXRoNjYyOFxcXCJcXG4gICAgICAgICAgIHN0eWxlPVxcXCJmaWxsOiNhMTc5MDA7ZmlsbC1ydWxlOmV2ZW5vZGRcXFwiXFxuICAgICAgICAgICBkPVxcXCJtIC01MTIxLjQ1ODcsNjc0Ny4yNzEgaCA5MDEuMDE3NCBsIC0wLjA1NiwtNzAuMDg1MSBoIC03NjYuNDkxOCB6XFxcIiAvPlxcbiAgICAgIDwvZz5cXG4gICAgICA8Z1xcbiAgICAgICAgIGlkPVxcXCJMYXllcjExMjhcXFwiPlxcbiAgICAgICAgPHBhdGhcXG4gICAgICAgICAgIGlkPVxcXCJwYXRoNjYzMVxcXCJcXG4gICAgICAgICAgIHN0eWxlPVxcXCJmaWxsOiNjYzlhMDA7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOiMxYjE5MTg7c3Ryb2tlLXdpZHRoOjI4LjM0NjUwMDQ7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLWRhc2hhcnJheTpub25lXFxcIlxcbiAgICAgICAgICAgZD1cXFwibSAtNDk3OS4zODk0LDYyMzEuOTgwMiB2IDM1MC42OTc0IHEgMCw5OC41MTA0IDk4LjUxMDQsOTguNTEwNCBoIDM4OS4xMjY1IHEgOTguNTEwNCwwIDk4LjUxMDQsLTk4LjUxMDQgdiAtMzUwLjY5NzQgcSAwLC05OC41MTA0IC05OC41MTA0LC05OC41MTA0IGggLTM4OS4xMjY1IHEgLTk4LjUxMDQsMCAtOTguNTEwNCw5OC41MTA0IHpcXFwiIC8+XFxuICAgICAgICA8cGF0aFxcbiAgICAgICAgICAgaWQ9XFxcInBhdGg2NjMzXFxcIlxcbiAgICAgICAgICAgc3R5bGU9XFxcImZpbGw6I2NjOWEwMDtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6IzFiMTkxODtzdHJva2Utd2lkdGg6MjguMzQ2NTAwNDtzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtZGFzaGFycmF5Om5vbmVcXFwiXFxuICAgICAgICAgICBkPVxcXCJtIC00Njg2LjMxNTcsNjI0MS41Nzc3IGEgMTU4Ljc5MTEsMTY1Ljc1MTIgMCAwIDEgMTU4Ljc5MTEsMTY1Ljc1MTIgMTU4Ljc5MTEsMTY1Ljc1MTIgMCAxIDEgLTE1OC43OTExLC0xNjUuNzUxMiB6XFxcIiAvPlxcbiAgICAgICAgPHBhdGhcXG4gICAgICAgICAgIGlkPVxcXCJwYXRoNjYzNVxcXCJcXG4gICAgICAgICAgIHN0eWxlPVxcXCJmaWxsOiNjYzlhMDA7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOiMxYjE5MTg7c3Ryb2tlLXdpZHRoOjI4LjM0NjUwMDQ7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLWRhc2hhcnJheTpub25lXFxcIlxcbiAgICAgICAgICAgZD1cXFwibSAtNDY4Ni4zMTU3LDYzMDAuNzc0NSBhIDEwMi4wOCwxMDYuNTU0MyAwIDAgMSAxMDIuMDc5OSwxMDYuNTU0NCAxMDIuMDgsMTA2LjU1NDMgMCAxIDEgLTEwMi4wNzk5LC0xMDYuNTU0NCB6XFxcIiAvPlxcbiAgICAgIDwvZz5cXG4gICAgICA8cGF0aFxcbiAgICAgICAgIGlkPVxcXCJwYXRoNjYzOFxcXCJcXG4gICAgICAgICBzdHlsZT1cXFwiZmlsbDojY2M5YTAwO2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTojMWIxOTE4O3N0cm9rZS13aWR0aDoyOC4zNDY1MDA0O3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1kYXNoYXJyYXk6bm9uZVxcXCJcXG4gICAgICAgICBkPVxcXCJtIC01MjMyLjQ3NjIsNjM5OC44MTEgdiAyNC42Mjc2IHEgMCwzNC40Nzg2IDM0LjQ3ODYsMzQuNDc4NiBoIDIzNS44MjcgcSAzNC40Nzg3LDAgMzQuNDc4NywtMzQuNDc4NiB2IC0yNC42Mjc2IHEgMCwtMzQuNDc4NyAtMzQuNDc4NywtMzQuNDc4NyBoIC0yMzUuODI3IHEgLTM0LjQ3ODYsMCAtMzQuNDc4NiwzNC40Nzg3IHpcXFwiIC8+XFxuICAgICAgPHBhdGhcXG4gICAgICAgICBpZD1cXFwicGF0aDY2NDBcXFwiXFxuICAgICAgICAgc3R5bGU9XFxcImZpbGw6I2NjOWEwMDtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6IzFiMTkxODtzdHJva2Utd2lkdGg6MjguMzQ2NTAwNDtzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtZGFzaGFycmF5Om5vbmVcXFwiXFxuICAgICAgICAgZD1cXFwibSAtNTI5NC4yMDIxLDYzOTIuMzMwMSB2IDM3LjU4OTUgcSAwLDUyLjYyNTIgNTIuNjI1Miw1Mi42MjUyIGggNjQuNTc0OSBxIDUyLjYyNTIsMCA1Mi42MjUyLC01Mi42MjUyIHYgLTM3LjU4OTUgcSAwLC01Mi42MjUyIC01Mi42MjUyLC01Mi42MjUyIGggLTY0LjU3NDkgcSAtNTIuNjI1MiwwIC01Mi42MjUyLDUyLjYyNTIgelxcXCIgLz5cXG4gICAgPC9nPlxcbiAgPC9nPlxcbjwvc3ZnPlxcblwiLFxuICAgXCJpZFwiOiAyLFxuICAgXCJ3aWR0aFwiOiAyLFxuICAgXCJoZWlnaHRcIjogMlxuICB9XG4gXSxcbiBcIndpZHRoXCI6IDEsXG4gXCJoZWlnaHRcIjogMVxufSJdfQ==
