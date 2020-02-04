const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');
const BootcampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      unique: true,
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },
    // eg for slug:- Bootcamp name = Devcentral Bootcamp then the slug would be 'devcentral-bootcamp' because we could have that in the url
    slug: String,
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [500, 'Description cannot be more than 50 characters']
    },
    website: {
      type: String,
      // here we are doing some custom validation using regular expression (using match)
      match: [
        // regular expression for http or https website
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Please use a valid URL with HTTP or HTTPS'
      ]
    },
    phone: {
      type: String,
      maxlength: [20, 'Phone number can not be longer than 20 characters']
    },
    email: {
      type: String,
      match: [
        // we have another regular expression to match for the email
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    // this is the address thats sent to my server from from the client (i'm going to take the address and i'm going to use the Geocoder to pull parts of it out and also get the Latitude and Longitude and the reason for that is because we want to have a location field and its type is going to be GeoJSON Point)
    address: {
      type: String,
      required: [true, 'Please add an address']
    },
    location: {
      // GeoJSON Point
      // GeoJSON is a format for storing geographic points and polygons
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: {
        type: [Number],
        index: '2dsphere'
      },
      // below, we are going to get from mapquest API the geocoder
      // we are going to separate it out
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String
    },
    careers: {
      // Array of strings
      type: [String],
      required: true,
      // enum means those are the only available values that it can have
      // if we want to be able to add more careers just add them below or it would be rejected
      enum: [
        'Web Development',
        'Mobile Development',
        'UI/UX',
        'Data Science',
        'Business',
        'Other'
      ]
    },
    // below is not going to be inserted with the request, its going to be generated
    averageRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [10, 'Rating must can not be more than 10']
    },
    averageCost: Number,
    photo: {
      // its just going to be the file name, in the database its just going to be the name of the file
      type: String,
      default: 'no-photo.jpg'
    },
    housing: {
      type: Boolean,
      default: false
    },
    jobAssistance: {
      type: Boolean,
      default: false
    },
    jobGuarantee: {
      type: Boolean,
      default: false
    },
    acceptGi: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
    // later on we are going to have a user field because we need a user associated with a bootcamp so we know who added which bootcamp
    // user: {
    //   type: mongoose.Schema.ObjectId,
    //   ref: 'User',
    //   required: true
    // }
  },
  // Virtuals are document properties that you can get and set but that do not get persisted to MongoDB, we are do below code to show courses for each bootcamp within its fetched JSON object
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
// Create bootcamp slug from the name
// use standard functions instead of arrow functions due to scope because arrow functions handle scope differently (ie. the 'this' keyword differently)
BootcampSchema.pre('save', function(next) {
  // console.log('Slugify ran', this.name);
  // LHS ie. the 'this.slug' is the slug in this model above
  this.slug = slugify(this.name, { lower: true });
  next();
});
// Geocode and create location field (create a middleware below)
BootcampSchema.pre('save', async function(next) {
  // we can access any of the fields above with the 'this' keyword
  const loc = await geocoder.geocode(this.address);
  this.location = {
    // the client is sending an address and we are taking that address, disecting it, geocoding it, putting it in the location field and we have the formattedAddress so dont really need that address saved in our database. Therefore stop that from happening below
    // we have an enum value of just Point for location
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode
  };
  // Do not save address in DB
  this.address = undefined;
  next();
});

// Cascade delete courses when a bootcamp is deleted
// .pre() middleware and in controllers/bootcamps.js within deleteBootcamp method we did findByIdAndDelete() which will not trigger this middleware. Fix:- just call findById(...) which will get the bootcamp and then take the bootcamp
//and call bootcamp.remove() and this is going to trigger this '.pre(...)' middleware
BootcampSchema.pre('remove', async function(next) {
  // once we remove a bootcamp, we can access the fields with 'this.' and then whatever field
  // and reason we can access the fields with 'this.' even though we are removing is because we are doing '.pre(....)'
  console.log(`Courses being removed from bootcamp ${this._id}`);
  await this.model('Course').deleteMany({ bootcamp: this._id });
  next();
});

// Reverse populate with virtuals
// .virtual() takes in two things, first, the field that we want to add as a virtual which is going to be 'courses' and some options
BootcampSchema.virtual('courses', {
  // reference to the model we are going to be using
  ref: 'Course',
  localField: '_id',
  // foreignField is going to be the field in the Course model that we want to pertain to which is 'bootcamp:'
  foreignField: 'bootcamp',
  justOne: false
});
module.exports = mongoose.model('Bootcamp', BootcampSchema);
