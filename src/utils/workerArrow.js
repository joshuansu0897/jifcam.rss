const { worker } = require('@arrows/worker')
const Parser = require('rss-parser')
const parser = new Parser()

const helper = async (url) => {

  let feed
  try {
    console.log(url)
    feed = await parser.parseURL(url)
    console.log('parse work')
  } catch (e) {
    console.log('parse ERROR')
    console.error(e)
    return
  }

  console.log(feed.title)

  feed.items.forEach(item => {
    console.log(item.title + ':' + item.link)
  })
}

module.exports = worker(helper, { poolSize: 4 })