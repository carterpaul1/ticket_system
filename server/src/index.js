import 'dotenv/config'
import app from './app.js'
import { connectToDatabase } from './database.js'

const port = Number(process.env.PORT) || 4000

app.listen(port, () => console.log(`PulseDesk API listening on http://localhost:${port}`))
connectToDatabase()
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.warn(`MongoDB is unavailable (${error.message}).`))
