const Draw = require("./Draw.js");
const CrLogic = require("./Logic.js");
const CrContr = require("./Control.js");

var def_tileset = require("./def_tileset.json");

var Logic = new CrLogic(Draw, def_tileset);
CrContr(Logic);
