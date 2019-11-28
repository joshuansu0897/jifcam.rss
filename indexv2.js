const csv = require('fast-csv')
const fs = require('fs')
const RssFeedEmitter = require('rss-feed-emitter')
const feeder = new RssFeedEmitter()
const RSSModel = require('./src/models/rss')

const config = require('./config').config
const mongoose = require('mongoose')

const DB_URI = process.env.DB_URI || config.DB_URI || 'mongodb://localhost:27017/'
const DB_NAME = config.MONGODB_DB || 'jifcam_rss'
mongoose.set('useNewUrlParser', true)
mongoose.set('useFindAndModify', false)
mongoose.set('useUnifiedTopology', true)
mongoose.set('useCreateIndex', true)

mongoose.connect(DB_URI + DB_NAME)

mongoose.connection.on('error', console.error.bind(console))

mongoose.connection.once('open', () => {
  console.log('MongoDB connect')
})

const rssMap = new Map()

function run() {

  fs.createReadStream('./rss-links-large.csv')
    .pipe(csv.parse({ headers: true }))
    .on('data', (row) => {
      if (row.RSS === null || row.RSS === undefined || row.RSS === 'No RSS') {
        return
      }
      rssMap.set(row.RSS, new RSSModel(row.RSS))
      feeder.add({
        url: row.RSS,
        refresh: 2000
      })
    })

}

run()

feeder.on('new-item', async (item) => {
  console.log(' ***************************** **************************** ')
  console.log(item.meta.link)
  const rss = rssMap.get(item.meta.link)

  rss.getData(item).then(obj => {
    rss.insert(obj)
      .then(res => {
        console.log('saved', res._doc)
      })
      .catch(e => {
        console.log(e)
      })
  })
})