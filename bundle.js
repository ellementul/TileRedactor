(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const Hear = require("./Events.js");

function CrController(Logic, Draw){
	Hear("Categs", "click", function(event){
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

},{"./Events.js":3}],2:[function(require,module,exports){
require("typesjs");
const RGB = require('chromath').rgb;

var id_map = "Map";
var id_tiles = "Tiles";
var id_pallet = "Pallet";

function CrMap(){
	var container = getNode(id_map);
	var size = 20;
	
	drawGrid(container, size);
	
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

function CrTiles(){
	var container = getNode(id_tiles);
	
	this.add = function(Tileset){
		var categ = drawCateg(Tileset);
		container.appendChild(categ);
	}
}

function CrPallet(){
	var container = getNode(id_pallet);
	
	this.add = function(categ, tile){
		container.appendChild(drawTile(tile));
	}
}


module.exports = {
	map: new CrMap(), 
	tiles: new CrTiles(),
	openJSON: OpenFileJSON,
	save: Save
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

function CrSwitch(id, name_class){
	var elem = getNode(id).classList;
	return function(){
		elem.toggle(name_class);
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
		var Tile = document.createElement('div');
		Tile.classList.add("tile");
		Tile.setAttribute("tile", new_tile.id);
		Tile.style.backgroundColor = new RGB(new_tile.color).toString();
		return Tile;
	}
	if(new_tile.type == "svg"){
		var img = document.createElement('img');
		img.classList.add("tile");
		img.setAttribute("tile", new_tile.id);
		img.src = new_tile.img;
		return img;
	}
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
   "type": "svg",
   "img": "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgoKPHN2ZwogICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiCiAgIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyIKICAgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJjZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiCiAgIHhtbG5zOmlua3NjYXBlPSJodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy9uYW1lc3BhY2VzL2lua3NjYXBlIgogICB3aWR0aD0iMTAyNG1tIgogICBoZWlnaHQ9IjUxMm1tIgogICB2aWV3Qm94PSIwIDAgMTAyNCA1MTIiCiAgIHZlcnNpb249IjEuMSIKICAgaWQ9InN2ZzgyMjYiCiAgIGlua3NjYXBlOnZlcnNpb249IjAuOTIuMiAoNWMzZTgwZCwgMjAxNy0wOC0wNikiCiAgIHNvZGlwb2RpOmRvY25hbWU9ImRyYXdpbmcuc3ZnIj4KICA8ZGVmcwogICAgIGlkPSJkZWZzODIyMCIgLz4KICA8c29kaXBvZGk6bmFtZWR2aWV3CiAgICAgaWQ9ImJhc2UiCiAgICAgcGFnZWNvbG9yPSIjZmZmZmZmIgogICAgIGJvcmRlcmNvbG9yPSIjNjY2NjY2IgogICAgIGJvcmRlcm9wYWNpdHk9IjEuMCIKICAgICBpbmtzY2FwZTpwYWdlb3BhY2l0eT0iMC4wIgogICAgIGlua3NjYXBlOnBhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6em9vbT0iMC4wODgzODgzNDgiCiAgICAgaW5rc2NhcGU6Y3g9IjE0MTAuMzIxNSIKICAgICBpbmtzY2FwZTpjeT0iMjExLjg0OTQzIgogICAgIGlua3NjYXBlOmRvY3VtZW50LXVuaXRzPSJtbSIKICAgICBpbmtzY2FwZTpjdXJyZW50LWxheWVyPSJsYXllcjEiCiAgICAgc2hvd2dyaWQ9ImZhbHNlIgogICAgIGlua3NjYXBlOndpbmRvdy13aWR0aD0iMTM2NiIKICAgICBpbmtzY2FwZTp3aW5kb3ctaGVpZ2h0PSI3MDUiCiAgICAgaW5rc2NhcGU6d2luZG93LXg9Ii04IgogICAgIGlua3NjYXBlOndpbmRvdy15PSItOCIKICAgICBpbmtzY2FwZTp3aW5kb3ctbWF4aW1pemVkPSIxIiAvPgogIDxtZXRhZGF0YQogICAgIGlkPSJtZXRhZGF0YTgyMjMiPgogICAgPHJkZjpSREY+CiAgICAgIDxjYzpXb3JrCiAgICAgICAgIHJkZjphYm91dD0iIj4KICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3N2Zyt4bWw8L2RjOmZvcm1hdD4KICAgICAgICA8ZGM6dHlwZQogICAgICAgICAgIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiIC8+CiAgICAgICAgPGRjOnRpdGxlPjwvZGM6dGl0bGU+CiAgICAgIDwvY2M6V29yaz4KICAgIDwvcmRmOlJERj4KICA8L21ldGFkYXRhPgogIDxnCiAgICAgaW5rc2NhcGU6bGFiZWw9IkxheWVyIDEiCiAgICAgaW5rc2NhcGU6Z3JvdXBtb2RlPSJsYXllciIKICAgICBpZD0ibGF5ZXIxIgogICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAsMjE1KSI+CiAgICA8ZwogICAgICAgaWQ9Imc5NDgxIgogICAgICAgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMS4wMTE2MzE5LDAsMi41MTA4MzM4KSI+CiAgICAgIDxnCiAgICAgICAgIGlkPSJMYXllcjEwNjQiCiAgICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuNDUyNjEzNzIsMCwwLDAuNDUzOTI4NCwyODY3LjMwNTcsMzg2NS4xMDI5KSI+CiAgICAgICAgPHBhdGgKICAgICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIgogICAgICAgICAgIGlkPSJwYXRoNzU5OCIKICAgICAgICAgICBzdHlsZT0iZmlsbDojNTI1MjUyO2ZpbGwtcnVsZTpldmVub2RkIgogICAgICAgICAgIGQ9Im0gLTUxOTguOTgzNCwtODk5MC4zMTY5IHYgMTEzMy44NTgzIGggLTExMzMuODU4MiB2IC0xMTMzLjg1ODMgeiIgLz4KICAgICAgICA8cGF0aAogICAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiCiAgICAgICAgICAgaWQ9InBhdGg3NjAwIgogICAgICAgICAgIHN0eWxlPSJmaWxsOiNkMmQxZDI7ZmlsbC1ydWxlOmV2ZW5vZGQiCiAgICAgICAgICAgZD0ibSAtNTM5Ni41NzU5LC03ODU2LjQ1ODYgdiAtMTEzMy44NTgzIGggMTk3LjU5MjUgdiAxMTMzLjg1ODMgeiIgLz4KICAgICAgICA8cGF0aAogICAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiCiAgICAgICAgICAgaWQ9InBhdGg3NjAyIgogICAgICAgICAgIHN0eWxlPSJmaWxsOiM1MjUyNTI7ZmlsbC1ydWxlOmV2ZW5vZGQiCiAgICAgICAgICAgZD0ibSAtNTQ0Ny42MTA2LC04NTk0LjM3ODYgaCAyNDguNjI3MiB2IDM5Ni44NTA5IGggLTI0OC42MjcyIHoiIC8+CiAgICAgIDwvZz4KICAgICAgPGcKICAgICAgICAgaWQ9IkxheWVyMTA2NSIKICAgICAgICAgdHJhbnNmb3JtPSJtYXRyaXgoMC40NDk1MjI5MiwwLDAsMC40NTM5Mjg0LDI4NTEuMzM4MiwzODY1LjEwMjkpIj4KICAgICAgICA8cGF0aAogICAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiCiAgICAgICAgICAgaWQ9InBhdGg3NjA1IgogICAgICAgICAgIHN0eWxlPSJmaWxsOiM1MjUyNTI7ZmlsbC1ydWxlOmV2ZW5vZGQiCiAgICAgICAgICAgZD0ibSAtNTE5OS4yMDkzLC04OTkwLjMxNjkgdiAxMTMzLjg1ODMgaCAxMTMzLjg1ODMgdiAtMTEzMy44NTgzIHoiIC8+CiAgICAgICAgPHBhdGgKICAgICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIgogICAgICAgICAgIGlkPSJwYXRoNzYwNyIKICAgICAgICAgICBzdHlsZT0iZmlsbDojZDJkMWQyO2ZpbGwtcnVsZTpldmVub2RkIgogICAgICAgICAgIGQ9Im0gLTUwMDEuNjE2NywtNzg1Ni40NTg2IHYgLTExMzMuODU4MyBoIC0xOTcuNTkyNiB2IDExMzMuODU4MyB6IiAvPgogICAgICAgIDxwYXRoCiAgICAgICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIKICAgICAgICAgICBpZD0icGF0aDc2MDkiCiAgICAgICAgICAgc3R5bGU9ImZpbGw6IzUyNTI1MjtmaWxsLXJ1bGU6ZXZlbm9kZCIKICAgICAgICAgICBkPSJtIC00OTUwLjU4MjEsLTg1OTQuMzc4NiBoIC0yNDguNjI3MiB2IDM5Ni44NTA5IGggMjQ4LjYyNzIgeiIgLz4KICAgICAgPC9nPgogICAgPC9nPgogIDwvZz4KPC9zdmc+Cg==",
   "id": 0,
   "width": 2
  },
  {
   "type": "svg",
   "img": "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgdmlld0JveD0iMCAwIDMuNzc5NTI3NiA1LjM0NTMzMTgiCiAgIGhlaWdodD0iMWNtIgogICB3aWR0aD0iMWNtIgogICB2ZXJzaW9uPSIxLjEiCiAgIGlkPSJzdmcxNDUwOCIKICAgc29kaXBvZGk6ZG9jbmFtZT0iZm9uLnN2ZyIKICAgaW5rc2NhcGU6dmVyc2lvbj0iMC45Mi4xIHIxNTM3MSI+CiAgPG1ldGFkYXRhCiAgICAgaWQ9Im1ldGFkYXRhMTQ1MTQiPgogICAgPHJkZjpSREY+CiAgICAgIDxjYzpXb3JrCiAgICAgICAgIHJkZjphYm91dD0iIj4KICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3N2Zyt4bWw8L2RjOmZvcm1hdD4KICAgICAgICA8ZGM6dHlwZQogICAgICAgICAgIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiIC8+CiAgICAgICAgPGRjOnRpdGxlPjwvZGM6dGl0bGU+CiAgICAgIDwvY2M6V29yaz4KICAgIDwvcmRmOlJERj4KICA8L21ldGFkYXRhPgogIDxkZWZzCiAgICAgaWQ9ImRlZnMxNDUxMiIgLz4KICA8c29kaXBvZGk6bmFtZWR2aWV3CiAgICAgcGFnZWNvbG9yPSIjZmZmZmZmIgogICAgIGJvcmRlcmNvbG9yPSIjNjY2NjY2IgogICAgIGJvcmRlcm9wYWNpdHk9IjEiCiAgICAgb2JqZWN0dG9sZXJhbmNlPSIxMCIKICAgICBncmlkdG9sZXJhbmNlPSIxMCIKICAgICBndWlkZXRvbGVyYW5jZT0iMTAiCiAgICAgaW5rc2NhcGU6cGFnZW9wYWNpdHk9IjAiCiAgICAgaW5rc2NhcGU6cGFnZXNoYWRvdz0iMiIKICAgICBpbmtzY2FwZTp3aW5kb3ctd2lkdGg9IjEzNjYiCiAgICAgaW5rc2NhcGU6d2luZG93LWhlaWdodD0iNzE2IgogICAgIGlkPSJuYW1lZHZpZXcxNDUxMCIKICAgICBzaG93Z3JpZD0iZmFsc2UiCiAgICAgdW5pdHM9ImNtIgogICAgIGlua3NjYXBlOnpvb209IjcuMTkyMzgwOSIKICAgICBpbmtzY2FwZTpjeD0iNy4wMTI0NTU5IgogICAgIGlua3NjYXBlOmN5PSIyNS41MzA1MDkiCiAgICAgaW5rc2NhcGU6d2luZG93LXg9Ii04IgogICAgIGlua3NjYXBlOndpbmRvdy15PSItOCIKICAgICBpbmtzY2FwZTp3aW5kb3ctbWF4aW1pemVkPSIxIgogICAgIGlua3NjYXBlOmN1cnJlbnQtbGF5ZXI9InN2ZzE0NTA4IiAvPgogIDxnCiAgICAgdHJhbnNmb3JtPSJtYXRyaXgoMC4wMTU1NTc4NywwLDAsMC4wMTU1MDA4MywtMS4zMTg0OTk1LDAuNTQ2NDk4OTYpIgogICAgIGlkPSJnMTQ1MDYiPgogICAgPHJlY3QKICAgICAgIHdpZHRoPSI0My4wODkwMDEiCiAgICAgICBoZWlnaHQ9IjQzLjA4OTAwMSIKICAgICAgIHg9IjM0LjAxODAwMiIKICAgICAgIHk9IjUxLjMxNDk5OSIKICAgICAgIHJ4PSIwIgogICAgICAgcnk9IjAiCiAgICAgICBpZD0icmVjdDE0MzcwIiAvPgogICAgPHBhdGgKICAgICAgIGQ9Im0gNzcuMTA3LDUxLjMxNSBoIDQzLjA4OSBWIDk0LjQwNCBIIDc3LjEwNyBaIgogICAgICAgaWQ9InBhdGgxNDM3MiIKICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiCiAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmIiAvPgogICAgPHJlY3QKICAgICAgIHdpZHRoPSI0My4wODkwMDEiCiAgICAgICBoZWlnaHQ9IjQzLjA4OTAwMSIKICAgICAgIHg9IjEyMC4xOTYiCiAgICAgICB5PSI1MS4zMTQ5OTkiCiAgICAgICByeD0iMCIKICAgICAgIHJ5PSIwIgogICAgICAgaWQ9InJlY3QxNDM3NCIgLz4KICAgIDxwYXRoCiAgICAgICBkPSJtIDE2My4yODYsNTEuMzE1IGggNDMuMDg5IHYgNDMuMDg5IGggLTQzLjA4OSB6IgogICAgICAgaWQ9InBhdGgxNDM3NiIKICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiCiAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmIiAvPgogICAgPHJlY3QKICAgICAgIHdpZHRoPSI0My4wODkwMDEiCiAgICAgICBoZWlnaHQ9IjQzLjA4OTAwMSIKICAgICAgIHg9IjIwNi4zNzUiCiAgICAgICB5PSI1MS4zMTQ5OTkiCiAgICAgICByeD0iMCIKICAgICAgIHJ5PSIwIgogICAgICAgaWQ9InJlY3QxNDM3OCIgLz4KICAgIDxwYXRoCiAgICAgICBkPSJtIDI0OS40NjQsNTEuMzE1IGggNDMuMDg5IHYgNDMuMDg5IGggLTQzLjA4OSB6IgogICAgICAgaWQ9InBhdGgxNDM4MCIKICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiCiAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmIiAvPgogICAgPHJlY3QKICAgICAgIHdpZHRoPSI0My4wODkwMDEiCiAgICAgICBoZWlnaHQ9IjQzLjA4OTAwMSIKICAgICAgIHg9IjI5Mi41NTM5OSIKICAgICAgIHk9IjUxLjMxNDk5OSIKICAgICAgIHJ4PSIwIgogICAgICAgcnk9IjAiCiAgICAgICBpZD0icmVjdDE0MzgyIiAvPgogICAgPHBhdGgKICAgICAgIGQ9Im0gMzM1LjY0Myw1MS4zMTUgaCA0My4wODkgdiA0My4wODkgaCAtNDMuMDg5IHoiCiAgICAgICBpZD0icGF0aDE0Mzg0IgogICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIKICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmYiIC8+CiAgICA8ZwogICAgICAgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMzQ2Ljk4MiwzMDIuNTgpIgogICAgICAgaWQ9ImcxNDQwMiI+CiAgICAgIDxyZWN0CiAgICAgICAgIHJ5PSIwIgogICAgICAgICByeD0iMCIKICAgICAgICAgeT0iLTIwOC4xNzU5OSIKICAgICAgICAgeD0iLTExLjMzOSIKICAgICAgICAgaGVpZ2h0PSI0My4wODkwMDEiCiAgICAgICAgIHdpZHRoPSI0My4wODkwMDEiCiAgICAgICAgIGlkPSJyZWN0MTQzODYiIC8+CiAgICAgIDxwYXRoCiAgICAgICAgIGQ9Im0gLTU0LjQyOSwtMjA4LjE3NiBoIDQzLjA4OSB2IDQzLjA4OSBoIC00My4wODkgeiIKICAgICAgICAgaWQ9InBhdGgxNDM4OCIKICAgICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIKICAgICAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZiIgLz4KICAgICAgPHJlY3QKICAgICAgICAgcnk9IjAiCiAgICAgICAgIHJ4PSIwIgogICAgICAgICB5PSItMjA4LjE3NTk5IgogICAgICAgICB4PSItOTcuNTE3OTk4IgogICAgICAgICBoZWlnaHQ9IjQzLjA4OTAwMSIKICAgICAgICAgd2lkdGg9IjQzLjA4OTAwMSIKICAgICAgICAgaWQ9InJlY3QxNDM5MCIgLz4KICAgICAgPHBhdGgKICAgICAgICAgZD0ibSAtMTQwLjYwNywtMjA4LjE3NiBoIDQzLjA4OSB2IDQzLjA4OSBoIC00My4wODkgeiIKICAgICAgICAgaWQ9InBhdGgxNDM5MiIKICAgICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIKICAgICAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZiIgLz4KICAgICAgPHJlY3QKICAgICAgICAgcnk9IjAiCiAgICAgICAgIHJ4PSIwIgogICAgICAgICB5PSItMjA4LjE3NTk5IgogICAgICAgICB4PSItMTgzLjY5NiIKICAgICAgICAgaGVpZ2h0PSI0My4wODkwMDEiCiAgICAgICAgIHdpZHRoPSI0My4wODkwMDEiCiAgICAgICAgIGlkPSJyZWN0MTQzOTQiIC8+CiAgICAgIDxwYXRoCiAgICAgICAgIGQ9Im0gLTIyNi43ODYsLTIwOC4xNzYgaCA0My4wODkgdiA0My4wODkgaCAtNDMuMDg5IHoiCiAgICAgICAgIGlkPSJwYXRoMTQzOTYiCiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiCiAgICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmYiIC8+CiAgICAgIDxyZWN0CiAgICAgICAgIHJ5PSIwIgogICAgICAgICByeD0iMCIKICAgICAgICAgeT0iLTIwOC4xNzU5OSIKICAgICAgICAgeD0iLTI2OS44NzUiCiAgICAgICAgIGhlaWdodD0iNDMuMDg5MDAxIgogICAgICAgICB3aWR0aD0iNDMuMDg5MDAxIgogICAgICAgICBpZD0icmVjdDE0Mzk4IiAvPgogICAgICA8cGF0aAogICAgICAgICBkPSJtIC0zMTIuOTY0LC0yMDguMTc2IGggNDMuMDg5IHYgNDMuMDg5IGggLTQzLjA4OSB6IgogICAgICAgICBpZD0icGF0aDE0NDAwIgogICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIgogICAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmIiAvPgogICAgPC9nPgogICAgPHJlY3QKICAgICAgIHdpZHRoPSI0My4wODkwMDEiCiAgICAgICBoZWlnaHQ9IjQzLjA4OTAwMSIKICAgICAgIHg9IjM0LjAxODAwMiIKICAgICAgIHk9IjEzNy40OTQiCiAgICAgICByeD0iMCIKICAgICAgIHJ5PSIwIgogICAgICAgaWQ9InJlY3QxNDQwNCIgLz4KICAgIDxwYXRoCiAgICAgICBkPSJtIDc3LjEwNywxMzcuNDk0IGggNDMuMDg5IHYgNDMuMDg5IEggNzcuMTA3IFoiCiAgICAgICBpZD0icGF0aDE0NDA2IgogICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIKICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmYiIC8+CiAgICA8cmVjdAogICAgICAgd2lkdGg9IjQzLjA4OTAwMSIKICAgICAgIGhlaWdodD0iNDMuMDg5MDAxIgogICAgICAgeD0iMTIwLjE5NiIKICAgICAgIHk9IjEzNy40OTQiCiAgICAgICByeD0iMCIKICAgICAgIHJ5PSIwIgogICAgICAgaWQ9InJlY3QxNDQwOCIgLz4KICAgIDxwYXRoCiAgICAgICBkPSJtIDE2My4yODYsMTM3LjQ5NCBoIDQzLjA4OSB2IDQzLjA4OSBoIC00My4wODkgeiIKICAgICAgIGlkPSJwYXRoMTQ0MTAiCiAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIgogICAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZiIgLz4KICAgIDxyZWN0CiAgICAgICB3aWR0aD0iNDMuMDg5MDAxIgogICAgICAgaGVpZ2h0PSI0My4wODkwMDEiCiAgICAgICB4PSIyMDYuMzc1IgogICAgICAgeT0iMTM3LjQ5NCIKICAgICAgIHJ4PSIwIgogICAgICAgcnk9IjAiCiAgICAgICBpZD0icmVjdDE0NDEyIiAvPgogICAgPHBhdGgKICAgICAgIGQ9Im0gMjQ5LjQ2NCwxMzcuNDk0IGggNDMuMDg5IHYgNDMuMDg5IGggLTQzLjA4OSB6IgogICAgICAgaWQ9InBhdGgxNDQxNCIKICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiCiAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmIiAvPgogICAgPHJlY3QKICAgICAgIHdpZHRoPSI0My4wODkwMDEiCiAgICAgICBoZWlnaHQ9IjQzLjA4OTAwMSIKICAgICAgIHg9IjI5Mi41NTM5OSIKICAgICAgIHk9IjEzNy40OTQiCiAgICAgICByeD0iMCIKICAgICAgIHJ5PSIwIgogICAgICAgaWQ9InJlY3QxNDQxNiIgLz4KICAgIDxwYXRoCiAgICAgICBkPSJtIDMzNS42NDMsMTM3LjQ5NCBoIDQzLjA4OSB2IDQzLjA4OSBoIC00My4wODkgeiIKICAgICAgIGlkPSJwYXRoMTQ0MTgiCiAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIgogICAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZiIgLz4KICAgIDxnCiAgICAgICB0cmFuc2Zvcm09InRyYW5zbGF0ZSgzNDYuOTgyLDM4OC43NTkpIgogICAgICAgaWQ9ImcxNDQzNiI+CiAgICAgIDxyZWN0CiAgICAgICAgIHJ5PSIwIgogICAgICAgICByeD0iMCIKICAgICAgICAgeT0iLTIwOC4xNzU5OSIKICAgICAgICAgeD0iLTExLjMzOSIKICAgICAgICAgaGVpZ2h0PSI0My4wODkwMDEiCiAgICAgICAgIHdpZHRoPSI0My4wODkwMDEiCiAgICAgICAgIGlkPSJyZWN0MTQ0MjAiIC8+CiAgICAgIDxwYXRoCiAgICAgICAgIGQ9Im0gLTU0LjQyOSwtMjA4LjE3NiBoIDQzLjA4OSB2IDQzLjA4OSBoIC00My4wODkgeiIKICAgICAgICAgaWQ9InBhdGgxNDQyMiIKICAgICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIKICAgICAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZiIgLz4KICAgICAgPHJlY3QKICAgICAgICAgcnk9IjAiCiAgICAgICAgIHJ4PSIwIgogICAgICAgICB5PSItMjA4LjE3NTk5IgogICAgICAgICB4PSItOTcuNTE3OTk4IgogICAgICAgICBoZWlnaHQ9IjQzLjA4OTAwMSIKICAgICAgICAgd2lkdGg9IjQzLjA4OTAwMSIKICAgICAgICAgaWQ9InJlY3QxNDQyNCIgLz4KICAgICAgPHBhdGgKICAgICAgICAgZD0ibSAtMTQwLjYwNywtMjA4LjE3NiBoIDQzLjA4OSB2IDQzLjA4OSBoIC00My4wODkgeiIKICAgICAgICAgaWQ9InBhdGgxNDQyNiIKICAgICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIKICAgICAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZiIgLz4KICAgICAgPHJlY3QKICAgICAgICAgcnk9IjAiCiAgICAgICAgIHJ4PSIwIgogICAgICAgICB5PSItMjA4LjE3NTk5IgogICAgICAgICB4PSItMTgzLjY5NiIKICAgICAgICAgaGVpZ2h0PSI0My4wODkwMDEiCiAgICAgICAgIHdpZHRoPSI0My4wODkwMDEiCiAgICAgICAgIGlkPSJyZWN0MTQ0MjgiIC8+CiAgICAgIDxwYXRoCiAgICAgICAgIGQ9Im0gLTIyNi43ODYsLTIwOC4xNzYgaCA0My4wODkgdiA0My4wODkgaCAtNDMuMDg5IHoiCiAgICAgICAgIGlkPSJwYXRoMTQ0MzAiCiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiCiAgICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmYiIC8+CiAgICAgIDxyZWN0CiAgICAgICAgIHJ5PSIwIgogICAgICAgICByeD0iMCIKICAgICAgICAgeT0iLTIwOC4xNzU5OSIKICAgICAgICAgeD0iLTI2OS44NzUiCiAgICAgICAgIGhlaWdodD0iNDMuMDg5MDAxIgogICAgICAgICB3aWR0aD0iNDMuMDg5MDAxIgogICAgICAgICBpZD0icmVjdDE0NDMyIiAvPgogICAgICA8cGF0aAogICAgICAgICBkPSJtIC0zMTIuOTY0LC0yMDguMTc2IGggNDMuMDg5IHYgNDMuMDg5IGggLTQzLjA4OSB6IgogICAgICAgICBpZD0icGF0aDE0NDM0IgogICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIgogICAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmIiAvPgogICAgPC9nPgogICAgPHJlY3QKICAgICAgIHdpZHRoPSI0My4wODkwMDEiCiAgICAgICBoZWlnaHQ9IjQzLjA4OTAwMSIKICAgICAgIHg9IjM0LjAxODAwMiIKICAgICAgIHk9IjIyMy42NzMiCiAgICAgICByeD0iMCIKICAgICAgIHJ5PSIwIgogICAgICAgaWQ9InJlY3QxNDQzOCIgLz4KICAgIDxwYXRoCiAgICAgICBkPSJtIDc3LjEwNywyMjMuNjczIGggNDMuMDg5IHYgNDMuMDg5IEggNzcuMTA3IFoiCiAgICAgICBpZD0icGF0aDE0NDQwIgogICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIKICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmYiIC8+CiAgICA8cmVjdAogICAgICAgd2lkdGg9IjQzLjA4OTAwMSIKICAgICAgIGhlaWdodD0iNDMuMDg5MDAxIgogICAgICAgeD0iMTIwLjE5NiIKICAgICAgIHk9IjIyMy42NzMiCiAgICAgICByeD0iMCIKICAgICAgIHJ5PSIwIgogICAgICAgaWQ9InJlY3QxNDQ0MiIgLz4KICAgIDxwYXRoCiAgICAgICBkPSJtIDE2My4yODYsMjIzLjY3MyBoIDQzLjA4OSB2IDQzLjA4OSBoIC00My4wODkgeiIKICAgICAgIGlkPSJwYXRoMTQ0NDQiCiAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIgogICAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZiIgLz4KICAgIDxyZWN0CiAgICAgICB3aWR0aD0iNDMuMDg5MDAxIgogICAgICAgaGVpZ2h0PSI0My4wODkwMDEiCiAgICAgICB4PSIyMDYuMzc1IgogICAgICAgeT0iMjIzLjY3MyIKICAgICAgIHJ4PSIwIgogICAgICAgcnk9IjAiCiAgICAgICBpZD0icmVjdDE0NDQ2IiAvPgogICAgPHBhdGgKICAgICAgIGQ9Im0gMjQ5LjQ2NCwyMjMuNjczIGggNDMuMDg5IHYgNDMuMDg5IGggLTQzLjA4OSB6IgogICAgICAgaWQ9InBhdGgxNDQ0OCIKICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiCiAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmIiAvPgogICAgPHJlY3QKICAgICAgIHdpZHRoPSI0My4wODkwMDEiCiAgICAgICBoZWlnaHQ9IjQzLjA4OTAwMSIKICAgICAgIHg9IjI5Mi41NTM5OSIKICAgICAgIHk9IjIyMy42NzMiCiAgICAgICByeD0iMCIKICAgICAgIHJ5PSIwIgogICAgICAgaWQ9InJlY3QxNDQ1MCIgLz4KICAgIDxwYXRoCiAgICAgICBkPSJtIDMzNS42NDMsMjIzLjY3MyBoIDQzLjA4OSB2IDQzLjA4OSBoIC00My4wODkgeiIKICAgICAgIGlkPSJwYXRoMTQ0NTIiCiAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIgogICAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZiIgLz4KICAgIDxnCiAgICAgICB0cmFuc2Zvcm09InRyYW5zbGF0ZSgzNDYuOTgyLDQ3NC45MzgpIgogICAgICAgaWQ9ImcxNDQ3MCI+CiAgICAgIDxyZWN0CiAgICAgICAgIHJ5PSIwIgogICAgICAgICByeD0iMCIKICAgICAgICAgeT0iLTIwOC4xNzU5OSIKICAgICAgICAgeD0iLTExLjMzOSIKICAgICAgICAgaGVpZ2h0PSI0My4wODkwMDEiCiAgICAgICAgIHdpZHRoPSI0My4wODkwMDEiCiAgICAgICAgIGlkPSJyZWN0MTQ0NTQiIC8+CiAgICAgIDxwYXRoCiAgICAgICAgIGQ9Im0gLTU0LjQyOSwtMjA4LjE3NiBoIDQzLjA4OSB2IDQzLjA4OSBoIC00My4wODkgeiIKICAgICAgICAgaWQ9InBhdGgxNDQ1NiIKICAgICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIKICAgICAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZiIgLz4KICAgICAgPHJlY3QKICAgICAgICAgcnk9IjAiCiAgICAgICAgIHJ4PSIwIgogICAgICAgICB5PSItMjA4LjE3NTk5IgogICAgICAgICB4PSItOTcuNTE3OTk4IgogICAgICAgICBoZWlnaHQ9IjQzLjA4OTAwMSIKICAgICAgICAgd2lkdGg9IjQzLjA4OTAwMSIKICAgICAgICAgaWQ9InJlY3QxNDQ1OCIgLz4KICAgICAgPHBhdGgKICAgICAgICAgZD0ibSAtMTQwLjYwNywtMjA4LjE3NiBoIDQzLjA4OSB2IDQzLjA4OSBoIC00My4wODkgeiIKICAgICAgICAgaWQ9InBhdGgxNDQ2MCIKICAgICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIKICAgICAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZiIgLz4KICAgICAgPHJlY3QKICAgICAgICAgcnk9IjAiCiAgICAgICAgIHJ4PSIwIgogICAgICAgICB5PSItMjA4LjE3NTk5IgogICAgICAgICB4PSItMTgzLjY5NiIKICAgICAgICAgaGVpZ2h0PSI0My4wODkwMDEiCiAgICAgICAgIHdpZHRoPSI0My4wODkwMDEiCiAgICAgICAgIGlkPSJyZWN0MTQ0NjIiIC8+CiAgICAgIDxwYXRoCiAgICAgICAgIGQ9Im0gLTIyNi43ODYsLTIwOC4xNzYgaCA0My4wODkgdiA0My4wODkgaCAtNDMuMDg5IHoiCiAgICAgICAgIGlkPSJwYXRoMTQ0NjQiCiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiCiAgICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmYiIC8+CiAgICAgIDxyZWN0CiAgICAgICAgIHJ5PSIwIgogICAgICAgICByeD0iMCIKICAgICAgICAgeT0iLTIwOC4xNzU5OSIKICAgICAgICAgeD0iLTI2OS44NzUiCiAgICAgICAgIGhlaWdodD0iNDMuMDg5MDAxIgogICAgICAgICB3aWR0aD0iNDMuMDg5MDAxIgogICAgICAgICBpZD0icmVjdDE0NDY2IiAvPgogICAgICA8cGF0aAogICAgICAgICBkPSJtIC0zMTIuOTY0LC0yMDguMTc2IGggNDMuMDg5IHYgNDMuMDg5IGggLTQzLjA4OSB6IgogICAgICAgICBpZD0icGF0aDE0NDY4IgogICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIgogICAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmIiAvPgogICAgPC9nPgogICAgPHJlY3QKICAgICAgIHdpZHRoPSI0My4wODkwMDEiCiAgICAgICBoZWlnaHQ9IjQzLjA4OTAwMSIKICAgICAgIHg9IjM0LjAxODAwMiIKICAgICAgIHk9Ii0zNC44NjI5OTkiCiAgICAgICByeD0iMCIKICAgICAgIHJ5PSIwIgogICAgICAgaWQ9InJlY3QxNDQ3MiIgLz4KICAgIDxwYXRoCiAgICAgICBkPSJtIDc3LjEwNywtMzQuODYzIGggNDMuMDg5IFYgOC4yMjYgSCA3Ny4xMDcgWiIKICAgICAgIGlkPSJwYXRoMTQ0NzQiCiAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIgogICAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZiIgLz4KICAgIDxyZWN0CiAgICAgICB3aWR0aD0iNDMuMDg5MDAxIgogICAgICAgaGVpZ2h0PSI0My4wODkwMDEiCiAgICAgICB4PSIxMjAuMTk2IgogICAgICAgeT0iLTM0Ljg2Mjk5OSIKICAgICAgIHJ4PSIwIgogICAgICAgcnk9IjAiCiAgICAgICBpZD0icmVjdDE0NDc2IiAvPgogICAgPHBhdGgKICAgICAgIGQ9Im0gMTYzLjI4NiwtMzQuODYzIGggNDMuMDg5IFYgOC4yMjYgaCAtNDMuMDg5IHoiCiAgICAgICBpZD0icGF0aDE0NDc4IgogICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIKICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmYiIC8+CiAgICA8cmVjdAogICAgICAgd2lkdGg9IjQzLjA4OTAwMSIKICAgICAgIGhlaWdodD0iNDMuMDg5MDAxIgogICAgICAgeD0iMjA2LjM3NSIKICAgICAgIHk9Ii0zNC44NjI5OTkiCiAgICAgICByeD0iMCIKICAgICAgIHJ5PSIwIgogICAgICAgaWQ9InJlY3QxNDQ4MCIgLz4KICAgIDxwYXRoCiAgICAgICBkPSJtIDI0OS40NjQsLTM0Ljg2MyBoIDQzLjA4OSBWIDguMjI2IGggLTQzLjA4OSB6IgogICAgICAgaWQ9InBhdGgxNDQ4MiIKICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiCiAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmIiAvPgogICAgPHJlY3QKICAgICAgIHdpZHRoPSI0My4wODkwMDEiCiAgICAgICBoZWlnaHQ9IjQzLjA4OTAwMSIKICAgICAgIHg9IjI5Mi41NTM5OSIKICAgICAgIHk9Ii0zNC44NjI5OTkiCiAgICAgICByeD0iMCIKICAgICAgIHJ5PSIwIgogICAgICAgaWQ9InJlY3QxNDQ4NCIgLz4KICAgIDxwYXRoCiAgICAgICBkPSJtIDMzNS42NDMsLTM0Ljg2MyBoIDQzLjA4OSBWIDguMjI2IGggLTQzLjA4OSB6IgogICAgICAgaWQ9InBhdGgxNDQ4NiIKICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiCiAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmIiAvPgogICAgPGcKICAgICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKDM0Ni45ODIsMjE2LjQwMikiCiAgICAgICBpZD0iZzE0NTA0Ij4KICAgICAgPHJlY3QKICAgICAgICAgcnk9IjAiCiAgICAgICAgIHJ4PSIwIgogICAgICAgICB5PSItMjA4LjE3NTk5IgogICAgICAgICB4PSItMTEuMzM5IgogICAgICAgICBoZWlnaHQ9IjQzLjA4OTAwMSIKICAgICAgICAgd2lkdGg9IjQzLjA4OTAwMSIKICAgICAgICAgaWQ9InJlY3QxNDQ4OCIgLz4KICAgICAgPHBhdGgKICAgICAgICAgZD0ibSAtNTQuNDI5LC0yMDguMTc2IGggNDMuMDg5IHYgNDMuMDg5IGggLTQzLjA4OSB6IgogICAgICAgICBpZD0icGF0aDE0NDkwIgogICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIgogICAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmIiAvPgogICAgICA8cmVjdAogICAgICAgICByeT0iMCIKICAgICAgICAgcng9IjAiCiAgICAgICAgIHk9Ii0yMDguMTc1OTkiCiAgICAgICAgIHg9Ii05Ny41MTc5OTgiCiAgICAgICAgIGhlaWdodD0iNDMuMDg5MDAxIgogICAgICAgICB3aWR0aD0iNDMuMDg5MDAxIgogICAgICAgICBpZD0icmVjdDE0NDkyIiAvPgogICAgICA8cGF0aAogICAgICAgICBkPSJtIC0xNDAuNjA3LC0yMDguMTc2IGggNDMuMDg5IHYgNDMuMDg5IGggLTQzLjA4OSB6IgogICAgICAgICBpZD0icGF0aDE0NDk0IgogICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIgogICAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmIiAvPgogICAgICA8cmVjdAogICAgICAgICByeT0iMCIKICAgICAgICAgcng9IjAiCiAgICAgICAgIHk9Ii0yMDguMTc1OTkiCiAgICAgICAgIHg9Ii0xODMuNjk2IgogICAgICAgICBoZWlnaHQ9IjQzLjA4OTAwMSIKICAgICAgICAgd2lkdGg9IjQzLjA4OTAwMSIKICAgICAgICAgaWQ9InJlY3QxNDQ5NiIgLz4KICAgICAgPHBhdGgKICAgICAgICAgZD0ibSAtMjI2Ljc4NiwtMjA4LjE3NiBoIDQzLjA4OSB2IDQzLjA4OSBoIC00My4wODkgeiIKICAgICAgICAgaWQ9InBhdGgxNDQ5OCIKICAgICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIKICAgICAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZiIgLz4KICAgICAgPHJlY3QKICAgICAgICAgcnk9IjAiCiAgICAgICAgIHJ4PSIwIgogICAgICAgICB5PSItMjA4LjE3NTk5IgogICAgICAgICB4PSItMjY5Ljg3NSIKICAgICAgICAgaGVpZ2h0PSI0My4wODkwMDEiCiAgICAgICAgIHdpZHRoPSI0My4wODkwMDEiCiAgICAgICAgIGlkPSJyZWN0MTQ1MDAiIC8+CiAgICAgIDxwYXRoCiAgICAgICAgIGQ9Im0gLTMxMi45NjQsLTIwOC4xNzYgaCA0My4wODkgdiA0My4wODkgaCAtNDMuMDg5IHoiCiAgICAgICAgIGlkPSJwYXRoMTQ1MDIiCiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiCiAgICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmYiIC8+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4K",
   "id": 1,
   "width": 3,
   "height": 3
  },
  {
   "type": "svg",
   "img": "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgaWQ9InN2ZzEzMzQ0IgogICB2ZXJzaW9uPSIxLjEiCiAgIHZpZXdCb3g9IjAgMCAyMTAgMjEwIgogICBoZWlnaHQ9IjIxMG1tIgogICB3aWR0aD0iMjEwbW0iPgogIDxkZWZzCiAgICAgaWQ9ImRlZnMxMzMzOCIgLz4KICA8bWV0YWRhdGEKICAgICBpZD0ibWV0YWRhdGExMzM0MSI+CiAgICA8cmRmOlJERj4KICAgICAgPGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPgogICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PgogICAgICAgIDxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz4KICAgICAgICA8ZGM6dGl0bGU+PC9kYzp0aXRsZT4KICAgICAgPC9jYzpXb3JrPgogICAgPC9yZGY6UkRGPgogIDwvbWV0YWRhdGE+CiAgPGcKICAgICB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLC04NykiCiAgICAgaWQ9ImxheWVyMSI+CiAgICA8cGF0aAogICAgICAgaWQ9InBhdGg2NjYzIgogICAgICAgc3R5bGU9ImZpbGw6IzdkOGVhNTtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6IzJjMmEyOTtzdHJva2Utd2lkdGg6NC4xMDAwNDMzO3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1kYXNoYXJyYXk6bm9uZSIKICAgICAgIGQ9Im0gMjAzLjU0OTc3LDI2MS4wMDc5NCB2IDI1Ljg3MjgzIHEgMCw4LjM0NjE3IC04LjI3NzMzLDguMzQ2MTcgSCAxNS40NTgwNTYgcSAtOC4yNzczMiwwIC04LjI3NzMyLC04LjM0NjE3IHYgLTI1Ljg3MjgzIHEgMCwtOC4zNDYxNyA4LjI3NzMyLC04LjM0NjE3IEggMTk1LjI3MjQ0IHEgOC4yNzczMywwIDguMjc3MzMsOC4zNDYxNyB6IiAvPgogICAgPHBhdGgKICAgICAgIGlkPSJwYXRoNjY2NSIKICAgICAgIHN0eWxlPSJmaWxsOiM0OTQ4NDg7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOiMyYzJhMjk7c3Ryb2tlLXdpZHRoOjQuMTAwMDQzMztzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtZGFzaGFycmF5Om5vbmUiCiAgICAgICBkPSJtIDE5Ny4yNzgwNSwyNTUuMTQ4NzQgdiAzNy41OTU5NyBxIDAsMi4zMjgzIC0yLjMwOTA5LDIuMzI4MyBoIC0wLjUxMDY4IHEgLTIuMzA5MDksMCAtMi4zMDkwOSwtMi4zMjgzIHYgLTM3LjU5NTk3IHEgMCwtMi4zMjgzIDIuMzA5MDksLTIuMzI4MyBoIDAuNTEwNjggcSAyLjMwOTA5LDAgMi4zMDkwOSwyLjMyODMgeiIgLz4KICAgIDxwYXRoCiAgICAgICBpZD0icGF0aDY2NjciCiAgICAgICBzdHlsZT0iZmlsbDojNDk0ODQ4O2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTojMmMyYTI5O3N0cm9rZS13aWR0aDo0LjEwMDA0MzM7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLWRhc2hhcnJheTpub25lIgogICAgICAgZD0ibSAxNzcuNjI4NjcsMjUyLjgyMDQ0IHYgNDIuMjUyNTcgaCAtNS4xMjg4NiB2IC00Mi4yNTI1NyB6IiAvPgogICAgPHBhdGgKICAgICAgIGlkPSJwYXRoNjY2OSIKICAgICAgIHN0eWxlPSJmaWxsOiM0OTQ4NDg7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOiMyYzJhMjk7c3Ryb2tlLXdpZHRoOjQuMTAwMDQzMztzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtZGFzaGFycmF5Om5vbmUiCiAgICAgICBkPSJtIDE1Ny44NDAzNSwyNTIuODIwNDQgdiA0Mi4yNTI1NyBoIC01LjEyODg3IHYgLTQyLjI1MjU3IHoiIC8+CiAgICA8cGF0aAogICAgICAgaWQ9InBhdGg2NjcxIgogICAgICAgc3R5bGU9ImZpbGw6IzQ5NDg0ODtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6IzJjMmEyOTtzdHJva2Utd2lkdGg6NC4xMDAwNDMzO3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1kYXNoYXJyYXk6bm9uZSIKICAgICAgIGQ9Im0gMTM3LjgwNSwyNTIuODIwNDQgdiA0Mi4yNTI1NyBoIC01LjEyODg2IHYgLTQyLjI1MjU3IHoiIC8+CiAgICA8cGF0aAogICAgICAgaWQ9InBhdGg2NjczIgogICAgICAgc3R5bGU9ImZpbGw6IzQ5NDg0ODtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6IzJjMmEyOTtzdHJva2Utd2lkdGg6NC4xMDAwNDMzO3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1kYXNoYXJyYXk6bm9uZSIKICAgICAgIGQ9Im0gMTE4LjE1NTYyLDI1Mi44MjA0NCB2IDQyLjI1MjU3IGggLTUuMTI4ODQgdiAtNDIuMjUyNTcgeiIgLz4KICAgIDxwYXRoCiAgICAgICBpZD0icGF0aDY2NzUiCiAgICAgICBzdHlsZT0iZmlsbDojNDk0ODQ4O2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTojMmMyYTI5O3N0cm9rZS13aWR0aDo0LjEwMDA0MzM7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLWRhc2hhcnJheTpub25lIgogICAgICAgZD0ibSA5OC4zNjcyOTYsMjUyLjgyMDQ0IHYgNDIuMjUyNTcgaCAtNS4xMjg4NyB2IC00Mi4yNTI1NyB6IiAvPgogICAgPHBhdGgKICAgICAgIGlkPSJwYXRoNjY3NyIKICAgICAgIHN0eWxlPSJmaWxsOiM0OTQ4NDg7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOiMyYzJhMjk7c3Ryb2tlLXdpZHRoOjQuMTAwMDQzMztzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtZGFzaGFycmF5Om5vbmUiCiAgICAgICBkPSJtIDc4LjAwNzU2NiwyNTIuODIwNDQgdiA0Mi4yNTI1NyBoIC01LjEyODg2IHYgLTQyLjI1MjU3IHoiIC8+CiAgICA8cGF0aAogICAgICAgaWQ9InBhdGg2Njc5IgogICAgICAgc3R5bGU9ImZpbGw6IzQ5NDg0ODtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6IzJjMmEyOTtzdHJva2Utd2lkdGg6NC4xMDAwNDMzO3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1kYXNoYXJyYXk6bm9uZSIKICAgICAgIGQ9Im0gNTguMzU4MTg2LDI1Mi44MjA0NCB2IDQyLjI1MjU3IGggLTUuMTI4ODYgdiAtNDIuMjUyNTcgeiIgLz4KICAgIDxwYXRoCiAgICAgICBpZD0icGF0aDY2ODEiCiAgICAgICBzdHlsZT0iZmlsbDojNDk0ODQ4O2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTojMmMyYTI5O3N0cm9rZS13aWR0aDo0LjEwMDA0MzM7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLWRhc2hhcnJheTpub25lIgogICAgICAgZD0ibSAzOC41Njk4NDYsMjUyLjgyMDQ0IHYgNDIuMjUyNTcgaCAtNS4xMjg4NSB2IC00Mi4yNTI1NyB6IiAvPgogICAgPHBhdGgKICAgICAgIGlkPSJwYXRoNjY4MyIKICAgICAgIHN0eWxlPSJmaWxsOiM0OTQ4NDg7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOiMyYzJhMjk7c3Ryb2tlLXdpZHRoOjQuMTAwMDQzMztzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtZGFzaGFycmF5Om5vbmUiCiAgICAgICBkPSJtIDE4LjQ1NzM4NiwyNTQuOTY2NjQgdiAzNy45NjAxNyBxIDAsMi4xNDYyIC0yLjEyODUsMi4xNDYyIGggLTAuODcxODkgcSAtMi4xMjg0OCwwIC0yLjEyODQ4LC0yLjE0NjIgdiAtMzcuOTYwMTcgcSAwLC0yLjE0NjIgMi4xMjg0OCwtMi4xNDYyIGggMC44NzE4OSBxIDIuMTI4NSwwIDIuMTI4NSwyLjE0NjIgeiIgLz4KICAgIDxwYXRoCiAgICAgICBpZD0icGF0aDY2ODUiCiAgICAgICBzdHlsZT0iZmlsbDojN2Q4ZWE1O2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTojMmMyYTI5O3N0cm9rZS13aWR0aDo0LjEwMDA0MzM7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLWRhc2hhcnJheTpub25lIgogICAgICAgZD0ibSAyMDMuNTQ5NzcsOTcuNzIwNDYgdiAyNS44NzI4MyBxIDAsOC4zNDYxNyAtOC4yNzczMyw4LjM0NjE3IEggMTUuNDU4MDU2IHEgLTguMjc3MzIsMCAtOC4yNzczMiwtOC4zNDYxNyBWIDk3LjcyMDQ2IHEgMCwtOC4zNDYxNzIgOC4yNzczMiwtOC4zNDYxNzIgSCAxOTUuMjcyNDQgcSA4LjI3NzMzLDAgOC4yNzczMyw4LjM0NjE3MiB6IiAvPgogICAgPHBhdGgKICAgICAgIGlkPSJwYXRoNjY4NyIKICAgICAgIHN0eWxlPSJmaWxsOiM0OTQ4NDg7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOiMyYzJhMjk7c3Ryb2tlLXdpZHRoOjQuMTAwMDQzMztzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtZGFzaGFycmF5Om5vbmUiCiAgICAgICBkPSJtIDE5Ny4yNzgwNSw5MS44NjEyNTkgdiAzNy41OTU5NzEgcSAwLDIuMzI4MjkgLTIuMzA5MDksMi4zMjgyOSBoIC0wLjUxMDY4IHEgLTIuMzA5MDksMCAtMi4zMDkwOSwtMi4zMjgyOSBWIDkxLjg2MTI1OSBxIDAsLTIuMzI4Mjk2IDIuMzA5MDksLTIuMzI4Mjk2IGggMC41MTA2OCBxIDIuMzA5MDksMCAyLjMwOTA5LDIuMzI4Mjk2IHoiIC8+CiAgICA8cGF0aAogICAgICAgaWQ9InBhdGg2Njg5IgogICAgICAgc3R5bGU9ImZpbGw6IzQ5NDg0ODtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6IzJjMmEyOTtzdHJva2Utd2lkdGg6NC4xMDAwNDMzO3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1kYXNoYXJyYXk6bm9uZSIKICAgICAgIGQ9Im0gMTc3LjYyODY3LDg5LjUzMjk2MyB2IDQyLjI1MjU1NyBoIC01LjEyODg2IFYgODkuNTMyOTYzIFoiIC8+CiAgICA8cGF0aAogICAgICAgaWQ9InBhdGg2NjkxIgogICAgICAgc3R5bGU9ImZpbGw6IzQ5NDg0ODtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6IzJjMmEyOTtzdHJva2Utd2lkdGg6NC4xMDAwNDMzO3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1kYXNoYXJyYXk6bm9uZSIKICAgICAgIGQ9Im0gMTU3Ljg0MDM1LDg5LjUzMjk2MyB2IDQyLjI1MjU1NyBoIC01LjEyODg3IFYgODkuNTMyOTYzIFoiIC8+CiAgICA8cGF0aAogICAgICAgaWQ9InBhdGg2NjkzIgogICAgICAgc3R5bGU9ImZpbGw6IzQ5NDg0ODtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6IzJjMmEyOTtzdHJva2Utd2lkdGg6NC4xMDAwNDMzO3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1kYXNoYXJyYXk6bm9uZSIKICAgICAgIGQ9Im0gMTM3LjgwNSw4OS41MzI5NjMgdiA0Mi4yNTI1NTcgaCAtNS4xMjg4NiBWIDg5LjUzMjk2MyBaIiAvPgogICAgPHBhdGgKICAgICAgIGlkPSJwYXRoNjY5NSIKICAgICAgIHN0eWxlPSJmaWxsOiM0OTQ4NDg7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOiMyYzJhMjk7c3Ryb2tlLXdpZHRoOjQuMTAwMDQzMztzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtZGFzaGFycmF5Om5vbmUiCiAgICAgICBkPSJtIDExOC4xNTU2Miw4OS41MzI5NjMgdiA0Mi4yNTI1NTcgaCAtNS4xMjg4NCBWIDg5LjUzMjk2MyBaIiAvPgogICAgPHBhdGgKICAgICAgIGlkPSJwYXRoNjY5NyIKICAgICAgIHN0eWxlPSJmaWxsOiM0OTQ4NDg7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOiMyYzJhMjk7c3Ryb2tlLXdpZHRoOjQuMTAwMDQzMztzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtZGFzaGFycmF5Om5vbmUiCiAgICAgICBkPSJtIDk4LjM2NzI5Niw4OS41MzI5NjMgdiA0Mi4yNTI1NTcgaCAtNS4xMjg4NyBWIDg5LjUzMjk2MyBaIiAvPgogICAgPHBhdGgKICAgICAgIGlkPSJwYXRoNjY5OSIKICAgICAgIHN0eWxlPSJmaWxsOiM0OTQ4NDg7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOiMyYzJhMjk7c3Ryb2tlLXdpZHRoOjQuMTAwMDQzMztzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtZGFzaGFycmF5Om5vbmUiCiAgICAgICBkPSJtIDc4LjAwNzU2Niw4OS41MzI5NjMgdiA0Mi4yNTI1NTcgaCAtNS4xMjg4NiBWIDg5LjUzMjk2MyBaIiAvPgogICAgPHBhdGgKICAgICAgIGlkPSJwYXRoNjcwMSIKICAgICAgIHN0eWxlPSJmaWxsOiM0OTQ4NDg7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOiMyYzJhMjk7c3Ryb2tlLXdpZHRoOjQuMTAwMDQzMztzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtZGFzaGFycmF5Om5vbmUiCiAgICAgICBkPSJtIDU4LjM1ODE4Niw4OS41MzI5NjMgdiA0Mi4yNTI1NTcgaCAtNS4xMjg4NiBWIDg5LjUzMjk2MyBaIiAvPgogICAgPHBhdGgKICAgICAgIGlkPSJwYXRoNjcwMyIKICAgICAgIHN0eWxlPSJmaWxsOiM0OTQ4NDg7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOiMyYzJhMjk7c3Ryb2tlLXdpZHRoOjQuMTAwMDQzMztzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtZGFzaGFycmF5Om5vbmUiCiAgICAgICBkPSJtIDM4LjU2OTg0Niw4OS41MzI5NjMgdiA0Mi4yNTI1NTcgaCAtNS4xMjg4NSBWIDg5LjUzMjk2MyBaIiAvPgogICAgPHBhdGgKICAgICAgIGlkPSJwYXRoNjcwNSIKICAgICAgIHN0eWxlPSJmaWxsOiM0OTQ4NDg7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOiMyYzJhMjk7c3Ryb2tlLXdpZHRoOjQuMTAwMDQzMztzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtZGFzaGFycmF5Om5vbmUiCiAgICAgICBkPSJtIDE4LjQ1NzM4Niw5MS42NzkxNjQgdiAzNy45NjAxNTYgcSAwLDIuMTQ2MiAtMi4xMjg1LDIuMTQ2MiBoIC0wLjg3MTg5IHEgLTIuMTI4NDgsMCAtMi4xMjg0OCwtMi4xNDYyIFYgOTEuNjc5MTY0IHEgMCwtMi4xNDYyMDEgMi4xMjg0OCwtMi4xNDYyMDEgaCAwLjg3MTg5IHEgMi4xMjg1LDAgMi4xMjg1LDIuMTQ2MjAxIHoiIC8+CiAgICA8cGF0aAogICAgICAgaWQ9InBhdGg2NzA3IgogICAgICAgc3R5bGU9ImZpbGw6IzAwNjYwMDtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6IzFiMTkxODtzdHJva2Utd2lkdGg6NS4xMjUwNTQzNjtzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtZGFzaGFycmF5Om5vbmUiCiAgICAgICBkPSJNIDIwNy4xNTQ2NiwxMTEuMzc1MjYgSCAzLjAwMDA4NiB2IDQ4LjY5OTA4IEggMjA3LjE1NDY2IFoiIC8+CiAgICA8cGF0aAogICAgICAgaWQ9InBhdGg2NzA5IgogICAgICAgc3R5bGU9ImZpbGw6IzAwNjYwMDtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6IzFiMTkxODtzdHJva2Utd2lkdGg6NS4xMjUwNTQzNjtzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtZGFzaGFycmF5Om5vbmUiCiAgICAgICBkPSJtIDIwNy4xNTQ2OCwyMjUuMjQ1MTQgdiA0OC42OTkyMSBIIDMuMDAwMDg2IHYgLTQ4LjY5OTIxIHoiIC8+CiAgICA8cGF0aAogICAgICAgaWQ9InBhdGg2NzExIgogICAgICAgc3R5bGU9ImZpbGw6IzAwNjYwMDtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6IzFiMTkxODtzdHJva2Utd2lkdGg6NS4xMjUwNTQzNjtzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtZGFzaGFycmF5Om5vbmUiCiAgICAgICBkPSJNIDE3Ny4xODM0MiwxMjguMDc5MTEgSCA5Ljc3NDEyNiBWIDI1Ni4yNzQ4OCBIIDE3Ny4xODM0MiBaIiAvPgogICAgPHBhdGgKICAgICAgIGlkPSJwYXRoNjcxMyIKICAgICAgIHN0eWxlPSJmaWxsOiMxYjE5MTg7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlLXdpZHRoOjAuMTgwODAwMjQiCiAgICAgICBkPSJtIDM3LjM2NTc5NiwxNTcuODQ4MDggaCAtMjAuNDk5MTYgcSAtMi4yMzU1MiwwIC0yLjIzNTUyLC0yLjI1NDEgdiAtMS4yNTQ0MiBxIDAsLTIuMjU0MTIgMi4yMzU1MiwtMi4yNTQxMiBoIDIwLjQ5OTE2IHEgMi4yMzU1LDAgMi4yMzU1LDIuMjU0MTIgdiAxLjI1NDQyIHEgMCwyLjI1NDEgLTIuMjM1NSwyLjI1NDEgeiIgLz4KICAgIDxwYXRoCiAgICAgICBpZD0icGF0aDY3MTUiCiAgICAgICBzdHlsZT0iZmlsbDojMWIxOTE4O2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZS13aWR0aDowLjE4MDgwMDI0IgogICAgICAgZD0ibSAzNy4zNjU3OTYsMTY2LjgwODM2IGggLTIwLjQ5OTE2IHEgLTIuMjM1NTIsMCAtMi4yMzU1MiwtMi4yNTQxMSB2IC0xLjI1NDQzIHEgMCwtMi4yNTQwOSAyLjIzNTUyLC0yLjI1NDA5IGggMjAuNDk5MTYgcSAyLjIzNTUsMCAyLjIzNTUsMi4yNTQwOSB2IDEuMjU0NDMgcSAwLDIuMjU0MTEgLTIuMjM1NSwyLjI1NDExIHoiIC8+CiAgICA8cGF0aAogICAgICAgaWQ9InBhdGg2NzE3IgogICAgICAgc3R5bGU9ImZpbGw6IzFiMTkxODtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2Utd2lkdGg6MC4xODA4MDAyNCIKICAgICAgIGQ9Im0gMzcuMzY1Nzk2LDE3NS40NjQ4MiBoIC0yMC40OTkxNiBxIC0yLjIzNTUyLDAgLTIuMjM1NTIsLTIuMjU0MTEgdiAtMS4yNTQ0MyBxIDAsLTIuMjU0MDkgMi4yMzU1MiwtMi4yNTQwOSBoIDIwLjQ5OTE2IHEgMi4yMzU1LDAgMi4yMzU1LDIuMjU0MDkgdiAxLjI1NDQzIHEgMCwyLjI1NDExIC0yLjIzNTUsMi4yNTQxMSB6IiAvPgogICAgPHBhdGgKICAgICAgIGlkPSJwYXRoNjcxOSIKICAgICAgIHN0eWxlPSJmaWxsOiMxYjE5MTg7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlLXdpZHRoOjAuMTgwODAwMjQiCiAgICAgICBkPSJtIDM3LjM2NTc5NiwxODMuMjEwMTMgaCAtMjAuNDk5MTYgcSAtMi4yMzU1MiwwIC0yLjIzNTUyLC0yLjI1NDExIHYgLTEuMjU0NDMgcSAwLC0yLjI1NDA5IDIuMjM1NTIsLTIuMjU0MDkgaCAyMC40OTkxNiBxIDIuMjM1NSwwIDIuMjM1NSwyLjI1NDA5IHYgMS4yNTQ0MyBxIDAsMi4yNTQxMSAtMi4yMzU1LDIuMjU0MTEgeiIgLz4KICAgIDxwYXRoCiAgICAgICBpZD0icGF0aDY3MjEiCiAgICAgICBzdHlsZT0iZmlsbDojMWIxOTE4O2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZS13aWR0aDowLjE4MDgwMDI0IgogICAgICAgZD0ibSAzNy4zNjU3OTYsMTkxLjcxNDcxIGggLTIwLjQ5OTE2IHEgLTIuMjM1NTIsMCAtMi4yMzU1MiwtMi4yNTQxMiB2IC0xLjI1NDQgcSAwLC0yLjI1NDEyIDIuMjM1NTIsLTIuMjU0MTIgaCAyMC40OTkxNiBxIDIuMjM1NSwwIDIuMjM1NSwyLjI1NDEyIHYgMS4yNTQ0IHEgMCwyLjI1NDEyIC0yLjIzNTUsMi4yNTQxMiB6IiAvPgogICAgPHBhdGgKICAgICAgIGlkPSJwYXRoNjcyMyIKICAgICAgIHN0eWxlPSJmaWxsOiMxYjE5MTg7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlLXdpZHRoOjAuMTgwODAwMjQiCiAgICAgICBkPSJtIDM3LjM2NTc5NiwxOTkuODc3NTggaCAtMjAuNDk5MTYgcSAtMi4yMzU1MiwwIC0yLjIzNTUyLC0yLjI1NDA5IHYgLTEuMjU0NDMgcSAwLC0yLjI1NDA5IDIuMjM1NTIsLTIuMjU0MDkgaCAyMC40OTkxNiBxIDIuMjM1NSwwIDIuMjM1NSwyLjI1NDA5IHYgMS4yNTQ0MyBxIDAsMi4yNTQwOSAtMi4yMzU1LDIuMjU0MDkgeiIgLz4KICAgIDxwYXRoCiAgICAgICBpZD0icGF0aDY3MjUiCiAgICAgICBzdHlsZT0iZmlsbDojMWIxOTE4O2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZS13aWR0aDowLjE4MDgwMDI0IgogICAgICAgZD0ibSAzNy4zNjU3OTYsMjA4LjgzNzg3IGggLTIwLjQ5OTE2IHEgLTIuMjM1NTIsMCAtMi4yMzU1MiwtMi4yNTQxMiB2IC0xLjI1NDQgcSAwLC0yLjI1NDEyIDIuMjM1NTIsLTIuMjU0MTIgaCAyMC40OTkxNiBxIDIuMjM1NSwwIDIuMjM1NSwyLjI1NDEyIHYgMS4yNTQ0IHEgMCwyLjI1NDEyIC0yLjIzNTUsMi4yNTQxMiB6IiAvPgogICAgPHBhdGgKICAgICAgIGlkPSJwYXRoNjcyNyIKICAgICAgIHN0eWxlPSJmaWxsOiMxYjE5MTg7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlLXdpZHRoOjAuMTgwODAwMjQiCiAgICAgICBkPSJtIDM3LjM2NTc5NiwyMTcuNDk0MzMgaCAtMjAuNDk5MTYgcSAtMi4yMzU1MiwwIC0yLjIzNTUyLC0yLjI1NDEyIHYgLTEuMjU0NCBxIDAsLTIuMjU0MTIgMi4yMzU1MiwtMi4yNTQxMiBoIDIwLjQ5OTE2IHEgMi4yMzU1LDAgMi4yMzU1LDIuMjU0MTIgdiAxLjI1NDQgcSAwLDIuMjU0MTIgLTIuMjM1NSwyLjI1NDEyIHoiIC8+CiAgICA8cGF0aAogICAgICAgaWQ9InBhdGg2NzI5IgogICAgICAgc3R5bGU9ImZpbGw6IzFiMTkxODtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2Utd2lkdGg6MC4xODA4MDAyNCIKICAgICAgIGQ9Im0gMzcuMzY1Nzk2LDIyNS4yMzk2NCBoIC0yMC40OTkxNiBxIC0yLjIzNTUyLDAgLTIuMjM1NTIsLTIuMjU0MTEgdiAtMS4yNTQ0MSBxIDAsLTIuMjU0MTEgMi4yMzU1MiwtMi4yNTQxMSBoIDIwLjQ5OTE2IHEgMi4yMzU1LDAgMi4yMzU1LDIuMjU0MTEgdiAxLjI1NDQxIHEgMCwyLjI1NDExIC0yLjIzNTUsMi4yNTQxMSB6IiAvPgogICAgPHBhdGgKICAgICAgIGlkPSJwYXRoNjczMSIKICAgICAgIHN0eWxlPSJmaWxsOiMxYjE5MTg7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlLXdpZHRoOjAuMTgwODAwMjQiCiAgICAgICBkPSJtIDM3LjM2NTc5NiwyMzMuNzQ0MjEgaCAtMjAuNDk5MTYgcSAtMi4yMzU1MiwwIC0yLjIzNTUyLC0yLjI1NDA5IHYgLTEuMjU0NDMgcSAwLC0yLjI1NDExIDIuMjM1NTIsLTIuMjU0MTEgaCAyMC40OTkxNiBxIDIuMjM1NSwwIDIuMjM1NSwyLjI1NDExIHYgMS4yNTQ0MyBxIDAsMi4yNTQwOSAtMi4yMzU1LDIuMjU0MDkgeiIgLz4KICAgIDxwYXRoCiAgICAgICBpZD0icGF0aDY3MzMiCiAgICAgICBzdHlsZT0iZmlsbDojMDA2NjAwO2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZS13aWR0aDowLjE4MDgwMDI0IgogICAgICAgZD0ibSAxNjIuMzI4NjcsMjA4LjUxMTk3IHYgMjYuNDQxNzUgaCAtMi43MDg3NyB2IC0yNi40NDE3NSB6IiAvPgogICAgPHBhdGgKICAgICAgIGlkPSJwYXRoNjczNSIKICAgICAgIHN0eWxlPSJmaWxsOiMwMDY2MDA7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlLXdpZHRoOjAuMTgwODAwMjQiCiAgICAgICBkPSJtIDE2Mi4zMjg2NywxNDkuMjgyNDggdiAyNi40NDE3NiBoIC0yLjcwODc3IHYgLTI2LjQ0MTc2IHoiIC8+CiAgICA8cGF0aAogICAgICAgaWQ9InBhdGg2NzM3IgogICAgICAgc3R5bGU9ImZpbGw6IzAwY2MwMDtmaWxsLW9wYWNpdHk6MDtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2Utd2lkdGg6MC4xODA4MDAyNCIKICAgICAgIGQ9Im0gMTUwLjA1NTM2LDE0My42NjQzMyAyNC42NzcxNiwtMTIuOTM5MTcgdiAxMjIuNzUwNzcgbCAtMjQuNjc3MTYsLTEyLjkzOTE2IHoiIC8+CiAgICA8cGF0aAogICAgICAgaWQ9InBhdGg2NzM5IgogICAgICAgc3R5bGU9ImZpbGw6IzAwNjYwMDtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6IzFiMTkxODtzdHJva2Utd2lkdGg6NS4xMjUwNTQzNjtzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtZGFzaGFycmF5Om5vbmUiCiAgICAgICBkPSJtIDE0OC44MjQyNSwxNTkuNjUzNDcgdiA2My42NjkzMiBxIDAsMTcuODg0NjQgLTE3LjczNzEsMTcuODg0NjQgSCA2MS4wMjM3NjYgcSAtMTcuNzM3MDksMCAtMTcuNzM3MDksLTE3Ljg4NDY0IHYgLTYzLjY2OTMyIHEgMCwtMTcuODg0NjIgMTcuNzM3MDksLTE3Ljg4NDYyIGggNzAuMDYzMzg0IHEgMTcuNzM3MSwwIDE3LjczNzEsMTcuODg0NjIgeiIgLz4KICAgIDxwYXRoCiAgICAgICBpZD0icGF0aDY3NDEiCiAgICAgICBzdHlsZT0iZmlsbDojMDA2NjAwO2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTojMWIxOTE4O3N0cm9rZS13aWR0aDo1LjEyNTA1NDM2O3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1kYXNoYXJyYXk6bm9uZSIKICAgICAgIGQ9Im0gOTYuMDU1NDQ2LDE2MS4zOTU5IGEgMjguNTkwODEyLDMwLjA5MjIzIDAgMCAwIC0yOC41OTA4MSwzMC4wOTIyMyAyOC41OTA4MTIsMzAuMDkyMjMgMCAxIDAgMjguNTkwODEsLTMwLjA5MjIzIHoiIC8+CiAgICA8cGF0aAogICAgICAgaWQ9InBhdGg2NzQzIgogICAgICAgc3R5bGU9ImZpbGw6IzAwNjYwMDtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6IzFiMTkxODtzdHJva2Utd2lkdGg6NS4xMjUwNTQzNjtzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtZGFzaGFycmF5Om5vbmUiCiAgICAgICBkPSJtIDk2LjA1NTQ0NiwxNzIuMTQzMTMgYSAxOC4zNzk4MDksMTkuMzQ0OTk3IDAgMCAwIC0xOC4zNzk3OSwxOS4zNDUgMTguMzc5ODA5LDE5LjM0NDk5NyAwIDEgMCAxOC4zNzk3OSwtMTkuMzQ1IHoiIC8+CiAgICA8cGF0aAogICAgICAgaWQ9InBhdGg2NzQ1IgogICAgICAgc3R5bGU9ImZpbGw6IzAwNjYwMDtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6IzFiMTkxODtzdHJva2Utd2lkdGg6NS4xMjUwNTQzNjtzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtZGFzaGFycmF5Om5vbmUiCiAgICAgICBkPSJtIDE5NC4zOTMyOCwxODkuOTQxNyB2IDQuNDcxMTYgcSAwLDYuMjU5NjMgLTYuMjA3OTcsNi4yNTk2MyBoIC00Mi40NjEzNiBxIC02LjIwNzk5LDAgLTYuMjA3OTksLTYuMjU5NjMgdiAtNC40NzExNiBxIDAsLTYuMjU5NjEgNi4yMDc5OSwtNi4yNTk2MSBoIDQyLjQ2MTM2IHEgNi4yMDc5NywwIDYuMjA3OTcsNi4yNTk2MSB6IiAvPgogICAgPHBhdGgKICAgICAgIGlkPSJwYXRoNjc0NyIKICAgICAgIHN0eWxlPSJmaWxsOiMwMDY2MDA7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOiMxYjE5MTg7c3Ryb2tlLXdpZHRoOjUuMTI1MDU0MzY7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLWRhc2hhcnJheTpub25lIgogICAgICAgZD0ibSAyMDUuNTA3MjEsMTg4Ljc2NTExIHYgNi44MjQzOCBxIDAsOS41NTQxNSAtOS40NzUzMiw5LjU1NDE1IGggLTExLjYyNjkgcSAtOS40NzUzMywwIC05LjQ3NTMzLC05LjU1NDE1IHYgLTYuODI0MzggcSAwLC05LjU1NDE2IDkuNDc1MzMsLTkuNTU0MTYgaCAxMS42MjY5IHEgOS40NzUzMiwwIDkuNDc1MzIsOS41NTQxNiB6IiAvPgogIDwvZz4KPC9zdmc+Cg==",
   "id": 2,
   "width": 2,
   "height": 2
  },
  {
   "type": "color",
   "color": {
    "r": 0,
    "b": 0,
    "g": 0
   },
   "id": 3
  },
  {
   "type": "color",
   "color": {
    "r": 255,
    "b": 255,
    "g": 255
   },
   "id": 4
  }
 ],
 "width": 1,
 "height": 1
}
},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDb250cm9sLmpzIiwiRHJhdy5qcyIsIkV2ZW50cy5qcyIsIkxvZ2ljLmpzIiwiYnJvbWFpbi5qcyIsIm5vZGVfbW9kdWxlcy9jaHJvbWF0aC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jaHJvbWF0aC9zcmMvY2hyb21hdGguanMiLCJub2RlX21vZHVsZXMvY2hyb21hdGgvc3JjL2NvbG9ybmFtZXNfY3NzMi5qcyIsIm5vZGVfbW9kdWxlcy9jaHJvbWF0aC9zcmMvY29sb3JuYW1lc19jc3MzLmpzIiwibm9kZV9tb2R1bGVzL2Nocm9tYXRoL3NyYy9wYXJzZXJzLmpzIiwibm9kZV9tb2R1bGVzL2Nocm9tYXRoL3NyYy9wcm90b3R5cGUuanMiLCJub2RlX21vZHVsZXMvY2hyb21hdGgvc3JjL3V0aWwuanMiLCJub2RlX21vZHVsZXMvdHlwZXNqcy9tb2YuanMiLCJub2RlX21vZHVsZXMvdHlwZXNqcy90eXBlcy5qcyIsInRpbGVzZXQuanNvbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDam5DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbHJCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL3VCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgSGVhciA9IHJlcXVpcmUoXCIuL0V2ZW50cy5qc1wiKTtcclxuXHJcbmZ1bmN0aW9uIENyQ29udHJvbGxlcihMb2dpYywgRHJhdyl7XHJcblx0SGVhcihcIkNhdGVnc1wiLCBcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KXtcclxuXHRcdGlmKGV2ZW50LnRhcmdldC5zd2l0KSBldmVudC50YXJnZXQuc3dpdCgpO1xyXG5cdFx0XHJcblx0XHRpZihldmVudC50YXJnZXQuZ2V0QXR0cmlidXRlKFwidGlsZVwiKSAhPT0gbnVsbCl7XHJcblx0XHRcdExvZ2ljLmNoYW5nZVRpbGUoZXZlbnQudGFyZ2V0LnBhcmVudEVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiY2F0ZWdcIiksIGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoXCJ0aWxlXCIpKTtcclxuXHRcdH1cclxuXHR9KTtcclxuXHRcclxuXHRIZWFyKFwiQWRkXCIsIFwiY2hhbmdlXCIsIERyYXcub3BlbkpTT04oTG9naWMuYWRkVGlsZXNldCkpO1xyXG5cdFxyXG5cdHZhciBjdXJzb3JMaW5lID0gbnVsbDtcclxuXHRcclxuXHRIZWFyKFwiTWFwXCIsIFwibW91c2Vkb3duXCIsIGZ1bmN0aW9uKGV2ZW50KXtcclxuXHRcdGN1cnNvckxpbmUgPSBbZXZlbnQudGFyZ2V0LngsIGV2ZW50LnRhcmdldC55XTtcclxuXHR9KTtcclxuXHRIZWFyKFwiTWFwXCIsIFwibW91c2V1cFwiLCBmdW5jdGlvbihldmVudCl7XHJcblx0XHRMb2dpYy5maWxsKGN1cnNvckxpbmUsIFtldmVudC50YXJnZXQueCwgZXZlbnQudGFyZ2V0LnldKTtcclxuXHRcdGN1cnNvckxpbmUgPSBudWxsO1xyXG5cdH0pO1xyXG5cdEhlYXIoXCJNYXBcIiwgXCJkcmFnc3RhcnRcIiwgZnVuY3Rpb24oZXZlbnQpe1xyXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHR9KTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDckNvbnRyb2xsZXI7XHJcbiIsInJlcXVpcmUoXCJ0eXBlc2pzXCIpO1xyXG5jb25zdCBSR0IgPSByZXF1aXJlKCdjaHJvbWF0aCcpLnJnYjtcclxuXHJcbnZhciBpZF9tYXAgPSBcIk1hcFwiO1xyXG52YXIgaWRfdGlsZXMgPSBcIlRpbGVzXCI7XHJcbnZhciBpZF9wYWxsZXQgPSBcIlBhbGxldFwiO1xyXG5cclxuZnVuY3Rpb24gQ3JNYXAoKXtcclxuXHR2YXIgY29udGFpbmVyID0gZ2V0Tm9kZShpZF9tYXApO1xyXG5cdHZhciBzaXplID0gMjA7XHJcblx0XHJcblx0ZHJhd0dyaWQoY29udGFpbmVyLCBzaXplKTtcclxuXHRcclxuXHR0aGlzLmFkZCA9IGZ1bmN0aW9uKG5ld190aWxlLCB4LCB5KXtcclxuXHRcdHZhciB0aWxlID0gZHJhd1RpbGUobmV3X3RpbGUpO1xyXG5cdFx0dGlsZS5zdHlsZS53aWR0aCA9IChuZXdfdGlsZS53aWR0aCAqICgxMDAgLyBzaXplKSkgKyBcIiVcIjtcclxuXHRcdHRpbGUuc3R5bGUuaGVpZ2h0ID0gKG5ld190aWxlLmhlaWdodCAqICgxMDAgLyBzaXplKSkgKyBcIiVcIjtcclxuXHRcdFxyXG5cdFx0dGlsZS5zdHlsZS5sZWZ0ID0gKHggKiAoMTAwIC8gc2l6ZSkpICsgXCIlXCI7XHJcblx0XHR0aWxlLnN0eWxlLnRvcCA9ICh5ICogKDEwMCAvIHNpemUpKSArIFwiJVwiO1xyXG5cdFx0XHJcblx0XHRjb250YWluZXIuYXBwZW5kQ2hpbGQodGlsZSk7XHJcblx0fVxyXG5cdFxyXG5cdFxyXG5cdGZ1bmN0aW9uIE5vcm1UaWxlKHRpbGUpe1xyXG5cdFx0dmFyIGJveCA9IGdldENvbXB1dGVkU3R5bGUodGlsZSk7XHJcblx0XHR0aWxlLnN0eWxlLmxlZnQgPSBOb3JtQ29vcmQocGFyc2VGbG9hdChib3gubGVmdCksIHBhcnNlRmxvYXQoYm94LndpZHRoKSkgKyBcIiVcIjtcclxuXHRcdHRpbGUuc3R5bGUudG9wID0gTm9ybUNvb3JkKHBhcnNlRmxvYXQoYm94LnRvcCksIHBhcnNlRmxvYXQoYm94LmhlaWdodCkpICsgXCIlXCI7XHJcblx0fVxyXG5cdFxyXG5cdGZ1bmN0aW9uIE5vcm1Db29yZChjb29yZCwgcyl7XHJcblx0XHR2YXIgY29uX3NpemUgPSBwYXJzZUZsb2F0KGdldENvbXB1dGVkU3R5bGUoY29udGFpbmVyKS53aWR0aCk7XHJcblx0XHRcclxuXHRcdGlmKGNvb3JkICsgcyA+IGNvbl9zaXplKSBjb29yZCA9IGNvbl9zaXplIC0gcztcclxuXHRcdGlmKGNvb3JkIDwgMCkgY29vcmQgPSAwO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gTWF0aC5yb3VuZCgoY29vcmQgLyBjb25fc2l6ZSkgKiBzaXplKSAqICgxMDAgLyBzaXplKTtcclxuXHR9XHJcblx0XHJcbn1cclxuXHJcbmZ1bmN0aW9uIENyVGlsZXMoKXtcclxuXHR2YXIgY29udGFpbmVyID0gZ2V0Tm9kZShpZF90aWxlcyk7XHJcblx0XHJcblx0dGhpcy5hZGQgPSBmdW5jdGlvbihUaWxlc2V0KXtcclxuXHRcdHZhciBjYXRlZyA9IGRyYXdDYXRlZyhUaWxlc2V0KTtcclxuXHRcdGNvbnRhaW5lci5hcHBlbmRDaGlsZChjYXRlZyk7XHJcblx0fVxyXG59XHJcblxyXG5mdW5jdGlvbiBDclBhbGxldCgpe1xyXG5cdHZhciBjb250YWluZXIgPSBnZXROb2RlKGlkX3BhbGxldCk7XHJcblx0XHJcblx0dGhpcy5hZGQgPSBmdW5jdGlvbihjYXRlZywgdGlsZSl7XHJcblx0XHRjb250YWluZXIuYXBwZW5kQ2hpbGQoZHJhd1RpbGUodGlsZSkpO1xyXG5cdH1cclxufVxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdG1hcDogbmV3IENyTWFwKCksIFxyXG5cdHRpbGVzOiBuZXcgQ3JUaWxlcygpLFxyXG5cdG9wZW5KU09OOiBPcGVuRmlsZUpTT04sXHJcblx0c2F2ZTogU2F2ZVxyXG59O1xyXG5cclxuZnVuY3Rpb24gZHJhd0dyaWQoY29udGFpbmVyLCBncmlkX3NpemUpe1xyXG5cdFx0dmFyIHNpemUgPSAxMDAgLyBncmlkX3NpemU7XHJcblx0XHRmb3IodmFyIGkgPSBncmlkX3NpemUgLSAxOyBpID49IDA7IGktLSl7XHJcblx0XHRcdGZvcih2YXIgaiA9IGdyaWRfc2l6ZSAtIDE7IGogPj0gMDsgai0tKXtcclxuXHRcdFx0XHR2YXIgYm94ID0gZGFyd0JveChpKnNpemUsIGoqc2l6ZSwgc2l6ZSk7XHJcblx0XHRcdFx0Ym94LnggPSBpO1xyXG5cdFx0XHRcdGJveC55ID0gajtcclxuXHRcdFx0XHRjb250YWluZXIuYXBwZW5kQ2hpbGQoYm94KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuZnVuY3Rpb24gZGFyd0JveCh4LCB5LCBzaXplKXtcclxuXHR2YXIgYm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblx0Ym94LmNsYXNzTGlzdC5hZGQoXCJib3hcIik7XHJcblx0Ym94LnN0eWxlLndpZHRoID0gc2l6ZSArIFwiJVwiO1xyXG5cdGJveC5zdHlsZS5oZWlnaHQgPSBzaXplICsgXCIlXCI7XHJcblx0XHJcblx0Ym94LnN0eWxlLmxlZnQgPSB4ICsgXCIlXCI7XHJcblx0Ym94LnN0eWxlLnRvcCA9IHkgKyBcIiVcIjtcclxuXHRcclxuXHRyZXR1cm4gYm94O1xyXG59XHJcblxyXG5mdW5jdGlvbiBPcGVuRmlsZUpTT04oT3Blbil7XHJcblx0cmV0dXJuIGZ1bmN0aW9uKCl7XHJcblx0XHRpZih0aGlzLmZpbGVzWzBdKXtcclxuXHRcdFx0dmFyIG5hbWUgPSB0aGlzLmZpbGVzWzBdLm5hbWU7XHJcblx0XHRcdHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG5cdFx0XHRcclxuXHRcdFx0cmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKGUpe1xyXG5cdFx0XHRcdHZhciBmaWxlID0gSlNPTi5wYXJzZShlLnRhcmdldC5yZXN1bHQpO1xyXG5cdFx0XHRcdGZpbGUubmFtZSA9IG5hbWU7XHJcblx0XHRcdFx0T3BlbihmaWxlKTtcclxuXHRcdFx0fTtcclxuXHRcdFx0cmVhZGVyLnJlYWRBc1RleHQodGhpcy5maWxlc1swXSk7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5mdW5jdGlvbiBTYXZlKG5hbWUsIHRleHQpe1xyXG5cdHZhciBibG9iID0gbmV3IEJsb2IoW3RleHRdLCB7dHlwZTogXCJ0ZXh0L3BsYWluO2NoYXJzZXQ9dXRmLThcIn0pO1xyXG5cdEZpbGVTYXZlci5zYXZlQXMoYmxvYiwgbmFtZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIENyU3dpdGNoKGlkLCBuYW1lX2NsYXNzKXtcclxuXHR2YXIgZWxlbSA9IGdldE5vZGUoaWQpLmNsYXNzTGlzdDtcclxuXHRyZXR1cm4gZnVuY3Rpb24oKXtcclxuXHRcdGVsZW0udG9nZ2xlKG5hbWVfY2xhc3MpO1xyXG5cdH1cclxufVxyXG5cclxuZnVuY3Rpb24gZHJhd0NhdGVnKG5ld190aWxlc2V0KXtcclxuXHR2YXIgY2F0ZWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHRjYXRlZy5jbGFzc0xpc3QuYWRkKFwicGFuZWwtY29sdW1uXCIpO1xyXG5cdFxyXG5cdHZhciB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gzJyk7XHJcblx0dGl0bGUuaW5uZXJIVE1MID0gbmV3X3RpbGVzZXQubmFtZTtcclxuXHR0aXRsZS5jbGFzc0xpc3QuYWRkKFwidGl0bGUtY2F0ZWdcIik7XHJcblx0XHJcblx0XHJcblx0Ly92YXIgY2xvc2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcclxuXHQvL2Nsb3NlLmlubmVySFRNTCA9IFwiLVwiO1xyXG5cdC8vdGl0bGUuYXBwZW5kQ2hpbGQoY2xvc2UpO1xyXG5cdFxyXG5cdGNhdGVnLmFwcGVuZENoaWxkKHRpdGxlKTtcclxuXHRcclxuXHR2YXIgbGlzdCA9IGRyYXdUaWxlcyhuZXdfdGlsZXNldC50aWxlcyk7XHJcblx0bGlzdC5zZXRBdHRyaWJ1dGUoXCJjYXRlZ1wiLCBuZXdfdGlsZXNldC5pZCk7XHJcblx0XHJcblx0dGl0bGUuc3dpdCA9IGZ1bmN0aW9uKCl7XHJcblx0XHRsaXN0LmNsYXNzTGlzdC50b2dnbGUoXCJpbnZpc1wiKTtcclxuXHR9XHJcblx0XHJcblx0Y2F0ZWcuYXBwZW5kQ2hpbGQobGlzdCk7XHJcblx0XHJcblx0cmV0dXJuIGNhdGVnO1xyXG59XHJcblxyXG5mdW5jdGlvbiBkcmF3VGlsZXModGlsZXMpe1xyXG5cdHZhciBsaXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblx0bGlzdC5jbGFzc0xpc3QuYWRkKFwicGFuZWwtd3JhcFwiKTtcclxuXHRcclxuXHR0aWxlcy5tYXAoZHJhd1RpbGUpLmZvckVhY2gobGlzdC5hcHBlbmRDaGlsZC5iaW5kKGxpc3QpKTtcclxuXHRyZXR1cm4gbGlzdDtcclxufVxyXG5cclxuZnVuY3Rpb24gZHJhd1RpbGUobmV3X3RpbGUpe1xyXG5cdFxyXG5cdGlmKG5ld190aWxlLnR5cGUgPT0gXCJjb2xvclwiKXtcclxuXHRcdHZhciBUaWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblx0XHRUaWxlLmNsYXNzTGlzdC5hZGQoXCJ0aWxlXCIpO1xyXG5cdFx0VGlsZS5zZXRBdHRyaWJ1dGUoXCJ0aWxlXCIsIG5ld190aWxlLmlkKTtcclxuXHRcdFRpbGUuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gbmV3IFJHQihuZXdfdGlsZS5jb2xvcikudG9TdHJpbmcoKTtcclxuXHRcdHJldHVybiBUaWxlO1xyXG5cdH1cclxuXHRpZihuZXdfdGlsZS50eXBlID09IFwic3ZnXCIpe1xyXG5cdFx0dmFyIGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xyXG5cdFx0aW1nLmNsYXNzTGlzdC5hZGQoXCJ0aWxlXCIpO1xyXG5cdFx0aW1nLnNldEF0dHJpYnV0ZShcInRpbGVcIiwgbmV3X3RpbGUuaWQpO1xyXG5cdFx0aW1nLnNyYyA9IG5ld190aWxlLmltZztcclxuXHRcdHJldHVybiBpbWc7XHJcblx0fVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXROb2RlKGlkKXtcclxuXHR2YXIgZWxlbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcclxuXHRpZighZWxlbSkgdGhyb3cgbmV3IEVycm9yKFwiRWxlbSBpcyBub3QgZmluZCFcIik7XHJcblx0cmV0dXJuIGVsZW07XHJcbn1cclxuIiwiXHJcbmZ1bmN0aW9uIElkRXZlbnQoaWQsIG5hbWVfZXZlbnQsIGZ1bmMpe1xyXG5cdFxyXG5cdGlmKG5hbWVfZXZlbnQgPT0gXCJzdWJtaXRcIil7XHJcblx0XHR2YXIgb2xkX2Z1bmMgPSBmdW5jO1xyXG5cdFx0ZnVuYyA9IGZ1bmN0aW9uKGUpe1xyXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdG9sZF9mdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcblx0XHR9IFxyXG5cdH1cclxuXHRcclxuXHRpZihBcnJheS5pc0FycmF5KG5hbWVfZXZlbnQpKXtcclxuXHRcdG5hbWVfZXZlbnQuZm9yRWFjaChuYW1lID0+IGdldE5vZGUoaWQpLmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgZnVuYykpO1xyXG5cdH1cclxuXHRlbHNlIGdldE5vZGUoaWQpLmFkZEV2ZW50TGlzdGVuZXIobmFtZV9ldmVudCwgZnVuYyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFN1Ym1pdChmdW5jKXtcclxuXHRyZXR1cm4gZnVuY3Rpb24oZXZlbnQpe1xyXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHR9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldE5vZGUoaWQpe1xyXG5cdHZhciBlbGVtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xyXG5cdGlmKCFlbGVtKSB0aHJvdyBuZXcgRXJyb3IoXCJFbGVtIGlzIG5vdCBmaW5kIVwiKTtcclxuXHRyZXR1cm4gZWxlbTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBJZEV2ZW50O1xyXG4iLCJ2YXIgVGlsZXNldHMgPSBbXTtcclxudmFyIE1hcCA9IEFycmF5LmNyZWF0ZShBcnJheS5jcmVhdGUuYmluZChudWxsLCBudWxsLCAyMCksIDIwKTtcclxuXHJcbmZ1bmN0aW9uIENyTG9naWMoRHJhdyl7XHJcblx0dmFyIGN1cnJlbnRfdGlsZSA9IG51bGw7XHJcblx0XHJcblx0dGhpcy5hZGRUaWxlc2V0ID0gZnVuY3Rpb24oVGlsZXNldCl7XHJcblx0XHRUaWxlc2V0LmlkID0gVGlsZXNldHMuYWRkKFRpbGVzZXQpO1xyXG5cdFx0RHJhdy50aWxlcy5hZGQoVGlsZXNldCk7XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMuY2hhbmdlVGlsZSA9IGZ1bmN0aW9uKGlkX2NhdGVnLCBpZF90aWxlKXtcclxuXHRcdGN1cnJlbnRfdGlsZSA9IFRpbGVzZXRzW2lkX2NhdGVnXS50aWxlc1tpZF90aWxlXTtcclxuXHRcdFxyXG5cdFx0aWYoIWN1cnJlbnRfdGlsZS53aWR0aCkgY3VycmVudF90aWxlLndpZHRoID0gVGlsZXNldHNbaWRfY2F0ZWddLndpZHRoO1xyXG5cdFx0aWYoIWN1cnJlbnRfdGlsZS5oZWlnaHQpIGN1cnJlbnRfdGlsZS5oZWlnaHQgPSBUaWxlc2V0c1tpZF9jYXRlZ10uaGVpZ2h0O1xyXG5cdFx0XHJcblx0fVxyXG5cdFxyXG5cdHRoaXMuZmlsbCA9IGZ1bmN0aW9uKGJlZywgZW5kKXtcclxuXHRcdGlmKGN1cnJlbnRfdGlsZSl7XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgaW5jX3ggPSBjdXJyZW50X3RpbGUud2lkdGg7XHJcblx0XHRcdHZhciBpbmNfeSA9IGN1cnJlbnRfdGlsZS5oZWlnaHQ7XHJcblx0XHRcdFxyXG5cdFx0XHRmb3IodmFyIGkgPSBiZWdbMF07IGkgKyBpbmNfeCA8PSBlbmRbMF0gKyAxOyBpID0gaSArIGluY194KXtcclxuXHRcdFx0XHRmb3IodmFyIGogPSBiZWdbMV07IGogKyBpbmNfeSA8PSBlbmRbMV0gKyAxOyBqID0gaiArIGluY195KXtcclxuXHRcdFx0XHRcdGRyYXdUaWxlKGksIGosIGN1cnJlbnRfdGlsZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0ZnVuY3Rpb24gZHJhd1RpbGUoeCwgeSwgdGlsZSl7XHJcblx0XHR4ID0gTWF0aC5mbG9vcih4KTtcclxuXHRcdHkgPSBNYXRoLmZsb29yKHkpO1xyXG5cdFx0XHJcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgdGlsZS53aWR0aDsgaSsrKXtcclxuXHRcdFx0Zm9yKHZhciBqID0gMDsgaiA8IHRpbGUuaGVpZ2h0OyBqKyspe1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdE1hcFtqK3ldW2kreF0gPSB0aWxlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdERyYXcubWFwLmFkZCh0aWxlLCB4LCB5KTtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ3JMb2dpYztcclxuIiwiY29uc3QgRHJhdyA9IHJlcXVpcmUoXCIuL0RyYXcuanNcIik7XHJcbmNvbnN0IENyTG9naWMgPSByZXF1aXJlKFwiLi9Mb2dpYy5qc1wiKTtcclxuY29uc3QgQ3JDb250ciA9IHJlcXVpcmUoXCIuL0NvbnRyb2wuanNcIik7XHJcblxyXG52YXIgVGlsZXNldCA9IHJlcXVpcmUoXCIuL3RpbGVzZXQuanNvblwiKTtcclxudmFyIExvZ2ljID0gbmV3IENyTG9naWMoRHJhdyk7XHJcbkNyQ29udHIoTG9naWMsIERyYXcpO1xyXG4iLCJ2YXIgQ2hyb21hdGggPSByZXF1aXJlKCcuL3NyYy9jaHJvbWF0aC5qcycpO1xubW9kdWxlLmV4cG9ydHMgPSBDaHJvbWF0aDtcbiIsInZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG4vKlxuICAgQ2xhc3M6IENocm9tYXRoXG4qL1xuLy8gR3JvdXA6IENvbnN0cnVjdG9yc1xuLypcbiAgIENvbnN0cnVjdG9yOiBDaHJvbWF0aFxuICAgQ3JlYXRlIGEgbmV3IENocm9tYXRoIGluc3RhbmNlIGZyb20gYSBzdHJpbmcgb3IgaW50ZWdlclxuXG4gICBQYXJhbWV0ZXJzOlxuICAgbWl4ZWQgLSBUaGUgdmFsdWUgdG8gdXNlIGZvciBjcmVhdGluZyB0aGUgY29sb3JcblxuICAgUmV0dXJuczpcbiAgIDxDaHJvbWF0aD4gaW5zdGFuY2VcblxuICAgUHJvcGVydGllczpcbiAgIHIgLSBUaGUgcmVkIGNoYW5uZWwgb2YgdGhlIFJHQiByZXByZXNlbnRhdGlvbiBvZiB0aGUgQ2hyb21hdGguIEEgbnVtYmVyIGJldHdlZW4gMCBhbmQgMjU1LlxuICAgZyAtIFRoZSBncmVlbiBjaGFubmVsIG9mIHRoZSBSR0IgcmVwcmVzZW50YXRpb24gb2YgdGhlIENocm9tYXRoLiBBIG51bWJlciBiZXR3ZWVuIDAgYW5kIDI1NS5cbiAgIGIgLSBUaGUgYmx1ZSBjaGFubmVsIG9mIHRoZSBSR0IgcmVwcmVzZW50YXRpb24gb2YgdGhlIENocm9tYXRoLiBBIG51bWJlciBiZXR3ZWVuIDAgYW5kIDI1NS5cbiAgIGEgLSBUaGUgYWxwaGEgY2hhbm5lbCBvZiB0aGUgQ2hyb21hdGguIEEgbnVtYmVyIGJldHdlZW4gMCBhbmQgMS5cbiAgIGggLSBUaGUgaHVlIG9mIHRoZSBDaHJvbWF0aC4gQSBudW1iZXIgYmV0d2VlbiAwIGFuZCAzNjAuXG4gICBzbCAtIFRoZSBzYXR1cmF0aW9uIG9mIHRoZSBIU0wgcmVwcmVzZW50YXRpb24gb2YgdGhlIENocm9tYXRoLiBBIG51bWJlciBiZXR3ZWVuIDAgYW5kIDEuXG4gICBzdiAtIFRoZSBzYXR1cmF0aW9uIG9mIHRoZSBIU1YvSFNCIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBDaHJvbWF0aC4gQSBudW1iZXIgYmV0d2VlbiAwIGFuZCAxLlxuICAgbCAtIFRoZSBsaWdodG5lc3Mgb2YgdGhlIEhTTCByZXByZXNlbnRhdGlvbiBvZiB0aGUgQ2hyb21hdGguIEEgbnVtYmVyIGJldHdlZW4gMCBhbmQgMS5cbiAgIHYgLSBUaGUgbGlnaHRuZXNzIG9mIHRoZSBIU1YvSFNCIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBDaHJvbWF0aC4gQSBudW1iZXIgYmV0d2VlbiAwIGFuZCAxLlxuXG4gICBFeGFtcGxlczpcbiAgKHN0YXJ0IGNvZGUpXG4vLyBUaGVyZSBhcmUgbWFueSB3YXlzIHRvIGNyZWF0ZSBhIENocm9tYXRoIGluc3RhbmNlXG5uZXcgQ2hyb21hdGgoJyNGRjAwMDAnKTsgICAgICAgICAgICAgICAgICAvLyBIZXggKDYgY2hhcmFjdGVycyB3aXRoIGhhc2gpXG5uZXcgQ2hyb21hdGgoJ0ZGMDAwMCcpOyAgICAgICAgICAgICAgICAgICAvLyBIZXggKDYgY2hhcmFjdGVycyB3aXRob3V0IGhhc2gpXG5uZXcgQ2hyb21hdGgoJyNGMDAnKTsgICAgICAgICAgICAgICAgICAgICAvLyBIZXggKDMgY2hhcmFjdGVycyB3aXRoIGhhc2gpXG5uZXcgQ2hyb21hdGgoJ0YwMCcpOyAgICAgICAgICAgICAgICAgICAgICAvLyBIZXggKDMgY2hhcmFjdGVycyB3aXRob3V0IGhhc2gpXG5uZXcgQ2hyb21hdGgoJ3JlZCcpOyAgICAgICAgICAgICAgICAgICAgICAvLyBDU1MvU1ZHIENvbG9yIG5hbWVcbm5ldyBDaHJvbWF0aCgncmdiKDI1NSwgMCwgMCknKTsgICAgICAgICAgIC8vIFJHQiB2aWEgQ1NTXG5uZXcgQ2hyb21hdGgoe3I6IDI1NSwgZzogMCwgYjogMH0pOyAgICAgICAvLyBSR0IgdmlhIG9iamVjdFxubmV3IENocm9tYXRoKCdyZ2JhKDI1NSwgMCwgMCwgMSknKTsgICAgICAgLy8gUkdCQSB2aWEgQ1NTXG5uZXcgQ2hyb21hdGgoe3I6IDI1NSwgZzogMCwgYjogMCwgYTogMX0pOyAvLyBSR0JBIHZpYSBvYmplY3Rcbm5ldyBDaHJvbWF0aCgnaHNsKDAsIDEwMCUsIDUwJSknKTsgICAgICAgIC8vIEhTTCB2aWEgQ1NTXG5uZXcgQ2hyb21hdGgoe2g6IDAsIHM6IDEsIGw6IDAuNX0pOyAgICAgICAvLyBIU0wgdmlhIG9iamVjdFxubmV3IENocm9tYXRoKCdoc2xhKDAsIDEwMCUsIDUwJSwgMSknKTsgICAgLy8gSFNMQSB2aWEgQ1NTXG5uZXcgQ2hyb21hdGgoe2g6IDAsIHM6IDEsIGw6IDAuNSwgYTogMX0pOyAvLyBIU0xBIHZpYSBvYmplY3Rcbm5ldyBDaHJvbWF0aCgnaHN2KDAsIDEwMCUsIDEwMCUpJyk7ICAgICAgIC8vIEhTViB2aWEgQ1NTXG5uZXcgQ2hyb21hdGgoe2g6IDAsIHM6IDEsIHY6IDF9KTsgICAgICAgICAvLyBIU1YgdmlhIG9iamVjdFxubmV3IENocm9tYXRoKCdoc3ZhKDAsIDEwMCUsIDEwMCUsIDEpJyk7ICAgLy8gSFNWQSB2aWEgQ1NTXG5uZXcgQ2hyb21hdGgoe2g6IDAsIHM6IDEsIHY6IDEsIGE6IDF9KTsgICAvLyBIU1ZBIHZpYSBvYmplY3Rcbm5ldyBDaHJvbWF0aCgnaHNiKDAsIDEwMCUsIDEwMCUpJyk7ICAgICAgIC8vIEhTQiB2aWEgQ1NTXG5uZXcgQ2hyb21hdGgoe2g6IDAsIHM6IDEsIGI6IDF9KTsgICAgICAgICAvLyBIU0IgdmlhIG9iamVjdFxubmV3IENocm9tYXRoKCdoc2JhKDAsIDEwMCUsIDEwMCUsIDEpJyk7ICAgLy8gSFNCQSB2aWEgQ1NTXG5uZXcgQ2hyb21hdGgoe2g6IDAsIHM6IDEsIGI6IDEsIGE6IDF9KTsgICAvLyBIU0JBIHZpYSBvYmplY3Rcbm5ldyBDaHJvbWF0aCgxNjcxMTY4MCk7ICAgICAgICAgICAgICAgICAgIC8vIFJHQiB2aWEgaW50ZWdlciAoYWxwaGEgY3VycmVudGx5IGlnbm9yZWQpXG4oZW5kIGNvZGUpXG4qL1xuZnVuY3Rpb24gQ2hyb21hdGgoIG1peGVkIClcbntcbiAgICB2YXIgY2hhbm5lbHMsIGNvbG9yLCBoc2wsIGhzdiwgcmdiO1xuXG4gICAgaWYgKHV0aWwuaXNTdHJpbmcobWl4ZWQpIHx8IHV0aWwuaXNOdW1iZXIobWl4ZWQpKSB7XG4gICAgICAgIGNoYW5uZWxzID0gQ2hyb21hdGgucGFyc2UobWl4ZWQpO1xuICAgIH0gZWxzZSBpZiAodXRpbC5pc0FycmF5KG1peGVkKSl7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5zdXJlIGhvdyB0byBwYXJzZSBhcnJheSBgJyttaXhlZCsnYCcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJywgcGxlYXNlIHBhc3MgYW4gb2JqZWN0IG9yIENTUyBzdHlsZSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdvciB0cnkgQ2hyb21hdGgucmdiLCBDaHJvbWF0aC5oc2wsIG9yIENocm9tYXRoLmhzdidcbiAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKG1peGVkIGluc3RhbmNlb2YgQ2hyb21hdGgpIHtcbiAgICAgICAgY2hhbm5lbHMgPSB1dGlsLm1lcmdlKHt9LCBtaXhlZCk7XG4gICAgfSBlbHNlIGlmICh1dGlsLmlzT2JqZWN0KG1peGVkKSl7XG4gICAgICAgIGNoYW5uZWxzID0gdXRpbC5tZXJnZSh7fSwgbWl4ZWQpO1xuICAgIH1cblxuICAgIGlmICghIGNoYW5uZWxzKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBwYXJzZSBgJyttaXhlZCsnYCcpO1xuICAgIGVsc2UgaWYgKCFpc0Zpbml0ZShjaGFubmVscy5hKSlcbiAgICAgICAgY2hhbm5lbHMuYSA9IDE7XG5cbiAgICBpZiAoJ3InIGluIGNoYW5uZWxzICl7XG4gICAgICAgIHJnYiA9IHV0aWwucmdiLnNjYWxlZDAxKFtjaGFubmVscy5yLCBjaGFubmVscy5nLCBjaGFubmVscy5iXSk7XG4gICAgICAgIGhzbCA9IENocm9tYXRoLnJnYjJoc2wocmdiKTtcbiAgICAgICAgaHN2ID0gQ2hyb21hdGgucmdiMmhzdihyZ2IpO1xuICAgIH0gZWxzZSBpZiAoJ2gnIGluIGNoYW5uZWxzICl7XG4gICAgICAgIGlmICgnbCcgaW4gY2hhbm5lbHMpe1xuICAgICAgICAgICAgaHNsID0gdXRpbC5oc2wuc2NhbGVkKFtjaGFubmVscy5oLCBjaGFubmVscy5zLCBjaGFubmVscy5sXSk7XG4gICAgICAgICAgICByZ2IgPSBDaHJvbWF0aC5oc2wycmdiKGhzbCk7XG4gICAgICAgICAgICBoc3YgPSBDaHJvbWF0aC5yZ2IyaHN2KHJnYik7XG4gICAgICAgIH0gZWxzZSBpZiAoJ3YnIGluIGNoYW5uZWxzIHx8ICdiJyBpbiBjaGFubmVscykge1xuICAgICAgICAgICAgaWYgKCdiJyBpbiBjaGFubmVscykgY2hhbm5lbHMudiA9IGNoYW5uZWxzLmI7XG4gICAgICAgICAgICBoc3YgPSB1dGlsLmhzbC5zY2FsZWQoW2NoYW5uZWxzLmgsIGNoYW5uZWxzLnMsIGNoYW5uZWxzLnZdKTtcbiAgICAgICAgICAgIHJnYiA9IENocm9tYXRoLmhzdjJyZ2IoaHN2KTtcbiAgICAgICAgICAgIGhzbCA9IENocm9tYXRoLnJnYjJoc2wocmdiKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgdXRpbC5tZXJnZSh0aGlzLCB7XG4gICAgICAgIHI6ICByZ2JbMF0sICBnOiByZ2JbMV0sIGI6IHJnYlsyXSxcbiAgICAgICAgaDogIGhzbFswXSwgc2w6IGhzbFsxXSwgbDogaHNsWzJdLFxuICAgICAgICBzdjogaHN2WzFdLCAgdjogaHN2WzJdLCBhOiBjaGFubmVscy5hXG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbn1cblxuLypcbiAgQ29uc3RydWN0b3I6IENocm9tYXRoLnJnYlxuICBDcmVhdGUgYSBuZXcgPENocm9tYXRoPiBpbnN0YW5jZSBmcm9tIFJHQiB2YWx1ZXNcblxuICBQYXJhbWV0ZXJzOlxuICByIC0gTnVtYmVyLCAwLTI1NSwgcmVwcmVzZW50aW5nIHRoZSBncmVlbiBjaGFubmVsIE9SIEFycmF5IE9SIG9iamVjdCAod2l0aCBrZXlzIHIsZyxiKSBvZiBSR0IgdmFsdWVzXG4gIGcgLSBOdW1iZXIsIDAtMjU1LCByZXByZXNlbnRpbmcgdGhlIGdyZWVuIGNoYW5uZWxcbiAgYiAtIE51bWJlciwgMC0yNTUsIHJlcHJlc2VudGluZyB0aGUgcmVkIGNoYW5uZWxcbiAgYSAtIChPcHRpb25hbCkgRmxvYXQsIDAtMSwgcmVwcmVzZW50aW5nIHRoZSBhbHBoYSBjaGFubmVsXG5cbiBSZXR1cm5zOlxuIDxDaHJvbWF0aD5cblxuIEV4YW1wbGVzOlxuID4gPiBuZXcgQ2hyb21hdGgucmdiKDEyMywgMjM0LCA1NikudG9TdHJpbmcoKVxuID4gXCIjN0JFQTM4XCJcblxuID4gPiBuZXcgQ2hyb21hdGgucmdiKFsxMjMsIDIzNCwgNTZdKS50b1N0cmluZygpXG4gPiBcIiM3QkVBMzhcIlxuXG4gPiA+IG5ldyBDaHJvbWF0aC5yZ2Ioe3I6IDEyMywgZzogMjM0LCBiOiA1Nn0pLnRvU3RyaW5nKClcbiA+IFwiIzdCRUEzOFwiXG4gKi9cbkNocm9tYXRoLnJnYiA9IGZ1bmN0aW9uIChyLCBnLCBiLCBhKVxue1xuICAgIHZhciByZ2JhID0gdXRpbC5yZ2IuZnJvbUFyZ3MociwgZywgYiwgYSk7XG4gICAgciA9IHJnYmFbMF0sIGcgPSByZ2JhWzFdLCBiID0gcmdiYVsyXSwgYSA9IHJnYmFbM107XG5cbiAgICByZXR1cm4gbmV3IENocm9tYXRoKHtyOiByLCBnOiBnLCBiOiBiLCBhOiBhfSk7XG59O1xuXG4vKlxuICBDb25zdHJ1Y3RvcjogQ2hyb21hdGgucmdiYVxuICBBbGlhcyBmb3IgPENocm9tYXRoLnJnYj5cbiovXG5DaHJvbWF0aC5yZ2JhID0gQ2hyb21hdGgucmdiO1xuXG4vKlxuICBDb25zdHJ1Y3RvcjogQ2hyb21hdGguaHNsXG4gIENyZWF0ZSBhIG5ldyBDaHJvbWF0aCBpbnN0YW5jZSBmcm9tIEhTTCB2YWx1ZXNcblxuICBQYXJhbWV0ZXJzOlxuICBoIC0gTnVtYmVyLCAtSW5maW5pdHkgLSBJbmZpbml0eSwgcmVwcmVzZW50aW5nIHRoZSBodWUgT1IgQXJyYXkgT1Igb2JqZWN0ICh3aXRoIGtleXMgaCxzLGwpIG9mIEhTTCB2YWx1ZXNcbiAgcyAtIE51bWJlciwgMC0xLCByZXByZXNlbnRpbmcgdGhlIHNhdHVyYXRpb25cbiAgbCAtIE51bWJlciwgMC0xLCByZXByZXNlbnRpbmcgdGhlIGxpZ2h0bmVzc1xuICBhIC0gKE9wdGlvbmFsKSBGbG9hdCwgMC0xLCByZXByZXNlbnRpbmcgdGhlIGFscGhhIGNoYW5uZWxcblxuICBSZXR1cm5zOlxuICA8Q2hyb21hdGg+XG5cbiAgRXhhbXBsZXM6XG4gID4gPiBuZXcgQ2hyb21hdGguaHNsKDI0MCwgMSwgMC41KS50b1N0cmluZygpXG4gID4gXCIjMDAwMEZGXCJcblxuICA+ID4gbmV3IENocm9tYXRoLmhzbChbMjQwLCAxLCAwLjVdKS50b1N0cmluZygpXG4gID4gXCIjMDAwMEZGXCJcblxuICA+IG5ldyBDaHJvbWF0aC5oc2woe2g6MjQwLCBzOjEsIGw6MC41fSkudG9TdHJpbmcoKVxuICA+IFwiIzAwMDBGRlwiXG4gKi9cbkNocm9tYXRoLmhzbCA9IGZ1bmN0aW9uIChoLCBzLCBsLCBhKVxue1xuICAgIHZhciBoc2xhID0gdXRpbC5oc2wuZnJvbUFyZ3MoaCwgcywgbCwgYSk7XG4gICAgaCA9IGhzbGFbMF0sIHMgPSBoc2xhWzFdLCBsID0gaHNsYVsyXSwgYSA9IGhzbGFbM107XG5cbiAgICByZXR1cm4gbmV3IENocm9tYXRoKHtoOiBoLCBzOiBzLCBsOiBsLCBhOiBhfSk7XG59O1xuXG4vKlxuICBDb25zdHJ1Y3RvcjogQ2hyb21hdGguaHNsYVxuICBBbGlhcyBmb3IgPENocm9tYXRoLmhzbD5cbiovXG5DaHJvbWF0aC5oc2xhID0gQ2hyb21hdGguaHNsO1xuXG4vKlxuICBDb25zdHJ1Y3RvcjogQ2hyb21hdGguaHN2XG4gIENyZWF0ZSBhIG5ldyBDaHJvbWF0aCBpbnN0YW5jZSBmcm9tIEhTViB2YWx1ZXNcblxuICBQYXJhbWV0ZXJzOlxuICBoIC0gTnVtYmVyLCAtSW5maW5pdHkgLSBJbmZpbml0eSwgcmVwcmVzZW50aW5nIHRoZSBodWUgT1IgQXJyYXkgT1Igb2JqZWN0ICh3aXRoIGtleXMgaCxzLGwpIG9mIEhTViB2YWx1ZXNcbiAgcyAtIE51bWJlciwgMC0xLCByZXByZXNlbnRpbmcgdGhlIHNhdHVyYXRpb25cbiAgdiAtIE51bWJlciwgMC0xLCByZXByZXNlbnRpbmcgdGhlIGxpZ2h0bmVzc1xuICBhIC0gKE9wdGlvbmFsKSBGbG9hdCwgMC0xLCByZXByZXNlbnRpbmcgdGhlIGFscGhhIGNoYW5uZWxcblxuICBSZXR1cm5zOlxuICA8Q2hyb21hdGg+XG5cbiAgRXhhbXBsZXM6XG4gID4gPiBuZXcgQ2hyb21hdGguaHN2KDI0MCwgMSwgMSkudG9TdHJpbmcoKVxuICA+IFwiIzAwMDBGRlwiXG5cbiAgPiA+IG5ldyBDaHJvbWF0aC5oc3YoWzI0MCwgMSwgMV0pLnRvU3RyaW5nKClcbiAgPiBcIiMwMDAwRkZcIlxuXG4gID4gPiBuZXcgQ2hyb21hdGguaHN2KHtoOjI0MCwgczoxLCB2OjF9KS50b1N0cmluZygpXG4gID4gXCIjMDAwMEZGXCJcbiAqL1xuQ2hyb21hdGguaHN2ID0gZnVuY3Rpb24gKGgsIHMsIHYsIGEpXG57XG4gICAgdmFyIGhzdmEgPSB1dGlsLmhzbC5mcm9tQXJncyhoLCBzLCB2LCBhKTtcbiAgICBoID0gaHN2YVswXSwgcyA9IGhzdmFbMV0sIHYgPSBoc3ZhWzJdLCBhID0gaHN2YVszXTtcblxuICAgIHJldHVybiBuZXcgQ2hyb21hdGgoe2g6IGgsIHM6IHMsIHY6IHYsIGE6IGF9KTtcbn07XG5cbi8qXG4gIENvbnN0cnVjdG9yOiBDaHJvbWF0aC5oc3ZhXG4gIEFsaWFzIGZvciA8Q2hyb21hdGguaHN2PlxuKi9cbkNocm9tYXRoLmhzdmEgPSBDaHJvbWF0aC5oc3Y7XG5cbi8qXG4gIENvbnN0cnVjdG9yOiBDaHJvbWF0aC5oc2JcbiAgQWxpYXMgZm9yIDxDaHJvbWF0aC5oc3Y+XG4gKi9cbkNocm9tYXRoLmhzYiA9IENocm9tYXRoLmhzdjtcblxuLypcbiAgIENvbnN0cnVjdG9yOiBDaHJvbWF0aC5oc2JhXG4gICBBbGlhcyBmb3IgPENocm9tYXRoLmhzdmE+XG4gKi9cbkNocm9tYXRoLmhzYmEgPSBDaHJvbWF0aC5oc3ZhO1xuXG4vLyBHcm91cDogU3RhdGljIG1ldGhvZHMgLSByZXByZXNlbnRhdGlvblxuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC50b0ludGVnZXJcbiAgQ29udmVydCBhIGNvbG9yIGludG8gYW4gaW50ZWdlciAoYWxwaGEgY2hhbm5lbCBjdXJyZW50bHkgb21pdHRlZClcblxuICBQYXJhbWV0ZXJzOlxuICBjb2xvciAtIEFjY2VwdHMgdGhlIHNhbWUgYXJndW1lbnRzIGFzIHRoZSBDaHJvbWF0aCBjb25zdHJ1Y3RvclxuXG4gIFJldHVybnM6XG4gIGludGVnZXJcblxuICBFeGFtcGxlczpcbiAgPiA+IENocm9tYXRoLnRvSW50ZWdlcignZ3JlZW4nKTtcbiAgPiAzMjc2OFxuXG4gID4gPiBDaHJvbWF0aC50b0ludGVnZXIoJ3doaXRlJyk7XG4gID4gMTY3NzcyMTVcbiovXG5DaHJvbWF0aC50b0ludGVnZXIgPSBmdW5jdGlvbiAoY29sb3IpXG57XG4gICAgLy8gY3JlYXRlIHNvbWV0aGluZyBsaWtlICcwMDgwMDAnIChncmVlbilcbiAgICB2YXIgaGV4NiA9IG5ldyBDaHJvbWF0aChjb2xvcikuaGV4KCkuam9pbignJyk7XG5cbiAgICAvLyBBcmd1bWVudHMgYmVnaW5uaW5nIHdpdGggYDB4YCBhcmUgdHJlYXRlZCBhcyBoZXggdmFsdWVzXG4gICAgcmV0dXJuIE51bWJlcignMHgnICsgaGV4Nik7XG59O1xuXG4vKlxuICBNZXRob2Q6IENocm9tYXRoLnRvTmFtZVxuICBSZXR1cm4gdGhlIFczQyBjb2xvciBuYW1lIG9mIHRoZSBjb2xvciBpdCBtYXRjaGVzXG5cbiAgUGFyYW1ldGVyczpcbiAgY29tcGFyaXNvblxuXG4gIEV4YW1wbGVzOlxuICA+ID4gQ2hyb21hdGgudG9OYW1lKCdyZ2IoMjU1LCAwLCAyNTUpJyk7XG4gID4gJ2Z1Y2hzaWEnXG5cbiAgPiA+IENocm9tYXRoLnRvTmFtZSg2NTUzNSk7XG4gID4gJ2FxdWEnXG4qL1xuQ2hyb21hdGgudG9OYW1lID0gZnVuY3Rpb24gKGNvbXBhcmlzb24pXG57XG4gICAgY29tcGFyaXNvbiA9ICtuZXcgQ2hyb21hdGgoY29tcGFyaXNvbik7XG4gICAgZm9yICh2YXIgY29sb3IgaW4gQ2hyb21hdGguY29sb3JzKSBpZiAoK0Nocm9tYXRoW2NvbG9yXSA9PSBjb21wYXJpc29uKSByZXR1cm4gY29sb3I7XG59O1xuXG4vLyBHcm91cDogU3RhdGljIG1ldGhvZHMgLSBjb2xvciBjb252ZXJzaW9uXG4vKlxuICBNZXRob2Q6IENocm9tYXRoLnJnYjJoZXhcbiAgQ29udmVydCBhbiBSR0IgdmFsdWUgdG8gYSBIZXggdmFsdWVcblxuICBSZXR1cm5zOiBhcnJheVxuXG4gIEV4YW1wbGU6XG4gID4gPiBDaHJvbWF0aC5yZ2IyaGV4KDUwLCAxMDAsIDE1MClcbiAgPiBcIlszMiwgNjQsIDk2XVwiXG4gKi9cbkNocm9tYXRoLnJnYjJoZXggPSBmdW5jdGlvbiByZ2IyaGV4KHIsIGcsIGIpXG57XG4gICAgdmFyIHJnYiA9IHV0aWwucmdiLnNjYWxlZDAxKHIsIGcsIGIpO1xuICAgIHZhciBoZXggPSByZ2IubWFwKGZ1bmN0aW9uIChwY3QpIHtcbiAgICAgIHZhciBkZWMgPSBNYXRoLnJvdW5kKHBjdCAqIDI1NSk7XG4gICAgICB2YXIgaGV4ID0gZGVjLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpO1xuICAgICAgcmV0dXJuIHV0aWwubHBhZChoZXgsIDIsIDApO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGhleDtcbn07XG5cbi8vIENvbnZlcnRlZCBmcm9tIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSFNMX2FuZF9IU1YjR2VuZXJhbF9hcHByb2FjaFxuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC5yZ2IyaHNsXG4gIENvbnZlcnQgUkdCIHRvIEhTTFxuXG4gIFBhcmFtZXRlcnM6XG4gIHIgLSBOdW1iZXIsIDAtMjU1LCByZXByZXNlbnRpbmcgdGhlIGdyZWVuIGNoYW5uZWwgT1IgQXJyYXkgT1Igb2JqZWN0ICh3aXRoIGtleXMgcixnLGIpIG9mIFJHQiB2YWx1ZXNcbiAgZyAtIE51bWJlciwgMC0yNTUsIHJlcHJlc2VudGluZyB0aGUgZ3JlZW4gY2hhbm5lbFxuICBiIC0gTnVtYmVyLCAwLTI1NSwgcmVwcmVzZW50aW5nIHRoZSByZWQgY2hhbm5lbFxuXG4gIFJldHVybnM6IGFycmF5XG5cbiAgPiA+IENocm9tYXRoLnJnYjJoc2woMCwgMjU1LCAwKTtcbiAgPiBbIDEyMCwgMSwgMC41IF1cblxuICA+ID4gQ2hyb21hdGgucmdiMmhzbChbMCwgMCwgMjU1XSk7XG4gID4gWyAyNDAsIDEsIDAuNSBdXG5cbiAgPiA+IENocm9tYXRoLnJnYjJoc2woe3I6IDI1NSwgZzogMCwgYjogMH0pO1xuICA+IFsgMCwgMSwgMC41IF1cbiAqL1xuQ2hyb21hdGgucmdiMmhzbCA9IGZ1bmN0aW9uIHJnYjJoc2wociwgZywgYilcbntcbiAgICB2YXIgcmdiID0gdXRpbC5yZ2Iuc2NhbGVkMDEociwgZywgYik7XG4gICAgciA9IHJnYlswXSwgZyA9IHJnYlsxXSwgYiA9IHJnYlsyXTtcblxuICAgIHZhciBNID0gTWF0aC5tYXgociwgZywgYik7XG4gICAgdmFyIG0gPSBNYXRoLm1pbihyLCBnLCBiKTtcbiAgICB2YXIgQyA9IE0gLSBtO1xuICAgIHZhciBMID0gMC41KihNICsgbSk7XG4gICAgdmFyIFMgPSAoQyA9PT0gMCkgPyAwIDogQy8oMS1NYXRoLmFicygyKkwtMSkpO1xuXG4gICAgdmFyIGg7XG4gICAgaWYgKEMgPT09IDApIGggPSAwOyAvLyBzcGVjJ2QgYXMgdW5kZWZpbmVkLCBidXQgdXN1YWxseSBzZXQgdG8gMFxuICAgIGVsc2UgaWYgKE0gPT09IHIpIGggPSAoKGctYikvQykgJSA2O1xuICAgIGVsc2UgaWYgKE0gPT09IGcpIGggPSAoKGItcikvQykgKyAyO1xuICAgIGVsc2UgaWYgKE0gPT09IGIpIGggPSAoKHItZykvQykgKyA0O1xuXG4gICAgdmFyIEggPSA2MCAqIGg7XG5cbiAgICByZXR1cm4gW0gsIHBhcnNlRmxvYXQoUyksIHBhcnNlRmxvYXQoTCldO1xufTtcblxuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC5yZ2IyaHN2XG4gIENvbnZlcnQgUkdCIHRvIEhTVlxuXG4gIFBhcmFtZXRlcnM6XG4gIHIgLSBOdW1iZXIsIDAtMjU1LCByZXByZXNlbnRpbmcgdGhlIGdyZWVuIGNoYW5uZWwgT1IgQXJyYXkgT1Igb2JqZWN0ICh3aXRoIGtleXMgcixnLGIpIG9mIFJHQiB2YWx1ZXNcbiAgZyAtIE51bWJlciwgMC0yNTUsIHJlcHJlc2VudGluZyB0aGUgZ3JlZW4gY2hhbm5lbFxuICBiIC0gTnVtYmVyLCAwLTI1NSwgcmVwcmVzZW50aW5nIHRoZSByZWQgY2hhbm5lbFxuXG4gIFJldHVybnM6XG4gIEFycmF5XG5cbiAgPiA+IENocm9tYXRoLnJnYjJoc3YoMCwgMjU1LCAwKTtcbiAgPiBbIDEyMCwgMSwgMSBdXG5cbiAgPiA+IENocm9tYXRoLnJnYjJoc3YoWzAsIDAsIDI1NV0pO1xuICA+IFsgMjQwLCAxLCAxIF1cblxuICA+ID4gQ2hyb21hdGgucmdiMmhzdih7cjogMjU1LCBnOiAwLCBiOiAwfSk7XG4gID4gWyAwLCAxLCAxIF1cbiAqL1xuQ2hyb21hdGgucmdiMmhzdiA9IGZ1bmN0aW9uIHJnYjJoc3YociwgZywgYilcbntcbiAgICB2YXIgcmdiID0gdXRpbC5yZ2Iuc2NhbGVkMDEociwgZywgYik7XG4gICAgciA9IHJnYlswXSwgZyA9IHJnYlsxXSwgYiA9IHJnYlsyXTtcblxuICAgIHZhciBNID0gTWF0aC5tYXgociwgZywgYik7XG4gICAgdmFyIG0gPSBNYXRoLm1pbihyLCBnLCBiKTtcbiAgICB2YXIgQyA9IE0gLSBtO1xuICAgIHZhciBMID0gTTtcbiAgICB2YXIgUyA9IChDID09PSAwKSA/IDAgOiBDL007XG5cbiAgICB2YXIgaDtcbiAgICBpZiAoQyA9PT0gMCkgaCA9IDA7IC8vIHNwZWMnZCBhcyB1bmRlZmluZWQsIGJ1dCB1c3VhbGx5IHNldCB0byAwXG4gICAgZWxzZSBpZiAoTSA9PT0gcikgaCA9ICgoZy1iKS9DKSAlIDY7XG4gICAgZWxzZSBpZiAoTSA9PT0gZykgaCA9ICgoYi1yKS9DKSArIDI7XG4gICAgZWxzZSBpZiAoTSA9PT0gYikgaCA9ICgoci1nKS9DKSArIDQ7XG5cbiAgICB2YXIgSCA9IDYwICogaDtcblxuICAgIHJldHVybiBbSCwgcGFyc2VGbG9hdChTKSwgcGFyc2VGbG9hdChMKV07XG59O1xuXG4vKlxuICAgTWV0aG9kOiBDaHJvbWF0aC5yZ2IyaHNiXG4gICBBbGlhcyBmb3IgPENocm9tYXRoLnJnYjJoc3Y+XG4gKi9cbkNocm9tYXRoLnJnYjJoc2IgPSBDaHJvbWF0aC5yZ2IyaHN2O1xuXG4vKlxuICBNZXRob2Q6IENocm9tYXRoLmhzbDJyZ2JcbiAgQ29udmVydCBmcm9tIEhTTCB0byBSR0JcblxuICBQYXJhbWV0ZXJzOlxuICBoIC0gTnVtYmVyLCAtSW5maW5pdHkgLSBJbmZpbml0eSwgcmVwcmVzZW50aW5nIHRoZSBodWUgT1IgQXJyYXkgT1Igb2JqZWN0ICh3aXRoIGtleXMgaCxzLGwpIG9mIEhTTCB2YWx1ZXNcbiAgcyAtIE51bWJlciwgMC0xLCByZXByZXNlbnRpbmcgdGhlIHNhdHVyYXRpb25cbiAgbCAtIE51bWJlciwgMC0xLCByZXByZXNlbnRpbmcgdGhlIGxpZ2h0bmVzc1xuXG4gIFJldHVybnM6XG4gIGFycmF5XG5cbiAgRXhhbXBsZXM6XG4gID4gPiBDaHJvbWF0aC5oc2wycmdiKDM2MCwgMSwgMC41KTtcbiAgPiBbIDI1NSwgMCwgMCBdXG5cbiAgPiA+IENocm9tYXRoLmhzbDJyZ2IoWzAsIDEsIDAuNV0pO1xuICA+IFsgMjU1LCAwLCAwIF1cblxuICA+ID4gQ2hyb21hdGguaHNsMnJnYih7aDogMjEwLCBzOjEsIHY6IDAuNX0pO1xuICA+IFsgMCwgMTI3LjUsIDI1NSBdXG4gKi9cbi8vIFRPRE86IENhbiBJICU9IGhwIGFuZCB0aGVuIGRvIGEgc3dpdGNoP1xuQ2hyb21hdGguaHNsMnJnYiA9IGZ1bmN0aW9uIGhzbDJyZ2IoaCwgcywgbClcbntcbiAgICB2YXIgaHNsID0gdXRpbC5oc2wuc2NhbGVkKGgsIHMsIGwpO1xuICAgIGg9aHNsWzBdLCBzPWhzbFsxXSwgbD1oc2xbMl07XG5cbiAgICB2YXIgQyA9ICgxIC0gTWF0aC5hYnMoMipsLTEpKSAqIHM7XG4gICAgdmFyIGhwID0gaC82MDtcbiAgICB2YXIgWCA9IEMgKiAoMS1NYXRoLmFicyhocCUyLTEpKTtcbiAgICB2YXIgcmdiLCBtO1xuXG4gICAgc3dpdGNoIChNYXRoLmZsb29yKGhwKSl7XG4gICAgY2FzZSAwOiAgcmdiID0gW0MsWCwwXTsgYnJlYWs7XG4gICAgY2FzZSAxOiAgcmdiID0gW1gsQywwXTsgYnJlYWs7XG4gICAgY2FzZSAyOiAgcmdiID0gWzAsQyxYXTsgYnJlYWs7XG4gICAgY2FzZSAzOiAgcmdiID0gWzAsWCxDXTsgYnJlYWs7XG4gICAgY2FzZSA0OiAgcmdiID0gW1gsMCxDXTsgYnJlYWs7XG4gICAgY2FzZSA1OiAgcmdiID0gW0MsMCxYXTsgYnJlYWs7XG4gICAgZGVmYXVsdDogcmdiID0gWzAsMCwwXTtcbiAgICB9XG5cbiAgICBtID0gbCAtIChDLzIpO1xuXG4gICAgcmV0dXJuIFtcbiAgICAgICAgKHJnYlswXSttKSxcbiAgICAgICAgKHJnYlsxXSttKSxcbiAgICAgICAgKHJnYlsyXSttKVxuICAgIF07XG59O1xuXG4vKlxuICBNZXRob2Q6IENocm9tYXRoLmhzdjJyZ2JcbiAgQ29udmVydCBIU1YgdG8gUkdCXG5cbiAgUGFyYW1ldGVyczpcbiAgaCAtIE51bWJlciwgLUluZmluaXR5IC0gSW5maW5pdHksIHJlcHJlc2VudGluZyB0aGUgaHVlIE9SIEFycmF5IE9SIG9iamVjdCAod2l0aCBrZXlzIGgscyx2IG9yIGgscyxiKSBvZiBIU1YgdmFsdWVzXG4gIHMgLSBOdW1iZXIsIDAtMSwgcmVwcmVzZW50aW5nIHRoZSBzYXR1cmF0aW9uXG4gIHYgLSBOdW1iZXIsIDAtMSwgcmVwcmVzZW50aW5nIHRoZSBsaWdodG5lc3NcblxuICBFeGFtcGxlczpcbiAgPiA+IENocm9tYXRoLmhzdjJyZ2IoMzYwLCAxLCAxKTtcbiAgPiBbIDI1NSwgMCwgMCBdXG5cbiAgPiA+IENocm9tYXRoLmhzdjJyZ2IoWzAsIDEsIDAuNV0pO1xuICA+IFsgMTI3LjUsIDAsIDAgXVxuXG4gID4gPiBDaHJvbWF0aC5oc3YycmdiKHtoOiAyMTAsIHM6IDAuNSwgdjogMX0pO1xuICA+IFsgMTI3LjUsIDE5MS4yNSwgMjU1IF1cbiAqL1xuQ2hyb21hdGguaHN2MnJnYiA9IGZ1bmN0aW9uIGhzdjJyZ2IoaCwgcywgdilcbntcbiAgICB2YXIgaHN2ID0gdXRpbC5oc2wuc2NhbGVkKGgsIHMsIHYpO1xuICAgIGg9aHN2WzBdLCBzPWhzdlsxXSwgdj1oc3ZbMl07XG5cbiAgICB2YXIgQyA9IHYgKiBzO1xuICAgIHZhciBocCA9IGgvNjA7XG4gICAgdmFyIFggPSBDKigxLU1hdGguYWJzKGhwJTItMSkpO1xuICAgIHZhciByZ2IsIG07XG5cbiAgICBpZiAoaCA9PSB1bmRlZmluZWQpICAgICAgICAgcmdiID0gWzAsMCwwXTtcbiAgICBlbHNlIGlmICgwIDw9IGhwICYmIGhwIDwgMSkgcmdiID0gW0MsWCwwXTtcbiAgICBlbHNlIGlmICgxIDw9IGhwICYmIGhwIDwgMikgcmdiID0gW1gsQywwXTtcbiAgICBlbHNlIGlmICgyIDw9IGhwICYmIGhwIDwgMykgcmdiID0gWzAsQyxYXTtcbiAgICBlbHNlIGlmICgzIDw9IGhwICYmIGhwIDwgNCkgcmdiID0gWzAsWCxDXTtcbiAgICBlbHNlIGlmICg0IDw9IGhwICYmIGhwIDwgNSkgcmdiID0gW1gsMCxDXTtcbiAgICBlbHNlIGlmICg1IDw9IGhwICYmIGhwIDwgNikgcmdiID0gW0MsMCxYXTtcblxuICAgIG0gPSB2IC0gQztcblxuICAgIHJldHVybiBbXG4gICAgICAgIChyZ2JbMF0rbSksXG4gICAgICAgIChyZ2JbMV0rbSksXG4gICAgICAgIChyZ2JbMl0rbSlcbiAgICBdO1xufTtcblxuLypcbiAgIE1ldGhvZDogQ2hyb21hdGguaHNiMnJnYlxuICAgQWxpYXMgZm9yIDxDaHJvbWF0aC5oc3YycmdiPlxuICovXG5DaHJvbWF0aC5oc2IycmdiID0gQ2hyb21hdGguaHN2MnJnYjtcblxuLypcbiAgICBQcm9wZXJ0eTogQ2hyb21hdGguY29udmVydFxuICAgIEFsaWFzZXMgZm9yIHRoZSBDaHJvbWF0aC54MnkgZnVuY3Rpb25zLlxuICAgIFVzZSBsaWtlIENocm9tYXRoLmNvbnZlcnRbeF1beV0oYXJncykgb3IgQ2hyb21hdGguY29udmVydC54LnkoYXJncylcbiovXG5DaHJvbWF0aC5jb252ZXJ0ID0ge1xuICAgIHJnYjoge1xuICAgICAgICBoZXg6IENocm9tYXRoLmhzdjJyZ2IsXG4gICAgICAgIGhzbDogQ2hyb21hdGgucmdiMmhzbCxcbiAgICAgICAgaHN2OiBDaHJvbWF0aC5yZ2IyaHN2XG4gICAgfSxcbiAgICBoc2w6IHtcbiAgICAgICAgcmdiOiBDaHJvbWF0aC5oc2wycmdiXG4gICAgfSxcbiAgICBoc3Y6IHtcbiAgICAgICAgcmdiOiBDaHJvbWF0aC5oc3YycmdiXG4gICAgfVxufTtcblxuLyogR3JvdXA6IFN0YXRpYyBtZXRob2RzIC0gY29sb3Igc2NoZW1lICovXG4vKlxuICBNZXRob2Q6IENocm9tYXRoLmNvbXBsZW1lbnRcbiAgUmV0dXJuIHRoZSBjb21wbGVtZW50IG9mIHRoZSBnaXZlbiBjb2xvclxuXG4gIFJldHVybnM6IDxDaHJvbWF0aD5cblxuICA+ID4gQ2hyb21hdGguY29tcGxlbWVudChuZXcgQ2hyb21hdGgoJ3JlZCcpKTtcbiAgPiB7IHI6IDAsIGc6IDI1NSwgYjogMjU1LCBhOiAxLCBoOiAxODAsIHNsOiAxLCBzdjogMSwgbDogMC41LCB2OiAxIH1cblxuICA+ID4gQ2hyb21hdGguY29tcGxlbWVudChuZXcgQ2hyb21hdGgoJ3JlZCcpKS50b1N0cmluZygpO1xuICA+ICcjMDBGRkZGJ1xuICovXG5DaHJvbWF0aC5jb21wbGVtZW50ID0gZnVuY3Rpb24gKGNvbG9yKVxue1xuICAgIHZhciBjID0gbmV3IENocm9tYXRoKGNvbG9yKTtcbiAgICB2YXIgaHNsID0gYy50b0hTTE9iamVjdCgpO1xuXG4gICAgaHNsLmggPSAoaHNsLmggKyAxODApICUgMzYwO1xuXG4gICAgcmV0dXJuIG5ldyBDaHJvbWF0aChoc2wpO1xufTtcblxuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC50cmlhZFxuICBDcmVhdGUgYSB0cmlhZCBjb2xvciBzY2hlbWUgZnJvbSB0aGUgZ2l2ZW4gQ2hyb21hdGguXG5cbiAgRXhhbXBsZXM6XG4gID4gPiBDaHJvbWF0aC50cmlhZChDaHJvbWF0aC55ZWxsb3cpXG4gID4gWyB7IHI6IDI1NSwgZzogMjU1LCBiOiAwLCBhOiAxLCBoOiA2MCwgc2w6IDEsIHN2OiAxLCBsOiAwLjUsIHY6IDEgfSxcbiAgPiAgIHsgcjogMCwgZzogMjU1LCBiOiAyNTUsIGE6IDEsIGg6IDE4MCwgc2w6IDEsIHN2OiAxLCBsOiAwLjUsIHY6IDEgfSxcbiAgPiAgIHsgcjogMjU1LCBnOiAwLCBiOiAyNTUsIGE6IDEsIGg6IDMwMCwgc2w6IDEsIHN2OiAxLCBsOiAwLjUsIHY6IDEgfSBdXG5cbiA+ID4gQ2hyb21hdGgudHJpYWQoQ2hyb21hdGgueWVsbG93KS50b1N0cmluZygpO1xuID4gJyNGRkZGMDAsIzAwRkZGRiwjRkYwMEZGJ1xuKi9cbkNocm9tYXRoLnRyaWFkID0gZnVuY3Rpb24gKGNvbG9yKVxue1xuICAgIHZhciBjID0gbmV3IENocm9tYXRoKGNvbG9yKTtcblxuICAgIHJldHVybiBbXG4gICAgICAgIGMsXG4gICAgICAgIG5ldyBDaHJvbWF0aCh7cjogYy5iLCBnOiBjLnIsIGI6IGMuZ30pLFxuICAgICAgICBuZXcgQ2hyb21hdGgoe3I6IGMuZywgZzogYy5iLCBiOiBjLnJ9KVxuICAgIF07XG59O1xuXG4vKlxuICBNZXRob2Q6IENocm9tYXRoLnRldHJhZFxuICBDcmVhdGUgYSB0ZXRyYWQgY29sb3Igc2NoZW1lIGZyb20gdGhlIGdpdmVuIENocm9tYXRoLlxuXG4gIEV4YW1wbGVzOlxuICA+ID4gQ2hyb21hdGgudGV0cmFkKENocm9tYXRoLmN5YW4pXG4gID4gWyB7IHI6IDAsIGc6IDI1NSwgYjogMjU1LCBhOiAxLCBoOiAxODAsIHNsOiAxLCBzdjogMSwgbDogMC41LCB2OiAxIH0sXG4gID4gICB7IHI6IDI1NSwgZzogMCwgYjogMjU1LCBhOiAxLCBoOiAzMDAsIHNsOiAxLCBzdjogMSwgbDogMC41LCB2OiAxIH0sXG4gID4gICB7IHI6IDI1NSwgZzogMjU1LCBiOiAwLCBhOiAxLCBoOiA2MCwgc2w6IDEsIHN2OiAxLCBsOiAwLjUsIHY6IDEgfSxcbiAgPiAgIHsgcjogMCwgZzogMjU1LCBiOiAwLCBhOiAxLCBoOiAxMjAsIHNsOiAxLCBzdjogMSwgbDogMC41LCB2OiAxIH0gXVxuXG4gID4gPiBDaHJvbWF0aC50ZXRyYWQoQ2hyb21hdGguY3lhbikudG9TdHJpbmcoKTtcbiAgPiAnIzAwRkZGRiwjRkYwMEZGLCNGRkZGMDAsIzAwRkYwMCdcbiovXG5DaHJvbWF0aC50ZXRyYWQgPSBmdW5jdGlvbiAoY29sb3IpXG57XG4gICAgdmFyIGMgPSBuZXcgQ2hyb21hdGgoY29sb3IpO1xuXG4gICAgcmV0dXJuIFtcbiAgICAgICAgYyxcbiAgICAgICAgbmV3IENocm9tYXRoKHtyOiBjLmIsIGc6IGMuciwgYjogYy5ifSksXG4gICAgICAgIG5ldyBDaHJvbWF0aCh7cjogYy5iLCBnOiBjLmcsIGI6IGMucn0pLFxuICAgICAgICBuZXcgQ2hyb21hdGgoe3I6IGMuciwgZzogYy5iLCBiOiBjLnJ9KVxuICAgIF07XG59O1xuXG4vKlxuICBNZXRob2Q6IENocm9tYXRoLmFuYWxvZ291c1xuICBGaW5kIGFuYWxvZ291cyBjb2xvcnMgZnJvbSBhIGdpdmVuIGNvbG9yXG5cbiAgUGFyYW1ldGVyczpcbiAgbWl4ZWQgLSBBbnkgYXJndW1lbnQgd2hpY2ggaXMgcGFzc2VkIHRvIDxDaHJvbWF0aD5cbiAgcmVzdWx0cyAtIEhvdyBtYW55IGNvbG9ycyB0byByZXR1cm4gKGRlZmF1bHQgPSAzKVxuICBzbGljZXMgLSBIb3cgbWFueSBwaWVjZXMgYXJlIGluIHRoZSBjb2xvciB3aGVlbCAoZGVmYXVsdCA9IDEyKVxuXG4gIEV4YW1wbGVzOlxuICA+ID4gQ2hyb21hdGguYW5hbG9nb3VzKG5ldyBDaHJvbWF0aCgncmdiKDAsIDI1NSwgMjU1KScpKVxuICA+IFsgeyByOiAwLCBnOiAyNTUsIGI6IDI1NSwgYTogMSwgaDogMTgwLCBzbDogMSwgc3Y6IDEsIGw6IDAuNSwgdjogMSB9LFxuICA+ICAgeyByOiAwLCBnOiAyNTUsIGI6IDEwMSwgYTogMSwgaDogMTQ0LCBzbDogMSwgc3Y6IDEsIGw6IDAuNSwgdjogMSB9LFxuICA+ICAgeyByOiAwLCBnOiAyNTUsIGI6IDE1MywgYTogMSwgaDogMTU2LCBzbDogMSwgc3Y6IDEsIGw6IDAuNSwgdjogMSB9LFxuICA+ICAgeyByOiAwLCBnOiAyNTUsIGI6IDIwMywgYTogMSwgaDogMTY4LCBzbDogMSwgc3Y6IDEsIGw6IDAuNSwgdjogMSB9LFxuICA+ICAgeyByOiAwLCBnOiAyNTUsIGI6IDI1NSwgYTogMSwgaDogMTgwLCBzbDogMSwgc3Y6IDEsIGw6IDAuNSwgdjogMSB9LFxuICA+ICAgeyByOiAwLCBnOiAyMDMsIGI6IDI1NSwgYTogMSwgaDogMTkyLCBzbDogMSwgc3Y6IDEsIGw6IDAuNSwgdjogMSB9LFxuICA+ICAgeyByOiAwLCBnOiAxNTMsIGI6IDI1NSwgYTogMSwgaDogMjA0LCBzbDogMSwgc3Y6IDEsIGw6IDAuNSwgdjogMSB9LFxuICA+ICAgeyByOiAwLCBnOiAxMDEsIGI6IDI1NSwgYTogMSwgaDogMjE2LCBzbDogMSwgc3Y6IDEsIGw6IDAuNSwgdjogMSB9IF1cblxuICA+ID4gQ2hyb21hdGguYW5hbG9nb3VzKG5ldyBDaHJvbWF0aCgncmdiKDAsIDI1NSwgMjU1KScpKS50b1N0cmluZygpXG4gID4gJyMwMEZGRkYsIzAwRkY2NSwjMDBGRjk5LCMwMEZGQ0IsIzAwRkZGRiwjMDBDQkZGLCMwMDk5RkYsIzAwNjVGRidcbiAqL1xuQ2hyb21hdGguYW5hbG9nb3VzID0gZnVuY3Rpb24gKGNvbG9yLCByZXN1bHRzLCBzbGljZXMpXG57XG4gICAgaWYgKCFpc0Zpbml0ZShyZXN1bHRzKSkgcmVzdWx0cyA9IDM7XG4gICAgaWYgKCFpc0Zpbml0ZShzbGljZXMpKSBzbGljZXMgPSAxMjtcblxuICAgIHZhciBjID0gbmV3IENocm9tYXRoKGNvbG9yKTtcbiAgICB2YXIgaHN2ID0gYy50b0hTVk9iamVjdCgpO1xuICAgIHZhciBzbGljZSA9IDM2MCAvIHNsaWNlcztcbiAgICB2YXIgcmV0ID0gWyBjIF07XG5cbiAgICBoc3YuaCA9ICgoaHN2LmggLSAoc2xpY2VzICogcmVzdWx0cyA+PiAxKSkgKyA3MjApICUgMzYwO1xuICAgIHdoaWxlICgtLXJlc3VsdHMpIHtcbiAgICAgICAgaHN2LmggPSAoaHN2LmggKyBzbGljZSkgJSAzNjA7XG4gICAgICAgIHJldC5wdXNoKG5ldyBDaHJvbWF0aChoc3YpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmV0O1xufTtcblxuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC5tb25vY2hyb21hdGljXG4gIFJldHVybiBhIHNlcmllcyBvZiB0aGUgZ2l2ZW4gY29sb3IgYXQgdmFyaW91cyBsaWdodG5lc3Nlc1xuXG4gIEV4YW1wbGVzOlxuICA+ID4gQ2hyb21hdGgubW9ub2Nocm9tYXRpYygncmdiKDAsIDEwMCwgMjU1KScpLmZvckVhY2goZnVuY3Rpb24gKGMpeyBjb25zb2xlLmxvZyhjLnRvSFNWU3RyaW5nKCkpOyB9KVxuICA+IGhzdigyMTYsMTAwJSwyMCUpXG4gID4gaHN2KDIxNiwxMDAlLDQwJSlcbiAgPiBoc3YoMjE2LDEwMCUsNjAlKVxuICA+IGhzdigyMTYsMTAwJSw4MCUpXG4gID4gaHN2KDIxNiwxMDAlLDEwMCUpXG4qL1xuQ2hyb21hdGgubW9ub2Nocm9tYXRpYyA9IGZ1bmN0aW9uIChjb2xvciwgcmVzdWx0cylcbntcbiAgICBpZiAoIXJlc3VsdHMpIHJlc3VsdHMgPSA1O1xuXG4gICAgdmFyIGMgPSBuZXcgQ2hyb21hdGgoY29sb3IpO1xuICAgIHZhciBoc3YgPSBjLnRvSFNWT2JqZWN0KCk7XG4gICAgdmFyIGluYyA9IDEgLyByZXN1bHRzO1xuICAgIHZhciByZXQgPSBbXSwgc3RlcCA9IDA7XG5cbiAgICB3aGlsZSAoc3RlcCsrIDwgcmVzdWx0cykge1xuICAgICAgICBoc3YudiA9IHN0ZXAgKiBpbmM7XG4gICAgICAgIHJldC5wdXNoKG5ldyBDaHJvbWF0aChoc3YpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmV0O1xufTtcblxuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC5zcGxpdGNvbXBsZW1lbnRcbiAgR2VuZXJhdGUgYSBzcGxpdCBjb21wbGVtZW50IGNvbG9yIHNjaGVtZSBmcm9tIHRoZSBnaXZlbiBjb2xvclxuXG4gIEV4YW1wbGVzOlxuICA+ID4gQ2hyb21hdGguc3BsaXRjb21wbGVtZW50KCdyZ2IoMCwgMTAwLCAyNTUpJylcbiAgPiBbIHsgcjogMCwgZzogMTAwLCBiOiAyNTUsIGg6IDIxNi40NzA1ODgyMzUyOTQxNCwgc2w6IDEsIGw6IDAuNSwgc3Y6IDEsIHY6IDEsIGE6IDEgfSxcbiAgPiAgIHsgcjogMjU1LCBnOiAxODMsIGI6IDAsIGg6IDQzLjE5OTk5OTk5OTk5OTk5LCBzbDogMSwgbDogMC41LCBzdjogMSwgdjogMSwgYTogMSB9LFxuICA+ICAgeyByOiAyNTUsIGc6IDczLCBiOiAwLCBoOiAxNy4yNzk5OTk5OTk5OTk5NzMsIHNsOiAxLCBsOiAwLjUsIHN2OiAxLCB2OiAxLCBhOiAxIH0gXVxuXG4gID4gPiBDaHJvbWF0aC5zcGxpdGNvbXBsZW1lbnQoJ3JnYigwLCAxMDAsIDI1NSknKS50b1N0cmluZygpXG4gID4gJyMwMDY0RkYsI0ZGQjcwMCwjRkY0OTAwJ1xuICovXG5DaHJvbWF0aC5zcGxpdGNvbXBsZW1lbnQgPSBmdW5jdGlvbiAoY29sb3IpXG57XG4gICAgdmFyIHJlZiA9IG5ldyBDaHJvbWF0aChjb2xvcik7XG4gICAgdmFyIGhzdiA9IHJlZi50b0hTVk9iamVjdCgpO1xuXG4gICAgdmFyIGEgPSBuZXcgQ2hyb21hdGguaHN2KHtcbiAgICAgICAgaDogKGhzdi5oICsgMTUwKSAlIDM2MCxcbiAgICAgICAgczogaHN2LnMsXG4gICAgICAgIHY6IGhzdi52XG4gICAgfSk7XG5cbiAgICB2YXIgYiA9IG5ldyBDaHJvbWF0aC5oc3Yoe1xuICAgICAgICBoOiAoaHN2LmggKyAyMTApICUgMzYwLFxuICAgICAgICBzOiBoc3YucyxcbiAgICAgICAgdjogaHN2LnZcbiAgICB9KTtcblxuICAgIHJldHVybiBbcmVmLCBhLCBiXTtcbn07XG5cbi8vR3JvdXA6IFN0YXRpYyBtZXRob2RzIC0gY29sb3IgYWx0ZXJhdGlvblxuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC50aW50XG4gIExpZ2h0ZW4gYSBjb2xvciBieSBhZGRpbmcgYSBwZXJjZW50YWdlIG9mIHdoaXRlIHRvIGl0XG5cbiAgUmV0dXJucyA8Q2hyb21hdGg+XG5cbiAgPiA+IENocm9tYXRoLnRpbnQoJ3JnYigwLCAxMDAsIDI1NSknLCAwLjUpLnRvUkdCU3RyaW5nKCk7XG4gID4gJ3JnYigxMjcsMTc3LDI1NSknXG4qL1xuQ2hyb21hdGgudGludCA9IGZ1bmN0aW9uICggZnJvbSwgYnkgKVxue1xuICAgIHJldHVybiBDaHJvbWF0aC50b3dhcmRzKCBmcm9tLCAnI0ZGRkZGRicsIGJ5ICk7XG59O1xuXG4vKlxuICAgTWV0aG9kOiBDaHJvbWF0aC5saWdodGVuXG4gICBBbGlhcyBmb3IgPENocm9tYXRoLnRpbnQ+XG4qL1xuQ2hyb21hdGgubGlnaHRlbiA9IENocm9tYXRoLnRpbnQ7XG5cbi8qXG4gIE1ldGhvZDogQ2hyb21hdGguc2hhZGVcbiAgRGFya2VuIGEgY29sb3IgYnkgYWRkaW5nIGEgcGVyY2VudGFnZSBvZiBibGFjayB0byBpdFxuXG4gIEV4YW1wbGU6XG4gID4gPiBDaHJvbWF0aC5kYXJrZW4oJ3JnYigwLCAxMDAsIDI1NSknLCAwLjUpLnRvUkdCU3RyaW5nKCk7XG4gID4gJ3JnYigwLDUwLDEyNyknXG4gKi9cbkNocm9tYXRoLnNoYWRlID0gZnVuY3Rpb24gKCBmcm9tLCBieSApXG57XG4gICAgcmV0dXJuIENocm9tYXRoLnRvd2FyZHMoIGZyb20sICcjMDAwMDAwJywgYnkgKTtcbn07XG5cbi8qXG4gICBNZXRob2Q6IENocm9tYXRoLmRhcmtlblxuICAgQWxpYXMgZm9yIDxDaHJvbWF0aC5zaGFkZT5cbiAqL1xuQ2hyb21hdGguZGFya2VuID0gQ2hyb21hdGguc2hhZGU7XG5cbi8qXG4gIE1ldGhvZDogQ2hyb21hdGguZGVzYXR1cmF0ZVxuICBEZXNhdHVyYXRlIGEgY29sb3IgdXNpbmcgYW55IG9mIDMgYXBwcm9hY2hlc1xuXG4gIFBhcmFtZXRlcnM6XG4gIGNvbG9yIC0gYW55IGFyZ3VtZW50IGFjY2VwdGVkIGJ5IHRoZSA8Q2hyb21hdGg+IGNvbnN0cnVjdG9yXG4gIGZvcm11bGEgLSBUaGUgZm9ybXVsYSB0byB1c2UgKGZyb20gPHhhcmcncyBncmV5ZmlsdGVyIGF0IGh0dHA6Ly93d3cueGFyZy5vcmcvcHJvamVjdC9qcXVlcnktY29sb3ItcGx1Z2luLXhjb2xvcj4pXG4gIC0gMSAtIHhhcmcncyBvd24gZm9ybXVsYVxuICAtIDIgLSBTdW4ncyBmb3JtdWxhOiAoMSAtIGF2ZykgLyAoMTAwIC8gMzUpICsgYXZnKVxuICAtIGVtcHR5IC0gVGhlIG9mdC1zZWVuIDMwJSByZWQsIDU5JSBncmVlbiwgMTElIGJsdWUgZm9ybXVsYVxuXG4gIEV4YW1wbGVzOlxuICA+ID4gQ2hyb21hdGguZGVzYXR1cmF0ZSgncmVkJykudG9TdHJpbmcoKVxuICA+IFwiIzRDNEM0Q1wiXG5cbiAgPiA+IENocm9tYXRoLmRlc2F0dXJhdGUoJ3JlZCcsIDEpLnRvU3RyaW5nKClcbiAgPiBcIiMzNzM3MzdcIlxuXG4gID4gPiBDaHJvbWF0aC5kZXNhdHVyYXRlKCdyZWQnLCAyKS50b1N0cmluZygpXG4gID4gXCIjOTA5MDkwXCJcbiovXG5DaHJvbWF0aC5kZXNhdHVyYXRlID0gZnVuY3Rpb24gKGNvbG9yLCBmb3JtdWxhKVxue1xuICAgIHZhciBjID0gbmV3IENocm9tYXRoKGNvbG9yKSwgcmdiLCBhdmc7XG5cbiAgICBzd2l0Y2ggKGZvcm11bGEpIHtcbiAgICBjYXNlIDE6IC8vIHhhcmcncyBmb3JtdWxhXG4gICAgICAgIGF2ZyA9IC4zNSArIDEzICogKGMuciArIGMuZyArIGMuYikgLyA2MDsgYnJlYWs7XG4gICAgY2FzZSAyOiAvLyBTdW4ncyBmb3JtdWxhOiAoMSAtIGF2ZykgLyAoMTAwIC8gMzUpICsgYXZnKVxuICAgICAgICBhdmcgPSAoMTMgKiAoYy5yICsgYy5nICsgYy5iKSArIDUzNTUpIC8gNjA7IGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICAgIGF2ZyA9IGMuciAqIC4zICsgYy5nICogLjU5ICsgYy5iICogLjExO1xuICAgIH1cblxuICAgIGF2ZyA9IHV0aWwuY2xhbXAoYXZnLCAwLCAyNTUpO1xuICAgIHJnYiA9IHtyOiBhdmcsIGc6IGF2ZywgYjogYXZnfTtcblxuICAgIHJldHVybiBuZXcgQ2hyb21hdGgocmdiKTtcbn07XG5cbi8qXG4gIE1ldGhvZDogQ2hyb21hdGguZ3JleXNjYWxlXG4gIEFsaWFzIGZvciA8Q2hyb21hdGguZGVzYXR1cmF0ZT5cbiovXG5DaHJvbWF0aC5ncmV5c2NhbGUgPSBDaHJvbWF0aC5kZXNhdHVyYXRlO1xuXG4vKlxuICBNZXRob2Q6IENocm9tYXRoLndlYnNhZmVcbiAgQ29udmVydCBhIGNvbG9yIHRvIG9uZSBvZiB0aGUgMjE2IFwid2Vic2FmZVwiIGNvbG9yc1xuXG4gIEV4YW1wbGVzOlxuICA+ID4gQ2hyb21hdGgud2Vic2FmZSgnI0FCQ0RFRicpLnRvU3RyaW5nKClcbiAgPiAnIzk5Q0NGRidcblxuICA+ID4gQ2hyb21hdGgud2Vic2FmZSgnI0JCQ0RFRicpLnRvU3RyaW5nKClcbiAgPiAnI0NDQ0NGRidcbiAqL1xuQ2hyb21hdGgud2Vic2FmZSA9IGZ1bmN0aW9uIChjb2xvcilcbntcbiAgICBjb2xvciA9IG5ldyBDaHJvbWF0aChjb2xvcik7XG5cbiAgICBjb2xvci5yID0gTWF0aC5yb3VuZChjb2xvci5yIC8gNTEpICogNTE7XG4gICAgY29sb3IuZyA9IE1hdGgucm91bmQoY29sb3IuZyAvIDUxKSAqIDUxO1xuICAgIGNvbG9yLmIgPSBNYXRoLnJvdW5kKGNvbG9yLmIgLyA1MSkgKiA1MTtcblxuICAgIHJldHVybiBuZXcgQ2hyb21hdGgoY29sb3IpO1xufTtcblxuLy9Hcm91cDogU3RhdGljIG1ldGhvZHMgLSBjb2xvciBjb21iaW5hdGlvblxuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC5hZGRpdGl2ZVxuICBDb21iaW5lIGFueSBudW1iZXIgY29sb3JzIHVzaW5nIGFkZGl0aXZlIGNvbG9yXG5cbiAgRXhhbXBsZXM6XG4gID4gPiBDaHJvbWF0aC5hZGRpdGl2ZSgnI0YwMCcsICcjMEYwJykudG9TdHJpbmcoKTtcbiAgPiAnI0ZGRkYwMCdcblxuICA+ID4gQ2hyb21hdGguYWRkaXRpdmUoJyNGMDAnLCAnIzBGMCcpLnRvU3RyaW5nKCkgPT0gQ2hyb21hdGgueWVsbG93LnRvU3RyaW5nKCk7XG4gID4gdHJ1ZVxuXG4gID4gPiBDaHJvbWF0aC5hZGRpdGl2ZSgncmVkJywgJyMwRjAnLCAncmdiKDAsIDAsIDI1NSknKS50b1N0cmluZygpID09IENocm9tYXRoLndoaXRlLnRvU3RyaW5nKCk7XG4gID4gdHJ1ZVxuICovXG5DaHJvbWF0aC5hZGRpdGl2ZSA9IGZ1bmN0aW9uICgpXG57XG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMubGVuZ3RoLTIsIGk9LTEsIGEsIGI7XG4gICAgd2hpbGUgKGkrKyA8IGFyZ3Mpe1xuXG4gICAgICAgIGEgPSBhIHx8IG5ldyBDaHJvbWF0aChhcmd1bWVudHNbaV0pO1xuICAgICAgICBiID0gbmV3IENocm9tYXRoKGFyZ3VtZW50c1tpKzFdKTtcblxuICAgICAgICBpZiAoKGEuciArPSBiLnIpID4gMjU1KSBhLnIgPSAyNTU7XG4gICAgICAgIGlmICgoYS5nICs9IGIuZykgPiAyNTUpIGEuZyA9IDI1NTtcbiAgICAgICAgaWYgKChhLmIgKz0gYi5iKSA+IDI1NSkgYS5iID0gMjU1O1xuXG4gICAgICAgIGEgPSBuZXcgQ2hyb21hdGgoYSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGE7XG59O1xuXG4vKlxuICBNZXRob2Q6IENocm9tYXRoLnN1YnRyYWN0aXZlXG4gIENvbWJpbmUgYW55IG51bWJlciBvZiBjb2xvcnMgdXNpbmcgc3VidHJhY3RpdmUgY29sb3JcblxuICBFeGFtcGxlczpcbiAgPiA+IENocm9tYXRoLnN1YnRyYWN0aXZlKCd5ZWxsb3cnLCAnbWFnZW50YScpLnRvU3RyaW5nKCk7XG4gID4gJyNGRjAwMDAnXG5cbiAgPiA+IENocm9tYXRoLnN1YnRyYWN0aXZlKCd5ZWxsb3cnLCAnbWFnZW50YScpLnRvU3RyaW5nKCkgPT09IENocm9tYXRoLnJlZC50b1N0cmluZygpO1xuICA+IHRydWVcblxuICA+ID4gQ2hyb21hdGguc3VidHJhY3RpdmUoJ2N5YW4nLCAnbWFnZW50YScsICd5ZWxsb3cnKS50b1N0cmluZygpO1xuICA+ICcjMDAwMDAwJ1xuXG4gID4gPiBDaHJvbWF0aC5zdWJ0cmFjdGl2ZSgncmVkJywgJyMwRjAnLCAncmdiKDAsIDAsIDI1NSknKS50b1N0cmluZygpO1xuICA+ICcjMDAwMDAwJ1xuKi9cbkNocm9tYXRoLnN1YnRyYWN0aXZlID0gZnVuY3Rpb24gKClcbntcbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50cy5sZW5ndGgtMiwgaT0tMSwgYSwgYjtcbiAgICB3aGlsZSAoaSsrIDwgYXJncyl7XG5cbiAgICAgICAgYSA9IGEgfHwgbmV3IENocm9tYXRoKGFyZ3VtZW50c1tpXSk7XG4gICAgICAgIGIgPSBuZXcgQ2hyb21hdGgoYXJndW1lbnRzW2krMV0pO1xuXG4gICAgICAgIGlmICgoYS5yICs9IGIuciAtIDI1NSkgPCAwKSBhLnIgPSAwO1xuICAgICAgICBpZiAoKGEuZyArPSBiLmcgLSAyNTUpIDwgMCkgYS5nID0gMDtcbiAgICAgICAgaWYgKChhLmIgKz0gYi5iIC0gMjU1KSA8IDApIGEuYiA9IDA7XG5cbiAgICAgICAgYSA9IG5ldyBDaHJvbWF0aChhKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYTtcbn07XG5cbi8qXG4gIE1ldGhvZDogQ2hyb21hdGgubXVsdGlwbHlcbiAgTXVsdGlwbHkgYW55IG51bWJlciBvZiBjb2xvcnNcblxuICBFeGFtcGxlczpcbiAgPiA+IENocm9tYXRoLm11bHRpcGx5KENocm9tYXRoLmxpZ2h0Z29sZGVucm9keWVsbG93LCBDaHJvbWF0aC5saWdodGJsdWUpLnRvU3RyaW5nKCk7XG4gID4gXCIjQTlEM0JEXCJcblxuICA+ID4gQ2hyb21hdGgubXVsdGlwbHkoQ2hyb21hdGgub2xkbGFjZSwgQ2hyb21hdGgubGlnaHRibHVlLCBDaHJvbWF0aC5kYXJrYmx1ZSkudG9TdHJpbmcoKTtcbiAgPiBcIiMwMDAwNzBcIlxuKi9cbkNocm9tYXRoLm11bHRpcGx5ID0gZnVuY3Rpb24gKClcbntcbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50cy5sZW5ndGgtMiwgaT0tMSwgYSwgYjtcbiAgICB3aGlsZSAoaSsrIDwgYXJncyl7XG5cbiAgICAgICAgYSA9IGEgfHwgbmV3IENocm9tYXRoKGFyZ3VtZW50c1tpXSk7XG4gICAgICAgIGIgPSBuZXcgQ2hyb21hdGgoYXJndW1lbnRzW2krMV0pO1xuXG4gICAgICAgIGEuciA9IChhLnIgLyAyNTUgKiBiLnIpfDA7XG4gICAgICAgIGEuZyA9IChhLmcgLyAyNTUgKiBiLmcpfDA7XG4gICAgICAgIGEuYiA9IChhLmIgLyAyNTUgKiBiLmIpfDA7XG5cbiAgICAgICAgYSA9IG5ldyBDaHJvbWF0aChhKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYTtcbn07XG5cbi8qXG4gIE1ldGhvZDogQ2hyb21hdGguYXZlcmFnZVxuICBBdmVyYWdlcyBhbnkgbnVtYmVyIG9mIGNvbG9yc1xuXG4gIEV4YW1wbGVzOlxuICA+ID4gQ2hyb21hdGguYXZlcmFnZShDaHJvbWF0aC5saWdodGdvbGRlbnJvZHllbGxvdywgQ2hyb21hdGgubGlnaHRibHVlKS50b1N0cmluZygpXG4gID4gXCIjRDNFOURDXCJcblxuICA+ID4gQ2hyb21hdGguYXZlcmFnZShDaHJvbWF0aC5vbGRsYWNlLCBDaHJvbWF0aC5saWdodGJsdWUsIENocm9tYXRoLmRhcmtibHVlKS50b1N0cmluZygpXG4gID4gXCIjNkE3M0I4XCJcbiAqL1xuQ2hyb21hdGguYXZlcmFnZSA9IGZ1bmN0aW9uICgpXG57XG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMubGVuZ3RoLTIsIGk9LTEsIGEsIGI7XG4gICAgd2hpbGUgKGkrKyA8IGFyZ3Mpe1xuXG4gICAgICAgIGEgPSBhIHx8IG5ldyBDaHJvbWF0aChhcmd1bWVudHNbaV0pO1xuICAgICAgICBiID0gbmV3IENocm9tYXRoKGFyZ3VtZW50c1tpKzFdKTtcblxuICAgICAgICBhLnIgPSAoYS5yICsgYi5yKSA+PiAxO1xuICAgICAgICBhLmcgPSAoYS5nICsgYi5nKSA+PiAxO1xuICAgICAgICBhLmIgPSAoYS5iICsgYi5iKSA+PiAxO1xuXG4gICAgICAgIGEgPSBuZXcgQ2hyb21hdGgoYSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGE7XG59O1xuXG4vKlxuICBNZXRob2Q6IENocm9tYXRoLm92ZXJsYXlcbiAgQWRkIG9uZSBjb2xvciBvbiB0b3Agb2YgYW5vdGhlciB3aXRoIGEgZ2l2ZW4gdHJhbnNwYXJlbmN5XG5cbiAgRXhhbXBsZXM6XG4gID4gPiBDaHJvbWF0aC5hdmVyYWdlKENocm9tYXRoLmxpZ2h0Z29sZGVucm9keWVsbG93LCBDaHJvbWF0aC5saWdodGJsdWUpLnRvU3RyaW5nKClcbiAgPiBcIiNEM0U5RENcIlxuXG4gID4gPiBDaHJvbWF0aC5hdmVyYWdlKENocm9tYXRoLm9sZGxhY2UsIENocm9tYXRoLmxpZ2h0Ymx1ZSwgQ2hyb21hdGguZGFya2JsdWUpLnRvU3RyaW5nKClcbiAgPiBcIiM2QTczQjhcIlxuICovXG5DaHJvbWF0aC5vdmVybGF5ID0gZnVuY3Rpb24gKHRvcCwgYm90dG9tLCBvcGFjaXR5KVxue1xuICAgIHZhciBhID0gbmV3IENocm9tYXRoKHRvcCk7XG4gICAgdmFyIGIgPSBuZXcgQ2hyb21hdGgoYm90dG9tKTtcblxuICAgIGlmIChvcGFjaXR5ID4gMSkgb3BhY2l0eSAvPSAxMDA7XG4gICAgb3BhY2l0eSA9IHV0aWwuY2xhbXAob3BhY2l0eSAtIDEgKyBiLmEsIDAsIDEpO1xuXG4gICAgcmV0dXJuIG5ldyBDaHJvbWF0aCh7XG4gICAgICAgIHI6IHV0aWwubGVycChhLnIsIGIuciwgb3BhY2l0eSksXG4gICAgICAgIGc6IHV0aWwubGVycChhLmcsIGIuZywgb3BhY2l0eSksXG4gICAgICAgIGI6IHV0aWwubGVycChhLmIsIGIuYiwgb3BhY2l0eSlcbiAgICB9KTtcbn07XG5cblxuLy9Hcm91cDogU3RhdGljIG1ldGhvZHMgLSBvdGhlclxuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC50b3dhcmRzXG4gIE1vdmUgZnJvbSBvbmUgY29sb3IgdG93YXJkcyBhbm90aGVyIGJ5IHRoZSBnaXZlbiBwZXJjZW50YWdlICgwLTEsIDAtMTAwKVxuXG4gIFBhcmFtZXRlcnM6XG4gIGZyb20gLSBUaGUgc3RhcnRpbmcgY29sb3JcbiAgdG8gLSBUaGUgZGVzdGluYXRpb24gY29sb3JcbiAgYnkgLSBUaGUgcGVyY2VudGFnZSwgZXhwcmVzc2VkIGFzIGEgZmxvYXRpbmcgbnVtYmVyIGJldHdlZW4gMCBhbmQgMSwgdG8gbW92ZSB0b3dhcmRzIHRoZSBkZXN0aW5hdGlvbiBjb2xvclxuICBpbnRlcnBvbGF0b3IgLSBUaGUgZnVuY3Rpb24gdG8gdXNlIGZvciBpbnRlcnBvbGF0aW5nIGJldHdlZW4gdGhlIHR3byBwb2ludHMuIERlZmF1bHRzIHRvIExpbmVhciBJbnRlcnBvbGF0aW9uLiBGdW5jdGlvbiBoYXMgdGhlIHNpZ25hdHVyZSBgKGZyb20sIHRvLCBieSlgIHdpdGggdGhlIHBhcmFtZXRlcnMgaGF2aW5nIHRoZSBzYW1lIG1lYW5pbmcgYXMgdGhvc2UgaW4gYHRvd2FyZHNgLlxuXG4gID4gPiBDaHJvbWF0aC50b3dhcmRzKCdyZWQnLCAneWVsbG93JywgMC41KS50b1N0cmluZygpXG4gID4gXCIjRkY3RjAwXCJcbiovXG5DaHJvbWF0aC50b3dhcmRzID0gZnVuY3Rpb24gKGZyb20sIHRvLCBieSwgaW50ZXJwb2xhdG9yKVxue1xuICAgIGlmICghdG8pIHsgcmV0dXJuIGZyb207IH1cbiAgICBpZiAoIWlzRmluaXRlKGJ5KSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUeXBlRXJyb3I6IGBieWAoJyArIGJ5ICArJykgc2hvdWxkIGJlIGJldHdlZW4gMCBhbmQgMScpO1xuICAgIGlmICghKGZyb20gaW5zdGFuY2VvZiBDaHJvbWF0aCkpIGZyb20gPSBuZXcgQ2hyb21hdGgoZnJvbSk7XG4gICAgaWYgKCEodG8gaW5zdGFuY2VvZiBDaHJvbWF0aCkpIHRvID0gbmV3IENocm9tYXRoKHRvIHx8ICcjRkZGRkZGJyk7XG4gICAgaWYgKCFpbnRlcnBvbGF0b3IpIGludGVycG9sYXRvciA9IHV0aWwubGVycDtcbiAgICBieSA9IHBhcnNlRmxvYXQoYnkpO1xuXG4gICAgcmV0dXJuIG5ldyBDaHJvbWF0aCh7XG4gICAgICAgIHI6IGludGVycG9sYXRvcihmcm9tLnIsIHRvLnIsIGJ5KSxcbiAgICAgICAgZzogaW50ZXJwb2xhdG9yKGZyb20uZywgdG8uZywgYnkpLFxuICAgICAgICBiOiBpbnRlcnBvbGF0b3IoZnJvbS5iLCB0by5iLCBieSksXG4gICAgICAgIGE6IGludGVycG9sYXRvcihmcm9tLmEsIHRvLmEsIGJ5KVxuICAgIH0pO1xufTtcblxuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC5ncmFkaWVudFxuICBDcmVhdGUgYW4gYXJyYXkgb2YgQ2hyb21hdGggb2JqZWN0c1xuXG4gIFBhcmFtZXRlcnM6XG4gIGZyb20gLSBUaGUgYmVnaW5uaW5nIGNvbG9yIG9mIHRoZSBncmFkaWVudFxuICB0byAtIFRoZSBlbmQgY29sb3Igb2YgdGhlIGdyYWRpZW50XG4gIHNsaWNlcyAtIFRoZSBudW1iZXIgb2YgY29sb3JzIGluIHRoZSBhcnJheVxuICBzbGljZSAtIFRoZSBjb2xvciBhdCBhIHNwZWNpZmljLCAxLWJhc2VkLCBzbGljZSBpbmRleFxuXG4gIEV4YW1wbGVzOlxuICA+ID4gQ2hyb21hdGguZ3JhZGllbnQoJ3JlZCcsICd5ZWxsb3cnKS5sZW5ndGg7XG4gID4gMjBcblxuICA+ID4gQ2hyb21hdGguZ3JhZGllbnQoJ3JlZCcsICd5ZWxsb3cnLCA1KS50b1N0cmluZygpO1xuICA+IFwiI0ZGMDAwMCwjRkYzRjAwLCNGRjdGMDAsI0ZGQkYwMCwjRkZGRjAwXCJcblxuICA+ID4gQ2hyb21hdGguZ3JhZGllbnQoJ3JlZCcsICd5ZWxsb3cnLCA1LCAyKS50b1N0cmluZygpO1xuICA+IFwiI0ZGN0YwMFwiXG5cbiAgPiA+IENocm9tYXRoLmdyYWRpZW50KCdyZWQnLCAneWVsbG93JywgNSlbMl0udG9TdHJpbmcoKTtcbiAgPiBcIiNGRjdGMDBcIlxuICovXG5DaHJvbWF0aC5ncmFkaWVudCA9IGZ1bmN0aW9uIChmcm9tLCB0bywgc2xpY2VzLCBzbGljZSlcbntcbiAgICB2YXIgZ3JhZGllbnQgPSBbXSwgc3RvcHM7XG5cbiAgICBpZiAoISBzbGljZXMpIHNsaWNlcyA9IDIwO1xuICAgIHN0b3BzID0gKHNsaWNlcy0xKTtcblxuICAgIGlmIChpc0Zpbml0ZShzbGljZSkpIHJldHVybiBDaHJvbWF0aC50b3dhcmRzKGZyb20sIHRvLCBzbGljZS9zdG9wcyk7XG4gICAgZWxzZSBzbGljZSA9IC0xO1xuXG4gICAgd2hpbGUgKCsrc2xpY2UgPCBzbGljZXMpe1xuICAgICAgICBncmFkaWVudC5wdXNoKENocm9tYXRoLnRvd2FyZHMoZnJvbSwgdG8sIHNsaWNlL3N0b3BzKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGdyYWRpZW50O1xufTtcblxuLypcbiAgTWV0aG9kOiBDaHJvbWF0aC5wYXJzZVxuICBJdGVyYXRlIHRocm91Z2ggdGhlIG9iamVjdHMgc2V0IGluIENocm9tYXRoLnBhcnNlcnMgYW5kLCBpZiBhIG1hdGNoIGlzIG1hZGUsIHJldHVybiB0aGUgdmFsdWUgc3BlY2lmaWVkIGJ5IHRoZSBtYXRjaGluZyBwYXJzZXJzIGBwcm9jZXNzYCBmdW5jdGlvblxuXG4gIFBhcmFtZXRlcnM6XG4gIHN0cmluZyAtIFRoZSBzdHJpbmcgdG8gcGFyc2VcblxuICBFeGFtcGxlOlxuICA+ID4gQ2hyb21hdGgucGFyc2UoJ3JnYigwLCAxMjgsIDI1NSknKVxuICA+IHsgcjogMCwgZzogMTI4LCBiOiAyNTUsIGE6IHVuZGVmaW5lZCB9XG4gKi9cbkNocm9tYXRoLnBhcnNlID0gZnVuY3Rpb24gKHN0cmluZylcbntcbiAgICB2YXIgcGFyc2VycyA9IENocm9tYXRoLnBhcnNlcnMsIGksIGwsIHBhcnNlciwgcGFydHMsIGNoYW5uZWxzO1xuXG4gICAgZm9yIChpID0gMCwgbCA9IHBhcnNlcnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHBhcnNlciA9IHBhcnNlcnNbaV07XG4gICAgICAgIHBhcnRzID0gcGFyc2VyLnJlZ2V4LmV4ZWMoc3RyaW5nKTtcbiAgICAgICAgaWYgKHBhcnRzICYmIHBhcnRzLmxlbmd0aCkgY2hhbm5lbHMgPSBwYXJzZXIucHJvY2Vzcy5hcHBseSh0aGlzLCBwYXJ0cyk7XG4gICAgICAgIGlmIChjaGFubmVscykgcmV0dXJuIGNoYW5uZWxzO1xuICAgIH1cbn07XG5cbi8vIEdyb3VwOiBTdGF0aWMgcHJvcGVydGllc1xuLypcbiAgUHJvcGVydHk6IENocm9tYXRoLnBhcnNlcnNcbiAgIEFuIGFycmF5IG9mIG9iamVjdHMgZm9yIGF0dGVtcHRpbmcgdG8gY29udmVydCBhIHN0cmluZyBkZXNjcmliaW5nIGEgY29sb3IgaW50byBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgdmFyaW91cyBjaGFubmVscy4gTm8gdXNlciBhY3Rpb24gaXMgcmVxdWlyZWQgYnV0IHBhcnNlcnMgY2FuIGJlXG5cbiAgIE9iamVjdCBwcm9wZXJ0aWVzOlxuICAgcmVnZXggLSByZWd1bGFyIGV4cHJlc3Npb24gdXNlZCB0byB0ZXN0IHRoZSBzdHJpbmcgb3IgbnVtZXJpYyBpbnB1dFxuICAgcHJvY2VzcyAtIGZ1bmN0aW9uIHdoaWNoIGlzIHBhc3NlZCB0aGUgcmVzdWx0cyBvZiBgcmVnZXgubWF0Y2hgIGFuZCByZXR1cm5zIGFuIG9iamVjdCB3aXRoIGVpdGhlciB0aGUgcmdiLCBoc2wsIGhzdiwgb3IgaHNiIGNoYW5uZWxzIG9mIHRoZSBDaHJvbWF0aC5cblxuICAgRXhhbXBsZXM6XG4oc3RhcnQgY29kZSlcbi8vIEFkZCBhIHBhcnNlclxuQ2hyb21hdGgucGFyc2Vycy5wdXNoKHtcbiAgICBleGFtcGxlOiBbMzU1NDQzMSwgMTY4MDk5ODRdLFxuICAgIHJlZ2V4OiAvXlxcZCskLyxcbiAgICBwcm9jZXNzOiBmdW5jdGlvbiAoY29sb3Ipe1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcjogY29sb3IgPj4gMTYgJiAyNTUsXG4gICAgICAgICAgICBnOiBjb2xvciA+PiA4ICYgMjU1LFxuICAgICAgICAgICAgYjogY29sb3IgJiAyNTVcbiAgICAgICAgfTtcbiAgICB9XG59KTtcbihlbmQgY29kZSlcbihzdGFydCBjb2RlKVxuLy8gT3ZlcnJpZGUgZW50aXJlbHlcbkNocm9tYXRoLnBhcnNlcnMgPSBbXG4gICB7XG4gICAgICAgZXhhbXBsZTogWzM1NTQ0MzEsIDE2ODA5OTg0XSxcbiAgICAgICByZWdleDogL15cXGQrJC8sXG4gICAgICAgcHJvY2VzczogZnVuY3Rpb24gKGNvbG9yKXtcbiAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgIHI6IGNvbG9yID4+IDE2ICYgMjU1LFxuICAgICAgICAgICAgICAgZzogY29sb3IgPj4gOCAmIDI1NSxcbiAgICAgICAgICAgICAgIGI6IGNvbG9yICYgMjU1XG4gICAgICAgICAgIH07XG4gICAgICAgfVxuICAgfSxcblxuICAge1xuICAgICAgIGV4YW1wbGU6IFsnI2ZiMCcsICdmMGYnXSxcbiAgICAgICByZWdleDogL14jPyhbXFxkQS1GXXsxfSkoW1xcZEEtRl17MX0pKFtcXGRBLUZdezF9KSQvaSxcbiAgICAgICBwcm9jZXNzOiBmdW5jdGlvbiAoaGV4LCByLCBnLCBiKXtcbiAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgIHI6IHBhcnNlSW50KHIgKyByLCAxNiksXG4gICAgICAgICAgICAgICBnOiBwYXJzZUludChnICsgZywgMTYpLFxuICAgICAgICAgICAgICAgYjogcGFyc2VJbnQoYiArIGIsIDE2KVxuICAgICAgICAgICB9O1xuICAgICAgIH1cbiAgIH1cbihlbmQgY29kZSlcbiAqL1xuQ2hyb21hdGgucGFyc2VycyA9IHJlcXVpcmUoJy4vcGFyc2VycycpLnBhcnNlcnM7XG5cbi8vIEdyb3VwOiBJbnN0YW5jZSBtZXRob2RzIC0gY29sb3IgcmVwcmVzZW50YXRpb25cbkNocm9tYXRoLnByb3RvdHlwZSA9IHJlcXVpcmUoJy4vcHJvdG90eXBlJykoQ2hyb21hdGgpO1xuXG4vKlxuICBQcm9wZXJ0eTogQ2hyb21hdGguY29sb3JzXG4gIE9iamVjdCwgaW5kZXhlZCBieSBTVkcvQ1NTIGNvbG9yIG5hbWUsIG9mIDxDaHJvbWF0aD4gaW5zdGFuY2VzXG4gIFRoZSBjb2xvciBuYW1lcyBmcm9tIENTUyBhbmQgU1ZHIDEuMFxuXG4gIEV4YW1wbGVzOlxuICA+ID4gQ2hyb21hdGguY29sb3JzLmFsaWNlYmx1ZS50b1JHQkFycmF5KClcbiAgPiBbMjQwLCAyNDgsIDI1NV1cblxuICA+ID4gQ2hyb21hdGguY29sb3JzLmJlaWdlLnRvU3RyaW5nKClcbiAgPiBcIiNGNUY1RENcIlxuXG4gID4gLy8gQ2FuIGFsc28gYmUgYWNjZXNzZWQgd2l0aG91dCBgLmNvbG9yYFxuICA+ID4gQ2hyb21hdGguYWxpY2VibHVlLnRvUkdCQXJyYXkoKVxuICA+IFsyNDAsIDI0OCwgMjU1XVxuXG4gID4gPiBDaHJvbWF0aC5iZWlnZS50b1N0cmluZygpXG4gID4gXCIjRjVGNURDXCJcbiovXG52YXIgY3NzMkNvbG9ycyAgPSByZXF1aXJlKCcuL2NvbG9ybmFtZXNfY3NzMicpO1xudmFyIGNzczNDb2xvcnMgID0gcmVxdWlyZSgnLi9jb2xvcm5hbWVzX2NzczMnKTtcbnZhciBhbGxDb2xvcnMgICA9IHV0aWwubWVyZ2Uoe30sIGNzczJDb2xvcnMsIGNzczNDb2xvcnMpO1xuQ2hyb21hdGguY29sb3JzID0ge307XG5mb3IgKHZhciBjb2xvck5hbWUgaW4gYWxsQ29sb3JzKSB7XG4gICAgLy8gZS5nLiwgQ2hyb21hdGgud2hlYXQgYW5kIENocm9tYXRoLmNvbG9ycy53aGVhdFxuICAgIENocm9tYXRoW2NvbG9yTmFtZV0gPSBDaHJvbWF0aC5jb2xvcnNbY29sb3JOYW1lXSA9IG5ldyBDaHJvbWF0aChhbGxDb2xvcnNbY29sb3JOYW1lXSk7XG59XG4vLyBhZGQgYSBwYXJzZXIgZm9yIHRoZSBjb2xvciBuYW1lc1xuQ2hyb21hdGgucGFyc2Vycy5wdXNoKHtcbiAgICBleGFtcGxlOiBbJ3JlZCcsICdidXJseXdvb2QnXSxcbiAgICByZWdleDogL15bYS16XSskL2ksXG4gICAgcHJvY2VzczogZnVuY3Rpb24gKGNvbG9yTmFtZSl7XG4gICAgICAgIGlmIChDaHJvbWF0aC5jb2xvcnNbY29sb3JOYW1lXSkgcmV0dXJuIENocm9tYXRoLmNvbG9yc1tjb2xvck5hbWVdO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENocm9tYXRoO1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgLy8gZnJvbSBodHRwOi8vd3d3LnczLm9yZy9UUi9SRUMtaHRtbDQwL3R5cGVzLmh0bWwjaC02LjVcbiAgICBhcXVhICAgIDoge3I6IDAsICAgZzogMjU1LCBiOiAyNTV9LFxuICAgIGJsYWNrICAgOiB7cjogMCwgICBnOiAwLCAgIGI6IDB9LFxuICAgIGJsdWUgICAgOiB7cjogMCwgICBnOiAwLCAgIGI6IDI1NX0sXG4gICAgZnVjaHNpYSA6IHtyOiAyNTUsIGc6IDAsICAgYjogMjU1fSxcbiAgICBncmF5ICAgIDoge3I6IDEyOCwgZzogMTI4LCBiOiAxMjh9LFxuICAgIGdyZWVuICAgOiB7cjogMCwgICBnOiAxMjgsIGI6IDB9LFxuICAgIGxpbWUgICAgOiB7cjogMCwgICBnOiAyNTUsIGI6IDB9LFxuICAgIG1hcm9vbiAgOiB7cjogMTI4LCBnOiAwLCAgIGI6IDB9LFxuICAgIG5hdnkgICAgOiB7cjogMCwgICBnOiAwLCAgIGI6IDEyOH0sXG4gICAgb2xpdmUgICA6IHtyOiAxMjgsIGc6IDEyOCwgYjogMH0sXG4gICAgcHVycGxlICA6IHtyOiAxMjgsIGc6IDAsICAgYjogMTI4fSxcbiAgICByZWQgICAgIDoge3I6IDI1NSwgZzogMCwgICBiOiAwfSxcbiAgICBzaWx2ZXIgIDoge3I6IDE5MiwgZzogMTkyLCBiOiAxOTJ9LFxuICAgIHRlYWwgICAgOiB7cjogMCwgICBnOiAxMjgsIGI6IDEyOH0sXG4gICAgd2hpdGUgICA6IHtyOiAyNTUsIGc6IDI1NSwgYjogMjU1fSxcbiAgICB5ZWxsb3cgIDoge3I6IDI1NSwgZzogMjU1LCBiOiAwfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIC8vIGh0dHA6Ly93d3cudzMub3JnL1RSL2NzczMtY29sb3IvI3N2Zy1jb2xvclxuICAgIC8vIGh0dHA6Ly93d3cudzMub3JnL1RSL1NWRy90eXBlcy5odG1sI0NvbG9yS2V5d29yZHNcbiAgICBhbGljZWJsdWUgICAgICAgICAgICA6IHtyOiAyNDAsIGc6IDI0OCwgYjogMjU1fSxcbiAgICBhbnRpcXVld2hpdGUgICAgICAgICA6IHtyOiAyNTAsIGc6IDIzNSwgYjogMjE1fSxcbiAgICBhcXVhbWFyaW5lICAgICAgICAgICA6IHtyOiAxMjcsIGc6IDI1NSwgYjogMjEyfSxcbiAgICBhenVyZSAgICAgICAgICAgICAgICA6IHtyOiAyNDAsIGc6IDI1NSwgYjogMjU1fSxcbiAgICBiZWlnZSAgICAgICAgICAgICAgICA6IHtyOiAyNDUsIGc6IDI0NSwgYjogMjIwfSxcbiAgICBiaXNxdWUgICAgICAgICAgICAgICA6IHtyOiAyNTUsIGc6IDIyOCwgYjogMTk2fSxcbiAgICBibGFuY2hlZGFsbW9uZCAgICAgICA6IHtyOiAyNTUsIGc6IDIzNSwgYjogMjA1fSxcbiAgICBibHVldmlvbGV0ICAgICAgICAgICA6IHtyOiAxMzgsIGc6IDQzLCAgYjogMjI2fSxcbiAgICBicm93biAgICAgICAgICAgICAgICA6IHtyOiAxNjUsIGc6IDQyLCAgYjogNDJ9LFxuICAgIGJ1cmx5d29vZCAgICAgICAgICAgIDoge3I6IDIyMiwgZzogMTg0LCBiOiAxMzV9LFxuICAgIGNhZGV0Ymx1ZSAgICAgICAgICAgIDoge3I6IDk1LCAgZzogMTU4LCBiOiAxNjB9LFxuICAgIGNoYXJ0cmV1c2UgICAgICAgICAgIDoge3I6IDEyNywgZzogMjU1LCBiOiAwfSxcbiAgICBjaG9jb2xhdGUgICAgICAgICAgICA6IHtyOiAyMTAsIGc6IDEwNSwgYjogMzB9LFxuICAgIGNvcmFsICAgICAgICAgICAgICAgIDoge3I6IDI1NSwgZzogMTI3LCBiOiA4MH0sXG4gICAgY29ybmZsb3dlcmJsdWUgICAgICAgOiB7cjogMTAwLCBnOiAxNDksIGI6IDIzN30sXG4gICAgY29ybnNpbGsgICAgICAgICAgICAgOiB7cjogMjU1LCBnOiAyNDgsIGI6IDIyMH0sXG4gICAgY3JpbXNvbiAgICAgICAgICAgICAgOiB7cjogMjIwLCBnOiAyMCwgIGI6IDYwfSxcbiAgICBjeWFuICAgICAgICAgICAgICAgICA6IHtyOiAwLCAgIGc6IDI1NSwgYjogMjU1fSxcbiAgICBkYXJrYmx1ZSAgICAgICAgICAgICA6IHtyOiAwLCAgIGc6IDAsICAgYjogMTM5fSxcbiAgICBkYXJrY3lhbiAgICAgICAgICAgICA6IHtyOiAwLCAgIGc6IDEzOSwgYjogMTM5fSxcbiAgICBkYXJrZ29sZGVucm9kICAgICAgICA6IHtyOiAxODQsIGc6IDEzNCwgYjogMTF9LFxuICAgIGRhcmtncmF5ICAgICAgICAgICAgIDoge3I6IDE2OSwgZzogMTY5LCBiOiAxNjl9LFxuICAgIGRhcmtncmVlbiAgICAgICAgICAgIDoge3I6IDAsICAgZzogMTAwLCBiOiAwfSxcbiAgICBkYXJrZ3JleSAgICAgICAgICAgICA6IHtyOiAxNjksIGc6IDE2OSwgYjogMTY5fSxcbiAgICBkYXJra2hha2kgICAgICAgICAgICA6IHtyOiAxODksIGc6IDE4MywgYjogMTA3fSxcbiAgICBkYXJrbWFnZW50YSAgICAgICAgICA6IHtyOiAxMzksIGc6IDAsICAgYjogMTM5fSxcbiAgICBkYXJrb2xpdmVncmVlbiAgICAgICA6IHtyOiA4NSwgIGc6IDEwNywgYjogNDd9LFxuICAgIGRhcmtvcmFuZ2UgICAgICAgICAgIDoge3I6IDI1NSwgZzogMTQwLCBiOiAwfSxcbiAgICBkYXJrb3JjaGlkICAgICAgICAgICA6IHtyOiAxNTMsIGc6IDUwLCAgYjogMjA0fSxcbiAgICBkYXJrcmVkICAgICAgICAgICAgICA6IHtyOiAxMzksIGc6IDAsICAgYjogMH0sXG4gICAgZGFya3NhbG1vbiAgICAgICAgICAgOiB7cjogMjMzLCBnOiAxNTAsIGI6IDEyMn0sXG4gICAgZGFya3NlYWdyZWVuICAgICAgICAgOiB7cjogMTQzLCBnOiAxODgsIGI6IDE0M30sXG4gICAgZGFya3NsYXRlYmx1ZSAgICAgICAgOiB7cjogNzIsICBnOiA2MSwgIGI6IDEzOX0sXG4gICAgZGFya3NsYXRlZ3JheSAgICAgICAgOiB7cjogNDcsICBnOiA3OSwgIGI6IDc5fSxcbiAgICBkYXJrc2xhdGVncmV5ICAgICAgICA6IHtyOiA0NywgIGc6IDc5LCAgYjogNzl9LFxuICAgIGRhcmt0dXJxdW9pc2UgICAgICAgIDoge3I6IDAsICAgZzogMjA2LCBiOiAyMDl9LFxuICAgIGRhcmt2aW9sZXQgICAgICAgICAgIDoge3I6IDE0OCwgZzogMCwgICBiOiAyMTF9LFxuICAgIGRlZXBwaW5rICAgICAgICAgICAgIDoge3I6IDI1NSwgZzogMjAsICBiOiAxNDd9LFxuICAgIGRlZXBza3libHVlICAgICAgICAgIDoge3I6IDAsICAgZzogMTkxLCBiOiAyNTV9LFxuICAgIGRpbWdyYXkgICAgICAgICAgICAgIDoge3I6IDEwNSwgZzogMTA1LCBiOiAxMDV9LFxuICAgIGRpbWdyZXkgICAgICAgICAgICAgIDoge3I6IDEwNSwgZzogMTA1LCBiOiAxMDV9LFxuICAgIGRvZGdlcmJsdWUgICAgICAgICAgIDoge3I6IDMwLCAgZzogMTQ0LCBiOiAyNTV9LFxuICAgIGZpcmVicmljayAgICAgICAgICAgIDoge3I6IDE3OCwgZzogMzQsICBiOiAzNH0sXG4gICAgZmxvcmFsd2hpdGUgICAgICAgICAgOiB7cjogMjU1LCBnOiAyNTAsIGI6IDI0MH0sXG4gICAgZm9yZXN0Z3JlZW4gICAgICAgICAgOiB7cjogMzQsICBnOiAxMzksIGI6IDM0fSxcbiAgICBnYWluc2Jvcm8gICAgICAgICAgICA6IHtyOiAyMjAsIGc6IDIyMCwgYjogMjIwfSxcbiAgICBnaG9zdHdoaXRlICAgICAgICAgICA6IHtyOiAyNDgsIGc6IDI0OCwgYjogMjU1fSxcbiAgICBnb2xkICAgICAgICAgICAgICAgICA6IHtyOiAyNTUsIGc6IDIxNSwgYjogMH0sXG4gICAgZ29sZGVucm9kICAgICAgICAgICAgOiB7cjogMjE4LCBnOiAxNjUsIGI6IDMyfSxcbiAgICBncmVlbnllbGxvdyAgICAgICAgICA6IHtyOiAxNzMsIGc6IDI1NSwgYjogNDd9LFxuICAgIGdyZXkgICAgICAgICAgICAgICAgIDoge3I6IDEyOCwgZzogMTI4LCBiOiAxMjh9LFxuICAgIGhvbmV5ZGV3ICAgICAgICAgICAgIDoge3I6IDI0MCwgZzogMjU1LCBiOiAyNDB9LFxuICAgIGhvdHBpbmsgICAgICAgICAgICAgIDoge3I6IDI1NSwgZzogMTA1LCBiOiAxODB9LFxuICAgIGluZGlhbnJlZCAgICAgICAgICAgIDoge3I6IDIwNSwgZzogOTIsICBiOiA5Mn0sXG4gICAgaW5kaWdvICAgICAgICAgICAgICAgOiB7cjogNzUsICBnOiAwLCAgIGI6IDEzMH0sXG4gICAgaXZvcnkgICAgICAgICAgICAgICAgOiB7cjogMjU1LCBnOiAyNTUsIGI6IDI0MH0sXG4gICAga2hha2kgICAgICAgICAgICAgICAgOiB7cjogMjQwLCBnOiAyMzAsIGI6IDE0MH0sXG4gICAgbGF2ZW5kZXIgICAgICAgICAgICAgOiB7cjogMjMwLCBnOiAyMzAsIGI6IDI1MH0sXG4gICAgbGF2ZW5kZXJibHVzaCAgICAgICAgOiB7cjogMjU1LCBnOiAyNDAsIGI6IDI0NX0sXG4gICAgbGF3bmdyZWVuICAgICAgICAgICAgOiB7cjogMTI0LCBnOiAyNTIsIGI6IDB9LFxuICAgIGxlbW9uY2hpZmZvbiAgICAgICAgIDoge3I6IDI1NSwgZzogMjUwLCBiOiAyMDV9LFxuICAgIGxpZ2h0Ymx1ZSAgICAgICAgICAgIDoge3I6IDE3MywgZzogMjE2LCBiOiAyMzB9LFxuICAgIGxpZ2h0Y29yYWwgICAgICAgICAgIDoge3I6IDI0MCwgZzogMTI4LCBiOiAxMjh9LFxuICAgIGxpZ2h0Y3lhbiAgICAgICAgICAgIDoge3I6IDIyNCwgZzogMjU1LCBiOiAyNTV9LFxuICAgIGxpZ2h0Z29sZGVucm9keWVsbG93IDoge3I6IDI1MCwgZzogMjUwLCBiOiAyMTB9LFxuICAgIGxpZ2h0Z3JheSAgICAgICAgICAgIDoge3I6IDIxMSwgZzogMjExLCBiOiAyMTF9LFxuICAgIGxpZ2h0Z3JlZW4gICAgICAgICAgIDoge3I6IDE0NCwgZzogMjM4LCBiOiAxNDR9LFxuICAgIGxpZ2h0Z3JleSAgICAgICAgICAgIDoge3I6IDIxMSwgZzogMjExLCBiOiAyMTF9LFxuICAgIGxpZ2h0cGluayAgICAgICAgICAgIDoge3I6IDI1NSwgZzogMTgyLCBiOiAxOTN9LFxuICAgIGxpZ2h0c2FsbW9uICAgICAgICAgIDoge3I6IDI1NSwgZzogMTYwLCBiOiAxMjJ9LFxuICAgIGxpZ2h0c2VhZ3JlZW4gICAgICAgIDoge3I6IDMyLCAgZzogMTc4LCBiOiAxNzB9LFxuICAgIGxpZ2h0c2t5Ymx1ZSAgICAgICAgIDoge3I6IDEzNSwgZzogMjA2LCBiOiAyNTB9LFxuICAgIGxpZ2h0c2xhdGVncmF5ICAgICAgIDoge3I6IDExOSwgZzogMTM2LCBiOiAxNTN9LFxuICAgIGxpZ2h0c2xhdGVncmV5ICAgICAgIDoge3I6IDExOSwgZzogMTM2LCBiOiAxNTN9LFxuICAgIGxpZ2h0c3RlZWxibHVlICAgICAgIDoge3I6IDE3NiwgZzogMTk2LCBiOiAyMjJ9LFxuICAgIGxpZ2h0eWVsbG93ICAgICAgICAgIDoge3I6IDI1NSwgZzogMjU1LCBiOiAyMjR9LFxuICAgIGxpbWVncmVlbiAgICAgICAgICAgIDoge3I6IDUwLCAgZzogMjA1LCBiOiA1MH0sXG4gICAgbGluZW4gICAgICAgICAgICAgICAgOiB7cjogMjUwLCBnOiAyNDAsIGI6IDIzMH0sXG4gICAgbWFnZW50YSAgICAgICAgICAgICAgOiB7cjogMjU1LCBnOiAwLCAgIGI6IDI1NX0sXG4gICAgbWVkaXVtYXF1YW1hcmluZSAgICAgOiB7cjogMTAyLCBnOiAyMDUsIGI6IDE3MH0sXG4gICAgbWVkaXVtYmx1ZSAgICAgICAgICAgOiB7cjogMCwgICBnOiAwLCAgIGI6IDIwNX0sXG4gICAgbWVkaXVtb3JjaGlkICAgICAgICAgOiB7cjogMTg2LCBnOiA4NSwgIGI6IDIxMX0sXG4gICAgbWVkaXVtcHVycGxlICAgICAgICAgOiB7cjogMTQ3LCBnOiAxMTIsIGI6IDIxOX0sXG4gICAgbWVkaXVtc2VhZ3JlZW4gICAgICAgOiB7cjogNjAsICBnOiAxNzksIGI6IDExM30sXG4gICAgbWVkaXVtc2xhdGVibHVlICAgICAgOiB7cjogMTIzLCBnOiAxMDQsIGI6IDIzOH0sXG4gICAgbWVkaXVtc3ByaW5nZ3JlZW4gICAgOiB7cjogMCwgICBnOiAyNTAsIGI6IDE1NH0sXG4gICAgbWVkaXVtdHVycXVvaXNlICAgICAgOiB7cjogNzIsICBnOiAyMDksIGI6IDIwNH0sXG4gICAgbWVkaXVtdmlvbGV0cmVkICAgICAgOiB7cjogMTk5LCBnOiAyMSwgIGI6IDEzM30sXG4gICAgbWlkbmlnaHRibHVlICAgICAgICAgOiB7cjogMjUsICBnOiAyNSwgIGI6IDExMn0sXG4gICAgbWludGNyZWFtICAgICAgICAgICAgOiB7cjogMjQ1LCBnOiAyNTUsIGI6IDI1MH0sXG4gICAgbWlzdHlyb3NlICAgICAgICAgICAgOiB7cjogMjU1LCBnOiAyMjgsIGI6IDIyNX0sXG4gICAgbW9jY2FzaW4gICAgICAgICAgICAgOiB7cjogMjU1LCBnOiAyMjgsIGI6IDE4MX0sXG4gICAgbmF2YWpvd2hpdGUgICAgICAgICAgOiB7cjogMjU1LCBnOiAyMjIsIGI6IDE3M30sXG4gICAgb2xkbGFjZSAgICAgICAgICAgICAgOiB7cjogMjUzLCBnOiAyNDUsIGI6IDIzMH0sXG4gICAgb2xpdmVkcmFiICAgICAgICAgICAgOiB7cjogMTA3LCBnOiAxNDIsIGI6IDM1fSxcbiAgICBvcmFuZ2UgICAgICAgICAgICAgICA6IHtyOiAyNTUsIGc6IDE2NSwgYjogMH0sXG4gICAgb3JhbmdlcmVkICAgICAgICAgICAgOiB7cjogMjU1LCBnOiA2OSwgIGI6IDB9LFxuICAgIG9yY2hpZCAgICAgICAgICAgICAgIDoge3I6IDIxOCwgZzogMTEyLCBiOiAyMTR9LFxuICAgIHBhbGVnb2xkZW5yb2QgICAgICAgIDoge3I6IDIzOCwgZzogMjMyLCBiOiAxNzB9LFxuICAgIHBhbGVncmVlbiAgICAgICAgICAgIDoge3I6IDE1MiwgZzogMjUxLCBiOiAxNTJ9LFxuICAgIHBhbGV0dXJxdW9pc2UgICAgICAgIDoge3I6IDE3NSwgZzogMjM4LCBiOiAyMzh9LFxuICAgIHBhbGV2aW9sZXRyZWQgICAgICAgIDoge3I6IDIxOSwgZzogMTEyLCBiOiAxNDd9LFxuICAgIHBhcGF5YXdoaXAgICAgICAgICAgIDoge3I6IDI1NSwgZzogMjM5LCBiOiAyMTN9LFxuICAgIHBlYWNocHVmZiAgICAgICAgICAgIDoge3I6IDI1NSwgZzogMjE4LCBiOiAxODV9LFxuICAgIHBlcnUgICAgICAgICAgICAgICAgIDoge3I6IDIwNSwgZzogMTMzLCBiOiA2M30sXG4gICAgcGluayAgICAgICAgICAgICAgICAgOiB7cjogMjU1LCBnOiAxOTIsIGI6IDIwM30sXG4gICAgcGx1bSAgICAgICAgICAgICAgICAgOiB7cjogMjIxLCBnOiAxNjAsIGI6IDIyMX0sXG4gICAgcG93ZGVyYmx1ZSAgICAgICAgICAgOiB7cjogMTc2LCBnOiAyMjQsIGI6IDIzMH0sXG4gICAgcm9zeWJyb3duICAgICAgICAgICAgOiB7cjogMTg4LCBnOiAxNDMsIGI6IDE0M30sXG4gICAgcm95YWxibHVlICAgICAgICAgICAgOiB7cjogNjUsICBnOiAxMDUsIGI6IDIyNX0sXG4gICAgc2FkZGxlYnJvd24gICAgICAgICAgOiB7cjogMTM5LCBnOiA2OSwgIGI6IDE5fSxcbiAgICBzYWxtb24gICAgICAgICAgICAgICA6IHtyOiAyNTAsIGc6IDEyOCwgYjogMTE0fSxcbiAgICBzYW5keWJyb3duICAgICAgICAgICA6IHtyOiAyNDQsIGc6IDE2NCwgYjogOTZ9LFxuICAgIHNlYWdyZWVuICAgICAgICAgICAgIDoge3I6IDQ2LCAgZzogMTM5LCBiOiA4N30sXG4gICAgc2Vhc2hlbGwgICAgICAgICAgICAgOiB7cjogMjU1LCBnOiAyNDUsIGI6IDIzOH0sXG4gICAgc2llbm5hICAgICAgICAgICAgICAgOiB7cjogMTYwLCBnOiA4MiwgIGI6IDQ1fSxcbiAgICBza3libHVlICAgICAgICAgICAgICA6IHtyOiAxMzUsIGc6IDIwNiwgYjogMjM1fSxcbiAgICBzbGF0ZWJsdWUgICAgICAgICAgICA6IHtyOiAxMDYsIGc6IDkwLCAgYjogMjA1fSxcbiAgICBzbGF0ZWdyYXkgICAgICAgICAgICA6IHtyOiAxMTIsIGc6IDEyOCwgYjogMTQ0fSxcbiAgICBzbGF0ZWdyZXkgICAgICAgICAgICA6IHtyOiAxMTIsIGc6IDEyOCwgYjogMTQ0fSxcbiAgICBzbm93ICAgICAgICAgICAgICAgICA6IHtyOiAyNTUsIGc6IDI1MCwgYjogMjUwfSxcbiAgICBzcHJpbmdncmVlbiAgICAgICAgICA6IHtyOiAwLCAgIGc6IDI1NSwgYjogMTI3fSxcbiAgICBzdGVlbGJsdWUgICAgICAgICAgICA6IHtyOiA3MCwgIGc6IDEzMCwgYjogMTgwfSxcbiAgICB0YW4gICAgICAgICAgICAgICAgICA6IHtyOiAyMTAsIGc6IDE4MCwgYjogMTQwfSxcbiAgICB0aGlzdGxlICAgICAgICAgICAgICA6IHtyOiAyMTYsIGc6IDE5MSwgYjogMjE2fSxcbiAgICB0b21hdG8gICAgICAgICAgICAgICA6IHtyOiAyNTUsIGc6IDk5LCAgYjogNzF9LFxuICAgIHR1cnF1b2lzZSAgICAgICAgICAgIDoge3I6IDY0LCAgZzogMjI0LCBiOiAyMDh9LFxuICAgIHZpb2xldCAgICAgICAgICAgICAgIDoge3I6IDIzOCwgZzogMTMwLCBiOiAyMzh9LFxuICAgIHdoZWF0ICAgICAgICAgICAgICAgIDoge3I6IDI0NSwgZzogMjIyLCBiOiAxNzl9LFxuICAgIHdoaXRlc21va2UgICAgICAgICAgIDoge3I6IDI0NSwgZzogMjQ1LCBiOiAyNDV9LFxuICAgIHllbGxvd2dyZWVuICAgICAgICAgIDoge3I6IDE1NCwgZzogMjA1LCBiOiA1MH1cbn1cbiIsInZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHBhcnNlcnM6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgZXhhbXBsZTogWzM1NTQ0MzEsIDE2ODA5OTg0XSxcbiAgICAgICAgICAgIHJlZ2V4OiAvXlxcZCskLyxcbiAgICAgICAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uIChjb2xvcil7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgLy9hOiBjb2xvciA+PiAyNCAmIDI1NSxcbiAgICAgICAgICAgICAgICAgICAgcjogY29sb3IgPj4gMTYgJiAyNTUsXG4gICAgICAgICAgICAgICAgICAgIGc6IGNvbG9yID4+IDggJiAyNTUsXG4gICAgICAgICAgICAgICAgICAgIGI6IGNvbG9yICYgMjU1XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB7XG4gICAgICAgICAgICBleGFtcGxlOiBbJyNmYjAnLCAnZjBmJ10sXG4gICAgICAgICAgICByZWdleDogL14jPyhbXFxkQS1GXXsxfSkoW1xcZEEtRl17MX0pKFtcXGRBLUZdezF9KSQvaSxcbiAgICAgICAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uIChoZXgsIHIsIGcsIGIpe1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHI6IHBhcnNlSW50KHIgKyByLCAxNiksXG4gICAgICAgICAgICAgICAgICAgIGc6IHBhcnNlSW50KGcgKyBnLCAxNiksXG4gICAgICAgICAgICAgICAgICAgIGI6IHBhcnNlSW50KGIgKyBiLCAxNilcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHtcbiAgICAgICAgICAgIGV4YW1wbGU6IFsnIzAwZmYwMCcsICczMzY2OTknXSxcbiAgICAgICAgICAgIHJlZ2V4OiAvXiM/KFtcXGRBLUZdezJ9KShbXFxkQS1GXXsyfSkoW1xcZEEtRl17Mn0pJC9pLFxuICAgICAgICAgICAgcHJvY2VzczogZnVuY3Rpb24gKGhleCwgciwgZywgYil7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgcjogcGFyc2VJbnQociwgMTYpLFxuICAgICAgICAgICAgICAgICAgICBnOiBwYXJzZUludChnLCAxNiksXG4gICAgICAgICAgICAgICAgICAgIGI6IHBhcnNlSW50KGIsIDE2KVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAge1xuICAgICAgICAgICAgZXhhbXBsZTogWydyZ2IoMTIzLCAyMzQsIDQ1KScsICdyZ2IoMjUsIDUwJSwgMTAwJSknLCAncmdiYSgxMiUsIDM0LCA1NiUsIDAuNzgpJ10sXG4gICAgICAgICAgICAvLyByZWdleDogL15yZ2JhKlxcKChcXGR7MSwzfVxcJSopLFxccyooXFxkezEsM31cXCUqKSxcXHMqKFxcZHsxLDN9XFwlKikoPzosXFxzKihbMC05Ll0rKSk/XFwpLyxcbiAgICAgICAgICAgIHJlZ2V4OiAvXnJnYmEqXFwoKFswLTldKlxcLj9bMC05XStcXCUqKSxcXHMqKFswLTldKlxcLj9bMC05XStcXCUqKSxcXHMqKFswLTldKlxcLj9bMC05XStcXCUqKSg/OixcXHMqKFswLTkuXSspKT9cXCkvLFxuICAgICAgICAgICAgcHJvY2VzczogZnVuY3Rpb24gKHMscixnLGIsYSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByID0gciAmJiByLnNsaWNlKC0xKSA9PSAnJScgPyAoci5zbGljZSgwLC0xKSAvIDEwMCkgOiByKjE7XG4gICAgICAgICAgICAgICAgZyA9IGcgJiYgZy5zbGljZSgtMSkgPT0gJyUnID8gKGcuc2xpY2UoMCwtMSkgLyAxMDApIDogZyoxO1xuICAgICAgICAgICAgICAgIGIgPSBiICYmIGIuc2xpY2UoLTEpID09ICclJyA/IChiLnNsaWNlKDAsLTEpIC8gMTAwKSA6IGIqMTtcbiAgICAgICAgICAgICAgICBhID0gYSoxO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgcjogdXRpbC5jbGFtcChyLCAwLCAyNTUpLFxuICAgICAgICAgICAgICAgICAgICBnOiB1dGlsLmNsYW1wKGcsIDAsIDI1NSksXG4gICAgICAgICAgICAgICAgICAgIGI6IHV0aWwuY2xhbXAoYiwgMCwgMjU1KSxcbiAgICAgICAgICAgICAgICAgICAgYTogdXRpbC5jbGFtcChhLCAwLCAxKSB8fCB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHtcbiAgICAgICAgICAgIGV4YW1wbGU6IFsnaHNsKDEyMywgMzQlLCA0NSUpJywgJ2hzbGEoMjUsIDUwJSwgMTAwJSwgMC43NSknLCAnaHN2KDEyLCAzNCUsIDU2JSknXSxcbiAgICAgICAgICAgIHJlZ2V4OiAvXmhzKFtidmxdKWEqXFwoKFxcZHsxLDN9XFwlKiksXFxzKihcXGR7MSwzfVxcJSopLFxccyooXFxkezEsM31cXCUqKSg/OixcXHMqKFswLTkuXSspKT9cXCkvLFxuICAgICAgICAgICAgcHJvY2VzczogZnVuY3Rpb24gKGMsbHYsaCxzLGwsYSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBoICo9IDE7XG4gICAgICAgICAgICAgICAgcyA9IHMuc2xpY2UoMCwtMSkgLyAxMDA7XG4gICAgICAgICAgICAgICAgbCA9IGwuc2xpY2UoMCwtMSkgLyAxMDA7XG4gICAgICAgICAgICAgICAgYSAqPSAxO1xuXG4gICAgICAgICAgICAgICAgdmFyIG9iaiA9IHtcbiAgICAgICAgICAgICAgICAgICAgaDogdXRpbC5jbGFtcChoLCAwLCAzNjApLFxuICAgICAgICAgICAgICAgICAgICBhOiB1dGlsLmNsYW1wKGwsIDAsIDEpXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAvLyBgc2AgaXMgdXNlZCBpbiBtYW55IGRpZmZlcmVudCBzcGFjZXMgKEhTTCwgSFNWLCBIU0IpXG4gICAgICAgICAgICAgICAgLy8gc28gd2UgdXNlIGBzbGAsIGBzdmAgYW5kIGBzYmAgdG8gZGlmZmVyZW50aWF0ZVxuICAgICAgICAgICAgICAgIG9ialsncycrbHZdID0gdXRpbC5jbGFtcChzLCAwLCAxKSxcbiAgICAgICAgICAgICAgICBvYmpbbHZdID0gdXRpbC5jbGFtcChsLCAwLCAxKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICBdXG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBDaHJvbWF0aFByb3RvdHlwZShDaHJvbWF0aCkge1xuICByZXR1cm4ge1xuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG9OYW1lXG4gICAgICAgICBDYWxsIDxDaHJvbWF0aC50b05hbWU+IG9uIHRoZSBjdXJyZW50IGluc3RhbmNlXG4gICAgICAgICA+ID4gdmFyIGNvbG9yID0gbmV3IENocm9tYXRoKCdyZ2IoMTczLCAyMTYsIDIzMCknKTtcbiAgICAgICAgID4gPiBjb2xvci50b05hbWUoKTtcbiAgICAgICAgID4gXCJsaWdodGJsdWVcIlxuICAgICAgKi9cbiAgICAgIHRvTmFtZTogZnVuY3Rpb24gKCl7IHJldHVybiBDaHJvbWF0aC50b05hbWUodGhpcyk7IH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvU3RyaW5nXG4gICAgICAgICBEaXNwbGF5IHRoZSBpbnN0YW5jZSBhcyBhIHN0cmluZy4gRGVmYXVsdHMgdG8gPENocm9tYXRoLnRvSGV4U3RyaW5nPlxuICAgICAgICAgPiA+IHZhciBjb2xvciA9IENocm9tYXRoLnJnYig1NiwgNzgsIDkwKTtcbiAgICAgICAgID4gPiBDb2xvci50b0hleFN0cmluZygpO1xuICAgICAgICAgPiBcIiMzODRFNUFcIlxuICAgICAgKi9cbiAgICAgIHRvU3RyaW5nOiBmdW5jdGlvbiAoKXsgcmV0dXJuIHRoaXMudG9IZXhTdHJpbmcoKTsgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdmFsdWVPZlxuICAgICAgICAgRGlzcGxheSB0aGUgaW5zdGFuY2UgYXMgYW4gaW50ZWdlci4gRGVmYXVsdHMgdG8gPENocm9tYXRoLnRvSW50ZWdlcj5cbiAgICAgICAgID4gPiB2YXIgeWVsbG93ID0gbmV3IENocm9tYXRoKCd5ZWxsb3cnKTtcbiAgICAgICAgID4gPiB5ZWxsb3cudmFsdWVPZigpO1xuICAgICAgICAgPiAxNjc3Njk2MFxuICAgICAgICAgPiA+ICt5ZWxsb3dcbiAgICAgICAgID4gMTY3NzY5NjBcbiAgICAgICovXG4gICAgICB2YWx1ZU9mOiBmdW5jdGlvbiAoKXsgcmV0dXJuIENocm9tYXRoLnRvSW50ZWdlcih0aGlzKTsgfSxcblxuICAgIC8qXG4gICAgICAgTWV0aG9kOiByZ2JcbiAgICAgICBSZXR1cm4gdGhlIFJHQiBhcnJheSBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICA+ID4gbmV3IENocm9tYXRoKCdyZWQnKS5yZ2IoKTtcbiAgICAgICA+IFsyNTUsIDAsIDBdXG4gICAgKi9cbiAgICAgIHJnYjogZnVuY3Rpb24gKCl7IHJldHVybiB0aGlzLnRvUkdCQXJyYXkoKTsgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG9SR0JBcnJheVxuICAgICAgICAgUmV0dXJuIHRoZSBSR0IgYXJyYXkgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgICA+ID4gQ2hyb21hdGguYnVybHl3b29kLnRvUkdCQXJyYXkoKTtcbiAgICAgICAgID4gWzI1NSwgMTg0LCAxMzVdXG4gICAgICAqL1xuICAgICAgdG9SR0JBcnJheTogZnVuY3Rpb24gKCl7IHJldHVybiB0aGlzLnRvUkdCQUFycmF5KCkuc2xpY2UoMCwzKTsgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG9SR0JPYmplY3RcbiAgICAgICAgIFJldHVybiB0aGUgUkdCIG9iamVjdCBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJ2J1cmx5d29vZCcpLnRvUkdCT2JqZWN0KCk7XG4gICAgICAgICA+IHtyOiAyNTUsIGc6IDE4NCwgYjogMTM1fVxuICAgICAgKi9cbiAgICAgIHRvUkdCT2JqZWN0OiBmdW5jdGlvbiAoKVxuICAgICAge1xuICAgICAgICAgIHZhciByZ2IgPSB0aGlzLnRvUkdCQXJyYXkoKTtcblxuICAgICAgICAgIHJldHVybiB7cjogcmdiWzBdLCBnOiByZ2JbMV0sIGI6IHJnYlsyXX07XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b1JHQlN0cmluZ1xuICAgICAgICAgUmV0dXJuIHRoZSBSR0Igc3RyaW5nIG9mIHRoZSBpbnN0YW5jZVxuICAgICAgICAgPiA+IG5ldyBDaHJvbWF0aCgnYWxpY2VibHVlJykudG9SR0JTdHJpbmcoKTtcbiAgICAgICAgID4gXCJyZ2IoMjQwLDI0OCwyNTUpXCJcbiAgICAgICovXG4gICAgICB0b1JHQlN0cmluZzogZnVuY3Rpb24gKClcbiAgICAgIHtcbiAgICAgICAgICByZXR1cm4gXCJyZ2IoXCIrIHRoaXMudG9SR0JBcnJheSgpLmpvaW4oXCIsXCIpICtcIilcIjtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHJnYmFcbiAgICAgICAgIFJldHVybiB0aGUgUkdCQSBhcnJheSBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJ3JlZCcpLnJnYmEoKTtcbiAgICAgICAgID4gWzI1NSwgMCwgMCwgMV1cbiAgICAgICovXG4gICAgICByZ2JhOiBmdW5jdGlvbiAoKXsgcmV0dXJuIHRoaXMudG9SR0JBQXJyYXkoKTsgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG9SR0JBQXJyYXlcbiAgICAgICAgIFJldHVybiB0aGUgUkdCQSBhcnJheSBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgID4gPiBDaHJvbWF0aC5saW1lLnRvUkdCQUFycmF5KCk7XG4gICAgICAgICA+IFswLCAyNTUsIDAsIDFdXG4gICAgICAqL1xuICAgICAgdG9SR0JBQXJyYXk6IGZ1bmN0aW9uICgpXG4gICAgICB7XG4gICAgICAgICAgdmFyIHJnYmEgPSBbXG4gICAgICAgICAgICAgIE1hdGgucm91bmQodGhpcy5yKjI1NSksXG4gICAgICAgICAgICAgIE1hdGgucm91bmQodGhpcy5nKjI1NSksXG4gICAgICAgICAgICAgIE1hdGgucm91bmQodGhpcy5iKjI1NSksXG4gICAgICAgICAgICAgIHBhcnNlRmxvYXQodGhpcy5hKVxuICAgICAgICAgIF07XG5cbiAgICAgICAgICByZXR1cm4gcmdiYTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvUkdCQU9iamVjdFxuICAgICAgICAgUmV0dXJuIHRoZSBSR0JBIG9iamVjdCBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgID4gPiBDaHJvbWF0aC5jYWRldGJsdWUudG9SR0JBT2JqZWN0KCk7XG4gICAgICAgICA+IHtyOiA5NSwgZzogMTU4LCBiOiAxNjB9XG4gICAgICAqL1xuICAgICAgdG9SR0JBT2JqZWN0OiBmdW5jdGlvbiAoKVxuICAgICAge1xuICAgICAgICAgIHZhciByZ2JhID0gdGhpcy50b1JHQkFBcnJheSgpO1xuXG4gICAgICAgICAgcmV0dXJuIHtyOiByZ2JhWzBdLCBnOiByZ2JhWzFdLCBiOiByZ2JhWzJdLCBhOiByZ2JhWzNdfTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvUkdCQVN0cmluZ1xuICAgICAgICAgUmV0dXJuIHRoZSBSR0JBIHN0cmluZyBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJ2RhcmtibHVlJykudG9SR0JBU3RyaW5nKCk7XG4gICAgICAgICA+IFwicmdiYSgwLDAsMTM5LDEpXCJcbiAgICAgICovXG4gICAgICB0b1JHQkFTdHJpbmc6IGZ1bmN0aW9uICgpe1xuICAgICAgICAgIHJldHVybiBcInJnYmEoXCIrIHRoaXMudG9SR0JBQXJyYXkoKS5qb2luKFwiLFwiKSArXCIpXCI7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiBoZXhcbiAgICAgICAgIFJldHVybiB0aGUgaGV4IGFycmF5IG9mIHRoZSBpbnN0YW5jZVxuICAgICAgICAgPiBuZXcgQ2hyb21hdGgoJ2RhcmtncmVlbicpLmhleCgpXG4gICAgICAgICBbICcwMCcsICc2NCcsICcwMCcgXVxuICAgICAgKi9cbiAgICAgIGhleDogZnVuY3Rpb24gKCl7IHJldHVybiB0aGlzLnRvSGV4QXJyYXkoKTsgfSxcblxuICAgICAgLypcbiAgICAgICAgTWV0aG9kOiB0b0hleEFycmF5XG4gICAgICAgICBSZXR1cm4gdGhlIGhleCBhcnJheSBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgPiA+IENocm9tYXRoLmZpcmVicmljay50b0hleEFycmF5KCk7XG4gICAgICAgID4gW1wiQjJcIiwgXCIyMlwiLCBcIjIyXCJdXG4gICAgICAqL1xuICAgICAgdG9IZXhBcnJheTogZnVuY3Rpb24gKCl7XG4gICAgICAgICAgcmV0dXJuIENocm9tYXRoLnJnYjJoZXgodGhpcy5yLCB0aGlzLmcsIHRoaXMuYik7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b0hleE9iamVjdFxuICAgICAgICAgUmV0dXJuIHRoZSBoZXggb2JqZWN0IG9mIHRoZSBpbnN0YW5jZVxuICAgICAgICAgPiA+IENocm9tYXRoLmdhaW5zYm9yby50b0hleE9iamVjdCgpO1xuICAgICAgICAgPiB7cjogXCJEQ1wiLCBnOiBcIkRDXCIsIGI6IFwiRENcIn1cbiAgICAgICovXG4gICAgICB0b0hleE9iamVjdDogZnVuY3Rpb24gKClcbiAgICAgIHtcbiAgICAgICAgICB2YXIgaGV4ID0gdGhpcy50b0hleEFycmF5KCk7XG5cbiAgICAgICAgICByZXR1cm4geyByOiBoZXhbMF0sIGc6IGhleFsxXSwgYjogaGV4WzJdIH07XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICBNZXRob2Q6IHRvSGV4U3RyaW5nXG4gICAgICAgICBSZXR1cm4gdGhlIGhleCBzdHJpbmcgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgID4gPiBDaHJvbWF0aC5ob25leWRldy50b0hleFN0cmluZygpO1xuICAgICAgICA+IFwiI0YwRkZGMFwiXG4gICAgICAqL1xuICAgICAgdG9IZXhTdHJpbmc6IGZ1bmN0aW9uICgpe1xuICAgICAgICAgIHZhciBoZXggPSB0aGlzLnRvSGV4QXJyYXkoKTtcblxuICAgICAgICAgIHJldHVybiAnIycgKyBoZXguam9pbignJyk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiBoc2xcbiAgICAgICAgIFJldHVybiB0aGUgSFNMIGFycmF5IG9mIHRoZSBpbnN0YW5jZVxuICAgICAgICAgPiA+bmV3IENocm9tYXRoKCdncmVlbicpLmhzbCgpO1xuICAgICAgICAgPiBbMTIwLCAxLCAwLjI1MDk4MDM5MjE1Njg2Mjc0XVxuICAgICAgKi9cbiAgICAgIGhzbDogZnVuY3Rpb24gKCl7IHJldHVybiB0aGlzLnRvSFNMQXJyYXkoKTsgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG9IU0xBcnJheVxuICAgICAgICAgUmV0dXJuIHRoZSBIU0wgYXJyYXkgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgICA+ID4gbmV3IENocm9tYXRoKCdyZWQnKS50b0hTTEFycmF5KCk7XG4gICAgICAgICA+IFswLCAxLCAwLjVdXG4gICAgICAqL1xuICAgICAgdG9IU0xBcnJheTogZnVuY3Rpb24gKCl7XG4gICAgICAgICAgcmV0dXJuIHRoaXMudG9IU0xBQXJyYXkoKS5zbGljZSgwLDMpO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG9IU0xPYmplY3RcbiAgICAgICAgIFJldHVybiB0aGUgSFNMIG9iamVjdCBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJ3JlZCcpLnRvSFNMT2JqZWN0KCk7XG4gICAgICAgICBbaDowLCBzOjEsIGw6MC41XVxuICAgICAgKi9cbiAgICAgIHRvSFNMT2JqZWN0OiBmdW5jdGlvbiAoKVxuICAgICAge1xuICAgICAgICAgIHZhciBoc2wgPSB0aGlzLnRvSFNMQXJyYXkoKTtcblxuICAgICAgICAgIHJldHVybiB7aDogaHNsWzBdLCBzOiBoc2xbMV0sIGw6IGhzbFsyXX07XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b0hTTFN0cmluZ1xuICAgICAgICAgUmV0dXJuIHRoZSBIU0wgc3RyaW5nIG9mIHRoZSBpbnN0YW5jZVxuICAgICAgICAgPiA+IG5ldyBDaHJvbWF0aCgncmVkJykudG9IU0xTdHJpbmcoKTtcbiAgICAgICAgID4gXCJoc2woMCwxLDAuNSlcIlxuICAgICAgKi9cbiAgICAgIHRvSFNMU3RyaW5nOiBmdW5jdGlvbiAoKXtcbiAgICAgICAgICB2YXIgaHNsYSA9IHRoaXMudG9IU0xBQXJyYXkoKTtcbiAgICAgICAgICB2YXIgdmFscyA9IFtcbiAgICAgICAgICAgICAgaHNsYVswXSxcbiAgICAgICAgICAgICAgTWF0aC5yb3VuZChoc2xhWzFdKjEwMCkrJyUnLFxuICAgICAgICAgICAgICBNYXRoLnJvdW5kKGhzbGFbMl0qMTAwKSsnJSdcbiAgICAgICAgICBdO1xuXG4gICAgICAgICAgcmV0dXJuICdoc2woJysgdmFscyArJyknO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgTWV0aG9kOiBoc2xhXG4gICAgICAgIFJldHVybiB0aGUgSFNMQSBhcnJheSBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgPiA+IG5ldyBDaHJvbWF0aCgnZ3JlZW4nKS5oc2xhKCk7XG4gICAgICAgID4gWzEyMCwgMSwgMC4yNTA5ODAzOTIxNTY4NjI3NCwgMV1cbiAgICAgICovXG4gICAgICBoc2xhOiBmdW5jdGlvbiAoKXsgcmV0dXJuIHRoaXMudG9IU0xBQXJyYXkoKTsgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG9IU0xBcnJheVxuICAgICAgICAgUmV0dXJuIHRoZSBIU0xBIGFycmF5IG9mIHRoZSBpbnN0YW5jZVxuICAgICAgICAgPiA+IENocm9tYXRoLmFudGlxdWV3aGl0ZS50b0hTTEFBcnJheSgpO1xuICAgICAgICAgPiBbMzQsIDAuNzc3Nzc3Nzc3Nzc3Nzc3MywgMC45MTE3NjQ3MDU4ODIzNTI5LCAxXVxuICAgICAgKi9cbiAgICAgIHRvSFNMQUFycmF5OiBmdW5jdGlvbiAoKVxuICAgICAge1xuICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgIE1hdGgucm91bmQodGhpcy5oKSxcbiAgICAgICAgICAgICAgcGFyc2VGbG9hdCh0aGlzLnNsKSxcbiAgICAgICAgICAgICAgcGFyc2VGbG9hdCh0aGlzLmwpLFxuICAgICAgICAgICAgICBwYXJzZUZsb2F0KHRoaXMuYSlcbiAgICAgICAgICBdO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG9IU0xBT2JqZWN0XG4gICAgICAgICBSZXR1cm4gdGhlIEhTTEEgb2JqZWN0IG9mIHRoZSBpbnN0YW5jZVxuICAgICAgICAgPiA+IENocm9tYXRoLmFudGlxdWV3aGl0ZS50b0hTTEFBcnJheSgpO1xuICAgICAgICAgPiB7aDozNCwgczowLjc3Nzc3Nzc3Nzc3Nzc3NzMsIGw6MC45MTE3NjQ3MDU4ODIzNTI5LCBhOjF9XG4gICAgICAqL1xuICAgICAgdG9IU0xBT2JqZWN0OiBmdW5jdGlvbiAoKVxuICAgICAge1xuICAgICAgICAgIHZhciBoc2xhID0gdGhpcy50b0hTTEFBcnJheSgpO1xuXG4gICAgICAgICAgcmV0dXJuIHtoOiBoc2xhWzBdLCBzOiBoc2xhWzFdLCBsOiBoc2xhWzJdLCBhOiBoc2xhWzNdfTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvSFNMQVN0cmluZ1xuICAgICAgICAgUmV0dXJuIHRoZSBIU0xBIHN0cmluZyBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgID4gPiBDaHJvbWF0aC5hbnRpcXVld2hpdGUudG9IU0xBU3RyaW5nKCk7XG4gICAgICAgICA+IFwiaHNsYSgzNCwwLjc3Nzc3Nzc3Nzc3Nzc3NzMsMC45MTE3NjQ3MDU4ODIzNTI5LDEpXCJcbiAgICAgICovXG4gICAgICB0b0hTTEFTdHJpbmc6IGZ1bmN0aW9uICgpe1xuICAgICAgICAgIHZhciBoc2xhID0gdGhpcy50b0hTTEFBcnJheSgpO1xuICAgICAgICAgIHZhciB2YWxzID0gW1xuICAgICAgICAgICAgICBoc2xhWzBdLFxuICAgICAgICAgICAgICBNYXRoLnJvdW5kKGhzbGFbMV0qMTAwKSsnJScsXG4gICAgICAgICAgICAgIE1hdGgucm91bmQoaHNsYVsyXSoxMDApKyclJyxcbiAgICAgICAgICAgICAgTWF0aC5yb3VuZChoc2xhWzNdKVxuICAgICAgICAgIF07XG5cbiAgICAgICAgICByZXR1cm4gJ2hzbGEoJysgdmFscyArJyknO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogaHN2XG4gICAgICAgICBSZXR1cm4gdGhlIEhTViBhcnJheSBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJ2JsdWUnKS5oc3YoKTtcbiAgICAgICAgID4gWzI0MCwgMSwgMV1cbiAgICAgICovXG4gICAgICBoc3Y6IGZ1bmN0aW9uICgpeyByZXR1cm4gdGhpcy50b0hTVkFycmF5KCk7IH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvSFNWQXJyYXlcbiAgICAgICAgIFJldHVybiB0aGUgSFNWIGFycmF5IG9mIHRoZSBpbnN0YW5jZVxuICAgICAgICAgPiA+IG5ldyBDaHJvbWF0aCgnbmF2YWpvd2hpdGUnKS50b0hTVkFycmF5KCk7XG4gICAgICAgICA+IFszNiwgMC4zMjE1Njg2Mjc0NTA5ODAzNiwgMV1cbiAgICAgICovXG4gICAgICB0b0hTVkFycmF5OiBmdW5jdGlvbiAoKVxuICAgICAge1xuICAgICAgICAgIHJldHVybiB0aGlzLnRvSFNWQUFycmF5KCkuc2xpY2UoMCwzKTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvSFNWT2JqZWN0XG4gICAgICAgICBSZXR1cm4gdGhlIEhTViBvYmplY3Qgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgICA+ID4gbmV3IENocm9tYXRoKCduYXZham93aGl0ZScpLnRvSFNWT2JqZWN0KCk7XG4gICAgICAgICA+IHtoMzYsIHM6MC4zMjE1Njg2Mjc0NTA5ODAzNiwgdjoxfVxuICAgICAgKi9cbiAgICAgIHRvSFNWT2JqZWN0OiBmdW5jdGlvbiAoKVxuICAgICAge1xuICAgICAgICAgIHZhciBoc3ZhID0gdGhpcy50b0hTVkFBcnJheSgpO1xuXG4gICAgICAgICAgcmV0dXJuIHtoOiBoc3ZhWzBdLCBzOiBoc3ZhWzFdLCB2OiBoc3ZhWzJdfTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvSFNWU3RyaW5nXG4gICAgICAgICBSZXR1cm4gdGhlIEhTViBzdHJpbmcgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgICA+ID4gbmV3IENocm9tYXRoKCduYXZham93aGl0ZScpLnRvSFNWU3RyaW5nKCk7XG4gICAgICAgICA+IFwiaHN2KDM2LDMyLjE1Njg2Mjc0NTA5ODA0JSwxMDAlKVwiXG4gICAgICAqL1xuICAgICAgdG9IU1ZTdHJpbmc6IGZ1bmN0aW9uICgpXG4gICAgICB7XG4gICAgICAgICAgdmFyIGhzdiA9IHRoaXMudG9IU1ZBcnJheSgpO1xuICAgICAgICAgIHZhciB2YWxzID0gW1xuICAgICAgICAgICAgICBoc3ZbMF0sXG4gICAgICAgICAgICAgIE1hdGgucm91bmQoaHN2WzFdKjEwMCkrJyUnLFxuICAgICAgICAgICAgICBNYXRoLnJvdW5kKGhzdlsyXSoxMDApKyclJ1xuICAgICAgICAgIF07XG5cbiAgICAgICAgICByZXR1cm4gJ2hzdignKyB2YWxzICsnKSc7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiBoc3ZhXG4gICAgICAgICBSZXR1cm4gdGhlIEhTVkEgYXJyYXkgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgICA+ID4gbmV3IENocm9tYXRoKCdibHVlJykuaHN2YSgpO1xuICAgICAgICAgPiBbMjQwLCAxLCAxLCAxXVxuICAgICAgKi9cbiAgICAgIGhzdmE6IGZ1bmN0aW9uICgpeyByZXR1cm4gdGhpcy50b0hTVkFBcnJheSgpOyB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b0hTVkFBcnJheVxuICAgICAgICAgUmV0dXJuIHRoZSBIU1ZBIGFycmF5IG9mIHRoZSBpbnN0YW5jZVxuICAgICAgICAgPiA+IG5ldyBDaHJvbWF0aCgnb2xpdmUnKS50b0hTVkFBcnJheSgpO1xuICAgICAgICAgPiBbNjAsIDEsIDAuNTAxOTYwNzg0MzEzNzI1NSwgMV1cbiAgICAgICovXG4gICAgICB0b0hTVkFBcnJheTogZnVuY3Rpb24gKCl7XG4gICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgTWF0aC5yb3VuZCh0aGlzLmgpLFxuICAgICAgICAgICAgICBwYXJzZUZsb2F0KHRoaXMuc3YpLFxuICAgICAgICAgICAgICBwYXJzZUZsb2F0KHRoaXMudiksXG4gICAgICAgICAgICAgIHBhcnNlRmxvYXQodGhpcy5hKVxuICAgICAgICAgIF07XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b0hTVkFPYmplY3RcbiAgICAgICAgIFJldHVybiB0aGUgSFNWQSBvYmplY3Qgb2YgdGhlIGluc3RhbmNlXG4gICAgICAgICA+ID4gbmV3IENocm9tYXRoKCdvbGl2ZScpLnRvSFNWQUFycmF5KCk7XG4gICAgICAgICA+IHtoOjYwLCBzOiAxLCB2OjAuNTAxOTYwNzg0MzEzNzI1NSwgYToxfVxuICAgICAgKi9cbiAgICAgIHRvSFNWQU9iamVjdDogZnVuY3Rpb24gKCl7XG4gICAgICAgICAgdmFyIGhzdmEgPSB0aGlzLnRvSFNWQUFycmF5KCk7XG5cbiAgICAgICAgICByZXR1cm4ge2g6IGhzdmFbMF0sIHM6IGhzdmFbMV0sIGw6IGhzdmFbMl0sIGE6IGhzdmFbM119O1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG9IU1ZBU3RyaW5nXG4gICAgICAgICBSZXR1cm4gdGhlIEhTVkEgc3RyaW5nIG9mIHRoZSBpbnN0YW5jZVxuICAgICAgICAgPiA+IG5ldyBDaHJvbWF0aCgnb2xpdmUnKS50b0hTVkFTdHJpbmcoKTtcbiAgICAgICAgID4gXCJoc3ZhKDYwLDEwMCUsNTAuMTk2MDc4NDMxMzcyNTUlLDEpXCJcbiAgICAgICovXG4gICAgICB0b0hTVkFTdHJpbmc6IGZ1bmN0aW9uICgpXG4gICAgICB7XG4gICAgICAgICAgdmFyIGhzdmEgPSB0aGlzLnRvSFNWQUFycmF5KCk7XG4gICAgICAgICAgdmFyIHZhbHMgPSBbXG4gICAgICAgICAgICAgIGhzdmFbMF0sXG4gICAgICAgICAgICAgIE1hdGgucm91bmQoaHN2YVsxXSoxMDApKyclJyxcbiAgICAgICAgICAgICAgTWF0aC5yb3VuZChoc3ZhWzJdKjEwMCkrJyUnLFxuICAgICAgICAgICAgICBoc3ZhWzNdXG4gICAgICAgICAgXTtcblxuICAgICAgICAgIHJldHVybiAnaHN2YSgnKyB2YWxzICsnKSc7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiBoc2JcbiAgICAgICAgIEFsaWFzIGZvciA8aHN2PlxuICAgICAgKi9cbiAgICAgIGhzYjogZnVuY3Rpb24gKCl7IHJldHVybiB0aGlzLmhzdigpOyB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b0hTQkFycmF5XG4gICAgICAgICBBbGlhcyBmb3IgPHRvSFNCQXJyYXk+XG4gICAgICAqL1xuICAgICAgdG9IU0JBcnJheTogZnVuY3Rpb24gKClcbiAgICAgIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy50b0hTVkFycmF5KCk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b0hTQk9iamVjdFxuICAgICAgICAgQWxpYXMgZm9yIDx0b0hTVk9iamVjdD5cbiAgICAgICovXG4gICAgICB0b0hTQk9iamVjdDogZnVuY3Rpb24gKClcbiAgICAgIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy50b0hTVk9iamVjdCgpO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdG9IU0JTdHJpbmdcbiAgICAgICAgIEFsaWFzIGZvciA8dG9IU1ZTdHJpbmc+XG4gICAgICAqL1xuICAgICAgdG9IU0JTdHJpbmc6IGZ1bmN0aW9uICgpXG4gICAgICB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMudG9IU1ZTdHJpbmcoKTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IGhzYmFcbiAgICAgICAgIEFsaWFzIGZvciA8aHN2YT5cbiAgICAgICovXG4gICAgICBoc2JhOiBmdW5jdGlvbiAoKXsgcmV0dXJuIHRoaXMuaHN2YSgpOyB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiB0b0hTQkFBcnJheVxuICAgICAgICAgQWxpYXMgZm9yIDx0b0hTVkFBcnJheT5cbiAgICAgICovXG4gICAgICB0b0hTQkFBcnJheTogZnVuY3Rpb24gKCl7XG4gICAgICAgICAgcmV0dXJuIHRoaXMudG9IU1ZBQXJyYXkoKTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvSFNCQU9iamVjdFxuICAgICAgICAgQWxpYXMgZm9yIDx0b0hTVkFPYmplY3Q+XG4gICAgICAqL1xuICAgICAgdG9IU0JBT2JqZWN0OiBmdW5jdGlvbiAoKXtcbiAgICAgICAgICByZXR1cm4gdGhpcy50b0hTVkFPYmplY3QoKTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvSFNCQVN0cmluZ1xuICAgICAgICAgQWxpYXMgZm9yIDx0b0hTVkFTdHJpbmc+XG4gICAgICAqL1xuICAgICAgdG9IU0JBU3RyaW5nOiBmdW5jdGlvbiAoKVxuICAgICAge1xuICAgICAgICAgIHJldHVybiB0aGlzLnRvSFNWQVN0cmluZygpO1xuICAgICAgfSxcblxuICAgICAgLy9Hcm91cDogSW5zdGFuY2UgbWV0aG9kcyAtIGNvbG9yIHNjaGVtZVxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogY29tcGxlbWVudFxuICAgICAgICAgQ2FsbHMgPENocm9tYXRoLmNvbXBsZW1lbnQ+IHdpdGggdGhlIGN1cnJlbnQgaW5zdGFuY2UgYXMgdGhlIGZpcnN0IHBhcmFtZXRlclxuXG4gICAgICAgICA+ID4gQ2hyb21hdGgucmVkLmNvbXBsZW1lbnQoKS5yZ2IoKTtcbiAgICAgICAgID4gWzAsIDI1NSwgMjU1XVxuICAgICAgKi9cbiAgICAgIGNvbXBsZW1lbnQ6IGZ1bmN0aW9uICgpe1xuICAgICAgICAgIHJldHVybiBDaHJvbWF0aC5jb21wbGVtZW50KHRoaXMpO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdHJpYWRcbiAgICAgICAgIENhbGxzIDxDaHJvbWF0aC50cmlhZD4gd2l0aCB0aGUgY3VycmVudCBpbnN0YW5jZSBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyXG5cbiAgICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJ2hzbCgwLCAxMDAlLCA1MCUpJykudHJpYWQoKS50b1N0cmluZygpO1xuICAgICAgICAgPiBcIiNGRjAwMDAsIzAwRkYwMCwjMDAwMEZGXCJcbiAgICAgICovXG4gICAgICB0cmlhZDogZnVuY3Rpb24gKCl7XG4gICAgICAgICAgcmV0dXJuIENocm9tYXRoLnRyaWFkKHRoaXMpO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogdGV0cmFkXG4gICAgICAgICBDYWxscyA8Q2hyb21hdGgudGV0cmFkPiB3aXRoIHRoZSBjdXJyZW50IGluc3RhbmNlIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXJcblxuICAgICAgICAgPiA+IENocm9tYXRoLmhzYigyNDAsIDEsIDEpLnRyaWFkKCk7XG4gICAgICAgICA+IFtDaHJvbWF0aCwgQ2hyb21hdGgsIENocm9tYXRoXVxuICAgICAgKi9cbiAgICAgIHRldHJhZDogZnVuY3Rpb24gKCl7XG4gICAgICAgICAgcmV0dXJuIENocm9tYXRoLnRldHJhZCh0aGlzKTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IGFuYWxvZ291c1xuICAgICAgICAgQ2FsbHMgPENocm9tYXRoLmFuYWxvZ291cz4gd2l0aCB0aGUgY3VycmVudCBpbnN0YW5jZSBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyXG5cbiAgICAgICAgID4gPiBDaHJvbWF0aC5oc2IoMTIwLCAxLCAxKS5hbmFsb2dvdXMoKTtcbiAgICAgICAgID4gW0Nocm9tYXRoLCBDaHJvbWF0aCwgQ2hyb21hdGgsIENocm9tYXRoLCBDaHJvbWF0aCwgQ2hyb21hdGgsIENocm9tYXRoLCBDaHJvbWF0aF1cblxuICAgICAgICAgPiA+IENocm9tYXRoLmhzYigxODAsIDEsIDEpLmFuYWxvZ291cyg1KS50b1N0cmluZygpO1xuICAgICAgICAgPiBcIiMwMEZGRkYsIzAwRkZCMiwjMDBGRkU1LCMwMEU1RkYsIzAwQjJGRlwiXG5cbiAgICAgICAgID4gPiBDaHJvbWF0aC5oc2IoMTgwLCAxLCAxKS5hbmFsb2dvdXMoNSwgMTApLnRvU3RyaW5nKCk7XG4gICAgICAgICA+IFwiIzAwRkZGRiwjMDBGRjE5LCMwMEZGQjIsIzAwQjJGRiwjMDAxOUZGXCJcbiAgICAgICovXG4gICAgICBhbmFsb2dvdXM6IGZ1bmN0aW9uIChyZXN1bHRzLCBzbGljZXMpe1xuICAgICAgICAgIHJldHVybiBDaHJvbWF0aC5hbmFsb2dvdXModGhpcywgcmVzdWx0cywgc2xpY2VzKTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgIE1ldGhvZDogbW9ub2Nocm9tYXRpY1xuICAgICAgICAgQ2FsbHMgPENocm9tYXRoLm1vbm9jaHJvbWF0aWM+IHdpdGggdGhlIGN1cnJlbnQgaW5zdGFuY2UgYXMgdGhlIGZpcnN0IHBhcmFtZXRlclxuXG4gICAgICAgID4gPiBDaHJvbWF0aC5ibHVlLm1vbm9jaHJvbWF0aWMoKS50b1N0cmluZygpO1xuICAgICAgICA+IFwiIzAwMDAzMywjMDAwMDY2LCMwMDAwOTksIzAwMDBDQywjMDAwMEZGXCJcbiAgICAgICovXG4gICAgICBtb25vY2hyb21hdGljOiBmdW5jdGlvbiAocmVzdWx0cyl7XG4gICAgICAgICAgcmV0dXJuIENocm9tYXRoLm1vbm9jaHJvbWF0aWModGhpcywgcmVzdWx0cyk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiBzcGxpdGNvbXBsZW1lbnRcbiAgICAgICAgIENhbGxzIDxDaHJvbWF0aC5zcGxpdGNvbXBsZW1lbnQ+IHdpdGggdGhlIGN1cnJlbnQgaW5zdGFuY2UgYXMgdGhlIGZpcnN0IHBhcmFtZXRlclxuXG4gICAgICAgICA+ID4gQ2hyb21hdGguYmx1ZS5zcGxpdGNvbXBsZW1lbnQoKS50b1N0cmluZygpO1xuICAgICAgICAgPiBcIiMwMDAwRkYsI0ZGQ0MwMCwjRkY1MTAwXCJcbiAgICAgICovXG4gICAgICBzcGxpdGNvbXBsZW1lbnQ6IGZ1bmN0aW9uICgpe1xuICAgICAgICAgIHJldHVybiBDaHJvbWF0aC5zcGxpdGNvbXBsZW1lbnQodGhpcyk7XG4gICAgICB9LFxuXG4gICAgICAvLyBHcm91cDogSW5zdGFuY2UgbWV0aG9kcyAtIGNvbG9yIGFsdGVyYXRpb25cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRpbnRcbiAgICAgICAgIENhbGxzIDxDaHJvbWF0aC50aW50PiB3aXRoIHRoZSBjdXJyZW50IGluc3RhbmNlIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXJcblxuICAgICAgICAgPiA+IG5ldyBDaHJvbWF0aCgneWVsbG93JykudGludCgwLjI1KS50b1N0cmluZygpO1xuICAgICAgICAgPiBcIiNGRkZGM0ZcIlxuICAgICAgKi9cbiAgICAgIHRpbnQ6IGZ1bmN0aW9uIChieSkge1xuICAgICAgICAgIHJldHVybiBDaHJvbWF0aC50aW50KHRoaXMsIGJ5KTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IGxpZ2h0ZW5cbiAgICAgICAgIEFsaWFzIGZvciA8dGludD5cbiAgICAgICovXG4gICAgICBsaWdodGVuOiBmdW5jdGlvbiAoYnkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGludChieSk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICBNZXRob2Q6IHNoYWRlXG4gICAgICAgICBDYWxscyA8Q2hyb21hdGguc2hhZGU+IHdpdGggdGhlIGN1cnJlbnQgaW5zdGFuY2UgYXMgdGhlIGZpcnN0IHBhcmFtZXRlclxuXG4gICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJ3llbGxvdycpLnNoYWRlKDAuMjUpLnRvU3RyaW5nKCk7XG4gICAgICAgID4gXCIjQkZCRjAwXCJcbiAgICAgICovXG4gICAgICBzaGFkZTogZnVuY3Rpb24gKGJ5KSB7XG4gICAgICAgICAgcmV0dXJuIENocm9tYXRoLnNoYWRlKHRoaXMsIGJ5KTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IGRhcmtlblxuICAgICAgICAgQWxpYXMgZm9yIDxzaGFkZT5cbiAgICAgICovXG4gICAgICBkYXJrZW46IGZ1bmN0aW9uIChieSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zaGFkZShieSk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiBkZXNhdHVyYXRlXG4gICAgICAgICBDYWxscyA8Q2hyb21hdGguZGVzYXR1cmF0ZT4gd2l0aCB0aGUgY3VycmVudCBpbnN0YW5jZSBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyXG5cbiAgICAgICA+ID4gbmV3IENocm9tYXRoKCdvcmFuZ2UnKS5kZXNhdHVyYXRlKCkudG9TdHJpbmcoKTtcbiAgICAgICA+IFwiI0FEQURBRFwiXG5cbiAgICAgICA+ID4gbmV3IENocm9tYXRoKCdvcmFuZ2UnKS5kZXNhdHVyYXRlKDEpLnRvU3RyaW5nKCk7XG4gICAgICAgPiBcIiM1QjVCNUJcIlxuXG4gICAgICAgPiA+IG5ldyBDaHJvbWF0aCgnb3JhbmdlJykuZGVzYXR1cmF0ZSgyKS50b1N0cmluZygpO1xuICAgICAgID4gXCIjQjRCNEI0XCJcbiAgICAgICAqL1xuICAgICAgZGVzYXR1cmF0ZTogZnVuY3Rpb24gKGZvcm11bGEpe1xuICAgICAgICAgIHJldHVybiBDaHJvbWF0aC5kZXNhdHVyYXRlKHRoaXMsIGZvcm11bGEpO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgTWV0aG9kOiBncmV5c2NhbGVcbiAgICAgICAgQWxpYXMgZm9yIDxkZXNhdHVyYXRlPlxuICAgICAgKi9cbiAgICAgIGdyZXlzY2FsZTogZnVuY3Rpb24gKGZvcm11bGEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVzYXR1cmF0ZShmb3JtdWxhKTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHdlYnNhZmVcbiAgICAgICAgIENhbGxzIDxDaHJvbWF0aC53ZWJzYWZlPiB3aXRoIHRoZSBjdXJyZW50IGluc3RhbmNlIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXJcblxuICAgICAgICAgPiA+IENocm9tYXRoLnJnYigxMjMsIDIzNCwgNTYpLnRvU3RyaW5nKCk7XG4gICAgICAgICA+IFwiIzdCRUEzOFwiXG5cbiAgICAgICAgID4gQ2hyb21hdGgucmdiKDEyMywgMjM0LCA1Nikud2Vic2FmZSgpLnRvU3RyaW5nKCk7XG4gICAgICAgICA+IFwiIzY2RkYzM1wiXG4gICAgICAgKi9cbiAgICAgIHdlYnNhZmU6IGZ1bmN0aW9uICgpe1xuICAgICAgICAgIHJldHVybiBDaHJvbWF0aC53ZWJzYWZlKHRoaXMpO1xuICAgICAgfSxcblxuICAgICAgLy8gR3JvdXA6IEluc3RhbmNlIG1ldGhvZHMgLSBjb2xvciBjb21iaW5hdGlvblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogYWRkaXRpdmVcbiAgICAgICAgIENhbGxzIDxDaHJvbWF0aC5hZGRpdGl2ZT4gd2l0aCB0aGUgY3VycmVudCBpbnN0YW5jZSBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyXG5cbiAgICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJ3JlZCcpLmFkZGl0aXZlKCcjMDBGRjAwJywgJ2JsdWUnKS50b1N0cmluZygpO1xuICAgICAgICAgPiBcIiNGRkZGRkZcIlxuICAgICAgKi9cbiAgICAgIGFkZGl0aXZlOiBmdW5jdGlvbiAoKXtcbiAgICAgICAgICB2YXIgYXJyID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgICAgICByZXR1cm4gQ2hyb21hdGguYWRkaXRpdmUuYXBwbHkoQ2hyb21hdGgsIFt0aGlzXS5jb25jYXQoYXJyKSk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiBzdWJ0cmFjdGl2ZVxuICAgICAgICAgQ2FsbHMgPENocm9tYXRoLnN1YnRyYWN0aXZlPiB3aXRoIHRoZSBjdXJyZW50IGluc3RhbmNlIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXJcblxuICAgICAgICAgPiA+IG5ldyBDaHJvbWF0aCgnY3lhbicpLnN1YnRyYWN0aXZlKCdtYWdlbnRhJywgJ3llbGxvdycpLnRvU3RyaW5nKCk7XG4gICAgICAgICA+IFwiIzAwMDAwMFwiXG4gICAgICAqL1xuICAgICAgc3VidHJhY3RpdmU6IGZ1bmN0aW9uICgpe1xuICAgICAgICAgIHZhciBhcnIgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgICAgIHJldHVybiBDaHJvbWF0aC5zdWJ0cmFjdGl2ZS5hcHBseShDaHJvbWF0aCwgW3RoaXNdLmNvbmNhdChhcnIpKTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IG11bHRpcGx5XG4gICAgICAgICBDYWxscyA8Q2hyb21hdGgubXVsdGlwbHk+IHdpdGggdGhlIGN1cnJlbnQgaW5zdGFuY2UgYXMgdGhlIGZpcnN0IHBhcmFtZXRlclxuXG4gICAgICAgICA+ID4gQ2hyb21hdGgubGlnaHRjeWFuLm11bHRpcGx5KENocm9tYXRoLmJyb3duKS50b1N0cmluZygpO1xuICAgICAgICAgPiBcIiM5MDJBMkFcIlxuICAgICAgKi9cbiAgICAgIG11bHRpcGx5OiBmdW5jdGlvbiAoKXtcbiAgICAgICAgICB2YXIgYXJyID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgICAgICByZXR1cm4gQ2hyb21hdGgubXVsdGlwbHkuYXBwbHkoQ2hyb21hdGgsIFt0aGlzXS5jb25jYXQoYXJyKSk7XG4gICAgICB9LFxuXG4gICAgICAvKlxuICAgICAgICAgTWV0aG9kOiBhdmVyYWdlXG4gICAgICAgICBDYWxscyA8Q2hyb21hdGguYXZlcmFnZT4gd2l0aCB0aGUgY3VycmVudCBpbnN0YW5jZSBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyXG5cbiAgICAgICAgID4gPiBDaHJvbWF0aC5ibGFjay5hdmVyYWdlKCd3aGl0ZScpLnJnYigpO1xuICAgICAgICAgPiBbMTI3LCAxMjcsIDEyN11cbiAgICAgICovXG4gICAgICBhdmVyYWdlOiBmdW5jdGlvbiAoKXtcbiAgICAgICAgICB2YXIgYXJyID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgICAgICByZXR1cm4gQ2hyb21hdGguYXZlcmFnZS5hcHBseShDaHJvbWF0aCwgW3RoaXNdLmNvbmNhdChhcnIpKTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IG92ZXJsYXlcbiAgICAgICAgIENhbGxzIDxDaHJvbWF0aC5vdmVybGF5PiB3aXRoIHRoZSBjdXJyZW50IGluc3RhbmNlIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXJcblxuICAgICAgID4gPiBDaHJvbWF0aC5yZWQub3ZlcmxheSgnZ3JlZW4nLCAwLjQpLnRvU3RyaW5nKCk7XG4gICAgICAgPiBcIiM5OTMzMDBcIlxuXG4gICAgICAgPiA+IENocm9tYXRoLnJlZC5vdmVybGF5KCdncmVlbicsIDEpLnRvU3RyaW5nKCk7XG4gICAgICAgPiBcIiMwMDgwMDBcIlxuXG4gICAgICAgPiA+IENocm9tYXRoLnJlZC5vdmVybGF5KCdncmVlbicsIDApLnRvU3RyaW5nKCk7XG4gICAgICAgPiBcIiNGRjAwMDBcIlxuICAgICAgICovXG4gICAgICBvdmVybGF5OiBmdW5jdGlvbiAoYm90dG9tLCB0cmFuc3BhcmVuY3kpe1xuICAgICAgICAgIHJldHVybiBDaHJvbWF0aC5vdmVybGF5KHRoaXMsIGJvdHRvbSwgdHJhbnNwYXJlbmN5KTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIEdyb3VwOiBJbnN0YW5jZSBtZXRob2RzIC0gb3RoZXJcbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IGNsb25lXG4gICAgICAgICBSZXR1cm4gYW4gaW5kZXBlbmRlbnQgY29weSBvZiB0aGUgaW5zdGFuY2VcbiAgICAgICovXG4gICAgICBjbG9uZTogZnVuY3Rpb24gKCl7XG4gICAgICAgICAgcmV0dXJuIG5ldyBDaHJvbWF0aCh0aGlzKTtcbiAgICAgIH0sXG5cbiAgICAgIC8qXG4gICAgICAgICBNZXRob2Q6IHRvd2FyZHNcbiAgICAgICAgIENhbGxzIDxDaHJvbWF0aC50b3dhcmRzPiB3aXRoIHRoZSBjdXJyZW50IGluc3RhbmNlIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXJcblxuICAgICAgICAgPiA+IHZhciByZWQgPSBuZXcgQ2hyb21hdGgoJ3JlZCcpO1xuICAgICAgICAgPiA+IHJlZC50b3dhcmRzKCd5ZWxsb3cnLCAwLjU1KS50b1N0cmluZygpO1xuICAgICAgICAgPiBcIiNGRjhDMDBcIlxuICAgICAgKi9cbiAgICAgIHRvd2FyZHM6IGZ1bmN0aW9uICh0bywgYnkpIHtcbiAgICAgICAgICByZXR1cm4gQ2hyb21hdGgudG93YXJkcyh0aGlzLCB0bywgYnkpO1xuICAgICAgfSxcblxuICAgICAgLypcbiAgICAgICAgIE1ldGhvZDogZ3JhZGllbnRcbiAgICAgICAgIENhbGxzIDxDaHJvbWF0aC5ncmFkaWVudD4gd2l0aCB0aGUgY3VycmVudCBpbnN0YW5jZSBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyXG5cbiAgICAgICAgID4gPiBuZXcgQ2hyb21hdGgoJyNGMDAnKS5ncmFkaWVudCgnIzAwRicpLnRvU3RyaW5nKClcbiAgICAgICAgID4gXCIjRkYwMDAwLCNGMTAwMEQsI0U0MDAxQSwjRDYwMDI4LCNDOTAwMzUsI0JCMDA0MywjQUUwMDUwLCNBMTAwNUQsIzkzMDA2QiwjODYwMDc4LCM3ODAwODYsIzZCMDA5MywjNUQwMEExLCM1MDAwQUUsIzQzMDBCQiwjMzUwMEM5LCMyODAwRDYsIzFBMDBFNCwjMEQwMEYxLCMwMDAwRkZcIlxuXG4gICAgICAgICA+ID4gbmV3IENocm9tYXRoKCcjRjAwJykuZ3JhZGllbnQoJyMwMEYnLCA1KS50b1N0cmluZygpXG4gICAgICAgICA+IFwiI0ZGMDAwMCwjQkYwMDNGLCM3RjAwN0YsIzNGMDBCRiwjMDAwMEZGXCJcblxuICAgICAgICAgPiA+IG5ldyBDaHJvbWF0aCgnI0YwMCcpLmdyYWRpZW50KCcjMDBGJywgNSwgMykudG9TdHJpbmcoKVxuICAgICAgICAgPiBcIiMzRjAwQkZcIlxuICAgICAgKi9cbiAgICAgIGdyYWRpZW50OiBmdW5jdGlvbiAodG8sIHNsaWNlcywgc2xpY2Upe1xuICAgICAgICAgIHJldHVybiBDaHJvbWF0aC5ncmFkaWVudCh0aGlzLCB0bywgc2xpY2VzLCBzbGljZSk7XG4gICAgICB9XG4gIH07XG59O1xuIiwidmFyIHV0aWwgPSB7fTtcblxudXRpbC5jbGFtcCA9IGZ1bmN0aW9uICggdmFsLCBtaW4sIG1heCApIHtcbiAgICBpZiAodmFsID4gbWF4KSByZXR1cm4gbWF4O1xuICAgIGlmICh2YWwgPCBtaW4pIHJldHVybiBtaW47XG4gICAgcmV0dXJuIHZhbDtcbn07XG5cbnV0aWwubWVyZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGRlc3QgPSBhcmd1bWVudHNbMF0sIGk9MSwgc291cmNlLCBwcm9wO1xuICAgIHdoaWxlIChzb3VyY2UgPSBhcmd1bWVudHNbaSsrXSlcbiAgICAgICAgZm9yIChwcm9wIGluIHNvdXJjZSkgZGVzdFtwcm9wXSA9IHNvdXJjZVtwcm9wXTtcblxuICAgIHJldHVybiBkZXN0O1xufTtcblxudXRpbC5pc0FycmF5ID0gZnVuY3Rpb24gKCB0ZXN0ICkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodGVzdCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG51dGlsLmlzU3RyaW5nID0gZnVuY3Rpb24gKCB0ZXN0ICkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodGVzdCkgPT09ICdbb2JqZWN0IFN0cmluZ10nO1xufTtcblxudXRpbC5pc051bWJlciA9IGZ1bmN0aW9uICggdGVzdCApIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHRlc3QpID09PSAnW29iamVjdCBOdW1iZXJdJztcbn07XG5cbnV0aWwuaXNPYmplY3QgPSBmdW5jdGlvbiAoIHRlc3QgKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0ZXN0KSA9PT0gJ1tvYmplY3QgT2JqZWN0XSc7XG59O1xuXG51dGlsLmxwYWQgPSBmdW5jdGlvbiAoIHZhbCwgbGVuLCBwYWQgKSB7XG4gICAgdmFsID0gdmFsLnRvU3RyaW5nKCk7XG4gICAgaWYgKCFsZW4pIGxlbiA9IDI7XG4gICAgaWYgKCFwYWQpIHBhZCA9ICcwJztcblxuICAgIHdoaWxlICh2YWwubGVuZ3RoIDwgbGVuKSB2YWwgPSBwYWQrdmFsO1xuXG4gICAgcmV0dXJuIHZhbDtcbn07XG5cbnV0aWwubGVycCA9IGZ1bmN0aW9uIChmcm9tLCB0bywgYnkpIHtcbiAgICByZXR1cm4gZnJvbSArICh0by1mcm9tKSAqIGJ5O1xufTtcblxudXRpbC50aW1lcyA9IGZ1bmN0aW9uIChuLCBmbiwgY29udGV4dCkge1xuICAgIGZvciAodmFyIGkgPSAwLCByZXN1bHRzID0gW107IGkgPCBuOyBpKyspIHtcbiAgICAgICAgcmVzdWx0c1tpXSA9IGZuLmNhbGwoY29udGV4dCwgaSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xufTtcblxudXRpbC5yZ2IgPSB7XG4gICAgZnJvbUFyZ3M6IGZ1bmN0aW9uIChyLCBnLCBiLCBhKSB7XG4gICAgICAgIHZhciByZ2IgPSBhcmd1bWVudHNbMF07XG5cbiAgICAgICAgaWYgKHV0aWwuaXNBcnJheShyZ2IpKXsgcj1yZ2JbMF07IGc9cmdiWzFdOyBiPXJnYlsyXTsgYT1yZ2JbM107IH1cbiAgICAgICAgaWYgKHV0aWwuaXNPYmplY3QocmdiKSl7IHI9cmdiLnI7IGc9cmdiLmc7IGI9cmdiLmI7IGE9cmdiLmE7ICB9XG5cbiAgICAgICAgcmV0dXJuIFtyLCBnLCBiLCBhXTtcbiAgICB9LFxuICAgIHNjYWxlZDAxOiBmdW5jdGlvbiAociwgZywgYikge1xuICAgICAgICBpZiAoIWlzRmluaXRlKGFyZ3VtZW50c1sxXSkpe1xuICAgICAgICAgICAgdmFyIHJnYiA9IHV0aWwucmdiLmZyb21BcmdzKHIsIGcsIGIpO1xuICAgICAgICAgICAgciA9IHJnYlswXSwgZyA9IHJnYlsxXSwgYiA9IHJnYlsyXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyID4gMSkgciAvPSAyNTU7XG4gICAgICAgIGlmIChnID4gMSkgZyAvPSAyNTU7XG4gICAgICAgIGlmIChiID4gMSkgYiAvPSAyNTU7XG5cbiAgICAgICAgcmV0dXJuIFtyLCBnLCBiXTtcbiAgICB9LFxuICAgIHBjdFdpdGhTeW1ib2w6IGZ1bmN0aW9uIChyLCBnLCBiKSB7XG4gICAgICAgIHZhciByZ2IgPSB0aGlzLnNjYWxlZDAxKHIsIGcsIGIpO1xuXG4gICAgICAgIHJldHVybiByZ2IubWFwKGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5yb3VuZCh2ICogMjU1KSArICclJztcbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxudXRpbC5oc2wgPSB7XG4gICAgZnJvbUFyZ3M6IGZ1bmN0aW9uIChoLCBzLCBsLCBhKSB7XG4gICAgICAgIHZhciBoc2wgPSBhcmd1bWVudHNbMF07XG5cbiAgICAgICAgaWYgKHV0aWwuaXNBcnJheShoc2wpKXsgaD1oc2xbMF07IHM9aHNsWzFdOyBsPWhzbFsyXTsgYT1oc2xbM107IH1cbiAgICAgICAgaWYgKHV0aWwuaXNPYmplY3QoaHNsKSl7IGg9aHNsLmg7IHM9aHNsLnM7IGw9KGhzbC5sIHx8IGhzbC52KTsgYT1oc2wuYTsgfVxuXG4gICAgICAgIHJldHVybiBbaCwgcywgbCwgYV07XG4gICAgfSxcbiAgICBzY2FsZWQ6IGZ1bmN0aW9uIChoLCBzLCBsKSB7XG4gICAgICAgIGlmICghaXNGaW5pdGUoYXJndW1lbnRzWzFdKSl7XG4gICAgICAgICAgICB2YXIgaHNsID0gdXRpbC5oc2wuZnJvbUFyZ3MoaCwgcywgbCk7XG4gICAgICAgICAgICBoID0gaHNsWzBdLCBzID0gaHNsWzFdLCBsID0gaHNsWzJdO1xuICAgICAgICB9XG5cbiAgICAgICAgaCA9ICgoKGggJSAzNjApICsgMzYwKSAlIDM2MCk7XG4gICAgICAgIGlmIChzID4gMSkgcyAvPSAxMDA7XG4gICAgICAgIGlmIChsID4gMSkgbCAvPSAxMDA7XG5cbiAgICAgICAgcmV0dXJuIFtoLCBzLCBsXTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHV0aWw7XG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbi8vQ3JhZnQgb2JqZWN0LnByb3R5cGVcclxuKGZ1bmN0aW9uKCl7XHJcblx0aWYoIHR5cGVvZihPYmplY3QuYWRkQ29uc3RQcm9wKSA9PSBcImZ1bmN0aW9uXCIpe1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHRcclxuXHRcclxuXHRmdW5jdGlvbiBjb25zdFByb3AobmFtZV9wcm9wLCB2YWx1ZSwgdmlzKXtcclxuXHRcdGlmKHZpcyA9PT0gdW5kZWZpbmVkKSB2aXMgPSB0cnVlO1xyXG5cdFx0aWYodHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiKSBPYmplY3QuZnJlZXplKHZhbHVlKTtcclxuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBuYW1lX3Byb3AsIHtcclxuXHRcdFx0XHR2YWx1ZTogdmFsdWUsXHJcblx0XHRcdFx0ZW51bWVyYWJsZTogdmlzXHJcblx0XHRcdH0pO1xyXG5cdH1cclxuXHRmdW5jdGlvbiBnZXRTZXQobmFtZSwgZ2V0dGVyLCBzZXR0ZXIpe1xyXG5cdFx0aWYodHlwZW9mIHNldHRlciA9PSBcImZ1bmN0aW9uXCIpe1xyXG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgbmFtZSwge1xyXG5cdFx0XHRcdGdldDogZ2V0dGVyLFxyXG5cdFx0XHRcdHNldDogc2V0dGVyLFxyXG5cdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXHJcblx0XHRcdFx0Y29uZmlndXJhYmxlOiB0cnVlXHJcblx0XHRcdH0pO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBuYW1lLCB7XHJcblx0XHRcdFx0Z2V0OiBnZXR0ZXIsXHJcblx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcclxuXHRcdFx0XHRjb25maWd1cmFibGU6IHRydWVcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGNvbnN0UHJvcC5jYWxsKE9iamVjdC5wcm90b3R5cGUsICdhZGRDb25zdFByb3AnLCBjb25zdFByb3AsIGZhbHNlKTtcclxuXHRPYmplY3QucHJvdG90eXBlLmFkZENvbnN0UHJvcCgnYWRkR2V0U2V0JywgZ2V0U2V0LCBmYWxzZSk7XHJcblx0XHJcblx0XHJcblx0aWYodHlwZW9mKE9iamVjdC5wcm90b3R5cGUudG9Tb3VyY2UpICE9PSBcImZ1bmN0aW9uXCIpe1xyXG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KE9iamVjdC5wcm90b3R5cGUsICd0b1NvdXJjZScse1xyXG5cdFx0XHR2YWx1ZTogZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdHZhciBzdHIgPSAneyc7XHJcblx0XHRcdFx0XHRmb3IodmFyIGtleSBpbiB0aGlzKXtcclxuXHRcdFx0XHRcdFx0c3RyICs9ICcgJyArIGtleSArICc6ICcgKyB0aGlzW2tleV0gKyAnLCc7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpZihzdHIubGVuZ3RoID4gMikgc3RyID0gc3RyLnNsaWNlKDAsIC0xKSArICcgJztcclxuXHRcdFx0XHRcdHJldHVybiBzdHIgKyAnfSc7XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0ZW51bWVyYWJsZTogZmFsc2VcclxuXHRcdH0pO1xyXG5cdH1cclxuXHRcclxuXHRcclxuXHRpZih0eXBlb2YoT2JqZWN0LnZhbHVlcykgIT09IFwiZnVuY3Rpb25cIil7XHJcblx0XHR2YXIgdmFsX09iaiA9IGZ1bmN0aW9uKG9iail7XHJcblx0XHRcdHZhciB2YWxzID0gW107XHJcblx0XHRcdFxyXG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gb2JqKSB7XHJcblx0XHRcdFx0dmFscy5wdXNoKG9ialtrZXldKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0cmV0dXJuIHZhbHM7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQgT2JqZWN0LmFkZENvbnN0UHJvcCgndmFsdWVzJywgdmFsX09iai5iaW5kKE9iamVjdCkpO1xyXG5cdH1cclxuXHRcclxuXHRmdW5jdGlvbiByYW5kSW5kZXgoKXtcclxuXHRcdHZhciByYW5kID0gTWF0aC5yb3VuZCgodGhpcy5sZW5ndGggLSAxKSAqIE1hdGgucmFuZG9tKCkpO1xyXG5cdFx0cmV0dXJuIHRoaXNbcmFuZF07XHJcblx0fVxyXG5cdEFycmF5LnByb3RvdHlwZS5hZGRDb25zdFByb3AoJ3JhbmRfaScsIHJhbmRJbmRleCk7XHJcblx0XHJcblx0XHJcblx0ZnVuY3Rpb24gY3JlYXRlQXJyKHZhbCwgbGVuZ3RoLCBpc19jYWxsKXtcclxuXHRcdHZhciBhcnIgPSBbXTtcclxuXHRcdFxyXG5cdFx0aWYoIWxlbmd0aCkgbGVuZ3RoID0gMTtcclxuXHRcdGlmKGlzX2NhbGwgPT09IHVuZGVmaW5lZCkgaXNfY2FsbCA9IHRydWU7XHJcblx0XHRcclxuXHRcdGlmKHR5cGVvZiB2YWwgPT0gJ2Z1bmN0aW9uJyAmJiBpc19jYWxsKXtcclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKXtcclxuXHRcdFx0XHRhcnIucHVzaCh2YWwoaSwgYXJyKSk7XHJcblx0XHRcdH1cclxuXHRcdH1lbHNle1xyXG5cdFx0XHRcclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKXtcclxuXHRcdFx0XHRhcnIucHVzaCh2YWwpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiBhcnI7XHJcblx0fVxyXG5cdFxyXG5cdEFycmF5LnByb3RvdHlwZS5hZGRDb25zdFByb3AoJ2FkZCcsIGZ1bmN0aW9uKHZhbCl7XHJcblx0XHRpZighdGhpcy5fbnVsbHMpIHRoaXMuX251bGxzID0gW107XHJcblx0XHRcclxuXHRcdGlmKHRoaXMuX251bGxzLmxlbmd0aCl7XHJcblx0XHRcdHZhciBpbmQgPSB0aGlzLl9udWxscy5wb3AoKTtcclxuXHRcdFx0dGhpc1tpbmRdID0gdmFsO1xyXG5cdFx0XHRyZXR1cm4gaW5kO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHJldHVybiB0aGlzLnB1c2godmFsKSAtIDE7XHJcblx0XHR9XHJcblx0fSk7XHJcblx0XHJcblx0QXJyYXkucHJvdG90eXBlLmFkZENvbnN0UHJvcCgnZGVsbCcsIGZ1bmN0aW9uKGluZCl7XHJcblx0XHRpZihpbmQgPiB0aGlzLmxlbmd0aCAtMSkgcmV0dXJuIGZhbHNlO1xyXG5cdFx0XHJcblx0XHRpZihpbmQgPT0gdGhpcy5sZW5ndGggLTEpe1xyXG5cdFx0XHR0aGlzLnBvcCgpO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdGlmKCF0aGlzLl9udWxscykgdGhpcy5fbnVsbHMgPSBbXTtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXNbaW5kXSA9IHVuZGVmaW5lZDtcclxuXHRcdFx0dGhpcy5fbnVsbHMucHVzaChpbmQpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gdHJ1ZTtcdFxyXG5cdH0pO1xyXG5cdFxyXG5cdEFycmF5LmFkZENvbnN0UHJvcCgnY3JlYXRlJywgY3JlYXRlQXJyKTtcclxuXHRcclxuXHRcclxuXHRpZihSZWdFeHAucHJvdG90eXBlLnRvSlNPTiAhPT0gXCJmdW5jdGlvblwiKXtcclxuXHRcdFJlZ0V4cC5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXsgcmV0dXJuIHRoaXMuc291cmNlOyB9O1xyXG5cdH1cclxuXHJcbn0pKCk7XHJcblxyXG5cclxuXHJcblxyXG4iLCIndXNlIHN0cmljdCc7XHJcbm5ldyAoZnVuY3Rpb24oKXtcclxuXHRpZih0eXBlb2YoT2JqZWN0LmFkZENvbnN0UHJvcCkgIT09IFwiZnVuY3Rpb25cIil7XHJcblx0XHRpZih0eXBlb2YgbW9kdWxlID09IFwib2JqZWN0XCIpe1xyXG5cdFx0XHRyZXF1aXJlKFwiLi9tb2YuanNcIik7XHJcblx0XHR9ZWxzZSB0aHJvdyBuZXcgRXJyb3IoXCLQotGA0LXQsdGD0LXRgtGM0YHRjyDQsdC40LHQu9C40L7RgtC10LrQsCBtb2YuanNcIik7XHJcblx0fVxyXG5cclxuXHRpZih0eXBlb2YoT2JqZWN0LnR5cGVzKSA9PSBcIm9iamVjdFwiKXtcclxuXHRcdHJldHVybiBPYmplY3QudHlwZXM7XHJcblx0fVxyXG5cclxuXHR2YXIgVCA9IHRoaXM7XHJcblx0dmFyIERvYyA9IHtcclxuXHRcdHR5cGVzOntcclxuXHRcdFx0J2Jvb2wnOntcclxuXHRcdFx0XHRuYW1lOiBcIkJvb2xlYW5cIixcclxuXHRcdFx0XHRhcmc6IFtdXHJcblx0XHRcdH0sXHJcblx0XHRcdCdjb25zdCc6IHtcclxuXHRcdFx0XHRuYW1lOiBcIkNvbnN0YW50XCIsXHJcblx0XHRcdFx0YXJnOiBbXCJ2YWx1ZVwiXSxcclxuXHRcdFx0XHRwYXJhbXM6IHsgdmFsdWU6IHt0eXBlOiBcIlNvbWV0aGluZ1wiLCBkZWZhdWx0X3ZhbHVlOiBudWxsfX1cclxuXHRcdFx0fSxcclxuXHRcdFx0J3Bvcyc6IHtcclxuXHRcdFx0XHRuYW1lOiBcIlBvc2l0aW9uXCIsXHJcblx0XHRcdFx0YXJnOiBbJ21heCddLFxyXG5cdFx0XHRcdHBhcmFtczoge21heDoge3R5cGU6ICdwb3MnLCBkZWZhdWx0X3ZhbHVlOiArMjE0NzQ4MzY0N319XHJcblxyXG5cdFx0XHR9LFxyXG5cclxuXHRcdFx0J2ludCc6IHtcclxuXHRcdFx0XHRuYW1lOiBcIkludGVnZXJcIixcclxuXHRcdFx0XHRhcmc6IFtcIm1heFwiLCBcIm1pblwiLCBcInN0ZXBcIl0sXHJcblx0XHRcdFx0cGFyYW1zOiB7XHJcblx0XHRcdFx0XHRcdG1heDoge3R5cGU6ICdpbnQnLCBkZWZhdWx0X3ZhbHVlOiArMjE0NzQ4MzY0N30sXHJcblx0XHRcdFx0XHRcdG1pbjoge3R5cGU6ICdpbnQnLCBkZWZhdWx0X3ZhbHVlOiAtMjE0NzQ4MzY0OH0sXHJcblx0XHRcdFx0XHRcdHN0ZXA6IHt0eXBlOiAncG9zJywgZGVmYXVsdF92YWx1ZTogMX1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0fSxcclxuXHJcblx0XHRcdCdudW0nOiB7XHJcblx0XHRcdFx0bmFtZTogXCJOdW1iZXJcIixcclxuXHRcdFx0XHRhcmc6IFtcIm1heFwiLCBcIm1pblwiLCBcInByZWNpc1wiXSxcclxuXHRcdFx0XHRwYXJhbXM6IHtcclxuXHRcdFx0XHRcdFx0bWF4OiB7dHlwZTogJ251bScsIGRlZmF1bHRfdmFsdWU6ICsyMTQ3NDgzNjQ3fSxcclxuXHRcdFx0XHRcdFx0bWluOiB7dHlwZTogJ251bScsIGRlZmF1bHRfdmFsdWU6IC0yMTQ3NDgzNjQ4fSxcclxuXHRcdFx0XHRcdFx0cHJlY2lzOiB7dHlwZTogJ3BvcycsIGRlZmF1bHRfdmFsdWU6IDl9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdH0sXHJcblx0XHRcdCdhcnInOiB7XHJcblx0XHRcdFx0bmFtZTogXCJBcnJheVwiLFxyXG5cdFx0XHRcdGFyZzogW1widHlwZXNcIiwgXCJzaXplXCIsIFwiZml4ZWRcIl0sXHJcblx0XHRcdFx0cGFyYW1zOiB7XHJcblx0XHRcdFx0XHRcdHR5cGVzOiB7dHlwZTogXCJUeXBlIHx8IFtUeXBlLCBUeXBlLi4uXVwiLCBnZXQgZGVmYXVsdF92YWx1ZSgpe3JldHVybiBULnBvc319LFxyXG5cdFx0XHRcdFx0XHRzaXplOiB7dHlwZTogJ3BvcycsIGRlZmF1bHRfdmFsdWU6IDd9LFxyXG5cdFx0XHRcdFx0XHRmaXhlZDoge3R5cGU6ICdib29sJywgZGVmYXVsdF92YWx1ZTogdHJ1ZX1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0fSxcclxuXHRcdFx0J2FueSc6IHtcclxuXHRcdFx0XHRuYW1lOiBcIk1peFR5cGVcIixcclxuXHRcdFx0XHRhcmc6IFtcInR5cGVzXCJdLFxyXG5cdFx0XHRcdHBhcmFtczoge1xyXG5cdFx0XHRcdFx0XHR0eXBlczoge3R5cGU6IFwiVHlwZSwgVHlwZS4uLiB8fCBbVHlwZSwgVHlwZS4uLl1cIiwgZ2V0IGRlZmF1bHRfdmFsdWUoKXtyZXR1cm4gW1QucG9zLCBULnN0cl19fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHR9LFxyXG5cdFx0XHQnb2JqJzoge1xyXG5cdFx0XHRcdG5hbWU6IFwiT2JqZWN0XCIsXHJcblx0XHRcdFx0YXJnOiBbXCJ0eXBlc1wiXSxcclxuXHRcdFx0XHRwYXJhbXM6IHt0eXBlczoge3R5cGU6IFwiT2JqZWN0XCIsIGRlZmF1bHRfdmFsdWU6IHt9fX1cclxuXHRcdFx0fVxyXG5cdFx0fSxcclxuXHRcdGdldENvbnN0OiBmdW5jdGlvbihuYW1lX3R5cGUsIG5hbWVfbGltaXQpe1xyXG5cdFx0XHRyZXR1cm4gdGhpcy50eXBlc1tuYW1lX3R5cGVdLnBhcmFtc1tuYW1lX2xpbWl0XS5kZWZhdWx0X3ZhbHVlO1xyXG5cdFx0fVxyXG5cdH07XHJcblx0dGhpcy5kb2MgPSB7fTtcclxuXHR0aGlzLmRvYy5qc29uID0gSlNPTi5zdHJpbmdpZnkoRG9jLCBcIlwiLCAyKTtcclxuXHJcblx0RG9jLmdlbkRvYyA9IChmdW5jdGlvbihuYW1lLCBwYXJhbXMpe3JldHVybiB7bmFtZTogdGhpcy50eXBlc1tuYW1lXS5uYW1lLCBwYXJhbXM6IHBhcmFtc319KS5iaW5kKERvYyk7XHJcblx0dGhpcy5kb2MuZ2VuID0gRG9jLmdlbkRvYztcclxuXHJcblxyXG5cclxuXHJcblx0Ly9FcnJvc1xyXG5cdGZ1bmN0aW9uIGFyZ1R5cGVFcnJvcih3cm9uZ19hcmcsIG1lc3Mpe1xyXG5cdFx0aWYobWVzcyA9PT0gdW5kZWZpbmVkKSBtZXNzID0gJyc7XHJcblx0XHR2YXIgRVIgPSBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCB0eXBlIGlzIHdyb25nISBBcmd1bWVudHMoJyArIGZvckFyZyh3cm9uZ19hcmcpICsgJyk7JyArIG1lc3MpO1xyXG5cdFx0RVIud3JvbmdfYXJnID0gd3JvbmdfYXJnO1xyXG5cclxuXHRcdGlmIChFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSkge1xyXG5cdFx0XHRFcnJvci5jYXB0dXJlU3RhY2tUcmFjZShFUiwgYXJnVHlwZUVycm9yKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gRVI7XHJcblxyXG5cdFx0ZnVuY3Rpb24gZm9yQXJnKGFyZ3Mpe1xyXG5cdFx0XHR2YXIgc3RyX2FyZ3MgPSAnJztcclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspe1xyXG5cdFx0XHRcdHN0cl9hcmdzICs9IHR5cGVvZihhcmdzW2ldKSArICc6ICcgKyBhcmdzW2ldICsgJzsgJztcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gc3RyX2FyZ3M7XHJcblx0XHR9XHJcblx0fVxyXG5cdFQuZXJyb3IgPSBhcmdUeXBlRXJyb3I7XHJcblxyXG5cdGZ1bmN0aW9uIHR5cGVTeW50YXhFcnJvcih3cm9uZ19zdHIsIG1lc3Mpe1xyXG5cdFx0aWYobWVzcyA9PT0gdW5kZWZpbmVkKSBtZXNzID0gJyc7XHJcblx0XHR2YXIgRVIgPSBuZXcgU3ludGF4RXJyb3IoJ0xpbmU6ICcgKyB3cm9uZ19zdHIgKyAnOyAnICsgbWVzcyk7XHJcblx0XHRFUi53cm9uZ19hcmcgPSB3cm9uZ19zdHI7XHJcblxyXG5cdFx0aWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKSB7XHJcblx0XHRcdEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKEVSLCB0eXBlU3ludGF4RXJyb3IpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBFUjtcclxuXHR9XHJcblxyXG5cclxuXHJcblx0ZnVuY3Rpb24gQ3JlYXRlQ3JlYXRvcihOZXcsIHRlc3QsIHJhbmQsIGRvYyl7XHJcblx0XHR2YXIgY3JlYXRvcjtcclxuXHRcdGlmKHR5cGVvZiBOZXcgPT09IFwiZnVuY3Rpb25cIil7XHJcblx0XHRcdGNyZWF0b3IgPSBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdHZhciB0bXBfb2JqID0gTmV3LmFwcGx5KHt9LCBhcmd1bWVudHMpO1xyXG5cdFx0XHRcdHZhciBuZXdfY3JlYXRvciA9IG5ldyBDcmVhdGVDcmVhdG9yKE5ldyk7XHJcblx0XHRcdFx0Zm9yKHZhciBrZXkgaW4gdG1wX29iail7XHJcblx0XHRcdFx0XHRuZXdfY3JlYXRvci5hZGRDb25zdFByb3Aoa2V5LCB0bXBfb2JqW2tleV0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRyZXR1cm4gbmV3X2NyZWF0b3I7XHJcblx0XHRcdH07XHJcblx0XHR9ZWxzZSBjcmVhdG9yID0gZnVuY3Rpb24oKXtyZXR1cm4gY3JlYXRvcn07XHJcblxyXG5cdFx0Y3JlYXRvci5hZGRDb25zdFByb3AoJ2lzX2NyZWF0b3InLCB0cnVlKTtcclxuXHRcdGlmKHR5cGVvZiB0ZXN0ID09PSBcImZ1bmN0aW9uXCIpIGNyZWF0b3IuYWRkQ29uc3RQcm9wKCd0ZXN0JywgdGVzdCk7XHJcblx0XHRpZih0eXBlb2YgcmFuZCA9PT0gXCJmdW5jdGlvblwiKSBjcmVhdG9yLmFkZENvbnN0UHJvcCgncmFuZCcsIHJhbmQpO1xyXG5cdFx0aWYodHlwZW9mIGRvYyA9PT0gXCJmdW5jdGlvblwiKSBjcmVhdG9yLmFkZENvbnN0UHJvcCgnZG9jJywgZG9jKTtcclxuXHJcblx0XHRyZXR1cm4gY3JlYXRvcjtcclxuXHR9XHJcblx0dGhpcy5uZXdUeXBlID0gZnVuY3Rpb24oa2V5LCBkZXNjLCBuZXdfdHlwZSl7XHJcblx0XHREb2MudHlwZXNba2V5XSA9IGRlc2M7XHJcblx0XHRULm5hbWVzW2Rlc2MubmFtZV0gPSBrZXk7XHJcblx0XHR0aGlzLmRvYy5qc29uID0gSlNPTi5zdHJpbmdpZnkoRG9jLCBcIlwiLCAyKTtcclxuXHJcblx0XHR0aGlzW2tleV0gPSBuZXcgQ3JlYXRlQ3JlYXRvcihuZXdfdHlwZS5OZXcsIG5ld190eXBlLnRlc3QsIG5ld190eXBlLnJhbmQsIG5ld190eXBlLmRvYyk7XHJcblx0fVxyXG5cdHRoaXMubmV3VHlwZS5kb2MgPSAnKG5hbWUsIGNvbnN0cnVjdG9yLCBmdW5jVGVzdCwgZnVuY1JhbmQsIGZ1bmNEb2MpJztcclxuXHJcblxyXG5cclxuXHQvL0NyYWZ0IEJvb2xlYW5cclxuXHRcdHRoaXMuYm9vbCA9IG5ldyBDcmVhdGVDcmVhdG9yKFxyXG5cdFx0XHRudWxsLFxyXG5cdFx0XHRmdW5jdGlvbih2YWx1ZSl7XHJcblx0XHRcdFx0aWYodHlwZW9mIHZhbHVlICE9PSAnYm9vbGVhbicpe1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuZG9jKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LFxyXG5cdFx0XHRmdW5jdGlvbigpe1xyXG5cdFx0XHRcdHJldHVybiAhKE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSkpO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHREb2MuZ2VuRG9jLmJpbmQobnVsbCwgXCJib29sXCIpXHJcblx0XHQpO1xyXG5cclxuXHJcblxyXG5cdC8vQ3JhZnQgQ29uc3RcclxuXHRcdGZ1bmN0aW9uIGRvY0NvbnN0KHZhbCl7XHJcblxyXG5cdFx0XHRpZih0eXBlb2YodmFsKSA9PT0gXCJvYmplY3RcIiAmJiB2YWwgIT09IG51bGwpe1xyXG5cdFx0XHRcdHZhbCA9ICdPYmplY3QnO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmKHR5cGVvZih2YWwpID09PSBcImZ1bmN0aW9uXCIpe1xyXG5cdFx0XHRcdHZhbCA9IHZhbC50b1N0cmluZygpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBEb2MuZ2VuRG9jLmJpbmQobnVsbCxcImNvbnN0XCIsIHt2YWx1ZTogdmFsfSk7XHJcblx0XHR9XHJcblx0XHRmdW5jdGlvbiBuZXdDb25zdCh2YWwpe1xyXG5cdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdHJhbmQ6IGZ1bmN0aW9uKCl7cmV0dXJuIHZhbH0sXHJcblx0XHRcdFx0dGVzdDogZnVuY3Rpb24odil7XHJcblx0XHRcdFx0XHRpZih2YWwgIT09IHYpIHJldHVybiB0aGlzLmRvYygpO1xyXG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0ZG9jOiBkb2NDb25zdCh2YWwpXHJcblx0XHRcdH07XHJcblx0XHR9XHJcblx0XHR2YXIgZGVmX2NvbnN0ID0gbmV3Q29uc3QoRG9jLmdldENvbnN0KCdjb25zdCcsICd2YWx1ZScpKTtcclxuXHRcdHRoaXMuY29uc3QgPSBuZXcgQ3JlYXRlQ3JlYXRvcihuZXdDb25zdCwgZGVmX2NvbnN0LnRlc3QsIGRlZl9jb25zdC5yYW5kLCBkZWZfY29uc3QuZG9jKTtcclxuXHJcblx0XHRmdW5jdGlvbiB0Q29uc3QoVHlwZSl7XHJcblx0XHRcdGlmKHR5cGVvZiAoVHlwZSkgIT09IFwiZnVuY3Rpb25cIiB8fCAhVHlwZS5pc19jcmVhdG9yKXtcclxuXHRcdFx0XHRpZihBcnJheS5pc0FycmF5KFR5cGUpKXtcclxuXHJcblx0XHRcdFx0XHRyZXR1cm4gVC5hcnIoVHlwZSk7XHJcblxyXG5cdFx0XHRcdH1lbHNlIGlmKHR5cGVvZihUeXBlKSA9PSBcIm9iamVjdFwiICYmIFR5cGUgIT09IG51bGwpe1xyXG5cclxuXHRcdFx0XHRcdHJldHVybiBULm9iaihUeXBlKTtcclxuXHJcblx0XHRcdFx0fWVsc2UgcmV0dXJuIFQuY29uc3QoVHlwZSk7XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdHJldHVybiBUeXBlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cclxuXHQvL0NyYWZ0IE51bWJlclxyXG5cdFx0dmFyIHJhbmROdW0gPSBmdW5jdGlvbihtYXgsIG1pbiwgcHJlY2lzKXtcclxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0cmV0dXJuICsoKChtYXggLSBtaW4pKk1hdGgucmFuZG9tKCkgKyAgbWluKS50b0ZpeGVkKHByZWNpcykpO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cclxuXHRcdHZhciB0ZXN0TnVtID0gZnVuY3Rpb24obWF4LCBtaW4sIHByZWNpcyl7XHJcblx0XHRcdHJldHVybiBmdW5jdGlvbihuKXtcclxuXHRcdFx0XHRpZih0eXBlb2YgbiAhPT0gJ251bWJlcicgfHwgIWlzRmluaXRlKG4pKXtcclxuXHRcdFx0XHRcdHJldHVybiB0aGlzLmRvYygpO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aWYoKG4gPiBtYXgpXHJcblx0XHRcdFx0XHR8fChuIDwgbWluKVxyXG5cdFx0XHRcdFx0fHwgKG4udG9GaXhlZChwcmVjaXMpICE9IG4gJiYgbiAhPT0gMCkgKXtcclxuXHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5kb2MoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHQgIH07XHJcblx0XHR9O1xyXG5cclxuXHRcdHZhciBkb2NOdW0gPSBmdW5jdGlvbihtYXgsIG1pbiwgcHJlY2lzKXtcclxuXHRcdFx0cmV0dXJuIERvYy5nZW5Eb2MuYmluZChudWxsLCBcIm51bVwiLCB7XCJtYXhcIjogbWF4LCBcIm1pblwiOiBtaW4sIFwicHJlY2lzXCI6IHByZWNpc30pO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBtYXhfZGVmX24gPSBEb2MuZ2V0Q29uc3QoJ251bScsICdtYXgnKTtcclxuXHRcdHZhciBtaW5fZGVmX24gPSBEb2MuZ2V0Q29uc3QoJ251bScsICdtaW4nKTtcclxuXHRcdHZhciBwcmVjaXNfZGVmID0gRG9jLmdldENvbnN0KCdudW0nLCAncHJlY2lzJyk7XHJcblxyXG5cdFx0dGhpcy5udW0gPSBuZXcgQ3JlYXRlQ3JlYXRvcihcclxuXHRcdFx0ZnVuY3Rpb24obWF4LCBtaW4sIHByZWNpcyl7XHJcblx0XHRcdFx0aWYobWF4ID09PSBudWxsKSBtYXggPSBtYXhfZGVmX247XHJcblx0XHRcdFx0aWYobWluID09PSB1bmRlZmluZWR8fG1pbiA9PT0gbnVsbCkgbWluID0gbWluX2RlZl9uO1xyXG5cdFx0XHRcdGlmKHByZWNpcyA9PT0gdW5kZWZpbmVkKSBwcmVjaXMgPSBwcmVjaXNfZGVmO1xyXG5cclxuXHRcdFx0XHRpZigodHlwZW9mIG1pbiAhPT0gJ251bWJlcicgfHwgIWlzRmluaXRlKG1pbikpXHJcblx0XHRcdFx0XHR8fCh0eXBlb2YgbWF4ICE9PSAnbnVtYmVyJyB8fCAhaXNGaW5pdGUobWF4KSlcclxuXHRcdFx0XHRcdHx8KHR5cGVvZiBwcmVjaXMgIT09ICdudW1iZXInIHx8ICFpc0Zpbml0ZShwcmVjaXMpKVxyXG5cdFx0XHRcdFx0fHwocHJlY2lzIDwgMClcclxuXHRcdFx0XHRcdHx8KHByZWNpcyA+IDkpXHJcblx0XHRcdFx0XHR8fChwcmVjaXMgJSAxICE9PSAwKSl7XHJcblx0XHRcdFx0XHR0aHJvdyBhcmdUeXBlRXJyb3IoYXJndW1lbnRzLCAnV2FpdCBhcmd1bWVudHM6IG1pbihudW1iZXIpLCBtYXgobnVtYmVyKSwgcHJlY2lzKDA8PW51bWJlcjw5KScpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZihtaW4gPiBtYXgpe1xyXG5cdFx0XHRcdFx0dmFyIHQgPSBtaW47XHJcblx0XHRcdFx0XHRtaW4gPSBtYXg7XHJcblx0XHRcdFx0XHRtYXggPSB0O1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRcdHRlc3Q6IHRlc3ROdW0obWF4LCBtaW4sIHByZWNpcyksXHJcblx0XHRcdFx0XHRyYW5kOiByYW5kTnVtKG1heCwgbWluLCBwcmVjaXMpLFxyXG5cdFx0XHRcdFx0ZG9jOiBkb2NOdW0obWF4LCBtaW4sIHByZWNpcylcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sXHJcblx0XHRcdHRlc3ROdW0obWF4X2RlZl9uLCBtaW5fZGVmX24sIHByZWNpc19kZWYpLFxyXG5cdFx0XHRyYW5kTnVtKG1heF9kZWZfbiwgbWluX2RlZl9uLCBwcmVjaXNfZGVmKSxcclxuXHRcdFx0ZG9jTnVtKG1heF9kZWZfbiwgbWluX2RlZl9uLCBwcmVjaXNfZGVmKVxyXG5cdFx0KTtcclxuXHJcblx0XHR2YXIgcmFuZEludCA9IGZ1bmN0aW9uKG1heCwgbWluLCBwcmVjaXMpe1xyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRyZXR1cm4gTWF0aC5mbG9vciggKChtYXggLSAobWluICsgMC4xKSkvcHJlY2lzKSpNYXRoLnJhbmRvbSgpICkgKiBwcmVjaXMgKyAgbWluO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cclxuXHRcdCB2YXIgdGVzdEludCA9IGZ1bmN0aW9uKG1heCwgbWluLCBwcmVjaXMpe1xyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24obil7XHJcblx0XHRcdFx0aWYodHlwZW9mIG4gIT09ICdudW1iZXInIHx8ICFpc0Zpbml0ZShuKSl7XHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5kb2MoKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlmKChuID49IG1heClcclxuXHRcdFx0XHRcdHx8KG4gPCBtaW4pXHJcblx0XHRcdFx0XHR8fCgoKG4gLSBtaW4pICUgcHJlY2lzKSAhPT0gMCkgKXtcclxuXHRcdFx0XHRcdHJldHVybiB0aGlzLmRvYygpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdCAgfTtcclxuXHRcdH07XHJcblxyXG5cdFx0dmFyIGRvY0ludCA9IGZ1bmN0aW9uKG1heCwgbWluLCBzdGVwKXtcclxuXHJcblx0XHRcdFx0cmV0dXJuIERvYy5nZW5Eb2MuYmluZChudWxsLCBcImludFwiLCB7XCJtYXhcIjogbWF4LCBcIm1pblwiOiBtaW4sIFwic3RlcFwiOiBzdGVwfSk7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBtYXhfZGVmID0gRG9jLmdldENvbnN0KCdpbnQnLCAnbWF4Jyk7XHJcblx0XHR2YXIgbWluX2RlZiA9IERvYy5nZXRDb25zdCgnaW50JywgJ21pbicpO1xyXG5cdFx0dmFyIHN0ZXBfZGVmID0gRG9jLmdldENvbnN0KCdpbnQnLCAnc3RlcCcpO1xyXG5cclxuXHRcdHRoaXMuaW50ID0gbmV3IENyZWF0ZUNyZWF0b3IoXHJcblx0XHRcdGZ1bmN0aW9uKG1heCwgbWluLCBzdGVwKXtcclxuXHJcblx0XHRcdFx0aWYobWF4ID09PSBudWxsKSBtYXggPSBtYXhfZGVmO1xyXG5cdFx0XHRcdGlmKG1pbiA9PT0gdW5kZWZpbmVkfHxtaW4gPT09IG51bGwpIG1pbiA9IG1pbl9kZWY7XHJcblx0XHRcdFx0aWYoc3RlcCA9PT0gdW5kZWZpbmVkKSBzdGVwID0gc3RlcF9kZWY7XHJcblxyXG5cdFx0XHRcdGlmKCh0eXBlb2YgbWluICE9PSAnbnVtYmVyJyB8fCAhaXNGaW5pdGUobWluKSlcclxuXHRcdFx0XHRcdHx8KHR5cGVvZiBtYXggIT09ICdudW1iZXInIHx8ICFpc0Zpbml0ZShtYXgpKVxyXG5cdFx0XHRcdFx0fHwoTWF0aC5yb3VuZChtaW4pICE9PSBtaW4pXHJcblx0XHRcdFx0XHR8fChNYXRoLnJvdW5kKG1heCkgIT09IG1heClcclxuXHRcdFx0XHRcdHx8KHN0ZXAgPD0gMClcclxuXHRcdFx0XHRcdHx8KE1hdGgucm91bmQoc3RlcCkgIT09IHN0ZXApKXtcclxuXHRcdFx0XHRcdHRocm93IGFyZ1R5cGVFcnJvcihhcmd1bWVudHMsICdXYWl0IGFyZ3VtZW50czogbWluKGludCksIG1heChpbnQpLCBzdGVwKGludD4wKScpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZihtaW4gPiBtYXgpe1xyXG5cdFx0XHRcdFx0dmFyIHQgPSBtaW47XHJcblx0XHRcdFx0XHRtaW4gPSBtYXg7XHJcblx0XHRcdFx0XHRtYXggPSB0O1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRcdHRlc3Q6IHRlc3RJbnQobWF4LCBtaW4sIHN0ZXApLFxyXG5cdFx0XHRcdFx0cmFuZDogcmFuZEludChtYXgsIG1pbiwgc3RlcCksXHJcblx0XHRcdFx0XHRkb2M6IGRvY0ludChtYXgsIG1pbiwgc3RlcClcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sXHJcblx0XHRcdHRlc3RJbnQobWF4X2RlZiwgbWluX2RlZiwgc3RlcF9kZWYpLFxyXG5cdFx0XHRyYW5kSW50KG1heF9kZWYsIG1pbl9kZWYsIHN0ZXBfZGVmKSxcclxuXHRcdFx0ZG9jSW50KG1heF9kZWYsIG1pbl9kZWYsIHN0ZXBfZGVmKVxyXG5cdFx0KTtcclxuXHJcblx0XHR2YXIgZG9jUG9zID0gZnVuY3Rpb24obWF4LCBtaW4sIHN0ZXApe1xyXG5cclxuXHRcdFx0XHRyZXR1cm4gRG9jLmdlbkRvYy5iaW5kKG51bGwsIFwicG9zXCIsIHtcIm1heFwiOiBtYXh9KTtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIG1heF9kZWZfcCA9IERvYy5nZXRDb25zdCgncG9zJywgJ21heCcpXHJcblx0XHR0aGlzLnBvcyA9IG5ldyBDcmVhdGVDcmVhdG9yKFxyXG5cdFx0XHRmdW5jdGlvbihtYXgpe1xyXG5cclxuXHRcdFx0XHRpZihtYXggPT09IG51bGwpIG1heCA9IG1heF9kZWZfcDtcclxuXHJcblx0XHRcdFx0aWYoKHR5cGVvZiBtYXggIT09ICdudW1iZXInIHx8ICFpc0Zpbml0ZShtYXgpKVxyXG5cdFx0XHRcdFx0fHwobWF4IDwgMCkpe1xyXG5cdFx0XHRcdFx0dGhyb3cgYXJnVHlwZUVycm9yKGFyZ3VtZW50cywgJ1dhaXQgYXJndW1lbnRzOiBtaW4ocG9zKSwgbWF4KHBvcyksIHN0ZXAocG9zPjApJyk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdFx0dGVzdDogdGVzdEludChtYXgsIDAsIDEpLFxyXG5cdFx0XHRcdFx0cmFuZDogcmFuZEludChtYXgsIDAsIDEpLFxyXG5cdFx0XHRcdFx0ZG9jOiBkb2NQb3MobWF4KVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSxcclxuXHRcdFx0dGVzdEludChtYXhfZGVmX3AsIDAsIDEpLFxyXG5cdFx0XHRyYW5kSW50KG1heF9kZWZfcCwgMCwgMSksXHJcblx0XHRcdGRvY1BvcyhtYXhfZGVmX3ApXHJcblx0XHQpO1xyXG5cclxuXHJcblxyXG5cclxuXHJcbiAgLy9DcmFmdCBBbnlcclxuXHRcdGZ1bmN0aW9uIHJhbmRBbnkoYXJyKXtcclxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0cmV0dXJuIGFyci5yYW5kX2koKS5yYW5kKCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiB0ZXN0QW55KGFycil7XHJcblx0XHRcdHJldHVybiBmdW5jdGlvbih2YWwpe1xyXG5cdFx0XHRcdGlmKGFyci5ldmVyeShmdW5jdGlvbihpKXtyZXR1cm4gaS50ZXN0KHZhbCl9KSl7XHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5kb2MoKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGRvY0FueShUeXBlcyl7XHJcblxyXG5cdFx0XHR2YXIgY29udCA9IFR5cGVzLmxlbmd0aDtcclxuXHRcdFx0dmFyIHR5cGVfZG9jcyA9IFtdO1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgY29udDsgaSsrKXtcclxuXHRcdFx0XHR0eXBlX2RvY3MucHVzaChUeXBlc1tpXS5kb2MoKSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBEb2MuZ2VuRG9jLmJpbmQobnVsbCwgXCJhbnlcIiwge3R5cGVzOiB0eXBlX2RvY3N9KTtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgZGVmX3R5cGVzID0gRG9jLmdldENvbnN0KCdhcnInLCAndHlwZXMnKTtcclxuXHRcdGZ1bmN0aW9uIG5ld0FueShhcnIpe1xyXG5cdFx0XHRpZighQXJyYXkuaXNBcnJheShhcnIpIHx8IGFyZ3VtZW50cy5sZW5ndGggPiAxKSBhcnIgPSBhcmd1bWVudHM7XHJcblxyXG5cdFx0XHR2YXIgbGVuID0gYXJyLmxlbmd0aDtcclxuXHRcdFx0dmFyIGFycl90eXBlcyA9IFtdO1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspe1xyXG5cdFx0XHRcdGFycl90eXBlc1tpXSA9IHRDb25zdChhcnJbaV0pO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm57XHJcblx0XHRcdFx0dGVzdDogdGVzdEFueShhcnJfdHlwZXMpLFxyXG5cdFx0XHRcdHJhbmQ6IHJhbmRBbnkoYXJyX3R5cGVzKSxcclxuXHRcdFx0XHRkb2M6IGRvY0FueShhcnJfdHlwZXMpXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLmFueSA9IG5ldyBDcmVhdGVDcmVhdG9yKFxyXG5cdFx0XHRuZXdBbnksXHJcblx0XHRcdHRlc3RBbnkoZGVmX3R5cGVzKSxcclxuXHRcdFx0cmFuZEFueShkZWZfdHlwZXMpLFxyXG5cdFx0XHRkb2NBbnkoZGVmX3R5cGVzKVxyXG5cdFx0KTtcclxuXHJcblxyXG5cclxuXHQvL0NyYWZ0IEFycmF5XHJcblxyXG5cclxuXHJcblx0XHRmdW5jdGlvbiByYW5kQXJyYXkoVHlwZSwgc2l6ZSwgaXNfZml4ZWQpe1xyXG5cdFx0XHR2YXIgcmFuZFNpemUgPSBmdW5jdGlvbiAoKXtyZXR1cm4gc2l6ZX07XHJcblx0XHRcdGlmKCFpc19maXhlZCl7XHJcblx0XHRcdFx0cmFuZFNpemUgPSBULnBvcyhzaXplKS5yYW5kO1xyXG5cdFx0XHR9XHJcblxyXG5cclxuXHRcdFx0aWYoQXJyYXkuaXNBcnJheShUeXBlKSl7XHJcblx0XHRcdFx0dmFyIG5vd19zaXplID0gcmFuZFNpemUoKTtcclxuXHJcblx0XHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHR2YXIgYXJyID0gW107XHJcblxyXG5cdFx0XHRcdFx0Zm9yKHZhciBpID0gMCwgaiA9IDA7IGkgPCBub3dfc2l6ZTsgaSsrKXtcclxuXHJcblx0XHRcdFx0XHRcdGFyci5wdXNoKFR5cGVbal0ucmFuZCgpKTtcclxuXHJcblx0XHRcdFx0XHRcdGorKztcclxuXHRcdFx0XHRcdFx0aWYoaiA+PSBUeXBlLmxlbmd0aCl7XHJcblx0XHRcdFx0XHRcdFx0aiA9IDA7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHJldHVybiBhcnI7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cclxuXHJcblx0XHRcdHJldHVybiBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdHZhciBhcnIgPSBbXTtcclxuXHJcblx0XHRcdFx0dmFyIG5vd19zaXplID0gcmFuZFNpemUoKTtcclxuXHRcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbm93X3NpemU7IGkrKyl7XHJcblx0XHRcdFx0XHRhcnIucHVzaChUeXBlLnJhbmQoaSwgYXJyKSk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRyZXR1cm4gYXJyO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIHRlc3RBcnJheShUeXBlLCBzaXplLCBpc19maXhlZCl7XHJcblxyXG5cdFx0XHRpZihBcnJheS5pc0FycmF5KFR5cGUpKXtcclxuXHRcdFx0XHRyZXR1cm4gZnVuY3Rpb24oYXJyKXtcclxuXHJcblx0XHRcdFx0XHRpZighQXJyYXkuaXNBcnJheShhcnIpKXtcclxuXHRcdFx0XHRcdFx0dmFyIGVyciA9IHRoaXMuZG9jKCk7XHJcblx0XHRcdFx0XHRcdGVyci5wYXJhbXMgPSBcIlZhbHVlIGlzIG5vdCBhcnJheSFcIjtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIGVycjtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRpZigoYXJyLmxlbmd0aCA+IHNpemUpIHx8IChpc19maXhlZCAmJiAoYXJyLmxlbmd0aCAhPT0gc2l6ZSkpKXtcclxuXHRcdFx0XHRcdFx0dmFyIGVyciA9IHRoaXMuZG9jKCk7XHJcblx0XHRcdFx0XHRcdGVyci5wYXJhbXMgPSBcIkFycmF5IGxlbmdodCBpcyB3cm9uZyFcIjtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIGVycjtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRmb3IodmFyIGkgPSAwLCBqID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKyl7XHJcblxyXG5cdFx0XHRcdFx0XHRcdHZhciByZXMgPSBUeXBlW2pdLnRlc3QoYXJyW2ldKTtcclxuXHRcdFx0XHRcdFx0XHRpZihyZXMpe1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR2YXIgZXJyID0gdGhpcy5kb2MoKTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0ZXJyLnBhcmFtcyA9IHtpbmRleDogaSwgd3JvbmdfaXRlbTogcmVzfTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGVycjtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRcdGorKztcclxuXHRcdFx0XHRcdFx0XHRpZihqID49IFR5cGUubGVuZ3RoKXtcclxuXHRcdFx0XHRcdFx0XHRcdGogPSAwO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oYXJyKXtcclxuXHRcdFx0XHRpZighQXJyYXkuaXNBcnJheShhcnIpKXtcclxuXHRcdFx0XHRcdHZhciBlcnIgPSB0aGlzLmRvYygpO1xyXG5cdFx0XHRcdFx0ZXJyLnBhcmFtcyA9IFwiVmFsdWUgaXMgbm90IGFycmF5IVwiO1xyXG5cdFx0XHRcdFx0cmV0dXJuIGVycjtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlmKChhcnIubGVuZ3RoID4gc2l6ZSkgfHwgKGlzX2ZpeGVkICYmIChhcnIubGVuZ3RoICE9PSBzaXplKSkpe1xyXG5cdFx0XHRcdFx0Y29uc29sZS5sb2coYXJyLmxlbmd0aCwgc2l6ZSlcclxuXHRcdFx0XHRcdHZhciBlcnIgPSB0aGlzLmRvYygpO1xyXG5cdFx0XHRcdFx0ZXJyLnBhcmFtcyA9IFwiQXJyYXk6IGxlbmdodCBpcyB3cm9uZyFcIjtcclxuXHRcdFx0XHRcdHJldHVybiBlcnI7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHR2YXIgZXJyX2FyciA9IGFyci5maWx0ZXIoVHlwZS50ZXN0KTtcclxuXHRcdFx0XHRpZihlcnJfYXJyLmxlbmd0aCAhPSAwKXtcclxuXHRcdFx0XHRcdHZhciBlcnIgPSB0aGlzLmRvYygpO1xyXG5cdFx0XHRcdFx0ZXJyLnBhcmFtcyA9IGVycl9hcnI7XHJcblx0XHRcdFx0XHRyZXR1cm4gZXJyO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gZG9jQXJyYXkoVHlwZSwgc2l6ZSwgaXNfZml4ZWQpe1xyXG5cdFx0XHR2YXIgdHlwZV9kb2NzID0gW107XHJcblx0XHRcdGlmKEFycmF5LmlzQXJyYXkoVHlwZSkpe1xyXG5cdFx0XHRcdHZhciBjb250ID0gVHlwZS5sZW5ndGg7XHJcblx0XHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGNvbnQ7IGkrKyl7XHJcblx0XHRcdFx0XHR0eXBlX2RvY3MucHVzaChUeXBlW2ldLmRvYygpKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdHR5cGVfZG9jcyA9IFR5cGUuZG9jKCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBEb2MuZ2VuRG9jLmJpbmQobnVsbCwgXCJhcnJcIiwge3R5cGVzOiB0eXBlX2RvY3MsIHNpemU6IHNpemUsIGZpeGVkOiBpc19maXhlZH0pO1xyXG5cclxuXHRcdH1cclxuXHJcblxyXG5cdFx0dmFyIGRlZl9UeXBlID0gRG9jLmdldENvbnN0KCdhcnInLCAndHlwZXMnKTtcclxuXHRcdHZhciBkZWZfU2l6ZSA9IERvYy5nZXRDb25zdCgnYXJyJywgJ3NpemUnKTtcclxuXHRcdHZhciBkZWZfZml4ZWQgPSBEb2MuZ2V0Q29uc3QoJ2FycicsICdmaXhlZCcpO1xyXG5cclxuXHRcdGZ1bmN0aW9uIG5ld0FycmF5KFR5cGUsIHNpemUsIGlzX2ZpeGVkKXtcclxuXHRcdFx0aWYoVHlwZSA9PT0gbnVsbCkgVHlwZSA9IGRlZl9UeXBlO1xyXG5cdFx0XHRpZihpc19maXhlZCA9PT0gdW5kZWZpbmVkKSBpc19maXhlZCA9IGRlZl9maXhlZDtcclxuXHJcblx0XHRcdGlmKEFycmF5LmlzQXJyYXkoVHlwZSkpe1xyXG5cdFx0XHRcdGlmKHNpemUgPT09IHVuZGVmaW5lZHx8c2l6ZSA9PT0gbnVsbCkgc2l6ZSA9IFR5cGUubGVuZ3RoO1xyXG5cclxuXHRcdFx0XHRUeXBlID0gVHlwZS5tYXAoZnVuY3Rpb24oaXRlbSl7cmV0dXJuIHRDb25zdChpdGVtKTt9KTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0aWYoc2l6ZSA9PT0gdW5kZWZpbmVkfHxzaXplID09PSBudWxsKSBzaXplID0gMTtcclxuXHRcdFx0XHRUeXBlID0gdENvbnN0KFR5cGUpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZihULnBvcy50ZXN0KHNpemUpKXtcclxuXHRcdFx0XHRcdHRocm93IGFyZ1R5cGVFcnJvcihhcmd1bWVudHMsICdXYWl0IGFyZ3VtZW50czogJyArIEpTT04uc3RyaW5naWZ5KFQucG9zLnRlc3Qoc2l6ZSkpKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHR0ZXN0OiB0ZXN0QXJyYXkoVHlwZSwgc2l6ZSwgaXNfZml4ZWQpLFxyXG5cdFx0XHRcdHJhbmQ6IHJhbmRBcnJheShUeXBlLCBzaXplLCBpc19maXhlZCksXHJcblx0XHRcdFx0ZG9jOiBkb2NBcnJheShUeXBlLCBzaXplLCBpc19maXhlZClcclxuXHRcdFx0fTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLmFyciA9IG5ldyBDcmVhdGVDcmVhdG9yKFxyXG5cdFx0XHRuZXdBcnJheSxcclxuXHRcdFx0dGVzdEFycmF5KGRlZl9UeXBlLCBkZWZfU2l6ZSwgZGVmX2ZpeGVkKSxcclxuXHRcdFx0cmFuZEFycmF5KGRlZl9UeXBlLCBkZWZfU2l6ZSwgZGVmX2ZpeGVkKSxcclxuXHRcdFx0ZG9jQXJyYXkoZGVmX1R5cGUsIGRlZl9TaXplLCBkZWZfZml4ZWQpXHJcblx0XHQpO1xyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHQvL0NyYWZ0IE9iamVjdFxyXG5cclxuXHRcdGZ1bmN0aW9uIHJhbmRPYmooZnVuY09iail7XHJcblx0XHRcdHJldHVybiBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdHZhciBvYmogPSB7fTtcclxuXHRcdFx0XHRmb3IodmFyIGtleSBpbiBmdW5jT2JqKXtcclxuXHRcdFx0XHRcdG9ialtrZXldID0gZnVuY09ialtrZXldLnJhbmQoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0cmV0dXJuIG9iajtcclxuXHRcdFx0fTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiB0ZXN0T2JqKGZ1bmNPYmope1xyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24ob2JqKXtcclxuXHJcblx0XHRcdFx0aWYodHlwZW9mIG9iaiAhPT0gXCJvYmplY3RcIiAmJiBvYmogPT09IG51bGwpe1xyXG5cdFx0XHRcdFx0dmFyIGVyciA9IHRoaXMuZG9jKCk7XHJcblx0XHRcdFx0XHRlcnIucGFyYW1zID0gXCJWYWx1ZSBpcyBub3Qgb2JqZWN0IVwiO1xyXG5cdFx0XHRcdFx0cmV0dXJuIGVycjtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGZvcih2YXIga2V5IGluIGZ1bmNPYmope1xyXG5cdFx0XHRcdFx0dmFyIHJlcyA9IGZ1bmNPYmpba2V5XS50ZXN0KG9ialtrZXldKTtcclxuXHRcdFx0XHRcdGlmKHJlcyl7XHJcblx0XHRcdFx0XHRcdHZhciBlcnIgPSB0aGlzLmRvYygpO1xyXG5cdFx0XHRcdFx0XHRlcnIucGFyYW1zID0ge307XHJcblx0XHRcdFx0XHRcdGVyci5wYXJhbXNba2V5XSA9IHJlcztcclxuXHRcdFx0XHRcdFx0cmV0dXJuIGVycjtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBkb2NPYihmdW5jT2JqKXtcclxuXHRcdFx0dmFyIGRvY19vYmogPSB7fTtcclxuXHJcblx0XHRcdGZvcih2YXIga2V5IGluIGZ1bmNPYmope1xyXG5cdFx0XHRcdFx0ZG9jX29ialtrZXldID0gZnVuY09ialtrZXldLmRvYygpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gRG9jLmdlbkRvYy5iaW5kKG51bGwsIFwib2JqXCIsIHt0eXBlczogZG9jX29ian0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIE5ld09iaih0ZW1wT2JqKXtcclxuXHRcdFx0aWYodHlwZW9mIHRlbXBPYmogIT09ICdvYmplY3QnKSB0aHJvdyBhcmdUeXBlRXJyb3IoYXJndW1lbnRzLCAnV2FpdCBhcmd1bWVudHM6IHRlbXBPYmooT2JqZWN0KScpO1xyXG5cclxuXHRcdFx0dmFyIGJlZ09iaiA9IHt9O1xyXG5cdFx0XHR2YXIgZnVuY09iaiA9IHt9O1xyXG5cdFx0XHRmb3IodmFyIGtleSBpbiB0ZW1wT2JqKXtcclxuXHRcdFx0XHRmdW5jT2JqW2tleV0gPSB0Q29uc3QodGVtcE9ialtrZXldKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJue1xyXG5cdFx0XHRcdHRlc3Q6IHRlc3RPYmooZnVuY09iaiksXHJcblx0XHRcdFx0cmFuZDogcmFuZE9iaihmdW5jT2JqKSxcclxuXHRcdFx0XHRkb2M6IGRvY09iKGZ1bmNPYmopXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHRoaXMub2JqID0gbmV3IENyZWF0ZUNyZWF0b3IoTmV3T2JqLFxyXG5cdFx0XHRmdW5jdGlvbihvYmope3JldHVybiB0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwifSxcclxuXHRcdFx0cmFuZE9iaih7fSksXHJcblx0XHRcdERvYy5nZW5Eb2MuYmluZChudWxsLCBcIm9ialwiKVxyXG5cdFx0KTtcclxuXHJcblxyXG5cclxuXHJcblxyXG4vL0NyYWZ0IFR5cGUgb3V0IHRvICBEb2N1bWVudFxyXG5cclxuXHRULm5hbWVzID0ge307XHJcblx0Zm9yKHZhciBrZXkgaW4gRG9jLnR5cGVzKXtcclxuXHRcdFQubmFtZXNbRG9jLnR5cGVzW2tleV0ubmFtZV0gPSBrZXk7XHJcblx0fVxyXG5cclxuXHR0aGlzLm91dERvYyA9IGZ1bmN0aW9uKHRtcCl7XHJcblx0XHRpZigodHlwZW9mIHRtcCA9PT0gXCJmdW5jdGlvblwiKSAmJiB0bXAuaXNfY3JlYXRvcikgcmV0dXJuIHRtcDtcclxuXHJcblx0XHRpZighKCduYW1lJyBpbiB0bXApKXtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCk7XHJcblx0XHR9XHJcblx0XHR2YXIgdHlwZSA9IHRtcC5uYW1lO1xyXG5cclxuXHRcdGlmKCdwYXJhbXMnIGluIHRtcCl7XHJcblx0XHRcdHZhciBwYXJhbXMgPSB0bXAucGFyYW1zO1xyXG5cdFx0XHRzd2l0Y2goVC5uYW1lc1t0eXBlXSl7XHJcblx0XHRcdFx0Y2FzZSAnb2JqJzoge1xyXG5cdFx0XHRcdFx0dmFyIG5ld19vYmogPSB7fTtcclxuXHRcdFx0XHRcdGZvcih2YXIga2V5IGluIHBhcmFtcy50eXBlcyl7XHJcblx0XHRcdFx0XHRcdG5ld19vYmpba2V5XSA9IFQub3V0RG9jKHBhcmFtcy50eXBlc1trZXldKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHBhcmFtcy50eXBlcyA9IG5ld19vYmo7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Y2FzZSAnYW55JzpcclxuXHRcdFx0XHRjYXNlICdhcnInOiB7XHJcblx0XHRcdFx0XHRpZihBcnJheS5pc0FycmF5KHBhcmFtcy50eXBlcykpe1xyXG5cdFx0XHRcdFx0XHRwYXJhbXMudHlwZXMgPSBwYXJhbXMudHlwZXMubWFwKFQub3V0RG9jLmJpbmQoVCkpO1xyXG5cdFx0XHRcdFx0fWVsc2UgcGFyYW1zLnR5cGVzID0gVC5vdXREb2MocGFyYW1zLnR5cGVzKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIGdldFNpbXBsZVR5cGUoVC5uYW1lc1t0eXBlXSwgcGFyYW1zKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBnZXRTaW1wbGVUeXBlKFQubmFtZXNbdHlwZV0sIHt9KTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGdldFNpbXBsZVR5cGUobmFtZSwgcGFyYW1zKXtcclxuXHRcdHZhciBhcmcgPSBbXTtcclxuXHRcdERvYy50eXBlc1tuYW1lXS5hcmcuZm9yRWFjaChmdW5jdGlvbihrZXksIGkpe2FyZ1tpXSA9IHBhcmFtc1trZXldO30pO1xyXG5cdFx0cmV0dXJuIFRbbmFtZV0uYXBwbHkoVCwgYXJnKTtcclxuXHR9O1xyXG5cclxuLy9TdXBwb3J0IERlY2xhcmF0ZSBGdW5jdGlvblxyXG5cclxuXHRmdW5jdGlvbiBmaW5kZVBhcnNlKHN0ciwgYmVnLCBlbmQpe1xyXG5cdFx0dmFyIHBvaW50X2JlZyA9IHN0ci5pbmRleE9mKGJlZyk7XHJcblx0XHRpZih+cG9pbnRfYmVnKXtcclxuXHJcblx0XHRcdHZhciBwb2ludF9lbmQgPSBwb2ludF9iZWc7XHJcblx0XHRcdHZhciBwb2ludF90ZW1wID0gcG9pbnRfYmVnO1xyXG5cdFx0XHR2YXIgbGV2ZWwgPSAxO1xyXG5cdFx0XHR2YXIgYnJlYWtXaGlsZSA9IGZhbHNlO1xyXG5cdFx0XHR3aGlsZSghYnJlYWtXaGlsZSl7XHJcblx0XHRcdFx0YnJlYWtXaGlsZSA9IHRydWU7XHJcblxyXG5cdFx0XHRcdGlmKH5wb2ludF90ZW1wKSBwb2ludF90ZW1wID0gc3RyLmluZGV4T2YoYmVnLCBwb2ludF90ZW1wICsgMSk7XHJcblx0XHRcdFx0aWYofnBvaW50X2VuZCkgcG9pbnRfZW5kID0gc3RyLmluZGV4T2YoZW5kLCBwb2ludF9lbmQgKyAxKTtcclxuXHJcblx0XHRcdFx0aWYocG9pbnRfdGVtcCA8IHBvaW50X2VuZCl7XHJcblxyXG5cdFx0XHRcdFx0aWYocG9pbnRfdGVtcCA+IDApe1xyXG5cdFx0XHRcdFx0XHRicmVha1doaWxlID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdGlmKHN0cltwb2ludF90ZW1wIC0gMV0gIT09ICdcXFxcJykgbGV2ZWwgPSBsZXZlbCsxO1xyXG5cclxuXHRcdFx0XHRcdH1cclxuXHJcblxyXG5cdFx0XHRcdFx0aWYocG9pbnRfZW5kID4gMCl7XHJcblx0XHRcdFx0XHRcdGJyZWFrV2hpbGUgPSBmYWxzZTtcclxuXHRcdFx0XHRcdFx0aWYoc3RyW3BvaW50X2VuZCAtIDFdICE9PSAnXFxcXCcpIGxldmVsID0gbGV2ZWwtMTtcclxuXHRcdFx0XHRcdFx0aWYobGV2ZWwgPT0gMCl7XHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuIFtwb2ludF9iZWcsIHBvaW50X2VuZF07XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdGlmKHBvaW50X2VuZCA+IDApe1xyXG5cdFx0XHRcdFx0XHRicmVha1doaWxlID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdGlmKHN0cltwb2ludF9lbmQgLSAxXSAhPT0gJ1xcXFwnKSBsZXZlbCA9IGxldmVsLTE7XHJcblx0XHRcdFx0XHRcdGlmKGxldmVsID09IDApe1xyXG5cdFx0XHRcdFx0XHRcdHJldHVybiBbcG9pbnRfYmVnLCBwb2ludF9lbmRdO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0aWYocG9pbnRfdGVtcCA+IDApe1xyXG5cdFx0XHRcdFx0XHRicmVha1doaWxlID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdGlmKHN0cltwb2ludF90ZW1wIC0gMV0gIT09ICdcXFxcJykgbGV2ZWwgPSBsZXZlbCsxO1xyXG5cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblxyXG5cdE9iamVjdC50eXBlcyA9IFQ7XHJcbn0pKCk7XHJcbiIsIm1vZHVsZS5leHBvcnRzPXtcbiBcInRpbGVzXCI6IFtcbiAge1xuICAgXCJ0eXBlXCI6IFwic3ZnXCIsXG4gICBcImltZ1wiOiBcImRhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsUEQ5NGJXd2dkbVZ5YzJsdmJqMGlNUzR3SWlCbGJtTnZaR2x1WnowaVZWUkdMVGdpSUhOMFlXNWtZV3h2Ym1VOUltNXZJajgrQ2p3aExTMGdRM0psWVhSbFpDQjNhWFJvSUVsdWEzTmpZWEJsSUNob2RIUndPaTh2ZDNkM0xtbHVhM05qWVhCbExtOXlaeThwSUMwdFBnb0tQSE4yWndvZ0lDQjRiV3h1Y3pwa1l6MGlhSFIwY0RvdkwzQjFjbXd1YjNKbkwyUmpMMlZzWlcxbGJuUnpMekV1TVM4aUNpQWdJSGh0Ykc1ek9tTmpQU0pvZEhSd09pOHZZM0psWVhScGRtVmpiMjF0YjI1ekxtOXlaeTl1Y3lNaUNpQWdJSGh0Ykc1ek9uSmtaajBpYUhSMGNEb3ZMM2QzZHk1M015NXZjbWN2TVRrNU9TOHdNaTh5TWkxeVpHWXRjM2x1ZEdGNExXNXpJeUlLSUNBZ2VHMXNibk02YzNablBTSm9kSFJ3T2k4dmQzZDNMbmN6TG05eVp5OHlNREF3TDNOMlp5SUtJQ0FnZUcxc2JuTTlJbWgwZEhBNkx5OTNkM2N1ZHpNdWIzSm5Mekl3TURBdmMzWm5JZ29nSUNCNGJXeHVjenB6YjJScGNHOWthVDBpYUhSMGNEb3ZMM052Wkdsd2IyUnBMbk52ZFhKalpXWnZjbWRsTG01bGRDOUVWRVF2YzI5a2FYQnZaR2t0TUM1a2RHUWlDaUFnSUhodGJHNXpPbWx1YTNOallYQmxQU0pvZEhSd09pOHZkM2QzTG1sdWEzTmpZWEJsTG05eVp5OXVZVzFsYzNCaFkyVnpMMmx1YTNOallYQmxJZ29nSUNCM2FXUjBhRDBpTVRBeU5HMXRJZ29nSUNCb1pXbG5hSFE5SWpVeE1tMXRJZ29nSUNCMmFXVjNRbTk0UFNJd0lEQWdNVEF5TkNBMU1USWlDaUFnSUhabGNuTnBiMjQ5SWpFdU1TSUtJQ0FnYVdROUluTjJaemd5TWpZaUNpQWdJR2x1YTNOallYQmxPblpsY25OcGIyNDlJakF1T1RJdU1pQW9OV016WlRnd1pDd2dNakF4Tnkwd09DMHdOaWtpQ2lBZ0lITnZaR2x3YjJScE9tUnZZMjVoYldVOUltUnlZWGRwYm1jdWMzWm5JajRLSUNBOFpHVm1jd29nSUNBZ0lHbGtQU0prWldaek9ESXlNQ0lnTHo0S0lDQThjMjlrYVhCdlpHazZibUZ0WldSMmFXVjNDaUFnSUNBZ2FXUTlJbUpoYzJVaUNpQWdJQ0FnY0dGblpXTnZiRzl5UFNJalptWm1abVptSWdvZ0lDQWdJR0p2Y21SbGNtTnZiRzl5UFNJak5qWTJOalkySWdvZ0lDQWdJR0p2Y21SbGNtOXdZV05wZEhrOUlqRXVNQ0lLSUNBZ0lDQnBibXR6WTJGd1pUcHdZV2RsYjNCaFkybDBlVDBpTUM0d0lnb2dJQ0FnSUdsdWEzTmpZWEJsT25CaFoyVnphR0ZrYjNjOUlqSWlDaUFnSUNBZ2FXNXJjMk5oY0dVNmVtOXZiVDBpTUM0d09EZ3pPRGd6TkRnaUNpQWdJQ0FnYVc1cmMyTmhjR1U2WTNnOUlqRTBNVEF1TXpJeE5TSUtJQ0FnSUNCcGJtdHpZMkZ3WlRwamVUMGlNakV4TGpnME9UUXpJZ29nSUNBZ0lHbHVhM05qWVhCbE9tUnZZM1Z0Wlc1MExYVnVhWFJ6UFNKdGJTSUtJQ0FnSUNCcGJtdHpZMkZ3WlRwamRYSnlaVzUwTFd4aGVXVnlQU0pzWVhsbGNqRWlDaUFnSUNBZ2MyaHZkMmR5YVdROUltWmhiSE5sSWdvZ0lDQWdJR2x1YTNOallYQmxPbmRwYm1SdmR5MTNhV1IwYUQwaU1UTTJOaUlLSUNBZ0lDQnBibXR6WTJGd1pUcDNhVzVrYjNjdGFHVnBaMmgwUFNJM01EVWlDaUFnSUNBZ2FXNXJjMk5oY0dVNmQybHVaRzkzTFhnOUlpMDRJZ29nSUNBZ0lHbHVhM05qWVhCbE9uZHBibVJ2ZHkxNVBTSXRPQ0lLSUNBZ0lDQnBibXR6WTJGd1pUcDNhVzVrYjNjdGJXRjRhVzFwZW1Wa1BTSXhJaUF2UGdvZ0lEeHRaWFJoWkdGMFlRb2dJQ0FnSUdsa1BTSnRaWFJoWkdGMFlUZ3lNak1pUGdvZ0lDQWdQSEprWmpwU1JFWStDaUFnSUNBZ0lEeGpZenBYYjNKckNpQWdJQ0FnSUNBZ0lISmtaanBoWW05MWREMGlJajRLSUNBZ0lDQWdJQ0E4WkdNNlptOXliV0YwUG1sdFlXZGxMM04yWnl0NGJXdzhMMlJqT21admNtMWhkRDRLSUNBZ0lDQWdJQ0E4WkdNNmRIbHdaUW9nSUNBZ0lDQWdJQ0FnSUhKa1pqcHlaWE52ZFhKalpUMGlhSFIwY0RvdkwzQjFjbXd1YjNKbkwyUmpMMlJqYldsMGVYQmxMMU4wYVd4c1NXMWhaMlVpSUM4K0NpQWdJQ0FnSUNBZ1BHUmpPblJwZEd4bFBqd3ZaR002ZEdsMGJHVStDaUFnSUNBZ0lEd3ZZMk02VjI5eWF6NEtJQ0FnSUR3dmNtUm1PbEpFUmo0S0lDQThMMjFsZEdGa1lYUmhQZ29nSUR4bkNpQWdJQ0FnYVc1cmMyTmhjR1U2YkdGaVpXdzlJa3hoZVdWeUlERWlDaUFnSUNBZ2FXNXJjMk5oY0dVNlozSnZkWEJ0YjJSbFBTSnNZWGxsY2lJS0lDQWdJQ0JwWkQwaWJHRjVaWEl4SWdvZ0lDQWdJSFJ5WVc1elptOXliVDBpZEhKaGJuTnNZWFJsS0RBc01qRTFLU0krQ2lBZ0lDQThad29nSUNBZ0lDQWdhV1E5SW1jNU5EZ3hJZ29nSUNBZ0lDQWdkSEpoYm5ObWIzSnRQU0p0WVhSeWFYZ29NU3d3TERBc01TNHdNVEUyTXpFNUxEQXNNaTQxTVRBNE16TTRLU0krQ2lBZ0lDQWdJRHhuQ2lBZ0lDQWdJQ0FnSUdsa1BTSk1ZWGxsY2pFd05qUWlDaUFnSUNBZ0lDQWdJSFJ5WVc1elptOXliVDBpYldGMGNtbDRLREF1TkRVeU5qRXpOeklzTUN3d0xEQXVORFV6T1RJNE5Dd3lPRFkzTGpNd05UY3NNemcyTlM0eE1ESTVLU0krQ2lBZ0lDQWdJQ0FnUEhCaGRHZ0tJQ0FnSUNBZ0lDQWdJQ0JwYm10elkyRndaVHBqYjI1dVpXTjBiM0l0WTNWeWRtRjBkWEpsUFNJd0lnb2dJQ0FnSUNBZ0lDQWdJR2xrUFNKd1lYUm9OelU1T0NJS0lDQWdJQ0FnSUNBZ0lDQnpkSGxzWlQwaVptbHNiRG9qTlRJMU1qVXlPMlpwYkd3dGNuVnNaVHBsZG1WdWIyUmtJZ29nSUNBZ0lDQWdJQ0FnSUdROUltMGdMVFV4T1RndU9UZ3pOQ3d0T0RrNU1DNHpNVFk1SUhZZ01URXpNeTQ0TlRneklHZ2dMVEV4TXpNdU9EVTRNaUIySUMweE1UTXpMamcxT0RNZ2VpSWdMejRLSUNBZ0lDQWdJQ0E4Y0dGMGFBb2dJQ0FnSUNBZ0lDQWdJR2x1YTNOallYQmxPbU52Ym01bFkzUnZjaTFqZFhKMllYUjFjbVU5SWpBaUNpQWdJQ0FnSUNBZ0lDQWdhV1E5SW5CaGRHZzNOakF3SWdvZ0lDQWdJQ0FnSUNBZ0lITjBlV3hsUFNKbWFXeHNPaU5rTW1ReFpESTdabWxzYkMxeWRXeGxPbVYyWlc1dlpHUWlDaUFnSUNBZ0lDQWdJQ0FnWkQwaWJTQXROVE01Tmk0MU56VTVMQzAzT0RVMkxqUTFPRFlnZGlBdE1URXpNeTQ0TlRneklHZ2dNVGszTGpVNU1qVWdkaUF4TVRNekxqZzFPRE1nZWlJZ0x6NEtJQ0FnSUNBZ0lDQThjR0YwYUFvZ0lDQWdJQ0FnSUNBZ0lHbHVhM05qWVhCbE9tTnZibTVsWTNSdmNpMWpkWEoyWVhSMWNtVTlJakFpQ2lBZ0lDQWdJQ0FnSUNBZ2FXUTlJbkJoZEdnM05qQXlJZ29nSUNBZ0lDQWdJQ0FnSUhOMGVXeGxQU0ptYVd4c09pTTFNalV5TlRJN1ptbHNiQzF5ZFd4bE9tVjJaVzV2WkdRaUNpQWdJQ0FnSUNBZ0lDQWdaRDBpYlNBdE5UUTBOeTQyTVRBMkxDMDROVGswTGpNM09EWWdhQ0F5TkRndU5qSTNNaUIySURNNU5pNDROVEE1SUdnZ0xUSTBPQzQyTWpjeUlIb2lJQzgrQ2lBZ0lDQWdJRHd2Wno0S0lDQWdJQ0FnUEdjS0lDQWdJQ0FnSUNBZ2FXUTlJa3hoZVdWeU1UQTJOU0lLSUNBZ0lDQWdJQ0FnZEhKaGJuTm1iM0p0UFNKdFlYUnlhWGdvTUM0ME5EazFNakk1TWl3d0xEQXNNQzQwTlRNNU1qZzBMREk0TlRFdU16TTRNaXd6T0RZMUxqRXdNamtwSWo0S0lDQWdJQ0FnSUNBOGNHRjBhQW9nSUNBZ0lDQWdJQ0FnSUdsdWEzTmpZWEJsT21OdmJtNWxZM1J2Y2kxamRYSjJZWFIxY21VOUlqQWlDaUFnSUNBZ0lDQWdJQ0FnYVdROUluQmhkR2czTmpBMUlnb2dJQ0FnSUNBZ0lDQWdJSE4wZVd4bFBTSm1hV3hzT2lNMU1qVXlOVEk3Wm1sc2JDMXlkV3hsT21WMlpXNXZaR1FpQ2lBZ0lDQWdJQ0FnSUNBZ1pEMGliU0F0TlRFNU9TNHlNRGt6TEMwNE9Ua3dMak14TmprZ2RpQXhNVE16TGpnMU9ETWdhQ0F4TVRNekxqZzFPRE1nZGlBdE1URXpNeTQ0TlRneklIb2lJQzgrQ2lBZ0lDQWdJQ0FnUEhCaGRHZ0tJQ0FnSUNBZ0lDQWdJQ0JwYm10elkyRndaVHBqYjI1dVpXTjBiM0l0WTNWeWRtRjBkWEpsUFNJd0lnb2dJQ0FnSUNBZ0lDQWdJR2xrUFNKd1lYUm9Oell3TnlJS0lDQWdJQ0FnSUNBZ0lDQnpkSGxzWlQwaVptbHNiRG9qWkRKa01XUXlPMlpwYkd3dGNuVnNaVHBsZG1WdWIyUmtJZ29nSUNBZ0lDQWdJQ0FnSUdROUltMGdMVFV3TURFdU5qRTJOeXd0TnpnMU5pNDBOVGcySUhZZ0xURXhNek11T0RVNE15Qm9JQzB4T1RjdU5Ua3lOaUIySURFeE16TXVPRFU0TXlCNklpQXZQZ29nSUNBZ0lDQWdJRHh3WVhSb0NpQWdJQ0FnSUNBZ0lDQWdhVzVyYzJOaGNHVTZZMjl1Ym1WamRHOXlMV04xY25aaGRIVnlaVDBpTUNJS0lDQWdJQ0FnSUNBZ0lDQnBaRDBpY0dGMGFEYzJNRGtpQ2lBZ0lDQWdJQ0FnSUNBZ2MzUjViR1U5SW1acGJHdzZJelV5TlRJMU1qdG1hV3hzTFhKMWJHVTZaWFpsYm05a1pDSUtJQ0FnSUNBZ0lDQWdJQ0JrUFNKdElDMDBPVFV3TGpVNE1qRXNMVGcxT1RRdU16YzROaUJvSUMweU5EZ3VOakkzTWlCMklETTVOaTQ0TlRBNUlHZ2dNalE0TGpZeU56SWdlaUlnTHo0S0lDQWdJQ0FnUEM5blBnb2dJQ0FnUEM5blBnb2dJRHd2Wno0S1BDOXpkbWMrQ2c9PVwiLFxuICAgXCJpZFwiOiAwLFxuICAgXCJ3aWR0aFwiOiAyXG4gIH0sXG4gIHtcbiAgIFwidHlwZVwiOiBcInN2Z1wiLFxuICAgXCJpbWdcIjogXCJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LFBEOTRiV3dnZG1WeWMybHZiajBpTVM0d0lpQmxibU52WkdsdVp6MGlWVlJHTFRnaUlITjBZVzVrWVd4dmJtVTlJbTV2SWo4K0NqeHpkbWNLSUNBZ2VHMXNibk02WkdNOUltaDBkSEE2THk5d2RYSnNMbTl5Wnk5a1l5OWxiR1Z0Wlc1MGN5OHhMakV2SWdvZ0lDQjRiV3h1Y3pwall6MGlhSFIwY0RvdkwyTnlaV0YwYVhabFkyOXRiVzl1Y3k1dmNtY3Zibk1qSWdvZ0lDQjRiV3h1Y3pweVpHWTlJbWgwZEhBNkx5OTNkM2N1ZHpNdWIzSm5MekU1T1Rrdk1ESXZNakl0Y21SbUxYTjViblJoZUMxdWN5TWlDaUFnSUhodGJHNXpPbk4yWnowaWFIUjBjRG92TDNkM2R5NTNNeTV2Y21jdk1qQXdNQzl6ZG1jaUNpQWdJSGh0Ykc1elBTSm9kSFJ3T2k4dmQzZDNMbmN6TG05eVp5OHlNREF3TDNOMlp5SUtJQ0FnZUcxc2JuTTZjMjlrYVhCdlpHazlJbWgwZEhBNkx5OXpiMlJwY0c5a2FTNXpiM1Z5WTJWbWIzSm5aUzV1WlhRdlJGUkVMM052Wkdsd2IyUnBMVEF1WkhSa0lnb2dJQ0I0Yld4dWN6cHBibXR6WTJGd1pUMGlhSFIwY0RvdkwzZDNkeTVwYm10elkyRndaUzV2Y21jdmJtRnRaWE53WVdObGN5OXBibXR6WTJGd1pTSUtJQ0FnZG1sbGQwSnZlRDBpTUNBd0lETXVOemM1TlRJM05pQTFMak0wTlRNek1UZ2lDaUFnSUdobGFXZG9kRDBpTVdOdElnb2dJQ0IzYVdSMGFEMGlNV050SWdvZ0lDQjJaWEp6YVc5dVBTSXhMakVpQ2lBZ0lHbGtQU0p6ZG1jeE5EVXdPQ0lLSUNBZ2MyOWthWEJ2WkdrNlpHOWpibUZ0WlQwaVptOXVMbk4yWnlJS0lDQWdhVzVyYzJOaGNHVTZkbVZ5YzJsdmJqMGlNQzQ1TWk0eElISXhOVE0zTVNJK0NpQWdQRzFsZEdGa1lYUmhDaUFnSUNBZ2FXUTlJbTFsZEdGa1lYUmhNVFExTVRRaVBnb2dJQ0FnUEhKa1pqcFNSRVkrQ2lBZ0lDQWdJRHhqWXpwWGIzSnJDaUFnSUNBZ0lDQWdJSEprWmpwaFltOTFkRDBpSWo0S0lDQWdJQ0FnSUNBOFpHTTZabTl5YldGMFBtbHRZV2RsTDNOMlp5dDRiV3c4TDJSak9tWnZjbTFoZEQ0S0lDQWdJQ0FnSUNBOFpHTTZkSGx3WlFvZ0lDQWdJQ0FnSUNBZ0lISmtaanB5WlhOdmRYSmpaVDBpYUhSMGNEb3ZMM0IxY213dWIzSm5MMlJqTDJSamJXbDBlWEJsTDFOMGFXeHNTVzFoWjJVaUlDOCtDaUFnSUNBZ0lDQWdQR1JqT25ScGRHeGxQand2WkdNNmRHbDBiR1UrQ2lBZ0lDQWdJRHd2WTJNNlYyOXlhejRLSUNBZ0lEd3ZjbVJtT2xKRVJqNEtJQ0E4TDIxbGRHRmtZWFJoUGdvZ0lEeGtaV1p6Q2lBZ0lDQWdhV1E5SW1SbFpuTXhORFV4TWlJZ0x6NEtJQ0E4YzI5a2FYQnZaR2s2Ym1GdFpXUjJhV1YzQ2lBZ0lDQWdjR0ZuWldOdmJHOXlQU0lqWm1abVptWm1JZ29nSUNBZ0lHSnZjbVJsY21OdmJHOXlQU0lqTmpZMk5qWTJJZ29nSUNBZ0lHSnZjbVJsY205d1lXTnBkSGs5SWpFaUNpQWdJQ0FnYjJKcVpXTjBkRzlzWlhKaGJtTmxQU0l4TUNJS0lDQWdJQ0JuY21sa2RHOXNaWEpoYm1ObFBTSXhNQ0lLSUNBZ0lDQm5kV2xrWlhSdmJHVnlZVzVqWlQwaU1UQWlDaUFnSUNBZ2FXNXJjMk5oY0dVNmNHRm5aVzl3WVdOcGRIazlJakFpQ2lBZ0lDQWdhVzVyYzJOaGNHVTZjR0ZuWlhOb1lXUnZkejBpTWlJS0lDQWdJQ0JwYm10elkyRndaVHAzYVc1a2IzY3RkMmxrZEdnOUlqRXpOallpQ2lBZ0lDQWdhVzVyYzJOaGNHVTZkMmx1Wkc5M0xXaGxhV2RvZEQwaU56RTJJZ29nSUNBZ0lHbGtQU0p1WVcxbFpIWnBaWGN4TkRVeE1DSUtJQ0FnSUNCemFHOTNaM0pwWkQwaVptRnNjMlVpQ2lBZ0lDQWdkVzVwZEhNOUltTnRJZ29nSUNBZ0lHbHVhM05qWVhCbE9ucHZiMjA5SWpjdU1Ua3lNemd3T1NJS0lDQWdJQ0JwYm10elkyRndaVHBqZUQwaU55NHdNVEkwTlRVNUlnb2dJQ0FnSUdsdWEzTmpZWEJsT21ONVBTSXlOUzQxTXpBMU1Ea2lDaUFnSUNBZ2FXNXJjMk5oY0dVNmQybHVaRzkzTFhnOUlpMDRJZ29nSUNBZ0lHbHVhM05qWVhCbE9uZHBibVJ2ZHkxNVBTSXRPQ0lLSUNBZ0lDQnBibXR6WTJGd1pUcDNhVzVrYjNjdGJXRjRhVzFwZW1Wa1BTSXhJZ29nSUNBZ0lHbHVhM05qWVhCbE9tTjFjbkpsYm5RdGJHRjVaWEk5SW5OMlp6RTBOVEE0SWlBdlBnb2dJRHhuQ2lBZ0lDQWdkSEpoYm5ObWIzSnRQU0p0WVhSeWFYZ29NQzR3TVRVMU5UYzROeXd3TERBc01DNHdNVFUxTURBNE15d3RNUzR6TVRnME9UazFMREF1TlRRMk5EazRPVFlwSWdvZ0lDQWdJR2xrUFNKbk1UUTFNRFlpUGdvZ0lDQWdQSEpsWTNRS0lDQWdJQ0FnSUhkcFpIUm9QU0kwTXk0d09Ea3dNREVpQ2lBZ0lDQWdJQ0JvWldsbmFIUTlJalF6TGpBNE9UQXdNU0lLSUNBZ0lDQWdJSGc5SWpNMExqQXhPREF3TWlJS0lDQWdJQ0FnSUhrOUlqVXhMak14TkRrNU9TSUtJQ0FnSUNBZ0lISjRQU0l3SWdvZ0lDQWdJQ0FnY25rOUlqQWlDaUFnSUNBZ0lDQnBaRDBpY21WamRERTBNemN3SWlBdlBnb2dJQ0FnUEhCaGRHZ0tJQ0FnSUNBZ0lHUTlJbTBnTnpjdU1UQTNMRFV4TGpNeE5TQm9JRFF6TGpBNE9TQldJRGswTGpRd05DQklJRGMzTGpFd055QmFJZ29nSUNBZ0lDQWdhV1E5SW5CaGRHZ3hORE0zTWlJS0lDQWdJQ0FnSUdsdWEzTmpZWEJsT21OdmJtNWxZM1J2Y2kxamRYSjJZWFIxY21VOUlqQWlDaUFnSUNBZ0lDQnpkSGxzWlQwaVptbHNiRG9qWm1abVptWm1JaUF2UGdvZ0lDQWdQSEpsWTNRS0lDQWdJQ0FnSUhkcFpIUm9QU0kwTXk0d09Ea3dNREVpQ2lBZ0lDQWdJQ0JvWldsbmFIUTlJalF6TGpBNE9UQXdNU0lLSUNBZ0lDQWdJSGc5SWpFeU1DNHhPVFlpQ2lBZ0lDQWdJQ0I1UFNJMU1TNHpNVFE1T1RraUNpQWdJQ0FnSUNCeWVEMGlNQ0lLSUNBZ0lDQWdJSEo1UFNJd0lnb2dJQ0FnSUNBZ2FXUTlJbkpsWTNReE5ETTNOQ0lnTHo0S0lDQWdJRHh3WVhSb0NpQWdJQ0FnSUNCa1BTSnRJREUyTXk0eU9EWXNOVEV1TXpFMUlHZ2dORE11TURnNUlIWWdORE11TURnNUlHZ2dMVFF6TGpBNE9TQjZJZ29nSUNBZ0lDQWdhV1E5SW5CaGRHZ3hORE0zTmlJS0lDQWdJQ0FnSUdsdWEzTmpZWEJsT21OdmJtNWxZM1J2Y2kxamRYSjJZWFIxY21VOUlqQWlDaUFnSUNBZ0lDQnpkSGxzWlQwaVptbHNiRG9qWm1abVptWm1JaUF2UGdvZ0lDQWdQSEpsWTNRS0lDQWdJQ0FnSUhkcFpIUm9QU0kwTXk0d09Ea3dNREVpQ2lBZ0lDQWdJQ0JvWldsbmFIUTlJalF6TGpBNE9UQXdNU0lLSUNBZ0lDQWdJSGc5SWpJd05pNHpOelVpQ2lBZ0lDQWdJQ0I1UFNJMU1TNHpNVFE1T1RraUNpQWdJQ0FnSUNCeWVEMGlNQ0lLSUNBZ0lDQWdJSEo1UFNJd0lnb2dJQ0FnSUNBZ2FXUTlJbkpsWTNReE5ETTNPQ0lnTHo0S0lDQWdJRHh3WVhSb0NpQWdJQ0FnSUNCa1BTSnRJREkwT1M0ME5qUXNOVEV1TXpFMUlHZ2dORE11TURnNUlIWWdORE11TURnNUlHZ2dMVFF6TGpBNE9TQjZJZ29nSUNBZ0lDQWdhV1E5SW5CaGRHZ3hORE00TUNJS0lDQWdJQ0FnSUdsdWEzTmpZWEJsT21OdmJtNWxZM1J2Y2kxamRYSjJZWFIxY21VOUlqQWlDaUFnSUNBZ0lDQnpkSGxzWlQwaVptbHNiRG9qWm1abVptWm1JaUF2UGdvZ0lDQWdQSEpsWTNRS0lDQWdJQ0FnSUhkcFpIUm9QU0kwTXk0d09Ea3dNREVpQ2lBZ0lDQWdJQ0JvWldsbmFIUTlJalF6TGpBNE9UQXdNU0lLSUNBZ0lDQWdJSGc5SWpJNU1pNDFOVE01T1NJS0lDQWdJQ0FnSUhrOUlqVXhMak14TkRrNU9TSUtJQ0FnSUNBZ0lISjRQU0l3SWdvZ0lDQWdJQ0FnY25rOUlqQWlDaUFnSUNBZ0lDQnBaRDBpY21WamRERTBNemd5SWlBdlBnb2dJQ0FnUEhCaGRHZ0tJQ0FnSUNBZ0lHUTlJbTBnTXpNMUxqWTBNeXcxTVM0ek1UVWdhQ0EwTXk0d09Ea2dkaUEwTXk0d09Ea2dhQ0F0TkRNdU1EZzVJSG9pQ2lBZ0lDQWdJQ0JwWkQwaWNHRjBhREUwTXpnMElnb2dJQ0FnSUNBZ2FXNXJjMk5oY0dVNlkyOXVibVZqZEc5eUxXTjFjblpoZEhWeVpUMGlNQ0lLSUNBZ0lDQWdJSE4wZVd4bFBTSm1hV3hzT2lObVptWm1abVlpSUM4K0NpQWdJQ0E4WndvZ0lDQWdJQ0FnZEhKaGJuTm1iM0p0UFNKMGNtRnVjMnhoZEdVb016UTJMams0TWl3ek1ESXVOVGdwSWdvZ0lDQWdJQ0FnYVdROUltY3hORFF3TWlJK0NpQWdJQ0FnSUR4eVpXTjBDaUFnSUNBZ0lDQWdJSEo1UFNJd0lnb2dJQ0FnSUNBZ0lDQnllRDBpTUNJS0lDQWdJQ0FnSUNBZ2VUMGlMVEl3T0M0eE56VTVPU0lLSUNBZ0lDQWdJQ0FnZUQwaUxURXhMak16T1NJS0lDQWdJQ0FnSUNBZ2FHVnBaMmgwUFNJME15NHdPRGt3TURFaUNpQWdJQ0FnSUNBZ0lIZHBaSFJvUFNJME15NHdPRGt3TURFaUNpQWdJQ0FnSUNBZ0lHbGtQU0p5WldOME1UUXpPRFlpSUM4K0NpQWdJQ0FnSUR4d1lYUm9DaUFnSUNBZ0lDQWdJR1E5SW0wZ0xUVTBMalF5T1N3dE1qQTRMakUzTmlCb0lEUXpMakE0T1NCMklEUXpMakE0T1NCb0lDMDBNeTR3T0RrZ2VpSUtJQ0FnSUNBZ0lDQWdhV1E5SW5CaGRHZ3hORE00T0NJS0lDQWdJQ0FnSUNBZ2FXNXJjMk5oY0dVNlkyOXVibVZqZEc5eUxXTjFjblpoZEhWeVpUMGlNQ0lLSUNBZ0lDQWdJQ0FnYzNSNWJHVTlJbVpwYkd3NkkyWm1abVptWmlJZ0x6NEtJQ0FnSUNBZ1BISmxZM1FLSUNBZ0lDQWdJQ0FnY25rOUlqQWlDaUFnSUNBZ0lDQWdJSEo0UFNJd0lnb2dJQ0FnSUNBZ0lDQjVQU0l0TWpBNExqRTNOVGs1SWdvZ0lDQWdJQ0FnSUNCNFBTSXRPVGN1TlRFM09UazRJZ29nSUNBZ0lDQWdJQ0JvWldsbmFIUTlJalF6TGpBNE9UQXdNU0lLSUNBZ0lDQWdJQ0FnZDJsa2RHZzlJalF6TGpBNE9UQXdNU0lLSUNBZ0lDQWdJQ0FnYVdROUluSmxZM1F4TkRNNU1DSWdMejRLSUNBZ0lDQWdQSEJoZEdnS0lDQWdJQ0FnSUNBZ1pEMGliU0F0TVRRd0xqWXdOeXd0TWpBNExqRTNOaUJvSURRekxqQTRPU0IySURRekxqQTRPU0JvSUMwME15NHdPRGtnZWlJS0lDQWdJQ0FnSUNBZ2FXUTlJbkJoZEdneE5ETTVNaUlLSUNBZ0lDQWdJQ0FnYVc1cmMyTmhjR1U2WTI5dWJtVmpkRzl5TFdOMWNuWmhkSFZ5WlQwaU1DSUtJQ0FnSUNBZ0lDQWdjM1I1YkdVOUltWnBiR3c2STJabVptWm1aaUlnTHo0S0lDQWdJQ0FnUEhKbFkzUUtJQ0FnSUNBZ0lDQWdjbms5SWpBaUNpQWdJQ0FnSUNBZ0lISjRQU0l3SWdvZ0lDQWdJQ0FnSUNCNVBTSXRNakE0TGpFM05UazVJZ29nSUNBZ0lDQWdJQ0I0UFNJdE1UZ3pMalk1TmlJS0lDQWdJQ0FnSUNBZ2FHVnBaMmgwUFNJME15NHdPRGt3TURFaUNpQWdJQ0FnSUNBZ0lIZHBaSFJvUFNJME15NHdPRGt3TURFaUNpQWdJQ0FnSUNBZ0lHbGtQU0p5WldOME1UUXpPVFFpSUM4K0NpQWdJQ0FnSUR4d1lYUm9DaUFnSUNBZ0lDQWdJR1E5SW0wZ0xUSXlOaTQzT0RZc0xUSXdPQzR4TnpZZ2FDQTBNeTR3T0RrZ2RpQTBNeTR3T0RrZ2FDQXRORE11TURnNUlIb2lDaUFnSUNBZ0lDQWdJR2xrUFNKd1lYUm9NVFF6T1RZaUNpQWdJQ0FnSUNBZ0lHbHVhM05qWVhCbE9tTnZibTVsWTNSdmNpMWpkWEoyWVhSMWNtVTlJakFpQ2lBZ0lDQWdJQ0FnSUhOMGVXeGxQU0ptYVd4c09pTm1abVptWm1ZaUlDOCtDaUFnSUNBZ0lEeHlaV04wQ2lBZ0lDQWdJQ0FnSUhKNVBTSXdJZ29nSUNBZ0lDQWdJQ0J5ZUQwaU1DSUtJQ0FnSUNBZ0lDQWdlVDBpTFRJd09DNHhOelU1T1NJS0lDQWdJQ0FnSUNBZ2VEMGlMVEkyT1M0NE56VWlDaUFnSUNBZ0lDQWdJR2hsYVdkb2REMGlORE11TURnNU1EQXhJZ29nSUNBZ0lDQWdJQ0IzYVdSMGFEMGlORE11TURnNU1EQXhJZ29nSUNBZ0lDQWdJQ0JwWkQwaWNtVmpkREUwTXprNElpQXZQZ29nSUNBZ0lDQThjR0YwYUFvZ0lDQWdJQ0FnSUNCa1BTSnRJQzB6TVRJdU9UWTBMQzB5TURndU1UYzJJR2dnTkRNdU1EZzVJSFlnTkRNdU1EZzVJR2dnTFRRekxqQTRPU0I2SWdvZ0lDQWdJQ0FnSUNCcFpEMGljR0YwYURFME5EQXdJZ29nSUNBZ0lDQWdJQ0JwYm10elkyRndaVHBqYjI1dVpXTjBiM0l0WTNWeWRtRjBkWEpsUFNJd0lnb2dJQ0FnSUNBZ0lDQnpkSGxzWlQwaVptbHNiRG9qWm1abVptWm1JaUF2UGdvZ0lDQWdQQzluUGdvZ0lDQWdQSEpsWTNRS0lDQWdJQ0FnSUhkcFpIUm9QU0kwTXk0d09Ea3dNREVpQ2lBZ0lDQWdJQ0JvWldsbmFIUTlJalF6TGpBNE9UQXdNU0lLSUNBZ0lDQWdJSGc5SWpNMExqQXhPREF3TWlJS0lDQWdJQ0FnSUhrOUlqRXpOeTQwT1RRaUNpQWdJQ0FnSUNCeWVEMGlNQ0lLSUNBZ0lDQWdJSEo1UFNJd0lnb2dJQ0FnSUNBZ2FXUTlJbkpsWTNReE5EUXdOQ0lnTHo0S0lDQWdJRHh3WVhSb0NpQWdJQ0FnSUNCa1BTSnRJRGMzTGpFd055d3hNemN1TkRrMElHZ2dORE11TURnNUlIWWdORE11TURnNUlFZ2dOemN1TVRBM0lGb2lDaUFnSUNBZ0lDQnBaRDBpY0dGMGFERTBOREEySWdvZ0lDQWdJQ0FnYVc1cmMyTmhjR1U2WTI5dWJtVmpkRzl5TFdOMWNuWmhkSFZ5WlQwaU1DSUtJQ0FnSUNBZ0lITjBlV3hsUFNKbWFXeHNPaU5tWm1abVptWWlJQzgrQ2lBZ0lDQThjbVZqZEFvZ0lDQWdJQ0FnZDJsa2RHZzlJalF6TGpBNE9UQXdNU0lLSUNBZ0lDQWdJR2hsYVdkb2REMGlORE11TURnNU1EQXhJZ29nSUNBZ0lDQWdlRDBpTVRJd0xqRTVOaUlLSUNBZ0lDQWdJSGs5SWpFek55NDBPVFFpQ2lBZ0lDQWdJQ0J5ZUQwaU1DSUtJQ0FnSUNBZ0lISjVQU0l3SWdvZ0lDQWdJQ0FnYVdROUluSmxZM1F4TkRRd09DSWdMejRLSUNBZ0lEeHdZWFJvQ2lBZ0lDQWdJQ0JrUFNKdElERTJNeTR5T0RZc01UTTNMalE1TkNCb0lEUXpMakE0T1NCMklEUXpMakE0T1NCb0lDMDBNeTR3T0RrZ2VpSUtJQ0FnSUNBZ0lHbGtQU0p3WVhSb01UUTBNVEFpQ2lBZ0lDQWdJQ0JwYm10elkyRndaVHBqYjI1dVpXTjBiM0l0WTNWeWRtRjBkWEpsUFNJd0lnb2dJQ0FnSUNBZ2MzUjViR1U5SW1acGJHdzZJMlptWm1abVppSWdMejRLSUNBZ0lEeHlaV04wQ2lBZ0lDQWdJQ0IzYVdSMGFEMGlORE11TURnNU1EQXhJZ29nSUNBZ0lDQWdhR1ZwWjJoMFBTSTBNeTR3T0Rrd01ERWlDaUFnSUNBZ0lDQjRQU0l5TURZdU16YzFJZ29nSUNBZ0lDQWdlVDBpTVRNM0xqUTVOQ0lLSUNBZ0lDQWdJSEo0UFNJd0lnb2dJQ0FnSUNBZ2NuazlJakFpQ2lBZ0lDQWdJQ0JwWkQwaWNtVmpkREUwTkRFeUlpQXZQZ29nSUNBZ1BIQmhkR2dLSUNBZ0lDQWdJR1E5SW0wZ01qUTVMalEyTkN3eE16Y3VORGswSUdnZ05ETXVNRGc1SUhZZ05ETXVNRGc1SUdnZ0xUUXpMakE0T1NCNklnb2dJQ0FnSUNBZ2FXUTlJbkJoZEdneE5EUXhOQ0lLSUNBZ0lDQWdJR2x1YTNOallYQmxPbU52Ym01bFkzUnZjaTFqZFhKMllYUjFjbVU5SWpBaUNpQWdJQ0FnSUNCemRIbHNaVDBpWm1sc2JEb2pabVptWm1abUlpQXZQZ29nSUNBZ1BISmxZM1FLSUNBZ0lDQWdJSGRwWkhSb1BTSTBNeTR3T0Rrd01ERWlDaUFnSUNBZ0lDQm9aV2xuYUhROUlqUXpMakE0T1RBd01TSUtJQ0FnSUNBZ0lIZzlJakk1TWk0MU5UTTVPU0lLSUNBZ0lDQWdJSGs5SWpFek55NDBPVFFpQ2lBZ0lDQWdJQ0J5ZUQwaU1DSUtJQ0FnSUNBZ0lISjVQU0l3SWdvZ0lDQWdJQ0FnYVdROUluSmxZM1F4TkRReE5pSWdMejRLSUNBZ0lEeHdZWFJvQ2lBZ0lDQWdJQ0JrUFNKdElETXpOUzQyTkRNc01UTTNMalE1TkNCb0lEUXpMakE0T1NCMklEUXpMakE0T1NCb0lDMDBNeTR3T0RrZ2VpSUtJQ0FnSUNBZ0lHbGtQU0p3WVhSb01UUTBNVGdpQ2lBZ0lDQWdJQ0JwYm10elkyRndaVHBqYjI1dVpXTjBiM0l0WTNWeWRtRjBkWEpsUFNJd0lnb2dJQ0FnSUNBZ2MzUjViR1U5SW1acGJHdzZJMlptWm1abVppSWdMejRLSUNBZ0lEeG5DaUFnSUNBZ0lDQjBjbUZ1YzJadmNtMDlJblJ5WVc1emJHRjBaU2d6TkRZdU9UZ3lMRE00T0M0M05Ua3BJZ29nSUNBZ0lDQWdhV1E5SW1jeE5EUXpOaUkrQ2lBZ0lDQWdJRHh5WldOMENpQWdJQ0FnSUNBZ0lISjVQU0l3SWdvZ0lDQWdJQ0FnSUNCeWVEMGlNQ0lLSUNBZ0lDQWdJQ0FnZVQwaUxUSXdPQzR4TnpVNU9TSUtJQ0FnSUNBZ0lDQWdlRDBpTFRFeExqTXpPU0lLSUNBZ0lDQWdJQ0FnYUdWcFoyaDBQU0kwTXk0d09Ea3dNREVpQ2lBZ0lDQWdJQ0FnSUhkcFpIUm9QU0kwTXk0d09Ea3dNREVpQ2lBZ0lDQWdJQ0FnSUdsa1BTSnlaV04wTVRRME1qQWlJQzgrQ2lBZ0lDQWdJRHh3WVhSb0NpQWdJQ0FnSUNBZ0lHUTlJbTBnTFRVMExqUXlPU3d0TWpBNExqRTNOaUJvSURRekxqQTRPU0IySURRekxqQTRPU0JvSUMwME15NHdPRGtnZWlJS0lDQWdJQ0FnSUNBZ2FXUTlJbkJoZEdneE5EUXlNaUlLSUNBZ0lDQWdJQ0FnYVc1cmMyTmhjR1U2WTI5dWJtVmpkRzl5TFdOMWNuWmhkSFZ5WlQwaU1DSUtJQ0FnSUNBZ0lDQWdjM1I1YkdVOUltWnBiR3c2STJabVptWm1aaUlnTHo0S0lDQWdJQ0FnUEhKbFkzUUtJQ0FnSUNBZ0lDQWdjbms5SWpBaUNpQWdJQ0FnSUNBZ0lISjRQU0l3SWdvZ0lDQWdJQ0FnSUNCNVBTSXRNakE0TGpFM05UazVJZ29nSUNBZ0lDQWdJQ0I0UFNJdE9UY3VOVEUzT1RrNElnb2dJQ0FnSUNBZ0lDQm9aV2xuYUhROUlqUXpMakE0T1RBd01TSUtJQ0FnSUNBZ0lDQWdkMmxrZEdnOUlqUXpMakE0T1RBd01TSUtJQ0FnSUNBZ0lDQWdhV1E5SW5KbFkzUXhORFF5TkNJZ0x6NEtJQ0FnSUNBZ1BIQmhkR2dLSUNBZ0lDQWdJQ0FnWkQwaWJTQXRNVFF3TGpZd055d3RNakE0TGpFM05pQm9JRFF6TGpBNE9TQjJJRFF6TGpBNE9TQm9JQzAwTXk0d09Ea2dlaUlLSUNBZ0lDQWdJQ0FnYVdROUluQmhkR2d4TkRReU5pSUtJQ0FnSUNBZ0lDQWdhVzVyYzJOaGNHVTZZMjl1Ym1WamRHOXlMV04xY25aaGRIVnlaVDBpTUNJS0lDQWdJQ0FnSUNBZ2MzUjViR1U5SW1acGJHdzZJMlptWm1abVppSWdMejRLSUNBZ0lDQWdQSEpsWTNRS0lDQWdJQ0FnSUNBZ2NuazlJakFpQ2lBZ0lDQWdJQ0FnSUhKNFBTSXdJZ29nSUNBZ0lDQWdJQ0I1UFNJdE1qQTRMakUzTlRrNUlnb2dJQ0FnSUNBZ0lDQjRQU0l0TVRnekxqWTVOaUlLSUNBZ0lDQWdJQ0FnYUdWcFoyaDBQU0kwTXk0d09Ea3dNREVpQ2lBZ0lDQWdJQ0FnSUhkcFpIUm9QU0kwTXk0d09Ea3dNREVpQ2lBZ0lDQWdJQ0FnSUdsa1BTSnlaV04wTVRRME1qZ2lJQzgrQ2lBZ0lDQWdJRHh3WVhSb0NpQWdJQ0FnSUNBZ0lHUTlJbTBnTFRJeU5pNDNPRFlzTFRJd09DNHhOellnYUNBME15NHdPRGtnZGlBME15NHdPRGtnYUNBdE5ETXVNRGc1SUhvaUNpQWdJQ0FnSUNBZ0lHbGtQU0p3WVhSb01UUTBNekFpQ2lBZ0lDQWdJQ0FnSUdsdWEzTmpZWEJsT21OdmJtNWxZM1J2Y2kxamRYSjJZWFIxY21VOUlqQWlDaUFnSUNBZ0lDQWdJSE4wZVd4bFBTSm1hV3hzT2lObVptWm1abVlpSUM4K0NpQWdJQ0FnSUR4eVpXTjBDaUFnSUNBZ0lDQWdJSEo1UFNJd0lnb2dJQ0FnSUNBZ0lDQnllRDBpTUNJS0lDQWdJQ0FnSUNBZ2VUMGlMVEl3T0M0eE56VTVPU0lLSUNBZ0lDQWdJQ0FnZUQwaUxUSTJPUzQ0TnpVaUNpQWdJQ0FnSUNBZ0lHaGxhV2RvZEQwaU5ETXVNRGc1TURBeElnb2dJQ0FnSUNBZ0lDQjNhV1IwYUQwaU5ETXVNRGc1TURBeElnb2dJQ0FnSUNBZ0lDQnBaRDBpY21WamRERTBORE15SWlBdlBnb2dJQ0FnSUNBOGNHRjBhQW9nSUNBZ0lDQWdJQ0JrUFNKdElDMHpNVEl1T1RZMExDMHlNRGd1TVRjMklHZ2dORE11TURnNUlIWWdORE11TURnNUlHZ2dMVFF6TGpBNE9TQjZJZ29nSUNBZ0lDQWdJQ0JwWkQwaWNHRjBhREUwTkRNMElnb2dJQ0FnSUNBZ0lDQnBibXR6WTJGd1pUcGpiMjV1WldOMGIzSXRZM1Z5ZG1GMGRYSmxQU0l3SWdvZ0lDQWdJQ0FnSUNCemRIbHNaVDBpWm1sc2JEb2pabVptWm1abUlpQXZQZ29nSUNBZ1BDOW5QZ29nSUNBZ1BISmxZM1FLSUNBZ0lDQWdJSGRwWkhSb1BTSTBNeTR3T0Rrd01ERWlDaUFnSUNBZ0lDQm9aV2xuYUhROUlqUXpMakE0T1RBd01TSUtJQ0FnSUNBZ0lIZzlJak0wTGpBeE9EQXdNaUlLSUNBZ0lDQWdJSGs5SWpJeU15NDJOek1pQ2lBZ0lDQWdJQ0J5ZUQwaU1DSUtJQ0FnSUNBZ0lISjVQU0l3SWdvZ0lDQWdJQ0FnYVdROUluSmxZM1F4TkRRek9DSWdMejRLSUNBZ0lEeHdZWFJvQ2lBZ0lDQWdJQ0JrUFNKdElEYzNMakV3Tnl3eU1qTXVOamN6SUdnZ05ETXVNRGc1SUhZZ05ETXVNRGc1SUVnZ056Y3VNVEEzSUZvaUNpQWdJQ0FnSUNCcFpEMGljR0YwYURFME5EUXdJZ29nSUNBZ0lDQWdhVzVyYzJOaGNHVTZZMjl1Ym1WamRHOXlMV04xY25aaGRIVnlaVDBpTUNJS0lDQWdJQ0FnSUhOMGVXeGxQU0ptYVd4c09pTm1abVptWm1ZaUlDOCtDaUFnSUNBOGNtVmpkQW9nSUNBZ0lDQWdkMmxrZEdnOUlqUXpMakE0T1RBd01TSUtJQ0FnSUNBZ0lHaGxhV2RvZEQwaU5ETXVNRGc1TURBeElnb2dJQ0FnSUNBZ2VEMGlNVEl3TGpFNU5pSUtJQ0FnSUNBZ0lIazlJakl5TXk0Mk56TWlDaUFnSUNBZ0lDQnllRDBpTUNJS0lDQWdJQ0FnSUhKNVBTSXdJZ29nSUNBZ0lDQWdhV1E5SW5KbFkzUXhORFEwTWlJZ0x6NEtJQ0FnSUR4d1lYUm9DaUFnSUNBZ0lDQmtQU0p0SURFMk15NHlPRFlzTWpJekxqWTNNeUJvSURRekxqQTRPU0IySURRekxqQTRPU0JvSUMwME15NHdPRGtnZWlJS0lDQWdJQ0FnSUdsa1BTSndZWFJvTVRRME5EUWlDaUFnSUNBZ0lDQnBibXR6WTJGd1pUcGpiMjV1WldOMGIzSXRZM1Z5ZG1GMGRYSmxQU0l3SWdvZ0lDQWdJQ0FnYzNSNWJHVTlJbVpwYkd3NkkyWm1abVptWmlJZ0x6NEtJQ0FnSUR4eVpXTjBDaUFnSUNBZ0lDQjNhV1IwYUQwaU5ETXVNRGc1TURBeElnb2dJQ0FnSUNBZ2FHVnBaMmgwUFNJME15NHdPRGt3TURFaUNpQWdJQ0FnSUNCNFBTSXlNRFl1TXpjMUlnb2dJQ0FnSUNBZ2VUMGlNakl6TGpZM015SUtJQ0FnSUNBZ0lISjRQU0l3SWdvZ0lDQWdJQ0FnY25rOUlqQWlDaUFnSUNBZ0lDQnBaRDBpY21WamRERTBORFEySWlBdlBnb2dJQ0FnUEhCaGRHZ0tJQ0FnSUNBZ0lHUTlJbTBnTWpRNUxqUTJOQ3d5TWpNdU5qY3pJR2dnTkRNdU1EZzVJSFlnTkRNdU1EZzVJR2dnTFRRekxqQTRPU0I2SWdvZ0lDQWdJQ0FnYVdROUluQmhkR2d4TkRRME9DSUtJQ0FnSUNBZ0lHbHVhM05qWVhCbE9tTnZibTVsWTNSdmNpMWpkWEoyWVhSMWNtVTlJakFpQ2lBZ0lDQWdJQ0J6ZEhsc1pUMGlabWxzYkRvalptWm1abVptSWlBdlBnb2dJQ0FnUEhKbFkzUUtJQ0FnSUNBZ0lIZHBaSFJvUFNJME15NHdPRGt3TURFaUNpQWdJQ0FnSUNCb1pXbG5hSFE5SWpRekxqQTRPVEF3TVNJS0lDQWdJQ0FnSUhnOUlqSTVNaTQxTlRNNU9TSUtJQ0FnSUNBZ0lIazlJakl5TXk0Mk56TWlDaUFnSUNBZ0lDQnllRDBpTUNJS0lDQWdJQ0FnSUhKNVBTSXdJZ29nSUNBZ0lDQWdhV1E5SW5KbFkzUXhORFExTUNJZ0x6NEtJQ0FnSUR4d1lYUm9DaUFnSUNBZ0lDQmtQU0p0SURNek5TNDJORE1zTWpJekxqWTNNeUJvSURRekxqQTRPU0IySURRekxqQTRPU0JvSUMwME15NHdPRGtnZWlJS0lDQWdJQ0FnSUdsa1BTSndZWFJvTVRRME5USWlDaUFnSUNBZ0lDQnBibXR6WTJGd1pUcGpiMjV1WldOMGIzSXRZM1Z5ZG1GMGRYSmxQU0l3SWdvZ0lDQWdJQ0FnYzNSNWJHVTlJbVpwYkd3NkkyWm1abVptWmlJZ0x6NEtJQ0FnSUR4bkNpQWdJQ0FnSUNCMGNtRnVjMlp2Y20wOUluUnlZVzV6YkdGMFpTZ3pORFl1T1RneUxEUTNOQzQ1TXpncElnb2dJQ0FnSUNBZ2FXUTlJbWN4TkRRM01DSStDaUFnSUNBZ0lEeHlaV04wQ2lBZ0lDQWdJQ0FnSUhKNVBTSXdJZ29nSUNBZ0lDQWdJQ0J5ZUQwaU1DSUtJQ0FnSUNBZ0lDQWdlVDBpTFRJd09DNHhOelU1T1NJS0lDQWdJQ0FnSUNBZ2VEMGlMVEV4TGpNek9TSUtJQ0FnSUNBZ0lDQWdhR1ZwWjJoMFBTSTBNeTR3T0Rrd01ERWlDaUFnSUNBZ0lDQWdJSGRwWkhSb1BTSTBNeTR3T0Rrd01ERWlDaUFnSUNBZ0lDQWdJR2xrUFNKeVpXTjBNVFEwTlRRaUlDOCtDaUFnSUNBZ0lEeHdZWFJvQ2lBZ0lDQWdJQ0FnSUdROUltMGdMVFUwTGpReU9Td3RNakE0TGpFM05pQm9JRFF6TGpBNE9TQjJJRFF6TGpBNE9TQm9JQzAwTXk0d09Ea2dlaUlLSUNBZ0lDQWdJQ0FnYVdROUluQmhkR2d4TkRRMU5pSUtJQ0FnSUNBZ0lDQWdhVzVyYzJOaGNHVTZZMjl1Ym1WamRHOXlMV04xY25aaGRIVnlaVDBpTUNJS0lDQWdJQ0FnSUNBZ2MzUjViR1U5SW1acGJHdzZJMlptWm1abVppSWdMejRLSUNBZ0lDQWdQSEpsWTNRS0lDQWdJQ0FnSUNBZ2NuazlJakFpQ2lBZ0lDQWdJQ0FnSUhKNFBTSXdJZ29nSUNBZ0lDQWdJQ0I1UFNJdE1qQTRMakUzTlRrNUlnb2dJQ0FnSUNBZ0lDQjRQU0l0T1RjdU5URTNPVGs0SWdvZ0lDQWdJQ0FnSUNCb1pXbG5hSFE5SWpRekxqQTRPVEF3TVNJS0lDQWdJQ0FnSUNBZ2QybGtkR2c5SWpRekxqQTRPVEF3TVNJS0lDQWdJQ0FnSUNBZ2FXUTlJbkpsWTNReE5EUTFPQ0lnTHo0S0lDQWdJQ0FnUEhCaGRHZ0tJQ0FnSUNBZ0lDQWdaRDBpYlNBdE1UUXdMall3Tnl3dE1qQTRMakUzTmlCb0lEUXpMakE0T1NCMklEUXpMakE0T1NCb0lDMDBNeTR3T0RrZ2VpSUtJQ0FnSUNBZ0lDQWdhV1E5SW5CaGRHZ3hORFEyTUNJS0lDQWdJQ0FnSUNBZ2FXNXJjMk5oY0dVNlkyOXVibVZqZEc5eUxXTjFjblpoZEhWeVpUMGlNQ0lLSUNBZ0lDQWdJQ0FnYzNSNWJHVTlJbVpwYkd3NkkyWm1abVptWmlJZ0x6NEtJQ0FnSUNBZ1BISmxZM1FLSUNBZ0lDQWdJQ0FnY25rOUlqQWlDaUFnSUNBZ0lDQWdJSEo0UFNJd0lnb2dJQ0FnSUNBZ0lDQjVQU0l0TWpBNExqRTNOVGs1SWdvZ0lDQWdJQ0FnSUNCNFBTSXRNVGd6TGpZNU5pSUtJQ0FnSUNBZ0lDQWdhR1ZwWjJoMFBTSTBNeTR3T0Rrd01ERWlDaUFnSUNBZ0lDQWdJSGRwWkhSb1BTSTBNeTR3T0Rrd01ERWlDaUFnSUNBZ0lDQWdJR2xrUFNKeVpXTjBNVFEwTmpJaUlDOCtDaUFnSUNBZ0lEeHdZWFJvQ2lBZ0lDQWdJQ0FnSUdROUltMGdMVEl5Tmk0M09EWXNMVEl3T0M0eE56WWdhQ0EwTXk0d09Ea2dkaUEwTXk0d09Ea2dhQ0F0TkRNdU1EZzVJSG9pQ2lBZ0lDQWdJQ0FnSUdsa1BTSndZWFJvTVRRME5qUWlDaUFnSUNBZ0lDQWdJR2x1YTNOallYQmxPbU52Ym01bFkzUnZjaTFqZFhKMllYUjFjbVU5SWpBaUNpQWdJQ0FnSUNBZ0lITjBlV3hsUFNKbWFXeHNPaU5tWm1abVptWWlJQzgrQ2lBZ0lDQWdJRHh5WldOMENpQWdJQ0FnSUNBZ0lISjVQU0l3SWdvZ0lDQWdJQ0FnSUNCeWVEMGlNQ0lLSUNBZ0lDQWdJQ0FnZVQwaUxUSXdPQzR4TnpVNU9TSUtJQ0FnSUNBZ0lDQWdlRDBpTFRJMk9TNDROelVpQ2lBZ0lDQWdJQ0FnSUdobGFXZG9kRDBpTkRNdU1EZzVNREF4SWdvZ0lDQWdJQ0FnSUNCM2FXUjBhRDBpTkRNdU1EZzVNREF4SWdvZ0lDQWdJQ0FnSUNCcFpEMGljbVZqZERFME5EWTJJaUF2UGdvZ0lDQWdJQ0E4Y0dGMGFBb2dJQ0FnSUNBZ0lDQmtQU0p0SUMwek1USXVPVFkwTEMweU1EZ3VNVGMySUdnZ05ETXVNRGc1SUhZZ05ETXVNRGc1SUdnZ0xUUXpMakE0T1NCNklnb2dJQ0FnSUNBZ0lDQnBaRDBpY0dGMGFERTBORFk0SWdvZ0lDQWdJQ0FnSUNCcGJtdHpZMkZ3WlRwamIyNXVaV04wYjNJdFkzVnlkbUYwZFhKbFBTSXdJZ29nSUNBZ0lDQWdJQ0J6ZEhsc1pUMGlabWxzYkRvalptWm1abVptSWlBdlBnb2dJQ0FnUEM5blBnb2dJQ0FnUEhKbFkzUUtJQ0FnSUNBZ0lIZHBaSFJvUFNJME15NHdPRGt3TURFaUNpQWdJQ0FnSUNCb1pXbG5hSFE5SWpRekxqQTRPVEF3TVNJS0lDQWdJQ0FnSUhnOUlqTTBMakF4T0RBd01pSUtJQ0FnSUNBZ0lIazlJaTB6TkM0NE5qSTVPVGtpQ2lBZ0lDQWdJQ0J5ZUQwaU1DSUtJQ0FnSUNBZ0lISjVQU0l3SWdvZ0lDQWdJQ0FnYVdROUluSmxZM1F4TkRRM01pSWdMejRLSUNBZ0lEeHdZWFJvQ2lBZ0lDQWdJQ0JrUFNKdElEYzNMakV3Tnl3dE16UXVPRFl6SUdnZ05ETXVNRGc1SUZZZ09DNHlNallnU0NBM055NHhNRGNnV2lJS0lDQWdJQ0FnSUdsa1BTSndZWFJvTVRRME56UWlDaUFnSUNBZ0lDQnBibXR6WTJGd1pUcGpiMjV1WldOMGIzSXRZM1Z5ZG1GMGRYSmxQU0l3SWdvZ0lDQWdJQ0FnYzNSNWJHVTlJbVpwYkd3NkkyWm1abVptWmlJZ0x6NEtJQ0FnSUR4eVpXTjBDaUFnSUNBZ0lDQjNhV1IwYUQwaU5ETXVNRGc1TURBeElnb2dJQ0FnSUNBZ2FHVnBaMmgwUFNJME15NHdPRGt3TURFaUNpQWdJQ0FnSUNCNFBTSXhNakF1TVRrMklnb2dJQ0FnSUNBZ2VUMGlMVE0wTGpnMk1qazVPU0lLSUNBZ0lDQWdJSEo0UFNJd0lnb2dJQ0FnSUNBZ2NuazlJakFpQ2lBZ0lDQWdJQ0JwWkQwaWNtVmpkREUwTkRjMklpQXZQZ29nSUNBZ1BIQmhkR2dLSUNBZ0lDQWdJR1E5SW0wZ01UWXpMakk0Tml3dE16UXVPRFl6SUdnZ05ETXVNRGc1SUZZZ09DNHlNallnYUNBdE5ETXVNRGc1SUhvaUNpQWdJQ0FnSUNCcFpEMGljR0YwYURFME5EYzRJZ29nSUNBZ0lDQWdhVzVyYzJOaGNHVTZZMjl1Ym1WamRHOXlMV04xY25aaGRIVnlaVDBpTUNJS0lDQWdJQ0FnSUhOMGVXeGxQU0ptYVd4c09pTm1abVptWm1ZaUlDOCtDaUFnSUNBOGNtVmpkQW9nSUNBZ0lDQWdkMmxrZEdnOUlqUXpMakE0T1RBd01TSUtJQ0FnSUNBZ0lHaGxhV2RvZEQwaU5ETXVNRGc1TURBeElnb2dJQ0FnSUNBZ2VEMGlNakEyTGpNM05TSUtJQ0FnSUNBZ0lIazlJaTB6TkM0NE5qSTVPVGtpQ2lBZ0lDQWdJQ0J5ZUQwaU1DSUtJQ0FnSUNBZ0lISjVQU0l3SWdvZ0lDQWdJQ0FnYVdROUluSmxZM1F4TkRRNE1DSWdMejRLSUNBZ0lEeHdZWFJvQ2lBZ0lDQWdJQ0JrUFNKdElESTBPUzQwTmpRc0xUTTBMamcyTXlCb0lEUXpMakE0T1NCV0lEZ3VNakkySUdnZ0xUUXpMakE0T1NCNklnb2dJQ0FnSUNBZ2FXUTlJbkJoZEdneE5EUTRNaUlLSUNBZ0lDQWdJR2x1YTNOallYQmxPbU52Ym01bFkzUnZjaTFqZFhKMllYUjFjbVU5SWpBaUNpQWdJQ0FnSUNCemRIbHNaVDBpWm1sc2JEb2pabVptWm1abUlpQXZQZ29nSUNBZ1BISmxZM1FLSUNBZ0lDQWdJSGRwWkhSb1BTSTBNeTR3T0Rrd01ERWlDaUFnSUNBZ0lDQm9aV2xuYUhROUlqUXpMakE0T1RBd01TSUtJQ0FnSUNBZ0lIZzlJakk1TWk0MU5UTTVPU0lLSUNBZ0lDQWdJSGs5SWkwek5DNDROakk1T1RraUNpQWdJQ0FnSUNCeWVEMGlNQ0lLSUNBZ0lDQWdJSEo1UFNJd0lnb2dJQ0FnSUNBZ2FXUTlJbkpsWTNReE5EUTROQ0lnTHo0S0lDQWdJRHh3WVhSb0NpQWdJQ0FnSUNCa1BTSnRJRE16TlM0Mk5ETXNMVE0wTGpnMk15Qm9JRFF6TGpBNE9TQldJRGd1TWpJMklHZ2dMVFF6TGpBNE9TQjZJZ29nSUNBZ0lDQWdhV1E5SW5CaGRHZ3hORFE0TmlJS0lDQWdJQ0FnSUdsdWEzTmpZWEJsT21OdmJtNWxZM1J2Y2kxamRYSjJZWFIxY21VOUlqQWlDaUFnSUNBZ0lDQnpkSGxzWlQwaVptbHNiRG9qWm1abVptWm1JaUF2UGdvZ0lDQWdQR2NLSUNBZ0lDQWdJSFJ5WVc1elptOXliVDBpZEhKaGJuTnNZWFJsS0RNME5pNDVPRElzTWpFMkxqUXdNaWtpQ2lBZ0lDQWdJQ0JwWkQwaVp6RTBOVEEwSWo0S0lDQWdJQ0FnUEhKbFkzUUtJQ0FnSUNBZ0lDQWdjbms5SWpBaUNpQWdJQ0FnSUNBZ0lISjRQU0l3SWdvZ0lDQWdJQ0FnSUNCNVBTSXRNakE0TGpFM05UazVJZ29nSUNBZ0lDQWdJQ0I0UFNJdE1URXVNek01SWdvZ0lDQWdJQ0FnSUNCb1pXbG5hSFE5SWpRekxqQTRPVEF3TVNJS0lDQWdJQ0FnSUNBZ2QybGtkR2c5SWpRekxqQTRPVEF3TVNJS0lDQWdJQ0FnSUNBZ2FXUTlJbkpsWTNReE5EUTRPQ0lnTHo0S0lDQWdJQ0FnUEhCaGRHZ0tJQ0FnSUNBZ0lDQWdaRDBpYlNBdE5UUXVOREk1TEMweU1EZ3VNVGMySUdnZ05ETXVNRGc1SUhZZ05ETXVNRGc1SUdnZ0xUUXpMakE0T1NCNklnb2dJQ0FnSUNBZ0lDQnBaRDBpY0dGMGFERTBORGt3SWdvZ0lDQWdJQ0FnSUNCcGJtdHpZMkZ3WlRwamIyNXVaV04wYjNJdFkzVnlkbUYwZFhKbFBTSXdJZ29nSUNBZ0lDQWdJQ0J6ZEhsc1pUMGlabWxzYkRvalptWm1abVptSWlBdlBnb2dJQ0FnSUNBOGNtVmpkQW9nSUNBZ0lDQWdJQ0J5ZVQwaU1DSUtJQ0FnSUNBZ0lDQWdjbmc5SWpBaUNpQWdJQ0FnSUNBZ0lIazlJaTB5TURndU1UYzFPVGtpQ2lBZ0lDQWdJQ0FnSUhnOUlpMDVOeTQxTVRjNU9UZ2lDaUFnSUNBZ0lDQWdJR2hsYVdkb2REMGlORE11TURnNU1EQXhJZ29nSUNBZ0lDQWdJQ0IzYVdSMGFEMGlORE11TURnNU1EQXhJZ29nSUNBZ0lDQWdJQ0JwWkQwaWNtVmpkREUwTkRreUlpQXZQZ29nSUNBZ0lDQThjR0YwYUFvZ0lDQWdJQ0FnSUNCa1BTSnRJQzB4TkRBdU5qQTNMQzB5TURndU1UYzJJR2dnTkRNdU1EZzVJSFlnTkRNdU1EZzVJR2dnTFRRekxqQTRPU0I2SWdvZ0lDQWdJQ0FnSUNCcFpEMGljR0YwYURFME5EazBJZ29nSUNBZ0lDQWdJQ0JwYm10elkyRndaVHBqYjI1dVpXTjBiM0l0WTNWeWRtRjBkWEpsUFNJd0lnb2dJQ0FnSUNBZ0lDQnpkSGxzWlQwaVptbHNiRG9qWm1abVptWm1JaUF2UGdvZ0lDQWdJQ0E4Y21WamRBb2dJQ0FnSUNBZ0lDQnllVDBpTUNJS0lDQWdJQ0FnSUNBZ2NuZzlJakFpQ2lBZ0lDQWdJQ0FnSUhrOUlpMHlNRGd1TVRjMU9Ua2lDaUFnSUNBZ0lDQWdJSGc5SWkweE9ETXVOamsySWdvZ0lDQWdJQ0FnSUNCb1pXbG5hSFE5SWpRekxqQTRPVEF3TVNJS0lDQWdJQ0FnSUNBZ2QybGtkR2c5SWpRekxqQTRPVEF3TVNJS0lDQWdJQ0FnSUNBZ2FXUTlJbkpsWTNReE5EUTVOaUlnTHo0S0lDQWdJQ0FnUEhCaGRHZ0tJQ0FnSUNBZ0lDQWdaRDBpYlNBdE1qSTJMamM0Tml3dE1qQTRMakUzTmlCb0lEUXpMakE0T1NCMklEUXpMakE0T1NCb0lDMDBNeTR3T0RrZ2VpSUtJQ0FnSUNBZ0lDQWdhV1E5SW5CaGRHZ3hORFE1T0NJS0lDQWdJQ0FnSUNBZ2FXNXJjMk5oY0dVNlkyOXVibVZqZEc5eUxXTjFjblpoZEhWeVpUMGlNQ0lLSUNBZ0lDQWdJQ0FnYzNSNWJHVTlJbVpwYkd3NkkyWm1abVptWmlJZ0x6NEtJQ0FnSUNBZ1BISmxZM1FLSUNBZ0lDQWdJQ0FnY25rOUlqQWlDaUFnSUNBZ0lDQWdJSEo0UFNJd0lnb2dJQ0FnSUNBZ0lDQjVQU0l0TWpBNExqRTNOVGs1SWdvZ0lDQWdJQ0FnSUNCNFBTSXRNalk1TGpnM05TSUtJQ0FnSUNBZ0lDQWdhR1ZwWjJoMFBTSTBNeTR3T0Rrd01ERWlDaUFnSUNBZ0lDQWdJSGRwWkhSb1BTSTBNeTR3T0Rrd01ERWlDaUFnSUNBZ0lDQWdJR2xrUFNKeVpXTjBNVFExTURBaUlDOCtDaUFnSUNBZ0lEeHdZWFJvQ2lBZ0lDQWdJQ0FnSUdROUltMGdMVE14TWk0NU5qUXNMVEl3T0M0eE56WWdhQ0EwTXk0d09Ea2dkaUEwTXk0d09Ea2dhQ0F0TkRNdU1EZzVJSG9pQ2lBZ0lDQWdJQ0FnSUdsa1BTSndZWFJvTVRRMU1ESWlDaUFnSUNBZ0lDQWdJR2x1YTNOallYQmxPbU52Ym01bFkzUnZjaTFqZFhKMllYUjFjbVU5SWpBaUNpQWdJQ0FnSUNBZ0lITjBlV3hsUFNKbWFXeHNPaU5tWm1abVptWWlJQzgrQ2lBZ0lDQThMMmMrQ2lBZ1BDOW5QZ284TDNOMlp6NEtcIixcbiAgIFwiaWRcIjogMSxcbiAgIFwid2lkdGhcIjogMyxcbiAgIFwiaGVpZ2h0XCI6IDNcbiAgfSxcbiAge1xuICAgXCJ0eXBlXCI6IFwic3ZnXCIsXG4gICBcImltZ1wiOiBcImRhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsUEQ5NGJXd2dkbVZ5YzJsdmJqMGlNUzR3SWlCbGJtTnZaR2x1WnowaVZWUkdMVGdpSUhOMFlXNWtZV3h2Ym1VOUltNXZJajgrQ2p4emRtY0tJQ0FnZUcxc2JuTTZaR005SW1oMGRIQTZMeTl3ZFhKc0xtOXlaeTlrWXk5bGJHVnRaVzUwY3k4eExqRXZJZ29nSUNCNGJXeHVjenBqWXowaWFIUjBjRG92TDJOeVpXRjBhWFpsWTI5dGJXOXVjeTV2Y21jdmJuTWpJZ29nSUNCNGJXeHVjenB5WkdZOUltaDBkSEE2THk5M2QzY3Vkek11YjNKbkx6RTVPVGt2TURJdk1qSXRjbVJtTFhONWJuUmhlQzF1Y3lNaUNpQWdJSGh0Ykc1ek9uTjJaejBpYUhSMGNEb3ZMM2QzZHk1M015NXZjbWN2TWpBd01DOXpkbWNpQ2lBZ0lIaHRiRzV6UFNKb2RIUndPaTh2ZDNkM0xuY3pMbTl5Wnk4eU1EQXdMM04yWnlJS0lDQWdhV1E5SW5OMlp6RXpNelEwSWdvZ0lDQjJaWEp6YVc5dVBTSXhMakVpQ2lBZ0lIWnBaWGRDYjNnOUlqQWdNQ0F5TVRBZ01qRXdJZ29nSUNCb1pXbG5hSFE5SWpJeE1HMXRJZ29nSUNCM2FXUjBhRDBpTWpFd2JXMGlQZ29nSUR4a1pXWnpDaUFnSUNBZ2FXUTlJbVJsWm5NeE16TXpPQ0lnTHo0S0lDQThiV1YwWVdSaGRHRUtJQ0FnSUNCcFpEMGliV1YwWVdSaGRHRXhNek0wTVNJK0NpQWdJQ0E4Y21SbU9sSkVSajRLSUNBZ0lDQWdQR05qT2xkdmNtc0tJQ0FnSUNBZ0lDQWdjbVJtT21GaWIzVjBQU0lpUGdvZ0lDQWdJQ0FnSUR4a1l6cG1iM0p0WVhRK2FXMWhaMlV2YzNabkszaHRiRHd2WkdNNlptOXliV0YwUGdvZ0lDQWdJQ0FnSUR4a1l6cDBlWEJsQ2lBZ0lDQWdJQ0FnSUNBZ2NtUm1PbkpsYzI5MWNtTmxQU0pvZEhSd09pOHZjSFZ5YkM1dmNtY3ZaR012WkdOdGFYUjVjR1V2VTNScGJHeEpiV0ZuWlNJZ0x6NEtJQ0FnSUNBZ0lDQThaR002ZEdsMGJHVStQQzlrWXpwMGFYUnNaVDRLSUNBZ0lDQWdQQzlqWXpwWGIzSnJQZ29nSUNBZ1BDOXlaR1k2VWtSR1Bnb2dJRHd2YldWMFlXUmhkR0UrQ2lBZ1BHY0tJQ0FnSUNCMGNtRnVjMlp2Y20wOUluUnlZVzV6YkdGMFpTZ3dMQzA0TnlraUNpQWdJQ0FnYVdROUlteGhlV1Z5TVNJK0NpQWdJQ0E4Y0dGMGFBb2dJQ0FnSUNBZ2FXUTlJbkJoZEdnMk5qWXpJZ29nSUNBZ0lDQWdjM1I1YkdVOUltWnBiR3c2SXpka09HVmhOVHRtYVd4c0xYSjFiR1U2WlhabGJtOWtaRHR6ZEhKdmEyVTZJekpqTW1FeU9UdHpkSEp2YTJVdGQybGtkR2c2TkM0eE1EQXdORE16TzNOMGNtOXJaUzFzYVc1bFkyRndPbUoxZEhRN2MzUnliMnRsTFd4cGJtVnFiMmx1T20xcGRHVnlPM04wY205clpTMWtZWE5vWVhKeVlYazZibTl1WlNJS0lDQWdJQ0FnSUdROUltMGdNakF6TGpVME9UYzNMREkyTVM0d01EYzVOQ0IySURJMUxqZzNNamd6SUhFZ01DdzRMak0wTmpFM0lDMDRMakkzTnpNekxEZ3VNelEyTVRjZ1NDQXhOUzQwTlRnd05UWWdjU0F0T0M0eU56Y3pNaXd3SUMwNExqSTNOek15TEMwNExqTTBOakUzSUhZZ0xUSTFMamczTWpneklIRWdNQ3d0T0M0ek5EWXhOeUE0TGpJM056TXlMQzA0TGpNME5qRTNJRWdnTVRrMUxqSTNNalEwSUhFZ09DNHlOemN6TXl3d0lEZ3VNamMzTXpNc09DNHpORFl4TnlCNklpQXZQZ29nSUNBZ1BIQmhkR2dLSUNBZ0lDQWdJR2xrUFNKd1lYUm9OalkyTlNJS0lDQWdJQ0FnSUhOMGVXeGxQU0ptYVd4c09pTTBPVFE0TkRnN1ptbHNiQzF5ZFd4bE9tVjJaVzV2WkdRN2MzUnliMnRsT2lNeVl6SmhNams3YzNSeWIydGxMWGRwWkhSb09qUXVNVEF3TURRek16dHpkSEp2YTJVdGJHbHVaV05oY0RwaWRYUjBPM04wY205clpTMXNhVzVsYW05cGJqcHRhWFJsY2p0emRISnZhMlV0WkdGemFHRnljbUY1T201dmJtVWlDaUFnSUNBZ0lDQmtQU0p0SURFNU55NHlOemd3TlN3eU5UVXVNVFE0TnpRZ2RpQXpOeTQxT1RVNU55QnhJREFzTWk0ek1qZ3pJQzB5TGpNd09UQTVMREl1TXpJNE15Qm9JQzB3TGpVeE1EWTRJSEVnTFRJdU16QTVNRGtzTUNBdE1pNHpNRGt3T1N3dE1pNHpNamd6SUhZZ0xUTTNMalU1TlRrM0lIRWdNQ3d0TWk0ek1qZ3pJREl1TXpBNU1Ea3NMVEl1TXpJNE15Qm9JREF1TlRFd05qZ2djU0F5TGpNd09UQTVMREFnTWk0ek1Ea3dPU3d5TGpNeU9ETWdlaUlnTHo0S0lDQWdJRHh3WVhSb0NpQWdJQ0FnSUNCcFpEMGljR0YwYURZMk5qY2lDaUFnSUNBZ0lDQnpkSGxzWlQwaVptbHNiRG9qTkRrME9EUTRPMlpwYkd3dGNuVnNaVHBsZG1WdWIyUmtPM04wY205clpUb2pNbU15WVRJNU8zTjBjbTlyWlMxM2FXUjBhRG8wTGpFd01EQTBNek03YzNSeWIydGxMV3hwYm1WallYQTZZblYwZER0emRISnZhMlV0YkdsdVpXcHZhVzQ2YldsMFpYSTdjM1J5YjJ0bExXUmhjMmhoY25KaGVUcHViMjVsSWdvZ0lDQWdJQ0FnWkQwaWJTQXhOemN1TmpJNE5qY3NNalV5TGpneU1EUTBJSFlnTkRJdU1qVXlOVGNnYUNBdE5TNHhNamc0TmlCMklDMDBNaTR5TlRJMU55QjZJaUF2UGdvZ0lDQWdQSEJoZEdnS0lDQWdJQ0FnSUdsa1BTSndZWFJvTmpZMk9TSUtJQ0FnSUNBZ0lITjBlV3hsUFNKbWFXeHNPaU0wT1RRNE5EZzdabWxzYkMxeWRXeGxPbVYyWlc1dlpHUTdjM1J5YjJ0bE9pTXlZekpoTWprN2MzUnliMnRsTFhkcFpIUm9PalF1TVRBd01EUXpNenR6ZEhKdmEyVXRiR2x1WldOaGNEcGlkWFIwTzNOMGNtOXJaUzFzYVc1bGFtOXBianB0YVhSbGNqdHpkSEp2YTJVdFpHRnphR0Z5Y21GNU9tNXZibVVpQ2lBZ0lDQWdJQ0JrUFNKdElERTFOeTQ0TkRBek5Td3lOVEl1T0RJd05EUWdkaUEwTWk0eU5USTFOeUJvSUMwMUxqRXlPRGczSUhZZ0xUUXlMakkxTWpVM0lIb2lJQzgrQ2lBZ0lDQThjR0YwYUFvZ0lDQWdJQ0FnYVdROUluQmhkR2cyTmpjeElnb2dJQ0FnSUNBZ2MzUjViR1U5SW1acGJHdzZJelE1TkRnME9EdG1hV3hzTFhKMWJHVTZaWFpsYm05a1pEdHpkSEp2YTJVNkl6SmpNbUV5T1R0emRISnZhMlV0ZDJsa2RHZzZOQzR4TURBd05ETXpPM04wY205clpTMXNhVzVsWTJGd09tSjFkSFE3YzNSeWIydGxMV3hwYm1WcWIybHVPbTFwZEdWeU8zTjBjbTlyWlMxa1lYTm9ZWEp5WVhrNmJtOXVaU0lLSUNBZ0lDQWdJR1E5SW0wZ01UTTNMamd3TlN3eU5USXVPREl3TkRRZ2RpQTBNaTR5TlRJMU55Qm9JQzAxTGpFeU9EZzJJSFlnTFRReUxqSTFNalUzSUhvaUlDOCtDaUFnSUNBOGNHRjBhQW9nSUNBZ0lDQWdhV1E5SW5CaGRHZzJOamN6SWdvZ0lDQWdJQ0FnYzNSNWJHVTlJbVpwYkd3Nkl6UTVORGcwT0R0bWFXeHNMWEoxYkdVNlpYWmxibTlrWkR0emRISnZhMlU2SXpKak1tRXlPVHR6ZEhKdmEyVXRkMmxrZEdnNk5DNHhNREF3TkRNek8zTjBjbTlyWlMxc2FXNWxZMkZ3T21KMWRIUTdjM1J5YjJ0bExXeHBibVZxYjJsdU9tMXBkR1Z5TzNOMGNtOXJaUzFrWVhOb1lYSnlZWGs2Ym05dVpTSUtJQ0FnSUNBZ0lHUTlJbTBnTVRFNExqRTFOVFl5TERJMU1pNDRNakEwTkNCMklEUXlMakkxTWpVM0lHZ2dMVFV1TVRJNE9EUWdkaUF0TkRJdU1qVXlOVGNnZWlJZ0x6NEtJQ0FnSUR4d1lYUm9DaUFnSUNBZ0lDQnBaRDBpY0dGMGFEWTJOelVpQ2lBZ0lDQWdJQ0J6ZEhsc1pUMGlabWxzYkRvak5EazBPRFE0TzJacGJHd3RjblZzWlRwbGRtVnViMlJrTzNOMGNtOXJaVG9qTW1NeVlUSTVPM04wY205clpTMTNhV1IwYURvMExqRXdNREEwTXpNN2MzUnliMnRsTFd4cGJtVmpZWEE2WW5WMGREdHpkSEp2YTJVdGJHbHVaV3B2YVc0NmJXbDBaWEk3YzNSeWIydGxMV1JoYzJoaGNuSmhlVHB1YjI1bElnb2dJQ0FnSUNBZ1pEMGliU0E1T0M0ek5qY3lPVFlzTWpVeUxqZ3lNRFEwSUhZZ05ESXVNalV5TlRjZ2FDQXROUzR4TWpnNE55QjJJQzAwTWk0eU5USTFOeUI2SWlBdlBnb2dJQ0FnUEhCaGRHZ0tJQ0FnSUNBZ0lHbGtQU0p3WVhSb05qWTNOeUlLSUNBZ0lDQWdJSE4wZVd4bFBTSm1hV3hzT2lNME9UUTRORGc3Wm1sc2JDMXlkV3hsT21WMlpXNXZaR1E3YzNSeWIydGxPaU15WXpKaE1qazdjM1J5YjJ0bExYZHBaSFJvT2pRdU1UQXdNRFF6TXp0emRISnZhMlV0YkdsdVpXTmhjRHBpZFhSME8zTjBjbTlyWlMxc2FXNWxhbTlwYmpwdGFYUmxjanR6ZEhKdmEyVXRaR0Z6YUdGeWNtRjVPbTV2Ym1VaUNpQWdJQ0FnSUNCa1BTSnRJRGM0TGpBd056VTJOaXd5TlRJdU9ESXdORFFnZGlBME1pNHlOVEkxTnlCb0lDMDFMakV5T0RnMklIWWdMVFF5TGpJMU1qVTNJSG9pSUM4K0NpQWdJQ0E4Y0dGMGFBb2dJQ0FnSUNBZ2FXUTlJbkJoZEdnMk5qYzVJZ29nSUNBZ0lDQWdjM1I1YkdVOUltWnBiR3c2SXpRNU5EZzBPRHRtYVd4c0xYSjFiR1U2WlhabGJtOWtaRHR6ZEhKdmEyVTZJekpqTW1FeU9UdHpkSEp2YTJVdGQybGtkR2c2TkM0eE1EQXdORE16TzNOMGNtOXJaUzFzYVc1bFkyRndPbUoxZEhRN2MzUnliMnRsTFd4cGJtVnFiMmx1T20xcGRHVnlPM04wY205clpTMWtZWE5vWVhKeVlYazZibTl1WlNJS0lDQWdJQ0FnSUdROUltMGdOVGd1TXpVNE1UZzJMREkxTWk0NE1qQTBOQ0IySURReUxqSTFNalUzSUdnZ0xUVXVNVEk0T0RZZ2RpQXROREl1TWpVeU5UY2dlaUlnTHo0S0lDQWdJRHh3WVhSb0NpQWdJQ0FnSUNCcFpEMGljR0YwYURZMk9ERWlDaUFnSUNBZ0lDQnpkSGxzWlQwaVptbHNiRG9qTkRrME9EUTRPMlpwYkd3dGNuVnNaVHBsZG1WdWIyUmtPM04wY205clpUb2pNbU15WVRJNU8zTjBjbTlyWlMxM2FXUjBhRG8wTGpFd01EQTBNek03YzNSeWIydGxMV3hwYm1WallYQTZZblYwZER0emRISnZhMlV0YkdsdVpXcHZhVzQ2YldsMFpYSTdjM1J5YjJ0bExXUmhjMmhoY25KaGVUcHViMjVsSWdvZ0lDQWdJQ0FnWkQwaWJTQXpPQzQxTmprNE5EWXNNalV5TGpneU1EUTBJSFlnTkRJdU1qVXlOVGNnYUNBdE5TNHhNamc0TlNCMklDMDBNaTR5TlRJMU55QjZJaUF2UGdvZ0lDQWdQSEJoZEdnS0lDQWdJQ0FnSUdsa1BTSndZWFJvTmpZNE15SUtJQ0FnSUNBZ0lITjBlV3hsUFNKbWFXeHNPaU0wT1RRNE5EZzdabWxzYkMxeWRXeGxPbVYyWlc1dlpHUTdjM1J5YjJ0bE9pTXlZekpoTWprN2MzUnliMnRsTFhkcFpIUm9PalF1TVRBd01EUXpNenR6ZEhKdmEyVXRiR2x1WldOaGNEcGlkWFIwTzNOMGNtOXJaUzFzYVc1bGFtOXBianB0YVhSbGNqdHpkSEp2YTJVdFpHRnphR0Z5Y21GNU9tNXZibVVpQ2lBZ0lDQWdJQ0JrUFNKdElERTRMalExTnpNNE5pd3lOVFF1T1RZMk5qUWdkaUF6Tnk0NU5qQXhOeUJ4SURBc01pNHhORFl5SUMweUxqRXlPRFVzTWk0eE5EWXlJR2dnTFRBdU9EY3hPRGtnY1NBdE1pNHhNamcwT0N3d0lDMHlMakV5T0RRNExDMHlMakUwTmpJZ2RpQXRNemN1T1RZd01UY2djU0F3TEMweUxqRTBOaklnTWk0eE1qZzBPQ3d0TWk0eE5EWXlJR2dnTUM0NE56RTRPU0J4SURJdU1USTROU3d3SURJdU1USTROU3d5TGpFME5qSWdlaUlnTHo0S0lDQWdJRHh3WVhSb0NpQWdJQ0FnSUNCcFpEMGljR0YwYURZMk9EVWlDaUFnSUNBZ0lDQnpkSGxzWlQwaVptbHNiRG9qTjJRNFpXRTFPMlpwYkd3dGNuVnNaVHBsZG1WdWIyUmtPM04wY205clpUb2pNbU15WVRJNU8zTjBjbTlyWlMxM2FXUjBhRG8wTGpFd01EQTBNek03YzNSeWIydGxMV3hwYm1WallYQTZZblYwZER0emRISnZhMlV0YkdsdVpXcHZhVzQ2YldsMFpYSTdjM1J5YjJ0bExXUmhjMmhoY25KaGVUcHViMjVsSWdvZ0lDQWdJQ0FnWkQwaWJTQXlNRE11TlRRNU56Y3NPVGN1TnpJd05EWWdkaUF5TlM0NE56STRNeUJ4SURBc09DNHpORFl4TnlBdE9DNHlOemN6TXl3NExqTTBOakUzSUVnZ01UVXVORFU0TURVMklIRWdMVGd1TWpjM016SXNNQ0F0T0M0eU56Y3pNaXd0T0M0ek5EWXhOeUJXSURrM0xqY3lNRFEySUhFZ01Dd3RPQzR6TkRZeE56SWdPQzR5Tnpjek1pd3RPQzR6TkRZeE56SWdTQ0F4T1RVdU1qY3lORFFnY1NBNExqSTNOek16TERBZ09DNHlOemN6TXl3NExqTTBOakUzTWlCNklpQXZQZ29nSUNBZ1BIQmhkR2dLSUNBZ0lDQWdJR2xrUFNKd1lYUm9Oalk0TnlJS0lDQWdJQ0FnSUhOMGVXeGxQU0ptYVd4c09pTTBPVFE0TkRnN1ptbHNiQzF5ZFd4bE9tVjJaVzV2WkdRN2MzUnliMnRsT2lNeVl6SmhNams3YzNSeWIydGxMWGRwWkhSb09qUXVNVEF3TURRek16dHpkSEp2YTJVdGJHbHVaV05oY0RwaWRYUjBPM04wY205clpTMXNhVzVsYW05cGJqcHRhWFJsY2p0emRISnZhMlV0WkdGemFHRnljbUY1T201dmJtVWlDaUFnSUNBZ0lDQmtQU0p0SURFNU55NHlOemd3TlN3NU1TNDROakV5TlRrZ2RpQXpOeTQxT1RVNU56RWdjU0F3TERJdU16STRNamtnTFRJdU16QTVNRGtzTWk0ek1qZ3lPU0JvSUMwd0xqVXhNRFk0SUhFZ0xUSXVNekE1TURrc01DQXRNaTR6TURrd09Td3RNaTR6TWpneU9TQldJRGt4TGpnMk1USTFPU0J4SURBc0xUSXVNekk0TWprMklESXVNekE1TURrc0xUSXVNekk0TWprMklHZ2dNQzQxTVRBMk9DQnhJREl1TXpBNU1Ea3NNQ0F5TGpNd09UQTVMREl1TXpJNE1qazJJSG9pSUM4K0NpQWdJQ0E4Y0dGMGFBb2dJQ0FnSUNBZ2FXUTlJbkJoZEdnMk5qZzVJZ29nSUNBZ0lDQWdjM1I1YkdVOUltWnBiR3c2SXpRNU5EZzBPRHRtYVd4c0xYSjFiR1U2WlhabGJtOWtaRHR6ZEhKdmEyVTZJekpqTW1FeU9UdHpkSEp2YTJVdGQybGtkR2c2TkM0eE1EQXdORE16TzNOMGNtOXJaUzFzYVc1bFkyRndPbUoxZEhRN2MzUnliMnRsTFd4cGJtVnFiMmx1T20xcGRHVnlPM04wY205clpTMWtZWE5vWVhKeVlYazZibTl1WlNJS0lDQWdJQ0FnSUdROUltMGdNVGMzTGpZeU9EWTNMRGc1TGpVek1qazJNeUIySURReUxqSTFNalUxTnlCb0lDMDFMakV5T0RnMklGWWdPRGt1TlRNeU9UWXpJRm9pSUM4K0NpQWdJQ0E4Y0dGMGFBb2dJQ0FnSUNBZ2FXUTlJbkJoZEdnMk5qa3hJZ29nSUNBZ0lDQWdjM1I1YkdVOUltWnBiR3c2SXpRNU5EZzBPRHRtYVd4c0xYSjFiR1U2WlhabGJtOWtaRHR6ZEhKdmEyVTZJekpqTW1FeU9UdHpkSEp2YTJVdGQybGtkR2c2TkM0eE1EQXdORE16TzNOMGNtOXJaUzFzYVc1bFkyRndPbUoxZEhRN2MzUnliMnRsTFd4cGJtVnFiMmx1T20xcGRHVnlPM04wY205clpTMWtZWE5vWVhKeVlYazZibTl1WlNJS0lDQWdJQ0FnSUdROUltMGdNVFUzTGpnME1ETTFMRGc1TGpVek1qazJNeUIySURReUxqSTFNalUxTnlCb0lDMDFMakV5T0RnM0lGWWdPRGt1TlRNeU9UWXpJRm9pSUM4K0NpQWdJQ0E4Y0dGMGFBb2dJQ0FnSUNBZ2FXUTlJbkJoZEdnMk5qa3pJZ29nSUNBZ0lDQWdjM1I1YkdVOUltWnBiR3c2SXpRNU5EZzBPRHRtYVd4c0xYSjFiR1U2WlhabGJtOWtaRHR6ZEhKdmEyVTZJekpqTW1FeU9UdHpkSEp2YTJVdGQybGtkR2c2TkM0eE1EQXdORE16TzNOMGNtOXJaUzFzYVc1bFkyRndPbUoxZEhRN2MzUnliMnRsTFd4cGJtVnFiMmx1T20xcGRHVnlPM04wY205clpTMWtZWE5vWVhKeVlYazZibTl1WlNJS0lDQWdJQ0FnSUdROUltMGdNVE0zTGpnd05TdzRPUzQxTXpJNU5qTWdkaUEwTWk0eU5USTFOVGNnYUNBdE5TNHhNamc0TmlCV0lEZzVMalV6TWprMk15QmFJaUF2UGdvZ0lDQWdQSEJoZEdnS0lDQWdJQ0FnSUdsa1BTSndZWFJvTmpZNU5TSUtJQ0FnSUNBZ0lITjBlV3hsUFNKbWFXeHNPaU0wT1RRNE5EZzdabWxzYkMxeWRXeGxPbVYyWlc1dlpHUTdjM1J5YjJ0bE9pTXlZekpoTWprN2MzUnliMnRsTFhkcFpIUm9PalF1TVRBd01EUXpNenR6ZEhKdmEyVXRiR2x1WldOaGNEcGlkWFIwTzNOMGNtOXJaUzFzYVc1bGFtOXBianB0YVhSbGNqdHpkSEp2YTJVdFpHRnphR0Z5Y21GNU9tNXZibVVpQ2lBZ0lDQWdJQ0JrUFNKdElERXhPQzR4TlRVMk1pdzRPUzQxTXpJNU5qTWdkaUEwTWk0eU5USTFOVGNnYUNBdE5TNHhNamc0TkNCV0lEZzVMalV6TWprMk15QmFJaUF2UGdvZ0lDQWdQSEJoZEdnS0lDQWdJQ0FnSUdsa1BTSndZWFJvTmpZNU55SUtJQ0FnSUNBZ0lITjBlV3hsUFNKbWFXeHNPaU0wT1RRNE5EZzdabWxzYkMxeWRXeGxPbVYyWlc1dlpHUTdjM1J5YjJ0bE9pTXlZekpoTWprN2MzUnliMnRsTFhkcFpIUm9PalF1TVRBd01EUXpNenR6ZEhKdmEyVXRiR2x1WldOaGNEcGlkWFIwTzNOMGNtOXJaUzFzYVc1bGFtOXBianB0YVhSbGNqdHpkSEp2YTJVdFpHRnphR0Z5Y21GNU9tNXZibVVpQ2lBZ0lDQWdJQ0JrUFNKdElEazRMak0yTnpJNU5pdzRPUzQxTXpJNU5qTWdkaUEwTWk0eU5USTFOVGNnYUNBdE5TNHhNamc0TnlCV0lEZzVMalV6TWprMk15QmFJaUF2UGdvZ0lDQWdQSEJoZEdnS0lDQWdJQ0FnSUdsa1BTSndZWFJvTmpZNU9TSUtJQ0FnSUNBZ0lITjBlV3hsUFNKbWFXeHNPaU0wT1RRNE5EZzdabWxzYkMxeWRXeGxPbVYyWlc1dlpHUTdjM1J5YjJ0bE9pTXlZekpoTWprN2MzUnliMnRsTFhkcFpIUm9PalF1TVRBd01EUXpNenR6ZEhKdmEyVXRiR2x1WldOaGNEcGlkWFIwTzNOMGNtOXJaUzFzYVc1bGFtOXBianB0YVhSbGNqdHpkSEp2YTJVdFpHRnphR0Z5Y21GNU9tNXZibVVpQ2lBZ0lDQWdJQ0JrUFNKdElEYzRMakF3TnpVMk5pdzRPUzQxTXpJNU5qTWdkaUEwTWk0eU5USTFOVGNnYUNBdE5TNHhNamc0TmlCV0lEZzVMalV6TWprMk15QmFJaUF2UGdvZ0lDQWdQSEJoZEdnS0lDQWdJQ0FnSUdsa1BTSndZWFJvTmpjd01TSUtJQ0FnSUNBZ0lITjBlV3hsUFNKbWFXeHNPaU0wT1RRNE5EZzdabWxzYkMxeWRXeGxPbVYyWlc1dlpHUTdjM1J5YjJ0bE9pTXlZekpoTWprN2MzUnliMnRsTFhkcFpIUm9PalF1TVRBd01EUXpNenR6ZEhKdmEyVXRiR2x1WldOaGNEcGlkWFIwTzNOMGNtOXJaUzFzYVc1bGFtOXBianB0YVhSbGNqdHpkSEp2YTJVdFpHRnphR0Z5Y21GNU9tNXZibVVpQ2lBZ0lDQWdJQ0JrUFNKdElEVTRMak0xT0RFNE5pdzRPUzQxTXpJNU5qTWdkaUEwTWk0eU5USTFOVGNnYUNBdE5TNHhNamc0TmlCV0lEZzVMalV6TWprMk15QmFJaUF2UGdvZ0lDQWdQSEJoZEdnS0lDQWdJQ0FnSUdsa1BTSndZWFJvTmpjd015SUtJQ0FnSUNBZ0lITjBlV3hsUFNKbWFXeHNPaU0wT1RRNE5EZzdabWxzYkMxeWRXeGxPbVYyWlc1dlpHUTdjM1J5YjJ0bE9pTXlZekpoTWprN2MzUnliMnRsTFhkcFpIUm9PalF1TVRBd01EUXpNenR6ZEhKdmEyVXRiR2x1WldOaGNEcGlkWFIwTzNOMGNtOXJaUzFzYVc1bGFtOXBianB0YVhSbGNqdHpkSEp2YTJVdFpHRnphR0Z5Y21GNU9tNXZibVVpQ2lBZ0lDQWdJQ0JrUFNKdElETTRMalUyT1RnME5pdzRPUzQxTXpJNU5qTWdkaUEwTWk0eU5USTFOVGNnYUNBdE5TNHhNamc0TlNCV0lEZzVMalV6TWprMk15QmFJaUF2UGdvZ0lDQWdQSEJoZEdnS0lDQWdJQ0FnSUdsa1BTSndZWFJvTmpjd05TSUtJQ0FnSUNBZ0lITjBlV3hsUFNKbWFXeHNPaU0wT1RRNE5EZzdabWxzYkMxeWRXeGxPbVYyWlc1dlpHUTdjM1J5YjJ0bE9pTXlZekpoTWprN2MzUnliMnRsTFhkcFpIUm9PalF1TVRBd01EUXpNenR6ZEhKdmEyVXRiR2x1WldOaGNEcGlkWFIwTzNOMGNtOXJaUzFzYVc1bGFtOXBianB0YVhSbGNqdHpkSEp2YTJVdFpHRnphR0Z5Y21GNU9tNXZibVVpQ2lBZ0lDQWdJQ0JrUFNKdElERTRMalExTnpNNE5pdzVNUzQyTnpreE5qUWdkaUF6Tnk0NU5qQXhOVFlnY1NBd0xESXVNVFEyTWlBdE1pNHhNamcxTERJdU1UUTJNaUJvSUMwd0xqZzNNVGc1SUhFZ0xUSXVNVEk0TkRnc01DQXRNaTR4TWpnME9Dd3RNaTR4TkRZeUlGWWdPVEV1TmpjNU1UWTBJSEVnTUN3dE1pNHhORFl5TURFZ01pNHhNamcwT0N3dE1pNHhORFl5TURFZ2FDQXdMamczTVRnNUlIRWdNaTR4TWpnMUxEQWdNaTR4TWpnMUxESXVNVFEyTWpBeElIb2lJQzgrQ2lBZ0lDQThjR0YwYUFvZ0lDQWdJQ0FnYVdROUluQmhkR2cyTnpBM0lnb2dJQ0FnSUNBZ2MzUjViR1U5SW1acGJHdzZJekF3TmpZd01EdG1hV3hzTFhKMWJHVTZaWFpsYm05a1pEdHpkSEp2YTJVNkl6RmlNVGt4T0R0emRISnZhMlV0ZDJsa2RHZzZOUzR4TWpVd05UUXpOanR6ZEhKdmEyVXRiR2x1WldOaGNEcGlkWFIwTzNOMGNtOXJaUzFzYVc1bGFtOXBianB0YVhSbGNqdHpkSEp2YTJVdFpHRnphR0Z5Y21GNU9tNXZibVVpQ2lBZ0lDQWdJQ0JrUFNKTklESXdOeTR4TlRRMk5pd3hNVEV1TXpjMU1qWWdTQ0F6TGpBd01EQTROaUIySURRNExqWTVPVEE0SUVnZ01qQTNMakUxTkRZMklGb2lJQzgrQ2lBZ0lDQThjR0YwYUFvZ0lDQWdJQ0FnYVdROUluQmhkR2cyTnpBNUlnb2dJQ0FnSUNBZ2MzUjViR1U5SW1acGJHdzZJekF3TmpZd01EdG1hV3hzTFhKMWJHVTZaWFpsYm05a1pEdHpkSEp2YTJVNkl6RmlNVGt4T0R0emRISnZhMlV0ZDJsa2RHZzZOUzR4TWpVd05UUXpOanR6ZEhKdmEyVXRiR2x1WldOaGNEcGlkWFIwTzNOMGNtOXJaUzFzYVc1bGFtOXBianB0YVhSbGNqdHpkSEp2YTJVdFpHRnphR0Z5Y21GNU9tNXZibVVpQ2lBZ0lDQWdJQ0JrUFNKdElESXdOeTR4TlRRMk9Dd3lNalV1TWpRMU1UUWdkaUEwT0M0Mk9Ua3lNU0JJSURNdU1EQXdNRGcySUhZZ0xUUTRMalk1T1RJeElIb2lJQzgrQ2lBZ0lDQThjR0YwYUFvZ0lDQWdJQ0FnYVdROUluQmhkR2cyTnpFeElnb2dJQ0FnSUNBZ2MzUjViR1U5SW1acGJHdzZJekF3TmpZd01EdG1hV3hzTFhKMWJHVTZaWFpsYm05a1pEdHpkSEp2YTJVNkl6RmlNVGt4T0R0emRISnZhMlV0ZDJsa2RHZzZOUzR4TWpVd05UUXpOanR6ZEhKdmEyVXRiR2x1WldOaGNEcGlkWFIwTzNOMGNtOXJaUzFzYVc1bGFtOXBianB0YVhSbGNqdHpkSEp2YTJVdFpHRnphR0Z5Y21GNU9tNXZibVVpQ2lBZ0lDQWdJQ0JrUFNKTklERTNOeTR4T0RNME1pd3hNamd1TURjNU1URWdTQ0E1TGpjM05ERXlOaUJXSURJMU5pNHlOelE0T0NCSUlERTNOeTR4T0RNME1pQmFJaUF2UGdvZ0lDQWdQSEJoZEdnS0lDQWdJQ0FnSUdsa1BTSndZWFJvTmpjeE15SUtJQ0FnSUNBZ0lITjBlV3hsUFNKbWFXeHNPaU14WWpFNU1UZzdabWxzYkMxeWRXeGxPbVYyWlc1dlpHUTdjM1J5YjJ0bExYZHBaSFJvT2pBdU1UZ3dPREF3TWpRaUNpQWdJQ0FnSUNCa1BTSnRJRE0zTGpNMk5UYzVOaXd4TlRjdU9EUTRNRGdnYUNBdE1qQXVORGs1TVRZZ2NTQXRNaTR5TXpVMU1pd3dJQzB5TGpJek5UVXlMQzB5TGpJMU5ERWdkaUF0TVM0eU5UUTBNaUJ4SURBc0xUSXVNalUwTVRJZ01pNHlNelUxTWl3dE1pNHlOVFF4TWlCb0lESXdMalE1T1RFMklIRWdNaTR5TXpVMUxEQWdNaTR5TXpVMUxESXVNalUwTVRJZ2RpQXhMakkxTkRReUlIRWdNQ3d5TGpJMU5ERWdMVEl1TWpNMU5Td3lMakkxTkRFZ2VpSWdMejRLSUNBZ0lEeHdZWFJvQ2lBZ0lDQWdJQ0JwWkQwaWNHRjBhRFkzTVRVaUNpQWdJQ0FnSUNCemRIbHNaVDBpWm1sc2JEb2pNV0l4T1RFNE8yWnBiR3d0Y25Wc1pUcGxkbVZ1YjJSa08zTjBjbTlyWlMxM2FXUjBhRG93TGpFNE1EZ3dNREkwSWdvZ0lDQWdJQ0FnWkQwaWJTQXpOeTR6TmpVM09UWXNNVFkyTGpnd09ETTJJR2dnTFRJd0xqUTVPVEUySUhFZ0xUSXVNak0xTlRJc01DQXRNaTR5TXpVMU1pd3RNaTR5TlRReE1TQjJJQzB4TGpJMU5EUXpJSEVnTUN3dE1pNHlOVFF3T1NBeUxqSXpOVFV5TEMweUxqSTFOREE1SUdnZ01qQXVORGs1TVRZZ2NTQXlMakl6TlRVc01DQXlMakl6TlRVc01pNHlOVFF3T1NCMklERXVNalUwTkRNZ2NTQXdMREl1TWpVME1URWdMVEl1TWpNMU5Td3lMakkxTkRFeElIb2lJQzgrQ2lBZ0lDQThjR0YwYUFvZ0lDQWdJQ0FnYVdROUluQmhkR2cyTnpFM0lnb2dJQ0FnSUNBZ2MzUjViR1U5SW1acGJHdzZJekZpTVRreE9EdG1hV3hzTFhKMWJHVTZaWFpsYm05a1pEdHpkSEp2YTJVdGQybGtkR2c2TUM0eE9EQTRNREF5TkNJS0lDQWdJQ0FnSUdROUltMGdNemN1TXpZMU56azJMREUzTlM0ME5qUTRNaUJvSUMweU1DNDBPVGt4TmlCeElDMHlMakl6TlRVeUxEQWdMVEl1TWpNMU5USXNMVEl1TWpVME1URWdkaUF0TVM0eU5UUTBNeUJ4SURBc0xUSXVNalUwTURrZ01pNHlNelUxTWl3dE1pNHlOVFF3T1NCb0lESXdMalE1T1RFMklIRWdNaTR5TXpVMUxEQWdNaTR5TXpVMUxESXVNalUwTURrZ2RpQXhMakkxTkRReklIRWdNQ3d5TGpJMU5ERXhJQzB5TGpJek5UVXNNaTR5TlRReE1TQjZJaUF2UGdvZ0lDQWdQSEJoZEdnS0lDQWdJQ0FnSUdsa1BTSndZWFJvTmpjeE9TSUtJQ0FnSUNBZ0lITjBlV3hsUFNKbWFXeHNPaU14WWpFNU1UZzdabWxzYkMxeWRXeGxPbVYyWlc1dlpHUTdjM1J5YjJ0bExYZHBaSFJvT2pBdU1UZ3dPREF3TWpRaUNpQWdJQ0FnSUNCa1BTSnRJRE0zTGpNMk5UYzVOaXd4T0RNdU1qRXdNVE1nYUNBdE1qQXVORGs1TVRZZ2NTQXRNaTR5TXpVMU1pd3dJQzB5TGpJek5UVXlMQzB5TGpJMU5ERXhJSFlnTFRFdU1qVTBORE1nY1NBd0xDMHlMakkxTkRBNUlESXVNak0xTlRJc0xUSXVNalUwTURrZ2FDQXlNQzQwT1RreE5pQnhJREl1TWpNMU5Td3dJREl1TWpNMU5Td3lMakkxTkRBNUlIWWdNUzR5TlRRME15QnhJREFzTWk0eU5UUXhNU0F0TWk0eU16VTFMREl1TWpVME1URWdlaUlnTHo0S0lDQWdJRHh3WVhSb0NpQWdJQ0FnSUNCcFpEMGljR0YwYURZM01qRWlDaUFnSUNBZ0lDQnpkSGxzWlQwaVptbHNiRG9qTVdJeE9URTRPMlpwYkd3dGNuVnNaVHBsZG1WdWIyUmtPM04wY205clpTMTNhV1IwYURvd0xqRTRNRGd3TURJMElnb2dJQ0FnSUNBZ1pEMGliU0F6Tnk0ek5qVTNPVFlzTVRreExqY3hORGN4SUdnZ0xUSXdMalE1T1RFMklIRWdMVEl1TWpNMU5USXNNQ0F0TWk0eU16VTFNaXd0TWk0eU5UUXhNaUIySUMweExqSTFORFFnY1NBd0xDMHlMakkxTkRFeUlESXVNak0xTlRJc0xUSXVNalUwTVRJZ2FDQXlNQzQwT1RreE5pQnhJREl1TWpNMU5Td3dJREl1TWpNMU5Td3lMakkxTkRFeUlIWWdNUzR5TlRRMElIRWdNQ3d5TGpJMU5ERXlJQzB5TGpJek5UVXNNaTR5TlRReE1pQjZJaUF2UGdvZ0lDQWdQSEJoZEdnS0lDQWdJQ0FnSUdsa1BTSndZWFJvTmpjeU15SUtJQ0FnSUNBZ0lITjBlV3hsUFNKbWFXeHNPaU14WWpFNU1UZzdabWxzYkMxeWRXeGxPbVYyWlc1dlpHUTdjM1J5YjJ0bExYZHBaSFJvT2pBdU1UZ3dPREF3TWpRaUNpQWdJQ0FnSUNCa1BTSnRJRE0zTGpNMk5UYzVOaXd4T1RrdU9EYzNOVGdnYUNBdE1qQXVORGs1TVRZZ2NTQXRNaTR5TXpVMU1pd3dJQzB5TGpJek5UVXlMQzB5TGpJMU5EQTVJSFlnTFRFdU1qVTBORE1nY1NBd0xDMHlMakkxTkRBNUlESXVNak0xTlRJc0xUSXVNalUwTURrZ2FDQXlNQzQwT1RreE5pQnhJREl1TWpNMU5Td3dJREl1TWpNMU5Td3lMakkxTkRBNUlIWWdNUzR5TlRRME15QnhJREFzTWk0eU5UUXdPU0F0TWk0eU16VTFMREl1TWpVME1Ea2dlaUlnTHo0S0lDQWdJRHh3WVhSb0NpQWdJQ0FnSUNCcFpEMGljR0YwYURZM01qVWlDaUFnSUNBZ0lDQnpkSGxzWlQwaVptbHNiRG9qTVdJeE9URTRPMlpwYkd3dGNuVnNaVHBsZG1WdWIyUmtPM04wY205clpTMTNhV1IwYURvd0xqRTRNRGd3TURJMElnb2dJQ0FnSUNBZ1pEMGliU0F6Tnk0ek5qVTNPVFlzTWpBNExqZ3pOemczSUdnZ0xUSXdMalE1T1RFMklIRWdMVEl1TWpNMU5USXNNQ0F0TWk0eU16VTFNaXd0TWk0eU5UUXhNaUIySUMweExqSTFORFFnY1NBd0xDMHlMakkxTkRFeUlESXVNak0xTlRJc0xUSXVNalUwTVRJZ2FDQXlNQzQwT1RreE5pQnhJREl1TWpNMU5Td3dJREl1TWpNMU5Td3lMakkxTkRFeUlIWWdNUzR5TlRRMElIRWdNQ3d5TGpJMU5ERXlJQzB5TGpJek5UVXNNaTR5TlRReE1pQjZJaUF2UGdvZ0lDQWdQSEJoZEdnS0lDQWdJQ0FnSUdsa1BTSndZWFJvTmpjeU55SUtJQ0FnSUNBZ0lITjBlV3hsUFNKbWFXeHNPaU14WWpFNU1UZzdabWxzYkMxeWRXeGxPbVYyWlc1dlpHUTdjM1J5YjJ0bExYZHBaSFJvT2pBdU1UZ3dPREF3TWpRaUNpQWdJQ0FnSUNCa1BTSnRJRE0zTGpNMk5UYzVOaXd5TVRjdU5EazBNek1nYUNBdE1qQXVORGs1TVRZZ2NTQXRNaTR5TXpVMU1pd3dJQzB5TGpJek5UVXlMQzB5TGpJMU5ERXlJSFlnTFRFdU1qVTBOQ0J4SURBc0xUSXVNalUwTVRJZ01pNHlNelUxTWl3dE1pNHlOVFF4TWlCb0lESXdMalE1T1RFMklIRWdNaTR5TXpVMUxEQWdNaTR5TXpVMUxESXVNalUwTVRJZ2RpQXhMakkxTkRRZ2NTQXdMREl1TWpVME1USWdMVEl1TWpNMU5Td3lMakkxTkRFeUlIb2lJQzgrQ2lBZ0lDQThjR0YwYUFvZ0lDQWdJQ0FnYVdROUluQmhkR2cyTnpJNUlnb2dJQ0FnSUNBZ2MzUjViR1U5SW1acGJHdzZJekZpTVRreE9EdG1hV3hzTFhKMWJHVTZaWFpsYm05a1pEdHpkSEp2YTJVdGQybGtkR2c2TUM0eE9EQTRNREF5TkNJS0lDQWdJQ0FnSUdROUltMGdNemN1TXpZMU56azJMREl5TlM0eU16azJOQ0JvSUMweU1DNDBPVGt4TmlCeElDMHlMakl6TlRVeUxEQWdMVEl1TWpNMU5USXNMVEl1TWpVME1URWdkaUF0TVM0eU5UUTBNU0J4SURBc0xUSXVNalUwTVRFZ01pNHlNelUxTWl3dE1pNHlOVFF4TVNCb0lESXdMalE1T1RFMklIRWdNaTR5TXpVMUxEQWdNaTR5TXpVMUxESXVNalUwTVRFZ2RpQXhMakkxTkRReElIRWdNQ3d5TGpJMU5ERXhJQzB5TGpJek5UVXNNaTR5TlRReE1TQjZJaUF2UGdvZ0lDQWdQSEJoZEdnS0lDQWdJQ0FnSUdsa1BTSndZWFJvTmpjek1TSUtJQ0FnSUNBZ0lITjBlV3hsUFNKbWFXeHNPaU14WWpFNU1UZzdabWxzYkMxeWRXeGxPbVYyWlc1dlpHUTdjM1J5YjJ0bExYZHBaSFJvT2pBdU1UZ3dPREF3TWpRaUNpQWdJQ0FnSUNCa1BTSnRJRE0zTGpNMk5UYzVOaXd5TXpNdU56UTBNakVnYUNBdE1qQXVORGs1TVRZZ2NTQXRNaTR5TXpVMU1pd3dJQzB5TGpJek5UVXlMQzB5TGpJMU5EQTVJSFlnTFRFdU1qVTBORE1nY1NBd0xDMHlMakkxTkRFeElESXVNak0xTlRJc0xUSXVNalUwTVRFZ2FDQXlNQzQwT1RreE5pQnhJREl1TWpNMU5Td3dJREl1TWpNMU5Td3lMakkxTkRFeElIWWdNUzR5TlRRME15QnhJREFzTWk0eU5UUXdPU0F0TWk0eU16VTFMREl1TWpVME1Ea2dlaUlnTHo0S0lDQWdJRHh3WVhSb0NpQWdJQ0FnSUNCcFpEMGljR0YwYURZM016TWlDaUFnSUNBZ0lDQnpkSGxzWlQwaVptbHNiRG9qTURBMk5qQXdPMlpwYkd3dGNuVnNaVHBsZG1WdWIyUmtPM04wY205clpTMTNhV1IwYURvd0xqRTRNRGd3TURJMElnb2dJQ0FnSUNBZ1pEMGliU0F4TmpJdU16STROamNzTWpBNExqVXhNVGszSUhZZ01qWXVORFF4TnpVZ2FDQXRNaTQzTURnM055QjJJQzB5Tmk0ME5ERTNOU0I2SWlBdlBnb2dJQ0FnUEhCaGRHZ0tJQ0FnSUNBZ0lHbGtQU0p3WVhSb05qY3pOU0lLSUNBZ0lDQWdJSE4wZVd4bFBTSm1hV3hzT2lNd01EWTJNREE3Wm1sc2JDMXlkV3hsT21WMlpXNXZaR1E3YzNSeWIydGxMWGRwWkhSb09qQXVNVGd3T0RBd01qUWlDaUFnSUNBZ0lDQmtQU0p0SURFMk1pNHpNamcyTnl3eE5Ea3VNamd5TkRnZ2RpQXlOaTQwTkRFM05pQm9JQzB5TGpjd09EYzNJSFlnTFRJMkxqUTBNVGMySUhvaUlDOCtDaUFnSUNBOGNHRjBhQW9nSUNBZ0lDQWdhV1E5SW5CaGRHZzJOek0zSWdvZ0lDQWdJQ0FnYzNSNWJHVTlJbVpwYkd3Nkl6QXdZMk13TUR0bWFXeHNMVzl3WVdOcGRIazZNRHRtYVd4c0xYSjFiR1U2WlhabGJtOWtaRHR6ZEhKdmEyVXRkMmxrZEdnNk1DNHhPREE0TURBeU5DSUtJQ0FnSUNBZ0lHUTlJbTBnTVRVd0xqQTFOVE0yTERFME15NDJOalF6TXlBeU5DNDJOemN4Tml3dE1USXVPVE01TVRjZ2RpQXhNakl1TnpVd056Y2diQ0F0TWpRdU5qYzNNVFlzTFRFeUxqa3pPVEUySUhvaUlDOCtDaUFnSUNBOGNHRjBhQW9nSUNBZ0lDQWdhV1E5SW5CaGRHZzJOek01SWdvZ0lDQWdJQ0FnYzNSNWJHVTlJbVpwYkd3Nkl6QXdOall3TUR0bWFXeHNMWEoxYkdVNlpYWmxibTlrWkR0emRISnZhMlU2SXpGaU1Ua3hPRHR6ZEhKdmEyVXRkMmxrZEdnNk5TNHhNalV3TlRRek5qdHpkSEp2YTJVdGJHbHVaV05oY0RwaWRYUjBPM04wY205clpTMXNhVzVsYW05cGJqcHRhWFJsY2p0emRISnZhMlV0WkdGemFHRnljbUY1T201dmJtVWlDaUFnSUNBZ0lDQmtQU0p0SURFME9DNDRNalF5TlN3eE5Ua3VOalV6TkRjZ2RpQTJNeTQyTmprek1pQnhJREFzTVRjdU9EZzBOalFnTFRFM0xqY3pOekVzTVRjdU9EZzBOalFnU0NBMk1TNHdNak0zTmpZZ2NTQXRNVGN1TnpNM01Ea3NNQ0F0TVRjdU56TTNNRGtzTFRFM0xqZzRORFkwSUhZZ0xUWXpMalkyT1RNeUlIRWdNQ3d0TVRjdU9EZzBOaklnTVRjdU56TTNNRGtzTFRFM0xqZzRORFl5SUdnZ056QXVNRFl6TXpnMElIRWdNVGN1TnpNM01Td3dJREUzTGpjek56RXNNVGN1T0RnME5qSWdlaUlnTHo0S0lDQWdJRHh3WVhSb0NpQWdJQ0FnSUNCcFpEMGljR0YwYURZM05ERWlDaUFnSUNBZ0lDQnpkSGxzWlQwaVptbHNiRG9qTURBMk5qQXdPMlpwYkd3dGNuVnNaVHBsZG1WdWIyUmtPM04wY205clpUb2pNV0l4T1RFNE8zTjBjbTlyWlMxM2FXUjBhRG8xTGpFeU5UQTFORE0yTzNOMGNtOXJaUzFzYVc1bFkyRndPbUoxZEhRN2MzUnliMnRsTFd4cGJtVnFiMmx1T20xcGRHVnlPM04wY205clpTMWtZWE5vWVhKeVlYazZibTl1WlNJS0lDQWdJQ0FnSUdROUltMGdPVFl1TURVMU5EUTJMREUyTVM0ek9UVTVJR0VnTWpndU5Ua3dPREV5TERNd0xqQTVNakl6SURBZ01DQXdJQzB5T0M0MU9UQTRNU3d6TUM0d09USXlNeUF5T0M0MU9UQTRNVElzTXpBdU1Ea3lNak1nTUNBeElEQWdNamd1TlRrd09ERXNMVE13TGpBNU1qSXpJSG9pSUM4K0NpQWdJQ0E4Y0dGMGFBb2dJQ0FnSUNBZ2FXUTlJbkJoZEdnMk56UXpJZ29nSUNBZ0lDQWdjM1I1YkdVOUltWnBiR3c2SXpBd05qWXdNRHRtYVd4c0xYSjFiR1U2WlhabGJtOWtaRHR6ZEhKdmEyVTZJekZpTVRreE9EdHpkSEp2YTJVdGQybGtkR2c2TlM0eE1qVXdOVFF6Tmp0emRISnZhMlV0YkdsdVpXTmhjRHBpZFhSME8zTjBjbTlyWlMxc2FXNWxhbTlwYmpwdGFYUmxjanR6ZEhKdmEyVXRaR0Z6YUdGeWNtRjVPbTV2Ym1VaUNpQWdJQ0FnSUNCa1BTSnRJRGsyTGpBMU5UUTBOaXd4TnpJdU1UUXpNVE1nWVNBeE9DNHpOems0TURrc01Ua3VNelEwT1RrM0lEQWdNQ0F3SUMweE9DNHpOemszT1N3eE9TNHpORFVnTVRndU16YzVPREE1TERFNUxqTTBORGs1TnlBd0lERWdNQ0F4T0M0ek56azNPU3d0TVRrdU16UTFJSG9pSUM4K0NpQWdJQ0E4Y0dGMGFBb2dJQ0FnSUNBZ2FXUTlJbkJoZEdnMk56UTFJZ29nSUNBZ0lDQWdjM1I1YkdVOUltWnBiR3c2SXpBd05qWXdNRHRtYVd4c0xYSjFiR1U2WlhabGJtOWtaRHR6ZEhKdmEyVTZJekZpTVRreE9EdHpkSEp2YTJVdGQybGtkR2c2TlM0eE1qVXdOVFF6Tmp0emRISnZhMlV0YkdsdVpXTmhjRHBpZFhSME8zTjBjbTlyWlMxc2FXNWxhbTlwYmpwdGFYUmxjanR6ZEhKdmEyVXRaR0Z6YUdGeWNtRjVPbTV2Ym1VaUNpQWdJQ0FnSUNCa1BTSnRJREU1TkM0ek9UTXlPQ3d4T0RrdU9UUXhOeUIySURRdU5EY3hNVFlnY1NBd0xEWXVNalU1TmpNZ0xUWXVNakEzT1Rjc05pNHlOVGsyTXlCb0lDMDBNaTQwTmpFek5pQnhJQzAyTGpJd056azVMREFnTFRZdU1qQTNPVGtzTFRZdU1qVTVOak1nZGlBdE5DNDBOekV4TmlCeElEQXNMVFl1TWpVNU5qRWdOaTR5TURjNU9Td3ROaTR5TlRrMk1TQm9JRFF5TGpRMk1UTTJJSEVnTmk0eU1EYzVOeXd3SURZdU1qQTNPVGNzTmk0eU5UazJNU0I2SWlBdlBnb2dJQ0FnUEhCaGRHZ0tJQ0FnSUNBZ0lHbGtQU0p3WVhSb05qYzBOeUlLSUNBZ0lDQWdJSE4wZVd4bFBTSm1hV3hzT2lNd01EWTJNREE3Wm1sc2JDMXlkV3hsT21WMlpXNXZaR1E3YzNSeWIydGxPaU14WWpFNU1UZzdjM1J5YjJ0bExYZHBaSFJvT2pVdU1USTFNRFUwTXpZN2MzUnliMnRsTFd4cGJtVmpZWEE2WW5WMGREdHpkSEp2YTJVdGJHbHVaV3B2YVc0NmJXbDBaWEk3YzNSeWIydGxMV1JoYzJoaGNuSmhlVHB1YjI1bElnb2dJQ0FnSUNBZ1pEMGliU0F5TURVdU5UQTNNakVzTVRnNExqYzJOVEV4SUhZZ05pNDRNalF6T0NCeElEQXNPUzQxTlRReE5TQXRPUzQwTnpVek1pdzVMalUxTkRFMUlHZ2dMVEV4TGpZeU5qa2djU0F0T1M0ME56VXpNeXd3SUMwNUxqUTNOVE16TEMwNUxqVTFOREUxSUhZZ0xUWXVPREkwTXpnZ2NTQXdMQzA1TGpVMU5ERTJJRGt1TkRjMU16TXNMVGt1TlRVME1UWWdhQ0F4TVM0Mk1qWTVJSEVnT1M0ME56VXpNaXd3SURrdU5EYzFNeklzT1M0MU5UUXhOaUI2SWlBdlBnb2dJRHd2Wno0S1BDOXpkbWMrQ2c9PVwiLFxuICAgXCJpZFwiOiAyLFxuICAgXCJ3aWR0aFwiOiAyLFxuICAgXCJoZWlnaHRcIjogMlxuICB9LFxuICB7XG4gICBcInR5cGVcIjogXCJjb2xvclwiLFxuICAgXCJjb2xvclwiOiB7XG4gICAgXCJyXCI6IDAsXG4gICAgXCJiXCI6IDAsXG4gICAgXCJnXCI6IDBcbiAgIH0sXG4gICBcImlkXCI6IDNcbiAgfSxcbiAge1xuICAgXCJ0eXBlXCI6IFwiY29sb3JcIixcbiAgIFwiY29sb3JcIjoge1xuICAgIFwiclwiOiAyNTUsXG4gICAgXCJiXCI6IDI1NSxcbiAgICBcImdcIjogMjU1XG4gICB9LFxuICAgXCJpZFwiOiA0XG4gIH1cbiBdLFxuIFwid2lkdGhcIjogMSxcbiBcImhlaWdodFwiOiAxXG59Il19
