const { Worker } = require('worker_threads')

runService = async (workerData) => {
  return new Promise(resolve => {
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
  })
}

const listOfArguments = [
  'https://www.spreaker.com/show/3202978/episodes/feed',
  'https://feeds.megaphone.fm/extraterrestrial',
  'https://feed.podbean.com/alav/feed.xml',
  'https://feed.podbean.com/couplegoals/feed.xml',
  'https://www.spreaker.com/show/3287452/episodes/feedu'
]

async function run() {
  const listOfPromises = listOfArguments.map(runService)
  return await Promise.all(listOfPromises)
}

run().catch(err => console.error(err))