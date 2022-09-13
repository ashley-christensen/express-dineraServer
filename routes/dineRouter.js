const express = require('express');
const Dine = require('../models/dine');
const authenticate = require('../authenticate');
const cors = require('./cors');

const dineRouter = express.Router();//instance of express.Router()

dineRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))//handle preflight request with options HTTP method
    .get(cors.cors, (req, res, next) => {
        Dine.find()
            .populate('comments.author')//populate authors field of comments subdocument
            .then(dines => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dines);//auto closes response stream, done need end()
            })
            .catch(err => next(err));//hands off error to overall handler in expres app.js
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dine.create(req.body)
            .then(createddine => {
                console.log('dine Created', createddine);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(createddine);
            })
            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403; //403 == Operation not supported 
        res.end('PUT operation not supported on /dines');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dine.deleteMany()
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });


dineRouter.route('/:dineId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        Dine.findById(req.params.dineId)//parses id requested by user/client
            .populate('comments.author')//populate authors field of comments subdocument
            .then(dine => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dine);
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403;//403 == operation not supported
        res.end(`POST operation is not supported on /dines/${req.params.dineId}`);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dine.findByIdAndDelete(req.params.dineId)
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);//sends json data in response stream and closes response stream
            })
            .catch(err => next(err));
    });

dineRouter.route('/:dineId/comments')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        Dine.findById(req.params.dineId)
            .populate('comments.author')//populate authors field of comments subdocument
            .then(dine => {
                if (dine) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dine.comments);
                } else {
                    err = new Error(`Dine ${req.params.dineId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Dine.findById(req.params.dineId)
            .then(dine => {
                if (dine) {
                    req.body.author = req.user._id;// id of user in author field for populate() method
                    dine.comments.push(req.body);
                    dine.save()
                        .then(dine => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(dine);
                        })
                        .catch(err => next(err));
                } else {
                    err = new Error(`Dine ${req.params.dineId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /dines/${req.params.dineId}/comments`);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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
                    err = new Error(`Dine ${req.params.dineId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    });

dineRouter.route('/:dineId/comments/:commentId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        Dine.findById(req.params.dineId)
            .populate('comments.author')//populate authors field of comments subdocument
            .then(dine => {
                if (dine && dine.comments.id(req.params.commentId)) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dine.comments.id(req.params.commentId));
                } else if (!dine) {
                    err = new Error(`Dine ${req.params.dineId} not found`);
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
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /dines/${req.params.dineId}/comments/${req.params.commentId}`);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Dine.findById(req.params.dineId)
            .then(dine => {
                if (dine && dine.comments.id(req.params.commentId)) {
                    if (dine.comments.id(req.params.commentId).author._id.equals(req.user._id)) {
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
                        const err = new Error('You are not the author!');
                        err.status = 403;
                        return next(err);
                    }
                } else if (!dine) {
                    err = new Error(`Dine ${req.params.dineId} not found`);
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
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Dine.findById(req.params.dineId)
            .then(dine => {
                if (dine && dine.comments.id(req.params.commentId)) {
                    if (dine.comments.id(req.params.commentId).author._id.equals(req.user._id)) {
                        dine.comments.id(req.params.commentId).remove();
                        dine.save()
                            .then(dine => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(dine);
                            })
                            .catch(err => next(err));
                    } else {
                        const err = new Error(`You are not the author!`);
                        err.status = 403;
                        return next(err);
                    }
                } else if (!dine) {
                    err = new Error(`Dine ${req.params.dineId} not found`);
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