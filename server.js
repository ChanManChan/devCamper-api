const express = require('express');
const dotenv = require('dotenv');
// const logger = require('./middleware/logger');
const morgan = require('morgan');
const connectDB = require('./config/db');
const colors = require('colors');
const path = require('path');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

// important:- if you want to be able to use this in the bootcamps controller methods it has to be after Mount routers code line (because middleware is executed in a linear order)
const errorHandler = require('./middleware/error');
// Load env vars
dotenv.config({ path: './config/config.env' });
// Connect to database
connectDB();

// Route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// below is a custom middleware for logging purposes
// app.use(logger);

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// File uploading
app.use(fileupload());

// Sanitize date

// Eg :- Login user req body {
// 	"email":{"$gt":""},  <-- just pass in the greater than NoSQL operator (it will match the first username thats found)
//  if someone guesses this below password they can login to the account even without knowing the     email
// 	"password":"123456"
// }

// if we send above data, we get a token back! i didnt even have to know the email, i just had to guess a password in the database (vulnerability)
// now if i go to 'Get Logged in User via Token' and send request, we get this response below :-
/*{
  "success": true,
  "data": {
      "role": "user",
      "_id": "5d7a514b5d2c12c7449be042",
      "name": "Admin Account",
      "email": "admin@gmail.com",
      "createdAt": "2020-02-07T15:18:21.818Z",
      "__v": 0
  }
}*/
// its the first one that was found with that password in the database
// Sanitize your express payload to prevent MongoDB operator injection.
app.use(mongoSanitize());

// Set security headers
// Helmet helps you secure your Express apps by setting various HTTP headers. It’s not a silver bullet, but it can help!
app.use(helmet());

// Prevent XSS attacks (Cross-site scripting)

/* {
	"name": "ModernTech Bootcamp<script>alert(1)</script>",  <--THIS COULD BE SOME HARMFUL JAVASCRIPT CODE!
  "description": "ModernTech has one goal, and that is to make you a rockstar developer and/or designer with a six figure salary. We teach both development and UI/UX",
  "website": "https://moderntech.com",*/
// when we send this body... in the "name" : field the script tag is present! so if this is embeded on the page, its going to be embeded in our HTML and we dont even want the possibility this happening (any HTML tags being able to be put in there)
app.use(xss());
/*
  now,if we send the above data again we get this 
   "_id": "5e3e39cabb2e9f40c826564a",
        "name": "ModernTech Bootcamp&lt;script>alert(1)&lt;/script>",  <--- NOW WE WONT HAVE THIS SCRIPT TAG IN OUR DATABASE (which ofcourse we dont want)
*/

// Rate Limiting
// Basic rate-limiting middleware for Express. Use to limit repeated requests to public APIs and/or endpoints such as password reset.
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // <-- within 10mins we can make 100 requests
  max: 100 // <-- response when we make requests beyond this limit "Too many requests, please try again later."
});
app.use(limiter);

// Prevent HTTP param pollution

// Express populates HTTP request parameters with same name in an array, attacker can intentionally pollute request parameters to exploit this mechanism

// Eg:- GET/search?firstname=John&firstname=John
// req.query.firstname
// =>["John", "John"]

// HPP puts array parameters in req.query and/or req.body aside and just selects the last parameter value. You add this middleware and you are done.
app.use(hpp());

// Set static folder (because we want to set our public folder to a static folder meaning we can go to whatever the 'domain is/whatever the image name is...') <--i want to be able to access the image in the browser therefore do below line of code (below i'm setting public as my static folder)
// Since public is my static folder i should be able to just go to 'http://localhost:5000/uploads/photo_5d725a1b7b292f5f8ceff788.jpg' to view the image...
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

app.use(errorHandler);
const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);
// we want to be able to close the server and stop the application if we get unhandled rejection
// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server and exit process
  server.close(() => process.exit(1));
});
