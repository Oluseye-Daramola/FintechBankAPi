const mongoose = require('mongoose'); // Import mongoose

// Define the customer schema

const customerSchema = new mongoose.Schema({
fullName: {
    type: String,
    required: true,
    trim: true,
    },
email: {
    type: String,
    required: true,
    trim: true,
  },
phone: {
    type: String,
    required: true,
    trim: true,
  },
dob: {
    type: Date,
    required: true,
  },
password: {
    type: String,
    required: true,
  },
gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other'],
  },
onboardingStatus: {
    type: String,
    enum: ['pending', 'verified'],
    default: 'pending',
  },
verificationType: {
    type: String,
    enum: ['BVN', 'NIN'],
  },
verificationRef: {
    type: String,
  },
VerifiedAt: {
    type: Date,
  },
},
{
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Create a model using the schema
const Customer = mongoose.model('Customer', customerSchema);
// Export the model
module.exports = Customer;