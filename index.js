const { Worker } = require('worker_threads')
const csv = require('fast-csv')
const fs = require('fs')

const runService = async (workerData) => {
  return new Promise(resolve => {
    const worker = new Worker('./src/utils/worker.js', { workerData })

    worker.on('message', (incoming) => {
      console.log({ incoming })
      if (incoming === 'err!') {
        worker.terminate()
      }
    })

    worker.on('error', (code) => {
      new Error(`Worker error with exit code ${code}`)
      worker.terminate()
    })

    worker.on('exit', (code) =>
      console.log(`Worker stopped with exit code ${code}`)
    )
  })
}

async function run() {
  const listOfPromises = []

  fs.createReadStream('./rss-links-large.csv')
    .pipe(csv.parse({ headers: true }))
    .on('data', (row) => {
      if (row.RSS === null || row.RSS === undefined || row.RSS === 'No RSS') {
        return
      }
      listOfPromises.push(runService(row.RSS))
    })

  return await Promise.all(listOfPromises)
}

run().catch(err => console.error(err))