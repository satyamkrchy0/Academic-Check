const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    profile: {
      phone: {
        type: String,
        trim: true,
        default: ''
      },
      university: {
        type: String,
        trim: true,
        default: ''
      },
      degree: {
        type: String,
        trim: true,
        default: ''
      },
      graduationYear: {
        type: Number,
        default: null
      },
      githubUrl: {
        type: String,
        trim: true,
        default: ''
      },
      linkedinUrl: {
        type: String,
        trim: true,
        default: ''
      },
      about: {
        type: String,
        trim: true,
        default: ''
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);
