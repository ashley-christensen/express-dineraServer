const express = require('express');
const Dine = require('../models/dine');
const authenticate = require('../authenticate');

const dineRouter = express.Router();//instance of express.Router()

dineRouter.route('/')
    .get((req, res, next) => {
        Dine.find()
            .populate('comments.author') //populate author field of comments subdocument
            .then(dines => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dines);//auto closes response stream, done need end()
            })
            .catch(err => next(err));//hands off error to overall handler in expres app.js
    })
    .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dine.create(req.body)
            .then(createdDine => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(createdDine);
            })
            .catch(err => next(err));
    })
    .put(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403; //403 == Operation not supported 
        res.end('PUT operation not supported on /dines');
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dine.deleteMany()
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });


dineRouter.route('/:dineId')
    .get((req, res, next) => {
        Dine.findById(req.params.dineId)//parses id requested by user/client
            .populate('comments.author') //populate author field of comments subdocument
            .then(dine => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dine);
            })
            .catch(err => next(err));
    })
    .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403;//403 == operation not supported
        res.end(`POST operation is not supported on /dines/${req.params.dineId}`);
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        Dine.findByIdAndUpdate(req.params.dineId, {
            $set: req.body
        },
            { new: true }//returns updated document
        )
            .then(dine => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dine);//sends updated document 
            });
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dine.findByIdAndDelete(req.params.dineId)
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);//sends json data in response stream and closes response stream
            })
            .catch(err => next(err));
    });

dineRouter.route('/:dineId/comments')
    .get((req, res, next) => {
        Dine.findById(req.params.dineId)
            .populate('comments.author') //populate author field of comments subdocument
            .then(dine => {
                if (dine) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dine.comments);
                } else {
                    err = new Error(`dine ${req.params.dineId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        Dine.findById(req.params.dineId)
            .then(dine => {
                if (dine) {
                    req.body.author = req.user._id;//author field holds _id of user for populate() method
                    dine.comments.push(req.body);
                    dine.save()
                        .then(dine => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(dine);
                        })
                        .catch(err => next(err));
                } else {
                    err = new Error(`dine ${req.params.dineId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .put(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /dines/${req.params.dineId}/comments`);
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dine.findById(req.params.dineId)
            .then(dine => {
                if (dine) {
                    for (let i = (dine.comments.length - 1); i >= 0; i--) {
                        dine.comments.id(dine.comments[i]._id).remove();
                    }
                    dine.save()
                        .then(dine => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(dine);
                        })
                        .catch(err => next(err));
                } else {
                    err = new Error(`dine ${req.params.dineId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    });

dineRouter.route('/:dineId/comments/:commentId')
    .get((req, res, next) => {
        Dine.findById(req.params.dineId)
            .populate('comments.author') //populate author field of comments subdocument
            .then(dine => {
                if (dine && dine.comments.id(req.params.commentId)) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dine.comments.id(req.params.commentId));
                } else if (!dine) {
                    err = new Error(`dine ${req.params.dineId} not found`);
                    err.status = 404;
                    return next(err);
                } else {
                    err = new Error(`Comment ${req.params.commentId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .post(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /dines/${req.params.dineId}/comments/${req.params.commentId}`);
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        Dine.findById(req.params.dineId)
            .then(dine => {
                if (dine && dine.comments.id(req.params.commentId)) {
                    if ((dine.comments.id(req.params.commentId).author._id).equals(req.user._id)) {
                        if (req.body.rating) {
                            dine.comments.id(req.params.commentId).rating = req.body.rating;
                        }
                        if (req.body.text) {
                            dine.comments.id(req.params.commentId).text = req.body.text;
                        }
                        dine.save()
                            .then(dine => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(dine);
                            })
                            .catch(err => next(err));

                    } else {
                        res.statusCode = 403;
                        res.end('You cannot change a comment that is not yours!');
                    }
                } else if (!dine) {
                    err = new Error(`Dine experience${req.params.dineId} not found`);
                    err.status = 404;
                    return next(err);
                } else {
                    err = new Error(`Comment ${req.params.commentId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Dine.findById(req.params.dineId)
            .then(dine => {
                if (dine && dine.comments.id(req.params.commentId)) {
                    if ((dine.comments.id(req.params.commentId).author._id).equals(req.user._id)) {
                        dine.comments.id(req.params.commentId).remove();
                        dine.save()
                            .then(dine => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(dine);
                            })
                            .catch(err => next(err));
                    } else {
                        res.statusCode = 403;
                        res.end(`You cannot change a comment that isn't yours!`);
                    }
                } else if (!dine) {
                    err = new Error(`dine ${req.params.dineId} not found`);
                    err.status = 404;
                    return next(err);
                } else {
                    err = new Error(`Comment ${req.params.commentId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    });

module.exports = dineRouter;