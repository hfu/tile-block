const fs = require('fs')
const MBTiles = require('@mapbox/mbtiles')
const express = require('express')
const spdy = require('spdy')
const cors = require('cors')
const config = require('config')

const app = express()
app.use(cors())
let mbtiles = {}

/* get the port: override by command line parameter */
let port = config.get('port')
if (process.argv.length === 3) {
  port = parseInt(process.argv[2])
}

const scanFiles = () => {
  fs.readdir('mbtiles', (err, files) => {
    if (err) throw err
    for (let file of files) {
      if (file.endsWith('.mbtiles')) {
        const t = file.replace('.mbtiles', '')
        if (mbtiles[t]) continue
        // console.log(`opening ${t}`)
        new MBTiles(`mbtiles/${file}?mode=ro`, (err, mbt) => {
          if (err) throw err
          mbtiles[t] = mbt
        })
      }
    }
  })
}
scanFiles()

app.get('/zxy/:t/:z/:x/:y', (req, res, next) => {
  const [z, x, y] = [req.params.z, req.params.x, req.params.y].map(v => Number(v))
  const t = req.params.t
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

app.get('/module/:z/:x/:y', (req, res, next) => {
  const [z, x, y] = [req.params.z, req.params.x, req.params.y].map(v => Number(v))
  const Z = 5
  const X = x >> (z - Z)
  const Y = y >> (z - Z)
  const t = `${Z}-${X}-${Y}`
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

app.get('/module6/:z/:x/:y', (req, res, next) => {
  const [z, x, y] = [req.params.z, req.params.x, req.params.y].map(v => Number(v))
  const Z = 6 
  const X = x >> (z - Z)
  const Y = y >> (z - Z)
  const t = `${Z}-${X}-${Y}`
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
  if (!mbtiles[t]) scanFiles()
  return new Promise((resolve, reject) => {
    if (!mbtiles[t]) resolve(false)
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
app.listen(port, () => {})
*/

spdy.createServer({
  key: fs.readFileSync('privkey.pem'),
  cert: fs.readFileSync('fullchain.pem'),
  ca: fs.readFileSync('chain.pem')
  // key: fs.readFileSync('private.key'), 
  // cert: fs.readFileSync('server.crt'),
  // passphrase: 'tile-block'
}, app).listen(port, () => { })
