'use strict'
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
  return {
    title: data.title,
    duration: data.pubdate,
    description: data.description,
    mp3Link: data.link
  }
}

/**
 * insert RSS
 */
RSSModel.prototype.insert = function (data) {
  const _this = this

  let listCallbacks = [
    function (callback) {
      Joi.validate(data, _this.validator, callback)
    },
    function (data, callback) {
      _this.modelDB.create(data, callback)
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