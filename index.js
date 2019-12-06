const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('build'));

const r = morgan.token("data", (req) => {

    if(req.method === 'POST'){
        return JSON.stringify(req.body);
    }
    return '';
});
app.use(morgan(":method :url :status :response-time ms :data"));

let persons = [
    {
        "name": "Aaro Hellas",
        "number": "0400-200400",
        "id": 1
    },
    {
        "name": "Ada Lovelace",
        "number": "39-45-53235238",
        "id": 2
    },
    {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
    },
    {
        "name": "Jorma Kaukonen",
        "number": "0400 200 400",
        "id": 5
    },
    {
        "name": "Sami Huber",
        "number": "0400 100 200",
        "id": 6
    }
];

app.get('/api/persons', (req, res) => {
    res.json(persons)
});

app.get('/info', (req, res) => {
    let info = {
        "peopleNumber": `Phone book has info for ${persons.length} people`,
        "time": new Date()
    };

    res.json(info)
});

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    const person = persons.find(person => person.id === id);
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
});

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    persons = persons.filter(person => person.id !== id);

    response.status(204).end()
});

const generateId = () => {
    const maxId = persons.length > 0 ? Math.max(...persons.map(p => p.id)) : 0;
    return maxId + 1
};

app.post('/api/persons', (request, response) => {
    const body = request.body;

    if (!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    }

    if (!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId(),
    };

    persons = persons.concat(person);
    response.json(person)
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});
