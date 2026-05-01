/**
 * Project Model
 * A project groups tasks and has members with roles.
 * The creator is automatically set as admin.
 */

const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'member'],
    default: 'member',
  },
}, { _id: false });

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    // Creator of the project (always admin)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // List of members with their roles
    members: [memberSchema],
    color: {
      type: String,
      default: '#6366f1', // Default indigo accent color
    },
  },
  { timestamps: true }
);

// Ensure each user appears only once in members array
projectSchema.index({ 'members.user': 1 });

module.exports = mongoose.model('Project', projectSchema);
