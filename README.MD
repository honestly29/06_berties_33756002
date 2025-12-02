# Bertie’s Books – Web App

A Node.js and Express web application built in the _Dynamic Web Applications_ lab.  
The project demonstrates database integration, secure authentication, user sessions, sanitisation and validation of user input, API creation, and consuming external APIs (OpenWeather).

---

## Overview

Bertie’s Books is a fictional online bookshop that includes:

### Bookshop functionality

- Connects to a **MySQL** database to store and retrieve books and users.
- Displays a full list of available books.
- Lets users **add new books** via a form (with validation and sanitisation).
- Provides a **search** feature to find books by title.
- Includes a **bargain books** page showing all books priced under £20.

### User accounts & authentication

- Users can **register** using a username, name, email and password.
- Passwords are hashed using **bcrypt** before being stored in the database.
- Server-side validation using **express-validator**:
  - Valid email format
  - Username length between 5 and 20 characters
  - Password length at least 8 characters
- User input is sanitised using **express-sanitizer** to prevent XSS.
- Users can **log in** with session management using **express-session**.
- Protected routes (e.g. user list, audit log) use a redirect middleware to ensure only logged-in users can access them.
- Includes a **logout** route that destroys the session.
- Login attempts are logged in an audit table (success/failure).

### Weather feature

- Includes a `/weather` page that uses the **OpenWeather API**.
- Displays human-readable weather information (temperature and humidity).
- Users can enter any city using an interactive form.
- Handles errors (invalid city, bad API response, missing API key).
- The API key is stored securely using **dotenv**.

### Internal API

The application provides a JSON API at `/api/books` that supports:

- Returning all books.
- Searching by title using `?search=keyword`.
- Filtering by price range using `?minprice=5&maxprice=20`.
- Sorting results using `?sort=name` or `?sort=price`.
- Full sanitisation of query parameters.
- Protection against SQL injection using parameterised queries.

This project demonstrates full-stack concepts:

- Server-side rendering (EJS)
- Secure authentication (bcrypt + sessions)
- External API consumption
- REST API creation
- SQL database integration
- Data validation
- Input sanitisation

## Technologies Used

- Node.js + Express
- MySQL (via `mysql2`)
- EJS templating
- bcrypt (password hashing)
- express-session (session management)
- express-validator (server-side validation)
- express-sanitizer (XSS protection)
- dotenv (secure environment variables)
- request (calling the OpenWeather API)
- HTML5, CSS, JavaScript

---

## Installation & Running Locally

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create .env file**
   ```
   DB_HOST=localhost
   DB_USER=berties_books_app
   DB_PASSWORD=yourpassword
   DB_NAME=berties_books
   WEATHER_API_KEY=your_api_key
   ```
3. **Run the app**
   ```
   node index.js
   ```
4. **Open in browser**
   http://localhost:8000/

---

## API Documentation

The application provides a REST API that allows external developers to access the Bertie’s Books catalogue in JSON format.

### Endpoint

`GET /api/books`

### Description

Returns a list of books stored in the database. The route accepts optional query parameters that filter and sort the results.

---

### Query parameters

- `search`

  - Filters books whose names contain the given substring.
  - Example:
    - `/api/books?search=world`

- `minprice`

  - Filters books with a price greater than or equal to this value.
  - Example:
    - `/api/books?minprice=5`

- `maxprice`

  - Filters books with a price less than or equal to this value.
  - Example:
    - `/api/books?maxprice=20`

- Combined price range example:

  - `/api/books?minprice=5&maxprice=10`

- `sort`
  - Sorts the results by a specific field. Allowed values:
    - `name`
    - `price`
  - Example:
    - `/api/books?sort=price`

---

### Examples

- Return all books

  - `/api/books`

- Search for titles containing “world”

  - `/api/books?search=world`

- Books between £5 and £20

  - `/api/books?minprice=5&maxprice=20`

- Books priced under £10 sorted by name

  - `/api/books?maxprice=10&sort=name`

- Search + price range + sorting
  - `/api/books?search=universe&minprice=5&maxprice=25&sort=price`

---

### Security and validation

- All user-supplied query parameters are sanitised using `express-sanitizer` to protect against XSS-style attacks.
- SQL queries use parameter placeholders `?` to prevent SQL injection.
- Only known sort values are allowed to ensure malicious sort inputs cannot affect the SQL query.

---

### Response format

All API responses are returned as JSON arrays of book objects. Example:

```json
[
  { "id": 1, "name": "1984", "price": 8.99 },
  { "id": 2, "name": "World Atlas", "price": 12.5 }
]
```

