const amqp = require('amqplib/callback_api')

const URLR = process.env.URL_RABBIT || 'localhost'
const PORT = process.env.PORT_RABBIT || 5672
const USER = process.env.USER_RABBIT || 'rabbitmq'
const PASS = process.env.PASS_RABBIT || 'rabbitmq'

const RABBIT_URL = `amqp://${USER}:${PASS}@${URLR}:${PORT}`

console.log(RABBIT_URL)

amqp.connect(RABBIT_URL, function (err, conn) {

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

    let queueName = 'rss'

    ch.assertQueue(queueName, { durable: false })
    console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', queueName)

    ch.consume(queueName, (msg) => {
      let response = JSON.parse(msg.content.toString())
      console.log(response)
    }, { noAck: true })

  })
})