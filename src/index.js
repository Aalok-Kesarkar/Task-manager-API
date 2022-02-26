const express = require('express')
const jwt = require('jsonwebtoken')
// It don't return anything, Just get connect to the database
require('./db/mongoose')

// Importing routers
const userRouter = require('./routers/user')
const userTask = require('./routers/task')

// Store method in a variable returned from express() npm
const app = express()

// Get an port address from server or default 3000
const port = process.env.PORT

// Parse incoming data from JSON to Object
app.use(express.json())

// mount userRouter & userTask middleware functions
app.use(userRouter)
app.use(userTask)

// functionParam => condition ? IF condition TRUE : IF condition FAILS
app.listen(port, error => error ? console.log(`Can't start server due to : ${error}`) : console.log(`NodeJS server started on port === ${port} =====`))