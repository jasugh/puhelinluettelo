const mongoose = require('mongoose');

if (process.argv.length < 3) {
    console.log('give password as argument');
    process.exit(1)
}

const password = process.argv[2];

const url =
    `mongodb://Jukka:${password}@ds233198.mlab.com:33198/fullstack`;

mongoose
    .connect(url, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
});

const Person = mongoose.model('Person', personSchema);

if (process.argv[3] && process.argv[4]) {
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4],
    });

    person.save().then(person => {
        console.log(`Added ${person.name} number ${person.number} to phonebook`);
        mongoose.connection.close();
    })

} else {
    Person.find({}).then(result => {
        console.log('phonebook:');

        result.forEach(person => {
            console.log(person.name + ' ' + person.number)
        });
        mongoose.connection.close()
    })
}