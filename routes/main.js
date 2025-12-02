// Create a new router
const express = require("express")
const router = express.Router();
const redirectLogin = require('../middleware/redirectLogin');
const request = require('request');

// Handle our routes
router.get('/',function(req, res, next){
    res.render('index.ejs')
});

router.get('/about',function(req, res, next){
    res.render('about.ejs')
});

router.get('/weather', function(req, res, next){

    // If no city provided yet, just show the form
    if (!req.query.city) {
        return res.render('weather.ejs', { wmsg: null, city: null });
    }

    // Sanitize the input
    const city = req.sanitize(req.query.city);

    let apiKey = process.env.WEATHER_API_KEY;
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
                    
    request(url, function (err, response, body) {
        if(err){
            return next(err)
        } 
        
        try {
            let weather = JSON.parse(body);

            if (weather.cod != 200) {
                // City not found or api error
                return res.render('weather.ejs', {
                    wmsg: `Could not find weather for city: ${city}.`,
                    city: city  
                });
            }

            let wmsg = `It is ${weather.main.temp}°C in ${weather.name}.` +
                ` The Humidity is ${weather.main.humidity}%`;

            res.render('weather.ejs', { wmsg: wmsg, city: city });

        } catch (e) {
            next(e);
        } 
    });
});

router.get('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/');
        }
        res.send("You are now logged out. <a href='/'>Home</a>");
    });
});

// Export the router object so index.js can access it
module.exports = router