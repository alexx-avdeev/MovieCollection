var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override');

router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res){
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    var method = req.body._method
    delete req.body._method
    return method
  }
}))

router.route('/')
.get(function(req, res, next) {
  mongoose.model('Movie').find({}, function (err, movies) {
    if (err) {
      return console.error(err);
    } else {
      res.format({
        html: function(){
          res.render('movies/index', {
            title: 'All my Movies',
            "movies" : movies
          });
        },
        json: function(){
          res.json(movies);
        }
      });
    }
  });
})
.post(function(req, res) {
  var title = req.body.title;
  var format = req.body.format;
  var length = req.body.length;
  var releaseYear = req.body.releaseYear;
  var rating = req.body.rating;
  
  mongoose.model('Movie').create({
    title : title,
    format : format,
    length : length,
    releaseYear : releaseYear,
    rating: rating
  }, function (err, movie) {
    if (err) {
      res.send("There was a problem adding the information to the database.");
    } else {
      console.log('POST creating new movie: ' + movie);
      res.format({
        html: function(){
          res.location("movies");
          res.redirect("/movies");
        },
        json: function(){
          res.json(movie);
        }
      });
    }
  })
});

router.get('/new', function(req, res) {
  var minRating = mongoose.model('Movie').schema.path('rating').options.min;
  minRating = minRating instanceof Array ? minRating[0] : minRating;
  var maxRating = mongoose.model('Movie').schema.path('rating').options.max;
  maxRating = maxRating instanceof Array ? maxRating[0] : maxRating;

  res.render('movies/movie', {
    title: 'Add New Movie',
    formats: mongoose.model('Movie').schema.path('format').enumValues,
    ratings: Array.from(new Array(maxRating - minRating + 1), (x,i) => i + minRating)
  });
});

router.param('id', function(req, res, next, id) {
  mongoose.model('Movie').findById(id, function (err, movie) {
    if (err) {
      console.log(id + ' was not found');
      res.status(404)
      var err = new Error('Not Found');
      err.status = 404;
      res.format({
        html: function(){
          next(err);
        },
        json: function(){
          res.json({message : err.status  + ' ' + err});
        }
      });
    } else {
      console.log(movie);
      req.id = id;
      next();
    }
  });
});

router.route('/:id')
.get(function(req, res) {
  var minRating = mongoose.model('Movie').schema.path('rating').options.min;
  minRating = minRating instanceof Array ? minRating[0] : minRating;
  var maxRating = mongoose.model('Movie').schema.path('rating').options.max;
  maxRating = maxRating instanceof Array ? maxRating[0] : maxRating;

  mongoose.model('Movie').findById(req.id, function (err, movie) {
    if (err) {
      console.log('GET Error: There was a problem retrieving: ' + err);
    } else {
      console.log('GET Retrieving ID: ' + movie._id);
      res.format({
        html: function(){
          res.render('movies/movie', {
            "movie" : movie,
            "title" : 'Edit Movie - ' + movie.title,
            "formats" : mongoose.model('Movie').schema.path('format').enumValues,
            "ratings" : Array.from(new Array(maxRating - minRating + 1), (x,i) => i + minRating)
          });
        },
        json: function(){
          res.json(movie);
        }
      });
    }
  });
})
.put(function(req, res) {
  var title = req.body.title;
  var format = req.body.format;
  var length = req.body.length;
  var releaseYear = req.body.releaseYear;
  var rating = typeof req.body.rating != "undefined" ? req.body.rating : null;

  mongoose.model('Movie').findById(req.id, function (err, movie) {
    movie.update({
      title : title,
      format : format,
      length : length,
      releaseYear : releaseYear,
      rating: rating
    }, function (err, movieID) {
      if (err) {
        res.send("There was a problem updating the information to the database: " + err);
      } else {
        res.format({
          html: function(){
            res.redirect("/movies");
          },
          json: function(){
            res.json(movie);
          }
        });
      }
    })
  });
})
.delete(function (req, res){
  mongoose.model('Movie').findById(req.id, function (err, movie) {
    if (err) {
      return console.error(err);
    } else {
      movie.remove(function (err, movie) {
        if (err) {
          return console.error(err);
        } else {
          console.log('DELETE removing ID: ' + movie._id);
          res.format({
            html: function(){
              res.redirect("/movies");
            },
            json: function(){
              res.json({message : 'deleted',
              item : movie
            });
          }
        });
      }
    });
  }
});
});

module.exports = router;
