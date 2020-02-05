const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');
// Load env vars
dotenv.config({ path: './config/config.env' });
// Load models
const Bootcamps = require('./models/Bootcamp');
const Course = require('./models/Course');
const User = require('./models/User');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

// When receiving data from a web server, the data is always a string.
// Parse the data with JSON.parse(), and the data becomes a JavaScript object.
// Imagine we received this text from a web server:
// '{ "name":"John", "age":30, "city":"New York"}'
// Use the JavaScript function JSON.parse() to convert text into a JavaScript object:
// var obj = JSON.parse('{ "name":"John", "age":30, "city":"New York"}');

// When sending data to a web server, the data has to be a string.
// Convert a JavaScript object into a string with JSON.stringify().
// Imagine we have this object in JavaScript:
// var obj = { name: "John", age: 30, city: "New York" };
// Use the JavaScript function JSON.stringify() to convert it into a string.
// var myJSON = JSON.stringify(obj);

// Read JSON files
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
);
const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8')
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8')
);

// Import into DB
const importData = async () => {
  try {
    // similar to what we do in the createBootcamp controller method
    // below awaits are responsible for actually pushing data from '_data/xxx.json' to MongoDB
    await Bootcamps.create(bootcamps);
    await Course.create(courses);
    await User.create(users);
    console.log('Data Imported...'.green.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};
// Delete data
const deleteData = async () => {
  try {
    // dont pass anything so that it deletes all of it
    await Bootcamps.deleteMany();
    await Course.deleteMany();
    await User.deleteMany();
    console.log('Data Destroyed...'.red.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

// node seeder -i condition below
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  // node seeder -d condition this block
  deleteData();
}
