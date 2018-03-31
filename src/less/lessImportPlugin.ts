const less = require('less');
import * as path from 'path';
import * as fs from 'fs';

const isModuleName = /^~[^/\\]+$/;

export default function LessImportPlugin() {

    class ImportFileManager extends less.FileManager {
        supports() {
            return true;
        }

        supportsSync() {
            return false;
        }

        loadFile(filename: string, currentDirectory, options) {
            let url: string;
            const isNpm = filename.startsWith('~');
            if (options.ext && !isModuleName.test(filename)) {
                url = this.tryAppendExtension(filename, options.ext);
            } else {
                url = filename;
            }

            let name;
            if (isNpm) {
                name = path.join(options.rootpath, 'node_modules' ,url.substr(1));
            } else {
                name = path.join(currentDirectory, url);
            }

            if (fs.existsSync(name)) {
                const data = fs.readFileSync(name, 'utf-8');
                return Promise.resolve({
                    filename: name,
                    contents: data,
                });
            }
            return Promise.reject({
                type: 'File',
                message: "'" + filename + "' wasn't found. "
            });
        }
    }

    return {
        install(lessInstance, pluginManager) {
            pluginManager.addFileManager(new ImportFileManager());
        },
        minVersion: [2, 1, 1],
    };
}