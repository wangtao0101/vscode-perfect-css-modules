const cssLoader = require('css-loader/lib/localsLoader');

const camelCase = require("lodash.camelcase");

function dashesCamelCase(str) {
  return str.replace(/-+(\w)/g, function(match, firstLetter) {
    return firstLetter.toUpperCase();
  });
}

function runLoader(loader, input, map, addOptions, callback) {
    var opt = {
        options: {
            context: ""
        },
        callback: callback,
        async: function () {
            return callback;
        },
        loaders: [{ request: "/path/css-loader" }],
        loaderIndex: 0,
        context: "",
        resource: "test.css",
        resourcePath: "test.css",
        request: "css-loader!test.css",
        emitError: function (message) {
            throw new Error(message);
        }
    };
    Object.keys(addOptions).forEach(function (key) {
        opt[key] = addOptions[key];
    });
    loader.call(opt, input, map);
}

function removeImportfromSouce(source: string) {
    const first = source.indexOf('\n');
    const second = source.indexOf('\n', first + 1);
    const third = source.indexOf('\n', second + 1);
    return source.substring(third + 1, source.length);
}

function getQuery(camelCaseKey) {
    if (camelCaseKey === 'dashesOnly') {
        return '?module&camelCase=dashes&localIdentName=_[local]_';
    }
    return '?module&camelCase&localIdentName=_[local]_';
}

function compileLocals(locals, camelCaseKey) {
    const result = {};
    Object.keys(locals).map(key => {
        let targetKey;
        if (camelCaseKey === 'dashesOnly') {
            targetKey = dashesCamelCase(key);
        } else {
            targetKey = camelCase(key)
        }
        // if there is a classname b-c in css file, bC must be after b-c
        // see file: https://github.com/webpack-contrib/css-loader/blob/master/lib/compile-exports.js
        if (key !== targetKey) {
            result[targetKey] = key;
        } else {
            if (!result[targetKey]) {
                result[targetKey] = key;
            }
        }
    });
    return result;
}

export default async function getLocals(source, camelCaseKey) {
    return new Promise((resolve, reject) => {
        runLoader(cssLoader, source, undefined, {
            query: getQuery(camelCase),
        }, function (err, output) {
            try {
                if(err) {
                    console.log(err);
                    resolve({});
                }
                const moduleFaker = {
                    exports: {},
                }
                const context = new Function('module', output);
                context(moduleFaker);
                const locals = compileLocals(moduleFaker.exports, camelCaseKey);
                resolve(locals);
            } catch (error) {
                reject(error);
            }
        });
    })
}