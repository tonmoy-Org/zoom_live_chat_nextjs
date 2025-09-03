import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  inviteCode: {
    type: String,
    required: true,
    unique: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isMessagingEnabled: {
    type: Boolean,
    default: true,
  },
  allowedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  restrictedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  messagingMode: {
    type: String,
    enum: ['all', 'restricted', 'allowed_only'],
    default: 'all',
  },
  banner: {
    imageUrl: {
      type: String,
      default: null,
    },
    text: {
      type: String,
      default: '',
    },
    updatedAt: {
      type: Date,
      default: null,
    },
  },
}, {
  timestamps: true,
});

export default mongoose.models.Group || mongoose.model('Group', groupSchema);