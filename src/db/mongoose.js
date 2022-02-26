'use strict';
const mongoose = require('mongoose')

// To connect to database only
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(() => {
    console.log(`========== Connected to database! ==========`)
}).catch((error) => {
    console.log(`Can't connect to database due to ${error}`)
}) 