const mongoose = require('mongoose')
const { mongo: conf } = require('../configs/database')

/**
 * 
 * @param {import('../types').MongoDBOptions} options
 * @returns 
 */
module.exports = async function useMongo(options = {}) {
  try {
    const opts = Object.assign({
      database: conf.database,
      username: conf.username,
      password: conf.password,
      host: conf.host,
      port: conf.port,
    }, options)

    await mongoose.connect(`mongodb://${opts.host}:${opts.port}`, {
      auth: {
        username: opts.username,
        password: opts.password
      },
      dbName: opts.database
    })
    
  } catch (e) {
    return Promise.reject(e)
  }
}