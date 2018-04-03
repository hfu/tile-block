const fs = require('fs')
const MBTiles = require('@mapbox/mbtiles')
const express = require('express')

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
  [z, x, y] = [req.params.z, req.params.x, req.params.y].map(v => Number(v))
  const t = req.params.t
  console.log(req.params)
  if(!mbtiles[t]) {
    console.log(`${t} does not exist.`)
    next()
  }
  mbtiles[req.params.t].getTile(z, x, y, (err, data, headers) => {
    if (err) {
      res.status(404).send(`${t}/${z}/${x}/${y} does not exist.`)
      next()
    } else {
      console.log(headers)
      res.set('Content-Encoding', 'gzip')
      res.send(data)
      next()
    }
  })
})
app.use(express.static('htdocs'))

app.listen(3857, () => {
  console.log('listening port 3857.')
})
