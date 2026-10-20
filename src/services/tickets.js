import { demoTickets, triageTicket } from '../data/demoTickets'

const API_URL = import.meta.env.VITE_API_URL || '/api'

async function request(path, options) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!response.ok) throw new Error(`Request failed (${response.status})`)
  return response.json()
}

export async function getTickets() {
  try {
    const result = await request('/tickets')
    return { tickets: result.data, source: 'mongo' }
  } catch {
    return { tickets: demoTickets, source: 'demo' }
  }
}

export async function createTicket(input) {
  const ticket = triageTicket(input)
  try {
    return {
      ...(await request('/tickets', { method: 'POST', body: JSON.stringify(ticket) })),
      source: 'mongo',
    }
  } catch {
    return {
      data: {
        ...ticket,
        _id: `local-${Date.now()}`,
        ticketNumber: `TK-${Date.now().toString().slice(-4)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'Open',
        assignee: 'Unassigned',
      },
      source: 'demo',
    }
  }
}

export async function updateTicket(id, changes) {
  if (String(id).startsWith('local-') || String(id).startsWith('tkt-'))
    return { data: { _id: id, ...changes }, source: 'demo' }
  return request(`/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(changes) })
}
