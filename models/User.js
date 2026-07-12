const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
        trim:true,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim:true,
    lowercase:true
  },
  password: {
    type: String,
    minlength: 8,
    required: true
  },
   phone: {
    type: String,
    minlength: 8,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);