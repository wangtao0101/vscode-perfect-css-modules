# vscode-perfect-css-modules
[![Marketplace Version](https://vsmarketplacebadge.apphb.com/version/wangtao0101.vscode-perfect-css-modules.svg)](https://marketplace.visualstudio.com/items?itemName=wangtao0101.vscode-perfect-css-modules)
[![Installs](https://vsmarketplacebadge.apphb.com/installs/wangtao0101.vscode-perfect-css-modules.svg)](https://marketplace.visualstudio.com/items?itemName=wangtao0101.vscode-perfect-css-modules)

A vscode extension for css-modules language server.

# Feature
* autocomplete
* go to definition
* hover tooltip
* provide diagnostic

# Snapshot
## autocomplete
![GitHub Logo](https://github.com/wangtao0101/vscode-perfect-css-modules/blob/master/img/codecomplete.gif?raw=true)

## go to definition
![GitHub Logo](https://github.com/wangtao0101/vscode-perfect-css-modules/blob/master/img/goto.gif?raw=true)

## diagnostic
![GitHub Logo](https://github.com/wangtao0101/vscode-perfect-css-modules/blob/master/img/dia.gif?raw=true)

# Imports
The behavior is the same as [less loader webpack resolver](https://github.com/webpack-contrib/less-loader#imports).

You can import your Less modules from `node_modules`. Just prepend them with a `~` which tells extension to look up the [`modules`]

```less
@import "~bootstrap/less/bootstrap";
```

# Config
## perfect-css-modules.rootDir
Specifies the root directory of input files relative to project workspace, including js, ts, css, less. Defaults to ., you can set /src

## perfect-css-modules.camelCase
Export Classnames in camelOnly or dashesOnly.

## perfect-css-modules.styleFilesToScan
Glob for files to watch and scan. Defaults to **/*.{less,css}.

## perfect-css-modules.jsFilesToScan
Glob for files to watch and scan. Defaults to **/*.{js,ts,jsx,tsx}


# TODO
- [x] support js
- [x] support ts
- [x] support less
- [x] support css
- [ ] support sass