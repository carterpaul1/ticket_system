import { Router } from 'express'
import { createTicket, listTickets, updateTicket } from '../ticketService.js'

export const ticketRouter = Router()

ticketRouter.get('/', async (request, response) => {
  response.json({ data: await listTickets(request.query) })
})

ticketRouter.post('/', async (request, response) => {
  return response.status(201).json({ data: await createTicket(request.body) })
})

ticketRouter.patch('/:id', async (request, response) => {
  return response.json({ data: await updateTicket(request.params.id, request.body) })
})
