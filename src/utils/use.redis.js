const IORedis = require('ioredis').default
const { redis: conf } = require('../configs/database')
/**
 * 
 * @param {import('ioredis').RedisOptions} options 
 * @returns {Promise<import('ioredis').Redis>}
 */
module.exports = function useRedis(options = {}) {
  const opts = Object.assign({...conf}, options)
  return (new Promise((resolve, reject) => {
    const redis = new IORedis({ ...opts })
    redis.on('connect', () => resolve(redis))
    redis.on('close', () => {})
    redis.on('error', reject)
  }))
}