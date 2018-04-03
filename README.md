# tile-block
a simplest-possible mbtiles-based vector tile server

## how to use
```sh
$ git clone git@github.com:hfu/tile-block.git
$ cd tile-block
$ npm install
$ mkdir mbtiles
$ cp /somedirectory/somewhere.mbtiles mbtiles
$ cp -r htdocs/washington htdocs/somewhere
$ vi htdocs/somewhere/index.html
$ vi htdocs/somewhere/style.json
$ node tile-block
$ open http://localhost:3857/somewhere/
```

## purpose of this code
1. to serve vector tiles from mbtiles and to host related static files.
2. basically for development or evaluation; number of potential users < 1000.
3. to perform moderately; faster than serving static tiles on CIFS.

