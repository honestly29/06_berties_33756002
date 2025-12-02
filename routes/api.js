// Create a new router
const express = require("express")
const router = express.Router();

// GET /api/books - Return a list of all books in JSON format
router.get('/books', function (req, res, next) {

    // Query database to get all the books
    let sqlGetAllBooks = "SELECT * FROM books"

    // Execute the sql query
    db.query(sqlGetAllBooks, (err, result) => {
        // Return results as a JSON object
        if (err) {
            res.json(err)
            next(err)
        }
        else {
            res.json(result)
        }
    });
});


module.exports = router;

     

    