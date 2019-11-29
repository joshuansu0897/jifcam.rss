const amqp = require('amqplib/callback_api')
const csv = require('fast-csv')
const fs = require('fs')

const URLR = process.env.URL_RABBIT || 'localhost'
const PORT = process.env.PORT_RABBIT || 5672
const USER = process.env.USER_RABBIT || 'rabbitmq'
const PASS = process.env.PASS_RABBIT || 'rabbitmq'

const RABBIT_URL = `amqp://${USER}:${PASS}@${URLR}:${PORT}`

console.log(RABBIT_URL)

amqp.connect(RABBIT_URL, (err, conn) => {

  if (err || conn == undefined) {
    console.error(err)
    console.error('conexion undefined')
    return
  }

  conn.createChannel((err, ch) => {

    if (err) {
      console.error(err)
      return
    }

    let queueName = 'rss-dur'

    ch.assertQueue(queueName, { durable: true })

    fs.createReadStream('./rss-links-large.csv')
      .pipe(csv.parse({ headers: true }))
      .on('data', (row) => {
        if (row.RSS === null || row.RSS === undefined || row.RSS === 'No RSS') {
          return
        }

        ch.sendToQueue(queueName, Buffer.from(JSON.stringify(row.RSS)), {
          persistent: true
        })
      })
  })
})