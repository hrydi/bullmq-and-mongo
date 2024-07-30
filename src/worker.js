'use strict'
const { Worker } = require('bullmq')
const { mongo, redis } = require('./configs/database')
const useMongo = require('./utils/use.mongo')
const useRedis = require('./utils/use.redis')
const wrapAsync = require('./utils/wrap.async')
const { Queues } = require('./utils/mongo/queues.model')

/**
 * @param {import('./types').WorkerOptions} options
 */
module.exports = function useWorker(options = {}) {
  const opts = Object.assign({
    mongo,
    redis
  }, options)

  const prv = {
    /** @type {import('./types').WorkerHandler[]} */
    handlers: [],
    queues() {
      return prv.handlers.map(el => el.queue_name)
    },
    processor(name) {
      /**
       * @param {import('bullmq').Job} job
       */
      return async (job) => {
        try {
          const processor = prv.handlers.find(el => ((el.job_name === job.name) && (el.queue_name === name)))
          if(!processor) throw new Error(`undefined handler`)
          return await processor.handler(job)
        } catch (e) {
          return Promise.reject(e)
        }
      }
    },
    /** @type {Object.<string, Function?>} */
    event: {
      active: null,
      closed: null,
      completed: null,
      drained: null,
      error: null,
      failed: null,
      'ioredis:close': null,
      paused: null,
      progress: null,
      ready: null,
      resumed: null,
      stalled: null,
    },
    run(redis) {
      try {
        const queues = prv.queues()
        if(!queues.length) throw new Error(`you haven't registered any handler(s)`)
        for(const name of queues) {
          const worker = new Worker(name, prv.processor(name), { connection: redis })
          worker.on('active', async function(job, prev) {
            try {
              console.log(`job ${job.name} from worker ${worker.name} is active`)
              const queue = await Queues.findOne({
                'job.id': job.id,
                'job.name': job.name,
                'metadata.queue_name': name
              })
              if(queue?.job) {
                queue.job = {...job.toJSON(), ...queue.job}
                queue.metadata['status'] = 'active'
                await queue.save()
              }
              if(!prv.event.active && (typeof prv.event.active === 'function')) {
                await wrapAsync(prv.event.active)(job, prev)
              }
            } catch (err) {}
          })
          worker.on('closed', async function() {
            try {
              console.log(`worker ${worker.name} closed`)
              if(!prv.event.closed && (typeof prv.event.closed === 'function')) {
                await wrapAsync(prv.event.closed)()
              }
            } catch (err) {}
          })
          worker.on('completed', async function(job, result) {
            try {
              console.log(`job ${job.name} from worker ${worker.name} is completed: `, result)
              const queue = await Queues.findOne({
                'job.id': job.id,
                'job.name': job.name,
                'metadata.queue_name': name
              })
              if(queue?.job) {
                queue.job = {...job.toJSON(), ...queue.job}
                queue.job['progress'] = 100
                queue.job['returnvalue'] = result
                queue.metadata['status'] = 'completed'
                await queue.save()
              }
              if(!prv.event.completed && (typeof prv.event.completed === 'function')) {
                await wrapAsync(prv.event.completed)(job, result)
              }
            } catch (err) {}
          })
          worker.on('drained', async function() {
            try {
              console.log(`worker ${worker.name} is drained`)
              if(!prv.event.drained && (typeof prv.event.drained === 'function')) {
                await wrapAsync(prv.event.drained)()
              }
            } catch (err) {}
          })
          worker.on('error', async function(e) {
            try {
              console.log(`worker ${worker.name} is error: `, e.message)
              if(!prv.event.error && (typeof prv.event.error === 'function')) {
                await wrapAsync(prv.event.error)(e)
              }
            } catch (err) {}
          })
          worker.on('failed', async function(job, e) {
            try {
              console.log(`job ${job.name} from worker ${worker.name} is failed: `, e.message)
              const queue = await Queues.findOne({
                'job.id': job.id,
                'job.name': job.name,
                'metadata.queue_name': name
              })
              if(queue?.job) {
                queue.job = {...job.toJSON(), ...queue.job}
                queue.job['stacktrace'] = job.stacktrace
                queue.metadata['status'] = 'failed'
                await queue.save()
              }
              if(!prv.event.failed && (typeof prv.event.failed === 'function')) {
                await wrapAsync(prv.event.failed)(job, e)
              }
            } catch (err) {}
          })
          worker.on('ioredis:close', async function() {
            try {
              console.log(`ioredis:close from worker ${worker.name}`)
              if(!prv.event['ioredis:close'] && (typeof prv.event['ioredis:close'] === 'function')) {
                await wrapAsync(prv.event['ioredis:close'])()
              }
            } catch (err) {}
          })
          worker.on('paused', async function() {
            try {
              console.log(`worker ${worker.name} is paused`)
              if(!prv.event.paused && (typeof prv.event.paused === 'function')) {
                await wrapAsync(prv.event.paused)()
              }
            } catch (err) {}
          })
          worker.on('progress', async function(job, progress) {
            try {
              console.log(`progress of job ${job.name} from worker ${worker.name}: ${progress}`)
              const queue = await Queues.findOne({
                'job.id': job.id,
                'job.name': job.name,
                'metadata.queue_name': name
              })
              if(queue?.job) {
                queue.job = {...job.toJSON(), ...queue.job}
                queue.job['progress'] = progress
                await queue.save()
              }
              if(!prv.event.progress && (typeof prv.event.progress === 'function')) {
                await wrapAsync(prv.event.progress)(job, progress)
              }
            } catch (err) {}
          })
          worker.on('ready', async function() {
            try {
              console.log(`worker ${worker.name} is ready`)
              if(!prv.event.ready && (typeof prv.event.ready === 'function')) {
                await wrapAsync(prv.event.ready)()
              }
            } catch (err) {}
          })
          worker.on('resumed', async function() {
            try {
              console.log(`worker ${worker.name} is resumed`)
              if(!prv.event.resumed && (typeof prv.event.resumed === 'function')) {
                await wrapAsync(prv.event.resumed)()
              }
            } catch (err) {}
          })
          worker.on('stalled', async function(jobId, prev) {
            try {
              console.log(`jobID ${jobId} from worker ${worker.name} is stalled`)
              const queue = await Queues.findOne({
                'job.id': jobId,
                'metadata.queue_name': name
              })
              if(queue?.job) {
                queue.metadata['status'] = 'stalled'
                await queue.save()
              }
              if(!prv.event.stalled && (typeof prv.event.stalled === 'function')) {
                await wrapAsync(prv.event.stalled)(jobId, prev)
              }
            } catch (err) {}
          })
        }
      } catch (e) {
        console.log(`ErrorRunWorker: `, e.message)
      }
    }
  }

  return async () => {
    try {
      const ioredis = await useRedis(opts.redis)
      await useMongo(opts.mongo)

      return {
        /**
         * 
         * @param {import('./types').WorkerHandler | import('./types').WorkerHandler[]} handlers 
         */
        AddHandler(handlers) {
          if(Array.isArray(handlers)) {
            for(const handler of handlers) {
              if(handler && !prv.handlers.find(el => ((el.job_name === handler.job_name) && (el.queue_name === handler.queue_name)))) {
                prv.handlers.push(handler)
              }
            }
            return
          }

          if(handlers && !prv.handlers.find(el => ((el.job_name === handlers.job_name) && (el.queue_name === handlers.queue_name)))) {
            prv.handlers.push(handlers)
          }
        },
        Run: () => prv.run(ioredis)
      }
    } catch (e) {
      return Promise.reject(e)
    }
  }
}