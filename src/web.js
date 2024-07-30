'use strict'
const express = require('express')
const app = express()
const { createServer } = require('http')
const { host, port } = require('./configs/app')
const { mongo, redis } = require('./configs/database')
const useMongo = require('./utils/use.mongo')
const useRedis = require('./utils/use.redis')
const QueueRoutes = require('./routes/queue')

/**
 * @param {import('./types').WebOptions} options
 * @returns 
 */
module.exports = function useWeb(options = {}) {
  const opts = Object.assign({
    host,
    port,
    mongo,
    redis,
    queues: []
  }, options)
  
  const prv = {
    
    getQueues() { return opts.queues },
    /**
     * @param {import('ioredis').Redis} redis 
     * @returns 
     */
    getRoute(redis) {
      
      if(!redis) throw new Error(`redis connection is required`)
        
      app.use(express.json())
      app.use(express.urlencoded({ extended: true }))
      
      app.get('/', (req,res) => res.json({ message: `welcome`, queues: prv.getQueues() }))
      app.use('/queues', QueueRoutes(express.Router(), redis, prv.getQueues()))

      // error handler
      app.use(
        /**
         * @param {import('express').Request} req
         * @param {import('express').Response} res
         * @param {import('express').NextFunction} next
         */
        (req, res, next) => {
          const message = `page not found`
          res.status(404)
          res.json({ message, error: true })
          res.end()
        }
      )

      app.use(
        /**
         * @param {Error} e
         * @param {import('express').Request} req
         * @param {import('express').Response} res
         * @param {import('express').NextFunction} next
         */
        (e, req, res, next) => {
          const message = e.message
          const status = e.status ?? 500
          res.status(status)
          res.json({ message, error: true })
          res.end()
        }
      )
      return app
    },

    /**
     * @param {import('ioredis').Redis} redis 
     * @returns 
     */
    run(redis) {
      const app = prv.getRoute(redis)
      const server = createServer(app)
      server.listen(port, host)
      server.on('error', () => console.log(`server error`))
      server.on('close', () => console.log(`server close`))
      server.on('listening', () => console.log(`server run @${opts.host}:${opts.port}`))
    }
  }

  return async function() {
    try {
      const ioredis = await useRedis(opts.redis)

      await useMongo(opts.mongo)

      return {
        GetRoute: () => prv.getRoute(ioredis),
        /**
         * 
         * @param {string | string[] | null} names 
         */
        AddQueues: (names = null) => {
          if(Array.isArray(names)) {
            for(const name of names) {
              if(name && !opts.queues.includes(name)) {
                opts.queues.push(name)
              }
            }
            return
          }

          if(names && !opts.queues.includes(names)) {
            opts.queues.push(names)
          }
        },
        Run: () => prv.run(redis)
      }
    } catch (e) {
      return Promise.reject(e)
    }
  }
}