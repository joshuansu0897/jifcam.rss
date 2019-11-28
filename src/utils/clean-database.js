const mongoose = require('mongoose')
const RSSModel = require('../models/rss')

mongoose.connect('mongodb://localhost:27017/' + 'jifcam_development', {
  useNewUrlParser: true
})

const RSSModel = new RSSModel()

RSSModel.modelDB.deleteMany({}, (err, res) => {
  console.log('RSSModel model is cleard')
})