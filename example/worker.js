(async function () {
  'use strict'
  const sleep = n => (new Promise((resolve) => setTimeout(resolve, n*1000)))
  const { useWorker } = require('..')
  const createWorker = useWorker()
  const worker = await createWorker()
  worker.AddHandler([
    {
      job_name: 'update package',
      queue_name: 'ticket',
      /**
       * @param {import('bullmq').Job} job 
       * @returns 
       */
      handler: async(job) => {
        try {
          await sleep(3)
          await job.updateProgress(5)
          await sleep(4)
          await job.updateProgress(12)
          await sleep(10)
          await job.updateProgress(35)
          await sleep(2)
          await job.updateProgress(68)
          await sleep(9)
          await job.updateProgress(87)
          await sleep(2)
          await job.updateProgress(100)

          return { message: 'done' }
        } catch (e) {
          return Promise.reject(e)
        }
      }
    }
  ])
  worker.Run()
})()