const { workerData, parentPort } = require('worker_threads')
const FeedSub = require('feedsub')
const RSSModel = require('../models/rss')

const rss = new RSSModel(workerData)
const feedSub = new FeedSub(workerData, {
  // Number of minutes to wait between checking the feed for new items.
  interval: 1,
  // Some feeds contain a `ttl` tag that specify the
  // number of minutes to cache the feed.
  // Setting this to true will ignore that.
  forceInterval: true,
  // If true, calls `reader.start()` when initialized.
  autoStart: true,
  // Emits items on the very first request.
  // After which, it should consider those items read.
  emitOnStart: false,
  // Keeps track of last date of the feed.
  lastDate: null,
  // Maximum size of `history` array.
  maxHistory: 10,
  // Some feeds have a `skipHours` tag with a list of
  // hours in which the feed should not be read.
  // if this is set to true and the feed has that tag, it obeys that rule
  skipHours: false,
  // If you'd like to specify exactly what hours to skip.
  hoursToSkip: [],
  // Same as `skipHours`, but with days.
  skipDays: false,
})

feedSub.on('item', (item) => {
  parentPort.postMessage('Got item!')

  const data = rss.getData(item)
  console.log(data)

  rss.insert(data)
})

feedSub.on('items', (items) => {
  parentPort.postMessage('Got Many item!')

  const data = items.map(item => rss.getData(item))
  console.log(data)

  rss.insertMany(data)
})

feedSub.on('error', (err) => {
  parentPort.postMessage('err!')
  parentPort.postMessage(err)
})