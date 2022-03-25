const request = require('supertest')
const { Task } = require('../src/models/task')
const { app } = require('../src/app')
const { userOneId, userOne, setupDatabase } = require('./fixtures/db')

beforeEach(async () => await setupDatabase())

test('Add new task to database', async () => {
    const response = await request(app)
        .post('/task')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            task: 'From test suite',
            status: true
        })
        .expect(201)
    console.log(response)
})
