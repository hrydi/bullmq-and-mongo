const { Queues } = require('../utils/mongo/queues.model')
const { Queue } = require('bullmq')

/**
 * @param {import('express').Router} router 
 * @param {import('ioredis').Redis} redis 
 * @param {string[]} queuenames
 * @returns 
 */
module.exports = function (router, redis, queuenames) {
  
  router.get('/', [
    /**
     * List queue get from mongodb
     * @param {import('express').Request} req 
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    async function index(req, res, next) {
      try {
        // await Queues.deleteMany() // debug
        const items = await Queues.find()
        res.json({items, queuenames})
      } catch (e) {
        next(e)
      }
    }
  ])

  router.post('/', [
    /**
     * Create queue
     * @param {import('express').Request} req 
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    async function create(req, res, next) {
      try {
        /** @type {import('../types').CreateQueuePayload} */
        const { metadata, options, payload } = req.body

        let model = new Queues({
          metadata: {...metadata, status: 'initial'},
          creator: {
            username: `system`
          }
        })
        model = await model.save()

        const queue = new Queue(model?.metadata.queue_name, { connection: redis })
        const job = await queue.add(model?.metadata.job_name, payload, {
          ...options, 
          jobId: `${model._id}`
        })
        await queue.close()

        model.job = job.toJSON()
        const save = await model.save()
        res.json(save)
      } catch (e) {
        next(e)
      }
    }
  ])
  return router
}