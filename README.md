# Fork TS Type Build Webpack Plugin
[![Npm version](https://img.shields.io/npm/v/fork-ts-type-build-webpack-plugin.svg?style=flat-square)](https://www.npmjs.com/package/fork-ts-type-build-webpack-plugin)
[![Build Status](https://travis-ci.org/pmabres/fork-ts-type-build-webpack-plugin.svg?branch=master)](https://travis-ci.org/pmabres/fork-ts-type-build-webpack-plugin)

Webpack plugin that runs typescript type definitions generator on a separate process.

*Forked from [fork-ts-checker-webpack-plugin](https://github.com/Realytics/fork-ts-checker-webpack-plugin)*
## Installation
This plugin requires minimum **webpack 2.3**, **typescript 2.1** and optionally **tslint 4.0**
```sh
npm install --save-dev fork-ts-type-build-webpack-plugin
```
Basic webpack config (with [ts-loader](https://github.com/TypeStrong/ts-loader))
```js
var ForkTsTypeBuildWebpackPlugin = require('fork-ts-type-build-webpack-plugin');

var webpackConfig = {
  context: __dirname, // to automatically find tsconfig.json
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          // disable type checker - we will use it in fork plugin
          transpileOnly: true 
        }
      }
    ]
  },
  plugins: [
    new ForkTsTypeBuildWebpackPlugin()
  ]
};
```

## Motivation
Based off [fork-ts-checker-webpack-plugin](https://github.com/Realytics/fork-ts-checker-webpack-plugin)
It is the same code, just enable declaration generation.

--- *Pending Modification* ---
## Options 
* **tsconfig** `string`:
Path to *tsconfig.json* file. Default: `path.resolve(compiler.options.context, './tsconfig.json')`.

* **compilerOptions** `object`:
Allows overriding TypeScript options. Should be specified in the same format as you would do for the `compilerOptions` property in tsconfig.json. Default: `{}`.

* **tslint** `string | true`: 
Path to *tslint.json* file or `true`. If `true`, uses `path.resolve(compiler.options.context, './tslint.json')`. Default: `undefined`.

* **tslintAutoFix** `boolean `:
Passes on `--fix` flag while running `tslint` to auto fix linting errors. Default: false.

* **watch** `string | string[]`: 
Directories or files to watch by service. Not necessary but improves performance (reduces number of `fs.stat` calls).

* **async** `boolean`:
True by default - `async: false` can block webpack's emit to wait for type checker/linter and to add errors to the webpack's compilation.
We recommend to set this to `false` in projects where type checking is faster than webpack's build - it's better for integration with other plugins. Another scenario where you might want to set this to `false` is if you use the `overlay` functionality of `webpack-dev-server`.

* **ignoreDiagnostics** `number[]`:
List of typescript diagnostic codes to ignore.

* **ignoreLints** `string[]`: 
List of tslint rule names to ignore.

* **reportFiles** `string[]`: 
Only report errors on files matching these glob patterns. This can be useful when certain types definitions have errors that are not fatal to your application. Default: `[]`.

```js
  // in webpack.config.js
  new ForkTsCheckerWebpackPlugin({ reportFiles: ['src/**/*.{ts,tsx}', '!src/skip.ts'] })
```

* **colors** `boolean`:
If `false`, disables built-in colors in logger messages. Default: `true`.

* **logger** `object`:
Logger instance. It should be object that implements method: `error`, `warn`, `info`. Default: `console`.

* **formatter** `'default' | 'codeframe' | ((message: NormalizedMessage, useColors: boolean) => string)`:
Formatter for diagnostics and lints. By default uses `default` formatter. You can also pass your own formatter as a function
(see `src/NormalizedMessage.js` and `src/formatter/` for api reference).

* **formatterOptions** `object`:
Options passed to formatters (currently only `codeframe` - see [available options](https://www.npmjs.com/package/babel-code-frame#options))

* **silent** `boolean`:
If `true`, logger will not be used. Default: `false`.

* **checkSyntacticErrors** `boolean`: 
This option is useful if you're using ts-loader in `happyPackMode` with [HappyPack](https://github.com/amireh/happypack) or [thread-loader](https://github.com/webpack-contrib/thread-loader) to parallelise your builds.  If `true` it will ensure that the plugin checks for *both* syntactic errors (eg `const array = [{} {}];`) and semantic errors (eg `const x: number = '1';`).  By default the plugin only checks for semantic errors.  This is because when ts-loader is used in `transpileOnly` mode, ts-loader will still report syntactic errors. When used in `happyPackMode` it does not. Default: `false`.

* **memoryLimit** `number`: 
Memory limit for service process in MB. If service exits with allocation failed error, increase this number. Default: `2048`.

* **workers** `number`:
You can split type checking to a few workers to speed-up increment build. **Be careful** - if you don't want to increase build time, you 
should keep free 1 core for *build* and 1 core for a *system* *(for example system with 4 CPUs should use max 2 workers)*. Second thing -
node doesn't share memory between workers - keep in mind that memory usage will increase. Be aware that in some scenarios increasing workers
number **can increase checking time**. Default: `ForkTsCheckerWebpackPlugin.ONE_CPU`.

* **vue** `boolean`:
If `true`, the linter and compiler will process VueJs single-file-component (.vue) files. See the 
[Vue section](https://github.com/Realytics/fork-ts-type-build-webpack-plugin#vue) further down for information on how to correctly setup your project.

* **useTypescriptIncrementalApi** `boolean`:
If true, the plugin will use incremental compilation API introduced in typescript 2.7. In this mode you can only have 1 
worker, but if the changes in your code are small (like you normally have when you work in 'watch' mode), the compilation 
may be much faster, even compared to multi-threaded compilation. 

* **measureCompilationTime** `boolean`:
If true, the plugin will measure the time spent inside the compilation code. This may be useful to compare modes,
especially if there are other loaders/plugins involved in the compilation. **requires node 8+**

* **typescript** `string`:
If supplied this is a custom path where `typescript` can be found. Defaults to `require.resolve('typescript')`.

### Pre-computed consts:      
  * `ForkTsCheckerWebpackPlugin.ONE_CPU` - always use one CPU
  * `ForkTsCheckerWebpackPlugin.ALL_CPUS` - always use all CPUs (will increase build time)
  * `ForkTsCheckerWebpackPlugin.ONE_CPU_FREE` - leave only one CPU for build (probably will increase build time)
  * `ForkTsCheckerWebpackPlugin.TWO_CPUS_FREE` - **recommended** - leave two CPUs free (one for build, one for system)

## Different behaviour in watch mode

If you turn on [webpacks watch mode](https://webpack.js.org/configuration/watch/#watch) the `fork-ts-type-build-notifier-webpack-plugin` will take care of logging type errors, _not_ webpack itself. That means if you set `silent: true` you won't see type errors in your console in watch mode.

You can either set `silent: false` to show the logging from `fork-ts-type-build-notifier-webpack-plugin` _or_ set `async: false`. Now webpack itself will log type errors again, but note that this can slow down your builds depending on the size of your project.

## Notifier

You may already be using the excellent [webpack-notifier](https://github.com/Turbo87/webpack-notifier) plugin to make build failures more obvious in the form of system notifications. There's an equivalent notifier plugin designed to work with the `fork-ts-type-build-webpack-plugin`.  It is the `fork-ts-type-build-notifier-webpack-plugin` and can be found [here](https://github.com/johnnyreilly/fork-ts-type-build-notifier-webpack-plugin). This notifier deliberately has a similar API as the `webpack-notifier` plugin to make migration easier.

## Known Issue Watching Non-Emitting Files

At present there is an issue with the plugin regarding the triggering of type-checking when a change is made in a source file that will not emit js. If you have a file which contains only `interface`s and / or `type`s then changes to it will **not** trigger the type checker whilst in watch mode. Sorry about that.

We hope this will be resolved in future; the issue can be tracked [here](https://github.com/Realytics/fork-ts-type-build-webpack-plugin/issues/36).

## Plugin Hooks
This plugin provides some custom webpack hooks (all are sync):

| Event name | Description | Params |
|------------|-------------|--------|
|`fork-ts-type-build-cancel`| Cancellation has been requested | `cancellationToken` |
|`fork-ts-type-build-waiting`| Waiting for results | `hasTsLint` |
|`fork-ts-type-build-service-before-start`| Async plugin that can be used for delaying `fork-ts-type-build-service-start` | - |
|`fork-ts-type-build-service-start`| Service will be started | `tsconfigPath`, `tslintPath`, `watchPaths`, `workersNumber`, `memoryLimit` |
|`fork-ts-type-build-service-start-error` | Cannot start service | `error` |
|`fork-ts-type-build-service-out-of-memory`| Service is out of memory | - |
|`fork-ts-type-build-receive`| Plugin receives diagnostics and lints from service | `diagnostics`, `lints` | 
|`fork-ts-type-build-emit`| Service will add errors and warnings to webpack compilation ('build' mode) | `diagnostics`, `lints`, `elapsed` |
|`fork-ts-type-build-done`| Service finished type checking and webpack finished compilation ('watch' mode) | `diagnostics`, `lints`, `elapsed` |

## License
MIT
