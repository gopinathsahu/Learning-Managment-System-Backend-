const mongoose = require('mongoose');
const crypto = require('crypto');
const JWT = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, 'user name is Required'],
    minLength: [5, 'Name must be at least 5 characters'],
    maxLength: [50, 'Name must be less than 50 characters'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'user email is required'],
    unique: true,
    lowercase: true,
    unique: [true, 'already registered'],
  },
  password: {
    type: String,
    select: false
  },
  confrimpassword: {
    type: String,
    select: false,
  }, subscription: {
    id: String,
    status: String,
  },
  avatar: {
    public_id: {
      type: String,
    },
    secure_url: {
      type: String,
    },
  },
  role: {
    type: String,
    enum: ['USER', 'ADMIN'],
    default: 'USER',
  },
  forgotPasswordToken: String,
  forgotPasswordExpiry: Date,
  subscription: {
    id: String,
    status: String
  }
},
  { timestamps: true }
);

// this method is used for the  encrypt the password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
}),
  // this method for jwttoken
  userSchema.methods = {
    comparePassword: async function (plainPassword) {
      return await bcrypt.compare(plainPassword, this.password);
    },

    // Will generate a JWT token with user id as payload
    jwtToken() {
      return JWT.sign({
        id: this._id, email: this.email, subscription: this.subscription, role: this.role

      },
        process.env.JWT_KEY,
        { expiresIn: '24h' })
    },


    generatePasswordResetToken: async () => {
      const resetToken = crypto.randomBytes(20).toString('hex');
      this.forgotPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      this.forgotpasswordExpiry = Date.now() + 20 * 60 * 1000;
      return resetToken;
    }

  }



module.exports = mongoose.model('user', userSchema);
