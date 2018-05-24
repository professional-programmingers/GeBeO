const tsConfigPaths = require("tsconfig-paths");
 
const baseUrl = "./src/server"; // Either absolute or relative path. If relative it's resolved to current working directory.
tsConfigPaths.register({
    baseUrl,
    paths: []
});