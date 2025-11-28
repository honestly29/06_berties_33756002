# Bertie’s Books – Web App

A simple Node.js and Express web application built in the **Dynamic Web Applications** lab to demonstrate connecting a website to a MySQL database, using EJS templates, bcrypt for password hashing, dotenv for secure credentials, and handling routes for dynamic data display.

---

## Overview

**Bertie’s Books** is a fictional online bookshop that:

- Connects to a **MySQL** database to store and retrieve data.
- Displays a full list of all available books.
- Lets users **add new books** to the database via a form.
- Provides a **search** feature to find books by title (exact and partial matches).
- Includes a **bargain books** page showing all books priced under £20.
- Allows users to **register** by submitting a username, name, email, and password.
- Hashes passwords securely using **bcrypt** before storing them in the database.
- Allows users to **log in**, comparing the supplied password with the stored hash.
- Handles users trying to register with usernames/passwords that already exist.

The application demonstrates full-stack integration - combining Node.js server logic, EJS views, SQL queries, form handling, bcrypt hashing, and secure environment variable management.

---

## Technologies Used

- **Node.js** with **Express**
- **MySQL** (via the `mysql2` library)
- **EJS** (Embedded JavaScript templates)
- **bcrypt** for password hashing
- **dotenv** for securing database credentials
- **HTML5 / CSS**
- **JavaScript**

---

## Installation & Running Locally

1. **Install dependencies**

   ```bash
   npm install express ejs mysql2 bcrypt dotenv
   ```

2. **Create .env file**
   ```
   DB_HOST=localhost
   DB_USER=berties_books_app
   DB_PASSWORD=yourpassword
   DB_NAME=berties_books
   ```
3. **Run the app**
   ```
   node index.js
   ```
4. **Open in browser**
   http://localhost:8000/

---

## Access Control Summary

Session-based access control was added using express-session. The redirectLogin middleware checks whether req.session.userId is set. If not, the user is redirected to the /users/login page.

Protected Routes:

- /users/list: Only logged-in users can view the list of users.
- /users/audit: Only logged-in users can view the audit log.
- /logout: Only available to logged-in users.

Public Routes:

- / (home page)
- /about
- /users/register and /users/registered
- /users/login and /users/loggedin

Testing:
When not logged in, attempts to access /users/list or /users/audit redirect to the login page. After logging in, these pages become accessible. The logout route successfully destroys the session and prevents further access to protected pages.

## Access the live site:

The application can be accessed at:
http://www.doc.gold.ac.uk/usr/325/
