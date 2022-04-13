const app = require('./app')

// Get an port address from server or default 3000
const port = process.env.PORT

// functionParam => condition ? IF condition TRUE : IF condition FAILS
app.listen(port, error => error ? console.log(`Can't start server due to : ${error}`) : console.log(`Task Manager server started on port === ${port} =====`))