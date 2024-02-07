const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

require('dotenv').config()
const Person = require('./models/person')

const app = express()

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

morgan.token('requestData', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :requestData'))

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

let persons = []

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        console.log(persons)
        response.json(persons)
    })
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    Person.findById(id).then(person => {
        console.log(person)
        response.json(person)
    })
})

app.get('/info', (request, response) => {
    const numberOfPeople = persons.length
    const date = new Date()
    response.send(
        `
            <p>Phonebook has info for ${numberOfPeople} people</p>
            <p>${date.toString()}<p>
        `
    )
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        response.status(400).json({
            error: 'name and/or number missing'
        })
        return
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save().then(savedPerson => {
        console.log(savedPerson)
        response.json(savedPerson)
    })
}) 

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)

    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})
  
app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})