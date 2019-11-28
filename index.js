const { Worker } = require('worker_threads')
const csv = require('fast-csv')
const fs = require('fs')

let workersLimit = 0

const runService = async (workerData) => {
  return new Promise(resolve => {
    const worker = new Worker('./src/utils/worker.js', { workerData })

    worker.on('message', (incoming) => {
      console.log({ incoming })
      if (incoming === 'err!') {
        terminateWorker(worker)
      }
    })

    worker.on('error', (code) => {
      new Error(`Worker error with exit code ${code}`)
      terminateWorker(worker)
    })

    worker.on('exit', (code) =>
      console.log(`Worker stopped with exit code ${code}`)
    )
  })
}

function terminateWorker(worker) {
  worker.terminate()
  workersLimit--
  console.log('TERMINATE!')
}

async function run() {
  const listOfPromises = []

  fs.createReadStream('./rss-links-large.csv')
    .pipe(csv.parse({ headers: true }))
    .on('data', (row) => {
      if (row.RSS === null || row.RSS === undefined || row.RSS === 'No RSS' || workersLimit === 1000) {
        return
      }
      listOfPromises.push(runService(row.RSS))
      workersLimit++
    })

  return await Promise.all(listOfPromises)
}

run().catch(err => console.error(err))