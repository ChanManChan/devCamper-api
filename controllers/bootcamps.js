const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const path = require('path');
// In here we are going to create different methods that are going to be associated with certain routes and we need to export each method so that we can bring it in to the routes file

//Basically these are middleware functions

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps    <---associated with this controller method
// @access  Public                   <---do you need to be logged in to hit this route (send a token)(public === you dont need a token)
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  // console.log(req.query);
  // let query;
  // Copy req.query
  // const reqQuery = { ...req.query };
  // Fields to exclude
  // const removeFields = ['select', 'sort', 'page', 'limit'];
  // Loop over removeFields and delete them from reqQuery
  // removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  // let queryStr = JSON.stringify(reqQuery);
  // inserting a '$' sign before the query string to match the mongoDB Documentation
  // regex = '\b' <---word boundary character '(...any operator we want to be able to use...)'  (..'in'..) <--search a list, ..../g) <--for global search (look further than the first one it finds)
  // Create operators like ($gt, $gte, etc)
  // queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  // console.log(queryStr);

  // Finding resource
  // .populate('courses') was added later to show all the courses within each bootcamp as an array of objects
  // query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');

  // SELECT FIELDS
  // if (req.query.select) {
  // in the URL we want to seperate the search queries using ',' and not space therefore below line of code (because mongoose format requires us to seperate the search queries using space only to work properly)
  // const fields = req.query.select.split(',').join(' ');
  // format mongoose :- query.select('name occupation');  <--- we are getting this from above line
  // query = query.select(fields);
  // console.log(fields);
  // }
  // SORT
  // if (req.query.sort) {
  //   const sortBy = req.query.sort.split(',').join(' ');
  //   query = query.sort(sortBy);
  // } else {
  // query.sort() is a mongoose method
  // use negative sign for reverse sorting {{URL}}/api/v1/bootcamps?select=name,description,housing&sort=-name
  //   query = query.sort('-createdAt');
  // }
  // PAGINATION
  // const page = parseInt(req.query.page, 10) || 1;
  // below default 100 per page
  // const limit = parseInt(req.query.limit, 10) || 25;
  // skip a certain amount of resources, in this case the bootcamps
  // below is basically like array index starting from 0 concept
  // const startIndex = (page - 1) * limit;
  // const endIndex = page * limit;
  // below to count all the documents through mongoose
  // const total = await Bootcamp.countDocuments();

  // query = query.skip(startIndex).limit(limit);
  // try {
  // const bootcamps = await Bootcamp.find();
  // EXECUTING QUERY
  // const bootcamps = await query;
  // PAGINATION RESULT
  // const pagination = {};
  // if (endIndex < total) {
  //   pagination.next = {
  //     page: page + 1,
  //     limit
  //   };
  // }
  // if (startIndex > 0) {
  //   pagination.prev = {
  //     page: page - 1,
  //     limit
  //   };
  // }

  // BELOW res.status(200).json({...}) BEFORE APPLYING advancedResults.js middleware
  // res.status(200).json({
  //   success: true,
  //   count: bootcamps.length,
  //   pagination,
  //   data: bootcamps
  // });

  // BELOW AFTER APPLYING advancedResults.js middleware
  // and we have access to that because this method is using this middleware
  res.status(200).json(res.advancedResults);
  // } catch (err) {
  //    res.status(400).json({ success: false });
  //   next(err);
  // }
  // res
  //   .status(200)
  //   .json({ success: true, msg: 'Show all bootcamps' /*hello: req.hello*/ });
});

// @desc    Get single bootcamp
// @route   GET /api/v1/bootcamps/:id  <---associated with this controller method
// @access  Public                     <---do you need to be logged in to hit this route (send a token)(public === you dont need a token)
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  // try {
  const bootcamp = await Bootcamp.findById(req.params.id);
  // if client requests a correctly formatted id thats not in the database do below
  if (!bootcamp) {
    // since we have within the try block two responses ie. 'res.status' and even though this is an if statement, this is going to give us an error that says the headers are already sent....therefore when we have something like this make sure we return the first one
    // return res.status(400).json({ success: false });
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: bootcamp });
  // } catch (err) {
  // res.status(400).json({ success: false });
  // use the ErrorResponse class that i created below
  // below is the format that i want to use when i explicitly set the error
  // next(
  //   new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
  // );
  // next(err);
  // }
  // res
  //   .status(200)
  //   .json({ success: true, msg: `Show single bootcamp ${req.params.id}` });
});

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps  <---associated with this controller method
// @access  Private                 <---do you need to be logged in to hit this route (send a token)(private === you need a token)
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // in order to use req.body we have to add a piece of middleware thats included with express
  // console.log(req.body);
  // res.status(200).json({ success: true, msg: 'Create new bootcamp' });
  // try {

  // Add user to req.body (req.user is the logged in user)
  req.body.user = req.user.id;
  // so now when we go ahead and create Bootcamp.create(req.body) we will now have the user on it

  // Check for published bootcamp <--this will find all bootcamps created by the logged in user
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  // if the user is not an admin, they can only add one bootcamp
  if (publishedBootcamp && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `The user with ID ${req.user.id} has already published a bootcamp`,
        400
      )
    );
  }
  // when we import with the seeder it goes through the model and we have an enum in the model where it can only be a user or a publisher, for it to be an admin i actually have to change that in the database itself...thats why i dont have admin role in the _data/users.json file.It wont let us do that! it still adheres to all the rules in the model.
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({
    success: true,
    data: bootcamp
  });
  // } catch (err) {
  // res.status(400).json({
  //   success: false
  // });
  // next(err);
  // }
});

