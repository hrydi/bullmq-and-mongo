/**
 * @typedef {Object} CreateQueuePayload
 * @property {{ title: string, subtitle: string, queue_name: string, job_name: string, status: string }} metadata
 * @property {import('bullmq').JobsOptions} options
 * @property {*} payload
 */

/**
 * @typedef {Object} MongoDBOptions 
 * @property {string} database
 * @property {string} username
 * @property {string} password
 * @property {string} host
 * @property {number} port
 */

/**
 * @typedef {Object} WebOptions
 * @property {string} host
 * @property {number} port
 * @property {MongoDBOptions} mongo
 * @property {import('ioredis').RedisOptions} redis
 * @property {string[]} queues
 */

/**
 * @typedef {Object} WorkerOptions
 * @property {MongoDBOptions} mongo
 * @property {import('ioredis').RedisOptions} redis
 */

/**
 * @typedef {Object} WorkerHandler
 * @property {string} queue_name
 * @property {string} job_name
 * @property {Function} handler
 */

module.exports = {}