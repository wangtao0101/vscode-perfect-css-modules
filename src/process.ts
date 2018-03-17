var cssLoader = require('css-loader');

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

function processCss(source) {
    runLoader(cssLoader, source, undefined, {
        query: '?module&sourceMap&localIdentName=_[local]_'
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
            const requireFaker = function(){}
            const context = new Function('exports', 'module', 'require', text);
            context(exportsFaker, moduleFaker, requireFaker);
            const sourceMap = pushFaker[0][3];
            const locals = exportsFaker.locals;
            console.log(sourceMap);
            console.log(locals);
        } catch (error) {
            console.log(error);
        }
    });
}

export function process() {
    const source =
        `   /*
    * a ' above
    */

   .bg {
     background-image: url(bg.jpg);
   }

   /*
    * a ' below
    */
`
   processCss(source);
}