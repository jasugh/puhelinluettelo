const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// DB Config
const db = require('../config/keys').mongoURI;

console.log('mongoURI ', db);

mongoose
    .connect(db, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    })
    .then(() => console.log('MongoDB Connected'))
    .catch(error => console.log('error connecting to MongoDB:', error.message));

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
    },
    number: {
        type: String,
        required: true,
        minlength: 8,
    }
});

personSchema.plugin(uniqueValidator);

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v
    }
});

module.exports = mongoose.model('Person', personSchema);