# tile-block
a simplest-possible mbtiles-based http/2 vector tile server

## how to use
```sh
$ git clone git@github.com:hfu/tile-block.git
$ cd tile-block
$ openssl genrsa -des3 -passout pass:tile-block -out private.key 2048
$ openssl rsa -in private.key -pubout -out public.key -passin pass:tile-block
$ openssl req -new -key private.key -out server.csr
$ openssl x509 -req -days 365 -signkey private.key < server.csr > server.crt
$ npm install
$ mkdir mbtiles
$ cp /somedirectory/somewhere.mbtiles mbtiles
$ cp -r htdocs/washington htdocs/somewhere
$ vi htdocs/somewhere/index.html
$ vi htdocs/somewhere/style.json
$ node tile-block
$ open https://localhost:3776/somewhere/
```

## purpose of this code
1. to serve vector tiles from mbtiles and to host related static files.
2. basically for development or evaluation; number of potential users < 1000.
3. to perform moderately; faster than http serving static tiles on CIFS.

## some specifications
1. The main program is tile-block.js.
2. tile-block.js talks http/2. As in 'how to use', you need to have private.key and server.crt. Otherwise you can modify tile-block.js to use plain http. See commented part of tile-block.js.
3. tile-block.js scans mbtiles files under mbtiles directory, establishng read-only connection to them.
4. tile-block.js serves vector tiles from /zxy/{t}/{z}/{x}/{y} where {t} is the filename of the mbtiles file e.g., tiles from mbtiles/somewhere.mbtiles will be served through /zxy/somewhere/{z}/{x}/{y}. There is no extension used.
5. Vector tiles are served gzipped with Content-Encoding: gzip, without checking Accept-Encoding.
6. Static files under htdocs directory are served under /. The intent of this is to serve index.html, style.json and other related files so that we will not face CORS issues.
7. For everything including bugs, please refer to tile-block.js.

## CONTRIBUTE.md things
forks, issues, pull requests are welcome!
