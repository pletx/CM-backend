const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  uploadPath: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Image', ImageSchema);
