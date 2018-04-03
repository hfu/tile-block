const fs = require('fs')
const MBTiles = require('@mapbox/mbtiles')
const express = require('express')
const spdy = require('spdy')

const app = express()
let mbtiles = {}

fs.readdir('mbtiles', (err, files) => {
  if (err) throw err
  for (let file of files) {
    if (file.endsWith('.mbtiles')) {
      console.log(`loading ${file}`)
      new MBTiles(`mbtiles/${file}?mode=ro`, (err, mbt) => {
        if (err) throw err
        mbtiles[file.replace('.mbtiles', '')] = mbt
        console.log(mbtiles)
      })
    }
  }
})

app.get('/zxy/:t/:z/:x/:y', (req, res, next) => {
  const [z, x, y] = [req.params.z, req.params.x, req.params.y].map(v => Number(v))
  const t = req.params.t
  console.log(req.params)
  getTile(t, z, x, y).then(tile => {
    if (tile) {
      res.set('Content-Encoding', 'gzip')
      res.send(tile)
    } else {
      res.status(404).send(`${t}/${z}/${x}/${y} does not exist.`)
    }
  }).catch(reason => {
    throw reason
  })
})

const getTile = (t, z, x, y) => {
  return new Promise((resolve, reject) => {
    if (!mbtiles[t]) {
      console.log(`mbtiles/${t}.mbtiles does not exist.`)
      resolve(false)
    }
    mbtiles[t].getTile(z, x, y, (err, data, headers) => {
      if (err) {
        resolve(false)
      } else {
        resolve(data)
      }
    })
  })
}
app.use(express.static('htdocs'))

/* be sure to change style.json if you want to use http
app.listen(3856, () => {
  console.log('http listening port 3856')
})
*/

spdy.createServer({
  key: fs.readFileSync('private.key'), 
  cert: fs.readFileSync('server.crt'),
  passphrase: 'tile-block'
}, app).listen(3857, () => {
  console.log('http/2 listening port 3857.')
})
