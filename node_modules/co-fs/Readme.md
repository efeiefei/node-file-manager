
# co-fs

  Node core `fs` wrapped functions that return thunks for [co](https://github.com/visionmedia/co).

## Installation

```
$ npm install co-fs
```

## Example

 Use all the regular async fs functions without callback hell:

```js
var json = yield fs.readFile('package.json', 'utf8')
var files = yield fs.readdir('/tmp')
```

## License

  MIT

