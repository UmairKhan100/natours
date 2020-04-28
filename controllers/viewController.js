const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'rating review user',
  });

  if (!tour) {
    return next(new AppError('Tour with this name does not found!', 404));
  }

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: `Log Into Your Account`,
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: `My Account`,
  });
};

exports.getMyBookings = catchAsync(async (req, res) => {
  // Get All Bookings of the user
  const bookings = await Booking.find({ user: req.user.id });

  // Find Tours
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Bookings',
    tours,
  });
});
