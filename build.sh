cd `dirname "${BASH_SOURCE[0]}"`
image="node-file-manager"
version=`git describe --tags --exact-match 2> /dev/null || git rev-parse --short HEAD`
docker build . -t $image:$version
