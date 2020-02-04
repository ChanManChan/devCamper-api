// below is a shorthand for putting a function inside of a function
// Below is a generic custom middleware as opposed to just dealing with bootcamps
// Inorder to use this middleware we have to go into our routes
const advancedResults=(model,populate)=>async(req,res,next)=>{
 // console.log(req.query);
 let query;
 // Copy req.query
 const reqQuery = { ...req.query };
 // Fields to exclude
 const removeFields = ['select', 'sort', 'page', 'limit'];
 // Loop over removeFields and delete them from reqQuery
 removeFields.forEach(param => delete reqQuery[param]);

 // Create query string
 let queryStr = JSON.stringify(reqQuery);
 // inserting a '$' sign before the query string to match the mongoDB Documentation
 // regex = '\b' <---word boundary character '(...any operator we want to be able to use...)'  (..'in'..) <--search a list, ..../g) <--for global search (look further than the first one it finds)
 // Create operators like ($gt, $gte, etc)
 queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
 // console.log(queryStr);

 // Finding resource
 // .populate('courses') was added later to show all the courses within each bootcamp as an array of objects
 query = model.find(JSON.parse(queryStr));

 // SELECT FIELDS
 if (req.query.select) {
   // in the URL we want to seperate the search queries using ',' and not space therefore below line of code (because mongoose format requires us to seperate the search queries using space only to work properly)
   const fields = req.query.select.split(',').join(' ');
   // format mongoose :- query.select('name occupation');  <--- we are getting this from above line
   query = query.select(fields);
   console.log(fields);
 }
 // SORT
 if (req.query.sort) {
   const sortBy = req.query.sort.split(',').join(' ');
   query = query.sort(sortBy);
 } else {
   // query.sort() is a mongoose method
   // use negative sign for reverse sorting {{URL}}/api/v1/models?select=name,description,housing&sort=-name
   query = query.sort('-createdAt');
 }
 // PAGINATION
 const page = parseInt(req.query.page, 10) || 1;
 // below default 100 per page
 const limit = parseInt(req.query.limit, 10) || 25;
 // skip a certain amount of resources, in this case the models
 // below is basically like array index starting from 0 concept
 const startIndex = (page - 1) * limit;
 const endIndex = page * limit;
 // below to count all the documents through mongoose
 const total = await model.countDocuments();

 query = query.skip(startIndex).limit(limit);
 // try {
 // const models = await model.find();
 if(populate){
  query=query.populate(populate);
 }
 // EXECUTING QUERY
 const results = await query;
 // PAGINATION RESULT
 const pagination = {};
 if (endIndex < total) {
   pagination.next = {
     page: page + 1,
     limit
   };
 }
 if (startIndex > 0) {
   pagination.prev = {
     page: page - 1,
     limit
   };
 }
// i'm going to create an object on the response object that we can use within any routes that use this middleware
res.advancedResults={
  success:true,
  count:results.length,
  pagination,
  data:results
}
next();

};
module.exports=advancedResults;