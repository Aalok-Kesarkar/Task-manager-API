const express = require('express')
const { Task } = require('../models/task')
const { User } = require('../models/user')
const authenticate = require('../middleware/authenticate')

const router = new express.Router()

// Post method to create tasks
router.post('/task', authenticate, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (err) {
        res.status(400).send(err)
    }
})

// Get method to fetch all tasks
router.get('/task', authenticate, async (req, res) => {
    // incase no query is passed via URL then 'match' will remain as blank object and will get reffered in line 38 as blank so all tasks will get fetched
    let match = {}
    let sort = {}

    if (req.query.status) {
        // if req.query.status is 'true' then '===' condition will be true and 'true' will get stored in match.status,
        // if '===' condition fails then false will get stored in match.status
        match.status = req.query.status === 'true'
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split('_')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        // const tasks = await Task.find({ owner: req.user._id })
        await req.user.populate({
            path: 'virtualTasks',
            match,
            options: {
                // this will limit number of tasks showing on the page at a single time to decrease processing load of fetching all tasks at a time from server
                limit: parseInt(req.query.limit) || 2,
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.virtualTasks)
    } catch (err) {
        res.status(500).send(`${err}`)
    }
})

// Get method to fetch only one task by Id
router.get('/task/:id', authenticate, async (req, res) => {
    const _id = req.params.id

    try {
        // Following is used because if task found then system will check its owner ID is same as of user who is currently logged in?
        // otherwise any user could get task of another user by simply putting task ID in url (which does check owner info is there or not... so)
        const task = await Task.findOne({ _id, owner: req.user._id })
        if (!task) {
            return res.status(404).send({ error: `Task not found` })
        }
        res.send(task)
    } catch (err) {
        res.status(500).send(err)
    }
})

// Update task with ID
router.patch('/task/:id', authenticate, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['status', 'task']
    const isAllowedUpdate = updates.every((update) => {
        return allowedUpdates.includes(update)
    })

    if (!isAllowedUpdate) {
        return res.status(400).send({ error: `This update is not valid` })
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(404).send({ error: `Task not found` })
        }

        updates.forEach(update => task[update] = req.body[update])
        await task.save()

        res.send(task)
    } catch (err) {
        res.status(500).send(`Failed to update task ${err}`)
    }
})

// Delete task with ID
router.delete('/task/:id', authenticate, async (req, res) => {
    try {
        const deleteTask = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        console.log(deleteTask)
        if (!deleteTask) {
            return res.status(404).send({ error: `No task found with ID provided` })
        }
        res.send(deleteTask)
    } catch (err) {
        res.status(500).send(err)
    }
})

module.exports = router