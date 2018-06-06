const fs = require("fs");
const fsutil = require("./_build-system/fs-util");

console.log("postinstall >>> copying ./node_modules/requirejs/require.js to ./sqlcode/wwwroot/libs/require.js");
fs.copyFileSync("./node_modules/requirejs/require.js", "./sqlcode/wwwroot/libs/require.js");

console.log("postinstall >>> destroying libs/monaco-editor/");
fsutil.rmdirSync("./sqlcode/wwwroot/libs/monaco-editor/");

const copyWalkObj = obj => {
    let from = "./" + obj.full,
    to = obj.full.replace("node_modules/", "./sqlcode/wwwroot/libs/");
    fsutil.mkDirByPathSync(obj.dir.replace("node_modules/", "./sqlcode/wwwroot/libs/"));
    console.log(`postinstall >>> copying ${from} to ${to}`);
    fs.copyFileSync(from, to);
}

for (let obj of fsutil.walkSync("./node_modules/monaco-editor/dev/vs/", [])) {
    copyWalkObj(obj);
}

for (let obj of fsutil.walkSync("./node_modules/monaco-editor/min/vs/", [])) {
    copyWalkObj(obj);
}

