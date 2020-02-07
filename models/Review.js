const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a title for the review'],
    maxlength: 100
  },
  text: {
    type: String,
    required: [true, 'Please add a some text']
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Please add a rating between 1 and 10']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: {
    // when we create a new document, it creates an object ID (in mongoose)
    type: mongoose.Schema.ObjectId,
    // it needs to know which model to reference therefore add the 'ref' property
    ref: 'Bootcamp',
    // required is true because every review needs to have a bootcamp
    required: true
  },
  // below is the relationship with the User model
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
});
// Prevent user from submitting more than one review per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

// Static method to get avg rating and save
ReviewSchema.statics.getAverageRating = async function(bootcampId) {
  // this is where we need to do our aggregation...we are going to call a methods called 'aggregate' which returns a promise so we have to use 'await'
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
        // below we need '$' and the field that we want to average which in this case is 'rating'
        // for the review model we want to look at the 'rating' and thats what we are actually averaging (calling the average operator '$avg')
        // 'averageRating' is where we are putting this into and from the review model we want to look at the 'rating' and thats what we are actually averaging
        averageRating: { $avg: '$rating' }
      }
    }
  ]);
  // after above 'obj' is done we should get an object that has the ID of the bootcamp and the average rating of the bootcamp

  // we have to run this, since this is a static method we need to run it on the actual model and since we are in the model we can do 'this.constructor.getAverageCost()....inside the middlewares below!'

  // Put the 'obj' ie. the average rating into the database below
  try {
    // we can use the bootcamp model by using below technique
    // the 'averageRating' is going to go to the Bootcamp model
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      // obj is an array with one element object
      averageRating: obj[0].averageRating
    });
  } catch (err) {
    console.error(err);
  }
};

// MIDDLEWARES BELOW

// we are basically going to have a few pieces of middleware that are going to run a static function thats going to use aggregation to be able to calculate the average rating (for each bootcamp)

// Call getAverageRating after save
ReviewSchema.post('save', function() {
  // on save, we actually save the above bootcamp:{...} field which is the ID of the bootcamp so we just want to pass that in
  this.constructor.getAverageRating(this.bootcamp);
});

// Call getAverageRating before remove
// because if we add a course or remove a course we want to re-calculate that average cost
ReviewSchema.pre('remove', function() {
  this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model('Review', ReviewSchema);
