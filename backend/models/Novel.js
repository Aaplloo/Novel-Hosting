const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NovelSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  filePath: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    enum: ['md', 'pdf'],
    required: true,
  },
  coverImage: {
    type: String,
    default: 'https://via.placeholder.com/150x220.png?text=No+Cover',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Novel', NovelSchema);
