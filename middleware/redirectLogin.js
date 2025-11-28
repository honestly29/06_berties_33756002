function redirectLogin(req, res, next) {
    if (!req.session.userId ) {
      res.redirect((process.env.BASE_PATH || '') + '/users/login');
    } else { 
        next (); // move to the next middleware function
    } 
}
module.exports = redirectLogin;