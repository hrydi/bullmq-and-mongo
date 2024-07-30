(async function() {
  'use strict'
  const { useWeb } = require('..')
  const createApp = useWeb()
  const app = await createApp().catch(e => Promise.resolve({ error: e }))
  if(!app.error) {
    app.AddQueues(['report', 'ticket'])
    app.Run()
    return
  }

  console.log(`App failed to run: `, app.error.message)
  process.exit(1)
})()