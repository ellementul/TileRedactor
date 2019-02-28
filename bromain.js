const Draw = require("./Draw.js");
const CrLogic = require("./Logic.js");
const CrContr = require("./Control.js");

var Tileset = require("./tileset.json");
var Logic = new CrLogic(Draw);
CrContr(Logic, Draw);
