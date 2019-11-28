var dotenv = require('dotenv')
var path = require('path')
var configs = Object.create(null)

if (process.env.NODE_ENV === 'production') {
  configs = dotenv.config({ path: path.resolve('./.env') })
} else {
  configs = dotenv.config({ path: path.resolve('./.env.development') })
}

console.log(configs)

exports.config = configs.parsed