const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');

// Schema
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name!'],
      unique: true,
      trim: true,
      minlength: [10, 'name must have 10 or more characters!'],
      maxlength: [40, 'name must have 40 or less characters!'],
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration!'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size!'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty!'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'difficulty must be easy, medium or difficult!',
      },
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price!'],
    },
    ratingsAverage: {
      type: Number,
      default: 5,
      min: [1, 'Rating must be in between 1 and 5!'],
      max: [5, 'Rating must be in between 1 and 5!'],
      set: (val) => Math.round(val * 10) / 10,
    },
    slug: String,
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price; /*true when priceDiscount < price*/
        },
        message: 'Discount must be less than the price!',
      },
    },
    summary: {
      type: String,
      required: [true, 'A tour must have a summary!'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image!'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// FAT MODEL / THIN CONTROLLER
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Virtual Populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// DOCUMENT MIDDLEWARE: runs for .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Embedding
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// QUERY MIDDLEWARE: runs for .find()
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.pre(/^find/, function (next) {
  // this.populate('guides');
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

// AGGREGATION MIDDLEWARE: runs for .aggregate()
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

// Model
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
