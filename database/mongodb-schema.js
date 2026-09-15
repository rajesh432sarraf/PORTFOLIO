/**
 * MongoDB Schema definition for Contact Messages.
 * Uses Mongoose schema definition style for Node.js / Serverless API environments.
 */

export const MessageSchema = {
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 80,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    minlength: 5,
    maxlength: 120,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  subject: {
    type: String,
    trim: true,
    maxlength: 150,
    default: 'General Inquiry',
  },
  message: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 3000,
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'archived'],
    default: 'new',
  },
  ipAddress: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
};

export default MessageSchema;
