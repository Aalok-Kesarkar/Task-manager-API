const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const { User } = require('../models/user')
const authenticate = require('../middleware/authenticate')
const sendEmail = require('../email-sending/sendgrid')
const router = new express.Router()

// Post method for new user //SIGNUP
router.post('/user/signin', async (req, res) => {
    // create an variable and store data from guest in new User format described in user.js module
    const user = new User(req.body)

    // save data from user variable to Database using try catch and async-await method
    try {
        await user.save()
        const token = await user.generateAuthToken()
        sendEmail.welcomeMail(user.email, user.name)
        res.status(201).send({ user, token })
    } catch (err) {
        res.status(400).send(`Error occured ${err}`)
    }
})

// Login for user
router.post('/user/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        // console.log('Genarated at router: ',token)
        res.send({ user, token })
    } catch (err) {
        res.status(400).send(`Something went wrong ${err}`)
    }
})

const avatarUpload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, callBackFnc) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return callBackFnc(new Error(`Please upload .jpg or .jpeg or .png file only`), undefined)
        }

        callBackFnc(undefined, true)
    }
})
// Upload avatar for user
router.post('/user/avatar', authenticate, avatarUpload.single('upload'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 200, height: 200 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send(`Avatar uploaded successfully`)
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

// DELETE delete avatar
router.delete('/user/avatar', authenticate, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send('Avatar deleted')
})

// Get method to see user profile
router.get('/user', authenticate, async (req, res) => {
    res.send(req.user)
})

// GET method to user avatar
router.get('/user/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw Error({ error: 'No user found' })
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (err) {
        res.status(404).send(`No profile picture found...`)
    }
})

// LOGOUT from single device
router.post('/user/logout', authenticate, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((eachTokenObjInDb) => { // filter will go through for all tokens in database of that particular user (like forEach)
            return eachTokenObjInDb.token !== req.token // Return true if token does not match with token come with header
        })
        await req.user.save() // Save all tokens except one which match with request header token
        res.send(`Successfully logged out`)
    } catch (err) {
        res.status(500).send(`Server isse, coludn't logged out, try again`)
    }
})

// LOGOUT from multiple devices
router.post('/user/logout-all', authenticate, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send(`Successfully logged out of all devices`)
    } catch (err) {
        res.status(500).send(`Can't perform logout operation, Error from system is: ${err}`)
    }
})

// Update user data
router.patch('/user', authenticate, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'age', 'password']
    const isValidUpdate = updates.every((update) => { // if every param from requested 'updates' is available in allowed list then only it'll return true
        return allowedUpdates.includes(update)
    })

    if (!isValidUpdate) {
        return res.status(400).send({ error: 'Invalid update operation detected' })
    }

    try {
        updates.forEach((update) => {
            req.user[update] = req.body[update]
        })
        await req.user.save()
        res.send([`Updated successfully!`, req.user])
    } catch (err) {
        res.status(400).send(err)
    }
})

// Delete an user with ID
router.delete('/user', authenticate, async (req, res) => {
    try {
        await req.user.remove()
        sendEmail.deletionMail(req.user.email, req.user.name)
        res.send([`User Deleted :(`, req.user])
    } catch (err) {
        res.status(500).send(err)
    }
})

module.exports = router