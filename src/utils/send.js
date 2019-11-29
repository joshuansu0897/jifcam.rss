const amqp = require('amqplib/callback_api')

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

    let queueName = 'rss'
    let msg = 'url rss??'

    ch.assertQueue(queueName, { durable: false })

    let num = 0

    setInterval(() => {
      ch.sendToQueue(queueName, Buffer.from(JSON.stringify(`${msg} ${num}`)))
      console.log(' [x] Sent %s', JSON.stringify(`${msg} ${num}`))
      num++
    }, 1000)
  })
})