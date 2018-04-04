# vscode-perfect-css-modules

An vscode extension for css-modules language server.

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
- [ ] support scss