function redirectLogin(req, res, next) {
    if (!req.session.userId ) {
      res.redirect((process.env.DB_BASE_PATH || '') + '/users/login');
    } else { 
        next (); 
    } 
}
module.exports = redirectLogin;