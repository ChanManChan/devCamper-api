const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a course title']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  weeks: {
    type: String,
    required: [true, 'Please add number of weeks']
  },
  tuition: {
    type: Number,
    required: [true, 'Please add tuition cost']
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please add a minimum skill'],
    // we add an 'enum' here because i want it to only be able have one of three values
    enum: ['beginner', 'intermediate', 'advanced']
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // with courses, we are going to have a relationship to a bootcamp
  bootcamp: {
    // when we create a new document, it creates an object ID (in mongoose)
    type: mongoose.Schema.ObjectId,
    // it needs to know which model to reference therefore add the 'ref' property
    ref: 'Bootcamp',
    // required is true because every course needs to have a bootcamp
    required: true
  },
  // below is the relationship with the User model, after adding below object go to the courses controller and go to addcourse and add the functionality!
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
});

// Theory of mongoose 'static' & 'methods'
// 'static' is where you call it on the actual model eg below
// if we were in a controller method and 'Course' is the model we brought into our controller then
// if we had a static method called 'goFish()', we would call right on the model like this...Course.goFish();
// whereas a 'method' we would basically create a query like below
//const courses = Courses.find();  ....  and then we would call the method on courses like ...courses.goFish();

// Therefore conclusion :- when we define a 'static' its going to be directly on the model and a 'method' is on whatever we create from the model

// Static method to get avg of course tuitions
CourseSchema.statics.getAverageCost = async function(bootcampId) {
  // console.log('Calculating average cost...'.blue);
  // this is where we need to our aggregation...we are going to call a methods called 'aggregate' which returns a promise so we have to use 'await'
  const obj = await this.aggregate([
    // this is called a 'PIPELINE' and we have different steps to the pipeline
    {
      // LHS bootcamp is from above and has to be matched with whatever the bootcamp that is passed in
      $match: { bootcamp: bootcampId }
    },
    // after match, the next step is group, which is basically the object that we want to create, the calculated object which is going to include the following
    {
      $group: {
        _id: '$bootcamp',
        // below we need '$' and the field that we want to average which in my case is 'tuition'
        averageCost: { $avg: '$tuition' }
      }
    }
  ]);
  // after above 'obj' is done we should get an object that has the ID of the bootcamp and the average cost of the tuition
  // console.log(obj);
  // we have to run this, since this is a static method we need to run it on the actual model and since we are in the model we can do 'this.constructor.getAverageCost()....inside the middlewares below!'

  // Put the 'obj' ie. the average cost into the database below
  try {
    // we can use the bootcamp model by using below technique
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      // obj is an array with one element object
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10
    });
  } catch (err) {
    console.error(err);
  }
};

// MIDDLEWARES BELOW

// we are basically going to have a few pieces of middleware that are going to run a static function thats going to use aggregation to be able to calculate the average cost (for each bootcamp)
// Call getAverageCost after save
CourseSchema.post('save', function() {
  // on save, we actually save the above bootcamp:{...} field which is the ID of the bootcamp so we just want to pass that in
  this.constructor.getAverageCost(this.bootcamp);
});
// Call getAverageCost before remove
// because if we add a course or remove a course we want to re-calculate that average cost
CourseSchema.pre('remove', function() {
  this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model('Course', CourseSchema);
