const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

const { mongoose } = require('../db/mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 5,
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 5
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

UserSchema.methods.toJSON = function toJSON() {
  const user = this;
  return _.pick(user, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function generateAuthToken() {
  const user = this;

  const access = 'auth';
  const token = jwt.sign({ _id: user._id.toHexString(), access }, 'hash_secret').toString();

  user.tokens = user.tokens.concat([{ access, token }]);

  return user.save().then(() => {
    return token;
  });
};

UserSchema.statics.fetchByToken = function fetchByToken(token) {
  const User = this;
  let decodedUser;

  try {
    decodedUser = jwt.verify(token, 'hash_secret');
  } catch (e) {
    return Promise.reject(e);
  }

  return User.findOne({
    _id: decodedUser._id,
    'tokens.token': token,
    'tokens.access': decodedUser.access
  });
};

// Google for 'mongoose schema' to learn more about configuring model options
// User Model
const User = mongoose.model('User', UserSchema);

module.exports = { User };
