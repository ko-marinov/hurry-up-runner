const fs = require('fs');

class LoadResourcesWebpackPlugin {
    apply(compiler) {
        let plugin = {
            name: "LoadResourcesWebpackPlugin"
        }
        compiler.hooks.beforeRun.tap(plugin, (compiler) => {
            let filename = './src/_resources.js';
            let rcDirPath = 'assets/objects';
            let resources = fs.readdirSync(rcDirPath);

            let content = '';
            resources.forEach((rc) => {
                // cut file extension
                let varName = rc.slice(0, rc.lastIndexOf('.'));
                let extension = rc.slice(rc.lastIndexOf('.') + 1);
                if (varName == '' || extension != 'png') {
                    return;
                }
                let rcImportItem = 'import ' + varName + ' from \'../' + rcDirPath + '/' + rc + '\';\n';
                content += rcImportItem;
            });

            content += "\nexport function loadResources(scene) {\n";

            // scene.load.image('air_conditioning', air_conditioning);
            resources.forEach((rc) => {
                // cut file extension
                let varName = rc.slice(0, rc.lastIndexOf('.'));
                let extension = rc.slice(rc.lastIndexOf('.') + 1);
                if (varName == '' || extension != 'png') {
                    return;
                }
                let rcImportItem = '\tscene.load.image(\'' + varName + '\', ' + varName + ');\n';
                content += rcImportItem;
            });

            content += "}\n";
            fs.writeFileSync(filename, content);
        });
    }
}

module.exports = LoadResourcesWebpackPlugin;
