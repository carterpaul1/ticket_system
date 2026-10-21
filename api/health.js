import mongoose from 'mongoose'
import { withDatabase } from './_withDatabase.js'

export default withDatabase((_request, response) =>
  response.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  })
)
