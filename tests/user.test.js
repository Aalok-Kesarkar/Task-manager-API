const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const { User } = require('../src/models/user')

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

beforeEach(async () => {
    await User.deleteMany()
    await new User(userOne).save()
})

// SIGNUP===================================================
test('Signup new user', async () => {
    const response = await request(app)
        .post('/user/signin')
        .send({
            "name": "Aalok",
            "email": "testmail@test.com",
            "password": "dummyPass123"
        })
        .expect(201)

    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    expect(response.body).toMatchObject({
        user: {
            name: 'Aalok',
            email: 'testmail@test.com'
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('dummyPass123')
})

// LOGIN===================================================
test('Login user', async () => {
    const response = await request(app)
        .post('/user/login')
        .send({
            email: userOne.email,
            password: userOne.password
        })
        .expect(200)

    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

// UNAUTHORIZED LOGIN======================================
test('Login SHOULD FAIL', async () => {
    await request(app)
        .post('/user/login')
        .send({
            email: 'aalok@pun.sc',
            password: 'randomPass'
        })
        .expect(400)
})

// READ PROFILE============================================
test('Read users profile', async () => {
    await request(app)
        .get('/user')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

// UNATHORIZED READ REQUEST================================
test('Unauthorized read user SHOULD FAIL', async () => {
    await request(app)
        .get('/user')
        .set('Authorization', `hefbfvsjsdfvejkdvjefvdkjvv`)
        .send()
        .expect(401)
})

// UNAUTHORIZED DELETE REQUEST=============================
test('Unauthorized delete SHOULD FAIL', async () => {
    await request(app)
        .delete('/user')
        .set('Authorization', `Bearer hfbcnvdfivdfivhefiyvdfhvbjs`)
        .send()
        .expect(401)
})

// DELETE==================================================
// test('Delete user', async () => {
//     await request(app)
//         .delete('/user')
//         .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
//         .send()
//         .expect(200)

//     const user = await User.findById(userOneId)
//     expect(user).toBeNull()
// })