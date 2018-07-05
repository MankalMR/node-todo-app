const { mongoose } = require('../db/mongoose');

// Google for 'mongoose schema' to learn more about configuring model options
// Todo model
const Todo = mongoose.model('Todo', {
  text: {
    type: String,
    required: true,
    minlength: 5,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: String,
    default: null
  }
});

module.exports = { Todo };
