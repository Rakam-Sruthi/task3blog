const mongoose = require('mongoose');
const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true }, // store sanitized html or markdown
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: String,
  category: { type: String, default: 'General' },
  imageUrl: String,
  published: { type: Boolean, default: false },
  approved: { type: Boolean, default: false }, // admin approval workflow
}, { timestamps: true });
module.exports = mongoose.model('Post', postSchema);
