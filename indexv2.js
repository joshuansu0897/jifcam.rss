const csv = require('fast-csv')
const fs = require('fs')
const RssFeedEmitter = require('rss-feed-emitter')
const feeder = new RssFeedEmitter()
const RSSModel = require('./src/models/rss')
const delay = require('delay')

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
    .on('data', async (row) => {
      if (row.RSS === null || row.RSS === undefined || row.RSS === 'No RSS') {
        return
      }
      rssMap.set(row.RSS, new RSSModel(row.RSS))
      feeder.add({
        url: row.RSS,
        refresh: 50000
      })
      await delay(500)
    })

}

run()

feeder.on('new-item', async (item) => {
  try {
    console.log(' ***************************** **************************** ')
    console.log(item.meta.link)
    const rss = rssMap.get(item.meta.link)

    process.nextTick(() => save(rss, item))
    await delay(500)
  } catch (err) {
    console.error(err)
  }
})

function save(rss, item) {
  let obj = rss.getData(item)

  rss.insert(obj)
    .then(res => {
      console.log('saved', res._doc)
    })

}