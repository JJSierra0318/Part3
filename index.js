const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/person')


app.use(express.json())
app.use(cors())
app.use(express.static('build'))

morgan.token('post', (request) => JSON.stringify(request.body))
app.use('/api/persons', morgan(':method :url :status :res[content-length] - :response-time ms :post'));

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findById(id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})


app.get('/info', (request, response) => {
    Person.find({}).then(persons => {
        response.send(`<p>Phonebook has info for ${persons.length} people<br><br>${new Date()}</p>`)
    })
})


app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({ error: 'content missing'})
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findByIdAndRemove(id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
  })

app.put('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    const body = request.body

    const person = {
        number: body.number
    }

    Person.findByIdAndUpdate(id, person, {new: true})
        .then(updatedPerson => {
            response.jason(updatedPerson)
        })
        .catch(error => next(error))
})



const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } 
    
    next(error)
}
  
  app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})