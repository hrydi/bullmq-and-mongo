const mongoose = require('mongoose')
const queueSchemas = new mongoose.Schema({
  metadata: {
    title: String,
    subtitle: String,
    queue_name: String,
    job_name: String,
    status: String,
  },
  job: mongoose.Schema.Types.Mixed,
  creator: mongoose.Schema.Types.Mixed,
})

const Queues = mongoose.model('Queues', queueSchemas)

module.exports['Queues'] = Queues