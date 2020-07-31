  
module.exports = {
    mongoURI:process.env.MONGODB_URI,
    IS_PROD: process.env.NODE_ENV === 'production',
    SESS_SECRET: process.env.SESS_SECRET,
    COOKIE_NAME: process.env.COOKIE_NAME,
    // PASSWORD : process.env.PASSWORD
    SENDGRID_API_KEY:process.env.SENDGRID_API_KEY
}