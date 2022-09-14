const express = require('express');
const favoriteRouter = express.Router();
const authenticate = require('../authenticate');
const Favorite = require('../models/favorite');
const cors = require('./cors');

favoriteRouter.route('/')
 .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
 .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
  Favorite.findOne({ user: req.user._id })
   .then(favorite => {
    if (!favorite) {
     res.statusCode = 200;
     res.setHeader('Content-Type', 'application/json');
     res.json({ 'exists': false });
    } else {
     Favorite.findById(favorite._id)
      .populate('dines')
      .then(favorite => {
       res.statusCode = 200;
       res.setHeader('Content-Type', 'application/json');
       res.json({ 'exists': true, 'dines': favorite.dines });
      })
      .catch(err => next(err));
    }
   })
   .catch(err => next(err));
 })
 .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Favorite.findOne({ user: req.user._id })
   .then(favorite => {
    if (favorite) {
     req.body.forEach(fav => {
      if (!favorite.dines.includes(fav._id)) {
       favorite.dines.push(fav._id);
      }
     });
     favorite.save()
      .then(favorite => {
       favorite.populate('dines')
        .then(favorite => {
         res.statusCode = 200;
         res.setHeader('Content-Type', 'application/json');
         res.json(favorite);
        })
        .catch(err => next(err));
      })
      .catch(err => next(err));
    } else {
     Favorite.create({ user: req.user._id })
      .then(favorite => {
       req.body.forEach(fav => {
        if (!favorite.dines.includes(fav._id)) {
         favorite.dines.push(fav._id);
        }
       });
       favorite.save()
        .then(favorite => {
         favorite.populate('dines')
          .then(favorite => {
           res.statusCode = 200;
           res.setHeader('Content-Type', 'application/json');
           res.json(favorite);
          })
          .catch(err => next(err));
        })
        .catch(err => next(err));
      })
      .catch(err => next(err));
    }
   }).catch(err => next(err));
 })
 .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /favorites');
 })
 .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Favorite.findOneAndDelete({ user: req.user._id })
   .then(favorite => {
    res.statusCode = 200;
    if (favorite) {
     res.setHeader('Content-Type', 'application/json');
     res.json(favorite);
    } else {
     res.setHeader('Content-Type', 'text/plain');
     res.end('You do not have any favorites to delete.');
    }
   })
   .catch(err => next(err));
 });

favoriteRouter.route('/:dineId')
 .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
 .get(cors.cors, authenticate.verifyUser, (req, res) => {
  res.statusCode = 403;
  res.end(`GET operation not supported on /favorites/${req.params.dineId}`);
 })
 .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Favorite.findOne({ user: req.user._id })
   .then(favorite => {
    if (favorite) {
     if (!favorite.dines.includes(req.params.dineId)) {
      favorite.dines.push({ "_id": req.params.dineId });
      favorite.save()
       .then(favorite => {
        Favorite.findById(favorite._id)
         .populate("dines")
         .then(favorite => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({ 'exists': true, 'dines': favorite.dines });
         })
         .catch(err => next(err));
       })
       .catch(err => next(err));
     } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({ 'exists': true, 'dines': favorite.dines });
     }
    } else {
     Favorite.create({ user: req.user._id, dines: [req.params.dineId] })
      .then(favorite => {
       Favorite.findById(favorite._id)
        .populate('dines')
        .then(favorite => {
         res.statusCode = 200;
         res.setHeader('Content-Type', 'application/json');
         res.json({ 'exists': true, 'dines': favorite.dines });
        })
        .catch(err => next(err));
      })
      .catch(err => next(err));
    }
   })
   .catch(err => next(err));
 })
 .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
  res.statusCode = 403;
  res.end(`PUT operation not supported on /favorites/${req.params.dineId}`);
 })
 .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Favorite.findOne({ user: req.user._id })
   .then(favorite => {
    if (favorite) {
     favorite.dines = favorite.dines.filter(fav => {
      return fav.toString() !== req.params.dineId;
     });
     if (favorite.dines.length < 1) { // array on favorites is empty
      Favorite.findByIdAndDelete(favorite._id)
       .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({ 'exists': false });
       })
       .catch(err => next(err));
     } else {
      favorite.save()
       .then(favorite => {
        Favorite.findById(favorite._id)
         .populate('dines')
         .then(favorite => {
          console.log('Favorite Dine Deleted!', favorite);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({ 'exists': true, 'dines': favorite.dines });
         }).catch(err => next(err));
       }).catch(err => next(err));
     }
    } else {
     res.statusCode = 200;
     res.setHeader('Content-Type', 'application/json');
     res.json({ 'exists': false });
    }
   }).catch(err => next(err));
 });

module.exports = favoriteRouter;