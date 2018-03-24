const cssLoader = require('css-loader');

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

export default async function getLocals(source) {
    return new Promise((resolve, reject) => {
        runLoader(cssLoader, source, undefined, {
            query: '?module&camelCase&localIdentName=_[local]_'
        }, function (err, output) {
            try {
                const text = removeImportfromSouce(output);

                const pushFaker = []
                const exportsFaker = {
                    push: (s) => pushFaker.push(s),
                    locals: {},
                }
                const moduleFaker = {
                    id: 1,
                }
                const requireFaker = function () { }
                const context = new Function('exports', 'module', 'require', text);
                context(exportsFaker, moduleFaker, requireFaker);
                const locals = exportsFaker.locals;
                resolve(locals)
            } catch (error) {
                reject(error);
            }
        });
    })
}