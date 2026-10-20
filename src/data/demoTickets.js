const minutesAgo = (minutes) => new Date(Date.now() - minutes * 60_000).toISOString()

export const demoTickets = [
  {
    _id: 'tkt-4821',
    ticketNumber: 'TK-4821',
    subject: 'Unable to access account after password reset',
    customer: 'Olivia Rhys',
    email: 'olivia.rhys@example.com',
    channel: 'Email',
    category: 'Account access',
    priority: 'Urgent',
    status: 'Open',
    assignee: 'Maya Chen',
    createdAt: minutesAgo(8),
    updatedAt: minutesAgo(8),
    description:
      'Customer completed a password reset but receives a repeated verification error when signing in.',
    sentiment: 'Frustrated',
    slaMinutes: 12,
  },
  {
    _id: 'tkt-4819',
    ticketNumber: 'TK-4819',
    subject: 'Duplicate charge on my latest invoice',
    customer: 'Marcus Bell',
    email: 'marcus.bell@example.com',
    channel: 'Phone',
    category: 'Billing',
    priority: 'High',
    status: 'In progress',
    assignee: 'Jordan Lee',
    createdAt: minutesAgo(24),
    updatedAt: minutesAgo(10),
    description: 'Customer sees two charges for the monthly plan on their latest bank statement.',
    sentiment: 'Concerned',
    slaMinutes: 36,
  },
  {
    _id: 'tkt-4817',
    ticketNumber: 'TK-4817',
    subject: 'Order tracking has not updated in 3 days',
    customer: 'Amara Okafor',
    email: 'amara.okafor@example.com',
    channel: 'Chat',
    category: 'Shipping',
    priority: 'Normal',
    status: 'Open',
    assignee: 'Unassigned',
    createdAt: minutesAgo(42),
    updatedAt: minutesAgo(42),
    description:
      'Tracking status is stuck at label created and customer is asking for an estimated delivery date.',
    sentiment: 'Neutral',
    slaMinutes: 95,
  },
  {
    _id: 'tkt-4814',
    ticketNumber: 'TK-4814',
    subject: 'Please update the email on my profile',
    customer: 'Theo Martin',
    email: 'theo.martin@example.com',
    channel: 'Email',
    category: 'Account access',
    priority: 'Low',
    status: 'Pending',
    assignee: 'Sam Rivera',
    createdAt: minutesAgo(78),
    updatedAt: minutesAgo(32),
    description: 'Customer wants to replace their previous work email with a personal address.',
    sentiment: 'Positive',
    slaMinutes: 180,
  },
  {
    _id: 'tkt-4812',
    ticketNumber: 'TK-4812',
    subject: 'App closes when I open payment settings',
    customer: 'Priya Nair',
    email: 'priya.nair@example.com',
    channel: 'Phone',
    category: 'Technical issue',
    priority: 'High',
    status: 'Open',
    assignee: 'Maya Chen',
    createdAt: minutesAgo(96),
    updatedAt: minutesAgo(96),
    description:
      'The mobile app closes each time the customer navigates to payment settings after the latest update.',
    sentiment: 'Frustrated',
    slaMinutes: 8,
  },
  {
    _id: 'tkt-4808',
    ticketNumber: 'TK-4808',
    subject: 'How do I add a second team member?',
    customer: 'Elliot Harper',
    email: 'elliot.harper@example.com',
    channel: 'Chat',
    category: 'Product question',
    priority: 'Normal',
    status: 'Resolved',
    assignee: 'Jordan Lee',
    createdAt: minutesAgo(128),
    updatedAt: minutesAgo(21),
    description: 'Customer needs instructions for inviting another user to their workspace.',
    sentiment: 'Positive',
    slaMinutes: 240,
  },
]

export const statusOptions = ['Open', 'In progress', 'Pending', 'Resolved']
export const priorityOptions = ['Urgent', 'High', 'Normal', 'Low']
export const categories = [
  'Account access',
  'Billing',
  'Technical issue',
  'Shipping',
  'Product question',
  'Other',
]

export function triageTicket(ticket) {
  const content = `${ticket.subject ?? ''} ${ticket.description ?? ''}`.toLowerCase()
  const urgentSignals = [
    'fraud',
    'locked out',
    'cannot access',
    'unable to access',
    'security breach',
    'data loss',
    'service down',
  ]
  const highSignals = [
    'charged twice',
    'duplicate charge',
    'payment failed',
    'app crashes',
    'not working',
    'overdue',
  ]
  const priority = urgentSignals.some((signal) => content.includes(signal))
    ? 'Urgent'
    : highSignals.some((signal) => content.includes(signal))
      ? 'High'
      : ticket.priority || 'Normal'
  const category =
    ticket.category ||
    (/(charge|invoice|billing|payment)/.test(content)
      ? 'Billing'
      : /(password|sign in|login|account)/.test(content)
        ? 'Account access'
        : /(ship|tracking|delivery|order)/.test(content)
          ? 'Shipping'
          : /(app|crash|error|bug|not working)/.test(content)
            ? 'Technical issue'
            : 'Other')
  return { ...ticket, priority, category }
}

export function formatAge(date) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60_000))
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`
}
