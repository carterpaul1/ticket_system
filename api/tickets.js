import { withDatabase } from './_withDatabase.js'
import { createTicket, listTickets } from '../server/src/ticketService.js'

export default withDatabase(async (request, response) => {
  if (request.method === 'GET') {
    return response.json({ data: await listTickets(request.query) })
  }
  if (request.method === 'POST') {
    return response.status(201).json({ data: await createTicket(request.body) })
  }
  response.setHeader('Allow', 'GET, POST')
  return response.status(405).json({ error: 'Method not allowed.' })
})
