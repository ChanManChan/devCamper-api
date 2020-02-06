// im going to have an 'auth' and a 'user' routes and also an 'auth' and a 'user' controllers because they are different.
// auth.js (authentication) has to do with registering a user, encrypting passwords, logging in, getting the currently logged in user, resetting passwords...things like that
// where users.js is going to be more like the CRUD functionalities for the admin, to add a user, update a user, delete and so on...

const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// @desc    Register user
// @route   POST /api/v1/auth/register    <---associated with this controller method
// @access  Public                       <---do you need to be logged in to hit this route (send a token)(public === you dont need a token)
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  // Create user
  const user = await User.create({
    name,
    email,
    // i didnt hash the password here because what im going to do is add a piece of middleware so when a user is saved the password is automatically hashed there instead of putting it into our controller
    password,
    role
  });
  // i'm going to send a token later but i havent implemented that just yet

  // now that i can register a user,encrypt the password, put them in the database our response needs to include a jasonWebToken (but im not going to do it here but create a mogoose method to handle this for me...(not a middleware were it runs automatically but a method that i can just call))

  // Create token
  // the lowercase 'u' in user is very import because im using a method not a static (a static would be called on the model itself and a method is called on the 'user' that im getting from the User.create({...}) above)

  // const token = user.getSignedJwtToken();

  // below is the token that i got back
  /* "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlM2E1MmZlMmJkOGE4OGMyYzlkY2M4OSIsImlhdCI6MTU4MDg4MDYzOCwiZXhwIjoxNTgzNDcyNjM4fQ.C-hNnysbMmSOXalTPpHBI3uxsMwd-pSwxod40f5Ef1U" */

  //  go to jwt.io and past the above obtained token in the Encoded text area and then to the right side payload: Data text area we can see the id, iat, exp... which is required to login users etc etc...

  // later ill create a piece of middleware to basically extract the 'id' from above token and put it into req.user.id and  we will be able to access that from any route that uses protection middleware or the auth middleware

  // res.status(200).json({ success: true,token });

  //const token = user.getSignedJwtToken(); ..... res.status(200).json({ success: true,token }); was replaced by below line
  sendTokenResponse(user, 200, res);
});

