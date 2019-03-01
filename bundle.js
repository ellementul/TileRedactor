(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
	crSwitch: CrSwitchTwo
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

},{"chromath":6,"typesjs":14}],3:[function(require,module,exports){

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
const Draw = require("./Draw.js");
const CrLogic = require("./Logic.js");
const CrContr = require("./Control.js");

var Tileset = require("./tileset.json");
var Logic = new CrLogic(Draw);
CrContr(Logic, Draw);

},{"./Control.js":1,"./Draw.js":2,"./Logic.js":4,"./tileset.json":15}],6:[function(require,module,exports){
var Chromath = require('./src/chromath.js');
module.exports = Chromath;

},{"./src/chromath.js":7}],7:[function(require,module,exports){
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

},{"./colornames_css2":8,"./colornames_css3":9,"./parsers":10,"./prototype":11,"./util":12}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{"./util":12}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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





},{}],14:[function(require,module,exports){
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

},{"./mof.js":13}],15:[function(require,module,exports){
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
},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDb250cm9sLmpzIiwiRHJhdy5qcyIsIkV2ZW50cy5qcyIsIkxvZ2ljLmpzIiwiYnJvbWFpbi5qcyIsIm5vZGVfbW9kdWxlcy9jaHJvbWF0aC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jaHJvbWF0aC9zcmMvY2hyb21hdGguanMiLCJub2RlX21vZHVsZXMvY2hyb21hdGgvc3JjL2NvbG9ybmFtZXNfY3NzMi5qcyIsIm5vZGVfbW9kdWxlcy9jaHJvbWF0aC9zcmMvY29sb3JuYW1lc19jc3MzLmpzIiwibm9kZV9tb2R1bGVzL2Nocm9tYXRoL3NyYy9wYXJzZXJzLmpzIiwibm9kZV9tb2R1bGVzL2Nocm9tYXRoL3NyYy9wcm90b3R5cGUuanMiLCJub2RlX21vZHVsZXMvY2hyb21hdGgvc3JjL3V0aWwuanMiLCJub2RlX21vZHVsZXMvdHlwZXNqcy9tb2YuanMiLCJub2RlX21vZHVsZXMvdHlwZXNqcy90eXBlcy5qcyIsInRpbGVzZXQuanNvbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvdUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IEhlYXIgPSByZXF1aXJlKFwiLi9FdmVudHMuanNcIik7XHJcblxyXG5mdW5jdGlvbiBDckNvbnRyb2xsZXIoTG9naWMsIERyYXcpe1xyXG5cclxuXHR2YXIgc3dpdGNoQWN0ID0gRHJhdy5jclN3aXRjaChcIlRpbGVzXCIsIFwiT2JqZWN0c1wiLCBcImludmlzXCIpO1xyXG5cdEhlYXIoXCJzd2l0Y2hBY3RcIiwgXCJjbGlja1wiLCBmdW5jdGlvbigpe1xyXG5cdFx0c3dpdGNoQWN0KCk7XHJcblx0fSlcclxuXHJcblx0SGVhcihcIlRpbGVzXCIsIFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpe1xyXG5cdFx0aWYoZXZlbnQudGFyZ2V0LnN3aXQpIGV2ZW50LnRhcmdldC5zd2l0KCk7XHJcblx0XHRcclxuXHRcdGlmKGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoXCJ0aWxlXCIpICE9PSBudWxsKXtcclxuXHRcdFx0TG9naWMuY2hhbmdlVGlsZShldmVudC50YXJnZXQucGFyZW50RWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJjYXRlZ1wiKSwgZXZlbnQudGFyZ2V0LmdldEF0dHJpYnV0ZShcInRpbGVcIikpO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG5cdFxyXG5cdEhlYXIoXCJBZGRcIiwgXCJjaGFuZ2VcIiwgRHJhdy5vcGVuSlNPTihMb2dpYy5hZGRUaWxlc2V0KSk7XHJcblx0XHJcblx0dmFyIGN1cnNvckxpbmUgPSBudWxsO1xyXG5cdEhlYXIoXCJzd2l0Y2hHcmlkXCIsIFwiY2xpY2tcIiwgZnVuY3Rpb24oKXtcclxuXHRcdGdldE5vZGUoXCJHcmlkXCIpLmNsYXNzTGlzdC50b2dnbGUoXCJncmlkLWludmlzXCIpO1xyXG5cdH0pXHJcblx0XHJcblx0SGVhcihcIkdyaWRcIiwgXCJtb3VzZWRvd25cIiwgZnVuY3Rpb24oZXZlbnQpe1xyXG5cdFx0Y3Vyc29yTGluZSA9IFtldmVudC50YXJnZXQueCwgZXZlbnQudGFyZ2V0LnldO1xyXG5cdH0pO1xyXG5cdEhlYXIoXCJHcmlkXCIsIFwibW91c2V1cFwiLCBmdW5jdGlvbihldmVudCl7XHJcblx0XHRMb2dpYy5maWxsKGN1cnNvckxpbmUsIFtldmVudC50YXJnZXQueCwgZXZlbnQudGFyZ2V0LnldKTtcclxuXHRcdGN1cnNvckxpbmUgPSBudWxsO1xyXG5cdH0pO1xyXG5cdEhlYXIoXCJHcmlkXCIsIFwiZHJhZ3N0YXJ0XCIsIGZ1bmN0aW9uKGV2ZW50KXtcclxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0fSk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ3JDb250cm9sbGVyO1xyXG5cclxuXHJcbmZ1bmN0aW9uIGdldE5vZGUoaWQpe1xyXG5cdHZhciBlbGVtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xyXG5cdGlmKCFlbGVtKSB0aHJvdyBuZXcgRXJyb3IoXCJFbGVtIGlzIG5vdCBmaW5kIVwiKTtcclxuXHRyZXR1cm4gZWxlbTtcclxufSIsInJlcXVpcmUoXCJ0eXBlc2pzXCIpO1xyXG5jb25zdCBSR0IgPSByZXF1aXJlKCdjaHJvbWF0aCcpLnJnYjtcclxuXHJcbnZhciBpZF9tYXAgPSBcIk1hcFwiO1xyXG52YXIgaWRfZ3JpZCA9IFwiR3JpZFwiO1xyXG52YXIgaWRfdGlsZXMgPSBcIlRpbGVzXCI7XHJcbnZhciBpZF9vYmplY3RzID0gXCJPYmplY3RzXCI7XHJcbnZhciBpZF9wYWxsZXQgPSBcIlBhbGxldFwiO1xyXG5cclxudmFyIHNpemUgPSAyMDtcclxuXHJcbmZ1bmN0aW9uIENyTWFwKGlkX21hcCwgc2l6ZSl7XHJcblx0dmFyIGNvbnRhaW5lciA9IGdldE5vZGUoaWRfbWFwKTtcclxuXHRcclxuXHR0aGlzLmFkZCA9IGZ1bmN0aW9uKG5ld190aWxlLCB4LCB5KXtcclxuXHRcdHZhciB0aWxlID0gZHJhd1RpbGUobmV3X3RpbGUpO1xyXG5cdFx0dGlsZS5zdHlsZS53aWR0aCA9IChuZXdfdGlsZS53aWR0aCAqICgxMDAgLyBzaXplKSkgKyBcIiVcIjtcclxuXHRcdHRpbGUuc3R5bGUuaGVpZ2h0ID0gKG5ld190aWxlLmhlaWdodCAqICgxMDAgLyBzaXplKSkgKyBcIiVcIjtcclxuXHRcdFxyXG5cdFx0dGlsZS5zdHlsZS5sZWZ0ID0gKHggKiAoMTAwIC8gc2l6ZSkpICsgXCIlXCI7XHJcblx0XHR0aWxlLnN0eWxlLnRvcCA9ICh5ICogKDEwMCAvIHNpemUpKSArIFwiJVwiO1xyXG5cdFx0XHJcblx0XHRjb250YWluZXIuYXBwZW5kQ2hpbGQodGlsZSk7XHJcblx0fVxyXG5cdFxyXG5cdFxyXG5cdGZ1bmN0aW9uIE5vcm1UaWxlKHRpbGUpe1xyXG5cdFx0dmFyIGJveCA9IGdldENvbXB1dGVkU3R5bGUodGlsZSk7XHJcblx0XHR0aWxlLnN0eWxlLmxlZnQgPSBOb3JtQ29vcmQocGFyc2VGbG9hdChib3gubGVmdCksIHBhcnNlRmxvYXQoYm94LndpZHRoKSkgKyBcIiVcIjtcclxuXHRcdHRpbGUuc3R5bGUudG9wID0gTm9ybUNvb3JkKHBhcnNlRmxvYXQoYm94LnRvcCksIHBhcnNlRmxvYXQoYm94LmhlaWdodCkpICsgXCIlXCI7XHJcblx0fVxyXG5cdFxyXG5cdGZ1bmN0aW9uIE5vcm1Db29yZChjb29yZCwgcyl7XHJcblx0XHR2YXIgY29uX3NpemUgPSBwYXJzZUZsb2F0KGdldENvbXB1dGVkU3R5bGUoY29udGFpbmVyKS53aWR0aCk7XHJcblx0XHRcclxuXHRcdGlmKGNvb3JkICsgcyA+IGNvbl9zaXplKSBjb29yZCA9IGNvbl9zaXplIC0gcztcclxuXHRcdGlmKGNvb3JkIDwgMCkgY29vcmQgPSAwO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gTWF0aC5yb3VuZCgoY29vcmQgLyBjb25fc2l6ZSkgKiBzaXplKSAqICgxMDAgLyBzaXplKTtcclxuXHR9XHJcblx0XHJcbn1cclxuXHJcbmZ1bmN0aW9uIENyVGlsZXMoaWRfY29udGFpbmVyKXtcclxuXHR2YXIgY29udGFpbmVyID0gZ2V0Tm9kZShpZF9jb250YWluZXIpO1xyXG5cdFxyXG5cdHRoaXMuYWRkID0gZnVuY3Rpb24oVGlsZXNldCl7XHJcblx0XHR2YXIgY2F0ZWcgPSBkcmF3Q2F0ZWcoVGlsZXNldCk7XHJcblx0XHRjb250YWluZXIuYXBwZW5kQ2hpbGQoY2F0ZWcpO1xyXG5cdH1cclxufVxyXG5cclxuLypmdW5jdGlvbiBDclBhbGxldCgpe1xyXG5cdHZhciBjb250YWluZXIgPSBnZXROb2RlKGlkX3BhbGxldCk7XHJcblx0XHJcblx0dGhpcy5hZGQgPSBmdW5jdGlvbihjYXRlZywgdGlsZSl7XHJcblx0XHRjb250YWluZXIuYXBwZW5kQ2hpbGQoZHJhd1RpbGUodGlsZSkpO1xyXG5cdH1cclxufSovXHJcblxyXG5kcmF3R3JpZChnZXROb2RlKGlkX2dyaWQpLCBzaXplKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdG1hcDogbmV3IENyTWFwKGlkX21hcCwgc2l6ZSksIFxyXG5cdHRpbGVzOiBuZXcgQ3JUaWxlcyhpZF90aWxlcyksXHJcblx0b2JqZWN0czogbmV3IENyVGlsZXMoaWRfb2JqZWN0cyksXHJcblx0b3BlbkpTT046IE9wZW5GaWxlSlNPTixcclxuXHRzYXZlOiBTYXZlLFxyXG5cdGNyU3dpdGNoOiBDclN3aXRjaFR3b1xyXG59O1xyXG5cclxuZnVuY3Rpb24gZHJhd0dyaWQoY29udGFpbmVyLCBncmlkX3NpemUpe1xyXG5cdFx0dmFyIHNpemUgPSAxMDAgLyBncmlkX3NpemU7XHJcblx0XHRmb3IodmFyIGkgPSBncmlkX3NpemUgLSAxOyBpID49IDA7IGktLSl7XHJcblx0XHRcdGZvcih2YXIgaiA9IGdyaWRfc2l6ZSAtIDE7IGogPj0gMDsgai0tKXtcclxuXHRcdFx0XHR2YXIgYm94ID0gZGFyd0JveChpKnNpemUsIGoqc2l6ZSwgc2l6ZSk7XHJcblx0XHRcdFx0Ym94LnggPSBpO1xyXG5cdFx0XHRcdGJveC55ID0gajtcclxuXHRcdFx0XHRjb250YWluZXIuYXBwZW5kQ2hpbGQoYm94KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuZnVuY3Rpb24gZGFyd0JveCh4LCB5LCBzaXplKXtcclxuXHR2YXIgYm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblx0Ym94LmNsYXNzTGlzdC5hZGQoXCJib3hcIik7XHJcblx0Ym94LnN0eWxlLndpZHRoID0gc2l6ZSArIFwiJVwiO1xyXG5cdGJveC5zdHlsZS5oZWlnaHQgPSBzaXplICsgXCIlXCI7XHJcblx0XHJcblx0Ym94LnN0eWxlLmxlZnQgPSB4ICsgXCIlXCI7XHJcblx0Ym94LnN0eWxlLnRvcCA9IHkgKyBcIiVcIjtcclxuXHRcclxuXHRyZXR1cm4gYm94O1xyXG59XHJcblxyXG5mdW5jdGlvbiBPcGVuRmlsZUpTT04oT3Blbil7XHJcblx0cmV0dXJuIGZ1bmN0aW9uKCl7XHJcblx0XHRpZih0aGlzLmZpbGVzWzBdKXtcclxuXHRcdFx0dmFyIG5hbWUgPSB0aGlzLmZpbGVzWzBdLm5hbWU7XHJcblx0XHRcdHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG5cdFx0XHRcclxuXHRcdFx0cmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKGUpe1xyXG5cdFx0XHRcdHZhciBmaWxlID0gSlNPTi5wYXJzZShlLnRhcmdldC5yZXN1bHQpO1xyXG5cdFx0XHRcdGZpbGUubmFtZSA9IG5hbWU7XHJcblx0XHRcdFx0T3BlbihmaWxlKTtcclxuXHRcdFx0fTtcclxuXHRcdFx0cmVhZGVyLnJlYWRBc1RleHQodGhpcy5maWxlc1swXSk7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5mdW5jdGlvbiBTYXZlKG5hbWUsIHRleHQpe1xyXG5cdHZhciBibG9iID0gbmV3IEJsb2IoW3RleHRdLCB7dHlwZTogXCJ0ZXh0L3BsYWluO2NoYXJzZXQ9dXRmLThcIn0pO1xyXG5cdEZpbGVTYXZlci5zYXZlQXMoYmxvYiwgbmFtZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIENyU3dpdGNoVHdvKGlkLCBmaXJzdF9pZCwgbmFtZV9jbGFzcyl7XHJcblx0dmFyIGVsZW0gPSBnZXROb2RlKGlkKS5jbGFzc0xpc3Q7XHJcblx0dmFyIGZpcnN0X2VsZW0gPSBnZXROb2RlKGZpcnN0X2lkKS5jbGFzc0xpc3Q7XHJcblx0cmV0dXJuIGZ1bmN0aW9uKCl7XHJcblx0XHRlbGVtLnRvZ2dsZShuYW1lX2NsYXNzKTtcclxuXHRcdGZpcnN0X2VsZW0udG9nZ2xlKG5hbWVfY2xhc3MpO1xyXG5cdH1cclxufVxyXG5cclxuZnVuY3Rpb24gZHJhd0NhdGVnKG5ld190aWxlc2V0KXtcclxuXHR2YXIgY2F0ZWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHRjYXRlZy5jbGFzc0xpc3QuYWRkKFwicGFuZWwtY29sdW1uXCIpO1xyXG5cdFxyXG5cdHZhciB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gzJyk7XHJcblx0dGl0bGUuaW5uZXJIVE1MID0gbmV3X3RpbGVzZXQubmFtZTtcclxuXHR0aXRsZS5jbGFzc0xpc3QuYWRkKFwidGl0bGUtY2F0ZWdcIik7XHJcblx0XHJcblx0XHJcblx0Ly92YXIgY2xvc2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcclxuXHQvL2Nsb3NlLmlubmVySFRNTCA9IFwiLVwiO1xyXG5cdC8vdGl0bGUuYXBwZW5kQ2hpbGQoY2xvc2UpO1xyXG5cdFxyXG5cdGNhdGVnLmFwcGVuZENoaWxkKHRpdGxlKTtcclxuXHRcclxuXHR2YXIgbGlzdCA9IGRyYXdUaWxlcyhuZXdfdGlsZXNldC50aWxlcyk7XHJcblx0bGlzdC5zZXRBdHRyaWJ1dGUoXCJjYXRlZ1wiLCBuZXdfdGlsZXNldC5pZCk7XHJcblx0XHJcblx0dGl0bGUuc3dpdCA9IGZ1bmN0aW9uKCl7XHJcblx0XHRsaXN0LmNsYXNzTGlzdC50b2dnbGUoXCJpbnZpc1wiKTtcclxuXHR9XHJcblx0XHJcblx0Y2F0ZWcuYXBwZW5kQ2hpbGQobGlzdCk7XHJcblx0XHJcblx0cmV0dXJuIGNhdGVnO1xyXG59XHJcblxyXG5mdW5jdGlvbiBkcmF3VGlsZXModGlsZXMpe1xyXG5cdHZhciBsaXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblx0bGlzdC5jbGFzc0xpc3QuYWRkKFwicGFuZWwtd3JhcFwiKTtcclxuXHRcclxuXHR0aWxlcy5tYXAoZHJhd1RpbGUpLmZvckVhY2gobGlzdC5hcHBlbmRDaGlsZC5iaW5kKGxpc3QpKTtcclxuXHRyZXR1cm4gbGlzdDtcclxufVxyXG5cclxuZnVuY3Rpb24gZHJhd1RpbGUobmV3X3RpbGUpe1xyXG5cdFxyXG5cdGlmKG5ld190aWxlLnR5cGUgPT0gXCJjb2xvclwiKXtcclxuXHRcdHZhciBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHRcdGltZy5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBuZXcgUkdCKG5ld190aWxlLmNvbG9yKS50b1N0cmluZygpO1xyXG5cdH1cclxuXHRpZihuZXdfdGlsZS50eXBlID09IFwic3ZnXCIgfHwgbmV3X3RpbGUudHlwZSA9PSBcInBoaXNpY1wiKXtcclxuXHRcdHZhciBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcclxuXHRcdGltZy5zcmMgPSBuZXdfdGlsZS5pbWc7XHJcblx0fVxyXG5cclxuXHRpbWcuY2xhc3NMaXN0LmFkZChcInRpbGVcIik7XHJcblx0aW1nLnNldEF0dHJpYnV0ZShcInRpbGVcIiwgbmV3X3RpbGUuaWQpO1xyXG5cdGltZy5zZXRBdHRyaWJ1dGUoXCJkcmFnZ2FibGVcIiwgdHJ1ZSk7XHJcblx0XHJcblx0cmV0dXJuIGltZztcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Tm9kZShpZCl7XHJcblx0dmFyIGVsZW0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XHJcblx0aWYoIWVsZW0pIHRocm93IG5ldyBFcnJvcihcIkVsZW0gaXMgbm90IGZpbmQhXCIpO1xyXG5cdHJldHVybiBlbGVtO1xyXG59XHJcbiIsIlxyXG5mdW5jdGlvbiBJZEV2ZW50KGlkLCBuYW1lX2V2ZW50LCBmdW5jKXtcclxuXHRcclxuXHRpZihuYW1lX2V2ZW50ID09IFwic3VibWl0XCIpe1xyXG5cdFx0dmFyIG9sZF9mdW5jID0gZnVuYztcclxuXHRcdGZ1bmMgPSBmdW5jdGlvbihlKXtcclxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRvbGRfZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG5cdFx0fSBcclxuXHR9XHJcblx0XHJcblx0aWYoQXJyYXkuaXNBcnJheShuYW1lX2V2ZW50KSl7XHJcblx0XHRuYW1lX2V2ZW50LmZvckVhY2gobmFtZSA9PiBnZXROb2RlKGlkKS5hZGRFdmVudExpc3RlbmVyKG5hbWUsIGZ1bmMpKTtcclxuXHR9XHJcblx0ZWxzZSBnZXROb2RlKGlkKS5hZGRFdmVudExpc3RlbmVyKG5hbWVfZXZlbnQsIGZ1bmMpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBTdWJtaXQoZnVuYyl7XHJcblx0cmV0dXJuIGZ1bmN0aW9uKGV2ZW50KXtcclxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcblx0fVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXROb2RlKGlkKXtcclxuXHR2YXIgZWxlbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcclxuXHRpZighZWxlbSkgdGhyb3cgbmV3IEVycm9yKFwiRWxlbSBpcyBub3QgZmluZCFcIik7XHJcblx0cmV0dXJuIGVsZW07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSWRFdmVudDtcclxuIiwidmFyIFRpbGVzZXRzID0gW107XHJcbnZhciBNYXAgPSBBcnJheS5jcmVhdGUoQXJyYXkuY3JlYXRlLmJpbmQobnVsbCwgbnVsbCwgMjApLCAyMCk7XHJcblxyXG5mdW5jdGlvbiBDckxvZ2ljKERyYXcpe1xyXG5cdHZhciBjdXJyZW50X3RpbGUgPSBudWxsO1xyXG5cdHZhciBjdXJyZW50X29ianMgPSBudWxsO1xyXG5cdFxyXG5cdHRoaXMuYWRkVGlsZXNldCA9IGZ1bmN0aW9uKFRpbGVzZXQpe1xyXG5cdFx0dmFyIG9ianMgPSBUaWxlc2V0LnRpbGVzLmZpbHRlcih0aWxlID0+IHRpbGUudHlwZSA9PSBcInBoaXNpY1wiKTtcclxuXHRcdHZhciBPYmpTZXQgPSBPYmplY3QuYXNzaWduKHt9LCBUaWxlc2V0KTtcclxuXHRcdE9ialNldC50aWxlcyA9IG9ianM7XHJcblxyXG5cdFx0VGlsZXNldC50aWxlcyA9IFRpbGVzZXQudGlsZXMuZmlsdGVyKHRpbGUgPT4gdGlsZS50eXBlICE9IFwicGhpc2ljXCIpO1xyXG5cclxuXHRcdGNvbnNvbGUubG9nKFRpbGVzZXQsIE9ialNldCk7XHJcblxyXG5cdFx0VGlsZXNldC5pZCA9IFRpbGVzZXRzLmFkZChUaWxlc2V0KTtcclxuXHRcdERyYXcudGlsZXMuYWRkKFRpbGVzZXQpO1xyXG5cclxuXHRcdE9ialNldC5pZCA9IFRpbGVzZXRzLmFkZChPYmpTZXQpO1xyXG5cdFx0RHJhdy5vYmplY3RzLmFkZChPYmpTZXQpO1xyXG5cdH1cclxuXHRcclxuXHR0aGlzLmNoYW5nZVRpbGUgPSBmdW5jdGlvbihpZF9jYXRlZywgaWRfdGlsZSl7XHJcblx0XHRjdXJyZW50X3RpbGUgPSBUaWxlc2V0c1tpZF9jYXRlZ10udGlsZXNbaWRfdGlsZV07XHJcblx0XHRcclxuXHRcdGRlZlNpemUoY3VycmVudF90aWxlLCBpZF9jYXRlZylcclxuXHRcdFxyXG5cdH1cclxuXHJcblx0dGhpcy5jaGFuZ2VPYmpzID0gZnVuY3Rpb24oaWRfY2F0ZWcsIGlkX3RpbGUpe1xyXG5cdFx0Y3VycmVudF9vYmpzID0gVGlsZXNldHNbaWRfY2F0ZWddLnRpbGVzW2lkX3RpbGVdO1xyXG5cdFx0XHJcblx0XHRkZWZTaXplKGN1cnJlbnRfb2JqcywgaWRfY2F0ZWcpO1xyXG5cdFx0XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBkZWZTaXplKHRpbGUsIGlkX2NhdGVnKXtcclxuXHRcdGlmKCF0aWxlLndpZHRoKSB0aWxlLndpZHRoID0gVGlsZXNldHNbaWRfY2F0ZWddLndpZHRoO1xyXG5cdFx0aWYoIXRpbGUuaGVpZ2h0KSB0aWxlLmhlaWdodCA9IFRpbGVzZXRzW2lkX2NhdGVnXS5oZWlnaHQ7XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMuZmlsbCA9IGZ1bmN0aW9uKGJlZywgZW5kKXtcclxuXHRcdGlmKGN1cnJlbnRfdGlsZSl7XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgaW5jX3ggPSBjdXJyZW50X3RpbGUud2lkdGg7XHJcblx0XHRcdHZhciBpbmNfeSA9IGN1cnJlbnRfdGlsZS5oZWlnaHQ7XHJcblx0XHRcdFxyXG5cdFx0XHRmb3IodmFyIGkgPSBiZWdbMF07IGkgKyBpbmNfeCA8PSBlbmRbMF0gKyAxOyBpID0gaSArIGluY194KXtcclxuXHRcdFx0XHRmb3IodmFyIGogPSBiZWdbMV07IGogKyBpbmNfeSA8PSBlbmRbMV0gKyAxOyBqID0gaiArIGluY195KXtcclxuXHRcdFx0XHRcdGRyYXdUaWxlKGksIGosIGN1cnJlbnRfdGlsZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0ZnVuY3Rpb24gZHJhd1RpbGUoeCwgeSwgdGlsZSl7XHJcblx0XHR4ID0gTWF0aC5mbG9vcih4KTtcclxuXHRcdHkgPSBNYXRoLmZsb29yKHkpO1xyXG5cclxuXHRcdHZhciBib3ggPSB7dGlsZTogdGlsZX07XHJcblx0XHRcclxuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCB0aWxlLndpZHRoOyBpKyspe1xyXG5cdFx0XHRmb3IodmFyIGogPSAwOyBqIDwgdGlsZS5oZWlnaHQ7IGorKyl7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0TWFwW2oreV1baSt4XSA9IGJveDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHREcmF3Lm1hcC5hZGQodGlsZSwgeCwgeSk7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENyTG9naWM7XHJcbiIsImNvbnN0IERyYXcgPSByZXF1aXJlKFwiLi9EcmF3LmpzXCIpO1xyXG5jb25zdCBDckxvZ2ljID0gcmVxdWlyZShcIi4vTG9naWMuanNcIik7XHJcbmNvbnN0IENyQ29udHIgPSByZXF1aXJlKFwiLi9Db250cm9sLmpzXCIpO1xyXG5cclxudmFyIFRpbGVzZXQgPSByZXF1aXJlKFwiLi90aWxlc2V0Lmpzb25cIik7XHJcbnZhciBMb2dpYyA9IG5ldyBDckxvZ2ljKERyYXcpO1xyXG5DckNvbnRyKExvZ2ljLCBEcmF3KTtcclxuIiwidmFyIENocm9tYXRoID0gcmVxdWlyZSgnLi9zcmMvY2hyb21hdGguanMnKTtcbm1vZHVsZS5leHBvcnRzID0gQ2hyb21hdGg7XG4iLCJ2YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuLypcbiAgIENsYXNzOiBDaHJvbWF0aFxuKi9cbi8vIEdyb3VwOiBDb25zdHJ1Y3RvcnNcbi8qXG4gICBDb25zdHJ1Y3RvcjogQ2hyb21hdGhcbiAgIENyZWF0ZSBhIG5ldyBDaHJvbWF0aCBpbnN0YW5jZSBmcm9tIGEgc3RyaW5nIG9yIGludGVnZXJcblxuICAgUGFyYW1ldGVyczpcbiAgIG1peGVkIC0gVGhlIHZhbHVlIHRvIHVzZSBmb3IgY3JlYXRpbmcgdGhlIGNvbG9yXG5cbiAgIFJldHVybnM6XG4gICA8Q2hyb21hdGg+IGluc3RhbmNlXG5cbiAgIFByb3BlcnRpZXM6XG4gICByIC0gVGhlIHJlZCBjaGFubmVsIG9mIHRoZSBSR0IgcmVwcmVzZW50YXRpb24gb2YgdGhlIENocm9tYXRoLiBBIG51bWJlciBiZXR3ZWVuIDAgYW5kIDI1NS5cbiAgIGcgLSBUaGUgZ3JlZW4gY2hhbm5lbCBvZiB0aGUgUkdCIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBDaHJvbWF0aC4gQSBudW1iZXIgYmV0d2VlbiAwIGFuZCAyNTUuXG4gICBiIC0gVGhlIGJsdWUgY2hhbm5lbCBvZiB0aGUgUkdCIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBDaHJvbWF0aC4gQSBudW1iZXIgYmV0d2VlbiAwIGFuZCAyNTUuXG4gICBhIC0gVGhlIGFscGhhIGNoYW5uZWwgb2YgdGhlIENocm9tYXRoLiBBIG51bWJlciBiZXR3ZWVuIDAgYW5kIDEuXG4gICBoIC0gVGhlIGh1ZSBvZiB0aGUgQ2hyb21hdGguIEEgbnVtYmVyIGJldHdlZW4gMCBhbmQgMzYwLlxuICAgc2wgLSBUaGUgc2F0dXJhdGlvbiBvZiB0aGUgSFNMIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBDaHJvbWF0aC4gQSBudW1iZXIgYmV0d2VlbiAwIGFuZCAxLlxuICAgc3YgLSBUaGUgc2F0dXJhdGlvbiBvZiB0aGUgSFNWL0hTQiByZXByZXNlbnRhdGlvbiBvZiB0aGUgQ2hyb21hdGguIEEgbnVtYmVyIGJldHdlZW4gMCBhbmQgMS5cbiAgIGwgLSBUaGUgbGlnaHRuZXNzIG9mIHRoZSBIU0wgcmVwcmVzZW50YXRpb24gb2YgdGhlIENocm9tYXRoLiBBIG51bWJlciBiZXR3ZWVuIDAgYW5kIDEuXG4gICB2IC0gVGhlIGxpZ2h0bmVzcyBvZiB0aGUgSFNWL0hTQiByZXByZXNlbnRhdGlvbiBvZiB0aGUgQ2hyb21hdGguIEEgbnVtYmVyIGJldHdlZW4gMCBhbmQgMS5cblxuICAgRXhhbXBsZXM6XG4gIChzdGFydCBjb2RlKVxuLy8gVGhlcmUgYXJlIG1hbnkgd2F5cyB0byBjcmVhdGUgYSBDaHJvbWF0aCBpbnN0YW5jZVxubmV3IENocm9tYXRoKCcjRkYwMDAwJyk7ICAgICAgICAgICAgICAgICAgLy8gSGV4ICg2IGNoYXJhY3RlcnMgd2l0aCBoYXNoKVxubmV3IENocm9tYXRoKCdGRjAwMDAnKTsgICAgICAgICAgICAgICAgICAgLy8gSGV4ICg2IGNoYXJhY3RlcnMgd2l0aG91dCBoYXNoKVxubmV3IENocm9tYXRoKCcjRjAwJyk7ICAgICAgICAgICAgICAgICAgICAgLy8gSGV4ICgzIGNoYXJhY3RlcnMgd2l0aCBoYXNoKVxubmV3IENocm9tYXRoKCdGMDAnKTsgICAgICAgICAgICAgICAgICAgICAgLy8gSGV4ICgzIGNoYXJhY3RlcnMgd2l0aG91dCBoYXNoKVxubmV3IENocm9tYXRoKCdyZWQnKTsgICAgICAgICAgICAgICAgICAgICAgLy8gQ1NTL1NWRyBDb2xvciBuYW1lXG5uZXcgQ2hyb21hdGgoJ3JnYigyNTUsIDAsIDApJyk7ICAgICAgICAgICAvLyBSR0IgdmlhIENTU1xubmV3IENocm9tYXRoKHtyOiAyNTUsIGc6IDAsIGI6IDB9KTsgICAgICAgLy8gUkdCIHZpYSBvYmplY3Rcbm5ldyBDaHJvbWF0aCgncmdiYSgyNTUsIDAsIDAsIDEpJyk7ICAgICAgIC8vIFJHQkEgdmlhIENTU1xubmV3IENocm9tYXRoKHtyOiAyNTUsIGc6IDAsIGI6IDAsIGE6IDF9KTsgLy8gUkdCQSB2aWEgb2JqZWN0XG5uZXcgQ2hyb21hdGgoJ2hzbCgwLCAxMDAlLCA1MCUpJyk7ICAgICAgICAvLyBIU0wgdmlhIENTU1xubmV3IENocm9tYXRoKHtoOiAwLCBzOiAxLCBsOiAwLjV9KTsgICAgICAgLy8gSFNMIHZpYSBvYmplY3Rcbm5ldyBDaHJvbWF0aCgnaHNsYSgwLCAxMDAlLCA1MCUsIDEpJyk7ICAgIC8vIEhTTEEgdmlhIENTU1xubmV3IENocm9tYXRoKHtoOiAwLCBzOiAxLCBsOiAwLjUsIGE6IDF9KTsgLy8gSFNMQSB2aWEgb2JqZWN0XG5uZXcgQ2hyb21hdGgoJ2hzdigwLCAxMDAlLCAxMDAlKScpOyAgICAgICAvLyBIU1YgdmlhIENTU1xubmV3IENocm9tYXRoKHtoOiAwLCBzOiAxLCB2OiAxfSk7ICAgICAgICAgLy8gSFNWIHZpYSBvYmplY3Rcbm5ldyBDaHJvbWF0aCgnaHN2YSgwLCAxMDAlLCAxMDAlLCAxKScpOyAgIC8vIEhTVkEgdmlhIENTU1xubmV3IENocm9tYXRoKHtoOiAwLCBzOiAxLCB2OiAxLCBhOiAxfSk7ICAgLy8gSFNWQSB2aWEgb2JqZWN0XG5uZXcgQ2hyb21hdGgoJ2hzYigwLCAxMDAlLCAxMDAlKScpOyAgICAgICAvLyBIU0IgdmlhIENTU1xubmV3IENocm9tYXRoKHtoOiAwLCBzOiAxLCBiOiAxfSk7ICAgICAgICAgLy8gSFNCIHZpYSBvYmplY3Rcbm5ldyBDaHJvbWF0aCgnaHNiYSgwLCAxMDAlLCAxMDAlLCAxKScpOyAgIC8vIEhTQkEgdmlhIENTU1xubmV3IENocm9tYXRoKHtoOiAwLCBzOiAxLCBiOiAxLCBhOiAxfSk7ICAgLy8gSFNCQSB2aWEgb2JqZWN0XG5uZXcgQ2hyb21hdGgoMTY3MTE2ODApOyAgICAgICAgICAgICAgICAgICAvLyBSR0IgdmlhIGludGVnZXIgKGFscGhhIGN1cnJlbnRseSBpZ25vcmVkKVxuKGVuZCBjb2RlKVxuKi9cbmZ1bmN0aW9uIENocm9tYXRoKCBtaXhlZCApXG57XG4gICAgdmFyIGNoYW5uZWxzLCBjb2xvciwgaHNsLCBoc3YsIHJnYjtcblxuICAgIGlmICh1dGlsLmlzU3RyaW5nKG1peGVkKSB8fCB1dGlsLmlzTnVtYmVyKG1peGVkKSkge1xuICAgICAgICBjaGFubmVscyA9IENocm9tYXRoLnBhcnNlKG1peGVkKTtcbiAgICB9IGVsc2UgaWYgKHV0aWwuaXNBcnJheShtaXhlZCkpe1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vuc3VyZSBob3cgdG8gcGFyc2UgYXJyYXkgYCcrbWl4ZWQrJ2AnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICcsIHBsZWFzZSBwYXNzIGFuIG9iamVjdCBvciBDU1Mgc3R5bGUgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnb3IgdHJ5IENocm9tYXRoLnJnYiwgQ2hyb21hdGguaHNsLCBvciBDaHJvbWF0aC5oc3YnXG4gICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgfSBlbHNlIGlmIChtaXhlZCBpbnN0YW5jZW9mIENocm9tYXRoKSB7XG4gICAgICAgIGNoYW5uZWxzID0gdXRpbC5tZXJnZSh7fSwgbWl4ZWQpO1xuICAgIH0gZWxzZSBpZiAodXRpbC5pc09iamVjdChtaXhlZCkpe1xuICAgICAgICBjaGFubmVscyA9IHV0aWwubWVyZ2Uoe30sIG1peGVkKTtcbiAgICB9XG5cbiAgICBpZiAoISBjaGFubmVscylcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgcGFyc2UgYCcrbWl4ZWQrJ2AnKTtcbiAgICBlbHNlIGlmICghaXNGaW5pdGUoY2hhbm5lbHMuYSkpXG4gICAgICAgIGNoYW5uZWxzLmEgPSAxO1xuXG4gICAgaWYgKCdyJyBpbiBjaGFubmVscyApe1xuICAgICAgICByZ2IgPSB1dGlsLnJnYi5zY2FsZWQwMShbY2hhbm5lbHMuciwgY2hhbm5lbHMuZywgY2hhbm5lbHMuYl0pO1xuICAgICAgICBoc2wgPSBDaHJvbWF0aC5yZ2IyaHNsKHJnYik7XG4gICAgICAgIGhzdiA9IENocm9tYXRoLnJnYjJoc3YocmdiKTtcbiAgICB9IGVsc2UgaWYgKCdoJyBpbiBjaGFubmVscyApe1xuICAgICAgICBpZiAoJ2wnIGluIGNoYW5uZWxzKXtcbiAgICAgICAgICAgIGhzbCA9IHV0aWwuaHNsLnNjYWxlZChbY2hhbm5lbHMuaCwgY2hhbm5lbHMucywgY2hhbm5lbHMubF0pO1xuICAgICAgICAgICAgcmdiID0gQ2hyb21hdGguaHNsMnJnYihoc2wpO1xuICAgICAgICAgICAgaHN2ID0gQ2hyb21hdGgucmdiMmhzdihyZ2IpO1xuICAgICAgICB9IGVsc2UgaWYgKCd2JyBpbiBjaGFubmVscyB8fCAnYicgaW4gY2hhbm5lbHMpIHtcbiAgICAgICAgICAgIGlmICgnYicgaW4gY2hhbm5lbHMpIGNoYW5uZWxzLnYgPSBjaGFubmVscy5iO1xuICAgICAgICAgICAgaHN2ID0gdXRpbC5oc2wuc2NhbGVkKFtjaGFubmVscy5oLCBjaGFubmVscy5zLCBjaGFubmVscy52XSk7XG4gICAgICAgICAgICByZ2IgPSBDaHJvbWF0aC5oc3YycmdiKGhzdik7XG4gICAgICAgICAgICBoc2wgPSBDaHJvbWF0aC5yZ2IyaHNsKHJnYik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIHV0aWwubWVyZ2UodGhpcywge1xuICAgICAgICByOiAgcmdiWzBdLCAgZzogcmdiWzFdLCBiOiByZ2JbMl0sXG4gICAgICAgIGg6ICBoc2xbMF0sIHNsOiBoc2xbMV0sIGw6IGhzbFsyXSxcbiAgICAgICAgc3Y6IGhzdlsxXSwgIHY6IGhzdlsyXSwgYTogY2hhbm5lbHMuYVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59XG5cbi8qXG4gIENvbnN0cnVjdG9yOiBDaHJvbWF0aC5yZ2JcbiAgQ3JlYXRlIGEgbmV3IDxDaHJvbWF0aD4gaW5zdGFuY2UgZnJvbSBSR0IgdmFsdWVzXG5cbiAgUGFyYW1ldGVyczpcbiAgciAtIE51bWJlciwgMC0yNTUsIHJlcHJlc2VudGluZyB0aGUgZ3JlZW4gY2hhbm5lbCBPUiBBcnJheSBPUiBvYmplY3QgKHdpdGgga2V5cyByLGcsYikgb2YgUkdCIHZhbHVlc1xuICBnIC0gTnVtYmVyLCAwLTI1NSwgcmVwcmVzZW50aW5nIHRoZSBncmVlbiBjaGFubmVsXG4gIGIgLSBOdW1iZXIsIDAtMjU1LCByZXByZXNlbnRpbmcgdGhlIHJlZCBjaGFubmVsXG4gIGEgLSAoT3B0aW9uYWwpIEZsb2F0LCAwLTEsIHJlcHJlc2VudGluZyB0aGUgYWxwaGEgY2hhbm5lbFxuXG4gUmV0dXJuczpcbiA8Q2hyb21hdGg+XG5cbiBFeGFtcGxlczpcbiA+ID4gbmV3IENocm9tYXRoLnJnYigxMjMsIDIzNCwgNTYpLnRvU3RyaW5nKClcbiA+IFwiIzdCRUEzOFwiXG5cbiA+ID4gbmV3IENocm9tYXRoLnJnYihbMTIzLCAyMzQsIDU2XSkudG9TdHJpbmcoKVxuID4gXCIjN0JFQTM4XCJcblxuID4gPiBuZXcgQ2hyb21hdGgucmdiKHtyOiAxMjMsIGc6IDIzNCwgYjogNTZ9KS50b1N0cmluZygpXG4gPiBcIiM3QkVBMzhcIlxuICovXG5DaHJvbWF0aC5yZ2IgPSBmdW5jdGlvbiAociwgZywgYiwgYSlcbntcbiAgICB2YXIgcmdiYSA9IHV0aWwucmdiLmZyb21BcmdzKHIsIGcsIGIsIGEpO1xuICAgIHIgPSByZ2JhWzBdLCBnID0gcmdiYVsxXSwgYiA9IHJnYmFbMl0sIGEgPSByZ2JhWzNdO1xuXG4gICAgcmV0dXJuIG5ldyBDaHJvbWF0aCh7cjogciwgZzogZywgYjogYiwgYTogYX0pO1xufTtcblxuLypcbiAgQ29uc3RydWN0b3I6IENocm9tYXRoLnJnYmFcbiAgQWxpYXMgZm9yIDxDaHJvbWF0aC5yZ2I+XG4qL1xuQ2hyb21hdGgucmdiYSA9IENocm9tYXRoLnJnYjtcblxuLypcbiAgQ29uc3RydWN0b3I6IENocm9tYXRoLmhzbFxuICBDcmVhdGUgYSBuZXcgQ2hyb21hdGggaW5zdGFuY2UgZnJvbSBIU0wgdmFsdWVzXG5cbiAgUGFyYW1ldGVyczpcbiAgaCAtIE51bWJlciwgLUluZmluaXR5IC0gSW5maW5pdHksIHJlcHJlc2VudGluZyB0aGUgaHVlIE9SIEFycmF5IE9SIG9iamVjdCAod2l0aCBrZXlzIGgscyxsKSBvZiBIU0wgdmFsdWVzXG4gIHMgLSBOdW1iZXIsIDAtMSwgcmVwcmVzZW50aW5nIHRoZSBzYXR1cmF0aW9uXG4gIGwgLSBOdW1iZXIsIDAtMSwgcmVwcmVzZW50aW5nIHRoZSBsaWdodG5lc3NcbiAgYSAtIChPcHRpb25hbCkgRmxvYXQsIDAtMSwgcmVwcmVzZW50aW5nIHRoZSBhbHBoYSBjaGFubmVsXG5cbiAgUmV0dXJuczpcbiAgPENocm9tYXRoPlxuXG4gIEV4YW1wbGVzOlxuICA+ID4gbmV3IENocm9tYXRoLmhzbCgyNDAsIDEsIDAuNSkudG9TdHJpbmcoKVxuICA+IFwiIzAwMDBGRlwiXG5cbiAgPiA+IG5ldyBDaHJvbWF0aC5oc2woWzI0MCwgMSwgMC41XSkudG9TdHJpbmcoKVxuICA+IFwiIzAwMDBGRlwiXG5cbiAgPiBuZXcgQ2hyb21hdGguaHNsKHtoOjI0MCwgczoxLCBsOjAuNX0pLnRvU3RyaW5nKClcbiAgPiBcIiMwMDAwRkZcIlxuICovXG5DaHJvbWF0aC5oc2wgPSBmdW5jdGlvbiAoaCwgcywgbCwgYSlcbntcbiAgICB2YXIgaHNsYSA9IHV0aWwuaHNsLmZyb21BcmdzKGgsIHMsIGwsIGEpO1xuICAgIGggPSBoc2xhWzBdLCBzID0gaHNsYVsxXSwgbCA9IGhzbGFbMl0sIGEgPSBoc2xhWzNdO1xuXG4gICAgcmV0dXJuIG5ldyBDaHJvbWF0aCh7aDogaCwgczogcywgbDogbCwgYTogYX0pO1xufTtcblxuLypcbiAgQ29uc3RydWN0b3I6IENocm9tYXRoLmhzbGFcbiAgQWxpYXMgZm9yIDxDaHJvbWF0aC5oc2w+XG4qL1xuQ2hyb21hdGguaHNsYSA9IENocm9tYXRoLmhzbDtcblxuLypcbiAgQ29uc3RydWN0b3I6IENocm9tYXRoLmhzdlxuICBDcmVhdGUgYSBuZXcgQ2hyb21hdGggaW5zdGFuY2UgZnJvbSBIU1YgdmFsdWVzXG5cbiAgUGFyYW1ldGVyczpcbiAgaCAtIE51bWJlciwgLUluZmluaXR5IC0gSW5maW5pdHksIHJlcHJlc2VudGluZyB0aGUgaHVlIE9SIEFycmF5IE9SIG9iamVjdCAod2l0aCBrZXlzIGgscyxsKSBvZiBIU1YgdmFsdWVzXG4gIHMgLSBOdW1iZXIsIDAtMSwgcmVwcmVzZW50aW5nIHRoZSBzYXR1cmF0aW9uXG4gIHYgLSBOdW1iZXIsIDAtMSwgcmVwcmVzZW50aW5nIHRoZSBsaWdodG5lc3NcbiAgYSAtIChPcHRpb25hbCkgRmxvYXQsIDAtMSwgcmVwcmVzZW50aW5nIHRoZSBhbHBoYSBjaGFubmVsXG5cbiAgUmV0dXJuczpcbiAgPENocm9tYXRoPlxuXG4gIEV4YW1wbGVzOlxuICA+ID4gbmV3IENocm9tYXRoLmhzdigyNDAsIDEsIDEpLnRvU3RyaW5nKClcbiAgPiBcIiMwMDAwRkZcIlxuXG4gID4gPiBuZXcgQ2hyb21hdGguaHN2KFsyNDAsIDEsIDFdKS50b1N0cmluZygpXG4gID4gXCIjMDAwMEZGXCJcblxuICA+ID4gbmV3IENocm9tYXRoLmhzdih7aDoyNDAsIHM6MSwgdjoxfSkudG9TdHJpbmcoKVxuICA+IFwiIzAwMDBGRlwiXG4gKi9cbkNocm9tYXRoLmhzdiA9IGZ1bmN0aW9uIChoLCBzLCB2LCBhKVxue1xuICAgIHZhciBoc3ZhID0gdXRpbC5oc2wuZnJvbUFyZ3MoaCwgcywgdiwgYSk7XG4gICAgaCA9IGhzdmFbMF0sIHMgPSBoc3ZhWzFdLCB2ID0gaHN2YVsyXSwgYSA9IGhzdmFbM107XG5cbiAgICByZXR1cm4gbmV3IENocm9tYXRoKHtoOiBoLCBzOiBzLCB2OiB2LCBhOiBhfSk7XG59O1xuXG4vKlxuICBDb25zdHJ1Y3RvcjogQ2hyb21hdGguaHN2YVxuICBBbGlhcyBmb3IgPENocm9tYXRoLmhzdj5cbiovXG5DaHJvbWF0aC5oc3ZhID0gQ2hyb21hdGguaHN2O1xuXG4vKlxuICBDb25zdHJ1Y3RvcjogQ2hyb21hdGguaHNiXG4gIEFsaWFzIGZvciA8Q2hyb21hdGguaHN2PlxuICovXG5DaHJvbWF0aC5oc2IgPSBDaHJvbWF0aC5oc3Y7XG5cbi8qXG4gICBDb25zdHJ1Y3RvcjogQ2hyb21hdGguaHNiYVxuICAgQWxpYXMgZm9yIDxDaHJvbWF0aC5oc3ZhPlxuICovXG5DaHJvbWF0aC5oc2JhID0gQ2hyb21hdGguaHN2YTtcblxuLy8gR3JvdXA6IFN0YXRpYyBtZXRob2RzIC0gcmVwcmVzZW50YXRpb25cbi8qXG4gIE1ldGhvZDogQ2hyb21hdGgudG9JbnRlZ2VyXG4gIENvbnZlcnQgYSBjb2xvciBpbnRvIGFuIGludGVnZXIgKGFscGhhIGNoYW5uZWwgY3VycmVudGx5IG9taXR0ZWQpXG5cbiAgUGFyYW1ldGVyczpcbiAgY29sb3IgLSBBY2NlcHRzIHRoZSBzYW1lIGFyZ3VtZW50cyBhcyB0aGUgQ2hyb21hdGggY29uc3RydWN0b3JcblxuICBSZXR1cm5zOlxuICBpbnRlZ2VyXG5cbiAgRXhhbXBsZXM6XG4gID4gPiBDaHJvbWF0aC50b0ludGVnZXIoJ2dyZWVuJyk7XG4gID4gMzI3NjhcblxuICA+ID4gQ2hyb21hdGgudG9JbnRlZ2VyKCd3aGl0ZScpO1xuICA+IDE2Nzc3MjE1XG4qL1xuQ2hyb21hdGgudG9JbnRlZ2VyID0gZnVuY3Rpb24gKGNvbG9yKVxue1xuICAgIC8vIGNyZWF0ZSBzb21ldGhpbmcgbGlrZSAnMDA4MDAwJyAoZ3JlZW4pXG4gICAgdmFyIGhleDYgPSBuZXcgQ2hyb21hdGgoY29sb3IpLmhleCgpLmpvaW4oJycpO1xuXG4gICAgLy8gQXJndW1lbnRzIGJlZ2lubmluZyB3aXRoIGAweGAgYXJlIHRyZWF0ZWQgYXMgaGV4IHZhbHVlc1xuICAgIHJldHVybiBOdW1iZXIoJzB4JyArIGhleDYpO1xufTtcblxuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC50b05hbWVcbiAgUmV0dXJuIHRoZSBXM0MgY29sb3IgbmFtZSBvZiB0aGUgY29sb3IgaXQgbWF0Y2hlc1xuXG4gIFBhcmFtZXRlcnM6XG4gIGNvbXBhcmlzb25cblxuICBFeGFtcGxlczpcbiAgPiA+IENocm9tYXRoLnRvTmFtZSgncmdiKDI1NSwgMCwgMjU1KScpO1xuICA+ICdmdWNoc2lhJ1xuXG4gID4gPiBDaHJvbWF0aC50b05hbWUoNjU1MzUpO1xuICA+ICdhcXVhJ1xuKi9cbkNocm9tYXRoLnRvTmFtZSA9IGZ1bmN0aW9uIChjb21wYXJpc29uKVxue1xuICAgIGNvbXBhcmlzb24gPSArbmV3IENocm9tYXRoKGNvbXBhcmlzb24pO1xuICAgIGZvciAodmFyIGNvbG9yIGluIENocm9tYXRoLmNvbG9ycykgaWYgKCtDaHJvbWF0aFtjb2xvcl0gPT0gY29tcGFyaXNvbikgcmV0dXJuIGNvbG9yO1xufTtcblxuLy8gR3JvdXA6IFN0YXRpYyBtZXRob2RzIC0gY29sb3IgY29udmVyc2lvblxuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC5yZ2IyaGV4XG4gIENvbnZlcnQgYW4gUkdCIHZhbHVlIHRvIGEgSGV4IHZhbHVlXG5cbiAgUmV0dXJuczogYXJyYXlcblxuICBFeGFtcGxlOlxuICA+ID4gQ2hyb21hdGgucmdiMmhleCg1MCwgMTAwLCAxNTApXG4gID4gXCJbMzIsIDY0LCA5Nl1cIlxuICovXG5DaHJvbWF0aC5yZ2IyaGV4ID0gZnVuY3Rpb24gcmdiMmhleChyLCBnLCBiKVxue1xuICAgIHZhciByZ2IgPSB1dGlsLnJnYi5zY2FsZWQwMShyLCBnLCBiKTtcbiAgICB2YXIgaGV4ID0gcmdiLm1hcChmdW5jdGlvbiAocGN0KSB7XG4gICAgICB2YXIgZGVjID0gTWF0aC5yb3VuZChwY3QgKiAyNTUpO1xuICAgICAgdmFyIGhleCA9IGRlYy50b1N0cmluZygxNikudG9VcHBlckNhc2UoKTtcbiAgICAgIHJldHVybiB1dGlsLmxwYWQoaGV4LCAyLCAwKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBoZXg7XG59O1xuXG4vLyBDb252ZXJ0ZWQgZnJvbSBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0hTTF9hbmRfSFNWI0dlbmVyYWxfYXBwcm9hY2hcbi8qXG4gIE1ldGhvZDogQ2hyb21hdGgucmdiMmhzbFxuICBDb252ZXJ0IFJHQiB0byBIU0xcblxuICBQYXJhbWV0ZXJzOlxuICByIC0gTnVtYmVyLCAwLTI1NSwgcmVwcmVzZW50aW5nIHRoZSBncmVlbiBjaGFubmVsIE9SIEFycmF5IE9SIG9iamVjdCAod2l0aCBrZXlzIHIsZyxiKSBvZiBSR0IgdmFsdWVzXG4gIGcgLSBOdW1iZXIsIDAtMjU1LCByZXByZXNlbnRpbmcgdGhlIGdyZWVuIGNoYW5uZWxcbiAgYiAtIE51bWJlciwgMC0yNTUsIHJlcHJlc2VudGluZyB0aGUgcmVkIGNoYW5uZWxcblxuICBSZXR1cm5zOiBhcnJheVxuXG4gID4gPiBDaHJvbWF0aC5yZ2IyaHNsKDAsIDI1NSwgMCk7XG4gID4gWyAxMjAsIDEsIDAuNSBdXG5cbiAgPiA+IENocm9tYXRoLnJnYjJoc2woWzAsIDAsIDI1NV0pO1xuICA+IFsgMjQwLCAxLCAwLjUgXVxuXG4gID4gPiBDaHJvbWF0aC5yZ2IyaHNsKHtyOiAyNTUsIGc6IDAsIGI6IDB9KTtcbiAgPiBbIDAsIDEsIDAuNSBdXG4gKi9cbkNocm9tYXRoLnJnYjJoc2wgPSBmdW5jdGlvbiByZ2IyaHNsKHIsIGcsIGIpXG57XG4gICAgdmFyIHJnYiA9IHV0aWwucmdiLnNjYWxlZDAxKHIsIGcsIGIpO1xuICAgIHIgPSByZ2JbMF0sIGcgPSByZ2JbMV0sIGIgPSByZ2JbMl07XG5cbiAgICB2YXIgTSA9IE1hdGgubWF4KHIsIGcsIGIpO1xuICAgIHZhciBtID0gTWF0aC5taW4ociwgZywgYik7XG4gICAgdmFyIEMgPSBNIC0gbTtcbiAgICB2YXIgTCA9IDAuNSooTSArIG0pO1xuICAgIHZhciBTID0gKEMgPT09IDApID8gMCA6IEMvKDEtTWF0aC5hYnMoMipMLTEpKTtcblxuICAgIHZhciBoO1xuICAgIGlmIChDID09PSAwKSBoID0gMDsgLy8gc3BlYydkIGFzIHVuZGVmaW5lZCwgYnV0IHVzdWFsbHkgc2V0IHRvIDBcbiAgICBlbHNlIGlmIChNID09PSByKSBoID0gKChnLWIpL0MpICUgNjtcbiAgICBlbHNlIGlmIChNID09PSBnKSBoID0gKChiLXIpL0MpICsgMjtcbiAgICBlbHNlIGlmIChNID09PSBiKSBoID0gKChyLWcpL0MpICsgNDtcblxuICAgIHZhciBIID0gNjAgKiBoO1xuXG4gICAgcmV0dXJuIFtILCBwYXJzZUZsb2F0KFMpLCBwYXJzZUZsb2F0KEwpXTtcbn07XG5cbi8qXG4gIE1ldGhvZDogQ2hyb21hdGgucmdiMmhzdlxuICBDb252ZXJ0IFJHQiB0byBIU1ZcblxuICBQYXJhbWV0ZXJzOlxuICByIC0gTnVtYmVyLCAwLTI1NSwgcmVwcmVzZW50aW5nIHRoZSBncmVlbiBjaGFubmVsIE9SIEFycmF5IE9SIG9iamVjdCAod2l0aCBrZXlzIHIsZyxiKSBvZiBSR0IgdmFsdWVzXG4gIGcgLSBOdW1iZXIsIDAtMjU1LCByZXByZXNlbnRpbmcgdGhlIGdyZWVuIGNoYW5uZWxcbiAgYiAtIE51bWJlciwgMC0yNTUsIHJlcHJlc2VudGluZyB0aGUgcmVkIGNoYW5uZWxcblxuICBSZXR1cm5zOlxuICBBcnJheVxuXG4gID4gPiBDaHJvbWF0aC5yZ2IyaHN2KDAsIDI1NSwgMCk7XG4gID4gWyAxMjAsIDEsIDEgXVxuXG4gID4gPiBDaHJvbWF0aC5yZ2IyaHN2KFswLCAwLCAyNTVdKTtcbiAgPiBbIDI0MCwgMSwgMSBdXG5cbiAgPiA+IENocm9tYXRoLnJnYjJoc3Yoe3I6IDI1NSwgZzogMCwgYjogMH0pO1xuICA+IFsgMCwgMSwgMSBdXG4gKi9cbkNocm9tYXRoLnJnYjJoc3YgPSBmdW5jdGlvbiByZ2IyaHN2KHIsIGcsIGIpXG57XG4gICAgdmFyIHJnYiA9IHV0aWwucmdiLnNjYWxlZDAxKHIsIGcsIGIpO1xuICAgIHIgPSByZ2JbMF0sIGcgPSByZ2JbMV0sIGIgPSByZ2JbMl07XG5cbiAgICB2YXIgTSA9IE1hdGgubWF4KHIsIGcsIGIpO1xuICAgIHZhciBtID0gTWF0aC5taW4ociwgZywgYik7XG4gICAgdmFyIEMgPSBNIC0gbTtcbiAgICB2YXIgTCA9IE07XG4gICAgdmFyIFMgPSAoQyA9PT0gMCkgPyAwIDogQy9NO1xuXG4gICAgdmFyIGg7XG4gICAgaWYgKEMgPT09IDApIGggPSAwOyAvLyBzcGVjJ2QgYXMgdW5kZWZpbmVkLCBidXQgdXN1YWxseSBzZXQgdG8gMFxuICAgIGVsc2UgaWYgKE0gPT09IHIpIGggPSAoKGctYikvQykgJSA2O1xuICAgIGVsc2UgaWYgKE0gPT09IGcpIGggPSAoKGItcikvQykgKyAyO1xuICAgIGVsc2UgaWYgKE0gPT09IGIpIGggPSAoKHItZykvQykgKyA0O1xuXG4gICAgdmFyIEggPSA2MCAqIGg7XG5cbiAgICByZXR1cm4gW0gsIHBhcnNlRmxvYXQoUyksIHBhcnNlRmxvYXQoTCldO1xufTtcblxuLypcbiAgIE1ldGhvZDogQ2hyb21hdGgucmdiMmhzYlxuICAgQWxpYXMgZm9yIDxDaHJvbWF0aC5yZ2IyaHN2PlxuICovXG5DaHJvbWF0aC5yZ2IyaHNiID0gQ2hyb21hdGgucmdiMmhzdjtcblxuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC5oc2wycmdiXG4gIENvbnZlcnQgZnJvbSBIU0wgdG8gUkdCXG5cbiAgUGFyYW1ldGVyczpcbiAgaCAtIE51bWJlciwgLUluZmluaXR5IC0gSW5maW5pdHksIHJlcHJlc2VudGluZyB0aGUgaHVlIE9SIEFycmF5IE9SIG9iamVjdCAod2l0aCBrZXlzIGgscyxsKSBvZiBIU0wgdmFsdWVzXG4gIHMgLSBOdW1iZXIsIDAtMSwgcmVwcmVzZW50aW5nIHRoZSBzYXR1cmF0aW9uXG4gIGwgLSBOdW1iZXIsIDAtMSwgcmVwcmVzZW50aW5nIHRoZSBsaWdodG5lc3NcblxuICBSZXR1cm5zOlxuICBhcnJheVxuXG4gIEV4YW1wbGVzOlxuICA+ID4gQ2hyb21hdGguaHNsMnJnYigzNjAsIDEsIDAuNSk7XG4gID4gWyAyNTUsIDAsIDAgXVxuXG4gID4gPiBDaHJvbWF0aC5oc2wycmdiKFswLCAxLCAwLjVdKTtcbiAgPiBbIDI1NSwgMCwgMCBdXG5cbiAgPiA+IENocm9tYXRoLmhzbDJyZ2Ioe2g6IDIxMCwgczoxLCB2OiAwLjV9KTtcbiAgPiBbIDAsIDEyNy41LCAyNTUgXVxuICovXG4vLyBUT0RPOiBDYW4gSSAlPSBocCBhbmQgdGhlbiBkbyBhIHN3aXRjaD9cbkNocm9tYXRoLmhzbDJyZ2IgPSBmdW5jdGlvbiBoc2wycmdiKGgsIHMsIGwpXG57XG4gICAgdmFyIGhzbCA9IHV0aWwuaHNsLnNjYWxlZChoLCBzLCBsKTtcbiAgICBoPWhzbFswXSwgcz1oc2xbMV0sIGw9aHNsWzJdO1xuXG4gICAgdmFyIEMgPSAoMSAtIE1hdGguYWJzKDIqbC0xKSkgKiBzO1xuICAgIHZhciBocCA9IGgvNjA7XG4gICAgdmFyIFggPSBDICogKDEtTWF0aC5hYnMoaHAlMi0xKSk7XG4gICAgdmFyIHJnYiwgbTtcblxuICAgIHN3aXRjaCAoTWF0aC5mbG9vcihocCkpe1xuICAgIGNhc2UgMDogIHJnYiA9IFtDLFgsMF07IGJyZWFrO1xuICAgIGNhc2UgMTogIHJnYiA9IFtYLEMsMF07IGJyZWFrO1xuICAgIGNhc2UgMjogIHJnYiA9IFswLEMsWF07IGJyZWFrO1xuICAgIGNhc2UgMzogIHJnYiA9IFswLFgsQ107IGJyZWFrO1xuICAgIGNhc2UgNDogIHJnYiA9IFtYLDAsQ107IGJyZWFrO1xuICAgIGNhc2UgNTogIHJnYiA9IFtDLDAsWF07IGJyZWFrO1xuICAgIGRlZmF1bHQ6IHJnYiA9IFswLDAsMF07XG4gICAgfVxuXG4gICAgbSA9IGwgLSAoQy8yKTtcblxuICAgIHJldHVybiBbXG4gICAgICAgIChyZ2JbMF0rbSksXG4gICAgICAgIChyZ2JbMV0rbSksXG4gICAgICAgIChyZ2JbMl0rbSlcbiAgICBdO1xufTtcblxuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC5oc3YycmdiXG4gIENvbnZlcnQgSFNWIHRvIFJHQlxuXG4gIFBhcmFtZXRlcnM6XG4gIGggLSBOdW1iZXIsIC1JbmZpbml0eSAtIEluZmluaXR5LCByZXByZXNlbnRpbmcgdGhlIGh1ZSBPUiBBcnJheSBPUiBvYmplY3QgKHdpdGgga2V5cyBoLHMsdiBvciBoLHMsYikgb2YgSFNWIHZhbHVlc1xuICBzIC0gTnVtYmVyLCAwLTEsIHJlcHJlc2VudGluZyB0aGUgc2F0dXJhdGlvblxuICB2IC0gTnVtYmVyLCAwLTEsIHJlcHJlc2VudGluZyB0aGUgbGlnaHRuZXNzXG5cbiAgRXhhbXBsZXM6XG4gID4gPiBDaHJvbWF0aC5oc3YycmdiKDM2MCwgMSwgMSk7XG4gID4gWyAyNTUsIDAsIDAgXVxuXG4gID4gPiBDaHJvbWF0aC5oc3YycmdiKFswLCAxLCAwLjVdKTtcbiAgPiBbIDEyNy41LCAwLCAwIF1cblxuICA+ID4gQ2hyb21hdGguaHN2MnJnYih7aDogMjEwLCBzOiAwLjUsIHY6IDF9KTtcbiAgPiBbIDEyNy41LCAxOTEuMjUsIDI1NSBdXG4gKi9cbkNocm9tYXRoLmhzdjJyZ2IgPSBmdW5jdGlvbiBoc3YycmdiKGgsIHMsIHYpXG57XG4gICAgdmFyIGhzdiA9IHV0aWwuaHNsLnNjYWxlZChoLCBzLCB2KTtcbiAgICBoPWhzdlswXSwgcz1oc3ZbMV0sIHY9aHN2WzJdO1xuXG4gICAgdmFyIEMgPSB2ICogcztcbiAgICB2YXIgaHAgPSBoLzYwO1xuICAgIHZhciBYID0gQyooMS1NYXRoLmFicyhocCUyLTEpKTtcbiAgICB2YXIgcmdiLCBtO1xuXG4gICAgaWYgKGggPT0gdW5kZWZpbmVkKSAgICAgICAgIHJnYiA9IFswLDAsMF07XG4gICAgZWxzZSBpZiAoMCA8PSBocCAmJiBocCA8IDEpIHJnYiA9IFtDLFgsMF07XG4gICAgZWxzZSBpZiAoMSA8PSBocCAmJiBocCA8IDIpIHJnYiA9IFtYLEMsMF07XG4gICAgZWxzZSBpZiAoMiA8PSBocCAmJiBocCA8IDMpIHJnYiA9IFswLEMsWF07XG4gICAgZWxzZSBpZiAoMyA8PSBocCAmJiBocCA8IDQpIHJnYiA9IFswLFgsQ107XG4gICAgZWxzZSBpZiAoNCA8PSBocCAmJiBocCA8IDUpIHJnYiA9IFtYLDAsQ107XG4gICAgZWxzZSBpZiAoNSA8PSBocCAmJiBocCA8IDYpIHJnYiA9IFtDLDAsWF07XG5cbiAgICBtID0gdiAtIEM7XG5cbiAgICByZXR1cm4gW1xuICAgICAgICAocmdiWzBdK20pLFxuICAgICAgICAocmdiWzFdK20pLFxuICAgICAgICAocmdiWzJdK20pXG4gICAgXTtcbn07XG5cbi8qXG4gICBNZXRob2Q6IENocm9tYXRoLmhzYjJyZ2JcbiAgIEFsaWFzIGZvciA8Q2hyb21hdGguaHN2MnJnYj5cbiAqL1xuQ2hyb21hdGguaHNiMnJnYiA9IENocm9tYXRoLmhzdjJyZ2I7XG5cbi8qXG4gICAgUHJvcGVydHk6IENocm9tYXRoLmNvbnZlcnRcbiAgICBBbGlhc2VzIGZvciB0aGUgQ2hyb21hdGgueDJ5IGZ1bmN0aW9ucy5cbiAgICBVc2UgbGlrZSBDaHJvbWF0aC5jb252ZXJ0W3hdW3ldKGFyZ3MpIG9yIENocm9tYXRoLmNvbnZlcnQueC55KGFyZ3MpXG4qL1xuQ2hyb21hdGguY29udmVydCA9IHtcbiAgICByZ2I6IHtcbiAgICAgICAgaGV4OiBDaHJvbWF0aC5oc3YycmdiLFxuICAgICAgICBoc2w6IENocm9tYXRoLnJnYjJoc2wsXG4gICAgICAgIGhzdjogQ2hyb21hdGgucmdiMmhzdlxuICAgIH0sXG4gICAgaHNsOiB7XG4gICAgICAgIHJnYjogQ2hyb21hdGguaHNsMnJnYlxuICAgIH0sXG4gICAgaHN2OiB7XG4gICAgICAgIHJnYjogQ2hyb21hdGguaHN2MnJnYlxuICAgIH1cbn07XG5cbi8qIEdyb3VwOiBTdGF0aWMgbWV0aG9kcyAtIGNvbG9yIHNjaGVtZSAqL1xuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC5jb21wbGVtZW50XG4gIFJldHVybiB0aGUgY29tcGxlbWVudCBvZiB0aGUgZ2l2ZW4gY29sb3JcblxuICBSZXR1cm5zOiA8Q2hyb21hdGg+XG5cbiAgPiA+IENocm9tYXRoLmNvbXBsZW1lbnQobmV3IENocm9tYXRoKCdyZWQnKSk7XG4gID4geyByOiAwLCBnOiAyNTUsIGI6IDI1NSwgYTogMSwgaDogMTgwLCBzbDogMSwgc3Y6IDEsIGw6IDAuNSwgdjogMSB9XG5cbiAgPiA+IENocm9tYXRoLmNvbXBsZW1lbnQobmV3IENocm9tYXRoKCdyZWQnKSkudG9TdHJpbmcoKTtcbiAgPiAnIzAwRkZGRidcbiAqL1xuQ2hyb21hdGguY29tcGxlbWVudCA9IGZ1bmN0aW9uIChjb2xvcilcbntcbiAgICB2YXIgYyA9IG5ldyBDaHJvbWF0aChjb2xvcik7XG4gICAgdmFyIGhzbCA9IGMudG9IU0xPYmplY3QoKTtcblxuICAgIGhzbC5oID0gKGhzbC5oICsgMTgwKSAlIDM2MDtcblxuICAgIHJldHVybiBuZXcgQ2hyb21hdGgoaHNsKTtcbn07XG5cbi8qXG4gIE1ldGhvZDogQ2hyb21hdGgudHJpYWRcbiAgQ3JlYXRlIGEgdHJpYWQgY29sb3Igc2NoZW1lIGZyb20gdGhlIGdpdmVuIENocm9tYXRoLlxuXG4gIEV4YW1wbGVzOlxuICA+ID4gQ2hyb21hdGgudHJpYWQoQ2hyb21hdGgueWVsbG93KVxuICA+IFsgeyByOiAyNTUsIGc6IDI1NSwgYjogMCwgYTogMSwgaDogNjAsIHNsOiAxLCBzdjogMSwgbDogMC41LCB2OiAxIH0sXG4gID4gICB7IHI6IDAsIGc6IDI1NSwgYjogMjU1LCBhOiAxLCBoOiAxODAsIHNsOiAxLCBzdjogMSwgbDogMC41LCB2OiAxIH0sXG4gID4gICB7IHI6IDI1NSwgZzogMCwgYjogMjU1LCBhOiAxLCBoOiAzMDAsIHNsOiAxLCBzdjogMSwgbDogMC41LCB2OiAxIH0gXVxuXG4gPiA+IENocm9tYXRoLnRyaWFkKENocm9tYXRoLnllbGxvdykudG9TdHJpbmcoKTtcbiA+ICcjRkZGRjAwLCMwMEZGRkYsI0ZGMDBGRidcbiovXG5DaHJvbWF0aC50cmlhZCA9IGZ1bmN0aW9uIChjb2xvcilcbntcbiAgICB2YXIgYyA9IG5ldyBDaHJvbWF0aChjb2xvcik7XG5cbiAgICByZXR1cm4gW1xuICAgICAgICBjLFxuICAgICAgICBuZXcgQ2hyb21hdGgoe3I6IGMuYiwgZzogYy5yLCBiOiBjLmd9KSxcbiAgICAgICAgbmV3IENocm9tYXRoKHtyOiBjLmcsIGc6IGMuYiwgYjogYy5yfSlcbiAgICBdO1xufTtcblxuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC50ZXRyYWRcbiAgQ3JlYXRlIGEgdGV0cmFkIGNvbG9yIHNjaGVtZSBmcm9tIHRoZSBnaXZlbiBDaHJvbWF0aC5cblxuICBFeGFtcGxlczpcbiAgPiA+IENocm9tYXRoLnRldHJhZChDaHJvbWF0aC5jeWFuKVxuICA+IFsgeyByOiAwLCBnOiAyNTUsIGI6IDI1NSwgYTogMSwgaDogMTgwLCBzbDogMSwgc3Y6IDEsIGw6IDAuNSwgdjogMSB9LFxuICA+ICAgeyByOiAyNTUsIGc6IDAsIGI6IDI1NSwgYTogMSwgaDogMzAwLCBzbDogMSwgc3Y6IDEsIGw6IDAuNSwgdjogMSB9LFxuICA+ICAgeyByOiAyNTUsIGc6IDI1NSwgYjogMCwgYTogMSwgaDogNjAsIHNsOiAxLCBzdjogMSwgbDogMC41LCB2OiAxIH0sXG4gID4gICB7IHI6IDAsIGc6IDI1NSwgYjogMCwgYTogMSwgaDogMTIwLCBzbDogMSwgc3Y6IDEsIGw6IDAuNSwgdjogMSB9IF1cblxuICA+ID4gQ2hyb21hdGgudGV0cmFkKENocm9tYXRoLmN5YW4pLnRvU3RyaW5nKCk7XG4gID4gJyMwMEZGRkYsI0ZGMDBGRiwjRkZGRjAwLCMwMEZGMDAnXG4qL1xuQ2hyb21hdGgudGV0cmFkID0gZnVuY3Rpb24gKGNvbG9yKVxue1xuICAgIHZhciBjID0gbmV3IENocm9tYXRoKGNvbG9yKTtcblxuICAgIHJldHVybiBbXG4gICAgICAgIGMsXG4gICAgICAgIG5ldyBDaHJvbWF0aCh7cjogYy5iLCBnOiBjLnIsIGI6IGMuYn0pLFxuICAgICAgICBuZXcgQ2hyb21hdGgoe3I6IGMuYiwgZzogYy5nLCBiOiBjLnJ9KSxcbiAgICAgICAgbmV3IENocm9tYXRoKHtyOiBjLnIsIGc6IGMuYiwgYjogYy5yfSlcbiAgICBdO1xufTtcblxuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC5hbmFsb2dvdXNcbiAgRmluZCBhbmFsb2dvdXMgY29sb3JzIGZyb20gYSBnaXZlbiBjb2xvclxuXG4gIFBhcmFtZXRlcnM6XG4gIG1peGVkIC0gQW55IGFyZ3VtZW50IHdoaWNoIGlzIHBhc3NlZCB0byA8Q2hyb21hdGg+XG4gIHJlc3VsdHMgLSBIb3cgbWFueSBjb2xvcnMgdG8gcmV0dXJuIChkZWZhdWx0ID0gMylcbiAgc2xpY2VzIC0gSG93IG1hbnkgcGllY2VzIGFyZSBpbiB0aGUgY29sb3Igd2hlZWwgKGRlZmF1bHQgPSAxMilcblxuICBFeGFtcGxlczpcbiAgPiA+IENocm9tYXRoLmFuYWxvZ291cyhuZXcgQ2hyb21hdGgoJ3JnYigwLCAyNTUsIDI1NSknKSlcbiAgPiBbIHsgcjogMCwgZzogMjU1LCBiOiAyNTUsIGE6IDEsIGg6IDE4MCwgc2w6IDEsIHN2OiAxLCBsOiAwLjUsIHY6IDEgfSxcbiAgPiAgIHsgcjogMCwgZzogMjU1LCBiOiAxMDEsIGE6IDEsIGg6IDE0NCwgc2w6IDEsIHN2OiAxLCBsOiAwLjUsIHY6IDEgfSxcbiAgPiAgIHsgcjogMCwgZzogMjU1LCBiOiAxNTMsIGE6IDEsIGg6IDE1Niwgc2w6IDEsIHN2OiAxLCBsOiAwLjUsIHY6IDEgfSxcbiAgPiAgIHsgcjogMCwgZzogMjU1LCBiOiAyMDMsIGE6IDEsIGg6IDE2OCwgc2w6IDEsIHN2OiAxLCBsOiAwLjUsIHY6IDEgfSxcbiAgPiAgIHsgcjogMCwgZzogMjU1LCBiOiAyNTUsIGE6IDEsIGg6IDE4MCwgc2w6IDEsIHN2OiAxLCBsOiAwLjUsIHY6IDEgfSxcbiAgPiAgIHsgcjogMCwgZzogMjAzLCBiOiAyNTUsIGE6IDEsIGg6IDE5Miwgc2w6IDEsIHN2OiAxLCBsOiAwLjUsIHY6IDEgfSxcbiAgPiAgIHsgcjogMCwgZzogMTUzLCBiOiAyNTUsIGE6IDEsIGg6IDIwNCwgc2w6IDEsIHN2OiAxLCBsOiAwLjUsIHY6IDEgfSxcbiAgPiAgIHsgcjogMCwgZzogMTAxLCBiOiAyNTUsIGE6IDEsIGg6IDIxNiwgc2w6IDEsIHN2OiAxLCBsOiAwLjUsIHY6IDEgfSBdXG5cbiAgPiA+IENocm9tYXRoLmFuYWxvZ291cyhuZXcgQ2hyb21hdGgoJ3JnYigwLCAyNTUsIDI1NSknKSkudG9TdHJpbmcoKVxuICA+ICcjMDBGRkZGLCMwMEZGNjUsIzAwRkY5OSwjMDBGRkNCLCMwMEZGRkYsIzAwQ0JGRiwjMDA5OUZGLCMwMDY1RkYnXG4gKi9cbkNocm9tYXRoLmFuYWxvZ291cyA9IGZ1bmN0aW9uIChjb2xvciwgcmVzdWx0cywgc2xpY2VzKVxue1xuICAgIGlmICghaXNGaW5pdGUocmVzdWx0cykpIHJlc3VsdHMgPSAzO1xuICAgIGlmICghaXNGaW5pdGUoc2xpY2VzKSkgc2xpY2VzID0gMTI7XG5cbiAgICB2YXIgYyA9IG5ldyBDaHJvbWF0aChjb2xvcik7XG4gICAgdmFyIGhzdiA9IGMudG9IU1ZPYmplY3QoKTtcbiAgICB2YXIgc2xpY2UgPSAzNjAgLyBzbGljZXM7XG4gICAgdmFyIHJldCA9IFsgYyBdO1xuXG4gICAgaHN2LmggPSAoKGhzdi5oIC0gKHNsaWNlcyAqIHJlc3VsdHMgPj4gMSkpICsgNzIwKSAlIDM2MDtcbiAgICB3aGlsZSAoLS1yZXN1bHRzKSB7XG4gICAgICAgIGhzdi5oID0gKGhzdi5oICsgc2xpY2UpICUgMzYwO1xuICAgICAgICByZXQucHVzaChuZXcgQ2hyb21hdGgoaHN2KSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldDtcbn07XG5cbi8qXG4gIE1ldGhvZDogQ2hyb21hdGgubW9ub2Nocm9tYXRpY1xuICBSZXR1cm4gYSBzZXJpZXMgb2YgdGhlIGdpdmVuIGNvbG9yIGF0IHZhcmlvdXMgbGlnaHRuZXNzZXNcblxuICBFeGFtcGxlczpcbiAgPiA+IENocm9tYXRoLm1vbm9jaHJvbWF0aWMoJ3JnYigwLCAxMDAsIDI1NSknKS5mb3JFYWNoKGZ1bmN0aW9uIChjKXsgY29uc29sZS5sb2coYy50b0hTVlN0cmluZygpKTsgfSlcbiAgPiBoc3YoMjE2LDEwMCUsMjAlKVxuICA+IGhzdigyMTYsMTAwJSw0MCUpXG4gID4gaHN2KDIxNiwxMDAlLDYwJSlcbiAgPiBoc3YoMjE2LDEwMCUsODAlKVxuICA+IGhzdigyMTYsMTAwJSwxMDAlKVxuKi9cbkNocm9tYXRoLm1vbm9jaHJvbWF0aWMgPSBmdW5jdGlvbiAoY29sb3IsIHJlc3VsdHMpXG57XG4gICAgaWYgKCFyZXN1bHRzKSByZXN1bHRzID0gNTtcblxuICAgIHZhciBjID0gbmV3IENocm9tYXRoKGNvbG9yKTtcbiAgICB2YXIgaHN2ID0gYy50b0hTVk9iamVjdCgpO1xuICAgIHZhciBpbmMgPSAxIC8gcmVzdWx0cztcbiAgICB2YXIgcmV0ID0gW10sIHN0ZXAgPSAwO1xuXG4gICAgd2hpbGUgKHN0ZXArKyA8IHJlc3VsdHMpIHtcbiAgICAgICAgaHN2LnYgPSBzdGVwICogaW5jO1xuICAgICAgICByZXQucHVzaChuZXcgQ2hyb21hdGgoaHN2KSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldDtcbn07XG5cbi8qXG4gIE1ldGhvZDogQ2hyb21hdGguc3BsaXRjb21wbGVtZW50XG4gIEdlbmVyYXRlIGEgc3BsaXQgY29tcGxlbWVudCBjb2xvciBzY2hlbWUgZnJvbSB0aGUgZ2l2ZW4gY29sb3JcblxuICBFeGFtcGxlczpcbiAgPiA+IENocm9tYXRoLnNwbGl0Y29tcGxlbWVudCgncmdiKDAsIDEwMCwgMjU1KScpXG4gID4gWyB7IHI6IDAsIGc6IDEwMCwgYjogMjU1LCBoOiAyMTYuNDcwNTg4MjM1Mjk0MTQsIHNsOiAxLCBsOiAwLjUsIHN2OiAxLCB2OiAxLCBhOiAxIH0sXG4gID4gICB7IHI6IDI1NSwgZzogMTgzLCBiOiAwLCBoOiA0My4xOTk5OTk5OTk5OTk5OSwgc2w6IDEsIGw6IDAuNSwgc3Y6IDEsIHY6IDEsIGE6IDEgfSxcbiAgPiAgIHsgcjogMjU1LCBnOiA3MywgYjogMCwgaDogMTcuMjc5OTk5OTk5OTk5OTczLCBzbDogMSwgbDogMC41LCBzdjogMSwgdjogMSwgYTogMSB9IF1cblxuICA+ID4gQ2hyb21hdGguc3BsaXRjb21wbGVtZW50KCdyZ2IoMCwgMTAwLCAyNTUpJykudG9TdHJpbmcoKVxuICA+ICcjMDA2NEZGLCNGRkI3MDAsI0ZGNDkwMCdcbiAqL1xuQ2hyb21hdGguc3BsaXRjb21wbGVtZW50ID0gZnVuY3Rpb24gKGNvbG9yKVxue1xuICAgIHZhciByZWYgPSBuZXcgQ2hyb21hdGgoY29sb3IpO1xuICAgIHZhciBoc3YgPSByZWYudG9IU1ZPYmplY3QoKTtcblxuICAgIHZhciBhID0gbmV3IENocm9tYXRoLmhzdih7XG4gICAgICAgIGg6IChoc3YuaCArIDE1MCkgJSAzNjAsXG4gICAgICAgIHM6IGhzdi5zLFxuICAgICAgICB2OiBoc3YudlxuICAgIH0pO1xuXG4gICAgdmFyIGIgPSBuZXcgQ2hyb21hdGguaHN2KHtcbiAgICAgICAgaDogKGhzdi5oICsgMjEwKSAlIDM2MCxcbiAgICAgICAgczogaHN2LnMsXG4gICAgICAgIHY6IGhzdi52XG4gICAgfSk7XG5cbiAgICByZXR1cm4gW3JlZiwgYSwgYl07XG59O1xuXG4vL0dyb3VwOiBTdGF0aWMgbWV0aG9kcyAtIGNvbG9yIGFsdGVyYXRpb25cbi8qXG4gIE1ldGhvZDogQ2hyb21hdGgudGludFxuICBMaWdodGVuIGEgY29sb3IgYnkgYWRkaW5nIGEgcGVyY2VudGFnZSBvZiB3aGl0ZSB0byBpdFxuXG4gIFJldHVybnMgPENocm9tYXRoPlxuXG4gID4gPiBDaHJvbWF0aC50aW50KCdyZ2IoMCwgMTAwLCAyNTUpJywgMC41KS50b1JHQlN0cmluZygpO1xuICA+ICdyZ2IoMTI3LDE3NywyNTUpJ1xuKi9cbkNocm9tYXRoLnRpbnQgPSBmdW5jdGlvbiAoIGZyb20sIGJ5IClcbntcbiAgICByZXR1cm4gQ2hyb21hdGgudG93YXJkcyggZnJvbSwgJyNGRkZGRkYnLCBieSApO1xufTtcblxuLypcbiAgIE1ldGhvZDogQ2hyb21hdGgubGlnaHRlblxuICAgQWxpYXMgZm9yIDxDaHJvbWF0aC50aW50PlxuKi9cbkNocm9tYXRoLmxpZ2h0ZW4gPSBDaHJvbWF0aC50aW50O1xuXG4vKlxuICBNZXRob2Q6IENocm9tYXRoLnNoYWRlXG4gIERhcmtlbiBhIGNvbG9yIGJ5IGFkZGluZyBhIHBlcmNlbnRhZ2Ugb2YgYmxhY2sgdG8gaXRcblxuICBFeGFtcGxlOlxuICA+ID4gQ2hyb21hdGguZGFya2VuKCdyZ2IoMCwgMTAwLCAyNTUpJywgMC41KS50b1JHQlN0cmluZygpO1xuICA+ICdyZ2IoMCw1MCwxMjcpJ1xuICovXG5DaHJvbWF0aC5zaGFkZSA9IGZ1bmN0aW9uICggZnJvbSwgYnkgKVxue1xuICAgIHJldHVybiBDaHJvbWF0aC50b3dhcmRzKCBmcm9tLCAnIzAwMDAwMCcsIGJ5ICk7XG59O1xuXG4vKlxuICAgTWV0aG9kOiBDaHJvbWF0aC5kYXJrZW5cbiAgIEFsaWFzIGZvciA8Q2hyb21hdGguc2hhZGU+XG4gKi9cbkNocm9tYXRoLmRhcmtlbiA9IENocm9tYXRoLnNoYWRlO1xuXG4vKlxuICBNZXRob2Q6IENocm9tYXRoLmRlc2F0dXJhdGVcbiAgRGVzYXR1cmF0ZSBhIGNvbG9yIHVzaW5nIGFueSBvZiAzIGFwcHJvYWNoZXNcblxuICBQYXJhbWV0ZXJzOlxuICBjb2xvciAtIGFueSBhcmd1bWVudCBhY2NlcHRlZCBieSB0aGUgPENocm9tYXRoPiBjb25zdHJ1Y3RvclxuICBmb3JtdWxhIC0gVGhlIGZvcm11bGEgdG8gdXNlIChmcm9tIDx4YXJnJ3MgZ3JleWZpbHRlciBhdCBodHRwOi8vd3d3Lnhhcmcub3JnL3Byb2plY3QvanF1ZXJ5LWNvbG9yLXBsdWdpbi14Y29sb3I+KVxuICAtIDEgLSB4YXJnJ3Mgb3duIGZvcm11bGFcbiAgLSAyIC0gU3VuJ3MgZm9ybXVsYTogKDEgLSBhdmcpIC8gKDEwMCAvIDM1KSArIGF2ZylcbiAgLSBlbXB0eSAtIFRoZSBvZnQtc2VlbiAzMCUgcmVkLCA1OSUgZ3JlZW4sIDExJSBibHVlIGZvcm11bGFcblxuICBFeGFtcGxlczpcbiAgPiA+IENocm9tYXRoLmRlc2F0dXJhdGUoJ3JlZCcpLnRvU3RyaW5nKClcbiAgPiBcIiM0QzRDNENcIlxuXG4gID4gPiBDaHJvbWF0aC5kZXNhdHVyYXRlKCdyZWQnLCAxKS50b1N0cmluZygpXG4gID4gXCIjMzczNzM3XCJcblxuICA+ID4gQ2hyb21hdGguZGVzYXR1cmF0ZSgncmVkJywgMikudG9TdHJpbmcoKVxuICA+IFwiIzkwOTA5MFwiXG4qL1xuQ2hyb21hdGguZGVzYXR1cmF0ZSA9IGZ1bmN0aW9uIChjb2xvciwgZm9ybXVsYSlcbntcbiAgICB2YXIgYyA9IG5ldyBDaHJvbWF0aChjb2xvciksIHJnYiwgYXZnO1xuXG4gICAgc3dpdGNoIChmb3JtdWxhKSB7XG4gICAgY2FzZSAxOiAvLyB4YXJnJ3MgZm9ybXVsYVxuICAgICAgICBhdmcgPSAuMzUgKyAxMyAqIChjLnIgKyBjLmcgKyBjLmIpIC8gNjA7IGJyZWFrO1xuICAgIGNhc2UgMjogLy8gU3VuJ3MgZm9ybXVsYTogKDEgLSBhdmcpIC8gKDEwMCAvIDM1KSArIGF2ZylcbiAgICAgICAgYXZnID0gKDEzICogKGMuciArIGMuZyArIGMuYikgKyA1MzU1KSAvIDYwOyBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgICBhdmcgPSBjLnIgKiAuMyArIGMuZyAqIC41OSArIGMuYiAqIC4xMTtcbiAgICB9XG5cbiAgICBhdmcgPSB1dGlsLmNsYW1wKGF2ZywgMCwgMjU1KTtcbiAgICByZ2IgPSB7cjogYXZnLCBnOiBhdmcsIGI6IGF2Z307XG5cbiAgICByZXR1cm4gbmV3IENocm9tYXRoKHJnYik7XG59O1xuXG4vKlxuICBNZXRob2Q6IENocm9tYXRoLmdyZXlzY2FsZVxuICBBbGlhcyBmb3IgPENocm9tYXRoLmRlc2F0dXJhdGU+XG4qL1xuQ2hyb21hdGguZ3JleXNjYWxlID0gQ2hyb21hdGguZGVzYXR1cmF0ZTtcblxuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC53ZWJzYWZlXG4gIENvbnZlcnQgYSBjb2xvciB0byBvbmUgb2YgdGhlIDIxNiBcIndlYnNhZmVcIiBjb2xvcnNcblxuICBFeGFtcGxlczpcbiAgPiA+IENocm9tYXRoLndlYnNhZmUoJyNBQkNERUYnKS50b1N0cmluZygpXG4gID4gJyM5OUNDRkYnXG5cbiAgPiA+IENocm9tYXRoLndlYnNhZmUoJyNCQkNERUYnKS50b1N0cmluZygpXG4gID4gJyNDQ0NDRkYnXG4gKi9cbkNocm9tYXRoLndlYnNhZmUgPSBmdW5jdGlvbiAoY29sb3IpXG57XG4gICAgY29sb3IgPSBuZXcgQ2hyb21hdGgoY29sb3IpO1xuXG4gICAgY29sb3IuciA9IE1hdGgucm91bmQoY29sb3IuciAvIDUxKSAqIDUxO1xuICAgIGNvbG9yLmcgPSBNYXRoLnJvdW5kKGNvbG9yLmcgLyA1MSkgKiA1MTtcbiAgICBjb2xvci5iID0gTWF0aC5yb3VuZChjb2xvci5iIC8gNTEpICogNTE7XG5cbiAgICByZXR1cm4gbmV3IENocm9tYXRoKGNvbG9yKTtcbn07XG5cbi8vR3JvdXA6IFN0YXRpYyBtZXRob2RzIC0gY29sb3IgY29tYmluYXRpb25cbi8qXG4gIE1ldGhvZDogQ2hyb21hdGguYWRkaXRpdmVcbiAgQ29tYmluZSBhbnkgbnVtYmVyIGNvbG9ycyB1c2luZyBhZGRpdGl2ZSBjb2xvclxuXG4gIEV4YW1wbGVzOlxuICA+ID4gQ2hyb21hdGguYWRkaXRpdmUoJyNGMDAnLCAnIzBGMCcpLnRvU3RyaW5nKCk7XG4gID4gJyNGRkZGMDAnXG5cbiAgPiA+IENocm9tYXRoLmFkZGl0aXZlKCcjRjAwJywgJyMwRjAnKS50b1N0cmluZygpID09IENocm9tYXRoLnllbGxvdy50b1N0cmluZygpO1xuICA+IHRydWVcblxuICA+ID4gQ2hyb21hdGguYWRkaXRpdmUoJ3JlZCcsICcjMEYwJywgJ3JnYigwLCAwLCAyNTUpJykudG9TdHJpbmcoKSA9PSBDaHJvbWF0aC53aGl0ZS50b1N0cmluZygpO1xuICA+IHRydWVcbiAqL1xuQ2hyb21hdGguYWRkaXRpdmUgPSBmdW5jdGlvbiAoKVxue1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzLmxlbmd0aC0yLCBpPS0xLCBhLCBiO1xuICAgIHdoaWxlIChpKysgPCBhcmdzKXtcblxuICAgICAgICBhID0gYSB8fCBuZXcgQ2hyb21hdGgoYXJndW1lbnRzW2ldKTtcbiAgICAgICAgYiA9IG5ldyBDaHJvbWF0aChhcmd1bWVudHNbaSsxXSk7XG5cbiAgICAgICAgaWYgKChhLnIgKz0gYi5yKSA+IDI1NSkgYS5yID0gMjU1O1xuICAgICAgICBpZiAoKGEuZyArPSBiLmcpID4gMjU1KSBhLmcgPSAyNTU7XG4gICAgICAgIGlmICgoYS5iICs9IGIuYikgPiAyNTUpIGEuYiA9IDI1NTtcblxuICAgICAgICBhID0gbmV3IENocm9tYXRoKGEpO1xuICAgIH1cblxuICAgIHJldHVybiBhO1xufTtcblxuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC5zdWJ0cmFjdGl2ZVxuICBDb21iaW5lIGFueSBudW1iZXIgb2YgY29sb3JzIHVzaW5nIHN1YnRyYWN0aXZlIGNvbG9yXG5cbiAgRXhhbXBsZXM6XG4gID4gPiBDaHJvbWF0aC5zdWJ0cmFjdGl2ZSgneWVsbG93JywgJ21hZ2VudGEnKS50b1N0cmluZygpO1xuICA+ICcjRkYwMDAwJ1xuXG4gID4gPiBDaHJvbWF0aC5zdWJ0cmFjdGl2ZSgneWVsbG93JywgJ21hZ2VudGEnKS50b1N0cmluZygpID09PSBDaHJvbWF0aC5yZWQudG9TdHJpbmcoKTtcbiAgPiB0cnVlXG5cbiAgPiA+IENocm9tYXRoLnN1YnRyYWN0aXZlKCdjeWFuJywgJ21hZ2VudGEnLCAneWVsbG93JykudG9TdHJpbmcoKTtcbiAgPiAnIzAwMDAwMCdcblxuICA+ID4gQ2hyb21hdGguc3VidHJhY3RpdmUoJ3JlZCcsICcjMEYwJywgJ3JnYigwLCAwLCAyNTUpJykudG9TdHJpbmcoKTtcbiAgPiAnIzAwMDAwMCdcbiovXG5DaHJvbWF0aC5zdWJ0cmFjdGl2ZSA9IGZ1bmN0aW9uICgpXG57XG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMubGVuZ3RoLTIsIGk9LTEsIGEsIGI7XG4gICAgd2hpbGUgKGkrKyA8IGFyZ3Mpe1xuXG4gICAgICAgIGEgPSBhIHx8IG5ldyBDaHJvbWF0aChhcmd1bWVudHNbaV0pO1xuICAgICAgICBiID0gbmV3IENocm9tYXRoKGFyZ3VtZW50c1tpKzFdKTtcblxuICAgICAgICBpZiAoKGEuciArPSBiLnIgLSAyNTUpIDwgMCkgYS5yID0gMDtcbiAgICAgICAgaWYgKChhLmcgKz0gYi5nIC0gMjU1KSA8IDApIGEuZyA9IDA7XG4gICAgICAgIGlmICgoYS5iICs9IGIuYiAtIDI1NSkgPCAwKSBhLmIgPSAwO1xuXG4gICAgICAgIGEgPSBuZXcgQ2hyb21hdGgoYSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGE7XG59O1xuXG4vKlxuICBNZXRob2Q6IENocm9tYXRoLm11bHRpcGx5XG4gIE11bHRpcGx5IGFueSBudW1iZXIgb2YgY29sb3JzXG5cbiAgRXhhbXBsZXM6XG4gID4gPiBDaHJvbWF0aC5tdWx0aXBseShDaHJvbWF0aC5saWdodGdvbGRlbnJvZHllbGxvdywgQ2hyb21hdGgubGlnaHRibHVlKS50b1N0cmluZygpO1xuICA+IFwiI0E5RDNCRFwiXG5cbiAgPiA+IENocm9tYXRoLm11bHRpcGx5KENocm9tYXRoLm9sZGxhY2UsIENocm9tYXRoLmxpZ2h0Ymx1ZSwgQ2hyb21hdGguZGFya2JsdWUpLnRvU3RyaW5nKCk7XG4gID4gXCIjMDAwMDcwXCJcbiovXG5DaHJvbWF0aC5tdWx0aXBseSA9IGZ1bmN0aW9uICgpXG57XG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMubGVuZ3RoLTIsIGk9LTEsIGEsIGI7XG4gICAgd2hpbGUgKGkrKyA8IGFyZ3Mpe1xuXG4gICAgICAgIGEgPSBhIHx8IG5ldyBDaHJvbWF0aChhcmd1bWVudHNbaV0pO1xuICAgICAgICBiID0gbmV3IENocm9tYXRoKGFyZ3VtZW50c1tpKzFdKTtcblxuICAgICAgICBhLnIgPSAoYS5yIC8gMjU1ICogYi5yKXwwO1xuICAgICAgICBhLmcgPSAoYS5nIC8gMjU1ICogYi5nKXwwO1xuICAgICAgICBhLmIgPSAoYS5iIC8gMjU1ICogYi5iKXwwO1xuXG4gICAgICAgIGEgPSBuZXcgQ2hyb21hdGgoYSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGE7XG59O1xuXG4vKlxuICBNZXRob2Q6IENocm9tYXRoLmF2ZXJhZ2VcbiAgQXZlcmFnZXMgYW55IG51bWJlciBvZiBjb2xvcnNcblxuICBFeGFtcGxlczpcbiAgPiA+IENocm9tYXRoLmF2ZXJhZ2UoQ2hyb21hdGgubGlnaHRnb2xkZW5yb2R5ZWxsb3csIENocm9tYXRoLmxpZ2h0Ymx1ZSkudG9TdHJpbmcoKVxuICA+IFwiI0QzRTlEQ1wiXG5cbiAgPiA+IENocm9tYXRoLmF2ZXJhZ2UoQ2hyb21hdGgub2xkbGFjZSwgQ2hyb21hdGgubGlnaHRibHVlLCBDaHJvbWF0aC5kYXJrYmx1ZSkudG9TdHJpbmcoKVxuICA+IFwiIzZBNzNCOFwiXG4gKi9cbkNocm9tYXRoLmF2ZXJhZ2UgPSBmdW5jdGlvbiAoKVxue1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzLmxlbmd0aC0yLCBpPS0xLCBhLCBiO1xuICAgIHdoaWxlIChpKysgPCBhcmdzKXtcblxuICAgICAgICBhID0gYSB8fCBuZXcgQ2hyb21hdGgoYXJndW1lbnRzW2ldKTtcbiAgICAgICAgYiA9IG5ldyBDaHJvbWF0aChhcmd1bWVudHNbaSsxXSk7XG5cbiAgICAgICAgYS5yID0gKGEuciArIGIucikgPj4gMTtcbiAgICAgICAgYS5nID0gKGEuZyArIGIuZykgPj4gMTtcbiAgICAgICAgYS5iID0gKGEuYiArIGIuYikgPj4gMTtcblxuICAgICAgICBhID0gbmV3IENocm9tYXRoKGEpO1xuICAgIH1cblxuICAgIHJldHVybiBhO1xufTtcblxuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC5vdmVybGF5XG4gIEFkZCBvbmUgY29sb3Igb24gdG9wIG9mIGFub3RoZXIgd2l0aCBhIGdpdmVuIHRyYW5zcGFyZW5jeVxuXG4gIEV4YW1wbGVzOlxuICA+ID4gQ2hyb21hdGguYXZlcmFnZShDaHJvbWF0aC5saWdodGdvbGRlbnJvZHllbGxvdywgQ2hyb21hdGgubGlnaHRibHVlKS50b1N0cmluZygpXG4gID4gXCIjRDNFOURDXCJcblxuICA+ID4gQ2hyb21hdGguYXZlcmFnZShDaHJvbWF0aC5vbGRsYWNlLCBDaHJvbWF0aC5saWdodGJsdWUsIENocm9tYXRoLmRhcmtibHVlKS50b1N0cmluZygpXG4gID4gXCIjNkE3M0I4XCJcbiAqL1xuQ2hyb21hdGgub3ZlcmxheSA9IGZ1bmN0aW9uICh0b3AsIGJvdHRvbSwgb3BhY2l0eSlcbntcbiAgICB2YXIgYSA9IG5ldyBDaHJvbWF0aCh0b3ApO1xuICAgIHZhciBiID0gbmV3IENocm9tYXRoKGJvdHRvbSk7XG5cbiAgICBpZiAob3BhY2l0eSA+IDEpIG9wYWNpdHkgLz0gMTAwO1xuICAgIG9wYWNpdHkgPSB1dGlsLmNsYW1wKG9wYWNpdHkgLSAxICsgYi5hLCAwLCAxKTtcblxuICAgIHJldHVybiBuZXcgQ2hyb21hdGgoe1xuICAgICAgICByOiB1dGlsLmxlcnAoYS5yLCBiLnIsIG9wYWNpdHkpLFxuICAgICAgICBnOiB1dGlsLmxlcnAoYS5nLCBiLmcsIG9wYWNpdHkpLFxuICAgICAgICBiOiB1dGlsLmxlcnAoYS5iLCBiLmIsIG9wYWNpdHkpXG4gICAgfSk7XG59O1xuXG5cbi8vR3JvdXA6IFN0YXRpYyBtZXRob2RzIC0gb3RoZXJcbi8qXG4gIE1ldGhvZDogQ2hyb21hdGgudG93YXJkc1xuICBNb3ZlIGZyb20gb25lIGNvbG9yIHRvd2FyZHMgYW5vdGhlciBieSB0aGUgZ2l2ZW4gcGVyY2VudGFnZSAoMC0xLCAwLTEwMClcblxuICBQYXJhbWV0ZXJzOlxuICBmcm9tIC0gVGhlIHN0YXJ0aW5nIGNvbG9yXG4gIHRvIC0gVGhlIGRlc3RpbmF0aW9uIGNvbG9yXG4gIGJ5IC0gVGhlIHBlcmNlbnRhZ2UsIGV4cHJlc3NlZCBhcyBhIGZsb2F0aW5nIG51bWJlciBiZXR3ZWVuIDAgYW5kIDEsIHRvIG1vdmUgdG93YXJkcyB0aGUgZGVzdGluYXRpb24gY29sb3JcbiAgaW50ZXJwb2xhdG9yIC0gVGhlIGZ1bmN0aW9uIHRvIHVzZSBmb3IgaW50ZXJwb2xhdGluZyBiZXR3ZWVuIHRoZSB0d28gcG9pbnRzLiBEZWZhdWx0cyB0byBMaW5lYXIgSW50ZXJwb2xhdGlvbi4gRnVuY3Rpb24gaGFzIHRoZSBzaWduYXR1cmUgYChmcm9tLCB0bywgYnkpYCB3aXRoIHRoZSBwYXJhbWV0ZXJzIGhhdmluZyB0aGUgc2FtZSBtZWFuaW5nIGFzIHRob3NlIGluIGB0b3dhcmRzYC5cblxuICA+ID4gQ2hyb21hdGgudG93YXJkcygncmVkJywgJ3llbGxvdycsIDAuNSkudG9TdHJpbmcoKVxuICA+IFwiI0ZGN0YwMFwiXG4qL1xuQ2hyb21hdGgudG93YXJkcyA9IGZ1bmN0aW9uIChmcm9tLCB0bywgYnksIGludGVycG9sYXRvcilcbntcbiAgICBpZiAoIXRvKSB7IHJldHVybiBmcm9tOyB9XG4gICAgaWYgKCFpc0Zpbml0ZShieSkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVHlwZUVycm9yOiBgYnlgKCcgKyBieSAgKycpIHNob3VsZCBiZSBiZXR3ZWVuIDAgYW5kIDEnKTtcbiAgICBpZiAoIShmcm9tIGluc3RhbmNlb2YgQ2hyb21hdGgpKSBmcm9tID0gbmV3IENocm9tYXRoKGZyb20pO1xuICAgIGlmICghKHRvIGluc3RhbmNlb2YgQ2hyb21hdGgpKSB0byA9IG5ldyBDaHJvbWF0aCh0byB8fCAnI0ZGRkZGRicpO1xuICAgIGlmICghaW50ZXJwb2xhdG9yKSBpbnRlcnBvbGF0b3IgPSB1dGlsLmxlcnA7XG4gICAgYnkgPSBwYXJzZUZsb2F0KGJ5KTtcblxuICAgIHJldHVybiBuZXcgQ2hyb21hdGgoe1xuICAgICAgICByOiBpbnRlcnBvbGF0b3IoZnJvbS5yLCB0by5yLCBieSksXG4gICAgICAgIGc6IGludGVycG9sYXRvcihmcm9tLmcsIHRvLmcsIGJ5KSxcbiAgICAgICAgYjogaW50ZXJwb2xhdG9yKGZyb20uYiwgdG8uYiwgYnkpLFxuICAgICAgICBhOiBpbnRlcnBvbGF0b3IoZnJvbS5hLCB0by5hLCBieSlcbiAgICB9KTtcbn07XG5cbi8qXG4gIE1ldGhvZDogQ2hyb21hdGguZ3JhZGllbnRcbiAgQ3JlYXRlIGFuIGFycmF5IG9mIENocm9tYXRoIG9iamVjdHNcblxuICBQYXJhbWV0ZXJzOlxuICBmcm9tIC0gVGhlIGJlZ2lubmluZyBjb2xvciBvZiB0aGUgZ3JhZGllbnRcbiAgdG8gLSBUaGUgZW5kIGNvbG9yIG9mIHRoZSBncmFkaWVudFxuICBzbGljZXMgLSBUaGUgbnVtYmVyIG9mIGNvbG9ycyBpbiB0aGUgYXJyYXlcbiAgc2xpY2UgLSBUaGUgY29sb3IgYXQgYSBzcGVjaWZpYywgMS1iYXNlZCwgc2xpY2UgaW5kZXhcblxuICBFeGFtcGxlczpcbiAgPiA+IENocm9tYXRoLmdyYWRpZW50KCdyZWQnLCAneWVsbG93JykubGVuZ3RoO1xuICA+IDIwXG5cbiAgPiA+IENocm9tYXRoLmdyYWRpZW50KCdyZWQnLCAneWVsbG93JywgNSkudG9TdHJpbmcoKTtcbiAgPiBcIiNGRjAwMDAsI0ZGM0YwMCwjRkY3RjAwLCNGRkJGMDAsI0ZGRkYwMFwiXG5cbiAgPiA+IENocm9tYXRoLmdyYWRpZW50KCdyZWQnLCAneWVsbG93JywgNSwgMikudG9TdHJpbmcoKTtcbiAgPiBcIiNGRjdGMDBcIlxuXG4gID4gPiBDaHJvbWF0aC5ncmFkaWVudCgncmVkJywgJ3llbGxvdycsIDUpWzJdLnRvU3RyaW5nKCk7XG4gID4gXCIjRkY3RjAwXCJcbiAqL1xuQ2hyb21hdGguZ3JhZGllbnQgPSBmdW5jdGlvbiAoZnJvbSwgdG8sIHNsaWNlcywgc2xpY2UpXG57XG4gICAgdmFyIGdyYWRpZW50ID0gW10sIHN0b3BzO1xuXG4gICAgaWYgKCEgc2xpY2VzKSBzbGljZXMgPSAyMDtcbiAgICBzdG9wcyA9IChzbGljZXMtMSk7XG5cbiAgICBpZiAoaXNGaW5pdGUoc2xpY2UpKSByZXR1cm4gQ2hyb21hdGgudG93YXJkcyhmcm9tLCB0bywgc2xpY2Uvc3RvcHMpO1xuICAgIGVsc2Ugc2xpY2UgPSAtMTtcblxuICAgIHdoaWxlICgrK3NsaWNlIDwgc2xpY2VzKXtcbiAgICAgICAgZ3JhZGllbnQucHVzaChDaHJvbWF0aC50b3dhcmRzKGZyb20sIHRvLCBzbGljZS9zdG9wcykpO1xuICAgIH1cblxuICAgIHJldHVybiBncmFkaWVudDtcbn07XG5cbi8qXG4gIE1ldGhvZDogQ2hyb21hdGgucGFyc2VcbiAgSXRlcmF0ZSB0aHJvdWdoIHRoZSBvYmplY3RzIHNldCBpbiBDaHJvbWF0aC5wYXJzZXJzIGFuZCwgaWYgYSBtYXRjaCBpcyBtYWRlLCByZXR1cm4gdGhlIHZhbHVlIHNwZWNpZmllZCBieSB0aGUgbWF0Y2hpbmcgcGFyc2VycyBgcHJvY2Vzc2AgZnVuY3Rpb25cblxuICBQYXJhbWV0ZXJzOlxuICBzdHJpbmcgLSBUaGUgc3RyaW5nIHRvIHBhcnNlXG5cbiAgRXhhbXBsZTpcbiAgPiA+IENocm9tYXRoLnBhcnNlKCdyZ2IoMCwgMTI4LCAyNTUpJylcbiAgPiB7IHI6IDAsIGc6IDEyOCwgYjogMjU1LCBhOiB1bmRlZmluZWQgfVxuICovXG5DaHJvbWF0aC5wYXJzZSA9IGZ1bmN0aW9uIChzdHJpbmcpXG57XG4gICAgdmFyIHBhcnNlcnMgPSBDaHJvbWF0aC5wYXJzZXJzLCBpLCBsLCBwYXJzZXIsIHBhcnRzLCBjaGFubmVscztcblxuICAgIGZvciAoaSA9IDAsIGwgPSBwYXJzZXJzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBwYXJzZXIgPSBwYXJzZXJzW2ldO1xuICAgICAgICBwYXJ0cyA9IHBhcnNlci5yZWdleC5leGVjKHN0cmluZyk7XG4gICAgICAgIGlmIChwYXJ0cyAmJiBwYXJ0cy5sZW5ndGgpIGNoYW5uZWxzID0gcGFyc2VyLnByb2Nlc3MuYXBwbHkodGhpcywgcGFydHMpO1xuICAgICAgICBpZiAoY2hhbm5lbHMpIHJldHVybiBjaGFubmVscztcbiAgICB9XG59O1xuXG4vLyBHcm91cDogU3RhdGljIHByb3BlcnRpZXNcbi8qXG4gIFByb3BlcnR5OiBDaHJvbWF0aC5wYXJzZXJzXG4gICBBbiBhcnJheSBvZiBvYmplY3RzIGZvciBhdHRlbXB0aW5nIHRvIGNvbnZlcnQgYSBzdHJpbmcgZGVzY3JpYmluZyBhIGNvbG9yIGludG8gYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHZhcmlvdXMgY2hhbm5lbHMuIE5vIHVzZXIgYWN0aW9uIGlzIHJlcXVpcmVkIGJ1dCBwYXJzZXJzIGNhbiBiZVxuXG4gICBPYmplY3QgcHJvcGVydGllczpcbiAgIHJlZ2V4IC0gcmVndWxhciBleHByZXNzaW9uIHVzZWQgdG8gdGVzdCB0aGUgc3RyaW5nIG9yIG51bWVyaWMgaW5wdXRcbiAgIHByb2Nlc3MgLSBmdW5jdGlvbiB3aGljaCBpcyBwYXNzZWQgdGhlIHJlc3VsdHMgb2YgYHJlZ2V4Lm1hdGNoYCBhbmQgcmV0dXJucyBhbiBvYmplY3Qgd2l0aCBlaXRoZXIgdGhlIHJnYiwgaHNsLCBoc3YsIG9yIGhzYiBjaGFubmVscyBvZiB0aGUgQ2hyb21hdGguXG5cbiAgIEV4YW1wbGVzOlxuKHN0YXJ0IGNvZGUpXG4vLyBBZGQgYSBwYXJzZXJcbkNocm9tYXRoLnBhcnNlcnMucHVzaCh7XG4gICAgZXhhbXBsZTogWzM1NTQ0MzEsIDE2ODA5OTg0XSxcbiAgICByZWdleDogL15cXGQrJC8sXG4gICAgcHJvY2VzczogZnVuY3Rpb24gKGNvbG9yKXtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHI6IGNvbG9yID4+IDE2ICYgMjU1LFxuICAgICAgICAgICAgZzogY29sb3IgPj4gOCAmIDI1NSxcbiAgICAgICAgICAgIGI6IGNvbG9yICYgMjU1XG4gICAgICAgIH07XG4gICAgfVxufSk7XG4oZW5kIGNvZGUpXG4oc3RhcnQgY29kZSlcbi8vIE92ZXJyaWRlIGVudGlyZWx5XG5DaHJvbWF0aC5wYXJzZXJzID0gW1xuICAge1xuICAgICAgIGV4YW1wbGU6IFszNTU0NDMxLCAxNjgwOTk4NF0sXG4gICAgICAgcmVnZXg6IC9eXFxkKyQvLFxuICAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uIChjb2xvcil7XG4gICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICByOiBjb2xvciA+PiAxNiAmIDI1NSxcbiAgICAgICAgICAgICAgIGc6IGNvbG9yID4+IDggJiAyNTUsXG4gICAgICAgICAgICAgICBiOiBjb2xvciAmIDI1NVxuICAgICAgICAgICB9O1xuICAgICAgIH1cbiAgIH0sXG5cbiAgIHtcbiAgICAgICBleGFtcGxlOiBbJyNmYjAnLCAnZjBmJ10sXG4gICAgICAgcmVnZXg6IC9eIz8oW1xcZEEtRl17MX0pKFtcXGRBLUZdezF9KShbXFxkQS1GXXsxfSkkL2ksXG4gICAgICAgcHJvY2VzczogZnVuY3Rpb24gKGhleCwgciwgZywgYil7XG4gICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICByOiBwYXJzZUludChyICsgciwgMTYpLFxuICAgICAgICAgICAgICAgZzogcGFyc2VJbnQoZyArIGcsIDE2KSxcbiAgICAgICAgICAgICAgIGI6IHBhcnNlSW50KGIgKyBiLCAxNilcbiAgICAgICAgICAgfTtcbiAgICAgICB9XG4gICB9XG4oZW5kIGNvZGUpXG4gKi9cbkNocm9tYXRoLnBhcnNlcnMgPSByZXF1aXJlKCcuL3BhcnNlcnMnKS5wYXJzZXJzO1xuXG4vLyBHcm91cDogSW5zdGFuY2UgbWV0aG9kcyAtIGNvbG9yIHJlcHJlc2VudGF0aW9uXG5DaHJvbWF0aC5wcm90b3R5cGUgPSByZXF1aXJlKCcuL3Byb3RvdHlwZScpKENocm9tYXRoKTtcblxuLypcbiAgUHJvcGVydHk6IENocm9tYXRoLmNvbG9yc1xuICBPYmplY3QsIGluZGV4ZWQgYnkgU1ZHL0NTUyBjb2xvciBuYW1lLCBvZiA8Q2hyb21hdGg+IGluc3RhbmNlc1xuICBUaGUgY29sb3IgbmFtZXMgZnJvbSBDU1MgYW5kIFNWRyAxLjBcblxuICBFeGFtcGxlczpcbiAgPiA+IENocm9tYXRoLmNvbG9ycy5hbGljZWJsdWUudG9SR0JBcnJheSgpXG4gID4gWzI0MCwgMjQ4LCAyNTVdXG5cbiAgPiA+IENocm9tYXRoLmNvbG9ycy5iZWlnZS50b1N0cmluZygpXG4gID4gXCIjRjVGNURDXCJcblxuICA+IC8vIENhbiBhbHNvIGJlIGFjY2Vzc2VkIHdpdGhvdXQgYC5jb2xvcmBcbiAgPiA+IENocm9tYXRoLmFsaWNlYmx1ZS50b1JHQkFycmF5KClcbiAgPiBbMjQwLCAyNDgsIDI1NV1cblxuICA+ID4gQ2hyb21hdGguYmVpZ2UudG9TdHJpbmcoKVxuICA+IFwiI0Y1RjVEQ1wiXG4qL1xudmFyIGNzczJDb2xvcnMgID0gcmVxdWlyZSgnLi9jb2xvcm5hbWVzX2NzczInKTtcbnZhciBjc3MzQ29sb3JzICA9IHJlcXVpcmUoJy4vY29sb3JuYW1lc19jc3MzJyk7XG52YXIgYWxsQ29sb3JzICAgPSB1dGlsLm1lcmdlKHt9LCBjc3MyQ29sb3JzLCBjc3MzQ29sb3JzKTtcbkNocm9tYXRoLmNvbG9ycyA9IHt9O1xuZm9yICh2YXIgY29sb3JOYW1lIGluIGFsbENvbG9ycykge1xuICAgIC8vIGUuZy4sIENocm9tYXRoLndoZWF0IGFuZCBDaHJvbWF0aC5jb2xvcnMud2hlYXRcbiAgICBDaHJvbWF0aFtjb2xvck5hbWVdID0gQ2hyb21hdGguY29sb3JzW2NvbG9yTmFtZV0gPSBuZXcgQ2hyb21hdGgoYWxsQ29sb3JzW2NvbG9yTmFtZV0pO1xufVxuLy8gYWRkIGEgcGFyc2VyIGZvciB0aGUgY29sb3IgbmFtZXNcbkNocm9tYXRoLnBhcnNlcnMucHVzaCh7XG4gICAgZXhhbXBsZTogWydyZWQnLCAnYnVybHl3b29kJ10sXG4gICAgcmVnZXg6IC9eW2Etel0rJC9pLFxuICAgIHByb2Nlc3M6IGZ1bmN0aW9uIChjb2xvck5hbWUpe1xuICAgICAgICBpZiAoQ2hyb21hdGguY29sb3JzW2NvbG9yTmFtZV0pIHJldHVybiBDaHJvbWF0aC5jb2xvcnNbY29sb3JOYW1lXTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDaHJvbWF0aDtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIC8vIGZyb20gaHR0cDovL3d3dy53My5vcmcvVFIvUkVDLWh0bWw0MC90eXBlcy5odG1sI2gtNi41XG4gICAgYXF1YSAgICA6IHtyOiAwLCAgIGc6IDI1NSwgYjogMjU1fSxcbiAgICBibGFjayAgIDoge3I6IDAsICAgZzogMCwgICBiOiAwfSxcbiAgICBibHVlICAgIDoge3I6IDAsICAgZzogMCwgICBiOiAyNTV9LFxuICAgIGZ1Y2hzaWEgOiB7cjogMjU1LCBnOiAwLCAgIGI6IDI1NX0sXG4gICAgZ3JheSAgICA6IHtyOiAxMjgsIGc6IDEyOCwgYjogMTI4fSxcbiAgICBncmVlbiAgIDoge3I6IDAsICAgZzogMTI4LCBiOiAwfSxcbiAgICBsaW1lICAgIDoge3I6IDAsICAgZzogMjU1LCBiOiAwfSxcbiAgICBtYXJvb24gIDoge3I6IDEyOCwgZzogMCwgICBiOiAwfSxcbiAgICBuYXZ5ICAgIDoge3I6IDAsICAgZzogMCwgICBiOiAxMjh9LFxuICAgIG9saXZlICAgOiB7cjogMTI4LCBnOiAxMjgsIGI6IDB9LFxuICAgIHB1cnBsZSAgOiB7cjogMTI4LCBnOiAwLCAgIGI6IDEyOH0sXG4gICAgcmVkICAgICA6IHtyOiAyNTUsIGc6IDAsICAgYjogMH0sXG4gICAgc2lsdmVyICA6IHtyOiAxOTIsIGc6IDE5MiwgYjogMTkyfSxcbiAgICB0ZWFsICAgIDoge3I6IDAsICAgZzogMTI4LCBiOiAxMjh9LFxuICAgIHdoaXRlICAgOiB7cjogMjU1LCBnOiAyNTUsIGI6IDI1NX0sXG4gICAgeWVsbG93ICA6IHtyOiAyNTUsIGc6IDI1NSwgYjogMH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvLyBodHRwOi8vd3d3LnczLm9yZy9UUi9jc3MzLWNvbG9yLyNzdmctY29sb3JcbiAgICAvLyBodHRwOi8vd3d3LnczLm9yZy9UUi9TVkcvdHlwZXMuaHRtbCNDb2xvcktleXdvcmRzXG4gICAgYWxpY2VibHVlICAgICAgICAgICAgOiB7cjogMjQwLCBnOiAyNDgsIGI6IDI1NX0sXG4gICAgYW50aXF1ZXdoaXRlICAgICAgICAgOiB7cjogMjUwLCBnOiAyMzUsIGI6IDIxNX0sXG4gICAgYXF1YW1hcmluZSAgICAgICAgICAgOiB7cjogMTI3LCBnOiAyNTUsIGI6IDIxMn0sXG4gICAgYXp1cmUgICAgICAgICAgICAgICAgOiB7cjogMjQwLCBnOiAyNTUsIGI6IDI1NX0sXG4gICAgYmVpZ2UgICAgICAgICAgICAgICAgOiB7cjogMjQ1LCBnOiAyNDUsIGI6IDIyMH0sXG4gICAgYmlzcXVlICAgICAgICAgICAgICAgOiB7cjogMjU1LCBnOiAyMjgsIGI6IDE5Nn0sXG4gICAgYmxhbmNoZWRhbG1vbmQgICAgICAgOiB7cjogMjU1LCBnOiAyMzUsIGI6IDIwNX0sXG4gICAgYmx1ZXZpb2xldCAgICAgICAgICAgOiB7cjogMTM4LCBnOiA0MywgIGI6IDIyNn0sXG4gICAgYnJvd24gICAgICAgICAgICAgICAgOiB7cjogMTY1LCBnOiA0MiwgIGI6IDQyfSxcbiAgICBidXJseXdvb2QgICAgICAgICAgICA6IHtyOiAyMjIsIGc6IDE4NCwgYjogMTM1fSxcbiAgICBjYWRldGJsdWUgICAgICAgICAgICA6IHtyOiA5NSwgIGc6IDE1OCwgYjogMTYwfSxcbiAgICBjaGFydHJldXNlICAgICAgICAgICA6IHtyOiAxMjcsIGc6IDI1NSwgYjogMH0sXG4gICAgY2hvY29sYXRlICAgICAgICAgICAgOiB7cjogMjEwLCBnOiAxMDUsIGI6IDMwfSxcbiAgICBjb3JhbCAgICAgICAgICAgICAgICA6IHtyOiAyNTUsIGc6IDEyNywgYjogODB9LFxuICAgIGNvcm5mbG93ZXJibHVlICAgICAgIDoge3I6IDEwMCwgZzogMTQ5LCBiOiAyMzd9LFxuICAgIGNvcm5zaWxrICAgICAgICAgICAgIDoge3I6IDI1NSwgZzogMjQ4LCBiOiAyMjB9LFxuICAgIGNyaW1zb24gICAgICAgICAgICAgIDoge3I6IDIyMCwgZzogMjAsICBiOiA2MH0sXG4gICAgY3lhbiAgICAgICAgICAgICAgICAgOiB7cjogMCwgICBnOiAyNTUsIGI6IDI1NX0sXG4gICAgZGFya2JsdWUgICAgICAgICAgICAgOiB7cjogMCwgICBnOiAwLCAgIGI6IDEzOX0sXG4gICAgZGFya2N5YW4gICAgICAgICAgICAgOiB7cjogMCwgICBnOiAxMzksIGI6IDEzOX0sXG4gICAgZGFya2dvbGRlbnJvZCAgICAgICAgOiB7cjogMTg0LCBnOiAxMzQsIGI6IDExfSxcbiAgICBkYXJrZ3JheSAgICAgICAgICAgICA6IHtyOiAxNjksIGc6IDE2OSwgYjogMTY5fSxcbiAgICBkYXJrZ3JlZW4gICAgICAgICAgICA6IHtyOiAwLCAgIGc6IDEwMCwgYjogMH0sXG4gICAgZGFya2dyZXkgICAgICAgICAgICAgOiB7cjogMTY5LCBnOiAxNjksIGI6IDE2OX0sXG4gICAgZGFya2toYWtpICAgICAgICAgICAgOiB7cjogMTg5LCBnOiAxODMsIGI6IDEwN30sXG4gICAgZGFya21hZ2VudGEgICAgICAgICAgOiB7cjogMTM5LCBnOiAwLCAgIGI6IDEzOX0sXG4gICAgZGFya29saXZlZ3JlZW4gICAgICAgOiB7cjogODUsICBnOiAxMDcsIGI6IDQ3fSxcbiAgICBkYXJrb3JhbmdlICAgICAgICAgICA6IHtyOiAyNTUsIGc6IDE0MCwgYjogMH0sXG4gICAgZGFya29yY2hpZCAgICAgICAgICAgOiB7cjogMTUzLCBnOiA1MCwgIGI6IDIwNH0sXG4gICAgZGFya3JlZCAgICAgICAgICAgICAgOiB7cjogMTM5LCBnOiAwLCAgIGI6IDB9LFxuICAgIGRhcmtzYWxtb24gICAgICAgICAgIDoge3I6IDIzMywgZzogMTUwLCBiOiAxMjJ9LFxuICAgIGRhcmtzZWFncmVlbiAgICAgICAgIDoge3I6IDE0MywgZzogMTg4LCBiOiAxNDN9LFxuICAgIGRhcmtzbGF0ZWJsdWUgICAgICAgIDoge3I6IDcyLCAgZzogNjEsICBiOiAxMzl9LFxuICAgIGRhcmtzbGF0ZWdyYXkgICAgICAgIDoge3I6IDQ3LCAgZzogNzksICBiOiA3OX0sXG4gICAgZGFya3NsYXRlZ3JleSAgICAgICAgOiB7cjogNDcsICBnOiA3OSwgIGI6IDc5fSxcbiAgICBkYXJrdHVycXVvaXNlICAgICAgICA6IHtyOiAwLCAgIGc6IDIwNiwgYjogMjA5fSxcbiAgICBkYXJrdmlvbGV0ICAgICAgICAgICA6IHtyOiAxNDgsIGc6IDAsICAgYjogMjExfSxcbiAgICBkZWVwcGluayAgICAgICAgICAgICA6IHtyOiAyNTUsIGc6IDIwLCAgYjogMTQ3fSxcbiAgICBkZWVwc2t5Ymx1ZSAgICAgICAgICA6IHtyOiAwLCAgIGc6IDE5MSwgYjogMjU1fSxcbiAgICBkaW1ncmF5ICAgICAgICAgICAgICA6IHtyOiAxMDUsIGc6IDEwNSwgYjogMTA1fSxcbiAgICBkaW1ncmV5ICAgICAgICAgICAgICA6IHtyOiAxMDUsIGc6IDEwNSwgYjogMTA1fSxcbiAgICBkb2RnZXJibHVlICAgICAgICAgICA6IHtyOiAzMCwgIGc6IDE0NCwgYjogMjU1fSxcbiAgICBmaXJlYnJpY2sgICAgICAgICAgICA6IHtyOiAxNzgsIGc6IDM0LCAgYjogMzR9LFxuICAgIGZsb3JhbHdoaXRlICAgICAgICAgIDoge3I6IDI1NSwgZzogMjUwLCBiOiAyNDB9LFxuICAgIGZvcmVzdGdyZWVuICAgICAgICAgIDoge3I6IDM0LCAgZzogMTM5LCBiOiAzNH0sXG4gICAgZ2FpbnNib3JvICAgICAgICAgICAgOiB7cjogMjIwLCBnOiAyMjAsIGI6IDIyMH0sXG4gICAgZ2hvc3R3aGl0ZSAgICAgICAgICAgOiB7cjogMjQ4LCBnOiAyNDgsIGI6IDI1NX0sXG4gICAgZ29sZCAgICAgICAgICAgICAgICAgOiB7cjogMjU1LCBnOiAyMTUsIGI6IDB9LFxuICAgIGdvbGRlbnJvZCAgICAgICAgICAgIDoge3I6IDIxOCwgZzogMTY1LCBiOiAzMn0sXG4gICAgZ3JlZW55ZWxsb3cgICAgICAgICAgOiB7cjogMTczLCBnOiAyNTUsIGI6IDQ3fSxcbiAgICBncmV5ICAgICAgICAgICAgICAgICA6IHtyOiAxMjgsIGc6IDEyOCwgYjogMTI4fSxcbiAgICBob25leWRldyAgICAgICAgICAgICA6IHtyOiAyNDAsIGc6IDI1NSwgYjogMjQwfSxcbiAgICBob3RwaW5rICAgICAgICAgICAgICA6IHtyOiAyNTUsIGc6IDEwNSwgYjogMTgwfSxcbiAgICBpbmRpYW5yZWQgICAgICAgICAgICA6IHtyOiAyMDUsIGc6IDkyLCAgYjogOTJ9LFxuICAgIGluZGlnbyAgICAgICAgICAgICAgIDoge3I6IDc1LCAgZzogMCwgICBiOiAxMzB9LFxuICAgIGl2b3J5ICAgICAgICAgICAgICAgIDoge3I6IDI1NSwgZzogMjU1LCBiOiAyNDB9LFxuICAgIGtoYWtpICAgICAgICAgICAgICAgIDoge3I6IDI0MCwgZzogMjMwLCBiOiAxNDB9LFxuICAgIGxhdmVuZGVyICAgICAgICAgICAgIDoge3I6IDIzMCwgZzogMjMwLCBiOiAyNTB9LFxuICAgIGxhdmVuZGVyYmx1c2ggICAgICAgIDoge3I6IDI1NSwgZzogMjQwLCBiOiAyNDV9LFxuICAgIGxhd25ncmVlbiAgICAgICAgICAgIDoge3I6IDEyNCwgZzogMjUyLCBiOiAwfSxcbiAgICBsZW1vbmNoaWZmb24gICAgICAgICA6IHtyOiAyNTUsIGc6IDI1MCwgYjogMjA1fSxcbiAgICBsaWdodGJsdWUgICAgICAgICAgICA6IHtyOiAxNzMsIGc6IDIxNiwgYjogMjMwfSxcbiAgICBsaWdodGNvcmFsICAgICAgICAgICA6IHtyOiAyNDAsIGc6IDEyOCwgYjogMTI4fSxcbiAgICBsaWdodGN5YW4gICAgICAgICAgICA6IHtyOiAyMjQsIGc6IDI1NSwgYjogMjU1fSxcbiAgICBsaWdodGdvbGRlbnJvZHllbGxvdyA6IHtyOiAyNTAsIGc6IDI1MCwgYjogMjEwfSxcbiAgICBsaWdodGdyYXkgICAgICAgICAgICA6IHtyOiAyMTEsIGc6IDIxMSwgYjogMjExfSxcbiAgICBsaWdodGdyZWVuICAgICAgICAgICA6IHtyOiAxNDQsIGc6IDIzOCwgYjogMTQ0fSxcbiAgICBsaWdodGdyZXkgICAgICAgICAgICA6IHtyOiAyMTEsIGc6IDIxMSwgYjogMjExfSxcbiAgICBsaWdodHBpbmsgICAgICAgICAgICA6IHtyOiAyNTUsIGc6IDE4MiwgYjogMTkzfSxcbiAgICBsaWdodHNhbG1vbiAgICAgICAgICA6IHtyOiAyNTUsIGc6IDE2MCwgYjogMTIyfSxcbiAgICBsaWdodHNlYWdyZWVuICAgICAgICA6IHtyOiAzMiwgIGc6IDE3OCwgYjogMTcwfSxcbiAgICBsaWdodHNreWJsdWUgICAgICAgICA6IHtyOiAxMzUsIGc6IDIwNiwgYjogMjUwfSxcbiAgICBsaWdodHNsYXRlZ3JheSAgICAgICA6IHtyOiAxMTksIGc6IDEzNiwgYjogMTUzfSxcbiAgICBsaWdodHNsYXRlZ3JleSAgICAgICA6IHtyOiAxMTksIGc6IDEzNiwgYjogMTUzfSxcbiAgICBsaWdodHN0ZWVsYmx1ZSAgICAgICA6IHtyOiAxNzYsIGc6IDE5NiwgYjogMjIyfSxcbiAgICBsaWdodHllbGxvdyAgICAgICAgICA6IHtyOiAyNTUsIGc6IDI1NSwgYjogMjI0fSxcbiAgICBsaW1lZ3JlZW4gICAgICAgICAgICA6IHtyOiA1MCwgIGc6IDIwNSwgYjogNTB9LFxuICAgIGxpbmVuICAgICAgICAgICAgICAgIDoge3I6IDI1MCwgZzogMjQwLCBiOiAyMzB9LFxuICAgIG1hZ2VudGEgICAgICAgICAgICAgIDoge3I6IDI1NSwgZzogMCwgICBiOiAyNTV9LFxuICAgIG1lZGl1bWFxdWFtYXJpbmUgICAgIDoge3I6IDEwMiwgZzogMjA1LCBiOiAxNzB9LFxuICAgIG1lZGl1bWJsdWUgICAgICAgICAgIDoge3I6IDAsICAgZzogMCwgICBiOiAyMDV9LFxuICAgIG1lZGl1bW9yY2hpZCAgICAgICAgIDoge3I6IDE4NiwgZzogODUsICBiOiAyMTF9LFxuICAgIG1lZGl1bXB1cnBsZSAgICAgICAgIDoge3I6IDE0NywgZzogMTEyLCBiOiAyMTl9LFxuICAgIG1lZGl1bXNlYWdyZWVuICAgICAgIDoge3I6IDYwLCAgZzogMTc5LCBiOiAxMTN9LFxuICAgIG1lZGl1bXNsYXRlYmx1ZSAgICAgIDoge3I6IDEyMywgZzogMTA0LCBiOiAyMzh9LFxuICAgIG1lZGl1bXNwcmluZ2dyZWVuICAgIDoge3I6IDAsICAgZzogMjUwLCBiOiAxNTR9LFxuICAgIG1lZGl1bXR1cnF1b2lzZSAgICAgIDoge3I6IDcyLCAgZzogMjA5LCBiOiAyMDR9LFxuICAgIG1lZGl1bXZpb2xldHJlZCAgICAgIDoge3I6IDE5OSwgZzogMjEsICBiOiAxMzN9LFxuICAgIG1pZG5pZ2h0Ymx1ZSAgICAgICAgIDoge3I6IDI1LCAgZzogMjUsICBiOiAxMTJ9LFxuICAgIG1pbnRjcmVhbSAgICAgICAgICAgIDoge3I6IDI0NSwgZzogMjU1LCBiOiAyNTB9LFxuICAgIG1pc3R5cm9zZSAgICAgICAgICAgIDoge3I6IDI1NSwgZzogMjI4LCBiOiAyMjV9LFxuICAgIG1vY2Nhc2luICAgICAgICAgICAgIDoge3I6IDI1NSwgZzogMjI4LCBiOiAxODF9LFxuICAgIG5hdmFqb3doaXRlICAgICAgICAgIDoge3I6IDI1NSwgZzogMjIyLCBiOiAxNzN9LFxuICAgIG9sZGxhY2UgICAgICAgICAgICAgIDoge3I6IDI1MywgZzogMjQ1LCBiOiAyMzB9LFxuICAgIG9saXZlZHJhYiAgICAgICAgICAgIDoge3I6IDEwNywgZzogMTQyLCBiOiAzNX0sXG4gICAgb3JhbmdlICAgICAgICAgICAgICAgOiB7cjogMjU1LCBnOiAxNjUsIGI6IDB9LFxuICAgIG9yYW5nZXJlZCAgICAgICAgICAgIDoge3I6IDI1NSwgZzogNjksICBiOiAwfSxcbiAgICBvcmNoaWQgICAgICAgICAgICAgICA6IHtyOiAyMTgsIGc6IDExMiwgYjogMjE0fSxcbiAgICBwYWxlZ29sZGVucm9kICAgICAgICA6IHtyOiAyMzgsIGc6IDIzMiwgYjogMTcwfSxcbiAgICBwYWxlZ3JlZW4gICAgICAgICAgICA6IHtyOiAxNTIsIGc6IDI1MSwgYjogMTUyfSxcbiAgICBwYWxldHVycXVvaXNlICAgICAgICA6IHtyOiAxNzUsIGc6IDIzOCwgYjogMjM4fSxcbiAgICBwYWxldmlvbGV0cmVkICAgICAgICA6IHtyOiAyMTksIGc6IDExMiwgYjogMTQ3fSxcbiAgICBwYXBheWF3aGlwICAgICAgICAgICA6IHtyOiAyNTUsIGc6IDIzOSwgYjogMjEzfSxcbiAgICBwZWFjaHB1ZmYgICAgICAgICAgICA6IHtyOiAyNTUsIGc6IDIxOCwgYjogMTg1fSxcbiAgICBwZXJ1ICAgICAgICAgICAgICAgICA6IHtyOiAyMDUsIGc6IDEzMywgYjogNjN9LFxuICAgIHBpbmsgICAgICAgICAgICAgICAgIDoge3I6IDI1NSwgZzogMTkyLCBiOiAyMDN9LFxuICAgIHBsdW0gICAgICAgICAgICAgICAgIDoge3I6IDIyMSwgZzogMTYwLCBiOiAyMjF9LFxuICAgIHBvd2RlcmJsdWUgICAgICAgICAgIDoge3I6IDE3NiwgZzogMjI0LCBiOiAyMzB9LFxuICAgIHJvc3licm93biAgICAgICAgICAgIDoge3I6IDE4OCwgZzogMTQzLCBiOiAxNDN9LFxuICAgIHJveWFsYmx1ZSAgICAgICAgICAgIDoge3I6IDY1LCAgZzogMTA1LCBiOiAyMjV9LFxuICAgIHNhZGRsZWJyb3duICAgICAgICAgIDoge3I6IDEzOSwgZzogNjksICBiOiAxOX0sXG4gICAgc2FsbW9uICAgICAgICAgICAgICAgOiB7cjogMjUwLCBnOiAxMjgsIGI6IDExNH0sXG4gICAgc2FuZHlicm93biAgICAgICAgICAgOiB7cjogMjQ0LCBnOiAxNjQsIGI6IDk2fSxcbiAgICBzZWFncmVlbiAgICAgICAgICAgICA6IHtyOiA0NiwgIGc6IDEzOSwgYjogODd9LFxuICAgIHNlYXNoZWxsICAgICAgICAgICAgIDoge3I6IDI1NSwgZzogMjQ1LCBiOiAyMzh9LFxuICAgIHNpZW5uYSAgICAgICAgICAgICAgIDoge3I6IDE2MCwgZzogODIsICBiOiA0NX0sXG4gICAgc2t5Ymx1ZSAgICAgICAgICAgICAgOiB7cjogMTM1LCBnOiAyMDYsIGI6IDIzNX0sXG4gICAgc2xhdGVibHVlICAgICAgICAgICAgOiB7cjogMTA2LCBnOiA5MCwgIGI6IDIwNX0sXG4gICAgc2xhdGVncmF5ICAgICAgICAgICAgOiB7cjogMTEyLCBnOiAxMjgsIGI6IDE0NH0sXG4gICAgc2xhdGVncmV5ICAgICAgICAgICAgOiB7cjogMTEyLCBnOiAxMjgsIGI6IDE0NH0sXG4gICAgc25vdyAgICAgICAgICAgICAgICAgOiB7cjogMjU1LCBnOiAyNTAsIGI6IDI1MH0sXG4gICAgc3ByaW5nZ3JlZW4gICAgICAgICAgOiB7cjogMCwgICBnOiAyNTUsIGI6IDEyN30sXG4gICAgc3RlZWxibHVlICAgICAgICAgICAgOiB7cjogNzAsICBnOiAxMzAsIGI6IDE4MH0sXG4gICAgdGFuICAgICAgICAgICAgICAgICAgOiB7cjogMjEwLCBnOiAxODAsIGI6IDE0MH0sXG4gICAgdGhpc3RsZSAgICAgICAgICAgICAgOiB7cjogMjE2LCBnOiAxOTEsIGI6IDIxNn0sXG4gICAgdG9tYXRvICAgICAgICAgICAgICAgOiB7cjogMjU1LCBnOiA5OSwgIGI6IDcxfSxcbiAgICB0dXJxdW9pc2UgICAgICAgICAgICA6IHtyOiA2NCwgIGc6IDIyNCwgYjogMjA4fSxcbiAgICB2aW9sZXQgICAgICAgICAgICAgICA6IHtyOiAyMzgsIGc6IDEzMCwgYjogMjM4fSxcbiAgICB3aGVhdCAgICAgICAgICAgICAgICA6IHtyOiAyNDUsIGc6IDIyMiwgYjogMTc5fSxcbiAgICB3aGl0ZXNtb2tlICAgICAgICAgICA6IHtyOiAyNDUsIGc6IDI0NSwgYjogMjQ1fSxcbiAgICB5ZWxsb3dncmVlbiAgICAgICAgICA6IHtyOiAxNTQsIGc6IDIwNSwgYjogNTB9XG59XG4iLCJ2YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBwYXJzZXJzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGV4YW1wbGU6IFszNTU0NDMxLCAxNjgwOTk4NF0sXG4gICAgICAgICAgICByZWdleDogL15cXGQrJC8sXG4gICAgICAgICAgICBwcm9jZXNzOiBmdW5jdGlvbiAoY29sb3Ipe1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIC8vYTogY29sb3IgPj4gMjQgJiAyNTUsXG4gICAgICAgICAgICAgICAgICAgIHI6IGNvbG9yID4+IDE2ICYgMjU1LFxuICAgICAgICAgICAgICAgICAgICBnOiBjb2xvciA+PiA4ICYgMjU1LFxuICAgICAgICAgICAgICAgICAgICBiOiBjb2xvciAmIDI1NVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAge1xuICAgICAgICAgICAgZXhhbXBsZTogWycjZmIwJywgJ2YwZiddLFxuICAgICAgICAgICAgcmVnZXg6IC9eIz8oW1xcZEEtRl17MX0pKFtcXGRBLUZdezF9KShbXFxkQS1GXXsxfSkkL2ksXG4gICAgICAgICAgICBwcm9jZXNzOiBmdW5jdGlvbiAoaGV4LCByLCBnLCBiKXtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICByOiBwYXJzZUludChyICsgciwgMTYpLFxuICAgICAgICAgICAgICAgICAgICBnOiBwYXJzZUludChnICsgZywgMTYpLFxuICAgICAgICAgICAgICAgICAgICBiOiBwYXJzZUludChiICsgYiwgMTYpXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB7XG4gICAgICAgICAgICBleGFtcGxlOiBbJyMwMGZmMDAnLCAnMzM2Njk5J10sXG4gICAgICAgICAgICByZWdleDogL14jPyhbXFxkQS1GXXsyfSkoW1xcZEEtRl17Mn0pKFtcXGRBLUZdezJ9KSQvaSxcbiAgICAgICAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uIChoZXgsIHIsIGcsIGIpe1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHI6IHBhcnNlSW50KHIsIDE2KSxcbiAgICAgICAgICAgICAgICAgICAgZzogcGFyc2VJbnQoZywgMTYpLFxuICAgICAgICAgICAgICAgICAgICBiOiBwYXJzZUludChiLCAxNilcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHtcbiAgICAgICAgICAgIGV4YW1wbGU6IFsncmdiKDEyMywgMjM0LCA0NSknLCAncmdiKDI1LCA1MCUsIDEwMCUpJywgJ3JnYmEoMTIlLCAzNCwgNTYlLCAwLjc4KSddLFxuICAgICAgICAgICAgLy8gcmVnZXg6IC9ecmdiYSpcXCgoXFxkezEsM31cXCUqKSxcXHMqKFxcZHsxLDN9XFwlKiksXFxzKihcXGR7MSwzfVxcJSopKD86LFxccyooWzAtOS5dKykpP1xcKS8sXG4gICAgICAgICAgICByZWdleDogL15yZ2JhKlxcKChbMC05XSpcXC4/WzAtOV0rXFwlKiksXFxzKihbMC05XSpcXC4/WzAtOV0rXFwlKiksXFxzKihbMC05XSpcXC4/WzAtOV0rXFwlKikoPzosXFxzKihbMC05Ll0rKSk/XFwpLyxcbiAgICAgICAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uIChzLHIsZyxiLGEpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgciA9IHIgJiYgci5zbGljZSgtMSkgPT0gJyUnID8gKHIuc2xpY2UoMCwtMSkgLyAxMDApIDogcioxO1xuICAgICAgICAgICAgICAgIGcgPSBnICYmIGcuc2xpY2UoLTEpID09ICclJyA/IChnLnNsaWNlKDAsLTEpIC8gMTAwKSA6IGcqMTtcbiAgICAgICAgICAgICAgICBiID0gYiAmJiBiLnNsaWNlKC0xKSA9PSAnJScgPyAoYi5zbGljZSgwLC0xKSAvIDEwMCkgOiBiKjE7XG4gICAgICAgICAgICAgICAgYSA9IGEqMTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHI6IHV0aWwuY2xhbXAociwgMCwgMjU1KSxcbiAgICAgICAgICAgICAgICAgICAgZzogdXRpbC5jbGFtcChnLCAwLCAyNTUpLFxuICAgICAgICAgICAgICAgICAgICBiOiB1dGlsLmNsYW1wKGIsIDAsIDI1NSksXG4gICAgICAgICAgICAgICAgICAgIGE6IHV0aWwuY2xhbXAoYSwgMCwgMSkgfHwgdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB7XG4gICAgICAgICAgICBleGFtcGxlOiBbJ2hzbCgxMjMsIDM0JSwgNDUlKScsICdoc2xhKDI1LCA1MCUsIDEwMCUsIDAuNzUpJywgJ2hzdigxMiwgMzQlLCA1NiUpJ10sXG4gICAgICAgICAgICByZWdleDogL15ocyhbYnZsXSlhKlxcKChcXGR7MSwzfVxcJSopLFxccyooXFxkezEsM31cXCUqKSxcXHMqKFxcZHsxLDN9XFwlKikoPzosXFxzKihbMC05Ll0rKSk/XFwpLyxcbiAgICAgICAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uIChjLGx2LGgscyxsLGEpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaCAqPSAxO1xuICAgICAgICAgICAgICAgIHMgPSBzLnNsaWNlKDAsLTEpIC8gMTAwO1xuICAgICAgICAgICAgICAgIGwgPSBsLnNsaWNlKDAsLTEpIC8gMTAwO1xuICAgICAgICAgICAgICAgIGEgKj0gMTtcblxuICAgICAgICAgICAgICAgIHZhciBvYmogPSB7XG4gICAgICAgICAgICAgICAgICAgIGg6IHV0aWwuY2xhbXAoaCwgMCwgMzYwKSxcbiAgICAgICAgICAgICAgICAgICAgYTogdXRpbC5jbGFtcChsLCAwLCAxKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgLy8gYHNgIGlzIHVzZWQgaW4gbWFueSBkaWZmZXJlbnQgc3BhY2VzIChIU0wsIEhTViwgSFNCKVxuICAgICAgICAgICAgICAgIC8vIHNvIHdlIHVzZSBgc2xgLCBgc3ZgIGFuZCBgc2JgIHRvIGRpZmZlcmVudGlhdGVcbiAgICAgICAgICAgICAgICBvYmpbJ3MnK2x2XSA9IHV0aWwuY2xhbXAocywgMCwgMSksXG4gICAgICAgICAgICAgICAgb2JqW2x2XSA9IHV0aWwuY2xhbXAobCwgMCwgMSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgXVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gQ2hyb21hdGhQcm90b3R5cGUoQ2hyb21hdGgpIHtcbiAgcmV0dXJuIHtcbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvTmFtZVxuICAgICAgICAgQ2FsbCA8Q2hyb21hdGgudG9OYW1lPiBvbiB0aGUgY3VycmVudCBpbnN0YW5jZVxuICAgICAgICAgPiA+IHZhciBjb2xvciA9IG5ldyBDaHJvbWF0aCgncmdiKDE3MywgMjE2LCAyMzApJyk7XG4gICAgICAgICA+ID4gY29sb3IudG9OYW1lKCk7XG4gICAgICAgICA+IFwibGlnaHRibHVlXCJcbiAgICAgICovXG4gICAgICB0b05hbWU6IGZ1bmN0aW9uICgpeyByZXR1cm4gQ2hyb21hdGgudG9OYW1lKHRoaXMpOyB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b1N0cmluZ1xuICAgICAgICAgRGlzcGxheSB0aGUgaW5zdGFuY2UgYXMgYSBzdHJpbmcuIERlZmF1bHRzIHRvIDxDaHJvbWF0aC50b0hleFN0cmluZz5cbiAgICAgICAgID4gPiB2YXIgY29sb3IgPSBDaHJvbWF0aC5yZ2IoNTYsIDc4LCA5MCk7XG4gICAgICAgICA+ID4gQ29sb3IudG9IZXhTdHJpbmcoKTtcbiAgICAgICAgID4gXCIjMzg0RTVBXCJcbiAgICAgICovXG4gICAgICB0b1N0cmluZzogZnVuY3Rpb24gKCl7IHJldHVybiB0aGlzLnRvSGV4U3RyaW5nKCk7IH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHZhbHVlT2ZcbiAgICAgICAgIERpc3BsYXkgdGhlIGluc3RhbmNlIGFzIGFuIGludGVnZXIuIERlZmF1bHRzIHRvIDxDaHJvbWF0aC50b0ludGVnZXI+XG4gICAgICAgICA+ID4gdmFyIHllbGxvdyA9IG5ldyBDaHJvbWF0aCgneWVsbG93Jyk7XG4gICAgICAgICA+ID4geWVsbG93LnZhbHVlT2YoKTtcbiAgICAgICAgID4gMTY3NzY5NjBcbiAgICAgICAgID4gPiAreWVsbG93XG4gICAgICAgICA+IDE2Nzc2OTYwXG4gICAgICAqL1xuICAgICAgdmFsdWVPZjogZnVuY3Rpb24gKCl7IHJldHVybiBDaHJvbWF0aC50b0ludGVnZXIodGhpcyk7IH0sXG5cbiAgICAvKlxuICAgICAgIE1ldGhvZDogcmdiXG4gICAgICAgUmV0dXJuIHRoZSBSR0IgYXJyYXkgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgPiA+IG5ldyBDaHJvbWF0aCgncmVkJykucmdiKCk7XG4gICAgICAgPiBbMjU1LCAwLCAwXVxuICAgICovXG4gICAgICByZ2I6IGZ1bmN0aW9uICgpeyByZXR1cm4gdGhpcy50b1JHQkFycmF5KCk7IH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvUkdCQXJyYXlcbiAgICAgICAgIFJldHVybiB0aGUgUkdCIGFycmF5IG9mIHRoZSBpbnN0YW5jZVxuICAgICAgICAgPiA+IENocm9tYXRoLmJ1cmx5d29vZC50b1JHQkFycmF5KCk7XG4gICAgICAgICA+IFsyNTUsIDE4NCwgMTM1XVxuICAgICAgKi9cbiAgICAgIHRvUkdCQXJyYXk6IGZ1bmN0aW9uICgpeyByZXR1cm4gdGhpcy50b1JHQkFBcnJheSgpLnNsaWNlKDAsMyk7IH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvUkdCT2JqZWN0XG4gICAgICAgICBSZXR1cm4gdGhlIFJHQiBvYmplY3Qgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgICA+ID4gbmV3IENocm9tYXRoKCdidXJseXdvb2QnKS50b1JHQk9iamVjdCgpO1xuICAgICAgICAgPiB7cjogMjU1LCBnOiAxODQsIGI6IDEzNX1cbiAgICAgICovXG4gICAgICB0b1JHQk9iamVjdDogZnVuY3Rpb24gKClcbiAgICAgIHtcbiAgICAgICAgICB2YXIgcmdiID0gdGhpcy50b1JHQkFycmF5KCk7XG5cbiAgICAgICAgICByZXR1cm4ge3I6IHJnYlswXSwgZzogcmdiWzFdLCBiOiByZ2JbMl19O1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG9SR0JTdHJpbmdcbiAgICAgICAgIFJldHVybiB0aGUgUkdCIHN0cmluZyBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJ2FsaWNlYmx1ZScpLnRvUkdCU3RyaW5nKCk7XG4gICAgICAgICA+IFwicmdiKDI0MCwyNDgsMjU1KVwiXG4gICAgICAqL1xuICAgICAgdG9SR0JTdHJpbmc6IGZ1bmN0aW9uICgpXG4gICAgICB7XG4gICAgICAgICAgcmV0dXJuIFwicmdiKFwiKyB0aGlzLnRvUkdCQXJyYXkoKS5qb2luKFwiLFwiKSArXCIpXCI7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiByZ2JhXG4gICAgICAgICBSZXR1cm4gdGhlIFJHQkEgYXJyYXkgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgICA+ID4gbmV3IENocm9tYXRoKCdyZWQnKS5yZ2JhKCk7XG4gICAgICAgICA+IFsyNTUsIDAsIDAsIDFdXG4gICAgICAqL1xuICAgICAgcmdiYTogZnVuY3Rpb24gKCl7IHJldHVybiB0aGlzLnRvUkdCQUFycmF5KCk7IH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvUkdCQUFycmF5XG4gICAgICAgICBSZXR1cm4gdGhlIFJHQkEgYXJyYXkgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgICA+ID4gQ2hyb21hdGgubGltZS50b1JHQkFBcnJheSgpO1xuICAgICAgICAgPiBbMCwgMjU1LCAwLCAxXVxuICAgICAgKi9cbiAgICAgIHRvUkdCQUFycmF5OiBmdW5jdGlvbiAoKVxuICAgICAge1xuICAgICAgICAgIHZhciByZ2JhID0gW1xuICAgICAgICAgICAgICBNYXRoLnJvdW5kKHRoaXMucioyNTUpLFxuICAgICAgICAgICAgICBNYXRoLnJvdW5kKHRoaXMuZyoyNTUpLFxuICAgICAgICAgICAgICBNYXRoLnJvdW5kKHRoaXMuYioyNTUpLFxuICAgICAgICAgICAgICBwYXJzZUZsb2F0KHRoaXMuYSlcbiAgICAgICAgICBdO1xuXG4gICAgICAgICAgcmV0dXJuIHJnYmE7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b1JHQkFPYmplY3RcbiAgICAgICAgIFJldHVybiB0aGUgUkdCQSBvYmplY3Qgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgICA+ID4gQ2hyb21hdGguY2FkZXRibHVlLnRvUkdCQU9iamVjdCgpO1xuICAgICAgICAgPiB7cjogOTUsIGc6IDE1OCwgYjogMTYwfVxuICAgICAgKi9cbiAgICAgIHRvUkdCQU9iamVjdDogZnVuY3Rpb24gKClcbiAgICAgIHtcbiAgICAgICAgICB2YXIgcmdiYSA9IHRoaXMudG9SR0JBQXJyYXkoKTtcblxuICAgICAgICAgIHJldHVybiB7cjogcmdiYVswXSwgZzogcmdiYVsxXSwgYjogcmdiYVsyXSwgYTogcmdiYVszXX07XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b1JHQkFTdHJpbmdcbiAgICAgICAgIFJldHVybiB0aGUgUkdCQSBzdHJpbmcgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgICA+ID4gbmV3IENocm9tYXRoKCdkYXJrYmx1ZScpLnRvUkdCQVN0cmluZygpO1xuICAgICAgICAgPiBcInJnYmEoMCwwLDEzOSwxKVwiXG4gICAgICAqL1xuICAgICAgdG9SR0JBU3RyaW5nOiBmdW5jdGlvbiAoKXtcbiAgICAgICAgICByZXR1cm4gXCJyZ2JhKFwiKyB0aGlzLnRvUkdCQUFycmF5KCkuam9pbihcIixcIikgK1wiKVwiO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogaGV4XG4gICAgICAgICBSZXR1cm4gdGhlIGhleCBhcnJheSBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgID4gbmV3IENocm9tYXRoKCdkYXJrZ3JlZW4nKS5oZXgoKVxuICAgICAgICAgWyAnMDAnLCAnNjQnLCAnMDAnIF1cbiAgICAgICovXG4gICAgICBoZXg6IGZ1bmN0aW9uICgpeyByZXR1cm4gdGhpcy50b0hleEFycmF5KCk7IH0sXG5cbiAgICAgIC8qXG4gICAgICAgIE1ldGhvZDogdG9IZXhBcnJheVxuICAgICAgICAgUmV0dXJuIHRoZSBoZXggYXJyYXkgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgID4gPiBDaHJvbWF0aC5maXJlYnJpY2sudG9IZXhBcnJheSgpO1xuICAgICAgICA+IFtcIkIyXCIsIFwiMjJcIiwgXCIyMlwiXVxuICAgICAgKi9cbiAgICAgIHRvSGV4QXJyYXk6IGZ1bmN0aW9uICgpe1xuICAgICAgICAgIHJldHVybiBDaHJvbWF0aC5yZ2IyaGV4KHRoaXMuciwgdGhpcy5nLCB0aGlzLmIpO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG9IZXhPYmplY3RcbiAgICAgICAgIFJldHVybiB0aGUgaGV4IG9iamVjdCBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgID4gPiBDaHJvbWF0aC5nYWluc2Jvcm8udG9IZXhPYmplY3QoKTtcbiAgICAgICAgID4ge3I6IFwiRENcIiwgZzogXCJEQ1wiLCBiOiBcIkRDXCJ9XG4gICAgICAqL1xuICAgICAgdG9IZXhPYmplY3Q6IGZ1bmN0aW9uICgpXG4gICAgICB7XG4gICAgICAgICAgdmFyIGhleCA9IHRoaXMudG9IZXhBcnJheSgpO1xuXG4gICAgICAgICAgcmV0dXJuIHsgcjogaGV4WzBdLCBnOiBoZXhbMV0sIGI6IGhleFsyXSB9O1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgTWV0aG9kOiB0b0hleFN0cmluZ1xuICAgICAgICAgUmV0dXJuIHRoZSBoZXggc3RyaW5nIG9mIHRoZSBpbnN0YW5jZVxuICAgICAgICA+ID4gQ2hyb21hdGguaG9uZXlkZXcudG9IZXhTdHJpbmcoKTtcbiAgICAgICAgPiBcIiNGMEZGRjBcIlxuICAgICAgKi9cbiAgICAgIHRvSGV4U3RyaW5nOiBmdW5jdGlvbiAoKXtcbiAgICAgICAgICB2YXIgaGV4ID0gdGhpcy50b0hleEFycmF5KCk7XG5cbiAgICAgICAgICByZXR1cm4gJyMnICsgaGV4LmpvaW4oJycpO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogaHNsXG4gICAgICAgICBSZXR1cm4gdGhlIEhTTCBhcnJheSBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgID4gPm5ldyBDaHJvbWF0aCgnZ3JlZW4nKS5oc2woKTtcbiAgICAgICAgID4gWzEyMCwgMSwgMC4yNTA5ODAzOTIxNTY4NjI3NF1cbiAgICAgICovXG4gICAgICBoc2w6IGZ1bmN0aW9uICgpeyByZXR1cm4gdGhpcy50b0hTTEFycmF5KCk7IH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvSFNMQXJyYXlcbiAgICAgICAgIFJldHVybiB0aGUgSFNMIGFycmF5IG9mIHRoZSBpbnN0YW5jZVxuICAgICAgICAgPiA+IG5ldyBDaHJvbWF0aCgncmVkJykudG9IU0xBcnJheSgpO1xuICAgICAgICAgPiBbMCwgMSwgMC41XVxuICAgICAgKi9cbiAgICAgIHRvSFNMQXJyYXk6IGZ1bmN0aW9uICgpe1xuICAgICAgICAgIHJldHVybiB0aGlzLnRvSFNMQUFycmF5KCkuc2xpY2UoMCwzKTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvSFNMT2JqZWN0XG4gICAgICAgICBSZXR1cm4gdGhlIEhTTCBvYmplY3Qgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgICA+ID4gbmV3IENocm9tYXRoKCdyZWQnKS50b0hTTE9iamVjdCgpO1xuICAgICAgICAgW2g6MCwgczoxLCBsOjAuNV1cbiAgICAgICovXG4gICAgICB0b0hTTE9iamVjdDogZnVuY3Rpb24gKClcbiAgICAgIHtcbiAgICAgICAgICB2YXIgaHNsID0gdGhpcy50b0hTTEFycmF5KCk7XG5cbiAgICAgICAgICByZXR1cm4ge2g6IGhzbFswXSwgczogaHNsWzFdLCBsOiBoc2xbMl19O1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG9IU0xTdHJpbmdcbiAgICAgICAgIFJldHVybiB0aGUgSFNMIHN0cmluZyBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJ3JlZCcpLnRvSFNMU3RyaW5nKCk7XG4gICAgICAgICA+IFwiaHNsKDAsMSwwLjUpXCJcbiAgICAgICovXG4gICAgICB0b0hTTFN0cmluZzogZnVuY3Rpb24gKCl7XG4gICAgICAgICAgdmFyIGhzbGEgPSB0aGlzLnRvSFNMQUFycmF5KCk7XG4gICAgICAgICAgdmFyIHZhbHMgPSBbXG4gICAgICAgICAgICAgIGhzbGFbMF0sXG4gICAgICAgICAgICAgIE1hdGgucm91bmQoaHNsYVsxXSoxMDApKyclJyxcbiAgICAgICAgICAgICAgTWF0aC5yb3VuZChoc2xhWzJdKjEwMCkrJyUnXG4gICAgICAgICAgXTtcblxuICAgICAgICAgIHJldHVybiAnaHNsKCcrIHZhbHMgKycpJztcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgIE1ldGhvZDogaHNsYVxuICAgICAgICBSZXR1cm4gdGhlIEhTTEEgYXJyYXkgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJ2dyZWVuJykuaHNsYSgpO1xuICAgICAgICA+IFsxMjAsIDEsIDAuMjUwOTgwMzkyMTU2ODYyNzQsIDFdXG4gICAgICAqL1xuICAgICAgaHNsYTogZnVuY3Rpb24gKCl7IHJldHVybiB0aGlzLnRvSFNMQUFycmF5KCk7IH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvSFNMQXJyYXlcbiAgICAgICAgIFJldHVybiB0aGUgSFNMQSBhcnJheSBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgID4gPiBDaHJvbWF0aC5hbnRpcXVld2hpdGUudG9IU0xBQXJyYXkoKTtcbiAgICAgICAgID4gWzM0LCAwLjc3Nzc3Nzc3Nzc3Nzc3NzMsIDAuOTExNzY0NzA1ODgyMzUyOSwgMV1cbiAgICAgICovXG4gICAgICB0b0hTTEFBcnJheTogZnVuY3Rpb24gKClcbiAgICAgIHtcbiAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICBNYXRoLnJvdW5kKHRoaXMuaCksXG4gICAgICAgICAgICAgIHBhcnNlRmxvYXQodGhpcy5zbCksXG4gICAgICAgICAgICAgIHBhcnNlRmxvYXQodGhpcy5sKSxcbiAgICAgICAgICAgICAgcGFyc2VGbG9hdCh0aGlzLmEpXG4gICAgICAgICAgXTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvSFNMQU9iamVjdFxuICAgICAgICAgUmV0dXJuIHRoZSBIU0xBIG9iamVjdCBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgID4gPiBDaHJvbWF0aC5hbnRpcXVld2hpdGUudG9IU0xBQXJyYXkoKTtcbiAgICAgICAgID4ge2g6MzQsIHM6MC43Nzc3Nzc3Nzc3Nzc3NzczLCBsOjAuOTExNzY0NzA1ODgyMzUyOSwgYToxfVxuICAgICAgKi9cbiAgICAgIHRvSFNMQU9iamVjdDogZnVuY3Rpb24gKClcbiAgICAgIHtcbiAgICAgICAgICB2YXIgaHNsYSA9IHRoaXMudG9IU0xBQXJyYXkoKTtcblxuICAgICAgICAgIHJldHVybiB7aDogaHNsYVswXSwgczogaHNsYVsxXSwgbDogaHNsYVsyXSwgYTogaHNsYVszXX07XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b0hTTEFTdHJpbmdcbiAgICAgICAgIFJldHVybiB0aGUgSFNMQSBzdHJpbmcgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgICA+ID4gQ2hyb21hdGguYW50aXF1ZXdoaXRlLnRvSFNMQVN0cmluZygpO1xuICAgICAgICAgPiBcImhzbGEoMzQsMC43Nzc3Nzc3Nzc3Nzc3NzczLDAuOTExNzY0NzA1ODgyMzUyOSwxKVwiXG4gICAgICAqL1xuICAgICAgdG9IU0xBU3RyaW5nOiBmdW5jdGlvbiAoKXtcbiAgICAgICAgICB2YXIgaHNsYSA9IHRoaXMudG9IU0xBQXJyYXkoKTtcbiAgICAgICAgICB2YXIgdmFscyA9IFtcbiAgICAgICAgICAgICAgaHNsYVswXSxcbiAgICAgICAgICAgICAgTWF0aC5yb3VuZChoc2xhWzFdKjEwMCkrJyUnLFxuICAgICAgICAgICAgICBNYXRoLnJvdW5kKGhzbGFbMl0qMTAwKSsnJScsXG4gICAgICAgICAgICAgIE1hdGgucm91bmQoaHNsYVszXSlcbiAgICAgICAgICBdO1xuXG4gICAgICAgICAgcmV0dXJuICdoc2xhKCcrIHZhbHMgKycpJztcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IGhzdlxuICAgICAgICAgUmV0dXJuIHRoZSBIU1YgYXJyYXkgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgICA+ID4gbmV3IENocm9tYXRoKCdibHVlJykuaHN2KCk7XG4gICAgICAgICA+IFsyNDAsIDEsIDFdXG4gICAgICAqL1xuICAgICAgaHN2OiBmdW5jdGlvbiAoKXsgcmV0dXJuIHRoaXMudG9IU1ZBcnJheSgpOyB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b0hTVkFycmF5XG4gICAgICAgICBSZXR1cm4gdGhlIEhTViBhcnJheSBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJ25hdmFqb3doaXRlJykudG9IU1ZBcnJheSgpO1xuICAgICAgICAgPiBbMzYsIDAuMzIxNTY4NjI3NDUwOTgwMzYsIDFdXG4gICAgICAqL1xuICAgICAgdG9IU1ZBcnJheTogZnVuY3Rpb24gKClcbiAgICAgIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy50b0hTVkFBcnJheSgpLnNsaWNlKDAsMyk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b0hTVk9iamVjdFxuICAgICAgICAgUmV0dXJuIHRoZSBIU1Ygb2JqZWN0IG9mIHRoZSBpbnN0YW5jZVxuICAgICAgICAgPiA+IG5ldyBDaHJvbWF0aCgnbmF2YWpvd2hpdGUnKS50b0hTVk9iamVjdCgpO1xuICAgICAgICAgPiB7aDM2LCBzOjAuMzIxNTY4NjI3NDUwOTgwMzYsIHY6MX1cbiAgICAgICovXG4gICAgICB0b0hTVk9iamVjdDogZnVuY3Rpb24gKClcbiAgICAgIHtcbiAgICAgICAgICB2YXIgaHN2YSA9IHRoaXMudG9IU1ZBQXJyYXkoKTtcblxuICAgICAgICAgIHJldHVybiB7aDogaHN2YVswXSwgczogaHN2YVsxXSwgdjogaHN2YVsyXX07XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b0hTVlN0cmluZ1xuICAgICAgICAgUmV0dXJuIHRoZSBIU1Ygc3RyaW5nIG9mIHRoZSBpbnN0YW5jZVxuICAgICAgICAgPiA+IG5ldyBDaHJvbWF0aCgnbmF2YWpvd2hpdGUnKS50b0hTVlN0cmluZygpO1xuICAgICAgICAgPiBcImhzdigzNiwzMi4xNTY4NjI3NDUwOTgwNCUsMTAwJSlcIlxuICAgICAgKi9cbiAgICAgIHRvSFNWU3RyaW5nOiBmdW5jdGlvbiAoKVxuICAgICAge1xuICAgICAgICAgIHZhciBoc3YgPSB0aGlzLnRvSFNWQXJyYXkoKTtcbiAgICAgICAgICB2YXIgdmFscyA9IFtcbiAgICAgICAgICAgICAgaHN2WzBdLFxuICAgICAgICAgICAgICBNYXRoLnJvdW5kKGhzdlsxXSoxMDApKyclJyxcbiAgICAgICAgICAgICAgTWF0aC5yb3VuZChoc3ZbMl0qMTAwKSsnJSdcbiAgICAgICAgICBdO1xuXG4gICAgICAgICAgcmV0dXJuICdoc3YoJysgdmFscyArJyknO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogaHN2YVxuICAgICAgICAgUmV0dXJuIHRoZSBIU1ZBIGFycmF5IG9mIHRoZSBpbnN0YW5jZVxuICAgICAgICAgPiA+IG5ldyBDaHJvbWF0aCgnYmx1ZScpLmhzdmEoKTtcbiAgICAgICAgID4gWzI0MCwgMSwgMSwgMV1cbiAgICAgICovXG4gICAgICBoc3ZhOiBmdW5jdGlvbiAoKXsgcmV0dXJuIHRoaXMudG9IU1ZBQXJyYXkoKTsgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG9IU1ZBQXJyYXlcbiAgICAgICAgIFJldHVybiB0aGUgSFNWQSBhcnJheSBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJ29saXZlJykudG9IU1ZBQXJyYXkoKTtcbiAgICAgICAgID4gWzYwLCAxLCAwLjUwMTk2MDc4NDMxMzcyNTUsIDFdXG4gICAgICAqL1xuICAgICAgdG9IU1ZBQXJyYXk6IGZ1bmN0aW9uICgpe1xuICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgIE1hdGgucm91bmQodGhpcy5oKSxcbiAgICAgICAgICAgICAgcGFyc2VGbG9hdCh0aGlzLnN2KSxcbiAgICAgICAgICAgICAgcGFyc2VGbG9hdCh0aGlzLnYpLFxuICAgICAgICAgICAgICBwYXJzZUZsb2F0KHRoaXMuYSlcbiAgICAgICAgICBdO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG9IU1ZBT2JqZWN0XG4gICAgICAgICBSZXR1cm4gdGhlIEhTVkEgb2JqZWN0IG9mIHRoZSBpbnN0YW5jZVxuICAgICAgICAgPiA+IG5ldyBDaHJvbWF0aCgnb2xpdmUnKS50b0hTVkFBcnJheSgpO1xuICAgICAgICAgPiB7aDo2MCwgczogMSwgdjowLjUwMTk2MDc4NDMxMzcyNTUsIGE6MX1cbiAgICAgICovXG4gICAgICB0b0hTVkFPYmplY3Q6IGZ1bmN0aW9uICgpe1xuICAgICAgICAgIHZhciBoc3ZhID0gdGhpcy50b0hTVkFBcnJheSgpO1xuXG4gICAgICAgICAgcmV0dXJuIHtoOiBoc3ZhWzBdLCBzOiBoc3ZhWzFdLCBsOiBoc3ZhWzJdLCBhOiBoc3ZhWzNdfTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvSFNWQVN0cmluZ1xuICAgICAgICAgUmV0dXJuIHRoZSBIU1ZBIHN0cmluZyBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJ29saXZlJykudG9IU1ZBU3RyaW5nKCk7XG4gICAgICAgICA+IFwiaHN2YSg2MCwxMDAlLDUwLjE5NjA3ODQzMTM3MjU1JSwxKVwiXG4gICAgICAqL1xuICAgICAgdG9IU1ZBU3RyaW5nOiBmdW5jdGlvbiAoKVxuICAgICAge1xuICAgICAgICAgIHZhciBoc3ZhID0gdGhpcy50b0hTVkFBcnJheSgpO1xuICAgICAgICAgIHZhciB2YWxzID0gW1xuICAgICAgICAgICAgICBoc3ZhWzBdLFxuICAgICAgICAgICAgICBNYXRoLnJvdW5kKGhzdmFbMV0qMTAwKSsnJScsXG4gICAgICAgICAgICAgIE1hdGgucm91bmQoaHN2YVsyXSoxMDApKyclJyxcbiAgICAgICAgICAgICAgaHN2YVszXVxuICAgICAgICAgIF07XG5cbiAgICAgICAgICByZXR1cm4gJ2hzdmEoJysgdmFscyArJyknO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogaHNiXG4gICAgICAgICBBbGlhcyBmb3IgPGhzdj5cbiAgICAgICovXG4gICAgICBoc2I6IGZ1bmN0aW9uICgpeyByZXR1cm4gdGhpcy5oc3YoKTsgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG9IU0JBcnJheVxuICAgICAgICAgQWxpYXMgZm9yIDx0b0hTQkFycmF5PlxuICAgICAgKi9cbiAgICAgIHRvSFNCQXJyYXk6IGZ1bmN0aW9uICgpXG4gICAgICB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMudG9IU1ZBcnJheSgpO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG9IU0JPYmplY3RcbiAgICAgICAgIEFsaWFzIGZvciA8dG9IU1ZPYmplY3Q+XG4gICAgICAqL1xuICAgICAgdG9IU0JPYmplY3Q6IGZ1bmN0aW9uICgpXG4gICAgICB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMudG9IU1ZPYmplY3QoKTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvSFNCU3RyaW5nXG4gICAgICAgICBBbGlhcyBmb3IgPHRvSFNWU3RyaW5nPlxuICAgICAgKi9cbiAgICAgIHRvSFNCU3RyaW5nOiBmdW5jdGlvbiAoKVxuICAgICAge1xuICAgICAgICAgIHJldHVybiB0aGlzLnRvSFNWU3RyaW5nKCk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiBoc2JhXG4gICAgICAgICBBbGlhcyBmb3IgPGhzdmE+XG4gICAgICAqL1xuICAgICAgaHNiYTogZnVuY3Rpb24gKCl7IHJldHVybiB0aGlzLmhzdmEoKTsgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG9IU0JBQXJyYXlcbiAgICAgICAgIEFsaWFzIGZvciA8dG9IU1ZBQXJyYXk+XG4gICAgICAqL1xuICAgICAgdG9IU0JBQXJyYXk6IGZ1bmN0aW9uICgpe1xuICAgICAgICAgIHJldHVybiB0aGlzLnRvSFNWQUFycmF5KCk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b0hTQkFPYmplY3RcbiAgICAgICAgIEFsaWFzIGZvciA8dG9IU1ZBT2JqZWN0PlxuICAgICAgKi9cbiAgICAgIHRvSFNCQU9iamVjdDogZnVuY3Rpb24gKCl7XG4gICAgICAgICAgcmV0dXJuIHRoaXMudG9IU1ZBT2JqZWN0KCk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b0hTQkFTdHJpbmdcbiAgICAgICAgIEFsaWFzIGZvciA8dG9IU1ZBU3RyaW5nPlxuICAgICAgKi9cbiAgICAgIHRvSFNCQVN0cmluZzogZnVuY3Rpb24gKClcbiAgICAgIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy50b0hTVkFTdHJpbmcoKTtcbiAgICAgIH0sXG5cbiAgICAgIC8vR3JvdXA6IEluc3RhbmNlIG1ldGhvZHMgLSBjb2xvciBzY2hlbWVcbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IGNvbXBsZW1lbnRcbiAgICAgICAgIENhbGxzIDxDaHJvbWF0aC5jb21wbGVtZW50PiB3aXRoIHRoZSBjdXJyZW50IGluc3RhbmNlIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXJcblxuICAgICAgICAgPiA+IENocm9tYXRoLnJlZC5jb21wbGVtZW50KCkucmdiKCk7XG4gICAgICAgICA+IFswLCAyNTUsIDI1NV1cbiAgICAgICovXG4gICAgICBjb21wbGVtZW50OiBmdW5jdGlvbiAoKXtcbiAgICAgICAgICByZXR1cm4gQ2hyb21hdGguY29tcGxlbWVudCh0aGlzKTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRyaWFkXG4gICAgICAgICBDYWxscyA8Q2hyb21hdGgudHJpYWQ+IHdpdGggdGhlIGN1cnJlbnQgaW5zdGFuY2UgYXMgdGhlIGZpcnN0IHBhcmFtZXRlclxuXG4gICAgICAgICA+ID4gbmV3IENocm9tYXRoKCdoc2woMCwgMTAwJSwgNTAlKScpLnRyaWFkKCkudG9TdHJpbmcoKTtcbiAgICAgICAgID4gXCIjRkYwMDAwLCMwMEZGMDAsIzAwMDBGRlwiXG4gICAgICAqL1xuICAgICAgdHJpYWQ6IGZ1bmN0aW9uICgpe1xuICAgICAgICAgIHJldHVybiBDaHJvbWF0aC50cmlhZCh0aGlzKTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRldHJhZFxuICAgICAgICAgQ2FsbHMgPENocm9tYXRoLnRldHJhZD4gd2l0aCB0aGUgY3VycmVudCBpbnN0YW5jZSBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyXG5cbiAgICAgICAgID4gPiBDaHJvbWF0aC5oc2IoMjQwLCAxLCAxKS50cmlhZCgpO1xuICAgICAgICAgPiBbQ2hyb21hdGgsIENocm9tYXRoLCBDaHJvbWF0aF1cbiAgICAgICovXG4gICAgICB0ZXRyYWQ6IGZ1bmN0aW9uICgpe1xuICAgICAgICAgIHJldHVybiBDaHJvbWF0aC50ZXRyYWQodGhpcyk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiBhbmFsb2dvdXNcbiAgICAgICAgIENhbGxzIDxDaHJvbWF0aC5hbmFsb2dvdXM+IHdpdGggdGhlIGN1cnJlbnQgaW5zdGFuY2UgYXMgdGhlIGZpcnN0IHBhcmFtZXRlclxuXG4gICAgICAgICA+ID4gQ2hyb21hdGguaHNiKDEyMCwgMSwgMSkuYW5hbG9nb3VzKCk7XG4gICAgICAgICA+IFtDaHJvbWF0aCwgQ2hyb21hdGgsIENocm9tYXRoLCBDaHJvbWF0aCwgQ2hyb21hdGgsIENocm9tYXRoLCBDaHJvbWF0aCwgQ2hyb21hdGhdXG5cbiAgICAgICAgID4gPiBDaHJvbWF0aC5oc2IoMTgwLCAxLCAxKS5hbmFsb2dvdXMoNSkudG9TdHJpbmcoKTtcbiAgICAgICAgID4gXCIjMDBGRkZGLCMwMEZGQjIsIzAwRkZFNSwjMDBFNUZGLCMwMEIyRkZcIlxuXG4gICAgICAgICA+ID4gQ2hyb21hdGguaHNiKDE4MCwgMSwgMSkuYW5hbG9nb3VzKDUsIDEwKS50b1N0cmluZygpO1xuICAgICAgICAgPiBcIiMwMEZGRkYsIzAwRkYxOSwjMDBGRkIyLCMwMEIyRkYsIzAwMTlGRlwiXG4gICAgICAqL1xuICAgICAgYW5hbG9nb3VzOiBmdW5jdGlvbiAocmVzdWx0cywgc2xpY2VzKXtcbiAgICAgICAgICByZXR1cm4gQ2hyb21hdGguYW5hbG9nb3VzKHRoaXMsIHJlc3VsdHMsIHNsaWNlcyk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICBNZXRob2Q6IG1vbm9jaHJvbWF0aWNcbiAgICAgICAgIENhbGxzIDxDaHJvbWF0aC5tb25vY2hyb21hdGljPiB3aXRoIHRoZSBjdXJyZW50IGluc3RhbmNlIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXJcblxuICAgICAgICA+ID4gQ2hyb21hdGguYmx1ZS5tb25vY2hyb21hdGljKCkudG9TdHJpbmcoKTtcbiAgICAgICAgPiBcIiMwMDAwMzMsIzAwMDA2NiwjMDAwMDk5LCMwMDAwQ0MsIzAwMDBGRlwiXG4gICAgICAqL1xuICAgICAgbW9ub2Nocm9tYXRpYzogZnVuY3Rpb24gKHJlc3VsdHMpe1xuICAgICAgICAgIHJldHVybiBDaHJvbWF0aC5tb25vY2hyb21hdGljKHRoaXMsIHJlc3VsdHMpO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogc3BsaXRjb21wbGVtZW50XG4gICAgICAgICBDYWxscyA8Q2hyb21hdGguc3BsaXRjb21wbGVtZW50PiB3aXRoIHRoZSBjdXJyZW50IGluc3RhbmNlIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXJcblxuICAgICAgICAgPiA+IENocm9tYXRoLmJsdWUuc3BsaXRjb21wbGVtZW50KCkudG9TdHJpbmcoKTtcbiAgICAgICAgID4gXCIjMDAwMEZGLCNGRkNDMDAsI0ZGNTEwMFwiXG4gICAgICAqL1xuICAgICAgc3BsaXRjb21wbGVtZW50OiBmdW5jdGlvbiAoKXtcbiAgICAgICAgICByZXR1cm4gQ2hyb21hdGguc3BsaXRjb21wbGVtZW50KHRoaXMpO1xuICAgICAgfSxcblxuICAgICAgLy8gR3JvdXA6IEluc3RhbmNlIG1ldGhvZHMgLSBjb2xvciBhbHRlcmF0aW9uXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0aW50XG4gICAgICAgICBDYWxscyA8Q2hyb21hdGgudGludD4gd2l0aCB0aGUgY3VycmVudCBpbnN0YW5jZSBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyXG5cbiAgICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJ3llbGxvdycpLnRpbnQoMC4yNSkudG9TdHJpbmcoKTtcbiAgICAgICAgID4gXCIjRkZGRjNGXCJcbiAgICAgICovXG4gICAgICB0aW50OiBmdW5jdGlvbiAoYnkpIHtcbiAgICAgICAgICByZXR1cm4gQ2hyb21hdGgudGludCh0aGlzLCBieSk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiBsaWdodGVuXG4gICAgICAgICBBbGlhcyBmb3IgPHRpbnQ+XG4gICAgICAqL1xuICAgICAgbGlnaHRlbjogZnVuY3Rpb24gKGJ5KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRpbnQoYnkpO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgTWV0aG9kOiBzaGFkZVxuICAgICAgICAgQ2FsbHMgPENocm9tYXRoLnNoYWRlPiB3aXRoIHRoZSBjdXJyZW50IGluc3RhbmNlIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXJcblxuICAgICAgICA+ID4gbmV3IENocm9tYXRoKCd5ZWxsb3cnKS5zaGFkZSgwLjI1KS50b1N0cmluZygpO1xuICAgICAgICA+IFwiI0JGQkYwMFwiXG4gICAgICAqL1xuICAgICAgc2hhZGU6IGZ1bmN0aW9uIChieSkge1xuICAgICAgICAgIHJldHVybiBDaHJvbWF0aC5zaGFkZSh0aGlzLCBieSk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiBkYXJrZW5cbiAgICAgICAgIEFsaWFzIGZvciA8c2hhZGU+XG4gICAgICAqL1xuICAgICAgZGFya2VuOiBmdW5jdGlvbiAoYnkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hhZGUoYnkpO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogZGVzYXR1cmF0ZVxuICAgICAgICAgQ2FsbHMgPENocm9tYXRoLmRlc2F0dXJhdGU+IHdpdGggdGhlIGN1cnJlbnQgaW5zdGFuY2UgYXMgdGhlIGZpcnN0IHBhcmFtZXRlclxuXG4gICAgICAgPiA+IG5ldyBDaHJvbWF0aCgnb3JhbmdlJykuZGVzYXR1cmF0ZSgpLnRvU3RyaW5nKCk7XG4gICAgICAgPiBcIiNBREFEQURcIlxuXG4gICAgICAgPiA+IG5ldyBDaHJvbWF0aCgnb3JhbmdlJykuZGVzYXR1cmF0ZSgxKS50b1N0cmluZygpO1xuICAgICAgID4gXCIjNUI1QjVCXCJcblxuICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJ29yYW5nZScpLmRlc2F0dXJhdGUoMikudG9TdHJpbmcoKTtcbiAgICAgICA+IFwiI0I0QjRCNFwiXG4gICAgICAgKi9cbiAgICAgIGRlc2F0dXJhdGU6IGZ1bmN0aW9uIChmb3JtdWxhKXtcbiAgICAgICAgICByZXR1cm4gQ2hyb21hdGguZGVzYXR1cmF0ZSh0aGlzLCBmb3JtdWxhKTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgIE1ldGhvZDogZ3JleXNjYWxlXG4gICAgICAgIEFsaWFzIGZvciA8ZGVzYXR1cmF0ZT5cbiAgICAgICovXG4gICAgICBncmV5c2NhbGU6IGZ1bmN0aW9uIChmb3JtdWxhKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRlc2F0dXJhdGUoZm9ybXVsYSk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB3ZWJzYWZlXG4gICAgICAgICBDYWxscyA8Q2hyb21hdGgud2Vic2FmZT4gd2l0aCB0aGUgY3VycmVudCBpbnN0YW5jZSBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyXG5cbiAgICAgICAgID4gPiBDaHJvbWF0aC5yZ2IoMTIzLCAyMzQsIDU2KS50b1N0cmluZygpO1xuICAgICAgICAgPiBcIiM3QkVBMzhcIlxuXG4gICAgICAgICA+IENocm9tYXRoLnJnYigxMjMsIDIzNCwgNTYpLndlYnNhZmUoKS50b1N0cmluZygpO1xuICAgICAgICAgPiBcIiM2NkZGMzNcIlxuICAgICAgICovXG4gICAgICB3ZWJzYWZlOiBmdW5jdGlvbiAoKXtcbiAgICAgICAgICByZXR1cm4gQ2hyb21hdGgud2Vic2FmZSh0aGlzKTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIEdyb3VwOiBJbnN0YW5jZSBtZXRob2RzIC0gY29sb3IgY29tYmluYXRpb25cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IGFkZGl0aXZlXG4gICAgICAgICBDYWxscyA8Q2hyb21hdGguYWRkaXRpdmU+IHdpdGggdGhlIGN1cnJlbnQgaW5zdGFuY2UgYXMgdGhlIGZpcnN0IHBhcmFtZXRlclxuXG4gICAgICAgICA+ID4gbmV3IENocm9tYXRoKCdyZWQnKS5hZGRpdGl2ZSgnIzAwRkYwMCcsICdibHVlJykudG9TdHJpbmcoKTtcbiAgICAgICAgID4gXCIjRkZGRkZGXCJcbiAgICAgICovXG4gICAgICBhZGRpdGl2ZTogZnVuY3Rpb24gKCl7XG4gICAgICAgICAgdmFyIGFyciA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgICAgcmV0dXJuIENocm9tYXRoLmFkZGl0aXZlLmFwcGx5KENocm9tYXRoLCBbdGhpc10uY29uY2F0KGFycikpO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogc3VidHJhY3RpdmVcbiAgICAgICAgIENhbGxzIDxDaHJvbWF0aC5zdWJ0cmFjdGl2ZT4gd2l0aCB0aGUgY3VycmVudCBpbnN0YW5jZSBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyXG5cbiAgICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJ2N5YW4nKS5zdWJ0cmFjdGl2ZSgnbWFnZW50YScsICd5ZWxsb3cnKS50b1N0cmluZygpO1xuICAgICAgICAgPiBcIiMwMDAwMDBcIlxuICAgICAgKi9cbiAgICAgIHN1YnRyYWN0aXZlOiBmdW5jdGlvbiAoKXtcbiAgICAgICAgICB2YXIgYXJyID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgICAgICByZXR1cm4gQ2hyb21hdGguc3VidHJhY3RpdmUuYXBwbHkoQ2hyb21hdGgsIFt0aGlzXS5jb25jYXQoYXJyKSk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiBtdWx0aXBseVxuICAgICAgICAgQ2FsbHMgPENocm9tYXRoLm11bHRpcGx5PiB3aXRoIHRoZSBjdXJyZW50IGluc3RhbmNlIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXJcblxuICAgICAgICAgPiA+IENocm9tYXRoLmxpZ2h0Y3lhbi5tdWx0aXBseShDaHJvbWF0aC5icm93bikudG9TdHJpbmcoKTtcbiAgICAgICAgID4gXCIjOTAyQTJBXCJcbiAgICAgICovXG4gICAgICBtdWx0aXBseTogZnVuY3Rpb24gKCl7XG4gICAgICAgICAgdmFyIGFyciA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgICAgcmV0dXJuIENocm9tYXRoLm11bHRpcGx5LmFwcGx5KENocm9tYXRoLCBbdGhpc10uY29uY2F0KGFycikpO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogYXZlcmFnZVxuICAgICAgICAgQ2FsbHMgPENocm9tYXRoLmF2ZXJhZ2U+IHdpdGggdGhlIGN1cnJlbnQgaW5zdGFuY2UgYXMgdGhlIGZpcnN0IHBhcmFtZXRlclxuXG4gICAgICAgICA+ID4gQ2hyb21hdGguYmxhY2suYXZlcmFnZSgnd2hpdGUnKS5yZ2IoKTtcbiAgICAgICAgID4gWzEyNywgMTI3LCAxMjddXG4gICAgICAqL1xuICAgICAgYXZlcmFnZTogZnVuY3Rpb24gKCl7XG4gICAgICAgICAgdmFyIGFyciA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgICAgcmV0dXJuIENocm9tYXRoLmF2ZXJhZ2UuYXBwbHkoQ2hyb21hdGgsIFt0aGlzXS5jb25jYXQoYXJyKSk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiBvdmVybGF5XG4gICAgICAgICBDYWxscyA8Q2hyb21hdGgub3ZlcmxheT4gd2l0aCB0aGUgY3VycmVudCBpbnN0YW5jZSBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyXG5cbiAgICAgICA+ID4gQ2hyb21hdGgucmVkLm92ZXJsYXkoJ2dyZWVuJywgMC40KS50b1N0cmluZygpO1xuICAgICAgID4gXCIjOTkzMzAwXCJcblxuICAgICAgID4gPiBDaHJvbWF0aC5yZWQub3ZlcmxheSgnZ3JlZW4nLCAxKS50b1N0cmluZygpO1xuICAgICAgID4gXCIjMDA4MDAwXCJcblxuICAgICAgID4gPiBDaHJvbWF0aC5yZWQub3ZlcmxheSgnZ3JlZW4nLCAwKS50b1N0cmluZygpO1xuICAgICAgID4gXCIjRkYwMDAwXCJcbiAgICAgICAqL1xuICAgICAgb3ZlcmxheTogZnVuY3Rpb24gKGJvdHRvbSwgdHJhbnNwYXJlbmN5KXtcbiAgICAgICAgICByZXR1cm4gQ2hyb21hdGgub3ZlcmxheSh0aGlzLCBib3R0b20sIHRyYW5zcGFyZW5jeSk7XG4gICAgICB9LFxuXG4gICAgICAvLyBHcm91cDogSW5zdGFuY2UgbWV0aG9kcyAtIG90aGVyXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiBjbG9uZVxuICAgICAgICAgUmV0dXJuIGFuIGluZGVwZW5kZW50IGNvcHkgb2YgdGhlIGluc3RhbmNlXG4gICAgICAqL1xuICAgICAgY2xvbmU6IGZ1bmN0aW9uICgpe1xuICAgICAgICAgIHJldHVybiBuZXcgQ2hyb21hdGgodGhpcyk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b3dhcmRzXG4gICAgICAgICBDYWxscyA8Q2hyb21hdGgudG93YXJkcz4gd2l0aCB0aGUgY3VycmVudCBpbnN0YW5jZSBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyXG5cbiAgICAgICAgID4gPiB2YXIgcmVkID0gbmV3IENocm9tYXRoKCdyZWQnKTtcbiAgICAgICAgID4gPiByZWQudG93YXJkcygneWVsbG93JywgMC41NSkudG9TdHJpbmcoKTtcbiAgICAgICAgID4gXCIjRkY4QzAwXCJcbiAgICAgICovXG4gICAgICB0b3dhcmRzOiBmdW5jdGlvbiAodG8sIGJ5KSB7XG4gICAgICAgICAgcmV0dXJuIENocm9tYXRoLnRvd2FyZHModGhpcywgdG8sIGJ5KTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IGdyYWRpZW50XG4gICAgICAgICBDYWxscyA8Q2hyb21hdGguZ3JhZGllbnQ+IHdpdGggdGhlIGN1cnJlbnQgaW5zdGFuY2UgYXMgdGhlIGZpcnN0IHBhcmFtZXRlclxuXG4gICAgICAgICA+ID4gbmV3IENocm9tYXRoKCcjRjAwJykuZ3JhZGllbnQoJyMwMEYnKS50b1N0cmluZygpXG4gICAgICAgICA+IFwiI0ZGMDAwMCwjRjEwMDBELCNFNDAwMUEsI0Q2MDAyOCwjQzkwMDM1LCNCQjAwNDMsI0FFMDA1MCwjQTEwMDVELCM5MzAwNkIsIzg2MDA3OCwjNzgwMDg2LCM2QjAwOTMsIzVEMDBBMSwjNTAwMEFFLCM0MzAwQkIsIzM1MDBDOSwjMjgwMEQ2LCMxQTAwRTQsIzBEMDBGMSwjMDAwMEZGXCJcblxuICAgICAgICAgPiA+IG5ldyBDaHJvbWF0aCgnI0YwMCcpLmdyYWRpZW50KCcjMDBGJywgNSkudG9TdHJpbmcoKVxuICAgICAgICAgPiBcIiNGRjAwMDAsI0JGMDAzRiwjN0YwMDdGLCMzRjAwQkYsIzAwMDBGRlwiXG5cbiAgICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJyNGMDAnKS5ncmFkaWVudCgnIzAwRicsIDUsIDMpLnRvU3RyaW5nKClcbiAgICAgICAgID4gXCIjM0YwMEJGXCJcbiAgICAgICovXG4gICAgICBncmFkaWVudDogZnVuY3Rpb24gKHRvLCBzbGljZXMsIHNsaWNlKXtcbiAgICAgICAgICByZXR1cm4gQ2hyb21hdGguZ3JhZGllbnQodGhpcywgdG8sIHNsaWNlcywgc2xpY2UpO1xuICAgICAgfVxuICB9O1xufTtcbiIsInZhciB1dGlsID0ge307XG5cbnV0aWwuY2xhbXAgPSBmdW5jdGlvbiAoIHZhbCwgbWluLCBtYXggKSB7XG4gICAgaWYgKHZhbCA+IG1heCkgcmV0dXJuIG1heDtcbiAgICBpZiAodmFsIDwgbWluKSByZXR1cm4gbWluO1xuICAgIHJldHVybiB2YWw7XG59O1xuXG51dGlsLm1lcmdlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBkZXN0ID0gYXJndW1lbnRzWzBdLCBpPTEsIHNvdXJjZSwgcHJvcDtcbiAgICB3aGlsZSAoc291cmNlID0gYXJndW1lbnRzW2krK10pXG4gICAgICAgIGZvciAocHJvcCBpbiBzb3VyY2UpIGRlc3RbcHJvcF0gPSBzb3VyY2VbcHJvcF07XG5cbiAgICByZXR1cm4gZGVzdDtcbn07XG5cbnV0aWwuaXNBcnJheSA9IGZ1bmN0aW9uICggdGVzdCApIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHRlc3QpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxudXRpbC5pc1N0cmluZyA9IGZ1bmN0aW9uICggdGVzdCApIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHRlc3QpID09PSAnW29iamVjdCBTdHJpbmddJztcbn07XG5cbnV0aWwuaXNOdW1iZXIgPSBmdW5jdGlvbiAoIHRlc3QgKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0ZXN0KSA9PT0gJ1tvYmplY3QgTnVtYmVyXSc7XG59O1xuXG51dGlsLmlzT2JqZWN0ID0gZnVuY3Rpb24gKCB0ZXN0ICkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodGVzdCkgPT09ICdbb2JqZWN0IE9iamVjdF0nO1xufTtcblxudXRpbC5scGFkID0gZnVuY3Rpb24gKCB2YWwsIGxlbiwgcGFkICkge1xuICAgIHZhbCA9IHZhbC50b1N0cmluZygpO1xuICAgIGlmICghbGVuKSBsZW4gPSAyO1xuICAgIGlmICghcGFkKSBwYWQgPSAnMCc7XG5cbiAgICB3aGlsZSAodmFsLmxlbmd0aCA8IGxlbikgdmFsID0gcGFkK3ZhbDtcblxuICAgIHJldHVybiB2YWw7XG59O1xuXG51dGlsLmxlcnAgPSBmdW5jdGlvbiAoZnJvbSwgdG8sIGJ5KSB7XG4gICAgcmV0dXJuIGZyb20gKyAodG8tZnJvbSkgKiBieTtcbn07XG5cbnV0aWwudGltZXMgPSBmdW5jdGlvbiAobiwgZm4sIGNvbnRleHQpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgcmVzdWx0cyA9IFtdOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgIHJlc3VsdHNbaV0gPSBmbi5jYWxsKGNvbnRleHQsIGkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbn07XG5cbnV0aWwucmdiID0ge1xuICAgIGZyb21BcmdzOiBmdW5jdGlvbiAociwgZywgYiwgYSkge1xuICAgICAgICB2YXIgcmdiID0gYXJndW1lbnRzWzBdO1xuXG4gICAgICAgIGlmICh1dGlsLmlzQXJyYXkocmdiKSl7IHI9cmdiWzBdOyBnPXJnYlsxXTsgYj1yZ2JbMl07IGE9cmdiWzNdOyB9XG4gICAgICAgIGlmICh1dGlsLmlzT2JqZWN0KHJnYikpeyByPXJnYi5yOyBnPXJnYi5nOyBiPXJnYi5iOyBhPXJnYi5hOyAgfVxuXG4gICAgICAgIHJldHVybiBbciwgZywgYiwgYV07XG4gICAgfSxcbiAgICBzY2FsZWQwMTogZnVuY3Rpb24gKHIsIGcsIGIpIHtcbiAgICAgICAgaWYgKCFpc0Zpbml0ZShhcmd1bWVudHNbMV0pKXtcbiAgICAgICAgICAgIHZhciByZ2IgPSB1dGlsLnJnYi5mcm9tQXJncyhyLCBnLCBiKTtcbiAgICAgICAgICAgIHIgPSByZ2JbMF0sIGcgPSByZ2JbMV0sIGIgPSByZ2JbMl07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAociA+IDEpIHIgLz0gMjU1O1xuICAgICAgICBpZiAoZyA+IDEpIGcgLz0gMjU1O1xuICAgICAgICBpZiAoYiA+IDEpIGIgLz0gMjU1O1xuXG4gICAgICAgIHJldHVybiBbciwgZywgYl07XG4gICAgfSxcbiAgICBwY3RXaXRoU3ltYm9sOiBmdW5jdGlvbiAociwgZywgYikge1xuICAgICAgICB2YXIgcmdiID0gdGhpcy5zY2FsZWQwMShyLCBnLCBiKTtcblxuICAgICAgICByZXR1cm4gcmdiLm1hcChmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGgucm91bmQodiAqIDI1NSkgKyAnJSc7XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbnV0aWwuaHNsID0ge1xuICAgIGZyb21BcmdzOiBmdW5jdGlvbiAoaCwgcywgbCwgYSkge1xuICAgICAgICB2YXIgaHNsID0gYXJndW1lbnRzWzBdO1xuXG4gICAgICAgIGlmICh1dGlsLmlzQXJyYXkoaHNsKSl7IGg9aHNsWzBdOyBzPWhzbFsxXTsgbD1oc2xbMl07IGE9aHNsWzNdOyB9XG4gICAgICAgIGlmICh1dGlsLmlzT2JqZWN0KGhzbCkpeyBoPWhzbC5oOyBzPWhzbC5zOyBsPShoc2wubCB8fCBoc2wudik7IGE9aHNsLmE7IH1cblxuICAgICAgICByZXR1cm4gW2gsIHMsIGwsIGFdO1xuICAgIH0sXG4gICAgc2NhbGVkOiBmdW5jdGlvbiAoaCwgcywgbCkge1xuICAgICAgICBpZiAoIWlzRmluaXRlKGFyZ3VtZW50c1sxXSkpe1xuICAgICAgICAgICAgdmFyIGhzbCA9IHV0aWwuaHNsLmZyb21BcmdzKGgsIHMsIGwpO1xuICAgICAgICAgICAgaCA9IGhzbFswXSwgcyA9IGhzbFsxXSwgbCA9IGhzbFsyXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGggPSAoKChoICUgMzYwKSArIDM2MCkgJSAzNjApO1xuICAgICAgICBpZiAocyA+IDEpIHMgLz0gMTAwO1xuICAgICAgICBpZiAobCA+IDEpIGwgLz0gMTAwO1xuXG4gICAgICAgIHJldHVybiBbaCwgcywgbF07XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB1dGlsO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vL0NyYWZ0IG9iamVjdC5wcm90eXBlXHJcbihmdW5jdGlvbigpe1xyXG5cdGlmKCB0eXBlb2YoT2JqZWN0LmFkZENvbnN0UHJvcCkgPT0gXCJmdW5jdGlvblwiKXtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0XHJcblx0XHJcblx0ZnVuY3Rpb24gY29uc3RQcm9wKG5hbWVfcHJvcCwgdmFsdWUsIHZpcyl7XHJcblx0XHRpZih2aXMgPT09IHVuZGVmaW5lZCkgdmlzID0gdHJ1ZTtcclxuXHRcdGlmKHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIikgT2JqZWN0LmZyZWV6ZSh2YWx1ZSk7XHJcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgbmFtZV9wcm9wLCB7XHJcblx0XHRcdFx0dmFsdWU6IHZhbHVlLFxyXG5cdFx0XHRcdGVudW1lcmFibGU6IHZpc1xyXG5cdFx0XHR9KTtcclxuXHR9XHJcblx0ZnVuY3Rpb24gZ2V0U2V0KG5hbWUsIGdldHRlciwgc2V0dGVyKXtcclxuXHRcdGlmKHR5cGVvZiBzZXR0ZXIgPT0gXCJmdW5jdGlvblwiKXtcclxuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIG5hbWUsIHtcclxuXHRcdFx0XHRnZXQ6IGdldHRlcixcclxuXHRcdFx0XHRzZXQ6IHNldHRlcixcclxuXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxyXG5cdFx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG5cdFx0XHR9KTtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgbmFtZSwge1xyXG5cdFx0XHRcdGdldDogZ2V0dGVyLFxyXG5cdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXHJcblx0XHRcdFx0Y29uZmlndXJhYmxlOiB0cnVlXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRjb25zdFByb3AuY2FsbChPYmplY3QucHJvdG90eXBlLCAnYWRkQ29uc3RQcm9wJywgY29uc3RQcm9wLCBmYWxzZSk7XHJcblx0T2JqZWN0LnByb3RvdHlwZS5hZGRDb25zdFByb3AoJ2FkZEdldFNldCcsIGdldFNldCwgZmFsc2UpO1xyXG5cdFxyXG5cdFxyXG5cdGlmKHR5cGVvZihPYmplY3QucHJvdG90eXBlLnRvU291cmNlKSAhPT0gXCJmdW5jdGlvblwiKXtcclxuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShPYmplY3QucHJvdG90eXBlLCAndG9Tb3VyY2UnLHtcclxuXHRcdFx0dmFsdWU6IGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHR2YXIgc3RyID0gJ3snO1xyXG5cdFx0XHRcdFx0Zm9yKHZhciBrZXkgaW4gdGhpcyl7XHJcblx0XHRcdFx0XHRcdHN0ciArPSAnICcgKyBrZXkgKyAnOiAnICsgdGhpc1trZXldICsgJywnO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aWYoc3RyLmxlbmd0aCA+IDIpIHN0ciA9IHN0ci5zbGljZSgwLCAtMSkgKyAnICc7XHJcblx0XHRcdFx0XHRyZXR1cm4gc3RyICsgJ30nO1xyXG5cdFx0XHRcdH0sXHJcblx0XHRcdGVudW1lcmFibGU6IGZhbHNlXHJcblx0XHR9KTtcclxuXHR9XHJcblx0XHJcblx0XHJcblx0aWYodHlwZW9mKE9iamVjdC52YWx1ZXMpICE9PSBcImZ1bmN0aW9uXCIpe1xyXG5cdFx0dmFyIHZhbF9PYmogPSBmdW5jdGlvbihvYmope1xyXG5cdFx0XHR2YXIgdmFscyA9IFtdO1xyXG5cdFx0XHRcclxuXHRcdFx0Zm9yICh2YXIga2V5IGluIG9iaikge1xyXG5cdFx0XHRcdHZhbHMucHVzaChvYmpba2V5XSk7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdHJldHVybiB2YWxzO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0IE9iamVjdC5hZGRDb25zdFByb3AoJ3ZhbHVlcycsIHZhbF9PYmouYmluZChPYmplY3QpKTtcclxuXHR9XHJcblx0XHJcblx0ZnVuY3Rpb24gcmFuZEluZGV4KCl7XHJcblx0XHR2YXIgcmFuZCA9IE1hdGgucm91bmQoKHRoaXMubGVuZ3RoIC0gMSkgKiBNYXRoLnJhbmRvbSgpKTtcclxuXHRcdHJldHVybiB0aGlzW3JhbmRdO1xyXG5cdH1cclxuXHRBcnJheS5wcm90b3R5cGUuYWRkQ29uc3RQcm9wKCdyYW5kX2knLCByYW5kSW5kZXgpO1xyXG5cdFxyXG5cdFxyXG5cdGZ1bmN0aW9uIGNyZWF0ZUFycih2YWwsIGxlbmd0aCwgaXNfY2FsbCl7XHJcblx0XHR2YXIgYXJyID0gW107XHJcblx0XHRcclxuXHRcdGlmKCFsZW5ndGgpIGxlbmd0aCA9IDE7XHJcblx0XHRpZihpc19jYWxsID09PSB1bmRlZmluZWQpIGlzX2NhbGwgPSB0cnVlO1xyXG5cdFx0XHJcblx0XHRpZih0eXBlb2YgdmFsID09ICdmdW5jdGlvbicgJiYgaXNfY2FsbCl7XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKyl7XHJcblx0XHRcdFx0YXJyLnB1c2godmFsKGksIGFycikpO1xyXG5cdFx0XHR9XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKyl7XHJcblx0XHRcdFx0YXJyLnB1c2godmFsKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gYXJyO1xyXG5cdH1cclxuXHRcclxuXHRBcnJheS5wcm90b3R5cGUuYWRkQ29uc3RQcm9wKCdhZGQnLCBmdW5jdGlvbih2YWwpe1xyXG5cdFx0aWYoIXRoaXMuX251bGxzKSB0aGlzLl9udWxscyA9IFtdO1xyXG5cdFx0XHJcblx0XHRpZih0aGlzLl9udWxscy5sZW5ndGgpe1xyXG5cdFx0XHR2YXIgaW5kID0gdGhpcy5fbnVsbHMucG9wKCk7XHJcblx0XHRcdHRoaXNbaW5kXSA9IHZhbDtcclxuXHRcdFx0cmV0dXJuIGluZDtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5wdXNoKHZhbCkgLSAxO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG5cdFxyXG5cdEFycmF5LnByb3RvdHlwZS5hZGRDb25zdFByb3AoJ2RlbGwnLCBmdW5jdGlvbihpbmQpe1xyXG5cdFx0aWYoaW5kID4gdGhpcy5sZW5ndGggLTEpIHJldHVybiBmYWxzZTtcclxuXHRcdFxyXG5cdFx0aWYoaW5kID09IHRoaXMubGVuZ3RoIC0xKXtcclxuXHRcdFx0dGhpcy5wb3AoKTtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHRpZighdGhpcy5fbnVsbHMpIHRoaXMuX251bGxzID0gW107XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzW2luZF0gPSB1bmRlZmluZWQ7XHJcblx0XHRcdHRoaXMuX251bGxzLnB1c2goaW5kKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIHRydWU7XHRcclxuXHR9KTtcclxuXHRcclxuXHRBcnJheS5hZGRDb25zdFByb3AoJ2NyZWF0ZScsIGNyZWF0ZUFycik7XHJcblx0XHJcblx0XHJcblx0aWYoUmVnRXhwLnByb3RvdHlwZS50b0pTT04gIT09IFwiZnVuY3Rpb25cIil7XHJcblx0XHRSZWdFeHAucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7IHJldHVybiB0aGlzLnNvdXJjZTsgfTtcclxuXHR9XHJcblxyXG59KSgpO1xyXG5cclxuXHJcblxyXG5cclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5uZXcgKGZ1bmN0aW9uKCl7XHJcblx0aWYodHlwZW9mKE9iamVjdC5hZGRDb25zdFByb3ApICE9PSBcImZ1bmN0aW9uXCIpe1xyXG5cdFx0aWYodHlwZW9mIG1vZHVsZSA9PSBcIm9iamVjdFwiKXtcclxuXHRcdFx0cmVxdWlyZShcIi4vbW9mLmpzXCIpO1xyXG5cdFx0fWVsc2UgdGhyb3cgbmV3IEVycm9yKFwi0KLRgNC10LHRg9C10YLRjNGB0Y8g0LHQuNCx0LvQuNC+0YLQtdC60LAgbW9mLmpzXCIpO1xyXG5cdH1cclxuXHJcblx0aWYodHlwZW9mKE9iamVjdC50eXBlcykgPT0gXCJvYmplY3RcIil7XHJcblx0XHRyZXR1cm4gT2JqZWN0LnR5cGVzO1xyXG5cdH1cclxuXHJcblx0dmFyIFQgPSB0aGlzO1xyXG5cdHZhciBEb2MgPSB7XHJcblx0XHR0eXBlczp7XHJcblx0XHRcdCdib29sJzp7XHJcblx0XHRcdFx0bmFtZTogXCJCb29sZWFuXCIsXHJcblx0XHRcdFx0YXJnOiBbXVxyXG5cdFx0XHR9LFxyXG5cdFx0XHQnY29uc3QnOiB7XHJcblx0XHRcdFx0bmFtZTogXCJDb25zdGFudFwiLFxyXG5cdFx0XHRcdGFyZzogW1widmFsdWVcIl0sXHJcblx0XHRcdFx0cGFyYW1zOiB7IHZhbHVlOiB7dHlwZTogXCJTb21ldGhpbmdcIiwgZGVmYXVsdF92YWx1ZTogbnVsbH19XHJcblx0XHRcdH0sXHJcblx0XHRcdCdwb3MnOiB7XHJcblx0XHRcdFx0bmFtZTogXCJQb3NpdGlvblwiLFxyXG5cdFx0XHRcdGFyZzogWydtYXgnXSxcclxuXHRcdFx0XHRwYXJhbXM6IHttYXg6IHt0eXBlOiAncG9zJywgZGVmYXVsdF92YWx1ZTogKzIxNDc0ODM2NDd9fVxyXG5cclxuXHRcdFx0fSxcclxuXHJcblx0XHRcdCdpbnQnOiB7XHJcblx0XHRcdFx0bmFtZTogXCJJbnRlZ2VyXCIsXHJcblx0XHRcdFx0YXJnOiBbXCJtYXhcIiwgXCJtaW5cIiwgXCJzdGVwXCJdLFxyXG5cdFx0XHRcdHBhcmFtczoge1xyXG5cdFx0XHRcdFx0XHRtYXg6IHt0eXBlOiAnaW50JywgZGVmYXVsdF92YWx1ZTogKzIxNDc0ODM2NDd9LFxyXG5cdFx0XHRcdFx0XHRtaW46IHt0eXBlOiAnaW50JywgZGVmYXVsdF92YWx1ZTogLTIxNDc0ODM2NDh9LFxyXG5cdFx0XHRcdFx0XHRzdGVwOiB7dHlwZTogJ3BvcycsIGRlZmF1bHRfdmFsdWU6IDF9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdH0sXHJcblxyXG5cdFx0XHQnbnVtJzoge1xyXG5cdFx0XHRcdG5hbWU6IFwiTnVtYmVyXCIsXHJcblx0XHRcdFx0YXJnOiBbXCJtYXhcIiwgXCJtaW5cIiwgXCJwcmVjaXNcIl0sXHJcblx0XHRcdFx0cGFyYW1zOiB7XHJcblx0XHRcdFx0XHRcdG1heDoge3R5cGU6ICdudW0nLCBkZWZhdWx0X3ZhbHVlOiArMjE0NzQ4MzY0N30sXHJcblx0XHRcdFx0XHRcdG1pbjoge3R5cGU6ICdudW0nLCBkZWZhdWx0X3ZhbHVlOiAtMjE0NzQ4MzY0OH0sXHJcblx0XHRcdFx0XHRcdHByZWNpczoge3R5cGU6ICdwb3MnLCBkZWZhdWx0X3ZhbHVlOiA5fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHR9LFxyXG5cdFx0XHQnYXJyJzoge1xyXG5cdFx0XHRcdG5hbWU6IFwiQXJyYXlcIixcclxuXHRcdFx0XHRhcmc6IFtcInR5cGVzXCIsIFwic2l6ZVwiLCBcImZpeGVkXCJdLFxyXG5cdFx0XHRcdHBhcmFtczoge1xyXG5cdFx0XHRcdFx0XHR0eXBlczoge3R5cGU6IFwiVHlwZSB8fCBbVHlwZSwgVHlwZS4uLl1cIiwgZ2V0IGRlZmF1bHRfdmFsdWUoKXtyZXR1cm4gVC5wb3N9fSxcclxuXHRcdFx0XHRcdFx0c2l6ZToge3R5cGU6ICdwb3MnLCBkZWZhdWx0X3ZhbHVlOiA3fSxcclxuXHRcdFx0XHRcdFx0Zml4ZWQ6IHt0eXBlOiAnYm9vbCcsIGRlZmF1bHRfdmFsdWU6IHRydWV9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdH0sXHJcblx0XHRcdCdhbnknOiB7XHJcblx0XHRcdFx0bmFtZTogXCJNaXhUeXBlXCIsXHJcblx0XHRcdFx0YXJnOiBbXCJ0eXBlc1wiXSxcclxuXHRcdFx0XHRwYXJhbXM6IHtcclxuXHRcdFx0XHRcdFx0dHlwZXM6IHt0eXBlOiBcIlR5cGUsIFR5cGUuLi4gfHwgW1R5cGUsIFR5cGUuLi5dXCIsIGdldCBkZWZhdWx0X3ZhbHVlKCl7cmV0dXJuIFtULnBvcywgVC5zdHJdfX1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0fSxcclxuXHRcdFx0J29iaic6IHtcclxuXHRcdFx0XHRuYW1lOiBcIk9iamVjdFwiLFxyXG5cdFx0XHRcdGFyZzogW1widHlwZXNcIl0sXHJcblx0XHRcdFx0cGFyYW1zOiB7dHlwZXM6IHt0eXBlOiBcIk9iamVjdFwiLCBkZWZhdWx0X3ZhbHVlOiB7fX19XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblx0XHRnZXRDb25zdDogZnVuY3Rpb24obmFtZV90eXBlLCBuYW1lX2xpbWl0KXtcclxuXHRcdFx0cmV0dXJuIHRoaXMudHlwZXNbbmFtZV90eXBlXS5wYXJhbXNbbmFtZV9saW1pdF0uZGVmYXVsdF92YWx1ZTtcclxuXHRcdH1cclxuXHR9O1xyXG5cdHRoaXMuZG9jID0ge307XHJcblx0dGhpcy5kb2MuanNvbiA9IEpTT04uc3RyaW5naWZ5KERvYywgXCJcIiwgMik7XHJcblxyXG5cdERvYy5nZW5Eb2MgPSAoZnVuY3Rpb24obmFtZSwgcGFyYW1zKXtyZXR1cm4ge25hbWU6IHRoaXMudHlwZXNbbmFtZV0ubmFtZSwgcGFyYW1zOiBwYXJhbXN9fSkuYmluZChEb2MpO1xyXG5cdHRoaXMuZG9jLmdlbiA9IERvYy5nZW5Eb2M7XHJcblxyXG5cclxuXHJcblxyXG5cdC8vRXJyb3NcclxuXHRmdW5jdGlvbiBhcmdUeXBlRXJyb3Iod3JvbmdfYXJnLCBtZXNzKXtcclxuXHRcdGlmKG1lc3MgPT09IHVuZGVmaW5lZCkgbWVzcyA9ICcnO1xyXG5cdFx0dmFyIEVSID0gbmV3IFR5cGVFcnJvcignQXJndW1lbnQgdHlwZSBpcyB3cm9uZyEgQXJndW1lbnRzKCcgKyBmb3JBcmcod3JvbmdfYXJnKSArICcpOycgKyBtZXNzKTtcclxuXHRcdEVSLndyb25nX2FyZyA9IHdyb25nX2FyZztcclxuXHJcblx0XHRpZiAoRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UpIHtcclxuXHRcdFx0RXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UoRVIsIGFyZ1R5cGVFcnJvcik7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIEVSO1xyXG5cclxuXHRcdGZ1bmN0aW9uIGZvckFyZyhhcmdzKXtcclxuXHRcdFx0dmFyIHN0cl9hcmdzID0gJyc7XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKXtcclxuXHRcdFx0XHRzdHJfYXJncyArPSB0eXBlb2YoYXJnc1tpXSkgKyAnOiAnICsgYXJnc1tpXSArICc7ICc7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHN0cl9hcmdzO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRULmVycm9yID0gYXJnVHlwZUVycm9yO1xyXG5cclxuXHRmdW5jdGlvbiB0eXBlU3ludGF4RXJyb3Iod3Jvbmdfc3RyLCBtZXNzKXtcclxuXHRcdGlmKG1lc3MgPT09IHVuZGVmaW5lZCkgbWVzcyA9ICcnO1xyXG5cdFx0dmFyIEVSID0gbmV3IFN5bnRheEVycm9yKCdMaW5lOiAnICsgd3Jvbmdfc3RyICsgJzsgJyArIG1lc3MpO1xyXG5cdFx0RVIud3JvbmdfYXJnID0gd3Jvbmdfc3RyO1xyXG5cclxuXHRcdGlmIChFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSkge1xyXG5cdFx0XHRFcnJvci5jYXB0dXJlU3RhY2tUcmFjZShFUiwgdHlwZVN5bnRheEVycm9yKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gRVI7XHJcblx0fVxyXG5cclxuXHJcblxyXG5cdGZ1bmN0aW9uIENyZWF0ZUNyZWF0b3IoTmV3LCB0ZXN0LCByYW5kLCBkb2Mpe1xyXG5cdFx0dmFyIGNyZWF0b3I7XHJcblx0XHRpZih0eXBlb2YgTmV3ID09PSBcImZ1bmN0aW9uXCIpe1xyXG5cdFx0XHRjcmVhdG9yID0gZnVuY3Rpb24oKXtcclxuXHRcdFx0XHR2YXIgdG1wX29iaiA9IE5ldy5hcHBseSh7fSwgYXJndW1lbnRzKTtcclxuXHRcdFx0XHR2YXIgbmV3X2NyZWF0b3IgPSBuZXcgQ3JlYXRlQ3JlYXRvcihOZXcpO1xyXG5cdFx0XHRcdGZvcih2YXIga2V5IGluIHRtcF9vYmope1xyXG5cdFx0XHRcdFx0bmV3X2NyZWF0b3IuYWRkQ29uc3RQcm9wKGtleSwgdG1wX29ialtrZXldKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0cmV0dXJuIG5ld19jcmVhdG9yO1xyXG5cdFx0XHR9O1xyXG5cdFx0fWVsc2UgY3JlYXRvciA9IGZ1bmN0aW9uKCl7cmV0dXJuIGNyZWF0b3J9O1xyXG5cclxuXHRcdGNyZWF0b3IuYWRkQ29uc3RQcm9wKCdpc19jcmVhdG9yJywgdHJ1ZSk7XHJcblx0XHRpZih0eXBlb2YgdGVzdCA9PT0gXCJmdW5jdGlvblwiKSBjcmVhdG9yLmFkZENvbnN0UHJvcCgndGVzdCcsIHRlc3QpO1xyXG5cdFx0aWYodHlwZW9mIHJhbmQgPT09IFwiZnVuY3Rpb25cIikgY3JlYXRvci5hZGRDb25zdFByb3AoJ3JhbmQnLCByYW5kKTtcclxuXHRcdGlmKHR5cGVvZiBkb2MgPT09IFwiZnVuY3Rpb25cIikgY3JlYXRvci5hZGRDb25zdFByb3AoJ2RvYycsIGRvYyk7XHJcblxyXG5cdFx0cmV0dXJuIGNyZWF0b3I7XHJcblx0fVxyXG5cdHRoaXMubmV3VHlwZSA9IGZ1bmN0aW9uKGtleSwgZGVzYywgbmV3X3R5cGUpe1xyXG5cdFx0RG9jLnR5cGVzW2tleV0gPSBkZXNjO1xyXG5cdFx0VC5uYW1lc1tkZXNjLm5hbWVdID0ga2V5O1xyXG5cdFx0dGhpcy5kb2MuanNvbiA9IEpTT04uc3RyaW5naWZ5KERvYywgXCJcIiwgMik7XHJcblxyXG5cdFx0dGhpc1trZXldID0gbmV3IENyZWF0ZUNyZWF0b3IobmV3X3R5cGUuTmV3LCBuZXdfdHlwZS50ZXN0LCBuZXdfdHlwZS5yYW5kLCBuZXdfdHlwZS5kb2MpO1xyXG5cdH1cclxuXHR0aGlzLm5ld1R5cGUuZG9jID0gJyhuYW1lLCBjb25zdHJ1Y3RvciwgZnVuY1Rlc3QsIGZ1bmNSYW5kLCBmdW5jRG9jKSc7XHJcblxyXG5cclxuXHJcblx0Ly9DcmFmdCBCb29sZWFuXHJcblx0XHR0aGlzLmJvb2wgPSBuZXcgQ3JlYXRlQ3JlYXRvcihcclxuXHRcdFx0bnVsbCxcclxuXHRcdFx0ZnVuY3Rpb24odmFsdWUpe1xyXG5cdFx0XHRcdGlmKHR5cGVvZiB2YWx1ZSAhPT0gJ2Jvb2xlYW4nKXtcclxuXHRcdFx0XHRcdHJldHVybiB0aGlzLmRvYygpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSxcclxuXHRcdFx0ZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRyZXR1cm4gIShNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkpKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0RG9jLmdlbkRvYy5iaW5kKG51bGwsIFwiYm9vbFwiKVxyXG5cdFx0KTtcclxuXHJcblxyXG5cclxuXHQvL0NyYWZ0IENvbnN0XHJcblx0XHRmdW5jdGlvbiBkb2NDb25zdCh2YWwpe1xyXG5cclxuXHRcdFx0aWYodHlwZW9mKHZhbCkgPT09IFwib2JqZWN0XCIgJiYgdmFsICE9PSBudWxsKXtcclxuXHRcdFx0XHR2YWwgPSAnT2JqZWN0JztcclxuXHRcdFx0fVxyXG5cdFx0XHRpZih0eXBlb2YodmFsKSA9PT0gXCJmdW5jdGlvblwiKXtcclxuXHRcdFx0XHR2YWwgPSB2YWwudG9TdHJpbmcoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gRG9jLmdlbkRvYy5iaW5kKG51bGwsXCJjb25zdFwiLCB7dmFsdWU6IHZhbH0pO1xyXG5cdFx0fVxyXG5cdFx0ZnVuY3Rpb24gbmV3Q29uc3QodmFsKXtcclxuXHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRyYW5kOiBmdW5jdGlvbigpe3JldHVybiB2YWx9LFxyXG5cdFx0XHRcdHRlc3Q6IGZ1bmN0aW9uKHYpe1xyXG5cdFx0XHRcdFx0aWYodmFsICE9PSB2KSByZXR1cm4gdGhpcy5kb2MoKTtcclxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdGRvYzogZG9jQ29uc3QodmFsKVxyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cdFx0dmFyIGRlZl9jb25zdCA9IG5ld0NvbnN0KERvYy5nZXRDb25zdCgnY29uc3QnLCAndmFsdWUnKSk7XHJcblx0XHR0aGlzLmNvbnN0ID0gbmV3IENyZWF0ZUNyZWF0b3IobmV3Q29uc3QsIGRlZl9jb25zdC50ZXN0LCBkZWZfY29uc3QucmFuZCwgZGVmX2NvbnN0LmRvYyk7XHJcblxyXG5cdFx0ZnVuY3Rpb24gdENvbnN0KFR5cGUpe1xyXG5cdFx0XHRpZih0eXBlb2YgKFR5cGUpICE9PSBcImZ1bmN0aW9uXCIgfHwgIVR5cGUuaXNfY3JlYXRvcil7XHJcblx0XHRcdFx0aWYoQXJyYXkuaXNBcnJheShUeXBlKSl7XHJcblxyXG5cdFx0XHRcdFx0cmV0dXJuIFQuYXJyKFR5cGUpO1xyXG5cclxuXHRcdFx0XHR9ZWxzZSBpZih0eXBlb2YoVHlwZSkgPT0gXCJvYmplY3RcIiAmJiBUeXBlICE9PSBudWxsKXtcclxuXHJcblx0XHRcdFx0XHRyZXR1cm4gVC5vYmooVHlwZSk7XHJcblxyXG5cdFx0XHRcdH1lbHNlIHJldHVybiBULmNvbnN0KFR5cGUpO1xyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRyZXR1cm4gVHlwZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHJcblx0Ly9DcmFmdCBOdW1iZXJcclxuXHRcdHZhciByYW5kTnVtID0gZnVuY3Rpb24obWF4LCBtaW4sIHByZWNpcyl7XHJcblx0XHRcdHJldHVybiBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdHJldHVybiArKCgobWF4IC0gbWluKSpNYXRoLnJhbmRvbSgpICsgIG1pbikudG9GaXhlZChwcmVjaXMpKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHJcblx0XHR2YXIgdGVzdE51bSA9IGZ1bmN0aW9uKG1heCwgbWluLCBwcmVjaXMpe1xyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24obil7XHJcblx0XHRcdFx0aWYodHlwZW9mIG4gIT09ICdudW1iZXInIHx8ICFpc0Zpbml0ZShuKSl7XHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5kb2MoKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlmKChuID4gbWF4KVxyXG5cdFx0XHRcdFx0fHwobiA8IG1pbilcclxuXHRcdFx0XHRcdHx8IChuLnRvRml4ZWQocHJlY2lzKSAhPSBuICYmIG4gIT09IDApICl7XHJcblxyXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuZG9jKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0ICB9O1xyXG5cdFx0fTtcclxuXHJcblx0XHR2YXIgZG9jTnVtID0gZnVuY3Rpb24obWF4LCBtaW4sIHByZWNpcyl7XHJcblx0XHRcdHJldHVybiBEb2MuZ2VuRG9jLmJpbmQobnVsbCwgXCJudW1cIiwge1wibWF4XCI6IG1heCwgXCJtaW5cIjogbWluLCBcInByZWNpc1wiOiBwcmVjaXN9KTtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgbWF4X2RlZl9uID0gRG9jLmdldENvbnN0KCdudW0nLCAnbWF4Jyk7XHJcblx0XHR2YXIgbWluX2RlZl9uID0gRG9jLmdldENvbnN0KCdudW0nLCAnbWluJyk7XHJcblx0XHR2YXIgcHJlY2lzX2RlZiA9IERvYy5nZXRDb25zdCgnbnVtJywgJ3ByZWNpcycpO1xyXG5cclxuXHRcdHRoaXMubnVtID0gbmV3IENyZWF0ZUNyZWF0b3IoXHJcblx0XHRcdGZ1bmN0aW9uKG1heCwgbWluLCBwcmVjaXMpe1xyXG5cdFx0XHRcdGlmKG1heCA9PT0gbnVsbCkgbWF4ID0gbWF4X2RlZl9uO1xyXG5cdFx0XHRcdGlmKG1pbiA9PT0gdW5kZWZpbmVkfHxtaW4gPT09IG51bGwpIG1pbiA9IG1pbl9kZWZfbjtcclxuXHRcdFx0XHRpZihwcmVjaXMgPT09IHVuZGVmaW5lZCkgcHJlY2lzID0gcHJlY2lzX2RlZjtcclxuXHJcblx0XHRcdFx0aWYoKHR5cGVvZiBtaW4gIT09ICdudW1iZXInIHx8ICFpc0Zpbml0ZShtaW4pKVxyXG5cdFx0XHRcdFx0fHwodHlwZW9mIG1heCAhPT0gJ251bWJlcicgfHwgIWlzRmluaXRlKG1heCkpXHJcblx0XHRcdFx0XHR8fCh0eXBlb2YgcHJlY2lzICE9PSAnbnVtYmVyJyB8fCAhaXNGaW5pdGUocHJlY2lzKSlcclxuXHRcdFx0XHRcdHx8KHByZWNpcyA8IDApXHJcblx0XHRcdFx0XHR8fChwcmVjaXMgPiA5KVxyXG5cdFx0XHRcdFx0fHwocHJlY2lzICUgMSAhPT0gMCkpe1xyXG5cdFx0XHRcdFx0dGhyb3cgYXJnVHlwZUVycm9yKGFyZ3VtZW50cywgJ1dhaXQgYXJndW1lbnRzOiBtaW4obnVtYmVyKSwgbWF4KG51bWJlciksIHByZWNpcygwPD1udW1iZXI8OSknKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYobWluID4gbWF4KXtcclxuXHRcdFx0XHRcdHZhciB0ID0gbWluO1xyXG5cdFx0XHRcdFx0bWluID0gbWF4O1xyXG5cdFx0XHRcdFx0bWF4ID0gdDtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0XHR0ZXN0OiB0ZXN0TnVtKG1heCwgbWluLCBwcmVjaXMpLFxyXG5cdFx0XHRcdFx0cmFuZDogcmFuZE51bShtYXgsIG1pbiwgcHJlY2lzKSxcclxuXHRcdFx0XHRcdGRvYzogZG9jTnVtKG1heCwgbWluLCBwcmVjaXMpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LFxyXG5cdFx0XHR0ZXN0TnVtKG1heF9kZWZfbiwgbWluX2RlZl9uLCBwcmVjaXNfZGVmKSxcclxuXHRcdFx0cmFuZE51bShtYXhfZGVmX24sIG1pbl9kZWZfbiwgcHJlY2lzX2RlZiksXHJcblx0XHRcdGRvY051bShtYXhfZGVmX24sIG1pbl9kZWZfbiwgcHJlY2lzX2RlZilcclxuXHRcdCk7XHJcblxyXG5cdFx0dmFyIHJhbmRJbnQgPSBmdW5jdGlvbihtYXgsIG1pbiwgcHJlY2lzKXtcclxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0cmV0dXJuIE1hdGguZmxvb3IoICgobWF4IC0gKG1pbiArIDAuMSkpL3ByZWNpcykqTWF0aC5yYW5kb20oKSApICogcHJlY2lzICsgIG1pbjtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHJcblx0XHQgdmFyIHRlc3RJbnQgPSBmdW5jdGlvbihtYXgsIG1pbiwgcHJlY2lzKXtcclxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKG4pe1xyXG5cdFx0XHRcdGlmKHR5cGVvZiBuICE9PSAnbnVtYmVyJyB8fCAhaXNGaW5pdGUobikpe1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuZG9jKCk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpZigobiA+PSBtYXgpXHJcblx0XHRcdFx0XHR8fChuIDwgbWluKVxyXG5cdFx0XHRcdFx0fHwoKChuIC0gbWluKSAlIHByZWNpcykgIT09IDApICl7XHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5kb2MoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHQgIH07XHJcblx0XHR9O1xyXG5cclxuXHRcdHZhciBkb2NJbnQgPSBmdW5jdGlvbihtYXgsIG1pbiwgc3RlcCl7XHJcblxyXG5cdFx0XHRcdHJldHVybiBEb2MuZ2VuRG9jLmJpbmQobnVsbCwgXCJpbnRcIiwge1wibWF4XCI6IG1heCwgXCJtaW5cIjogbWluLCBcInN0ZXBcIjogc3RlcH0pO1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHR2YXIgbWF4X2RlZiA9IERvYy5nZXRDb25zdCgnaW50JywgJ21heCcpO1xyXG5cdFx0dmFyIG1pbl9kZWYgPSBEb2MuZ2V0Q29uc3QoJ2ludCcsICdtaW4nKTtcclxuXHRcdHZhciBzdGVwX2RlZiA9IERvYy5nZXRDb25zdCgnaW50JywgJ3N0ZXAnKTtcclxuXHJcblx0XHR0aGlzLmludCA9IG5ldyBDcmVhdGVDcmVhdG9yKFxyXG5cdFx0XHRmdW5jdGlvbihtYXgsIG1pbiwgc3RlcCl7XHJcblxyXG5cdFx0XHRcdGlmKG1heCA9PT0gbnVsbCkgbWF4ID0gbWF4X2RlZjtcclxuXHRcdFx0XHRpZihtaW4gPT09IHVuZGVmaW5lZHx8bWluID09PSBudWxsKSBtaW4gPSBtaW5fZGVmO1xyXG5cdFx0XHRcdGlmKHN0ZXAgPT09IHVuZGVmaW5lZCkgc3RlcCA9IHN0ZXBfZGVmO1xyXG5cclxuXHRcdFx0XHRpZigodHlwZW9mIG1pbiAhPT0gJ251bWJlcicgfHwgIWlzRmluaXRlKG1pbikpXHJcblx0XHRcdFx0XHR8fCh0eXBlb2YgbWF4ICE9PSAnbnVtYmVyJyB8fCAhaXNGaW5pdGUobWF4KSlcclxuXHRcdFx0XHRcdHx8KE1hdGgucm91bmQobWluKSAhPT0gbWluKVxyXG5cdFx0XHRcdFx0fHwoTWF0aC5yb3VuZChtYXgpICE9PSBtYXgpXHJcblx0XHRcdFx0XHR8fChzdGVwIDw9IDApXHJcblx0XHRcdFx0XHR8fChNYXRoLnJvdW5kKHN0ZXApICE9PSBzdGVwKSl7XHJcblx0XHRcdFx0XHR0aHJvdyBhcmdUeXBlRXJyb3IoYXJndW1lbnRzLCAnV2FpdCBhcmd1bWVudHM6IG1pbihpbnQpLCBtYXgoaW50KSwgc3RlcChpbnQ+MCknKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYobWluID4gbWF4KXtcclxuXHRcdFx0XHRcdHZhciB0ID0gbWluO1xyXG5cdFx0XHRcdFx0bWluID0gbWF4O1xyXG5cdFx0XHRcdFx0bWF4ID0gdDtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0XHR0ZXN0OiB0ZXN0SW50KG1heCwgbWluLCBzdGVwKSxcclxuXHRcdFx0XHRcdHJhbmQ6IHJhbmRJbnQobWF4LCBtaW4sIHN0ZXApLFxyXG5cdFx0XHRcdFx0ZG9jOiBkb2NJbnQobWF4LCBtaW4sIHN0ZXApXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LFxyXG5cdFx0XHR0ZXN0SW50KG1heF9kZWYsIG1pbl9kZWYsIHN0ZXBfZGVmKSxcclxuXHRcdFx0cmFuZEludChtYXhfZGVmLCBtaW5fZGVmLCBzdGVwX2RlZiksXHJcblx0XHRcdGRvY0ludChtYXhfZGVmLCBtaW5fZGVmLCBzdGVwX2RlZilcclxuXHRcdCk7XHJcblxyXG5cdFx0dmFyIGRvY1BvcyA9IGZ1bmN0aW9uKG1heCwgbWluLCBzdGVwKXtcclxuXHJcblx0XHRcdFx0cmV0dXJuIERvYy5nZW5Eb2MuYmluZChudWxsLCBcInBvc1wiLCB7XCJtYXhcIjogbWF4fSk7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBtYXhfZGVmX3AgPSBEb2MuZ2V0Q29uc3QoJ3BvcycsICdtYXgnKVxyXG5cdFx0dGhpcy5wb3MgPSBuZXcgQ3JlYXRlQ3JlYXRvcihcclxuXHRcdFx0ZnVuY3Rpb24obWF4KXtcclxuXHJcblx0XHRcdFx0aWYobWF4ID09PSBudWxsKSBtYXggPSBtYXhfZGVmX3A7XHJcblxyXG5cdFx0XHRcdGlmKCh0eXBlb2YgbWF4ICE9PSAnbnVtYmVyJyB8fCAhaXNGaW5pdGUobWF4KSlcclxuXHRcdFx0XHRcdHx8KG1heCA8IDApKXtcclxuXHRcdFx0XHRcdHRocm93IGFyZ1R5cGVFcnJvcihhcmd1bWVudHMsICdXYWl0IGFyZ3VtZW50czogbWluKHBvcyksIG1heChwb3MpLCBzdGVwKHBvcz4wKScpO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRcdHRlc3Q6IHRlc3RJbnQobWF4LCAwLCAxKSxcclxuXHRcdFx0XHRcdHJhbmQ6IHJhbmRJbnQobWF4LCAwLCAxKSxcclxuXHRcdFx0XHRcdGRvYzogZG9jUG9zKG1heClcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sXHJcblx0XHRcdHRlc3RJbnQobWF4X2RlZl9wLCAwLCAxKSxcclxuXHRcdFx0cmFuZEludChtYXhfZGVmX3AsIDAsIDEpLFxyXG5cdFx0XHRkb2NQb3MobWF4X2RlZl9wKVxyXG5cdFx0KTtcclxuXHJcblxyXG5cclxuXHJcblxyXG4gIC8vQ3JhZnQgQW55XHJcblx0XHRmdW5jdGlvbiByYW5kQW55KGFycil7XHJcblx0XHRcdHJldHVybiBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdHJldHVybiBhcnIucmFuZF9pKCkucmFuZCgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gdGVzdEFueShhcnIpe1xyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24odmFsKXtcclxuXHRcdFx0XHRpZihhcnIuZXZlcnkoZnVuY3Rpb24oaSl7cmV0dXJuIGkudGVzdCh2YWwpfSkpe1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuZG9jKCk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBkb2NBbnkoVHlwZXMpe1xyXG5cclxuXHRcdFx0dmFyIGNvbnQgPSBUeXBlcy5sZW5ndGg7XHJcblx0XHRcdHZhciB0eXBlX2RvY3MgPSBbXTtcclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGNvbnQ7IGkrKyl7XHJcblx0XHRcdFx0dHlwZV9kb2NzLnB1c2goVHlwZXNbaV0uZG9jKCkpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gRG9jLmdlbkRvYy5iaW5kKG51bGwsIFwiYW55XCIsIHt0eXBlczogdHlwZV9kb2NzfSk7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGRlZl90eXBlcyA9IERvYy5nZXRDb25zdCgnYXJyJywgJ3R5cGVzJyk7XHJcblx0XHRmdW5jdGlvbiBuZXdBbnkoYXJyKXtcclxuXHRcdFx0aWYoIUFycmF5LmlzQXJyYXkoYXJyKSB8fCBhcmd1bWVudHMubGVuZ3RoID4gMSkgYXJyID0gYXJndW1lbnRzO1xyXG5cclxuXHRcdFx0dmFyIGxlbiA9IGFyci5sZW5ndGg7XHJcblx0XHRcdHZhciBhcnJfdHlwZXMgPSBbXTtcclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKXtcclxuXHRcdFx0XHRhcnJfdHlwZXNbaV0gPSB0Q29uc3QoYXJyW2ldKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJue1xyXG5cdFx0XHRcdHRlc3Q6IHRlc3RBbnkoYXJyX3R5cGVzKSxcclxuXHRcdFx0XHRyYW5kOiByYW5kQW55KGFycl90eXBlcyksXHJcblx0XHRcdFx0ZG9jOiBkb2NBbnkoYXJyX3R5cGVzKVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5hbnkgPSBuZXcgQ3JlYXRlQ3JlYXRvcihcclxuXHRcdFx0bmV3QW55LFxyXG5cdFx0XHR0ZXN0QW55KGRlZl90eXBlcyksXHJcblx0XHRcdHJhbmRBbnkoZGVmX3R5cGVzKSxcclxuXHRcdFx0ZG9jQW55KGRlZl90eXBlcylcclxuXHRcdCk7XHJcblxyXG5cclxuXHJcblx0Ly9DcmFmdCBBcnJheVxyXG5cclxuXHJcblxyXG5cdFx0ZnVuY3Rpb24gcmFuZEFycmF5KFR5cGUsIHNpemUsIGlzX2ZpeGVkKXtcclxuXHRcdFx0dmFyIHJhbmRTaXplID0gZnVuY3Rpb24gKCl7cmV0dXJuIHNpemV9O1xyXG5cdFx0XHRpZighaXNfZml4ZWQpe1xyXG5cdFx0XHRcdHJhbmRTaXplID0gVC5wb3Moc2l6ZSkucmFuZDtcclxuXHRcdFx0fVxyXG5cclxuXHJcblx0XHRcdGlmKEFycmF5LmlzQXJyYXkoVHlwZSkpe1xyXG5cdFx0XHRcdHZhciBub3dfc2l6ZSA9IHJhbmRTaXplKCk7XHJcblxyXG5cdFx0XHRcdHJldHVybiBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0dmFyIGFyciA9IFtdO1xyXG5cclxuXHRcdFx0XHRcdGZvcih2YXIgaSA9IDAsIGogPSAwOyBpIDwgbm93X3NpemU7IGkrKyl7XHJcblxyXG5cdFx0XHRcdFx0XHRhcnIucHVzaChUeXBlW2pdLnJhbmQoKSk7XHJcblxyXG5cdFx0XHRcdFx0XHRqKys7XHJcblx0XHRcdFx0XHRcdGlmKGogPj0gVHlwZS5sZW5ndGgpe1xyXG5cdFx0XHRcdFx0XHRcdGogPSAwO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRyZXR1cm4gYXJyO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHJcblxyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKXtcclxuXHRcdFx0XHR2YXIgYXJyID0gW107XHJcblxyXG5cdFx0XHRcdHZhciBub3dfc2l6ZSA9IHJhbmRTaXplKCk7XHJcblx0XHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IG5vd19zaXplOyBpKyspe1xyXG5cdFx0XHRcdFx0YXJyLnB1c2goVHlwZS5yYW5kKGksIGFycikpO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0cmV0dXJuIGFycjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiB0ZXN0QXJyYXkoVHlwZSwgc2l6ZSwgaXNfZml4ZWQpe1xyXG5cclxuXHRcdFx0aWYoQXJyYXkuaXNBcnJheShUeXBlKSl7XHJcblx0XHRcdFx0cmV0dXJuIGZ1bmN0aW9uKGFycil7XHJcblxyXG5cdFx0XHRcdFx0aWYoIUFycmF5LmlzQXJyYXkoYXJyKSl7XHJcblx0XHRcdFx0XHRcdHZhciBlcnIgPSB0aGlzLmRvYygpO1xyXG5cdFx0XHRcdFx0XHRlcnIucGFyYW1zID0gXCJWYWx1ZSBpcyBub3QgYXJyYXkhXCI7XHJcblx0XHRcdFx0XHRcdHJldHVybiBlcnI7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0aWYoKGFyci5sZW5ndGggPiBzaXplKSB8fCAoaXNfZml4ZWQgJiYgKGFyci5sZW5ndGggIT09IHNpemUpKSl7XHJcblx0XHRcdFx0XHRcdHZhciBlcnIgPSB0aGlzLmRvYygpO1xyXG5cdFx0XHRcdFx0XHRlcnIucGFyYW1zID0gXCJBcnJheSBsZW5naHQgaXMgd3JvbmchXCI7XHJcblx0XHRcdFx0XHRcdHJldHVybiBlcnI7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0Zm9yKHZhciBpID0gMCwgaiA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspe1xyXG5cclxuXHRcdFx0XHRcdFx0XHR2YXIgcmVzID0gVHlwZVtqXS50ZXN0KGFycltpXSk7XHJcblx0XHRcdFx0XHRcdFx0aWYocmVzKXtcclxuXHRcdFx0XHRcdFx0XHRcdFx0dmFyIGVyciA9IHRoaXMuZG9jKCk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGVyci5wYXJhbXMgPSB7aW5kZXg6IGksIHdyb25nX2l0ZW06IHJlc307XHJcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBlcnI7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHRqKys7XHJcblx0XHRcdFx0XHRcdFx0aWYoaiA+PSBUeXBlLmxlbmd0aCl7XHJcblx0XHRcdFx0XHRcdFx0XHRqID0gMDtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKGFycil7XHJcblx0XHRcdFx0aWYoIUFycmF5LmlzQXJyYXkoYXJyKSl7XHJcblx0XHRcdFx0XHR2YXIgZXJyID0gdGhpcy5kb2MoKTtcclxuXHRcdFx0XHRcdGVyci5wYXJhbXMgPSBcIlZhbHVlIGlzIG5vdCBhcnJheSFcIjtcclxuXHRcdFx0XHRcdHJldHVybiBlcnI7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpZigoYXJyLmxlbmd0aCA+IHNpemUpIHx8IChpc19maXhlZCAmJiAoYXJyLmxlbmd0aCAhPT0gc2l6ZSkpKXtcclxuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGFyci5sZW5ndGgsIHNpemUpXHJcblx0XHRcdFx0XHR2YXIgZXJyID0gdGhpcy5kb2MoKTtcclxuXHRcdFx0XHRcdGVyci5wYXJhbXMgPSBcIkFycmF5OiBsZW5naHQgaXMgd3JvbmchXCI7XHJcblx0XHRcdFx0XHRyZXR1cm4gZXJyO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0dmFyIGVycl9hcnIgPSBhcnIuZmlsdGVyKFR5cGUudGVzdCk7XHJcblx0XHRcdFx0aWYoZXJyX2Fyci5sZW5ndGggIT0gMCl7XHJcblx0XHRcdFx0XHR2YXIgZXJyID0gdGhpcy5kb2MoKTtcclxuXHRcdFx0XHRcdGVyci5wYXJhbXMgPSBlcnJfYXJyO1xyXG5cdFx0XHRcdFx0cmV0dXJuIGVycjtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGRvY0FycmF5KFR5cGUsIHNpemUsIGlzX2ZpeGVkKXtcclxuXHRcdFx0dmFyIHR5cGVfZG9jcyA9IFtdO1xyXG5cdFx0XHRpZihBcnJheS5pc0FycmF5KFR5cGUpKXtcclxuXHRcdFx0XHR2YXIgY29udCA9IFR5cGUubGVuZ3RoO1xyXG5cdFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBjb250OyBpKyspe1xyXG5cdFx0XHRcdFx0dHlwZV9kb2NzLnB1c2goVHlwZVtpXS5kb2MoKSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHR0eXBlX2RvY3MgPSBUeXBlLmRvYygpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gRG9jLmdlbkRvYy5iaW5kKG51bGwsIFwiYXJyXCIsIHt0eXBlczogdHlwZV9kb2NzLCBzaXplOiBzaXplLCBmaXhlZDogaXNfZml4ZWR9KTtcclxuXHJcblx0XHR9XHJcblxyXG5cclxuXHRcdHZhciBkZWZfVHlwZSA9IERvYy5nZXRDb25zdCgnYXJyJywgJ3R5cGVzJyk7XHJcblx0XHR2YXIgZGVmX1NpemUgPSBEb2MuZ2V0Q29uc3QoJ2FycicsICdzaXplJyk7XHJcblx0XHR2YXIgZGVmX2ZpeGVkID0gRG9jLmdldENvbnN0KCdhcnInLCAnZml4ZWQnKTtcclxuXHJcblx0XHRmdW5jdGlvbiBuZXdBcnJheShUeXBlLCBzaXplLCBpc19maXhlZCl7XHJcblx0XHRcdGlmKFR5cGUgPT09IG51bGwpIFR5cGUgPSBkZWZfVHlwZTtcclxuXHRcdFx0aWYoaXNfZml4ZWQgPT09IHVuZGVmaW5lZCkgaXNfZml4ZWQgPSBkZWZfZml4ZWQ7XHJcblxyXG5cdFx0XHRpZihBcnJheS5pc0FycmF5KFR5cGUpKXtcclxuXHRcdFx0XHRpZihzaXplID09PSB1bmRlZmluZWR8fHNpemUgPT09IG51bGwpIHNpemUgPSBUeXBlLmxlbmd0aDtcclxuXHJcblx0XHRcdFx0VHlwZSA9IFR5cGUubWFwKGZ1bmN0aW9uKGl0ZW0pe3JldHVybiB0Q29uc3QoaXRlbSk7fSk7XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdGlmKHNpemUgPT09IHVuZGVmaW5lZHx8c2l6ZSA9PT0gbnVsbCkgc2l6ZSA9IDE7XHJcblx0XHRcdFx0VHlwZSA9IHRDb25zdChUeXBlKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYoVC5wb3MudGVzdChzaXplKSl7XHJcblx0XHRcdFx0XHR0aHJvdyBhcmdUeXBlRXJyb3IoYXJndW1lbnRzLCAnV2FpdCBhcmd1bWVudHM6ICcgKyBKU09OLnN0cmluZ2lmeShULnBvcy50ZXN0KHNpemUpKSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0dGVzdDogdGVzdEFycmF5KFR5cGUsIHNpemUsIGlzX2ZpeGVkKSxcclxuXHRcdFx0XHRyYW5kOiByYW5kQXJyYXkoVHlwZSwgc2l6ZSwgaXNfZml4ZWQpLFxyXG5cdFx0XHRcdGRvYzogZG9jQXJyYXkoVHlwZSwgc2l6ZSwgaXNfZml4ZWQpXHJcblx0XHRcdH07XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5hcnIgPSBuZXcgQ3JlYXRlQ3JlYXRvcihcclxuXHRcdFx0bmV3QXJyYXksXHJcblx0XHRcdHRlc3RBcnJheShkZWZfVHlwZSwgZGVmX1NpemUsIGRlZl9maXhlZCksXHJcblx0XHRcdHJhbmRBcnJheShkZWZfVHlwZSwgZGVmX1NpemUsIGRlZl9maXhlZCksXHJcblx0XHRcdGRvY0FycmF5KGRlZl9UeXBlLCBkZWZfU2l6ZSwgZGVmX2ZpeGVkKVxyXG5cdFx0KTtcclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcblx0Ly9DcmFmdCBPYmplY3RcclxuXHJcblx0XHRmdW5jdGlvbiByYW5kT2JqKGZ1bmNPYmope1xyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKXtcclxuXHRcdFx0XHR2YXIgb2JqID0ge307XHJcblx0XHRcdFx0Zm9yKHZhciBrZXkgaW4gZnVuY09iail7XHJcblx0XHRcdFx0XHRvYmpba2V5XSA9IGZ1bmNPYmpba2V5XS5yYW5kKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHJldHVybiBvYmo7XHJcblx0XHRcdH07XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gdGVzdE9iaihmdW5jT2JqKXtcclxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKG9iail7XHJcblxyXG5cdFx0XHRcdGlmKHR5cGVvZiBvYmogIT09IFwib2JqZWN0XCIgJiYgb2JqID09PSBudWxsKXtcclxuXHRcdFx0XHRcdHZhciBlcnIgPSB0aGlzLmRvYygpO1xyXG5cdFx0XHRcdFx0ZXJyLnBhcmFtcyA9IFwiVmFsdWUgaXMgbm90IG9iamVjdCFcIjtcclxuXHRcdFx0XHRcdHJldHVybiBlcnI7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRmb3IodmFyIGtleSBpbiBmdW5jT2JqKXtcclxuXHRcdFx0XHRcdHZhciByZXMgPSBmdW5jT2JqW2tleV0udGVzdChvYmpba2V5XSk7XHJcblx0XHRcdFx0XHRpZihyZXMpe1xyXG5cdFx0XHRcdFx0XHR2YXIgZXJyID0gdGhpcy5kb2MoKTtcclxuXHRcdFx0XHRcdFx0ZXJyLnBhcmFtcyA9IHt9O1xyXG5cdFx0XHRcdFx0XHRlcnIucGFyYW1zW2tleV0gPSByZXM7XHJcblx0XHRcdFx0XHRcdHJldHVybiBlcnI7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH07XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gZG9jT2IoZnVuY09iail7XHJcblx0XHRcdHZhciBkb2Nfb2JqID0ge307XHJcblxyXG5cdFx0XHRmb3IodmFyIGtleSBpbiBmdW5jT2JqKXtcclxuXHRcdFx0XHRcdGRvY19vYmpba2V5XSA9IGZ1bmNPYmpba2V5XS5kb2MoKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIERvYy5nZW5Eb2MuYmluZChudWxsLCBcIm9ialwiLCB7dHlwZXM6IGRvY19vYmp9KTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBOZXdPYmoodGVtcE9iail7XHJcblx0XHRcdGlmKHR5cGVvZiB0ZW1wT2JqICE9PSAnb2JqZWN0JykgdGhyb3cgYXJnVHlwZUVycm9yKGFyZ3VtZW50cywgJ1dhaXQgYXJndW1lbnRzOiB0ZW1wT2JqKE9iamVjdCknKTtcclxuXHJcblx0XHRcdHZhciBiZWdPYmogPSB7fTtcclxuXHRcdFx0dmFyIGZ1bmNPYmogPSB7fTtcclxuXHRcdFx0Zm9yKHZhciBrZXkgaW4gdGVtcE9iail7XHJcblx0XHRcdFx0ZnVuY09ialtrZXldID0gdENvbnN0KHRlbXBPYmpba2V5XSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybntcclxuXHRcdFx0XHR0ZXN0OiB0ZXN0T2JqKGZ1bmNPYmopLFxyXG5cdFx0XHRcdHJhbmQ6IHJhbmRPYmooZnVuY09iaiksXHJcblx0XHRcdFx0ZG9jOiBkb2NPYihmdW5jT2JqKVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHR0aGlzLm9iaiA9IG5ldyBDcmVhdGVDcmVhdG9yKE5ld09iaixcclxuXHRcdFx0ZnVuY3Rpb24ob2JqKXtyZXR1cm4gdHlwZW9mIG9iaiA9PT0gXCJvYmplY3RcIn0sXHJcblx0XHRcdHJhbmRPYmooe30pLFxyXG5cdFx0XHREb2MuZ2VuRG9jLmJpbmQobnVsbCwgXCJvYmpcIilcclxuXHRcdCk7XHJcblxyXG5cclxuXHJcblxyXG5cclxuLy9DcmFmdCBUeXBlIG91dCB0byAgRG9jdW1lbnRcclxuXHJcblx0VC5uYW1lcyA9IHt9O1xyXG5cdGZvcih2YXIga2V5IGluIERvYy50eXBlcyl7XHJcblx0XHRULm5hbWVzW0RvYy50eXBlc1trZXldLm5hbWVdID0ga2V5O1xyXG5cdH1cclxuXHJcblx0dGhpcy5vdXREb2MgPSBmdW5jdGlvbih0bXApe1xyXG5cdFx0aWYoKHR5cGVvZiB0bXAgPT09IFwiZnVuY3Rpb25cIikgJiYgdG1wLmlzX2NyZWF0b3IpIHJldHVybiB0bXA7XHJcblxyXG5cdFx0aWYoISgnbmFtZScgaW4gdG1wKSl7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcigpO1xyXG5cdFx0fVxyXG5cdFx0dmFyIHR5cGUgPSB0bXAubmFtZTtcclxuXHJcblx0XHRpZigncGFyYW1zJyBpbiB0bXApe1xyXG5cdFx0XHR2YXIgcGFyYW1zID0gdG1wLnBhcmFtcztcclxuXHRcdFx0c3dpdGNoKFQubmFtZXNbdHlwZV0pe1xyXG5cdFx0XHRcdGNhc2UgJ29iaic6IHtcclxuXHRcdFx0XHRcdHZhciBuZXdfb2JqID0ge307XHJcblx0XHRcdFx0XHRmb3IodmFyIGtleSBpbiBwYXJhbXMudHlwZXMpe1xyXG5cdFx0XHRcdFx0XHRuZXdfb2JqW2tleV0gPSBULm91dERvYyhwYXJhbXMudHlwZXNba2V5XSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRwYXJhbXMudHlwZXMgPSBuZXdfb2JqO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGNhc2UgJ2FueSc6XHJcblx0XHRcdFx0Y2FzZSAnYXJyJzoge1xyXG5cdFx0XHRcdFx0aWYoQXJyYXkuaXNBcnJheShwYXJhbXMudHlwZXMpKXtcclxuXHRcdFx0XHRcdFx0cGFyYW1zLnR5cGVzID0gcGFyYW1zLnR5cGVzLm1hcChULm91dERvYy5iaW5kKFQpKTtcclxuXHRcdFx0XHRcdH1lbHNlIHBhcmFtcy50eXBlcyA9IFQub3V0RG9jKHBhcmFtcy50eXBlcyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBnZXRTaW1wbGVUeXBlKFQubmFtZXNbdHlwZV0sIHBhcmFtcyk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gZ2V0U2ltcGxlVHlwZShULm5hbWVzW3R5cGVdLCB7fSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBnZXRTaW1wbGVUeXBlKG5hbWUsIHBhcmFtcyl7XHJcblx0XHR2YXIgYXJnID0gW107XHJcblx0XHREb2MudHlwZXNbbmFtZV0uYXJnLmZvckVhY2goZnVuY3Rpb24oa2V5LCBpKXthcmdbaV0gPSBwYXJhbXNba2V5XTt9KTtcclxuXHRcdHJldHVybiBUW25hbWVdLmFwcGx5KFQsIGFyZyk7XHJcblx0fTtcclxuXHJcbi8vU3VwcG9ydCBEZWNsYXJhdGUgRnVuY3Rpb25cclxuXHJcblx0ZnVuY3Rpb24gZmluZGVQYXJzZShzdHIsIGJlZywgZW5kKXtcclxuXHRcdHZhciBwb2ludF9iZWcgPSBzdHIuaW5kZXhPZihiZWcpO1xyXG5cdFx0aWYofnBvaW50X2JlZyl7XHJcblxyXG5cdFx0XHR2YXIgcG9pbnRfZW5kID0gcG9pbnRfYmVnO1xyXG5cdFx0XHR2YXIgcG9pbnRfdGVtcCA9IHBvaW50X2JlZztcclxuXHRcdFx0dmFyIGxldmVsID0gMTtcclxuXHRcdFx0dmFyIGJyZWFrV2hpbGUgPSBmYWxzZTtcclxuXHRcdFx0d2hpbGUoIWJyZWFrV2hpbGUpe1xyXG5cdFx0XHRcdGJyZWFrV2hpbGUgPSB0cnVlO1xyXG5cclxuXHRcdFx0XHRpZih+cG9pbnRfdGVtcCkgcG9pbnRfdGVtcCA9IHN0ci5pbmRleE9mKGJlZywgcG9pbnRfdGVtcCArIDEpO1xyXG5cdFx0XHRcdGlmKH5wb2ludF9lbmQpIHBvaW50X2VuZCA9IHN0ci5pbmRleE9mKGVuZCwgcG9pbnRfZW5kICsgMSk7XHJcblxyXG5cdFx0XHRcdGlmKHBvaW50X3RlbXAgPCBwb2ludF9lbmQpe1xyXG5cclxuXHRcdFx0XHRcdGlmKHBvaW50X3RlbXAgPiAwKXtcclxuXHRcdFx0XHRcdFx0YnJlYWtXaGlsZSA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0XHRpZihzdHJbcG9pbnRfdGVtcCAtIDFdICE9PSAnXFxcXCcpIGxldmVsID0gbGV2ZWwrMTtcclxuXHJcblx0XHRcdFx0XHR9XHJcblxyXG5cclxuXHRcdFx0XHRcdGlmKHBvaW50X2VuZCA+IDApe1xyXG5cdFx0XHRcdFx0XHRicmVha1doaWxlID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdGlmKHN0cltwb2ludF9lbmQgLSAxXSAhPT0gJ1xcXFwnKSBsZXZlbCA9IGxldmVsLTE7XHJcblx0XHRcdFx0XHRcdGlmKGxldmVsID09IDApe1xyXG5cdFx0XHRcdFx0XHRcdHJldHVybiBbcG9pbnRfYmVnLCBwb2ludF9lbmRdO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRpZihwb2ludF9lbmQgPiAwKXtcclxuXHRcdFx0XHRcdFx0YnJlYWtXaGlsZSA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0XHRpZihzdHJbcG9pbnRfZW5kIC0gMV0gIT09ICdcXFxcJykgbGV2ZWwgPSBsZXZlbC0xO1xyXG5cdFx0XHRcdFx0XHRpZihsZXZlbCA9PSAwKXtcclxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gW3BvaW50X2JlZywgcG9pbnRfZW5kXTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdGlmKHBvaW50X3RlbXAgPiAwKXtcclxuXHRcdFx0XHRcdFx0YnJlYWtXaGlsZSA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0XHRpZihzdHJbcG9pbnRfdGVtcCAtIDFdICE9PSAnXFxcXCcpIGxldmVsID0gbGV2ZWwrMTtcclxuXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cclxuXHRPYmplY3QudHlwZXMgPSBUO1xyXG59KSgpO1xyXG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gXCJ0aWxlc1wiOiBbXG4gIHtcbiAgIFwidHlwZVwiOiBcImNvbG9yXCIsXG4gICBcImNvbG9yXCI6IHtcbiAgICBcInJcIjogMTM4LFxuICAgIFwiZ1wiOiA0MixcbiAgICBcImJcIjogNDIsXG4gICAgXCJhXCI6IDFcbiAgIH0sXG4gICBcImlkXCI6IDBcbiAgfSxcbiAge1xuICAgXCJ0eXBlXCI6IFwic3ZnXCIsXG4gICBcImltZ1wiOiBcImRhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsUEQ5NGJXd2dkbVZ5YzJsdmJqMGlNUzR3SWlCbGJtTnZaR2x1WnowaVZWUkdMVGdpSUhOMFlXNWtZV3h2Ym1VOUltNXZJajgrQ2p3aExTMGdRM0psWVhSbFpDQjNhWFJvSUVsdWEzTmpZWEJsSUNob2RIUndPaTh2ZDNkM0xtbHVhM05qWVhCbExtOXlaeThwSUMwdFBnb0tQSE4yWndvZ0lDQjRiV3h1Y3pwa1l6MGlhSFIwY0RvdkwzQjFjbXd1YjNKbkwyUmpMMlZzWlcxbGJuUnpMekV1TVM4aUNpQWdJSGh0Ykc1ek9tTmpQU0pvZEhSd09pOHZZM0psWVhScGRtVmpiMjF0YjI1ekxtOXlaeTl1Y3lNaUNpQWdJSGh0Ykc1ek9uSmtaajBpYUhSMGNEb3ZMM2QzZHk1M015NXZjbWN2TVRrNU9TOHdNaTh5TWkxeVpHWXRjM2x1ZEdGNExXNXpJeUlLSUNBZ2VHMXNibk02YzNablBTSm9kSFJ3T2k4dmQzZDNMbmN6TG05eVp5OHlNREF3TDNOMlp5SUtJQ0FnZUcxc2JuTTlJbWgwZEhBNkx5OTNkM2N1ZHpNdWIzSm5Mekl3TURBdmMzWm5JZ29nSUNCNGJXeHVjenB6YjJScGNHOWthVDBpYUhSMGNEb3ZMM052Wkdsd2IyUnBMbk52ZFhKalpXWnZjbWRsTG01bGRDOUVWRVF2YzI5a2FYQnZaR2t0TUM1a2RHUWlDaUFnSUhodGJHNXpPbWx1YTNOallYQmxQU0pvZEhSd09pOHZkM2QzTG1sdWEzTmpZWEJsTG05eVp5OXVZVzFsYzNCaFkyVnpMMmx1YTNOallYQmxJZ29nSUNCM2FXUjBhRDBpTVRBeU5HMXRJZ29nSUNCb1pXbG5hSFE5SWpVeE1tMXRJZ29nSUNCMmFXVjNRbTk0UFNJd0lEQWdNVEF5TkNBMU1USWlDaUFnSUhabGNuTnBiMjQ5SWpFdU1TSUtJQ0FnYVdROUluTjJaemd5TWpZaUNpQWdJR2x1YTNOallYQmxPblpsY25OcGIyNDlJakF1T1RJdU1pQW9OV016WlRnd1pDd2dNakF4Tnkwd09DMHdOaWtpQ2lBZ0lITnZaR2x3YjJScE9tUnZZMjVoYldVOUltUnlZWGRwYm1jdWMzWm5JajRLSUNBOFpHVm1jd29nSUNBZ0lHbGtQU0prWldaek9ESXlNQ0lnTHo0S0lDQThjMjlrYVhCdlpHazZibUZ0WldSMmFXVjNDaUFnSUNBZ2FXUTlJbUpoYzJVaUNpQWdJQ0FnY0dGblpXTnZiRzl5UFNJalptWm1abVptSWdvZ0lDQWdJR0p2Y21SbGNtTnZiRzl5UFNJak5qWTJOalkySWdvZ0lDQWdJR0p2Y21SbGNtOXdZV05wZEhrOUlqRXVNQ0lLSUNBZ0lDQnBibXR6WTJGd1pUcHdZV2RsYjNCaFkybDBlVDBpTUM0d0lnb2dJQ0FnSUdsdWEzTmpZWEJsT25CaFoyVnphR0ZrYjNjOUlqSWlDaUFnSUNBZ2FXNXJjMk5oY0dVNmVtOXZiVDBpTUM0d09EZ3pPRGd6TkRnaUNpQWdJQ0FnYVc1cmMyTmhjR1U2WTNnOUlpMDBNamd1TVRVMk1USWlDaUFnSUNBZ2FXNXJjMk5oY0dVNlkzazlJakl4TVM0NE5EazBNeUlLSUNBZ0lDQnBibXR6WTJGd1pUcGtiMk4xYldWdWRDMTFibWwwY3owaWJXMGlDaUFnSUNBZ2FXNXJjMk5oY0dVNlkzVnljbVZ1ZEMxc1lYbGxjajBpYkdGNVpYSXhJZ29nSUNBZ0lITm9iM2RuY21sa1BTSm1ZV3h6WlNJS0lDQWdJQ0JwYm10elkyRndaVHAzYVc1a2IzY3RkMmxrZEdnOUlqRXpOallpQ2lBZ0lDQWdhVzVyYzJOaGNHVTZkMmx1Wkc5M0xXaGxhV2RvZEQwaU56QTFJZ29nSUNBZ0lHbHVhM05qWVhCbE9uZHBibVJ2ZHkxNFBTSXRPQ0lLSUNBZ0lDQnBibXR6WTJGd1pUcDNhVzVrYjNjdGVUMGlMVGdpQ2lBZ0lDQWdhVzVyYzJOaGNHVTZkMmx1Wkc5M0xXMWhlR2x0YVhwbFpEMGlNU0lnTHo0S0lDQThiV1YwWVdSaGRHRUtJQ0FnSUNCcFpEMGliV1YwWVdSaGRHRTRNakl6SWo0S0lDQWdJRHh5WkdZNlVrUkdQZ29nSUNBZ0lDQThZMk02VjI5eWF3b2dJQ0FnSUNBZ0lDQnlaR1k2WVdKdmRYUTlJaUkrQ2lBZ0lDQWdJQ0FnUEdSak9tWnZjbTFoZEQ1cGJXRm5aUzl6ZG1jcmVHMXNQQzlrWXpwbWIzSnRZWFErQ2lBZ0lDQWdJQ0FnUEdSak9uUjVjR1VLSUNBZ0lDQWdJQ0FnSUNCeVpHWTZjbVZ6YjNWeVkyVTlJbWgwZEhBNkx5OXdkWEpzTG05eVp5OWtZeTlrWTIxcGRIbHdaUzlUZEdsc2JFbHRZV2RsSWlBdlBnb2dJQ0FnSUNBZ0lEeGtZenAwYVhSc1pTQXZQZ29nSUNBZ0lDQThMMk5qT2xkdmNtcytDaUFnSUNBOEwzSmtaanBTUkVZK0NpQWdQQzl0WlhSaFpHRjBZVDRLSUNBOFp3b2dJQ0FnSUdsdWEzTmpZWEJsT214aFltVnNQU0pNWVhsbGNpQXhJZ29nSUNBZ0lHbHVhM05qWVhCbE9tZHliM1Z3Ylc5a1pUMGliR0Y1WlhJaUNpQWdJQ0FnYVdROUlteGhlV1Z5TVNJS0lDQWdJQ0IwY21GdWMyWnZjbTA5SW5SeVlXNXpiR0YwWlNnd0xESXhOU2tpUGdvZ0lDQWdQR2NLSUNBZ0lDQWdJR2xrUFNKbk9UUTRNU0lLSUNBZ0lDQWdJSFJ5WVc1elptOXliVDBpYldGMGNtbDRLREV1TURRek9EazJNeXd3TERBc01TNHdPRGN5TXprMExDMHhPQzR3TURNeU9ETXNNeTQ0TmpReE5qQTFLU0krQ2lBZ0lDQWdJRHhuQ2lBZ0lDQWdJQ0FnSUdsa1BTSk1ZWGxsY2pFd05qUWlDaUFnSUNBZ0lDQWdJSFJ5WVc1elptOXliVDBpYldGMGNtbDRLREF1TkRVeU5qRXpOeklzTUN3d0xEQXVORFV6T1RJNE5Dd3lPRFkzTGpNd05UY3NNemcyTlM0eE1ESTVLU0krQ2lBZ0lDQWdJQ0FnUEhCaGRHZ0tJQ0FnSUNBZ0lDQWdJQ0JwYm10elkyRndaVHBqYjI1dVpXTjBiM0l0WTNWeWRtRjBkWEpsUFNJd0lnb2dJQ0FnSUNBZ0lDQWdJR2xrUFNKd1lYUm9OelU1T0NJS0lDQWdJQ0FnSUNBZ0lDQnpkSGxzWlQwaVptbHNiRG9qTlRJMU1qVXlPMlpwYkd3dGNuVnNaVHBsZG1WdWIyUmtJZ29nSUNBZ0lDQWdJQ0FnSUdROUltMGdMVFV4T1RndU9UZ3pOQ3d0T0RrNU1DNHpNVFk1SUhZZ01URXpNeTQ0TlRneklHZ2dMVEV4TXpNdU9EVTRNaUIySUMweE1UTXpMamcxT0RNZ2VpSWdMejRLSUNBZ0lDQWdJQ0E4Y0dGMGFBb2dJQ0FnSUNBZ0lDQWdJR2x1YTNOallYQmxPbU52Ym01bFkzUnZjaTFqZFhKMllYUjFjbVU5SWpBaUNpQWdJQ0FnSUNBZ0lDQWdhV1E5SW5CaGRHZzNOakF3SWdvZ0lDQWdJQ0FnSUNBZ0lITjBlV3hsUFNKbWFXeHNPaU5rTW1ReFpESTdabWxzYkMxeWRXeGxPbVYyWlc1dlpHUWlDaUFnSUNBZ0lDQWdJQ0FnWkQwaWJTQXROVE01Tmk0MU56VTVMQzAzT0RVMkxqUTFPRFlnZGlBdE1URXpNeTQ0TlRneklHZ2dNVGszTGpVNU1qVWdkaUF4TVRNekxqZzFPRE1nZWlJZ0x6NEtJQ0FnSUNBZ0lDQThjR0YwYUFvZ0lDQWdJQ0FnSUNBZ0lHbHVhM05qWVhCbE9tTnZibTVsWTNSdmNpMWpkWEoyWVhSMWNtVTlJakFpQ2lBZ0lDQWdJQ0FnSUNBZ2FXUTlJbkJoZEdnM05qQXlJZ29nSUNBZ0lDQWdJQ0FnSUhOMGVXeGxQU0ptYVd4c09pTTFNalV5TlRJN1ptbHNiQzF5ZFd4bE9tVjJaVzV2WkdRaUNpQWdJQ0FnSUNBZ0lDQWdaRDBpYlNBdE5UUTBOeTQyTVRBMkxDMDROVGswTGpNM09EWWdhQ0F5TkRndU5qSTNNaUIySURNNU5pNDROVEE1SUdnZ0xUSTBPQzQyTWpjeUlIb2lJQzgrQ2lBZ0lDQWdJRHd2Wno0S0lDQWdJQ0FnUEdjS0lDQWdJQ0FnSUNBZ2FXUTlJa3hoZVdWeU1UQTJOU0lLSUNBZ0lDQWdJQ0FnZEhKaGJuTm1iM0p0UFNKdFlYUnlhWGdvTUM0ME5EazFNakk1TWl3d0xEQXNNQzQwTlRNNU1qZzBMREk0TlRFdU16TTRNaXd6T0RZMUxqRXdNamtwSWo0S0lDQWdJQ0FnSUNBOGNHRjBhQW9nSUNBZ0lDQWdJQ0FnSUdsdWEzTmpZWEJsT21OdmJtNWxZM1J2Y2kxamRYSjJZWFIxY21VOUlqQWlDaUFnSUNBZ0lDQWdJQ0FnYVdROUluQmhkR2czTmpBMUlnb2dJQ0FnSUNBZ0lDQWdJSE4wZVd4bFBTSm1hV3hzT2lNMU1qVXlOVEk3Wm1sc2JDMXlkV3hsT21WMlpXNXZaR1FpQ2lBZ0lDQWdJQ0FnSUNBZ1pEMGliU0F0TlRFNU9TNHlNRGt6TEMwNE9Ua3dMak14TmprZ2RpQXhNVE16TGpnMU9ETWdhQ0F4TVRNekxqZzFPRE1nZGlBdE1URXpNeTQ0TlRneklIb2lJQzgrQ2lBZ0lDQWdJQ0FnUEhCaGRHZ0tJQ0FnSUNBZ0lDQWdJQ0JwYm10elkyRndaVHBqYjI1dVpXTjBiM0l0WTNWeWRtRjBkWEpsUFNJd0lnb2dJQ0FnSUNBZ0lDQWdJR2xrUFNKd1lYUm9Oell3TnlJS0lDQWdJQ0FnSUNBZ0lDQnpkSGxzWlQwaVptbHNiRG9qWkRKa01XUXlPMlpwYkd3dGNuVnNaVHBsZG1WdWIyUmtJZ29nSUNBZ0lDQWdJQ0FnSUdROUltMGdMVFV3TURFdU5qRTJOeXd0TnpnMU5pNDBOVGcySUhZZ0xURXhNek11T0RVNE15Qm9JQzB4T1RjdU5Ua3lOaUIySURFeE16TXVPRFU0TXlCNklpQXZQZ29nSUNBZ0lDQWdJRHh3WVhSb0NpQWdJQ0FnSUNBZ0lDQWdhVzVyYzJOaGNHVTZZMjl1Ym1WamRHOXlMV04xY25aaGRIVnlaVDBpTUNJS0lDQWdJQ0FnSUNBZ0lDQnBaRDBpY0dGMGFEYzJNRGtpQ2lBZ0lDQWdJQ0FnSUNBZ2MzUjViR1U5SW1acGJHdzZJelV5TlRJMU1qdG1hV3hzTFhKMWJHVTZaWFpsYm05a1pDSUtJQ0FnSUNBZ0lDQWdJQ0JrUFNKdElDMDBPVFV3TGpVNE1qRXNMVGcxT1RRdU16YzROaUJvSUMweU5EZ3VOakkzTWlCMklETTVOaTQ0TlRBNUlHZ2dNalE0TGpZeU56SWdlaUlnTHo0S0lDQWdJQ0FnUEM5blBnb2dJQ0FnUEM5blBnb2dJRHd2Wno0S1BDOXpkbWMrQ2c9PVwiLFxuICAgXCJpZFwiOiAxLFxuICAgXCJ3aWR0aFwiOiAyXG4gIH0sXG4gIHtcbiAgIFwidHlwZVwiOiBcInBoaXNpY1wiLFxuICAgXCJkdXJhYmlsaXR5XCI6IFwid29vZFwiLFxuICAgXCJpbWdcIjogXCJkYXRhOmltYWdlL2pwZWc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUVBU0FCSUFBRC8yd0JEQUFFQkFRRUJBUUVCQVFFQkFRRUNBZ01DQWdJQ0FnUURBd0lEQlFRRkJRVUVCQVFGQmdjR0JRVUhCZ1FFQmdrR0J3Z0lDQWdJQlFZSkNna0lDZ2NJQ0FqLzJ3QkRBUUVCQVFJQ0FnUUNBZ1FJQlFRRkNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWovd0FBUkNBUC9CQUlEQVNJQUFoRUJBeEVCLzhRQUhBQUJBUUVCQVFFQkFRRUFBQUFBQUFBQUFBZ0pCZ2NGQXdRSy84UUFRaEFCQUFBQ0F3c0tCUUlGQkFNQkFBQUFBQU1HRnhoV0FRSUVCUWRtbGFYUzArTUlFVFkzVlhXRWxMTzBFaE1VUnNNVnBCWXhRV0Z4SVNNeU15VkVZbEgveEFBZEFRRUFBZ01CQVFFQkFBQUFBQUFBQUFBQUNBa0dCd29GQkFJRC84UUFTeEVBQVFJQkJRZ05DZ1FGQlFFQkFBQUFBQUVDQXdRRkJoaFVCd2dSTmxXU285RVNGaGNoVTNPRGtaT3lzOUxUQ1JNWk1UVkZjblN4d3pkQmhMUlJVbkdCbEJRVklqS2hZVFAvMmdBTUF3RUFBaEVERVFBL0FQOEFLZUQ5c0h3ZkNNTXdpQmdtQ1FJMkZZVkZ2NzJIQ2hRNzI3Zlg4Uy91M2VhNWUzdDdjLzF1M2J0MjdjdVhMbHg4cm5JaVlWM2tQcmh3M09jaldwaFZUOFIyRkhrLzJHbkRSa2ZaS1BKL3NOT0dqSSt5OGpiSE4vRHN6bTZ6SmRvODlXT0wwYjlSeDQ3Q2p5ZjdEVGhveVBzbEhrLzJHbkRSa2ZaTnNjMzhPek9ickcwZWVySEY2TitvNDhkaFI1UDlocHcwWkgyU2p5ZjdEVGhveVBzbTJPYitIWm5OMWphUFBWamk5Ry9VY2VPd284bit3MDRhTWo3SlI1UDlocHcwWkgyVGJITi9Ec3ptNnh0SG5xeHhlamZxT1BIWVVlVC9BR0duRFJrZlpLUEovc05PR2pJK3liWTV2NGRtYzNXTm84OVdPTDBiOVJ4NDdDanlmN0RUaG95UHNsSGsvd0JocHcwWkgyVGJITi9Ec3ptNnh0SG5xeHhlamZxT1BIWVVlVC9ZYWNOR1I5a284bit3MDRhTWo3SnRqbS9oMlp6ZFkyanoxWTR2UnYxSEhqc0tQSi9zTk9HakkreVVlVC9ZYWNOR1I5azJ4emZ3N001dXNiUjU2c2NYbzM2amp4MkZIay8yR25EUmtmWktQSi9zTk9HakkreWJZNXY0ZG1jM1dObzg5V09MMGI5Ung0N0NqeWY3RFRob3lQc2xIay8yR25EUmtmWk5zYzM4T3pPYnJHMGVlckhGNk4rbzQ4ZGhSNVA5aHB3MFpIMlNqeWY3RFRob3lQc20yT2IrSFpuTjFqYVBQVmppOUcvVWNlT3dvOG4rdzA0YU1qN0pSNVA5aHB3MFpIMlRiSE4vRHN6bTZ4dEhucXh4ZWpmcU9QSFlVZVQvQUdHbkRSa2ZaS1BKL3NOT0dqSSt5Ylk1djRkbWMzV05vODlXT0wwYjlSeDQ3Q2p5ZjdEVGhveVBzbEhrL3dCaHB3MFpIMlRiSE4vRHN6bTZ4dEhucXh4ZWpmcU9QSDdZUmcrRVlIaEVmQk1MZ1JzRndxRmYzME9MQ2lYdDI5djRkL2N1ODEyOXZyMjcvcmN1M0x0eTdjdTNMcjhYcnRjamsyVGQ5Rk1haVEzTmNyWEpnVkFBL1IrQU93bzhuK3cwNGFNajdKUjVQOWhwdzBaSDJYamJZNXY0ZG1jM1daUnRIbnF4eGVqZnFPUEhZVWVUL1lhY05HUjlrbzhuK3cwNGFNajdKdGptL2gyWnpkWTJqejFZNHZSdjFISGpzS1BKL3NOT0dqSSt5VWVUL1lhY05HUjlrMnh6Znc3TTV1c2JSNTZzY1hvMzZqangyRkhrL3dCaHB3MFpIMlNqeWY3RFRob3lQc20yT2IrSFpuTjFqYVBQVmppOUcvVWNlT3dvOG4rdzA0YU1qN0pSNVA4QVlhY05HUjlrMnh6Znc3TTV1c2JSNTZzY1hvMzZqangyRkhrLzJHbkRSa2ZaS1BKL3NOT0dqSSt5Ylk1djRkbWMzV05vODlXT0wwYjlSeDQ3Q2p5ZjdEVGhveVBzbEhrLzJHbkRSa2ZaTnNjMzhPek9ickcwZWVySEY2TitvNDhkaFI1UDlocHcwWkgyU2p5ZjdEVGhveVBzbTJPYitIWm5OMWphUFBWamk5Ry9VY2VPd284bit3MDRhTWo3SlI1UDlocHcwWkgyVGJITi9Ec3ptNnh0SG5xeHhlamZxT1BIWVVlVC9ZYWNOR1I5a284bit3MDRhTWo3SnRqbS9oMlp6ZFkyanoxWTR2UnYxSEhqc0tQSi9zTk9HakkreVVlVC9ZYWNOR1I5azJ4emZ3N001dXNiUjU2c2NYbzM2amp4MkZIay93QmhwdzBaSDJTanlmN0RUaG95UHNtMk9iK0habk4xamFQUFZqaTlHL1VjZU93bzhuK3cwNGFNajdKUjVQOEFZYWNOR1I5azJ4emZ3N001dXNiUjU2c2NYbzM2amp4MkZIay8yR25EUmtmWktQSi9zTk9HakkreWJZNXY0ZG1jM1dObzg5V09MMGI5Ung0K3hqYVhzZjRoK24vWE1SNDR4TDgzNHZsZlY0TmZ3Zm04M056L0FBL0ZjdWMvTjhWem41djVjOXg4ZDZjbmxNT014SWtKeU9hdjVvdUZPZER3WmJJWThtaXJCbERGWTlQV2prVkZURHY3Nkx2K3JmQUQreDhvSFNZQkpzMzQxd1NGaCtLNVZtVEdXQVJPZjVjZkI4Qml4SWQvelhidHk3elgxN2UzYmwzbXUzTHR6L055Ni9zbzhuK3cwNGFNajdMeVlrL1NGamxZK014RlRlVkZjbUZGNXpJNEZEcDNpc1NMQ2tzUnpYSmhSVVk1VVZGOVNvdURmUlRqeDJGSGsvMkduRFJrZlpLUEovc05PR2pJK3kvRzJPYitIWm5OMW45ZG84OVdPTDBiOVJ4NDdDanlmN0RUaG95UHNsSGsvd0JocHcwWkgyVGJITi9Ec3ptNnh0SG5xeHhlamZxT1BIWVVlVC9ZYWNOR1I5a284bit3MDRhTWo3SnRqbS9oMlp6ZFkyanoxWTR2UnYxSEhqc0tQSi9zTk9HakkreVVlVC9ZYWNOR1I5azJ4emZ3N001dXNiUjU2c2NYbzM2amp4MkZIay8yR25EUmtmWktQSi9zTk9HakkreWJZNXY0ZG1jM1dObzg5V09MMGI5Ung0N0NqeWY3RFRob3lQc2xIay8yR25EUmtmWk5zYzM4T3pPYnJHMGVlckhGNk4rbzQ4ZGhSNVA5aHB3MFpIMlNqeWY3RFRob3lQc20yT2IrSFpuTjFqYVBQVmppOUcvVWNlT3dvOG4rdzA0YU1qN0pSNVA5aHB3MFpIMlRiSE4vRHN6bTZ4dEhucXh4ZWpmcU9QSFlVZVQvQUdHbkRSa2ZaS1BKL3NOT0dqSSt5Ylk1djRkbWMzV05vODlXT0wwYjlSeDQ3Q2p5ZjdEVGhveVBzbEhrL3dCaHB3MFpIMlRiSE4vRHN6bTZ4dEhucXh4ZWpmcU9QSFlVZVQvWWFjTkdSOWtvOG4rdzA0YU1qN0p0am0vaDJaemRZMmp6MVk0dlJ2MUhIanNLUEovc05PR2pJK3lVZVQvWWFjTkdSOWsyeHpmdzdNNXVzYlI1NnNjWG8zNmpqeDJGSGsvMkduRFJrZlpLUEovc05PR2pJK3liWTV2NGRtYzNXTm84OVdPTDBiOVJ4NDZURDVObS9GV0NSY1B4cEtzeVl0d0NIemZNajRSZ01XSER2T2U3Y3VYT2UrdnIyNWN1YzkyN2N1ZjV1M0hOdlFra3RneDI3T0E5SEo2c0tLaXBoL3NlTk9NMVNxUnZTRks0Ym9ibFREZ2NpdFhCL0hBcUp2YnlnQjlKOEFIWVVlVC9BR0duRFJrZlpLUEovc05PR2pJK3k4YmJITi9Ec3ptNnpLTm84OVdPTDBiOVJ4NDdDanlmN0RUaG95UHNsSGsvMkduRFJrZlpOc2MzOE96T2JyRzBlZXJIRjZOK280OGRoUjVQOWhwdzBaSDJTanlmN0RUaG95UHNtMk9iK0habk4xamFQUFZqaTlHL1VjZU93bzhuK3cwNGFNajdKUjVQOWhwdzBaSDJUYkhOL0Rzem02eHRIbnF4eGVqZnFPUEhZVWVUL1lhY05HUjlrbzhuK3cwNGFNajdKdGptL2gyWnpkWTJqejFZNHZSdjFISGpzS1BKL3NOT0dqSSt5VWVUL1lhY05HUjlrMnh6Znc3TTV1c2JSNTZzY1hvMzZqangyRkhrL3dCaHB3MFpIMlNqeWY3RFRob3lQc20yT2IrSFpuTjFqYVBQVmppOUcvVWNlT3dvOG4rdzA0YU1qN0pSNVA4QVlhY05HUjlrMnh6Znc3TTV1c2JSNTZzY1hvMzZqangyRkhrLzJHbkRSa2ZaS1BKL3NOT0dqSSt5Ylk1djRkbWMzV05vODlXT0wwYjlSeDQ3Q2p5ZjdEVGhveVBzbEhrLzJHbkRSa2ZaTnNjMzhPek9ickcwZWVySEY2TitvNDhkaFI1UDlocHcwWkgyU2p5ZjdEVGhveVBzbTJPYitIWm5OMWphUFBWamk5Ry9VY2VPd284bit3MDRhTWo3SlI1UDlocHcwWkgyVGJITi9Ec3ptNnh0SG5xeHhlamZxT1BIWVVlVC9ZYWNOR1I5a284bit3MDRhTWo3SnRqbS9oMlp6ZFkyanoxWTR2UnYxSEhqc0tQSi9zTk9HakkreVVlVC9ZYWNOR1I5azJ4emZ3N001dXNiUjU2c2NYbzM2amp4OUxHbUpzY1lqd2k4d1RIV0tzWllud3ErdkxrUzloWVZBdm9WL2ZYbDI3ZHVYTDY1ZTMxeTVkNXVlNWR1Yy84QWE2K2E5U0RHWkVhajRhb3JWOVNwdm9ZL0twTEZnUkZoUm1xMTZldEZSVVZQNm91K2dBZjFQbkRzTW5uVCtSdStNQzllOGNlN0RKNTAva2J2akF2WHZIalVqOW54L2dkMVZNb29QN2FrZkd3K3VocWdBcUlPbGdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFNcjhvZlQrZWUrTU45ZS9jZTdES0gwL25udmpEZlh2M0hyZDZPZXo0SHdONnFITlBUajIxTE9OaWRkUUE5a3hjMkFBVTNuVUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFFZjhxNzdDOGQrQkg2d09WZDloZU8vQWo5WlplLzRveVRsTzFlVVAzNXY0bFRseVA3ZUVBRzVDTDVwQmtFNnBwVThWN21LOWdlUDVCT3FhVlBGZTVpdllGVU4wWEdHWDhkRjY3am93dUlZbHpQOHJKK3lZQUdHbTBBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBRHgvTDMxVFRYNFgzTUptKzBneTk5VTAxK0Y5ekNadnA5WHErTDBiam5kU0dVMytVTXgwa3Z5ck8xamdCSllnZWJBQUtienFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQ0QrVkQwL3hSM1BDOWVNbTlTSEtoNmY0bzduaGV2R1RldEZ1T1lzU0w0RStxblB2ZlBZL3pyeHEvUkFBMldhSERzTW5uVCtSdStNQzllOGNlN0RKNTAva2J2akF2WHZIalVqOW54L2dkMVZNb29QN2FrZkd3K3VocWdBcUlPbGdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFNcjhvZlQrZWUrTU45ZS9jZTdES0gwL25udmpEZlh2M0hyZDZPZXo0SHdONnFITlBUajIxTE9OaWRkUUE5a3hjMkFBVTNuVUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFFZjhBS3Urd3ZIZmdSK3NEbFhmWVhqdndJL1dXWHY4QWlqSk9VN1Y1US9mbS9pVk9YSS90NFFBYmtJdm1rR1FUcW1sVHhYdVlyMkI0L2tFNnBwVThWN21LOWdWUTNSY1laZngwWHJ1T2pDNGhpWE0veXNuN0pnQVlhYlFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBUEg4dmZWTk5maGZjd21iN1NETDMxVFRYNFgzTUptK24xZXI0dlJ1T2QxSVpUZjVRekhTUy9LczdXT0FFbGlCNXNBQXB2T29BQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBSVA1VVBUL0FCUjNQQzllTW05U0hLaDZmNG83bmhldkdUZXRGdU9Zc1NMNEUrcW5QdmZQWS96cnhxL1JBQTJXYUhEc01ublQrUnUrTUM5ZThjZTdESjUwL2tidmpBdlh2SGpVajlueC9nZDFWTW9vUDdha2ZHdyt1aHFnQXFJT2xnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBTXI4b2ZUK2VlK01OOWUvY2U3REtIMC9ubnZqRGZYdjNIcmQ2T2V6NEh3TjZxSE5QVGoyMUxPTmlkZFFBOWt4YzJBQVUzblVBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBRWY4cTc3QzhkK0JINndPVmQ5aGVPL0FqOVpaZS80b3lUbE8xZVVQMzV2NGxUbHlQN2VFQUc1Q0w1cEJrRTZwcFU4VjdtSzlnZVA1Qk9xYVZQRmU1aXZZRlVOMFhHR1g4ZEY2N2pvd3VJWWx6UDhySit5WUFHR20wQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUR4L0wzMVRUWDRYM01KbSswZ3k5OVUwMStGOXpDWnZwOVhxK0wwYmpuZFNHVTMrVU14MGt2eXJPMWpnQkpZZ2ViQUFLYnpxQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUNEK1ZEMC94UjNQQzllTW05U0hLaDZmNG83bmhldkdUZXRGdU9Zc1NMNEUrcW5QdmZQWS96cnhxL1JBQTJXYUhEc01ublQrUnUrTUM5ZThjZTdESjUwL2tidmpBdlh2SGpVajlueC9nZDFWTW9vUDdha2ZHdyt1aHFnQXFJT2xnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBTXI4b2ZUK2VlK01OOWUvY2U3REtIMC9ubnZqRGZYdjNIcmQ2T2V6NEh3TjZxSE5QVGoyMUxPTmlkZFFBOWt4YzJBQVUzblVBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBRWY4QUt1K3d2SGZnUitzRGxYZllYanZ3SS9XV1h2OEFpakpPVTdWNVEvZm0vaVZPWEkvdDRRQWJrSXZta0dRVHFtbFR4WHVZcjJCNC9rRTZwcFU4VjdtSzlnVlEzUmNZWmZ4MFhydU9qQzRoaVhNL3lzbjdKZ0FZYWJRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQVBIOHZmVk5OZmhmY3dtYjdTREwzMVRUWDRYM01KbStuMWVyNHZSdU9kMUlaVGY1UXpIU1MvS3M3V09BRWxpQjVzQUFwdk9vQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUlQNVVQVC9BQlIzUEM5ZU1tOVNIS2g2ZjRvN25oZXZHVGV0RnVPWXNTTDRFK3FuUHZmUFkvenJ4cS9SQUEyV2FIRHNNbm5UK1J1K01DOWU4Y2U3REo1MC9rYnZqQXZYdkhqVWo5bngvZ2QxVk1vb1A3YWtmR3crdWhxZ0FxSU9sZ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU1yOG9mVCtlZStNTjllL2NlN0RLSDAvbm52akRmWHYzSHJkNk9lejRId042cUhOUFRqMjFMT05pZGRRQTlreGMyQUFVM25VQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUVmOHE3N0M4ZCtCSDZ3T1ZkOWhlTy9BajlaWmUvNG95VGxPMWVVUDM1djRsVGx5UDdlRUFHNUNMNXBCa0U2cHBVOFY3bUs5Z2VQNUJPcWFWUEZlNWl2WUZVTjBYR0dYOGRGNjdqb3d1SVlselA4ckoreVlBR0dtMEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFEeC9MMzFUVFg0WDNNSm0rMGd5OTlVMDErRjl6Q1p2cDlYcStMMGJqbmRTR1UzK1VNeDBrdnlyTzFqZ0JKWWdlYkFBS2J6cUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFDRCtWRDAveFIzUEM5ZU1tOVNIS2g2ZjRvN25oZXZHVGV0RnVPWXNTTDRFK3FuUHZmUFkvenJ4cS9SQUEyV2FIRHNNbm5UK1J1K01DOWU4Y2U3REo1MC9rYnZqQXZYdkhqVWo5bngvZ2QxVk1vb1A3YWtmR3crdWhxZ0FxSU9sZ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU1yOG9mVCtlZStNTjllL2NlN0RLSDAvbm52akRmWHYzSHJkNk9lejRId042cUhOUFRqMjFMT05pZGRRQTlreGMyQUhIMGh5QmJtVDlKd05vcERrQzNNbjZUZ2JTb2phNU9IQVB6WGFqcFkyOFRMYklYU00xbllEajZRNUF0ekorazRHMFVoeUJibVQ5SndObzJ1VGh3RDgxMm9iZUpsdGtMcEdhenNCeDlJY2dXNWsvU2NEYUtRNUF0ekorazRHMGJYSnc0QithN1VOdkV5MnlGMGpOWjJBNCtrT1FMY3lmcE9CdEZJY2dXNWsvU2NEYU5yazRjQS9OZHFHM2laYlpDNlJtczdBY2ZTSElGdVpQMG5BMmlrT1FMY3lmcE9CdEcxeWNPQWZtdTFEYnhNdHNoZEl6V2RnT1BwRGtDM01uNlRnYlJTSElGdVpQMG5BMmphNU9IQVB6WGFodDRtVzJRdWtack93SEgwaHlCYm1UOUp3Tm9wRGtDM01uNlRnYlJ0Y25EZ0g1cnRRMjhUTGJJWFNNMW5ZRGo2UTVBdHpKK2s0RzBVaHlCYm1UOUp3Tm8ydVRod0Q4MTJvYmVKbHRrTHBHYXpzQng5SWNnVzVrL1NjRGFLUTVBdHpKK2s0RzBiWEp3NEIrYTdVTnZFeTJ5RjBqTloyQTQra09RTGN5ZnBPQnRGSWNnVzVrL1NjRGFOcms0Y0EvTmRxRzNpWmJaQzZSbXM3QWNmU0hJRnVaUDBuQTJpa09RTGN5ZnBPQnRHMXljT0FmbXUxRGJ4TXRzaGRJeldkZ09QcERrQzNNbjZUZ2JSU0hJRnVaUDBuQTJqYTVPSEFQelhhaHQ0bVcyUXVrWnJPd0hIMGh5QmJtVDlKd05vcERrQzNNbjZUZ2JSdGNuRGdINXJ0UTI4VExiSVhTTTFuWURqNlE1QXR6SitrNEcwVWh5QmJtVDlKd05vMnVUaHdEODEyb2JlSmx0a0xwR2F5YitWZDloZU8vQWo5VkhLWW1IRUdQdjRLL1E4ZVlueDE4cjZ6NXYwbUUza2I1WFA4bm0rTDRidDNtNS9odTgzUC9QbXVwWFdNM0I1TkVnMFVra09LMVd1VHptOHFZRi8vUi81S1VlMzRFdWdTbTZMT01hVHZSN0Y4emdWcW9xTGdnUWszbFRlOWU4QUczaU5KcEJrRTZwcFU4VjdtSzlnVDNrVG5LVU1WWk1aWndER2sxUzNpM0Q0ZjFIeklHRVlkQ2h4THpud2lKZHVjOTdmWDF5N2M1N2wyNWQveGR1UFZLUTVBdHpKK2s0RzBxM3VnekRMbnovTG5zZ3ZWRmpSVlJVYXVCVTJidjhBNGRCdHhlbU0wUXFIVFRDaXlxRzF6Wk5BUlVWN1VWRlNFekNpcGgzbFE3QWNmU0hJRnVaUDBuQTJpa09RTGN5ZnBPQnRNUTJ1VGh3RDgxMm8yWHQ0bVcyUXVrWnJPd0hIMGh5QmJtVDlKd05vcERrQzNNbjZUZ2JSdGNuRGdINXJ0UTI4VExiSVhTTTFuWURqNlE1QXR6SitrNEcwVWh5QmJtVDlKd05vMnVUaHdEODEyb2JlSmx0a0xwR2F6c0J4OUljZ1c1ay9TY0RhS1E1QXR6SitrNEcwYlhKdzRCK2E3VU52RXkyeUYwak5aMkE0K2tPUUxjeWZwT0J0RkljZ1c1ay9TY0RhTnJrNGNBL05kcUczaVpiWkM2Um1zN0FjZlNISUZ1WlAwbkEyaWtPUUxjeWZwT0J0RzF5Y09BZm11MURieE10c2hkSXpXZGdPUHBEa0MzTW42VGdiUlNISUZ1WlAwbkEyamE1T0hBUHpYYWh0NG1XMlF1a1pyT3dISDBoeUJibVQ5SndOb3BEa0MzTW42VGdiUnRjbkRnSDVydFEyOFRMYklYU00xbllEajZRNUF0ekorazRHMFVoeUJibVQ5SndObzJ1VGh3RDgxMm9iZUpsdGtMcEdhenNCeDlJY2dXNWsvU2NEYUtRNUF0ekorazRHMGJYSnc0QithN1VOdkV5MnlGMGpOWjJBNCtrT1FMY3lmcE9CdEZJY2dXNWsvU2NEYU5yazRjQS9OZHFHM2laYlpDNlJtczdBY2ZTSElGdVpQMG5BMmlrT1FMY3lmcE9CdEcxeWNPQWZtdTFEYnhNdHNoZEl6V2RnT1BwRGtDM01uNlRnYlJTSElGdVpQMG5BMmphNU9IQVB6WGFodDRtVzJRdWtack9QeTk5VTAxK0Y5ekNadnI4eTJUbEtHTmNtTXpZQml1YXBieGxoOFQ2ZjVjREI4T2hSSWwvellSRHUzZWE5dmI2N2R1ODF5NWR1L3dDTGwxQWFkVjdGSW8wQ1lJekk3RmF2bm5MZ1ZGUmNHd2gveEtpTC91ZFpMTEtZeWFMSklqWWpVa3pFd3RWSEpoODdHM3NLS3Uvdm9BRWpTRHhzQU9QcERrQzNNbjZUZ2JSU0hJRnVaUDBuQTJsUkcxeWNPQWZtdTFIU3h0NG1XMlF1a1pyT3dISDBoeUJibVQ5SndOb3BEa0MzTW42VGdiUnRjbkRnSDVydFEyOFRMYklYU00xbllEajZRNUF0ekorazRHMFVoeUJibVQ5SndObzJ1VGh3RDgxMm9iZUpsdGtMcEdhenNCeDlJY2dXNWsvU2NEYUtRNUF0ekorazRHMGJYSnc0QithN1VOdkV5MnlGMGpOWjJBNCtrT1FMY3lmcE9CdEZJY2dXNWsvU2NEYU5yazRjQS9OZHFHM2laYlpDNlJtczdBY2ZTSElGdVpQMG5BMmlrT1FMY3lmcE9CdEcxeWNPQWZtdTFEYnhNdHNoZEl6V2RnT1BwRGtDM01uNlRnYlJTSElGdVpQMG5BMmphNU9IQVB6WGFodDRtVzJRdWtack93SEgwaHlCYm1UOUp3Tm9wRGtDM01uNlRnYlJ0Y25EZ0g1cnRRMjhUTGJJWFNNMW5ZRGo2UTVBdHpKK2s0RzBVaHlCYm1UOUp3Tm8ydVRod0Q4MTJvYmVKbHRrTHBHYXpzQng5SWNnVzVrL1NjRGFLUTVBdHpKK2s0RzBiWEp3NEIrYTdVTnZFeTJ5RjBqTloyQTQra09RTGN5ZnBPQnRGSWNnVzVrL1NjRGFOcms0Y0EvTmRxRzNpWmJaQzZSbXM3QWNmU0hJRnVaUDBuQTJpa09RTGN5ZnBPQnRHMXljT0FmbXUxRGJ4TXRzaGRJeldkZ09QcERrQzNNbjZUZ2JSU0hJRnVaUDBuQTJqYTVPSEFQelhhaHQ0bVcyUXVrWnJPd0hIMGh5QmJtVDlKd05vcERrQzNNbjZUZ2JSdGNuRGdINXJ0UTI4VExiSVhTTTFrZjhxSHAvaWp1ZUY2OFpONzM3bEc0NXhQanlkOFY0WGlYR3VMY2NZTGU0cWhRNzZMZ3NlOWkzbDdmM0kwYTdkdmJ0OWUzYnR6bjVydHk3emYzdVBBVm1OeUtBK0hScVJzaUlxT1JpWVVYZVgxcVVNWHlrcWhSNmR6bkdndVJ6RmlyZ1ZGUlVYZVQxS204b0FiR05IQisyRDRSaEdCNFJBd3ZCSThiQmNLaFg5N0VoUllkOWR2YitIZjNMdlBjdnIyK3VmNjNMdHk3Y3VYYmwyNC9FZmx6VVZNQzc2SDdoeEhOY2ptcmdWRHNLUTUvdHpPR2s0KzBVaHovYm1jTkp4OXB4NDhqYTVOL0FNelc2akpkdkU5V3lMMGo5WjJGSWMvMjVuRFNjZmFLUTUvdHpPR2s0KzA0OE5yazM4QXpOYnFHM2llclpGNlIrczdDa09mN2N6aHBPUHRGSWMvMjVuRFNjZmFjZUcxeWIrQVptdDFEYnhQVnNpOUkvV2RoU0hQOEFibWNOSng5b3BEbiszTTRhVGo3VGp3MnVUZndETTF1b2JlSjZ0a1hwSDZ6c0tRNS90ek9HazQrMFVoei9BRzVuRFNjZmFjZUcxeWIrQVptdDFEYnhQVnNpOUkvV2RoU0hQOXVadzBuSDJpa09mN2N6aHBPUHRPUERhNU4vQU16VzZodDRucTJSZWtmck93cERuKzNNNGFUajdSU0hQOXVadzBuSDJuSGh0Y20vZ0dacmRRMjhUMWJJdlNQMW5ZVWh6L2JtY05KeDlvcERuKzNNNGFUajdUancydVRmd0RNMXVvYmVKNnRrWHBINnpzS1E1L3R6T0drNCswVWh6L2JtY05KeDlweDRiWEp2NEJtYTNVTnZFOVd5TDBqOVoyRkljLzI1bkRTY2ZhS1E1L3R6T0drNCswNDhOcmszOEF6TmJxRzNpZXJaRjZSK3M3Q2tPZjdjemhwT1B0RkljLzI1bkRTY2ZhY2VHMXliK0FabXQxRGJ4UFZzaTlJL1dkaFNIUDhBYm1jTkp4OW9wRG4rM000YVRqN1RqdzJ1VGZ3RE0xdW9iZUo2dGtYcEg2enNLUTUvdHpPR2s0KzBVaHovQUc1bkRTY2ZhY2VHMXliK0FabXQxRGJ4UFZzaTlJL1dkaFNIUDl1WncwbkgyaWtPZjdjemhwT1B0T1BEYTVOL0FNelc2aHQ0bnEyUmVrZnJQMndqQ01Jd3pDSStGNFhIallWaFVXL3Zva1dMRXZydDlmeEwrN2Q1N3Q5ZlgxMy9BRnUzYnQyN2R1M2J0MStJUFhhMUdwc1c3eUlZMUVpT2M1WE9YQ3FnQitqOEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBSFZTTGcrRDRaTzhuWUpoY0NEaFdDeGNhNEpEaXdvbDdjdnJ5SmVYWTE3Y3UzdDllM2Y5THR5N2N1M2JsMjVkZkpMNVdrbmdQanVUQ2pFVmVaTUo2VXp6YzZXU3VGSkdyZ1dJNXJjUDhOa3FKaC85T1ZHcUZIa2dXR2svUmtEWktQSkFzTkoraklHeWkzV3VtK3lQem1sZzNvNko2eWxDekhtVjQxUW84a0N3MG42TWdiSlI1SUZocFAwWkEyU3RkTjlrZm5OSG82SjZ5bEN6SG1WNDFRbzhrQ3cwbjZNZ2JKUjVJRmhwUDBaQTJTdGROOWtmbk5IbzZKNnlsQ3pIbVY0MVFvOGtDdzBuNk1nYkpSNUlGaHBQMFpBMlN0ZE45a2ZuTkhvNko2eWxDekhtVjQxUW84a0N3MG42TWdiSlI1SUZocFAwWkEyU3RkTjlrZm5OSG82SjZ5bEN6SG1WNDFRbzhrQ3cwbjZNZ2JKUjVJRmhwUDBaQTJTdGROOWtmbk5IbzZKNnlsQ3pIbVY0MVFvOGtDdzBuNk1nYkxLOXRlNWhkWGs5S1BQK1lndWgrWjJPSENxTGgyV3k5V0QrR3gvOUk1M2Y3M09XMEEvMG4rc2xMSTMrcDg1ZzJLS21EemV3dzRjUDhkbW1EK2dBYllJNWdYNWtUazJVTWE1TVpady9Ha3F5M2pMRDRuMUh6SStFWURDaVJML213aUpjdWM5OWZYdDI3ZDVybHk1Yy93QVhMajFTanlRTERTZm95QnNvelQ5Zk15R1FTNk5JWHlWN2xoUGN4VlJVd0tyVlZNUDk4QlBXaDE0WE84OFRSSlozaFMrRzFzb2hzaUlpdGRoUkh0UnlJdjhBOVREZ01yeHFoUjVJRmhwUDBaQTJTanlRTERTZm95QnN2SnJYVGZaSDV6VEkvUjBUMWxLRm1QTXJ4cWhSNUlGaHBQMFpBMlNqeVFMRFNmb3lCc2xhNmI3SS9PYVBSMFQxbEtGbVBNcnhxaFI1SUZocFAwWkEyU2p5UUxEU2ZveUJzbGE2YjdJL09hUFIwVDFsS0ZtUE1yeHFoUjVJRmhwUDBaQTJTanlRTERTZm95QnNsYTZiN0kvT2FQUjBUMWxLRm1QTXJ4cWhSNUlGaHBQMFpBMlNqeVFMRFNmb3lCc2xhNmI3SS9PYVBSMFQxbEtGbVBNcnhxaFI1SUZocFAwWkEyU2p5UUxEU2ZveUJzbGE2YjdJL09hUFIwVDFsS0ZtUE1yeHFoUjVJRmhwUDBaQTJTanlRTERTZm95QnNsYTZiN0kvT2FQUjBUMWxLRm1QTXJ4cWhSNUlGaHBQMFpBMlNqeVFMRFNmb3lCc2xhNmI3SS9PYVBSMFQxbEtGbVBNcnhxaFI1SUZocFAwWkEyU2p5UUxEU2ZveUJzbGE2YjdJL09hUFIwVDFsS0ZtUE1yeHFoUjVJRmhwUDBaQTJTanlRTERTZm95QnNsYTZiN0kvT2FQUjBUMWxLRm1QTXJ4cWhSNUlGaHBQMFpBMlNqeVFMRFNmb3lCc2xhNmI3SS9PYVBSMFQxbEtGbVBNcnhxaFI1SUZocFAwWkEyU2p5UUxEU2ZveUJzbGE2YjdJL09hUFIwVDFsS0ZtUE1yeHFoUjVJRmhwUDBaQTJTanlRTERTZm95QnNsYTZiN0kvT2FQUjBUMWxLRm1QTXJ4Zm1XeVRaUXhWa3htYkQ4VnlyTGVMY1BoL1QvQUM0K0Q0RENoeEx6bndpSGN1ODE5ZTN0eTdjNTdsMjdjL3hkdW9EYnR1YlhRWU5KWkMrWFFJYXcwYTlXWUZWRlhDaU5YRHZmRVJRdTYzRnBWUVdkNGMwU3VPMk01OE5JbUZxS2lJaXVlM0J2L24vd1ZmN2dCc0kwc0JWSEpubDdFR1B2NDEvWE1SNG54MThyNlA1WDFlRFhrYjVYUDg3bitINHJsM201L2h1Yy9OL1BtdUtvbzhrQ3cwbjZNZ2JLUGxPTDRPUnpIT2tXYTRzbmM5MFBZNzZLaUl1eWFqdnovcmdKcFhKYnk2ZEtXMGZrOUlKUExZY0prYlo0R3VhNVZUWVBjemZWTjdmVnVIKzVsZU5VS1BKQXNOSitqSUd5VWVTQllhVDlHUU5saWRhNmI3SS9PYWJHOUhSUFdVb1dZOHl2R3FGSGtnV0drL1JrRFpLUEpBc05KK2pJR3lWcnB2c2o4NW85SFJQV1VvV1k4eXZHcUZIa2dXR2svUmtEWktQSkFzTkoraklHeVZycHZzajg1bzlIUlBXVW9XWTh5dkdxRkhrZ1dHay9Sa0RaS1BKQXNOSitqSUd5VnJwdnNqODVvOUhSUFdVb1dZOHl2R3FGSGtnV0drL1JrRFpLUEpBc05KK2pJR3lWcnB2c2o4NW85SFJQV1VvV1k4eXZHcUZIa2dXR2svUmtEWktQSkFzTkoraklHeVZycHZzajg1bzlIUlBXVW9XWTh5dkdxRkhrZ1dHay9Sa0RaS1BKQXNOSitqSUd5VnJwdnNqODVvOUhSUFdVb1dZOHl2R3FGSGtnV0drL1JrRFpLUEpBc05KK2pJR3lWcnB2c2o4NW85SFJQV1VvV1k4eXZHcUZIa2dXR2svUmtEWktQSkFzTkoraklHeVZycHZzajg1bzlIUlBXVW9XWTh5dkdxRkhrZ1dHay9Sa0RaS1BKQXNOSitqSUd5VnJwdnNqODVvOUhSUFdVb1dZOHl2R3FGSGtnV0drL1JrRFpLUEpBc05KK2pJR3lWcnB2c2o4NW85SFJQV1VvV1k4eXZHcUZIa2dXR2svUmtEWktQSkFzTkoraklHeVZycHZzajg1bzlIUlBXVW9XWTh5dkdxRkhrZ1dHay9Sa0RaS1BKQXNOSitqSUd5VnJwdnNqODVvOUhSUFdVb1dZOHl2R3FGSGtnV0drL1JrRFpaWHRyM01McThucFI1L3pFRjBQek94dzRWUmNPeTJYcXdmdzJQL0FLUnp1LzN1Y3RvQi9wUDlaS1dSdjlUNXpCc1VWTUhtOWhodzRmNDdOTUg5QUEyd1J6QTlVeUo0dXhmalhLZExPQVkwd0hBOFpZQkUrbytaQXdpRmV4SWQvd0EyRHhMdHpudmI2NWR1WGVhN2N1WGY4M0xpL0tQSkFzTkoraklHeTBsZEp1MnlXalV1WklZOEIwUlhNUitGRlJFd0tya3diL3drcjdoVjZqT0ZPcG9pVHZKSld5QzFrUlllQnpYS3FxaldPdzczNWY4QU5FL3NaWGpWQ2p5UUxEU2ZveUJzbEhrZ1dHay9Sa0RaYTlyWFRmWkg1elRkUG82SjZ5bEN6SG1WNDFRbzhrQ3cwbjZNZ2JKUjVJRmhwUDBaQTJTdGROOWtmbk5IbzZKNnlsQ3pIbVY0MVFvOGtDdzBuNk1nYkpSNUlGaHBQMFpBMlN0ZE45a2ZuTkhvNko2eWxDekhtVjQxUW84a0N3MG42TWdiSlI1SUZocFAwWkEyU3RkTjlrZm5OSG82SjZ5bEN6SG1WNDFRbzhrQ3cwbjZNZ2JKUjVJRmhwUDBaQTJTdGROOWtmbk5IbzZKNnlsQ3pIbVY0MVFvOGtDdzBuNk1nYkpSNUlGaHBQMFpBMlN0ZE45a2ZuTkhvNko2eWxDekhtVjQxUW84a0N3MG42TWdiSlI1SUZocFAwWkEyU3RkTjlrZm5OSG82SjZ5bEN6SG1WNDFRbzhrQ3cwbjZNZ2JKUjVJRmhwUDBaQTJTdGROOWtmbk5IbzZKNnlsQ3pIbVY0MVFvOGtDdzBuNk1nYkpSNUlGaHBQMFpBMlN0ZE45a2ZuTkhvNko2eWxDekhtVjQxUW84a0N3MG42TWdiSlI1SUZocFAwWkEyU3RkTjlrZm5OSG82SjZ5bEN6SG1WNDFRbzhrQ3cwbjZNZ2JKUjVJRmhwUDBaQTJTdGROOWtmbk5IbzZKNnlsQ3pIbVY0MVFvOGtDdzBuNk1nYkpSNUlGaHBQMFpBMlN0ZE45a2ZuTkhvNko2eWxDekhtVjQxUW84a0N3MG42TWdiSlI1SUZocFAwWkEyU3RkTjlrZm5OSG82SjZ5bEN6SG1WNDFRbzhrQ3cwbjZNZ2JLTGVVYmliRStJNTN4WGdtSmNWWXR4UGd0OWlxRkV2b1dDd0wyRmVYMS9kalJybDIrdTN0N2N1WE9mbXVYTG5QOEEydU0zdWZYZUpKU0NjVW02REozTWNxS3VGVlJVM3Y2R3FMdEY1L09WQzVqZFBrcWxqSXJFYzF1eGExeUwvd0FsOWVGZDdlUEFRRytDSHdGVWNtZVhzUVkrL2pYOWN4SGlmSFh5dm8vbGZWNE5lUnZsYy96dWY0Zml1WGVibitHNXo4MzgrYTRxaWp5UUxEU2ZveUJzbytVNHZnNUhNYzZSWnJpeWR6M1E5anZvcUlpN0pxTy9QK3VBbWxjbHZMcDBwYlIrVDBnazh0aHdtUnRuZ2E1cmxWTmc5ek45VTN0OVc0ZjdtVjQxUW84a0N3MG42TWdiSlI1SUZocFAwWkEyV0oxcnB2c2o4NXBzYjBkRTlaU2haanpLOGFvVWVTQllhVDlHUU5rbzhrQ3cwbjZNZ2JKV3VtK3lQem1qMGRFOVpTaFpqeks4YW9VZVNCWWFUOUdRTmtvOGtDdzBuNk1nYkpXdW0reVB6bWowZEU5WlNoWmp6Szhhb1VlU0JZYVQ5R1FOa284a0N3MG42TWdiSld1bSt5UHptajBkRTlaU2haanpLOGFvVWVTQllhVDlHUU5rbzhrQ3cwbjZNZ2JKV3VtK3lQem1qMGRFOVpTaFpqeks4ZS9jbzNFMko4Unp2aXZCTVM0cXhiaWZCYjdGVUtKZlFzRmdYc0s4dnIrN0dqWEx0OWR2YjI1Y3VjL05jdVhPZisxeDRDa2RSU2tMSjJtNkRPTU5xdGJGVENpTDYwSU9YUmFGeGFPejVLWmpqUFI3NER0aXJrUlVSZlZ2b2k3L0FPWUFaQ1lVSFlaUE9uOGpkOFlGNjk0NDkyR1R6cC9JM2ZHQmV2ZVBHcEg3UGovQTdxcVpSUWYyMUkrTmg5ZERWQUJVUWRMQUFBQUFBQUFBQUFBQmorMkFZL3BrWHBYdkRrdnVsWC9sSXZjMzZuN0FBVElLdnpTRElKMVRTcDRyM01WN0E4ZnlDZFUwcWVLOXpGZXdLb2JvdU1NdjQ2TDEzSFJoY1F4TG1mNVdUOWt3QU1OTm9BQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBSGorWHZxbW12d3Z1WVROOXBCbDc2cHByOEw3bUV6ZlQ2dlY4WG8zSE82a01wdjhvWmpwSmZsV2RySEFDU3hBOHNEa28vZnZnZnpyQVIveVVmdjN3UDUxZ0swNzRERzZWOG4yVEMrQzh5L0RXYmVXL2NSUUEwMlNnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQURIOXNBeC9USXZTdmVISmZkS3YvS1JlNXYxUDJBQW1RVmZuc0dRVHJabFR4WHRvclNCbS9rRTYyWlU4VjdhSzBnUUZ2cU1ZWVBFdDY4UXVROG5uaVhLdm1uOWxBQUNOSlBBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUlQNVVQVC9GSGM4TDE0eThFSDhxSHAvaWp1ZUY2OFp2MjlyeG5aOEQvQUtJUTN2N2NRSW5Hd3ZxcE40Q3hNcEhMQTVLUDM3NEg4NndFZjhsSDc5OEQrZFlDdE8rQXh1bGZKOWt3dmd2TXZ3MW0zbHYzRVVBTk5rb0FBQUFBQUFBQUFnL2xROVA4VWR6d3ZYakp2VWh5b2VuK0tPNTRYcnhrM3JSYmptTEVpK0JQcXB6NzN6MlA4NjhhdjBRQU5sbWh3N0RKNTAva2J2akF2WHZISHV3eWVkUDVHNzR3TDE3eDQxSS9aOGY0SGRWVEtLRCsycEh4c1Byb2FvQUtpRHBZQUFBQUFBQUFBQUFBTWYyd0RIOU1pOUs5NGNsOTBxLzhwRjdtL1UvWUFDWkJWK2FRWkJPcWFWUEZlNWl2WUhqK1FUcW1sVHhYdVlyMkJWRGRGeGhsL0hSZXU0Nk1MaUdKY3ovS3lmc21BQmhwdEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBOGZ5OTlVMDErRjl6Q1p2dElNdmZWTk5maGZjd21iNmZWNnZpOUc0NTNVaGxOL2xETWRKTDhxenRZNEFTV0lIbGdjbEg3OThEK2RZQ1ArU2o5KytCL09zQlduZkFZM1N2ayt5WVh3WG1YNGF6YnkzN2lLQUdteVVBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQVkvdGdHUDZaRjZWN3c1TDdwVi93Q1VpOXpmcWZzQUJNZ3EvUFlNZ25XektuaXZiUldrRE4vSUoxc3lwNHIyMFZwQWdMZlVZd3dlSmIxNGhjaDVQUEV1VmZOUDdLQUFFYVNlQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFRZnlvZW4rS081NFhyeGw0SVA1VVBUL0FCUjNQQzllTTM3ZTE0enMrQi8wUWh2ZjI0Z1JPTmhmVlNid0ZpWlNPV0J5VWZ2M3dQNTFnSS81S1AzNzRIODZ3RmFkOEJqZEsrVDdKaGZCZVpmaHJOdkxmdUlvQWFiSlFBQUFBQUFBQUFCQi9LaDZmNG83bmhldkdUZXBEbFE5UDhVZHp3dlhqSnZXaTNITVdKRjhDZlZUbjN2bnNmNTE0MWZvZ0FiTE5EaDJHVHpwL0kzZkdCZXZlT1BkaGs4NmZ5TjN4Z1hyM2p4cVIrejQvd0FEdXFwbEZCL2JVajQySDEwTlVBRlJCMHNBQUFBQUFBQUFBQUFHUDdZQmorbVJlbGU4T1MrNlZmOEFsSXZjMzZuN0FBVElLdnpTRElKMVRTcDRyM01WN0E4ZnlDZFUwcWVLOXpGZXdLb2JvdU1NdjQ2TDEzSFJoY1F4TG1mNVdUOWt3QU1OTm9BQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBSGorWHZxbW12d3Z1WVROOXBCbDc2cHByOEw3bUV6ZlQ2dlY4WG8zSE82a01wdjhvWmpwSmZsV2RySEFDU3hBOHNEa28vZnZnZnpyQVIveVVmdjN3UDUxZ0swNzRERzZWOG4yVEMrQzh5L0RXYmVXL2NSUUEwMlNnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQURIOXNBeC9USXZTdmVISmZkS3YvS1JlNXYxUDJBQW1RVmZuc0dRVHJabFR4WHRvclNCbS9rRTYyWlU4VjdhSzBnUUZ2cU1ZWVBFdDY4UXVROG5uaVhLdm1uOWxBQUNOSlBBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUlQNVVQVC9GSGM4TDE0eThFSDhxSHAvaWp1ZUY2OFp2MjlyeG5aOEQvb2hEZS90eEFpY2JDK3FrM2dMRXlrY3NEa28vZnZnZnpyQVIvd0FsSDc5OEQrZFlDdE8rQXh1bGZKOWt3dmd2TXZ3MW0zbHYzRVVBTk5rb0FBQUFBQUFBQUFnL2xROVA4VWR6d3ZYakp2VWh5b2VuK0tPNTRYcnhrM3JSYmptTEVpK0JQcXB6NzN6MlA4NjhhdjBRQU5sbWh3N0RKNTAva2J2akF2WHZISHV3eWVkUDVHNzR3TDE3eDQxSS9aOGY0SGRWVEtLRCsycEh4c1Byb2FvQUtpRHBZQUFBQUFBQUFBQUFBTWYyd0RIOU1pOUs5NGNsOTBxLzhwRjdtL1UvWUFDWkJWK2FRWkJPcWFWUEZlNWl2WUhqK1FUcW1sVHhYdVlyMkJWRGRGeGhsL0hSZXU0Nk1MaUdKY3ovQUNzbjdKZ0FZYWJRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQVBIOHZmVk5OZmhmY3dtYjdTREwzMVRUWDRYM01KbStuMWVyNHZSdU9kMUlaVGY1UXpIU1MvS3M3V09BRWxpQjVZSEpSKy9mQS9uV0FqL2tvL2Z2Z2Z6ckFWcDN3R04wcjVQc21GOEY1bCtHczI4dCs0aWdCcHNsQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFHUDdZQmorbVJlbGU4T1MrNlZmK1VpOXpmcWZzQUJNZ3EvUFlNZ25XektuaXZiUldrRE4vSUoxc3lwNHIyMFZwQWdMZlVZd3dlSmIxNGhjaDVQUEV1VmZOUDdLQUFFYVNlQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFRZnlvZW4rS081NFhyeGw0SVA1VVBUL0ZIYzhMMTR6ZnQ3WGpPejRIL1JDRzkvYmlCRTQyRjlWSnZBV0psSTVZSEpSKy9mQS9uV0FqL2tvL2Z2Z2Z6ckFWcDN3R04wcjVQc21GOEY1bCtHczI4dCs0aWdCcHNsQUFBQUFBQUFBQUVIOHFIcC9panVlRjY4Wk42a09WRDAvd0FVZHp3dlhqSnZXaTNITVdKRjhDZlZUbjN2bnNmNTE0MWZvZ0FiTE5EaDJHVHpwL0kzZkdCZXZlT1BkaGs4NmZ5TjN4Z1hyM2p4cVIrejQvd082cW1VVUg5dFNQallmWFExUUFWRUhTd0FBQUFBQUFBQUFBQVkvdGdHUDZaRjZWN3c1TDdwVi81U0wzTitwK3dBRXlDcjgwZ3lDZFUwcWVLOXpGZXdQSDhnblZOS25pdmN4WHNDcUc2TGpETCtPaTlkeDBZWEVNUzVuK1ZrL1pNQUREVGFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQjQvbDc2cHByOEw3bUV6ZmFRWmUrcWFhL0MrNWhNMzArcjFmRjZOeHp1cERLYi9LR1k2U1g1Vm5heHdBa3NRUExBNUtQMzc0SDg2d0VmOEFKUisvZkEvbldBclR2Z01icFh5ZlpNTDRMekw4Tlp0NWI5eEZBRFRaS0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBTWYyd0RIOU1pOUs5NGNsOTBxL3dES1JlNXYxUDJBQW1RVmZuc0dRVHJabFR4WHRvclNCbS9rRTYyWlU4VjdhSzBnUUZ2cU1ZWVBFdDY4UXVROG5uaVhLdm1uOWxBQUNOSlBBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUlQNVVQVC9BQlIzUEM5ZU12QkIvS2g2ZjRvN25oZXZHYjl2YThaMmZBLzZJUTN2N2NRSW5Hd3ZxcE40Q3hNcEhMQTVLUDM3NEg4NndFZjhsSDc5OEQrZFlDdE8rQXh1bGZKOWt3dmd2TXZ3MW0zbHYzRVVBTk5rb0FBQUFBQUFBQUFnL2xROVA4VWR6d3ZYakp2VWh5b2VuK0tPNTRYcnhrM3JSYmptTEVpK0JQcXB6NzN6MlA4QU92R3I5RUFEWlpvY093eWVkUDVHNzR3TDE3eHg3c01ublQrUnUrTUM5ZThlTlNQMmZIK0IzVlV5aWcvdHFSOGJENjZHcUFDb2c2V0FBQUFBQUFBQUFBQURIOXNBeC9USXZTdmVISmZkS3Y4QXlrWHViOVQ5Z0FKa0ZYNXBCa0U2cHBVOFY3bUs5Z2VQNUJPcWFWUEZlNWl2WUZVTjBYR0dYOGRGNjdqb3d1SVlselA4ckoreVlBR0dtMEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFEeC9MMzFUVFg0WDNNSm0rMGd5OTlVMDErRjl6Q1p2cDlYcStMMGJqbmRTR1UzK1VNeDBrdnlyTzFqZ0JKWWdlV0J5VWZ2M3dQNTFnSS81S1AzNzRIODZ3RmFkOEJqZEsrVDdKaGZCZVpmaHJOdkxmdUlvQWFiSlFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQmorMkFZL3BrWHBYdkRrdnVsWC9sSXZjMzZuN0FBVElLdnoyRElKMXN5cDRyMjBWcEF6ZnlDZGJNcWVLOXRGYVFJQzMxR01NSGlXOWVJWEllVHp4TGxYelQreWdBQkdrbmdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBRUg4cUhwL2lqdWVGNjhaZUNEK1ZEMC94UjNQQzllTTM3ZTE0enMrQi93QkVJYjM5dUlFVGpZWDFVbThCWW1VamxnY2xINzk4RCtkWUNQOEFrby9mdmdmenJBVnAzd0dOMHI1UHNtRjhGNWwrR3MyOHQrNGlnQnBzbEFBQUFBQUFBQUFFSDhxSHAvaWp1ZUY2OFpONmtPVkQwL3hSM1BDOWVNbTlhTGNjeFlrWHdKOVZPZmUrZXgvblhqVitpQUJzczBPQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFCOTZWY1Y0UGp5WjVjeExoZC9HaDRMaG1INFBnc1craDNibHkvdmJ5L2lYdDdkdTN0MjdjdTNPZm11M2VibnVYWHp5dVVzZ3duUm4vOVdvcXIvUkV3bjJ6ZElJa3FsRU9Td2Y4QXU5eU5UK3FyZ1QvMVQ0SXZDcTlJSGE4NGVZZ2JvcXZTQjJ2T0htSUc2YUtyS1VZL25mbUtTN3FKVS80T0YwcWFpRHhlRlY2UU8xNXc4eEEzUlZla0R0ZWNQTVFOMFZsS01menZ6RkZSS24vQnd1bFRVUWVMd3F2U0Iydk9IbUlHNktyMGdkcnpoNWlCdWlzcFJqK2QrWW9xSlUvNE9GMHFhaUR4ZUZWNlFPMTV3OHhBM1JWZWtEdGVjUE1RTjBWbEtNZnp2ekZGUktuL0FBY0xwVTFFSGk4S3IwZ2Ryemg1aUJ1aXE5SUhhODRlWWdib3JLVVkvbmZtS0tpVlArRGhkS21vZzhYaFZla0R0ZWNQTVFOMFZYcEE3WG5EekVEZEZaU2pIODc4eFJVU3Avd2NMcFUxRUhpOEtyMGdkcnpoNWlCdWlxOUlIYTg0ZVlnYm9yS1VZL25mbUtLaVZQOEFnNFhTcHFJUEY0VlhwQTdYbkR6RURkRlY2UU8xNXc4eEEzUldVb3gvTy9NVVZFcWY4SEM2Vk5SQjR2Q3E5SUhhODRlWWdib3F2U0Iydk9IbUlHNkt5bEdQNTM1aWlvbFQvZzRYU3BxSVBGNFZYcEE3WG5EekVEZEZWNlFPMTV3OHhBM1JXVW94L08vTVVWRXFmOEhDNlZOUkI0dkNxOUlIYTg0ZVlnYm9xdlNCMnZPSG1JRzZLeWxHUDUzNWlpb2xUL2c0WFNwcUlQRjRWWHBBN1huRHpFRGRGVjZRTzE1dzh4QTNSV1VveC9PL01VVkVxZjhBQnd1bFRVUWVMd3F2U0Iydk9IbUlHNktyMGdkcnpoNWlCdWlzcFJqK2QrWW9xSlUvNE9GMHFhaUR4ZUZWNlFPMTV3OHhBM1JWZWtEdGVjUE1RTjBWbEtNZnp2ekZGUktuL0J3dWxUVVFlUHZUVml2QjhSelBNZUpjRXY0MFRCY0R3L0NNRmhYMFM3Y3UzOTllWGtTK3ZibDIrdTNMbHk1ejgxeTV6ODF5NCtDM3JKSlMyTkNiR1ovMWNpS245RlRDUkVuR1FSSkxLSWtsamY4QWRqbGF2OVVYQXY4QTZnQWZRZkVCcWhSNUlGaHBQMFpBMlNqeVFMRFNmb3lCc29vVnJwdnNqODVwWXg2T2llc3BRc3g1bGVOVUtQSkFzTkoraklHeVVlU0JZYVQ5R1FOa3JYVGZaSDV6UjZPaWVzcFFzeDVsZU5VS1BKQXNOSitqSUd5VWVTQllhVDlHUU5rclhUZlpINXpSNk9pZXNwUXN4NWxlTlVLUEpBc05KK2pJR3lVZVNCWWFUOUdRTmtyWFRmWkg1elI2T2llc3BRc3g1bGVOVUtQSkFzTkoraklHeVVlU0JZYVQ5R1FOa3JYVGZaSDV6UjZPaWVzcFFzeDVsZU5VS1BKQXNOSitqSUd5VWVTQllhVDlHUU5rclhUZlpINXpSNk9pZXNwUXN4NWxlTlVLUEpBc05KK2pJR3lVZVNCWWFUOUdRTmtyWFRmWkg1elI2T2llc3BRc3g1bGVOVUtQSkFzTkoraklHeVVlU0JZYVQ5R1FOa3JYVGZaSDV6UjZPaWVzcFFzeDVsZU5VS1BKQXNOSitqSUd5VWVTQllhVDlHUU5rclhUZlpINXpSNk9pZXNwUXN4NWxlTlVLUEpBc05KK2pJR3lVZVNCWWFUOUdRTmtyWFRmWkg1elI2T2llc3BRc3g1bGVOVUtQSkFzTkoraklHeVVlU0JZYVQ5R1FOa3JYVGZaSDV6UjZPaWVzcFFzeDVsZU5VS1BKQXNOSitqSUd5VWVTQllhVDlHUU5rclhUZlpINXpSNk9pZXNwUXN4NWxlTlVLUEpBc05KK2pJR3lVZVNCWWFUOUdRTmtyWFRmWkg1elI2T2llc3BRc3g1bGVOVUtQSkFzTkoraklHeVVlU0JZYVQ5R1FOa3JYVGZaSDV6UjZPaWVzcFFzeDVsZUtvNVRFdllneEQvQUFWK2g0anhQaVg1djFuemZwTUd2SVB6ZWI1UE44WHczTG5QemZGZDV1ZitYUGRTdWtIUWVsa09mSnJoVHBDWXJHeE5sdkx2cW14Y3JmeS9waElXM1dybk1laVZJSlJSK1VSRWl2ZzdEQzVxS2lMczJOZnZJdS92STdCL1lBTXNOY2dYNWtUazJVTWE1TVpady9Ha3F5M2pMRDRuMUh6SStFWURDaVJML213aUpjdWM5OWZYdDI3ZDVybHk1Yy94Y3VQVktQSkFzTkoraklHeWpOUDE4eklaQkxvMGhmSlh1V0U5ekZWRlRBcXRWVXcvM3dFOWFIWGhjN3p4TkVsbmVGTDRiV3lpR3lJaUsxMkZFZTFISWkvL0FGTU9BeXZHcUZIa2dXR2svUmtEWktQSkFzTkoraklHeThtdGROOWtmbk5NajlIUlBXVW9XWTh5dkdxRkhrZ1dHay9Sa0RaS1BKQXNOSitqSUd5VnJwdnNqODVvOUhSUFdVb1dZOHl2R3FGSGtnV0drL1JrRFpLUEpBc05KK2pJR3lWcnB2c2o4NW85SFJQV1VvV1k4eXZHcUZIa2dXR2svUmtEWktQSkFzTkoraklHeVZycHZzajg1bzlIUlBXVW9XWTh5dkdxRkhrZ1dHay9Sa0RaS1BKQXNOSitqSUd5VnJwdnNqODVvOUhSUFdVb1dZOHl2R3FGSGtnV0drL1JrRFpLUEpBc05KK2pJR3lWcnB2c2o4NW85SFJQV1VvV1k4eXZHcUZIa2dXR2svUmtEWktQSkFzTkoraklHeVZycHZzajg1bzlIUlBXVW9XWTh5dkdxRkhrZ1dHay9Sa0RaS1BKQXNOSitqSUd5VnJwdnNqODVvOUhSUFdVb1dZOHl2R3FGSGtnV0drL1JrRFpLUEpBc05KK2pJR3lWcnB2c2o4NW85SFJQV1VvV1k4eXZHcUZIa2dXR2svUmtEWktQSkFzTkoraklHeVZycHZzajg1bzlIUlBXVW9XWTh5dkdxRkhrZ1dHay9Sa0RaS1BKQXNOSitqSUd5VnJwdnNqODVvOUhSUFdVb1dZOHl2R3FGSGtnV0drL1JrRFpLUEpBc05KK2pJR3lWcnB2c2o4NW85SFJQV1VvV1k4eXZHcUZIa2dXR2svUmtEWktQSkFzTkoraklHeVZycHZzajg1bzlIUlBXVW9XWTh5dkYrWmJKTmxERldUR1pzUHhYS3N0NHR3K0g5UDh1UGcrQXdvY1M4NThJaDNMdk5mWHQ3Y3UzT2U1ZHUzUDhYYnFBMjdibTEwR0RTV1F2bDBDR3NOR3ZWbUJWUlZ3b2pWdzczeEVVTHV0eGFWVUZuZUhORXJqdGpPZkRTSmhhaW9pSXJudHdiL0FPZi9BQVZmN2dCc0kwc0JxaFI1SUZocFAwWkEyU2p5UUxEU2ZveUJzb29WcnB2c2o4NXBZeDZPaWVzcFFzeDVsZU5VS1BKQXNOSitqSUd5VWVTQllhVDlHUU5rclhUZlpINXpSNk9pZXNwUXN4NWxlTlVLUEpBc05KK2pJR3lVZVNCWWFUOUdRTmtyWFRmWkg1elI2T2llc3BRc3g1bGVOVUtQSkFzTkoraklHeVVlU0JZYVQ5R1FOa3JYVGZaSDV6UjZPaWVzcFFzeDVsZU5VS1BKQXNOSitqSUd5VWVTQllhVDlHUU5rclhUZlpINXpSNk9pZXNwUXN4NWxlTlVLUEpBc05KK2pJR3lVZVNCWWFUOUdRTmtyWFRmWkg1elI2T2llc3BRc3g1bGVOVUtQSkFzTkoraklHeVVlU0JZYVQ5R1FOa3JYVGZaSDV6UjZPaWVzcFFzeDVsZU5VS1BKQXNOSitqSUd5VWVTQllhVDlHUU5rclhUZlpINXpSNk9pZXNwUXN4NWxlTlVLUEpBc05KK2pJR3lVZVNCWWFUOUdRTmtyWFRmWkg1elI2T2llc3BRc3g1bGVOVUtQSkFzTkoraklHeVVlU0JZYVQ5R1FOa3JYVGZaSDV6UjZPaWVzcFFzeDVsZU5VS1BKQXNOSitqSUd5VWVTQllhVDlHUU5rclhUZlpINXpSNk9pZXNwUXN4NWxlTlVLUEpBc05KK2pJR3lVZVNCWWFUOUdRTmtyWFRmWkg1elI2T2llc3BRc3g1bGVOVUtQSkFzTkoraklHeVVlU0JZYVQ5R1FOa3JYVGZaSDV6UjZPaWVzcFFzeDVsZU5VS1BKQXNOSitqSUd5VWVTQllhVDlHUU5rclhUZlpINXpSNk9pZXNwUXN4NWxlUGZ1VWJpYkUrSTUzeFhnbUpjVll0eFBndDlpcUZFdm9XQ3dMMkZlWDEvZGpScmwyK3UzdDdjdVhPZm11WExuUC9hNDhCU09vcFNGazdUZEJuR0cxV3RpcGhSRjlhRUhMb3RDNHRIWjhsTXh4bm85OEIyeFZ5SXFJdnEzMFJkLzh3QXlFd29Pd3llZFA1Rzc0d0wxN3h4N3NNbm5UK1J1K01DOWU4ZU5TUDJmSCtCM1ZVeWlnL3RxUjhiRDY2R3FBQ29nNldBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBeXZ5aDlQNTU3NHczMTc5eDdzTW9mVCtlZStNTjllL2NldDNvNTdQZ2ZBM3FvYzA5T1BiVXM0MkoxMUFEMlRGellBQlRlZFFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBUi93QXE3N0M4ZCtCSDZ3T1ZkOWhlTy9BajlaWmUvd0NLTWs1VHRYbEQ5K2IrSlU1Y2orM2hBQnVRaSthUVpCT3FhVlBGZTVpdllIaitRVHFtbFR4WHVZcjJCVkRkRnhobC9IUmV1NDZNTGlHSmN6L0t5ZnNtQUJocHRBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQThmeTk5VTAxK0Y5ekNadnRJTXZmVk5OZmhmY3dtYjZmVjZ2aTlHNDUzVWhsTi9sRE1kSkw4cXp0WTRBU1dJSG13QUNtODZnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQWcvbFE5UDhBRkhjOEwxNHliMUljcUhwL2lqdWVGNjhaTjYwVzQ1aXhJdmdUNnFjKzk4OWovT3ZHcjlFQURaWm9jT3d5ZWRQNUc3NHdMMTd4eDdzTW5uVCtSdStNQzllOGVOU1AyZkgrQjNWVXlpZy90cVI4YkQ2NkdxQUNvZzZXQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQXl2eWg5UDU1NzR3MzE3OXg3c01vZlQrZWUrTU45ZS9jZXQzbzU3UGdmQTNxb2MwOU9QYlVzNDJKMTFBRDJURnpZQUJUZWRRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQVIveXJ2c0x4MzRFZnJBNVYzMkY0NzhDUDFsbDcvaWpKT1U3VjVRL2ZtL2lWT1hJL3Q0UUFia0l2bWtHUVRxbWxUeFh1WXIyQjQva0U2cHBVOFY3bUs5Z1ZRM1JjWVpmeDBYcnVPakM0aGlYTS95c243SmdBWWFiUUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFQSDh2ZlZOTmZoZmN3bWI3U0RMMzFUVFg0WDNNSm0rbjFlcjR2UnVPZDFJWlRmNVF6SFNTL0tzN1dPQUVsaUI1c0FBcHZPb0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFJUDVVUFQvRkhjOEwxNHliMUljcUhwL2lqdWVGNjhaTjYwVzQ1aXhJdmdUNnFjKzk4OWovT3ZHcjlFQURaWm9jT3d5ZWRQNUc3NHdMMTd4eDdzTW5uVCtSdStNQzllOGVOU1AyZkgrQjNWVXlpZy90cVI4YkQ2NkdxQUNvZzZXQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQXl2eWg5UDU1NzR3MzE3OXg3c01vZlQrZWUrTU45ZS9jZXQzbzU3UGdmQTNxb2MwOU9QYlVzNDJKMTFBRDJURnpZQUJUZWRRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQVIvd0FxNzdDOGQrQkg2d09WZDloZU8vQWo5WlplL3dDS01rNVR0WGxEOStiK0pVNWNqKzNoQUJ1UWkrYVFaQk9xYVZQRmU1aXZZSGorUVRxbWxUeFh1WXIyQlZEZEZ4aGwvSFJldTQ2TUxpR0pjei9LeWZzbUFCaHB0QUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUE4Znk5OVUwMStGOXpDWnZ0SU12ZlZOTmZoZmN3bWI2ZlY2dmk5RzQ1M1VobE4vbERNZEpMOHF6dFk0QVNXSUhtd0FDbTg2Z0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFnL2xROVA4QUZIYzhMMTR5YjFJY3FIcC9panVlRjY4Wk42MFc0NWl4SXZnVDZxYys5ODlqL092R3I5RUFEWlpvY093eWVkUDVHNzR3TDE3eHg3c01ublQrUnUrTUM5ZThlTlNQMmZIK0IzVlV5aWcvdHFSOGJENjZHcUFDb2c2V0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUF5dnloOVA1NTc0dzMxNzl4N3NNb2ZUK2VlK01OOWUvY2V0M281N1BnZkEzcW9jMDlPUGJVczQySjExQUQyVEZ6WUFCVGVkUUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFSL3lydnNMeDM0RWZyQTVWMzJGNDc4Q1AxbGw3L2lqSk9VN1Y1US9mbS9pVk9YSS90NFFBYmtJdm1rR1FUcW1sVHhYdVlyMkI0L2tFNnBwVThWN21LOWdWUTNSY1laZngwWHJ1T2pDNGhpWE0veXNuN0pnQVlhYlFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBUEg4dmZWTk5maGZjd21iN1NETDMxVFRYNFgzTUptK24xZXI0dlJ1T2QxSVpUZjVRekhTUy9LczdXT0FFbGlCNXNBQXB2T29BQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBSVA1VVBUL0ZIYzhMMTR5YjFJY3FIcC9panVlRjY4Wk42MFc0NWl4SXZnVDZxYys5ODlqL092R3I5RUFEWlpvY093eWVkUDVHNzR3TDE3eHg3c01ublQrUnUrTUM5ZThlTlNQMmZIK0IzVlV5aWcvdHFSOGJENjZHcUFDb2c2V0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUF5dnloOVA1NTc0dzMxNzl4N3NNb2ZUK2VlK01OOWUvY2V0M281N1BnZkEzcW9jMDlPUGJVczQySjExQUQyVEZ6WUFCVGVkUUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFSL3dBcTc3QzhkK0JINndPVmQ5aGVPL0FqOVpaZS93Q0tNazVUdFhsRDkrYitKVTVjaiszaEFCdVFpK2FRWkJPcWFWUEZlNWl2WUhqK1FUcW1sVHhYdVlyMkJWRGRGeGhsL0hSZXU0Nk1MaUdKY3ovS3lmc21BQmhwdEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBOGZ5OTlVMDErRjl6Q1p2dElNdmZWTk5maGZjd21iNmZWNnZpOUc0NTNVaGxOL2xETWRKTDhxenRZNEFTV0lIbXdBQ204NmdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBZy9sUTlQOEFGSGM4TDE0eWIxSWNxSHAvaWp1ZUY2OFpONjBXNDVpeEl2Z1Q2cWMrOTg5ai9PdkdyOUVBRFpab2NPd3llZFA1Rzc0d0wxN3h4N3NNbm5UK1J1K01DOWU4ZU5TUDJmSCtCM1ZVeWlnL3RxUjhiRDY2R3FBQ29nNldBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBeXZ5aDlQNTU3NHczMTc5eDdzTW9mVCtlZStNTjllL2NldDNvNTdQZ2ZBM3FvYzA5T1BiVXM0MkoxMUFEMlRGellBQlRlZFFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBUi95cnZzTHgzNEVmckE1VjMyRjQ3OENQMWxsNy9pakpPVTdWNVEvZm0vaVZPWEkvdDRRQWJrSXZta0dRVHFtbFR4WHVZcjJCNC9rRTZwcFU4VjdtSzlnVlEzUmNZWmZ4MFhydU9qQzRoaVhNL3lzbjdKZ0FZYWJRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQVBIOHZmVk5OZmhmY3dtYjdTREwzMVRUWDRYM01KbStuMWVyNHZSdU9kMUlaVGY1UXpIU1MvS3M3V09BRWxpQjVzQUFwdk9vQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUlQNVVQVC9GSGM4TDE0eWIxSWNxSHAvaWp1ZUY2OFpONjBXNDVpeEl2Z1Q2cWMrOTg5ai9PdkdyOUVBRFpab2NQMndmQ01Jd1BDSUdGNEpIallMaFVLL3ZZa0tMRHZydDdmdzcrNWQ1N2w5ZTMxei9XNWR1WGJseTdjdTNINGo4dWFpcGdYZlEvY09JNXJrYzFjQ29kaFNIUDl1WncwbkgyaWtPZjdjemhwT1B0T1BIa2JYSnY0Qm1hM1VaTHQ0bnEyUmVrZnJPd3BEbiszTTRhVGo3UlNIUDl1WncwbkgybkhodGNtL2dHWnJkUTI4VDFiSXZTUDFuWVVoei9BRzVuRFNjZmFLUTUvdHpPR2s0KzA0OE5yazM4QXpOYnFHM2llclpGNlIrczdDa09mN2N6aHBPUHRGSWMvd0J1WncwbkgybkhodGNtL2dHWnJkUTI4VDFiSXZTUDFuWVVoei9ibWNOSng5b3BEbiszTTRhVGo3VGp3MnVUZndETTF1b2JlSjZ0a1hwSDZ6c0tRNS90ek9HazQrMFVoei9ibWNOSng5cHg0YlhKdjRCbWEzVU52RTlXeUwwajlaMkZJYy8yNW5EU2NmYUtRNS90ek9HazQrMDQ4TnJrMzhBek5icUczaWVyWkY2UitzN0NrT2Y3Y3pocE9QdEZJYy8yNW5EU2NmYWNlRzF5YitBWm10MURieFBWc2k5SS9XZGhTSFA5dVp3MG5IMmlrT2Y3Y3pocE9QdE9QRGE1Ti9BTXpXNmh0NG5xMlJla2ZyT3dwRG4rM000YVRqN1JTSFA5dVp3MG5IMm5IaHRjbS9nR1pyZFEyOFQxYkl2U1AxbllVaHovQUc1bkRTY2ZhS1E1L3R6T0drNCswNDhOcmszOEF6TmJxRzNpZXJaRjZSK3M3Q2tPZjdjemhwT1B0RkljL3dCdVp3MG5IMm5IaHRjbS9nR1pyZFEyOFQxYkl2U1AxbllVaHovYm1jTkp4OW9wRG4rM000YVRqN1RqdzJ1VGZ3RE0xdW9iZUo2dGtYcEg2enNLUTUvdHpPR2s0KzBVaHovYm1jTkp4OXB4NGJYSnY0Qm1hM1VOdkU5V3lMMGo5WisyRVlSaEdHWVJId3ZDNDhiQ3NLaTM5OUVpeFlsOWR2citKZjNidlBkdnI2K3Uvd0N0MjdkdTNidDI3ZHV2eEI2N1dvMU5pM2VSREdva1J6bks1eTRWVUFQMGZnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUE2cVJjSHdmREozazdCTUxnUWNLd1dMalhCSWNXRkV2Ymw5ZVJMeTdHdmJsMjl2cjI3L3BkdVhibDI3Y3UzTHI1SmZLMGs4QjhkeVlVWWlyekpoUFNtZWJuU3lWd3BJMWNDeEhOYmgvaHNsUk1QL3B5bzFRbzhrQ3cwbjZNZ2JKUjVJRmhwUDBaQTJVVzYxMDMyUitjMHNHOUhSUFdVb1dZOHl2R3FGSGtnV0drL1JrRFpLUEpBc05KK2pJR3lWcnB2c2o4NW85SFJQV1VvV1k4eXZHcUZIa2dXR2svUmtEWktQSkFzTkoraklHeVZycHZzajg1bzlIUlBXVW9XWTh5dkdxRkhrZ1dHay9Sa0RaS1BKQXNOSitqSUd5VnJwdnNqODVvOUhSUFdVb1dZOHl2R3FGSGtnV0drL1JrRFpLUEpBc05KK2pJR3lWcnB2c2o4NW85SFJQV1VvV1k4eXZHcUZIa2dXR2svUmtEWktQSkFzTkoraklHeVZycHZzajg1bzlIUlBXVW9XWTh5dkdxRkhrZ1dHay9Sa0RaWlh0cjNNTHE4bnBSNS93QXhCZEQ4enNjT0ZVWERzdGw2c0g4TmovNlJ6dS8zdWN0b0IvcFA5WktXUnY4QVUrY3diRkZUQjV2WVljT0grT3pUQi9RQU5zRWN3TDh5SnliS0dOY21NczRmalNWWmJ4bGg4VDZqNWtmQ01CaFJJbC96WVJFdVhPZSt2cjI3ZHU4MXk1Y3VmNHVYSHFsSGtnV0drL1JrRFpSbW42K1prTWdsMGFRdmtyM0xDZTVpcWlwZ1ZXcXFZZjc0Q2V0RHJ3dWQ1NG1pU3p2Q2w4TnJaUkRaRVJGYTdDaVBhamtSZi9xWWNCbGVOVUtQSkFzTkoraklHeVVlU0JZYVQ5R1FObDVOYTZiN0kvT2FaSDZPaWVzcFFzeDVsZU5VS1BKQXNOSitqSUd5VWVTQllhVDlHUU5rclhUZlpINXpSNk9pZXNwUXN4NWxlTlVLUEpBc05KK2pJR3lVZVNCWWFUOUdRTmtyWFRmWkg1elI2T2llc3BRc3g1bGVOVUtQSkFzTkoraklHeVVlU0JZYVQ5R1FOa3JYVGZaSDV6UjZPaWVzcFFzeDVsZU5VS1BKQXNOSitqSUd5VWVTQllhVDlHUU5rclhUZlpINXpSNk9pZXNwUXN4NWxlTlVLUEpBc05KK2pJR3lVZVNCWWFUOUdRTmtyWFRmWkg1elI2T2llc3BRc3g1bGVOVUtQSkFzTkoraklHeVVlU0JZYVQ5R1FOa3JYVGZaSDV6UjZPaWVzcFFzeDVsZU5VS1BKQXNOSitqSUd5VWVTQllhVDlHUU5rclhUZlpINXpSNk9pZXNwUXN4NWxlTlVLUEpBc05KK2pJR3lVZVNCWWFUOUdRTmtyWFRmWkg1elI2T2llc3BRc3g1bGVOVUtQSkFzTkoraklHeVVlU0JZYVQ5R1FOa3JYVGZaSDV6UjZPaWVzcFFzeDVsZU5VS1BKQXNOSitqSUd5VWVTQllhVDlHUU5rclhUZlpINXpSNk9pZXNwUXN4NWxlTlVLUEpBc05KK2pJR3lVZVNCWWFUOUdRTmtyWFRmWkg1elI2T2llc3BRc3g1bGVOVUtQSkFzTkoraklHeVVlU0JZYVQ5R1FOa3JYVGZaSDV6UjZPaWVzcFFzeDVsZUw4eTJTYktHS3NtTXpZZml1VlpieGJoOFA2ZjVjZkI4QmhRNGw1ejRSRHVYZWErdmIyNWR1Yzl5N2R1ZjR1M1VCdDIzTnJvTUdrc2hmTG9FTllhTmVyTUNxaXJoUkdyaDN2aUlvWGRiaTBxb0xPOE9hSlhIYkdjK0drVEMxRlJFUlhQYmczL3dBLytDci9BSEFEWVJwWUNxT1RQTDJJTWZmeHIrdVlqeFBqcjVYMGZ5dnE4R3ZJM3l1ZjUzUDhQeFhMdk56L0FBM09mbS9uelhGVVVlU0JZYVQ5R1FObEh5bkY4SEk1am5TTE5jV1R1ZTZIc2Q5RlJFWFpOUjM1L3dCY0JOSzVMZVhUcFMyajhucEJKNWJEaE1qYlBBMXpYS3FiQjdtYjZwdmI2dHcvM01yeHFoUjVJRmhwUDBaQTJTanlRTERTZm95QnNzVHJYVGZaSDV6VFkzbzZKNnlsQ3pIbVY0MVFvOGtDdzBuNk1nYkpSNUlGaHBQMFpBMlN0ZE45a2ZuTkhvNko2eWxDekhtVjQxUW84a0N3MG42TWdiSlI1SUZocFAwWkEyU3RkTjlrZm5OSG82SjZ5bEN6SG1WNDFRbzhrQ3cwbjZNZ2JKUjVJRmhwUDBaQTJTdGROOWtmbk5IbzZKNnlsQ3pIbVY0MVFvOGtDdzBuNk1nYkpSNUlGaHBQMFpBMlN0ZE45a2ZuTkhvNko2eWxDekhtVjQxUW84a0N3MG42TWdiSlI1SUZocFAwWkEyU3RkTjlrZm5OSG82SjZ5bEN6SG1WNDFRbzhrQ3cwbjZNZ2JKUjVJRmhwUDBaQTJTdGROOWtmbk5IbzZKNnlsQ3pIbVY0MVFvOGtDdzBuNk1nYkpSNUlGaHBQMFpBMlN0ZE45a2ZuTkhvNko2eWxDekhtVjQxUW84a0N3MG42TWdiSlI1SUZocFAwWkEyU3RkTjlrZm5OSG82SjZ5bEN6SG1WNDFRbzhrQ3cwbjZNZ2JKUjVJRmhwUDBaQTJTdGROOWtmbk5IbzZKNnlsQ3pIbVY0MVFvOGtDdzBuNk1nYkpSNUlGaHBQMFpBMlN0ZE45a2ZuTkhvNko2eWxDekhtVjQxUW84a0N3MG42TWdiSlI1SUZocFAwWkEyU3RkTjlrZm5OSG82SjZ5bEN6SG1WNDFRbzhrQ3cwbjZNZ2JKUjVJRmhwUDBaQTJTdGROOWtmbk5IbzZKNnlsQ3pIbVY0MVFvOGtDdzBuNk1nYkxLOXRlNWhkWGs5S1BQK1lndWgrWjJPSENxTGgyV3k5V0QrR3gvd0RTT2QzKzl6bHRBUDhBU2Y2eVVzamY2bnptRFlvcVlQTjdERGh3L3dBZG1tRCtnQWJZSTVnZXFaRThYWXZ4cmxPbG5BTWFZRGdlTXNBaWZVZk1nWVJDdllrTy93Q2JCNGwyNXozdDljdTNMdk5kdVhMditibHhmbEhrZ1dHay9Sa0RaYVN1azNiWkxScVhNa01lQTZJcm1JL0Npb2lZRlZ5WU4vNFNWOXdxOVJuQ25VMFJKM2trclpCYXlJc1BBNXJsVlZSckhZZDc4djhBbWlmMk1yeHFoUjVJRmhwUDBaQTJTanlRTERTZm95QnN0ZTFycHZzajg1cHVuMGRFOVpTaFpqeks4YW9VZVNCWWFUOUdRTmtvOGtDdzBuNk1nYkpXdW0reVB6bWowZEU5WlNoWmp6Szhhb1VlU0JZYVQ5R1FOa284a0N3MG42TWdiSld1bSt5UHptajBkRTlaU2haanpLOGFvVWVTQllhVDlHUU5rbzhrQ3cwbjZNZ2JKV3VtK3lQem1qMGRFOVpTaFpqeks4YW9VZVNCWWFUOUdRTmtvOGtDdzBuNk1nYkpXdW0reVB6bWowZEU5WlNoWmp6Szhhb1VlU0JZYVQ5R1FOa284a0N3MG42TWdiSld1bSt5UHptajBkRTlaU2haanpLOGFvVWVTQllhVDlHUU5rbzhrQ3cwbjZNZ2JKV3VtK3lQem1qMGRFOVpTaFpqeks4YW9VZVNCWWFUOUdRTmtvOGtDdzBuNk1nYkpXdW0reVB6bWowZEU5WlNoWmp6Szhhb1VlU0JZYVQ5R1FOa284a0N3MG42TWdiSld1bSt5UHptajBkRTlaU2haanpLOGFvVWVTQllhVDlHUU5rbzhrQ3cwbjZNZ2JKV3VtK3lQem1qMGRFOVpTaFpqeks4YW9VZVNCWWFUOUdRTmtvOGtDdzBuNk1nYkpXdW0reVB6bWowZEU5WlNoWmp6Szhhb1VlU0JZYVQ5R1FOa284a0N3MG42TWdiSld1bSt5UHptajBkRTlaU2haanpLOGFvVWVTQllhVDlHUU5rbzhrQ3cwbjZNZ2JKV3VtK3lQem1qMGRFOVpTaFpqeks4YW9VZVNCWWFUOUdRTmxGdktOeE5pZkVjNzRyd1RFdUtzVzRud1creFZDaVgwTEJZRjdDdkw2L3V4bzF5N2ZYYjI5dVhMblB6WExsem4vdGNadmMrdThTU2tFNHBOMEdUdVk1VVZjS3FpcHZmME5VWGFMeitjcUZ6RzZmSlZMR1JXSTVyZGkxcmtYL0FKTDY4SzcyOGVBZ044RVBnS281TTh2WWd4OS9HdjY1aVBFK092bGZSL0srcndhOGpmSzUvbmMvdy9GY3U4M1A4TnpuNXY1ODF4VkZIa2dXR2svUmtEWlI4cHhmQnlPWTUwaXpYRms3bnVoN0hmUlVSRjJUVWQrZjljQk5LNUxlWFRwUzJqOG5wQko1YkRoTWpiUEExelhLcWJCN21iNnB2YjZ0dy8zTXJ4cWhSNUlGaHBQMFpBMlNqeVFMRFNmb3lCc3NUclhUZlpINXpUWTNvNko2eWxDekhtVjQxUW84a0N3MG42TWdiSlI1SUZocFAwWkEyU3RkTjlrZm5OSG82SjZ5bEN6SG1WNDFRbzhrQ3cwbjZNZ2JKUjVJRmhwUDBaQTJTdGROOWtmbk5IbzZKNnlsQ3pIbVY0MVFvOGtDdzBuNk1nYkpSNUlGaHBQMFpBMlN0ZE45a2ZuTkhvNko2eWxDekhtVjQxUW84a0N3MG42TWdiSlI1SUZocFAwWkEyU3RkTjlrZm5OSG82SjZ5bEN6SG1WNDkrNVJ1SnNUNGpuZkZlQ1lseFZpM0UrQzMyS29VUytoWUxBdllWNWZYOTJOR3VYYjY3ZTN0eTVjNSthNWN1Yy85cmp3Rkk2aWxJV1R0TjBHY1liVmEyS21GRVgxb1FjdWkwTGkwZG55VXpIR2VqM3dIYkZYSWlvaStyZlJGMy96QURJVENnN0RKNTAva2J2akF2WHZISHV3eWVkUDVHNzR3TDE3eDQxSS9aOGY0SGRWVEtLRCsycEh4c1Byb2FvQUtpRHBZQUFBQUFBQUFBQUFBTWYyd0RIOU1pOUs5NGNsOTBxLzhwRjdtL1UvWUFDWkJWK2FRWkJPcWFWUEZlNWl2WUhqK1FUcW1sVHhYdVlyMkJWRGRGeGhsL0hSZXU0Nk1MaUdKY3ovQUNzbjdKZ0FZYWJRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQVBIOHZmVk5OZmhmY3dtYjdTREwzMVRUWDRYM01KbStuMWVyNHZSdU9kMUlaVGY1UXpIU1MvS3M3V09BRWxpQjVZSEpSKy9mQS9uV0FqL2tvL2Z2Z2Z6ckFWcDN3R04wcjVQc21GOEY1bCtHczI4dCs0aWdCcHNsQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFHUDdZQmorbVJlbGU4T1MrNlZmK1VpOXpmcWZzQUJNZ3EvUFlNZ25XektuaXZiUldrRE4vSUoxc3lwNHIyMFZwQWdMZlVZd3dlSmIxNGhjaDVQUEV1VmZOUDdLQUFFYVNlQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFRZnlvZW4rS081NFhyeGw0SVA1VVBUL0ZIYzhMMTR6ZnQ3WGpPejRIL1JDRzkvYmlCRTQyRjlWSnZBV0psSTVZSEpSKy9mQS9uV0FqL2tvL2Z2Z2Z6ckFWcDN3R04wcjVQc21GOEY1bCtHczI4dCs0aWdCcHNsQUFBQUFBQUFBQUVIOHFIcC9panVlRjY4Wk42a09WRDAvd0FVZHp3dlhqSnZXaTNITVdKRjhDZlZUbjN2bnNmNTE0MWZvZ0FiTE5EaDJHVHpwL0kzZkdCZXZlT1BkaGs4NmZ5TjN4Z1hyM2p4cVIrejQvd082cW1VVUg5dFNQallmWFExUUFWRUhTd0FBQUFBQUFBQUFBQVkvdGdHUDZaRjZWN3c1TDdwVi81U0wzTitwK3dBRXlDcjgwZ3lDZFUwcWVLOXpGZXdQSDhnblZOS25pdmN4WHNDcUc2TGpETCtPaTlkeDBZWEVNUzVuK1ZrL1pNQUREVGFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQjQvbDc2cHByOEw3bUV6ZmFRWmUrcWFhL0MrNWhNMzArcjFmRjZOeHp1cERLYi9LR1k2U1g1Vm5heHdBa3NRUExBNUtQMzc0SDg2d0VmOEFKUisvZkEvbldBclR2Z01icFh5ZlpNTDRMekw4Tlp0NWI5eEZBRFRaS0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBTWYyd0RIOU1pOUs5NGNsOTBxL3dES1JlNXYxUDJBQW1RVmZuc0dRVHJabFR4WHRvclNCbS9rRTYyWlU4VjdhSzBnUUZ2cU1ZWVBFdDY4UXVROG5uaVhLdm1uOWxBQUNOSlBBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUlQNVVQVC9BQlIzUEM5ZU12QkIvS2g2ZjRvN25oZXZHYjl2YThaMmZBLzZJUTN2N2NRSW5Hd3ZxcE40Q3hNcEhMQTVLUDM3NEg4NndFZjhsSDc5OEQrZFlDdE8rQXh1bGZKOWt3dmd2TXZ3MW0zbHYzRVVBTk5rb0FBQUFBQUFBQUFnL2xROVA4VWR6d3ZYakp2VWh5b2VuK0tPNTRYcnhrM3JSYmptTEVpK0JQcXB6NzN6MlA4QU92R3I5RUFEWlpvY093eWVkUDVHNzR3TDE3eHg3c01ublQrUnUrTUM5ZThlTlNQMmZIK0IzVlV5aWcvdHFSOGJENjZHcUFDb2c2V0FBQUFBQUFBQUFBQURIOXNBeC9USXZTdmVISmZkS3Y4QXlrWHViOVQ5Z0FKa0ZYNXBCa0U2cHBVOFY3bUs5Z2VQNUJPcWFWUEZlNWl2WUZVTjBYR0dYOGRGNjdqb3d1SVlselA4ckoreVlBR0dtMEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFEeC9MMzFUVFg0WDNNSm0rMGd5OTlVMDErRjl6Q1p2cDlYcStMMGJqbmRTR1UzK1VNeDBrdnlyTzFqZ0JKWWdlV0J5VWZ2M3dQNTFnSS81S1AzNzRIODZ3RmFkOEJqZEsrVDdKaGZCZVpmaHJOdkxmdUlvQWFiSlFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQmorMkFZL3BrWHBYdkRrdnVsWC9sSXZjMzZuN0FBVElLdnoyRElKMXN5cDRyMjBWcEF6ZnlDZGJNcWVLOXRGYVFJQzMxR01NSGlXOWVJWEllVHp4TGxYelQreWdBQkdrbmdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBRUg4cUhwL2lqdWVGNjhaZUNEK1ZEMC94UjNQQzllTTM3ZTE0enMrQi93QkVJYjM5dUlFVGpZWDFVbThCWW1VamxnY2xINzk4RCtkWUNQOEFrby9mdmdmenJBVnAzd0dOMHI1UHNtRjhGNWwrR3MyOHQrNGlnQnBzbEFBQUFBQUFBQUFFSDhxSHAvaWp1ZUY2OFpONmtPVkQwL3hSM1BDOWVNbTlhTGNjeFlrWHdKOVZPZmUrZXgvblhqVitpQUJzczBPSFlaUE9uOGpkOFlGNjk0NDkyR1R6cC9JM2ZHQmV2ZVBHcEg3UGovQTdxcVpSUWYyMUkrTmg5ZERWQUJVUWRMQUFBQUFBQUFBQUFBQmorMkFZL3BrWHBYdkRrdnVsWC9sSXZjMzZuN0FBVElLdnpTRElKMVRTcDRyM01WN0E4ZnlDZFUwcWVLOXpGZXdLb2JvdU1NdjQ2TDEzSFJoY1F4TG1mNVdUOWt3QU1OTm9BQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBSGorWHZxbW12d3Z1WVROOXBCbDc2cHByOEw3bUV6ZlQ2dlY4WG8zSE82a01wdjhBS0dZNlNYNVZuYXh3QWtzUVBMQTVLUDM3NEg4NndFZjhsSDc5OEQrZFlDdE8rQXh1bGZKOWt3dmd2TXZ3MW0zbHYzRVVBTk5rb0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBeC9iQU1mMHlMMHIzaHlYM1NyL3dBcEY3bS9VL1lBQ1pCVitld1pCT3RtVlBGZTJpdElHYitRVHJabFR4WHRvclNCQVcrb3hoZzhTM3J4QzVEeWVlSmNxK2FmMlVBQUkwazhBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQWcvbFE5UDhVZHp3dlhqTHdRZnlvZW4rS081NFhyeG0vYjJ2R2Rud1AraUVONyszRUNKeHNMNnFUZUFzVEtSeXdPU2o5KytCL09zQkgvSlIrL2ZBL25XQXJUdmdNYnBYeWZaTUw0THpMOE5adDViOXhGQURUWktBQUFBQUFBQUFBSVA1VVBUL0FCUjNQQzllTW05U0hLaDZmNG83bmhldkdUZXRGdU9Zc1NMNEUrcW5QdmZQWS96cnhxL1JBQTJXYUhEc01ublQrUnUrTUM5ZThjZTdESjUwL2tidmpBdlh2SGpVajlueC9nZDFWTW9vUDdha2ZHdyt1aHFnQXFJT2xnQUFBQUFBQUFBQUFBeC9iQU1mMHlMMHIzaHlYM1NyL3dBcEY3bS9VL1lBQ1pCVithUVpCT3FhVlBGZTVpdllIaitRVHFtbFR4WHVZcjJCVkRkRnhobC9IUmV1NDZNTGlHSmN6L0t5ZnNtQUJocHRBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQThmeTk5VTAxK0Y5ekNadnRJTXZmVk5OZmhmY3dtYjZmVjZ2aTlHNDUzVWhsTi9sRE1kSkw4cXp0WTRBU1dJSGxnY2xINzk4RCtkWUNQOEFrby9mdmdmenJBVnAzd0dOMHI1UHNtRjhGNWwrR3MyOHQrNGlnQnBzbEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBR1A3WUJqK21SZWxlOE9TKzZWZitVaTl6ZnFmc0FCTWdxL1BZTWduV3pLbml2YlJXa0ROL0lKMXN5cDRyMjBWcEFnTGZVWXd3ZUpiMTRoY2g1UFBFdVZmTlA3S0FBRWFTZUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBUWZ5b2VuK0tPNTRYcnhsNElQNVVQVC9GSGM4TDE0emZ0N1hqT3o0SC9SQ0c5L2JpQkU0MkY5Vkp2QVdKbEk1WUhKUisvZkEvbldBai9rby9mdmdmenJBVnAzd0dOMHI1UHNtRjhGNWwrR3MyOHQrNGlnQnBzbEFBQUFBQUFBQUFFSDhxSHAvaWp1ZUY2OFpONmtPVkQwL3hSM1BDOWVNbTlhTGNjeFlrWHdKOVZPZmUrZXgvblhqVitpQUJzczBPSFlaUE9uOGpkOFlGNjk0NDkxVWk0UmcrQnp2SjJGNFhIZzRMZ3NMR3VDUklzV0pmWEwyOGgzbHlOZTNidDlmWDEzL1M1Y3VYTGwyN2R1M1hrVWhhcnBCSGEzZlZXTzZxbVRVTGlOYlBNa2M1Y0NKRmg5ZERWWWNmU0hJRnVaUDBuQTJpa09RTGN5ZnBPQnRLbjlyazRjQS9OZHFPakxieE10c2hkSXpXZGdPUHBEa0MzTW42VGdiUlNISUZ1WlAwbkEyamE1T0hBUHpYYWh0NG1XMlF1a1pyT3dISDBoeUJibVQ5SndOb3BEa0MzTW42VGdiUnRjbkRnSDVydFEyOFRMYklYU00xbllEajZRNUF0ekorazRHMFVoeUJibVQ5SndObzJ1VGh3RDgxMm9iZUpsdGtMcEdhenNCeDlJY2dXNWsvU2NEYUtRNUF0ekorazRHMGJYSnc0QithN1VOdkV5MnlGMGpOWjJBNCtrT1FMY3lmcE9CdEZJY2dXNWsvU2NEYU5yazRjQS9OZHFHM2laYlpDNlJtczdCaisxUXBEa0MzTW42VGdiVEs5THU5Vm02VVNmOEExL240Ym1ZZk5ZTUtLbUgvQVBUMVlTdFB5aUUrU0tXLzdQOEE2T015SnNmOVJoMkxrZGd3K1l3WWNDcmd3NEZ3ZjBBQ1hoV21hUVpCT3FhVlBGZTVpdllFOTVFNXlsREZXVEdXY0F4cE5VdDR0dytIOVI4eUJoR0hRb2NTODU4SWlYYm5QZTMxOWN1M09lNWR1WGY4WGJqMVNrT1FMY3lmcE9CdEt0N29Nd3k1OC95NTdJTDFSWTBWVVZHcmdWTm03LzRkQnR4ZW1NMFFxSFRUQ2l5cUcxelpOQVJVVjdVVkZTRXpDaXBoM2xRN0FjZlNISUZ1WlAwbkEyaWtPUUxjeWZwT0J0TVEydVRod0Q4MTJvMlh0NG1XMlF1a1pyT3dISDBoeUJibVQ5SndOb3BEa0MzTW42VGdiUnRjbkRnSDVydFEyOFRMYklYU00xbllEajZRNUF0ekorazRHMFVoeUJibVQ5SndObzJ1VGh3RDgxMm9iZUpsdGtMcEdhenNCeDlJY2dXNWsvU2NEYUtRNUF0ekorazRHMGJYSnc0QithN1VOdkV5MnlGMGpOWjJBNCtrT1FMY3lmcE9CdEZJY2dXNWsvU2NEYU5yazRjQS9OZHFHM2laYlpDNlJtczdBY2ZTSElGdVpQMG5BMmlrT1FMY3lmcE9CdEcxeWNPQWZtdTFEYnhNdHNoZEl6V2RnT1BwRGtDM01uNlRnYlJTSElGdVpQMG5BMmphNU9IQVB6WGFodDRtVzJRdWtack93SEgwaHlCYm1UOUp3Tm9wRGtDM01uNlRnYlJ0Y25EZ0g1cnRRMjhUTGJJWFNNMW5ZRGo2UTVBdHpKK2s0RzBVaHlCYm1UOUp3Tm8ydVRod0Q4MTJvYmVKbHRrTHBHYXpzQng5SWNnVzVrL1NjRGFLUTVBdHpKK2s0RzBiWEp3NEIrYTdVTnZFeTJ5RjBqTloyQTQra09RTGN5ZnBPQnRGSWNnVzVrL1NjRGFOcms0Y0EvTmRxRzNpWmJaQzZSbXM3QWNmU0hJRnVaUDBuQTJpa09RTGN5ZnBPQnRHMXljT0FmbXUxRGJ4TXRzaGRJeldkZ09QcERrQzNNbjZUZ2JSU0hJRnVaUDBuQTJqYTVPSEFQelhhaHQ0bVcyUXVrWnJPUHk5OVUwMStGOXpDWnZyOHkyVGxLR05jbU16WUJpdWFwYnhsaDhUNmY1Y0RCOE9oUklsL3dBMkVRN3QzbXZiMit1M2J2TmN1WGJ2K0xsMUFhZFY3RklvMENZSXpJN0Zhdm5uTGdWRlJjR3doL3hLaUwvdWRaTExLWXlhTEpJallqVWt6RXd0VkhKaDg3RzNzS0t1L3ZvQUVqU0R4WUhKUisvZkEvbldBaWZrenpEaURFUDhhL3JtUE1UNGwrYjlIOHI2dkNieUQ4M20rZHovQUEvRmR1Yy9OOFZ6bjV2NWM5eFZGSWNnVzVrL1NjRGFWelhlSmxsa2FsY3JpUW9Mbk5YemUralZWUDhBODJmbWlGNFY1L1NxYTVOYzZtNkRLSlREWTlQUFlVYzlxS21HUEZYZlJWdytyZk93SEgwaHlCYm1UOUp3Tm9wRGtDM01uNlRnYlRVTzF5Y09BZm11MUVsdHZFeTJ5RjBqTloyQTQra09RTGN5ZnBPQnRGSWNnVzVrL1NjRGFOcms0Y0EvTmRxRzNpWmJaQzZSbXM3QWNmU0hJRnVaUDBuQTJpa09RTGN5ZnBPQnRHMXljT0FmbXUxRGJ4TXRzaGRJeldkZ09QcERrQzNNbjZUZ2JSU0hJRnVaUDBuQTJqYTVPSEFQelhhaHQ0bVcyUXVrWnJPd0hIMGh5QmJtVDlKd05vcERrQzNNbjZUZ2JSdGNuRGdINXJ0UTI4VExiSVhTTTFuWURqNlE1QXR6SitrNEcwVWh5QmJtVDlKd05vMnVUaHdEODEyb2JlSmx0a0xwR2F6c0J4OUljZ1c1ay9TY0RhS1E1QXR6SitrNEcwYlhKdzRCK2E3VU52RXkyeUYwak5aMkE0K2tPUUxjeWZwT0J0RkljZ1c1ay9TY0RhTnJrNGNBL05kcUczaVpiWkM2Um1zN0FjZlNISUZ1WlAwbkEyaWtPUUxjeWZwT0J0RzF5Y09BZm11MURieE10c2hkSXpXZGdPUHBEa0MzTW42VGdiUlNISUZ1WlAwbkEyamE1T0hBUHpYYWh0NG1XMlF1a1pyT3dISDBoeUJibVQ5SndOb3BEa0MzTW42VGdiUnRjbkRnSDVydFEyOFRMYklYU00xbllEajZRNUF0ekorazRHMFVoeUJibVQ5SndObzJ1VGh3RDgxMm9iZUpsdGtMcEdhenNCeDlJY2dXNWsvU2NEYUtRNUF0ekorazRHMGJYSnc0QithN1VOdkV5MnlGMGpOWjJESDlxaFNISUZ1WlAwbkEybVY2WGQ2ck4wb2svd0RyL1B3M013K2F3WVVWTVA4QStucXdsYWZsRUo4a1V0LzJmL1J4bVJOai9xTU94Y2pzR0h6R0REZ1ZjR0hBdUQrZ0FTOEswejJESUoxc3lwNHIyMFZwQXpUeUo0eHhmaXJLZExPSDQwdzdBOFc0QkQrbytaSHdpTGV3NGQ1ejRQRXVYT2UrdnJ0eTVjNTd0MjVjL3dBM2JpL0tRNUF0ekorazRHMGdyZk96VEtvOC93QUY4Q0U1eWVaYW1GR3FxWWRuRS9naGJ2ZUNVam0rUjBPbE1LVngyUTNMS1hyZ2M1clZ3ZWFnNytCVlRlM2xPd0hIMGh5QmJtVDlKd05vcERrQzNNbjZUZ2JTT1cxeWNPQWZtdTFFNGR2RXkyeUYwak5aMkE0K2tPUUxjeWZwT0J0RkljZ1c1ay9TY0RhTnJrNGNBL05kcUczaVpiWkM2Um1zN0FjZlNISUZ1WlAwbkEyaWtPUUxjeWZwT0J0RzF5Y09BZm11MURieE10c2hkSXpXZGdPUHBEa0MzTW42VGdiUlNISUZ1WlAwbkEyamE1T0hBUHpYYWh0NG1XMlF1a1pyT3dISDBoeUJibVQ5SndOb3BEa0MzTW42VGdiUnRjbkRnSDVydFEyOFRMYklYU00xbllEajZRNUF0ekorazRHMFVoeUJibVQ5SndObzJ1VGh3RDgxMm9iZUpsdGtMcEdhenNCeDlJY2dXNWsvU2NEYUtRNUF0ekorazRHMGJYSnc0QithN1VOdkV5MnlGMGpOWjJBNCtrT1FMY3lmcE9CdEZJY2dXNWsvU2NEYU5yazRjQS9OZHFHM2laYlpDNlJtczdBY2ZTSElGdVpQMG5BMmlrT1FMY3lmcE9CdEcxeWNPQWZtdTFEYnhNdHNoZEl6V2RnT1BwRGtDM01uNlRnYlJTSElGdVpQMG5BMmphNU9IQVB6WGFodDRtVzJRdWtack93SEgwaHlCYm1UOUp3Tm9wRGtDM01uNlRnYlJ0Y25EZ0g1cnRRMjhUTGJJWFNNMW5ZRGo2UTVBdHpKK2s0RzBVaHlCYm1UOUp3Tm8ydVRod0Q4MTJvYmVKbHRrTHBHYXpzQng5SWNnVzVrL1NjRGFLUTVBdHpKK2s0RzBiWEp3NEIrYTdVTnZFeTJ5RjBqTloyQ0QrVkQwL3hSM1BDOWVNc0NrT1FMY3lmcE9CdEl0NVJ1T2NUNDhuZkZlRjRseHJpM0hHQzN1S29VTytpNExIdll0NWUzOXlOR3UzYjI3Zlh0MjdjNSthN2N1ODM5N2pldDdwTThyZzBsYStOQ2MxdXdmdnExVVQxZi9VSWlYNzFKcHRsVkJJa0dTeWhqMytkaDd6WHRWZld2NUlxcWVBZ0xBaW1Jc0Rrby9mdmdmenJBUlB5WjVoeEJpSCtOZjF6SG1KOFMvTitqK1Y5WGhONUIrYnpmTzUvaCtLN2M1K2I0cm5QemZ5NTdpcUtRNUF0ekorazRHMHJtdThUTExJMUs1WEVoUVhPYXZtOTlHcXFmL216ODBRdkN2UDZWVFhKcm5VM1FaUktZYkhwNTdDam50UlV3eDRxNzZLdUgxYjUyQTQra09RTGN5ZnBPQnRGSWNnVzVrL1NjRGFhaDJ1VGh3RDgxMm9rdHQ0bVcyUXVrWnJPd0hIMGh5QmJtVDlKd05vcERrQzNNbjZUZ2JSdGNuRGdINXJ0UTI4VExiSVhTTTFuWURqNlE1QXR6SitrNEcwVWh5QmJtVDlKd05vMnVUaHdEODEyb2JlSmx0a0xwR2F6c0J4OUljZ1c1ay9TY0RhS1E1QXR6SitrNEcwYlhKdzRCK2E3VU52RXkyeUYwak5aMkE0K2tPUUxjeWZwT0J0RkljZ1c1ay9TY0RhTnJrNGNBL05kcUczaVpiWkM2Um1zai9sUTlQOFVkend2WGpKdmUvY28zSE9KOGVUdml2QzhTNDF4YmpqQmIzRlVLSGZSY0ZqM3NXOHZiKzVHalhidDdkdnIyN2R1Yy9OZHVYZWIrOXg0Q3N4dVJRSHc2TlNOa1JGUnlNVENpN3krdFNoaStVbFVLUFR1YzQwRnlPWXNWY0NvcUtpN3llcFUzbEFEWXhvNEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBRCt6RjJBWVhqWEdHQTRyd0NGOVJoK0V4cnpCNEVQNHJsNzhjUyt2cmw3ZTNPZTdkdVhMblBkdTNQOWJ0M21maUpFYXhxdmV1QkUzMVZmVWlIOVlFQjhWNlFvU0s1emx3SWliNnFxK3BFVDgxVS9qSHNGQW1WbXluNzdCdDRVQ1pXYktmdnNHM2pFTjBXajF2ZzlLenZHeTl4Q21tUjVWL2p4ZTRlUGoyQ2dUS3paVDk5ZzI4S0JNck5sUDMyRGJ3M1JhUFcrRDByTzhOeENtbVI1Vi9qeGU0ZVBqMkNnVEt6WlQ5OWcyOEtCTXJObFAzMkRidzNSYVBXK0Qwck84TnhDbW1SNVYvanhlNGVQajJDZ1RLelpUOTlnMjhLQk1yTmxQMzJEYnczUmFQVytEMHJPOE54Q21tUjVWL2p4ZTRlUGoyQ2dUS3paVDk5ZzI4S0JNck5sUDMyRGJ3M1JhUFcrRDByTzhOeENtbVI1Vi9qeGU0ZVBqMkNnVEt6WlQ5OWcyOEtCTXJObFAzMkRidzNSYVBXK0Qwck84TnhDbW1SNVYvanhlNGVQajJDZ1RLelpUOTlnMjhLQk1yTmxQMzJEYnczUmFQVytEMHJPOE54Q21tUjVWL2p4ZTRlUGoyQ2dUS3paVDk5ZzI4S0JNck5sUDMyRGJ3M1JhUFcrRDByTzhOeENtbVI1Vi9qeGU0ZVBqMkNnVEt6WlQ5OWcyOEtCTXJObFAzMkRidzNSYVBXK0Qwck84TnhDbW1SNVYvanhlNGVQajJDZ1RLelpUOTlnMjhLQk1yTmxQMzJEYnczUmFQVytEMHJPOE54Q21tUjVWL2p4ZTRlUGoyQ2dUS3paVDk5ZzI4S0JNck5sUDMyRGJ3M1JhUFcrRDByTzhOeENtbVI1Vi9qeGU0ZVBqMkNnVEt6WlQ5OWcyOEtCTXJObFAzMkRidzNSYVBXK0Qwck84TnhDbW1SNVYvanhlNGVQajJDZ1RLelpUOTlnMjhLQk1yTmxQMzJEYnczUmFQVytEMHJPOE54Q21tUjVWL2p4ZTRlUGoyQ2dUS3paVDk5ZzI4S0JNck5sUDMyRGJ3M1JhUFcrRDByTzhOeENtbVI1Vi9qeGU0ZVBqK3pHT0FZWGlyR0dIWXJ3K0Y5UGgrRFJyL0I0OFA0cmw5OEVTOXZydDdmWE9lNWR1M0x2TmR1WGY4QVc1ZDVuOGJMNGNScjJvOWk0VVhmUlU5U29hMGp3SHduckNpb3JYTlZVVkYzbFJVOWFLbjVLbjVnQit6K1FGZ1ZVYy9kVjhZcW81KzZyNHpUZFlDaU5yMGNYdUVvS21WMHJKdW1rL2lrZml3S3FPZnVxK01WVWMvZFY4WXJBVVJ0ZWppOXdWTXJwV1RkTkovRkkvRmdWVWMvZFY4WXFvNSs2cjR4V0FvamE5SEY3Z3FaWFNzbTZhVCtLUitMQXFvNSs2cjR4VlJ6OTFYeGlzQlJHMTZPTDNCVXl1bFpOMDBuOFVqOFdCVlJ6OTFYeGlxam43cXZqRllDaU5yMGNYdUNwbGRLeWJwcFA0cEg0c0Nxam43cXZqRlZIUDNWZkdLd0ZFYlhvNHZjRlRLNlZrM1RTZnhTUHhZRlZIUDNWZkdLcU9mdXErTVZnS0kydlJ4ZTRLbVYwckp1bWsvaWtmaXdLcU9mdXErTVZVYy9kVjhZckFVUnRlamk5d1ZNcnBXVGROSi9GSS9GZ1ZVYy9kVjhZcW81KzZyNHhXQW9qYTlIRjdncVpYU3NtNmFUK0tSK0xBcW81KzZyNHhWUno5MVh4aXNCUkcxNk9MM0JVeXVsWk4wMG44VWo4V0JWUno5MVh4aXFqbjdxdmpGWUNpTnIwY1h1Q3BsZEt5YnBwUDRwSDRzQ3FqbjdxdmpGVkhQM1ZmR0t3RkViWG80dmNGVEs2VmszVFNmeFNQeFlGVkhQM1ZmR0txT2Z1cStNVmdLSTJ2UnhlNEttVjBySnVtay9pa2Zpd0txT2Z1cStNVlVjL2RWOFlyQVVSdGVqaTl3Vk1ycFdUZE5KL0ZJL0hzR1ZmSlJSaCtnZitmOEExejY3NS84QTZ2eWZsZkwrRC83dnVmbitaL2JtNXY3dkgyeTZQMGdrYzZ5Tmt2a0Q5bkNmaHdMZ1ZNT0JWYXU4NUVYMW9xYjZHaDZaME1uT2owNXhabm5pRjVxVXd0anNtN0pyc0d5YWprMzJxNXE0V3VSZDVWOWVCZDhBUFpNWEFwQ1FlVDUvSEVwNHBtaitMdjB2NnI1dit4OUI4ejRQZ2kzMTUveStaZTgvUDhIUC9MK3JzS3FPZnVxK00xUE9OM0NpOGtsRVNTeWlWYkdKRGNyWEpzSWk0RmF1QlV3b3hVWEFxZmt1QWtaTWQ2WmRCbktSUVp4a1UzN09ER1kxN0Y4N0FUQzE2STVxNEZpSXFZVVZGd0tpS241b2lrZml3S3FPZnVxK01WVWMvZFY4WjhkWUNpTnIwY1h1SHFWTXJwV1RkTkovRkkvRmdWVWMvZFY4WXFvNSs2cjR4V0FvamE5SEY3Z3FaWFNzbTZhVCtLUitMQXFvNSs2cjR4VlJ6OTFYeGlzQlJHMTZPTDNCVXl1bFpOMDBuOFVqOFdCVlJ6OTFYeGlxam43cXZqRllDaU5yMGNYdUNwbGRLeWJwcFA0cEg0c0Nxam43cXZqRlZIUDNWZkdLd0ZFYlhvNHZjRlRLNlZrM1RTZnhTUHhZRlZIUDNWZkdLcU9mdXErTVZnS0kydlJ4ZTRLbVYwckp1bWsvaWtmaXdLcU9mdXErTVZVYy9kVjhZckFVUnRlamk5d1ZNcnBXVGROSi9GSS9GZ1ZVYy9kVjhZcW81KzZyNHhXQW9qYTlIRjdncVpYU3NtNmFUK0tSK0xBcW81KzZyNHhWUno5MVh4aXNCUkcxNk9MM0JVeXVsWk4wMG44VWo4V0JWUno5MVh4aXFqbjdxdmpGWUNpTnIwY1h1Q3BsZEt5YnBwUDRwSDRzQ3FqbjdxdmpGVkhQM1ZmR0t3RkViWG80dmNGVEs2VmszVFNmeFNQeFlGVkhQM1ZmR0txT2Z1cStNVmdLSTJ2UnhlNEttVjBySnVtay9pa2Zpd0txT2Z1cStNVlVjL2RWOFlyQVVSdGVqaTl3Vk1ycFdUZE5KL0ZJL0ZJVDl5ZlA0SGxQRzAwZnhkK3FmUy9LL3dCajZENWZ4L0hGdmJ6L0FKZk12dWJtK1BuL0FKZjBUZXo2aXRNSnVudVR1bFUyUlBPUTJ1VnFyZ2MzZlJFWEJnY2lMNmxUOHNCcHU2SGN5bnlpa3RiTjAvd1BNeG5zUjZKc21Qd3RWWE5SY0xIT1QxdGNtRERoM3ZWZ1ZBQXlZd01Dd0txT2Z1cStNVlVjL2RWOFpwdXNCUkcxNk9MM0NVRlRLNlZrM1RTZnhTUHhZRlZIUDNWZkdLcU9mdXErTVZnS0kydlJ4ZTRLbVYwckp1bWsvaWtmaXdLcU9mdXErTVZVYy9kVjhZckFVUnRlamk5d1ZNcnBXVGROSi9GSS9GZ1ZVYy9kVjhZcW81KzZyNHhXQW9qYTlIRjdncVpYU3NtNmFUK0tSK0xBcW81KzZyNHhWUno5MVh4aXNCUkcxNk9MM0JVeXVsWk4wMG44VWo4V0JWUno5MVh4aXFqbjdxdmpGWUNpTnIwY1h1Q3BsZEt5YnBwUDRwSDRzQ3FqbjdxdmpGVkhQM1ZmR0t3RkViWG80dmNGVEs2VmszVFNmeFNQeFlGVkhQM1ZmR0txT2Z1cStNVmdLSTJ2UnhlNEttVjBySnVtay9pa2Zpd0txT2Z1cStNVlVjL2RWOFlyQVVSdGVqaTl3Vk1ycFdUZE5KL0ZJL0ZnVlVjL2RWOFlxbzUrNnI0eFdBb2phOUhGN2dxWlhTc202YVQrS1IrTEFxbzUrNnI0eFZSejkxWHhpc0JSRzE2T0wzQlV5dWxaTjAwbjhVajhXQlZSejkxWHhpcWpuN3F2akZZQ2lOcjBjWHVDcGxkS3licHBQNHBINHNDcWpuN3F2akZWSFAzVmZHS3dGRWJYbzR2Y0ZUSzZWazNUU2Z4U1B4WUZWSFAzVmZHS3FPZnVxK01WZ0tJMnZSeGU0S21WMHJKdW1rL2lrZmowaktoaytvMngvZ2VJL3dCWC9Xdm00SGVZWDgzNmY1UHc4OS9mM3Z3L0Q4Vjl6LzhBWHo4L1AvVjV1MmpNMDhTYWNKS3lXeVIyeWhQVEMxY0NwaFQraW9pODZFZmFVVVlsMHpUaEZtdWNtZWJqd2wyTG00VVhBdjhBREMxVmF2OEFaVkFEMHp3UTdESjUwL2tidmpBdlh2SEh1d3llZFA1Rzc0d0wxN3g0MUkvWjhmNEhkVlRLS0QrMnBIeHNQcm9hb0FLaURwWUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQURLL0tIMC9ubnZqRGZYdjNIdXd5aDlQNTU3NHczMTc5eDYzZWpucytCOERlcWh6VDA0OXRTempZblhVQVBaTVhOZ0FGTjUxQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUJIL0t1K3d2SGZnUitzRGxYZllYanZ3SS9XV1h2K0tNazVUdFhsRDkrYitKVTVjaiszaEFCdVFpK2FRWkJPcWFWUEZlNWl2WUhqK1FUcW1sVHhYdVlyMkJWRGRGeGhsL0hSZXU0Nk1MaUdKY3ovS3lmc21BQmhwdEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBOGZ5OTlVMDErRjl6Q1p2dElNdmZWTk5maGZjd21iNmZWNnZpOUc0NTNVaGxOL2xETWRKTDhxenRZNEFTV0lIbXdBQ204NmdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBZy9sUTlQOFVkend2WGpKdlVoeW9lbitLTzU0WHJ4azNyUmJqbUxFaStCUHFwejczejJQODY4YXYwUUFObG1odzdESjUwL2tidmpBdlh2SEh1d3llZFA1Rzc0d0wxN3g0MUkvWjhmNEhkVlRLS0QrMnBIeHNQcm9hb0FLaURwWUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQURLL0tIMC9ubnZqRGZYdjNIdXd5aDlQNTU3NHczMTc5eDYzZWpucytCOERlcWh6VDA0OXRTempZblhVQVBaTVhOZ0FGTjUxQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUJIL0FDcnZzTHgzNEVmckE1VjMyRjQ3OENQMWxsNy9BSW95VGxPMWVVUDM1djRsVGx5UDdlRUFHNUNMNXBCa0U2cHBVOFY3bUs5Z2VQNUJPcWFWUEZlNWl2WUZVTjBYR0dYOGRGNjdqb3d1SVlselA4ckoreVlBR0dtMEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFEeC9MMzFUVFg0WDNNSm0rMGd5OTlVMDErRjl6Q1p2cDlYcStMMGJqbmRTR1UzK1VNeDBrdnlyTzFqZ0JKWWdlYkFBS2J6cUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFDRCtWRDAvd0FVZHp3dlhqSnZVaHlvZW4rS081NFhyeGszclJiam1MRWkrQlBxcHo3M3oyUDg2OGF2MFFBTmxtaHc3REo1MC9rYnZqQXZYdkhIdXd5ZWRQNUc3NHdMMTd4NDFJL1o4ZjRIZFZUS0tEKzJwSHhzUHJvYW9BS2lEcFlBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFESy9LSDAvbm52akRmWHYzSHV3eWg5UDU1NzR3MzE3OXg2M2VqbnMrQjhEZXFoelQwNDl0U3pqWW5YVUFQWk1YTmdBRk41MUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFCSC9LdSt3dkhmZ1Irc0RsWGZZWGp2d0kvV1dYditLTWs1VHRYbEQ5K2IrSlU1Y2orM2hBQnVRaSthUVpCT3FhVlBGZTVpdllIaitRVHFtbFR4WHVZcjJCVkRkRnhobC9IUmV1NDZNTGlHSmN6L0t5ZnNtQUJocHRBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQThmeTk5VTAxK0Y5ekNadnRJTXZmVk5OZmhmY3dtYjZmVjZ2aTlHNDUzVWhsTi9sRE1kSkw4cXp0WTRBU1dJSG13QUNtODZnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQWcvbFE5UDhVZHp3dlhqSnZVaHlvZW4rS081NFhyeGszclJiam1MRWkrQlBxcHo3M3oyUDg2OGF2MFFBTmxtaHc3REo1MC9rYnZqQXZYdkhIdXd5ZWRQNUc3NHdMMTd4NDFJL1o4ZjRIZFZUS0tEKzJwSHhzUHJvYW9BS2lEcFlBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFESy9LSDAvbm52akRmWHYzSHV3eWg5UDU1NzR3MzE3OXg2M2VqbnMrQjhEZXFoelQwNDl0U3pqWW5YVUFQWk1YTmdBRk41MUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFCSC9BQ3J2c0x4MzRFZnJBNVYzMkY0NzhDUDFsbDcvQUlveVRsTzFlVVAzNXY0bFRseVA3ZUVBRzVDTDVwQmtFNnBwVThWN21LOWdlUDVCT3FhVlBGZTVpdllGVU4wWEdHWDhkRjY3am93dUlZbHpQOHJKK3lZQUdHbTBBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBRHgvTDMxVFRYNFgzTUptKzBneTk5VTAxK0Y5ekNadnA5WHErTDBiam5kU0dVMytVTXgwa3Z5ck8xamdCSllnZWJBQUtienFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQ0QrVkQwL3dBVWR6d3ZYakp2VWh5b2VuK0tPNTRYcnhrM3JSYmptTEVpK0JQcXB6NzN6MlA4NjhhdjBRQU5sbWh3N0RKNTAva2J2akF2WHZISHV3eWVkUDVHNzR3TDE3eDQxSS9aOGY0SGRWVEtLRCsycEh4c1Byb2FvQUtpRHBZQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBREsvS0gwL25udmpEZlh2M0h1d3loOVA1NTc0dzMxNzl4NjNlam5zK0I4RGVxaHpUMDQ5dFN6alluWFVBUFpNWE5nQUZONTFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQkgvS3Urd3ZIZmdSK3NEbFhmWVhqdndJL1dXWHYrS01rNVR0WGxEOStiK0pVNWNqKzNoQUJ1UWkrYVFaQk9xYVZQRmU1aXZZSGorUVRxbWxUeFh1WXIyQlZEZEZ4aGwvSFJldTQ2TUxpR0pjei9LeWZzbUFCaHB0QUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUE4Znk5OVUwMStGOXpDWnZ0SU12ZlZOTmZoZmN3bWI2ZlY2dmk5RzQ1M1VobE4vbERNZEpMOHF6dFk0QVNXSUhtd0FDbTg2Z0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFnL2xROVA4VWR6d3ZYakp2VWh5b2VuK0tPNTRYcnhrM3JSYmptTEVpK0JQcXB6NzN6MlA4NjhhdjBRQU5sbWh3N0RKNTAva2J2akF2WHZISHV3eWVkUDVHNzR3TDE3eDQxSS9aOGY0SGRWVEtLRCsycEh4c1Byb2FvQUtpRHBZQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBREsvS0gwL25udmpEZlh2M0h1d3loOVA1NTc0dzMxNzl4NjNlam5zK0I4RGVxaHpUMDQ5dFN6alluWFVBUFpNWE5nQUZONTFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQkgvQUNydnNMeDM0RWZyQTVWMzJGNDc4Q1AxbGw3L0FJb3lUbE8xZVVQMzV2NGxUbHlQN2VFQUc1Q0w1cEJrRTZwcFU4VjdtSzlnZVA1Qk9xYVZQRmU1aXZZRlVOMFhHR1g4ZEY2N2pvd3VJWWx6UDhySit5WUFHR20wQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUR4L0wzMVRUWDRYM01KbSswZ3k5OVUwMStGOXpDWnZwOVhxK0wwYmpuZFNHVTMrVU14MGt2eXJPMWpnQkpZZ2ViQUFLYnpxQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUNEK1ZEMC93QVVkend2WGpKdlVoeW9lbitLTzU0WHJ4azNyUmJqbUxFaStCUHFwejczejJQODY4YXYwUUFObG1odyt4TDJOdjBISCtJOGVmVC9BRmYwV0dRY0wrVjhmdy9OK0MvdVgzdy9GelhlYm4rSG01K2E3elBqaitNcGs3STBOMEtJbUZya1ZGL291OHA5VWhsc1dUUjJTaUN1QjdGUnlMNjhDb3VGRjM5NzEveExBclhaaGEwNEpXdXpDMXB3VWZqVU5YK2lOazBrWHZrbHE1dDByS1doay9oRmdWcnN3dGFjRXJYWmhhMDRLUHdxL3dCRWJKcEl2ZkZjMjZWbExReWZ3aXdLMTJZV3RPQ1Zyc3d0YWNGSDRWZjZJMlRTUmUrSzV0MHJLV2hrL2hGZ1Zyc3d0YWNFclhaaGEwNEtQd3EvMFJzbWtpOThWemJwV1V0REovQ0xBclhaaGEwNEpXdXpDMXB3VWZoVi9valpOSkY3NHJtM1NzcGFHVCtFV0JXdXpDMXB3U3RkbUZyVGdvL0NyL1JHeWFTTDN4WE51bFpTME1uOElzQ3RkbUZyVGdsYTdNTFduQlIrRlgraU5rMGtYdml1YmRLeWxvWlA0UllGYTdNTFduQksxMllXdE9DajhLdjlFYkpwSXZmRmMyNlZsTFF5Zndpd0sxMllXdE9DVnJzd3RhY0ZINFZmNkkyVFNSZStLNXQwcktXaGsvaEZnVnJzd3RhY0VyWFpoYTA0S1B3cS93QkViSnBJdmZGYzI2VmxMUXlmd2l3SzEyWVd0T0NWcnN3dGFjRkg0VmY2STJUU1JlK0s1dDByS1doay9oRmdWcnN3dGFjRXJYWmhhMDRLUHdxLzBSc21raTk4VnpicFdVdERKL0NMQXJYWmhhMDRKV3V6QzFwd1VmaFYvb2paTkpGNzRybTNTc3BhR1QrRVdCV3V6QzFwd1N0ZG1GclRnby9Dci9SR3lhU0wzeFhOdWxaUzBNbjhJK3hNT052MTdIK1BNZWZUL1NmVzRaR3d2NVh4L0Y4cjQ3KzdmZkQ4WE5jNStiNHVibjVybk8rT0RiMG1rN0lNTnNLR21CclVSRS9vbThoR21YUzJMS1k3NVJHWEM5NnE1VjlXRlZYQ3E3Mjk2LzRBQi9ZK1VwQ3REUDhBMlJKL2w0KzlLME0vOWtTZjVlUHZVM2pXbTQ1Uml4TTVsMW0rS3oxUDhxeGVkTlJTRmFHZit5SlA4dkgzcFdobi9zaVQvTHg5Nm04Tnh5akZpWnpMckZaNm4rVll2T21vcEN0RFAvWkVuK1hqNzByUXovMlJKL2w0KzlUZUc0NVJpeE01bDFpczlUL0tzWG5UVVVoV2huL3NpVC9MeDk2Vm9aLzdJay95OGZlcHZEY2NveFltY3k2eFdlcC9sV0x6cHFLUXJRei9BTmtTZjVlUHZTdERQL1pFbitYajcxTjRiamxHTEV6bVhXS3oxUDhBS3NYblRVVWhXaG4vQUxJay93QXZIM3BXaG4vc2lUL0x4OTZtOE54eWpGaVp6THJGWjZuK1ZZdk9tb3BDdERQL0FHUkovbDQrOUswTS93RFpFbitYajcxTjRiamxHTEV6bVhXS3oxUDhxeGVkTlJTRmFHZit5SlA4dkgzcFdobi9BTElrL3dBdkgzcWJ3M0hLTVdKbk11c1ZucWY1Vmk4NmFpa0swTS85a1NmNWVQdlN0RFAvQUdSSi9sNCs5VGVHNDVSaXhNNWwxaXM5VC9Lc1huVFVVaFdobi9zaVQvTHg5NlZvWi83SWsveThmZXB2RGNjb3hZbWN5NnhXZXAvbFdMenBxS1FyUXovMlJKL2w0KzlLME0vOWtTZjVlUHZVM2h1T1VZc1RPWmRZclBVL3lyRjUwMUZJVm9aLzdJay95OGZlbGFHZit5SlA4dkgzcWJ3M0hLTVdKbk11c1ZucWY1Vmk4NmFpa0swTS93RFpFbitYajcwclF6LzJSSi9sNCs5VGVHNDVSaXhNNWwxaXM5VC9BQ3JGNTAxRklWb1ovd0N5SlA4QUx4OTZWb1ovN0lrL3k4ZmVwdkRjY294WW1jeTZ4V2VwL2xXTHpwcVBTTW9PVkRIK1VuOUkvWE1EeFBnbjBYemZsZlNRNys5K0w0L2c1L2krSy92dWYvcnVjM056ZjFlYmd6aVo1bWtzM3lac2trVEVaQ2Jod05UMUpoVlZYLzFWVTFMU2VsRTRUekxuemxPa1ZZc2VKZzJUbmV0Y0NJMU1QOUdvaWYyQUQwendUMnlVY3ZNM3lYTDJMNWF4WGkyVzhJd0RCdm1mTHY4QUNJTVcraVhmaXY3Ni91ODkyOWlYTG44Nys3L1QrWE02U3REUC9aRW4rWGo3MU40MTdMYmxOSEpUR2ZLSThrWTU3MVZ5cXFMaFZWWENxK3Y4MU4welZmRlUza01saHlLU1RsRVpDaE5ScldvcVlHdGFpSTFFM3ZVaUlpRklWb1ovN0lrL3k4ZmVsYUdmK3lKUDh2SDNxYng4MjQ1Uml4TTVsMW4zMW5xZjVWaTg2YWlrSzBNLzlrU2Y1ZVB2U3REUC9aRW4rWGo3MU40YmpsR0xFem1YV0t6MVA4cXhlZE5SU0ZhR2YreUpQOHZIM3BXaG4vc2lUL0x4OTZtOE54eWpGaVp6THJGWjZuK1ZZdk9tb3BDdERQOEEyUkovbDQrOUswTS85a1NmNWVQdlUzaHVPVVlzVE9aZFlyUFUvd0FxeGVkTlJTRmFHZjhBc2lUL0FDOGZlbGFHZit5SlA4dkgzcWJ3M0hLTVdKbk11c1ZucWY1Vmk4NmFpa0swTS84QVpFbitYajcwclF6L0FOa1NmNWVQdlUzaHVPVVlzVE9aZFlyUFUveXJGNTAxRklWb1ovN0lrL3k4ZmVsYUdmOEFzaVQvQUM4ZmVwdkRjY294WW1jeTZ4V2VwL2xXTHpwcUtRclF6LzJSSi9sNCs5SzBNLzhBWkVuK1hqNzFONGJqbEdMRXptWFdLejFQOHF4ZWROUlNGYUdmK3lKUDh2SDNwV2huL3NpVC9MeDk2bThOeHlqRmlaekxyRlo2bitWWXZPbW9wQ3REUC9aRW4rWGo3MHJRei8yUkovbDQrOVRlRzQ1Uml4TTVsMWlzOVQvS3NYblRVVWhXaG4vc2lUL0x4OTZWb1ovN0lrL3k4ZmVwdkRjY294WW1jeTZ4V2VwL2xXTHpwcUtRclF6L0FOa1NmNWVQdlN0RFAvWkVuK1hqNzFONGJqbEdMRXptWFdLejFQOEFLc1huVFVVaFdobi9BTElrL3dBdkgzcFdobi9zaVQvTHg5Nm04Tnh5akZpWnpMckZaNm4rVll2T21vOXNtN0x6Tjg2UzlqQ1dzYVl0bHZCOEF3bjVmekwvQUFlREZ2WWx6NGIrOXY3bk5kdm9sMjUvTzh1ZjAvbHp2RXdaZk1GR3BCTlVGWlBOMEpJYkZYWktpZXJDcUltSG1ST1kxcFRLbmM4VWhsVFpiUFVvZEhpdGFqVWM3MW8xRlZVVCttRnlyL2NBUGNNU0tRclF6LzJSSi9sNCs5SzBNLzhBWkVuK1hqNzFONDFwdU9VWXNUT1pkWnZpczlUL0FDckY1MDFGSVZvWi93Q3lKUDhBTHg5NlZvWi83SWsveThmZXB2RGNjb3hZbWN5NnhXZXAvbFdMenBxS1FyUXovd0JrU2Y1ZVB2U3REUDhBMlJKL2w0KzlUZUc0NVJpeE01bDFpczlUL0tzWG5UVVVoV2huL3NpVC9MeDk2Vm9aL3dDeUpQOEFMeDk2bThOeHlqRmlaekxyRlo2bitWWXZPbW9wQ3REUC9aRW4rWGo3MHJRei93QmtTZjVlUHZVM2h1T1VZc1RPWmRZclBVL3lyRjUwMUZJVm9aLzdJay95OGZlbGFHZit5SlA4dkgzcWJ3M0hLTVdKbk11c1ZucWY1Vmk4NmFpa0swTS85a1NmNWVQdlN0RFAvWkVuK1hqNzFONGJqbEdMRXptWFdLejFQOHF4ZWROUlNGYUdmK3lKUDh2SDNwV2huL3NpVC9MeDk2bThOeHlqRmlaekxyRlo2bitWWXZPbW9wQ3REUDhBMlJKL2w0KzlLME0vOWtTZjVlUHZVM2h1T1VZc1RPWmRZclBVL3dBcXhlZE5SU0ZhR2Y4QXNpVC9BQzhmZWxhR2YreUpQOHZIM3FidzNIS01XSm5NdXNWbnFmNVZpODZhaWtLME0vOEFaRW4rWGo3MHJRei9BTmtTZjVlUHZVM2h1T1VZc1RPWmRZclBVL3lyRjUwMUZJVm9aLzdJay95OGZlbGFHZjhBc2lUL0FDOGZlcHZEY2NveFltY3k2eFdlcC9sV0x6cHFLUXJRei8yUkovbDQrOUswTS84QVpFbitYajcxTjRiamxHTEV6bVhXS3oxUDhxeGVkTlJTRmFHZit5SlA4dkgzcFdobi9zaVQvTHg5Nm04Tnh5akZpWnpMckZaNm4rVll2T21vN2FmSjh4eGxEeHhnMk9zZFlOaTNCY0toWU5lNExlM3VDM2w5ZTNsMjh1WDE5ZlhMdDI1ZlgxOWQ1K2UvdS8xLy9IRWd6MmJac2dTT0EyU3lWcU1oc1RBaUo2a1EwOVAwL1N5ZEpaRW5DY0lpeEkwUmNMbkw2MVgrS2dCOXg1QUI5TEUySzhJeDVqakZXSmNFdjRNUENzTXdtRmdzSytpWGJ0eTh2YisvdnJsN2N1MzEyNWN1M2VibnUzT2ZtdVhYOG84WnNOaXhIcmdhaVlWWC93Q0lmUkpaTEVqeFd3WUtZWHVWRVJQNHFxNEVUKzZuelJTRlY2ZisxNVA4eEgzUlZlbi9BTFhrL3dBeEgzVFhPN0hSaTJzNTExRzhLc05QOGxSZVpOWk40cENxOVA4QTJ2Si9tSSs2S3IwLzlyeWY1aVB1amRqb3hiV2M2NmhWaHAva3FMekpySnZGSVZYcC93QzE1UDhBTVI5MFZYcC83WGsvekVmZEc3SFJpMnM1MTFDckRUL0pVWG1UV1RlS1FxdlQvd0JyeWY1aVB1aXE5UDhBMnZKL21JKzZOMk9qRnRaenJxRldHbitTb3ZNbXNtOFVoVmVuL3RlVC9NUjkwVlhwL3dDMTVQOEFNUjkwYnNkR0xhem5YVUtzTlA4QUpVWG1UV1RlS1FxdlQvMnZKL21JKzZLcjAvOEFhOG4rWWo3bzNZNk1XMW5PdW9WWWFmNUtpOHlheWJ4U0ZWNmYrMTVQOHhIM1NiMlMwZHBqTmM3YlAvYlk3WXV3d2JMQitXSERndy8xd0x6R0IwMnVZVWdvMzVyL0FIMlN2ay9uZGxzTmxnLzViSEJzc0dCVjlXeVREL1VBTW1NREE5c2xISU5OODZTOWkrWmNWNHlsdkI4QXduNW55N3pDSTBXOWlYUGh2NzY4dTg5eTloM2JuODd5Ny9YK1hNNlNxOVAvQUd2Si9tSSs2YTlsdDFhamttalBrOGVWc2E5aXExVVZWd29xTGdWUFYrU202WnF2ZGFieTZTdzViSkp0aVBoUldvNXJrUk1EbXVSRmFxYi9BS2xSVVVtOFVoVmVuL3RlVC9NUjkwVlhwLzdYay96RWZkUG0zWTZNVzFuT3VvKytyRFQvQUNWRjVrMWszaWtLcjAvOXJ5ZjVpUHVpcTlQL0FHdkovbUkrNk4yT2pGdFp6cnFGV0duK1Nvdk1tc204VWhWZW4vdGVUL01SOTBWWHAvN1hrL3pFZmRHN0hSaTJzNTExQ3JEVC9KVVhtVFdUZUtRcXZULzJ2Si9tSSs2S3IwLzlyeWY1aVB1amRqb3hiV2M2NmhWaHAva3FMekpySnZGSVZYcC83WGsvekVmZEZWNmYrMTVQOHhIM1J1eDBZdHJPZGRRcXcwL3lWRjVrMWszaWtLcjAvd0RhOG4rWWo3b3F2VC8ydkovbUkrNk4yT2pGdFp6cnFGV0duK1Nvdk1tc204VWhWZW4vQUxYay93QXhIM1JWZW4vdGVUL01SOTBic2RHTGF6blhVS3NOUDhsUmVaTlpONHBDcTlQL0FHdkovbUkrNktyMC93RGE4bitZajdvM1k2TVcxbk91b1ZZYWY1S2k4eWF5YnhTRlY2ZisxNVA4eEgzUlZlbi9BTFhrL3dBeEgzUnV4MFl0ck9kZFFxdzAvd0FsUmVaTlpONHBDcTlQL2E4bitZajdvcXZUL3dCcnlmNWlQdWpkam94YldjNjZoVmhwL2txTHpKckp2RklWWHAvN1hrL3pFZmRGVjZmKzE1UDh4SDNSdXgwWXRyT2RkUXF3MC95VkY1azFrM2lrS3IwLzlyeWY1aVB1aXE5UC9hOG4rWWo3bzNZNk1XMW5PdW9WWWFmNUtpOHlheWJ4U0ZWNmYrMTVQOHhIM1JWZW4vdGVUL01SOTBic2RHTGF6blhVS3NOUDhsUmVaTlpONDlzbTdJTk44bHk5akNaY2FZeWx2Q01Bd2I1ZnpMekI0MFcraVhmaXY3Mjh1YzF5K2gzTG44Nys1L1grWE84VFpmTUZKWkJPc0ZaUk4wVklqRVhZcXFlckNpSXVEbVZPYzFwVEtnazhVZWxUWkZQVW5kQWl1YWprYTcxcTFWVkVYK21GcXAvWUFQY01TQTlJeWZaTDhmNVNmMWY5RHd6RStDZlJmSytiOVhFdjczNHZqK1BtK0g0YnkrNS8rdTd6OC9OL1I2UlZlbi90ZVQvTVI5MHdlZUxwVXd6ZktYU1NXeXBySXJjR0ZxNGNLWVVSVS9MK0NvcHRxak53aWw4OHlGazVUWE44U0xBaVlkaTVxSmdYQXF0WEJ2OEE1T1JVL3NUZUtRcXZULzJ2Si9tSSs2S3IwLzhBYThuK1lqN3A1bTdIUmkyczUxMUh2VllhZjVLaTh5YXlieFNGVjZmKzE1UDh4SDNSVmVuL0FMWGsvd0F4SDNSdXgwWXRyT2RkUXF3MC93QWxSZVpOWk40cENxOVAvYThuK1lqN29xdlQvd0JyeWY1aVB1amRqb3hiV2M2NmhWaHAva3FMekpySnZGSVZYcC83WGsvekVmZEZWNmYrMTVQOHhIM1J1eDBZdHJPZGRRcXcwL3lWRjVrMWszaWtLcjAvOXJ5ZjVpUHVpcTlQL2E4bitZajdvM1k2TVcxbk91b1ZZYWY1S2k4eWF5YnhTRlY2ZisxNVA4eEgzUlZlbi90ZVQvTVI5MGJzZEdMYXpuWFVLc05QOGxSZVpOWk40cENxOVA4QTJ2Si9tSSs2S3IwLzlyeWY1aVB1amRqb3hiV2M2NmhWaHAva3FMekpySnZGSVZYcC93QzE1UDhBTVI5MFZYcC83WGsvekVmZEc3SFJpMnM1MTFDckRUL0pVWG1UV1RlS1FxdlQvd0JyeWY1aVB1aXE5UDhBMnZKL21JKzZOMk9qRnRaenJxRldHbitTb3ZNbXNtOFVoVmVuL3RlVC9NUjkwVlhwL3dDMTVQOEFNUjkwYnNkR0xhem5YVUtzTlA4QUpVWG1UV1RlS1FxdlQvMnZKL21JKzZLcjAvOEFhOG4rWWo3bzNZNk1XMW5PdW9WWWFmNUtpOHlheWJ4U0ZWNmYrMTVQOHhIM1JWZW4vdGVUL01SOTBic2RHTGF6blhVS3NOUDhsUmVaTlpONHBDcTlQL2E4bitZajdvcXZULzJ2Si9tSSs2TjJPakZ0WnpycUZXR24rU292TW1zbThVaFZlbi90ZVQvTVI5MG05a3RIYVl6WE8yei9BTnRqdGk3REJzc0g1WWNPREQvWEF2TVlIVGE1aFNDamZtdjk5a3I1UDUzWmJEWllQK1d4d2JMQmdWZlZza3cvMUFESmpBd09rbEdWOFlUcE1PTDVheFhHd1BCOFB3bjVueTcvQUFpK3ZyMkhjK0c4dnIrN3ozYjI1ZHUveXZMdjlQNTh6MnlxOVA4QTJ2Si9tSSs2WWhQOVBwbW1xTWtubkdVTmh2Vk5raUw2OENxcVllZEY1alpkRGJqbEo2UXlWMHRtV1JQandtdVZxdWFpWUVjaUlxcDYvWGdjaS8zSnZGSVZYcC83WGsvekVmZEZWNmYrMTVQOHhIM1R3OTJPakZ0WnpycU10cXcwL3dBbFJlWk5aTjRwQ3E5UC9hOG4rWWo3b3F2VC93QnJ5ZjVpUHVqZGpveGJXYzY2aFZocC9rcUx6SnJKdkZJVlhwLzdYay96RWZkRlY2ZisxNVA4eEgzUnV4MFl0ck9kZFFxdzAveVZGNWsxazNpa0tyMC85cnlmNWlQdWlxOVAvYThuK1lqN28zWTZNVzFuT3VvVllhZjVLaTh5YXlieFNGVjZmKzE1UDh4SDNSVmVuL3RlVC9NUjkwYnNkR0xhem5YVUtzTlA4bFJlWk5aTjRwQ3E5UDhBMnZKL21JKzZLcjAvOXJ5ZjVpUHVqZGpveGJXYzY2aFZocC9rcUx6SnJKdkZJVlhwL3dDMTVQOEFNUjkwVlhwLzdYay96RWZkRzdIUmkyczUxMUNyRFQvSlVYbVRXVGVLUXF2VC93QnJ5ZjVpUHVpcTlQOEEydkovbUkrNk4yT2pGdFp6cnFGV0duK1Nvdk1tc204VWhWZW4vdGVUL01SOTBWWHAvd0MxNVA4QU1SOTBic2RHTGF6blhVS3NOUDhBSlVYbVRXVGVLUXF2VC8ydkovbUkrNktyMC84QWE4bitZajdvM1k2TVcxbk91b1ZZYWY1S2k4eWF5YnhTRlY2ZisxNVA4eEgzUlZlbi90ZVQvTVI5MGJzZEdMYXpuWFVLc05QOGxSZVpOWk40cENxOVAvYThuK1lqN29xdlQvMnZKL21JKzZOMk9qRnRaenJxRldHbitTb3ZNbXNtOFVoVmVuL3RlVC9NUjkwVlhwLzdYay96RWZkRzdIUmkyczUxMUNyRFQvSlVYbVRXVGVLUXF2VC9BTnJ5ZjVpUHVua3MrU0hqako1ampCc1M0NnduRnVGWVZGd2E5d3E5dnNGdjc2K3ZMbDVkdnI2OXVYTHQyK3ZiMjd6ODk1ZC9wLzhBajE1anVpVEpPVWYvQUVzZ2xMWWtSVVZjQ2V2QW5yL0l4cWxseEtsY3hTTlp3bmVRdmd3VVZFMlRrVEJoWDFKNi93QXppUUdhR3JBUFNNbjJTL0grVW45WC9ROE14UGduMFh5dm0vVnhMKzkrTDQvajV2aCtHOHZ1Zi9ydTgvUHpmMGVrVlhwLzdYay96RWZkTUhuaTZWTU0zeWwwa2xzcWF5SzNCaGF1SENtRkVWUHkvZ3FLYmFvemNJcGZQTWhaT1UxemZFaXdJbUhZdWFpWUZ3S3JWd2IvQU9Ua1ZQN0UzaWtLcjAvOXJ5ZjVpUHVpcTlQL0FHdkovbUkrNmVadXgwWXRyT2RkUjcxV0duK1Nvdk1tc204VWhWZW4vdGVUL01SOTBWWHAvd0MxNVA4QU1SOTBic2RHTGF6blhVS3NOUDhBSlVYbVRXVGVLUXF2VC8ydkovbUkrNktyMC84QWE4bitZajdvM1k2TVcxbk91b1ZZYWY1S2k4eWF5YnhTRlY2ZisxNVA4eEgzUlZlbi90ZVQvTVI5MGJzZEdMYXpuWFVLc05QOGxSZVpOWk40cENxOVAvYThuK1lqN29xdlQvMnZKL21JKzZOMk9qRnRaenJxRldHbitTb3ZNbXNtOGR0UGtoNDR5ZVk0d2JFdU9zSnhiaFdGUmNHdmNLdmI3QmIrK3ZyeTVlWGI2K3ZibHk3ZHZyMjl1OC9QZVhmNmYvamlXZXpiT2NDV1FHeXFTdVI4TjZZVVZQVXFHbnArbUdXVFhMSWszemhEV0hHaHJnYzFmV2kvd1VBUHVQSURzTW5uVCtSdStNQzllOGNlN0RKNTAva2J2akF2WHZIalVqOW54L2dkMVZNb29QN2FrZkd3K3VocWdBcUlPbGdBQUFBQUFBQUFBQUF4L2JBTWYweUwwcjNoeVgzU3IveWtYdWI5VDlnQUprRlg1cEJrRTZwcFU4VjdtSzlnZVA1Qk9xYVZQRmU1aXZZRlVOMFhHR1g4ZEY2N2pvd3VJWWx6UDhySit5WUFHR20wQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUR4L0wzMVRUWDRYM01KbSswZ3k5OVUwMStGOXpDWnZwOVhxK0wwYmpuZFNHVTMrVU14MGt2eXJPMWpnQkpZZ2VXQnlVZnYzd1A1MWdJLzVLUDM3NEg4NndGYWQ4QmpkSytUN0poZkJlWmZock52TGZ1SW9BYWJKUUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFCaisyQVkvcGtYcFh2RGt2dWxYL0FKU0wzTitwK3dBRXlDcjg5Z3lDZGJNcWVLOXRGYVFNMzhnbld6S25pdmJSV2tDQXQ5UmpEQjRsdlhpRnlIazg4UzVWODAvc29BQVJwSjRBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQkIvS2g2ZjRvN25oZXZHWGdnL2xROVA4QUZIYzhMMTR6ZnQ3WGpPejRIL1JDRzkvYmlCRTQyRjlWSnZBV0psSTVZSEpSKy9mQS9uV0FqL2tvL2Z2Z2Z6ckFWcDN3R04wcjVQc21GOEY1bCtHczI4dCs0aWdCcHNsQUFBQUFBQUFBQUVIOHFIcC9panVlRjY4Wk42a09WRDAveFIzUEM5ZU1tOWFMY2N4WWtYd0o5Vk9mZStleC9uWGpWK2lBQnNzME9IWVpQT244amQ4WUY2OTQ0OTJHVHpwL0kzZkdCZXZlUEdwSDdQai9BQU82cW1VVUg5dFNQallmWFExUUFWRUhTd0FBQUFBQUFBQUFBQVkvdGdHUDZaRjZWN3c1TDdwVi93Q1VpOXpmcWZzQUJNZ3EvTklNZ25WTktuaXZjeFhzRHgvSUoxVFNwNHIzTVY3QXFodWk0d3kvam92WGNkR0Z4REV1Wi9sWlAyVEFBdzAyZ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFlUDVlK3FhYS9DKzVoTTMya0dYdnFtbXZ3dnVZVE45UHE5WHhlamNjN3FReW0veWhtT2tsK1ZaMnNjQUpMRUR5d09TajkrK0IvT3NCSC9KUisvZkEvbldBclR2Z01icFh5ZlpNTDRMekw4Tlp0NWI5eEZBRFRaS0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBTWYyd0RIOU1pOUs5NGNsOTBxLzhwRjdtL1UvWUFDWkJWK2V3WkJPdG1WUEZlMml0SUdiK1FUclpsVHhYdG9yU0JBVytveGhnOFMzcnhDNUR5ZWVKY3ErYWYyVUFBSTBrOEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBZy9sUTlQOFVkend2WGpMd1FmeW9lbitLTzU0WHJ4bS9iMnZHZG53UCtpRU43KzNFQ0p4c0w2cVRlQXNUS1J5d09TajkrK0IvT3NCSC9BQ1VmdjN3UDUxZ0swNzRERzZWOG4yVEMrQzh5L0RXYmVXL2NSUUEwMlNnQUFBQUFBQUFBQ0QrVkQwL3hSM1BDOWVNbTlTSEtoNmY0bzduaGV2R1RldEZ1T1lzU0w0RStxblB2ZlBZL3pyeHEvUkFBMldhSERzTW5uVCtSdStNQzllOGNlN0RKNTAva2J2akF2WHZIalVqOW54L2dkMVZNb29QN2FrZkd3K3VocWdBcUlPbGdBQUFBQUFBQUFBQUF4L2JBTWYweUwwcjNoeVgzU3IveWtYdWI5VDlnQUprRlg1cEJrRTZwcFU4VjdtSzlnZVA1Qk9xYVZQRmU1aXZZRlVOMFhHR1g4ZEY2N2pvd3VJWWx6UDhBS3lmc21BQmhwdEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBOGZ5OTlVMDErRjl6Q1p2dElNdmZWTk5maGZjd21iNmZWNnZpOUc0NTNVaGxOL2xETWRKTDhxenRZNEFTV0lIbGdjbEg3OThEK2RZQ1ArU2o5KytCL09zQlduZkFZM1N2ayt5WVh3WG1YNGF6YnkzN2lLQUdteVVBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQVkvdGdHUDZaRjZWN3c1TDdwVi81U0wzTitwK3dBRXlDcjg5Z3lDZGJNcWVLOXRGYVFNMzhnbld6S25pdmJSV2tDQXQ5UmpEQjRsdlhpRnlIazg4UzVWODAvc29BQVJwSjRBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQkIvS2g2ZjRvN25oZXZHWGdnL2xROVA4VWR6d3ZYak4rM3RlTTdQZ2Y5RUliMzl1SUVUallYMVVtOEJZbVVqbGdjbEg3OThEK2RZQ1ArU2o5KytCL09zQlduZkFZM1N2ayt5WVh3WG1YNGF6YnkzN2lLQUdteVVBQUFBQUFBQUFBUWZ5b2VuK0tPNTRYcnhrM3FRNVVQVC9BQlIzUEM5ZU1tOWFMY2N4WWtYd0o5Vk9mZStleC9uWGpWK2lBQnNzME9IWVpQT244amQ4WUY2OTQ0OTJHVHpwL0kzZkdCZXZlUEdwSDdQai9BN3FxWlJRZjIxSStOaDlkRFZBQlVRZExBQUFBQUFBQUFBQUFCaisyQVkvcGtYcFh2RGt2dWxYL2xJdmMzNm43QUFUSUt2elNESUoxVFNwNHIzTVY3QThmeUNkVTBxZUs5ekZld0tvYm91TU12NDZMMTNIUmhjUXhMbWY1V1Q5a3dBTU5Ob0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFIaitYdnFtbXZ3dnVZVE45cEJsNzZwcHI4TDdtRXpmVDZ2VjhYbzNITzZrTXB2OG9aanBKZmxXZHJIQUNTeEE4c0Rrby9mdmdmenJBUi93QWxINzk4RCtkWUN0TytBeHVsZko5a3d2Z3ZNdncxbTNsdjNFVUFOTmtvQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUF4L2JBTWYweUwwcjNoeVgzU3IvQU1wRjdtL1UvWUFDWkJWK2V3WkJPdG1WUEZlMml0SUdiK1FUclpsVHhYdG9yU0JBVytveGhnOFMzcnhDNUR5ZWVKY3ErYWYyVUFBSTBrOEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBZy9sUTlQOEFGSGM4TDE0eThFSDhxSHAvaWp1ZUY2OFp2MjlyeG5aOEQvb2hEZS90eEFpY2JDK3FrM2dMRXlrY3NEa28vZnZnZnpyQVIveVVmdjN3UDUxZ0swNzRERzZWOG4yVEMrQzh5L0RXYmVXL2NSUUEwMlNnQUFBQUFBQUFBQ0QrVkQwL3hSM1BDOWVNbTlTSEtoNmY0bzduaGV2R1RldEZ1T1lzU0w0RStxblB2ZlBZL3dBNjhhdjBRQU5sbWh3N0RKNTAva2J2akF2WHZISHV3eWVkUDVHNzR3TDE3eDQxSS9aOGY0SGRWVEtLRCsycEh4c1Byb2FvQUtpRHBZQUFBQUFBQUFBQUFBTWYyd0RIOU1pOUs5NGNsOTBxL3dES1JlNXYxUDJBQW1RVmZta0dRVHFtbFR4WHVZcjJCNC9rRTZwcFU4VjdtSzlnVlEzUmNZWmZ4MFhydU9qQzRoaVhNL3lzbjdKZ0FZYWJRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQVBIOHZmVk5OZmhmY3dtYjdTREwzMVRUWDRYM01KbStuMWVyNHZSdU9kMUlaVGY1UXpIU1MvS3M3V09BRWxpQjVZSEpSKy9mQS9uV0FqL2tvL2Z2Z2Z6ckFWcDN3R04wcjVQc21GOEY1bCtHczI4dCs0aWdCcHNsQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFHUDdZQmorbVJlbGU4T1MrNlZmK1VpOXpmcWZzQUJNZ3EvUFlNZ25XektuaXZiUldrRE4vSUoxc3lwNHIyMFZwQWdMZlVZd3dlSmIxNGhjaDVQUEV1VmZOUDdLQUFFYVNlQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFRZnlvZW4rS081NFhyeGw0SVA1VVBUL0ZIYzhMMTR6ZnQ3WGpPejRIL0FFUWh2ZjI0Z1JPTmhmVlNid0ZpWlNPV0J5VWZ2M3dQNTFnSS93Q1NqOSsrQi9Pc0JXbmZBWTNTdmsreVlYd1htWDRhemJ5MzdpS0FHbXlVQUFBQUFBQUFBQVFmeW9lbitLTzU0WHJ4azNxUTVVUFQvRkhjOEwxNHliMW90eHpGaVJmQW4xVTU5NzU3SCtkZU5YNklBR3l6UTRkaGs4NmZ5TjN4Z1hyM2pqM1laUE9uOGpkOFlGNjk0OGFrZnMrUDhEdXFwbEZCL2JVajQySDEwTlVBRlJCMHNBQUFBQUFBQUFBQUFHUDdZQmorbVJlbGU4T1MrNlZmK1VpOXpmcWZzQUJNZ3EvTklNZ25WTktuaXZjeFhzRHgvSUoxVFNwNHIzTVY3QXFodWk0d3kvam92WGNkR0Z4REV1Wi9sWlAyVEFBdzAyZ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFlUDVlK3FhYS9DKzVoTTMya0dYdnFtbXZ3dnVZVE45UHE5WHhlamNjN3FReW0vd0FvWmpwSmZsV2RySEFDU3hBOHNEa28vZnZnZnpyQVIveVVmdjN3UDUxZ0swNzRERzZWOG4yVEMrQzh5L0RXYmVXL2NSUUEwMlNnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQURIOXNBeC9USXZTdmVISmZkS3YvQUNrWHViOVQ5Z0FKa0ZYNTdCa0U2MlpVOFY3YUswZ1p2NUJPdG1WUEZlMml0SUVCYjZqR0dEeExldkVMa1BKNTRseXI1cC9aUUFBalNUd0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFDRCtWRDAveFIzUEM5ZU12QkIvS2g2ZjRvN25oZXZHYjl2YThaMmZBLzZJUTN2N2NRSW5Hd3ZxcE40Q3hNcEhMQTVLUDM3NEg4NndFZjhsSDc5OEQrZFlDdE8rQXh1bGZKOWt3dmd2TXZ3MW0zbHYzRVVBTk5rb0FBQUFBQUFBQUFnL2xROVA4QUZIYzhMMTR5YjFJY3FIcC9panVlRjY4Wk42MFc0NWl4SXZnVDZxYys5ODlqL092R3I5RUFEWlpvY1BzUzlqYjlCeC9pUEhuMC93Qlg5RmhrSEMvbGZIOFB6Zmd2N2w5OFB4YzEzbTUvaDV1Zm11OHo0NC9qS1pPeU5EZENpSmhhNUZSZjZMdktmVklaYkZrMGRrb2dyZ2V4VWNpK3ZBcUxoUmQvZTlmOFN3SzEyWVd0T0NWcnN3dGFjRkg0MURWL29qWk5KRjc1SmF1YmRLeWxvWlA0UllGYTdNTFduQksxMllXdE9DajhLdjhBUkd5YVNMM3hYTnVsWlMwTW44SXNDdGRtRnJUZ2xhN01MV25CUitGWCtpTmswa1h2aXViZEt5bG9aUDRSWUZhN01MV25CSzEyWVd0T0NqOEt2OUViSnBJdmZGYzI2VmxMUXlmd2l3SzEyWVd0T0NWcnN3dGFjRkg0VmY2STJUU1JlK0s1dDByS1doay9oRmdWcnN3dGFjRXJYWmhhMDRLUHdxLzBSc21raTk4VnpicFdVdERKL0NMQXJYWmhhMDRLUHdabFJLNS9ORXhlYy8ycUQ1dnptRFpmOG5PdzdIRGcvd0N6bHdZTUsrckI2OTgxZmRKdXowbHBkNW5iRktmUCtZMld3LzRRMllObnNkbC8wWTNEaDJMZlhod1lON0JoVUFNeU5YbElTRHlnL3dDQjVUeFRLLzhBQ1A2cDlMODMvZjhBci9sL0g4Y1crdjhBL2o4dSs1dWI0K2IrZjlIWVZyc3d0YWNGSDQxUE9OdytpOHJsRVNWU2lTN0tKRWNybkxzNGlZVmN1RlZ3STlFVENxL2ttQWtaTWQ5bmRCbTJSUVp1a1U0YkNEQlkxakU4MUFYQTFpSTFxWVZocXE0RVJFd3FxcXY1cXFsZ1Zyc3d0YWNFclhaaGEwNEtQeDhkWCtpTmswa1h2bnFWemJwV1V0REovQ0xBclhaaGEwNEpXdXpDMXB3VWZoVi9valpOSkY3NHJtM1NzcGFHVCtFV0JXdXpDMXB3U3RkbUZyVGdvL0NyL1JHeWFTTDN4WE51bFpTME1uOElzQ3RkbUZyVGdsYTdNTFduQlIrRlgraU5rMGtYdml1YmRLeWxvWlA0UllGYTdNTFduQksxMllXdE9DajhLdjhBUkd5YVNMM3hYTnVsWlMwTW44SXNDdGRtRnJUZ2xhN01MV25CUitGWCtpTmswa1h2aXViZEt5bG9aUDRSWUZhN01MV25CSzEyWVd0T0NqOEt2OUViSnBJdmZGYzI2VmxMUXlmd2l3SzEyWVd0T0NWcnN3dGFjRkg0VmY2STJUU1JlK0s1dDByS1doay9oRmdWcnN3dGFjRXJYWmhhMDRLUHdxLzBSc21raTk4VnpicFdVdERKL0NMQXJYWmhhMDRKV3V6QzFwd1VmaFYvb2paTkpGNzRybTNTc3BhR1QrRVdCV3V6QzFwd1N0ZG1GclRnby9Dci9SR3lhU0wzeFhOdWxaUzBNbjhJc0N0ZG1GclRnbGE3TUxXbkJSK0ZYK2lOazBrWHZpdWJkS3lsb1pQNFJZRmE3TUxXbkJLMTJZV3RPQ2o4S3Y4QVJHeWFTTDN4WE51bFpTME1uOElwQ2Z1VUgvSEVwNDJsZitFZjB2NnI1WCsvOWY4QU0rRDRJdDdmL3dESDVkN3o4L3djMzgvNnB2Qm4xRmFIemRNa25kSlpzaCtiaHVjcmxUQzUyK3FJbUhDNVZYMUluNTREVGQwTzZiUGxLNWEyY1ovaitlak1ZakVYWXNaZ2FpdWNpWUdOYW5yYzVjT0REdjhBcndJZ0FaTVlHZXdaS01xOUdINi8vd0NBL1hQcnZrZisxOG41WHkvai93RGkrNStmNW45dWJtL3U5Z3JYWmhhMDRLUHhyU2tGeCtqazZ5eDh2bDhuMmNWK0RDdXppSmh3SWpVM211UlBVaUp2SWI0b1pmTlUzbzlOc0taNW5sM21wTkMyV3hiNXFDN0Jzbks1ZDkwTnpsd3VjcTc2cjY4Q2J4WUZhN01MV25CSzEyWVd0T0NqOGVOVi9valpOSkY3NWxGYzI2VmxMUXlmd2l3SzEyWVd0T0NWcnN3dGFjRkg0VmY2STJUU1JlK0s1dDByS1doay9oRmdWcnN3dGFjRXJYWmhhMDRLUHdxLzBSc21raTk4VnpicFdVdERKL0NMQXJYWmhhMDRKV3V6QzFwd1VmaFYvb2paTkpGNzRybTNTc3BhR1QrRVdCV3V6QzFwd1N0ZG1GclRnby9Dci9SR3lhU0wzeFhOdWxaUzBNbjhJc0N0ZG1GclRnbGE3TUxXbkJSK0ZYK2lOazBrWHZpdWJkS3lsb1pQNFJZRmE3TUxXbkJLMTJZV3RPQ2o4S3Y5RWJKcEl2ZkZjMjZWbExReWZ3aXdLMTJZV3RPQ1Zyc3d0YWNGSDRWZjZJMlRTUmUrSzV0MHJLV2hrL2hGZ1Zyc3d0YWNFclhaaGEwNEtQd3Evd0JFYkpwSXZmRmMyNlZsTFF5Zndpd0sxMllXdE9DVnJzd3RhY0ZINFZmNkkyVFNSZStLNXQwcktXaGsvaEZnVnJzd3RhY0VyWFpoYTA0S1B3cS8wUnNta2k5OFZ6YnBXVXRESi9DTEFyWFpoYTA0Sld1ekMxcHdVZmhWL29qWk5KRjc0cm0zU3NwYUdUK0VXQld1ekMxcHdTdGRtRnJUZ28vQ3IvUkd5YVNMM3hYTnVsWlMwTW44SXNDdGRtRnJUZ28vQm1WRXJuODBURjV6L2FvUG0vT1lObC95YzdEc2NPRC9BTE9YQmd3cjZzSHIzelY5MG03UFNXbDNtZHNVcDgvNWpaYkQvaERaZzJleDJYL1JqY09IWXQ5ZUhCZzNzR0ZRQXpJMWVkaElNMmZ3UE5tS1pvK2cvVlBwZm0vN0h6ZmwvSDhjSyt2UCtYTmZjM044ZlA4QXkvb3BDdGRtRnJUZ28vR0FVcXVYekZQY29iS3B6Z2VjaU5halVYWlBidklxcmd3TmNpZXRWL0xDYmt1ZVh3RkxxS1NKMDNUQksvTXdYdlY2cDV1RS9DNVVhMVZ3dlk1ZlUxcVlNT0RlOVdGVkxBclhaaGEwNEpXdXpDMXB3VWZqR3F2OUViSnBJdmZNOHJtM1NzcGFHVCtFV0JXdXpDMXB3U3RkbUZyVGdvL0NyL1JHeWFTTDN4WE51bFpTME1uOElzQ3RkbUZyVGdsYTdNTFduQlIrRlgraU5rMGtYdml1YmRLeWxvWlA0UllGYTdNTFduQksxMllXdE9DajhLdjlFYkpwSXZmRmMyNlZsTFF5Zndpd0sxMllXdE9DVnJzd3RhY0ZINFZmNkkyVFNSZStLNXQwcktXaGsvaEZnVnJzd3RhY0VyWFpoYTA0S1B3cS93QkViSnBJdmZGYzI2VmxMUXlmd2l3SzEyWVd0T0NWcnN3dGFjRkg0VmY2STJUU1JlK0s1dDByS1doay9oRmdWcnN3dGFjRXJYWmhhMDRLUHdxLzBSc21raTk4VnpicFdVdERKL0NMQXJYWmhhMDRKV3V6QzFwd1VmaFYvb2paTkpGNzRybTNTc3BhR1QrRVdCV3V6QzFwd1N0ZG1GclRnby9Dci9SR3lhU0wzeFhOdWxaUzBNbjhJc0N0ZG1GclRnbGE3TUxXbkJSK0ZYK2lOazBrWHZpdWJkS3lsb1pQNFJZRmE3TUxXbkJLMTJZV3RPQ2o4S3Y5RWJKcEl2ZkZjMjZWbExReWZ3aXdLMTJZV3RPQ1Zyc3d0YWNGSDRWZjZJMlRTUmUrSzV0MHJLV2hrL2hGZ1Zyc3d0YWNGNFBsUXlnMGs0L3dQSG42UitpL0t3Tzh3VDVYMUh6dmk1cisvdnZpK0w0YjNtLzdPYm01djZQTng3OUdyazlINW5sU1MyYnBQc0lxSXFZZG05ZDVmWHZPY3FmK0dHMDd2amFaMG1tOVpybnVXZWRnS3FPMlBtNFRkOVBVdUZrTnJ0NytvQWJGTkluc0dTakt2Umgrdi84QWdQMXo2NzVIL3RmSitWOHY0LzhBNHZ1Zm4rWi9ibTV2N3ZZSzEyWVd0T0NqOGEwcEJjZm81T3NzZkw1Zko5bkZmZ3dyczRpWWNDSTFONXJrVDFJaWJ5RytLR1h6Vk42UFRiQ21lWjVkNXFUUXRsc1crYWd1d2JKeXVYZmREYzVjTG5LdStxK3ZBbThXQld1ekMxcHdTdGRtRnJUZ28vSGpWZjZJMlRTUmUrWlJYTnVsWlMwTW44SXNDdGRtRnJUZ2xhN01MV25CUitGWCtpTmswa1h2aXViZEt5bG9aUDRSWUZhN01MV25CSzEyWVd0T0NqOEt2OUViSnBJdmZGYzI2VmxMUXlmd2l3SzEyWVd0T0NWcnN3dGFjRkg0VmY2STJUU1JlK0s1dDByS1doay9oRmdWcnN3dGFjRXJYWmhhMDRLUHdxLzBSc21raTk4VnpicFdVdERKL0NQU01xR1VHa25IK0I0OC9TUDBYNVdCM21DZksrbytkOFhOZjM5OThYeGZEZTgzL1p6YzNOL1I1dURhTXpUUEpwdmtySkZKRzdHRXhNRFV3cXVCUDZxcXJ6cVI5cFJTZVhUek9FV2RKeWY1eVBGWFpPZGdSTUsveHdOUkdwL1pFQUQwendRRCt6RjJBWVhqWEdHQTRyd0NGOVJoK0V4cnpCNEVQNHJsNzhjUyt2cmw3ZTNPZTdkdVhMblBkdTNQOWJ0M21maUpFYXhxdmV1QkUzMVZmVWlIOVlFQjhWNlFvU0s1emx3SWliNnFxK3BFVDgxVS9qSHNGQW1WbXluNzdCdDRVQ1pXYktmdnNHM2pFTjBXajF2ZzlLenZHeTl4Q21tUjVWL2p4ZTRlUGoyQ2dUS3paVDk5ZzI4S0JNck5sUDMyRGJ3M1JhUFcrRDByTzhOeENtbVI1Vi9qeGU0ZVBqMkNnVEt6WlQ5OWcyOEtCTXJObFAzMkRidzNSYVBXK0Qwck84TnhDbW1SNVYvanhlNGVQajJDZ1RLelpUOTlnMjhLQk1yTmxQMzJEYnczUmFQVytEMHJPOE54Q21tUjVWL2p4ZTRlUGoyQ2dUS3paVDk5ZzI4S0JNck5sUDMyRGJ3M1JhUFcrRDByTzhOeENtbVI1Vi9qeGU0ZVBqMkNnVEt6WlQ5OWcyOEtCTXJObFAzMkRidzNSYVBXK0Qwck84TnhDbW1SNVYvanhlNGVQajJDZ1RLelpUOTlnMjhLQk1yTmxQMzJEYnczUmFQVytEMHJPOE54Q21tUjVWL2p4ZTRlUGoyQ2dUS3paVDk5ZzI4S0JNck5sUDMyRGJ3M1JhUFcrRDByTzhOeENtbVI1Vi9qeGU0ZVBqMkNnVEt6WlQ5OWcyOEtCTXJObFAzMkRidzNSYVBXK0Qwck84TnhDbW1SNVYvanhlNGVQajJDZ1RLelpUOTlnMjhLQk1yTmxQMzJEYnczUmFQVytEMHJPOE54Q21tUjVWL2p4ZTRlUGoyQ2dUS3paVDk5ZzI4S0JNck5sUDMyRGJ3M1JhUFcrRDByTzhOeENtbVI1Vi9qeGU0ZVBqMkNnVEt6WlQ5OWcyOEtCTXJObFAzMkRidzNSYVBXK0Qwck84TnhDbW1SNVYvanhlNGVQajJDZ1RLelpUOTlnMjhLQk1yTmxQMzJEYnczUmFQVytEMHJPOE54Q21tUjVWL2p4ZTRlUGoyQ2dUS3paVDk5ZzI4S0JNck5sUDMyRGJ3M1JhUFcrRDByTzhOeENtbVI1Vi9qeGU0ZVBqK3pHT0FZWGlyR0dIWXJ3K0Y5UGgrRFJyL0I0OFA0cmw5OEVTOXZydDdmWE9lNWR1M0x2TmR1WGY4QVc1ZDVuOGJMNGNScjJvOWk0VVhmUlU5U29hMGp3SHduckNpb3JYTlZVVkYzbFJVOWFLbjVLbjVnQit6K1FGSVZYcC83WGsvekVmZEZWNmYrMTVQOHhIM1RXbTdIUmkyczUxMUcrS3NOUDhsUmVaTlpONHBDcTlQL0FHdkovbUkrNktyMC93RGE4bitZajdvM1k2TVcxbk91b1ZZYWY1S2k4eWF5YnhTRlY2ZisxNVA4eEgzUlZlbi9BTFhrL3dBeEgzUnV4MFl0ck9kZFFxdzAvd0FsUmVaTlpONHBDcTlQL2E4bitZajdvcXZUL3dCcnlmNWlQdWpkam94YldjNjZoVmhwL2txTHpKckp2RklWWHAvN1hrL3pFZmRGVjZmKzE1UDh4SDNSdXgwWXRyT2RkUXF3MC95VkY1azFrM2lrS3IwLzlyeWY1aVB1aXE5UC9hOG4rWWo3bzNZNk1XMW5PdW9WWWFmNUtpOHlheWJ4U0ZWNmYrMTVQOHhIM1JWZW4vdGVUL01SOTBic2RHTGF6blhVS3NOUDhsUmVaTlpONHBDcTlQOEEydkovbUkrNktyMC85cnlmNWlQdWpkam94YldjNjZoVmhwL2txTHpKckp2RklWWHAvd0MxNVA4QU1SOTBWWHAvN1hrL3pFZmRHN0hSaTJzNTExQ3JEVC9KVVhtVFdUZUtRcXZUL3dCcnlmNWlQdWlxOVA4QTJ2Si9tSSs2TjJPakZ0WnpycUZXR24rU292TW1zbThVaFZlbi90ZVQvTVI5MFZYcC93QzE1UDhBTVI5MGJzZEdMYXpuWFVLc05QOEFKVVhtVFdUZUtRcXZULzJ2Si9tSSs2S3IwLzhBYThuK1lqN28zWTZNVzFuT3VvVllhZjVLaTh5YXlieFNGVjZmKzE1UDh4SDNSVmVuL3RlVC9NUjkwYnNkR0xhem5YVUtzTlA4bFJlWk5aTjRwQ3E5UC9hOG4rWWo3b3F2VC8ydkovbUkrNk4yT2pGdFp6cnFGV0duK1Nvdk1tc204ZWtaUWNsK1A4bTM2Uit1WVppZkMvcmZtL0sra2lYOTk4UHdmQnovQUJmRmVYdk4vd0Jsem01dWYrcnpkbkV6enpKWndrelpYSW5vK0U3RGdjbnFYQXFvdi9xS2hxV2s5RjV3bWFYUG0yZElTd284UEJzbXU5YVlVUnlZZjZ0VkYvdUFIcG5nZ2UyU2prR20rZEpleGZNdUs4WlMzZytBWVQ4ejVkNWhFYUxleExudzM5OWVYZWU1ZXc3dHorZDVkL3IvQUM1blNWWHAvd0MxNVA4QU1SOTAxN0xicTFISk5HZko0OHJZMTdGVnFvcXJoUlVYQXFlcjhsTjB6VmU2MDNsMGxoeTJTVGJFZkNpdFJ6WElpWUhOY2lLMVUzL1VxS2lrM2lrS3IwLzlyeWY1aVB1aXE5UC9BR3ZKL21JKzZmTnV4MFl0ck9kZFI5OVdHbitTb3ZNbXNtOFVoVmVuL3RlVC9NUjkwVlhwL3dDMTVQOEFNUjkwYnNkR0xhem5YVUtzTlA4QUpVWG1UV1RlS1FxdlQvMnZKL21JKzZLcjAvOEFhOG4rWWo3bzNZNk1XMW5PdW9WWWFmNUtpOHlheWJ4U0ZWNmYrMTVQOHhIM1JWZW4vdGVUL01SOTBic2RHTGF6blhVS3NOUDhsUmVaTlpONHBDcTlQL2E4bitZajdvcXZULzJ2Si9tSSs2TjJPakZ0WnpycUZXR24rU292TW1zbThVaFZlbi90ZVQvTVI5MFZYcC83WGsvekVmZEc3SFJpMnM1MTFDckRUL0pVWG1UV1RlS1FxdlQvQU5yeWY1aVB1aXE5UC9hOG4rWWo3bzNZNk1XMW5PdW9WWWFmNUtpOHlheWJ4U0ZWNmY4QXRlVC9BREVmZEZWNmYrMTVQOHhIM1J1eDBZdHJPZGRRcXcwL3lWRjVrMWszaWtLcjAvOEFhOG4rWWo3b3F2VC9BTnJ5ZjVpUHVqZGpveGJXYzY2aFZocC9rcUx6SnJKdkZJVlhwLzdYay96RWZkRlY2ZjhBdGVUL0FERWZkRzdIUmkyczUxMUNyRFQvQUNWRjVrMWszaWtLcjAvOXJ5ZjVpUHVpcTlQL0FHdkovbUkrNk4yT2pGdFp6cnFGV0duK1Nvdk1tc204VWhWZW4vdGVUL01SOTBWWHAvN1hrL3pFZmRHN0hSaTJzNTExQ3JEVC9KVVhtVFdUZUtRcXZULzJ2Si9tSSs2S3IwLzlyeWY1aVB1amRqb3hiV2M2NmhWaHAva3FMekpySnZIdGszWkJwdmt1WHNZVExqVEdVdDRSZ0dEZkwrWmVZUEdpMzBTNzhWL2UzbHptdVgwTzVjL25mM1A2L3dBdWQ0bXkrWUtTeUNkWUt5aWJvcVJHSXV4VlU5V0ZFUmNITXFjNXJTbVZCSjRvOUtteUtlcE82QkZjMUhJMTNyVnFxcUl2OU1MVlQrd0FlNFlrQlNGVjZmOEF0ZVQvQURFZmRGVjZmKzE1UDh4SDNUV203SFJpMnM1MTFHK0tzTlA4bFJlWk5aTjRwQ3E5UC9hOG4rWWo3b3F2VC8ydkovbUkrNk4yT2pGdFp6cnFGV0duK1Nvdk1tc204VWhWZW4vdGVUL01SOTBWWHAvN1hrL3pFZmRHN0hSaTJzNTExQ3JEVC9KVVhtVFdUZUtRcXZUL0FOcnlmNWlQdWlxOVAvYThuK1lqN28zWTZNVzFuT3VvVllhZjVLaTh5YXlieFNGVjZmOEF0ZVQvQURFZmRGVjZmKzE1UDh4SDNSdXgwWXRyT2RkUXF3MC95VkY1azFrM2lrS3IwLzhBYThuK1lqN29xdlQvQU5yeWY1aVB1amRqb3hiV2M2NmhWaHAva3FMekpySnZGSVZYcC83WGsvekVmZEZWNmY4QXRlVC9BREVmZEc3SFJpMnM1MTFDckRUL0FDVkY1azFrM2lrS3IwLzlyeWY1aVB1aXE5UC9BR3ZKL21JKzZOMk9qRnRaenJxRldHbitTb3ZNbXNtOFVoVmVuL3RlVC9NUjkwVlhwLzdYay96RWZkRzdIUmkyczUxMUNyRFQvSlVYbVRXVGVLUXF2VC8ydkovbUkrNktyMC85cnlmNWlQdWpkam94YldjNjZoVmhwL2txTHpKckp2RklWWHAvN1hrL3pFZmRGVjZmKzE1UDh4SDNSdXgwWXRyT2RkUXF3MC95VkY1azFrM2lrS3IwL3dEYThuK1lqN29xdlQvMnZKL21JKzZOMk9qRnRaenJxRldHbitTb3ZNbXNtOFVoVmVuL0FMWGsvd0F4SDNSVmVuL3RlVC9NUjkwYnNkR0xhem5YVUtzTlA4bFJlWk5aTjRwQ3E5UC9BR3ZKL21JKzZLcjAvd0RhOG4rWWo3bzNZNk1XMW5PdW9WWWFmNUtpOHlheWJ4MjArU0hqako1ampCc1M0NnduRnVGWVZGd2E5d3E5dnNGdjc2K3ZMbDVkdnI2OXVYTHQyK3ZiMjd6ODk1ZC9wLzhBamlXZXpiT2NDV1FHeXFTdVI4TjZZVVZQVXFHbnArbUdXVFhMSWszemhEV0hHaHJnYzFmV2kvd1VBUHVQSURzTW5uVCtSdStNQzllOGNlN0RKNTAva2J2akF2WHZIalVqOW54L2dkMVZNb29QN2FrZkd3K3VocWdBcUlPbGdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFNcjhvZlQrZWUrTU45ZS9jZTdES0gwL25udmpEZlh2M0hyZDZPZXo0SHdONnFITlBUajIxTE9OaWRkUUE5a3hjMkFBVTNuVUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFFZjhxNzdDOGQrQkg2d09WZDloZU8vQWo5WlplLzRveVRsTzFlVVAzNXY0bFRseVA3ZUVBRzVDTDVwQmtFNnBwVThWN21LOWdlUDVCT3FhVlBGZTVpdllGVU4wWEdHWDhkRjY3am93dUlZbHpQOEFLeWZzbUFCaHB0QUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUE4Znk5OVUwMStGOXpDWnZ0SU12ZlZOTmZoZmN3bWI2ZlY2dmk5RzQ1M1VobE4vbERNZEpMOHF6dFk0QVNXSUhtd0FDbTg2Z0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFnL2xROVA4VWR6d3ZYakp2VWh5b2VuK0tPNTRYcnhrM3JSYmptTEVpK0JQcXB6NzN6MlA4NjhhdjBRQU5sbWh3N0RKNTAva2J2akF2WHZISHV3eWVkUDVHNzR3TDE3eDQxSS9aOGY0SGRWVEtLRCsycEh4c1Byb2FvQUtpRHBZQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBREsvS0gwL25udmpEZlh2M0h1d3loOVA1NTc0dzMxNzl4NjNlam5zK0I4RGVxaHpUMDQ5dFN6alluWFVBUFpNWE5nQUZONTFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQkgvS3Urd3ZIZmdSK3NEbFhmWVhqdndJL1dXWHYrS01rNVR0WGxEOStiK0pVNWNqKzNoQUJ1UWkrYVFaQk9xYVZQRmU1aXZZSGorUVRxbWxUeFh1WXIyQlZEZEZ4aGwvSFJldTQ2TUxpR0pjei9LeWZzbUFCaHB0QUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUE4Znk5OVUwMStGOXpDWnZ0SU12ZlZOTmZoZmN3bWI2ZlY2dmk5RzQ1M1VobE4vbERNZEpMOHF6dFk0QVNXSUhtd0FDbTg2Z0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFnL2xROVA4VWR6d3ZYakp2VWh5b2VuK0tPNTRYcnhrM3JSYmptTEVpK0JQcXB6NzN6MlA4QU92R3I5RUFEWlpvY093eWVkUDVHNzR3TDE3eHg3c01ublQrUnUrTUM5ZThlTlNQMmZIK0IzVlV5aWcvdHFSOGJENjZHcUFDb2c2V0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUF5dnloOVA1NTc0dzMxNzl4N3NNb2ZUK2VlK01OOWUvY2V0M281N1BnZkEzcW9jMDlPUGJVczQySjExQUQyVEZ6WUFCVGVkUUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFSL3lydnNMeDM0RWZyQTVWMzJGNDc4Q1AxbGw3L2lqSk9VN1Y1US9mbS9pVk9YSS90NFFBYmtJdm1rR1FUcW1sVHhYdVlyMkI0L2tFNnBwVThWN21LOWdWUTNSY1laZngwWHJ1T2pDNGhpWE0vd0FySit5WUFHR20wQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUR4L0wzMVRUWDRYM01KbSswZ3k5OVUwMStGOXpDWnZwOVhxK0wwYmpuZFNHVTMrVU14MGt2eXJPMWpnQkpZZ2ViQUFLYnpxQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUNEK1ZEMC94UjNQQzllTW05U0hLaDZmNG83bmhldkdUZXRGdU9Zc1NMNEUrcW5QdmZQWS96cnhxL1JBQTJXYUhEc01ublQrUnUrTUM5ZThjZTdESjUwL2tidmpBdlh2SGpVajlueC9nZDFWTW9vUDdha2ZHdyt1aHFnQXFJT2xnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBTXI4b2ZUK2VlK01OOWUvY2U3REtIMC9ubnZqRGZYdjNIcmQ2T2V6NEh3TjZxSE5QVGoyMUxPTmlkZFFBOWt4YzJBQVUzblVBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBRWY4cTc3QzhkK0JINndPVmQ5aGVPL0FqOVpaZS80b3lUbE8xZVVQMzV2NGxUbHlQN2VFQUc1Q0w1cEJrRTZwcFU4VjdtSzlnZVA1Qk9xYVZQRmU1aXZZRlVOMFhHR1g4ZEY2N2pvd3VJWWx6UDhySit5WUFHR20wQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUR4L0wzMVRUWDRYM01KbSswZ3k5OVUwMStGOXpDWnZwOVhxK0wwYmpuZFNHVTMrVU14MGt2eXJPMWpnQkpZZ2ViQUFLYnpxQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUNEK1ZEMC94UjNQQzllTW05U0hLaDZmNG83bmhldkdUZXRGdU9Zc1NMNEUrcW5QdmZQWS93QTY4YXYwUUFObG1odzdESjUwL2tidmpBdlh2SEh1d3llZFA1Rzc0d0wxN3g0MUkvWjhmNEhkVlRLS0QrMnBIeHNQcm9hb0FLaURwWUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQURLL0tIMC9ubnZqRGZYdjNIdXd5aDlQNTU3NHczMTc5eDYzZWpucytCOERlcWh6VDA0OXRTempZblhVQVBaTVhOZ0FGTjUxQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUJIL0t1K3d2SGZnUitzRGxYZllYanZ3SS9XV1h2K0tNazVUdFhsRDkrYitKVTVjaiszaEFCdVFpK2FRWkJPcWFWUEZlNWl2WUhqK1FUcW1sVHhYdVlyMkJWRGRGeGhsL0hSZXU0Nk1MaUdKY3ovQUNzbjdKZ0FZYWJRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQVBIOHZmVk5OZmhmY3dtYjdTREwzMVRUWDRYM01KbStuMWVyNHZSdU9kMUlaVGY1UXpIU1MvS3M3V09BRWxpQjVzQUFwdk9vQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUlQNVVQVC9GSGM4TDE0eWIxSWNxSHAvaWp1ZUY2OFpONjBXNDVpeEl2Z1Q2cWMrOTg5ai9PdkdyOUVBRFpab2NPd3llZFA1Rzc0d0wxN3h4N3NNbm5UK1J1K01DOWU4ZU5TUDJmSCtCM1ZVeWlnL3RxUjhiRDY2R3FBQ29nNldBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBeXZ5aDlQNTU3NHczMTc5eDdzTW9mVCtlZStNTjllL2NldDNvNTdQZ2ZBM3FvYzA5T1BiVXM0MkoxMUFEMlRGellBQlRlZFFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBUi95cnZzTHgzNEVmckE1VjMyRjQ3OENQMWxsNy9pakpPVTdWNVEvZm0vaVZPWEkvdDRRQWJrSXZta0dRVHFtbFR4WHVZcjJCNC9rRTZwcFU4VjdtSzlnVlEzUmNZWmZ4MFhydU9qQzRoaVhNL3lzbjdKZ0FZYWJRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQVBIOHZmVk5OZmhmY3dtYjdTREwzMVRUWDRYM01KbStuMWVyNHZSdU9kMUlaVGY1UXpIU1MvS3M3V09BRWxpQjVzQUFwdk9vQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUlQNVVQVC9GSGM4TDE0eWIxSWNxSHAvaWp1ZUY2OFpONjBXNDVpeEl2Z1Q2cWMrOTg5ai9BRHJ4cS9SQUEyV2FIRDcwcTQwd2ZFY3p5NWpyQzd5TkV3WEE4UHdmQ290N0R1WEx0L2ZYbDVFdmI2N2N2YmwyN2N1Yy9OY3U4M1BkdVBnajU1WEptUm9Ub0wvK3JrVkYvb3FZRDdadWw4U1N5aUhLb1A4QTNZNUhKL1ZGd3AvNmhlRmFHUU95Snc4dkEzcFdoa0RzaWNQTHdONmc4YUtxMTBZL2tmbnFTN3IyMC80U0YwU2F5OEswTWdka1RoNWVCdlN0RElIWkU0ZVhnYjFCNFZhNk1meVB6MUZlMm4vQ1F1aVRXWGhXaGtEc2ljUEx3TjZWb1pBN0luRHk4RGVvUENyWFJqK1IrZW9yMjAvNFNGMFNheThLME1nZGtUaDVlQnZTdERJSFpFNGVYZ2IxQjRWYTZNZnlQejFGZTJuL0FBa0xvazFsNFZvWkE3SW5EeThEZWxhR1FPeUp3OHZBM3FEd3ExMFkva2ZucUs5dFArRWhkRW1zdkN0RElIWkU0ZVhnYjByUXlCMlJPSGw0RzlRZUZXdWpIOGo4OVJYdHAvd2tMb2sxbDRWb1pBN0luRHk4RGVsYUdRT3lKdzh2QTNxRHdxMTBZL2tmbnFLOXRQOEFoSVhSSnJMd3JReUIyUk9IbDRHOUswTWdka1RoNWVCdlVIaFZyb3gvSS9QVVY3YWY4SkM2Sk5aZUZhR1FPeUp3OHZBM3BXaGtEc2ljUEx3TjZnOEt0ZEdQNUg1Nml2YlQvaElYUkpyTHdyUXlCMlJPSGw0RzlLME1nZGtUaDVlQnZVSGhWcm94L0kvUFVWN2FmOEpDNkpOWmVGYUdRT3lKdzh2QTNwV2hrRHNpY1BMd042ZzhLdGRHUDVINTZpdmJUL2hJWFJKckx3clF5QjJST0hsNEc5SzBNZ2RrVGg1ZUJ2VUhoVnJveC9JL1BVVjdhZjhBQ1F1aVRXWGhXaGtEc2ljUEx3TjZWb1pBN0luRHk4RGVvUENyWFJqK1IrZW9yMjAvNFNGMFNheThLME1nZGtUaDVlQnZTdERJSFpFNGVYZ2IxQjRWYTZNZnlQejFGZTJuL0NRdWlUV2ZlbXJHbUQ0OG1lWThkWUplUm9lQzRaaCtFWVZDdllseTVjdjcyOHY0bDlmWExsOWN1WGJ0em41cnR6bjVydDE4RUc5WkpKbXdZVFlMUCtyVVJFL29pWUNJazR5K0pLcFJFbFViL3U5eXVYK3FyaFgvQU5VQVBvUGlMQXJYWmhhMDRKV3V6QzFwd1VmalRkWCtpTmswa1h2a29LNXQwcktXaGsvaEZnVnJzd3RhY0VyWFpoYTA0S1B3cS8wUnNta2k5OFZ6YnBXVXRESi9DTEFyWFpoYTA0Sld1ekMxcHdVZmhWL29qWk5KRjc0cm0zU3NwYUdUK0VXQld1ekMxcHdTdGRtRnJUZ28vQ3IvQUVSc21raTk4VnpicFdVdERKL0NMQXJYWmhhMDRKV3V6QzFwd1VmaFYvb2paTkpGNzRybTNTc3BhR1QrRVdCV3V6QzFwd1N0ZG1GclRnby9Dci9SR3lhU0wzeFhOdWxaUzBNbjhJc0N0ZG1GclRnbGE3TUxXbkJSK0ZYK2lOazBrWHZpdWJkS3lsb1pQNFJZRmE3TUxXbkJLMTJZV3RPQ2o4S3Y5RWJKcEl2ZkZjMjZWbExReWZ3aXdLMTJZV3RPQ1Zyc3d0YWNGSDRWZjZJMlRTUmUrSzV0MHJLV2hrL2hGZ1Zyc3d0YWNFclhaaGEwNEtQd3EvMFJzbWtpOThWemJwV1V0REovQ0xBclhaaGEwNEpXdXpDMXB3VWZoVi9valpOSkY3NHJtM1NzcGFHVCtFV0JXdXpDMXB3U3RkbUZyVGdvL0NyL0FFUnNta2k5OFZ6YnBXVXRESi9DTEFyWFpoYTA0Sld1ekMxcHdVZmhWL29qWk5KRjc0cm0zU3NwYUdUK0VXQld1ekMxcHdTdGRtRnJUZ28vQ3IvUkd5YVNMM3hYTnVsWlMwTW44STlneXI1VjZULzBEL3dINkg5RDgvOEE5cjUzemZtZkIvOEFGN3pjM3kvNzgvUC9BR2VQZzJYUitqOGptcVJza0VnWnNJVE1PQk1Lcmd3cXJsMzNLcSt0VlhmVTBQVE9tYzUwaG5PTFBFOFJmT3ltTHNkazdZdGJoMkxVYW04MUd0VEExcUp2SW5xd3J2Z0I3Smk1U0VnOG9QOEFnZVU4VXl2L0FBaitxZlMvTi8zL0FLLzVmeC9IRnZyL0FQNC9MdnVibStQbS9uL1IyRmE3TUxXbkJSK05UempjUG92SzVSRWxVb2t1eWlSSEs1eTdPSW1GWExoVmNDUFJFd3F2NUpnSkdUSGZaM1FadGtVR2JwRk9Hd2d3V05ZeFBOUUZ3TllpTmFtRllhcXVCRVJNS3FxcithcXBZRmE3TUxXbkJLMTJZV3RPQ2o4ZkhWL29qWk5KRjc1NmxjMjZWbExReWZ3aXdLMTJZV3RPQ1Zyc3d0YWNGSDRWZjZJMlRTUmUrSzV0MHJLV2hrL2hGZ1Zyc3d0YWNFclhaaGEwNEtQd3EvMFJzbWtpOThWemJwV1V0REovQ0xBclhaaGEwNEpXdXpDMXB3VWZoVi9valpOSkY3NHJtM1NzcGFHVCtFV0JXdXpDMXB3U3RkbUZyVGdvL0NyL0FFUnNta2k5OFZ6YnBXVXRESi9DTEFyWFpoYTA0Sld1ekMxcHdVZmhWL29qWk5KRjc0cm0zU3NwYUdUK0VXQld1ekMxcHdTdGRtRnJUZ28vQ3IvUkd5YVNMM3hYTnVsWlMwTW44SXNDdGRtRnJUZ2xhN01MV25CUitGWCtpTmswa1h2aXViZEt5bG9aUDRSWUZhN01MV25CSzEyWVd0T0NqOEt2OUViSnBJdmZGYzI2VmxMUXlmd2l3SzEyWVd0T0NWcnN3dGFjRkg0VmY2STJUU1JlK0s1dDByS1doay9oRmdWcnN3dGFjRXJYWmhhMDRLUHdxLzBSc21raTk4VnpicFdVdERKL0NMQXJYWmhhMDRKV3V6QzFwd1VmaFYvb2paTkpGNzRybTNTc3BhR1QrRVdCV3V6QzFwd1N0ZG1GclRnby9Dci9BRVJzbWtpOThWemJwV1V0REovQ0tRbjdsQi94eEtlTnBYL2hIOUwrcStWL3YvWC9BRFBnK0NMZTMvOEF4K1hlOC9QOEhOL1ArcWJ3WjlSV2g4M1RKSjNTV2JJZm00Ym5LNVV3dWR2cWlKaHd1VlY5U0orZUEwM2REdW16NVN1V3RuR2Y0L25vekdJeEYyTEdZR29ybkltQmpXcDYzT1hEZ3c3L0FLOENJQUdUR0JsZ1Zyc3d0YWNFclhaaGEwNEtQeHB1ci9SR3lhU0wzeVVGYzI2VmxMUXlmd2l3SzEyWVd0T0NWcnN3dGFjRkg0VmY2STJUU1JlK0s1dDByS1doay9oRmdWcnN3dGFjRXJYWmhhMDRLUHdxL3dCRWJKcEl2ZkZjMjZWbExReWZ3aXdLMTJZV3RPQ1Zyc3d0YWNGSDRWZjZJMlRTUmUrSzV0MHJLV2hrL2hGZ1Zyc3d0YWNFclhaaGEwNEtQd3EvMFJzbWtpOThWemJwV1V0REovQ0xBclhaaGEwNEpXdXpDMXB3VWZoVi9valpOSkY3NHJtM1NzcGFHVCtFV0JXdXpDMXB3U3RkbUZyVGdvL0NyL1JHeWFTTDN4WE51bFpTME1uOElzQ3RkbUZyVGdsYTdNTFduQlIrRlgraU5rMGtYdml1YmRLeWxvWlA0UllGYTdNTFduQksxMllXdE9DajhLdjlFYkpwSXZmRmMyNlZsTFF5Zndpd0sxMllXdE9DVnJzd3RhY0ZINFZmNkkyVFNSZStLNXQwcktXaGsvaEZnVnJzd3RhY0VyWFpoYTA0S1B3cS93QkViSnBJdmZGYzI2VmxMUXlmd2l3SzEyWVd0T0NWcnN3dGFjRkg0VmY2STJUU1JlK0s1dDByS1doay9oRmdWcnN3dGFjRXJYWmhhMDRLUHdxLzBSc21raTk4VnpicFdVdERKL0NMQXJYWmhhMDRKV3V6QzFwd1VmaFYvb2paTkpGNzRybTNTc3BhR1QrRWVrWlVNb05KT1A4QUE4ZWZwSDZMOHJBN3pCUGxmVWZPK0xtdjcrKytMNHZodmViL0FMT2JtNXY2UE53YlJtYVo1Tk44bFpJcEkzWXdtSmdhbUZWd0ovVlZWZWRTUHRLS1R5NmVad2l6cE9UL0FEa2VLdXljN0FpWVYvamdhaU5UK3lJQUhwbmdnSDJKZXhUK3ZZL3hIaVA2ajZUNjNESU9DZk4rRDR2bGZIZjNMMzR2aDU3blB6ZkZ6ODNQYzUzOFpUS0dRWWJvc1JjRFdvcXIvUk45VDZwRElvc3Bqc2s4Rk1MM3FqVVQxWVZWY0NKdjczci9BSW54eFlGVkhQM1ZmR0txT2Z1cStNMURXQW9qYTlIRjdoSmFwbGRLeWJwcFA0cEg0c0Nxam43cXZqRlZIUDNWZkdLd0ZFYlhvNHZjRlRLNlZrM1RTZnhTUHhZRlZIUDNWZkdLcU9mdXErTVZnS0kydlJ4ZTRLbVYwckp1bWsvaWtmaXdLcU9mdXErTVZVYy9kVjhZckFVUnRlamk5d1ZNcnBXVGROSi9GSS9GZ1ZVYy9kVjhZcW81KzZyNHhXQW9qYTlIRjdncVpYU3NtNmFUK0tSK0xBcW81KzZyNHhWUno5MVh4aXNCUkcxNk9MM0JVeXVsWk4wMG44VWo4V0JWUno5MVh4a2ZzeW9sZEFtaWZmT2Y3Vkc4NTV2QnN2OEFpNXVEWlljSC9acVljT0JmVmg5VythdnVrM0dLUzBSOHp0aWszbVBQN0xZZjg0YjhPdzJPeS82UGRnd2JKdnJ3WWNPOWh3S0FHWkdyd0tRa0hrK2Z4eEtlS1pvL2k3OUwrcStiL3NmUWZNK0Q0SXQ5ZWY4QUw1bDd6OC93Yy84QUwrcnNLcU9mdXErTTFQT04zQ2k4a2xFU1N5aVZiR0pEY3JYSnNJaTRGYXVCVXdveFVYQXFma3VBa1pNZDZaZEJuS1JRWnhrVTM3T0RHWTE3Rjg3QVRDMTZJNXE0RmlJcVlVVkZ3S2lLbjVvaWtmaXdLcU9mdXErTVZVYy9kVjhaOGRZQ2lOcjBjWHVIcVZNcnBXVGROSi9GSS9GZ1ZVYy9kVjhZcW81KzZyNHhXQW9qYTlIRjdncVpYU3NtNmFUK0tSK0xBcW81KzZyNHhWUno5MVh4aXNCUkcxNk9MM0JVeXVsWk4wMG44VWo4V0JWUno5MVh4aXFqbjdxdmpGWUNpTnIwY1h1Q3BsZEt5YnBwUDRwSDRzQ3FqbjdxdmpGVkhQM1ZmR0t3RkViWG80dmNGVEs2VmszVFNmeFNQeFlGVkhQM1ZmR0txT2Z1cStNVmdLSTJ2UnhlNEttVjBySnVtay9pa2Zpd0txT2Z1cStNVlVjL2RWOFlyQVVSdGVqaTl3Vk1ycFdUZE5KL0ZJL0ZnVlVjL2RWOFlxbzUrNnI0eFdBb2phOUhGN2dxWlhTc202YVQrS1IrTEFxbzUrNnI0eFZSejkxWHhpc0JSRzE2T0wzQlV5dWxaTjAwbjhVajhXQlZSejkxWHhpcWpuN3F2akZZQ2lOcjBjWHVDcGxkS3licHBQNHBINHNDcWpuN3F2akZWSFAzVmZHS3dGRWJYbzR2Y0ZUSzZWazNUU2Z4U1B4WUZWSFAzVmZHS3FPZnVxK01WZ0tJMnZSeGU0S21WMHJKdW1rL2lrZml3S3FPZnVxK01WVWMvZFY4WXJBVVJ0ZWppOXdWTXJwV1RkTkovRkkvRklUOXlmUDRIbFBHMDBmeGQrcWZTL0svMlBvUGwvSDhjVzl2UCtYekw3bTV2ajUvNWYwVGV6Nml0TUp1bnVUdWxVMlJQT1EydVZxcmdjM2ZSRVhCZ2NpTDZsVDhzQnB1NkhjeW55aWt0Yk4wL3dBRHpNWjdFZWliSmo4TFZWelVYQ3h6azliWEpndzRkNzFZRlFBTW1NREE5Z3lVWktLVC93QmYvd0RQL29mMFB5UC9BRmZuZk4rWjhmOEE5M3ZOemZML0FMOC9QL1o3QlZSejkxWHhtdEtRWFlLT1RWTEh5Q1h5allSV1lNS2JDSXVEQ2lPVGZhMVU5U291OHB2aWhsN0xUZWtNMndwNG1lUStkazBYWmJGM25ZTGNPeGNyVjNuUkd1VEE1cXB2b25xd3B2RWZpd0txT2Z1cStNVlVjL2RWOFo0MVlDaU5yMGNYdUdVVk1ycFdUZE5KL0ZJL0ZnVlVjL2RWOFlxbzUrNnI0eFdBb2phOUhGN2dxWlhTc202YVQrS1IrTEFxbzUrNnI0eFZSejkxWHhpc0JSRzE2T0wzQlV5dWxaTjAwbjhVajhXQlZSejkxWHhpcWpuN3F2akZZQ2lOcjBjWHVDcGxkS3licHBQNHBINHNDcWpuN3F2akZWSFAzVmZHS3dGRWJYbzR2Y0ZUSzZWazNUU2Z4U1B4WUZWSFAzVmZHS3FPZnVxK01WZ0tJMnZSeGU0S21WMHJKdW1rL2lrZml3S3FPZnVxK01WVWMvZFY4WXJBVVJ0ZWppOXdWTXJwV1RkTkovRkkvRmdWVWMvZFY4WXFvNSs2cjR4V0FvamE5SEY3Z3FaWFNzbTZhVCtLUitMQXFvNSs2cjR4VlJ6OTFYeGlzQlJHMTZPTDNCVXl1bFpOMDBuOFVqOFdCVlJ6OTFYeGlxam43cXZqRllDaU5yMGNYdUNwbGRLeWJwcFA0cEg0c0Nxam43cXZqRlZIUDNWZkdLd0ZFYlhvNHZjRlRLNlZrM1RTZnhTUHhZRlZIUDNWZkdLcU9mdXErTVZnS0kydlJ4ZTRLbVYwckp1bWsvaWtmaXdLcU9mdXErTVZVYy9kVjhZckFVUnRlamk5d1ZNcnBXVGROSi9GSS9GZ1ZVYy9kVjhaSDdNcUpYUUpvbjN6bisxUnZPZWJ3YkwvQUl1YmcyV0hCLzJhbUhEZ1gxWWZWdm1yN3BOeGlrdEVmTTdZcE41anoreTJIL09HL0RzTmpzditqM1lNR3liNjhHSER2WWNDZ0JtUnE4RHNKQmxQK09Kc3hUSy8xLzZYOVY4My9mOEFsZk0rRDRJVjlmOEEvSG52ZWZuK0RtL24vVlNGVkhQM1ZmR1lCU3E2aE1VeVNoc2xuT1A1dUk1cU9STmk5MjhxcW1IQzFxcDYwWDg4SnVTNTVlLzB1cFhJblRqTUVrODlCWTlXS3ZuSVRNRGtScmxUQTk3VjlUbXJod1lOL3dCZUZGSS9GZ1ZVYy9kVjhZcW81KzZyNHpHcXdGRWJYbzR2Y004cVpYU3NtNmFUK0tSK0xBcW81KzZyNHhWUno5MVh4aXNCUkcxNk9MM0JVeXVsWk4wMG44VWo4V0JWUno5MVh4aXFqbjdxdmpGWUNpTnIwY1h1Q3BsZEt5YnBwUDRwSDRzQ3FqbjdxdmpGVkhQM1ZmR0t3RkViWG80dmNGVEs2VmszVFNmeFNQeFlGVkhQM1ZmR0txT2Z1cStNVmdLSTJ2UnhlNEttVjBySnVtay9pa2Zpd0txT2Z1cStNVlVjL2RWOFlyQVVSdGVqaTl3Vk1ycFdUZE5KL0ZJL0ZnVlVjL2RWOFlxbzUrNnI0eFdBb2phOUhGN2dxWlhTc202YVQrS1IrTEFxbzUrNnI0eFZSejkxWHhpc0JSRzE2T0wzQlV5dWxaTjAwbjhVajhXQlZSejkxWHhpcWpuN3F2akZZQ2lOcjBjWHVDcGxkS3licHBQNHBINHNDcWpuN3F2akZWSFAzVmZHS3dGRWJYbzR2Y0ZUSzZWazNUU2Z4U1B4WUZWSFAzVmZHS3FPZnVxK01WZ0tJMnZSeGU0S21WMHJKdW1rL2lrZml3S3FPZnVxK01WVWMvZFY4WXJBVVJ0ZWppOXdWTXJwV1RkTkovRkkvRmdWVWMvZFY4WXFvNSs2cjR4V0FvamE5SEY3Z3FaWFNzbTZhVCtLUitMQXFvNSs2cjR6d2ZLaGsrbzJ4L2dlSS8xZjlhK2JnZDVoZnpmcC9rL0R6MzkvZS9EOFB4WDNQLzE4L1B6L0FOWHYwYXVzVWZuaVZKSXB1bEd6aXFpcmcyRDAzazllKzVxSi93Q21HMDd2Y3FaMFptOVowbnVSK2FnSXFOMlhuSVR0OWZVbUJrUnp0LzhBb2ViZ05pbWtRUFlNbEdTaWsvOEFYLzhBei82SDlEOGovd0JYNTN6Zm1mSC9BUGQ3emMzeS93Qy9Qei8yZXdWVWMvZFY4WnJTa0YyQ2prMVN4OGdsOG8yRVZtRENtd2lMZ3dvamszMnRWUFVxTHZLYjRvWmV5MDNwRE5zS2VKbmtQblpORjJXeGQ1MkMzRHNYSzFkNTBScmt3T2FxYjZKNnNLYnhINHNDcWpuN3F2akZWSFAzVmZHZU5XQW9qYTlIRjdobEZUSzZWazNUU2Z4U1B4WUZWSFAzVmZHS3FPZnVxK01WZ0tJMnZSeGU0S21WMHJKdW1rL2lrZml3S3FPZnVxK01WVWMvZFY4WXJBVVJ0ZWppOXdWTXJwV1RkTkovRkkvRmdWVWMvZFY4WXFvNSs2cjR4V0FvamE5SEY3Z3FaWFNzbTZhVCtLUitMQXFvNSs2cjR4VlJ6OTFYeGlzQlJHMTZPTDNCVXl1bFpOMDBuOFVqOGVrWlVNbjFHMlA4RHhIK3Ivclh6Y0R2TUwrYjlQOEFKK0hudjcrOStINGZpdnVmL3I1K2ZuL3E4M2JSbWFlSk5PRWxaTFpJN1pRbnBoYXVCVXdwL1JVUmVkQ1B0S0tNUzZacHdpelhPVFBOeDRTN0Z6Y0tMZ1grR0ZxcTFmN0tvQWVtZUNIWVpQT244amQ4WUY2OTQ0OTJHVHpwL0kzZkdCZXZlUEdwSDdQai9BN3FxWlJRZjIxSStOaDlkRFZBQlVRZExBQUFBQUFBQUFBQUFCaisyQVkvcGtYcFh2RGt2dWxYL2xJdmMzNm43QUFUSUt2elNESUoxVFNwNHIzTVY3QThmeUNkVTBxZUs5ekZld0tvYm91TU12NDZMMTNIUmhjUXhMbWY1V1Q5a3dBTU5Ob0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFIaitYdnFtbXZ3dnVZVE45cEJsNzZwcHI4TDdtRXpmVDZ2VjhYbzNITzZrTXB2OG9aanBKZmxXZHJIQUNTeEE4c0Rrby9mdmdmenJBUi93QWxINzk4RCtkWUN0TytBeHVsZko5a3d2Z3ZNdncxbTNsdjNFVUFOTmtvQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUF4L2JBTWYweUwwcjNoeVgzU3IvQU1wRjdtL1UvWUFDWkJWK2V3WkJPdG1WUEZlMml0SUdiK1FUclpsVHhYdG9yU0JBVytveGhnOFMzcnhDNUR5ZWVKY3ErYWYyVUFBSTBrOEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBZy9sUTlQOEFGSGM4TDE0eThFSDhxSHAvaWp1ZUY2OFp2MjlyeG5aOEQvb2hEZS90eEFpY2JDK3FrM2dMRXlrY3NEa28vZnZnZnpyQVIveVVmdjN3UDUxZ0swNzRERzZWOG4yVEMrQzh5L0RXYmVXL2NSUUEwMlNnQUFBQUFBQUFBQ0QrVkQwL3hSM1BDOWVNbTlTSEtoNmY0bzduaGV2R1RldEZ1T1lzU0w0RStxblB2ZlBZL3dBNjhhdjBRQU5sbWh3N0RKNTAva2J2akF2WHZISHV3eWVkUDVHNzR3TDE3eDQxSS9aOGY0SGRWVEtLRCsycEh4c1Byb2FvQUtpRHBZQUFBQUFBQUFBQUFBTWYyd0RIOU1pOUs5NGNsOTBxL3dES1JlNXYxUDJBQW1RVmZta0dRVHFtbFR4WHVZcjJCNC9rRTZwcFU4VjdtSzlnVlEzUmNZWmZ4MFhydU9qQzRoaVhNL3lzbjdKZ0FZYWJRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQVBIOHZmVk5OZmhmY3dtYjdTREwzMVRUWDRYM01KbStuMWVyNHZSdU9kMUlaVGY1UXpIU1MvS3M3V09BRWxpQjVZSEpSKy9mQS9uV0FqL2tvL2Z2Z2Z6ckFWcDN3R04wcjVQc21GOEY1bCtHczI4dCs0aWdCcHNsQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFHUDdZQmorbVJlbGU4T1MrNlZmK1VpOXpmcWZzQUJNZ3EvUFlNZ25XektuaXZiUldrRE4vSUoxc3lwNHIyMFZwQWdMZlVZd3dlSmIxNGhjaDVQUEV1VmZOUDdLQUFFYVNlQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFRZnlvZW4rS081NFhyeGw0SVA1VVBUL0ZIYzhMMTR6ZnQ3WGpPejRIL0FFUWh2ZjI0Z1JPTmhmVlNid0ZpWlNPV0J5VWZ2M3dQNTFnSS93Q1NqOSsrQi9Pc0JXbmZBWTNTdmsreVlYd1htWDRhemJ5MzdpS0FHbXlVQUFBQUFBQUFBQVFmeW9lbitLTzU0WHJ4azNxUTVVUFQvRkhjOEwxNHliMW90eHpGaVJmQW4xVTU5NzU3SCtkZU5YNklBR3l6UTRkaGs4NmZ5TjN4Z1hyM2pqM1laUE9uOGpkOFlGNjk0OGFrZnMrUDhEdXFwbEZCL2JVajQySDEwTlVBRlJCMHNBQUFBQUFBQUFBQUFHUDdZQmorbVJlbGU4T1MrNlZmK1VpOXpmcWZzQUJNZ3EvTklNZ25WTktuaXZjeFhzRHgvSUoxVFNwNHIzTVY3QXFodWk0d3kvam92WGNkR0Z4REV1Wi9sWlAyVEFBdzAyZ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFlUDVlK3FhYS9DKzVoTTMya0dYdnFtbXZ3dnVZVE45UHE5WHhlamNjN3FReW0vd0FvWmpwSmZsV2RySEFDU3hBOHNEa28vZnZnZnpyQVIveVVmdjN3UDUxZ0swNzRERzZWOG4yVEMrQzh5L0RXYmVXL2NSUUEwMlNnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQURIOXNBeC9USXZTdmVISmZkS3YvQUNrWHViOVQ5Z0FKa0ZYNTdCa0U2MlpVOFY3YUswZ1p2NUJPdG1WUEZlMml0SUVCYjZqR0dEeExldkVMa1BKNTRseXI1cC9aUUFBalNUd0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFDRCtWRDAveFIzUEM5ZU12QkIvS2g2ZjRvN25oZXZHYjl2YThaMmZBLzZJUTN2N2NRSW5Hd3ZxcE40Q3hNcEhMQTVLUDM3NEg4NndFZjhsSDc5OEQrZFlDdE8rQXh1bGZKOWt3dmd2TXZ3MW0zbHYzRVVBTk5rb0FBQUFBQUFBQUFnL2xROVA4QUZIYzhMMTR5YjFJY3FIcC9panVlRjY4Wk42MFc0NWl4SXZnVDZxYys5ODlqL092R3I5RUFEWlpvY093eWVkUDVHNzR3TDE3eHg3c01ublQrUnUrTUM5ZThlTlNQMmZIK0IzVlV5aWcvdHFSOGJENjZHcUFDb2c2V0FBQUFBQUFBQUFBQURIOXNBeC9USXZTdmVISmZkS3YvQUNrWHViOVQ5Z0FKa0ZYNXBCa0U2cHBVOFY3bUs5Z2VQNUJPcWFWUEZlNWl2WUZVTjBYR0dYOGRGNjdqb3d1SVlselA4ckoreVlBR0dtMEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFEeC9MMzFUVFg0WDNNSm0rMGd5OTlVMDErRjl6Q1p2cDlYcStMMGJqbmRTR1UzK1VNeDBrdnlyTzFqZ0JKWWdlV0J5VWZ2M3dQNTFnSS93Q1NqOSsrQi9Pc0JXbmZBWTNTdmsreVlYd1htWDRhemJ5MzdpS0FHbXlVQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFZL3RnR1A2WkY2Vjd3NUw3cFYvNVNMM04rcCt3QUV5Q3I4OWd5Q2RiTXFlSzl0RmFRTTM4Z25XektuaXZiUldrQ0F0OVJqREI0bHZYaUZ5SGs4OFM1VjgwL3NvQUFScEo0QUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUJCL0toNmY0bzduaGV2R1hnZy9sUTlQOFVkend2WGpOKzN0ZU03UGdmOUVJYjM5dUlFVGpZWDFVbThCWW1VamxnY2xINzk4RCtkWUNQK1NqOSsrQi9Pc0JXbmZBWTNTdmsreVlYd1htWDRhemJ5MzdpS0FHbXlVQUFBQUFBQUFBQVFmeW9lbitLTzU0WHJ4azNxUTVVUFQvRkhjOEwxNHliMW90eHpGaVJmQW4xVTU5NzU3SCtkZU5YNklBR3l6UTRkaGs4NmZ5TjN4Z1hyM2pqM1laUE9uOGpkOFlGNjk0OGFrZnMrUDhEdXFwbEZCL2JVajQySDEwTlVBRlJCMHNBQUFBQUFBQUFBQUFHUDdZQmorbVJlbGU4T1MrNlZmK1VpOXpmcWZzQUJNZ3EvTklNZ25WTktuaXZjeFhzRHgvSUoxVFNwNHIzTVY3QXFodWk0d3kvam92WGNkR0Z4REV1Wi9sWlAyVEFBdzAyZ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFlUDVlK3FhYS9DKzVoTTMya0dYdnFtbXZ3dnVZVE45UHE5WHhlamNjN3FReW0veWhtT2tsK1ZaMnNjQUpMRUR5d09TajkrK0IvT3NCSC9KUisvZkEvbldBclR2Z01icFh5ZlpNTDRMekw4Tlp0NWI5eEZBRFRaS0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBTWYyd0RIOU1pOUs5NGNsOTBxLzhwRjdtL1UvWUFDWkJWK2V3WkJPdG1WUEZlMml0SUdiK1FUclpsVHhYdG9yU0JBVytveGhnOFMzcnhDNUR5ZWVKY3ErYWYyVUFBSTBrOEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBZy9sUTlQOFVkend2WGpMd1FmeW9lbitLTzU0WHJ4bS9iMnZHZG53UDhBb2hEZS90eEFpY2JDK3FrM2dMRXlrY3NEa28vZnZnZnpyQVIveVVmdjN3UDUxZ0swNzRERzZWOG4yVEMrQzh5L0RXYmVXL2NSUUEwMlNnQUFBQUFBQUFBQ0QrVkQwL3hSM1BDOWVNbTlTSEtoNmY0bzduaGV2R1RldEZ1T1lzU0w0RStxblB2ZlBZL3pyeHEvUkFBMldhSERzTW5uVCtSdStNQzllOGNlN0RKNTAva2J2akF2WHZIalVqOW54L2dkMVZNb29QN2FrZkd3K3VocWdBcUlPbGdBQUFBQUFBQUFBQUF4L2JBTWYweUwwcjNoeVgzU3IveWtYdWI5VDlnQUprRlg1cEJrRTZwcFU4VjdtSzlnZVA1Qk9xYVZQRmU1aXZZRlVOMFhHR1g4ZEY2N2pvd3VJWWx6UDhySit5WUFHR20wQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUR4L0wzMVRUWDRYM01KbSswZ3k5OVUwMStGOXpDWnZwOVhxK0wwYmpuZFNHVTMrVU14MGt2eXJPMWpnQkpZZ2VXQnlVZnYzd1A1MWdJLzVLUDM3NEg4NndGYWQ4QmpkSytUN0poZkJlWmZock52TGZ1SW9BYWJKUUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFCaisyQVkvcGtYcFh2RGt2dWxYL0FKU0wzTitwK3dBRXlDcjg5Z3lDZGJNcWVLOXRGYVFNMzhnbld6S25pdmJSV2tDQXQ5UmpEQjRsdlhpRnlIazg4UzVWODAvc29BQVJwSjRBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQkIvS2g2ZjRvN25oZXZHWGdnL2xROVA4QUZIYzhMMTR6ZnQ3WGpPejRIL1JDRzkvYmlCRTQyRjlWSnZBV0psSTVZSEpSKy9mQS9uV0FqL2tvL2Z2Z2Z6ckFWcDN3R04wcjVQc21GOEY1bCtHczI4dCs0aWdCcHNsQUFBQUFBQUFBQUVIOHFIcC9panVlRjY4Wk42a09WRDAveFIzUEM5ZU1tOWFMY2N4WWtYd0o5Vk9mZStleC9uWGpWK2lBQnNzME9BQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQi8vWlwiLFxuICAgXCJpZFwiOiAyLFxuICAgXCJ3aWR0aFwiOiAyLFxuICAgXCJoZWlnaHRcIjogMlxuICB9XG4gXSxcbiBcIndpZHRoXCI6IDEsXG4gXCJoZWlnaHRcIjogMVxufSJdfQ==
