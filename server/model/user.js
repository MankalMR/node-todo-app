var {mongoose} = require('../db/mongoose');

//Google for 'mongoose schema' to learn more about configuring model options
//User Model
var User = mongoose.model('User', {
    email: {
        type: String,
        required: true,
        minlength: 5,
        trim: true
    }
});

module.exports = {User};