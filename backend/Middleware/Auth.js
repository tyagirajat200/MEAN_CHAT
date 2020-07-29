const jwt = require("jsonwebtoken");
var config = require('../config/key')
const authChecker = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        jwt.verify(token, config.SESS_SECRET);
        next();
    } catch (error) {
        console.log("No User Found")
        return res.status(401).json({ msg: "No User Found" ,auth:false});
    }
};
module.exports =authChecker