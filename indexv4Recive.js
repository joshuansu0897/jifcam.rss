const amqp = require('amqplib/callback_api')
const podcastFeedParser = require("podcast-feed-parser")
const RSSModel = require('./src/models/rss')

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

    ch.consume(queueName, (msg) => {
      let response = JSON.parse(msg.content.toString())

      podcastFeedParser.getPodcastFromURL(response)
        .then((res) => {
          const rss = new RSSModel(response)
          rss.insert(res)
        })
        .catch((err) => {
          console.error(err)
        })

    }, { noAck: true })
  })
})