## Access Control Summary

Session-based access control was added using express-session. The redirectLogin
middleware checks whether req.session.userId is set. If not, the user is redirected
to the /users/login page.

Protected Routes:

- /users/list: Only logged-in users can view the list of users.
- /users/audit: Only logged-in users can view the audit log.
- /books/addbook: Only logged-in users can add new books to the database.
- /logout: Only available to logged-in users.

Public Routes:

- / (home page)
- /about
- /users/register and /users/registered
- /users/login and /users/loggedin

Testing:
When not logged in, attempts to access /users/list or /users/audit redirect to the
login page. After logging in, these pages become accessible. The logout route
successfully destroys the session and prevents further access to protected pages.

## Validation summary

Server side validation is implemented using the express-validator module.

Registration page (/users/register and /users/registered):

- First name: must not be empty.
- Last name: must not be empty.
- Email: must be a valid email address (isEmail) and is normalised.
- Username: length must be between 5 and 20 characters.
- Password: length must be at least 8 characters.

If any of these checks fail, the registration form is re-rendered with error messages and the previously entered data (except the password). This prevents invalid data being inserted into the database and improves user experience.

Login page (/users/login and /users/loggedin):

- Username: must not be empty.
- Password: must not be empty.

If either field is missing, the login form is re-rendered with clear error messages. This avoids unnecessary database lookups when the form is incomplete.

Book pages (E.g. /books/add):

- Title: must not be empty.
- Price: must be a number greater than 0.

This helps ensure that only sensible book data is stored in the database and prevents obvious input errors such as negative prices.

Pages without validation:

- Static GET pages such as the home page (/), about (/about), the user list (/users/list) and audit log (/users/audit) do not accept user input in forms, so no server side validation is required on these routes.

Overall, validation is applied to all routes that process user submitted form data, and is not used on purely read only or static pages where there is nothing to validate.

## Sanitisation

The express-sanitizer module is used to remove potentially dangerous HTML or
JavaScript from user-submitted text fields, preventing XSS attacks. Sanitisation is
applied immediately after body parsing in index.js using:

app.use(expressSanitizer());

Registration form
The following fields are sanitised because they contain text entered by the user and
may be displayed later in HTML pages:

- first
- last
- username
- email

These fields are protected using req.sanitize() before being inserted into the
database or rendered to the browser.

The password field is intentionally not sanitised. Sanitising a password would alter
the string before hashing it, causing mismatched hashes and failed logins. Passwords
should always be processed exactly as entered.

Other forms
Sanitisation was also applied to other text inputs in the application:

- /books/addbook : the book name field is sanitised
- /books/search : the search_text query parameter is sanitised
- /users/login : the username field is sanitised

Fields that should not be sanitised:

- Password fields (as explained above)
- Numeric fields such as price and quantity, which already undergo numeric validation
  and should not have their characters removed or altered.

Static GET pages (list, audit, bargain books, about, home) do not accept text input
and therefore do not require sanitisation.

Overall, sanitisation is applied to all free-text fields submitted by the user that
may be rendered back onto a page, ensuring protection against common XSS vectors
such as <script> tags, event handlers and JavaScript URLs.

## dotenv

To avoid storing sensitive information directly in the source code, the application uses the dotenv module. This allows all database credentials to be stored in a separate .env file rather than inside index.js.

**How it was implemented:**

- Installed using npm install dotenv.
- .env file was created in the project root containing the database host, username, password, and database name.
- require('dotenv').config(); was added at the top of index.js to load environment variables.
- The MySQL connection pool was updated to use process.env.DB_HOST, process.env.DB_USER, etc.
- .env was added to .gitignore so credentials are never uploaded to GitHub.

## Audit Logging

To track login activity and improve security, an audit logging system was implemented. This records both successful and failed login attempts.

**How it was implemented:**

1. I created a new database table called `audit_log` containing:

   - `username` (the supplied email)
   - `success` (true or false)
   - `timestamp` (automatically recorded)

2. In the `/users/loggedin` login route, an INSERT query is executed after each login attempt:

   - On correct password → a record is saved with `success = true`.
   - On incorrect password or unknown user → a record is saved with `success = false`.

3. A new route `/users/audit` was added.
   This selects all audit records and displays them in a simple table for review.

This feature makes it possible to view login behaviour, detect suspicious activity, and keep a basic audit trail of authentication events.

## Access the live site:

The application can be accessed at:
http://www.doc.gold.ac.uk/usr/325/

```

```
