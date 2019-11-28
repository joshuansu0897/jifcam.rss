const { Worker } = require('worker_threads')

runService = async (workerData) => {
  const worker = new Worker('./src/utils/worker.js', { workerData })
  worker.on('message', incoming => console.log({ incoming }))
  worker.on('error', code => new Error(`Worker error with exit code ${code}`))
  worker.on('exit', code =>
    console.log(`Worker stopped with exit code ${code}`)
  )
}

async function run() {
  runService('https://www.spreaker.com/show/3202978/episodes/feed')
  runService('https://feeds.megaphone.fm/extraterrestrial')
}

run().catch(err => console.error(err))