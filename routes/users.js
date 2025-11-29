// Create a new router
const express = require("express")
const router = express.Router();
const bcrypt = require('bcrypt');
const redirectLogin = require('../middleware/redirectLogin');
const { check, validationResult } = require('express-validator');


router.get('/register', function (req, res, next) {
    res.render('register.ejs', { 
        errors: [], 
        formData: {} 
    });
})

router.post(
    '/registered',
    [
        check('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please enter a valid email'),

        check('username')
            .isLength({ min: 5, max: 20 })
            .withMessage('Username must be between 5 and 20 characters'),
        
        check('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long'),
        
        check('first')
            .notEmpty()
            .withMessage('First name is required'),
        
        check('last')
            .notEmpty()
            .withMessage('Last name is required'),
    ],
    function (req, res, next) {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('register', {
                errors: errors.array(),
                formData: req.body
            });   
        }

        const plainPassword = req.body.password;
        const saltRounds = 10;

        bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
            if (err) {
                return next(err);
            }

            const sqlInsertUser = "INSERT INTO users (username, first_name, last_name, email, hashed_password) VALUES (?,?,?,?,?)";
            const first = req.sanitize(req.body.first);
            const last = req.sanitize(req.body.last);
            const username = req.sanitize(req.body.username);
            const email = req.sanitize(req.body.email);
            const newrecord = [username, first, last, email, hashedPassword];

            db.query(sqlInsertUser, newrecord, (err, result) => {
                if (err) {
                    if (err.code === "ER_DUP_ENTRY") {
                        return res.send("Registration failed: That email or username already exists.");
                    }
                    return res.send("Database error: " + err.message);
                } else {
                    let message = 'Hello ' + first + ' ' + last + ', you are now registered! We will send an email to ' + email;
                    res.send(message);
                }
            });
        });
    }
);



// Login page
router.get('/login', function (req, res, next) {
    res.render('login.ejs', { 
        errors: [], 
        formData: {} 
    });
})

router.post(
    '/loggedin',
    [
        check('username')
            .notEmpty()
            .withMessage('Username is required'),
        check('password')
            .notEmpty()
            .withMessage('Password is required')
    ],
    function(req, res, next) {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Re render login page with errors and previously entered username
            return res.render('login', {
                errors: errors.array(),
                formData: req.body
            });
        }

        const username = req.sanitize(req.body.username);
        const password = req.body.password; 

        const sqlSelectHashedPassword = 'SELECT hashed_password FROM users WHERE username = ?';

        db.query(sqlSelectHashedPassword, [username], (err, results) => {
            if (err) {
                return next(err);
            }

            if (results.length === 0) {
                db.query(
                    'INSERT INTO audit_log (username, success) VALUES (?, false)',
                    [username]
                );
                return res.send('Login Failed: username not found');
            }

            const hashedPassword = results[0].hashed_password;

            bcrypt.compare(password, hashedPassword, function(err, result) {
                if (err) {
                    return res.send('Error comparing passwords');
                } else if (result === true) {
                    db.query(
                        'INSERT INTO audit_log (username, success) VALUES (?, true)',
                        [username]
                    );
                    req.session.userId = req.body.username;
                    return res.send('Login successful!');
                } else {
                    db.query(
                        'INSERT INTO audit_log (username, success) VALUES (?, false)',
                        [username]
                    );
                    return res.send('Login failed: incorrect password');
                }
            });
        });
    }
);



// Audit page for listing login attempts
router.get('/audit', redirectLogin, function(req, res, next) {
    const sqlSelectAllAudits = "SELECT * FROM audit_log ORDER BY timestamp DESC";

    db.query(sqlSelectAllAudits, (err, results) => {
        if (err) return next(err);

        res.render("audit.ejs", { audit: results });
    });
});


// Page for listing current users in the database
router.get('/list', redirectLogin, function(req, res, next) {
    const sqlSelectAllUsers = "SELECT * FROM users";
    db.query(sqlSelectAllUsers, (err, result) => {
        if (err) return next(err);
        res.render("listusers.ejs", { users: result });
    });
});

// Export the router object so index.js can access it
module.exports = router
