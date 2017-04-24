var mongoose = require('mongoose');
var movieSchema = new mongoose.Schema({
  title: {
    type: String,
    minlength: [1, 'Title should have at least 1 symbol and no longer than 50 symbols'],
    maxlength: [50, 'Title should have at least 1 symbol and no longer than 50 symbols'],
    required: [true, 'Give movie a title!']
  },
  format: {
    type: String,
    enum: ['VHS', 'DVD', 'Streaming'],
    required: [true, 'Specify format please!']
  },
  length: {
    type: Number,
    min: [1, 'Movie length should be a nonzero positive number less than 500'],
    max: [499, 'Movie length should be a nonzero positive number less than 500'],
    required: [true, 'Movie should have length']
  },
  releaseYear: {
    type: Number,
    min: [1801, 'Release year should be more than 1800 or less then 2010'],
    max: [2009, 'Release year should be more than 1800 or less then 2010'],
    required: [true, 'Release year is required!']
  },
  rating: {
    type: Number,
    min: 1,
    max: [5, 'Rating can not be more than 5'],
    default: null
  }
});
mongoose.model('Movie', movieSchema);