// @desc    Update bootcamp
// @route   PUT /api/v1/bootcamps/:id  <---associated with this controller method
// @access  Private                    <---do you need to be logged in to hit this route (send a token)(private === you need a token)
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  // try {
  // const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    // new:true because when we get our response, we want the data to be the updated data ie the new data
  //   new: true,
  //   runValidators: true
  // });


  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is bootcamp owner, bootcamp.user <--this is an objectID & req.user.id <-- is a string ;;; and an admin should be able to update a bootcamp regardless
  if (bootcamp.user.toString() !== req.user.id && req.user.role!=='admin') {
    return next(
      new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`, 401)
    );
  }

  bootcamp=await Bootcamp.findByIdAndUpdate(req.params.id,req.body,{
    new:true,
    runValidators:true
  });

  res.status(200).json({ success: true, data: bootcamp });
  // } catch (err) {
  // res.status(400).json({ success: false });
  // next(err);
  // }
  // res
  //   .status(200)
  //   .json({ success: true, msg: `Update bootcamp ${req.params.id}` });
});

// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id  <---associated with this controller method
// @access  Private                       <---do you need to be logged in to hit this route (send a token)(private === you need a token)
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  // try {
  // const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

   // Make sure user is bootcamp owner, bootcamp.user <--this is an objectID & req.user.id <-- is a string ;;; and an admin should be able to update a bootcamp regardless
   if (bootcamp.user.toString() !== req.user.id && req.user.role!=='admin') {
    return next(
      new ErrorResponse(`User ${req.params.id} is not authorized to delete this bootcamp`, 401)
    );
  }


  // this .remove() method will trigger the '.pre()' middleware in models/Bootcamp.js end
  bootcamp.remove();
  res.status(200).json({ success: true, data: {} });
  // } catch (err) {
  // res.status(400).json({ success: false });
  // next(err);
  // }
  // res
  //   .status(200)
  //   .json({ success: true, msg: `Delete bootcamp ${req.params.id}` });
});

// @desc   Get bootcamps within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance/:unit  <---associated with this controller method
// @access  Private                                                <---do you need to be logged in to hit this route (send a token)(private === you need a token)
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;
  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;
  // Calc radius using radians
  // Divide dist by radius of Earth
  // Earth Radius=3963 mi/ 6378 km
  const radius = distance / 3963;
  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  });
});

// @desc    Upload photo for bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo  <---associated with this controller method
// @access  Private                          <---do you need to be logged in to hit this route (send a token)(private === you need a token)
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  // try {
  // const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

 // Make sure user is bootcamp owner, bootcamp.user <--this is an objectID & req.user.id <-- is a string ;;; and an admin should be able to update a bootcamp regardless
 if (bootcamp.user.toString() !== req.user.id && req.user.role!=='admin') {
  return next(
    new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`, 401)
  );
}


  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }
  // below console.log(req.files.file) is the metadata about the image we need
  // console.log(req.files.file);
  const file = req.files.file;
  // Make sure the image is a photo
  // when we have a 'jpeg', 'png' or a 'gif' ...its always going to be mimetype:'image/jpeg..png..gif'
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }
  // if we are using like 'NginX' or something we probabily do have a limit for file size within the server but are going to set the limit within our application....now add max image size and upload path in 'config/config.env' file

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }
  // Create custom filename
  // path.parse(file.name).ext  <-- is for getting the original files extension like for example :- '.jpg'

  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  /*{
    file: {
      name: 'bootcamp.jpg',
      data: <Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 01 00 48 00 48 00 00 ff e2 0c 58 49 43 43 5f 50 52 4f 46 49 4c 45 00 01 01 00 00 0c 48 4c 69 6e 6f 02 10 00 00 ... 59548 more bytes>,
      size: 59598,
      encoding: '7bit',
      tempFilePath: '',
      truncated: false,
      mimetype: 'image/jpeg',
      md5: '1f0b08ad27a4d8415c3df1cef25f3ddc',
      mv: [Function: mv]
    }
  }*/
  // Below uploading the file and 'file.mv()' is a function attached to the object, like shown above.
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
    res.status(200).json({ success: true, data: file.name });
  });
});
