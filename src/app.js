const express = require('express')
require('./db/mongoose') // It don't return anything, Just get connect to the database

// Importing routers
const userRouter = require('./routers/user')
const userTask = require('./routers/task')

// Store method in a variable returned from express() npm
const app = express()

// Parse incoming data from JSON to Object
app.use(express.json())

// mount userRouter & userTask middleware functions
app.use(userRouter)
app.use(userTask)

module.exports = app