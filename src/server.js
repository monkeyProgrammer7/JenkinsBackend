import { createApp } from './app.js'
import { createDatabase } from './db.js'

const PORT = process.env.PORT || 3000

const db = createDatabase({ seed: true })
createApp(db).listen(PORT, '0.0.0.0', () => {
  console.log(`API de telemetría escuchando en http://localhost:${PORT}`)
})
