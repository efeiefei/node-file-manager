# Screen Shot
![screenshot](https://raw.githubusercontent.com/efeiefei/node-file-manager/master/example/screenshot.png)

# Usage

```sh
  npm install -g node-file-manager
  node-file-manager -p 8080 -d /path/to/
  node-file-manager -p 8080 -d /path/to/ --user yourname --password yourpwd
```

Or

```sh
  git clone https://github.com/efeiefei/node-file-manager.git
  cd node-file-manager
  npm i
  cd lib
  node --harmony index.js -p 8080 -d /path/to  --user yourname --password yourpwd
```

We can run node-file-manager in terminal directly. We can specify prot add data root dir by `-p` and `-d`, default with 5000 and scripts directory.

Then, we can view localhost:8080/ in our browr.
