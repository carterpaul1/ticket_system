import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'
import { ticketRouter } from './routes/tickets.js'

const app = express()

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
  const status = Number.isInteger(error.status)
    ? error.status
    : error.name === 'ValidationError'
      ? 400
      : 500
  response.status(status).json({ error: status < 500 ? error.message : 'Unexpected server error.' })
})

export default app
