import mongoose from 'mongoose'

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: { type: String, required: true, unique: true, index: true },
    subject: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 4000 },
    customer: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    channel: { type: String, enum: ['Phone', 'Email', 'Chat', 'Social'], default: 'Phone' },
    category: {
      type: String,
      enum: [
        'Account access',
        'Billing',
        'Technical issue',
        'Shipping',
        'Product question',
        'Other',
      ],
      default: 'Other',
    },
    priority: { type: String, enum: ['Urgent', 'High', 'Normal', 'Low'], default: 'Normal' },
    status: { type: String, enum: ['Open', 'In progress', 'Pending', 'Resolved'], default: 'Open' },
    assignee: { type: String, default: 'Unassigned' },
    sentiment: {
      type: String,
      enum: ['Positive', 'Neutral', 'Concerned', 'Frustrated'],
      default: 'Neutral',
    },
    slaMinutes: { type: Number, min: 0, default: 60 },
  },
  { timestamps: true, versionKey: false }
)

export const Ticket = mongoose.model('Ticket', ticketSchema)