// @desc    Login user
// @route   POST /api/v1/auth/login      <---associated with this controller method
// @access  Public                       <---do you need to be logged in to hit this route (send a token)(public === you dont need a token)
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //Validate email & password...and the reason im validating it here and not with the register because with register we are using the model and we already have validation in that model for all the fields (like name,email,password...etc) and it gets handled by my error handler and in this case here, we are using the data thats being passed in just to authenticate, its not getting put in the database, its not getting run through the model, so we are going to check it manually
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  // also in this case, when we are logging in, i want the password to be included (remember in my User model when i created the password field i set 'select: false' and what this is going to do when we actually find a user, the password is not going to be included but we need it to be so we need to add on to the below line of code by .select('+password'); <--this is basically doing the same thing just here instead of in the model and we do want the password included here because we need to obviously validate it for login)
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    // 401 <-- unauthorized
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  //for the password we have to take the plain text password from above (from req.body) and match it to the encrypted password so im going to actually create a model method just like UserSchema.methods.getSignedJwtToken = function()....... in 'models/User.js'

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Create token
  // i have register and login setup where i send a token (like below) back to the client and the client could store it in localStorage and then i was going to create some middleware so that it can be sent in the headers..but i also want to be able to send a Cookie with this token which can be stored in the browser becacuse in some cases storing it in a cookie would be safer than storing it in local storage.So i'm going to set that up and i'm going to use a package called 'cookie-parser'
  // install cookie-parser and enable the middleware by running it through app.use(cookieParser()) and then i'll have access to req.cookies and i can set the token inside of a cookie and then we can validate it when it comes back to the server.

  // const token=user.getSignedJwtToken();
  // res.status(200).json({success:true,token});
  sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   POST /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  // since we are using the 'protect' route, we have access now to req.user which is always going to be the logged in user
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
  // next procedure :- now create a route for it in 'routes/auth.js'
});

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  // im going to use findByIdAndUpdate but i dont want to just pass in req.body because then if a password is sent or role or any other user field thats in the model is sent, it will actually update that and i dont want that...this should just be for the 'name' and 'email'
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  };
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });
  res.status(200).json({ success: true, data: user });
  // next procedure :- now create a route for it in 'routes/auth.js'
});

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  // since we are using the 'protect' route, we have access now to req.user which is always going to be the logged in user
  // they are going to send the current and new password in the body
  // First :- find the user by the logged in users ID but i also want the password which by default is 'select:false' therefore add on  '.select('+password')' at the end of below line
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  // in the User.js model we have 'UserSchema.methods.matchPassword=async function(enteredPassword){...' method and it returns a promise, so i want to check if it fails to match below
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  // if they change the password, i want the token to be sent back just like when they reset the password
  sendTokenResponse(user, 200, res);
  // next procedure :- now create a route for it in 'routes/auth.js'

  // res.status(200).json({ success: true, data: user });
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // first :- get the user by the email thats sent in the body
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // Get reset token
  // im actually going to have a method inside of our model, so we can call that on the user itself...save it and jump into our User.js model and fill 'resetPasswordToken' and 'resetPasswordExpire' fields. And we are going to use a core module called 'crypto' to generate the token and to hash it.
  const resetToken = user.getResetPasswordToken();

  // we dont want to run any validators like check the name and all that stuff
  await user.save({ validateBeforeSave: false });

  //i need to prepare somethings to pass into my sendEmail utility and one is going to be the reset URL that includes the token

  // Create reset URL (backticks because i dont want just send the token, i want them to have the entire URL which is going to be '/resetpassword/--token--')
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;

  // Create the message to pass in (this would be different, if i was working on the front end with REACT, it would probabily include a frontEnd link that you would click to you would go to ... but in this case we dont have a frontEnd application so what im going to do in the email is just say, 'make a specific type of request to this URL to reset your password!')

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  // Call the sendEmail function from my utility

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message
    });
    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    // if something goes wrong get rid of those fields in the database ('resetPasswordToken' and 'resetPasswordExpire') for the user who clicked forgot password link
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse('Email could not be sent', 500));
  }

  console.log(resetToken);
  // 8b75147535ecb6a273aaeac203d64f7e43a4d026  <--what we got from const resetToken=crypto.randomBytes(20).toString('hex'); which is not hashed version

  //THE IDEA HERE IS, WE STORE THE HASHED VERSION IN MONGODB BUT WHEN WE SEND THE EMAIL WITH THE TOKEN, ITS JUST GOING TO BE THE REGULAR VERSION (ie. the randomBytes(20) one), AND THEN WE WILL JUST MATCH IT WHEN THE USER ACTUALLY HIT THE RESET PASSWORD ROUTE

  res.status(200).json({ success: true, data: user });
  // next procedure :- now create a route for it in 'routes/auth.js'
});

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // First thing to do :- get the token out of the URL and hash it because thats what we need to match (in the database its already hashed)
  // and btw the URL is the one we got through the forgotpassword route and is valid for 10 mins (because of resetPasswordExpire field in the model) in 'mailtrap' inbox

  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  //Find the user by the reset token only if the expiration is greater than right now
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(ErrorResponse('Invalid token', 400));
  }
  // Set new password (they will send the new password in the body)
  user.password = req.body.password;
  // it should get encrypted by the middleware 'models/User.js'..UserSchema.pre('save', async func...)
  // after re-setting the password, below we have to set 'resetPasswordToken' and 'resetPasswordExpire' to 'undefined' and then save it back again by 'await user.save();'
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  // save the user with the new password below
  await user.save();

  // as far my response back, i'm going to send back a token, so basically they will be logged in, so im going to call 'sendTokenResponse'
  sendTokenResponse(user, 200, res);
  // next procedure :- now create a route for it in 'routes/auth.js'
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();
  const options = {
    // in our environment variable i just have '30', so i have to specifiy that this is going to be 30 days
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    // i only want the cookie to be accessed the client side script
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    // we have our secure flag on our cookie in production
    // if secure===true the cookie will be sent with https
    options.secure = true;
  }

  // .cookie('what is the cookie called','value','options')
  // below i'm sending the token back in the response and i'm also setting a cookie and then its really up to the client side how they want to handle it
  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({ success: true, token });

  //its still doing the same thing it was doing but addition to that its going to be sending a cookie with a token in it.

  // so now we are able to login and register and get a token, now we are going to create a piece of middleware that will make it so we have to send that generated token for a particular user to certain routes like 'Create a new Bootcamp' <--a logged in user should be able to create a new bootcamp and not someone thats a guest.

  //First :- get the token in our application and extract the userID from the token and then look that user up and put that into 'req' variable.
};
