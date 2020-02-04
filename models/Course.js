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
  }
});
module.exports = mongoose.model('Course', CourseSchema);
