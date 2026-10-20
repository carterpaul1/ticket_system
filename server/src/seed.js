import 'dotenv/config'
import mongoose from 'mongoose'
import { Ticket } from './models/Ticket.js'

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pulsedesk'
const now = Date.now()
const samples = [
  [
    'Unable to access account after password reset',
    'Olivia Rhys',
    'olivia.rhys@example.com',
    'Email',
    'Account access',
    'Urgent',
    'Open',
    'Maya Chen',
    8,
    'Customer completed a password reset but receives a repeated verification error when signing in.',
  ],
  [
    'Duplicate charge on my latest invoice',
    'Marcus Bell',
    'marcus.bell@example.com',
    'Phone',
    'Billing',
    'High',
    'In progress',
    'Jordan Lee',
    24,
    'Customer sees two charges for the monthly plan on their latest bank statement.',
  ],
  [
    'Order tracking has not updated in 3 days',
    'Amara Okafor',
    'amara.okafor@example.com',
    'Chat',
    'Shipping',
    'Normal',
    'Open',
    'Unassigned',
    42,
    'Tracking status is stuck at label created and customer is asking for an estimated delivery date.',
  ],
  [
    'Please update the email on my profile',
    'Theo Martin',
    'theo.martin@example.com',
    'Email',
    'Account access',
    'Low',
    'Pending',
    'Sam Rivera',
    78,
    'Customer wants to replace their previous work email with a personal address.',
  ],
  [
    'App closes when I open payment settings',
    'Priya Nair',
    'priya.nair@example.com',
    'Phone',
    'Technical issue',
    'High',
    'Open',
    'Maya Chen',
    96,
    'The mobile app closes each time the customer navigates to payment settings after the latest update.',
  ],
  [
    'How do I add a second team member?',
    'Elliot Harper',
    'elliot.harper@example.com',
    'Chat',
    'Product question',
    'Normal',
    'Resolved',
    'Jordan Lee',
    128,
    'Customer needs instructions for inviting another user to their workspace.',
  ],
]

try {
  await mongoose.connect(mongoUri)
  await Ticket.deleteMany({
    ticketNumber: { $in: samples.map((_, index) => `TK-${4821 - index}`) },
  })
  await Ticket.insertMany(
    samples.map(
      (
        [subject, customer, email, channel, category, priority, status, assignee, age, description],
        index
      ) => ({
        ticketNumber: `TK-${4821 - index}`,
        subject,
        customer,
        email,
        channel,
        category,
        priority,
        status,
        assignee,
        description,
        sentiment:
          priority === 'Urgent' ? 'Frustrated' : priority === 'High' ? 'Concerned' : 'Neutral',
        createdAt: new Date(now - age * 60_000),
        updatedAt: new Date(now - age * 60_000),
        slaMinutes: [12, 36, 95, 180, 8, 240][index],
      })
    )
  )
  console.log(`Seeded ${samples.length} demo tickets.`)
} finally {
  await mongoose.disconnect()
}
