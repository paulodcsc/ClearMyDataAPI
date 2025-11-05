const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  files: [
    {
      originalName: String,
      filename: String,
      path: String,
      processedPath: String,
      size: Number,
      status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending',
      },
    },
  ],
  progress: {
    type: Number,
    default: 0,
  },
  totalFiles: {
    type: Number,
    default: 0,
  },
  filesProcessed: {
    type: Number,
    default: 0,
  },
  currentFile: {
    type: String,
    default: null,
  },
  report: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  error: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
    default: null,
  },
});

jobSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Job', jobSchema);


