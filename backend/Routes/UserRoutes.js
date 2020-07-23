var express = require('express')
var router = express.Router()
var bcrypt = require('bcryptjs')
var Users = require('../Schema/User')

var config= require('../config/key')

const authChecker = (req, res, next) => {
    const sessUser = req.session.user;
    if (sessUser) {
        next()
    }
    else {
        console.log("No User Found")
        return res.status(400).json({ error: "No User Found", auth: false });
    }
}

router.post('/register', (req, res) => {
    const { name, email, password, cpassword, image } = req.body

    if (!name || !email || !password || !cpassword) {
        return res.status(400).json({ error: "Please Enter All Fields" });
    }

    if (password.length < 8) {
        return res.status(400).json({ error: "Password should be atleast 8 characters long" });
    }

    if (password !== cpassword) {
        return res.status(400).json({ error: "Confirm Password Does Not Match" });
    }

    Users.findOne({ email: email }).exec((err, user) => {
        if (user)
            return res.status(400).json({ error: "User Already Registered" });

        const newUser = new Users({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        })

        bcrypt.genSalt(12, function (err, salt) {
            bcrypt.hash(newUser.password, salt, function (err, hash) {
                if (err) throw err
                newUser.password = hash;

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

    const { email, password } = req.body

    if (!email || !password)
        return res.status(400).json({ error: 'Please Enter All Fields' })

    Users.findOne({ email: email }).exec((err, user) => {
        if (!user)
            return res.status(400).json({ error: 'User Not Found' })

        bcrypt.compare(password, user.password).then((isMatch) => {
            if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

            const User = { _id: user._id, name: user.name, email: user.email }

            req.session.user = User;

            res.json({ msg: "LoggedIn SuccessFully", User, auth: true })   // sends cookie with sessionID automatically in response
            console.log("LogIn successfully");

        })
    })

})

router.delete("/logout", authChecker, (req, res) => {

    req.session.destroy((err) => {

        //delete session data from store, using sessionID in cookie
        if (err) throw err;
        res.clearCookie(config.COOKIE_NAME); // clears cookie containing expired sessionID
        res.json({ msg: "Logged out successfully", auth: false });
        console.log("Logged out successfully")
    });
});


router.get("/authchecker", authChecker, (req, res) => {
    const User = req.session.user;
    console.log("Already logged In")
    return res.json({ msg: " Authenticated Successfully", User, auth: true });

});

router.get('/getUsers', authChecker, (req, res) => {
    Users.find({}).select("-password -__v").exec((err, data) => {
        if (!err) res.json({ success: true, users: data })
    })
})


router.post('/checkValid',authChecker, (req, res) => {
    console.log(req.body);
    Users.findOne({ email: req.body.email }).select("-password -__v").exec((err, data) => {
        if (err) return res.status(400).json({ msg: "Please Try Again" })

        if (data)
           { 
               console.log(data);
               res.json({ success: true, user: data, msg: 'User Available' })}
        else
            res.status(400).json({ success: true, msg: 'User Not Found' })
    })
})


module.exports = router