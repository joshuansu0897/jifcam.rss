'use strict'
const dotenv = require('dotenv')
const path = require('path')
const configs = Object.create(null)

if (process.env.NODE_ENV === 'production') {
  configs = dotenv.config({ path: path.resolve('./.env') })
} else {
  configs = dotenv.config({ path: path.resolve('./.env.development') })
}

exports.config = configs.parsed