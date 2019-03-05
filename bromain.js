const Draw = require("./Draw.js");
const CrLogic = require("./Logic.js");
const CrContr = require("./Control.js");

var Logic = new CrLogic(Draw);
CrContr(Logic);
