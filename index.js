const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const Person = require('./models/person');

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('build'));

const r = morgan.token("data", (req) => {
    if (req.method === 'POST') {
        return JSON.stringify(req.body);
    }
    return '';
});
app.use(morgan(":method :url :status :response-time ms :data"));

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method);
    console.log('Path:  ', request.path);
    console.log('Body:  ', request.body);
    console.log('---');
    next()
};

app.use(requestLogger);

app.get('/api/persons', (request, response, next) => {
    Person.find()
        .then(persons => {
            response.json(persons.map(person => person.toJSON()))
        })
        .catch(error => next(error))
});

app.get('/info', (request, response) => {
    Person.find()
        .then(persons => {
            let info = {
                "peopleNumber": `Phone book has info for ${persons.length} people`,
                "time": new Date()
            };
            response.json(info)
        });
});

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person.toJSON())
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
});

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
});

app.post('/api/persons', (request, response, next) => {
    const body = request.body;

    if (body.name === undefined) {
        return response.status(400).json({error: 'name missing'})
    }

    if (body.number === undefined) {
        return response.status(400).json({error: 'number missing'})
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    });

    person.save()
        .then(savedPerson => {
            return savedPerson.toJSON()
        })
        .then(savedAndFormattedPerson => {
            response.json(savedAndFormattedPerson)
        })
        .catch(error => next(error))
});

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body;

    const person = {
        name: body.name,
        number: body.number,
    };

    Person.findByIdAndUpdate(
        request.params.id,
        person,
        {new: true})
        .then(updatedPerson => {
            response.json(updatedPerson.toJSON())
        })
        .catch(error => next(error))
});

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
        return response.status(400).send({error: 'malformatted id'})
    } else if(error.name === 'ValidationError') {
        return response.status(400).json(error.message)
    }
    next(error)
};

app.use(errorHandler);

const PORT = require('./config/keys').PORT;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});
