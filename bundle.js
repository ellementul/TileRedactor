(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const Hear = require("./Events.js");

function CrController(Logic, Draw){

	var switchAct = Draw.crSwitch("invis", ["Tiles", "Objects"]);
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
},{"./Events.js":3}],2:[function(require,module,exports){
require("typesjs");
const RGB = require('chromath').rgb;

var id_map = "Map";
var id_grid = "Grid";
var id_tiles = "Tiles";
var id_objects = "Objects";
var id_pallet = "Pallet";

var size = 20;

function CrMap(id_map, size){
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

/*function CrPallet(){
	var container = getNode(id_pallet);
	
	this.add = function(categ, tile){
		container.appendChild(drawTile(tile));
	}
}*/

drawGrid(getNode(id_grid), size);

module.exports = {
	map: new CrMap(id_map, size), 
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
		img.src = new_tile.img;
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

},{"./Switch.js":5,"chromath":7,"typesjs":15}],3:[function(require,module,exports){

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

},{}],4:[function(require,module,exports){
var Tilesets = [];
var Map = Array.create(Array.create.bind(null, null, 20), 20);

function CrLogic(Draw){
	var current_tile = null;
	var current_objs = null;
	
	this.addTileset = function(Tileset){
		var objs = Tileset.tiles.filter(tile => tile.type == "phisic");
		var ObjSet = Object.assign({}, Tileset);
		ObjSet.tiles = objs;

		Tileset.tiles = Tileset.tiles.filter(tile => tile.type != "phisic");

		console.log(Tileset, ObjSet);

		Tileset.id = Tilesets.add(Tileset);
		Draw.tiles.add(Tileset);

		ObjSet.id = Tilesets.add(ObjSet);
		Draw.objects.add(ObjSet);
	}
	
	this.changeTile = function(id_categ, id_tile){
		current_tile = Tilesets[id_categ].tiles[id_tile];
		
		defSize(current_tile, id_categ)
		
	}

	this.changeObjs = function(id_categ, id_tile){
		current_objs = Tilesets[id_categ].tiles[id_tile];
		
		defSize(current_objs, id_categ);
		
	}

	function defSize(tile, id_categ){
		if(!tile.width) tile.width = Tilesets[id_categ].width;
		if(!tile.height) tile.height = Tilesets[id_categ].height;
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

		var box = {tile: tile};
		
		for(var i = 0; i < tile.width; i++){
			for(var j = 0; j < tile.height; j++){
				
				Map[j+y][i+x] = box;
			}
		}
		
		Draw.map.add(tile, x, y);
	}
}

module.exports = CrLogic;

},{}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
const Draw = require("./Draw.js");
const CrLogic = require("./Logic.js");
const CrContr = require("./Control.js");

var Tileset = require("./tileset.json");
var Logic = new CrLogic(Draw);
CrContr(Logic, Draw);

},{"./Control.js":1,"./Draw.js":2,"./Logic.js":4,"./tileset.json":16}],7:[function(require,module,exports){
var Chromath = require('./src/chromath.js');
module.exports = Chromath;

},{"./src/chromath.js":8}],8:[function(require,module,exports){
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

},{"./colornames_css2":9,"./colornames_css3":10,"./parsers":11,"./prototype":12,"./util":13}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{"./util":13}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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





},{}],15:[function(require,module,exports){
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

},{"./mof.js":14}],16:[function(require,module,exports){
module.exports={
 "tiles": [
  {
   "type": "color",
   "color": {
    "r": 138,
    "g": 42,
    "b": 42,
    "a": 1
   },
   "id": 0
  },
  {
   "type": "svg",
   "img": "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgoKPHN2ZwogICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiCiAgIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyIKICAgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJjZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiCiAgIHhtbG5zOmlua3NjYXBlPSJodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy9uYW1lc3BhY2VzL2lua3NjYXBlIgogICB3aWR0aD0iMTAyNG1tIgogICBoZWlnaHQ9IjUxMm1tIgogICB2aWV3Qm94PSIwIDAgMTAyNCA1MTIiCiAgIHZlcnNpb249IjEuMSIKICAgaWQ9InN2ZzgyMjYiCiAgIGlua3NjYXBlOnZlcnNpb249IjAuOTIuMiAoNWMzZTgwZCwgMjAxNy0wOC0wNikiCiAgIHNvZGlwb2RpOmRvY25hbWU9ImRyYXdpbmcuc3ZnIj4KICA8ZGVmcwogICAgIGlkPSJkZWZzODIyMCIgLz4KICA8c29kaXBvZGk6bmFtZWR2aWV3CiAgICAgaWQ9ImJhc2UiCiAgICAgcGFnZWNvbG9yPSIjZmZmZmZmIgogICAgIGJvcmRlcmNvbG9yPSIjNjY2NjY2IgogICAgIGJvcmRlcm9wYWNpdHk9IjEuMCIKICAgICBpbmtzY2FwZTpwYWdlb3BhY2l0eT0iMC4wIgogICAgIGlua3NjYXBlOnBhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6em9vbT0iMC4wODgzODgzNDgiCiAgICAgaW5rc2NhcGU6Y3g9Ii00MjguMTU2MTIiCiAgICAgaW5rc2NhcGU6Y3k9IjIxMS44NDk0MyIKICAgICBpbmtzY2FwZTpkb2N1bWVudC11bml0cz0ibW0iCiAgICAgaW5rc2NhcGU6Y3VycmVudC1sYXllcj0ibGF5ZXIxIgogICAgIHNob3dncmlkPSJmYWxzZSIKICAgICBpbmtzY2FwZTp3aW5kb3ctd2lkdGg9IjEzNjYiCiAgICAgaW5rc2NhcGU6d2luZG93LWhlaWdodD0iNzA1IgogICAgIGlua3NjYXBlOndpbmRvdy14PSItOCIKICAgICBpbmtzY2FwZTp3aW5kb3cteT0iLTgiCiAgICAgaW5rc2NhcGU6d2luZG93LW1heGltaXplZD0iMSIgLz4KICA8bWV0YWRhdGEKICAgICBpZD0ibWV0YWRhdGE4MjIzIj4KICAgIDxyZGY6UkRGPgogICAgICA8Y2M6V29yawogICAgICAgICByZGY6YWJvdXQ9IiI+CiAgICAgICAgPGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+CiAgICAgICAgPGRjOnR5cGUKICAgICAgICAgICByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIiAvPgogICAgICAgIDxkYzp0aXRsZSAvPgogICAgICA8L2NjOldvcms+CiAgICA8L3JkZjpSREY+CiAgPC9tZXRhZGF0YT4KICA8ZwogICAgIGlua3NjYXBlOmxhYmVsPSJMYXllciAxIgogICAgIGlua3NjYXBlOmdyb3VwbW9kZT0ibGF5ZXIiCiAgICAgaWQ9ImxheWVyMSIKICAgICB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLDIxNSkiPgogICAgPGcKICAgICAgIGlkPSJnOTQ4MSIKICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDEuMDQzODk2MywwLDAsMS4wODcyMzk0LC0xOC4wMDMyODMsMy44NjQxNjA1KSI+CiAgICAgIDxnCiAgICAgICAgIGlkPSJMYXllcjEwNjQiCiAgICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuNDUyNjEzNzIsMCwwLDAuNDUzOTI4NCwyODY3LjMwNTcsMzg2NS4xMDI5KSI+CiAgICAgICAgPHBhdGgKICAgICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIgogICAgICAgICAgIGlkPSJwYXRoNzU5OCIKICAgICAgICAgICBzdHlsZT0iZmlsbDojNTI1MjUyO2ZpbGwtcnVsZTpldmVub2RkIgogICAgICAgICAgIGQ9Im0gLTUxOTguOTgzNCwtODk5MC4zMTY5IHYgMTEzMy44NTgzIGggLTExMzMuODU4MiB2IC0xMTMzLjg1ODMgeiIgLz4KICAgICAgICA8cGF0aAogICAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiCiAgICAgICAgICAgaWQ9InBhdGg3NjAwIgogICAgICAgICAgIHN0eWxlPSJmaWxsOiNkMmQxZDI7ZmlsbC1ydWxlOmV2ZW5vZGQiCiAgICAgICAgICAgZD0ibSAtNTM5Ni41NzU5LC03ODU2LjQ1ODYgdiAtMTEzMy44NTgzIGggMTk3LjU5MjUgdiAxMTMzLjg1ODMgeiIgLz4KICAgICAgICA8cGF0aAogICAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiCiAgICAgICAgICAgaWQ9InBhdGg3NjAyIgogICAgICAgICAgIHN0eWxlPSJmaWxsOiM1MjUyNTI7ZmlsbC1ydWxlOmV2ZW5vZGQiCiAgICAgICAgICAgZD0ibSAtNTQ0Ny42MTA2LC04NTk0LjM3ODYgaCAyNDguNjI3MiB2IDM5Ni44NTA5IGggLTI0OC42MjcyIHoiIC8+CiAgICAgIDwvZz4KICAgICAgPGcKICAgICAgICAgaWQ9IkxheWVyMTA2NSIKICAgICAgICAgdHJhbnNmb3JtPSJtYXRyaXgoMC40NDk1MjI5MiwwLDAsMC40NTM5Mjg0LDI4NTEuMzM4MiwzODY1LjEwMjkpIj4KICAgICAgICA8cGF0aAogICAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiCiAgICAgICAgICAgaWQ9InBhdGg3NjA1IgogICAgICAgICAgIHN0eWxlPSJmaWxsOiM1MjUyNTI7ZmlsbC1ydWxlOmV2ZW5vZGQiCiAgICAgICAgICAgZD0ibSAtNTE5OS4yMDkzLC04OTkwLjMxNjkgdiAxMTMzLjg1ODMgaCAxMTMzLjg1ODMgdiAtMTEzMy44NTgzIHoiIC8+CiAgICAgICAgPHBhdGgKICAgICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIgogICAgICAgICAgIGlkPSJwYXRoNzYwNyIKICAgICAgICAgICBzdHlsZT0iZmlsbDojZDJkMWQyO2ZpbGwtcnVsZTpldmVub2RkIgogICAgICAgICAgIGQ9Im0gLTUwMDEuNjE2NywtNzg1Ni40NTg2IHYgLTExMzMuODU4MyBoIC0xOTcuNTkyNiB2IDExMzMuODU4MyB6IiAvPgogICAgICAgIDxwYXRoCiAgICAgICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIKICAgICAgICAgICBpZD0icGF0aDc2MDkiCiAgICAgICAgICAgc3R5bGU9ImZpbGw6IzUyNTI1MjtmaWxsLXJ1bGU6ZXZlbm9kZCIKICAgICAgICAgICBkPSJtIC00OTUwLjU4MjEsLTg1OTQuMzc4NiBoIC0yNDguNjI3MiB2IDM5Ni44NTA5IGggMjQ4LjYyNzIgeiIgLz4KICAgICAgPC9nPgogICAgPC9nPgogIDwvZz4KPC9zdmc+Cg==",
   "id": 1,
   "width": 2
  },
  {
   "type": "phisic",
   "durability": "wood",
   "img": "data:image/jpeg;base64,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",
   "id": 2,
   "width": 2,
   "height": 2
  }
 ],
 "width": 1,
 "height": 1
}
},{}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIkNvbnRyb2wuanMiLCJEcmF3LmpzIiwiRXZlbnRzLmpzIiwiTG9naWMuanMiLCJTd2l0Y2guanMiLCJicm9tYWluLmpzIiwibm9kZV9tb2R1bGVzL2Nocm9tYXRoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Nocm9tYXRoL3NyYy9jaHJvbWF0aC5qcyIsIm5vZGVfbW9kdWxlcy9jaHJvbWF0aC9zcmMvY29sb3JuYW1lc19jc3MyLmpzIiwibm9kZV9tb2R1bGVzL2Nocm9tYXRoL3NyYy9jb2xvcm5hbWVzX2NzczMuanMiLCJub2RlX21vZHVsZXMvY2hyb21hdGgvc3JjL3BhcnNlcnMuanMiLCJub2RlX21vZHVsZXMvY2hyb21hdGgvc3JjL3Byb3RvdHlwZS5qcyIsIm5vZGVfbW9kdWxlcy9jaHJvbWF0aC9zcmMvdXRpbC5qcyIsIm5vZGVfbW9kdWxlcy90eXBlc2pzL21vZi5qcyIsIm5vZGVfbW9kdWxlcy90eXBlc2pzL3R5cGVzLmpzIiwidGlsZXNldC5qc29uIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvdUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IEhlYXIgPSByZXF1aXJlKFwiLi9FdmVudHMuanNcIik7XHJcblxyXG5mdW5jdGlvbiBDckNvbnRyb2xsZXIoTG9naWMsIERyYXcpe1xyXG5cclxuXHR2YXIgc3dpdGNoQWN0ID0gRHJhdy5jclN3aXRjaChcImludmlzXCIsIFtcIlRpbGVzXCIsIFwiT2JqZWN0c1wiXSk7XHJcblx0SGVhcihcInN3aXRjaEFjdFwiLCBcImNsaWNrXCIsIGZ1bmN0aW9uKCl7XHJcblx0XHRzd2l0Y2hBY3QoKTtcclxuXHR9KVxyXG5cclxuXHRIZWFyKFwiVGlsZXNcIiwgXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCl7XHJcblx0XHRpZihldmVudC50YXJnZXQuc3dpdCkgZXZlbnQudGFyZ2V0LnN3aXQoKTtcclxuXHRcdFxyXG5cdFx0aWYoZXZlbnQudGFyZ2V0LmdldEF0dHJpYnV0ZShcInRpbGVcIikgIT09IG51bGwpe1xyXG5cdFx0XHRMb2dpYy5jaGFuZ2VUaWxlKGV2ZW50LnRhcmdldC5wYXJlbnRFbGVtZW50LmdldEF0dHJpYnV0ZShcImNhdGVnXCIpLCBldmVudC50YXJnZXQuZ2V0QXR0cmlidXRlKFwidGlsZVwiKSk7XHJcblx0XHR9XHJcblx0fSk7XHJcblx0XHJcblx0SGVhcihcIkFkZFwiLCBcImNoYW5nZVwiLCBEcmF3Lm9wZW5KU09OKExvZ2ljLmFkZFRpbGVzZXQpKTtcclxuXHRcclxuXHR2YXIgY3Vyc29yTGluZSA9IG51bGw7XHJcblx0SGVhcihcInN3aXRjaEdyaWRcIiwgXCJjbGlja1wiLCBmdW5jdGlvbigpe1xyXG5cdFx0Z2V0Tm9kZShcIkdyaWRcIikuY2xhc3NMaXN0LnRvZ2dsZShcImdyaWQtaW52aXNcIik7XHJcblx0fSlcclxuXHRcclxuXHRIZWFyKFwiR3JpZFwiLCBcIm1vdXNlZG93blwiLCBmdW5jdGlvbihldmVudCl7XHJcblx0XHRjdXJzb3JMaW5lID0gW2V2ZW50LnRhcmdldC54LCBldmVudC50YXJnZXQueV07XHJcblx0fSk7XHJcblx0SGVhcihcIkdyaWRcIiwgXCJtb3VzZXVwXCIsIGZ1bmN0aW9uKGV2ZW50KXtcclxuXHRcdExvZ2ljLmZpbGwoY3Vyc29yTGluZSwgW2V2ZW50LnRhcmdldC54LCBldmVudC50YXJnZXQueV0pO1xyXG5cdFx0Y3Vyc29yTGluZSA9IG51bGw7XHJcblx0fSk7XHJcblx0SGVhcihcIkdyaWRcIiwgXCJkcmFnc3RhcnRcIiwgZnVuY3Rpb24oZXZlbnQpe1xyXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHR9KTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDckNvbnRyb2xsZXI7XHJcblxyXG5cclxuZnVuY3Rpb24gZ2V0Tm9kZShpZCl7XHJcblx0dmFyIGVsZW0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XHJcblx0aWYoIWVsZW0pIHRocm93IG5ldyBFcnJvcihcIkVsZW0gaXMgbm90IGZpbmQhXCIpO1xyXG5cdHJldHVybiBlbGVtO1xyXG59IiwicmVxdWlyZShcInR5cGVzanNcIik7XHJcbmNvbnN0IFJHQiA9IHJlcXVpcmUoJ2Nocm9tYXRoJykucmdiO1xyXG5cclxudmFyIGlkX21hcCA9IFwiTWFwXCI7XHJcbnZhciBpZF9ncmlkID0gXCJHcmlkXCI7XHJcbnZhciBpZF90aWxlcyA9IFwiVGlsZXNcIjtcclxudmFyIGlkX29iamVjdHMgPSBcIk9iamVjdHNcIjtcclxudmFyIGlkX3BhbGxldCA9IFwiUGFsbGV0XCI7XHJcblxyXG52YXIgc2l6ZSA9IDIwO1xyXG5cclxuZnVuY3Rpb24gQ3JNYXAoaWRfbWFwLCBzaXplKXtcclxuXHR2YXIgY29udGFpbmVyID0gZ2V0Tm9kZShpZF9tYXApO1xyXG5cdFxyXG5cdHRoaXMuYWRkID0gZnVuY3Rpb24obmV3X3RpbGUsIHgsIHkpe1xyXG5cdFx0dmFyIHRpbGUgPSBkcmF3VGlsZShuZXdfdGlsZSk7XHJcblx0XHR0aWxlLnN0eWxlLndpZHRoID0gKG5ld190aWxlLndpZHRoICogKDEwMCAvIHNpemUpKSArIFwiJVwiO1xyXG5cdFx0dGlsZS5zdHlsZS5oZWlnaHQgPSAobmV3X3RpbGUuaGVpZ2h0ICogKDEwMCAvIHNpemUpKSArIFwiJVwiO1xyXG5cdFx0XHJcblx0XHR0aWxlLnN0eWxlLmxlZnQgPSAoeCAqICgxMDAgLyBzaXplKSkgKyBcIiVcIjtcclxuXHRcdHRpbGUuc3R5bGUudG9wID0gKHkgKiAoMTAwIC8gc2l6ZSkpICsgXCIlXCI7XHJcblx0XHRcclxuXHRcdGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aWxlKTtcclxuXHR9XHJcblx0XHJcblx0XHJcblx0ZnVuY3Rpb24gTm9ybVRpbGUodGlsZSl7XHJcblx0XHR2YXIgYm94ID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aWxlKTtcclxuXHRcdHRpbGUuc3R5bGUubGVmdCA9IE5vcm1Db29yZChwYXJzZUZsb2F0KGJveC5sZWZ0KSwgcGFyc2VGbG9hdChib3gud2lkdGgpKSArIFwiJVwiO1xyXG5cdFx0dGlsZS5zdHlsZS50b3AgPSBOb3JtQ29vcmQocGFyc2VGbG9hdChib3gudG9wKSwgcGFyc2VGbG9hdChib3guaGVpZ2h0KSkgKyBcIiVcIjtcclxuXHR9XHJcblx0XHJcblx0ZnVuY3Rpb24gTm9ybUNvb3JkKGNvb3JkLCBzKXtcclxuXHRcdHZhciBjb25fc2l6ZSA9IHBhcnNlRmxvYXQoZ2V0Q29tcHV0ZWRTdHlsZShjb250YWluZXIpLndpZHRoKTtcclxuXHRcdFxyXG5cdFx0aWYoY29vcmQgKyBzID4gY29uX3NpemUpIGNvb3JkID0gY29uX3NpemUgLSBzO1xyXG5cdFx0aWYoY29vcmQgPCAwKSBjb29yZCA9IDA7XHJcblx0XHRcclxuXHRcdHJldHVybiBNYXRoLnJvdW5kKChjb29yZCAvIGNvbl9zaXplKSAqIHNpemUpICogKDEwMCAvIHNpemUpO1xyXG5cdH1cclxuXHRcclxufVxyXG5cclxuZnVuY3Rpb24gQ3JUaWxlcyhpZF9jb250YWluZXIpe1xyXG5cdHZhciBjb250YWluZXIgPSBnZXROb2RlKGlkX2NvbnRhaW5lcik7XHJcblx0XHJcblx0dGhpcy5hZGQgPSBmdW5jdGlvbihUaWxlc2V0KXtcclxuXHRcdHZhciBjYXRlZyA9IGRyYXdDYXRlZyhUaWxlc2V0KTtcclxuXHRcdGNvbnRhaW5lci5hcHBlbmRDaGlsZChjYXRlZyk7XHJcblx0fVxyXG59XHJcblxyXG4vKmZ1bmN0aW9uIENyUGFsbGV0KCl7XHJcblx0dmFyIGNvbnRhaW5lciA9IGdldE5vZGUoaWRfcGFsbGV0KTtcclxuXHRcclxuXHR0aGlzLmFkZCA9IGZ1bmN0aW9uKGNhdGVnLCB0aWxlKXtcclxuXHRcdGNvbnRhaW5lci5hcHBlbmRDaGlsZChkcmF3VGlsZSh0aWxlKSk7XHJcblx0fVxyXG59Ki9cclxuXHJcbmRyYXdHcmlkKGdldE5vZGUoaWRfZ3JpZCksIHNpemUpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0bWFwOiBuZXcgQ3JNYXAoaWRfbWFwLCBzaXplKSwgXHJcblx0dGlsZXM6IG5ldyBDclRpbGVzKGlkX3RpbGVzKSxcclxuXHRvYmplY3RzOiBuZXcgQ3JUaWxlcyhpZF9vYmplY3RzKSxcclxuXHRvcGVuSlNPTjogT3BlbkZpbGVKU09OLFxyXG5cdHNhdmU6IFNhdmUsXHJcblx0Y3JTd2l0Y2g6ICByZXF1aXJlKFwiLi9Td2l0Y2guanNcIilcclxufTtcclxuXHJcbmZ1bmN0aW9uIGRyYXdHcmlkKGNvbnRhaW5lciwgZ3JpZF9zaXplKXtcclxuXHRcdHZhciBzaXplID0gMTAwIC8gZ3JpZF9zaXplO1xyXG5cdFx0Zm9yKHZhciBpID0gZ3JpZF9zaXplIC0gMTsgaSA+PSAwOyBpLS0pe1xyXG5cdFx0XHRmb3IodmFyIGogPSBncmlkX3NpemUgLSAxOyBqID49IDA7IGotLSl7XHJcblx0XHRcdFx0dmFyIGJveCA9IGRhcndCb3goaSpzaXplLCBqKnNpemUsIHNpemUpO1xyXG5cdFx0XHRcdGJveC54ID0gaTtcclxuXHRcdFx0XHRib3gueSA9IGo7XHJcblx0XHRcdFx0Y29udGFpbmVyLmFwcGVuZENoaWxkKGJveCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0XHJcbmZ1bmN0aW9uIGRhcndCb3goeCwgeSwgc2l6ZSl7XHJcblx0dmFyIGJveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cdGJveC5jbGFzc0xpc3QuYWRkKFwiYm94XCIpO1xyXG5cdGJveC5zdHlsZS53aWR0aCA9IHNpemUgKyBcIiVcIjtcclxuXHRib3guc3R5bGUuaGVpZ2h0ID0gc2l6ZSArIFwiJVwiO1xyXG5cdFxyXG5cdGJveC5zdHlsZS5sZWZ0ID0geCArIFwiJVwiO1xyXG5cdGJveC5zdHlsZS50b3AgPSB5ICsgXCIlXCI7XHJcblx0XHJcblx0cmV0dXJuIGJveDtcclxufVxyXG5cclxuZnVuY3Rpb24gT3BlbkZpbGVKU09OKE9wZW4pe1xyXG5cdHJldHVybiBmdW5jdGlvbigpe1xyXG5cdFx0aWYodGhpcy5maWxlc1swXSl7XHJcblx0XHRcdHZhciBuYW1lID0gdGhpcy5maWxlc1swXS5uYW1lO1xyXG5cdFx0XHR2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuXHRcdFx0XHJcblx0XHRcdHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbihlKXtcclxuXHRcdFx0XHR2YXIgZmlsZSA9IEpTT04ucGFyc2UoZS50YXJnZXQucmVzdWx0KTtcclxuXHRcdFx0XHRmaWxlLm5hbWUgPSBuYW1lO1xyXG5cdFx0XHRcdE9wZW4oZmlsZSk7XHJcblx0XHRcdH07XHJcblx0XHRcdHJlYWRlci5yZWFkQXNUZXh0KHRoaXMuZmlsZXNbMF0pO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxuZnVuY3Rpb24gU2F2ZShuYW1lLCB0ZXh0KXtcclxuXHR2YXIgYmxvYiA9IG5ldyBCbG9iKFt0ZXh0XSwge3R5cGU6IFwidGV4dC9wbGFpbjtjaGFyc2V0PXV0Zi04XCJ9KTtcclxuXHRGaWxlU2F2ZXIuc2F2ZUFzKGJsb2IsIG5hbWUpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBDclN3aXRjaFR3byhpZCwgZmlyc3RfaWQsIG5hbWVfY2xhc3Mpe1xyXG5cdHZhciBlbGVtID0gZ2V0Tm9kZShpZCkuY2xhc3NMaXN0O1xyXG5cdHZhciBmaXJzdF9lbGVtID0gZ2V0Tm9kZShmaXJzdF9pZCkuY2xhc3NMaXN0O1xyXG5cdHJldHVybiBmdW5jdGlvbigpe1xyXG5cdFx0ZWxlbS50b2dnbGUobmFtZV9jbGFzcyk7XHJcblx0XHRmaXJzdF9lbGVtLnRvZ2dsZShuYW1lX2NsYXNzKTtcclxuXHR9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRyYXdDYXRlZyhuZXdfdGlsZXNldCl7XHJcblx0dmFyIGNhdGVnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblx0Y2F0ZWcuY2xhc3NMaXN0LmFkZChcInBhbmVsLWNvbHVtblwiKTtcclxuXHRcclxuXHR2YXIgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMycpO1xyXG5cdHRpdGxlLmlubmVySFRNTCA9IG5ld190aWxlc2V0Lm5hbWU7XHJcblx0dGl0bGUuY2xhc3NMaXN0LmFkZChcInRpdGxlLWNhdGVnXCIpO1xyXG5cdFxyXG5cdFxyXG5cdC8vdmFyIGNsb3NlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XHJcblx0Ly9jbG9zZS5pbm5lckhUTUwgPSBcIi1cIjtcclxuXHQvL3RpdGxlLmFwcGVuZENoaWxkKGNsb3NlKTtcclxuXHRcclxuXHRjYXRlZy5hcHBlbmRDaGlsZCh0aXRsZSk7XHJcblx0XHJcblx0dmFyIGxpc3QgPSBkcmF3VGlsZXMobmV3X3RpbGVzZXQudGlsZXMpO1xyXG5cdGxpc3Quc2V0QXR0cmlidXRlKFwiY2F0ZWdcIiwgbmV3X3RpbGVzZXQuaWQpO1xyXG5cdFxyXG5cdHRpdGxlLnN3aXQgPSBmdW5jdGlvbigpe1xyXG5cdFx0bGlzdC5jbGFzc0xpc3QudG9nZ2xlKFwiaW52aXNcIik7XHJcblx0fVxyXG5cdFxyXG5cdGNhdGVnLmFwcGVuZENoaWxkKGxpc3QpO1xyXG5cdFxyXG5cdHJldHVybiBjYXRlZztcclxufVxyXG5cclxuZnVuY3Rpb24gZHJhd1RpbGVzKHRpbGVzKXtcclxuXHR2YXIgbGlzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cdGxpc3QuY2xhc3NMaXN0LmFkZChcInBhbmVsLXdyYXBcIik7XHJcblx0XHJcblx0dGlsZXMubWFwKGRyYXdUaWxlKS5mb3JFYWNoKGxpc3QuYXBwZW5kQ2hpbGQuYmluZChsaXN0KSk7XHJcblx0cmV0dXJuIGxpc3Q7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRyYXdUaWxlKG5ld190aWxlKXtcclxuXHRcclxuXHRpZihuZXdfdGlsZS50eXBlID09IFwiY29sb3JcIil7XHJcblx0XHR2YXIgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblx0XHRpbWcuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gbmV3IFJHQihuZXdfdGlsZS5jb2xvcikudG9TdHJpbmcoKTtcclxuXHR9XHJcblx0aWYobmV3X3RpbGUudHlwZSA9PSBcInN2Z1wiIHx8IG5ld190aWxlLnR5cGUgPT0gXCJwaGlzaWNcIil7XHJcblx0XHR2YXIgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XHJcblx0XHRpbWcuc3JjID0gbmV3X3RpbGUuaW1nO1xyXG5cdH1cclxuXHJcblx0aW1nLmNsYXNzTGlzdC5hZGQoXCJ0aWxlXCIpO1xyXG5cdGltZy5zZXRBdHRyaWJ1dGUoXCJ0aWxlXCIsIG5ld190aWxlLmlkKTtcclxuXHRpbWcuc2V0QXR0cmlidXRlKFwiZHJhZ2dhYmxlXCIsIHRydWUpO1xyXG5cdFxyXG5cdHJldHVybiBpbWc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldE5vZGUoaWQpe1xyXG5cdHZhciBlbGVtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xyXG5cdGlmKCFlbGVtKSB0aHJvdyBuZXcgRXJyb3IoXCJFbGVtIGlzIG5vdCBmaW5kIVwiKTtcclxuXHRyZXR1cm4gZWxlbTtcclxufVxyXG4iLCJcclxuZnVuY3Rpb24gSWRFdmVudChpZCwgbmFtZV9ldmVudCwgZnVuYyl7XHJcblx0XHJcblx0aWYobmFtZV9ldmVudCA9PSBcInN1Ym1pdFwiKXtcclxuXHRcdHZhciBvbGRfZnVuYyA9IGZ1bmM7XHJcblx0XHRmdW5jID0gZnVuY3Rpb24oZSl7XHJcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0b2xkX2Z1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHRcdH0gXHJcblx0fVxyXG5cdFxyXG5cdGlmKEFycmF5LmlzQXJyYXkobmFtZV9ldmVudCkpe1xyXG5cdFx0bmFtZV9ldmVudC5mb3JFYWNoKG5hbWUgPT4gZ2V0Tm9kZShpZCkuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCBmdW5jKSk7XHJcblx0fVxyXG5cdGVsc2UgZ2V0Tm9kZShpZCkuYWRkRXZlbnRMaXN0ZW5lcihuYW1lX2V2ZW50LCBmdW5jKTtcclxufVxyXG5cclxuZnVuY3Rpb24gU3VibWl0KGZ1bmMpe1xyXG5cdHJldHVybiBmdW5jdGlvbihldmVudCl7XHJcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0ZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG5cdH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Tm9kZShpZCl7XHJcblx0dmFyIGVsZW0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XHJcblx0aWYoIWVsZW0pIHRocm93IG5ldyBFcnJvcihcIkVsZW0gaXMgbm90IGZpbmQhXCIpO1xyXG5cdHJldHVybiBlbGVtO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IElkRXZlbnQ7XHJcbiIsInZhciBUaWxlc2V0cyA9IFtdO1xyXG52YXIgTWFwID0gQXJyYXkuY3JlYXRlKEFycmF5LmNyZWF0ZS5iaW5kKG51bGwsIG51bGwsIDIwKSwgMjApO1xyXG5cclxuZnVuY3Rpb24gQ3JMb2dpYyhEcmF3KXtcclxuXHR2YXIgY3VycmVudF90aWxlID0gbnVsbDtcclxuXHR2YXIgY3VycmVudF9vYmpzID0gbnVsbDtcclxuXHRcclxuXHR0aGlzLmFkZFRpbGVzZXQgPSBmdW5jdGlvbihUaWxlc2V0KXtcclxuXHRcdHZhciBvYmpzID0gVGlsZXNldC50aWxlcy5maWx0ZXIodGlsZSA9PiB0aWxlLnR5cGUgPT0gXCJwaGlzaWNcIik7XHJcblx0XHR2YXIgT2JqU2V0ID0gT2JqZWN0LmFzc2lnbih7fSwgVGlsZXNldCk7XHJcblx0XHRPYmpTZXQudGlsZXMgPSBvYmpzO1xyXG5cclxuXHRcdFRpbGVzZXQudGlsZXMgPSBUaWxlc2V0LnRpbGVzLmZpbHRlcih0aWxlID0+IHRpbGUudHlwZSAhPSBcInBoaXNpY1wiKTtcclxuXHJcblx0XHRjb25zb2xlLmxvZyhUaWxlc2V0LCBPYmpTZXQpO1xyXG5cclxuXHRcdFRpbGVzZXQuaWQgPSBUaWxlc2V0cy5hZGQoVGlsZXNldCk7XHJcblx0XHREcmF3LnRpbGVzLmFkZChUaWxlc2V0KTtcclxuXHJcblx0XHRPYmpTZXQuaWQgPSBUaWxlc2V0cy5hZGQoT2JqU2V0KTtcclxuXHRcdERyYXcub2JqZWN0cy5hZGQoT2JqU2V0KTtcclxuXHR9XHJcblx0XHJcblx0dGhpcy5jaGFuZ2VUaWxlID0gZnVuY3Rpb24oaWRfY2F0ZWcsIGlkX3RpbGUpe1xyXG5cdFx0Y3VycmVudF90aWxlID0gVGlsZXNldHNbaWRfY2F0ZWddLnRpbGVzW2lkX3RpbGVdO1xyXG5cdFx0XHJcblx0XHRkZWZTaXplKGN1cnJlbnRfdGlsZSwgaWRfY2F0ZWcpXHJcblx0XHRcclxuXHR9XHJcblxyXG5cdHRoaXMuY2hhbmdlT2JqcyA9IGZ1bmN0aW9uKGlkX2NhdGVnLCBpZF90aWxlKXtcclxuXHRcdGN1cnJlbnRfb2JqcyA9IFRpbGVzZXRzW2lkX2NhdGVnXS50aWxlc1tpZF90aWxlXTtcclxuXHRcdFxyXG5cdFx0ZGVmU2l6ZShjdXJyZW50X29ianMsIGlkX2NhdGVnKTtcclxuXHRcdFxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZGVmU2l6ZSh0aWxlLCBpZF9jYXRlZyl7XHJcblx0XHRpZighdGlsZS53aWR0aCkgdGlsZS53aWR0aCA9IFRpbGVzZXRzW2lkX2NhdGVnXS53aWR0aDtcclxuXHRcdGlmKCF0aWxlLmhlaWdodCkgdGlsZS5oZWlnaHQgPSBUaWxlc2V0c1tpZF9jYXRlZ10uaGVpZ2h0O1xyXG5cdH1cclxuXHRcclxuXHR0aGlzLmZpbGwgPSBmdW5jdGlvbihiZWcsIGVuZCl7XHJcblx0XHRpZihjdXJyZW50X3RpbGUpe1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIGluY194ID0gY3VycmVudF90aWxlLndpZHRoO1xyXG5cdFx0XHR2YXIgaW5jX3kgPSBjdXJyZW50X3RpbGUuaGVpZ2h0O1xyXG5cdFx0XHRcclxuXHRcdFx0Zm9yKHZhciBpID0gYmVnWzBdOyBpICsgaW5jX3ggPD0gZW5kWzBdICsgMTsgaSA9IGkgKyBpbmNfeCl7XHJcblx0XHRcdFx0Zm9yKHZhciBqID0gYmVnWzFdOyBqICsgaW5jX3kgPD0gZW5kWzFdICsgMTsgaiA9IGogKyBpbmNfeSl7XHJcblx0XHRcdFx0XHRkcmF3VGlsZShpLCBqLCBjdXJyZW50X3RpbGUpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGZ1bmN0aW9uIGRyYXdUaWxlKHgsIHksIHRpbGUpe1xyXG5cdFx0eCA9IE1hdGguZmxvb3IoeCk7XHJcblx0XHR5ID0gTWF0aC5mbG9vcih5KTtcclxuXHJcblx0XHR2YXIgYm94ID0ge3RpbGU6IHRpbGV9O1xyXG5cdFx0XHJcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgdGlsZS53aWR0aDsgaSsrKXtcclxuXHRcdFx0Zm9yKHZhciBqID0gMDsgaiA8IHRpbGUuaGVpZ2h0OyBqKyspe1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdE1hcFtqK3ldW2kreF0gPSBib3g7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0RHJhdy5tYXAuYWRkKHRpbGUsIHgsIHkpO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDckxvZ2ljO1xyXG4iLCJmdW5jdGlvbiBDclN3aXRjaChuYW1lX2NsYXNzLCBpZHMpe1xuXHRpZihBcnJheS5pc0FycmF5KGlkcykpe1xuXHRcdHZhciBlbGVtcyA9IGlkcy5tYXAoZ2V0Tm9kZSk7XG5cdFx0ZWxlbXMgPSBlbGVtcy5tYXAoZWxlbSA9PiBlbGVtLmNsYXNzTGlzdCk7XG5cblx0XHRyZXR1cm4gYXJyU3dpY3RoLmJpbmQobnVsbCwgZWxlbXMsIG5hbWVfY2xhc3MpO1xuXHR9XG5cdGVsc2UgaWYodHlwZW9mIGlkcyA9PSBcIm9iamVjdFwiKXtcblx0XHRyZXR1cm4gb2JqU3dpdGNoKGlkcywgbmFtZV9jbGFzcyk7XG5cdH1cblx0ZWxzZXtcblx0XHR2YXIgZWxlbSA9IGdldE5vZGUoaWRzKS5jbGFzc0xpc3Q7XG5cdFx0cmV0dXJuIG9uZVN3aXRjaC5iaW5kKG51bGwsIG5hbWVfY2xhc3MsIGVsZW0pO1xuXHR9XG5cdFxufVxuXG5mdW5jdGlvbiBvYmpTd2l0Y2goaWRfb2JqLCBjbGFzc19uYW1lKXtcblx0Zm9yICh2YXIga2V5IGluIGlkX29iail7XG5cdFx0aWRfb2JqW2tleV0gPSBnZXROb2RlKGlkX29ialtrZXldKS5jbGFzc0xpc3Q7XG5cdH1cblxuXHRyZXR1cm4gZnVuY3Rpb24oaWQpe1xuXHRcdGZvciAodmFyIGkgaW4gaWRfb2JqKXtcblx0XHRcdGlkX29ialtpXS5hZGQoY2xhc3NfbmFtZSk7XG5cdFx0fVxuXHRcdFxuXHRcdGlkX29ialtpZF0ucmVtb3ZlKGNsYXNzX25hbWUpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGFyclN3aWN0aChlbGVtX2FyciwgbmFtZV9jbGFzcyl7XG5cdGVsZW1fYXJyLmZvckVhY2gob25lU3dpdGNoLmJpbmQobnVsbCwgbmFtZV9jbGFzcykpO1xufVxuXG5mdW5jdGlvbiBvbmVTd2l0Y2gobmFtZV9jbGFzcywgZWxlbSl7XG5cdFx0ZWxlbS50b2dnbGUobmFtZV9jbGFzcyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ3JTd2l0Y2g7XG5cbmZ1bmN0aW9uIGdldE5vZGUoaWQpe1xuXHR2YXIgZWxlbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcblx0aWYoIWVsZW0pIHRocm93IG5ldyBFcnJvcihcIkVsZW0gaXMgbm90IGZpbmQhXCIpO1xuXHRyZXR1cm4gZWxlbTtcbn0iLCJjb25zdCBEcmF3ID0gcmVxdWlyZShcIi4vRHJhdy5qc1wiKTtcclxuY29uc3QgQ3JMb2dpYyA9IHJlcXVpcmUoXCIuL0xvZ2ljLmpzXCIpO1xyXG5jb25zdCBDckNvbnRyID0gcmVxdWlyZShcIi4vQ29udHJvbC5qc1wiKTtcclxuXHJcbnZhciBUaWxlc2V0ID0gcmVxdWlyZShcIi4vdGlsZXNldC5qc29uXCIpO1xyXG52YXIgTG9naWMgPSBuZXcgQ3JMb2dpYyhEcmF3KTtcclxuQ3JDb250cihMb2dpYywgRHJhdyk7XHJcbiIsInZhciBDaHJvbWF0aCA9IHJlcXVpcmUoJy4vc3JjL2Nocm9tYXRoLmpzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IENocm9tYXRoO1xuIiwidmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcbi8qXG4gICBDbGFzczogQ2hyb21hdGhcbiovXG4vLyBHcm91cDogQ29uc3RydWN0b3JzXG4vKlxuICAgQ29uc3RydWN0b3I6IENocm9tYXRoXG4gICBDcmVhdGUgYSBuZXcgQ2hyb21hdGggaW5zdGFuY2UgZnJvbSBhIHN0cmluZyBvciBpbnRlZ2VyXG5cbiAgIFBhcmFtZXRlcnM6XG4gICBtaXhlZCAtIFRoZSB2YWx1ZSB0byB1c2UgZm9yIGNyZWF0aW5nIHRoZSBjb2xvclxuXG4gICBSZXR1cm5zOlxuICAgPENocm9tYXRoPiBpbnN0YW5jZVxuXG4gICBQcm9wZXJ0aWVzOlxuICAgciAtIFRoZSByZWQgY2hhbm5lbCBvZiB0aGUgUkdCIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBDaHJvbWF0aC4gQSBudW1iZXIgYmV0d2VlbiAwIGFuZCAyNTUuXG4gICBnIC0gVGhlIGdyZWVuIGNoYW5uZWwgb2YgdGhlIFJHQiByZXByZXNlbnRhdGlvbiBvZiB0aGUgQ2hyb21hdGguIEEgbnVtYmVyIGJldHdlZW4gMCBhbmQgMjU1LlxuICAgYiAtIFRoZSBibHVlIGNoYW5uZWwgb2YgdGhlIFJHQiByZXByZXNlbnRhdGlvbiBvZiB0aGUgQ2hyb21hdGguIEEgbnVtYmVyIGJldHdlZW4gMCBhbmQgMjU1LlxuICAgYSAtIFRoZSBhbHBoYSBjaGFubmVsIG9mIHRoZSBDaHJvbWF0aC4gQSBudW1iZXIgYmV0d2VlbiAwIGFuZCAxLlxuICAgaCAtIFRoZSBodWUgb2YgdGhlIENocm9tYXRoLiBBIG51bWJlciBiZXR3ZWVuIDAgYW5kIDM2MC5cbiAgIHNsIC0gVGhlIHNhdHVyYXRpb24gb2YgdGhlIEhTTCByZXByZXNlbnRhdGlvbiBvZiB0aGUgQ2hyb21hdGguIEEgbnVtYmVyIGJldHdlZW4gMCBhbmQgMS5cbiAgIHN2IC0gVGhlIHNhdHVyYXRpb24gb2YgdGhlIEhTVi9IU0IgcmVwcmVzZW50YXRpb24gb2YgdGhlIENocm9tYXRoLiBBIG51bWJlciBiZXR3ZWVuIDAgYW5kIDEuXG4gICBsIC0gVGhlIGxpZ2h0bmVzcyBvZiB0aGUgSFNMIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBDaHJvbWF0aC4gQSBudW1iZXIgYmV0d2VlbiAwIGFuZCAxLlxuICAgdiAtIFRoZSBsaWdodG5lc3Mgb2YgdGhlIEhTVi9IU0IgcmVwcmVzZW50YXRpb24gb2YgdGhlIENocm9tYXRoLiBBIG51bWJlciBiZXR3ZWVuIDAgYW5kIDEuXG5cbiAgIEV4YW1wbGVzOlxuICAoc3RhcnQgY29kZSlcbi8vIFRoZXJlIGFyZSBtYW55IHdheXMgdG8gY3JlYXRlIGEgQ2hyb21hdGggaW5zdGFuY2Vcbm5ldyBDaHJvbWF0aCgnI0ZGMDAwMCcpOyAgICAgICAgICAgICAgICAgIC8vIEhleCAoNiBjaGFyYWN0ZXJzIHdpdGggaGFzaClcbm5ldyBDaHJvbWF0aCgnRkYwMDAwJyk7ICAgICAgICAgICAgICAgICAgIC8vIEhleCAoNiBjaGFyYWN0ZXJzIHdpdGhvdXQgaGFzaClcbm5ldyBDaHJvbWF0aCgnI0YwMCcpOyAgICAgICAgICAgICAgICAgICAgIC8vIEhleCAoMyBjaGFyYWN0ZXJzIHdpdGggaGFzaClcbm5ldyBDaHJvbWF0aCgnRjAwJyk7ICAgICAgICAgICAgICAgICAgICAgIC8vIEhleCAoMyBjaGFyYWN0ZXJzIHdpdGhvdXQgaGFzaClcbm5ldyBDaHJvbWF0aCgncmVkJyk7ICAgICAgICAgICAgICAgICAgICAgIC8vIENTUy9TVkcgQ29sb3IgbmFtZVxubmV3IENocm9tYXRoKCdyZ2IoMjU1LCAwLCAwKScpOyAgICAgICAgICAgLy8gUkdCIHZpYSBDU1Ncbm5ldyBDaHJvbWF0aCh7cjogMjU1LCBnOiAwLCBiOiAwfSk7ICAgICAgIC8vIFJHQiB2aWEgb2JqZWN0XG5uZXcgQ2hyb21hdGgoJ3JnYmEoMjU1LCAwLCAwLCAxKScpOyAgICAgICAvLyBSR0JBIHZpYSBDU1Ncbm5ldyBDaHJvbWF0aCh7cjogMjU1LCBnOiAwLCBiOiAwLCBhOiAxfSk7IC8vIFJHQkEgdmlhIG9iamVjdFxubmV3IENocm9tYXRoKCdoc2woMCwgMTAwJSwgNTAlKScpOyAgICAgICAgLy8gSFNMIHZpYSBDU1Ncbm5ldyBDaHJvbWF0aCh7aDogMCwgczogMSwgbDogMC41fSk7ICAgICAgIC8vIEhTTCB2aWEgb2JqZWN0XG5uZXcgQ2hyb21hdGgoJ2hzbGEoMCwgMTAwJSwgNTAlLCAxKScpOyAgICAvLyBIU0xBIHZpYSBDU1Ncbm5ldyBDaHJvbWF0aCh7aDogMCwgczogMSwgbDogMC41LCBhOiAxfSk7IC8vIEhTTEEgdmlhIG9iamVjdFxubmV3IENocm9tYXRoKCdoc3YoMCwgMTAwJSwgMTAwJSknKTsgICAgICAgLy8gSFNWIHZpYSBDU1Ncbm5ldyBDaHJvbWF0aCh7aDogMCwgczogMSwgdjogMX0pOyAgICAgICAgIC8vIEhTViB2aWEgb2JqZWN0XG5uZXcgQ2hyb21hdGgoJ2hzdmEoMCwgMTAwJSwgMTAwJSwgMSknKTsgICAvLyBIU1ZBIHZpYSBDU1Ncbm5ldyBDaHJvbWF0aCh7aDogMCwgczogMSwgdjogMSwgYTogMX0pOyAgIC8vIEhTVkEgdmlhIG9iamVjdFxubmV3IENocm9tYXRoKCdoc2IoMCwgMTAwJSwgMTAwJSknKTsgICAgICAgLy8gSFNCIHZpYSBDU1Ncbm5ldyBDaHJvbWF0aCh7aDogMCwgczogMSwgYjogMX0pOyAgICAgICAgIC8vIEhTQiB2aWEgb2JqZWN0XG5uZXcgQ2hyb21hdGgoJ2hzYmEoMCwgMTAwJSwgMTAwJSwgMSknKTsgICAvLyBIU0JBIHZpYSBDU1Ncbm5ldyBDaHJvbWF0aCh7aDogMCwgczogMSwgYjogMSwgYTogMX0pOyAgIC8vIEhTQkEgdmlhIG9iamVjdFxubmV3IENocm9tYXRoKDE2NzExNjgwKTsgICAgICAgICAgICAgICAgICAgLy8gUkdCIHZpYSBpbnRlZ2VyIChhbHBoYSBjdXJyZW50bHkgaWdub3JlZClcbihlbmQgY29kZSlcbiovXG5mdW5jdGlvbiBDaHJvbWF0aCggbWl4ZWQgKVxue1xuICAgIHZhciBjaGFubmVscywgY29sb3IsIGhzbCwgaHN2LCByZ2I7XG5cbiAgICBpZiAodXRpbC5pc1N0cmluZyhtaXhlZCkgfHwgdXRpbC5pc051bWJlcihtaXhlZCkpIHtcbiAgICAgICAgY2hhbm5lbHMgPSBDaHJvbWF0aC5wYXJzZShtaXhlZCk7XG4gICAgfSBlbHNlIGlmICh1dGlsLmlzQXJyYXkobWl4ZWQpKXtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbnN1cmUgaG93IHRvIHBhcnNlIGFycmF5IGAnK21peGVkKydgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnLCBwbGVhc2UgcGFzcyBhbiBvYmplY3Qgb3IgQ1NTIHN0eWxlICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ29yIHRyeSBDaHJvbWF0aC5yZ2IsIENocm9tYXRoLmhzbCwgb3IgQ2hyb21hdGguaHN2J1xuICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgIH0gZWxzZSBpZiAobWl4ZWQgaW5zdGFuY2VvZiBDaHJvbWF0aCkge1xuICAgICAgICBjaGFubmVscyA9IHV0aWwubWVyZ2Uoe30sIG1peGVkKTtcbiAgICB9IGVsc2UgaWYgKHV0aWwuaXNPYmplY3QobWl4ZWQpKXtcbiAgICAgICAgY2hhbm5lbHMgPSB1dGlsLm1lcmdlKHt9LCBtaXhlZCk7XG4gICAgfVxuXG4gICAgaWYgKCEgY2hhbm5lbHMpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IHBhcnNlIGAnK21peGVkKydgJyk7XG4gICAgZWxzZSBpZiAoIWlzRmluaXRlKGNoYW5uZWxzLmEpKVxuICAgICAgICBjaGFubmVscy5hID0gMTtcblxuICAgIGlmICgncicgaW4gY2hhbm5lbHMgKXtcbiAgICAgICAgcmdiID0gdXRpbC5yZ2Iuc2NhbGVkMDEoW2NoYW5uZWxzLnIsIGNoYW5uZWxzLmcsIGNoYW5uZWxzLmJdKTtcbiAgICAgICAgaHNsID0gQ2hyb21hdGgucmdiMmhzbChyZ2IpO1xuICAgICAgICBoc3YgPSBDaHJvbWF0aC5yZ2IyaHN2KHJnYik7XG4gICAgfSBlbHNlIGlmICgnaCcgaW4gY2hhbm5lbHMgKXtcbiAgICAgICAgaWYgKCdsJyBpbiBjaGFubmVscyl7XG4gICAgICAgICAgICBoc2wgPSB1dGlsLmhzbC5zY2FsZWQoW2NoYW5uZWxzLmgsIGNoYW5uZWxzLnMsIGNoYW5uZWxzLmxdKTtcbiAgICAgICAgICAgIHJnYiA9IENocm9tYXRoLmhzbDJyZ2IoaHNsKTtcbiAgICAgICAgICAgIGhzdiA9IENocm9tYXRoLnJnYjJoc3YocmdiKTtcbiAgICAgICAgfSBlbHNlIGlmICgndicgaW4gY2hhbm5lbHMgfHwgJ2InIGluIGNoYW5uZWxzKSB7XG4gICAgICAgICAgICBpZiAoJ2InIGluIGNoYW5uZWxzKSBjaGFubmVscy52ID0gY2hhbm5lbHMuYjtcbiAgICAgICAgICAgIGhzdiA9IHV0aWwuaHNsLnNjYWxlZChbY2hhbm5lbHMuaCwgY2hhbm5lbHMucywgY2hhbm5lbHMudl0pO1xuICAgICAgICAgICAgcmdiID0gQ2hyb21hdGguaHN2MnJnYihoc3YpO1xuICAgICAgICAgICAgaHNsID0gQ2hyb21hdGgucmdiMmhzbChyZ2IpO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICB1dGlsLm1lcmdlKHRoaXMsIHtcbiAgICAgICAgcjogIHJnYlswXSwgIGc6IHJnYlsxXSwgYjogcmdiWzJdLFxuICAgICAgICBoOiAgaHNsWzBdLCBzbDogaHNsWzFdLCBsOiBoc2xbMl0sXG4gICAgICAgIHN2OiBoc3ZbMV0sICB2OiBoc3ZbMl0sIGE6IGNoYW5uZWxzLmFcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xufVxuXG4vKlxuICBDb25zdHJ1Y3RvcjogQ2hyb21hdGgucmdiXG4gIENyZWF0ZSBhIG5ldyA8Q2hyb21hdGg+IGluc3RhbmNlIGZyb20gUkdCIHZhbHVlc1xuXG4gIFBhcmFtZXRlcnM6XG4gIHIgLSBOdW1iZXIsIDAtMjU1LCByZXByZXNlbnRpbmcgdGhlIGdyZWVuIGNoYW5uZWwgT1IgQXJyYXkgT1Igb2JqZWN0ICh3aXRoIGtleXMgcixnLGIpIG9mIFJHQiB2YWx1ZXNcbiAgZyAtIE51bWJlciwgMC0yNTUsIHJlcHJlc2VudGluZyB0aGUgZ3JlZW4gY2hhbm5lbFxuICBiIC0gTnVtYmVyLCAwLTI1NSwgcmVwcmVzZW50aW5nIHRoZSByZWQgY2hhbm5lbFxuICBhIC0gKE9wdGlvbmFsKSBGbG9hdCwgMC0xLCByZXByZXNlbnRpbmcgdGhlIGFscGhhIGNoYW5uZWxcblxuIFJldHVybnM6XG4gPENocm9tYXRoPlxuXG4gRXhhbXBsZXM6XG4gPiA+IG5ldyBDaHJvbWF0aC5yZ2IoMTIzLCAyMzQsIDU2KS50b1N0cmluZygpXG4gPiBcIiM3QkVBMzhcIlxuXG4gPiA+IG5ldyBDaHJvbWF0aC5yZ2IoWzEyMywgMjM0LCA1Nl0pLnRvU3RyaW5nKClcbiA+IFwiIzdCRUEzOFwiXG5cbiA+ID4gbmV3IENocm9tYXRoLnJnYih7cjogMTIzLCBnOiAyMzQsIGI6IDU2fSkudG9TdHJpbmcoKVxuID4gXCIjN0JFQTM4XCJcbiAqL1xuQ2hyb21hdGgucmdiID0gZnVuY3Rpb24gKHIsIGcsIGIsIGEpXG57XG4gICAgdmFyIHJnYmEgPSB1dGlsLnJnYi5mcm9tQXJncyhyLCBnLCBiLCBhKTtcbiAgICByID0gcmdiYVswXSwgZyA9IHJnYmFbMV0sIGIgPSByZ2JhWzJdLCBhID0gcmdiYVszXTtcblxuICAgIHJldHVybiBuZXcgQ2hyb21hdGgoe3I6IHIsIGc6IGcsIGI6IGIsIGE6IGF9KTtcbn07XG5cbi8qXG4gIENvbnN0cnVjdG9yOiBDaHJvbWF0aC5yZ2JhXG4gIEFsaWFzIGZvciA8Q2hyb21hdGgucmdiPlxuKi9cbkNocm9tYXRoLnJnYmEgPSBDaHJvbWF0aC5yZ2I7XG5cbi8qXG4gIENvbnN0cnVjdG9yOiBDaHJvbWF0aC5oc2xcbiAgQ3JlYXRlIGEgbmV3IENocm9tYXRoIGluc3RhbmNlIGZyb20gSFNMIHZhbHVlc1xuXG4gIFBhcmFtZXRlcnM6XG4gIGggLSBOdW1iZXIsIC1JbmZpbml0eSAtIEluZmluaXR5LCByZXByZXNlbnRpbmcgdGhlIGh1ZSBPUiBBcnJheSBPUiBvYmplY3QgKHdpdGgga2V5cyBoLHMsbCkgb2YgSFNMIHZhbHVlc1xuICBzIC0gTnVtYmVyLCAwLTEsIHJlcHJlc2VudGluZyB0aGUgc2F0dXJhdGlvblxuICBsIC0gTnVtYmVyLCAwLTEsIHJlcHJlc2VudGluZyB0aGUgbGlnaHRuZXNzXG4gIGEgLSAoT3B0aW9uYWwpIEZsb2F0LCAwLTEsIHJlcHJlc2VudGluZyB0aGUgYWxwaGEgY2hhbm5lbFxuXG4gIFJldHVybnM6XG4gIDxDaHJvbWF0aD5cblxuICBFeGFtcGxlczpcbiAgPiA+IG5ldyBDaHJvbWF0aC5oc2woMjQwLCAxLCAwLjUpLnRvU3RyaW5nKClcbiAgPiBcIiMwMDAwRkZcIlxuXG4gID4gPiBuZXcgQ2hyb21hdGguaHNsKFsyNDAsIDEsIDAuNV0pLnRvU3RyaW5nKClcbiAgPiBcIiMwMDAwRkZcIlxuXG4gID4gbmV3IENocm9tYXRoLmhzbCh7aDoyNDAsIHM6MSwgbDowLjV9KS50b1N0cmluZygpXG4gID4gXCIjMDAwMEZGXCJcbiAqL1xuQ2hyb21hdGguaHNsID0gZnVuY3Rpb24gKGgsIHMsIGwsIGEpXG57XG4gICAgdmFyIGhzbGEgPSB1dGlsLmhzbC5mcm9tQXJncyhoLCBzLCBsLCBhKTtcbiAgICBoID0gaHNsYVswXSwgcyA9IGhzbGFbMV0sIGwgPSBoc2xhWzJdLCBhID0gaHNsYVszXTtcblxuICAgIHJldHVybiBuZXcgQ2hyb21hdGgoe2g6IGgsIHM6IHMsIGw6IGwsIGE6IGF9KTtcbn07XG5cbi8qXG4gIENvbnN0cnVjdG9yOiBDaHJvbWF0aC5oc2xhXG4gIEFsaWFzIGZvciA8Q2hyb21hdGguaHNsPlxuKi9cbkNocm9tYXRoLmhzbGEgPSBDaHJvbWF0aC5oc2w7XG5cbi8qXG4gIENvbnN0cnVjdG9yOiBDaHJvbWF0aC5oc3ZcbiAgQ3JlYXRlIGEgbmV3IENocm9tYXRoIGluc3RhbmNlIGZyb20gSFNWIHZhbHVlc1xuXG4gIFBhcmFtZXRlcnM6XG4gIGggLSBOdW1iZXIsIC1JbmZpbml0eSAtIEluZmluaXR5LCByZXByZXNlbnRpbmcgdGhlIGh1ZSBPUiBBcnJheSBPUiBvYmplY3QgKHdpdGgga2V5cyBoLHMsbCkgb2YgSFNWIHZhbHVlc1xuICBzIC0gTnVtYmVyLCAwLTEsIHJlcHJlc2VudGluZyB0aGUgc2F0dXJhdGlvblxuICB2IC0gTnVtYmVyLCAwLTEsIHJlcHJlc2VudGluZyB0aGUgbGlnaHRuZXNzXG4gIGEgLSAoT3B0aW9uYWwpIEZsb2F0LCAwLTEsIHJlcHJlc2VudGluZyB0aGUgYWxwaGEgY2hhbm5lbFxuXG4gIFJldHVybnM6XG4gIDxDaHJvbWF0aD5cblxuICBFeGFtcGxlczpcbiAgPiA+IG5ldyBDaHJvbWF0aC5oc3YoMjQwLCAxLCAxKS50b1N0cmluZygpXG4gID4gXCIjMDAwMEZGXCJcblxuICA+ID4gbmV3IENocm9tYXRoLmhzdihbMjQwLCAxLCAxXSkudG9TdHJpbmcoKVxuICA+IFwiIzAwMDBGRlwiXG5cbiAgPiA+IG5ldyBDaHJvbWF0aC5oc3Yoe2g6MjQwLCBzOjEsIHY6MX0pLnRvU3RyaW5nKClcbiAgPiBcIiMwMDAwRkZcIlxuICovXG5DaHJvbWF0aC5oc3YgPSBmdW5jdGlvbiAoaCwgcywgdiwgYSlcbntcbiAgICB2YXIgaHN2YSA9IHV0aWwuaHNsLmZyb21BcmdzKGgsIHMsIHYsIGEpO1xuICAgIGggPSBoc3ZhWzBdLCBzID0gaHN2YVsxXSwgdiA9IGhzdmFbMl0sIGEgPSBoc3ZhWzNdO1xuXG4gICAgcmV0dXJuIG5ldyBDaHJvbWF0aCh7aDogaCwgczogcywgdjogdiwgYTogYX0pO1xufTtcblxuLypcbiAgQ29uc3RydWN0b3I6IENocm9tYXRoLmhzdmFcbiAgQWxpYXMgZm9yIDxDaHJvbWF0aC5oc3Y+XG4qL1xuQ2hyb21hdGguaHN2YSA9IENocm9tYXRoLmhzdjtcblxuLypcbiAgQ29uc3RydWN0b3I6IENocm9tYXRoLmhzYlxuICBBbGlhcyBmb3IgPENocm9tYXRoLmhzdj5cbiAqL1xuQ2hyb21hdGguaHNiID0gQ2hyb21hdGguaHN2O1xuXG4vKlxuICAgQ29uc3RydWN0b3I6IENocm9tYXRoLmhzYmFcbiAgIEFsaWFzIGZvciA8Q2hyb21hdGguaHN2YT5cbiAqL1xuQ2hyb21hdGguaHNiYSA9IENocm9tYXRoLmhzdmE7XG5cbi8vIEdyb3VwOiBTdGF0aWMgbWV0aG9kcyAtIHJlcHJlc2VudGF0aW9uXG4vKlxuICBNZXRob2Q6IENocm9tYXRoLnRvSW50ZWdlclxuICBDb252ZXJ0IGEgY29sb3IgaW50byBhbiBpbnRlZ2VyIChhbHBoYSBjaGFubmVsIGN1cnJlbnRseSBvbWl0dGVkKVxuXG4gIFBhcmFtZXRlcnM6XG4gIGNvbG9yIC0gQWNjZXB0cyB0aGUgc2FtZSBhcmd1bWVudHMgYXMgdGhlIENocm9tYXRoIGNvbnN0cnVjdG9yXG5cbiAgUmV0dXJuczpcbiAgaW50ZWdlclxuXG4gIEV4YW1wbGVzOlxuICA+ID4gQ2hyb21hdGgudG9JbnRlZ2VyKCdncmVlbicpO1xuICA+IDMyNzY4XG5cbiAgPiA+IENocm9tYXRoLnRvSW50ZWdlcignd2hpdGUnKTtcbiAgPiAxNjc3NzIxNVxuKi9cbkNocm9tYXRoLnRvSW50ZWdlciA9IGZ1bmN0aW9uIChjb2xvcilcbntcbiAgICAvLyBjcmVhdGUgc29tZXRoaW5nIGxpa2UgJzAwODAwMCcgKGdyZWVuKVxuICAgIHZhciBoZXg2ID0gbmV3IENocm9tYXRoKGNvbG9yKS5oZXgoKS5qb2luKCcnKTtcblxuICAgIC8vIEFyZ3VtZW50cyBiZWdpbm5pbmcgd2l0aCBgMHhgIGFyZSB0cmVhdGVkIGFzIGhleCB2YWx1ZXNcbiAgICByZXR1cm4gTnVtYmVyKCcweCcgKyBoZXg2KTtcbn07XG5cbi8qXG4gIE1ldGhvZDogQ2hyb21hdGgudG9OYW1lXG4gIFJldHVybiB0aGUgVzNDIGNvbG9yIG5hbWUgb2YgdGhlIGNvbG9yIGl0IG1hdGNoZXNcblxuICBQYXJhbWV0ZXJzOlxuICBjb21wYXJpc29uXG5cbiAgRXhhbXBsZXM6XG4gID4gPiBDaHJvbWF0aC50b05hbWUoJ3JnYigyNTUsIDAsIDI1NSknKTtcbiAgPiAnZnVjaHNpYSdcblxuICA+ID4gQ2hyb21hdGgudG9OYW1lKDY1NTM1KTtcbiAgPiAnYXF1YSdcbiovXG5DaHJvbWF0aC50b05hbWUgPSBmdW5jdGlvbiAoY29tcGFyaXNvbilcbntcbiAgICBjb21wYXJpc29uID0gK25ldyBDaHJvbWF0aChjb21wYXJpc29uKTtcbiAgICBmb3IgKHZhciBjb2xvciBpbiBDaHJvbWF0aC5jb2xvcnMpIGlmICgrQ2hyb21hdGhbY29sb3JdID09IGNvbXBhcmlzb24pIHJldHVybiBjb2xvcjtcbn07XG5cbi8vIEdyb3VwOiBTdGF0aWMgbWV0aG9kcyAtIGNvbG9yIGNvbnZlcnNpb25cbi8qXG4gIE1ldGhvZDogQ2hyb21hdGgucmdiMmhleFxuICBDb252ZXJ0IGFuIFJHQiB2YWx1ZSB0byBhIEhleCB2YWx1ZVxuXG4gIFJldHVybnM6IGFycmF5XG5cbiAgRXhhbXBsZTpcbiAgPiA+IENocm9tYXRoLnJnYjJoZXgoNTAsIDEwMCwgMTUwKVxuICA+IFwiWzMyLCA2NCwgOTZdXCJcbiAqL1xuQ2hyb21hdGgucmdiMmhleCA9IGZ1bmN0aW9uIHJnYjJoZXgociwgZywgYilcbntcbiAgICB2YXIgcmdiID0gdXRpbC5yZ2Iuc2NhbGVkMDEociwgZywgYik7XG4gICAgdmFyIGhleCA9IHJnYi5tYXAoZnVuY3Rpb24gKHBjdCkge1xuICAgICAgdmFyIGRlYyA9IE1hdGgucm91bmQocGN0ICogMjU1KTtcbiAgICAgIHZhciBoZXggPSBkZWMudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCk7XG4gICAgICByZXR1cm4gdXRpbC5scGFkKGhleCwgMiwgMCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gaGV4O1xufTtcblxuLy8gQ29udmVydGVkIGZyb20gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9IU0xfYW5kX0hTViNHZW5lcmFsX2FwcHJvYWNoXG4vKlxuICBNZXRob2Q6IENocm9tYXRoLnJnYjJoc2xcbiAgQ29udmVydCBSR0IgdG8gSFNMXG5cbiAgUGFyYW1ldGVyczpcbiAgciAtIE51bWJlciwgMC0yNTUsIHJlcHJlc2VudGluZyB0aGUgZ3JlZW4gY2hhbm5lbCBPUiBBcnJheSBPUiBvYmplY3QgKHdpdGgga2V5cyByLGcsYikgb2YgUkdCIHZhbHVlc1xuICBnIC0gTnVtYmVyLCAwLTI1NSwgcmVwcmVzZW50aW5nIHRoZSBncmVlbiBjaGFubmVsXG4gIGIgLSBOdW1iZXIsIDAtMjU1LCByZXByZXNlbnRpbmcgdGhlIHJlZCBjaGFubmVsXG5cbiAgUmV0dXJuczogYXJyYXlcblxuICA+ID4gQ2hyb21hdGgucmdiMmhzbCgwLCAyNTUsIDApO1xuICA+IFsgMTIwLCAxLCAwLjUgXVxuXG4gID4gPiBDaHJvbWF0aC5yZ2IyaHNsKFswLCAwLCAyNTVdKTtcbiAgPiBbIDI0MCwgMSwgMC41IF1cblxuICA+ID4gQ2hyb21hdGgucmdiMmhzbCh7cjogMjU1LCBnOiAwLCBiOiAwfSk7XG4gID4gWyAwLCAxLCAwLjUgXVxuICovXG5DaHJvbWF0aC5yZ2IyaHNsID0gZnVuY3Rpb24gcmdiMmhzbChyLCBnLCBiKVxue1xuICAgIHZhciByZ2IgPSB1dGlsLnJnYi5zY2FsZWQwMShyLCBnLCBiKTtcbiAgICByID0gcmdiWzBdLCBnID0gcmdiWzFdLCBiID0gcmdiWzJdO1xuXG4gICAgdmFyIE0gPSBNYXRoLm1heChyLCBnLCBiKTtcbiAgICB2YXIgbSA9IE1hdGgubWluKHIsIGcsIGIpO1xuICAgIHZhciBDID0gTSAtIG07XG4gICAgdmFyIEwgPSAwLjUqKE0gKyBtKTtcbiAgICB2YXIgUyA9IChDID09PSAwKSA/IDAgOiBDLygxLU1hdGguYWJzKDIqTC0xKSk7XG5cbiAgICB2YXIgaDtcbiAgICBpZiAoQyA9PT0gMCkgaCA9IDA7IC8vIHNwZWMnZCBhcyB1bmRlZmluZWQsIGJ1dCB1c3VhbGx5IHNldCB0byAwXG4gICAgZWxzZSBpZiAoTSA9PT0gcikgaCA9ICgoZy1iKS9DKSAlIDY7XG4gICAgZWxzZSBpZiAoTSA9PT0gZykgaCA9ICgoYi1yKS9DKSArIDI7XG4gICAgZWxzZSBpZiAoTSA9PT0gYikgaCA9ICgoci1nKS9DKSArIDQ7XG5cbiAgICB2YXIgSCA9IDYwICogaDtcblxuICAgIHJldHVybiBbSCwgcGFyc2VGbG9hdChTKSwgcGFyc2VGbG9hdChMKV07XG59O1xuXG4vKlxuICBNZXRob2Q6IENocm9tYXRoLnJnYjJoc3ZcbiAgQ29udmVydCBSR0IgdG8gSFNWXG5cbiAgUGFyYW1ldGVyczpcbiAgciAtIE51bWJlciwgMC0yNTUsIHJlcHJlc2VudGluZyB0aGUgZ3JlZW4gY2hhbm5lbCBPUiBBcnJheSBPUiBvYmplY3QgKHdpdGgga2V5cyByLGcsYikgb2YgUkdCIHZhbHVlc1xuICBnIC0gTnVtYmVyLCAwLTI1NSwgcmVwcmVzZW50aW5nIHRoZSBncmVlbiBjaGFubmVsXG4gIGIgLSBOdW1iZXIsIDAtMjU1LCByZXByZXNlbnRpbmcgdGhlIHJlZCBjaGFubmVsXG5cbiAgUmV0dXJuczpcbiAgQXJyYXlcblxuICA+ID4gQ2hyb21hdGgucmdiMmhzdigwLCAyNTUsIDApO1xuICA+IFsgMTIwLCAxLCAxIF1cblxuICA+ID4gQ2hyb21hdGgucmdiMmhzdihbMCwgMCwgMjU1XSk7XG4gID4gWyAyNDAsIDEsIDEgXVxuXG4gID4gPiBDaHJvbWF0aC5yZ2IyaHN2KHtyOiAyNTUsIGc6IDAsIGI6IDB9KTtcbiAgPiBbIDAsIDEsIDEgXVxuICovXG5DaHJvbWF0aC5yZ2IyaHN2ID0gZnVuY3Rpb24gcmdiMmhzdihyLCBnLCBiKVxue1xuICAgIHZhciByZ2IgPSB1dGlsLnJnYi5zY2FsZWQwMShyLCBnLCBiKTtcbiAgICByID0gcmdiWzBdLCBnID0gcmdiWzFdLCBiID0gcmdiWzJdO1xuXG4gICAgdmFyIE0gPSBNYXRoLm1heChyLCBnLCBiKTtcbiAgICB2YXIgbSA9IE1hdGgubWluKHIsIGcsIGIpO1xuICAgIHZhciBDID0gTSAtIG07XG4gICAgdmFyIEwgPSBNO1xuICAgIHZhciBTID0gKEMgPT09IDApID8gMCA6IEMvTTtcblxuICAgIHZhciBoO1xuICAgIGlmIChDID09PSAwKSBoID0gMDsgLy8gc3BlYydkIGFzIHVuZGVmaW5lZCwgYnV0IHVzdWFsbHkgc2V0IHRvIDBcbiAgICBlbHNlIGlmIChNID09PSByKSBoID0gKChnLWIpL0MpICUgNjtcbiAgICBlbHNlIGlmIChNID09PSBnKSBoID0gKChiLXIpL0MpICsgMjtcbiAgICBlbHNlIGlmIChNID09PSBiKSBoID0gKChyLWcpL0MpICsgNDtcblxuICAgIHZhciBIID0gNjAgKiBoO1xuXG4gICAgcmV0dXJuIFtILCBwYXJzZUZsb2F0KFMpLCBwYXJzZUZsb2F0KEwpXTtcbn07XG5cbi8qXG4gICBNZXRob2Q6IENocm9tYXRoLnJnYjJoc2JcbiAgIEFsaWFzIGZvciA8Q2hyb21hdGgucmdiMmhzdj5cbiAqL1xuQ2hyb21hdGgucmdiMmhzYiA9IENocm9tYXRoLnJnYjJoc3Y7XG5cbi8qXG4gIE1ldGhvZDogQ2hyb21hdGguaHNsMnJnYlxuICBDb252ZXJ0IGZyb20gSFNMIHRvIFJHQlxuXG4gIFBhcmFtZXRlcnM6XG4gIGggLSBOdW1iZXIsIC1JbmZpbml0eSAtIEluZmluaXR5LCByZXByZXNlbnRpbmcgdGhlIGh1ZSBPUiBBcnJheSBPUiBvYmplY3QgKHdpdGgga2V5cyBoLHMsbCkgb2YgSFNMIHZhbHVlc1xuICBzIC0gTnVtYmVyLCAwLTEsIHJlcHJlc2VudGluZyB0aGUgc2F0dXJhdGlvblxuICBsIC0gTnVtYmVyLCAwLTEsIHJlcHJlc2VudGluZyB0aGUgbGlnaHRuZXNzXG5cbiAgUmV0dXJuczpcbiAgYXJyYXlcblxuICBFeGFtcGxlczpcbiAgPiA+IENocm9tYXRoLmhzbDJyZ2IoMzYwLCAxLCAwLjUpO1xuICA+IFsgMjU1LCAwLCAwIF1cblxuICA+ID4gQ2hyb21hdGguaHNsMnJnYihbMCwgMSwgMC41XSk7XG4gID4gWyAyNTUsIDAsIDAgXVxuXG4gID4gPiBDaHJvbWF0aC5oc2wycmdiKHtoOiAyMTAsIHM6MSwgdjogMC41fSk7XG4gID4gWyAwLCAxMjcuNSwgMjU1IF1cbiAqL1xuLy8gVE9ETzogQ2FuIEkgJT0gaHAgYW5kIHRoZW4gZG8gYSBzd2l0Y2g/XG5DaHJvbWF0aC5oc2wycmdiID0gZnVuY3Rpb24gaHNsMnJnYihoLCBzLCBsKVxue1xuICAgIHZhciBoc2wgPSB1dGlsLmhzbC5zY2FsZWQoaCwgcywgbCk7XG4gICAgaD1oc2xbMF0sIHM9aHNsWzFdLCBsPWhzbFsyXTtcblxuICAgIHZhciBDID0gKDEgLSBNYXRoLmFicygyKmwtMSkpICogcztcbiAgICB2YXIgaHAgPSBoLzYwO1xuICAgIHZhciBYID0gQyAqICgxLU1hdGguYWJzKGhwJTItMSkpO1xuICAgIHZhciByZ2IsIG07XG5cbiAgICBzd2l0Y2ggKE1hdGguZmxvb3IoaHApKXtcbiAgICBjYXNlIDA6ICByZ2IgPSBbQyxYLDBdOyBicmVhaztcbiAgICBjYXNlIDE6ICByZ2IgPSBbWCxDLDBdOyBicmVhaztcbiAgICBjYXNlIDI6ICByZ2IgPSBbMCxDLFhdOyBicmVhaztcbiAgICBjYXNlIDM6ICByZ2IgPSBbMCxYLENdOyBicmVhaztcbiAgICBjYXNlIDQ6ICByZ2IgPSBbWCwwLENdOyBicmVhaztcbiAgICBjYXNlIDU6ICByZ2IgPSBbQywwLFhdOyBicmVhaztcbiAgICBkZWZhdWx0OiByZ2IgPSBbMCwwLDBdO1xuICAgIH1cblxuICAgIG0gPSBsIC0gKEMvMik7XG5cbiAgICByZXR1cm4gW1xuICAgICAgICAocmdiWzBdK20pLFxuICAgICAgICAocmdiWzFdK20pLFxuICAgICAgICAocmdiWzJdK20pXG4gICAgXTtcbn07XG5cbi8qXG4gIE1ldGhvZDogQ2hyb21hdGguaHN2MnJnYlxuICBDb252ZXJ0IEhTViB0byBSR0JcblxuICBQYXJhbWV0ZXJzOlxuICBoIC0gTnVtYmVyLCAtSW5maW5pdHkgLSBJbmZpbml0eSwgcmVwcmVzZW50aW5nIHRoZSBodWUgT1IgQXJyYXkgT1Igb2JqZWN0ICh3aXRoIGtleXMgaCxzLHYgb3IgaCxzLGIpIG9mIEhTViB2YWx1ZXNcbiAgcyAtIE51bWJlciwgMC0xLCByZXByZXNlbnRpbmcgdGhlIHNhdHVyYXRpb25cbiAgdiAtIE51bWJlciwgMC0xLCByZXByZXNlbnRpbmcgdGhlIGxpZ2h0bmVzc1xuXG4gIEV4YW1wbGVzOlxuICA+ID4gQ2hyb21hdGguaHN2MnJnYigzNjAsIDEsIDEpO1xuICA+IFsgMjU1LCAwLCAwIF1cblxuICA+ID4gQ2hyb21hdGguaHN2MnJnYihbMCwgMSwgMC41XSk7XG4gID4gWyAxMjcuNSwgMCwgMCBdXG5cbiAgPiA+IENocm9tYXRoLmhzdjJyZ2Ioe2g6IDIxMCwgczogMC41LCB2OiAxfSk7XG4gID4gWyAxMjcuNSwgMTkxLjI1LCAyNTUgXVxuICovXG5DaHJvbWF0aC5oc3YycmdiID0gZnVuY3Rpb24gaHN2MnJnYihoLCBzLCB2KVxue1xuICAgIHZhciBoc3YgPSB1dGlsLmhzbC5zY2FsZWQoaCwgcywgdik7XG4gICAgaD1oc3ZbMF0sIHM9aHN2WzFdLCB2PWhzdlsyXTtcblxuICAgIHZhciBDID0gdiAqIHM7XG4gICAgdmFyIGhwID0gaC82MDtcbiAgICB2YXIgWCA9IEMqKDEtTWF0aC5hYnMoaHAlMi0xKSk7XG4gICAgdmFyIHJnYiwgbTtcblxuICAgIGlmIChoID09IHVuZGVmaW5lZCkgICAgICAgICByZ2IgPSBbMCwwLDBdO1xuICAgIGVsc2UgaWYgKDAgPD0gaHAgJiYgaHAgPCAxKSByZ2IgPSBbQyxYLDBdO1xuICAgIGVsc2UgaWYgKDEgPD0gaHAgJiYgaHAgPCAyKSByZ2IgPSBbWCxDLDBdO1xuICAgIGVsc2UgaWYgKDIgPD0gaHAgJiYgaHAgPCAzKSByZ2IgPSBbMCxDLFhdO1xuICAgIGVsc2UgaWYgKDMgPD0gaHAgJiYgaHAgPCA0KSByZ2IgPSBbMCxYLENdO1xuICAgIGVsc2UgaWYgKDQgPD0gaHAgJiYgaHAgPCA1KSByZ2IgPSBbWCwwLENdO1xuICAgIGVsc2UgaWYgKDUgPD0gaHAgJiYgaHAgPCA2KSByZ2IgPSBbQywwLFhdO1xuXG4gICAgbSA9IHYgLSBDO1xuXG4gICAgcmV0dXJuIFtcbiAgICAgICAgKHJnYlswXSttKSxcbiAgICAgICAgKHJnYlsxXSttKSxcbiAgICAgICAgKHJnYlsyXSttKVxuICAgIF07XG59O1xuXG4vKlxuICAgTWV0aG9kOiBDaHJvbWF0aC5oc2IycmdiXG4gICBBbGlhcyBmb3IgPENocm9tYXRoLmhzdjJyZ2I+XG4gKi9cbkNocm9tYXRoLmhzYjJyZ2IgPSBDaHJvbWF0aC5oc3YycmdiO1xuXG4vKlxuICAgIFByb3BlcnR5OiBDaHJvbWF0aC5jb252ZXJ0XG4gICAgQWxpYXNlcyBmb3IgdGhlIENocm9tYXRoLngyeSBmdW5jdGlvbnMuXG4gICAgVXNlIGxpa2UgQ2hyb21hdGguY29udmVydFt4XVt5XShhcmdzKSBvciBDaHJvbWF0aC5jb252ZXJ0LngueShhcmdzKVxuKi9cbkNocm9tYXRoLmNvbnZlcnQgPSB7XG4gICAgcmdiOiB7XG4gICAgICAgIGhleDogQ2hyb21hdGguaHN2MnJnYixcbiAgICAgICAgaHNsOiBDaHJvbWF0aC5yZ2IyaHNsLFxuICAgICAgICBoc3Y6IENocm9tYXRoLnJnYjJoc3ZcbiAgICB9LFxuICAgIGhzbDoge1xuICAgICAgICByZ2I6IENocm9tYXRoLmhzbDJyZ2JcbiAgICB9LFxuICAgIGhzdjoge1xuICAgICAgICByZ2I6IENocm9tYXRoLmhzdjJyZ2JcbiAgICB9XG59O1xuXG4vKiBHcm91cDogU3RhdGljIG1ldGhvZHMgLSBjb2xvciBzY2hlbWUgKi9cbi8qXG4gIE1ldGhvZDogQ2hyb21hdGguY29tcGxlbWVudFxuICBSZXR1cm4gdGhlIGNvbXBsZW1lbnQgb2YgdGhlIGdpdmVuIGNvbG9yXG5cbiAgUmV0dXJuczogPENocm9tYXRoPlxuXG4gID4gPiBDaHJvbWF0aC5jb21wbGVtZW50KG5ldyBDaHJvbWF0aCgncmVkJykpO1xuICA+IHsgcjogMCwgZzogMjU1LCBiOiAyNTUsIGE6IDEsIGg6IDE4MCwgc2w6IDEsIHN2OiAxLCBsOiAwLjUsIHY6IDEgfVxuXG4gID4gPiBDaHJvbWF0aC5jb21wbGVtZW50KG5ldyBDaHJvbWF0aCgncmVkJykpLnRvU3RyaW5nKCk7XG4gID4gJyMwMEZGRkYnXG4gKi9cbkNocm9tYXRoLmNvbXBsZW1lbnQgPSBmdW5jdGlvbiAoY29sb3IpXG57XG4gICAgdmFyIGMgPSBuZXcgQ2hyb21hdGgoY29sb3IpO1xuICAgIHZhciBoc2wgPSBjLnRvSFNMT2JqZWN0KCk7XG5cbiAgICBoc2wuaCA9IChoc2wuaCArIDE4MCkgJSAzNjA7XG5cbiAgICByZXR1cm4gbmV3IENocm9tYXRoKGhzbCk7XG59O1xuXG4vKlxuICBNZXRob2Q6IENocm9tYXRoLnRyaWFkXG4gIENyZWF0ZSBhIHRyaWFkIGNvbG9yIHNjaGVtZSBmcm9tIHRoZSBnaXZlbiBDaHJvbWF0aC5cblxuICBFeGFtcGxlczpcbiAgPiA+IENocm9tYXRoLnRyaWFkKENocm9tYXRoLnllbGxvdylcbiAgPiBbIHsgcjogMjU1LCBnOiAyNTUsIGI6IDAsIGE6IDEsIGg6IDYwLCBzbDogMSwgc3Y6IDEsIGw6IDAuNSwgdjogMSB9LFxuICA+ICAgeyByOiAwLCBnOiAyNTUsIGI6IDI1NSwgYTogMSwgaDogMTgwLCBzbDogMSwgc3Y6IDEsIGw6IDAuNSwgdjogMSB9LFxuICA+ICAgeyByOiAyNTUsIGc6IDAsIGI6IDI1NSwgYTogMSwgaDogMzAwLCBzbDogMSwgc3Y6IDEsIGw6IDAuNSwgdjogMSB9IF1cblxuID4gPiBDaHJvbWF0aC50cmlhZChDaHJvbWF0aC55ZWxsb3cpLnRvU3RyaW5nKCk7XG4gPiAnI0ZGRkYwMCwjMDBGRkZGLCNGRjAwRkYnXG4qL1xuQ2hyb21hdGgudHJpYWQgPSBmdW5jdGlvbiAoY29sb3IpXG57XG4gICAgdmFyIGMgPSBuZXcgQ2hyb21hdGgoY29sb3IpO1xuXG4gICAgcmV0dXJuIFtcbiAgICAgICAgYyxcbiAgICAgICAgbmV3IENocm9tYXRoKHtyOiBjLmIsIGc6IGMuciwgYjogYy5nfSksXG4gICAgICAgIG5ldyBDaHJvbWF0aCh7cjogYy5nLCBnOiBjLmIsIGI6IGMucn0pXG4gICAgXTtcbn07XG5cbi8qXG4gIE1ldGhvZDogQ2hyb21hdGgudGV0cmFkXG4gIENyZWF0ZSBhIHRldHJhZCBjb2xvciBzY2hlbWUgZnJvbSB0aGUgZ2l2ZW4gQ2hyb21hdGguXG5cbiAgRXhhbXBsZXM6XG4gID4gPiBDaHJvbWF0aC50ZXRyYWQoQ2hyb21hdGguY3lhbilcbiAgPiBbIHsgcjogMCwgZzogMjU1LCBiOiAyNTUsIGE6IDEsIGg6IDE4MCwgc2w6IDEsIHN2OiAxLCBsOiAwLjUsIHY6IDEgfSxcbiAgPiAgIHsgcjogMjU1LCBnOiAwLCBiOiAyNTUsIGE6IDEsIGg6IDMwMCwgc2w6IDEsIHN2OiAxLCBsOiAwLjUsIHY6IDEgfSxcbiAgPiAgIHsgcjogMjU1LCBnOiAyNTUsIGI6IDAsIGE6IDEsIGg6IDYwLCBzbDogMSwgc3Y6IDEsIGw6IDAuNSwgdjogMSB9LFxuICA+ICAgeyByOiAwLCBnOiAyNTUsIGI6IDAsIGE6IDEsIGg6IDEyMCwgc2w6IDEsIHN2OiAxLCBsOiAwLjUsIHY6IDEgfSBdXG5cbiAgPiA+IENocm9tYXRoLnRldHJhZChDaHJvbWF0aC5jeWFuKS50b1N0cmluZygpO1xuICA+ICcjMDBGRkZGLCNGRjAwRkYsI0ZGRkYwMCwjMDBGRjAwJ1xuKi9cbkNocm9tYXRoLnRldHJhZCA9IGZ1bmN0aW9uIChjb2xvcilcbntcbiAgICB2YXIgYyA9IG5ldyBDaHJvbWF0aChjb2xvcik7XG5cbiAgICByZXR1cm4gW1xuICAgICAgICBjLFxuICAgICAgICBuZXcgQ2hyb21hdGgoe3I6IGMuYiwgZzogYy5yLCBiOiBjLmJ9KSxcbiAgICAgICAgbmV3IENocm9tYXRoKHtyOiBjLmIsIGc6IGMuZywgYjogYy5yfSksXG4gICAgICAgIG5ldyBDaHJvbWF0aCh7cjogYy5yLCBnOiBjLmIsIGI6IGMucn0pXG4gICAgXTtcbn07XG5cbi8qXG4gIE1ldGhvZDogQ2hyb21hdGguYW5hbG9nb3VzXG4gIEZpbmQgYW5hbG9nb3VzIGNvbG9ycyBmcm9tIGEgZ2l2ZW4gY29sb3JcblxuICBQYXJhbWV0ZXJzOlxuICBtaXhlZCAtIEFueSBhcmd1bWVudCB3aGljaCBpcyBwYXNzZWQgdG8gPENocm9tYXRoPlxuICByZXN1bHRzIC0gSG93IG1hbnkgY29sb3JzIHRvIHJldHVybiAoZGVmYXVsdCA9IDMpXG4gIHNsaWNlcyAtIEhvdyBtYW55IHBpZWNlcyBhcmUgaW4gdGhlIGNvbG9yIHdoZWVsIChkZWZhdWx0ID0gMTIpXG5cbiAgRXhhbXBsZXM6XG4gID4gPiBDaHJvbWF0aC5hbmFsb2dvdXMobmV3IENocm9tYXRoKCdyZ2IoMCwgMjU1LCAyNTUpJykpXG4gID4gWyB7IHI6IDAsIGc6IDI1NSwgYjogMjU1LCBhOiAxLCBoOiAxODAsIHNsOiAxLCBzdjogMSwgbDogMC41LCB2OiAxIH0sXG4gID4gICB7IHI6IDAsIGc6IDI1NSwgYjogMTAxLCBhOiAxLCBoOiAxNDQsIHNsOiAxLCBzdjogMSwgbDogMC41LCB2OiAxIH0sXG4gID4gICB7IHI6IDAsIGc6IDI1NSwgYjogMTUzLCBhOiAxLCBoOiAxNTYsIHNsOiAxLCBzdjogMSwgbDogMC41LCB2OiAxIH0sXG4gID4gICB7IHI6IDAsIGc6IDI1NSwgYjogMjAzLCBhOiAxLCBoOiAxNjgsIHNsOiAxLCBzdjogMSwgbDogMC41LCB2OiAxIH0sXG4gID4gICB7IHI6IDAsIGc6IDI1NSwgYjogMjU1LCBhOiAxLCBoOiAxODAsIHNsOiAxLCBzdjogMSwgbDogMC41LCB2OiAxIH0sXG4gID4gICB7IHI6IDAsIGc6IDIwMywgYjogMjU1LCBhOiAxLCBoOiAxOTIsIHNsOiAxLCBzdjogMSwgbDogMC41LCB2OiAxIH0sXG4gID4gICB7IHI6IDAsIGc6IDE1MywgYjogMjU1LCBhOiAxLCBoOiAyMDQsIHNsOiAxLCBzdjogMSwgbDogMC41LCB2OiAxIH0sXG4gID4gICB7IHI6IDAsIGc6IDEwMSwgYjogMjU1LCBhOiAxLCBoOiAyMTYsIHNsOiAxLCBzdjogMSwgbDogMC41LCB2OiAxIH0gXVxuXG4gID4gPiBDaHJvbWF0aC5hbmFsb2dvdXMobmV3IENocm9tYXRoKCdyZ2IoMCwgMjU1LCAyNTUpJykpLnRvU3RyaW5nKClcbiAgPiAnIzAwRkZGRiwjMDBGRjY1LCMwMEZGOTksIzAwRkZDQiwjMDBGRkZGLCMwMENCRkYsIzAwOTlGRiwjMDA2NUZGJ1xuICovXG5DaHJvbWF0aC5hbmFsb2dvdXMgPSBmdW5jdGlvbiAoY29sb3IsIHJlc3VsdHMsIHNsaWNlcylcbntcbiAgICBpZiAoIWlzRmluaXRlKHJlc3VsdHMpKSByZXN1bHRzID0gMztcbiAgICBpZiAoIWlzRmluaXRlKHNsaWNlcykpIHNsaWNlcyA9IDEyO1xuXG4gICAgdmFyIGMgPSBuZXcgQ2hyb21hdGgoY29sb3IpO1xuICAgIHZhciBoc3YgPSBjLnRvSFNWT2JqZWN0KCk7XG4gICAgdmFyIHNsaWNlID0gMzYwIC8gc2xpY2VzO1xuICAgIHZhciByZXQgPSBbIGMgXTtcblxuICAgIGhzdi5oID0gKChoc3YuaCAtIChzbGljZXMgKiByZXN1bHRzID4+IDEpKSArIDcyMCkgJSAzNjA7XG4gICAgd2hpbGUgKC0tcmVzdWx0cykge1xuICAgICAgICBoc3YuaCA9IChoc3YuaCArIHNsaWNlKSAlIDM2MDtcbiAgICAgICAgcmV0LnB1c2gobmV3IENocm9tYXRoKGhzdikpO1xuICAgIH1cblxuICAgIHJldHVybiByZXQ7XG59O1xuXG4vKlxuICBNZXRob2Q6IENocm9tYXRoLm1vbm9jaHJvbWF0aWNcbiAgUmV0dXJuIGEgc2VyaWVzIG9mIHRoZSBnaXZlbiBjb2xvciBhdCB2YXJpb3VzIGxpZ2h0bmVzc2VzXG5cbiAgRXhhbXBsZXM6XG4gID4gPiBDaHJvbWF0aC5tb25vY2hyb21hdGljKCdyZ2IoMCwgMTAwLCAyNTUpJykuZm9yRWFjaChmdW5jdGlvbiAoYyl7IGNvbnNvbGUubG9nKGMudG9IU1ZTdHJpbmcoKSk7IH0pXG4gID4gaHN2KDIxNiwxMDAlLDIwJSlcbiAgPiBoc3YoMjE2LDEwMCUsNDAlKVxuICA+IGhzdigyMTYsMTAwJSw2MCUpXG4gID4gaHN2KDIxNiwxMDAlLDgwJSlcbiAgPiBoc3YoMjE2LDEwMCUsMTAwJSlcbiovXG5DaHJvbWF0aC5tb25vY2hyb21hdGljID0gZnVuY3Rpb24gKGNvbG9yLCByZXN1bHRzKVxue1xuICAgIGlmICghcmVzdWx0cykgcmVzdWx0cyA9IDU7XG5cbiAgICB2YXIgYyA9IG5ldyBDaHJvbWF0aChjb2xvcik7XG4gICAgdmFyIGhzdiA9IGMudG9IU1ZPYmplY3QoKTtcbiAgICB2YXIgaW5jID0gMSAvIHJlc3VsdHM7XG4gICAgdmFyIHJldCA9IFtdLCBzdGVwID0gMDtcblxuICAgIHdoaWxlIChzdGVwKysgPCByZXN1bHRzKSB7XG4gICAgICAgIGhzdi52ID0gc3RlcCAqIGluYztcbiAgICAgICAgcmV0LnB1c2gobmV3IENocm9tYXRoKGhzdikpO1xuICAgIH1cblxuICAgIHJldHVybiByZXQ7XG59O1xuXG4vKlxuICBNZXRob2Q6IENocm9tYXRoLnNwbGl0Y29tcGxlbWVudFxuICBHZW5lcmF0ZSBhIHNwbGl0IGNvbXBsZW1lbnQgY29sb3Igc2NoZW1lIGZyb20gdGhlIGdpdmVuIGNvbG9yXG5cbiAgRXhhbXBsZXM6XG4gID4gPiBDaHJvbWF0aC5zcGxpdGNvbXBsZW1lbnQoJ3JnYigwLCAxMDAsIDI1NSknKVxuICA+IFsgeyByOiAwLCBnOiAxMDAsIGI6IDI1NSwgaDogMjE2LjQ3MDU4ODIzNTI5NDE0LCBzbDogMSwgbDogMC41LCBzdjogMSwgdjogMSwgYTogMSB9LFxuICA+ICAgeyByOiAyNTUsIGc6IDE4MywgYjogMCwgaDogNDMuMTk5OTk5OTk5OTk5OTksIHNsOiAxLCBsOiAwLjUsIHN2OiAxLCB2OiAxLCBhOiAxIH0sXG4gID4gICB7IHI6IDI1NSwgZzogNzMsIGI6IDAsIGg6IDE3LjI3OTk5OTk5OTk5OTk3Mywgc2w6IDEsIGw6IDAuNSwgc3Y6IDEsIHY6IDEsIGE6IDEgfSBdXG5cbiAgPiA+IENocm9tYXRoLnNwbGl0Y29tcGxlbWVudCgncmdiKDAsIDEwMCwgMjU1KScpLnRvU3RyaW5nKClcbiAgPiAnIzAwNjRGRiwjRkZCNzAwLCNGRjQ5MDAnXG4gKi9cbkNocm9tYXRoLnNwbGl0Y29tcGxlbWVudCA9IGZ1bmN0aW9uIChjb2xvcilcbntcbiAgICB2YXIgcmVmID0gbmV3IENocm9tYXRoKGNvbG9yKTtcbiAgICB2YXIgaHN2ID0gcmVmLnRvSFNWT2JqZWN0KCk7XG5cbiAgICB2YXIgYSA9IG5ldyBDaHJvbWF0aC5oc3Yoe1xuICAgICAgICBoOiAoaHN2LmggKyAxNTApICUgMzYwLFxuICAgICAgICBzOiBoc3YucyxcbiAgICAgICAgdjogaHN2LnZcbiAgICB9KTtcblxuICAgIHZhciBiID0gbmV3IENocm9tYXRoLmhzdih7XG4gICAgICAgIGg6IChoc3YuaCArIDIxMCkgJSAzNjAsXG4gICAgICAgIHM6IGhzdi5zLFxuICAgICAgICB2OiBoc3YudlxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFtyZWYsIGEsIGJdO1xufTtcblxuLy9Hcm91cDogU3RhdGljIG1ldGhvZHMgLSBjb2xvciBhbHRlcmF0aW9uXG4vKlxuICBNZXRob2Q6IENocm9tYXRoLnRpbnRcbiAgTGlnaHRlbiBhIGNvbG9yIGJ5IGFkZGluZyBhIHBlcmNlbnRhZ2Ugb2Ygd2hpdGUgdG8gaXRcblxuICBSZXR1cm5zIDxDaHJvbWF0aD5cblxuICA+ID4gQ2hyb21hdGgudGludCgncmdiKDAsIDEwMCwgMjU1KScsIDAuNSkudG9SR0JTdHJpbmcoKTtcbiAgPiAncmdiKDEyNywxNzcsMjU1KSdcbiovXG5DaHJvbWF0aC50aW50ID0gZnVuY3Rpb24gKCBmcm9tLCBieSApXG57XG4gICAgcmV0dXJuIENocm9tYXRoLnRvd2FyZHMoIGZyb20sICcjRkZGRkZGJywgYnkgKTtcbn07XG5cbi8qXG4gICBNZXRob2Q6IENocm9tYXRoLmxpZ2h0ZW5cbiAgIEFsaWFzIGZvciA8Q2hyb21hdGgudGludD5cbiovXG5DaHJvbWF0aC5saWdodGVuID0gQ2hyb21hdGgudGludDtcblxuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC5zaGFkZVxuICBEYXJrZW4gYSBjb2xvciBieSBhZGRpbmcgYSBwZXJjZW50YWdlIG9mIGJsYWNrIHRvIGl0XG5cbiAgRXhhbXBsZTpcbiAgPiA+IENocm9tYXRoLmRhcmtlbigncmdiKDAsIDEwMCwgMjU1KScsIDAuNSkudG9SR0JTdHJpbmcoKTtcbiAgPiAncmdiKDAsNTAsMTI3KSdcbiAqL1xuQ2hyb21hdGguc2hhZGUgPSBmdW5jdGlvbiAoIGZyb20sIGJ5IClcbntcbiAgICByZXR1cm4gQ2hyb21hdGgudG93YXJkcyggZnJvbSwgJyMwMDAwMDAnLCBieSApO1xufTtcblxuLypcbiAgIE1ldGhvZDogQ2hyb21hdGguZGFya2VuXG4gICBBbGlhcyBmb3IgPENocm9tYXRoLnNoYWRlPlxuICovXG5DaHJvbWF0aC5kYXJrZW4gPSBDaHJvbWF0aC5zaGFkZTtcblxuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC5kZXNhdHVyYXRlXG4gIERlc2F0dXJhdGUgYSBjb2xvciB1c2luZyBhbnkgb2YgMyBhcHByb2FjaGVzXG5cbiAgUGFyYW1ldGVyczpcbiAgY29sb3IgLSBhbnkgYXJndW1lbnQgYWNjZXB0ZWQgYnkgdGhlIDxDaHJvbWF0aD4gY29uc3RydWN0b3JcbiAgZm9ybXVsYSAtIFRoZSBmb3JtdWxhIHRvIHVzZSAoZnJvbSA8eGFyZydzIGdyZXlmaWx0ZXIgYXQgaHR0cDovL3d3dy54YXJnLm9yZy9wcm9qZWN0L2pxdWVyeS1jb2xvci1wbHVnaW4teGNvbG9yPilcbiAgLSAxIC0geGFyZydzIG93biBmb3JtdWxhXG4gIC0gMiAtIFN1bidzIGZvcm11bGE6ICgxIC0gYXZnKSAvICgxMDAgLyAzNSkgKyBhdmcpXG4gIC0gZW1wdHkgLSBUaGUgb2Z0LXNlZW4gMzAlIHJlZCwgNTklIGdyZWVuLCAxMSUgYmx1ZSBmb3JtdWxhXG5cbiAgRXhhbXBsZXM6XG4gID4gPiBDaHJvbWF0aC5kZXNhdHVyYXRlKCdyZWQnKS50b1N0cmluZygpXG4gID4gXCIjNEM0QzRDXCJcblxuICA+ID4gQ2hyb21hdGguZGVzYXR1cmF0ZSgncmVkJywgMSkudG9TdHJpbmcoKVxuICA+IFwiIzM3MzczN1wiXG5cbiAgPiA+IENocm9tYXRoLmRlc2F0dXJhdGUoJ3JlZCcsIDIpLnRvU3RyaW5nKClcbiAgPiBcIiM5MDkwOTBcIlxuKi9cbkNocm9tYXRoLmRlc2F0dXJhdGUgPSBmdW5jdGlvbiAoY29sb3IsIGZvcm11bGEpXG57XG4gICAgdmFyIGMgPSBuZXcgQ2hyb21hdGgoY29sb3IpLCByZ2IsIGF2ZztcblxuICAgIHN3aXRjaCAoZm9ybXVsYSkge1xuICAgIGNhc2UgMTogLy8geGFyZydzIGZvcm11bGFcbiAgICAgICAgYXZnID0gLjM1ICsgMTMgKiAoYy5yICsgYy5nICsgYy5iKSAvIDYwOyBicmVhaztcbiAgICBjYXNlIDI6IC8vIFN1bidzIGZvcm11bGE6ICgxIC0gYXZnKSAvICgxMDAgLyAzNSkgKyBhdmcpXG4gICAgICAgIGF2ZyA9ICgxMyAqIChjLnIgKyBjLmcgKyBjLmIpICsgNTM1NSkgLyA2MDsgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgICAgYXZnID0gYy5yICogLjMgKyBjLmcgKiAuNTkgKyBjLmIgKiAuMTE7XG4gICAgfVxuXG4gICAgYXZnID0gdXRpbC5jbGFtcChhdmcsIDAsIDI1NSk7XG4gICAgcmdiID0ge3I6IGF2ZywgZzogYXZnLCBiOiBhdmd9O1xuXG4gICAgcmV0dXJuIG5ldyBDaHJvbWF0aChyZ2IpO1xufTtcblxuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC5ncmV5c2NhbGVcbiAgQWxpYXMgZm9yIDxDaHJvbWF0aC5kZXNhdHVyYXRlPlxuKi9cbkNocm9tYXRoLmdyZXlzY2FsZSA9IENocm9tYXRoLmRlc2F0dXJhdGU7XG5cbi8qXG4gIE1ldGhvZDogQ2hyb21hdGgud2Vic2FmZVxuICBDb252ZXJ0IGEgY29sb3IgdG8gb25lIG9mIHRoZSAyMTYgXCJ3ZWJzYWZlXCIgY29sb3JzXG5cbiAgRXhhbXBsZXM6XG4gID4gPiBDaHJvbWF0aC53ZWJzYWZlKCcjQUJDREVGJykudG9TdHJpbmcoKVxuICA+ICcjOTlDQ0ZGJ1xuXG4gID4gPiBDaHJvbWF0aC53ZWJzYWZlKCcjQkJDREVGJykudG9TdHJpbmcoKVxuICA+ICcjQ0NDQ0ZGJ1xuICovXG5DaHJvbWF0aC53ZWJzYWZlID0gZnVuY3Rpb24gKGNvbG9yKVxue1xuICAgIGNvbG9yID0gbmV3IENocm9tYXRoKGNvbG9yKTtcblxuICAgIGNvbG9yLnIgPSBNYXRoLnJvdW5kKGNvbG9yLnIgLyA1MSkgKiA1MTtcbiAgICBjb2xvci5nID0gTWF0aC5yb3VuZChjb2xvci5nIC8gNTEpICogNTE7XG4gICAgY29sb3IuYiA9IE1hdGgucm91bmQoY29sb3IuYiAvIDUxKSAqIDUxO1xuXG4gICAgcmV0dXJuIG5ldyBDaHJvbWF0aChjb2xvcik7XG59O1xuXG4vL0dyb3VwOiBTdGF0aWMgbWV0aG9kcyAtIGNvbG9yIGNvbWJpbmF0aW9uXG4vKlxuICBNZXRob2Q6IENocm9tYXRoLmFkZGl0aXZlXG4gIENvbWJpbmUgYW55IG51bWJlciBjb2xvcnMgdXNpbmcgYWRkaXRpdmUgY29sb3JcblxuICBFeGFtcGxlczpcbiAgPiA+IENocm9tYXRoLmFkZGl0aXZlKCcjRjAwJywgJyMwRjAnKS50b1N0cmluZygpO1xuICA+ICcjRkZGRjAwJ1xuXG4gID4gPiBDaHJvbWF0aC5hZGRpdGl2ZSgnI0YwMCcsICcjMEYwJykudG9TdHJpbmcoKSA9PSBDaHJvbWF0aC55ZWxsb3cudG9TdHJpbmcoKTtcbiAgPiB0cnVlXG5cbiAgPiA+IENocm9tYXRoLmFkZGl0aXZlKCdyZWQnLCAnIzBGMCcsICdyZ2IoMCwgMCwgMjU1KScpLnRvU3RyaW5nKCkgPT0gQ2hyb21hdGgud2hpdGUudG9TdHJpbmcoKTtcbiAgPiB0cnVlXG4gKi9cbkNocm9tYXRoLmFkZGl0aXZlID0gZnVuY3Rpb24gKClcbntcbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50cy5sZW5ndGgtMiwgaT0tMSwgYSwgYjtcbiAgICB3aGlsZSAoaSsrIDwgYXJncyl7XG5cbiAgICAgICAgYSA9IGEgfHwgbmV3IENocm9tYXRoKGFyZ3VtZW50c1tpXSk7XG4gICAgICAgIGIgPSBuZXcgQ2hyb21hdGgoYXJndW1lbnRzW2krMV0pO1xuXG4gICAgICAgIGlmICgoYS5yICs9IGIucikgPiAyNTUpIGEuciA9IDI1NTtcbiAgICAgICAgaWYgKChhLmcgKz0gYi5nKSA+IDI1NSkgYS5nID0gMjU1O1xuICAgICAgICBpZiAoKGEuYiArPSBiLmIpID4gMjU1KSBhLmIgPSAyNTU7XG5cbiAgICAgICAgYSA9IG5ldyBDaHJvbWF0aChhKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYTtcbn07XG5cbi8qXG4gIE1ldGhvZDogQ2hyb21hdGguc3VidHJhY3RpdmVcbiAgQ29tYmluZSBhbnkgbnVtYmVyIG9mIGNvbG9ycyB1c2luZyBzdWJ0cmFjdGl2ZSBjb2xvclxuXG4gIEV4YW1wbGVzOlxuICA+ID4gQ2hyb21hdGguc3VidHJhY3RpdmUoJ3llbGxvdycsICdtYWdlbnRhJykudG9TdHJpbmcoKTtcbiAgPiAnI0ZGMDAwMCdcblxuICA+ID4gQ2hyb21hdGguc3VidHJhY3RpdmUoJ3llbGxvdycsICdtYWdlbnRhJykudG9TdHJpbmcoKSA9PT0gQ2hyb21hdGgucmVkLnRvU3RyaW5nKCk7XG4gID4gdHJ1ZVxuXG4gID4gPiBDaHJvbWF0aC5zdWJ0cmFjdGl2ZSgnY3lhbicsICdtYWdlbnRhJywgJ3llbGxvdycpLnRvU3RyaW5nKCk7XG4gID4gJyMwMDAwMDAnXG5cbiAgPiA+IENocm9tYXRoLnN1YnRyYWN0aXZlKCdyZWQnLCAnIzBGMCcsICdyZ2IoMCwgMCwgMjU1KScpLnRvU3RyaW5nKCk7XG4gID4gJyMwMDAwMDAnXG4qL1xuQ2hyb21hdGguc3VidHJhY3RpdmUgPSBmdW5jdGlvbiAoKVxue1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzLmxlbmd0aC0yLCBpPS0xLCBhLCBiO1xuICAgIHdoaWxlIChpKysgPCBhcmdzKXtcblxuICAgICAgICBhID0gYSB8fCBuZXcgQ2hyb21hdGgoYXJndW1lbnRzW2ldKTtcbiAgICAgICAgYiA9IG5ldyBDaHJvbWF0aChhcmd1bWVudHNbaSsxXSk7XG5cbiAgICAgICAgaWYgKChhLnIgKz0gYi5yIC0gMjU1KSA8IDApIGEuciA9IDA7XG4gICAgICAgIGlmICgoYS5nICs9IGIuZyAtIDI1NSkgPCAwKSBhLmcgPSAwO1xuICAgICAgICBpZiAoKGEuYiArPSBiLmIgLSAyNTUpIDwgMCkgYS5iID0gMDtcblxuICAgICAgICBhID0gbmV3IENocm9tYXRoKGEpO1xuICAgIH1cblxuICAgIHJldHVybiBhO1xufTtcblxuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC5tdWx0aXBseVxuICBNdWx0aXBseSBhbnkgbnVtYmVyIG9mIGNvbG9yc1xuXG4gIEV4YW1wbGVzOlxuICA+ID4gQ2hyb21hdGgubXVsdGlwbHkoQ2hyb21hdGgubGlnaHRnb2xkZW5yb2R5ZWxsb3csIENocm9tYXRoLmxpZ2h0Ymx1ZSkudG9TdHJpbmcoKTtcbiAgPiBcIiNBOUQzQkRcIlxuXG4gID4gPiBDaHJvbWF0aC5tdWx0aXBseShDaHJvbWF0aC5vbGRsYWNlLCBDaHJvbWF0aC5saWdodGJsdWUsIENocm9tYXRoLmRhcmtibHVlKS50b1N0cmluZygpO1xuICA+IFwiIzAwMDA3MFwiXG4qL1xuQ2hyb21hdGgubXVsdGlwbHkgPSBmdW5jdGlvbiAoKVxue1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzLmxlbmd0aC0yLCBpPS0xLCBhLCBiO1xuICAgIHdoaWxlIChpKysgPCBhcmdzKXtcblxuICAgICAgICBhID0gYSB8fCBuZXcgQ2hyb21hdGgoYXJndW1lbnRzW2ldKTtcbiAgICAgICAgYiA9IG5ldyBDaHJvbWF0aChhcmd1bWVudHNbaSsxXSk7XG5cbiAgICAgICAgYS5yID0gKGEuciAvIDI1NSAqIGIucil8MDtcbiAgICAgICAgYS5nID0gKGEuZyAvIDI1NSAqIGIuZyl8MDtcbiAgICAgICAgYS5iID0gKGEuYiAvIDI1NSAqIGIuYil8MDtcblxuICAgICAgICBhID0gbmV3IENocm9tYXRoKGEpO1xuICAgIH1cblxuICAgIHJldHVybiBhO1xufTtcblxuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC5hdmVyYWdlXG4gIEF2ZXJhZ2VzIGFueSBudW1iZXIgb2YgY29sb3JzXG5cbiAgRXhhbXBsZXM6XG4gID4gPiBDaHJvbWF0aC5hdmVyYWdlKENocm9tYXRoLmxpZ2h0Z29sZGVucm9keWVsbG93LCBDaHJvbWF0aC5saWdodGJsdWUpLnRvU3RyaW5nKClcbiAgPiBcIiNEM0U5RENcIlxuXG4gID4gPiBDaHJvbWF0aC5hdmVyYWdlKENocm9tYXRoLm9sZGxhY2UsIENocm9tYXRoLmxpZ2h0Ymx1ZSwgQ2hyb21hdGguZGFya2JsdWUpLnRvU3RyaW5nKClcbiAgPiBcIiM2QTczQjhcIlxuICovXG5DaHJvbWF0aC5hdmVyYWdlID0gZnVuY3Rpb24gKClcbntcbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50cy5sZW5ndGgtMiwgaT0tMSwgYSwgYjtcbiAgICB3aGlsZSAoaSsrIDwgYXJncyl7XG5cbiAgICAgICAgYSA9IGEgfHwgbmV3IENocm9tYXRoKGFyZ3VtZW50c1tpXSk7XG4gICAgICAgIGIgPSBuZXcgQ2hyb21hdGgoYXJndW1lbnRzW2krMV0pO1xuXG4gICAgICAgIGEuciA9IChhLnIgKyBiLnIpID4+IDE7XG4gICAgICAgIGEuZyA9IChhLmcgKyBiLmcpID4+IDE7XG4gICAgICAgIGEuYiA9IChhLmIgKyBiLmIpID4+IDE7XG5cbiAgICAgICAgYSA9IG5ldyBDaHJvbWF0aChhKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYTtcbn07XG5cbi8qXG4gIE1ldGhvZDogQ2hyb21hdGgub3ZlcmxheVxuICBBZGQgb25lIGNvbG9yIG9uIHRvcCBvZiBhbm90aGVyIHdpdGggYSBnaXZlbiB0cmFuc3BhcmVuY3lcblxuICBFeGFtcGxlczpcbiAgPiA+IENocm9tYXRoLmF2ZXJhZ2UoQ2hyb21hdGgubGlnaHRnb2xkZW5yb2R5ZWxsb3csIENocm9tYXRoLmxpZ2h0Ymx1ZSkudG9TdHJpbmcoKVxuICA+IFwiI0QzRTlEQ1wiXG5cbiAgPiA+IENocm9tYXRoLmF2ZXJhZ2UoQ2hyb21hdGgub2xkbGFjZSwgQ2hyb21hdGgubGlnaHRibHVlLCBDaHJvbWF0aC5kYXJrYmx1ZSkudG9TdHJpbmcoKVxuICA+IFwiIzZBNzNCOFwiXG4gKi9cbkNocm9tYXRoLm92ZXJsYXkgPSBmdW5jdGlvbiAodG9wLCBib3R0b20sIG9wYWNpdHkpXG57XG4gICAgdmFyIGEgPSBuZXcgQ2hyb21hdGgodG9wKTtcbiAgICB2YXIgYiA9IG5ldyBDaHJvbWF0aChib3R0b20pO1xuXG4gICAgaWYgKG9wYWNpdHkgPiAxKSBvcGFjaXR5IC89IDEwMDtcbiAgICBvcGFjaXR5ID0gdXRpbC5jbGFtcChvcGFjaXR5IC0gMSArIGIuYSwgMCwgMSk7XG5cbiAgICByZXR1cm4gbmV3IENocm9tYXRoKHtcbiAgICAgICAgcjogdXRpbC5sZXJwKGEuciwgYi5yLCBvcGFjaXR5KSxcbiAgICAgICAgZzogdXRpbC5sZXJwKGEuZywgYi5nLCBvcGFjaXR5KSxcbiAgICAgICAgYjogdXRpbC5sZXJwKGEuYiwgYi5iLCBvcGFjaXR5KVxuICAgIH0pO1xufTtcblxuXG4vL0dyb3VwOiBTdGF0aWMgbWV0aG9kcyAtIG90aGVyXG4vKlxuICBNZXRob2Q6IENocm9tYXRoLnRvd2FyZHNcbiAgTW92ZSBmcm9tIG9uZSBjb2xvciB0b3dhcmRzIGFub3RoZXIgYnkgdGhlIGdpdmVuIHBlcmNlbnRhZ2UgKDAtMSwgMC0xMDApXG5cbiAgUGFyYW1ldGVyczpcbiAgZnJvbSAtIFRoZSBzdGFydGluZyBjb2xvclxuICB0byAtIFRoZSBkZXN0aW5hdGlvbiBjb2xvclxuICBieSAtIFRoZSBwZXJjZW50YWdlLCBleHByZXNzZWQgYXMgYSBmbG9hdGluZyBudW1iZXIgYmV0d2VlbiAwIGFuZCAxLCB0byBtb3ZlIHRvd2FyZHMgdGhlIGRlc3RpbmF0aW9uIGNvbG9yXG4gIGludGVycG9sYXRvciAtIFRoZSBmdW5jdGlvbiB0byB1c2UgZm9yIGludGVycG9sYXRpbmcgYmV0d2VlbiB0aGUgdHdvIHBvaW50cy4gRGVmYXVsdHMgdG8gTGluZWFyIEludGVycG9sYXRpb24uIEZ1bmN0aW9uIGhhcyB0aGUgc2lnbmF0dXJlIGAoZnJvbSwgdG8sIGJ5KWAgd2l0aCB0aGUgcGFyYW1ldGVycyBoYXZpbmcgdGhlIHNhbWUgbWVhbmluZyBhcyB0aG9zZSBpbiBgdG93YXJkc2AuXG5cbiAgPiA+IENocm9tYXRoLnRvd2FyZHMoJ3JlZCcsICd5ZWxsb3cnLCAwLjUpLnRvU3RyaW5nKClcbiAgPiBcIiNGRjdGMDBcIlxuKi9cbkNocm9tYXRoLnRvd2FyZHMgPSBmdW5jdGlvbiAoZnJvbSwgdG8sIGJ5LCBpbnRlcnBvbGF0b3IpXG57XG4gICAgaWYgKCF0bykgeyByZXR1cm4gZnJvbTsgfVxuICAgIGlmICghaXNGaW5pdGUoYnkpKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1R5cGVFcnJvcjogYGJ5YCgnICsgYnkgICsnKSBzaG91bGQgYmUgYmV0d2VlbiAwIGFuZCAxJyk7XG4gICAgaWYgKCEoZnJvbSBpbnN0YW5jZW9mIENocm9tYXRoKSkgZnJvbSA9IG5ldyBDaHJvbWF0aChmcm9tKTtcbiAgICBpZiAoISh0byBpbnN0YW5jZW9mIENocm9tYXRoKSkgdG8gPSBuZXcgQ2hyb21hdGgodG8gfHwgJyNGRkZGRkYnKTtcbiAgICBpZiAoIWludGVycG9sYXRvcikgaW50ZXJwb2xhdG9yID0gdXRpbC5sZXJwO1xuICAgIGJ5ID0gcGFyc2VGbG9hdChieSk7XG5cbiAgICByZXR1cm4gbmV3IENocm9tYXRoKHtcbiAgICAgICAgcjogaW50ZXJwb2xhdG9yKGZyb20uciwgdG8uciwgYnkpLFxuICAgICAgICBnOiBpbnRlcnBvbGF0b3IoZnJvbS5nLCB0by5nLCBieSksXG4gICAgICAgIGI6IGludGVycG9sYXRvcihmcm9tLmIsIHRvLmIsIGJ5KSxcbiAgICAgICAgYTogaW50ZXJwb2xhdG9yKGZyb20uYSwgdG8uYSwgYnkpXG4gICAgfSk7XG59O1xuXG4vKlxuICBNZXRob2Q6IENocm9tYXRoLmdyYWRpZW50XG4gIENyZWF0ZSBhbiBhcnJheSBvZiBDaHJvbWF0aCBvYmplY3RzXG5cbiAgUGFyYW1ldGVyczpcbiAgZnJvbSAtIFRoZSBiZWdpbm5pbmcgY29sb3Igb2YgdGhlIGdyYWRpZW50XG4gIHRvIC0gVGhlIGVuZCBjb2xvciBvZiB0aGUgZ3JhZGllbnRcbiAgc2xpY2VzIC0gVGhlIG51bWJlciBvZiBjb2xvcnMgaW4gdGhlIGFycmF5XG4gIHNsaWNlIC0gVGhlIGNvbG9yIGF0IGEgc3BlY2lmaWMsIDEtYmFzZWQsIHNsaWNlIGluZGV4XG5cbiAgRXhhbXBsZXM6XG4gID4gPiBDaHJvbWF0aC5ncmFkaWVudCgncmVkJywgJ3llbGxvdycpLmxlbmd0aDtcbiAgPiAyMFxuXG4gID4gPiBDaHJvbWF0aC5ncmFkaWVudCgncmVkJywgJ3llbGxvdycsIDUpLnRvU3RyaW5nKCk7XG4gID4gXCIjRkYwMDAwLCNGRjNGMDAsI0ZGN0YwMCwjRkZCRjAwLCNGRkZGMDBcIlxuXG4gID4gPiBDaHJvbWF0aC5ncmFkaWVudCgncmVkJywgJ3llbGxvdycsIDUsIDIpLnRvU3RyaW5nKCk7XG4gID4gXCIjRkY3RjAwXCJcblxuICA+ID4gQ2hyb21hdGguZ3JhZGllbnQoJ3JlZCcsICd5ZWxsb3cnLCA1KVsyXS50b1N0cmluZygpO1xuICA+IFwiI0ZGN0YwMFwiXG4gKi9cbkNocm9tYXRoLmdyYWRpZW50ID0gZnVuY3Rpb24gKGZyb20sIHRvLCBzbGljZXMsIHNsaWNlKVxue1xuICAgIHZhciBncmFkaWVudCA9IFtdLCBzdG9wcztcblxuICAgIGlmICghIHNsaWNlcykgc2xpY2VzID0gMjA7XG4gICAgc3RvcHMgPSAoc2xpY2VzLTEpO1xuXG4gICAgaWYgKGlzRmluaXRlKHNsaWNlKSkgcmV0dXJuIENocm9tYXRoLnRvd2FyZHMoZnJvbSwgdG8sIHNsaWNlL3N0b3BzKTtcbiAgICBlbHNlIHNsaWNlID0gLTE7XG5cbiAgICB3aGlsZSAoKytzbGljZSA8IHNsaWNlcyl7XG4gICAgICAgIGdyYWRpZW50LnB1c2goQ2hyb21hdGgudG93YXJkcyhmcm9tLCB0bywgc2xpY2Uvc3RvcHMpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZ3JhZGllbnQ7XG59O1xuXG4vKlxuICBNZXRob2Q6IENocm9tYXRoLnBhcnNlXG4gIEl0ZXJhdGUgdGhyb3VnaCB0aGUgb2JqZWN0cyBzZXQgaW4gQ2hyb21hdGgucGFyc2VycyBhbmQsIGlmIGEgbWF0Y2ggaXMgbWFkZSwgcmV0dXJuIHRoZSB2YWx1ZSBzcGVjaWZpZWQgYnkgdGhlIG1hdGNoaW5nIHBhcnNlcnMgYHByb2Nlc3NgIGZ1bmN0aW9uXG5cbiAgUGFyYW1ldGVyczpcbiAgc3RyaW5nIC0gVGhlIHN0cmluZyB0byBwYXJzZVxuXG4gIEV4YW1wbGU6XG4gID4gPiBDaHJvbWF0aC5wYXJzZSgncmdiKDAsIDEyOCwgMjU1KScpXG4gID4geyByOiAwLCBnOiAxMjgsIGI6IDI1NSwgYTogdW5kZWZpbmVkIH1cbiAqL1xuQ2hyb21hdGgucGFyc2UgPSBmdW5jdGlvbiAoc3RyaW5nKVxue1xuICAgIHZhciBwYXJzZXJzID0gQ2hyb21hdGgucGFyc2VycywgaSwgbCwgcGFyc2VyLCBwYXJ0cywgY2hhbm5lbHM7XG5cbiAgICBmb3IgKGkgPSAwLCBsID0gcGFyc2Vycy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgcGFyc2VyID0gcGFyc2Vyc1tpXTtcbiAgICAgICAgcGFydHMgPSBwYXJzZXIucmVnZXguZXhlYyhzdHJpbmcpO1xuICAgICAgICBpZiAocGFydHMgJiYgcGFydHMubGVuZ3RoKSBjaGFubmVscyA9IHBhcnNlci5wcm9jZXNzLmFwcGx5KHRoaXMsIHBhcnRzKTtcbiAgICAgICAgaWYgKGNoYW5uZWxzKSByZXR1cm4gY2hhbm5lbHM7XG4gICAgfVxufTtcblxuLy8gR3JvdXA6IFN0YXRpYyBwcm9wZXJ0aWVzXG4vKlxuICBQcm9wZXJ0eTogQ2hyb21hdGgucGFyc2Vyc1xuICAgQW4gYXJyYXkgb2Ygb2JqZWN0cyBmb3IgYXR0ZW1wdGluZyB0byBjb252ZXJ0IGEgc3RyaW5nIGRlc2NyaWJpbmcgYSBjb2xvciBpbnRvIGFuIG9iamVjdCBjb250YWluaW5nIHRoZSB2YXJpb3VzIGNoYW5uZWxzLiBObyB1c2VyIGFjdGlvbiBpcyByZXF1aXJlZCBidXQgcGFyc2VycyBjYW4gYmVcblxuICAgT2JqZWN0IHByb3BlcnRpZXM6XG4gICByZWdleCAtIHJlZ3VsYXIgZXhwcmVzc2lvbiB1c2VkIHRvIHRlc3QgdGhlIHN0cmluZyBvciBudW1lcmljIGlucHV0XG4gICBwcm9jZXNzIC0gZnVuY3Rpb24gd2hpY2ggaXMgcGFzc2VkIHRoZSByZXN1bHRzIG9mIGByZWdleC5tYXRjaGAgYW5kIHJldHVybnMgYW4gb2JqZWN0IHdpdGggZWl0aGVyIHRoZSByZ2IsIGhzbCwgaHN2LCBvciBoc2IgY2hhbm5lbHMgb2YgdGhlIENocm9tYXRoLlxuXG4gICBFeGFtcGxlczpcbihzdGFydCBjb2RlKVxuLy8gQWRkIGEgcGFyc2VyXG5DaHJvbWF0aC5wYXJzZXJzLnB1c2goe1xuICAgIGV4YW1wbGU6IFszNTU0NDMxLCAxNjgwOTk4NF0sXG4gICAgcmVnZXg6IC9eXFxkKyQvLFxuICAgIHByb2Nlc3M6IGZ1bmN0aW9uIChjb2xvcil7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByOiBjb2xvciA+PiAxNiAmIDI1NSxcbiAgICAgICAgICAgIGc6IGNvbG9yID4+IDggJiAyNTUsXG4gICAgICAgICAgICBiOiBjb2xvciAmIDI1NVxuICAgICAgICB9O1xuICAgIH1cbn0pO1xuKGVuZCBjb2RlKVxuKHN0YXJ0IGNvZGUpXG4vLyBPdmVycmlkZSBlbnRpcmVseVxuQ2hyb21hdGgucGFyc2VycyA9IFtcbiAgIHtcbiAgICAgICBleGFtcGxlOiBbMzU1NDQzMSwgMTY4MDk5ODRdLFxuICAgICAgIHJlZ2V4OiAvXlxcZCskLyxcbiAgICAgICBwcm9jZXNzOiBmdW5jdGlvbiAoY29sb3Ipe1xuICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgcjogY29sb3IgPj4gMTYgJiAyNTUsXG4gICAgICAgICAgICAgICBnOiBjb2xvciA+PiA4ICYgMjU1LFxuICAgICAgICAgICAgICAgYjogY29sb3IgJiAyNTVcbiAgICAgICAgICAgfTtcbiAgICAgICB9XG4gICB9LFxuXG4gICB7XG4gICAgICAgZXhhbXBsZTogWycjZmIwJywgJ2YwZiddLFxuICAgICAgIHJlZ2V4OiAvXiM/KFtcXGRBLUZdezF9KShbXFxkQS1GXXsxfSkoW1xcZEEtRl17MX0pJC9pLFxuICAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uIChoZXgsIHIsIGcsIGIpe1xuICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgcjogcGFyc2VJbnQociArIHIsIDE2KSxcbiAgICAgICAgICAgICAgIGc6IHBhcnNlSW50KGcgKyBnLCAxNiksXG4gICAgICAgICAgICAgICBiOiBwYXJzZUludChiICsgYiwgMTYpXG4gICAgICAgICAgIH07XG4gICAgICAgfVxuICAgfVxuKGVuZCBjb2RlKVxuICovXG5DaHJvbWF0aC5wYXJzZXJzID0gcmVxdWlyZSgnLi9wYXJzZXJzJykucGFyc2VycztcblxuLy8gR3JvdXA6IEluc3RhbmNlIG1ldGhvZHMgLSBjb2xvciByZXByZXNlbnRhdGlvblxuQ2hyb21hdGgucHJvdG90eXBlID0gcmVxdWlyZSgnLi9wcm90b3R5cGUnKShDaHJvbWF0aCk7XG5cbi8qXG4gIFByb3BlcnR5OiBDaHJvbWF0aC5jb2xvcnNcbiAgT2JqZWN0LCBpbmRleGVkIGJ5IFNWRy9DU1MgY29sb3IgbmFtZSwgb2YgPENocm9tYXRoPiBpbnN0YW5jZXNcbiAgVGhlIGNvbG9yIG5hbWVzIGZyb20gQ1NTIGFuZCBTVkcgMS4wXG5cbiAgRXhhbXBsZXM6XG4gID4gPiBDaHJvbWF0aC5jb2xvcnMuYWxpY2VibHVlLnRvUkdCQXJyYXkoKVxuICA+IFsyNDAsIDI0OCwgMjU1XVxuXG4gID4gPiBDaHJvbWF0aC5jb2xvcnMuYmVpZ2UudG9TdHJpbmcoKVxuICA+IFwiI0Y1RjVEQ1wiXG5cbiAgPiAvLyBDYW4gYWxzbyBiZSBhY2Nlc3NlZCB3aXRob3V0IGAuY29sb3JgXG4gID4gPiBDaHJvbWF0aC5hbGljZWJsdWUudG9SR0JBcnJheSgpXG4gID4gWzI0MCwgMjQ4LCAyNTVdXG5cbiAgPiA+IENocm9tYXRoLmJlaWdlLnRvU3RyaW5nKClcbiAgPiBcIiNGNUY1RENcIlxuKi9cbnZhciBjc3MyQ29sb3JzICA9IHJlcXVpcmUoJy4vY29sb3JuYW1lc19jc3MyJyk7XG52YXIgY3NzM0NvbG9ycyAgPSByZXF1aXJlKCcuL2NvbG9ybmFtZXNfY3NzMycpO1xudmFyIGFsbENvbG9ycyAgID0gdXRpbC5tZXJnZSh7fSwgY3NzMkNvbG9ycywgY3NzM0NvbG9ycyk7XG5DaHJvbWF0aC5jb2xvcnMgPSB7fTtcbmZvciAodmFyIGNvbG9yTmFtZSBpbiBhbGxDb2xvcnMpIHtcbiAgICAvLyBlLmcuLCBDaHJvbWF0aC53aGVhdCBhbmQgQ2hyb21hdGguY29sb3JzLndoZWF0XG4gICAgQ2hyb21hdGhbY29sb3JOYW1lXSA9IENocm9tYXRoLmNvbG9yc1tjb2xvck5hbWVdID0gbmV3IENocm9tYXRoKGFsbENvbG9yc1tjb2xvck5hbWVdKTtcbn1cbi8vIGFkZCBhIHBhcnNlciBmb3IgdGhlIGNvbG9yIG5hbWVzXG5DaHJvbWF0aC5wYXJzZXJzLnB1c2goe1xuICAgIGV4YW1wbGU6IFsncmVkJywgJ2J1cmx5d29vZCddLFxuICAgIHJlZ2V4OiAvXlthLXpdKyQvaSxcbiAgICBwcm9jZXNzOiBmdW5jdGlvbiAoY29sb3JOYW1lKXtcbiAgICAgICAgaWYgKENocm9tYXRoLmNvbG9yc1tjb2xvck5hbWVdKSByZXR1cm4gQ2hyb21hdGguY29sb3JzW2NvbG9yTmFtZV07XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2hyb21hdGg7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvLyBmcm9tIGh0dHA6Ly93d3cudzMub3JnL1RSL1JFQy1odG1sNDAvdHlwZXMuaHRtbCNoLTYuNVxuICAgIGFxdWEgICAgOiB7cjogMCwgICBnOiAyNTUsIGI6IDI1NX0sXG4gICAgYmxhY2sgICA6IHtyOiAwLCAgIGc6IDAsICAgYjogMH0sXG4gICAgYmx1ZSAgICA6IHtyOiAwLCAgIGc6IDAsICAgYjogMjU1fSxcbiAgICBmdWNoc2lhIDoge3I6IDI1NSwgZzogMCwgICBiOiAyNTV9LFxuICAgIGdyYXkgICAgOiB7cjogMTI4LCBnOiAxMjgsIGI6IDEyOH0sXG4gICAgZ3JlZW4gICA6IHtyOiAwLCAgIGc6IDEyOCwgYjogMH0sXG4gICAgbGltZSAgICA6IHtyOiAwLCAgIGc6IDI1NSwgYjogMH0sXG4gICAgbWFyb29uICA6IHtyOiAxMjgsIGc6IDAsICAgYjogMH0sXG4gICAgbmF2eSAgICA6IHtyOiAwLCAgIGc6IDAsICAgYjogMTI4fSxcbiAgICBvbGl2ZSAgIDoge3I6IDEyOCwgZzogMTI4LCBiOiAwfSxcbiAgICBwdXJwbGUgIDoge3I6IDEyOCwgZzogMCwgICBiOiAxMjh9LFxuICAgIHJlZCAgICAgOiB7cjogMjU1LCBnOiAwLCAgIGI6IDB9LFxuICAgIHNpbHZlciAgOiB7cjogMTkyLCBnOiAxOTIsIGI6IDE5Mn0sXG4gICAgdGVhbCAgICA6IHtyOiAwLCAgIGc6IDEyOCwgYjogMTI4fSxcbiAgICB3aGl0ZSAgIDoge3I6IDI1NSwgZzogMjU1LCBiOiAyNTV9LFxuICAgIHllbGxvdyAgOiB7cjogMjU1LCBnOiAyNTUsIGI6IDB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgLy8gaHR0cDovL3d3dy53My5vcmcvVFIvY3NzMy1jb2xvci8jc3ZnLWNvbG9yXG4gICAgLy8gaHR0cDovL3d3dy53My5vcmcvVFIvU1ZHL3R5cGVzLmh0bWwjQ29sb3JLZXl3b3Jkc1xuICAgIGFsaWNlYmx1ZSAgICAgICAgICAgIDoge3I6IDI0MCwgZzogMjQ4LCBiOiAyNTV9LFxuICAgIGFudGlxdWV3aGl0ZSAgICAgICAgIDoge3I6IDI1MCwgZzogMjM1LCBiOiAyMTV9LFxuICAgIGFxdWFtYXJpbmUgICAgICAgICAgIDoge3I6IDEyNywgZzogMjU1LCBiOiAyMTJ9LFxuICAgIGF6dXJlICAgICAgICAgICAgICAgIDoge3I6IDI0MCwgZzogMjU1LCBiOiAyNTV9LFxuICAgIGJlaWdlICAgICAgICAgICAgICAgIDoge3I6IDI0NSwgZzogMjQ1LCBiOiAyMjB9LFxuICAgIGJpc3F1ZSAgICAgICAgICAgICAgIDoge3I6IDI1NSwgZzogMjI4LCBiOiAxOTZ9LFxuICAgIGJsYW5jaGVkYWxtb25kICAgICAgIDoge3I6IDI1NSwgZzogMjM1LCBiOiAyMDV9LFxuICAgIGJsdWV2aW9sZXQgICAgICAgICAgIDoge3I6IDEzOCwgZzogNDMsICBiOiAyMjZ9LFxuICAgIGJyb3duICAgICAgICAgICAgICAgIDoge3I6IDE2NSwgZzogNDIsICBiOiA0Mn0sXG4gICAgYnVybHl3b29kICAgICAgICAgICAgOiB7cjogMjIyLCBnOiAxODQsIGI6IDEzNX0sXG4gICAgY2FkZXRibHVlICAgICAgICAgICAgOiB7cjogOTUsICBnOiAxNTgsIGI6IDE2MH0sXG4gICAgY2hhcnRyZXVzZSAgICAgICAgICAgOiB7cjogMTI3LCBnOiAyNTUsIGI6IDB9LFxuICAgIGNob2NvbGF0ZSAgICAgICAgICAgIDoge3I6IDIxMCwgZzogMTA1LCBiOiAzMH0sXG4gICAgY29yYWwgICAgICAgICAgICAgICAgOiB7cjogMjU1LCBnOiAxMjcsIGI6IDgwfSxcbiAgICBjb3JuZmxvd2VyYmx1ZSAgICAgICA6IHtyOiAxMDAsIGc6IDE0OSwgYjogMjM3fSxcbiAgICBjb3Juc2lsayAgICAgICAgICAgICA6IHtyOiAyNTUsIGc6IDI0OCwgYjogMjIwfSxcbiAgICBjcmltc29uICAgICAgICAgICAgICA6IHtyOiAyMjAsIGc6IDIwLCAgYjogNjB9LFxuICAgIGN5YW4gICAgICAgICAgICAgICAgIDoge3I6IDAsICAgZzogMjU1LCBiOiAyNTV9LFxuICAgIGRhcmtibHVlICAgICAgICAgICAgIDoge3I6IDAsICAgZzogMCwgICBiOiAxMzl9LFxuICAgIGRhcmtjeWFuICAgICAgICAgICAgIDoge3I6IDAsICAgZzogMTM5LCBiOiAxMzl9LFxuICAgIGRhcmtnb2xkZW5yb2QgICAgICAgIDoge3I6IDE4NCwgZzogMTM0LCBiOiAxMX0sXG4gICAgZGFya2dyYXkgICAgICAgICAgICAgOiB7cjogMTY5LCBnOiAxNjksIGI6IDE2OX0sXG4gICAgZGFya2dyZWVuICAgICAgICAgICAgOiB7cjogMCwgICBnOiAxMDAsIGI6IDB9LFxuICAgIGRhcmtncmV5ICAgICAgICAgICAgIDoge3I6IDE2OSwgZzogMTY5LCBiOiAxNjl9LFxuICAgIGRhcmtraGFraSAgICAgICAgICAgIDoge3I6IDE4OSwgZzogMTgzLCBiOiAxMDd9LFxuICAgIGRhcmttYWdlbnRhICAgICAgICAgIDoge3I6IDEzOSwgZzogMCwgICBiOiAxMzl9LFxuICAgIGRhcmtvbGl2ZWdyZWVuICAgICAgIDoge3I6IDg1LCAgZzogMTA3LCBiOiA0N30sXG4gICAgZGFya29yYW5nZSAgICAgICAgICAgOiB7cjogMjU1LCBnOiAxNDAsIGI6IDB9LFxuICAgIGRhcmtvcmNoaWQgICAgICAgICAgIDoge3I6IDE1MywgZzogNTAsICBiOiAyMDR9LFxuICAgIGRhcmtyZWQgICAgICAgICAgICAgIDoge3I6IDEzOSwgZzogMCwgICBiOiAwfSxcbiAgICBkYXJrc2FsbW9uICAgICAgICAgICA6IHtyOiAyMzMsIGc6IDE1MCwgYjogMTIyfSxcbiAgICBkYXJrc2VhZ3JlZW4gICAgICAgICA6IHtyOiAxNDMsIGc6IDE4OCwgYjogMTQzfSxcbiAgICBkYXJrc2xhdGVibHVlICAgICAgICA6IHtyOiA3MiwgIGc6IDYxLCAgYjogMTM5fSxcbiAgICBkYXJrc2xhdGVncmF5ICAgICAgICA6IHtyOiA0NywgIGc6IDc5LCAgYjogNzl9LFxuICAgIGRhcmtzbGF0ZWdyZXkgICAgICAgIDoge3I6IDQ3LCAgZzogNzksICBiOiA3OX0sXG4gICAgZGFya3R1cnF1b2lzZSAgICAgICAgOiB7cjogMCwgICBnOiAyMDYsIGI6IDIwOX0sXG4gICAgZGFya3Zpb2xldCAgICAgICAgICAgOiB7cjogMTQ4LCBnOiAwLCAgIGI6IDIxMX0sXG4gICAgZGVlcHBpbmsgICAgICAgICAgICAgOiB7cjogMjU1LCBnOiAyMCwgIGI6IDE0N30sXG4gICAgZGVlcHNreWJsdWUgICAgICAgICAgOiB7cjogMCwgICBnOiAxOTEsIGI6IDI1NX0sXG4gICAgZGltZ3JheSAgICAgICAgICAgICAgOiB7cjogMTA1LCBnOiAxMDUsIGI6IDEwNX0sXG4gICAgZGltZ3JleSAgICAgICAgICAgICAgOiB7cjogMTA1LCBnOiAxMDUsIGI6IDEwNX0sXG4gICAgZG9kZ2VyYmx1ZSAgICAgICAgICAgOiB7cjogMzAsICBnOiAxNDQsIGI6IDI1NX0sXG4gICAgZmlyZWJyaWNrICAgICAgICAgICAgOiB7cjogMTc4LCBnOiAzNCwgIGI6IDM0fSxcbiAgICBmbG9yYWx3aGl0ZSAgICAgICAgICA6IHtyOiAyNTUsIGc6IDI1MCwgYjogMjQwfSxcbiAgICBmb3Jlc3RncmVlbiAgICAgICAgICA6IHtyOiAzNCwgIGc6IDEzOSwgYjogMzR9LFxuICAgIGdhaW5zYm9ybyAgICAgICAgICAgIDoge3I6IDIyMCwgZzogMjIwLCBiOiAyMjB9LFxuICAgIGdob3N0d2hpdGUgICAgICAgICAgIDoge3I6IDI0OCwgZzogMjQ4LCBiOiAyNTV9LFxuICAgIGdvbGQgICAgICAgICAgICAgICAgIDoge3I6IDI1NSwgZzogMjE1LCBiOiAwfSxcbiAgICBnb2xkZW5yb2QgICAgICAgICAgICA6IHtyOiAyMTgsIGc6IDE2NSwgYjogMzJ9LFxuICAgIGdyZWVueWVsbG93ICAgICAgICAgIDoge3I6IDE3MywgZzogMjU1LCBiOiA0N30sXG4gICAgZ3JleSAgICAgICAgICAgICAgICAgOiB7cjogMTI4LCBnOiAxMjgsIGI6IDEyOH0sXG4gICAgaG9uZXlkZXcgICAgICAgICAgICAgOiB7cjogMjQwLCBnOiAyNTUsIGI6IDI0MH0sXG4gICAgaG90cGluayAgICAgICAgICAgICAgOiB7cjogMjU1LCBnOiAxMDUsIGI6IDE4MH0sXG4gICAgaW5kaWFucmVkICAgICAgICAgICAgOiB7cjogMjA1LCBnOiA5MiwgIGI6IDkyfSxcbiAgICBpbmRpZ28gICAgICAgICAgICAgICA6IHtyOiA3NSwgIGc6IDAsICAgYjogMTMwfSxcbiAgICBpdm9yeSAgICAgICAgICAgICAgICA6IHtyOiAyNTUsIGc6IDI1NSwgYjogMjQwfSxcbiAgICBraGFraSAgICAgICAgICAgICAgICA6IHtyOiAyNDAsIGc6IDIzMCwgYjogMTQwfSxcbiAgICBsYXZlbmRlciAgICAgICAgICAgICA6IHtyOiAyMzAsIGc6IDIzMCwgYjogMjUwfSxcbiAgICBsYXZlbmRlcmJsdXNoICAgICAgICA6IHtyOiAyNTUsIGc6IDI0MCwgYjogMjQ1fSxcbiAgICBsYXduZ3JlZW4gICAgICAgICAgICA6IHtyOiAxMjQsIGc6IDI1MiwgYjogMH0sXG4gICAgbGVtb25jaGlmZm9uICAgICAgICAgOiB7cjogMjU1LCBnOiAyNTAsIGI6IDIwNX0sXG4gICAgbGlnaHRibHVlICAgICAgICAgICAgOiB7cjogMTczLCBnOiAyMTYsIGI6IDIzMH0sXG4gICAgbGlnaHRjb3JhbCAgICAgICAgICAgOiB7cjogMjQwLCBnOiAxMjgsIGI6IDEyOH0sXG4gICAgbGlnaHRjeWFuICAgICAgICAgICAgOiB7cjogMjI0LCBnOiAyNTUsIGI6IDI1NX0sXG4gICAgbGlnaHRnb2xkZW5yb2R5ZWxsb3cgOiB7cjogMjUwLCBnOiAyNTAsIGI6IDIxMH0sXG4gICAgbGlnaHRncmF5ICAgICAgICAgICAgOiB7cjogMjExLCBnOiAyMTEsIGI6IDIxMX0sXG4gICAgbGlnaHRncmVlbiAgICAgICAgICAgOiB7cjogMTQ0LCBnOiAyMzgsIGI6IDE0NH0sXG4gICAgbGlnaHRncmV5ICAgICAgICAgICAgOiB7cjogMjExLCBnOiAyMTEsIGI6IDIxMX0sXG4gICAgbGlnaHRwaW5rICAgICAgICAgICAgOiB7cjogMjU1LCBnOiAxODIsIGI6IDE5M30sXG4gICAgbGlnaHRzYWxtb24gICAgICAgICAgOiB7cjogMjU1LCBnOiAxNjAsIGI6IDEyMn0sXG4gICAgbGlnaHRzZWFncmVlbiAgICAgICAgOiB7cjogMzIsICBnOiAxNzgsIGI6IDE3MH0sXG4gICAgbGlnaHRza3libHVlICAgICAgICAgOiB7cjogMTM1LCBnOiAyMDYsIGI6IDI1MH0sXG4gICAgbGlnaHRzbGF0ZWdyYXkgICAgICAgOiB7cjogMTE5LCBnOiAxMzYsIGI6IDE1M30sXG4gICAgbGlnaHRzbGF0ZWdyZXkgICAgICAgOiB7cjogMTE5LCBnOiAxMzYsIGI6IDE1M30sXG4gICAgbGlnaHRzdGVlbGJsdWUgICAgICAgOiB7cjogMTc2LCBnOiAxOTYsIGI6IDIyMn0sXG4gICAgbGlnaHR5ZWxsb3cgICAgICAgICAgOiB7cjogMjU1LCBnOiAyNTUsIGI6IDIyNH0sXG4gICAgbGltZWdyZWVuICAgICAgICAgICAgOiB7cjogNTAsICBnOiAyMDUsIGI6IDUwfSxcbiAgICBsaW5lbiAgICAgICAgICAgICAgICA6IHtyOiAyNTAsIGc6IDI0MCwgYjogMjMwfSxcbiAgICBtYWdlbnRhICAgICAgICAgICAgICA6IHtyOiAyNTUsIGc6IDAsICAgYjogMjU1fSxcbiAgICBtZWRpdW1hcXVhbWFyaW5lICAgICA6IHtyOiAxMDIsIGc6IDIwNSwgYjogMTcwfSxcbiAgICBtZWRpdW1ibHVlICAgICAgICAgICA6IHtyOiAwLCAgIGc6IDAsICAgYjogMjA1fSxcbiAgICBtZWRpdW1vcmNoaWQgICAgICAgICA6IHtyOiAxODYsIGc6IDg1LCAgYjogMjExfSxcbiAgICBtZWRpdW1wdXJwbGUgICAgICAgICA6IHtyOiAxNDcsIGc6IDExMiwgYjogMjE5fSxcbiAgICBtZWRpdW1zZWFncmVlbiAgICAgICA6IHtyOiA2MCwgIGc6IDE3OSwgYjogMTEzfSxcbiAgICBtZWRpdW1zbGF0ZWJsdWUgICAgICA6IHtyOiAxMjMsIGc6IDEwNCwgYjogMjM4fSxcbiAgICBtZWRpdW1zcHJpbmdncmVlbiAgICA6IHtyOiAwLCAgIGc6IDI1MCwgYjogMTU0fSxcbiAgICBtZWRpdW10dXJxdW9pc2UgICAgICA6IHtyOiA3MiwgIGc6IDIwOSwgYjogMjA0fSxcbiAgICBtZWRpdW12aW9sZXRyZWQgICAgICA6IHtyOiAxOTksIGc6IDIxLCAgYjogMTMzfSxcbiAgICBtaWRuaWdodGJsdWUgICAgICAgICA6IHtyOiAyNSwgIGc6IDI1LCAgYjogMTEyfSxcbiAgICBtaW50Y3JlYW0gICAgICAgICAgICA6IHtyOiAyNDUsIGc6IDI1NSwgYjogMjUwfSxcbiAgICBtaXN0eXJvc2UgICAgICAgICAgICA6IHtyOiAyNTUsIGc6IDIyOCwgYjogMjI1fSxcbiAgICBtb2NjYXNpbiAgICAgICAgICAgICA6IHtyOiAyNTUsIGc6IDIyOCwgYjogMTgxfSxcbiAgICBuYXZham93aGl0ZSAgICAgICAgICA6IHtyOiAyNTUsIGc6IDIyMiwgYjogMTczfSxcbiAgICBvbGRsYWNlICAgICAgICAgICAgICA6IHtyOiAyNTMsIGc6IDI0NSwgYjogMjMwfSxcbiAgICBvbGl2ZWRyYWIgICAgICAgICAgICA6IHtyOiAxMDcsIGc6IDE0MiwgYjogMzV9LFxuICAgIG9yYW5nZSAgICAgICAgICAgICAgIDoge3I6IDI1NSwgZzogMTY1LCBiOiAwfSxcbiAgICBvcmFuZ2VyZWQgICAgICAgICAgICA6IHtyOiAyNTUsIGc6IDY5LCAgYjogMH0sXG4gICAgb3JjaGlkICAgICAgICAgICAgICAgOiB7cjogMjE4LCBnOiAxMTIsIGI6IDIxNH0sXG4gICAgcGFsZWdvbGRlbnJvZCAgICAgICAgOiB7cjogMjM4LCBnOiAyMzIsIGI6IDE3MH0sXG4gICAgcGFsZWdyZWVuICAgICAgICAgICAgOiB7cjogMTUyLCBnOiAyNTEsIGI6IDE1Mn0sXG4gICAgcGFsZXR1cnF1b2lzZSAgICAgICAgOiB7cjogMTc1LCBnOiAyMzgsIGI6IDIzOH0sXG4gICAgcGFsZXZpb2xldHJlZCAgICAgICAgOiB7cjogMjE5LCBnOiAxMTIsIGI6IDE0N30sXG4gICAgcGFwYXlhd2hpcCAgICAgICAgICAgOiB7cjogMjU1LCBnOiAyMzksIGI6IDIxM30sXG4gICAgcGVhY2hwdWZmICAgICAgICAgICAgOiB7cjogMjU1LCBnOiAyMTgsIGI6IDE4NX0sXG4gICAgcGVydSAgICAgICAgICAgICAgICAgOiB7cjogMjA1LCBnOiAxMzMsIGI6IDYzfSxcbiAgICBwaW5rICAgICAgICAgICAgICAgICA6IHtyOiAyNTUsIGc6IDE5MiwgYjogMjAzfSxcbiAgICBwbHVtICAgICAgICAgICAgICAgICA6IHtyOiAyMjEsIGc6IDE2MCwgYjogMjIxfSxcbiAgICBwb3dkZXJibHVlICAgICAgICAgICA6IHtyOiAxNzYsIGc6IDIyNCwgYjogMjMwfSxcbiAgICByb3N5YnJvd24gICAgICAgICAgICA6IHtyOiAxODgsIGc6IDE0MywgYjogMTQzfSxcbiAgICByb3lhbGJsdWUgICAgICAgICAgICA6IHtyOiA2NSwgIGc6IDEwNSwgYjogMjI1fSxcbiAgICBzYWRkbGVicm93biAgICAgICAgICA6IHtyOiAxMzksIGc6IDY5LCAgYjogMTl9LFxuICAgIHNhbG1vbiAgICAgICAgICAgICAgIDoge3I6IDI1MCwgZzogMTI4LCBiOiAxMTR9LFxuICAgIHNhbmR5YnJvd24gICAgICAgICAgIDoge3I6IDI0NCwgZzogMTY0LCBiOiA5Nn0sXG4gICAgc2VhZ3JlZW4gICAgICAgICAgICAgOiB7cjogNDYsICBnOiAxMzksIGI6IDg3fSxcbiAgICBzZWFzaGVsbCAgICAgICAgICAgICA6IHtyOiAyNTUsIGc6IDI0NSwgYjogMjM4fSxcbiAgICBzaWVubmEgICAgICAgICAgICAgICA6IHtyOiAxNjAsIGc6IDgyLCAgYjogNDV9LFxuICAgIHNreWJsdWUgICAgICAgICAgICAgIDoge3I6IDEzNSwgZzogMjA2LCBiOiAyMzV9LFxuICAgIHNsYXRlYmx1ZSAgICAgICAgICAgIDoge3I6IDEwNiwgZzogOTAsICBiOiAyMDV9LFxuICAgIHNsYXRlZ3JheSAgICAgICAgICAgIDoge3I6IDExMiwgZzogMTI4LCBiOiAxNDR9LFxuICAgIHNsYXRlZ3JleSAgICAgICAgICAgIDoge3I6IDExMiwgZzogMTI4LCBiOiAxNDR9LFxuICAgIHNub3cgICAgICAgICAgICAgICAgIDoge3I6IDI1NSwgZzogMjUwLCBiOiAyNTB9LFxuICAgIHNwcmluZ2dyZWVuICAgICAgICAgIDoge3I6IDAsICAgZzogMjU1LCBiOiAxMjd9LFxuICAgIHN0ZWVsYmx1ZSAgICAgICAgICAgIDoge3I6IDcwLCAgZzogMTMwLCBiOiAxODB9LFxuICAgIHRhbiAgICAgICAgICAgICAgICAgIDoge3I6IDIxMCwgZzogMTgwLCBiOiAxNDB9LFxuICAgIHRoaXN0bGUgICAgICAgICAgICAgIDoge3I6IDIxNiwgZzogMTkxLCBiOiAyMTZ9LFxuICAgIHRvbWF0byAgICAgICAgICAgICAgIDoge3I6IDI1NSwgZzogOTksICBiOiA3MX0sXG4gICAgdHVycXVvaXNlICAgICAgICAgICAgOiB7cjogNjQsICBnOiAyMjQsIGI6IDIwOH0sXG4gICAgdmlvbGV0ICAgICAgICAgICAgICAgOiB7cjogMjM4LCBnOiAxMzAsIGI6IDIzOH0sXG4gICAgd2hlYXQgICAgICAgICAgICAgICAgOiB7cjogMjQ1LCBnOiAyMjIsIGI6IDE3OX0sXG4gICAgd2hpdGVzbW9rZSAgICAgICAgICAgOiB7cjogMjQ1LCBnOiAyNDUsIGI6IDI0NX0sXG4gICAgeWVsbG93Z3JlZW4gICAgICAgICAgOiB7cjogMTU0LCBnOiAyMDUsIGI6IDUwfVxufVxuIiwidmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgcGFyc2VyczogW1xuICAgICAgICB7XG4gICAgICAgICAgICBleGFtcGxlOiBbMzU1NDQzMSwgMTY4MDk5ODRdLFxuICAgICAgICAgICAgcmVnZXg6IC9eXFxkKyQvLFxuICAgICAgICAgICAgcHJvY2VzczogZnVuY3Rpb24gKGNvbG9yKXtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAvL2E6IGNvbG9yID4+IDI0ICYgMjU1LFxuICAgICAgICAgICAgICAgICAgICByOiBjb2xvciA+PiAxNiAmIDI1NSxcbiAgICAgICAgICAgICAgICAgICAgZzogY29sb3IgPj4gOCAmIDI1NSxcbiAgICAgICAgICAgICAgICAgICAgYjogY29sb3IgJiAyNTVcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHtcbiAgICAgICAgICAgIGV4YW1wbGU6IFsnI2ZiMCcsICdmMGYnXSxcbiAgICAgICAgICAgIHJlZ2V4OiAvXiM/KFtcXGRBLUZdezF9KShbXFxkQS1GXXsxfSkoW1xcZEEtRl17MX0pJC9pLFxuICAgICAgICAgICAgcHJvY2VzczogZnVuY3Rpb24gKGhleCwgciwgZywgYil7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgcjogcGFyc2VJbnQociArIHIsIDE2KSxcbiAgICAgICAgICAgICAgICAgICAgZzogcGFyc2VJbnQoZyArIGcsIDE2KSxcbiAgICAgICAgICAgICAgICAgICAgYjogcGFyc2VJbnQoYiArIGIsIDE2KVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAge1xuICAgICAgICAgICAgZXhhbXBsZTogWycjMDBmZjAwJywgJzMzNjY5OSddLFxuICAgICAgICAgICAgcmVnZXg6IC9eIz8oW1xcZEEtRl17Mn0pKFtcXGRBLUZdezJ9KShbXFxkQS1GXXsyfSkkL2ksXG4gICAgICAgICAgICBwcm9jZXNzOiBmdW5jdGlvbiAoaGV4LCByLCBnLCBiKXtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICByOiBwYXJzZUludChyLCAxNiksXG4gICAgICAgICAgICAgICAgICAgIGc6IHBhcnNlSW50KGcsIDE2KSxcbiAgICAgICAgICAgICAgICAgICAgYjogcGFyc2VJbnQoYiwgMTYpXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB7XG4gICAgICAgICAgICBleGFtcGxlOiBbJ3JnYigxMjMsIDIzNCwgNDUpJywgJ3JnYigyNSwgNTAlLCAxMDAlKScsICdyZ2JhKDEyJSwgMzQsIDU2JSwgMC43OCknXSxcbiAgICAgICAgICAgIC8vIHJlZ2V4OiAvXnJnYmEqXFwoKFxcZHsxLDN9XFwlKiksXFxzKihcXGR7MSwzfVxcJSopLFxccyooXFxkezEsM31cXCUqKSg/OixcXHMqKFswLTkuXSspKT9cXCkvLFxuICAgICAgICAgICAgcmVnZXg6IC9ecmdiYSpcXCgoWzAtOV0qXFwuP1swLTldK1xcJSopLFxccyooWzAtOV0qXFwuP1swLTldK1xcJSopLFxccyooWzAtOV0qXFwuP1swLTldK1xcJSopKD86LFxccyooWzAtOS5dKykpP1xcKS8sXG4gICAgICAgICAgICBwcm9jZXNzOiBmdW5jdGlvbiAocyxyLGcsYixhKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHIgPSByICYmIHIuc2xpY2UoLTEpID09ICclJyA/IChyLnNsaWNlKDAsLTEpIC8gMTAwKSA6IHIqMTtcbiAgICAgICAgICAgICAgICBnID0gZyAmJiBnLnNsaWNlKC0xKSA9PSAnJScgPyAoZy5zbGljZSgwLC0xKSAvIDEwMCkgOiBnKjE7XG4gICAgICAgICAgICAgICAgYiA9IGIgJiYgYi5zbGljZSgtMSkgPT0gJyUnID8gKGIuc2xpY2UoMCwtMSkgLyAxMDApIDogYioxO1xuICAgICAgICAgICAgICAgIGEgPSBhKjE7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICByOiB1dGlsLmNsYW1wKHIsIDAsIDI1NSksXG4gICAgICAgICAgICAgICAgICAgIGc6IHV0aWwuY2xhbXAoZywgMCwgMjU1KSxcbiAgICAgICAgICAgICAgICAgICAgYjogdXRpbC5jbGFtcChiLCAwLCAyNTUpLFxuICAgICAgICAgICAgICAgICAgICBhOiB1dGlsLmNsYW1wKGEsIDAsIDEpIHx8IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAge1xuICAgICAgICAgICAgZXhhbXBsZTogWydoc2woMTIzLCAzNCUsIDQ1JSknLCAnaHNsYSgyNSwgNTAlLCAxMDAlLCAwLjc1KScsICdoc3YoMTIsIDM0JSwgNTYlKSddLFxuICAgICAgICAgICAgcmVnZXg6IC9eaHMoW2J2bF0pYSpcXCgoXFxkezEsM31cXCUqKSxcXHMqKFxcZHsxLDN9XFwlKiksXFxzKihcXGR7MSwzfVxcJSopKD86LFxccyooWzAtOS5dKykpP1xcKS8sXG4gICAgICAgICAgICBwcm9jZXNzOiBmdW5jdGlvbiAoYyxsdixoLHMsbCxhKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGggKj0gMTtcbiAgICAgICAgICAgICAgICBzID0gcy5zbGljZSgwLC0xKSAvIDEwMDtcbiAgICAgICAgICAgICAgICBsID0gbC5zbGljZSgwLC0xKSAvIDEwMDtcbiAgICAgICAgICAgICAgICBhICo9IDE7XG5cbiAgICAgICAgICAgICAgICB2YXIgb2JqID0ge1xuICAgICAgICAgICAgICAgICAgICBoOiB1dGlsLmNsYW1wKGgsIDAsIDM2MCksXG4gICAgICAgICAgICAgICAgICAgIGE6IHV0aWwuY2xhbXAobCwgMCwgMSlcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIC8vIGBzYCBpcyB1c2VkIGluIG1hbnkgZGlmZmVyZW50IHNwYWNlcyAoSFNMLCBIU1YsIEhTQilcbiAgICAgICAgICAgICAgICAvLyBzbyB3ZSB1c2UgYHNsYCwgYHN2YCBhbmQgYHNiYCB0byBkaWZmZXJlbnRpYXRlXG4gICAgICAgICAgICAgICAgb2JqWydzJytsdl0gPSB1dGlsLmNsYW1wKHMsIDAsIDEpLFxuICAgICAgICAgICAgICAgIG9ialtsdl0gPSB1dGlsLmNsYW1wKGwsIDAsIDEpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIF1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIENocm9tYXRoUHJvdG90eXBlKENocm9tYXRoKSB7XG4gIHJldHVybiB7XG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b05hbWVcbiAgICAgICAgIENhbGwgPENocm9tYXRoLnRvTmFtZT4gb24gdGhlIGN1cnJlbnQgaW5zdGFuY2VcbiAgICAgICAgID4gPiB2YXIgY29sb3IgPSBuZXcgQ2hyb21hdGgoJ3JnYigxNzMsIDIxNiwgMjMwKScpO1xuICAgICAgICAgPiA+IGNvbG9yLnRvTmFtZSgpO1xuICAgICAgICAgPiBcImxpZ2h0Ymx1ZVwiXG4gICAgICAqL1xuICAgICAgdG9OYW1lOiBmdW5jdGlvbiAoKXsgcmV0dXJuIENocm9tYXRoLnRvTmFtZSh0aGlzKTsgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG9TdHJpbmdcbiAgICAgICAgIERpc3BsYXkgdGhlIGluc3RhbmNlIGFzIGEgc3RyaW5nLiBEZWZhdWx0cyB0byA8Q2hyb21hdGgudG9IZXhTdHJpbmc+XG4gICAgICAgICA+ID4gdmFyIGNvbG9yID0gQ2hyb21hdGgucmdiKDU2LCA3OCwgOTApO1xuICAgICAgICAgPiA+IENvbG9yLnRvSGV4U3RyaW5nKCk7XG4gICAgICAgICA+IFwiIzM4NEU1QVwiXG4gICAgICAqL1xuICAgICAgdG9TdHJpbmc6IGZ1bmN0aW9uICgpeyByZXR1cm4gdGhpcy50b0hleFN0cmluZygpOyB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB2YWx1ZU9mXG4gICAgICAgICBEaXNwbGF5IHRoZSBpbnN0YW5jZSBhcyBhbiBpbnRlZ2VyLiBEZWZhdWx0cyB0byA8Q2hyb21hdGgudG9JbnRlZ2VyPlxuICAgICAgICAgPiA+IHZhciB5ZWxsb3cgPSBuZXcgQ2hyb21hdGgoJ3llbGxvdycpO1xuICAgICAgICAgPiA+IHllbGxvdy52YWx1ZU9mKCk7XG4gICAgICAgICA+IDE2Nzc2OTYwXG4gICAgICAgICA+ID4gK3llbGxvd1xuICAgICAgICAgPiAxNjc3Njk2MFxuICAgICAgKi9cbiAgICAgIHZhbHVlT2Y6IGZ1bmN0aW9uICgpeyByZXR1cm4gQ2hyb21hdGgudG9JbnRlZ2VyKHRoaXMpOyB9LFxuXG4gICAgLypcbiAgICAgICBNZXRob2Q6IHJnYlxuICAgICAgIFJldHVybiB0aGUgUkdCIGFycmF5IG9mIHRoZSBpbnN0YW5jZVxuICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJ3JlZCcpLnJnYigpO1xuICAgICAgID4gWzI1NSwgMCwgMF1cbiAgICAqL1xuICAgICAgcmdiOiBmdW5jdGlvbiAoKXsgcmV0dXJuIHRoaXMudG9SR0JBcnJheSgpOyB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b1JHQkFycmF5XG4gICAgICAgICBSZXR1cm4gdGhlIFJHQiBhcnJheSBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgID4gPiBDaHJvbWF0aC5idXJseXdvb2QudG9SR0JBcnJheSgpO1xuICAgICAgICAgPiBbMjU1LCAxODQsIDEzNV1cbiAgICAgICovXG4gICAgICB0b1JHQkFycmF5OiBmdW5jdGlvbiAoKXsgcmV0dXJuIHRoaXMudG9SR0JBQXJyYXkoKS5zbGljZSgwLDMpOyB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b1JHQk9iamVjdFxuICAgICAgICAgUmV0dXJuIHRoZSBSR0Igb2JqZWN0IG9mIHRoZSBpbnN0YW5jZVxuICAgICAgICAgPiA+IG5ldyBDaHJvbWF0aCgnYnVybHl3b29kJykudG9SR0JPYmplY3QoKTtcbiAgICAgICAgID4ge3I6IDI1NSwgZzogMTg0LCBiOiAxMzV9XG4gICAgICAqL1xuICAgICAgdG9SR0JPYmplY3Q6IGZ1bmN0aW9uICgpXG4gICAgICB7XG4gICAgICAgICAgdmFyIHJnYiA9IHRoaXMudG9SR0JBcnJheSgpO1xuXG4gICAgICAgICAgcmV0dXJuIHtyOiByZ2JbMF0sIGc6IHJnYlsxXSwgYjogcmdiWzJdfTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvUkdCU3RyaW5nXG4gICAgICAgICBSZXR1cm4gdGhlIFJHQiBzdHJpbmcgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgICA+ID4gbmV3IENocm9tYXRoKCdhbGljZWJsdWUnKS50b1JHQlN0cmluZygpO1xuICAgICAgICAgPiBcInJnYigyNDAsMjQ4LDI1NSlcIlxuICAgICAgKi9cbiAgICAgIHRvUkdCU3RyaW5nOiBmdW5jdGlvbiAoKVxuICAgICAge1xuICAgICAgICAgIHJldHVybiBcInJnYihcIisgdGhpcy50b1JHQkFycmF5KCkuam9pbihcIixcIikgK1wiKVwiO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogcmdiYVxuICAgICAgICAgUmV0dXJuIHRoZSBSR0JBIGFycmF5IG9mIHRoZSBpbnN0YW5jZVxuICAgICAgICAgPiA+IG5ldyBDaHJvbWF0aCgncmVkJykucmdiYSgpO1xuICAgICAgICAgPiBbMjU1LCAwLCAwLCAxXVxuICAgICAgKi9cbiAgICAgIHJnYmE6IGZ1bmN0aW9uICgpeyByZXR1cm4gdGhpcy50b1JHQkFBcnJheSgpOyB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b1JHQkFBcnJheVxuICAgICAgICAgUmV0dXJuIHRoZSBSR0JBIGFycmF5IG9mIHRoZSBpbnN0YW5jZVxuICAgICAgICAgPiA+IENocm9tYXRoLmxpbWUudG9SR0JBQXJyYXkoKTtcbiAgICAgICAgID4gWzAsIDI1NSwgMCwgMV1cbiAgICAgICovXG4gICAgICB0b1JHQkFBcnJheTogZnVuY3Rpb24gKClcbiAgICAgIHtcbiAgICAgICAgICB2YXIgcmdiYSA9IFtcbiAgICAgICAgICAgICAgTWF0aC5yb3VuZCh0aGlzLnIqMjU1KSxcbiAgICAgICAgICAgICAgTWF0aC5yb3VuZCh0aGlzLmcqMjU1KSxcbiAgICAgICAgICAgICAgTWF0aC5yb3VuZCh0aGlzLmIqMjU1KSxcbiAgICAgICAgICAgICAgcGFyc2VGbG9hdCh0aGlzLmEpXG4gICAgICAgICAgXTtcblxuICAgICAgICAgIHJldHVybiByZ2JhO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG9SR0JBT2JqZWN0XG4gICAgICAgICBSZXR1cm4gdGhlIFJHQkEgb2JqZWN0IG9mIHRoZSBpbnN0YW5jZVxuICAgICAgICAgPiA+IENocm9tYXRoLmNhZGV0Ymx1ZS50b1JHQkFPYmplY3QoKTtcbiAgICAgICAgID4ge3I6IDk1LCBnOiAxNTgsIGI6IDE2MH1cbiAgICAgICovXG4gICAgICB0b1JHQkFPYmplY3Q6IGZ1bmN0aW9uICgpXG4gICAgICB7XG4gICAgICAgICAgdmFyIHJnYmEgPSB0aGlzLnRvUkdCQUFycmF5KCk7XG5cbiAgICAgICAgICByZXR1cm4ge3I6IHJnYmFbMF0sIGc6IHJnYmFbMV0sIGI6IHJnYmFbMl0sIGE6IHJnYmFbM119O1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG9SR0JBU3RyaW5nXG4gICAgICAgICBSZXR1cm4gdGhlIFJHQkEgc3RyaW5nIG9mIHRoZSBpbnN0YW5jZVxuICAgICAgICAgPiA+IG5ldyBDaHJvbWF0aCgnZGFya2JsdWUnKS50b1JHQkFTdHJpbmcoKTtcbiAgICAgICAgID4gXCJyZ2JhKDAsMCwxMzksMSlcIlxuICAgICAgKi9cbiAgICAgIHRvUkdCQVN0cmluZzogZnVuY3Rpb24gKCl7XG4gICAgICAgICAgcmV0dXJuIFwicmdiYShcIisgdGhpcy50b1JHQkFBcnJheSgpLmpvaW4oXCIsXCIpICtcIilcIjtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IGhleFxuICAgICAgICAgUmV0dXJuIHRoZSBoZXggYXJyYXkgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgICA+IG5ldyBDaHJvbWF0aCgnZGFya2dyZWVuJykuaGV4KClcbiAgICAgICAgIFsgJzAwJywgJzY0JywgJzAwJyBdXG4gICAgICAqL1xuICAgICAgaGV4OiBmdW5jdGlvbiAoKXsgcmV0dXJuIHRoaXMudG9IZXhBcnJheSgpOyB9LFxuXG4gICAgICAvKlxuICAgICAgICBNZXRob2Q6IHRvSGV4QXJyYXlcbiAgICAgICAgIFJldHVybiB0aGUgaGV4IGFycmF5IG9mIHRoZSBpbnN0YW5jZVxuICAgICAgICA+ID4gQ2hyb21hdGguZmlyZWJyaWNrLnRvSGV4QXJyYXkoKTtcbiAgICAgICAgPiBbXCJCMlwiLCBcIjIyXCIsIFwiMjJcIl1cbiAgICAgICovXG4gICAgICB0b0hleEFycmF5OiBmdW5jdGlvbiAoKXtcbiAgICAgICAgICByZXR1cm4gQ2hyb21hdGgucmdiMmhleCh0aGlzLnIsIHRoaXMuZywgdGhpcy5iKTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvSGV4T2JqZWN0XG4gICAgICAgICBSZXR1cm4gdGhlIGhleCBvYmplY3Qgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgICA+ID4gQ2hyb21hdGguZ2FpbnNib3JvLnRvSGV4T2JqZWN0KCk7XG4gICAgICAgICA+IHtyOiBcIkRDXCIsIGc6IFwiRENcIiwgYjogXCJEQ1wifVxuICAgICAgKi9cbiAgICAgIHRvSGV4T2JqZWN0OiBmdW5jdGlvbiAoKVxuICAgICAge1xuICAgICAgICAgIHZhciBoZXggPSB0aGlzLnRvSGV4QXJyYXkoKTtcblxuICAgICAgICAgIHJldHVybiB7IHI6IGhleFswXSwgZzogaGV4WzFdLCBiOiBoZXhbMl0gfTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgIE1ldGhvZDogdG9IZXhTdHJpbmdcbiAgICAgICAgIFJldHVybiB0aGUgaGV4IHN0cmluZyBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgPiA+IENocm9tYXRoLmhvbmV5ZGV3LnRvSGV4U3RyaW5nKCk7XG4gICAgICAgID4gXCIjRjBGRkYwXCJcbiAgICAgICovXG4gICAgICB0b0hleFN0cmluZzogZnVuY3Rpb24gKCl7XG4gICAgICAgICAgdmFyIGhleCA9IHRoaXMudG9IZXhBcnJheSgpO1xuXG4gICAgICAgICAgcmV0dXJuICcjJyArIGhleC5qb2luKCcnKTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IGhzbFxuICAgICAgICAgUmV0dXJuIHRoZSBIU0wgYXJyYXkgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgICA+ID5uZXcgQ2hyb21hdGgoJ2dyZWVuJykuaHNsKCk7XG4gICAgICAgICA+IFsxMjAsIDEsIDAuMjUwOTgwMzkyMTU2ODYyNzRdXG4gICAgICAqL1xuICAgICAgaHNsOiBmdW5jdGlvbiAoKXsgcmV0dXJuIHRoaXMudG9IU0xBcnJheSgpOyB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b0hTTEFycmF5XG4gICAgICAgICBSZXR1cm4gdGhlIEhTTCBhcnJheSBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJ3JlZCcpLnRvSFNMQXJyYXkoKTtcbiAgICAgICAgID4gWzAsIDEsIDAuNV1cbiAgICAgICovXG4gICAgICB0b0hTTEFycmF5OiBmdW5jdGlvbiAoKXtcbiAgICAgICAgICByZXR1cm4gdGhpcy50b0hTTEFBcnJheSgpLnNsaWNlKDAsMyk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b0hTTE9iamVjdFxuICAgICAgICAgUmV0dXJuIHRoZSBIU0wgb2JqZWN0IG9mIHRoZSBpbnN0YW5jZVxuICAgICAgICAgPiA+IG5ldyBDaHJvbWF0aCgncmVkJykudG9IU0xPYmplY3QoKTtcbiAgICAgICAgIFtoOjAsIHM6MSwgbDowLjVdXG4gICAgICAqL1xuICAgICAgdG9IU0xPYmplY3Q6IGZ1bmN0aW9uICgpXG4gICAgICB7XG4gICAgICAgICAgdmFyIGhzbCA9IHRoaXMudG9IU0xBcnJheSgpO1xuXG4gICAgICAgICAgcmV0dXJuIHtoOiBoc2xbMF0sIHM6IGhzbFsxXSwgbDogaHNsWzJdfTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvSFNMU3RyaW5nXG4gICAgICAgICBSZXR1cm4gdGhlIEhTTCBzdHJpbmcgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgICA+ID4gbmV3IENocm9tYXRoKCdyZWQnKS50b0hTTFN0cmluZygpO1xuICAgICAgICAgPiBcImhzbCgwLDEsMC41KVwiXG4gICAgICAqL1xuICAgICAgdG9IU0xTdHJpbmc6IGZ1bmN0aW9uICgpe1xuICAgICAgICAgIHZhciBoc2xhID0gdGhpcy50b0hTTEFBcnJheSgpO1xuICAgICAgICAgIHZhciB2YWxzID0gW1xuICAgICAgICAgICAgICBoc2xhWzBdLFxuICAgICAgICAgICAgICBNYXRoLnJvdW5kKGhzbGFbMV0qMTAwKSsnJScsXG4gICAgICAgICAgICAgIE1hdGgucm91bmQoaHNsYVsyXSoxMDApKyclJ1xuICAgICAgICAgIF07XG5cbiAgICAgICAgICByZXR1cm4gJ2hzbCgnKyB2YWxzICsnKSc7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICBNZXRob2Q6IGhzbGFcbiAgICAgICAgUmV0dXJuIHRoZSBIU0xBIGFycmF5IG9mIHRoZSBpbnN0YW5jZVxuICAgICAgICA+ID4gbmV3IENocm9tYXRoKCdncmVlbicpLmhzbGEoKTtcbiAgICAgICAgPiBbMTIwLCAxLCAwLjI1MDk4MDM5MjE1Njg2Mjc0LCAxXVxuICAgICAgKi9cbiAgICAgIGhzbGE6IGZ1bmN0aW9uICgpeyByZXR1cm4gdGhpcy50b0hTTEFBcnJheSgpOyB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b0hTTEFycmF5XG4gICAgICAgICBSZXR1cm4gdGhlIEhTTEEgYXJyYXkgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgICA+ID4gQ2hyb21hdGguYW50aXF1ZXdoaXRlLnRvSFNMQUFycmF5KCk7XG4gICAgICAgICA+IFszNCwgMC43Nzc3Nzc3Nzc3Nzc3NzczLCAwLjkxMTc2NDcwNTg4MjM1MjksIDFdXG4gICAgICAqL1xuICAgICAgdG9IU0xBQXJyYXk6IGZ1bmN0aW9uICgpXG4gICAgICB7XG4gICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgTWF0aC5yb3VuZCh0aGlzLmgpLFxuICAgICAgICAgICAgICBwYXJzZUZsb2F0KHRoaXMuc2wpLFxuICAgICAgICAgICAgICBwYXJzZUZsb2F0KHRoaXMubCksXG4gICAgICAgICAgICAgIHBhcnNlRmxvYXQodGhpcy5hKVxuICAgICAgICAgIF07XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b0hTTEFPYmplY3RcbiAgICAgICAgIFJldHVybiB0aGUgSFNMQSBvYmplY3Qgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgICA+ID4gQ2hyb21hdGguYW50aXF1ZXdoaXRlLnRvSFNMQUFycmF5KCk7XG4gICAgICAgICA+IHtoOjM0LCBzOjAuNzc3Nzc3Nzc3Nzc3Nzc3MywgbDowLjkxMTc2NDcwNTg4MjM1MjksIGE6MX1cbiAgICAgICovXG4gICAgICB0b0hTTEFPYmplY3Q6IGZ1bmN0aW9uICgpXG4gICAgICB7XG4gICAgICAgICAgdmFyIGhzbGEgPSB0aGlzLnRvSFNMQUFycmF5KCk7XG5cbiAgICAgICAgICByZXR1cm4ge2g6IGhzbGFbMF0sIHM6IGhzbGFbMV0sIGw6IGhzbGFbMl0sIGE6IGhzbGFbM119O1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG9IU0xBU3RyaW5nXG4gICAgICAgICBSZXR1cm4gdGhlIEhTTEEgc3RyaW5nIG9mIHRoZSBpbnN0YW5jZVxuICAgICAgICAgPiA+IENocm9tYXRoLmFudGlxdWV3aGl0ZS50b0hTTEFTdHJpbmcoKTtcbiAgICAgICAgID4gXCJoc2xhKDM0LDAuNzc3Nzc3Nzc3Nzc3Nzc3MywwLjkxMTc2NDcwNTg4MjM1MjksMSlcIlxuICAgICAgKi9cbiAgICAgIHRvSFNMQVN0cmluZzogZnVuY3Rpb24gKCl7XG4gICAgICAgICAgdmFyIGhzbGEgPSB0aGlzLnRvSFNMQUFycmF5KCk7XG4gICAgICAgICAgdmFyIHZhbHMgPSBbXG4gICAgICAgICAgICAgIGhzbGFbMF0sXG4gICAgICAgICAgICAgIE1hdGgucm91bmQoaHNsYVsxXSoxMDApKyclJyxcbiAgICAgICAgICAgICAgTWF0aC5yb3VuZChoc2xhWzJdKjEwMCkrJyUnLFxuICAgICAgICAgICAgICBNYXRoLnJvdW5kKGhzbGFbM10pXG4gICAgICAgICAgXTtcblxuICAgICAgICAgIHJldHVybiAnaHNsYSgnKyB2YWxzICsnKSc7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiBoc3ZcbiAgICAgICAgIFJldHVybiB0aGUgSFNWIGFycmF5IG9mIHRoZSBpbnN0YW5jZVxuICAgICAgICAgPiA+IG5ldyBDaHJvbWF0aCgnYmx1ZScpLmhzdigpO1xuICAgICAgICAgPiBbMjQwLCAxLCAxXVxuICAgICAgKi9cbiAgICAgIGhzdjogZnVuY3Rpb24gKCl7IHJldHVybiB0aGlzLnRvSFNWQXJyYXkoKTsgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG9IU1ZBcnJheVxuICAgICAgICAgUmV0dXJuIHRoZSBIU1YgYXJyYXkgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgICA+ID4gbmV3IENocm9tYXRoKCduYXZham93aGl0ZScpLnRvSFNWQXJyYXkoKTtcbiAgICAgICAgID4gWzM2LCAwLjMyMTU2ODYyNzQ1MDk4MDM2LCAxXVxuICAgICAgKi9cbiAgICAgIHRvSFNWQXJyYXk6IGZ1bmN0aW9uICgpXG4gICAgICB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMudG9IU1ZBQXJyYXkoKS5zbGljZSgwLDMpO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG9IU1ZPYmplY3RcbiAgICAgICAgIFJldHVybiB0aGUgSFNWIG9iamVjdCBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJ25hdmFqb3doaXRlJykudG9IU1ZPYmplY3QoKTtcbiAgICAgICAgID4ge2gzNiwgczowLjMyMTU2ODYyNzQ1MDk4MDM2LCB2OjF9XG4gICAgICAqL1xuICAgICAgdG9IU1ZPYmplY3Q6IGZ1bmN0aW9uICgpXG4gICAgICB7XG4gICAgICAgICAgdmFyIGhzdmEgPSB0aGlzLnRvSFNWQUFycmF5KCk7XG5cbiAgICAgICAgICByZXR1cm4ge2g6IGhzdmFbMF0sIHM6IGhzdmFbMV0sIHY6IGhzdmFbMl19O1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG9IU1ZTdHJpbmdcbiAgICAgICAgIFJldHVybiB0aGUgSFNWIHN0cmluZyBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJ25hdmFqb3doaXRlJykudG9IU1ZTdHJpbmcoKTtcbiAgICAgICAgID4gXCJoc3YoMzYsMzIuMTU2ODYyNzQ1MDk4MDQlLDEwMCUpXCJcbiAgICAgICovXG4gICAgICB0b0hTVlN0cmluZzogZnVuY3Rpb24gKClcbiAgICAgIHtcbiAgICAgICAgICB2YXIgaHN2ID0gdGhpcy50b0hTVkFycmF5KCk7XG4gICAgICAgICAgdmFyIHZhbHMgPSBbXG4gICAgICAgICAgICAgIGhzdlswXSxcbiAgICAgICAgICAgICAgTWF0aC5yb3VuZChoc3ZbMV0qMTAwKSsnJScsXG4gICAgICAgICAgICAgIE1hdGgucm91bmQoaHN2WzJdKjEwMCkrJyUnXG4gICAgICAgICAgXTtcblxuICAgICAgICAgIHJldHVybiAnaHN2KCcrIHZhbHMgKycpJztcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IGhzdmFcbiAgICAgICAgIFJldHVybiB0aGUgSFNWQSBhcnJheSBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJ2JsdWUnKS5oc3ZhKCk7XG4gICAgICAgICA+IFsyNDAsIDEsIDEsIDFdXG4gICAgICAqL1xuICAgICAgaHN2YTogZnVuY3Rpb24gKCl7IHJldHVybiB0aGlzLnRvSFNWQUFycmF5KCk7IH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvSFNWQUFycmF5XG4gICAgICAgICBSZXR1cm4gdGhlIEhTVkEgYXJyYXkgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgICA+ID4gbmV3IENocm9tYXRoKCdvbGl2ZScpLnRvSFNWQUFycmF5KCk7XG4gICAgICAgICA+IFs2MCwgMSwgMC41MDE5NjA3ODQzMTM3MjU1LCAxXVxuICAgICAgKi9cbiAgICAgIHRvSFNWQUFycmF5OiBmdW5jdGlvbiAoKXtcbiAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICBNYXRoLnJvdW5kKHRoaXMuaCksXG4gICAgICAgICAgICAgIHBhcnNlRmxvYXQodGhpcy5zdiksXG4gICAgICAgICAgICAgIHBhcnNlRmxvYXQodGhpcy52KSxcbiAgICAgICAgICAgICAgcGFyc2VGbG9hdCh0aGlzLmEpXG4gICAgICAgICAgXTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvSFNWQU9iamVjdFxuICAgICAgICAgUmV0dXJuIHRoZSBIU1ZBIG9iamVjdCBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJ29saXZlJykudG9IU1ZBQXJyYXkoKTtcbiAgICAgICAgID4ge2g6NjAsIHM6IDEsIHY6MC41MDE5NjA3ODQzMTM3MjU1LCBhOjF9XG4gICAgICAqL1xuICAgICAgdG9IU1ZBT2JqZWN0OiBmdW5jdGlvbiAoKXtcbiAgICAgICAgICB2YXIgaHN2YSA9IHRoaXMudG9IU1ZBQXJyYXkoKTtcblxuICAgICAgICAgIHJldHVybiB7aDogaHN2YVswXSwgczogaHN2YVsxXSwgbDogaHN2YVsyXSwgYTogaHN2YVszXX07XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b0hTVkFTdHJpbmdcbiAgICAgICAgIFJldHVybiB0aGUgSFNWQSBzdHJpbmcgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgICA+ID4gbmV3IENocm9tYXRoKCdvbGl2ZScpLnRvSFNWQVN0cmluZygpO1xuICAgICAgICAgPiBcImhzdmEoNjAsMTAwJSw1MC4xOTYwNzg0MzEzNzI1NSUsMSlcIlxuICAgICAgKi9cbiAgICAgIHRvSFNWQVN0cmluZzogZnVuY3Rpb24gKClcbiAgICAgIHtcbiAgICAgICAgICB2YXIgaHN2YSA9IHRoaXMudG9IU1ZBQXJyYXkoKTtcbiAgICAgICAgICB2YXIgdmFscyA9IFtcbiAgICAgICAgICAgICAgaHN2YVswXSxcbiAgICAgICAgICAgICAgTWF0aC5yb3VuZChoc3ZhWzFdKjEwMCkrJyUnLFxuICAgICAgICAgICAgICBNYXRoLnJvdW5kKGhzdmFbMl0qMTAwKSsnJScsXG4gICAgICAgICAgICAgIGhzdmFbM11cbiAgICAgICAgICBdO1xuXG4gICAgICAgICAgcmV0dXJuICdoc3ZhKCcrIHZhbHMgKycpJztcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IGhzYlxuICAgICAgICAgQWxpYXMgZm9yIDxoc3Y+XG4gICAgICAqL1xuICAgICAgaHNiOiBmdW5jdGlvbiAoKXsgcmV0dXJuIHRoaXMuaHN2KCk7IH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvSFNCQXJyYXlcbiAgICAgICAgIEFsaWFzIGZvciA8dG9IU0JBcnJheT5cbiAgICAgICovXG4gICAgICB0b0hTQkFycmF5OiBmdW5jdGlvbiAoKVxuICAgICAge1xuICAgICAgICAgIHJldHVybiB0aGlzLnRvSFNWQXJyYXkoKTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvSFNCT2JqZWN0XG4gICAgICAgICBBbGlhcyBmb3IgPHRvSFNWT2JqZWN0PlxuICAgICAgKi9cbiAgICAgIHRvSFNCT2JqZWN0OiBmdW5jdGlvbiAoKVxuICAgICAge1xuICAgICAgICAgIHJldHVybiB0aGlzLnRvSFNWT2JqZWN0KCk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b0hTQlN0cmluZ1xuICAgICAgICAgQWxpYXMgZm9yIDx0b0hTVlN0cmluZz5cbiAgICAgICovXG4gICAgICB0b0hTQlN0cmluZzogZnVuY3Rpb24gKClcbiAgICAgIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy50b0hTVlN0cmluZygpO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogaHNiYVxuICAgICAgICAgQWxpYXMgZm9yIDxoc3ZhPlxuICAgICAgKi9cbiAgICAgIGhzYmE6IGZ1bmN0aW9uICgpeyByZXR1cm4gdGhpcy5oc3ZhKCk7IH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvSFNCQUFycmF5XG4gICAgICAgICBBbGlhcyBmb3IgPHRvSFNWQUFycmF5PlxuICAgICAgKi9cbiAgICAgIHRvSFNCQUFycmF5OiBmdW5jdGlvbiAoKXtcbiAgICAgICAgICByZXR1cm4gdGhpcy50b0hTVkFBcnJheSgpO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG9IU0JBT2JqZWN0XG4gICAgICAgICBBbGlhcyBmb3IgPHRvSFNWQU9iamVjdD5cbiAgICAgICovXG4gICAgICB0b0hTQkFPYmplY3Q6IGZ1bmN0aW9uICgpe1xuICAgICAgICAgIHJldHVybiB0aGlzLnRvSFNWQU9iamVjdCgpO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG9IU0JBU3RyaW5nXG4gICAgICAgICBBbGlhcyBmb3IgPHRvSFNWQVN0cmluZz5cbiAgICAgICovXG4gICAgICB0b0hTQkFTdHJpbmc6IGZ1bmN0aW9uICgpXG4gICAgICB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMudG9IU1ZBU3RyaW5nKCk7XG4gICAgICB9LFxuXG4gICAgICAvL0dyb3VwOiBJbnN0YW5jZSBtZXRob2RzIC0gY29sb3Igc2NoZW1lXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiBjb21wbGVtZW50XG4gICAgICAgICBDYWxscyA8Q2hyb21hdGguY29tcGxlbWVudD4gd2l0aCB0aGUgY3VycmVudCBpbnN0YW5jZSBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyXG5cbiAgICAgICAgID4gPiBDaHJvbWF0aC5yZWQuY29tcGxlbWVudCgpLnJnYigpO1xuICAgICAgICAgPiBbMCwgMjU1LCAyNTVdXG4gICAgICAqL1xuICAgICAgY29tcGxlbWVudDogZnVuY3Rpb24gKCl7XG4gICAgICAgICAgcmV0dXJuIENocm9tYXRoLmNvbXBsZW1lbnQodGhpcyk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0cmlhZFxuICAgICAgICAgQ2FsbHMgPENocm9tYXRoLnRyaWFkPiB3aXRoIHRoZSBjdXJyZW50IGluc3RhbmNlIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXJcblxuICAgICAgICAgPiA+IG5ldyBDaHJvbWF0aCgnaHNsKDAsIDEwMCUsIDUwJSknKS50cmlhZCgpLnRvU3RyaW5nKCk7XG4gICAgICAgICA+IFwiI0ZGMDAwMCwjMDBGRjAwLCMwMDAwRkZcIlxuICAgICAgKi9cbiAgICAgIHRyaWFkOiBmdW5jdGlvbiAoKXtcbiAgICAgICAgICByZXR1cm4gQ2hyb21hdGgudHJpYWQodGhpcyk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0ZXRyYWRcbiAgICAgICAgIENhbGxzIDxDaHJvbWF0aC50ZXRyYWQ+IHdpdGggdGhlIGN1cnJlbnQgaW5zdGFuY2UgYXMgdGhlIGZpcnN0IHBhcmFtZXRlclxuXG4gICAgICAgICA+ID4gQ2hyb21hdGguaHNiKDI0MCwgMSwgMSkudHJpYWQoKTtcbiAgICAgICAgID4gW0Nocm9tYXRoLCBDaHJvbWF0aCwgQ2hyb21hdGhdXG4gICAgICAqL1xuICAgICAgdGV0cmFkOiBmdW5jdGlvbiAoKXtcbiAgICAgICAgICByZXR1cm4gQ2hyb21hdGgudGV0cmFkKHRoaXMpO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogYW5hbG9nb3VzXG4gICAgICAgICBDYWxscyA8Q2hyb21hdGguYW5hbG9nb3VzPiB3aXRoIHRoZSBjdXJyZW50IGluc3RhbmNlIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXJcblxuICAgICAgICAgPiA+IENocm9tYXRoLmhzYigxMjAsIDEsIDEpLmFuYWxvZ291cygpO1xuICAgICAgICAgPiBbQ2hyb21hdGgsIENocm9tYXRoLCBDaHJvbWF0aCwgQ2hyb21hdGgsIENocm9tYXRoLCBDaHJvbWF0aCwgQ2hyb21hdGgsIENocm9tYXRoXVxuXG4gICAgICAgICA+ID4gQ2hyb21hdGguaHNiKDE4MCwgMSwgMSkuYW5hbG9nb3VzKDUpLnRvU3RyaW5nKCk7XG4gICAgICAgICA+IFwiIzAwRkZGRiwjMDBGRkIyLCMwMEZGRTUsIzAwRTVGRiwjMDBCMkZGXCJcblxuICAgICAgICAgPiA+IENocm9tYXRoLmhzYigxODAsIDEsIDEpLmFuYWxvZ291cyg1LCAxMCkudG9TdHJpbmcoKTtcbiAgICAgICAgID4gXCIjMDBGRkZGLCMwMEZGMTksIzAwRkZCMiwjMDBCMkZGLCMwMDE5RkZcIlxuICAgICAgKi9cbiAgICAgIGFuYWxvZ291czogZnVuY3Rpb24gKHJlc3VsdHMsIHNsaWNlcyl7XG4gICAgICAgICAgcmV0dXJuIENocm9tYXRoLmFuYWxvZ291cyh0aGlzLCByZXN1bHRzLCBzbGljZXMpO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgTWV0aG9kOiBtb25vY2hyb21hdGljXG4gICAgICAgICBDYWxscyA8Q2hyb21hdGgubW9ub2Nocm9tYXRpYz4gd2l0aCB0aGUgY3VycmVudCBpbnN0YW5jZSBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyXG5cbiAgICAgICAgPiA+IENocm9tYXRoLmJsdWUubW9ub2Nocm9tYXRpYygpLnRvU3RyaW5nKCk7XG4gICAgICAgID4gXCIjMDAwMDMzLCMwMDAwNjYsIzAwMDA5OSwjMDAwMENDLCMwMDAwRkZcIlxuICAgICAgKi9cbiAgICAgIG1vbm9jaHJvbWF0aWM6IGZ1bmN0aW9uIChyZXN1bHRzKXtcbiAgICAgICAgICByZXR1cm4gQ2hyb21hdGgubW9ub2Nocm9tYXRpYyh0aGlzLCByZXN1bHRzKTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHNwbGl0Y29tcGxlbWVudFxuICAgICAgICAgQ2FsbHMgPENocm9tYXRoLnNwbGl0Y29tcGxlbWVudD4gd2l0aCB0aGUgY3VycmVudCBpbnN0YW5jZSBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyXG5cbiAgICAgICAgID4gPiBDaHJvbWF0aC5ibHVlLnNwbGl0Y29tcGxlbWVudCgpLnRvU3RyaW5nKCk7XG4gICAgICAgICA+IFwiIzAwMDBGRiwjRkZDQzAwLCNGRjUxMDBcIlxuICAgICAgKi9cbiAgICAgIHNwbGl0Y29tcGxlbWVudDogZnVuY3Rpb24gKCl7XG4gICAgICAgICAgcmV0dXJuIENocm9tYXRoLnNwbGl0Y29tcGxlbWVudCh0aGlzKTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIEdyb3VwOiBJbnN0YW5jZSBtZXRob2RzIC0gY29sb3IgYWx0ZXJhdGlvblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdGludFxuICAgICAgICAgQ2FsbHMgPENocm9tYXRoLnRpbnQ+IHdpdGggdGhlIGN1cnJlbnQgaW5zdGFuY2UgYXMgdGhlIGZpcnN0IHBhcmFtZXRlclxuXG4gICAgICAgICA+ID4gbmV3IENocm9tYXRoKCd5ZWxsb3cnKS50aW50KDAuMjUpLnRvU3RyaW5nKCk7XG4gICAgICAgICA+IFwiI0ZGRkYzRlwiXG4gICAgICAqL1xuICAgICAgdGludDogZnVuY3Rpb24gKGJ5KSB7XG4gICAgICAgICAgcmV0dXJuIENocm9tYXRoLnRpbnQodGhpcywgYnkpO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogbGlnaHRlblxuICAgICAgICAgQWxpYXMgZm9yIDx0aW50PlxuICAgICAgKi9cbiAgICAgIGxpZ2h0ZW46IGZ1bmN0aW9uIChieSkge1xuICAgICAgICByZXR1cm4gdGhpcy50aW50KGJ5KTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgIE1ldGhvZDogc2hhZGVcbiAgICAgICAgIENhbGxzIDxDaHJvbWF0aC5zaGFkZT4gd2l0aCB0aGUgY3VycmVudCBpbnN0YW5jZSBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyXG5cbiAgICAgICAgPiA+IG5ldyBDaHJvbWF0aCgneWVsbG93Jykuc2hhZGUoMC4yNSkudG9TdHJpbmcoKTtcbiAgICAgICAgPiBcIiNCRkJGMDBcIlxuICAgICAgKi9cbiAgICAgIHNoYWRlOiBmdW5jdGlvbiAoYnkpIHtcbiAgICAgICAgICByZXR1cm4gQ2hyb21hdGguc2hhZGUodGhpcywgYnkpO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogZGFya2VuXG4gICAgICAgICBBbGlhcyBmb3IgPHNoYWRlPlxuICAgICAgKi9cbiAgICAgIGRhcmtlbjogZnVuY3Rpb24gKGJ5KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNoYWRlKGJ5KTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IGRlc2F0dXJhdGVcbiAgICAgICAgIENhbGxzIDxDaHJvbWF0aC5kZXNhdHVyYXRlPiB3aXRoIHRoZSBjdXJyZW50IGluc3RhbmNlIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXJcblxuICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJ29yYW5nZScpLmRlc2F0dXJhdGUoKS50b1N0cmluZygpO1xuICAgICAgID4gXCIjQURBREFEXCJcblxuICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJ29yYW5nZScpLmRlc2F0dXJhdGUoMSkudG9TdHJpbmcoKTtcbiAgICAgICA+IFwiIzVCNUI1QlwiXG5cbiAgICAgICA+ID4gbmV3IENocm9tYXRoKCdvcmFuZ2UnKS5kZXNhdHVyYXRlKDIpLnRvU3RyaW5nKCk7XG4gICAgICAgPiBcIiNCNEI0QjRcIlxuICAgICAgICovXG4gICAgICBkZXNhdHVyYXRlOiBmdW5jdGlvbiAoZm9ybXVsYSl7XG4gICAgICAgICAgcmV0dXJuIENocm9tYXRoLmRlc2F0dXJhdGUodGhpcywgZm9ybXVsYSk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICBNZXRob2Q6IGdyZXlzY2FsZVxuICAgICAgICBBbGlhcyBmb3IgPGRlc2F0dXJhdGU+XG4gICAgICAqL1xuICAgICAgZ3JleXNjYWxlOiBmdW5jdGlvbiAoZm9ybXVsYSkge1xuICAgICAgICByZXR1cm4gdGhpcy5kZXNhdHVyYXRlKGZvcm11bGEpO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogd2Vic2FmZVxuICAgICAgICAgQ2FsbHMgPENocm9tYXRoLndlYnNhZmU+IHdpdGggdGhlIGN1cnJlbnQgaW5zdGFuY2UgYXMgdGhlIGZpcnN0IHBhcmFtZXRlclxuXG4gICAgICAgICA+ID4gQ2hyb21hdGgucmdiKDEyMywgMjM0LCA1NikudG9TdHJpbmcoKTtcbiAgICAgICAgID4gXCIjN0JFQTM4XCJcblxuICAgICAgICAgPiBDaHJvbWF0aC5yZ2IoMTIzLCAyMzQsIDU2KS53ZWJzYWZlKCkudG9TdHJpbmcoKTtcbiAgICAgICAgID4gXCIjNjZGRjMzXCJcbiAgICAgICAqL1xuICAgICAgd2Vic2FmZTogZnVuY3Rpb24gKCl7XG4gICAgICAgICAgcmV0dXJuIENocm9tYXRoLndlYnNhZmUodGhpcyk7XG4gICAgICB9LFxuXG4gICAgICAvLyBHcm91cDogSW5zdGFuY2UgbWV0aG9kcyAtIGNvbG9yIGNvbWJpbmF0aW9uXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiBhZGRpdGl2ZVxuICAgICAgICAgQ2FsbHMgPENocm9tYXRoLmFkZGl0aXZlPiB3aXRoIHRoZSBjdXJyZW50IGluc3RhbmNlIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXJcblxuICAgICAgICAgPiA+IG5ldyBDaHJvbWF0aCgncmVkJykuYWRkaXRpdmUoJyMwMEZGMDAnLCAnYmx1ZScpLnRvU3RyaW5nKCk7XG4gICAgICAgICA+IFwiI0ZGRkZGRlwiXG4gICAgICAqL1xuICAgICAgYWRkaXRpdmU6IGZ1bmN0aW9uICgpe1xuICAgICAgICAgIHZhciBhcnIgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgICAgIHJldHVybiBDaHJvbWF0aC5hZGRpdGl2ZS5hcHBseShDaHJvbWF0aCwgW3RoaXNdLmNvbmNhdChhcnIpKTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHN1YnRyYWN0aXZlXG4gICAgICAgICBDYWxscyA8Q2hyb21hdGguc3VidHJhY3RpdmU+IHdpdGggdGhlIGN1cnJlbnQgaW5zdGFuY2UgYXMgdGhlIGZpcnN0IHBhcmFtZXRlclxuXG4gICAgICAgICA+ID4gbmV3IENocm9tYXRoKCdjeWFuJykuc3VidHJhY3RpdmUoJ21hZ2VudGEnLCAneWVsbG93JykudG9TdHJpbmcoKTtcbiAgICAgICAgID4gXCIjMDAwMDAwXCJcbiAgICAgICovXG4gICAgICBzdWJ0cmFjdGl2ZTogZnVuY3Rpb24gKCl7XG4gICAgICAgICAgdmFyIGFyciA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgICAgcmV0dXJuIENocm9tYXRoLnN1YnRyYWN0aXZlLmFwcGx5KENocm9tYXRoLCBbdGhpc10uY29uY2F0KGFycikpO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogbXVsdGlwbHlcbiAgICAgICAgIENhbGxzIDxDaHJvbWF0aC5tdWx0aXBseT4gd2l0aCB0aGUgY3VycmVudCBpbnN0YW5jZSBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyXG5cbiAgICAgICAgID4gPiBDaHJvbWF0aC5saWdodGN5YW4ubXVsdGlwbHkoQ2hyb21hdGguYnJvd24pLnRvU3RyaW5nKCk7XG4gICAgICAgICA+IFwiIzkwMkEyQVwiXG4gICAgICAqL1xuICAgICAgbXVsdGlwbHk6IGZ1bmN0aW9uICgpe1xuICAgICAgICAgIHZhciBhcnIgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgICAgIHJldHVybiBDaHJvbWF0aC5tdWx0aXBseS5hcHBseShDaHJvbWF0aCwgW3RoaXNdLmNvbmNhdChhcnIpKTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IGF2ZXJhZ2VcbiAgICAgICAgIENhbGxzIDxDaHJvbWF0aC5hdmVyYWdlPiB3aXRoIHRoZSBjdXJyZW50IGluc3RhbmNlIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXJcblxuICAgICAgICAgPiA+IENocm9tYXRoLmJsYWNrLmF2ZXJhZ2UoJ3doaXRlJykucmdiKCk7XG4gICAgICAgICA+IFsxMjcsIDEyNywgMTI3XVxuICAgICAgKi9cbiAgICAgIGF2ZXJhZ2U6IGZ1bmN0aW9uICgpe1xuICAgICAgICAgIHZhciBhcnIgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgICAgIHJldHVybiBDaHJvbWF0aC5hdmVyYWdlLmFwcGx5KENocm9tYXRoLCBbdGhpc10uY29uY2F0KGFycikpO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogb3ZlcmxheVxuICAgICAgICAgQ2FsbHMgPENocm9tYXRoLm92ZXJsYXk+IHdpdGggdGhlIGN1cnJlbnQgaW5zdGFuY2UgYXMgdGhlIGZpcnN0IHBhcmFtZXRlclxuXG4gICAgICAgPiA+IENocm9tYXRoLnJlZC5vdmVybGF5KCdncmVlbicsIDAuNCkudG9TdHJpbmcoKTtcbiAgICAgICA+IFwiIzk5MzMwMFwiXG5cbiAgICAgICA+ID4gQ2hyb21hdGgucmVkLm92ZXJsYXkoJ2dyZWVuJywgMSkudG9TdHJpbmcoKTtcbiAgICAgICA+IFwiIzAwODAwMFwiXG5cbiAgICAgICA+ID4gQ2hyb21hdGgucmVkLm92ZXJsYXkoJ2dyZWVuJywgMCkudG9TdHJpbmcoKTtcbiAgICAgICA+IFwiI0ZGMDAwMFwiXG4gICAgICAgKi9cbiAgICAgIG92ZXJsYXk6IGZ1bmN0aW9uIChib3R0b20sIHRyYW5zcGFyZW5jeSl7XG4gICAgICAgICAgcmV0dXJuIENocm9tYXRoLm92ZXJsYXkodGhpcywgYm90dG9tLCB0cmFuc3BhcmVuY3kpO1xuICAgICAgfSxcblxuICAgICAgLy8gR3JvdXA6IEluc3RhbmNlIG1ldGhvZHMgLSBvdGhlclxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogY2xvbmVcbiAgICAgICAgIFJldHVybiBhbiBpbmRlcGVuZGVudCBjb3B5IG9mIHRoZSBpbnN0YW5jZVxuICAgICAgKi9cbiAgICAgIGNsb25lOiBmdW5jdGlvbiAoKXtcbiAgICAgICAgICByZXR1cm4gbmV3IENocm9tYXRoKHRoaXMpO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG93YXJkc1xuICAgICAgICAgQ2FsbHMgPENocm9tYXRoLnRvd2FyZHM+IHdpdGggdGhlIGN1cnJlbnQgaW5zdGFuY2UgYXMgdGhlIGZpcnN0IHBhcmFtZXRlclxuXG4gICAgICAgICA+ID4gdmFyIHJlZCA9IG5ldyBDaHJvbWF0aCgncmVkJyk7XG4gICAgICAgICA+ID4gcmVkLnRvd2FyZHMoJ3llbGxvdycsIDAuNTUpLnRvU3RyaW5nKCk7XG4gICAgICAgICA+IFwiI0ZGOEMwMFwiXG4gICAgICAqL1xuICAgICAgdG93YXJkczogZnVuY3Rpb24gKHRvLCBieSkge1xuICAgICAgICAgIHJldHVybiBDaHJvbWF0aC50b3dhcmRzKHRoaXMsIHRvLCBieSk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiBncmFkaWVudFxuICAgICAgICAgQ2FsbHMgPENocm9tYXRoLmdyYWRpZW50PiB3aXRoIHRoZSBjdXJyZW50IGluc3RhbmNlIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXJcblxuICAgICAgICAgPiA+IG5ldyBDaHJvbWF0aCgnI0YwMCcpLmdyYWRpZW50KCcjMDBGJykudG9TdHJpbmcoKVxuICAgICAgICAgPiBcIiNGRjAwMDAsI0YxMDAwRCwjRTQwMDFBLCNENjAwMjgsI0M5MDAzNSwjQkIwMDQzLCNBRTAwNTAsI0ExMDA1RCwjOTMwMDZCLCM4NjAwNzgsIzc4MDA4NiwjNkIwMDkzLCM1RDAwQTEsIzUwMDBBRSwjNDMwMEJCLCMzNTAwQzksIzI4MDBENiwjMUEwMEU0LCMwRDAwRjEsIzAwMDBGRlwiXG5cbiAgICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJyNGMDAnKS5ncmFkaWVudCgnIzAwRicsIDUpLnRvU3RyaW5nKClcbiAgICAgICAgID4gXCIjRkYwMDAwLCNCRjAwM0YsIzdGMDA3RiwjM0YwMEJGLCMwMDAwRkZcIlxuXG4gICAgICAgICA+ID4gbmV3IENocm9tYXRoKCcjRjAwJykuZ3JhZGllbnQoJyMwMEYnLCA1LCAzKS50b1N0cmluZygpXG4gICAgICAgICA+IFwiIzNGMDBCRlwiXG4gICAgICAqL1xuICAgICAgZ3JhZGllbnQ6IGZ1bmN0aW9uICh0bywgc2xpY2VzLCBzbGljZSl7XG4gICAgICAgICAgcmV0dXJuIENocm9tYXRoLmdyYWRpZW50KHRoaXMsIHRvLCBzbGljZXMsIHNsaWNlKTtcbiAgICAgIH1cbiAgfTtcbn07XG4iLCJ2YXIgdXRpbCA9IHt9O1xuXG51dGlsLmNsYW1wID0gZnVuY3Rpb24gKCB2YWwsIG1pbiwgbWF4ICkge1xuICAgIGlmICh2YWwgPiBtYXgpIHJldHVybiBtYXg7XG4gICAgaWYgKHZhbCA8IG1pbikgcmV0dXJuIG1pbjtcbiAgICByZXR1cm4gdmFsO1xufTtcblxudXRpbC5tZXJnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZGVzdCA9IGFyZ3VtZW50c1swXSwgaT0xLCBzb3VyY2UsIHByb3A7XG4gICAgd2hpbGUgKHNvdXJjZSA9IGFyZ3VtZW50c1tpKytdKVxuICAgICAgICBmb3IgKHByb3AgaW4gc291cmNlKSBkZXN0W3Byb3BdID0gc291cmNlW3Byb3BdO1xuXG4gICAgcmV0dXJuIGRlc3Q7XG59O1xuXG51dGlsLmlzQXJyYXkgPSBmdW5jdGlvbiAoIHRlc3QgKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0ZXN0KSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG5cbnV0aWwuaXNTdHJpbmcgPSBmdW5jdGlvbiAoIHRlc3QgKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0ZXN0KSA9PT0gJ1tvYmplY3QgU3RyaW5nXSc7XG59O1xuXG51dGlsLmlzTnVtYmVyID0gZnVuY3Rpb24gKCB0ZXN0ICkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodGVzdCkgPT09ICdbb2JqZWN0IE51bWJlcl0nO1xufTtcblxudXRpbC5pc09iamVjdCA9IGZ1bmN0aW9uICggdGVzdCApIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHRlc3QpID09PSAnW29iamVjdCBPYmplY3RdJztcbn07XG5cbnV0aWwubHBhZCA9IGZ1bmN0aW9uICggdmFsLCBsZW4sIHBhZCApIHtcbiAgICB2YWwgPSB2YWwudG9TdHJpbmcoKTtcbiAgICBpZiAoIWxlbikgbGVuID0gMjtcbiAgICBpZiAoIXBhZCkgcGFkID0gJzAnO1xuXG4gICAgd2hpbGUgKHZhbC5sZW5ndGggPCBsZW4pIHZhbCA9IHBhZCt2YWw7XG5cbiAgICByZXR1cm4gdmFsO1xufTtcblxudXRpbC5sZXJwID0gZnVuY3Rpb24gKGZyb20sIHRvLCBieSkge1xuICAgIHJldHVybiBmcm9tICsgKHRvLWZyb20pICogYnk7XG59O1xuXG51dGlsLnRpbWVzID0gZnVuY3Rpb24gKG4sIGZuLCBjb250ZXh0KSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIHJlc3VsdHMgPSBbXTsgaSA8IG47IGkrKykge1xuICAgICAgICByZXN1bHRzW2ldID0gZm4uY2FsbChjb250ZXh0LCBpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG59O1xuXG51dGlsLnJnYiA9IHtcbiAgICBmcm9tQXJnczogZnVuY3Rpb24gKHIsIGcsIGIsIGEpIHtcbiAgICAgICAgdmFyIHJnYiA9IGFyZ3VtZW50c1swXTtcblxuICAgICAgICBpZiAodXRpbC5pc0FycmF5KHJnYikpeyByPXJnYlswXTsgZz1yZ2JbMV07IGI9cmdiWzJdOyBhPXJnYlszXTsgfVxuICAgICAgICBpZiAodXRpbC5pc09iamVjdChyZ2IpKXsgcj1yZ2IucjsgZz1yZ2IuZzsgYj1yZ2IuYjsgYT1yZ2IuYTsgIH1cblxuICAgICAgICByZXR1cm4gW3IsIGcsIGIsIGFdO1xuICAgIH0sXG4gICAgc2NhbGVkMDE6IGZ1bmN0aW9uIChyLCBnLCBiKSB7XG4gICAgICAgIGlmICghaXNGaW5pdGUoYXJndW1lbnRzWzFdKSl7XG4gICAgICAgICAgICB2YXIgcmdiID0gdXRpbC5yZ2IuZnJvbUFyZ3MociwgZywgYik7XG4gICAgICAgICAgICByID0gcmdiWzBdLCBnID0gcmdiWzFdLCBiID0gcmdiWzJdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHIgPiAxKSByIC89IDI1NTtcbiAgICAgICAgaWYgKGcgPiAxKSBnIC89IDI1NTtcbiAgICAgICAgaWYgKGIgPiAxKSBiIC89IDI1NTtcblxuICAgICAgICByZXR1cm4gW3IsIGcsIGJdO1xuICAgIH0sXG4gICAgcGN0V2l0aFN5bWJvbDogZnVuY3Rpb24gKHIsIGcsIGIpIHtcbiAgICAgICAgdmFyIHJnYiA9IHRoaXMuc2NhbGVkMDEociwgZywgYik7XG5cbiAgICAgICAgcmV0dXJuIHJnYi5tYXAoZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnJvdW5kKHYgKiAyNTUpICsgJyUnO1xuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG51dGlsLmhzbCA9IHtcbiAgICBmcm9tQXJnczogZnVuY3Rpb24gKGgsIHMsIGwsIGEpIHtcbiAgICAgICAgdmFyIGhzbCA9IGFyZ3VtZW50c1swXTtcblxuICAgICAgICBpZiAodXRpbC5pc0FycmF5KGhzbCkpeyBoPWhzbFswXTsgcz1oc2xbMV07IGw9aHNsWzJdOyBhPWhzbFszXTsgfVxuICAgICAgICBpZiAodXRpbC5pc09iamVjdChoc2wpKXsgaD1oc2wuaDsgcz1oc2wuczsgbD0oaHNsLmwgfHwgaHNsLnYpOyBhPWhzbC5hOyB9XG5cbiAgICAgICAgcmV0dXJuIFtoLCBzLCBsLCBhXTtcbiAgICB9LFxuICAgIHNjYWxlZDogZnVuY3Rpb24gKGgsIHMsIGwpIHtcbiAgICAgICAgaWYgKCFpc0Zpbml0ZShhcmd1bWVudHNbMV0pKXtcbiAgICAgICAgICAgIHZhciBoc2wgPSB1dGlsLmhzbC5mcm9tQXJncyhoLCBzLCBsKTtcbiAgICAgICAgICAgIGggPSBoc2xbMF0sIHMgPSBoc2xbMV0sIGwgPSBoc2xbMl07XG4gICAgICAgIH1cblxuICAgICAgICBoID0gKCgoaCAlIDM2MCkgKyAzNjApICUgMzYwKTtcbiAgICAgICAgaWYgKHMgPiAxKSBzIC89IDEwMDtcbiAgICAgICAgaWYgKGwgPiAxKSBsIC89IDEwMDtcblxuICAgICAgICByZXR1cm4gW2gsIHMsIGxdO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gdXRpbDtcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuLy9DcmFmdCBvYmplY3QucHJvdHlwZVxyXG4oZnVuY3Rpb24oKXtcclxuXHRpZiggdHlwZW9mKE9iamVjdC5hZGRDb25zdFByb3ApID09IFwiZnVuY3Rpb25cIil7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdFxyXG5cdFxyXG5cdGZ1bmN0aW9uIGNvbnN0UHJvcChuYW1lX3Byb3AsIHZhbHVlLCB2aXMpe1xyXG5cdFx0aWYodmlzID09PSB1bmRlZmluZWQpIHZpcyA9IHRydWU7XHJcblx0XHRpZih0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIpIE9iamVjdC5mcmVlemUodmFsdWUpO1xyXG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIG5hbWVfcHJvcCwge1xyXG5cdFx0XHRcdHZhbHVlOiB2YWx1ZSxcclxuXHRcdFx0XHRlbnVtZXJhYmxlOiB2aXNcclxuXHRcdFx0fSk7XHJcblx0fVxyXG5cdGZ1bmN0aW9uIGdldFNldChuYW1lLCBnZXR0ZXIsIHNldHRlcil7XHJcblx0XHRpZih0eXBlb2Ygc2V0dGVyID09IFwiZnVuY3Rpb25cIil7XHJcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBuYW1lLCB7XHJcblx0XHRcdFx0Z2V0OiBnZXR0ZXIsXHJcblx0XHRcdFx0c2V0OiBzZXR0ZXIsXHJcblx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcclxuXHRcdFx0XHRjb25maWd1cmFibGU6IHRydWVcclxuXHRcdFx0fSk7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIG5hbWUsIHtcclxuXHRcdFx0XHRnZXQ6IGdldHRlcixcclxuXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxyXG5cdFx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0Y29uc3RQcm9wLmNhbGwoT2JqZWN0LnByb3RvdHlwZSwgJ2FkZENvbnN0UHJvcCcsIGNvbnN0UHJvcCwgZmFsc2UpO1xyXG5cdE9iamVjdC5wcm90b3R5cGUuYWRkQ29uc3RQcm9wKCdhZGRHZXRTZXQnLCBnZXRTZXQsIGZhbHNlKTtcclxuXHRcclxuXHRcclxuXHRpZih0eXBlb2YoT2JqZWN0LnByb3RvdHlwZS50b1NvdXJjZSkgIT09IFwiZnVuY3Rpb25cIil7XHJcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoT2JqZWN0LnByb3RvdHlwZSwgJ3RvU291cmNlJyx7XHJcblx0XHRcdHZhbHVlOiBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0dmFyIHN0ciA9ICd7JztcclxuXHRcdFx0XHRcdGZvcih2YXIga2V5IGluIHRoaXMpe1xyXG5cdFx0XHRcdFx0XHRzdHIgKz0gJyAnICsga2V5ICsgJzogJyArIHRoaXNba2V5XSArICcsJztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGlmKHN0ci5sZW5ndGggPiAyKSBzdHIgPSBzdHIuc2xpY2UoMCwgLTEpICsgJyAnO1xyXG5cdFx0XHRcdFx0cmV0dXJuIHN0ciArICd9JztcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRlbnVtZXJhYmxlOiBmYWxzZVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdFxyXG5cdGlmKHR5cGVvZihPYmplY3QudmFsdWVzKSAhPT0gXCJmdW5jdGlvblwiKXtcclxuXHRcdHZhciB2YWxfT2JqID0gZnVuY3Rpb24ob2JqKXtcclxuXHRcdFx0dmFyIHZhbHMgPSBbXTtcclxuXHRcdFx0XHJcblx0XHRcdGZvciAodmFyIGtleSBpbiBvYmopIHtcclxuXHRcdFx0XHR2YWxzLnB1c2gob2JqW2tleV0pO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRyZXR1cm4gdmFscztcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdCBPYmplY3QuYWRkQ29uc3RQcm9wKCd2YWx1ZXMnLCB2YWxfT2JqLmJpbmQoT2JqZWN0KSk7XHJcblx0fVxyXG5cdFxyXG5cdGZ1bmN0aW9uIHJhbmRJbmRleCgpe1xyXG5cdFx0dmFyIHJhbmQgPSBNYXRoLnJvdW5kKCh0aGlzLmxlbmd0aCAtIDEpICogTWF0aC5yYW5kb20oKSk7XHJcblx0XHRyZXR1cm4gdGhpc1tyYW5kXTtcclxuXHR9XHJcblx0QXJyYXkucHJvdG90eXBlLmFkZENvbnN0UHJvcCgncmFuZF9pJywgcmFuZEluZGV4KTtcclxuXHRcclxuXHRcclxuXHRmdW5jdGlvbiBjcmVhdGVBcnIodmFsLCBsZW5ndGgsIGlzX2NhbGwpe1xyXG5cdFx0dmFyIGFyciA9IFtdO1xyXG5cdFx0XHJcblx0XHRpZighbGVuZ3RoKSBsZW5ndGggPSAxO1xyXG5cdFx0aWYoaXNfY2FsbCA9PT0gdW5kZWZpbmVkKSBpc19jYWxsID0gdHJ1ZTtcclxuXHRcdFxyXG5cdFx0aWYodHlwZW9mIHZhbCA9PSAnZnVuY3Rpb24nICYmIGlzX2NhbGwpe1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspe1xyXG5cdFx0XHRcdGFyci5wdXNoKHZhbChpLCBhcnIpKTtcclxuXHRcdFx0fVxyXG5cdFx0fWVsc2V7XHJcblx0XHRcdFxyXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspe1xyXG5cdFx0XHRcdGFyci5wdXNoKHZhbCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIGFycjtcclxuXHR9XHJcblx0XHJcblx0QXJyYXkucHJvdG90eXBlLmFkZENvbnN0UHJvcCgnYWRkJywgZnVuY3Rpb24odmFsKXtcclxuXHRcdGlmKCF0aGlzLl9udWxscykgdGhpcy5fbnVsbHMgPSBbXTtcclxuXHRcdFxyXG5cdFx0aWYodGhpcy5fbnVsbHMubGVuZ3RoKXtcclxuXHRcdFx0dmFyIGluZCA9IHRoaXMuX251bGxzLnBvcCgpO1xyXG5cdFx0XHR0aGlzW2luZF0gPSB2YWw7XHJcblx0XHRcdHJldHVybiBpbmQ7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0cmV0dXJuIHRoaXMucHVzaCh2YWwpIC0gMTtcclxuXHRcdH1cclxuXHR9KTtcclxuXHRcclxuXHRBcnJheS5wcm90b3R5cGUuYWRkQ29uc3RQcm9wKCdkZWxsJywgZnVuY3Rpb24oaW5kKXtcclxuXHRcdGlmKGluZCA+IHRoaXMubGVuZ3RoIC0xKSByZXR1cm4gZmFsc2U7XHJcblx0XHRcclxuXHRcdGlmKGluZCA9PSB0aGlzLmxlbmd0aCAtMSl7XHJcblx0XHRcdHRoaXMucG9wKCk7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0aWYoIXRoaXMuX251bGxzKSB0aGlzLl9udWxscyA9IFtdO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpc1tpbmRdID0gdW5kZWZpbmVkO1xyXG5cdFx0XHR0aGlzLl9udWxscy5wdXNoKGluZCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiB0cnVlO1x0XHJcblx0fSk7XHJcblx0XHJcblx0QXJyYXkuYWRkQ29uc3RQcm9wKCdjcmVhdGUnLCBjcmVhdGVBcnIpO1xyXG5cdFxyXG5cdFxyXG5cdGlmKFJlZ0V4cC5wcm90b3R5cGUudG9KU09OICE9PSBcImZ1bmN0aW9uXCIpe1xyXG5cdFx0UmVnRXhwLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpeyByZXR1cm4gdGhpcy5zb3VyY2U7IH07XHJcblx0fVxyXG5cclxufSkoKTtcclxuXHJcblxyXG5cclxuXHJcbiIsIid1c2Ugc3RyaWN0JztcclxubmV3IChmdW5jdGlvbigpe1xyXG5cdGlmKHR5cGVvZihPYmplY3QuYWRkQ29uc3RQcm9wKSAhPT0gXCJmdW5jdGlvblwiKXtcclxuXHRcdGlmKHR5cGVvZiBtb2R1bGUgPT0gXCJvYmplY3RcIil7XHJcblx0XHRcdHJlcXVpcmUoXCIuL21vZi5qc1wiKTtcclxuXHRcdH1lbHNlIHRocm93IG5ldyBFcnJvcihcItCi0YDQtdCx0YPQtdGC0YzRgdGPINCx0LjQsdC70LjQvtGC0LXQutCwIG1vZi5qc1wiKTtcclxuXHR9XHJcblxyXG5cdGlmKHR5cGVvZihPYmplY3QudHlwZXMpID09IFwib2JqZWN0XCIpe1xyXG5cdFx0cmV0dXJuIE9iamVjdC50eXBlcztcclxuXHR9XHJcblxyXG5cdHZhciBUID0gdGhpcztcclxuXHR2YXIgRG9jID0ge1xyXG5cdFx0dHlwZXM6e1xyXG5cdFx0XHQnYm9vbCc6e1xyXG5cdFx0XHRcdG5hbWU6IFwiQm9vbGVhblwiLFxyXG5cdFx0XHRcdGFyZzogW11cclxuXHRcdFx0fSxcclxuXHRcdFx0J2NvbnN0Jzoge1xyXG5cdFx0XHRcdG5hbWU6IFwiQ29uc3RhbnRcIixcclxuXHRcdFx0XHRhcmc6IFtcInZhbHVlXCJdLFxyXG5cdFx0XHRcdHBhcmFtczogeyB2YWx1ZToge3R5cGU6IFwiU29tZXRoaW5nXCIsIGRlZmF1bHRfdmFsdWU6IG51bGx9fVxyXG5cdFx0XHR9LFxyXG5cdFx0XHQncG9zJzoge1xyXG5cdFx0XHRcdG5hbWU6IFwiUG9zaXRpb25cIixcclxuXHRcdFx0XHRhcmc6IFsnbWF4J10sXHJcblx0XHRcdFx0cGFyYW1zOiB7bWF4OiB7dHlwZTogJ3BvcycsIGRlZmF1bHRfdmFsdWU6ICsyMTQ3NDgzNjQ3fX1cclxuXHJcblx0XHRcdH0sXHJcblxyXG5cdFx0XHQnaW50Jzoge1xyXG5cdFx0XHRcdG5hbWU6IFwiSW50ZWdlclwiLFxyXG5cdFx0XHRcdGFyZzogW1wibWF4XCIsIFwibWluXCIsIFwic3RlcFwiXSxcclxuXHRcdFx0XHRwYXJhbXM6IHtcclxuXHRcdFx0XHRcdFx0bWF4OiB7dHlwZTogJ2ludCcsIGRlZmF1bHRfdmFsdWU6ICsyMTQ3NDgzNjQ3fSxcclxuXHRcdFx0XHRcdFx0bWluOiB7dHlwZTogJ2ludCcsIGRlZmF1bHRfdmFsdWU6IC0yMTQ3NDgzNjQ4fSxcclxuXHRcdFx0XHRcdFx0c3RlcDoge3R5cGU6ICdwb3MnLCBkZWZhdWx0X3ZhbHVlOiAxfVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHR9LFxyXG5cclxuXHRcdFx0J251bSc6IHtcclxuXHRcdFx0XHRuYW1lOiBcIk51bWJlclwiLFxyXG5cdFx0XHRcdGFyZzogW1wibWF4XCIsIFwibWluXCIsIFwicHJlY2lzXCJdLFxyXG5cdFx0XHRcdHBhcmFtczoge1xyXG5cdFx0XHRcdFx0XHRtYXg6IHt0eXBlOiAnbnVtJywgZGVmYXVsdF92YWx1ZTogKzIxNDc0ODM2NDd9LFxyXG5cdFx0XHRcdFx0XHRtaW46IHt0eXBlOiAnbnVtJywgZGVmYXVsdF92YWx1ZTogLTIxNDc0ODM2NDh9LFxyXG5cdFx0XHRcdFx0XHRwcmVjaXM6IHt0eXBlOiAncG9zJywgZGVmYXVsdF92YWx1ZTogOX1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0fSxcclxuXHRcdFx0J2Fycic6IHtcclxuXHRcdFx0XHRuYW1lOiBcIkFycmF5XCIsXHJcblx0XHRcdFx0YXJnOiBbXCJ0eXBlc1wiLCBcInNpemVcIiwgXCJmaXhlZFwiXSxcclxuXHRcdFx0XHRwYXJhbXM6IHtcclxuXHRcdFx0XHRcdFx0dHlwZXM6IHt0eXBlOiBcIlR5cGUgfHwgW1R5cGUsIFR5cGUuLi5dXCIsIGdldCBkZWZhdWx0X3ZhbHVlKCl7cmV0dXJuIFQucG9zfX0sXHJcblx0XHRcdFx0XHRcdHNpemU6IHt0eXBlOiAncG9zJywgZGVmYXVsdF92YWx1ZTogN30sXHJcblx0XHRcdFx0XHRcdGZpeGVkOiB7dHlwZTogJ2Jvb2wnLCBkZWZhdWx0X3ZhbHVlOiB0cnVlfVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHR9LFxyXG5cdFx0XHQnYW55Jzoge1xyXG5cdFx0XHRcdG5hbWU6IFwiTWl4VHlwZVwiLFxyXG5cdFx0XHRcdGFyZzogW1widHlwZXNcIl0sXHJcblx0XHRcdFx0cGFyYW1zOiB7XHJcblx0XHRcdFx0XHRcdHR5cGVzOiB7dHlwZTogXCJUeXBlLCBUeXBlLi4uIHx8IFtUeXBlLCBUeXBlLi4uXVwiLCBnZXQgZGVmYXVsdF92YWx1ZSgpe3JldHVybiBbVC5wb3MsIFQuc3RyXX19XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdH0sXHJcblx0XHRcdCdvYmonOiB7XHJcblx0XHRcdFx0bmFtZTogXCJPYmplY3RcIixcclxuXHRcdFx0XHRhcmc6IFtcInR5cGVzXCJdLFxyXG5cdFx0XHRcdHBhcmFtczoge3R5cGVzOiB7dHlwZTogXCJPYmplY3RcIiwgZGVmYXVsdF92YWx1ZToge319fVxyXG5cdFx0XHR9XHJcblx0XHR9LFxyXG5cdFx0Z2V0Q29uc3Q6IGZ1bmN0aW9uKG5hbWVfdHlwZSwgbmFtZV9saW1pdCl7XHJcblx0XHRcdHJldHVybiB0aGlzLnR5cGVzW25hbWVfdHlwZV0ucGFyYW1zW25hbWVfbGltaXRdLmRlZmF1bHRfdmFsdWU7XHJcblx0XHR9XHJcblx0fTtcclxuXHR0aGlzLmRvYyA9IHt9O1xyXG5cdHRoaXMuZG9jLmpzb24gPSBKU09OLnN0cmluZ2lmeShEb2MsIFwiXCIsIDIpO1xyXG5cclxuXHREb2MuZ2VuRG9jID0gKGZ1bmN0aW9uKG5hbWUsIHBhcmFtcyl7cmV0dXJuIHtuYW1lOiB0aGlzLnR5cGVzW25hbWVdLm5hbWUsIHBhcmFtczogcGFyYW1zfX0pLmJpbmQoRG9jKTtcclxuXHR0aGlzLmRvYy5nZW4gPSBEb2MuZ2VuRG9jO1xyXG5cclxuXHJcblxyXG5cclxuXHQvL0Vycm9zXHJcblx0ZnVuY3Rpb24gYXJnVHlwZUVycm9yKHdyb25nX2FyZywgbWVzcyl7XHJcblx0XHRpZihtZXNzID09PSB1bmRlZmluZWQpIG1lc3MgPSAnJztcclxuXHRcdHZhciBFUiA9IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50IHR5cGUgaXMgd3JvbmchIEFyZ3VtZW50cygnICsgZm9yQXJnKHdyb25nX2FyZykgKyAnKTsnICsgbWVzcyk7XHJcblx0XHRFUi53cm9uZ19hcmcgPSB3cm9uZ19hcmc7XHJcblxyXG5cdFx0aWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKSB7XHJcblx0XHRcdEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKEVSLCBhcmdUeXBlRXJyb3IpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBFUjtcclxuXHJcblx0XHRmdW5jdGlvbiBmb3JBcmcoYXJncyl7XHJcblx0XHRcdHZhciBzdHJfYXJncyA9ICcnO1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKyl7XHJcblx0XHRcdFx0c3RyX2FyZ3MgKz0gdHlwZW9mKGFyZ3NbaV0pICsgJzogJyArIGFyZ3NbaV0gKyAnOyAnO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBzdHJfYXJncztcclxuXHRcdH1cclxuXHR9XHJcblx0VC5lcnJvciA9IGFyZ1R5cGVFcnJvcjtcclxuXHJcblx0ZnVuY3Rpb24gdHlwZVN5bnRheEVycm9yKHdyb25nX3N0ciwgbWVzcyl7XHJcblx0XHRpZihtZXNzID09PSB1bmRlZmluZWQpIG1lc3MgPSAnJztcclxuXHRcdHZhciBFUiA9IG5ldyBTeW50YXhFcnJvcignTGluZTogJyArIHdyb25nX3N0ciArICc7ICcgKyBtZXNzKTtcclxuXHRcdEVSLndyb25nX2FyZyA9IHdyb25nX3N0cjtcclxuXHJcblx0XHRpZiAoRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UpIHtcclxuXHRcdFx0RXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UoRVIsIHR5cGVTeW50YXhFcnJvcik7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIEVSO1xyXG5cdH1cclxuXHJcblxyXG5cclxuXHRmdW5jdGlvbiBDcmVhdGVDcmVhdG9yKE5ldywgdGVzdCwgcmFuZCwgZG9jKXtcclxuXHRcdHZhciBjcmVhdG9yO1xyXG5cdFx0aWYodHlwZW9mIE5ldyA9PT0gXCJmdW5jdGlvblwiKXtcclxuXHRcdFx0Y3JlYXRvciA9IGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0dmFyIHRtcF9vYmogPSBOZXcuYXBwbHkoe30sIGFyZ3VtZW50cyk7XHJcblx0XHRcdFx0dmFyIG5ld19jcmVhdG9yID0gbmV3IENyZWF0ZUNyZWF0b3IoTmV3KTtcclxuXHRcdFx0XHRmb3IodmFyIGtleSBpbiB0bXBfb2JqKXtcclxuXHRcdFx0XHRcdG5ld19jcmVhdG9yLmFkZENvbnN0UHJvcChrZXksIHRtcF9vYmpba2V5XSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHJldHVybiBuZXdfY3JlYXRvcjtcclxuXHRcdFx0fTtcclxuXHRcdH1lbHNlIGNyZWF0b3IgPSBmdW5jdGlvbigpe3JldHVybiBjcmVhdG9yfTtcclxuXHJcblx0XHRjcmVhdG9yLmFkZENvbnN0UHJvcCgnaXNfY3JlYXRvcicsIHRydWUpO1xyXG5cdFx0aWYodHlwZW9mIHRlc3QgPT09IFwiZnVuY3Rpb25cIikgY3JlYXRvci5hZGRDb25zdFByb3AoJ3Rlc3QnLCB0ZXN0KTtcclxuXHRcdGlmKHR5cGVvZiByYW5kID09PSBcImZ1bmN0aW9uXCIpIGNyZWF0b3IuYWRkQ29uc3RQcm9wKCdyYW5kJywgcmFuZCk7XHJcblx0XHRpZih0eXBlb2YgZG9jID09PSBcImZ1bmN0aW9uXCIpIGNyZWF0b3IuYWRkQ29uc3RQcm9wKCdkb2MnLCBkb2MpO1xyXG5cclxuXHRcdHJldHVybiBjcmVhdG9yO1xyXG5cdH1cclxuXHR0aGlzLm5ld1R5cGUgPSBmdW5jdGlvbihrZXksIGRlc2MsIG5ld190eXBlKXtcclxuXHRcdERvYy50eXBlc1trZXldID0gZGVzYztcclxuXHRcdFQubmFtZXNbZGVzYy5uYW1lXSA9IGtleTtcclxuXHRcdHRoaXMuZG9jLmpzb24gPSBKU09OLnN0cmluZ2lmeShEb2MsIFwiXCIsIDIpO1xyXG5cclxuXHRcdHRoaXNba2V5XSA9IG5ldyBDcmVhdGVDcmVhdG9yKG5ld190eXBlLk5ldywgbmV3X3R5cGUudGVzdCwgbmV3X3R5cGUucmFuZCwgbmV3X3R5cGUuZG9jKTtcclxuXHR9XHJcblx0dGhpcy5uZXdUeXBlLmRvYyA9ICcobmFtZSwgY29uc3RydWN0b3IsIGZ1bmNUZXN0LCBmdW5jUmFuZCwgZnVuY0RvYyknO1xyXG5cclxuXHJcblxyXG5cdC8vQ3JhZnQgQm9vbGVhblxyXG5cdFx0dGhpcy5ib29sID0gbmV3IENyZWF0ZUNyZWF0b3IoXHJcblx0XHRcdG51bGwsXHJcblx0XHRcdGZ1bmN0aW9uKHZhbHVlKXtcclxuXHRcdFx0XHRpZih0eXBlb2YgdmFsdWUgIT09ICdib29sZWFuJyl7XHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5kb2MoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sXHJcblx0XHRcdGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0cmV0dXJuICEoTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpKSk7XHJcblx0XHRcdH0sXHJcblx0XHRcdERvYy5nZW5Eb2MuYmluZChudWxsLCBcImJvb2xcIilcclxuXHRcdCk7XHJcblxyXG5cclxuXHJcblx0Ly9DcmFmdCBDb25zdFxyXG5cdFx0ZnVuY3Rpb24gZG9jQ29uc3QodmFsKXtcclxuXHJcblx0XHRcdGlmKHR5cGVvZih2YWwpID09PSBcIm9iamVjdFwiICYmIHZhbCAhPT0gbnVsbCl7XHJcblx0XHRcdFx0dmFsID0gJ09iamVjdCc7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYodHlwZW9mKHZhbCkgPT09IFwiZnVuY3Rpb25cIil7XHJcblx0XHRcdFx0dmFsID0gdmFsLnRvU3RyaW5nKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIERvYy5nZW5Eb2MuYmluZChudWxsLFwiY29uc3RcIiwge3ZhbHVlOiB2YWx9KTtcclxuXHRcdH1cclxuXHRcdGZ1bmN0aW9uIG5ld0NvbnN0KHZhbCl7XHJcblx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0cmFuZDogZnVuY3Rpb24oKXtyZXR1cm4gdmFsfSxcclxuXHRcdFx0XHR0ZXN0OiBmdW5jdGlvbih2KXtcclxuXHRcdFx0XHRcdGlmKHZhbCAhPT0gdikgcmV0dXJuIHRoaXMuZG9jKCk7XHJcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRkb2M6IGRvY0NvbnN0KHZhbClcclxuXHRcdFx0fTtcclxuXHRcdH1cclxuXHRcdHZhciBkZWZfY29uc3QgPSBuZXdDb25zdChEb2MuZ2V0Q29uc3QoJ2NvbnN0JywgJ3ZhbHVlJykpO1xyXG5cdFx0dGhpcy5jb25zdCA9IG5ldyBDcmVhdGVDcmVhdG9yKG5ld0NvbnN0LCBkZWZfY29uc3QudGVzdCwgZGVmX2NvbnN0LnJhbmQsIGRlZl9jb25zdC5kb2MpO1xyXG5cclxuXHRcdGZ1bmN0aW9uIHRDb25zdChUeXBlKXtcclxuXHRcdFx0aWYodHlwZW9mIChUeXBlKSAhPT0gXCJmdW5jdGlvblwiIHx8ICFUeXBlLmlzX2NyZWF0b3Ipe1xyXG5cdFx0XHRcdGlmKEFycmF5LmlzQXJyYXkoVHlwZSkpe1xyXG5cclxuXHRcdFx0XHRcdHJldHVybiBULmFycihUeXBlKTtcclxuXHJcblx0XHRcdFx0fWVsc2UgaWYodHlwZW9mKFR5cGUpID09IFwib2JqZWN0XCIgJiYgVHlwZSAhPT0gbnVsbCl7XHJcblxyXG5cdFx0XHRcdFx0cmV0dXJuIFQub2JqKFR5cGUpO1xyXG5cclxuXHRcdFx0XHR9ZWxzZSByZXR1cm4gVC5jb25zdChUeXBlKTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0cmV0dXJuIFR5cGU7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblxyXG5cdC8vQ3JhZnQgTnVtYmVyXHJcblx0XHR2YXIgcmFuZE51bSA9IGZ1bmN0aW9uKG1heCwgbWluLCBwcmVjaXMpe1xyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRyZXR1cm4gKygoKG1heCAtIG1pbikqTWF0aC5yYW5kb20oKSArICBtaW4pLnRvRml4ZWQocHJlY2lzKSk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblxyXG5cdFx0dmFyIHRlc3ROdW0gPSBmdW5jdGlvbihtYXgsIG1pbiwgcHJlY2lzKXtcclxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKG4pe1xyXG5cdFx0XHRcdGlmKHR5cGVvZiBuICE9PSAnbnVtYmVyJyB8fCAhaXNGaW5pdGUobikpe1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuZG9jKCk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpZigobiA+IG1heClcclxuXHRcdFx0XHRcdHx8KG4gPCBtaW4pXHJcblx0XHRcdFx0XHR8fCAobi50b0ZpeGVkKHByZWNpcykgIT0gbiAmJiBuICE9PSAwKSApe1xyXG5cclxuXHRcdFx0XHRcdHJldHVybiB0aGlzLmRvYygpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdCAgfTtcclxuXHRcdH07XHJcblxyXG5cdFx0dmFyIGRvY051bSA9IGZ1bmN0aW9uKG1heCwgbWluLCBwcmVjaXMpe1xyXG5cdFx0XHRyZXR1cm4gRG9jLmdlbkRvYy5iaW5kKG51bGwsIFwibnVtXCIsIHtcIm1heFwiOiBtYXgsIFwibWluXCI6IG1pbiwgXCJwcmVjaXNcIjogcHJlY2lzfSk7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIG1heF9kZWZfbiA9IERvYy5nZXRDb25zdCgnbnVtJywgJ21heCcpO1xyXG5cdFx0dmFyIG1pbl9kZWZfbiA9IERvYy5nZXRDb25zdCgnbnVtJywgJ21pbicpO1xyXG5cdFx0dmFyIHByZWNpc19kZWYgPSBEb2MuZ2V0Q29uc3QoJ251bScsICdwcmVjaXMnKTtcclxuXHJcblx0XHR0aGlzLm51bSA9IG5ldyBDcmVhdGVDcmVhdG9yKFxyXG5cdFx0XHRmdW5jdGlvbihtYXgsIG1pbiwgcHJlY2lzKXtcclxuXHRcdFx0XHRpZihtYXggPT09IG51bGwpIG1heCA9IG1heF9kZWZfbjtcclxuXHRcdFx0XHRpZihtaW4gPT09IHVuZGVmaW5lZHx8bWluID09PSBudWxsKSBtaW4gPSBtaW5fZGVmX247XHJcblx0XHRcdFx0aWYocHJlY2lzID09PSB1bmRlZmluZWQpIHByZWNpcyA9IHByZWNpc19kZWY7XHJcblxyXG5cdFx0XHRcdGlmKCh0eXBlb2YgbWluICE9PSAnbnVtYmVyJyB8fCAhaXNGaW5pdGUobWluKSlcclxuXHRcdFx0XHRcdHx8KHR5cGVvZiBtYXggIT09ICdudW1iZXInIHx8ICFpc0Zpbml0ZShtYXgpKVxyXG5cdFx0XHRcdFx0fHwodHlwZW9mIHByZWNpcyAhPT0gJ251bWJlcicgfHwgIWlzRmluaXRlKHByZWNpcykpXHJcblx0XHRcdFx0XHR8fChwcmVjaXMgPCAwKVxyXG5cdFx0XHRcdFx0fHwocHJlY2lzID4gOSlcclxuXHRcdFx0XHRcdHx8KHByZWNpcyAlIDEgIT09IDApKXtcclxuXHRcdFx0XHRcdHRocm93IGFyZ1R5cGVFcnJvcihhcmd1bWVudHMsICdXYWl0IGFyZ3VtZW50czogbWluKG51bWJlciksIG1heChudW1iZXIpLCBwcmVjaXMoMDw9bnVtYmVyPDkpJyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmKG1pbiA+IG1heCl7XHJcblx0XHRcdFx0XHR2YXIgdCA9IG1pbjtcclxuXHRcdFx0XHRcdG1pbiA9IG1heDtcclxuXHRcdFx0XHRcdG1heCA9IHQ7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdFx0dGVzdDogdGVzdE51bShtYXgsIG1pbiwgcHJlY2lzKSxcclxuXHRcdFx0XHRcdHJhbmQ6IHJhbmROdW0obWF4LCBtaW4sIHByZWNpcyksXHJcblx0XHRcdFx0XHRkb2M6IGRvY051bShtYXgsIG1pbiwgcHJlY2lzKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSxcclxuXHRcdFx0dGVzdE51bShtYXhfZGVmX24sIG1pbl9kZWZfbiwgcHJlY2lzX2RlZiksXHJcblx0XHRcdHJhbmROdW0obWF4X2RlZl9uLCBtaW5fZGVmX24sIHByZWNpc19kZWYpLFxyXG5cdFx0XHRkb2NOdW0obWF4X2RlZl9uLCBtaW5fZGVmX24sIHByZWNpc19kZWYpXHJcblx0XHQpO1xyXG5cclxuXHRcdHZhciByYW5kSW50ID0gZnVuY3Rpb24obWF4LCBtaW4sIHByZWNpcyl7XHJcblx0XHRcdHJldHVybiBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdHJldHVybiBNYXRoLmZsb29yKCAoKG1heCAtIChtaW4gKyAwLjEpKS9wcmVjaXMpKk1hdGgucmFuZG9tKCkgKSAqIHByZWNpcyArICBtaW47XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblxyXG5cdFx0IHZhciB0ZXN0SW50ID0gZnVuY3Rpb24obWF4LCBtaW4sIHByZWNpcyl7XHJcblx0XHRcdHJldHVybiBmdW5jdGlvbihuKXtcclxuXHRcdFx0XHRpZih0eXBlb2YgbiAhPT0gJ251bWJlcicgfHwgIWlzRmluaXRlKG4pKXtcclxuXHRcdFx0XHRcdHJldHVybiB0aGlzLmRvYygpO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aWYoKG4gPj0gbWF4KVxyXG5cdFx0XHRcdFx0fHwobiA8IG1pbilcclxuXHRcdFx0XHRcdHx8KCgobiAtIG1pbikgJSBwcmVjaXMpICE9PSAwKSApe1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuZG9jKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0ICB9O1xyXG5cdFx0fTtcclxuXHJcblx0XHR2YXIgZG9jSW50ID0gZnVuY3Rpb24obWF4LCBtaW4sIHN0ZXApe1xyXG5cclxuXHRcdFx0XHRyZXR1cm4gRG9jLmdlbkRvYy5iaW5kKG51bGwsIFwiaW50XCIsIHtcIm1heFwiOiBtYXgsIFwibWluXCI6IG1pbiwgXCJzdGVwXCI6IHN0ZXB9KTtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIG1heF9kZWYgPSBEb2MuZ2V0Q29uc3QoJ2ludCcsICdtYXgnKTtcclxuXHRcdHZhciBtaW5fZGVmID0gRG9jLmdldENvbnN0KCdpbnQnLCAnbWluJyk7XHJcblx0XHR2YXIgc3RlcF9kZWYgPSBEb2MuZ2V0Q29uc3QoJ2ludCcsICdzdGVwJyk7XHJcblxyXG5cdFx0dGhpcy5pbnQgPSBuZXcgQ3JlYXRlQ3JlYXRvcihcclxuXHRcdFx0ZnVuY3Rpb24obWF4LCBtaW4sIHN0ZXApe1xyXG5cclxuXHRcdFx0XHRpZihtYXggPT09IG51bGwpIG1heCA9IG1heF9kZWY7XHJcblx0XHRcdFx0aWYobWluID09PSB1bmRlZmluZWR8fG1pbiA9PT0gbnVsbCkgbWluID0gbWluX2RlZjtcclxuXHRcdFx0XHRpZihzdGVwID09PSB1bmRlZmluZWQpIHN0ZXAgPSBzdGVwX2RlZjtcclxuXHJcblx0XHRcdFx0aWYoKHR5cGVvZiBtaW4gIT09ICdudW1iZXInIHx8ICFpc0Zpbml0ZShtaW4pKVxyXG5cdFx0XHRcdFx0fHwodHlwZW9mIG1heCAhPT0gJ251bWJlcicgfHwgIWlzRmluaXRlKG1heCkpXHJcblx0XHRcdFx0XHR8fChNYXRoLnJvdW5kKG1pbikgIT09IG1pbilcclxuXHRcdFx0XHRcdHx8KE1hdGgucm91bmQobWF4KSAhPT0gbWF4KVxyXG5cdFx0XHRcdFx0fHwoc3RlcCA8PSAwKVxyXG5cdFx0XHRcdFx0fHwoTWF0aC5yb3VuZChzdGVwKSAhPT0gc3RlcCkpe1xyXG5cdFx0XHRcdFx0dGhyb3cgYXJnVHlwZUVycm9yKGFyZ3VtZW50cywgJ1dhaXQgYXJndW1lbnRzOiBtaW4oaW50KSwgbWF4KGludCksIHN0ZXAoaW50PjApJyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmKG1pbiA+IG1heCl7XHJcblx0XHRcdFx0XHR2YXIgdCA9IG1pbjtcclxuXHRcdFx0XHRcdG1pbiA9IG1heDtcclxuXHRcdFx0XHRcdG1heCA9IHQ7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdFx0dGVzdDogdGVzdEludChtYXgsIG1pbiwgc3RlcCksXHJcblx0XHRcdFx0XHRyYW5kOiByYW5kSW50KG1heCwgbWluLCBzdGVwKSxcclxuXHRcdFx0XHRcdGRvYzogZG9jSW50KG1heCwgbWluLCBzdGVwKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSxcclxuXHRcdFx0dGVzdEludChtYXhfZGVmLCBtaW5fZGVmLCBzdGVwX2RlZiksXHJcblx0XHRcdHJhbmRJbnQobWF4X2RlZiwgbWluX2RlZiwgc3RlcF9kZWYpLFxyXG5cdFx0XHRkb2NJbnQobWF4X2RlZiwgbWluX2RlZiwgc3RlcF9kZWYpXHJcblx0XHQpO1xyXG5cclxuXHRcdHZhciBkb2NQb3MgPSBmdW5jdGlvbihtYXgsIG1pbiwgc3RlcCl7XHJcblxyXG5cdFx0XHRcdHJldHVybiBEb2MuZ2VuRG9jLmJpbmQobnVsbCwgXCJwb3NcIiwge1wibWF4XCI6IG1heH0pO1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHR2YXIgbWF4X2RlZl9wID0gRG9jLmdldENvbnN0KCdwb3MnLCAnbWF4JylcclxuXHRcdHRoaXMucG9zID0gbmV3IENyZWF0ZUNyZWF0b3IoXHJcblx0XHRcdGZ1bmN0aW9uKG1heCl7XHJcblxyXG5cdFx0XHRcdGlmKG1heCA9PT0gbnVsbCkgbWF4ID0gbWF4X2RlZl9wO1xyXG5cclxuXHRcdFx0XHRpZigodHlwZW9mIG1heCAhPT0gJ251bWJlcicgfHwgIWlzRmluaXRlKG1heCkpXHJcblx0XHRcdFx0XHR8fChtYXggPCAwKSl7XHJcblx0XHRcdFx0XHR0aHJvdyBhcmdUeXBlRXJyb3IoYXJndW1lbnRzLCAnV2FpdCBhcmd1bWVudHM6IG1pbihwb3MpLCBtYXgocG9zKSwgc3RlcChwb3M+MCknKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0XHR0ZXN0OiB0ZXN0SW50KG1heCwgMCwgMSksXHJcblx0XHRcdFx0XHRyYW5kOiByYW5kSW50KG1heCwgMCwgMSksXHJcblx0XHRcdFx0XHRkb2M6IGRvY1BvcyhtYXgpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LFxyXG5cdFx0XHR0ZXN0SW50KG1heF9kZWZfcCwgMCwgMSksXHJcblx0XHRcdHJhbmRJbnQobWF4X2RlZl9wLCAwLCAxKSxcclxuXHRcdFx0ZG9jUG9zKG1heF9kZWZfcClcclxuXHRcdCk7XHJcblxyXG5cclxuXHJcblxyXG5cclxuICAvL0NyYWZ0IEFueVxyXG5cdFx0ZnVuY3Rpb24gcmFuZEFueShhcnIpe1xyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRyZXR1cm4gYXJyLnJhbmRfaSgpLnJhbmQoKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIHRlc3RBbnkoYXJyKXtcclxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKHZhbCl7XHJcblx0XHRcdFx0aWYoYXJyLmV2ZXJ5KGZ1bmN0aW9uKGkpe3JldHVybiBpLnRlc3QodmFsKX0pKXtcclxuXHRcdFx0XHRcdHJldHVybiB0aGlzLmRvYygpO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gZG9jQW55KFR5cGVzKXtcclxuXHJcblx0XHRcdHZhciBjb250ID0gVHlwZXMubGVuZ3RoO1xyXG5cdFx0XHR2YXIgdHlwZV9kb2NzID0gW107XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBjb250OyBpKyspe1xyXG5cdFx0XHRcdHR5cGVfZG9jcy5wdXNoKFR5cGVzW2ldLmRvYygpKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIERvYy5nZW5Eb2MuYmluZChudWxsLCBcImFueVwiLCB7dHlwZXM6IHR5cGVfZG9jc30pO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBkZWZfdHlwZXMgPSBEb2MuZ2V0Q29uc3QoJ2FycicsICd0eXBlcycpO1xyXG5cdFx0ZnVuY3Rpb24gbmV3QW55KGFycil7XHJcblx0XHRcdGlmKCFBcnJheS5pc0FycmF5KGFycikgfHwgYXJndW1lbnRzLmxlbmd0aCA+IDEpIGFyciA9IGFyZ3VtZW50cztcclxuXHJcblx0XHRcdHZhciBsZW4gPSBhcnIubGVuZ3RoO1xyXG5cdFx0XHR2YXIgYXJyX3R5cGVzID0gW107XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBsZW47IGkrKyl7XHJcblx0XHRcdFx0YXJyX3R5cGVzW2ldID0gdENvbnN0KGFycltpXSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybntcclxuXHRcdFx0XHR0ZXN0OiB0ZXN0QW55KGFycl90eXBlcyksXHJcblx0XHRcdFx0cmFuZDogcmFuZEFueShhcnJfdHlwZXMpLFxyXG5cdFx0XHRcdGRvYzogZG9jQW55KGFycl90eXBlcylcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuYW55ID0gbmV3IENyZWF0ZUNyZWF0b3IoXHJcblx0XHRcdG5ld0FueSxcclxuXHRcdFx0dGVzdEFueShkZWZfdHlwZXMpLFxyXG5cdFx0XHRyYW5kQW55KGRlZl90eXBlcyksXHJcblx0XHRcdGRvY0FueShkZWZfdHlwZXMpXHJcblx0XHQpO1xyXG5cclxuXHJcblxyXG5cdC8vQ3JhZnQgQXJyYXlcclxuXHJcblxyXG5cclxuXHRcdGZ1bmN0aW9uIHJhbmRBcnJheShUeXBlLCBzaXplLCBpc19maXhlZCl7XHJcblx0XHRcdHZhciByYW5kU2l6ZSA9IGZ1bmN0aW9uICgpe3JldHVybiBzaXplfTtcclxuXHRcdFx0aWYoIWlzX2ZpeGVkKXtcclxuXHRcdFx0XHRyYW5kU2l6ZSA9IFQucG9zKHNpemUpLnJhbmQ7XHJcblx0XHRcdH1cclxuXHJcblxyXG5cdFx0XHRpZihBcnJheS5pc0FycmF5KFR5cGUpKXtcclxuXHRcdFx0XHR2YXIgbm93X3NpemUgPSByYW5kU2l6ZSgpO1xyXG5cclxuXHRcdFx0XHRyZXR1cm4gZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdHZhciBhcnIgPSBbXTtcclxuXHJcblx0XHRcdFx0XHRmb3IodmFyIGkgPSAwLCBqID0gMDsgaSA8IG5vd19zaXplOyBpKyspe1xyXG5cclxuXHRcdFx0XHRcdFx0YXJyLnB1c2goVHlwZVtqXS5yYW5kKCkpO1xyXG5cclxuXHRcdFx0XHRcdFx0aisrO1xyXG5cdFx0XHRcdFx0XHRpZihqID49IFR5cGUubGVuZ3RoKXtcclxuXHRcdFx0XHRcdFx0XHRqID0gMDtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0cmV0dXJuIGFycjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblxyXG5cclxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0dmFyIGFyciA9IFtdO1xyXG5cclxuXHRcdFx0XHR2YXIgbm93X3NpemUgPSByYW5kU2l6ZSgpO1xyXG5cdFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBub3dfc2l6ZTsgaSsrKXtcclxuXHRcdFx0XHRcdGFyci5wdXNoKFR5cGUucmFuZChpLCBhcnIpKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHJldHVybiBhcnI7XHJcblx0XHRcdH1cclxuXHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gdGVzdEFycmF5KFR5cGUsIHNpemUsIGlzX2ZpeGVkKXtcclxuXHJcblx0XHRcdGlmKEFycmF5LmlzQXJyYXkoVHlwZSkpe1xyXG5cdFx0XHRcdHJldHVybiBmdW5jdGlvbihhcnIpe1xyXG5cclxuXHRcdFx0XHRcdGlmKCFBcnJheS5pc0FycmF5KGFycikpe1xyXG5cdFx0XHRcdFx0XHR2YXIgZXJyID0gdGhpcy5kb2MoKTtcclxuXHRcdFx0XHRcdFx0ZXJyLnBhcmFtcyA9IFwiVmFsdWUgaXMgbm90IGFycmF5IVwiO1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gZXJyO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdGlmKChhcnIubGVuZ3RoID4gc2l6ZSkgfHwgKGlzX2ZpeGVkICYmIChhcnIubGVuZ3RoICE9PSBzaXplKSkpe1xyXG5cdFx0XHRcdFx0XHR2YXIgZXJyID0gdGhpcy5kb2MoKTtcclxuXHRcdFx0XHRcdFx0ZXJyLnBhcmFtcyA9IFwiQXJyYXkgbGVuZ2h0IGlzIHdyb25nIVwiO1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gZXJyO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdGZvcih2YXIgaSA9IDAsIGogPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKXtcclxuXHJcblx0XHRcdFx0XHRcdFx0dmFyIHJlcyA9IFR5cGVbal0udGVzdChhcnJbaV0pO1xyXG5cdFx0XHRcdFx0XHRcdGlmKHJlcyl7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHZhciBlcnIgPSB0aGlzLmRvYygpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRlcnIucGFyYW1zID0ge2luZGV4OiBpLCB3cm9uZ19pdGVtOiByZXN9O1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gZXJyO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0aisrO1xyXG5cdFx0XHRcdFx0XHRcdGlmKGogPj0gVHlwZS5sZW5ndGgpe1xyXG5cdFx0XHRcdFx0XHRcdFx0aiA9IDA7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBmdW5jdGlvbihhcnIpe1xyXG5cdFx0XHRcdGlmKCFBcnJheS5pc0FycmF5KGFycikpe1xyXG5cdFx0XHRcdFx0dmFyIGVyciA9IHRoaXMuZG9jKCk7XHJcblx0XHRcdFx0XHRlcnIucGFyYW1zID0gXCJWYWx1ZSBpcyBub3QgYXJyYXkhXCI7XHJcblx0XHRcdFx0XHRyZXR1cm4gZXJyO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aWYoKGFyci5sZW5ndGggPiBzaXplKSB8fCAoaXNfZml4ZWQgJiYgKGFyci5sZW5ndGggIT09IHNpemUpKSl7XHJcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhhcnIubGVuZ3RoLCBzaXplKVxyXG5cdFx0XHRcdFx0dmFyIGVyciA9IHRoaXMuZG9jKCk7XHJcblx0XHRcdFx0XHRlcnIucGFyYW1zID0gXCJBcnJheTogbGVuZ2h0IGlzIHdyb25nIVwiO1xyXG5cdFx0XHRcdFx0cmV0dXJuIGVycjtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHZhciBlcnJfYXJyID0gYXJyLmZpbHRlcihUeXBlLnRlc3QpO1xyXG5cdFx0XHRcdGlmKGVycl9hcnIubGVuZ3RoICE9IDApe1xyXG5cdFx0XHRcdFx0dmFyIGVyciA9IHRoaXMuZG9jKCk7XHJcblx0XHRcdFx0XHRlcnIucGFyYW1zID0gZXJyX2FycjtcclxuXHRcdFx0XHRcdHJldHVybiBlcnI7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBkb2NBcnJheShUeXBlLCBzaXplLCBpc19maXhlZCl7XHJcblx0XHRcdHZhciB0eXBlX2RvY3MgPSBbXTtcclxuXHRcdFx0aWYoQXJyYXkuaXNBcnJheShUeXBlKSl7XHJcblx0XHRcdFx0dmFyIGNvbnQgPSBUeXBlLmxlbmd0aDtcclxuXHRcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgY29udDsgaSsrKXtcclxuXHRcdFx0XHRcdHR5cGVfZG9jcy5wdXNoKFR5cGVbaV0uZG9jKCkpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0dHlwZV9kb2NzID0gVHlwZS5kb2MoKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIERvYy5nZW5Eb2MuYmluZChudWxsLCBcImFyclwiLCB7dHlwZXM6IHR5cGVfZG9jcywgc2l6ZTogc2l6ZSwgZml4ZWQ6IGlzX2ZpeGVkfSk7XHJcblxyXG5cdFx0fVxyXG5cclxuXHJcblx0XHR2YXIgZGVmX1R5cGUgPSBEb2MuZ2V0Q29uc3QoJ2FycicsICd0eXBlcycpO1xyXG5cdFx0dmFyIGRlZl9TaXplID0gRG9jLmdldENvbnN0KCdhcnInLCAnc2l6ZScpO1xyXG5cdFx0dmFyIGRlZl9maXhlZCA9IERvYy5nZXRDb25zdCgnYXJyJywgJ2ZpeGVkJyk7XHJcblxyXG5cdFx0ZnVuY3Rpb24gbmV3QXJyYXkoVHlwZSwgc2l6ZSwgaXNfZml4ZWQpe1xyXG5cdFx0XHRpZihUeXBlID09PSBudWxsKSBUeXBlID0gZGVmX1R5cGU7XHJcblx0XHRcdGlmKGlzX2ZpeGVkID09PSB1bmRlZmluZWQpIGlzX2ZpeGVkID0gZGVmX2ZpeGVkO1xyXG5cclxuXHRcdFx0aWYoQXJyYXkuaXNBcnJheShUeXBlKSl7XHJcblx0XHRcdFx0aWYoc2l6ZSA9PT0gdW5kZWZpbmVkfHxzaXplID09PSBudWxsKSBzaXplID0gVHlwZS5sZW5ndGg7XHJcblxyXG5cdFx0XHRcdFR5cGUgPSBUeXBlLm1hcChmdW5jdGlvbihpdGVtKXtyZXR1cm4gdENvbnN0KGl0ZW0pO30pO1xyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRpZihzaXplID09PSB1bmRlZmluZWR8fHNpemUgPT09IG51bGwpIHNpemUgPSAxO1xyXG5cdFx0XHRcdFR5cGUgPSB0Q29uc3QoVHlwZSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmKFQucG9zLnRlc3Qoc2l6ZSkpe1xyXG5cdFx0XHRcdFx0dGhyb3cgYXJnVHlwZUVycm9yKGFyZ3VtZW50cywgJ1dhaXQgYXJndW1lbnRzOiAnICsgSlNPTi5zdHJpbmdpZnkoVC5wb3MudGVzdChzaXplKSkpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdHRlc3Q6IHRlc3RBcnJheShUeXBlLCBzaXplLCBpc19maXhlZCksXHJcblx0XHRcdFx0cmFuZDogcmFuZEFycmF5KFR5cGUsIHNpemUsIGlzX2ZpeGVkKSxcclxuXHRcdFx0XHRkb2M6IGRvY0FycmF5KFR5cGUsIHNpemUsIGlzX2ZpeGVkKVxyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuYXJyID0gbmV3IENyZWF0ZUNyZWF0b3IoXHJcblx0XHRcdG5ld0FycmF5LFxyXG5cdFx0XHR0ZXN0QXJyYXkoZGVmX1R5cGUsIGRlZl9TaXplLCBkZWZfZml4ZWQpLFxyXG5cdFx0XHRyYW5kQXJyYXkoZGVmX1R5cGUsIGRlZl9TaXplLCBkZWZfZml4ZWQpLFxyXG5cdFx0XHRkb2NBcnJheShkZWZfVHlwZSwgZGVmX1NpemUsIGRlZl9maXhlZClcclxuXHRcdCk7XHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5cdC8vQ3JhZnQgT2JqZWN0XHJcblxyXG5cdFx0ZnVuY3Rpb24gcmFuZE9iaihmdW5jT2JqKXtcclxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0dmFyIG9iaiA9IHt9O1xyXG5cdFx0XHRcdGZvcih2YXIga2V5IGluIGZ1bmNPYmope1xyXG5cdFx0XHRcdFx0b2JqW2tleV0gPSBmdW5jT2JqW2tleV0ucmFuZCgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRyZXR1cm4gb2JqO1xyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIHRlc3RPYmooZnVuY09iail7XHJcblx0XHRcdHJldHVybiBmdW5jdGlvbihvYmope1xyXG5cclxuXHRcdFx0XHRpZih0eXBlb2Ygb2JqICE9PSBcIm9iamVjdFwiICYmIG9iaiA9PT0gbnVsbCl7XHJcblx0XHRcdFx0XHR2YXIgZXJyID0gdGhpcy5kb2MoKTtcclxuXHRcdFx0XHRcdGVyci5wYXJhbXMgPSBcIlZhbHVlIGlzIG5vdCBvYmplY3QhXCI7XHJcblx0XHRcdFx0XHRyZXR1cm4gZXJyO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0Zm9yKHZhciBrZXkgaW4gZnVuY09iail7XHJcblx0XHRcdFx0XHR2YXIgcmVzID0gZnVuY09ialtrZXldLnRlc3Qob2JqW2tleV0pO1xyXG5cdFx0XHRcdFx0aWYocmVzKXtcclxuXHRcdFx0XHRcdFx0dmFyIGVyciA9IHRoaXMuZG9jKCk7XHJcblx0XHRcdFx0XHRcdGVyci5wYXJhbXMgPSB7fTtcclxuXHRcdFx0XHRcdFx0ZXJyLnBhcmFtc1trZXldID0gcmVzO1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gZXJyO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGRvY09iKGZ1bmNPYmope1xyXG5cdFx0XHR2YXIgZG9jX29iaiA9IHt9O1xyXG5cclxuXHRcdFx0Zm9yKHZhciBrZXkgaW4gZnVuY09iail7XHJcblx0XHRcdFx0XHRkb2Nfb2JqW2tleV0gPSBmdW5jT2JqW2tleV0uZG9jKCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBEb2MuZ2VuRG9jLmJpbmQobnVsbCwgXCJvYmpcIiwge3R5cGVzOiBkb2Nfb2JqfSk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gTmV3T2JqKHRlbXBPYmope1xyXG5cdFx0XHRpZih0eXBlb2YgdGVtcE9iaiAhPT0gJ29iamVjdCcpIHRocm93IGFyZ1R5cGVFcnJvcihhcmd1bWVudHMsICdXYWl0IGFyZ3VtZW50czogdGVtcE9iaihPYmplY3QpJyk7XHJcblxyXG5cdFx0XHR2YXIgYmVnT2JqID0ge307XHJcblx0XHRcdHZhciBmdW5jT2JqID0ge307XHJcblx0XHRcdGZvcih2YXIga2V5IGluIHRlbXBPYmope1xyXG5cdFx0XHRcdGZ1bmNPYmpba2V5XSA9IHRDb25zdCh0ZW1wT2JqW2tleV0pO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm57XHJcblx0XHRcdFx0dGVzdDogdGVzdE9iaihmdW5jT2JqKSxcclxuXHRcdFx0XHRyYW5kOiByYW5kT2JqKGZ1bmNPYmopLFxyXG5cdFx0XHRcdGRvYzogZG9jT2IoZnVuY09iailcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0dGhpcy5vYmogPSBuZXcgQ3JlYXRlQ3JlYXRvcihOZXdPYmosXHJcblx0XHRcdGZ1bmN0aW9uKG9iail7cmV0dXJuIHR5cGVvZiBvYmogPT09IFwib2JqZWN0XCJ9LFxyXG5cdFx0XHRyYW5kT2JqKHt9KSxcclxuXHRcdFx0RG9jLmdlbkRvYy5iaW5kKG51bGwsIFwib2JqXCIpXHJcblx0XHQpO1xyXG5cclxuXHJcblxyXG5cclxuXHJcbi8vQ3JhZnQgVHlwZSBvdXQgdG8gIERvY3VtZW50XHJcblxyXG5cdFQubmFtZXMgPSB7fTtcclxuXHRmb3IodmFyIGtleSBpbiBEb2MudHlwZXMpe1xyXG5cdFx0VC5uYW1lc1tEb2MudHlwZXNba2V5XS5uYW1lXSA9IGtleTtcclxuXHR9XHJcblxyXG5cdHRoaXMub3V0RG9jID0gZnVuY3Rpb24odG1wKXtcclxuXHRcdGlmKCh0eXBlb2YgdG1wID09PSBcImZ1bmN0aW9uXCIpICYmIHRtcC5pc19jcmVhdG9yKSByZXR1cm4gdG1wO1xyXG5cclxuXHRcdGlmKCEoJ25hbWUnIGluIHRtcCkpe1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoKTtcclxuXHRcdH1cclxuXHRcdHZhciB0eXBlID0gdG1wLm5hbWU7XHJcblxyXG5cdFx0aWYoJ3BhcmFtcycgaW4gdG1wKXtcclxuXHRcdFx0dmFyIHBhcmFtcyA9IHRtcC5wYXJhbXM7XHJcblx0XHRcdHN3aXRjaChULm5hbWVzW3R5cGVdKXtcclxuXHRcdFx0XHRjYXNlICdvYmonOiB7XHJcblx0XHRcdFx0XHR2YXIgbmV3X29iaiA9IHt9O1xyXG5cdFx0XHRcdFx0Zm9yKHZhciBrZXkgaW4gcGFyYW1zLnR5cGVzKXtcclxuXHRcdFx0XHRcdFx0bmV3X29ialtrZXldID0gVC5vdXREb2MocGFyYW1zLnR5cGVzW2tleV0pO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0cGFyYW1zLnR5cGVzID0gbmV3X29iajtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRjYXNlICdhbnknOlxyXG5cdFx0XHRcdGNhc2UgJ2Fycic6IHtcclxuXHRcdFx0XHRcdGlmKEFycmF5LmlzQXJyYXkocGFyYW1zLnR5cGVzKSl7XHJcblx0XHRcdFx0XHRcdHBhcmFtcy50eXBlcyA9IHBhcmFtcy50eXBlcy5tYXAoVC5vdXREb2MuYmluZChUKSk7XHJcblx0XHRcdFx0XHR9ZWxzZSBwYXJhbXMudHlwZXMgPSBULm91dERvYyhwYXJhbXMudHlwZXMpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gZ2V0U2ltcGxlVHlwZShULm5hbWVzW3R5cGVdLCBwYXJhbXMpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGdldFNpbXBsZVR5cGUoVC5uYW1lc1t0eXBlXSwge30pO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZ2V0U2ltcGxlVHlwZShuYW1lLCBwYXJhbXMpe1xyXG5cdFx0dmFyIGFyZyA9IFtdO1xyXG5cdFx0RG9jLnR5cGVzW25hbWVdLmFyZy5mb3JFYWNoKGZ1bmN0aW9uKGtleSwgaSl7YXJnW2ldID0gcGFyYW1zW2tleV07fSk7XHJcblx0XHRyZXR1cm4gVFtuYW1lXS5hcHBseShULCBhcmcpO1xyXG5cdH07XHJcblxyXG4vL1N1cHBvcnQgRGVjbGFyYXRlIEZ1bmN0aW9uXHJcblxyXG5cdGZ1bmN0aW9uIGZpbmRlUGFyc2Uoc3RyLCBiZWcsIGVuZCl7XHJcblx0XHR2YXIgcG9pbnRfYmVnID0gc3RyLmluZGV4T2YoYmVnKTtcclxuXHRcdGlmKH5wb2ludF9iZWcpe1xyXG5cclxuXHRcdFx0dmFyIHBvaW50X2VuZCA9IHBvaW50X2JlZztcclxuXHRcdFx0dmFyIHBvaW50X3RlbXAgPSBwb2ludF9iZWc7XHJcblx0XHRcdHZhciBsZXZlbCA9IDE7XHJcblx0XHRcdHZhciBicmVha1doaWxlID0gZmFsc2U7XHJcblx0XHRcdHdoaWxlKCFicmVha1doaWxlKXtcclxuXHRcdFx0XHRicmVha1doaWxlID0gdHJ1ZTtcclxuXHJcblx0XHRcdFx0aWYofnBvaW50X3RlbXApIHBvaW50X3RlbXAgPSBzdHIuaW5kZXhPZihiZWcsIHBvaW50X3RlbXAgKyAxKTtcclxuXHRcdFx0XHRpZih+cG9pbnRfZW5kKSBwb2ludF9lbmQgPSBzdHIuaW5kZXhPZihlbmQsIHBvaW50X2VuZCArIDEpO1xyXG5cclxuXHRcdFx0XHRpZihwb2ludF90ZW1wIDwgcG9pbnRfZW5kKXtcclxuXHJcblx0XHRcdFx0XHRpZihwb2ludF90ZW1wID4gMCl7XHJcblx0XHRcdFx0XHRcdGJyZWFrV2hpbGUgPSBmYWxzZTtcclxuXHRcdFx0XHRcdFx0aWYoc3RyW3BvaW50X3RlbXAgLSAxXSAhPT0gJ1xcXFwnKSBsZXZlbCA9IGxldmVsKzE7XHJcblxyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHJcblx0XHRcdFx0XHRpZihwb2ludF9lbmQgPiAwKXtcclxuXHRcdFx0XHRcdFx0YnJlYWtXaGlsZSA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0XHRpZihzdHJbcG9pbnRfZW5kIC0gMV0gIT09ICdcXFxcJykgbGV2ZWwgPSBsZXZlbC0xO1xyXG5cdFx0XHRcdFx0XHRpZihsZXZlbCA9PSAwKXtcclxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gW3BvaW50X2JlZywgcG9pbnRfZW5kXTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0aWYocG9pbnRfZW5kID4gMCl7XHJcblx0XHRcdFx0XHRcdGJyZWFrV2hpbGUgPSBmYWxzZTtcclxuXHRcdFx0XHRcdFx0aWYoc3RyW3BvaW50X2VuZCAtIDFdICE9PSAnXFxcXCcpIGxldmVsID0gbGV2ZWwtMTtcclxuXHRcdFx0XHRcdFx0aWYobGV2ZWwgPT0gMCl7XHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuIFtwb2ludF9iZWcsIHBvaW50X2VuZF07XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRpZihwb2ludF90ZW1wID4gMCl7XHJcblx0XHRcdFx0XHRcdGJyZWFrV2hpbGUgPSBmYWxzZTtcclxuXHRcdFx0XHRcdFx0aWYoc3RyW3BvaW50X3RlbXAgLSAxXSAhPT0gJ1xcXFwnKSBsZXZlbCA9IGxldmVsKzE7XHJcblxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHJcblx0T2JqZWN0LnR5cGVzID0gVDtcclxufSkoKTtcclxuIiwibW9kdWxlLmV4cG9ydHM9e1xuIFwidGlsZXNcIjogW1xuICB7XG4gICBcInR5cGVcIjogXCJjb2xvclwiLFxuICAgXCJjb2xvclwiOiB7XG4gICAgXCJyXCI6IDEzOCxcbiAgICBcImdcIjogNDIsXG4gICAgXCJiXCI6IDQyLFxuICAgIFwiYVwiOiAxXG4gICB9LFxuICAgXCJpZFwiOiAwXG4gIH0sXG4gIHtcbiAgIFwidHlwZVwiOiBcInN2Z1wiLFxuICAgXCJpbWdcIjogXCJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LFBEOTRiV3dnZG1WeWMybHZiajBpTVM0d0lpQmxibU52WkdsdVp6MGlWVlJHTFRnaUlITjBZVzVrWVd4dmJtVTlJbTV2SWo4K0Nqd2hMUzBnUTNKbFlYUmxaQ0IzYVhSb0lFbHVhM05qWVhCbElDaG9kSFJ3T2k4dmQzZDNMbWx1YTNOallYQmxMbTl5Wnk4cElDMHRQZ29LUEhOMlp3b2dJQ0I0Yld4dWN6cGtZejBpYUhSMGNEb3ZMM0IxY213dWIzSm5MMlJqTDJWc1pXMWxiblJ6THpFdU1TOGlDaUFnSUhodGJHNXpPbU5qUFNKb2RIUndPaTh2WTNKbFlYUnBkbVZqYjIxdGIyNXpMbTl5Wnk5dWN5TWlDaUFnSUhodGJHNXpPbkprWmowaWFIUjBjRG92TDNkM2R5NTNNeTV2Y21jdk1UazVPUzh3TWk4eU1pMXlaR1l0YzNsdWRHRjRMVzV6SXlJS0lDQWdlRzFzYm5NNmMzWm5QU0pvZEhSd09pOHZkM2QzTG5jekxtOXlaeTh5TURBd0wzTjJaeUlLSUNBZ2VHMXNibk05SW1oMGRIQTZMeTkzZDNjdWR6TXViM0puTHpJd01EQXZjM1puSWdvZ0lDQjRiV3h1Y3pwemIyUnBjRzlrYVQwaWFIUjBjRG92TDNOdlpHbHdiMlJwTG5OdmRYSmpaV1p2Y21kbExtNWxkQzlFVkVRdmMyOWthWEJ2WkdrdE1DNWtkR1FpQ2lBZ0lIaHRiRzV6T21sdWEzTmpZWEJsUFNKb2RIUndPaTh2ZDNkM0xtbHVhM05qWVhCbExtOXlaeTl1WVcxbGMzQmhZMlZ6TDJsdWEzTmpZWEJsSWdvZ0lDQjNhV1IwYUQwaU1UQXlORzF0SWdvZ0lDQm9aV2xuYUhROUlqVXhNbTF0SWdvZ0lDQjJhV1YzUW05NFBTSXdJREFnTVRBeU5DQTFNVElpQ2lBZ0lIWmxjbk5wYjI0OUlqRXVNU0lLSUNBZ2FXUTlJbk4yWnpneU1qWWlDaUFnSUdsdWEzTmpZWEJsT25abGNuTnBiMjQ5SWpBdU9USXVNaUFvTldNelpUZ3daQ3dnTWpBeE55MHdPQzB3TmlraUNpQWdJSE52Wkdsd2IyUnBPbVJ2WTI1aGJXVTlJbVJ5WVhkcGJtY3VjM1puSWo0S0lDQThaR1ZtY3dvZ0lDQWdJR2xrUFNKa1pXWnpPREl5TUNJZ0x6NEtJQ0E4YzI5a2FYQnZaR2s2Ym1GdFpXUjJhV1YzQ2lBZ0lDQWdhV1E5SW1KaGMyVWlDaUFnSUNBZ2NHRm5aV052Ykc5eVBTSWpabVptWm1abUlnb2dJQ0FnSUdKdmNtUmxjbU52Ykc5eVBTSWpOalkyTmpZMklnb2dJQ0FnSUdKdmNtUmxjbTl3WVdOcGRIazlJakV1TUNJS0lDQWdJQ0JwYm10elkyRndaVHB3WVdkbGIzQmhZMmwwZVQwaU1DNHdJZ29nSUNBZ0lHbHVhM05qWVhCbE9uQmhaMlZ6YUdGa2IzYzlJaklpQ2lBZ0lDQWdhVzVyYzJOaGNHVTZlbTl2YlQwaU1DNHdPRGd6T0Rnek5EZ2lDaUFnSUNBZ2FXNXJjMk5oY0dVNlkzZzlJaTAwTWpndU1UVTJNVElpQ2lBZ0lDQWdhVzVyYzJOaGNHVTZZM2s5SWpJeE1TNDRORGswTXlJS0lDQWdJQ0JwYm10elkyRndaVHBrYjJOMWJXVnVkQzExYm1sMGN6MGliVzBpQ2lBZ0lDQWdhVzVyYzJOaGNHVTZZM1Z5Y21WdWRDMXNZWGxsY2owaWJHRjVaWEl4SWdvZ0lDQWdJSE5vYjNkbmNtbGtQU0ptWVd4elpTSUtJQ0FnSUNCcGJtdHpZMkZ3WlRwM2FXNWtiM2N0ZDJsa2RHZzlJakV6TmpZaUNpQWdJQ0FnYVc1cmMyTmhjR1U2ZDJsdVpHOTNMV2hsYVdkb2REMGlOekExSWdvZ0lDQWdJR2x1YTNOallYQmxPbmRwYm1SdmR5MTRQU0l0T0NJS0lDQWdJQ0JwYm10elkyRndaVHAzYVc1a2IzY3RlVDBpTFRnaUNpQWdJQ0FnYVc1cmMyTmhjR1U2ZDJsdVpHOTNMVzFoZUdsdGFYcGxaRDBpTVNJZ0x6NEtJQ0E4YldWMFlXUmhkR0VLSUNBZ0lDQnBaRDBpYldWMFlXUmhkR0U0TWpJeklqNEtJQ0FnSUR4eVpHWTZVa1JHUGdvZ0lDQWdJQ0E4WTJNNlYyOXlhd29nSUNBZ0lDQWdJQ0J5WkdZNllXSnZkWFE5SWlJK0NpQWdJQ0FnSUNBZ1BHUmpPbVp2Y20xaGRENXBiV0ZuWlM5emRtY3JlRzFzUEM5a1l6cG1iM0p0WVhRK0NpQWdJQ0FnSUNBZ1BHUmpPblI1Y0dVS0lDQWdJQ0FnSUNBZ0lDQnlaR1k2Y21WemIzVnlZMlU5SW1oMGRIQTZMeTl3ZFhKc0xtOXlaeTlrWXk5a1kyMXBkSGx3WlM5VGRHbHNiRWx0WVdkbElpQXZQZ29nSUNBZ0lDQWdJRHhrWXpwMGFYUnNaU0F2UGdvZ0lDQWdJQ0E4TDJOak9sZHZjbXMrQ2lBZ0lDQThMM0prWmpwU1JFWStDaUFnUEM5dFpYUmhaR0YwWVQ0S0lDQThad29nSUNBZ0lHbHVhM05qWVhCbE9teGhZbVZzUFNKTVlYbGxjaUF4SWdvZ0lDQWdJR2x1YTNOallYQmxPbWR5YjNWd2JXOWtaVDBpYkdGNVpYSWlDaUFnSUNBZ2FXUTlJbXhoZVdWeU1TSUtJQ0FnSUNCMGNtRnVjMlp2Y20wOUluUnlZVzV6YkdGMFpTZ3dMREl4TlNraVBnb2dJQ0FnUEdjS0lDQWdJQ0FnSUdsa1BTSm5PVFE0TVNJS0lDQWdJQ0FnSUhSeVlXNXpabTl5YlQwaWJXRjBjbWw0S0RFdU1EUXpPRGsyTXl3d0xEQXNNUzR3T0RjeU16azBMQzB4T0M0d01ETXlPRE1zTXk0NE5qUXhOakExS1NJK0NpQWdJQ0FnSUR4bkNpQWdJQ0FnSUNBZ0lHbGtQU0pNWVhsbGNqRXdOalFpQ2lBZ0lDQWdJQ0FnSUhSeVlXNXpabTl5YlQwaWJXRjBjbWw0S0RBdU5EVXlOakV6TnpJc01Dd3dMREF1TkRVek9USTROQ3d5T0RZM0xqTXdOVGNzTXpnMk5TNHhNREk1S1NJK0NpQWdJQ0FnSUNBZ1BIQmhkR2dLSUNBZ0lDQWdJQ0FnSUNCcGJtdHpZMkZ3WlRwamIyNXVaV04wYjNJdFkzVnlkbUYwZFhKbFBTSXdJZ29nSUNBZ0lDQWdJQ0FnSUdsa1BTSndZWFJvTnpVNU9DSUtJQ0FnSUNBZ0lDQWdJQ0J6ZEhsc1pUMGlabWxzYkRvak5USTFNalV5TzJacGJHd3RjblZzWlRwbGRtVnViMlJrSWdvZ0lDQWdJQ0FnSUNBZ0lHUTlJbTBnTFRVeE9UZ3VPVGd6TkN3dE9EazVNQzR6TVRZNUlIWWdNVEV6TXk0NE5UZ3pJR2dnTFRFeE16TXVPRFU0TWlCMklDMHhNVE16TGpnMU9ETWdlaUlnTHo0S0lDQWdJQ0FnSUNBOGNHRjBhQW9nSUNBZ0lDQWdJQ0FnSUdsdWEzTmpZWEJsT21OdmJtNWxZM1J2Y2kxamRYSjJZWFIxY21VOUlqQWlDaUFnSUNBZ0lDQWdJQ0FnYVdROUluQmhkR2czTmpBd0lnb2dJQ0FnSUNBZ0lDQWdJSE4wZVd4bFBTSm1hV3hzT2lOa01tUXhaREk3Wm1sc2JDMXlkV3hsT21WMlpXNXZaR1FpQ2lBZ0lDQWdJQ0FnSUNBZ1pEMGliU0F0TlRNNU5pNDFOelU1TEMwM09EVTJMalExT0RZZ2RpQXRNVEV6TXk0NE5UZ3pJR2dnTVRrM0xqVTVNalVnZGlBeE1UTXpMamcxT0RNZ2VpSWdMejRLSUNBZ0lDQWdJQ0E4Y0dGMGFBb2dJQ0FnSUNBZ0lDQWdJR2x1YTNOallYQmxPbU52Ym01bFkzUnZjaTFqZFhKMllYUjFjbVU5SWpBaUNpQWdJQ0FnSUNBZ0lDQWdhV1E5SW5CaGRHZzNOakF5SWdvZ0lDQWdJQ0FnSUNBZ0lITjBlV3hsUFNKbWFXeHNPaU0xTWpVeU5USTdabWxzYkMxeWRXeGxPbVYyWlc1dlpHUWlDaUFnSUNBZ0lDQWdJQ0FnWkQwaWJTQXROVFEwTnk0Mk1UQTJMQzA0TlRrMExqTTNPRFlnYUNBeU5EZ3VOakkzTWlCMklETTVOaTQ0TlRBNUlHZ2dMVEkwT0M0Mk1qY3lJSG9pSUM4K0NpQWdJQ0FnSUR3dlp6NEtJQ0FnSUNBZ1BHY0tJQ0FnSUNBZ0lDQWdhV1E5SWt4aGVXVnlNVEEyTlNJS0lDQWdJQ0FnSUNBZ2RISmhibk5tYjNKdFBTSnRZWFJ5YVhnb01DNDBORGsxTWpJNU1pd3dMREFzTUM0ME5UTTVNamcwTERJNE5URXVNek00TWl3ek9EWTFMakV3TWprcElqNEtJQ0FnSUNBZ0lDQThjR0YwYUFvZ0lDQWdJQ0FnSUNBZ0lHbHVhM05qWVhCbE9tTnZibTVsWTNSdmNpMWpkWEoyWVhSMWNtVTlJakFpQ2lBZ0lDQWdJQ0FnSUNBZ2FXUTlJbkJoZEdnM05qQTFJZ29nSUNBZ0lDQWdJQ0FnSUhOMGVXeGxQU0ptYVd4c09pTTFNalV5TlRJN1ptbHNiQzF5ZFd4bE9tVjJaVzV2WkdRaUNpQWdJQ0FnSUNBZ0lDQWdaRDBpYlNBdE5URTVPUzR5TURrekxDMDRPVGt3TGpNeE5qa2dkaUF4TVRNekxqZzFPRE1nYUNBeE1UTXpMamcxT0RNZ2RpQXRNVEV6TXk0NE5UZ3pJSG9pSUM4K0NpQWdJQ0FnSUNBZ1BIQmhkR2dLSUNBZ0lDQWdJQ0FnSUNCcGJtdHpZMkZ3WlRwamIyNXVaV04wYjNJdFkzVnlkbUYwZFhKbFBTSXdJZ29nSUNBZ0lDQWdJQ0FnSUdsa1BTSndZWFJvTnpZd055SUtJQ0FnSUNBZ0lDQWdJQ0J6ZEhsc1pUMGlabWxzYkRvalpESmtNV1F5TzJacGJHd3RjblZzWlRwbGRtVnViMlJrSWdvZ0lDQWdJQ0FnSUNBZ0lHUTlJbTBnTFRVd01ERXVOakUyTnl3dE56ZzFOaTQwTlRnMklIWWdMVEV4TXpNdU9EVTRNeUJvSUMweE9UY3VOVGt5TmlCMklERXhNek11T0RVNE15QjZJaUF2UGdvZ0lDQWdJQ0FnSUR4d1lYUm9DaUFnSUNBZ0lDQWdJQ0FnYVc1cmMyTmhjR1U2WTI5dWJtVmpkRzl5TFdOMWNuWmhkSFZ5WlQwaU1DSUtJQ0FnSUNBZ0lDQWdJQ0JwWkQwaWNHRjBhRGMyTURraUNpQWdJQ0FnSUNBZ0lDQWdjM1I1YkdVOUltWnBiR3c2SXpVeU5USTFNanRtYVd4c0xYSjFiR1U2WlhabGJtOWtaQ0lLSUNBZ0lDQWdJQ0FnSUNCa1BTSnRJQzAwT1RVd0xqVTRNakVzTFRnMU9UUXVNemM0TmlCb0lDMHlORGd1TmpJM01pQjJJRE01Tmk0NE5UQTVJR2dnTWpRNExqWXlOeklnZWlJZ0x6NEtJQ0FnSUNBZ1BDOW5QZ29nSUNBZ1BDOW5QZ29nSUR3dlp6NEtQQzl6ZG1jK0NnPT1cIixcbiAgIFwiaWRcIjogMSxcbiAgIFwid2lkdGhcIjogMlxuICB9LFxuICB7XG4gICBcInR5cGVcIjogXCJwaGlzaWNcIixcbiAgIFwiZHVyYWJpbGl0eVwiOiBcIndvb2RcIixcbiAgIFwiaW1nXCI6IFwiZGF0YTppbWFnZS9qcGVnO2Jhc2U2NCwvOWovNEFBUVNrWkpSZ0FCQVFFQVNBQklBQUQvMndCREFBRUJBUUVCQVFFQkFRRUJBUUVDQWdNQ0FnSUNBZ1FEQXdJREJRUUZCUVVFQkFRRkJnY0dCUVVIQmdRRUJna0dCd2dJQ0FnSUJRWUpDZ2tJQ2djSUNBai8yd0JEQVFFQkFRSUNBZ1FDQWdRSUJRUUZDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FqL3dBQVJDQVAvQkFJREFTSUFBaEVCQXhFQi84UUFIQUFCQVFFQkFRRUJBUUVBQUFBQUFBQUFBQWdKQmdjRkF3UUsvOFFBUWhBQkFBQUNBd3NLQlFJRkJBTUJBQUFBQUFNR0Z4aFdBUUlFQlFkbWxhWFMwK01JRVRZM1ZYV0VsTE8wRWhNVVJzTVZwQll4UVdGeElTTXlNeVZFWWxIL3hBQWRBUUVBQWdNQkFRRUJBQUFBQUFBQUFBQUFDQWtHQndvRkJBSUQvOFFBU3hFQUFRSUJCUWdOQ2dRRkJRRUJBQUFBQUFFQ0F3UUZCaGhVQndnUk5sV1NvOUVTRmhjaFUzT0RrWk95czlMVENSTVpNVFZGY25TeHd6ZEJoTFJSVW5HQmxCUVZJaktoWVRQLzJnQU1Bd0VBQWhFREVRQS9BUDhBS2VEOXNId2ZDTU13aUJnbUNRSTJGWVZGdjcySENoUTcyN2ZYOFMvdTNlYTVlM3Q3Yy8xdTNidDI3Y3VYTGx4OHJuSWlZVjNrUHJodzNPY2pXcGhWVDhSMkZIay8yR25EUmtmWktQSi9zTk9HakkreThqYkhOL0Rzem02ekpkbzg5V09MMGI5Ung0N0NqeWY3RFRob3lQc2xIay8yR25EUmtmWk5zYzM4T3pPYnJHMGVlckhGNk4rbzQ4ZGhSNVA5aHB3MFpIMlNqeWY3RFRob3lQc20yT2IrSFpuTjFqYVBQVmppOUcvVWNlT3dvOG4rdzA0YU1qN0pSNVA5aHB3MFpIMlRiSE4vRHN6bTZ4dEhucXh4ZWpmcU9QSFlVZVQvQUdHbkRSa2ZaS1BKL3NOT0dqSSt5Ylk1djRkbWMzV05vODlXT0wwYjlSeDQ3Q2p5ZjdEVGhveVBzbEhrL3dCaHB3MFpIMlRiSE4vRHN6bTZ4dEhucXh4ZWpmcU9QSFlVZVQvWWFjTkdSOWtvOG4rdzA0YU1qN0p0am0vaDJaemRZMmp6MVk0dlJ2MUhIanNLUEovc05PR2pJK3lVZVQvWWFjTkdSOWsyeHpmdzdNNXVzYlI1NnNjWG8zNmpqeDJGSGsvMkduRFJrZlpLUEovc05PR2pJK3liWTV2NGRtYzNXTm84OVdPTDBiOVJ4NDdDanlmN0RUaG95UHNsSGsvMkduRFJrZlpOc2MzOE96T2JyRzBlZXJIRjZOK280OGRoUjVQOWhwdzBaSDJTanlmN0RUaG95UHNtMk9iK0habk4xamFQUFZqaTlHL1VjZU93bzhuK3cwNGFNajdKUjVQOWhwdzBaSDJUYkhOL0Rzem02eHRIbnF4eGVqZnFPUEhZVWVUL0FHR25EUmtmWktQSi9zTk9HakkreWJZNXY0ZG1jM1dObzg5V09MMGI5Ung0N0NqeWY3RFRob3lQc2xIay93QmhwdzBaSDJUYkhOL0Rzem02eHRIbnF4eGVqZnFPUEg3WVJnK0VZSGhFZkJNTGdSc0Z3cUZmMzBPTENpWHQyOXY0ZC9jdTgxMjl2cjI3L3JjdTNMdHk3Y3UzTHI4WHJ0Y2prMlRkOUZNYWlRM05jclhKZ1ZBQS9SK0FPd284bit3MDRhTWo3SlI1UDlocHcwWkgyWGpiWTV2NGRtYzNXWlJ0SG5xeHhlamZxT1BIWVVlVC9ZYWNOR1I5a284bit3MDRhTWo3SnRqbS9oMlp6ZFkyanoxWTR2UnYxSEhqc0tQSi9zTk9HakkreVVlVC9ZYWNOR1I5azJ4emZ3N001dXNiUjU2c2NYbzM2amp4MkZIay93QmhwdzBaSDJTanlmN0RUaG95UHNtMk9iK0habk4xamFQUFZqaTlHL1VjZU93bzhuK3cwNGFNajdKUjVQOEFZYWNOR1I5azJ4emZ3N001dXNiUjU2c2NYbzM2amp4MkZIay8yR25EUmtmWktQSi9zTk9HakkreWJZNXY0ZG1jM1dObzg5V09MMGI5Ung0N0NqeWY3RFRob3lQc2xIay8yR25EUmtmWk5zYzM4T3pPYnJHMGVlckhGNk4rbzQ4ZGhSNVA5aHB3MFpIMlNqeWY3RFRob3lQc20yT2IrSFpuTjFqYVBQVmppOUcvVWNlT3dvOG4rdzA0YU1qN0pSNVA5aHB3MFpIMlRiSE4vRHN6bTZ4dEhucXh4ZWpmcU9QSFlVZVQvWWFjTkdSOWtvOG4rdzA0YU1qN0p0am0vaDJaemRZMmp6MVk0dlJ2MUhIanNLUEovc05PR2pJK3lVZVQvWWFjTkdSOWsyeHpmdzdNNXVzYlI1NnNjWG8zNmpqeDJGSGsvd0JocHcwWkgyU2p5ZjdEVGhveVBzbTJPYitIWm5OMWphUFBWamk5Ry9VY2VPd284bit3MDRhTWo3SlI1UDhBWWFjTkdSOWsyeHpmdzdNNXVzYlI1NnNjWG8zNmpqeDJGSGsvMkduRFJrZlpLUEovc05PR2pJK3liWTV2NGRtYzNXTm84OVdPTDBiOVJ4NCt4amFYc2Y0aCtuL1hNUjQ0eEw4MzR2bGZWNE5md2ZtODNOei9BQS9GY3VjL044VnpuNXY1Yzl4OGQ2Y25sTU9NeElrSnlPYXY1b3VGT2REd1piSVk4bWlyQmxERlk5UFdqa1ZGVER2NzZMdityZkFEK3g4b0hTWUJKczM0MXdTRmgrSzVWbVRHV0FST2Y1Y2ZCOEJpeElkL3pYYnR5N3pYMTdlM2JsM211M0x0ei9OeTYvc284bit3MDRhTWo3THlZay9TRmpsWStNeEZUZVZGY21GRjV6STRGRHAzaXNTTENrc1J6WEpoUlVZNVVWRjlTb3VEZlJUangyRkhrLzJHbkRSa2ZaS1BKL3NOT0dqSSt5L0cyT2IrSFpuTjFuOWRvODlXT0wwYjlSeDQ3Q2p5ZjdEVGhveVBzbEhrL3dCaHB3MFpIMlRiSE4vRHN6bTZ4dEhucXh4ZWpmcU9QSFlVZVQvWWFjTkdSOWtvOG4rdzA0YU1qN0p0am0vaDJaemRZMmp6MVk0dlJ2MUhIanNLUEovc05PR2pJK3lVZVQvWWFjTkdSOWsyeHpmdzdNNXVzYlI1NnNjWG8zNmpqeDJGSGsvMkduRFJrZlpLUEovc05PR2pJK3liWTV2NGRtYzNXTm84OVdPTDBiOVJ4NDdDanlmN0RUaG95UHNsSGsvMkduRFJrZlpOc2MzOE96T2JyRzBlZXJIRjZOK280OGRoUjVQOWhwdzBaSDJTanlmN0RUaG95UHNtMk9iK0habk4xamFQUFZqaTlHL1VjZU93bzhuK3cwNGFNajdKUjVQOWhwdzBaSDJUYkhOL0Rzem02eHRIbnF4eGVqZnFPUEhZVWVUL0FHR25EUmtmWktQSi9zTk9HakkreWJZNXY0ZG1jM1dObzg5V09MMGI5Ung0N0NqeWY3RFRob3lQc2xIay93QmhwdzBaSDJUYkhOL0Rzem02eHRIbnF4eGVqZnFPUEhZVWVUL1lhY05HUjlrbzhuK3cwNGFNajdKdGptL2gyWnpkWTJqejFZNHZSdjFISGpzS1BKL3NOT0dqSSt5VWVUL1lhY05HUjlrMnh6Znc3TTV1c2JSNTZzY1hvMzZqangyRkhrLzJHbkRSa2ZaS1BKL3NOT0dqSSt5Ylk1djRkbWMzV05vODlXT0wwYjlSeDQ2VEQ1Tm0vRldDUmNQeHBLc3lZdHdDSHpmTWo0UmdNV0hEdk9lN2N1WE9lK3ZyMjVjdWM5MjdjdWY1dTNITnZRa2t0Z3gyN09BOUhKNnNLS2lwaC9zZU5PTTFTcVJ2U0ZLNGJvYmxURGdjaXRYQi9IQXFKdmJ5Z0I5SjhBSFlVZVQvQUdHbkRSa2ZaS1BKL3NOT0dqSSt5OGJiSE4vRHN6bTZ6S05vODlXT0wwYjlSeDQ3Q2p5ZjdEVGhveVBzbEhrLzJHbkRSa2ZaTnNjMzhPek9ickcwZWVySEY2TitvNDhkaFI1UDlocHcwWkgyU2p5ZjdEVGhveVBzbTJPYitIWm5OMWphUFBWamk5Ry9VY2VPd284bit3MDRhTWo3SlI1UDlocHcwWkgyVGJITi9Ec3ptNnh0SG5xeHhlamZxT1BIWVVlVC9ZYWNOR1I5a284bit3MDRhTWo3SnRqbS9oMlp6ZFkyanoxWTR2UnYxSEhqc0tQSi9zTk9HakkreVVlVC9ZYWNOR1I5azJ4emZ3N001dXNiUjU2c2NYbzM2amp4MkZIay93QmhwdzBaSDJTanlmN0RUaG95UHNtMk9iK0habk4xamFQUFZqaTlHL1VjZU93bzhuK3cwNGFNajdKUjVQOEFZYWNOR1I5azJ4emZ3N001dXNiUjU2c2NYbzM2amp4MkZIay8yR25EUmtmWktQSi9zTk9HakkreWJZNXY0ZG1jM1dObzg5V09MMGI5Ung0N0NqeWY3RFRob3lQc2xIay8yR25EUmtmWk5zYzM4T3pPYnJHMGVlckhGNk4rbzQ4ZGhSNVA5aHB3MFpIMlNqeWY3RFRob3lQc20yT2IrSFpuTjFqYVBQVmppOUcvVWNlT3dvOG4rdzA0YU1qN0pSNVA5aHB3MFpIMlRiSE4vRHN6bTZ4dEhucXh4ZWpmcU9QSFlVZVQvWWFjTkdSOWtvOG4rdzA0YU1qN0p0am0vaDJaemRZMmp6MVk0dlJ2MUhIanNLUEovc05PR2pJK3lVZVQvWWFjTkdSOWsyeHpmdzdNNXVzYlI1NnNjWG8zNmpqeDlMR21Kc2NZandpOHdUSFdLc1pZbndxK3ZMa1M5aFlWQXZvVi9mWGwyN2R1WEw2NWUzMXk1ZDV1ZTVkdWMvOEFhNithOVNER1pFYWo0YW9yVjlTcHZvWS9LcExGZ1JGaFJtcTE2ZXRGUlVWUDZvdStnQWYxUG5Ec01ublQrUnUrTUM5ZThjZTdESjUwL2tidmpBdlh2SGpVajlueC9nZDFWTW9vUDdha2ZHdyt1aHFnQXFJT2xnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBTXI4b2ZUK2VlK01OOWUvY2U3REtIMC9ubnZqRGZYdjNIcmQ2T2V6NEh3TjZxSE5QVGoyMUxPTmlkZFFBOWt4YzJBQVUzblVBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBRWY4cTc3QzhkK0JINndPVmQ5aGVPL0FqOVpaZS80b3lUbE8xZVVQMzV2NGxUbHlQN2VFQUc1Q0w1cEJrRTZwcFU4VjdtSzlnZVA1Qk9xYVZQRmU1aXZZRlVOMFhHR1g4ZEY2N2pvd3VJWWx6UDhySit5WUFHR20wQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUR4L0wzMVRUWDRYM01KbSswZ3k5OVUwMStGOXpDWnZwOVhxK0wwYmpuZFNHVTMrVU14MGt2eXJPMWpnQkpZZ2ViQUFLYnpxQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUNEK1ZEMC94UjNQQzllTW05U0hLaDZmNG83bmhldkdUZXRGdU9Zc1NMNEUrcW5QdmZQWS96cnhxL1JBQTJXYUhEc01ublQrUnUrTUM5ZThjZTdESjUwL2tidmpBdlh2SGpVajlueC9nZDFWTW9vUDdha2ZHdyt1aHFnQXFJT2xnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBTXI4b2ZUK2VlK01OOWUvY2U3REtIMC9ubnZqRGZYdjNIcmQ2T2V6NEh3TjZxSE5QVGoyMUxPTmlkZFFBOWt4YzJBQVUzblVBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBRWY4QUt1K3d2SGZnUitzRGxYZllYanZ3SS9XV1h2OEFpakpPVTdWNVEvZm0vaVZPWEkvdDRRQWJrSXZta0dRVHFtbFR4WHVZcjJCNC9rRTZwcFU4VjdtSzlnVlEzUmNZWmZ4MFhydU9qQzRoaVhNL3lzbjdKZ0FZYWJRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQVBIOHZmVk5OZmhmY3dtYjdTREwzMVRUWDRYM01KbStuMWVyNHZSdU9kMUlaVGY1UXpIU1MvS3M3V09BRWxpQjVzQUFwdk9vQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUlQNVVQVC9BQlIzUEM5ZU1tOVNIS2g2ZjRvN25oZXZHVGV0RnVPWXNTTDRFK3FuUHZmUFkvenJ4cS9SQUEyV2FIRHNNbm5UK1J1K01DOWU4Y2U3REo1MC9rYnZqQXZYdkhqVWo5bngvZ2QxVk1vb1A3YWtmR3crdWhxZ0FxSU9sZ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU1yOG9mVCtlZStNTjllL2NlN0RLSDAvbm52akRmWHYzSHJkNk9lejRId042cUhOUFRqMjFMT05pZGRRQTlreGMyQUFVM25VQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUVmOHE3N0M4ZCtCSDZ3T1ZkOWhlTy9BajlaWmUvNG95VGxPMWVVUDM1djRsVGx5UDdlRUFHNUNMNXBCa0U2cHBVOFY3bUs5Z2VQNUJPcWFWUEZlNWl2WUZVTjBYR0dYOGRGNjdqb3d1SVlselA4ckoreVlBR0dtMEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFEeC9MMzFUVFg0WDNNSm0rMGd5OTlVMDErRjl6Q1p2cDlYcStMMGJqbmRTR1UzK1VNeDBrdnlyTzFqZ0JKWWdlYkFBS2J6cUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFDRCtWRDAveFIzUEM5ZU1tOVNIS2g2ZjRvN25oZXZHVGV0RnVPWXNTTDRFK3FuUHZmUFkvenJ4cS9SQUEyV2FIRHNNbm5UK1J1K01DOWU4Y2U3REo1MC9rYnZqQXZYdkhqVWo5bngvZ2QxVk1vb1A3YWtmR3crdWhxZ0FxSU9sZ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU1yOG9mVCtlZStNTjllL2NlN0RLSDAvbm52akRmWHYzSHJkNk9lejRId042cUhOUFRqMjFMT05pZGRRQTlreGMyQUFVM25VQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUVmOEFLdSt3dkhmZ1Irc0RsWGZZWGp2d0kvV1dYdjhBaWpKT1U3VjVRL2ZtL2lWT1hJL3Q0UUFia0l2bWtHUVRxbWxUeFh1WXIyQjQva0U2cHBVOFY3bUs5Z1ZRM1JjWVpmeDBYcnVPakM0aGlYTS95c243SmdBWWFiUUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFQSDh2ZlZOTmZoZmN3bWI3U0RMMzFUVFg0WDNNSm0rbjFlcjR2UnVPZDFJWlRmNVF6SFNTL0tzN1dPQUVsaUI1c0FBcHZPb0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFJUDVVUFQvQUJSM1BDOWVNbTlTSEtoNmY0bzduaGV2R1RldEZ1T1lzU0w0RStxblB2ZlBZL3pyeHEvUkFBMldhSERzTW5uVCtSdStNQzllOGNlN0RKNTAva2J2akF2WHZIalVqOW54L2dkMVZNb29QN2FrZkd3K3VocWdBcUlPbGdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFNcjhvZlQrZWUrTU45ZS9jZTdES0gwL25udmpEZlh2M0hyZDZPZXo0SHdONnFITlBUajIxTE9OaWRkUUE5a3hjMkFBVTNuVUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFFZjhxNzdDOGQrQkg2d09WZDloZU8vQWo5WlplLzRveVRsTzFlVVAzNXY0bFRseVA3ZUVBRzVDTDVwQmtFNnBwVThWN21LOWdlUDVCT3FhVlBGZTVpdllGVU4wWEdHWDhkRjY3am93dUlZbHpQOHJKK3lZQUdHbTBBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBRHgvTDMxVFRYNFgzTUptKzBneTk5VTAxK0Y5ekNadnA5WHErTDBiam5kU0dVMytVTXgwa3Z5ck8xamdCSllnZWJBQUtienFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQ0QrVkQwL3hSM1BDOWVNbTlTSEtoNmY0bzduaGV2R1RldEZ1T1lzU0w0RStxblB2ZlBZL3pyeHEvUkFBMldhSERzTW5uVCtSdStNQzllOGNlN0RKNTAva2J2akF2WHZIalVqOW54L2dkMVZNb29QN2FrZkd3K3VocWdBcUlPbGdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFNcjhvZlQrZWUrTU45ZS9jZTdES0gwL25udmpEZlh2M0hyZDZPZXo0SHdONnFITlBUajIxTE9OaWRkUUE5a3hjMkFISDBoeUJibVQ5SndOb3BEa0MzTW42VGdiU29qYTVPSEFQelhhanBZMjhUTGJJWFNNMW5ZRGo2UTVBdHpKK2s0RzBVaHlCYm1UOUp3Tm8ydVRod0Q4MTJvYmVKbHRrTHBHYXpzQng5SWNnVzVrL1NjRGFLUTVBdHpKK2s0RzBiWEp3NEIrYTdVTnZFeTJ5RjBqTloyQTQra09RTGN5ZnBPQnRGSWNnVzVrL1NjRGFOcms0Y0EvTmRxRzNpWmJaQzZSbXM3QWNmU0hJRnVaUDBuQTJpa09RTGN5ZnBPQnRHMXljT0FmbXUxRGJ4TXRzaGRJeldkZ09QcERrQzNNbjZUZ2JSU0hJRnVaUDBuQTJqYTVPSEFQelhhaHQ0bVcyUXVrWnJPd0hIMGh5QmJtVDlKd05vcERrQzNNbjZUZ2JSdGNuRGdINXJ0UTI4VExiSVhTTTFuWURqNlE1QXR6SitrNEcwVWh5QmJtVDlKd05vMnVUaHdEODEyb2JlSmx0a0xwR2F6c0J4OUljZ1c1ay9TY0RhS1E1QXR6SitrNEcwYlhKdzRCK2E3VU52RXkyeUYwak5aMkE0K2tPUUxjeWZwT0J0RkljZ1c1ay9TY0RhTnJrNGNBL05kcUczaVpiWkM2Um1zN0FjZlNISUZ1WlAwbkEyaWtPUUxjeWZwT0J0RzF5Y09BZm11MURieE10c2hkSXpXZGdPUHBEa0MzTW42VGdiUlNISUZ1WlAwbkEyamE1T0hBUHpYYWh0NG1XMlF1a1pyT3dISDBoeUJibVQ5SndOb3BEa0MzTW42VGdiUnRjbkRnSDVydFEyOFRMYklYU00xbllEajZRNUF0ekorazRHMFVoeUJibVQ5SndObzJ1VGh3RDgxMm9iZUpsdGtMcEdheWIrVmQ5aGVPL0FqOVZIS1ltSEVHUHY0Sy9ROGVZbngxOHI2ejV2MG1FM2tiNVhQOG5tK0w0YnQzbTUvaHU4M1AvUG11cFhXTTNCNU5FZzBVa2tPSzFXdVR6bThxWUYvL1IvNUtVZTM0RXVnU202TE9NYVR2UjdGOHpnVnFvcUxnZ1FrM2xUZTllOEFHM2lOSnBCa0U2cHBVOFY3bUs5Z1Qza1RuS1VNVlpNWlp3REdrMVMzaTNENGYxSHpJR0VZZENoeEx6bndpSmR1Yzk3ZlgxeTdjNTdsMjVkL3hkdVBWS1E1QXR6SitrNEcwcTN1Z3pETG56L0xuc2d2VkZqUlZSVWF1QlUyYnY4QTRkQnR4ZW1NMFFxSFRUQ2l5cUcxelpOQVJVVjdVVkZTRXpDaXBoM2xRN0FjZlNISUZ1WlAwbkEyaWtPUUxjeWZwT0J0TVEydVRod0Q4MTJvMlh0NG1XMlF1a1pyT3dISDBoeUJibVQ5SndOb3BEa0MzTW42VGdiUnRjbkRnSDVydFEyOFRMYklYU00xbllEajZRNUF0ekorazRHMFVoeUJibVQ5SndObzJ1VGh3RDgxMm9iZUpsdGtMcEdhenNCeDlJY2dXNWsvU2NEYUtRNUF0ekorazRHMGJYSnc0QithN1VOdkV5MnlGMGpOWjJBNCtrT1FMY3lmcE9CdEZJY2dXNWsvU2NEYU5yazRjQS9OZHFHM2laYlpDNlJtczdBY2ZTSElGdVpQMG5BMmlrT1FMY3lmcE9CdEcxeWNPQWZtdTFEYnhNdHNoZEl6V2RnT1BwRGtDM01uNlRnYlJTSElGdVpQMG5BMmphNU9IQVB6WGFodDRtVzJRdWtack93SEgwaHlCYm1UOUp3Tm9wRGtDM01uNlRnYlJ0Y25EZ0g1cnRRMjhUTGJJWFNNMW5ZRGo2UTVBdHpKK2s0RzBVaHlCYm1UOUp3Tm8ydVRod0Q4MTJvYmVKbHRrTHBHYXpzQng5SWNnVzVrL1NjRGFLUTVBdHpKK2s0RzBiWEp3NEIrYTdVTnZFeTJ5RjBqTloyQTQra09RTGN5ZnBPQnRGSWNnVzVrL1NjRGFOcms0Y0EvTmRxRzNpWmJaQzZSbXM3QWNmU0hJRnVaUDBuQTJpa09RTGN5ZnBPQnRHMXljT0FmbXUxRGJ4TXRzaGRJeldkZ09QcERrQzNNbjZUZ2JSU0hJRnVaUDBuQTJqYTVPSEFQelhhaHQ0bVcyUXVrWnJPUHk5OVUwMStGOXpDWnZyOHkyVGxLR05jbU16WUJpdWFwYnhsaDhUNmY1Y0RCOE9oUklsL3pZUkR1M2VhOXZiNjdkdTgxeTVkdS93Q0xsMUFhZFY3RklvMENZSXpJN0Zhdm5uTGdWRlJjR3doL3hLaUwvdWRaTExLWXlhTEpJallqVWt6RXd0VkhKaDg3RzNzS0t1L3ZvQUVqU0R4c0FPUHBEa0MzTW42VGdiUlNISUZ1WlAwbkEybFJHMXljT0FmbXUxSFN4dDRtVzJRdWtack93SEgwaHlCYm1UOUp3Tm9wRGtDM01uNlRnYlJ0Y25EZ0g1cnRRMjhUTGJJWFNNMW5ZRGo2UTVBdHpKK2s0RzBVaHlCYm1UOUp3Tm8ydVRod0Q4MTJvYmVKbHRrTHBHYXpzQng5SWNnVzVrL1NjRGFLUTVBdHpKK2s0RzBiWEp3NEIrYTdVTnZFeTJ5RjBqTloyQTQra09RTGN5ZnBPQnRGSWNnVzVrL1NjRGFOcms0Y0EvTmRxRzNpWmJaQzZSbXM3QWNmU0hJRnVaUDBuQTJpa09RTGN5ZnBPQnRHMXljT0FmbXUxRGJ4TXRzaGRJeldkZ09QcERrQzNNbjZUZ2JSU0hJRnVaUDBuQTJqYTVPSEFQelhhaHQ0bVcyUXVrWnJPd0hIMGh5QmJtVDlKd05vcERrQzNNbjZUZ2JSdGNuRGdINXJ0UTI4VExiSVhTTTFuWURqNlE1QXR6SitrNEcwVWh5QmJtVDlKd05vMnVUaHdEODEyb2JlSmx0a0xwR2F6c0J4OUljZ1c1ay9TY0RhS1E1QXR6SitrNEcwYlhKdzRCK2E3VU52RXkyeUYwak5aMkE0K2tPUUxjeWZwT0J0RkljZ1c1ay9TY0RhTnJrNGNBL05kcUczaVpiWkM2Um1zN0FjZlNISUZ1WlAwbkEyaWtPUUxjeWZwT0J0RzF5Y09BZm11MURieE10c2hkSXpXZGdPUHBEa0MzTW42VGdiUlNISUZ1WlAwbkEyamE1T0hBUHpYYWh0NG1XMlF1a1pyT3dISDBoeUJibVQ5SndOb3BEa0MzTW42VGdiUnRjbkRnSDVydFEyOFRMYklYU00xa2Y4cUhwL2lqdWVGNjhaTjczN2xHNDV4UGp5ZDhWNFhpWEd1TGNjWUxlNHFoUTc2TGdzZTlpM2w3ZjNJMGE3ZHZidDllM2J0em41cnR5N3pmM3VQQVZtTnlLQStIUnFSc2lJcU9SaVlVWGVYMXFVTVh5a3FoUjZkem5HZ3VSekZpcmdWRlJVWGVUMUttOG9BYkdOSEIrMkQ0UmhHQjRSQXd2Qkk4YkJjS2hYOTdFaFJZZDlkdmIrSGYzTHZQY3ZyMit1ZjYzTHR5N2N1WGJsMjQvRWZselVWTUM3Nkg3aHhITmNqbXJnVkRzS1E1L3R6T0drNCswVWh6L2JtY05KeDlweDQ4amE1Ti9BTXpXNmpKZHZFOVd5TDBqOVoyRkljLzI1bkRTY2ZhS1E1L3R6T0drNCswNDhOcmszOEF6TmJxRzNpZXJaRjZSK3M3Q2tPZjdjemhwT1B0RkljLzI1bkRTY2ZhY2VHMXliK0FabXQxRGJ4UFZzaTlJL1dkaFNIUDhBYm1jTkp4OW9wRG4rM000YVRqN1RqdzJ1VGZ3RE0xdW9iZUo2dGtYcEg2enNLUTUvdHpPR2s0KzBVaHovQUc1bkRTY2ZhY2VHMXliK0FabXQxRGJ4UFZzaTlJL1dkaFNIUDl1WncwbkgyaWtPZjdjemhwT1B0T1BEYTVOL0FNelc2aHQ0bnEyUmVrZnJPd3BEbiszTTRhVGo3UlNIUDl1WncwbkgybkhodGNtL2dHWnJkUTI4VDFiSXZTUDFuWVVoei9ibWNOSng5b3BEbiszTTRhVGo3VGp3MnVUZndETTF1b2JlSjZ0a1hwSDZ6c0tRNS90ek9HazQrMFVoei9ibWNOSng5cHg0YlhKdjRCbWEzVU52RTlXeUwwajlaMkZJYy8yNW5EU2NmYUtRNS90ek9HazQrMDQ4TnJrMzhBek5icUczaWVyWkY2UitzN0NrT2Y3Y3pocE9QdEZJYy8yNW5EU2NmYWNlRzF5YitBWm10MURieFBWc2k5SS9XZGhTSFA4QWJtY05KeDlvcERuKzNNNGFUajdUancydVRmd0RNMXVvYmVKNnRrWHBINnpzS1E1L3R6T0drNCswVWh6L0FHNW5EU2NmYWNlRzF5YitBWm10MURieFBWc2k5SS9XZGhTSFA5dVp3MG5IMmlrT2Y3Y3pocE9QdE9QRGE1Ti9BTXpXNmh0NG5xMlJla2ZyUDJ3akNNSXd6Q0krRjRYSGpZVmhVVy92b2tXTEV2cnQ5ZnhMKzdkNTd0OWZYMTMvQUZ1M2J0MjdkdTNidDErSVBYYTFHcHNXN3lJWTFFaU9jNVhPWENxZ0IrajhBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUhWU0xnK0Q0Wk84bllKaGNDRGhXQ3hjYTRKRGl3b2w3Y3ZyeUplWFkxN2N1M3Q5ZTNmOUx0eTdjdTNibDI1ZGZKTDVXa25nUGp1VENqRVZlWk1KNlV6emM2V1N1RkpHcmdXSTVyY1A4TmtxSmgvOU9WR3FGSGtnV0drL1JrRFpLUEpBc05KK2pJR3lpM1d1bSt5UHptbGczbzZKNnlsQ3pIbVY0MVFvOGtDdzBuNk1nYkpSNUlGaHBQMFpBMlN0ZE45a2ZuTkhvNko2eWxDekhtVjQxUW84a0N3MG42TWdiSlI1SUZocFAwWkEyU3RkTjlrZm5OSG82SjZ5bEN6SG1WNDFRbzhrQ3cwbjZNZ2JKUjVJRmhwUDBaQTJTdGROOWtmbk5IbzZKNnlsQ3pIbVY0MVFvOGtDdzBuNk1nYkpSNUlGaHBQMFpBMlN0ZE45a2ZuTkhvNko2eWxDekhtVjQxUW84a0N3MG42TWdiSlI1SUZocFAwWkEyU3RkTjlrZm5OSG82SjZ5bEN6SG1WNDFRbzhrQ3cwbjZNZ2JMSzl0ZTVoZFhrOUtQUCtZZ3VoK1oyT0hDcUxoMld5OVdEK0d4LzlJNTNmNzNPVzBBLzBuK3NsTEkzK3A4NWcyS0ttRHpld3c0Y1A4ZG1tRCtnQWJZSTVnWDVrVGsyVU1hNU1aWncvR2txeTNqTEQ0bjFIekkrRVlEQ2lSTC9td2lKY3VjOTlmWHQyN2Q1cmx5NWMvd0FYTGoxU2p5UUxEU2ZveUJzb3pUOWZNeUdRUzZOSVh5VjdsaFBjeFZSVXdLclZWTVA5OEJQV2gxNFhPODhUUkpaM2hTK0cxc29oc2lJaXRkaFJIdFJ5SXY4QTlURGdNcnhxaFI1SUZocFAwWkEyU2p5UUxEU2ZveUJzdkpyWFRmWkg1elRJL1IwVDFsS0ZtUE1yeHFoUjVJRmhwUDBaQTJTanlRTERTZm95QnNsYTZiN0kvT2FQUjBUMWxLRm1QTXJ4cWhSNUlGaHBQMFpBMlNqeVFMRFNmb3lCc2xhNmI3SS9PYVBSMFQxbEtGbVBNcnhxaFI1SUZocFAwWkEyU2p5UUxEU2ZveUJzbGE2YjdJL09hUFIwVDFsS0ZtUE1yeHFoUjVJRmhwUDBaQTJTanlRTERTZm95QnNsYTZiN0kvT2FQUjBUMWxLRm1QTXJ4cWhSNUlGaHBQMFpBMlNqeVFMRFNmb3lCc2xhNmI3SS9PYVBSMFQxbEtGbVBNcnhxaFI1SUZocFAwWkEyU2p5UUxEU2ZveUJzbGE2YjdJL09hUFIwVDFsS0ZtUE1yeHFoUjVJRmhwUDBaQTJTanlRTERTZm95QnNsYTZiN0kvT2FQUjBUMWxLRm1QTXJ4cWhSNUlGaHBQMFpBMlNqeVFMRFNmb3lCc2xhNmI3SS9PYVBSMFQxbEtGbVBNcnhxaFI1SUZocFAwWkEyU2p5UUxEU2ZveUJzbGE2YjdJL09hUFIwVDFsS0ZtUE1yeHFoUjVJRmhwUDBaQTJTanlRTERTZm95QnNsYTZiN0kvT2FQUjBUMWxLRm1QTXJ4cWhSNUlGaHBQMFpBMlNqeVFMRFNmb3lCc2xhNmI3SS9PYVBSMFQxbEtGbVBNcnhxaFI1SUZocFAwWkEyU2p5UUxEU2ZveUJzbGE2YjdJL09hUFIwVDFsS0ZtUE1yeGZtV3lUWlF4Vmt4bWJEOFZ5ckxlTGNQaC9UL0FDNCtENERDaHhMem53aUhjdTgxOWUzdHk3YzU3bDI3Yy94ZHVvRGJ0dWJYUVlOSlpDK1hRSWF3MGE5V1lGVkZYQ2lOWER2ZkVSUXU2M0ZwVlFXZDRjMFN1TzJNNThOSW1GcUtpSWl1ZTNCdi9uL3dWZjdnQnNJMHNCVkhKbmw3RUdQdjQxL1hNUjRueDE4cjZQNVgxZURYa2I1WFA4N24rSDRybDNtNS9odWMvTi9QbXVLb284a0N3MG42TWdiS1BsT0w0T1J6SE9rV2E0c25jOTBQWTc2S2lJdXlhanZ6L3JnSnBYSmJ5NmRLVzBmazlJSlBMWWNKa2JaNEd1YTVWVFlQY3pmVk43ZlZ1SCs1bGVOVUtQSkFzTkoraklHeVVlU0JZYVQ5R1FObGlkYTZiN0kvT2FiRzlIUlBXVW9XWTh5dkdxRkhrZ1dHay9Sa0RaS1BKQXNOSitqSUd5VnJwdnNqODVvOUhSUFdVb1dZOHl2R3FGSGtnV0drL1JrRFpLUEpBc05KK2pJR3lWcnB2c2o4NW85SFJQV1VvV1k4eXZHcUZIa2dXR2svUmtEWktQSkFzTkoraklHeVZycHZzajg1bzlIUlBXVW9XWTh5dkdxRkhrZ1dHay9Sa0RaS1BKQXNOSitqSUd5VnJwdnNqODVvOUhSUFdVb1dZOHl2R3FGSGtnV0drL1JrRFpLUEpBc05KK2pJR3lWcnB2c2o4NW85SFJQV1VvV1k4eXZHcUZIa2dXR2svUmtEWktQSkFzTkoraklHeVZycHZzajg1bzlIUlBXVW9XWTh5dkdxRkhrZ1dHay9Sa0RaS1BKQXNOSitqSUd5VnJwdnNqODVvOUhSUFdVb1dZOHl2R3FGSGtnV0drL1JrRFpLUEpBc05KK2pJR3lWcnB2c2o4NW85SFJQV1VvV1k4eXZHcUZIa2dXR2svUmtEWktQSkFzTkoraklHeVZycHZzajg1bzlIUlBXVW9XWTh5dkdxRkhrZ1dHay9Sa0RaS1BKQXNOSitqSUd5VnJwdnNqODVvOUhSUFdVb1dZOHl2R3FGSGtnV0drL1JrRFpLUEpBc05KK2pJR3lWcnB2c2o4NW85SFJQV1VvV1k4eXZHcUZIa2dXR2svUmtEWktQSkFzTkoraklHeVZycHZzajg1bzlIUlBXVW9XWTh5dkdxRkhrZ1dHay9Sa0RaWlh0cjNNTHE4bnBSNS96RUYwUHpPeHc0VlJjT3kyWHF3ZncyUC9BS1J6dS8zdWN0b0IvcFA5WktXUnY5VDV6QnNVVk1IbTloaHc0ZjQ3Tk1IOUFBMndSekE5VXlKNHV4ZmpYS2RMT0FZMHdIQThaWUJFK28rWkF3aUZleElkL3dBMkR4THR6bnZiNjVkdVhlYTdjdVhmODNMaS9LUEpBc05KK2pJR3kwbGRKdTJ5V2pVdVpJWThCMFJYTVIrRkZSRXdLcmt3Yi93a3I3aFY2ak9GT3BvaVR2SkpXeUMxa1JZZUJ6WEtxcWpXT3c3MzVmOEFORS9zWlhqVkNqeVFMRFNmb3lCc2xIa2dXR2svUmtEWmE5clhUZlpINXpUZFBvNko2eWxDekhtVjQxUW84a0N3MG42TWdiSlI1SUZocFAwWkEyU3RkTjlrZm5OSG82SjZ5bEN6SG1WNDFRbzhrQ3cwbjZNZ2JKUjVJRmhwUDBaQTJTdGROOWtmbk5IbzZKNnlsQ3pIbVY0MVFvOGtDdzBuNk1nYkpSNUlGaHBQMFpBMlN0ZE45a2ZuTkhvNko2eWxDekhtVjQxUW84a0N3MG42TWdiSlI1SUZocFAwWkEyU3RkTjlrZm5OSG82SjZ5bEN6SG1WNDFRbzhrQ3cwbjZNZ2JKUjVJRmhwUDBaQTJTdGROOWtmbk5IbzZKNnlsQ3pIbVY0MVFvOGtDdzBuNk1nYkpSNUlGaHBQMFpBMlN0ZE45a2ZuTkhvNko2eWxDekhtVjQxUW84a0N3MG42TWdiSlI1SUZocFAwWkEyU3RkTjlrZm5OSG82SjZ5bEN6SG1WNDFRbzhrQ3cwbjZNZ2JKUjVJRmhwUDBaQTJTdGROOWtmbk5IbzZKNnlsQ3pIbVY0MVFvOGtDdzBuNk1nYkpSNUlGaHBQMFpBMlN0ZE45a2ZuTkhvNko2eWxDekhtVjQxUW84a0N3MG42TWdiSlI1SUZocFAwWkEyU3RkTjlrZm5OSG82SjZ5bEN6SG1WNDFRbzhrQ3cwbjZNZ2JKUjVJRmhwUDBaQTJTdGROOWtmbk5IbzZKNnlsQ3pIbVY0MVFvOGtDdzBuNk1nYkpSNUlGaHBQMFpBMlN0ZE45a2ZuTkhvNko2eWxDekhtVjQxUW84a0N3MG42TWdiS0xlVWJpYkUrSTUzeFhnbUpjVll0eFBndDlpcUZFdm9XQ3dMMkZlWDEvZGpScmwyK3UzdDdjdVhPZm11WExuUDhBMnVNM3VmWGVKSlNDY1VtNkRKM01jcUt1RlZSVTN2NkdxTHRGNS9PVkM1amRQa3FsaklyRWMxdXhhMXlML3dBbDllRmQ3ZVBBUUcrQ0h3RlVjbWVYc1FZKy9qWDljeEhpZkhYeXZvL2xmVjROZVJ2bGMvenVmNGZpdVhlYm4rRzV6ODM4K2E0cWlqeVFMRFNmb3lCc28rVTR2ZzVITWM2UlpyaXlkejNROWp2b3FJaTdKcU8vUCt1QW1sY2x2THAwcGJSK1QwZ2s4dGh3bVJ0bmdhNXJsVk5nOXpOOVUzdDlXNGY3bVY0MVFvOGtDdzBuNk1nYkpSNUlGaHBQMFpBMldKMXJwdnNqODVwc2IwZEU5WlNoWmp6Szhhb1VlU0JZYVQ5R1FOa284a0N3MG42TWdiSld1bSt5UHptajBkRTlaU2haanpLOGFvVWVTQllhVDlHUU5rbzhrQ3cwbjZNZ2JKV3VtK3lQem1qMGRFOVpTaFpqeks4YW9VZVNCWWFUOUdRTmtvOGtDdzBuNk1nYkpXdW0reVB6bWowZEU5WlNoWmp6Szhhb1VlU0JZYVQ5R1FOa284a0N3MG42TWdiSld1bSt5UHptajBkRTlaU2haanpLOGUvY28zRTJKOFJ6dml2Qk1TNHF4YmlmQmI3RlVLSmZRc0ZnWHNLOHZyKzdHalhMdDlkdmIyNWN1Yy9OY3VYT2YrMXg0Q2tkUlNrTEoybTZET01OcXRiRlRDaUw2MElPWFJhRnhhT3o1S1pqalBSNzREdGlya1JVUmZWdm9pNy9BT1lBWkNZVUhZWlBPbjhqZDhZRjY5NDQ5MkdUenAvSTNmR0JldmVQR3BIN1BqL0E3cXFaUlFmMjFJK05oOWREVkFCVVFkTEFBQUFBQUFBQUFBQUJqKzJBWS9wa1hwWHZEa3Z1bFgvbEl2YzM2bjdBQVRJS3Z6U0RJSjFUU3A0cjNNVjdBOGZ5Q2RVMHFlSzl6RmV3S29ib3VNTXY0NkwxM0hSaGNReExtZjVXVDlrd0FNTk5vQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUhqK1h2cW1tdnd2dVlUTjlwQmw3NnBwcjhMN21FemZUNnZWOFhvM0hPNmtNcHY4b1pqcEpmbFdkckhBQ1N4QThzRGtvL2Z2Z2Z6ckFSL3lVZnYzd1A1MWdLMDc0REc2VjhuMlRDK0M4eS9EV2JlVy9jUlFBMDJTZ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFESDlzQXgvVEl2U3ZlSEpmZEt2L0tSZTV2MVAyQUFtUVZmbnNHUVRyWmxUeFh0b3JTQm0va0U2MlpVOFY3YUswZ1FGdnFNWVlQRXQ2OFF1UThubmlYS3ZtbjlsQUFDTkpQQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFJUDVVUFQvRkhjOEwxNHk4RUg4cUhwL2lqdWVGNjhadjI5cnhuWjhEL0FLSVEzdjdjUUluR3d2cXBONEN4TXBITEE1S1AzNzRIODZ3RWY4bEg3OThEK2RZQ3RPK0F4dWxmSjlrd3Zndk12dzFtM2x2M0VVQU5Oa29BQUFBQUFBQUFBZy9sUTlQOFVkend2WGpKdlVoeW9lbitLTzU0WHJ4azNyUmJqbUxFaStCUHFwejczejJQODY4YXYwUUFObG1odzdESjUwL2tidmpBdlh2SEh1d3llZFA1Rzc0d0wxN3g0MUkvWjhmNEhkVlRLS0QrMnBIeHNQcm9hb0FLaURwWUFBQUFBQUFBQUFBQU1mMndESDlNaTlLOTRjbDkwcS84cEY3bS9VL1lBQ1pCVithUVpCT3FhVlBGZTVpdllIaitRVHFtbFR4WHVZcjJCVkRkRnhobC9IUmV1NDZNTGlHSmN6L0t5ZnNtQUJocHRBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQThmeTk5VTAxK0Y5ekNadnRJTXZmVk5OZmhmY3dtYjZmVjZ2aTlHNDUzVWhsTi9sRE1kSkw4cXp0WTRBU1dJSGxnY2xINzk4RCtkWUNQK1NqOSsrQi9Pc0JXbmZBWTNTdmsreVlYd1htWDRhemJ5MzdpS0FHbXlVQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFZL3RnR1A2WkY2Vjd3NUw3cFYvd0NVaTl6ZnFmc0FCTWdxL1BZTWduV3pLbml2YlJXa0ROL0lKMXN5cDRyMjBWcEFnTGZVWXd3ZUpiMTRoY2g1UFBFdVZmTlA3S0FBRWFTZUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBUWZ5b2VuK0tPNTRYcnhsNElQNVVQVC9BQlIzUEM5ZU0zN2UxNHpzK0IvMFFodmYyNGdST05oZlZTYndGaVpTT1dCeVVmdjN3UDUxZ0kvNUtQMzc0SDg2d0ZhZDhCamRLK1Q3SmhmQmVaZmhyTnZMZnVJb0FhYkpRQUFBQUFBQUFBQkIvS2g2ZjRvN25oZXZHVGVwRGxROVA4VWR6d3ZYakp2V2kzSE1XSkY4Q2ZWVG4zdm5zZjUxNDFmb2dBYkxORGgyR1R6cC9JM2ZHQmV2ZU9QZGhrODZmeU4zeGdYcjNqeHFSK3o0L3dBRHVxcGxGQi9iVWo0MkgxME5VQUZSQjBzQUFBQUFBQUFBQUFBR1A3WUJqK21SZWxlOE9TKzZWZjhBbEl2YzM2bjdBQVRJS3Z6U0RJSjFUU3A0cjNNVjdBOGZ5Q2RVMHFlSzl6RmV3S29ib3VNTXY0NkwxM0hSaGNReExtZjVXVDlrd0FNTk5vQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUhqK1h2cW1tdnd2dVlUTjlwQmw3NnBwcjhMN21FemZUNnZWOFhvM0hPNmtNcHY4b1pqcEpmbFdkckhBQ1N4QThzRGtvL2Z2Z2Z6ckFSL3lVZnYzd1A1MWdLMDc0REc2VjhuMlRDK0M4eS9EV2JlVy9jUlFBMDJTZ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFESDlzQXgvVEl2U3ZlSEpmZEt2L0tSZTV2MVAyQUFtUVZmbnNHUVRyWmxUeFh0b3JTQm0va0U2MlpVOFY3YUswZ1FGdnFNWVlQRXQ2OFF1UThubmlYS3ZtbjlsQUFDTkpQQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFJUDVVUFQvRkhjOEwxNHk4RUg4cUhwL2lqdWVGNjhadjI5cnhuWjhEL29oRGUvdHhBaWNiQytxazNnTEV5a2NzRGtvL2Z2Z2Z6ckFSL3dBbEg3OThEK2RZQ3RPK0F4dWxmSjlrd3Zndk12dzFtM2x2M0VVQU5Oa29BQUFBQUFBQUFBZy9sUTlQOFVkend2WGpKdlVoeW9lbitLTzU0WHJ4azNyUmJqbUxFaStCUHFwejczejJQODY4YXYwUUFObG1odzdESjUwL2tidmpBdlh2SEh1d3llZFA1Rzc0d0wxN3g0MUkvWjhmNEhkVlRLS0QrMnBIeHNQcm9hb0FLaURwWUFBQUFBQUFBQUFBQU1mMndESDlNaTlLOTRjbDkwcS84cEY3bS9VL1lBQ1pCVithUVpCT3FhVlBGZTVpdllIaitRVHFtbFR4WHVZcjJCVkRkRnhobC9IUmV1NDZNTGlHSmN6L0FDc243SmdBWWFiUUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFQSDh2ZlZOTmZoZmN3bWI3U0RMMzFUVFg0WDNNSm0rbjFlcjR2UnVPZDFJWlRmNVF6SFNTL0tzN1dPQUVsaUI1WUhKUisvZkEvbldBai9rby9mdmdmenJBVnAzd0dOMHI1UHNtRjhGNWwrR3MyOHQrNGlnQnBzbEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBR1A3WUJqK21SZWxlOE9TKzZWZitVaTl6ZnFmc0FCTWdxL1BZTWduV3pLbml2YlJXa0ROL0lKMXN5cDRyMjBWcEFnTGZVWXd3ZUpiMTRoY2g1UFBFdVZmTlA3S0FBRWFTZUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBUWZ5b2VuK0tPNTRYcnhsNElQNVVQVC9GSGM4TDE0emZ0N1hqT3o0SC9SQ0c5L2JpQkU0MkY5Vkp2QVdKbEk1WUhKUisvZkEvbldBai9rby9mdmdmenJBVnAzd0dOMHI1UHNtRjhGNWwrR3MyOHQrNGlnQnBzbEFBQUFBQUFBQUFFSDhxSHAvaWp1ZUY2OFpONmtPVkQwL3dBVWR6d3ZYakp2V2kzSE1XSkY4Q2ZWVG4zdm5zZjUxNDFmb2dBYkxORGgyR1R6cC9JM2ZHQmV2ZU9QZGhrODZmeU4zeGdYcjNqeHFSK3o0L3dPNnFtVVVIOXRTUGpZZlhRMVFBVkVIU3dBQUFBQUFBQUFBQUFZL3RnR1A2WkY2Vjd3NUw3cFYvNVNMM04rcCt3QUV5Q3I4MGd5Q2RVMHFlSzl6RmV3UEg4Z25WTktuaXZjeFhzQ3FHNkxqREwrT2k5ZHgwWVhFTVM1bitWay9aTUFERFRhQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUI0L2w3NnBwcjhMN21FemZhUVplK3FhYS9DKzVoTTMwK3IxZkY2Tnh6dXBES2IvS0dZNlNYNVZuYXh3QWtzUVBMQTVLUDM3NEg4NndFZjhBSlIrL2ZBL25XQXJUdmdNYnBYeWZaTUw0THpMOE5adDViOXhGQURUWktBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU1mMndESDlNaTlLOTRjbDkwcS93REtSZTV2MVAyQUFtUVZmbnNHUVRyWmxUeFh0b3JTQm0va0U2MlpVOFY3YUswZ1FGdnFNWVlQRXQ2OFF1UThubmlYS3ZtbjlsQUFDTkpQQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFJUDVVUFQvQUJSM1BDOWVNdkJCL0toNmY0bzduaGV2R2I5dmE4WjJmQS82SVEzdjdjUUluR3d2cXBONEN4TXBITEE1S1AzNzRIODZ3RWY4bEg3OThEK2RZQ3RPK0F4dWxmSjlrd3Zndk12dzFtM2x2M0VVQU5Oa29BQUFBQUFBQUFBZy9sUTlQOFVkend2WGpKdlVoeW9lbitLTzU0WHJ4azNyUmJqbUxFaStCUHFwejczejJQOEFPdkdyOUVBRFpab2NPd3llZFA1Rzc0d0wxN3h4N3NNbm5UK1J1K01DOWU4ZU5TUDJmSCtCM1ZVeWlnL3RxUjhiRDY2R3FBQ29nNldBQUFBQUFBQUFBQUFESDlzQXgvVEl2U3ZlSEpmZEt2OEF5a1h1YjlUOWdBSmtGWDVwQmtFNnBwVThWN21LOWdlUDVCT3FhVlBGZTVpdllGVU4wWEdHWDhkRjY3am93dUlZbHpQOHJKK3lZQUdHbTBBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBRHgvTDMxVFRYNFgzTUptKzBneTk5VTAxK0Y5ekNadnA5WHErTDBiam5kU0dVMytVTXgwa3Z5ck8xamdCSllnZVdCeVVmdjN3UDUxZ0kvNUtQMzc0SDg2d0ZhZDhCamRLK1Q3SmhmQmVaZmhyTnZMZnVJb0FhYkpRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUJqKzJBWS9wa1hwWHZEa3Z1bFgvbEl2YzM2bjdBQVRJS3Z6MkRJSjFzeXA0cjIwVnBBemZ5Q2RiTXFlSzl0RmFRSUMzMUdNTUhpVzllSVhJZVR6eExsWHpUK3lnQUJHa25nQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUVIOHFIcC9panVlRjY4WmVDRCtWRDAveFIzUEM5ZU0zN2UxNHpzK0Ivd0JFSWIzOXVJRVRqWVgxVW04QlltVWpsZ2NsSDc5OEQrZFlDUDhBa28vZnZnZnpyQVZwM3dHTjByNVBzbUY4RjVsK0dzMjh0KzRpZ0Jwc2xBQUFBQUFBQUFBRUg4cUhwL2lqdWVGNjhaTjZrT1ZEMC94UjNQQzllTW05YUxjY3hZa1h3SjlWT2ZlK2V4L25YalYraUFCc3MwT0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQjk2VmNWNFBqeVo1Y3hMaGQvR2g0TGhtSDRQZ3NXK2gzYmx5L3ZieS9pWHQ3ZHUzdDI3Y3UzT2ZtdTNlYm51WFh6eXVVc2d3blJuLzlXb3FyL1JFd24yemRJSWtxbEVPU3dmOEF1OXlOVCtxcmdULzFUNEl2Q3E5SUhhODRlWWdib3F2U0Iydk9IbUlHNmFLcktVWS9uZm1LUzdxSlUvNE9GMHFhaUR4ZUZWNlFPMTV3OHhBM1JWZWtEdGVjUE1RTjBWbEtNZnp2ekZGUktuL0J3dWxUVVFlTHdxdlNCMnZPSG1JRzZLcjBnZHJ6aDVpQnVpc3BSaitkK1lvcUpVLzRPRjBxYWlEeGVGVjZRTzE1dzh4QTNSVmVrRHRlY1BNUU4wVmxLTWZ6dnpGRlJLbi9BQWNMcFUxRUhpOEtyMGdkcnpoNWlCdWlxOUlIYTg0ZVlnYm9yS1VZL25mbUtLaVZQK0RoZEttb2c4WGhWZWtEdGVjUE1RTjBWWHBBN1huRHpFRGRGWlNqSDg3OHhSVVNwL3djTHBVMUVIaThLcjBnZHJ6aDVpQnVpcTlJSGE4NGVZZ2JvcktVWS9uZm1LS2lWUDhBZzRYU3BxSVBGNFZYcEE3WG5EekVEZEZWNlFPMTV3OHhBM1JXVW94L08vTVVWRXFmOEhDNlZOUkI0dkNxOUlIYTg0ZVlnYm9xdlNCMnZPSG1JRzZLeWxHUDUzNWlpb2xUL2c0WFNwcUlQRjRWWHBBN1huRHpFRGRGVjZRTzE1dzh4QTNSV1VveC9PL01VVkVxZjhIQzZWTlJCNHZDcTlJSGE4NGVZZ2JvcXZTQjJ2T0htSUc2S3lsR1A1MzVpaW9sVC9nNFhTcHFJUEY0VlhwQTdYbkR6RURkRlY2UU8xNXc4eEEzUldVb3gvTy9NVVZFcWY4QUJ3dWxUVVFlTHdxdlNCMnZPSG1JRzZLcjBnZHJ6aDVpQnVpc3BSaitkK1lvcUpVLzRPRjBxYWlEeGVGVjZRTzE1dzh4QTNSVmVrRHRlY1BNUU4wVmxLTWZ6dnpGRlJLbi9Cd3VsVFVRZVB2VFZpdkI4UnpQTWVKY0V2NDBUQmNEdy9DTUZoWDBTN2N1Mzk5ZVhrUyt2YmwyK3UzTGx5NXo4MXk1ejgxeTQrQzNySkpTMk5DYkdaLzFjaUtuOUZUQ1JFbkdRUkpMS0lrbGpmOEFkamxhdjlVWEF2OEE2Z0FmUWZFQnFoUjVJRmhwUDBaQTJTanlRTERTZm95QnNvb1ZycHZzajg1cFl4Nk9pZXNwUXN4NWxlTlVLUEpBc05KK2pJR3lVZVNCWWFUOUdRTmtyWFRmWkg1elI2T2llc3BRc3g1bGVOVUtQSkFzTkoraklHeVVlU0JZYVQ5R1FOa3JYVGZaSDV6UjZPaWVzcFFzeDVsZU5VS1BKQXNOSitqSUd5VWVTQllhVDlHUU5rclhUZlpINXpSNk9pZXNwUXN4NWxlTlVLUEpBc05KK2pJR3lVZVNCWWFUOUdRTmtyWFRmWkg1elI2T2llc3BRc3g1bGVOVUtQSkFzTkoraklHeVVlU0JZYVQ5R1FOa3JYVGZaSDV6UjZPaWVzcFFzeDVsZU5VS1BKQXNOSitqSUd5VWVTQllhVDlHUU5rclhUZlpINXpSNk9pZXNwUXN4NWxlTlVLUEpBc05KK2pJR3lVZVNCWWFUOUdRTmtyWFRmWkg1elI2T2llc3BRc3g1bGVOVUtQSkFzTkoraklHeVVlU0JZYVQ5R1FOa3JYVGZaSDV6UjZPaWVzcFFzeDVsZU5VS1BKQXNOSitqSUd5VWVTQllhVDlHUU5rclhUZlpINXpSNk9pZXNwUXN4NWxlTlVLUEpBc05KK2pJR3lVZVNCWWFUOUdRTmtyWFRmWkg1elI2T2llc3BRc3g1bGVOVUtQSkFzTkoraklHeVVlU0JZYVQ5R1FOa3JYVGZaSDV6UjZPaWVzcFFzeDVsZU5VS1BKQXNOSitqSUd5VWVTQllhVDlHUU5rclhUZlpINXpSNk9pZXNwUXN4NWxlTlVLUEpBc05KK2pJR3lVZVNCWWFUOUdRTmtyWFRmWkg1elI2T2llc3BRc3g1bGVLbzVURXZZZ3hEL0FBVitoNGp4UGlYNXYxbnpmcE1HdklQemViNVBOOFh3M0xuUHpmRmQ1dWYrWFBkU3VrSFFlbGtPZkpyaFRwQ1lyR3hObHZMdnFteGNyZnkvcGhJVzNXcm5NZWlWSUpSUitVUkVpdmc3REM1cUtpTHMyTmZ2SXUvdkk3Qi9ZQU1zTmNnWDVrVGsyVU1hNU1aWncvR2txeTNqTEQ0bjFIekkrRVlEQ2lSTC9td2lKY3VjOTlmWHQyN2Q1cmx5NWMveGN1UFZLUEpBc05KK2pJR3lqTlAxOHpJWkJMbzBoZkpYdVdFOXpGVkZUQXF0VlV3LzN3RTlhSFhoYzd6eE5FbG5lRkw0Yld5aUd5SWlLMTJGRWUxSElpLy9BRk1PQXl2R3FGSGtnV0drL1JrRFpLUEpBc05KK2pJR3k4bXRkTjlrZm5OTWo5SFJQV1VvV1k4eXZHcUZIa2dXR2svUmtEWktQSkFzTkoraklHeVZycHZzajg1bzlIUlBXVW9XWTh5dkdxRkhrZ1dHay9Sa0RaS1BKQXNOSitqSUd5VnJwdnNqODVvOUhSUFdVb1dZOHl2R3FGSGtnV0drL1JrRFpLUEpBc05KK2pJR3lWcnB2c2o4NW85SFJQV1VvV1k4eXZHcUZIa2dXR2svUmtEWktQSkFzTkoraklHeVZycHZzajg1bzlIUlBXVW9XWTh5dkdxRkhrZ1dHay9Sa0RaS1BKQXNOSitqSUd5VnJwdnNqODVvOUhSUFdVb1dZOHl2R3FGSGtnV0drL1JrRFpLUEpBc05KK2pJR3lWcnB2c2o4NW85SFJQV1VvV1k4eXZHcUZIa2dXR2svUmtEWktQSkFzTkoraklHeVZycHZzajg1bzlIUlBXVW9XWTh5dkdxRkhrZ1dHay9Sa0RaS1BKQXNOSitqSUd5VnJwdnNqODVvOUhSUFdVb1dZOHl2R3FGSGtnV0drL1JrRFpLUEpBc05KK2pJR3lWcnB2c2o4NW85SFJQV1VvV1k4eXZHcUZIa2dXR2svUmtEWktQSkFzTkoraklHeVZycHZzajg1bzlIUlBXVW9XWTh5dkdxRkhrZ1dHay9Sa0RaS1BKQXNOSitqSUd5VnJwdnNqODVvOUhSUFdVb1dZOHl2R3FGSGtnV0drL1JrRFpLUEpBc05KK2pJR3lWcnB2c2o4NW85SFJQV1VvV1k4eXZGK1piSk5sREZXVEdac1B4WEtzdDR0dytIOVA4dVBnK0F3b2NTODU4SWgzTHZOZlh0N2N1M09lNWR1M1A4WGJxQTI3Ym0xMEdEU1dRdmwwQ0dzTkd2Vm1CVlJWd29qVnc3M3hFVUx1dHhhVlVGbmVITkVyanRqT2ZEU0poYWlvaUlybnR3Yi9BT2YvQUFWZjdnQnNJMHNCcWhSNUlGaHBQMFpBMlNqeVFMRFNmb3lCc29vVnJwdnNqODVwWXg2T2llc3BRc3g1bGVOVUtQSkFzTkoraklHeVVlU0JZYVQ5R1FOa3JYVGZaSDV6UjZPaWVzcFFzeDVsZU5VS1BKQXNOSitqSUd5VWVTQllhVDlHUU5rclhUZlpINXpSNk9pZXNwUXN4NWxlTlVLUEpBc05KK2pJR3lVZVNCWWFUOUdRTmtyWFRmWkg1elI2T2llc3BRc3g1bGVOVUtQSkFzTkoraklHeVVlU0JZYVQ5R1FOa3JYVGZaSDV6UjZPaWVzcFFzeDVsZU5VS1BKQXNOSitqSUd5VWVTQllhVDlHUU5rclhUZlpINXpSNk9pZXNwUXN4NWxlTlVLUEpBc05KK2pJR3lVZVNCWWFUOUdRTmtyWFRmWkg1elI2T2llc3BRc3g1bGVOVUtQSkFzTkoraklHeVVlU0JZYVQ5R1FOa3JYVGZaSDV6UjZPaWVzcFFzeDVsZU5VS1BKQXNOSitqSUd5VWVTQllhVDlHUU5rclhUZlpINXpSNk9pZXNwUXN4NWxlTlVLUEpBc05KK2pJR3lVZVNCWWFUOUdRTmtyWFRmWkg1elI2T2llc3BRc3g1bGVOVUtQSkFzTkoraklHeVVlU0JZYVQ5R1FOa3JYVGZaSDV6UjZPaWVzcFFzeDVsZU5VS1BKQXNOSitqSUd5VWVTQllhVDlHUU5rclhUZlpINXpSNk9pZXNwUXN4NWxlTlVLUEpBc05KK2pJR3lVZVNCWWFUOUdRTmtyWFRmWkg1elI2T2llc3BRc3g1bGVOVUtQSkFzTkoraklHeVVlU0JZYVQ5R1FOa3JYVGZaSDV6UjZPaWVzcFFzeDVsZVBmdVViaWJFK0k1M3hYZ21KY1ZZdHhQZ3Q5aXFGRXZvV0N3TDJGZVgxL2RqUnJsMit1M3Q3Y3VYT2ZtdVhMblAvYTQ4QlNPb3BTRms3VGRCbkdHMVd0aXBoUkY5YUVITG90QzR0SFo4bE14eG5vOThCMnhWeUlxSXZxMzBSZC84d0F5RXdvT3d5ZWRQNUc3NHdMMTd4eDdzTW5uVCtSdStNQzllOGVOU1AyZkgrQjNWVXlpZy90cVI4YkQ2NkdxQUNvZzZXQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQXl2eWg5UDU1NzR3MzE3OXg3c01vZlQrZWUrTU45ZS9jZXQzbzU3UGdmQTNxb2MwOU9QYlVzNDJKMTFBRDJURnpZQUJUZWRRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQVIvd0FxNzdDOGQrQkg2d09WZDloZU8vQWo5WlplL3dDS01rNVR0WGxEOStiK0pVNWNqKzNoQUJ1UWkrYVFaQk9xYVZQRmU1aXZZSGorUVRxbWxUeFh1WXIyQlZEZEZ4aGwvSFJldTQ2TUxpR0pjei9LeWZzbUFCaHB0QUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUE4Znk5OVUwMStGOXpDWnZ0SU12ZlZOTmZoZmN3bWI2ZlY2dmk5RzQ1M1VobE4vbERNZEpMOHF6dFk0QVNXSUhtd0FDbTg2Z0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFnL2xROVA4QUZIYzhMMTR5YjFJY3FIcC9panVlRjY4Wk42MFc0NWl4SXZnVDZxYys5ODlqL092R3I5RUFEWlpvY093eWVkUDVHNzR3TDE3eHg3c01ublQrUnUrTUM5ZThlTlNQMmZIK0IzVlV5aWcvdHFSOGJENjZHcUFDb2c2V0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUF5dnloOVA1NTc0dzMxNzl4N3NNb2ZUK2VlK01OOWUvY2V0M281N1BnZkEzcW9jMDlPUGJVczQySjExQUQyVEZ6WUFCVGVkUUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFSL3lydnNMeDM0RWZyQTVWMzJGNDc4Q1AxbGw3L2lqSk9VN1Y1US9mbS9pVk9YSS90NFFBYmtJdm1rR1FUcW1sVHhYdVlyMkI0L2tFNnBwVThWN21LOWdWUTNSY1laZngwWHJ1T2pDNGhpWE0veXNuN0pnQVlhYlFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBUEg4dmZWTk5maGZjd21iN1NETDMxVFRYNFgzTUptK24xZXI0dlJ1T2QxSVpUZjVRekhTUy9LczdXT0FFbGlCNXNBQXB2T29BQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBSVA1VVBUL0ZIYzhMMTR5YjFJY3FIcC9panVlRjY4Wk42MFc0NWl4SXZnVDZxYys5ODlqL092R3I5RUFEWlpvY093eWVkUDVHNzR3TDE3eHg3c01ublQrUnUrTUM5ZThlTlNQMmZIK0IzVlV5aWcvdHFSOGJENjZHcUFDb2c2V0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUF5dnloOVA1NTc0dzMxNzl4N3NNb2ZUK2VlK01OOWUvY2V0M281N1BnZkEzcW9jMDlPUGJVczQySjExQUQyVEZ6WUFCVGVkUUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFSL3dBcTc3QzhkK0JINndPVmQ5aGVPL0FqOVpaZS93Q0tNazVUdFhsRDkrYitKVTVjaiszaEFCdVFpK2FRWkJPcWFWUEZlNWl2WUhqK1FUcW1sVHhYdVlyMkJWRGRGeGhsL0hSZXU0Nk1MaUdKY3ovS3lmc21BQmhwdEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBOGZ5OTlVMDErRjl6Q1p2dElNdmZWTk5maGZjd21iNmZWNnZpOUc0NTNVaGxOL2xETWRKTDhxenRZNEFTV0lIbXdBQ204NmdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBZy9sUTlQOEFGSGM4TDE0eWIxSWNxSHAvaWp1ZUY2OFpONjBXNDVpeEl2Z1Q2cWMrOTg5ai9PdkdyOUVBRFpab2NPd3llZFA1Rzc0d0wxN3h4N3NNbm5UK1J1K01DOWU4ZU5TUDJmSCtCM1ZVeWlnL3RxUjhiRDY2R3FBQ29nNldBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBeXZ5aDlQNTU3NHczMTc5eDdzTW9mVCtlZStNTjllL2NldDNvNTdQZ2ZBM3FvYzA5T1BiVXM0MkoxMUFEMlRGellBQlRlZFFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBUi95cnZzTHgzNEVmckE1VjMyRjQ3OENQMWxsNy9pakpPVTdWNVEvZm0vaVZPWEkvdDRRQWJrSXZta0dRVHFtbFR4WHVZcjJCNC9rRTZwcFU4VjdtSzlnVlEzUmNZWmZ4MFhydU9qQzRoaVhNL3lzbjdKZ0FZYWJRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQVBIOHZmVk5OZmhmY3dtYjdTREwzMVRUWDRYM01KbStuMWVyNHZSdU9kMUlaVGY1UXpIU1MvS3M3V09BRWxpQjVzQUFwdk9vQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUlQNVVQVC9GSGM4TDE0eWIxSWNxSHAvaWp1ZUY2OFpONjBXNDVpeEl2Z1Q2cWMrOTg5ai9PdkdyOUVBRFpab2NPd3llZFA1Rzc0d0wxN3h4N3NNbm5UK1J1K01DOWU4ZU5TUDJmSCtCM1ZVeWlnL3RxUjhiRDY2R3FBQ29nNldBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBeXZ5aDlQNTU3NHczMTc5eDdzTW9mVCtlZStNTjllL2NldDNvNTdQZ2ZBM3FvYzA5T1BiVXM0MkoxMUFEMlRGellBQlRlZFFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBUi93QXE3N0M4ZCtCSDZ3T1ZkOWhlTy9BajlaWmUvd0NLTWs1VHRYbEQ5K2IrSlU1Y2orM2hBQnVRaSthUVpCT3FhVlBGZTVpdllIaitRVHFtbFR4WHVZcjJCVkRkRnhobC9IUmV1NDZNTGlHSmN6L0t5ZnNtQUJocHRBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQThmeTk5VTAxK0Y5ekNadnRJTXZmVk5OZmhmY3dtYjZmVjZ2aTlHNDUzVWhsTi9sRE1kSkw4cXp0WTRBU1dJSG13QUNtODZnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQWcvbFE5UDhBRkhjOEwxNHliMUljcUhwL2lqdWVGNjhaTjYwVzQ1aXhJdmdUNnFjKzk4OWovT3ZHcjlFQURaWm9jT3d5ZWRQNUc3NHdMMTd4eDdzTW5uVCtSdStNQzllOGVOU1AyZkgrQjNWVXlpZy90cVI4YkQ2NkdxQUNvZzZXQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQXl2eWg5UDU1NzR3MzE3OXg3c01vZlQrZWUrTU45ZS9jZXQzbzU3UGdmQTNxb2MwOU9QYlVzNDJKMTFBRDJURnpZQUJUZWRRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQVIveXJ2c0x4MzRFZnJBNVYzMkY0NzhDUDFsbDcvaWpKT1U3VjVRL2ZtL2lWT1hJL3Q0UUFia0l2bWtHUVRxbWxUeFh1WXIyQjQva0U2cHBVOFY3bUs5Z1ZRM1JjWVpmeDBYcnVPakM0aGlYTS95c243SmdBWWFiUUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFQSDh2ZlZOTmZoZmN3bWI3U0RMMzFUVFg0WDNNSm0rbjFlcjR2UnVPZDFJWlRmNVF6SFNTL0tzN1dPQUVsaUI1c0FBcHZPb0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFJUDVVUFQvRkhjOEwxNHliMUljcUhwL2lqdWVGNjhaTjYwVzQ1aXhJdmdUNnFjKzk4OWovT3ZHcjlFQURaWm9jUDJ3ZkNNSXdQQ0lHRjRKSGpZTGhVSy92WWtLTER2cnQ3Znc3KzVkNTdsOWUzMXovVzVkdVhibHk3Y3UzSDRqOHVhaXBnWGZRL2NPSTVya2MxY0NvZGhTSFA5dVp3MG5IMmlrT2Y3Y3pocE9QdE9QSGtiWEp2NEJtYTNVWkx0NG5xMlJla2ZyT3dwRG4rM000YVRqN1JTSFA5dVp3MG5IMm5IaHRjbS9nR1pyZFEyOFQxYkl2U1AxbllVaHovQUc1bkRTY2ZhS1E1L3R6T0drNCswNDhOcmszOEF6TmJxRzNpZXJaRjZSK3M3Q2tPZjdjemhwT1B0RkljL3dCdVp3MG5IMm5IaHRjbS9nR1pyZFEyOFQxYkl2U1AxbllVaHovYm1jTkp4OW9wRG4rM000YVRqN1RqdzJ1VGZ3RE0xdW9iZUo2dGtYcEg2enNLUTUvdHpPR2s0KzBVaHovYm1jTkp4OXB4NGJYSnY0Qm1hM1VOdkU5V3lMMGo5WjJGSWMvMjVuRFNjZmFLUTUvdHpPR2s0KzA0OE5yazM4QXpOYnFHM2llclpGNlIrczdDa09mN2N6aHBPUHRGSWMvMjVuRFNjZmFjZUcxeWIrQVptdDFEYnhQVnNpOUkvV2RoU0hQOXVadzBuSDJpa09mN2N6aHBPUHRPUERhNU4vQU16VzZodDRucTJSZWtmck93cERuKzNNNGFUajdSU0hQOXVadzBuSDJuSGh0Y20vZ0dacmRRMjhUMWJJdlNQMW5ZVWh6L0FHNW5EU2NmYUtRNS90ek9HazQrMDQ4TnJrMzhBek5icUczaWVyWkY2UitzN0NrT2Y3Y3pocE9QdEZJYy93QnVadzBuSDJuSGh0Y20vZ0dacmRRMjhUMWJJdlNQMW5ZVWh6L2JtY05KeDlvcERuKzNNNGFUajdUancydVRmd0RNMXVvYmVKNnRrWHBINnpzS1E1L3R6T0drNCswVWh6L2JtY05KeDlweDRiWEp2NEJtYTNVTnZFOVd5TDBqOVorMkVZUmhHR1lSSHd2QzQ4YkNzS2kzOTlFaXhZbDlkdnIrSmYzYnZQZHZyNit1L3dDdDI3ZHUzYnQyN2R1dnhCNjdXbzFOaTNlUkRHb2tSem5LNXk0VlVBUDBmZ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBNnFSY0h3ZkRKM2s3Qk1MZ1FjS3dXTGpYQkljV0ZFdmJsOWVSTHk3R3ZibDI5dnIyNy9wZHVYYmwyN2N1M0xyNUpmSzBrOEI4ZHlZVVlpcnpKaFBTbWViblN5VndwSTFjQ3hITmJoL2hzbFJNUC9weW8xUW84a0N3MG42TWdiSlI1SUZocFAwWkEyVVc2MTAzMlIrYzBzRzlIUlBXVW9XWTh5dkdxRkhrZ1dHay9Sa0RaS1BKQXNOSitqSUd5VnJwdnNqODVvOUhSUFdVb1dZOHl2R3FGSGtnV0drL1JrRFpLUEpBc05KK2pJR3lWcnB2c2o4NW85SFJQV1VvV1k4eXZHcUZIa2dXR2svUmtEWktQSkFzTkoraklHeVZycHZzajg1bzlIUlBXVW9XWTh5dkdxRkhrZ1dHay9Sa0RaS1BKQXNOSitqSUd5VnJwdnNqODVvOUhSUFdVb1dZOHl2R3FGSGtnV0drL1JrRFpLUEpBc05KK2pJR3lWcnB2c2o4NW85SFJQV1VvV1k4eXZHcUZIa2dXR2svUmtEWlpYdHIzTUxxOG5wUjUvd0F4QmREOHpzY09GVVhEc3RsNnNIOE5qLzZSenUvM3VjdG9CL3BQOVpLV1J2OEFVK2N3YkZGVEI1dllZY09IK096VEIvUUFOc0Vjd0w4eUp5YktHTmNtTXM0ZmpTVlpieGxoOFQ2ajVrZkNNQmhSSWwvellSRXVYT2UrdnIyN2R1ODF5NWN1ZjR1WEhxbEhrZ1dHay9Sa0RaUm1uNitaa01nbDBhUXZrcjNMQ2U1aXFpcGdWV3FxWWY3NENldERyd3VkNTRtaVN6dkNsOE5yWlJEWkVSRmE3Q2lQYWprUmYvcVljQmxlTlVLUEpBc05KK2pJR3lVZVNCWWFUOUdRTmw1TmE2YjdJL09hWkg2T2llc3BRc3g1bGVOVUtQSkFzTkoraklHeVVlU0JZYVQ5R1FOa3JYVGZaSDV6UjZPaWVzcFFzeDVsZU5VS1BKQXNOSitqSUd5VWVTQllhVDlHUU5rclhUZlpINXpSNk9pZXNwUXN4NWxlTlVLUEpBc05KK2pJR3lVZVNCWWFUOUdRTmtyWFRmWkg1elI2T2llc3BRc3g1bGVOVUtQSkFzTkoraklHeVVlU0JZYVQ5R1FOa3JYVGZaSDV6UjZPaWVzcFFzeDVsZU5VS1BKQXNOSitqSUd5VWVTQllhVDlHUU5rclhUZlpINXpSNk9pZXNwUXN4NWxlTlVLUEpBc05KK2pJR3lVZVNCWWFUOUdRTmtyWFRmWkg1elI2T2llc3BRc3g1bGVOVUtQSkFzTkoraklHeVVlU0JZYVQ5R1FOa3JYVGZaSDV6UjZPaWVzcFFzeDVsZU5VS1BKQXNOSitqSUd5VWVTQllhVDlHUU5rclhUZlpINXpSNk9pZXNwUXN4NWxlTlVLUEpBc05KK2pJR3lVZVNCWWFUOUdRTmtyWFRmWkg1elI2T2llc3BRc3g1bGVOVUtQSkFzTkoraklHeVVlU0JZYVQ5R1FOa3JYVGZaSDV6UjZPaWVzcFFzeDVsZU5VS1BKQXNOSitqSUd5VWVTQllhVDlHUU5rclhUZlpINXpSNk9pZXNwUXN4NWxlTlVLUEpBc05KK2pJR3lVZVNCWWFUOUdRTmtyWFRmWkg1elI2T2llc3BRc3g1bGVMOHkyU2JLR0tzbU16WWZpdVZaYnhiaDhQNmY1Y2ZCOEJoUTRsNXo0UkR1WGVhK3ZiMjVkdWM5eTdkdWY0dTNVQnQyM05yb01Ha3NoZkxvRU5ZYU5lck1DcWlyaFJHcmgzdmlJb1hkYmkwcW9MTzhPYUpYSGJHYytHa1RDMUZSRVJYUGJnMy93QS8rQ3IvQUhBRFlScFlDcU9UUEwySU1mZnhyK3VZanhQanI1WDBmeXZxOEd2STN5dWY1M1A4UHhYTHZOei9BQTNPZm0vbnpYRlVVZVNCWWFUOUdRTmxIeW5GOEhJNWpuU0xOY1dUdWU2SHNkOUZSRVhaTlIzNS93QmNCTks1TGVYVHBTMmo4bnBCSjViRGhNamJQQTF6WEtxYkI3bWI2cHZiNnR3LzNNcnhxaFI1SUZocFAwWkEyU2p5UUxEU2ZveUJzc1RyWFRmWkg1elRZM282SjZ5bEN6SG1WNDFRbzhrQ3cwbjZNZ2JKUjVJRmhwUDBaQTJTdGROOWtmbk5IbzZKNnlsQ3pIbVY0MVFvOGtDdzBuNk1nYkpSNUlGaHBQMFpBMlN0ZE45a2ZuTkhvNko2eWxDekhtVjQxUW84a0N3MG42TWdiSlI1SUZocFAwWkEyU3RkTjlrZm5OSG82SjZ5bEN6SG1WNDFRbzhrQ3cwbjZNZ2JKUjVJRmhwUDBaQTJTdGROOWtmbk5IbzZKNnlsQ3pIbVY0MVFvOGtDdzBuNk1nYkpSNUlGaHBQMFpBMlN0ZE45a2ZuTkhvNko2eWxDekhtVjQxUW84a0N3MG42TWdiSlI1SUZocFAwWkEyU3RkTjlrZm5OSG82SjZ5bEN6SG1WNDFRbzhrQ3cwbjZNZ2JKUjVJRmhwUDBaQTJTdGROOWtmbk5IbzZKNnlsQ3pIbVY0MVFvOGtDdzBuNk1nYkpSNUlGaHBQMFpBMlN0ZE45a2ZuTkhvNko2eWxDekhtVjQxUW84a0N3MG42TWdiSlI1SUZocFAwWkEyU3RkTjlrZm5OSG82SjZ5bEN6SG1WNDFRbzhrQ3cwbjZNZ2JKUjVJRmhwUDBaQTJTdGROOWtmbk5IbzZKNnlsQ3pIbVY0MVFvOGtDdzBuNk1nYkpSNUlGaHBQMFpBMlN0ZE45a2ZuTkhvNko2eWxDekhtVjQxUW84a0N3MG42TWdiSlI1SUZocFAwWkEyU3RkTjlrZm5OSG82SjZ5bEN6SG1WNDFRbzhrQ3cwbjZNZ2JMSzl0ZTVoZFhrOUtQUCtZZ3VoK1oyT0hDcUxoMld5OVdEK0d4L3dEU09kMys5emx0QVA4QVNmNnlVc2pmNm56bURZb3FZUE43RERody93QWRtbUQrZ0FiWUk1Z2VxWkU4WFl2eHJsT2xuQU1hWURnZU1zQWlmVWZNZ1lSQ3ZZa08vd0NiQjRsMjV6M3Q5Y3UzTHZOZHVYTHYrYmx4ZmxIa2dXR2svUmtEWmFTdWszYlpMUnFYTWtNZUE2SXJtSS9DaW9pWUZWeVlOLzRTVjl3cTlSbkNuVTBSSjNra3JaQmF5SXNQQTVybFZWUnJIWWQ3OHY4QW1pZjJNcnhxaFI1SUZocFAwWkEyU2p5UUxEU2ZveUJzdGUxcnB2c2o4NXB1bjBkRTlaU2haanpLOGFvVWVTQllhVDlHUU5rbzhrQ3cwbjZNZ2JKV3VtK3lQem1qMGRFOVpTaFpqeks4YW9VZVNCWWFUOUdRTmtvOGtDdzBuNk1nYkpXdW0reVB6bWowZEU5WlNoWmp6Szhhb1VlU0JZYVQ5R1FOa284a0N3MG42TWdiSld1bSt5UHptajBkRTlaU2haanpLOGFvVWVTQllhVDlHUU5rbzhrQ3cwbjZNZ2JKV3VtK3lQem1qMGRFOVpTaFpqeks4YW9VZVNCWWFUOUdRTmtvOGtDdzBuNk1nYkpXdW0reVB6bWowZEU5WlNoWmp6Szhhb1VlU0JZYVQ5R1FOa284a0N3MG42TWdiSld1bSt5UHptajBkRTlaU2haanpLOGFvVWVTQllhVDlHUU5rbzhrQ3cwbjZNZ2JKV3VtK3lQem1qMGRFOVpTaFpqeks4YW9VZVNCWWFUOUdRTmtvOGtDdzBuNk1nYkpXdW0reVB6bWowZEU5WlNoWmp6Szhhb1VlU0JZYVQ5R1FOa284a0N3MG42TWdiSld1bSt5UHptajBkRTlaU2haanpLOGFvVWVTQllhVDlHUU5rbzhrQ3cwbjZNZ2JKV3VtK3lQem1qMGRFOVpTaFpqeks4YW9VZVNCWWFUOUdRTmtvOGtDdzBuNk1nYkpXdW0reVB6bWowZEU5WlNoWmp6Szhhb1VlU0JZYVQ5R1FOa284a0N3MG42TWdiSld1bSt5UHptajBkRTlaU2haanpLOGFvVWVTQllhVDlHUU5sRnZLTnhOaWZFYzc0cndURXVLc1c0bndXK3hWQ2lYMExCWUY3Q3ZMNi91eG8xeTdmWGIyOXVYTG5QelhMbHpuL3RjWnZjK3U4U1NrRTRwTjBHVHVZNVVWY0txaXB2ZjBOVVhhTHorY3FGekc2ZkpWTEdSV0k1cmRpMXJrWC9BSkw2OEs3MjhlQWdOOEVQZ0tvNU04dllneDkvR3Y2NWlQRStPdmxmUi9LK3J3YThqZks1L25jL3cvRmN1ODNQOE56bjV2NTgxeFZGSGtnV0drL1JrRFpSOHB4ZkJ5T1k1MGl6WEZrN251aDdIZlJVUkYyVFVkK2Y5Y0JOSzVMZVhUcFMyajhucEJKNWJEaE1qYlBBMXpYS3FiQjdtYjZwdmI2dHcvM01yeHFoUjVJRmhwUDBaQTJTanlRTERTZm95QnNzVHJYVGZaSDV6VFkzbzZKNnlsQ3pIbVY0MVFvOGtDdzBuNk1nYkpSNUlGaHBQMFpBMlN0ZE45a2ZuTkhvNko2eWxDekhtVjQxUW84a0N3MG42TWdiSlI1SUZocFAwWkEyU3RkTjlrZm5OSG82SjZ5bEN6SG1WNDFRbzhrQ3cwbjZNZ2JKUjVJRmhwUDBaQTJTdGROOWtmbk5IbzZKNnlsQ3pIbVY0MVFvOGtDdzBuNk1nYkpSNUlGaHBQMFpBMlN0ZE45a2ZuTkhvNko2eWxDekhtVjQ5KzVSdUpzVDRqbmZGZUNZbHhWaTNFK0MzMktvVVMraFlMQXZZVjVmWDkyTkd1WGI2N2UzdHk1YzUrYTVjdWMvOXJqd0ZJNmlsSVdUdE4wR2NZYlZhMkttRkVYMW9RY3VpMExpMGRueVV6SEdlajN3SGJGWElpb2krcmZSRjMvekFESVRDZzdESjUwL2tidmpBdlh2SEh1d3llZFA1Rzc0d0wxN3g0MUkvWjhmNEhkVlRLS0QrMnBIeHNQcm9hb0FLaURwWUFBQUFBQUFBQUFBQU1mMndESDlNaTlLOTRjbDkwcS84cEY3bS9VL1lBQ1pCVithUVpCT3FhVlBGZTVpdllIaitRVHFtbFR4WHVZcjJCVkRkRnhobC9IUmV1NDZNTGlHSmN6L0FDc243SmdBWWFiUUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFQSDh2ZlZOTmZoZmN3bWI3U0RMMzFUVFg0WDNNSm0rbjFlcjR2UnVPZDFJWlRmNVF6SFNTL0tzN1dPQUVsaUI1WUhKUisvZkEvbldBai9rby9mdmdmenJBVnAzd0dOMHI1UHNtRjhGNWwrR3MyOHQrNGlnQnBzbEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBR1A3WUJqK21SZWxlOE9TKzZWZitVaTl6ZnFmc0FCTWdxL1BZTWduV3pLbml2YlJXa0ROL0lKMXN5cDRyMjBWcEFnTGZVWXd3ZUpiMTRoY2g1UFBFdVZmTlA3S0FBRWFTZUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBUWZ5b2VuK0tPNTRYcnhsNElQNVVQVC9GSGM4TDE0emZ0N1hqT3o0SC9SQ0c5L2JpQkU0MkY5Vkp2QVdKbEk1WUhKUisvZkEvbldBai9rby9mdmdmenJBVnAzd0dOMHI1UHNtRjhGNWwrR3MyOHQrNGlnQnBzbEFBQUFBQUFBQUFFSDhxSHAvaWp1ZUY2OFpONmtPVkQwL3dBVWR6d3ZYakp2V2kzSE1XSkY4Q2ZWVG4zdm5zZjUxNDFmb2dBYkxORGgyR1R6cC9JM2ZHQmV2ZU9QZGhrODZmeU4zeGdYcjNqeHFSK3o0L3dPNnFtVVVIOXRTUGpZZlhRMVFBVkVIU3dBQUFBQUFBQUFBQUFZL3RnR1A2WkY2Vjd3NUw3cFYvNVNMM04rcCt3QUV5Q3I4MGd5Q2RVMHFlSzl6RmV3UEg4Z25WTktuaXZjeFhzQ3FHNkxqREwrT2k5ZHgwWVhFTVM1bitWay9aTUFERFRhQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUI0L2w3NnBwcjhMN21FemZhUVplK3FhYS9DKzVoTTMwK3IxZkY2Tnh6dXBES2IvS0dZNlNYNVZuYXh3QWtzUVBMQTVLUDM3NEg4NndFZjhBSlIrL2ZBL25XQXJUdmdNYnBYeWZaTUw0THpMOE5adDViOXhGQURUWktBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU1mMndESDlNaTlLOTRjbDkwcS93REtSZTV2MVAyQUFtUVZmbnNHUVRyWmxUeFh0b3JTQm0va0U2MlpVOFY3YUswZ1FGdnFNWVlQRXQ2OFF1UThubmlYS3ZtbjlsQUFDTkpQQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFJUDVVUFQvQUJSM1BDOWVNdkJCL0toNmY0bzduaGV2R2I5dmE4WjJmQS82SVEzdjdjUUluR3d2cXBONEN4TXBITEE1S1AzNzRIODZ3RWY4bEg3OThEK2RZQ3RPK0F4dWxmSjlrd3Zndk12dzFtM2x2M0VVQU5Oa29BQUFBQUFBQUFBZy9sUTlQOFVkend2WGpKdlVoeW9lbitLTzU0WHJ4azNyUmJqbUxFaStCUHFwejczejJQOEFPdkdyOUVBRFpab2NPd3llZFA1Rzc0d0wxN3h4N3NNbm5UK1J1K01DOWU4ZU5TUDJmSCtCM1ZVeWlnL3RxUjhiRDY2R3FBQ29nNldBQUFBQUFBQUFBQUFESDlzQXgvVEl2U3ZlSEpmZEt2OEF5a1h1YjlUOWdBSmtGWDVwQmtFNnBwVThWN21LOWdlUDVCT3FhVlBGZTVpdllGVU4wWEdHWDhkRjY3am93dUlZbHpQOHJKK3lZQUdHbTBBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBRHgvTDMxVFRYNFgzTUptKzBneTk5VTAxK0Y5ekNadnA5WHErTDBiam5kU0dVMytVTXgwa3Z5ck8xamdCSllnZVdCeVVmdjN3UDUxZ0kvNUtQMzc0SDg2d0ZhZDhCamRLK1Q3SmhmQmVaZmhyTnZMZnVJb0FhYkpRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUJqKzJBWS9wa1hwWHZEa3Z1bFgvbEl2YzM2bjdBQVRJS3Z6MkRJSjFzeXA0cjIwVnBBemZ5Q2RiTXFlSzl0RmFRSUMzMUdNTUhpVzllSVhJZVR6eExsWHpUK3lnQUJHa25nQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUVIOHFIcC9panVlRjY4WmVDRCtWRDAveFIzUEM5ZU0zN2UxNHpzK0Ivd0JFSWIzOXVJRVRqWVgxVW04QlltVWpsZ2NsSDc5OEQrZFlDUDhBa28vZnZnZnpyQVZwM3dHTjByNVBzbUY4RjVsK0dzMjh0KzRpZ0Jwc2xBQUFBQUFBQUFBRUg4cUhwL2lqdWVGNjhaTjZrT1ZEMC94UjNQQzllTW05YUxjY3hZa1h3SjlWT2ZlK2V4L25YalYraUFCc3MwT0hZWlBPbjhqZDhZRjY5NDQ5MkdUenAvSTNmR0JldmVQR3BIN1BqL0E3cXFaUlFmMjFJK05oOWREVkFCVVFkTEFBQUFBQUFBQUFBQUJqKzJBWS9wa1hwWHZEa3Z1bFgvbEl2YzM2bjdBQVRJS3Z6U0RJSjFUU3A0cjNNVjdBOGZ5Q2RVMHFlSzl6RmV3S29ib3VNTXY0NkwxM0hSaGNReExtZjVXVDlrd0FNTk5vQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUhqK1h2cW1tdnd2dVlUTjlwQmw3NnBwcjhMN21FemZUNnZWOFhvM0hPNmtNcHY4QUtHWTZTWDVWbmF4d0Frc1FQTEE1S1AzNzRIODZ3RWY4bEg3OThEK2RZQ3RPK0F4dWxmSjlrd3Zndk12dzFtM2x2M0VVQU5Oa29BQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQXgvYkFNZjB5TDByM2h5WDNTci93QXBGN20vVS9ZQUNaQlYrZXdaQk90bVZQRmUyaXRJR2IrUVRyWmxUeFh0b3JTQkFXK294aGc4UzNyeEM1RHllZUpjcSthZjJVQUFJMGs4QUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFnL2xROVA4VWR6d3ZYakx3UWZ5b2VuK0tPNTRYcnhtL2IydkdkbndQK2lFTjcrM0VDSnhzTDZxVGVBc1RLUnl3T1NqOSsrQi9Pc0JIL0pSKy9mQS9uV0FyVHZnTWJwWHlmWk1MNEx6TDhOWnQ1Yjl4RkFEVFpLQUFBQUFBQUFBQUlQNVVQVC9BQlIzUEM5ZU1tOVNIS2g2ZjRvN25oZXZHVGV0RnVPWXNTTDRFK3FuUHZmUFkvenJ4cS9SQUEyV2FIRHNNbm5UK1J1K01DOWU4Y2U3REo1MC9rYnZqQXZYdkhqVWo5bngvZ2QxVk1vb1A3YWtmR3crdWhxZ0FxSU9sZ0FBQUFBQUFBQUFBQXgvYkFNZjB5TDByM2h5WDNTci93QXBGN20vVS9ZQUNaQlYrYVFaQk9xYVZQRmU1aXZZSGorUVRxbWxUeFh1WXIyQlZEZEZ4aGwvSFJldTQ2TUxpR0pjei9LeWZzbUFCaHB0QUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUE4Znk5OVUwMStGOXpDWnZ0SU12ZlZOTmZoZmN3bWI2ZlY2dmk5RzQ1M1VobE4vbERNZEpMOHF6dFk0QVNXSUhsZ2NsSDc5OEQrZFlDUDhBa28vZnZnZnpyQVZwM3dHTjByNVBzbUY4RjVsK0dzMjh0KzRpZ0Jwc2xBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUdQN1lCaittUmVsZThPUys2VmYrVWk5emZxZnNBQk1ncS9QWU1nbld6S25pdmJSV2tETi9JSjFzeXA0cjIwVnBBZ0xmVVl3d2VKYjE0aGNoNVBQRXVWZk5QN0tBQUVhU2VBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQVFmeW9lbitLTzU0WHJ4bDRJUDVVUFQvRkhjOEwxNHpmdDdYak96NEgvUkNHOS9iaUJFNDJGOVZKdkFXSmxJNVlISlIrL2ZBL25XQWova28vZnZnZnpyQVZwM3dHTjByNVBzbUY4RjVsK0dzMjh0KzRpZ0Jwc2xBQUFBQUFBQUFBRUg4cUhwL2lqdWVGNjhaTjZrT1ZEMC94UjNQQzllTW05YUxjY3hZa1h3SjlWT2ZlK2V4L25YalYraUFCc3MwT0hZWlBPbjhqZDhZRjY5NDQ5MVVpNFJnK0J6dkoyRjRYSGc0TGdzTEd1Q1JJc1dKZlhMMjhoM2x5TmUzYnQ5ZlgxMy9TNWN1WExsMjdkdTNYa1VoYXJwQkhhM2ZWV082cW1UVUxpTmJQTWtjNWNDSkZoOWREVlljZlNISUZ1WlAwbkEyaWtPUUxjeWZwT0J0S245cms0Y0EvTmRxT2pMYnhNdHNoZEl6V2RnT1BwRGtDM01uNlRnYlJTSElGdVpQMG5BMmphNU9IQVB6WGFodDRtVzJRdWtack93SEgwaHlCYm1UOUp3Tm9wRGtDM01uNlRnYlJ0Y25EZ0g1cnRRMjhUTGJJWFNNMW5ZRGo2UTVBdHpKK2s0RzBVaHlCYm1UOUp3Tm8ydVRod0Q4MTJvYmVKbHRrTHBHYXpzQng5SWNnVzVrL1NjRGFLUTVBdHpKK2s0RzBiWEp3NEIrYTdVTnZFeTJ5RjBqTloyQTQra09RTGN5ZnBPQnRGSWNnVzVrL1NjRGFOcms0Y0EvTmRxRzNpWmJaQzZSbXM3QmorMVFwRGtDM01uNlRnYlRLOUx1OVZtNlVTZjhBMS9uNGJtWWZOWU1LS21IL0FQVDFZU3RQeWlFK1NLVy83UDhBNk9NeUpzZjlSaDJMa2RndytZd1ljQ3JndzRGd2YwQUNYaFdtYVFaQk9xYVZQRmU1aXZZRTk1RTV5bERGV1RHV2NBeHBOVXQ0dHcrSDlSOHlCaEdIUW9jUzg1OElpWGJuUGUzMTljdTNPZTVkdVhmOFhiajFTa09RTGN5ZnBPQnRLdDdvTXd5NTgveTU3SUwxUlkwVlVWR3JnVk5tNy80ZEJ0eGVtTTBRcUhUVENpeXFHMXpaTkFSVVY3VVZGU0V6Q2lwaDNsUTdBY2ZTSElGdVpQMG5BMmlrT1FMY3lmcE9CdE1RMnVUaHdEODEybzJYdDRtVzJRdWtack93SEgwaHlCYm1UOUp3Tm9wRGtDM01uNlRnYlJ0Y25EZ0g1cnRRMjhUTGJJWFNNMW5ZRGo2UTVBdHpKK2s0RzBVaHlCYm1UOUp3Tm8ydVRod0Q4MTJvYmVKbHRrTHBHYXpzQng5SWNnVzVrL1NjRGFLUTVBdHpKK2s0RzBiWEp3NEIrYTdVTnZFeTJ5RjBqTloyQTQra09RTGN5ZnBPQnRGSWNnVzVrL1NjRGFOcms0Y0EvTmRxRzNpWmJaQzZSbXM3QWNmU0hJRnVaUDBuQTJpa09RTGN5ZnBPQnRHMXljT0FmbXUxRGJ4TXRzaGRJeldkZ09QcERrQzNNbjZUZ2JSU0hJRnVaUDBuQTJqYTVPSEFQelhhaHQ0bVcyUXVrWnJPd0hIMGh5QmJtVDlKd05vcERrQzNNbjZUZ2JSdGNuRGdINXJ0UTI4VExiSVhTTTFuWURqNlE1QXR6SitrNEcwVWh5QmJtVDlKd05vMnVUaHdEODEyb2JlSmx0a0xwR2F6c0J4OUljZ1c1ay9TY0RhS1E1QXR6SitrNEcwYlhKdzRCK2E3VU52RXkyeUYwak5aMkE0K2tPUUxjeWZwT0J0RkljZ1c1ay9TY0RhTnJrNGNBL05kcUczaVpiWkM2Um1zN0FjZlNISUZ1WlAwbkEyaWtPUUxjeWZwT0J0RzF5Y09BZm11MURieE10c2hkSXpXZGdPUHBEa0MzTW42VGdiUlNISUZ1WlAwbkEyamE1T0hBUHpYYWh0NG1XMlF1a1pyT1B5OTlVMDErRjl6Q1p2cjh5MlRsS0dOY21NellCaXVhcGJ4bGg4VDZmNWNEQjhPaFJJbC93QTJFUTd0M212YjIrdTNidk5jdVhiditMbDFBYWRWN0ZJbzBDWUl6STdGYXZubkxnVkZSY0d3aC94S2lML3VkWkxMS1l5YUxKSWpZalVrekV3dFZISmg4N0czc0tLdS92b0FFalNEeFlISlIrL2ZBL25XQWlma3p6RGlERVA4YS9ybVBNVDRsK2I5SDhyNnZDYnlEODNtK2R6L0FBL0ZkdWMvTjhWem41djVjOXhWRkljZ1c1ay9TY0RhVnpYZUpsbGthbGNyaVFvTG5OWHplK2pWVlA4QTgyZm1pRjRWNS9TcWE1TmM2bTZES0pURFk5UFBZVWM5cUttR1BGWGZSVncrcmZPd0hIMGh5QmJtVDlKd05vcERrQzNNbjZUZ2JUVU8xeWNPQWZtdTFFbHR2RXkyeUYwak5aMkE0K2tPUUxjeWZwT0J0RkljZ1c1ay9TY0RhTnJrNGNBL05kcUczaVpiWkM2Um1zN0FjZlNISUZ1WlAwbkEyaWtPUUxjeWZwT0J0RzF5Y09BZm11MURieE10c2hkSXpXZGdPUHBEa0MzTW42VGdiUlNISUZ1WlAwbkEyamE1T0hBUHpYYWh0NG1XMlF1a1pyT3dISDBoeUJibVQ5SndOb3BEa0MzTW42VGdiUnRjbkRnSDVydFEyOFRMYklYU00xbllEajZRNUF0ekorazRHMFVoeUJibVQ5SndObzJ1VGh3RDgxMm9iZUpsdGtMcEdhenNCeDlJY2dXNWsvU2NEYUtRNUF0ekorazRHMGJYSnc0QithN1VOdkV5MnlGMGpOWjJBNCtrT1FMY3lmcE9CdEZJY2dXNWsvU2NEYU5yazRjQS9OZHFHM2laYlpDNlJtczdBY2ZTSElGdVpQMG5BMmlrT1FMY3lmcE9CdEcxeWNPQWZtdTFEYnhNdHNoZEl6V2RnT1BwRGtDM01uNlRnYlJTSElGdVpQMG5BMmphNU9IQVB6WGFodDRtVzJRdWtack93SEgwaHlCYm1UOUp3Tm9wRGtDM01uNlRnYlJ0Y25EZ0g1cnRRMjhUTGJJWFNNMW5ZRGo2UTVBdHpKK2s0RzBVaHlCYm1UOUp3Tm8ydVRod0Q4MTJvYmVKbHRrTHBHYXpzQng5SWNnVzVrL1NjRGFLUTVBdHpKK2s0RzBiWEp3NEIrYTdVTnZFeTJ5RjBqTloyREg5cWhTSElGdVpQMG5BMm1WNlhkNnJOMG9rL3dEci9QdzNNdythd1lVVk1QOEErbnF3bGFmbEVKOGtVdC8yZi9SeG1STmovcU1PeGNqc0dIekdERGdWY0dIQXVEK2dBUzhLMHoyRElKMXN5cDRyMjBWcEF6VHlKNHh4ZmlyS2RMT0g0MHc3QThXNEJEK28rWkh3aUxldzRkNXo0UEV1WE9lK3ZydHk1YzU3dDI1Yy93QTNiaS9LUTVBdHpKK2s0RzBncmZPelRLbzgvd0FGOENFNXllWmFtRkdxcVlkbkUvZ2hidmVDVWptK1IwT2xNS1Z4MlEzTEtYcmdjNXJWd2VhZzcrQlZUZTNsT3dISDBoeUJibVQ5SndOb3BEa0MzTW42VGdiU09XMXljT0FmbXUxRTRkdkV5MnlGMGpOWjJBNCtrT1FMY3lmcE9CdEZJY2dXNWsvU2NEYU5yazRjQS9OZHFHM2laYlpDNlJtczdBY2ZTSElGdVpQMG5BMmlrT1FMY3lmcE9CdEcxeWNPQWZtdTFEYnhNdHNoZEl6V2RnT1BwRGtDM01uNlRnYlJTSElGdVpQMG5BMmphNU9IQVB6WGFodDRtVzJRdWtack93SEgwaHlCYm1UOUp3Tm9wRGtDM01uNlRnYlJ0Y25EZ0g1cnRRMjhUTGJJWFNNMW5ZRGo2UTVBdHpKK2s0RzBVaHlCYm1UOUp3Tm8ydVRod0Q4MTJvYmVKbHRrTHBHYXpzQng5SWNnVzVrL1NjRGFLUTVBdHpKK2s0RzBiWEp3NEIrYTdVTnZFeTJ5RjBqTloyQTQra09RTGN5ZnBPQnRGSWNnVzVrL1NjRGFOcms0Y0EvTmRxRzNpWmJaQzZSbXM3QWNmU0hJRnVaUDBuQTJpa09RTGN5ZnBPQnRHMXljT0FmbXUxRGJ4TXRzaGRJeldkZ09QcERrQzNNbjZUZ2JSU0hJRnVaUDBuQTJqYTVPSEFQelhhaHQ0bVcyUXVrWnJPd0hIMGh5QmJtVDlKd05vcERrQzNNbjZUZ2JSdGNuRGdINXJ0UTI4VExiSVhTTTFuWURqNlE1QXR6SitrNEcwVWh5QmJtVDlKd05vMnVUaHdEODEyb2JlSmx0a0xwR2F6c0J4OUljZ1c1ay9TY0RhS1E1QXR6SitrNEcwYlhKdzRCK2E3VU52RXkyeUYwak5aMkNEK1ZEMC94UjNQQzllTXNDa09RTGN5ZnBPQnRJdDVSdU9jVDQ4bmZGZUY0bHhyaTNIR0MzdUtvVU8raTRMSHZZdDVlMzl5Tkd1M2IyN2ZYdDI3YzUrYTdjdTgzOTdqZXQ3cE04cmcwbGErTkNjMXV3ZnZxMVVUMWYvVUlpWDcxSnB0bFZCSWtHU3loajMrZGg3elh0VmZXdjVJcXFlQWdMQWltSXNEa28vZnZnZnpyQVJQeVo1aHhCaUgrTmYxekhtSjhTL04raitWOVhoTjVCK2J6Zk81L2grSzdjNStiNHJuUHpmeTU3aXFLUTVBdHpKK2s0RzBybXU4VExMSTFLNVhFaFFYT2F2bTk5R3FxZi9tejgwUXZDdlA2VlRYSnJuVTNRWlJLWWJIcDU3Q2pudFJVd3g0cTc2S3VIMWI1MkE0K2tPUUxjeWZwT0J0RkljZ1c1ay9TY0RhYWgydVRod0Q4MTJva3R0NG1XMlF1a1pyT3dISDBoeUJibVQ5SndOb3BEa0MzTW42VGdiUnRjbkRnSDVydFEyOFRMYklYU00xbllEajZRNUF0ekorazRHMFVoeUJibVQ5SndObzJ1VGh3RDgxMm9iZUpsdGtMcEdhenNCeDlJY2dXNWsvU2NEYUtRNUF0ekorazRHMGJYSnc0QithN1VOdkV5MnlGMGpOWjJBNCtrT1FMY3lmcE9CdEZJY2dXNWsvU2NEYU5yazRjQS9OZHFHM2laYlpDNlJtc2ovbFE5UDhVZHp3dlhqSnZlL2NvM0hPSjhlVHZpdkM4UzQxeGJqakJiM0ZVS0hmUmNGajNzVzh2Yis1R2pYYnQ3ZHZyMjdkdWMvTmR1WGViKzl4NENzeHVSUUh3Nk5TTmtSRlJ5TVRDaTd5K3RTaGkrVWxVS1BUdWM0MEZ5T1lzVmNDb3FLaTd5ZXBVM2xBRFl4bzRBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUQrekYyQVlYalhHR0E0cndDRjlSaCtFeHJ6QjRFUDRybDc4Y1MrdnJsN2UzT2U3ZHVYTG5QZHUzUDlidDNtZmlKRWF4cXZldUJFMzFWZlVpSDlZRUI4VjZRb1NLNXpsd0lpYjZxcStwRVQ4MVUvakhzRkFtVm15bjc3QnQ0VUNaV2JLZnZzRzNqRU4wV2oxdmc5S3p2R3k5eENtbVI1Vi9qeGU0ZVBqMkNnVEt6WlQ5OWcyOEtCTXJObFAzMkRidzNSYVBXK0Qwck84TnhDbW1SNVYvanhlNGVQajJDZ1RLelpUOTlnMjhLQk1yTmxQMzJEYnczUmFQVytEMHJPOE54Q21tUjVWL2p4ZTRlUGoyQ2dUS3paVDk5ZzI4S0JNck5sUDMyRGJ3M1JhUFcrRDByTzhOeENtbVI1Vi9qeGU0ZVBqMkNnVEt6WlQ5OWcyOEtCTXJObFAzMkRidzNSYVBXK0Qwck84TnhDbW1SNVYvanhlNGVQajJDZ1RLelpUOTlnMjhLQk1yTmxQMzJEYnczUmFQVytEMHJPOE54Q21tUjVWL2p4ZTRlUGoyQ2dUS3paVDk5ZzI4S0JNck5sUDMyRGJ3M1JhUFcrRDByTzhOeENtbVI1Vi9qeGU0ZVBqMkNnVEt6WlQ5OWcyOEtCTXJObFAzMkRidzNSYVBXK0Qwck84TnhDbW1SNVYvanhlNGVQajJDZ1RLelpUOTlnMjhLQk1yTmxQMzJEYnczUmFQVytEMHJPOE54Q21tUjVWL2p4ZTRlUGoyQ2dUS3paVDk5ZzI4S0JNck5sUDMyRGJ3M1JhUFcrRDByTzhOeENtbVI1Vi9qeGU0ZVBqMkNnVEt6WlQ5OWcyOEtCTXJObFAzMkRidzNSYVBXK0Qwck84TnhDbW1SNVYvanhlNGVQajJDZ1RLelpUOTlnMjhLQk1yTmxQMzJEYnczUmFQVytEMHJPOE54Q21tUjVWL2p4ZTRlUGoyQ2dUS3paVDk5ZzI4S0JNck5sUDMyRGJ3M1JhUFcrRDByTzhOeENtbVI1Vi9qeGU0ZVBqMkNnVEt6WlQ5OWcyOEtCTXJObFAzMkRidzNSYVBXK0Qwck84TnhDbW1SNVYvanhlNGVQait6R09BWVhpckdHSFlydytGOVBoK0RSci9CNDhQNHJsOThFUzl2cnQ3ZlhPZTVkdTNMdk5kdVhmOEFXNWQ1bjhiTDRjUnIybzlpNFVYZlJVOVNvYTBqd0h3bnJDaW9yWE5WVVZGM2xSVTlhS241S241Z0IreitRRmdWVWMvZFY4WXFvNSs2cjR6VGRZQ2lOcjBjWHVFb0ttVjBySnVtay9pa2Zpd0txT2Z1cStNVlVjL2RWOFlyQVVSdGVqaTl3Vk1ycFdUZE5KL0ZJL0ZnVlVjL2RWOFlxbzUrNnI0eFdBb2phOUhGN2dxWlhTc202YVQrS1IrTEFxbzUrNnI0eFZSejkxWHhpc0JSRzE2T0wzQlV5dWxaTjAwbjhVajhXQlZSejkxWHhpcWpuN3F2akZZQ2lOcjBjWHVDcGxkS3licHBQNHBINHNDcWpuN3F2akZWSFAzVmZHS3dGRWJYbzR2Y0ZUSzZWazNUU2Z4U1B4WUZWSFAzVmZHS3FPZnVxK01WZ0tJMnZSeGU0S21WMHJKdW1rL2lrZml3S3FPZnVxK01WVWMvZFY4WXJBVVJ0ZWppOXdWTXJwV1RkTkovRkkvRmdWVWMvZFY4WXFvNSs2cjR4V0FvamE5SEY3Z3FaWFNzbTZhVCtLUitMQXFvNSs2cjR4VlJ6OTFYeGlzQlJHMTZPTDNCVXl1bFpOMDBuOFVqOFdCVlJ6OTFYeGlxam43cXZqRllDaU5yMGNYdUNwbGRLeWJwcFA0cEg0c0Nxam43cXZqRlZIUDNWZkdLd0ZFYlhvNHZjRlRLNlZrM1RTZnhTUHhZRlZIUDNWZkdLcU9mdXErTVZnS0kydlJ4ZTRLbVYwckp1bWsvaWtmaXdLcU9mdXErTVZVYy9kVjhZckFVUnRlamk5d1ZNcnBXVGROSi9GSS9Ic0dWZkpSUmgrZ2YrZjhBMXo2NzUvOEE2dnlmbGZMK0QvN3Z1Zm4rWi9ibTV2N3ZIMnk2UDBna2M2eU5rdmtEOW5DZmh3TGdWTU9CVmF1ODVFWDFvcWI2R2g2WjBNbk9qMDV4Wm5uaUY1cVV3dGpzbTdKcnNHeWFqazMycTVxNFd1UmQ1VjllQmQ4QVBaTVhBcENRZVQ1L0hFcDRwbWorTHYwdjZyNXYreDlCOHo0UGdpMzE1L3krWmU4L1A4SFAvTCtyc0txT2Z1cStNMVBPTjNDaThrbEVTU3lpVmJHSkRjclhKc0lpNEZhdUJVd294VVhBcWZrdUFrWk1kNlpkQm5LUlFaeGtVMzdPREdZMTdGODdBVEMxNkk1cTRGaUlxWVVWRndLaUtuNW9pa2Zpd0txT2Z1cStNVlVjL2RWOFo4ZFlDaU5yMGNYdUhxVk1ycFdUZE5KL0ZJL0ZnVlVjL2RWOFlxbzUrNnI0eFdBb2phOUhGN2dxWlhTc202YVQrS1IrTEFxbzUrNnI0eFZSejkxWHhpc0JSRzE2T0wzQlV5dWxaTjAwbjhVajhXQlZSejkxWHhpcWpuN3F2akZZQ2lOcjBjWHVDcGxkS3licHBQNHBINHNDcWpuN3F2akZWSFAzVmZHS3dGRWJYbzR2Y0ZUSzZWazNUU2Z4U1B4WUZWSFAzVmZHS3FPZnVxK01WZ0tJMnZSeGU0S21WMHJKdW1rL2lrZml3S3FPZnVxK01WVWMvZFY4WXJBVVJ0ZWppOXdWTXJwV1RkTkovRkkvRmdWVWMvZFY4WXFvNSs2cjR4V0FvamE5SEY3Z3FaWFNzbTZhVCtLUitMQXFvNSs2cjR4VlJ6OTFYeGlzQlJHMTZPTDNCVXl1bFpOMDBuOFVqOFdCVlJ6OTFYeGlxam43cXZqRllDaU5yMGNYdUNwbGRLeWJwcFA0cEg0c0Nxam43cXZqRlZIUDNWZkdLd0ZFYlhvNHZjRlRLNlZrM1RTZnhTUHhZRlZIUDNWZkdLcU9mdXErTVZnS0kydlJ4ZTRLbVYwckp1bWsvaWtmaXdLcU9mdXErTVZVYy9kVjhZckFVUnRlamk5d1ZNcnBXVGROSi9GSS9GSVQ5eWZQNEhsUEcwMGZ4ZCtxZlMvSy93Qmo2RDVmeC9IRnZiei9BSmZNdnVibStQbi9BSmYwVGV6Nml0TUp1bnVUdWxVMlJQT1EydVZxcmdjM2ZSRVhCZ2NpTDZsVDhzQnB1NkhjeW55aWt0Yk4wL3dQTXhuc1I2SnNtUHd0VlhOUmNMSE9UMXRjbUREaDN2VmdWQUF5WXdNQ3dLcU9mdXErTVZVYy9kVjhacHVzQlJHMTZPTDNDVUZUSzZWazNUU2Z4U1B4WUZWSFAzVmZHS3FPZnVxK01WZ0tJMnZSeGU0S21WMHJKdW1rL2lrZml3S3FPZnVxK01WVWMvZFY4WXJBVVJ0ZWppOXdWTXJwV1RkTkovRkkvRmdWVWMvZFY4WXFvNSs2cjR4V0FvamE5SEY3Z3FaWFNzbTZhVCtLUitMQXFvNSs2cjR4VlJ6OTFYeGlzQlJHMTZPTDNCVXl1bFpOMDBuOFVqOFdCVlJ6OTFYeGlxam43cXZqRllDaU5yMGNYdUNwbGRLeWJwcFA0cEg0c0Nxam43cXZqRlZIUDNWZkdLd0ZFYlhvNHZjRlRLNlZrM1RTZnhTUHhZRlZIUDNWZkdLcU9mdXErTVZnS0kydlJ4ZTRLbVYwckp1bWsvaWtmaXdLcU9mdXErTVZVYy9kVjhZckFVUnRlamk5d1ZNcnBXVGROSi9GSS9GZ1ZVYy9kVjhZcW81KzZyNHhXQW9qYTlIRjdncVpYU3NtNmFUK0tSK0xBcW81KzZyNHhWUno5MVh4aXNCUkcxNk9MM0JVeXVsWk4wMG44VWo4V0JWUno5MVh4aXFqbjdxdmpGWUNpTnIwY1h1Q3BsZEt5YnBwUDRwSDRzQ3FqbjdxdmpGVkhQM1ZmR0t3RkViWG80dmNGVEs2VmszVFNmeFNQeFlGVkhQM1ZmR0txT2Z1cStNVmdLSTJ2UnhlNEttVjBySnVtay9pa2ZqMGpLaGsrbzJ4L2dlSS93QlgvV3ZtNEhlWVg4MzZmNVB3ODkvZjN2dy9EOFY5ei84QVh6OC9QL1Y1dTJqTTA4U2FjSkt5V3lSMnloUFRDMWNDcGhUK2lvaTg2RWZhVVVZbDB6VGhGbXVjbWViandsMkxtNFVYQXY4QURDMVZhdjhBWlZBRDB6d1E3REo1MC9rYnZqQXZYdkhIdXd5ZWRQNUc3NHdMMTd4NDFJL1o4ZjRIZFZUS0tEKzJwSHhzUHJvYW9BS2lEcFlBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFESy9LSDAvbm52akRmWHYzSHV3eWg5UDU1NzR3MzE3OXg2M2VqbnMrQjhEZXFoelQwNDl0U3pqWW5YVUFQWk1YTmdBRk41MUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFCSC9LdSt3dkhmZ1Irc0RsWGZZWGp2d0kvV1dYditLTWs1VHRYbEQ5K2IrSlU1Y2orM2hBQnVRaSthUVpCT3FhVlBGZTVpdllIaitRVHFtbFR4WHVZcjJCVkRkRnhobC9IUmV1NDZNTGlHSmN6L0t5ZnNtQUJocHRBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQThmeTk5VTAxK0Y5ekNadnRJTXZmVk5OZmhmY3dtYjZmVjZ2aTlHNDUzVWhsTi9sRE1kSkw4cXp0WTRBU1dJSG13QUNtODZnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQWcvbFE5UDhVZHp3dlhqSnZVaHlvZW4rS081NFhyeGszclJiam1MRWkrQlBxcHo3M3oyUDg2OGF2MFFBTmxtaHc3REo1MC9rYnZqQXZYdkhIdXd5ZWRQNUc3NHdMMTd4NDFJL1o4ZjRIZFZUS0tEKzJwSHhzUHJvYW9BS2lEcFlBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFESy9LSDAvbm52akRmWHYzSHV3eWg5UDU1NzR3MzE3OXg2M2VqbnMrQjhEZXFoelQwNDl0U3pqWW5YVUFQWk1YTmdBRk41MUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFCSC9BQ3J2c0x4MzRFZnJBNVYzMkY0NzhDUDFsbDcvQUlveVRsTzFlVVAzNXY0bFRseVA3ZUVBRzVDTDVwQmtFNnBwVThWN21LOWdlUDVCT3FhVlBGZTVpdllGVU4wWEdHWDhkRjY3am93dUlZbHpQOHJKK3lZQUdHbTBBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBRHgvTDMxVFRYNFgzTUptKzBneTk5VTAxK0Y5ekNadnA5WHErTDBiam5kU0dVMytVTXgwa3Z5ck8xamdCSllnZWJBQUtienFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQ0QrVkQwL3dBVWR6d3ZYakp2VWh5b2VuK0tPNTRYcnhrM3JSYmptTEVpK0JQcXB6NzN6MlA4NjhhdjBRQU5sbWh3N0RKNTAva2J2akF2WHZISHV3eWVkUDVHNzR3TDE3eDQxSS9aOGY0SGRWVEtLRCsycEh4c1Byb2FvQUtpRHBZQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBREsvS0gwL25udmpEZlh2M0h1d3loOVA1NTc0dzMxNzl4NjNlam5zK0I4RGVxaHpUMDQ5dFN6alluWFVBUFpNWE5nQUZONTFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQkgvS3Urd3ZIZmdSK3NEbFhmWVhqdndJL1dXWHYrS01rNVR0WGxEOStiK0pVNWNqKzNoQUJ1UWkrYVFaQk9xYVZQRmU1aXZZSGorUVRxbWxUeFh1WXIyQlZEZEZ4aGwvSFJldTQ2TUxpR0pjei9LeWZzbUFCaHB0QUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUE4Znk5OVUwMStGOXpDWnZ0SU12ZlZOTmZoZmN3bWI2ZlY2dmk5RzQ1M1VobE4vbERNZEpMOHF6dFk0QVNXSUhtd0FDbTg2Z0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFnL2xROVA4VWR6d3ZYakp2VWh5b2VuK0tPNTRYcnhrM3JSYmptTEVpK0JQcXB6NzN6MlA4NjhhdjBRQU5sbWh3N0RKNTAva2J2akF2WHZISHV3eWVkUDVHNzR3TDE3eDQxSS9aOGY0SGRWVEtLRCsycEh4c1Byb2FvQUtpRHBZQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBREsvS0gwL25udmpEZlh2M0h1d3loOVA1NTc0dzMxNzl4NjNlam5zK0I4RGVxaHpUMDQ5dFN6alluWFVBUFpNWE5nQUZONTFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQkgvQUNydnNMeDM0RWZyQTVWMzJGNDc4Q1AxbGw3L0FJb3lUbE8xZVVQMzV2NGxUbHlQN2VFQUc1Q0w1cEJrRTZwcFU4VjdtSzlnZVA1Qk9xYVZQRmU1aXZZRlVOMFhHR1g4ZEY2N2pvd3VJWWx6UDhySit5WUFHR20wQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUR4L0wzMVRUWDRYM01KbSswZ3k5OVUwMStGOXpDWnZwOVhxK0wwYmpuZFNHVTMrVU14MGt2eXJPMWpnQkpZZ2ViQUFLYnpxQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUNEK1ZEMC93QVVkend2WGpKdlVoeW9lbitLTzU0WHJ4azNyUmJqbUxFaStCUHFwejczejJQODY4YXYwUUFObG1odzdESjUwL2tidmpBdlh2SEh1d3llZFA1Rzc0d0wxN3g0MUkvWjhmNEhkVlRLS0QrMnBIeHNQcm9hb0FLaURwWUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQURLL0tIMC9ubnZqRGZYdjNIdXd5aDlQNTU3NHczMTc5eDYzZWpucytCOERlcWh6VDA0OXRTempZblhVQVBaTVhOZ0FGTjUxQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUJIL0t1K3d2SGZnUitzRGxYZllYanZ3SS9XV1h2K0tNazVUdFhsRDkrYitKVTVjaiszaEFCdVFpK2FRWkJPcWFWUEZlNWl2WUhqK1FUcW1sVHhYdVlyMkJWRGRGeGhsL0hSZXU0Nk1MaUdKY3ovS3lmc21BQmhwdEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBOGZ5OTlVMDErRjl6Q1p2dElNdmZWTk5maGZjd21iNmZWNnZpOUc0NTNVaGxOL2xETWRKTDhxenRZNEFTV0lIbXdBQ204NmdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBZy9sUTlQOFVkend2WGpKdlVoeW9lbitLTzU0WHJ4azNyUmJqbUxFaStCUHFwejczejJQODY4YXYwUUFObG1odzdESjUwL2tidmpBdlh2SEh1d3llZFA1Rzc0d0wxN3g0MUkvWjhmNEhkVlRLS0QrMnBIeHNQcm9hb0FLaURwWUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQURLL0tIMC9ubnZqRGZYdjNIdXd5aDlQNTU3NHczMTc5eDYzZWpucytCOERlcWh6VDA0OXRTempZblhVQVBaTVhOZ0FGTjUxQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUJIL0FDcnZzTHgzNEVmckE1VjMyRjQ3OENQMWxsNy9BSW95VGxPMWVVUDM1djRsVGx5UDdlRUFHNUNMNXBCa0U2cHBVOFY3bUs5Z2VQNUJPcWFWUEZlNWl2WUZVTjBYR0dYOGRGNjdqb3d1SVlselA4ckoreVlBR0dtMEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFEeC9MMzFUVFg0WDNNSm0rMGd5OTlVMDErRjl6Q1p2cDlYcStMMGJqbmRTR1UzK1VNeDBrdnlyTzFqZ0JKWWdlYkFBS2J6cUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFDRCtWRDAvd0FVZHp3dlhqSnZVaHlvZW4rS081NFhyeGszclJiam1MRWkrQlBxcHo3M3oyUDg2OGF2MFFBTmxtaHcreEwyTnYwSEgrSThlZlQvQUZmMFdHUWNMK1Y4ZncvTitDL3VYM3cvRnpYZWJuK0htNSthN3pQamorTXBrN0kwTjBLSW1GcmtWRi9vdThwOVVobHNXVFIyU2lDdUI3RlJ5TDY4Q291RkYzOTcxL3hMQXJYWmhhMDRKV3V6QzFwd1VmalVOWCtpTmswa1h2a2xxNXQwcktXaGsvaEZnVnJzd3RhY0VyWFpoYTA0S1B3cS93QkViSnBJdmZGYzI2VmxMUXlmd2l3SzEyWVd0T0NWcnN3dGFjRkg0VmY2STJUU1JlK0s1dDByS1doay9oRmdWcnN3dGFjRXJYWmhhMDRLUHdxLzBSc21raTk4VnpicFdVdERKL0NMQXJYWmhhMDRKV3V6QzFwd1VmaFYvb2paTkpGNzRybTNTc3BhR1QrRVdCV3V6QzFwd1N0ZG1GclRnby9Dci9SR3lhU0wzeFhOdWxaUzBNbjhJc0N0ZG1GclRnbGE3TUxXbkJSK0ZYK2lOazBrWHZpdWJkS3lsb1pQNFJZRmE3TUxXbkJLMTJZV3RPQ2o4S3Y5RWJKcEl2ZkZjMjZWbExReWZ3aXdLMTJZV3RPQ1Zyc3d0YWNGSDRWZjZJMlRTUmUrSzV0MHJLV2hrL2hGZ1Zyc3d0YWNFclhaaGEwNEtQd3Evd0JFYkpwSXZmRmMyNlZsTFF5Zndpd0sxMllXdE9DVnJzd3RhY0ZINFZmNkkyVFNSZStLNXQwcktXaGsvaEZnVnJzd3RhY0VyWFpoYTA0S1B3cS8wUnNta2k5OFZ6YnBXVXRESi9DTEFyWFpoYTA0Sld1ekMxcHdVZmhWL29qWk5KRjc0cm0zU3NwYUdUK0VXQld1ekMxcHdTdGRtRnJUZ28vQ3IvUkd5YVNMM3hYTnVsWlMwTW44SSt4TU9OdjE3SCtQTWVmVC9TZlc0Wkd3djVYeC9GOHI0Nys3ZmZEOFhOYzUrYjR1Ym41cm5PK09EYjBtazdJTU5zS0dtQnJVUkUvb204aEdtWFMyTEtZNzVSR1hDOTZxNVY5V0ZWWENxNzI5Ni80QUIvWStVcEN0RFA4QTJSSi9sNCs5SzBNLzlrU2Y1ZVB2VTNqV200NVJpeE01bDFtK0t6MVA4cXhlZE5SU0ZhR2YreUpQOHZIM3BXaG4vc2lUL0x4OTZtOE54eWpGaVp6THJGWjZuK1ZZdk9tb3BDdERQL1pFbitYajcwclF6LzJSSi9sNCs5VGVHNDVSaXhNNWwxaXM5VC9Lc1huVFVVaFdobi9zaVQvTHg5NlZvWi83SWsveThmZXB2RGNjb3hZbWN5NnhXZXAvbFdMenBxS1FyUXovQU5rU2Y1ZVB2U3REUC9aRW4rWGo3MU40YmpsR0xFem1YV0t6MVA4QUtzWG5UVVVoV2huL0FMSWsvd0F2SDNwV2huL3NpVC9MeDk2bThOeHlqRmlaekxyRlo2bitWWXZPbW9wQ3REUC9BR1JKL2w0KzlLME0vd0RaRW4rWGo3MU40YmpsR0xFem1YV0t6MVA4cXhlZE5SU0ZhR2YreUpQOHZIM3BXaG4vQUxJay93QXZIM3FidzNIS01XSm5NdXNWbnFmNVZpODZhaWtLME0vOWtTZjVlUHZTdERQL0FHUkovbDQrOVRlRzQ1Uml4TTVsMWlzOVQvS3NYblRVVWhXaG4vc2lUL0x4OTZWb1ovN0lrL3k4ZmVwdkRjY294WW1jeTZ4V2VwL2xXTHpwcUtRclF6LzJSSi9sNCs5SzBNLzlrU2Y1ZVB2VTNodU9VWXNUT1pkWXJQVS95ckY1MDFGSVZvWi83SWsveThmZWxhR2YreUpQOHZIM3FidzNIS01XSm5NdXNWbnFmNVZpODZhaWtLME0vd0RaRW4rWGo3MHJRei8yUkovbDQrOVRlRzQ1Uml4TTVsMWlzOVQvQUNyRjUwMUZJVm9aL3dDeUpQOEFMeDk2Vm9aLzdJay95OGZlcHZEY2NveFltY3k2eFdlcC9sV0x6cHFQU01vT1ZESCtVbjlJL1hNRHhQZ24wWHpmbGZTUTcrOStMNC9nNS9pK0svdnVmL3J1YzNOemYxZWJnemlaNW1rczN5WnNra1RFWkNiaHdOVDFKaFZWWC8xVlUxTFNlbEU0VHpMbnpsT2tWWXNlSmcyVG5ldGNDSTFNUDlHb2lmMkFEMHp3VDJ5VWN2TTN5WEwyTDVheFhpMlc4SXdEQnZtZkx2OEFDSU1XK2lYZml2NzYvdTg5MjlpWExuODcrNy9UK1hNNlN0RFAvWkVuK1hqNzFONDE3TGJsTkhKVEdmS0k4a1k1NzFWeXFxTGhWVlhDcSt2ODFOMHpWZkZVM2tNbGh5S1NUbEVaQ2hOUnJXb3FZR3RhaUkxRTN2VWlJaUZJVm9aLzdJay95OGZlbGFHZit5SlA4dkgzcWJ4ODI0NVJpeE01bDFuMzFucWY1Vmk4NmFpa0swTS85a1NmNWVQdlN0RFAvWkVuK1hqNzFONGJqbEdMRXptWFdLejFQOHF4ZWROUlNGYUdmK3lKUDh2SDNwV2huL3NpVC9MeDk2bThOeHlqRmlaekxyRlo2bitWWXZPbW9wQ3REUDhBMlJKL2w0KzlLME0vOWtTZjVlUHZVM2h1T1VZc1RPWmRZclBVL3dBcXhlZE5SU0ZhR2Y4QXNpVC9BQzhmZWxhR2YreUpQOHZIM3FidzNIS01XSm5NdXNWbnFmNVZpODZhaWtLME0vOEFaRW4rWGo3MHJRei9BTmtTZjVlUHZVM2h1T1VZc1RPWmRZclBVL3lyRjUwMUZJVm9aLzdJay95OGZlbGFHZjhBc2lUL0FDOGZlcHZEY2NveFltY3k2eFdlcC9sV0x6cHFLUXJRei8yUkovbDQrOUswTS84QVpFbitYajcxTjRiamxHTEV6bVhXS3oxUDhxeGVkTlJTRmFHZit5SlA4dkgzcFdobi9zaVQvTHg5Nm04Tnh5akZpWnpMckZaNm4rVll2T21vcEN0RFAvWkVuK1hqNzByUXovMlJKL2w0KzlUZUc0NVJpeE01bDFpczlUL0tzWG5UVVVoV2huL3NpVC9MeDk2Vm9aLzdJay95OGZlcHZEY2NveFltY3k2eFdlcC9sV0x6cHFLUXJRei9BTmtTZjVlUHZTdERQL1pFbitYajcxTjRiamxHTEV6bVhXS3oxUDhBS3NYblRVVWhXaG4vQUxJay93QXZIM3BXaG4vc2lUL0x4OTZtOE54eWpGaVp6THJGWjZuK1ZZdk9tbzlzbTdMek44NlM5akNXc2FZdGx2QjhBd241ZnpML0FBZURGdllsejRiKzl2N25OZHZvbDI1L084dWYwL2x6dkV3WmZNRkdwQk5VRlpQTjBKSWJGWFpLaWVyQ3FJbUhtUk9ZMXBUS25jOFVobFRaYlBVb2RIaXRhalVjNzFvMUZWVVQrbUZ5ci9jQVBjTVNLUXJRei8yUkovbDQrOUswTS84QVpFbitYajcxTjQxcHVPVVlzVE9aZFp2aXM5VC9BQ3JGNTAxRklWb1ovd0N5SlA4QUx4OTZWb1ovN0lrL3k4ZmVwdkRjY294WW1jeTZ4V2VwL2xXTHpwcUtRclF6L3dCa1NmNWVQdlN0RFA4QTJSSi9sNCs5VGVHNDVSaXhNNWwxaXM5VC9Lc1huVFVVaFdobi9zaVQvTHg5NlZvWi93Q3lKUDhBTHg5Nm04Tnh5akZpWnpMckZaNm4rVll2T21vcEN0RFAvWkVuK1hqNzByUXovd0JrU2Y1ZVB2VTNodU9VWXNUT1pkWXJQVS95ckY1MDFGSVZvWi83SWsveThmZWxhR2YreUpQOHZIM3FidzNIS01XSm5NdXNWbnFmNVZpODZhaWtLME0vOWtTZjVlUHZTdERQL1pFbitYajcxTjRiamxHTEV6bVhXS3oxUDhxeGVkTlJTRmFHZit5SlA4dkgzcFdobi9zaVQvTHg5Nm04Tnh5akZpWnpMckZaNm4rVll2T21vcEN0RFA4QTJSSi9sNCs5SzBNLzlrU2Y1ZVB2VTNodU9VWXNUT1pkWXJQVS93QXF4ZWROUlNGYUdmOEFzaVQvQUM4ZmVsYUdmK3lKUDh2SDNxYnczSEtNV0puTXVzVm5xZjVWaTg2YWlrSzBNLzhBWkVuK1hqNzByUXovQU5rU2Y1ZVB2VTNodU9VWXNUT1pkWXJQVS95ckY1MDFGSVZvWi83SWsveThmZWxhR2Y4QXNpVC9BQzhmZXB2RGNjb3hZbWN5NnhXZXAvbFdMenBxS1FyUXovMlJKL2w0KzlLME0vOEFaRW4rWGo3MU40YmpsR0xFem1YV0t6MVA4cXhlZE5SU0ZhR2YreUpQOHZIM3BXaG4vc2lUL0x4OTZtOE54eWpGaVp6THJGWjZuK1ZZdk9tbzdhZko4eHhsRHh4ZzJPc2RZTmkzQmNLaFlOZTRMZTN1QzNsOWUzbDI4dVgxOWZYTHQyNWZYMTlkNStlL3UvMS8vSEVnejJiWnNnU09BMlN5VnFNaHNUQWlKNmtRMDlQMC9TeWRKWkVuQ2NJaXhJMFJjTG5MNjFYK0tnQjl4NUFCOUxFMks4SXg1ampGV0pjRXY0TVBDc013bUZnc0sraVhidHk4dmIrL3ZybDdjdTMxMjVjdTNlYm51M09mbXVYWDhvOFpzTml4SHJnYWlZVlgvd0NJZlJKWkxFanhXd1lLWVh1VkVSUDRxcTRFVCs2bnpSU0ZWNmYrMTVQOHhIM1JWZW4vQUxYay93QXhIM1RYTzdIUmkyczUxMUc4S3NOUDhsUmVaTlpONHBDcTlQOEEydkovbUkrNktyMC85cnlmNWlQdWpkam94YldjNjZoVmhwL2txTHpKckp2RklWWHAvd0MxNVA4QU1SOTBWWHAvN1hrL3pFZmRHN0hSaTJzNTExQ3JEVC9KVVhtVFdUZUtRcXZUL3dCcnlmNWlQdWlxOVA4QTJ2Si9tSSs2TjJPakZ0WnpycUZXR24rU292TW1zbThVaFZlbi90ZVQvTVI5MFZYcC93QzE1UDhBTVI5MGJzZEdMYXpuWFVLc05QOEFKVVhtVFdUZUtRcXZULzJ2Si9tSSs2S3IwLzhBYThuK1lqN28zWTZNVzFuT3VvVllhZjVLaTh5YXlieFNGVjZmKzE1UDh4SDNTYjJTMGRwak5jN2JQL2JZN1l1d3diTEIrV0hEZ3cvMXdMekdCMDJ1WVVnbzM1ci9BSDJTdmsvbmRsc05sZy81YkhCc3NHQlY5V3lURC9VQU1tTURBOXNsSElOTjg2UzlpK1pjVjR5bHZCOEF3bjVueTd6Q0kwVzlpWFBodjc2OHU4OXk5aDNibjg3eTcvWCtYTTZTcTlQL0FHdkovbUkrNmE5bHQxYWprbWpQazhlVnNhOWlxMVVWVndvcUxnVlBWK1NtNlpxdmRhYnk2U3c1YkpKdGlQaFJXbzVya1JNRG11UkZhcWIvQUtsUlVVbThVaFZlbi90ZVQvTVI5MFZYcC83WGsvekVmZFBtM1k2TVcxbk91bysrckRUL0FDVkY1azFrM2lrS3IwLzlyeWY1aVB1aXE5UC9BR3ZKL21JKzZOMk9qRnRaenJxRldHbitTb3ZNbXNtOFVoVmVuL3RlVC9NUjkwVlhwLzdYay96RWZkRzdIUmkyczUxMUNyRFQvSlVYbVRXVGVLUXF2VC8ydkovbUkrNktyMC85cnlmNWlQdWpkam94YldjNjZoVmhwL2txTHpKckp2RklWWHAvN1hrL3pFZmRGVjZmKzE1UDh4SDNSdXgwWXRyT2RkUXF3MC95VkY1azFrM2lrS3IwL3dEYThuK1lqN29xdlQvMnZKL21JKzZOMk9qRnRaenJxRldHbitTb3ZNbXNtOFVoVmVuL0FMWGsvd0F4SDNSVmVuL3RlVC9NUjkwYnNkR0xhem5YVUtzTlA4bFJlWk5aTjRwQ3E5UC9BR3ZKL21JKzZLcjAvd0RhOG4rWWo3bzNZNk1XMW5PdW9WWWFmNUtpOHlheWJ4U0ZWNmYrMTVQOHhIM1JWZW4vQUxYay93QXhIM1J1eDBZdHJPZGRRcXcwL3dBbFJlWk5aTjRwQ3E5UC9hOG4rWWo3b3F2VC93QnJ5ZjVpUHVqZGpveGJXYzY2aFZocC9rcUx6SnJKdkZJVlhwLzdYay96RWZkRlY2ZisxNVA4eEgzUnV4MFl0ck9kZFFxdzAveVZGNWsxazNpa0tyMC85cnlmNWlQdWlxOVAvYThuK1lqN28zWTZNVzFuT3VvVllhZjVLaTh5YXlieFNGVjZmKzE1UDh4SDNSVmVuL3RlVC9NUjkwYnNkR0xhem5YVUtzTlA4bFJlWk5aTjQ5c203SU5OOGx5OWpDWmNhWXlsdkNNQXdiNWZ6THpCNDBXK2lYZml2NzI4dWMxeStoM0xuODcrNS9YK1hPOFRaZk1GSlpCT3NGWlJOMFZJakVYWXFxZXJDaUl1RG1WT2MxcFRLZ2s4VWVsVFpGUFVuZEFpdWFqa2E3MXExVlZFWCttRnFwL1lBUGNNU0E5SXlmWkw4ZjVTZjFmOUR3ekUrQ2ZSZksrYjlYRXY3MzR2aitQbStINGJ5KzUvK3U3ejgvTi9SNlJWZW4vdGVUL01SOTB3ZWVMcFV3emZLWFNTV3lwcklyY0dGcTRjS1lVUlUvTCtDb3B0cWpOd2lsODh5Rms1VFhOOFNMQWlZZGk1cUpnWEFxdFhCdjhBNU9SVS9zVGVLUXF2VC8ydkovbUkrNktyMC84QWE4bitZajdwNW03SFJpMnM1MTFIdlZZYWY1S2k4eWF5YnhTRlY2ZisxNVA4eEgzUlZlbi9BTFhrL3dBeEgzUnV4MFl0ck9kZFFxdzAvd0FsUmVaTlpONHBDcTlQL2E4bitZajdvcXZUL3dCcnlmNWlQdWpkam94YldjNjZoVmhwL2txTHpKckp2RklWWHAvN1hrL3pFZmRGVjZmKzE1UDh4SDNSdXgwWXRyT2RkUXF3MC95VkY1azFrM2lrS3IwLzlyeWY1aVB1aXE5UC9hOG4rWWo3bzNZNk1XMW5PdW9WWWFmNUtpOHlheWJ4U0ZWNmYrMTVQOHhIM1JWZW4vdGVUL01SOTBic2RHTGF6blhVS3NOUDhsUmVaTlpONHBDcTlQOEEydkovbUkrNktyMC85cnlmNWlQdWpkam94YldjNjZoVmhwL2txTHpKckp2RklWWHAvd0MxNVA4QU1SOTBWWHAvN1hrL3pFZmRHN0hSaTJzNTExQ3JEVC9KVVhtVFdUZUtRcXZUL3dCcnlmNWlQdWlxOVA4QTJ2Si9tSSs2TjJPakZ0WnpycUZXR24rU292TW1zbThVaFZlbi90ZVQvTVI5MFZYcC93QzE1UDhBTVI5MGJzZEdMYXpuWFVLc05QOEFKVVhtVFdUZUtRcXZULzJ2Si9tSSs2S3IwLzhBYThuK1lqN28zWTZNVzFuT3VvVllhZjVLaTh5YXlieFNGVjZmKzE1UDh4SDNSVmVuL3RlVC9NUjkwYnNkR0xhem5YVUtzTlA4bFJlWk5aTjRwQ3E5UC9hOG4rWWo3b3F2VC8ydkovbUkrNk4yT2pGdFp6cnFGV0duK1Nvdk1tc204VWhWZW4vdGVUL01SOTBtOWt0SGFZelhPMnovQU50anRpN0RCc3NINVljT0REL1hBdk1ZSFRhNWhTQ2pmbXY5OWtyNVA1M1piRFpZUCtXeHdiTEJnVmZWc2t3LzFBREpqQXdPa2xHVjhZVHBNT0w1YXhYR3dQQjhQd241bnk3L0FBaSt2cjJIYytHOHZyKzd6M2IyNWR1L3l2THY5UDU4ejJ5cTlQOEEydkovbUkrNlloUDlQcG1tcU1rbm5HVU5odlZOa2lMNjhDcXFZZWRGNWpaZERiamxKNlF5VjB0bVdSUGp3bXVWcXVhaVlFY2lJcXA2L1hnY2kvM0p2RklWWHAvN1hrL3pFZmRGVjZmKzE1UDh4SDNUdzkyT2pGdFp6cnFNdHF3MC93QWxSZVpOWk40cENxOVAvYThuK1lqN29xdlQvd0JyeWY1aVB1amRqb3hiV2M2NmhWaHAva3FMekpySnZGSVZYcC83WGsvekVmZEZWNmYrMTVQOHhIM1J1eDBZdHJPZGRRcXcwL3lWRjVrMWszaWtLcjAvOXJ5ZjVpUHVpcTlQL2E4bitZajdvM1k2TVcxbk91b1ZZYWY1S2k4eWF5YnhTRlY2ZisxNVA4eEgzUlZlbi90ZVQvTVI5MGJzZEdMYXpuWFVLc05QOGxSZVpOWk40cENxOVA4QTJ2Si9tSSs2S3IwLzlyeWY1aVB1amRqb3hiV2M2NmhWaHAva3FMekpySnZGSVZYcC93QzE1UDhBTVI5MFZYcC83WGsvekVmZEc3SFJpMnM1MTFDckRUL0pVWG1UV1RlS1FxdlQvd0JyeWY1aVB1aXE5UDhBMnZKL21JKzZOMk9qRnRaenJxRldHbitTb3ZNbXNtOFVoVmVuL3RlVC9NUjkwVlhwL3dDMTVQOEFNUjkwYnNkR0xhem5YVUtzTlA4QUpVWG1UV1RlS1FxdlQvMnZKL21JKzZLcjAvOEFhOG4rWWo3bzNZNk1XMW5PdW9WWWFmNUtpOHlheWJ4U0ZWNmYrMTVQOHhIM1JWZW4vdGVUL01SOTBic2RHTGF6blhVS3NOUDhsUmVaTlpONHBDcTlQL2E4bitZajdvcXZULzJ2Si9tSSs2TjJPakZ0WnpycUZXR24rU292TW1zbThVaFZlbi90ZVQvTVI5MFZYcC83WGsvekVmZEc3SFJpMnM1MTFDckRUL0pVWG1UV1RlS1FxdlQvQU5yeWY1aVB1bmtzK1NIampKNWpqQnNTNDZ3bkZ1RllWRndhOXdxOXZzRnY3Nit2TGw1ZHZyNjl1WEx0Mit2YjI3ejg5NWQvcC84QWoxNWp1aVRKT1VmL0FFc2dsTFlrUlVWY0NldkFuci9JeHFsbHhLbGN4U05ad25lUXZnd1VWRTJUa1RCaFgxSjYvd0F6aVFHYUdyQVBTTW4yUy9IK1VuOVgvUThNeFBnbjBYeXZtL1Z4TCs5K0w0L2o1dmgrRzh2dWYvcnU4L1B6ZjBla1ZYcC83WGsvekVmZE1Ibmk2Vk1NM3lsMGtsc3FheUszQmhhdUhDbUZFVlB5L2dxS2Jhb3pjSXBmUE1oWk9VMXpmRWl3SW1IWXVhaVlGd0tyVndiL0FPVGtWUDdFM2lrS3IwLzlyeWY1aVB1aXE5UC9BR3ZKL21JKzZlWnV4MFl0ck9kZFI3MVdHbitTb3ZNbXNtOFVoVmVuL3RlVC9NUjkwVlhwL3dDMTVQOEFNUjkwYnNkR0xhem5YVUtzTlA4QUpVWG1UV1RlS1FxdlQvMnZKL21JKzZLcjAvOEFhOG4rWWo3bzNZNk1XMW5PdW9WWWFmNUtpOHlheWJ4U0ZWNmYrMTVQOHhIM1JWZW4vdGVUL01SOTBic2RHTGF6blhVS3NOUDhsUmVaTlpONHBDcTlQL2E4bitZajdvcXZULzJ2Si9tSSs2TjJPakZ0WnpycUZXR24rU292TW1zbThkdFBraDQ0eWVZNHdiRXVPc0p4YmhXRlJjR3ZjS3ZiN0JiKyt2cnk1ZVhiNit2Ymx5N2R2cjI5dTgvUGVYZjZmL2ppV2V6Yk9jQ1dRR3lxU3VSOE42WVVWUFVxR25wK21HV1RYTElrM3poRFdIR2hyZ2MxZldpL3dVQVB1UElEc01ublQrUnUrTUM5ZThjZTdESjUwL2tidmpBdlh2SGpVajlueC9nZDFWTW9vUDdha2ZHdyt1aHFnQXFJT2xnQUFBQUFBQUFBQUFBeC9iQU1mMHlMMHIzaHlYM1NyL3lrWHViOVQ5Z0FKa0ZYNXBCa0U2cHBVOFY3bUs5Z2VQNUJPcWFWUEZlNWl2WUZVTjBYR0dYOGRGNjdqb3d1SVlselA4ckoreVlBR0dtMEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFEeC9MMzFUVFg0WDNNSm0rMGd5OTlVMDErRjl6Q1p2cDlYcStMMGJqbmRTR1UzK1VNeDBrdnlyTzFqZ0JKWWdlV0J5VWZ2M3dQNTFnSS81S1AzNzRIODZ3RmFkOEJqZEsrVDdKaGZCZVpmaHJOdkxmdUlvQWFiSlFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQmorMkFZL3BrWHBYdkRrdnVsWC9BSlNMM04rcCt3QUV5Q3I4OWd5Q2RiTXFlSzl0RmFRTTM4Z25XektuaXZiUldrQ0F0OVJqREI0bHZYaUZ5SGs4OFM1VjgwL3NvQUFScEo0QUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUJCL0toNmY0bzduaGV2R1hnZy9sUTlQOEFGSGM4TDE0emZ0N1hqT3o0SC9SQ0c5L2JpQkU0MkY5Vkp2QVdKbEk1WUhKUisvZkEvbldBai9rby9mdmdmenJBVnAzd0dOMHI1UHNtRjhGNWwrR3MyOHQrNGlnQnBzbEFBQUFBQUFBQUFFSDhxSHAvaWp1ZUY2OFpONmtPVkQwL3hSM1BDOWVNbTlhTGNjeFlrWHdKOVZPZmUrZXgvblhqVitpQUJzczBPSFlaUE9uOGpkOFlGNjk0NDkyR1R6cC9JM2ZHQmV2ZVBHcEg3UGovQUFPNnFtVVVIOXRTUGpZZlhRMVFBVkVIU3dBQUFBQUFBQUFBQUFZL3RnR1A2WkY2Vjd3NUw3cFYvd0NVaTl6ZnFmc0FCTWdxL05JTWduVk5Lbml2Y3hYc0R4L0lKMVRTcDRyM01WN0FxaHVpNHd5L2pvdlhjZEdGeERFdVovbFpQMlRBQXcwMmdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBZVA1ZStxYWEvQys1aE0zMmtHWHZxbW12d3Z1WVROOVBxOVh4ZWpjYzdxUXltL3lobU9rbCtWWjJzY0FKTEVEeXdPU2o5KytCL09zQkgvSlIrL2ZBL25XQXJUdmdNYnBYeWZaTUw0THpMOE5adDViOXhGQURUWktBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU1mMndESDlNaTlLOTRjbDkwcS84cEY3bS9VL1lBQ1pCVitld1pCT3RtVlBGZTJpdElHYitRVHJabFR4WHRvclNCQVcrb3hoZzhTM3J4QzVEeWVlSmNxK2FmMlVBQUkwazhBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQWcvbFE5UDhVZHp3dlhqTHdRZnlvZW4rS081NFhyeG0vYjJ2R2Rud1AraUVONyszRUNKeHNMNnFUZUFzVEtSeXdPU2o5KytCL09zQkgvQUNVZnYzd1A1MWdLMDc0REc2VjhuMlRDK0M4eS9EV2JlVy9jUlFBMDJTZ0FBQUFBQUFBQUNEK1ZEMC94UjNQQzllTW05U0hLaDZmNG83bmhldkdUZXRGdU9Zc1NMNEUrcW5QdmZQWS96cnhxL1JBQTJXYUhEc01ublQrUnUrTUM5ZThjZTdESjUwL2tidmpBdlh2SGpVajlueC9nZDFWTW9vUDdha2ZHdyt1aHFnQXFJT2xnQUFBQUFBQUFBQUFBeC9iQU1mMHlMMHIzaHlYM1NyL3lrWHViOVQ5Z0FKa0ZYNXBCa0U2cHBVOFY3bUs5Z2VQNUJPcWFWUEZlNWl2WUZVTjBYR0dYOGRGNjdqb3d1SVlselA4QUt5ZnNtQUJocHRBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQThmeTk5VTAxK0Y5ekNadnRJTXZmVk5OZmhmY3dtYjZmVjZ2aTlHNDUzVWhsTi9sRE1kSkw4cXp0WTRBU1dJSGxnY2xINzk4RCtkWUNQK1NqOSsrQi9Pc0JXbmZBWTNTdmsreVlYd1htWDRhemJ5MzdpS0FHbXlVQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFZL3RnR1A2WkY2Vjd3NUw3cFYvNVNMM04rcCt3QUV5Q3I4OWd5Q2RiTXFlSzl0RmFRTTM4Z25XektuaXZiUldrQ0F0OVJqREI0bHZYaUZ5SGs4OFM1VjgwL3NvQUFScEo0QUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUJCL0toNmY0bzduaGV2R1hnZy9sUTlQOFVkend2WGpOKzN0ZU03UGdmOUVJYjM5dUlFVGpZWDFVbThCWW1VamxnY2xINzk4RCtkWUNQK1NqOSsrQi9Pc0JXbmZBWTNTdmsreVlYd1htWDRhemJ5MzdpS0FHbXlVQUFBQUFBQUFBQVFmeW9lbitLTzU0WHJ4azNxUTVVUFQvQUJSM1BDOWVNbTlhTGNjeFlrWHdKOVZPZmUrZXgvblhqVitpQUJzczBPSFlaUE9uOGpkOFlGNjk0NDkyR1R6cC9JM2ZHQmV2ZVBHcEg3UGovQTdxcVpSUWYyMUkrTmg5ZERWQUJVUWRMQUFBQUFBQUFBQUFBQmorMkFZL3BrWHBYdkRrdnVsWC9sSXZjMzZuN0FBVElLdnpTRElKMVRTcDRyM01WN0E4ZnlDZFUwcWVLOXpGZXdLb2JvdU1NdjQ2TDEzSFJoY1F4TG1mNVdUOWt3QU1OTm9BQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBSGorWHZxbW12d3Z1WVROOXBCbDc2cHByOEw3bUV6ZlQ2dlY4WG8zSE82a01wdjhvWmpwSmZsV2RySEFDU3hBOHNEa28vZnZnZnpyQVIvd0FsSDc5OEQrZFlDdE8rQXh1bGZKOWt3dmd2TXZ3MW0zbHYzRVVBTk5rb0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBeC9iQU1mMHlMMHIzaHlYM1NyL0FNcEY3bS9VL1lBQ1pCVitld1pCT3RtVlBGZTJpdElHYitRVHJabFR4WHRvclNCQVcrb3hoZzhTM3J4QzVEeWVlSmNxK2FmMlVBQUkwazhBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQWcvbFE5UDhBRkhjOEwxNHk4RUg4cUhwL2lqdWVGNjhadjI5cnhuWjhEL29oRGUvdHhBaWNiQytxazNnTEV5a2NzRGtvL2Z2Z2Z6ckFSL3lVZnYzd1A1MWdLMDc0REc2VjhuMlRDK0M4eS9EV2JlVy9jUlFBMDJTZ0FBQUFBQUFBQUNEK1ZEMC94UjNQQzllTW05U0hLaDZmNG83bmhldkdUZXRGdU9Zc1NMNEUrcW5QdmZQWS93QTY4YXYwUUFObG1odzdESjUwL2tidmpBdlh2SEh1d3llZFA1Rzc0d0wxN3g0MUkvWjhmNEhkVlRLS0QrMnBIeHNQcm9hb0FLaURwWUFBQUFBQUFBQUFBQU1mMndESDlNaTlLOTRjbDkwcS93REtSZTV2MVAyQUFtUVZmbWtHUVRxbWxUeFh1WXIyQjQva0U2cHBVOFY3bUs5Z1ZRM1JjWVpmeDBYcnVPakM0aGlYTS95c243SmdBWWFiUUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFQSDh2ZlZOTmZoZmN3bWI3U0RMMzFUVFg0WDNNSm0rbjFlcjR2UnVPZDFJWlRmNVF6SFNTL0tzN1dPQUVsaUI1WUhKUisvZkEvbldBai9rby9mdmdmenJBVnAzd0dOMHI1UHNtRjhGNWwrR3MyOHQrNGlnQnBzbEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBR1A3WUJqK21SZWxlOE9TKzZWZitVaTl6ZnFmc0FCTWdxL1BZTWduV3pLbml2YlJXa0ROL0lKMXN5cDRyMjBWcEFnTGZVWXd3ZUpiMTRoY2g1UFBFdVZmTlA3S0FBRWFTZUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBUWZ5b2VuK0tPNTRYcnhsNElQNVVQVC9GSGM4TDE0emZ0N1hqT3o0SC9BRVFodmYyNGdST05oZlZTYndGaVpTT1dCeVVmdjN3UDUxZ0kvd0NTajkrK0IvT3NCV25mQVkzU3ZrK3lZWHdYbVg0YXpieTM3aUtBR215VUFBQUFBQUFBQUFRZnlvZW4rS081NFhyeGszcVE1VVBUL0ZIYzhMMTR5YjFvdHh6RmlSZkFuMVU1OTc1N0grZGVOWDZJQUd5elE0ZGhrODZmeU4zeGdYcjNqajNZWlBPbjhqZDhZRjY5NDhha2ZzK1A4RHVxcGxGQi9iVWo0MkgxME5VQUZSQjBzQUFBQUFBQUFBQUFBR1A3WUJqK21SZWxlOE9TKzZWZitVaTl6ZnFmc0FCTWdxL05JTWduVk5Lbml2Y3hYc0R4L0lKMVRTcDRyM01WN0FxaHVpNHd5L2pvdlhjZEdGeERFdVovbFpQMlRBQXcwMmdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBZVA1ZStxYWEvQys1aE0zMmtHWHZxbW12d3Z1WVROOVBxOVh4ZWpjYzdxUXltL3dBb1pqcEpmbFdkckhBQ1N4QThzRGtvL2Z2Z2Z6ckFSL3lVZnYzd1A1MWdLMDc0REc2VjhuMlRDK0M4eS9EV2JlVy9jUlFBMDJTZ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFESDlzQXgvVEl2U3ZlSEpmZEt2L0FDa1h1YjlUOWdBSmtGWDU3QmtFNjJaVThWN2FLMGdadjVCT3RtVlBGZTJpdElFQmI2akdHRHhMZXZFTGtQSjU0bHlyNXAvWlFBQWpTVHdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQ0QrVkQwL3hSM1BDOWVNdkJCL0toNmY0bzduaGV2R2I5dmE4WjJmQS82SVEzdjdjUUluR3d2cXBONEN4TXBITEE1S1AzNzRIODZ3RWY4bEg3OThEK2RZQ3RPK0F4dWxmSjlrd3Zndk12dzFtM2x2M0VVQU5Oa29BQUFBQUFBQUFBZy9sUTlQOEFGSGM4TDE0eWIxSWNxSHAvaWp1ZUY2OFpONjBXNDVpeEl2Z1Q2cWMrOTg5ai9PdkdyOUVBRFpab2NQc1M5amI5QngvaVBIbjAvd0JYOUZoa0hDL2xmSDhQemZndjdsOThQeGMxM201L2g1dWZtdTh6NDQvaktaT3lORGRDaUpoYTVGUmY2THZLZlZJWmJGazBka29ncmdleFVjaSt2QXFMaFJkL2U5ZjhTd0sxMllXdE9DVnJzd3RhY0ZINDFEVi9valpOSkY3NUphdWJkS3lsb1pQNFJZRmE3TUxXbkJLMTJZV3RPQ2o4S3Y4QVJHeWFTTDN4WE51bFpTME1uOElzQ3RkbUZyVGdsYTdNTFduQlIrRlgraU5rMGtYdml1YmRLeWxvWlA0UllGYTdNTFduQksxMllXdE9DajhLdjlFYkpwSXZmRmMyNlZsTFF5Zndpd0sxMllXdE9DVnJzd3RhY0ZINFZmNkkyVFNSZStLNXQwcktXaGsvaEZnVnJzd3RhY0VyWFpoYTA0S1B3cS8wUnNta2k5OFZ6YnBXVXRESi9DTEFyWFpoYTA0S1B3WmxSSzUvTkV4ZWMvMnFENXZ6bURaZjhuT3c3SERnL3dDemx3WU1LK3JCNjk4MWZkSnV6MGxwZDVuYkZLZlArWTJXdy80UTJZTm5zZGwvMFkzRGgyTGZYaHdZTjdCaFVBTXlOWGxJU0R5Zy93Q0I1VHhUSy84QUNQNnA5TDgzL2Y4QXIvbC9IOGNXK3Y4QS9qOHUrNXViNCtiK2Y5SFlWcnN3dGFjRkg0MVBPTncraThybEVTVlNpUzdLSkVjcm5MczRpWVZjdUZWd0k5RVRDcS9rbUFrWk1kOW5kQm0yUlFadWtVNGJDREJZMWpFODFBWEExaUkxcVlWaHFxNEVSRXdxcXF2NXFxbGdWcnN3dGFjRXJYWmhhMDRLUHg4ZFgraU5rMGtYdm5xVnpicFdVdERKL0NMQXJYWmhhMDRKV3V6QzFwd1VmaFYvb2paTkpGNzRybTNTc3BhR1QrRVdCV3V6QzFwd1N0ZG1GclRnby9Dci9SR3lhU0wzeFhOdWxaUzBNbjhJc0N0ZG1GclRnbGE3TUxXbkJSK0ZYK2lOazBrWHZpdWJkS3lsb1pQNFJZRmE3TUxXbkJLMTJZV3RPQ2o4S3Y4QVJHeWFTTDN4WE51bFpTME1uOElzQ3RkbUZyVGdsYTdNTFduQlIrRlgraU5rMGtYdml1YmRLeWxvWlA0UllGYTdNTFduQksxMllXdE9DajhLdjlFYkpwSXZmRmMyNlZsTFF5Zndpd0sxMllXdE9DVnJzd3RhY0ZINFZmNkkyVFNSZStLNXQwcktXaGsvaEZnVnJzd3RhY0VyWFpoYTA0S1B3cS8wUnNta2k5OFZ6YnBXVXRESi9DTEFyWFpoYTA0Sld1ekMxcHdVZmhWL29qWk5KRjc0cm0zU3NwYUdUK0VXQld1ekMxcHdTdGRtRnJUZ28vQ3IvUkd5YVNMM3hYTnVsWlMwTW44SXNDdGRtRnJUZ2xhN01MV25CUitGWCtpTmswa1h2aXViZEt5bG9aUDRSWUZhN01MV25CSzEyWVd0T0NqOEt2OEFSR3lhU0wzeFhOdWxaUzBNbjhJcENmdVVIL0hFcDQybGYrRWYwdjZyNVgrLzlmOEFNK0Q0SXQ3Zi93REg1ZDd6OC93YzM4LzZwdkJuMUZhSHpkTWtuZEpac2grYmh1Y3JsVEM1MitxSW1IQzVWWDFJbjU0RFRkME82YlBsSzVhMmNaL2orZWpNWWpFWFlzWmdhaXVjaVlHTmFucmM1Y09ERHY4QXJ3SWdBWk1ZR2V3WktNcTlHSDYvL3dDQS9YUHJ2a2YrMThuNVh5L2ovd0RpKzUrZjVuOXVibS91OWdyWFpoYTA0S1B4clNrRngrams2eXg4dmw4bjJjVitEQ3V6aUpod0lqVTNtdVJQVWlKdkliNG9aZk5VM285TnNLWjVubDNtcE5DMld4YjVxQzdCc25LNWQ5ME56bHd1Y3E3NnI2OENieFlGYTdNTFduQksxMllXdE9DajhlTlYvb2paTkpGNzVsRmMyNlZsTFF5Zndpd0sxMllXdE9DVnJzd3RhY0ZINFZmNkkyVFNSZStLNXQwcktXaGsvaEZnVnJzd3RhY0VyWFpoYTA0S1B3cS8wUnNta2k5OFZ6YnBXVXRESi9DTEFyWFpoYTA0Sld1ekMxcHdVZmhWL29qWk5KRjc0cm0zU3NwYUdUK0VXQld1ekMxcHdTdGRtRnJUZ28vQ3IvUkd5YVNMM3hYTnVsWlMwTW44SXNDdGRtRnJUZ2xhN01MV25CUitGWCtpTmswa1h2aXViZEt5bG9aUDRSWUZhN01MV25CSzEyWVd0T0NqOEt2OUViSnBJdmZGYzI2VmxMUXlmd2l3SzEyWVd0T0NWcnN3dGFjRkg0VmY2STJUU1JlK0s1dDByS1doay9oRmdWcnN3dGFjRXJYWmhhMDRLUHdxL3dCRWJKcEl2ZkZjMjZWbExReWZ3aXdLMTJZV3RPQ1Zyc3d0YWNGSDRWZjZJMlRTUmUrSzV0MHJLV2hrL2hGZ1Zyc3d0YWNFclhaaGEwNEtQd3EvMFJzbWtpOThWemJwV1V0REovQ0xBclhaaGEwNEpXdXpDMXB3VWZoVi9valpOSkY3NHJtM1NzcGFHVCtFV0JXdXpDMXB3U3RkbUZyVGdvL0NyL1JHeWFTTDN4WE51bFpTME1uOElzQ3RkbUZyVGdvL0JtVkVybjgwVEY1ei9hb1BtL09ZTmwveWM3RHNjT0QvQUxPWEJnd3I2c0hyM3pWOTBtN1BTV2wzbWRzVXA4LzVqWmJEL2hEWmcyZXgyWC9SamNPSFl0OWVIQmczc0dGUUF6STFlZGhJTTJmd1BObUtabytnL1ZQcGZtLzdIemZsL0g4Y0srdlArWE5mYzNOOGZQOEF5L29wQ3RkbUZyVGdvL0dBVXF1WHpGUGNvYktwemdlY2lOYWpVWFpQYnZJcXJnd05jaWV0Vi9MQ2JrdWVYd0ZMcUtTSjAzVEJLL013WHZWNnA1dUUvQzVVYTFWd3ZZNWZVMXFZTU9EZTlXRlZMQXJYWmhhMDRKV3V6QzFwd1VmakdxdjlFYkpwSXZmTThybTNTc3BhR1QrRVdCV3V6QzFwd1N0ZG1GclRnby9Dci9SR3lhU0wzeFhOdWxaUzBNbjhJc0N0ZG1GclRnbGE3TUxXbkJSK0ZYK2lOazBrWHZpdWJkS3lsb1pQNFJZRmE3TUxXbkJLMTJZV3RPQ2o4S3Y5RWJKcEl2ZkZjMjZWbExReWZ3aXdLMTJZV3RPQ1Zyc3d0YWNGSDRWZjZJMlRTUmUrSzV0MHJLV2hrL2hGZ1Zyc3d0YWNFclhaaGEwNEtQd3Evd0JFYkpwSXZmRmMyNlZsTFF5Zndpd0sxMllXdE9DVnJzd3RhY0ZINFZmNkkyVFNSZStLNXQwcktXaGsvaEZnVnJzd3RhY0VyWFpoYTA0S1B3cS8wUnNta2k5OFZ6YnBXVXRESi9DTEFyWFpoYTA0Sld1ekMxcHdVZmhWL29qWk5KRjc0cm0zU3NwYUdUK0VXQld1ekMxcHdTdGRtRnJUZ28vQ3IvUkd5YVNMM3hYTnVsWlMwTW44SXNDdGRtRnJUZ2xhN01MV25CUitGWCtpTmswa1h2aXViZEt5bG9aUDRSWUZhN01MV25CSzEyWVd0T0NqOEt2OUViSnBJdmZGYzI2VmxMUXlmd2l3SzEyWVd0T0NWcnN3dGFjRkg0VmY2STJUU1JlK0s1dDByS1doay9oRmdWcnN3dGFjRjRQbFF5ZzBrNC93UEhuNlIraS9Ld084d1Q1WDFIenZpNXIrL3Z2aStMNGIzbS83T2JtNXY2UE54NzlHcms5SDVubFNTMmJwUHNJcUlxWWRtOWQ1Zlh2T2NxZitHRzA3dmphWjBtbTlacm51V2VkZ0txTzJQbTRUZDlQVXVGa05ydDcrb0FiRk5JbnNHU2pLdlJoK3YvOEFnUDF6Njc1SC90ZkorVjh2NC84QTR2dWZuK1ovYm01djd2WUsxMllXdE9DajhhMHBCY2ZvNU9zc2ZMNWZKOW5GZmd3cnM0aVljQ0kxTjVya1QxSWlieUcrS0dYelZONlBUYkNtZVo1ZDVxVFF0bHNXK2FndXdiSnl1WGZkRGM1Y0xuS3UrcSt2QW04V0JXdXpDMXB3U3RkbUZyVGdvL0hqVmY2STJUU1JlK1pSWE51bFpTME1uOElzQ3RkbUZyVGdsYTdNTFduQlIrRlgraU5rMGtYdml1YmRLeWxvWlA0UllGYTdNTFduQksxMllXdE9DajhLdjlFYkpwSXZmRmMyNlZsTFF5Zndpd0sxMllXdE9DVnJzd3RhY0ZINFZmNkkyVFNSZStLNXQwcktXaGsvaEZnVnJzd3RhY0VyWFpoYTA0S1B3cS8wUnNta2k5OFZ6YnBXVXRESi9DUFNNcUdVR2tuSCtCNDgvU1AwWDVXQjNtQ2ZLK28rZDhYTmYzOTk4WHhmRGU4My9aemMzTi9SNXVEYU16VFBKcHZrckpGSkc3R0V4TURVd3F1QlA2cXFyenFSOXBSU2VYVHpPRVdkSnlmNXlQRlhaT2RnUk1LL3h3TlJHcC9aRUFEMHp3UUQrekYyQVlYalhHR0E0cndDRjlSaCtFeHJ6QjRFUDRybDc4Y1MrdnJsN2UzT2U3ZHVYTG5QZHUzUDlidDNtZmlKRWF4cXZldUJFMzFWZlVpSDlZRUI4VjZRb1NLNXpsd0lpYjZxcStwRVQ4MVUvakhzRkFtVm15bjc3QnQ0VUNaV2JLZnZzRzNqRU4wV2oxdmc5S3p2R3k5eENtbVI1Vi9qeGU0ZVBqMkNnVEt6WlQ5OWcyOEtCTXJObFAzMkRidzNSYVBXK0Qwck84TnhDbW1SNVYvanhlNGVQajJDZ1RLelpUOTlnMjhLQk1yTmxQMzJEYnczUmFQVytEMHJPOE54Q21tUjVWL2p4ZTRlUGoyQ2dUS3paVDk5ZzI4S0JNck5sUDMyRGJ3M1JhUFcrRDByTzhOeENtbVI1Vi9qeGU0ZVBqMkNnVEt6WlQ5OWcyOEtCTXJObFAzMkRidzNSYVBXK0Qwck84TnhDbW1SNVYvanhlNGVQajJDZ1RLelpUOTlnMjhLQk1yTmxQMzJEYnczUmFQVytEMHJPOE54Q21tUjVWL2p4ZTRlUGoyQ2dUS3paVDk5ZzI4S0JNck5sUDMyRGJ3M1JhUFcrRDByTzhOeENtbVI1Vi9qeGU0ZVBqMkNnVEt6WlQ5OWcyOEtCTXJObFAzMkRidzNSYVBXK0Qwck84TnhDbW1SNVYvanhlNGVQajJDZ1RLelpUOTlnMjhLQk1yTmxQMzJEYnczUmFQVytEMHJPOE54Q21tUjVWL2p4ZTRlUGoyQ2dUS3paVDk5ZzI4S0JNck5sUDMyRGJ3M1JhUFcrRDByTzhOeENtbVI1Vi9qeGU0ZVBqMkNnVEt6WlQ5OWcyOEtCTXJObFAzMkRidzNSYVBXK0Qwck84TnhDbW1SNVYvanhlNGVQajJDZ1RLelpUOTlnMjhLQk1yTmxQMzJEYnczUmFQVytEMHJPOE54Q21tUjVWL2p4ZTRlUGoyQ2dUS3paVDk5ZzI4S0JNck5sUDMyRGJ3M1JhUFcrRDByTzhOeENtbVI1Vi9qeGU0ZVBqMkNnVEt6WlQ5OWcyOEtCTXJObFAzMkRidzNSYVBXK0Qwck84TnhDbW1SNVYvanhlNGVQait6R09BWVhpckdHSFlydytGOVBoK0RSci9CNDhQNHJsOThFUzl2cnQ3ZlhPZTVkdTNMdk5kdVhmOEFXNWQ1bjhiTDRjUnIybzlpNFVYZlJVOVNvYTBqd0h3bnJDaW9yWE5WVVZGM2xSVTlhS241S241Z0IreitRRklWWHAvN1hrL3pFZmRGVjZmKzE1UDh4SDNUV203SFJpMnM1MTFHK0tzTlA4bFJlWk5aTjRwQ3E5UC9BR3ZKL21JKzZLcjAvd0RhOG4rWWo3bzNZNk1XMW5PdW9WWWFmNUtpOHlheWJ4U0ZWNmYrMTVQOHhIM1JWZW4vQUxYay93QXhIM1J1eDBZdHJPZGRRcXcwL3dBbFJlWk5aTjRwQ3E5UC9hOG4rWWo3b3F2VC93QnJ5ZjVpUHVqZGpveGJXYzY2aFZocC9rcUx6SnJKdkZJVlhwLzdYay96RWZkRlY2ZisxNVA4eEgzUnV4MFl0ck9kZFFxdzAveVZGNWsxazNpa0tyMC85cnlmNWlQdWlxOVAvYThuK1lqN28zWTZNVzFuT3VvVllhZjVLaTh5YXlieFNGVjZmKzE1UDh4SDNSVmVuL3RlVC9NUjkwYnNkR0xhem5YVUtzTlA4bFJlWk5aTjRwQ3E5UDhBMnZKL21JKzZLcjAvOXJ5ZjVpUHVqZGpveGJXYzY2aFZocC9rcUx6SnJKdkZJVlhwL3dDMTVQOEFNUjkwVlhwLzdYay96RWZkRzdIUmkyczUxMUNyRFQvSlVYbVRXVGVLUXF2VC93QnJ5ZjVpUHVpcTlQOEEydkovbUkrNk4yT2pGdFp6cnFGV0duK1Nvdk1tc204VWhWZW4vdGVUL01SOTBWWHAvd0MxNVA4QU1SOTBic2RHTGF6blhVS3NOUDhBSlVYbVRXVGVLUXF2VC8ydkovbUkrNktyMC84QWE4bitZajdvM1k2TVcxbk91b1ZZYWY1S2k4eWF5YnhTRlY2ZisxNVA4eEgzUlZlbi90ZVQvTVI5MGJzZEdMYXpuWFVLc05QOGxSZVpOWk40cENxOVAvYThuK1lqN29xdlQvMnZKL21JKzZOMk9qRnRaenJxRldHbitTb3ZNbXNtOGVrWlFjbCtQOG0zNlIrdVlaaWZDL3JmbS9LK2tpWDk5OFB3ZkJ6L0FCZkZlWHZOL3dCbHptNXVmK3J6ZG5Fenp6Slp3a3paWElubytFN0RnY25xWEFxb3YvcUtocVdrOUY1d21hWFBtMmRJU3dvOFBCc211OWFZVVJ5WWY2dFZGL3VBSHBuZ2dlMlNqa0dtK2RKZXhmTXVLOFpTM2crQVlUOHo1ZDVoRWFMZXhMbnczOTllWGVlNWV3N3R6K2Q1ZC9yL0FDNW5TVlhwL3dDMTVQOEFNUjkwMTdMYnExSEpOR2ZKNDhyWTE3RlZxb3FyaFJVWEFxZXI4bE4welZlNjAzbDBsaHkyU1RiRWZDaXRSelhJaVlITmNpSzFVMy9VcUtpazNpa0tyMC85cnlmNWlQdWlxOVAvQUd2Si9tSSs2Zk51eDBZdHJPZGRSOTlXR24rU292TW1zbThVaFZlbi90ZVQvTVI5MFZYcC93QzE1UDhBTVI5MGJzZEdMYXpuWFVLc05QOEFKVVhtVFdUZUtRcXZULzJ2Si9tSSs2S3IwLzhBYThuK1lqN28zWTZNVzFuT3VvVllhZjVLaTh5YXlieFNGVjZmKzE1UDh4SDNSVmVuL3RlVC9NUjkwYnNkR0xhem5YVUtzTlA4bFJlWk5aTjRwQ3E5UC9hOG4rWWo3b3F2VC8ydkovbUkrNk4yT2pGdFp6cnFGV0duK1Nvdk1tc204VWhWZW4vdGVUL01SOTBWWHAvN1hrL3pFZmRHN0hSaTJzNTExQ3JEVC9KVVhtVFdUZUtRcXZUL0FOcnlmNWlQdWlxOVAvYThuK1lqN28zWTZNVzFuT3VvVllhZjVLaTh5YXlieFNGVjZmOEF0ZVQvQURFZmRGVjZmKzE1UDh4SDNSdXgwWXRyT2RkUXF3MC95VkY1azFrM2lrS3IwLzhBYThuK1lqN29xdlQvQU5yeWY1aVB1amRqb3hiV2M2NmhWaHAva3FMekpySnZGSVZYcC83WGsvekVmZEZWNmY4QXRlVC9BREVmZEc3SFJpMnM1MTFDckRUL0FDVkY1azFrM2lrS3IwLzlyeWY1aVB1aXE5UC9BR3ZKL21JKzZOMk9qRnRaenJxRldHbitTb3ZNbXNtOFVoVmVuL3RlVC9NUjkwVlhwLzdYay96RWZkRzdIUmkyczUxMUNyRFQvSlVYbVRXVGVLUXF2VC8ydkovbUkrNktyMC85cnlmNWlQdWpkam94YldjNjZoVmhwL2txTHpKckp2SHRrM1pCcHZrdVhzWVRMalRHVXQ0UmdHRGZMK1plWVBHaTMwUzc4Vi9lM2x6bXVYME81Yy9uZjNQNi93QXVkNG15K1lLU3lDZFlLeWlib3FSR0l1eFZVOVdGRVJjSE1xYzVyU21WQko0bzlLbXlLZXBPNkJGYzFISTEzclZxcXFJdjlNTFZUK3dBZTRZa0JTRlY2ZjhBdGVUL0FERWZkRlY2ZisxNVA4eEgzVFdtN0hSaTJzNTExRytLc05QOGxSZVpOWk40cENxOVAvYThuK1lqN29xdlQvMnZKL21JKzZOMk9qRnRaenJxRldHbitTb3ZNbXNtOFVoVmVuL3RlVC9NUjkwVlhwLzdYay96RWZkRzdIUmkyczUxMUNyRFQvSlVYbVRXVGVLUXF2VC9BTnJ5ZjVpUHVpcTlQL2E4bitZajdvM1k2TVcxbk91b1ZZYWY1S2k4eWF5YnhTRlY2ZjhBdGVUL0FERWZkRlY2ZisxNVA4eEgzUnV4MFl0ck9kZFFxdzAveVZGNWsxazNpa0tyMC84QWE4bitZajdvcXZUL0FOcnlmNWlQdWpkam94YldjNjZoVmhwL2txTHpKckp2RklWWHAvN1hrL3pFZmRGVjZmOEF0ZVQvQURFZmRHN0hSaTJzNTExQ3JEVC9BQ1ZGNWsxazNpa0tyMC85cnlmNWlQdWlxOVAvQUd2Si9tSSs2TjJPakZ0WnpycUZXR24rU292TW1zbThVaFZlbi90ZVQvTVI5MFZYcC83WGsvekVmZEc3SFJpMnM1MTFDckRUL0pVWG1UV1RlS1FxdlQvMnZKL21JKzZLcjAvOXJ5ZjVpUHVqZGpveGJXYzY2aFZocC9rcUx6SnJKdkZJVlhwLzdYay96RWZkRlY2ZisxNVA4eEgzUnV4MFl0ck9kZFFxdzAveVZGNWsxazNpa0tyMC93RGE4bitZajdvcXZULzJ2Si9tSSs2TjJPakZ0WnpycUZXR24rU292TW1zbThVaFZlbi9BTFhrL3dBeEgzUlZlbi90ZVQvTVI5MGJzZEdMYXpuWFVLc05QOGxSZVpOWk40cENxOVAvQUd2Si9tSSs2S3IwL3dEYThuK1lqN28zWTZNVzFuT3VvVllhZjVLaTh5YXlieDIwK1NIampKNWpqQnNTNDZ3bkZ1RllWRndhOXdxOXZzRnY3Nit2TGw1ZHZyNjl1WEx0Mit2YjI3ejg5NWQvcC84QWppV2V6Yk9jQ1dRR3lxU3VSOE42WVVWUFVxR25wK21HV1RYTElrM3poRFdIR2hyZ2MxZldpL3dVQVB1UElEc01ublQrUnUrTUM5ZThjZTdESjUwL2tidmpBdlh2SGpVajlueC9nZDFWTW9vUDdha2ZHdyt1aHFnQXFJT2xnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBTXI4b2ZUK2VlK01OOWUvY2U3REtIMC9ubnZqRGZYdjNIcmQ2T2V6NEh3TjZxSE5QVGoyMUxPTmlkZFFBOWt4YzJBQVUzblVBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBRWY4cTc3QzhkK0JINndPVmQ5aGVPL0FqOVpaZS80b3lUbE8xZVVQMzV2NGxUbHlQN2VFQUc1Q0w1cEJrRTZwcFU4VjdtSzlnZVA1Qk9xYVZQRmU1aXZZRlVOMFhHR1g4ZEY2N2pvd3VJWWx6UDhBS3lmc21BQmhwdEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBOGZ5OTlVMDErRjl6Q1p2dElNdmZWTk5maGZjd21iNmZWNnZpOUc0NTNVaGxOL2xETWRKTDhxenRZNEFTV0lIbXdBQ204NmdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBZy9sUTlQOFVkend2WGpKdlVoeW9lbitLTzU0WHJ4azNyUmJqbUxFaStCUHFwejczejJQODY4YXYwUUFObG1odzdESjUwL2tidmpBdlh2SEh1d3llZFA1Rzc0d0wxN3g0MUkvWjhmNEhkVlRLS0QrMnBIeHNQcm9hb0FLaURwWUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQURLL0tIMC9ubnZqRGZYdjNIdXd5aDlQNTU3NHczMTc5eDYzZWpucytCOERlcWh6VDA0OXRTempZblhVQVBaTVhOZ0FGTjUxQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUJIL0t1K3d2SGZnUitzRGxYZllYanZ3SS9XV1h2K0tNazVUdFhsRDkrYitKVTVjaiszaEFCdVFpK2FRWkJPcWFWUEZlNWl2WUhqK1FUcW1sVHhYdVlyMkJWRGRGeGhsL0hSZXU0Nk1MaUdKY3ovS3lmc21BQmhwdEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBOGZ5OTlVMDErRjl6Q1p2dElNdmZWTk5maGZjd21iNmZWNnZpOUc0NTNVaGxOL2xETWRKTDhxenRZNEFTV0lIbXdBQ204NmdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBZy9sUTlQOFVkend2WGpKdlVoeW9lbitLTzU0WHJ4azNyUmJqbUxFaStCUHFwejczejJQOEFPdkdyOUVBRFpab2NPd3llZFA1Rzc0d0wxN3h4N3NNbm5UK1J1K01DOWU4ZU5TUDJmSCtCM1ZVeWlnL3RxUjhiRDY2R3FBQ29nNldBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBeXZ5aDlQNTU3NHczMTc5eDdzTW9mVCtlZStNTjllL2NldDNvNTdQZ2ZBM3FvYzA5T1BiVXM0MkoxMUFEMlRGellBQlRlZFFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBUi95cnZzTHgzNEVmckE1VjMyRjQ3OENQMWxsNy9pakpPVTdWNVEvZm0vaVZPWEkvdDRRQWJrSXZta0dRVHFtbFR4WHVZcjJCNC9rRTZwcFU4VjdtSzlnVlEzUmNZWmZ4MFhydU9qQzRoaVhNL3dBckoreVlBR0dtMEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFEeC9MMzFUVFg0WDNNSm0rMGd5OTlVMDErRjl6Q1p2cDlYcStMMGJqbmRTR1UzK1VNeDBrdnlyTzFqZ0JKWWdlYkFBS2J6cUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFDRCtWRDAveFIzUEM5ZU1tOVNIS2g2ZjRvN25oZXZHVGV0RnVPWXNTTDRFK3FuUHZmUFkvenJ4cS9SQUEyV2FIRHNNbm5UK1J1K01DOWU4Y2U3REo1MC9rYnZqQXZYdkhqVWo5bngvZ2QxVk1vb1A3YWtmR3crdWhxZ0FxSU9sZ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU1yOG9mVCtlZStNTjllL2NlN0RLSDAvbm52akRmWHYzSHJkNk9lejRId042cUhOUFRqMjFMT05pZGRRQTlreGMyQUFVM25VQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUVmOHE3N0M4ZCtCSDZ3T1ZkOWhlTy9BajlaWmUvNG95VGxPMWVVUDM1djRsVGx5UDdlRUFHNUNMNXBCa0U2cHBVOFY3bUs5Z2VQNUJPcWFWUEZlNWl2WUZVTjBYR0dYOGRGNjdqb3d1SVlselA4ckoreVlBR0dtMEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFEeC9MMzFUVFg0WDNNSm0rMGd5OTlVMDErRjl6Q1p2cDlYcStMMGJqbmRTR1UzK1VNeDBrdnlyTzFqZ0JKWWdlYkFBS2J6cUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFDRCtWRDAveFIzUEM5ZU1tOVNIS2g2ZjRvN25oZXZHVGV0RnVPWXNTTDRFK3FuUHZmUFkvd0E2OGF2MFFBTmxtaHc3REo1MC9rYnZqQXZYdkhIdXd5ZWRQNUc3NHdMMTd4NDFJL1o4ZjRIZFZUS0tEKzJwSHhzUHJvYW9BS2lEcFlBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFESy9LSDAvbm52akRmWHYzSHV3eWg5UDU1NzR3MzE3OXg2M2VqbnMrQjhEZXFoelQwNDl0U3pqWW5YVUFQWk1YTmdBRk41MUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFCSC9LdSt3dkhmZ1Irc0RsWGZZWGp2d0kvV1dYditLTWs1VHRYbEQ5K2IrSlU1Y2orM2hBQnVRaSthUVpCT3FhVlBGZTVpdllIaitRVHFtbFR4WHVZcjJCVkRkRnhobC9IUmV1NDZNTGlHSmN6L0FDc243SmdBWWFiUUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFQSDh2ZlZOTmZoZmN3bWI3U0RMMzFUVFg0WDNNSm0rbjFlcjR2UnVPZDFJWlRmNVF6SFNTL0tzN1dPQUVsaUI1c0FBcHZPb0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFJUDVVUFQvRkhjOEwxNHliMUljcUhwL2lqdWVGNjhaTjYwVzQ1aXhJdmdUNnFjKzk4OWovT3ZHcjlFQURaWm9jT3d5ZWRQNUc3NHdMMTd4eDdzTW5uVCtSdStNQzllOGVOU1AyZkgrQjNWVXlpZy90cVI4YkQ2NkdxQUNvZzZXQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQXl2eWg5UDU1NzR3MzE3OXg3c01vZlQrZWUrTU45ZS9jZXQzbzU3UGdmQTNxb2MwOU9QYlVzNDJKMTFBRDJURnpZQUJUZWRRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQVIveXJ2c0x4MzRFZnJBNVYzMkY0NzhDUDFsbDcvaWpKT1U3VjVRL2ZtL2lWT1hJL3Q0UUFia0l2bWtHUVRxbWxUeFh1WXIyQjQva0U2cHBVOFY3bUs5Z1ZRM1JjWVpmeDBYcnVPakM0aGlYTS95c243SmdBWWFiUUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFQSDh2ZlZOTmZoZmN3bWI3U0RMMzFUVFg0WDNNSm0rbjFlcjR2UnVPZDFJWlRmNVF6SFNTL0tzN1dPQUVsaUI1c0FBcHZPb0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFJUDVVUFQvRkhjOEwxNHliMUljcUhwL2lqdWVGNjhaTjYwVzQ1aXhJdmdUNnFjKzk4OWovQURyeHEvUkFBMldhSEQ3MHE0MHdmRWN6eTVqckM3eU5Fd1hBOFB3ZkNvdDdEdVhMdC9mWGw1RXZiNjdjdmJsMjdjdWMvTmN1ODNQZHVQZ2o1NVhKbVJvVG9MLytya1ZGL29xWUQ3WnVsOFNTeWlIS29QOEEzWTVISi9WRndwLzZoZUZhR1FPeUp3OHZBM3BXaGtEc2ljUEx3TjZnOGFLcTEwWS9rZm5xUzdyMjAvNFNGMFNheThLME1nZGtUaDVlQnZTdERJSFpFNGVYZ2IxQjRWYTZNZnlQejFGZTJuL0NRdWlUV1hoV2hrRHNpY1BMd042Vm9aQTdJbkR5OERlb1BDclhSaitSK2VvcjIwLzRTRjBTYXk4SzBNZ2RrVGg1ZUJ2U3RESUhaRTRlWGdiMUI0VmE2TWZ5UHoxRmUybi9BQWtMb2sxbDRWb1pBN0luRHk4RGVsYUdRT3lKdzh2QTNxRHdxMTBZL2tmbnFLOXRQK0VoZEVtc3ZDdERJSFpFNGVYZ2IwclF5QjJST0hsNEc5UWVGV3VqSDhqODlSWHRwL3drTG9rMWw0Vm9aQTdJbkR5OERlbGFHUU95Snc4dkEzcUR3cTEwWS9rZm5xSzl0UDhBaElYUkpyTHdyUXlCMlJPSGw0RzlLME1nZGtUaDVlQnZVSGhWcm94L0kvUFVWN2FmOEpDNkpOWmVGYUdRT3lKdzh2QTNwV2hrRHNpY1BMd042ZzhLdGRHUDVINTZpdmJUL2hJWFJKckx3clF5QjJST0hsNEc5SzBNZ2RrVGg1ZUJ2VUhoVnJveC9JL1BVVjdhZjhKQzZKTlplRmFHUU95Snc4dkEzcFdoa0RzaWNQTHdONmc4S3RkR1A1SDU2aXZiVC9oSVhSSnJMd3JReUIyUk9IbDRHOUswTWdka1RoNWVCdlVIaFZyb3gvSS9QVVY3YWY4QUNRdWlUV1hoV2hrRHNpY1BMd042Vm9aQTdJbkR5OERlb1BDclhSaitSK2VvcjIwLzRTRjBTYXk4SzBNZ2RrVGg1ZUJ2U3RESUhaRTRlWGdiMUI0VmE2TWZ5UHoxRmUybi9DUXVpVFdmZW1yR21ENDhtZVk4ZFlKZVJvZUM0WmgrRVlWQ3ZZbHk1Y3Y3Mjh2NGw5ZlhMbDljdVhidHpuNXJ0em41cnQxOEVHOVpKSm13WVRZTFArclVSRS9vaVlDSWs0eStKS3BSRWxVYi91OXl1WCtxcmhYL0FOVUFQb1BpTEFyWFpoYTA0Sld1ekMxcHdVZmpUZFgraU5rMGtYdmtvSzV0MHJLV2hrL2hGZ1Zyc3d0YWNFclhaaGEwNEtQd3EvMFJzbWtpOThWemJwV1V0REovQ0xBclhaaGEwNEpXdXpDMXB3VWZoVi9valpOSkY3NHJtM1NzcGFHVCtFV0JXdXpDMXB3U3RkbUZyVGdvL0NyL0FFUnNta2k5OFZ6YnBXVXRESi9DTEFyWFpoYTA0Sld1ekMxcHdVZmhWL29qWk5KRjc0cm0zU3NwYUdUK0VXQld1ekMxcHdTdGRtRnJUZ28vQ3IvUkd5YVNMM3hYTnVsWlMwTW44SXNDdGRtRnJUZ2xhN01MV25CUitGWCtpTmswa1h2aXViZEt5bG9aUDRSWUZhN01MV25CSzEyWVd0T0NqOEt2OUViSnBJdmZGYzI2VmxMUXlmd2l3SzEyWVd0T0NWcnN3dGFjRkg0VmY2STJUU1JlK0s1dDByS1doay9oRmdWcnN3dGFjRXJYWmhhMDRLUHdxLzBSc21raTk4VnpicFdVdERKL0NMQXJYWmhhMDRKV3V6QzFwd1VmaFYvb2paTkpGNzRybTNTc3BhR1QrRVdCV3V6QzFwd1N0ZG1GclRnby9Dci9BRVJzbWtpOThWemJwV1V0REovQ0xBclhaaGEwNEpXdXpDMXB3VWZoVi9valpOSkY3NHJtM1NzcGFHVCtFV0JXdXpDMXB3U3RkbUZyVGdvL0NyL1JHeWFTTDN4WE51bFpTME1uOEk5Z3lyNVY2VC8wRC93SDZIOUQ4LzhBOXI1M3pmbWZCLzhBRjd6YzN5Lzc4L1AvQUdlUGcyWFIrajhqbXFSc2tFZ1pzSVRNT0JNS3Jnd3FybDMzS3ErdFZYZlUwUFRPbWM1MGhuT0xQRThSZk95bUxzZGs3WXRiaDJMVWFtODFHdFRBMXFKdklucXdydmdCN0ppNVNFZzhvUDhBZ2VVOFV5di9BQWorcWZTL04vMy9BSy81ZngvSEZ2ci9BUDQvTHZ1Ym0rUG0vbi9SMkZhN01MV25CUitOVHpqY1Bvdks1UkVsVW9rdXlpUkhLNXk3T0ltRlhMaFZjQ1BSRXdxdjVKZ0pHVEhmWjNRWnRrVUdicEZPR3dnd1dOWXhQTlFGd05ZaU5hbUZZYXF1QkVSTUtxcXIrYXFwWUZhN01MV25CSzEyWVd0T0NqOGZIVi9valpOSkY3NTZsYzI2VmxMUXlmd2l3SzEyWVd0T0NWcnN3dGFjRkg0VmY2STJUU1JlK0s1dDByS1doay9oRmdWcnN3dGFjRXJYWmhhMDRLUHdxLzBSc21raTk4VnpicFdVdERKL0NMQXJYWmhhMDRKV3V6QzFwd1VmaFYvb2paTkpGNzRybTNTc3BhR1QrRVdCV3V6QzFwd1N0ZG1GclRnby9Dci9BRVJzbWtpOThWemJwV1V0REovQ0xBclhaaGEwNEpXdXpDMXB3VWZoVi9valpOSkY3NHJtM1NzcGFHVCtFV0JXdXpDMXB3U3RkbUZyVGdvL0NyL1JHeWFTTDN4WE51bFpTME1uOElzQ3RkbUZyVGdsYTdNTFduQlIrRlgraU5rMGtYdml1YmRLeWxvWlA0UllGYTdNTFduQksxMllXdE9DajhLdjlFYkpwSXZmRmMyNlZsTFF5Zndpd0sxMllXdE9DVnJzd3RhY0ZINFZmNkkyVFNSZStLNXQwcktXaGsvaEZnVnJzd3RhY0VyWFpoYTA0S1B3cS8wUnNta2k5OFZ6YnBXVXRESi9DTEFyWFpoYTA0Sld1ekMxcHdVZmhWL29qWk5KRjc0cm0zU3NwYUdUK0VXQld1ekMxcHdTdGRtRnJUZ28vQ3IvQUVSc21raTk4VnpicFdVdERKL0NLUW43bEIveHhLZU5wWC9oSDlMK3ErVi92L1gvQURQZytDTGUzLzhBeCtYZTgvUDhITi9QK3Fid1o5UldoODNUSkozU1diSWZtNGJuSzVVd3VkdnFpSmh3dVZWOVNKK2VBMDNkRHVtejVTdVd0bkdmNC9ub3pHSXhGMkxHWUdvcm5JbUJqV3A2M09YRGd3Ny9BSzhDSUFHVEdCbGdWcnN3dGFjRXJYWmhhMDRLUHhwdXIvUkd5YVNMM3lVRmMyNlZsTFF5Zndpd0sxMllXdE9DVnJzd3RhY0ZINFZmNkkyVFNSZStLNXQwcktXaGsvaEZnVnJzd3RhY0VyWFpoYTA0S1B3cS93QkViSnBJdmZGYzI2VmxMUXlmd2l3SzEyWVd0T0NWcnN3dGFjRkg0VmY2STJUU1JlK0s1dDByS1doay9oRmdWcnN3dGFjRXJYWmhhMDRLUHdxLzBSc21raTk4VnpicFdVdERKL0NMQXJYWmhhMDRKV3V6QzFwd1VmaFYvb2paTkpGNzRybTNTc3BhR1QrRVdCV3V6QzFwd1N0ZG1GclRnby9Dci9SR3lhU0wzeFhOdWxaUzBNbjhJc0N0ZG1GclRnbGE3TUxXbkJSK0ZYK2lOazBrWHZpdWJkS3lsb1pQNFJZRmE3TUxXbkJLMTJZV3RPQ2o4S3Y5RWJKcEl2ZkZjMjZWbExReWZ3aXdLMTJZV3RPQ1Zyc3d0YWNGSDRWZjZJMlRTUmUrSzV0MHJLV2hrL2hGZ1Zyc3d0YWNFclhaaGEwNEtQd3Evd0JFYkpwSXZmRmMyNlZsTFF5Zndpd0sxMllXdE9DVnJzd3RhY0ZINFZmNkkyVFNSZStLNXQwcktXaGsvaEZnVnJzd3RhY0VyWFpoYTA0S1B3cS8wUnNta2k5OFZ6YnBXVXRESi9DTEFyWFpoYTA0Sld1ekMxcHdVZmhWL29qWk5KRjc0cm0zU3NwYUdUK0Vla1pVTW9OSk9QOEFBOGVmcEg2TDhyQTd6QlBsZlVmTytMbXY3KysrTDR2aHZlYi9BTE9ibTV2NlBOd2JSbWFaNU5OOGxaSXBJM1l3bUpnYW1GVndKL1ZWVmVkU1B0S0tUeTZlWndpenBPVC9BRGtlS3V5YzdBaVlWL2pnYWlOVCt5SUFIcG5nZ0gySmV4VCt2WS94SGlQNmo2VDYzRElPQ2ZOK0Q0dmxmSGYzTDM0dmg1N25QemZGejgzUGM1MzhaVEtHUVlib3NSY0RXb3FyL1JOOVQ2cERJb3NwanNrOEZNTDNxalVUMVlWVmNDSnY3M3IvQUlueHhZRlZIUDNWZkdLcU9mdXErTTFEV0FvamE5SEY3aEphcGxkS3licHBQNHBINHNDcWpuN3F2akZWSFAzVmZHS3dGRWJYbzR2Y0ZUSzZWazNUU2Z4U1B4WUZWSFAzVmZHS3FPZnVxK01WZ0tJMnZSeGU0S21WMHJKdW1rL2lrZml3S3FPZnVxK01WVWMvZFY4WXJBVVJ0ZWppOXdWTXJwV1RkTkovRkkvRmdWVWMvZFY4WXFvNSs2cjR4V0FvamE5SEY3Z3FaWFNzbTZhVCtLUitMQXFvNSs2cjR4VlJ6OTFYeGlzQlJHMTZPTDNCVXl1bFpOMDBuOFVqOFdCVlJ6OTFYeGtmc3lvbGRBbWlmZk9mN1ZHODU1dkJzdjhBaTV1RFpZY0gvWnFZY09CZlZoOVcrYXZ1azNHS1MwUjh6dGlrM21QUDdMWWY4NGI4T3cyT3kvNlBkZ3diSnZyd1ljTzlod0tBR1pHcndLUWtIaytmeHhLZUtaby9pNzlMK3ErYi9zZlFmTStENEl0OWVmOEFMNWw3ejgvd2MvOEFMK3JzS3FPZnVxK00xUE9OM0NpOGtsRVNTeWlWYkdKRGNyWEpzSWk0RmF1QlV3b3hVWEFxZmt1QWtaTWQ2WmRCbktSUVp4a1UzN09ER1kxN0Y4N0FUQzE2STVxNEZpSXFZVVZGd0tpS241b2lrZml3S3FPZnVxK01WVWMvZFY4WjhkWUNpTnIwY1h1SHFWTXJwV1RkTkovRkkvRmdWVWMvZFY4WXFvNSs2cjR4V0FvamE5SEY3Z3FaWFNzbTZhVCtLUitMQXFvNSs2cjR4VlJ6OTFYeGlzQlJHMTZPTDNCVXl1bFpOMDBuOFVqOFdCVlJ6OTFYeGlxam43cXZqRllDaU5yMGNYdUNwbGRLeWJwcFA0cEg0c0Nxam43cXZqRlZIUDNWZkdLd0ZFYlhvNHZjRlRLNlZrM1RTZnhTUHhZRlZIUDNWZkdLcU9mdXErTVZnS0kydlJ4ZTRLbVYwckp1bWsvaWtmaXdLcU9mdXErTVZVYy9kVjhZckFVUnRlamk5d1ZNcnBXVGROSi9GSS9GZ1ZVYy9kVjhZcW81KzZyNHhXQW9qYTlIRjdncVpYU3NtNmFUK0tSK0xBcW81KzZyNHhWUno5MVh4aXNCUkcxNk9MM0JVeXVsWk4wMG44VWo4V0JWUno5MVh4aXFqbjdxdmpGWUNpTnIwY1h1Q3BsZEt5YnBwUDRwSDRzQ3FqbjdxdmpGVkhQM1ZmR0t3RkViWG80dmNGVEs2VmszVFNmeFNQeFlGVkhQM1ZmR0txT2Z1cStNVmdLSTJ2UnhlNEttVjBySnVtay9pa2Zpd0txT2Z1cStNVlVjL2RWOFlyQVVSdGVqaTl3Vk1ycFdUZE5KL0ZJL0ZJVDl5ZlA0SGxQRzAwZnhkK3FmUy9LLzJQb1BsL0g4Y1c5dlArWHpMN201dmo1LzVmMFRlejZpdE1KdW51VHVsVTJSUE9RMnVWcXJnYzNmUkVYQmdjaUw2bFQ4c0JwdTZIY3lueWlrdGJOMC93QUR6TVo3RWVpYkpqOExWVnpVWEN4ems5YlhKZ3c0ZDcxWUZRQU1tTURBOWd5VVpLS1Qvd0JmL3dEUC9vZjBQeVAvQUZmbmZOK1o4ZjhBOTN2TnpmTC9BTDgvUC9aN0JWUno5MVh4bXRLUVhZS09UVkxIeUNYeWpZUldZTUtiQ0l1RENpT1RmYTFVOVNvdThwdmlobDdMVGVrTTJ3cDRtZVErZGswWFpiRjNuWUxjT3hjclYzblJHdVRBNXFwdm9ucXdwdkVmaXdLcU9mdXErTVZVYy9kVjhaNDFZQ2lOcjBjWHVHVVZNcnBXVGROSi9GSS9GZ1ZVYy9kVjhZcW81KzZyNHhXQW9qYTlIRjdncVpYU3NtNmFUK0tSK0xBcW81KzZyNHhWUno5MVh4aXNCUkcxNk9MM0JVeXVsWk4wMG44VWo4V0JWUno5MVh4aXFqbjdxdmpGWUNpTnIwY1h1Q3BsZEt5YnBwUDRwSDRzQ3FqbjdxdmpGVkhQM1ZmR0t3RkViWG80dmNGVEs2VmszVFNmeFNQeFlGVkhQM1ZmR0txT2Z1cStNVmdLSTJ2UnhlNEttVjBySnVtay9pa2Zpd0txT2Z1cStNVlVjL2RWOFlyQVVSdGVqaTl3Vk1ycFdUZE5KL0ZJL0ZnVlVjL2RWOFlxbzUrNnI0eFdBb2phOUhGN2dxWlhTc202YVQrS1IrTEFxbzUrNnI0eFZSejkxWHhpc0JSRzE2T0wzQlV5dWxaTjAwbjhVajhXQlZSejkxWHhpcWpuN3F2akZZQ2lOcjBjWHVDcGxkS3licHBQNHBINHNDcWpuN3F2akZWSFAzVmZHS3dGRWJYbzR2Y0ZUSzZWazNUU2Z4U1B4WUZWSFAzVmZHS3FPZnVxK01WZ0tJMnZSeGU0S21WMHJKdW1rL2lrZml3S3FPZnVxK01WVWMvZFY4WXJBVVJ0ZWppOXdWTXJwV1RkTkovRkkvRmdWVWMvZFY4Wkg3TXFKWFFKb24zem4rMVJ2T2Vid2JML0FJdWJnMldIQi8yYW1IRGdYMVlmVnZtcjdwTnhpa3RFZk03WXBONWp6K3kySC9PRy9Ec05qc3YrajNZTUd5YjY4R0hEdlljQ2dCbVJxOERzSkJsUCtPSnN4VEsvMS82WDlWODMvZjhBbGZNK0Q0SVY5ZjhBL0hudmVmbitEbS9uL1ZTRlZIUDNWZkdZQlNxNmhNVXlTaHNsbk9QNXVJNXFPUk5pOTI4cXFtSEMxcXA2MFg4OEp1UzU1ZS8wdXBYSW5Uak1Fazg5Qlk5V0t2bklUTURrUnJsVEE5N1Y5VG1yaHdZTi93QmVGRkkvRmdWVWMvZFY4WXFvNSs2cjR6R3F3RkViWG80dmNNOHFaWFNzbTZhVCtLUitMQXFvNSs2cjR4VlJ6OTFYeGlzQlJHMTZPTDNCVXl1bFpOMDBuOFVqOFdCVlJ6OTFYeGlxam43cXZqRllDaU5yMGNYdUNwbGRLeWJwcFA0cEg0c0Nxam43cXZqRlZIUDNWZkdLd0ZFYlhvNHZjRlRLNlZrM1RTZnhTUHhZRlZIUDNWZkdLcU9mdXErTVZnS0kydlJ4ZTRLbVYwckp1bWsvaWtmaXdLcU9mdXErTVZVYy9kVjhZckFVUnRlamk5d1ZNcnBXVGROSi9GSS9GZ1ZVYy9kVjhZcW81KzZyNHhXQW9qYTlIRjdncVpYU3NtNmFUK0tSK0xBcW81KzZyNHhWUno5MVh4aXNCUkcxNk9MM0JVeXVsWk4wMG44VWo4V0JWUno5MVh4aXFqbjdxdmpGWUNpTnIwY1h1Q3BsZEt5YnBwUDRwSDRzQ3FqbjdxdmpGVkhQM1ZmR0t3RkViWG80dmNGVEs2VmszVFNmeFNQeFlGVkhQM1ZmR0txT2Z1cStNVmdLSTJ2UnhlNEttVjBySnVtay9pa2Zpd0txT2Z1cStNVlVjL2RWOFlyQVVSdGVqaTl3Vk1ycFdUZE5KL0ZJL0ZnVlVjL2RWOFlxbzUrNnI0eFdBb2phOUhGN2dxWlhTc202YVQrS1IrTEFxbzUrNnI0endmS2hrK28yeC9nZUkvMWY5YStiZ2Q1aGZ6ZnAvay9EejM5L2UvRDhQeFgzUC8xOC9Qei9BTlh2MGF1c1VmbmlWSklwdWxHemlxaXJnMkQwM2s5ZSs1cUovd0NtRzA3dmNxWjBabTlaMG51UithZ0lxTjJYbklUdDlmVW1Ca1J6dC84QW9lYmdOaW1rUVBZTWxHU2lrLzhBWC84QXovNkg5RDhqL3dCWDUzemZtZkgvQVBkN3pjM3kvd0MvUHovMmV3VlVjL2RWOFpyU2tGMkNqazFTeDhnbDhvMkVWbURDbXdpTGd3b2prMzJ0VlBVcUx2S2I0b1pleTAzcEROc0tlSm5rUG5aTkYyV3hkNTJDM0RzWEsxZDUwUnJrd09hcWI2SjZzS2J4SDRzQ3FqbjdxdmpGVkhQM1ZmR2VOV0FvamE5SEY3aGxGVEs2VmszVFNmeFNQeFlGVkhQM1ZmR0txT2Z1cStNVmdLSTJ2UnhlNEttVjBySnVtay9pa2Zpd0txT2Z1cStNVlVjL2RWOFlyQVVSdGVqaTl3Vk1ycFdUZE5KL0ZJL0ZnVlVjL2RWOFlxbzUrNnI0eFdBb2phOUhGN2dxWlhTc202YVQrS1IrTEFxbzUrNnI0eFZSejkxWHhpc0JSRzE2T0wzQlV5dWxaTjAwbjhVajhla1pVTW4xRzJQOER4SCtyL3JYemNEdk1MK2I5UDhBSitIbnY3KzkrSDRmaXZ1Zi9yNStmbi9xODNiUm1hZUpOT0VsWkxaSTdaUW5waGF1QlV3cC9SVVJlZENQdEtLTVM2WnB3aXpYT1RQTng0UzdGemNLTGdYK0dGcXExZjdLb0FlbWVDSFlaUE9uOGpkOFlGNjk0NDkyR1R6cC9JM2ZHQmV2ZVBHcEg3UGovQTdxcVpSUWYyMUkrTmg5ZERWQUJVUWRMQUFBQUFBQUFBQUFBQmorMkFZL3BrWHBYdkRrdnVsWC9sSXZjMzZuN0FBVElLdnpTRElKMVRTcDRyM01WN0E4ZnlDZFUwcWVLOXpGZXdLb2JvdU1NdjQ2TDEzSFJoY1F4TG1mNVdUOWt3QU1OTm9BQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBSGorWHZxbW12d3Z1WVROOXBCbDc2cHByOEw3bUV6ZlQ2dlY4WG8zSE82a01wdjhvWmpwSmZsV2RySEFDU3hBOHNEa28vZnZnZnpyQVIvd0FsSDc5OEQrZFlDdE8rQXh1bGZKOWt3dmd2TXZ3MW0zbHYzRVVBTk5rb0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBeC9iQU1mMHlMMHIzaHlYM1NyL0FNcEY3bS9VL1lBQ1pCVitld1pCT3RtVlBGZTJpdElHYitRVHJabFR4WHRvclNCQVcrb3hoZzhTM3J4QzVEeWVlSmNxK2FmMlVBQUkwazhBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQWcvbFE5UDhBRkhjOEwxNHk4RUg4cUhwL2lqdWVGNjhadjI5cnhuWjhEL29oRGUvdHhBaWNiQytxazNnTEV5a2NzRGtvL2Z2Z2Z6ckFSL3lVZnYzd1A1MWdLMDc0REc2VjhuMlRDK0M4eS9EV2JlVy9jUlFBMDJTZ0FBQUFBQUFBQUNEK1ZEMC94UjNQQzllTW05U0hLaDZmNG83bmhldkdUZXRGdU9Zc1NMNEUrcW5QdmZQWS93QTY4YXYwUUFObG1odzdESjUwL2tidmpBdlh2SEh1d3llZFA1Rzc0d0wxN3g0MUkvWjhmNEhkVlRLS0QrMnBIeHNQcm9hb0FLaURwWUFBQUFBQUFBQUFBQU1mMndESDlNaTlLOTRjbDkwcS93REtSZTV2MVAyQUFtUVZmbWtHUVRxbWxUeFh1WXIyQjQva0U2cHBVOFY3bUs5Z1ZRM1JjWVpmeDBYcnVPakM0aGlYTS95c243SmdBWWFiUUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFQSDh2ZlZOTmZoZmN3bWI3U0RMMzFUVFg0WDNNSm0rbjFlcjR2UnVPZDFJWlRmNVF6SFNTL0tzN1dPQUVsaUI1WUhKUisvZkEvbldBai9rby9mdmdmenJBVnAzd0dOMHI1UHNtRjhGNWwrR3MyOHQrNGlnQnBzbEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBR1A3WUJqK21SZWxlOE9TKzZWZitVaTl6ZnFmc0FCTWdxL1BZTWduV3pLbml2YlJXa0ROL0lKMXN5cDRyMjBWcEFnTGZVWXd3ZUpiMTRoY2g1UFBFdVZmTlA3S0FBRWFTZUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBUWZ5b2VuK0tPNTRYcnhsNElQNVVQVC9GSGM4TDE0emZ0N1hqT3o0SC9BRVFodmYyNGdST05oZlZTYndGaVpTT1dCeVVmdjN3UDUxZ0kvd0NTajkrK0IvT3NCV25mQVkzU3ZrK3lZWHdYbVg0YXpieTM3aUtBR215VUFBQUFBQUFBQUFRZnlvZW4rS081NFhyeGszcVE1VVBUL0ZIYzhMMTR5YjFvdHh6RmlSZkFuMVU1OTc1N0grZGVOWDZJQUd5elE0ZGhrODZmeU4zeGdYcjNqajNZWlBPbjhqZDhZRjY5NDhha2ZzK1A4RHVxcGxGQi9iVWo0MkgxME5VQUZSQjBzQUFBQUFBQUFBQUFBR1A3WUJqK21SZWxlOE9TKzZWZitVaTl6ZnFmc0FCTWdxL05JTWduVk5Lbml2Y3hYc0R4L0lKMVRTcDRyM01WN0FxaHVpNHd5L2pvdlhjZEdGeERFdVovbFpQMlRBQXcwMmdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBZVA1ZStxYWEvQys1aE0zMmtHWHZxbW12d3Z1WVROOVBxOVh4ZWpjYzdxUXltL3dBb1pqcEpmbFdkckhBQ1N4QThzRGtvL2Z2Z2Z6ckFSL3lVZnYzd1A1MWdLMDc0REc2VjhuMlRDK0M4eS9EV2JlVy9jUlFBMDJTZ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFESDlzQXgvVEl2U3ZlSEpmZEt2L0FDa1h1YjlUOWdBSmtGWDU3QmtFNjJaVThWN2FLMGdadjVCT3RtVlBGZTJpdElFQmI2akdHRHhMZXZFTGtQSjU0bHlyNXAvWlFBQWpTVHdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQ0QrVkQwL3hSM1BDOWVNdkJCL0toNmY0bzduaGV2R2I5dmE4WjJmQS82SVEzdjdjUUluR3d2cXBONEN4TXBITEE1S1AzNzRIODZ3RWY4bEg3OThEK2RZQ3RPK0F4dWxmSjlrd3Zndk12dzFtM2x2M0VVQU5Oa29BQUFBQUFBQUFBZy9sUTlQOEFGSGM4TDE0eWIxSWNxSHAvaWp1ZUY2OFpONjBXNDVpeEl2Z1Q2cWMrOTg5ai9PdkdyOUVBRFpab2NPd3llZFA1Rzc0d0wxN3h4N3NNbm5UK1J1K01DOWU4ZU5TUDJmSCtCM1ZVeWlnL3RxUjhiRDY2R3FBQ29nNldBQUFBQUFBQUFBQUFESDlzQXgvVEl2U3ZlSEpmZEt2L0FDa1h1YjlUOWdBSmtGWDVwQmtFNnBwVThWN21LOWdlUDVCT3FhVlBGZTVpdllGVU4wWEdHWDhkRjY3am93dUlZbHpQOHJKK3lZQUdHbTBBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBRHgvTDMxVFRYNFgzTUptKzBneTk5VTAxK0Y5ekNadnA5WHErTDBiam5kU0dVMytVTXgwa3Z5ck8xamdCSllnZVdCeVVmdjN3UDUxZ0kvd0NTajkrK0IvT3NCV25mQVkzU3ZrK3lZWHdYbVg0YXpieTM3aUtBR215VUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBWS90Z0dQNlpGNlY3dzVMN3BWLzVTTDNOK3Ard0FFeUNyODlneUNkYk1xZUs5dEZhUU0zOGduV3pLbml2YlJXa0NBdDlSakRCNGx2WGlGeUhrODhTNVY4MC9zb0FBUnBKNEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFCQi9LaDZmNG83bmhldkdYZ2cvbFE5UDhVZHp3dlhqTiszdGVNN1BnZjlFSWIzOXVJRVRqWVgxVW04QlltVWpsZ2NsSDc5OEQrZFlDUCtTajkrK0IvT3NCV25mQVkzU3ZrK3lZWHdYbVg0YXpieTM3aUtBR215VUFBQUFBQUFBQUFRZnlvZW4rS081NFhyeGszcVE1VVBUL0ZIYzhMMTR5YjFvdHh6RmlSZkFuMVU1OTc1N0grZGVOWDZJQUd5elE0ZGhrODZmeU4zeGdYcjNqajNZWlBPbjhqZDhZRjY5NDhha2ZzK1A4RHVxcGxGQi9iVWo0MkgxME5VQUZSQjBzQUFBQUFBQUFBQUFBR1A3WUJqK21SZWxlOE9TKzZWZitVaTl6ZnFmc0FCTWdxL05JTWduVk5Lbml2Y3hYc0R4L0lKMVRTcDRyM01WN0FxaHVpNHd5L2pvdlhjZEdGeERFdVovbFpQMlRBQXcwMmdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBZVA1ZStxYWEvQys1aE0zMmtHWHZxbW12d3Z1WVROOVBxOVh4ZWpjYzdxUXltL3lobU9rbCtWWjJzY0FKTEVEeXdPU2o5KytCL09zQkgvSlIrL2ZBL25XQXJUdmdNYnBYeWZaTUw0THpMOE5adDViOXhGQURUWktBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU1mMndESDlNaTlLOTRjbDkwcS84cEY3bS9VL1lBQ1pCVitld1pCT3RtVlBGZTJpdElHYitRVHJabFR4WHRvclNCQVcrb3hoZzhTM3J4QzVEeWVlSmNxK2FmMlVBQUkwazhBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQWcvbFE5UDhVZHp3dlhqTHdRZnlvZW4rS081NFhyeG0vYjJ2R2Rud1A4QW9oRGUvdHhBaWNiQytxazNnTEV5a2NzRGtvL2Z2Z2Z6ckFSL3lVZnYzd1A1MWdLMDc0REc2VjhuMlRDK0M4eS9EV2JlVy9jUlFBMDJTZ0FBQUFBQUFBQUNEK1ZEMC94UjNQQzllTW05U0hLaDZmNG83bmhldkdUZXRGdU9Zc1NMNEUrcW5QdmZQWS96cnhxL1JBQTJXYUhEc01ublQrUnUrTUM5ZThjZTdESjUwL2tidmpBdlh2SGpVajlueC9nZDFWTW9vUDdha2ZHdyt1aHFnQXFJT2xnQUFBQUFBQUFBQUFBeC9iQU1mMHlMMHIzaHlYM1NyL3lrWHViOVQ5Z0FKa0ZYNXBCa0U2cHBVOFY3bUs5Z2VQNUJPcWFWUEZlNWl2WUZVTjBYR0dYOGRGNjdqb3d1SVlselA4ckoreVlBR0dtMEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFEeC9MMzFUVFg0WDNNSm0rMGd5OTlVMDErRjl6Q1p2cDlYcStMMGJqbmRTR1UzK1VNeDBrdnlyTzFqZ0JKWWdlV0J5VWZ2M3dQNTFnSS81S1AzNzRIODZ3RmFkOEJqZEsrVDdKaGZCZVpmaHJOdkxmdUlvQWFiSlFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQmorMkFZL3BrWHBYdkRrdnVsWC9BSlNMM04rcCt3QUV5Q3I4OWd5Q2RiTXFlSzl0RmFRTTM4Z25XektuaXZiUldrQ0F0OVJqREI0bHZYaUZ5SGs4OFM1VjgwL3NvQUFScEo0QUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUJCL0toNmY0bzduaGV2R1hnZy9sUTlQOEFGSGM4TDE0emZ0N1hqT3o0SC9SQ0c5L2JpQkU0MkY5Vkp2QVdKbEk1WUhKUisvZkEvbldBai9rby9mdmdmenJBVnAzd0dOMHI1UHNtRjhGNWwrR3MyOHQrNGlnQnBzbEFBQUFBQUFBQUFFSDhxSHAvaWp1ZUY2OFpONmtPVkQwL3hSM1BDOWVNbTlhTGNjeFlrWHdKOVZPZmUrZXgvblhqVitpQUJzczBPQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUIvL1pcIixcbiAgIFwiaWRcIjogMixcbiAgIFwid2lkdGhcIjogMixcbiAgIFwiaGVpZ2h0XCI6IDJcbiAgfVxuIF0sXG4gXCJ3aWR0aFwiOiAxLFxuIFwiaGVpZ2h0XCI6IDFcbn0iXX0=
