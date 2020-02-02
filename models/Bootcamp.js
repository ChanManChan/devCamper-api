const mongoose = require('mongoose');
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
  }
  // {
  //   toJSON: { virtuals: true },
  //   toObject: { virtuals: true }
  // }
);
module.exports = mongoose.model('Bootcamp', BootcampSchema);
