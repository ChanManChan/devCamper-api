const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt=require('jsonwebtoken');
const crypto=require('crypto');
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      // we have a regular expression to match for the email
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  role: {
    type: String,
    // we only want two available role types when they make a request ie. when they register ie which is going to be 'user' or 'publisher' this way they wont be able to use anything else
    // an  we will have admin functionality but in order to make a user an admin i actually have to go into the database using something like compass or the terminal the 'shell' and just change their role to admin
    // 'publisher' :- people that can create bootcamps and courses and stuff /// 'user' :-  are people that can create reviews about bootcamps
    enum: ['user', 'publisher'],
    default: 'user'
  },
  password: {
    type: String,
    // btw passwords will be encrypted
    required: [true, 'Please add a password'],
    minlength: 6,
    // what 'select' will do is when we create a user through our API, its not going to actually show the passwords (not going to return the password)
    select: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
// Create UserSchema.pre('save'.....) middleware below
// **** THIS IS AFTER FORGOT PASSWORD LOGIC ;;; whats happening is, below middleware is running because we are saving a user, but we dont have a password and what we can do to get around this is marked with '*&*' inside the below code block
UserSchema.pre('save',async function(next){
  
  // *&*
  if(!this.isModified('password')){
    // if password is modified then that means the user initiated the forgot password logic block and therefore has to be again hashed (outside this if block below) and put on the server but the controller will get inside this if block only if the password wasnt modified, that means the user is being created for the first time and is being uploaded to the database and therefore will skip this if block alltogether and proceed on to bcrypt.genSalt(10)....to hash the users password and save it in MondoDB.
    next();
  }

  // *&*
  // BELOW CODE WILL ONLY RUN IF THE PASSWORD IS ACTUALLY MODIFIED (ie. with forgot password)


  // generate a salt to use that to actually hash the password
  // bcrypt.genSalt() <-- which takes in a number of rounds, higher the rounds the more secure but also more heavier it is on the system and 10 is recommended in the documentation
  const salt=await bcrypt.genSalt(10);
  this.password=await bcrypt.hash(this.password,salt);
  // after use bcrypt.hash(this.password,salt)...this is the result in the database, password: $2a$10$jfmwDLfQPI2hBPogmVgvGOspE1MrKDEqihz/zKLnVX/UD4jTDLp82
})

// Sign JWT and return (statics and methods...and below is a method)
UserSchema.methods.getSignedJwtToken=function(){
  // since this is a 'method' and not a 'static', that means i'm calling it on the actual user so we will have access to that users ID.
  // for the secret im going to put that in the config.env file
  return jwt.sign({id:this._id},process.env.JWT_SECRET,{
    expiresIn:process.env.JWT_EXPIRE
  });
  // now i should be able to call this method from within my auth controller
};

// Match user entered password to hashed password in database <-- and in order to do this i need to use bcrypt and there is a method called compare
UserSchema.methods.matchPassword=async function(enteredPassword){
  // enteredPassword <-- plain text password from the body
  // remember this is a method thats being called on the actual user so i have access to this user's fields meaning i have access to their hashed password 'this.password'
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
// since its being called on the user itself not on the model, so its a method instead of statics
UserSchema.methods.getResetPasswordToken=function(){
  // Generate token  ..crypto.randomBytes(Number of Bytes) <--this will give us a Buffer and we have to format it as a string
  const resetToken=crypto.randomBytes(20).toString('hex');
  
  //Hash token and set to resetPasswordToken field 
  // this is a method being called on the actual user so we can access the user's fields with 'this'
  this.resetPasswordToken=crypto.createHash('sha256').update(resetToken).digest('hex');

  // Set expire
  this.resetPasswordExpire=Date.now()+10*60*1000;

  // below resetToken is now going to be stored in 'controllers/auth.js/forgotPassword()/const resetToken' variable
  return resetToken;
};


module.exports = mongoose.model('User', UserSchema);
