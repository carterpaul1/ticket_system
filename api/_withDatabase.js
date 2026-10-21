import { connectToDatabase } from '../server/src/database.js'

export function withDatabase(handler) {
  return async (request, response) => {
    try {
      await connectToDatabase()
      return await handler(request, response)
    } catch (error) {
      console.error('API request failed:', error.message)
      const status = Number.isInteger(error.status) ? error.status : 503
      return response
        .status(status)
        .json({ error: status < 500 ? error.message : 'Service temporarily unavailable.' })
    }
  }
}
