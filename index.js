const config = require('./config').config
const mongoose = require('mongoose')
const { Worker } = require('worker_threads')

const DB_URI = process.env.DB_URI || config.DB_URI || 'mongodb://localhost:27017/'
const DB_NAME = config.MONGODB_DB || 'jifcam_rss'
mongoose.set('useNewUrlParser', true)
mongoose.set('useFindAndModify', false)
mongoose.set('useUnifiedTopology', true)
mongoose.set('useCreateIndex', true)

mongoose.connect(DB_URI + DB_NAME)

runService = async (workerData) => {
  const worker = new Worker('./src/utils/worker.js', { workerData })

  worker.on('message', (incoming) => {
    console.log({ incoming })
  })

  worker.on('error', (code) => {
    new Error(`Worker error with exit code ${code}`)
  })

  worker.on('exit', (code) =>
    console.log(`Worker stopped with exit code ${code}`)
  )
}

async function run() {
  runService('https://www.spreaker.com/show/3202978/episodes/feed')
  runService('https://feeds.megaphone.fm/extraterrestrial')
}

run().catch(err => console.error(err))