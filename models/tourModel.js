const mongoose = require('mongoose');
const slugify = require('slugify');               //slug is a string where we can put in url based on another string /field name
// const validator = require('validator');

const tourSchema = new mongoose.Schema(          //to specify schema for our data/describe data
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],  //validator
      unique: true,
      trim: true,
      //sanitization of data or string input by users
      maxlength: [40, 'A tour name must have less or equal then 40 characters'], //validator
      minlength: [10, 'A tour name must have more or equal then 10 characters']  //validator
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {                                                    //enum validatorfor string
        values: ['easy', 'medium', 'difficult'],                 // we can pass array of values/strings that r allowed
        message: 'Difficulty is either: easy, medium, difficult' //error message
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'], //validators
      max: [5, 'Rating must be below 5.0']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {                                                          //custom/usd validators
        validator: function(val) {                                        //call backfunc has access to "val"input by user
          // this  only points to current doc on NEW document creation
          return val < this.price;             
        },
        message: 'Discount price ({VALUE}) should be below regular price' //when price discount> price
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: { //name of image
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String], //saving multiple images as array of strings
    createdAt: { //timestamp set at the time user adds the new tour
      type: Date,
      default: Date.now(), //gives us timestamp in millisec
      select: false
    },
    startDates: [Date], // diffrent dates for same tour ,start date ,end date
    secretTour: {       //tours offered to VIPs
      type: Boolean,
      default: false
    }
  },
  {
    toJSON: { virtuals: true },                     //each time data is outputted as json we want o/p to be true
    toObject: { virtuals: true }                     //virtuals to be art of objs
  }
);
                                                        //BUSINESS LOGIC
tourSchema.virtual('durationWeeks').get(function() {    //defining a virtual property that contains tour duration in weeks
  return this.duration / 7;                             //=> (),arrow func not used as we require this keyword(THIS KEYWORD POINTS TO CURR DOCUMENT)
});                                                  

//MONGOOSE MIDDLEWARE/HOOKS

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function(next) {                  //"save" hook  ,and we hav access to next
  this.slug = slugify(this.name, { lower: true });      //creating slug out of name schema, convert to lowercase
  next();
});

// tourSchema.pre('save', function(next) {
//   console.log('Will save document...');
//   next();
// });

// tourSchema.post('save', function(doc, next) {         //executed after .pre middleware
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE                             //allows to run funcs before/after queries executed
// tourSchema.pre('find', function(next) {
tourSchema.pre(/^find/, function(next) {        //    '/^find/' hook ,all strings that start with find->findOne,findMany....
  this.find({ secretTour: { $ne: true } });     //select all docs where secretTour is not true

  this.start = Date.now();                      
  next();
});

tourSchema.post(/^find/, function(docs, next) {         //we hav access to all "docs" returned from query
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);   //time taken to exe query
  next();
});

// AGGREGATION MIDDLEWARE   
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); //filtering out secret tours

  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);            //creating model called "Tour"

module.exports = Tour;

























