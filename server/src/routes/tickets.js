import { Router } from 'express'
import { randomBytes } from 'node:crypto'
import { Ticket } from '../models/Ticket.js'
import { triage } from '../triage.js'

export const ticketRouter = Router()
const validStatuses = ['Open', 'In progress', 'Pending', 'Resolved']

function serialize(ticket) {
  return { ...ticket.toObject(), _id: ticket._id.toString() }
}

ticketRouter.get('/', async (request, response) => {
  const { status, priority, search } = request.query
  const filter = {}
  if (validStatuses.includes(status)) filter.status = status
  if (['Urgent', 'High', 'Normal', 'Low'].includes(priority)) filter.priority = priority
  if (typeof search === 'string' && search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    filter.$or = [
      { ticketNumber: new RegExp(escaped, 'i') },
      { subject: new RegExp(escaped, 'i') },
      { customer: new RegExp(escaped, 'i') },
    ]
  }
  const tickets = await Ticket.find(filter).sort({ createdAt: -1 }).limit(100).lean()
  response.json({ data: tickets.map((ticket) => ({ ...ticket, _id: ticket._id.toString() })) })
})

ticketRouter.post('/', async (request, response) => {
  const { customer, email, subject, description, channel, category } = request.body ?? {}
  if (
    ![customer, email, subject, description].every(
      (field) => typeof field === 'string' && field.trim()
    )
  ) {
    return response
      .status(400)
      .json({ error: 'Customer, email, subject, and description are required.' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return response.status(400).json({ error: 'Enter a valid customer email address.' })
  const triaged = triage({ customer, email, subject, description, channel, category })
  const ticket = await Ticket.create({
    ...triaged,
    ticketNumber: `TK-${randomBytes(3).toString('hex').toUpperCase()}`,
  })
  return response.status(201).json({ data: serialize(ticket) })
})

ticketRouter.patch('/:id', async (request, response) => {
  const { status } = request.body ?? {}
  if (!validStatuses.includes(status))
    return response.status(400).json({ error: 'Choose a valid ticket status.' })
  if (!/^[a-f\d]{24}$/i.test(request.params.id))
    return response.status(404).json({ error: 'Ticket not found.' })
  const ticket = await Ticket.findByIdAndUpdate(
    request.params.id,
    { status },
    { new: true, runValidators: true }
  )
  if (!ticket) return response.status(404).json({ error: 'Ticket not found.' })
  return response.json({ data: serialize(ticket) })
})
