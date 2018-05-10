var fs = require("fs");

fs.copyFileSync("./node_modules/requirejs/require.js", "./sqlcode/wwwroot/libs/require.js");
fs.copyFileSync("./node_modules/requirejs-text/text.js", "./sqlcode/wwwroot/libs/text.js");
