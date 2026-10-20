import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'
import { ticketRouter } from './routes/tickets.js'

const app = express()
const port = Number(process.env.PORT) || 4000
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pulsedesk'

app.disable('x-powered-by')
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json({ limit: '32kb' }))
app.get('/api/health', (_request, response) =>
  response.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  })
)
app.use(
  '/api/tickets',
  (_request, response, next) => {
    if (mongoose.connection.readyState !== 1)
      return response
        .status(503)
        .json({ error: 'MongoDB is not connected. Start the local database and retry.' })
    return next()
  },
  ticketRouter
)
app.use((error, _request, response, _next) => {
  console.error('API request failed:', error.message)
  response
    .status(error.name === 'ValidationError' ? 400 : 500)
    .json({ error: error.name === 'ValidationError' ? error.message : 'Unexpected server error.' })
})

app.listen(port, () => console.log(`PulseDesk API listening on http://localhost:${port}`))
mongoose
  .connect(mongoUri)
  .then(() => console.log('Connected to local MongoDB'))
  .catch((error) => {
    console.warn(
      `MongoDB is unavailable (${error.message}). API will report a disconnected state until restarted.`
    )
  })
