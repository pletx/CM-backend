const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  successRate: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  mentions: {
    tresBien: {
      type: Number,
      required: true
    },
    bien: {
      type: Number,
      required: true
    },
    assezBien: {
      type: Number,
      required: true
    }
  }
});

module.exports = mongoose.model('Result', ResultSchema);
