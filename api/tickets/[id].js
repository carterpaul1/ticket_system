import { withDatabase } from '../_withDatabase.js'
import { updateTicket } from '../../server/src/ticketService.js'

export default withDatabase(async (request, response) => {
  if (request.method !== 'PATCH') {
    response.setHeader('Allow', 'PATCH')
    return response.status(405).json({ error: 'Method not allowed.' })
  }
  return response.json({ data: await updateTicket(request.query.id, request.body) })
})
