const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const { User } = require('../../src/models/user')

const userOneId = new mongoose.Types.ObjectId
const userOne = {
    _id: userOneId,
    name: 'Jeff',
    email: 'jeff@gmail.com',
    password: 'dummyKey@123',
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
}

const setupDatabase = async () => {
    await User.deleteMany()
    const user = await new User(userOne).save()
    // console.log(user)
}

module.exports = {
    userOneId: userOneId,
    userOne: userOne,
    setupDatabase: setupDatabase
}