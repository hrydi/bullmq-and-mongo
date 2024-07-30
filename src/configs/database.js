module.exports = {
  mongo: {
    database: process.env.MONGO_DATABASE,
    username: process.env.MONGO_USERNAME,
    password: process.env.MONGO_PASSWORD,
    host: process.env.MONGO_HOST,
    port: parseFloat(process.env.MONGO_PORT),
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseFloat(process.env.REDIS_PORT),
    maxRetriesPerRequest: null
  }
}