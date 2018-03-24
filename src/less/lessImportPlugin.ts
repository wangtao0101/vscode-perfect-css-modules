const less = require('less');
import * as path from 'path';
import * as fs from 'fs';

export default function LessImportPlugin() {

    class ImportFileManager extends less.FileManager {
        supports() {
            return true;
        }

        supportsSync() {
            return false;
        }

        loadFile(filename, currentDirectory, options) {
            // TODO: resolve filename in nodemodules
            const name = path.join(currentDirectory, filename);
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