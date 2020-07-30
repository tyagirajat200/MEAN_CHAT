var express = require('express')
var router = express.Router()
var bcrypt = require('bcryptjs')
var nodemailer = require('nodemailer')
var crypto = require('crypto')
var Users = require('../Schema/User')
var config = require('../config/key')
const authChecker = require('../Middleware/Auth')
const jwt = require("jsonwebtoken");

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'cu.16bcs1182@gmail.com',
        pass: config.PASSWORD
    }
});

function checkemail(email)
{
    const re =/([a-zA-Z0-9]+)([\.{1}])?([a-zA-Z0-9]+)\@gmail([\.])com/g
    return re.test(email)
}

function checkpassword(password)
{
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,15}$/
    return re.test(password)
}


router.post('/register', (req, res) => {
    const name = req.body.name.trim()
    const email = req.body.email.trim()
    const password = req.body.password.trim()
    const cpassword = req.body.cpassword.trim()

    if (!name || !email || !password || !cpassword) {
        return res.status(400).json({ error: "Please Enter All Fields" });
    }

    if(!checkemail(email.toLocaleLowerCase()))
        return res.status(400).json({error  :'Not a valid email'})

    if (!checkpassword(password)) {
        return res.status(400).json({ error: "Password validation failed" });
    }

    if (password !== cpassword) {
        return res.status(400).json({ error: "Confirm Password Does Not Match" });
    }

    Users.findOne({ email: email }).exec((err, user) => {
        if (user)
            return res.status(400).json({ error: "User Already Registered" });

        bcrypt.genSalt(12, function (err, salt) {
            bcrypt.hash(password, salt, function (err, hash) {
                if (err) throw err

                const newUser = new Users({
                    name: req.body.name,
                    email: req.body.email,
                    password: hash,
                    imagePath :imagePath
                })

                newUser.save((err, user) => {
                    if (err)
                        return res.status(400).json({ error: "Pleas Try Again" })
                    else
                        res.json({ msg: "Successfully Registered" })
                })
            });
        })

    })

})


router.post('/login', (req, res) => {

    const email = req.body.email
    const password = req.body.password

    if (!email || !password)
        return res.status(400).json({ error: 'Please Enter All Fields' })

    Users.findOne({ email: email }).exec((err, user) => {
        if (!user)
            return res.status(400).json({ error: 'User Not Found' })

        bcrypt.compare(password, user.password).then((isMatch) => {
            if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

            const User = { _id: user._id, name: user.name, email: user.email, imagePath: user.imagePath }

            let jwtToken = jwt.sign({
                email: user.email,
                _id: user._id
            }, config.SESS_SECRET, {
                expiresIn: "3h"
            });


            res.json({ msg: "Log In Successfully", token: jwtToken, expiresIn: 3600, auth: true, user: User })
        })
    })

})

router.get('/getUsers', authChecker, (req, res) => {
    Users.find({}).select("-password -__v").exec((err, data) => {
        if (!err) res.json({ success: true, users: data })
    })
})


router.post('/checkValid', authChecker, (req, res) => {
    Users.findOne({ email: req.body.email }).select("-password -__v").exec((err, data) => {
        if (err) return res.status(400).json({ msg: "Please Try Again" })

        if (data) {
            res.json({ success: true, user: data, msg: 'User Available' })
        }
        else
            res.status(400).json({ success: true, msg: 'User Not Found' })
    })
})



router.put('/updateProfile/name', authChecker, (req, res) => {
    const name = req.body.name.trim()

    if (!name) {
        return res.status(400).json({ msg: "Name Cannot Be Empty" });
    }

    if (name && req.body.id) {
        Users.findByIdAndUpdate(req.body.id, { name: name}, { new: true }).select("-password -__v").exec((err, data) => {
            if (!err) return res.json({ msg: 'Name Updated Successfully', data: data })
        })
    }

})


router.put('/updateProfile/image', authChecker, (req, res) => {
    if (!req.body.imagePath) {
        return res.status(400).json({ msg: "Image Cannot Be Empty" });
    }

    if (req.body.imagePath && req.body.id) {
        Users.findByIdAndUpdate(req.body.id, { imagePath: req.body.imagePath }, { new: true }).select("-password -__v").exec((err, data) => {
            if (!err) return res.json({ msg: 'Image Updated Successfully', data: data })
        })
    }

})



router.put('/updateProfile/password', authChecker, (req, res) => {

    const oldPassword = req.body.oldPassword.trim()
    const newPassword = req.body.newPassword.trim()
    const confirmPassword = req.body.confirmPassword.trim()
    if (!oldPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ msg: "All Fields Are Required" });
    }

    if (oldPassword && newPassword && confirmPassword && req.body.id) {

        Users.findById(req.body.id).exec((err, user) => {
            bcrypt.compare(oldPassword, user.password).then((isMatch) => {
                if (!isMatch) return res.status(400).json({ msg: "Old Password Incorrect" });

                if (!checkpassword(newPassword)) {
                    return res.status(400).json({ msg: "New Password validation failed" });
                }

                if (newPassword !==confirmPassword) {
                    return res.status(400).json({ msg: "Confirm Password Does Not Match" });
                }

                bcrypt.genSalt(12, function (err, salt) {
                    bcrypt.hash(newPassword, salt, function (err, hash) {
                        if (err) throw err
                        Users.findByIdAndUpdate(req.body.id, { password: hash }, { new: true }).select("-password -__v").exec((err, data) => {
                            if (!err) return res.json({ msg: 'Password Changed SuccessFully', data: data })
                        })

                    });
                })

            })

        })
    }
})


router.post('/reset-password', (req, res) => {
    var email = req.body.email

    crypto.randomBytes(32, (err, buffer) => {
        if (err) console.log(err);
        const token = buffer.toString('hex')
        Users.findOne({ email: email }).exec((err, user) => {
            if (!err)
                if (!user)
                    return res.status(400).json({ msg: 'User not found' })
                else {
                    user.passToken = token
                    user.passExp = Date.now() + 3600000
                    user.save((err, data) => {
                        if (!err) {
                            transporter.sendMail({
                                from: "cu.16bcs1182@gmail.com",
                                to: user.email,
                                subject: "password reset",
                                html: `
                                <p>You requested for password reset</p>
                                <h5>click in this <a href="http://localhost:4200/forget-password/${token}">link</a> to reset password</h5>
                                `
                            }).then(res => console.log("mail sent")).catch(err => console.log('Some Error'))
                            return res.json({ msg: 'Check Your email' })
                        }
                    })
                }
            else
                console.log(err);
        })
    })
})


router.post('/new-password', (req, res) => {
    const newPassword = req.body.password.trim()
    const cPassword = req.body.cpassword.trim()
    const sentToken = req.body.token

    if (!newPassword || !cPassword) {
        return res.status(400).json({ msg: "Please Enter All Fields" });
    }

    if (!checkpassword(newPassword)) {
        return res.status(400).json({ msg: "Password Validation Failed" });
    }

    if (newPassword !== cPassword) {
        return res.status(400).json({ msg: "Confirm Password Does Not Match" })
    }

    Users.findOne({ passToken: sentToken, passExp: { $gt: Date.now() } })
        .then(user => {
            if (!user) {
                return res.status(422).json({ msg: "Try again session expired" })
            }
            bcrypt.hash(newPassword, 12).then(hashedpassword => {
                user.password = hashedpassword
                user.passToken = undefined
                user.passExp = undefined
                user.save().then((saveduser) => {
                    res.json({ msg: "Password Updated Success" })
                })
            })
        }).catch(err => {
            console.log(err)
        })
})

module.exports = router