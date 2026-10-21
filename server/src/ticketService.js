import { randomBytes } from 'node:crypto'
import { Ticket } from './models/Ticket.js'
import { triage } from './triage.js'

const validStatuses = ['Open', 'In progress', 'Pending', 'Resolved']

export class TicketServiceError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

function serialize(ticket) {
  return { ...ticket.toObject(), _id: ticket._id.toString() }
}

export async function listTickets(query = {}) {
  const { status, priority, search } = query
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
  return tickets.map((ticket) => ({ ...ticket, _id: ticket._id.toString() }))
}

export async function createTicket(input = {}) {
  const { customer, email, subject, description, channel, category } = input
  if (
    ![customer, email, subject, description].every(
      (field) => typeof field === 'string' && field.trim()
    )
  ) {
    throw new TicketServiceError(400, 'Customer, email, subject, and description are required.')
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw new TicketServiceError(400, 'Enter a valid customer email address.')
  }

  const triaged = triage({ customer, email, subject, description, channel, category })
  const ticket = await Ticket.create({
    ...triaged,
    ticketNumber: `TK-${randomBytes(3).toString('hex').toUpperCase()}`,
  })
  return serialize(ticket)
}

export async function updateTicket(id, input = {}) {
  const { status } = input
  if (!validStatuses.includes(status)) {
    throw new TicketServiceError(400, 'Choose a valid ticket status.')
  }
  if (!/^[a-f\d]{24}$/i.test(id)) {
    throw new TicketServiceError(404, 'Ticket not found.')
  }

  const ticket = await Ticket.findByIdAndUpdate(id, { status }, { new: true, runValidators: true })
  if (!ticket) throw new TicketServiceError(404, 'Ticket not found.')
  return serialize(ticket)
}
