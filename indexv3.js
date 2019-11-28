const myWorker = require('./src/utils/workerArrow')
const csv = require('fast-csv')
const fs = require('fs')

const main = () => {
  fs.createReadStream('./rss-links-large.csv')
    .pipe(csv.parse({ headers: true }))
    .on('data', async (row) => {
      if (row.RSS === null || row.RSS === undefined || row.RSS === 'No RSS') {
        return
      }
      await myWorker(row.RSS)
    })
}

main()