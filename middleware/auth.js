const jwt=require('jsonwebtoken');
const asyncHandler=require('./async');
const ErrorResponse=require('../utils/errorResponse');
const User=require('../models/User');

// Protext middleware ...used to protect routes
// where ever we want to use 'protect' in our routes, we need to just add it as the first parameter before the method  ; first go to 'routes/bootcamp.js'
exports.protect=asyncHandler(async (req,res,next)=>{
  let token;

  // check for the 'Authorization' header
  if(req.headers.authorization&&req.headers.authorization.startsWith('Bearer')){
    // because  'Authorization' : 'Bearer eyjhbGciOi............'  <--value is the token 
    token=req.headers.authorization.split(' ')[1];
  }
  // else if(req.cookies.token){
  //   token=req.cookies.token;
  // }

  // Make sure token exists
  if(!token){
    return next(new ErrorResponse('Not authorized to access this route',401));
  }

  try{
    // Verify token
    const decoded=jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    // { id: '5e3a5af85447f52280944f02', iat: 1580896036, exp: 1583488036 } <-- this is the decoded object and we need the id property (which is the userID from the token)

    //so whatever id is in that token which the user got by logging in with the correct credentials, thats going to be passed in here and its going to be set to this req.user 
    
    // below will always be the currently logged in user
    req.user=await User.findById(decoded.id);
    // in any route we use this middleware we have access to req.user and any of the user fields
    
    next();
  }catch(err){
    return next(new ErrorResponse('Not authorized to access this route',401));
  }
});


// Grant access to specific roles
// whats going to get passed in here (...roles) is a comma seperated value list of roles like 'publisher','admin' or something like that
exports.authorize=(...roles)=>{
  return (req,res,next)=>{
    // check to see if currently logged in user's (which we can get with req.user because we set it above) role is included in whats passed in above (...roles) 
    // 'user', 'admin' or 'publisher' <---roles are passed in through authorize(params...)
    if(!roles.includes(req.user.role)){
      // 403 <-- forbidden error
      return next(new ErrorResponse(`User role ${req.user.role} is unauthorized to access this route`,403));
    }
    next();
    // after saving these changes go into 'routes/bootcamp.js' and just like i brought in 'protect' i have to bring in 'authorize'
    // only a 'publisher' or an 'admin' can create bootcamps and manage bootcamps
  }
}