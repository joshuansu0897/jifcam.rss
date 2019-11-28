const mongoose = require('mongoose')
const async = require('async')
const Joi = require('@hapi/joi')

function RSSModel(name) {
  this.name = name
  this.schema = mongoose.Schema({
    title: { type: String, require: true },
    duration: { type: String, require: true },
    description: { type: String, require: true },
    mp3Link: { type: String, require: true },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
  })

  this.schema.pre(['save', 'updateOne', 'update'], (next) => {
    this.updated = Date.now()
    next()
  })

  this.validator = Joi.object().keys({
    title: Joi.string().required(),
    duration: Joi.string().required(),
    description: Joi.string().required(),
    mp3Link: Joi.string().required()
  })

  this.listValidator = Joi.array().items(this.validator)

  this.modelDB
  try {
    this.modelDB = mongoose.model(this.name)
  } catch (err) {
    this.modelDB = mongoose.model(this.name, this.schema)
  }
}

/**
 * getData RSS
 */
RSSModel.prototype.getData = function (data) {
  let title = data.title
  if (title === null || title === undefined) {
    title = 'title empty'
  }

  let duration = data.pubdate
  if (duration === null || duration === undefined) {
    duration = 'duration empty'
  } else {
    duration = duration.toString()
  }

  let description = data.description
  if (description === null || description === undefined) {
    description = 'description empty'
  }

  let mp3Link
  if (data.enclosures !== null && data.enclosures !== undefined && data.enclosures.lenght > 0) {
    mp3Link = data.enclosures[0].url
    if (mp3Link === null || mp3Link === undefined) {
      mp3Link = 'url empty'
    }
  } else {
    mp3Link = 'enclosures empty'
  }

  return {
    title,
    duration,
    description,
    mp3Link
  }
}

/**
 * insert RSS
 */
RSSModel.prototype.insert = async function (data) {
  if (await Joi.validate(data, this.validator)) {
    return await this.modelDB.create(data)
  }
}

/**
 * insertMany RSS
 */
RSSModel.prototype.insertMany = function (data) {
  const _this = this

  let listCallbacks = [
    function (callback) {
      Joi.validate(data, _this.listValidator, callback)
    },
    function (data, callback) {
      _this.modelDB.insertMany(data, callback)
    }
  ]

  let promise = new Promise((resolve, reject) => {
    async.waterfall(listCallbacks, async function (error, result) {
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    })
  })

  return promise
}

module.exports = RSSModel