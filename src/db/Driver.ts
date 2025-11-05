import moment from 'moment'
import * as mongoose from 'mongoose'
var role = ['driver']
var gender = ['', 'Male', 'Female']

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: '',
    },
    profilePicture: {
      type: String,
      default: '',
    },
    email: {
      type: String,
    },
    address: {
      type: String,
      default: ''
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    alternateAddress: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    countryCode: {
      type: String,
      default: ""
    },
    alternatePhone: {
      type: String,
      default: '',
    },
    dob: {
      type: Date,
      default: new Date('1970-01-01'),
    },
    gender: {
      type: String,
      default: 'Male',
      enum: gender,
    },
    password: {
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
    role: {
      type: String,
      default: 'driver',
      enum: role,
      lowercase: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    showNotification: {
      type: Boolean,
      default: false,
    },
    isDocumentUploaded: {
      type: Boolean,
      default: false,
    },
    isProfileRegistered: {
      type: Boolean,
      default: false,
    },
    isProfileVerified: {
      type: Boolean,
      default: false,
    },
    licenceNo: {
      type: String,
      trim: true
    },
    vehicleType: {
      type: mongoose.Schema.Types.ObjectId,
    },
    documents: [
      {
        key:   { type: String, required: true },
        value: { type: String, default: "" },
      },
    ],
    accessToken: {
      type: String,
      default: '',
    },
    fcmToken: {
      type: String,
    }
  },
  { timestamps: true }
)

driverSchema.set('toJSON', {
  virtuals: false,
  transform: (doc, ret, Options) => {
    delete ret.password
    delete ret.__v
    // delete ret.accessToken
    //delete ret._id
  },
})

export const driverModel = mongoose.model('driver', driverSchema)

// languages:
// English (US)	: en-US
// German	: de-DE
// French	: fr-FR
// Polish	: pl-PL
