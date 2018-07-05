const mongoose = require('mongoose');

const mongoURI = process.env.MONGODB_URI;

mongoose.Promise = global.Promise;
mongoose.connect(mongoURI);

module.exports = { mongoose };
