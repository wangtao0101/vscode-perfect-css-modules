# vscode-perfect-css-modules
[![Marketplace Version](https://vsmarketplacebadge.apphb.com/version/wangtao0101.vscode-perfect-css-modules.svg)](https://marketplace.visualstudio.com/items?itemName=wangtao0101.vscode-perfect-css-modules)
[![Installs](https://vsmarketplacebadge.apphb.com/installs/wangtao0101.vscode-perfect-css-modules.svg)](https://marketplace.visualstudio.com/items?itemName=wangtao0101.vscode-perfect-css-modules)

A vscode extension for css-modules language server.

# Feature
* autocomplete
* go to definition
* hover tooltip
* provide diagnostic
* support vue scf

# Snapshot
## autocomplete
![GitHub Logo](https://github.com/wangtao0101/vscode-perfect-css-modules/blob/master/img/codecomplete.gif?raw=true)

## go to definition
![GitHub Logo](https://github.com/wangtao0101/vscode-perfect-css-modules/blob/master/img/goto.gif?raw=true)

## diagnostic
![GitHub Logo](https://github.com/wangtao0101/vscode-perfect-css-modules/blob/master/img/dia.gif?raw=true)

## vue sfc autocomplete
add module config in style, also support import other style file from local or node_modules
```
<style lang="less" module>
@import './out.modules.less';
@import '~test/index';
.ap-lk {
  color: red;
}

.ap-lk {
  color: red;
}
</style>
```

support autocomplete for $style in template
![GitHub Logo](https://github.com/wangtao0101/vscode-perfect-css-modules/blob/master/img/com.gif?raw=true)

support autocomplete for $style in script and support es module style
![GitHub Logo](https://github.com/wangtao0101/vscode-perfect-css-modules/blob/master/img/comp1.gif?raw=true)

## vue sfc go to definition
in vue sfc file
![GitHub Logo](https://github.com/wangtao0101/vscode-perfect-css-modules/blob/master/img/def1.gif?raw=true)

goto style file
![GitHub Logo](https://github.com/wangtao0101/vscode-perfect-css-modules/blob/master/img/def2.gif?raw=true)

# Imports
The behavior is the same as [less loader webpack resolver](https://github.com/webpack-contrib/less-loader#imports).

You can import your Less modules from `node_modules`. Just prepend them with a `~` which tells extension to look up the [`modules`].

```less
@import "~bootstrap/less/bootstrap";
```

# Config
## perfect-css-modules.rootDir
Specifies the root directory of input files relative to project workspace, including js, ts, css, less. Defaults to ., you can set /src.

## perfect-css-modules.camelCase
Export Classnames in camelOnly or dashesOnly.

## perfect-css-modules.styleFilesToScan
Glob for files to watch and scan. Defaults to **/*.{less,css}.

## perfect-css-modules.jsFilesToScan
Glob for files to watch and scan. Defaults to **/*.{js,ts,jsx,tsx}

## perfect-css-modules.modulesPath
Specifies the node_modules directory. Defaults to ./node_modules. See [Imports](https://github.com/wangtao0101/vscode-perfect-css-modules#imports).

## perfect-css-modules.enableDiagnostic
enable diagnostic, Defaults to true

# TODO
- [x] support js
- [x] support ts
- [x] support less
- [x] support css
- [x] support vue
- [ ] support sass
