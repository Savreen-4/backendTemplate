import moment from 'moment';
import * as mongoose from 'mongoose';
var role = ['admin', 'user'];
var comapnyType = ['selfemployed', 'business'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      lowercase: true,
    },
    role: {
      type: String,
      default: 'user',
      enum: role,
      lowercase: true
    },
    companyType: {
      type: String,
      default: 'selfemployed',
      enum: comapnyType,
      lowercase: true
    },
    fcmToken: {
      type: String,
    },
    password: {
      type: String
    },
    phone: {
      type: String,
      default: '',
    },
    countryCode: {
      type: String,
      required: true,
      default: "+1"
    },
    profilePicture: {
      type: String,
      default: '',
    },
    street: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    state: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ['Active', 'InActive'],
      default: 'Active'
    },
    postalCode: {
      type: String,
      required: false,
    },
    accessToken: {
      type: String,
      default: '',
    },
    otp: {
      type: String,
      default: '',
    },
    otpVerified: {
      type: Boolean,
      default: false,
    },
    otpExipredAt: {
      type: Date,
      default: moment().add(1, 'M'),
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    showNotification: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
    companyId: {
      type: String
    },
    isProfileRegistered: {
      type: Boolean,
      default: false,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users', // Refers to the 'users' model (if needed)
    },
    location: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number] },
    },
  },
  { timestamps: true }
);

// Virtuals for toJSON transformation
userSchema.set('toJSON', {
  virtuals: false,
  transform: (doc, ret, Options) => {
    delete ret.password; // Remove password before sending data back
    delete ret.__v; // Remove version key
    delete ret.isDeleted; // Optional, can remove if not necessary
  },
});

export const userModel = mongoose.model('user', userSchema);
