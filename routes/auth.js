// im going to have an 'auth' and a 'user' routes and also an 'auth' and a 'user' controllers because they are different.
// auth.js (authentication) has to do with registering a user, encrypting passwords, logging in, getting the currently logged in user, resetting passwords...things like that
// where users.js is going to be more like the CRUD functionalities for the admin, to add a user, update a user, delete and so on...

// whenever we create a new routes file, we have to bring in the file into server.js

const express = require('express');
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword
} = require('../controllers/auth');
const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
// wherever we put 'protect' the user has to be logged in
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// router.get('/me',protect, getMe);  op is shown below
/*{
  "success": true,
  "data": {
      "role": "publisher",
      "_id": "5e3a5af85447f52280944f02",
      "name": "Nithin Gopal",
      "email": "gopal.nithin04@gmail.com",
      "createdAt": "2020-02-05T06:04:40.505Z",
      "__v": 0
  }
}*/
// notice in the above object, password isnt there because we did select 'false' in the model for password (we dont want to return the password even though its hashed and encrypted, we still dont want to return it)

module.exports = router;
