const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

require('dotenv').config()
const Person = require('./models/person')

const app = express()

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

morgan.token('requestData', function (req, res) {
  return JSON.stringify(req.body)
})
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :requestData'
  )
)

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

let persons = []

app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    console.log(persons)
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findById(id)
    .then((person) => {
      console.log(person)
      response.json(person)
    })
    .catch((error) => next(error))
})

app.get('/info', (request, response) => {
  Person.find({}).then((persons) => {
    console.log(persons)
    const numberOfPeople = persons.length
    const date = new Date()
    response.send(
      `
        <p>Phonebook has info for ${numberOfPeople} people</p>
        <p>${date.toString()}<p>
      `
    )
  })
})

app.put('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  const body = request.body
  const person = {
    name: body.name,
    number: body.number,
  }

  console.log('person is = ', person)

  Person.findByIdAndUpdate(id, person, {
    new: true,
    runValidators: true,
    context: 'query',
  })
    .then((updatedPerson) => {
      console.log('updatedPerson = ', updatedPerson)
      response.json(updatedPerson)
    })
    .catch((error) => {
      next(error)
    })
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person
    .save()
    .then((savedPerson) => {
      console.log(savedPerson)
      response.json(savedPerson)
    })
    .catch((error) => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id

  Person.findByIdAndDelete(id)
    .then((result) => {
      console.log(`result = ${result}`)
      response.status(204).end()
    })
    .catch((error) => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
