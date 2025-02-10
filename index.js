require('dotenv').config()
const express = require('express')
const app = express()
const Person = require('./models/mongoose')

const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('./models/mongoose')

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :response-time ms :body'))

// info app
app.get('/info', (request, response, next) => {
  Person.countDocuments({}).then(count => {
    response.send(`<p>Phonebook has info for ${count}</p> 
        ${new Date().toString()}`)
  }).catch(error => next(error))
})

// all entries request
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

// single entry
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    console.log(person)
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
    .catch(error => next(error))
})

// delete single person
app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndDelete(request.params.id).then(person => {
    response.status(204).end()
  })
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findOneAndUpdate({ name }, { number }, { new: true, runValidators: true, context: 'query' })
    .then(personUpdated => {
      response.json(personUpdated)
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const person = request.body

  if (!person.name || !person.number) {
    return response.status(400).json({
      error: 'required "name and number" field is missing'
    })
  }

  const newPerson = new Person({
    name: person.name,
    number: person.number
  })

  newPerson.save().then(savedPerson => {
    response.json(savedPerson)
  })
    .catch(error => {
      console.log(error)
      next(error)
    })
})

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return response.status(404).send({ error: 'malformated id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
