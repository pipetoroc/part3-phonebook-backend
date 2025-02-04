const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('Give a password as argument')
    process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://backend-notes:${password}@cluster0.nom7v.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
    id: Number,
    name: String,
    number: String
})

const Person = mongoose.model('Person', personSchema)

const person = new Person({

    name: process.argv[3],
    number: process.argv[4]
})

if (process.argv.length === 3) {
    Person.find().then(result => {
        result.forEach(person => {
            console.log(person)
        })
        mongoose.connection.close()
    })
} else {
    person.save().then(result => {
        console.log(`added ${process.argv[3]} ${process.argv[4]}`)
        mongoose.connection.close()
    })
}
