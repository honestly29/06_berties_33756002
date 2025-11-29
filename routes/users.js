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
            const newrecord = [req.body.username, req.body.first, req.body.last, req.body.email, hashedPassword];

            db.query(sqlInsertUser, newrecord, (err, result) => {
                if (err) {
                    if (err.code === "ER_DUP_ENTRY") {
                        return res.send("Registration failed: That email or username already exists.");
                    }
                    return res.send("Database error: " + err.message);
                } else {
                    let message = 'Hello ' + req.body.first + ' ' + req.body.last + ', you are now registered! We will send an email to ' + req.body.email;
                    message;
                    res.send(message);
                }
            });
        });
    }
);



// Login page
router.get('/login', function (req, res, next) {
    res.render('login.ejs')
})

router.post('/loggedin', function(req, res, next) {
    const username = req.body.username;
    const password = req.body.password;

    const sqlSelectHashedPassword = 'SELECT hashed_password FROM users WHERE username = ?';

    db.query(sqlSelectHashedPassword, [username], (err, results) => {
        if (err) {
            return next(err);
        }

        // if no user found
        if (results.length === 0) {
            // log failed login
            db.query(
                "INSERT INTO audit_log (username, success) VALUES (?, false)", [username]
            );
            return res.send('Login Failed: username not found');
        }

        const hashedPassword = results[0].hashed_password;

        // Compare the password supplied with the password in the database
        bcrypt.compare(password, hashedPassword, function(err, result) {
            if (err) {
                return res.send('Error comparing passwords');
            }
            else if (result == true) {
                // log success
                db.query(
                    "INSERT INTO audit_log (username, success) VALUES (?, true)",
                    [username]
                );
                // Save user session here, when login is successful
                req.session.userId = req.body.username;

                return res.send('Login successful!');
            }
            else {
                // Log failure
                db.query(
                    "INSERT INTO audit_log (username, success) VALUES (?, false)",
                    [username]
                );
                return res.send('Login failed: incorrect password');
            }
        });
    });
});


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
