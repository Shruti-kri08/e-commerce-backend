const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: {
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
  },
  role: {
  type: String,
  required: true,
  enum: ["Seller", "Buyer"]
}
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);