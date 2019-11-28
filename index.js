'use strict'
const { Worker } = require('worker_threads')
const csv = require('fast-csv')
const fs = require('fs')

const runService = async (workerData) => {
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

async function run() {
  const listOfPromises = []
  let limitWorkers = 0

  fs.createReadStream('./rss-links-large.csv')
    .pipe(csv.parse({ headers: true }))
    .on('data', (row) => {
      if (row.RSS === null || row.RSS === undefined || row.RSS === 'No RSS' || limitWorkers === 5000) {
        return
      }
      listOfPromises.push(runService(row.RSS))
      limitWorkers++
    })

  return await Promise.all(listOfPromises)
}

run().catch(err => console.error(err))