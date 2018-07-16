const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

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
  const token = jwt.sign({ _id: user._id.toHexString(), access }, process.env.JWT_SECRET).toString();

  user.tokens = user.tokens.concat([{ access, token }]);

  return user.save().then(() => {
    return token;
  });
};

UserSchema.methods.removeToken = function removeToken(token) {
  const user = this;

  return user.update({
    $pull: {
      tokens: { token }
    }
  });
};

UserSchema.statics.findByCredentials = function findByCredentials(email, password) {
  const User = this;

  return User.findOne({ email }).then((user) => {
    if (!user) {
      return Promise.reject(new Error('User with email not found!'));
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user);
        } else {
          reject(new Error('Incorrect Password!'));
        }
      });
    });
  });
};

UserSchema.statics.fetchByToken = function fetchByToken(token) {
  const User = this;
  let decodedUser;

  try {
    decodedUser = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return Promise.reject(e);
  }

  return User.findOne({
    _id: decodedUser._id,
    'tokens.token': token,
    'tokens.access': decodedUser.access
  });
};

UserSchema.pre('save', function preSave(next) {
  const user = this;

  if (user.isModified('password')) {
    bcrypt.genSalt(10, (genSaltErr, salt) => {
      bcrypt.hash(user.password, salt, (hashErr, hashedPwd) => {
        user.password = hashedPwd;
        next();
      });
    });
  } else {
    next();
  }
});

// Google for 'mongoose schema' to learn more about configuring model options
// User Model
const User = mongoose.model('User', UserSchema);

module.exports = { User };
